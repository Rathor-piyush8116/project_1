import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import PageHeader from './components/PageHeader';
import ChatArea from './components/ChatArea';
import ParametersSidebar from './components/ParametersSidebar';
import ViewCodeModal from './components/ViewCodeModal';
import FunctionModal from './components/FunctionModal';
import ApiKeyModal from './components/ApiKeyModal';
import Toast from './components/Toast';
import {
  DEFAULT_MODELS,
  DEFAULT_PARAMETERS,
  STORAGE_KEYS,
} from './utils/constants';

function generateId() {
  return 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
}

export default function App() {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState('chat');

  // Models
  const [models, setModels] = useState(DEFAULT_MODELS);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-oss-120b');

  // Backend / Auth status
  const [hasServerKey, setHasServerKey] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_API_KEY) || '';
  });

  // Conversation state
  const [systemPrompt, setSystemPrompt] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SYSTEM_PROMPT) || '';
  });

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved messages:', e);
    }
    return [{ id: generateId(), role: 'user', content: '' }];
  });

  // Parameters
  const [parameters, setParameters] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PARAMETERS);
      if (saved) {
        return { ...DEFAULT_PARAMETERS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse saved parameters:', e);
    }
    return DEFAULT_PARAMETERS;
  });

  // Generating / Streaming state
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const abortControllerRef = useRef(null);

  // UI Modals & Drawers
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isViewCodeOpen, setIsViewCodeOpen] = useState(false);
  const [isFunctionModalOpen, setIsFunctionModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast helper
  const addToast = (message, type = 'error', title = '') => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_PROMPT, systemPrompt);
  }, [systemPrompt]);

  useEffect(() => {
    // Only persist completed messages without circular fields
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARAMETERS, JSON.stringify(parameters));
  }, [parameters]);

  useEffect(() => {
    if (customApiKey) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_API_KEY, customApiKey);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_API_KEY);
    }
  }, [customApiKey]);

  // Check backend health and fetch models on mount
  useEffect(() => {
    async function checkBackend() {
      try {
        const headers = {};
        if (customApiKey) headers['x-groq-api-key'] = customApiKey;

        const healthRes = await fetch('/api/health');
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setHasServerKey(healthData.hasKey);
        }

        const modelsRes = await fetch('/api/models', { headers });
        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          if (modelsData.data && modelsData.data.length > 0) {
            setModels(modelsData.data);
          }
        }
      } catch (err) {
        console.warn('Backend server not reachable on port 5001:', err.message);
      }
    }
    checkBackend();
  }, [customApiKey]);

  // Turn management
  const handleUpdateMessage = (index, newContent) => {
    setMessages((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], content: newContent };
      }
      return updated;
    });
  };

  const handleDeleteMessage = (index) => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [{ id: generateId(), role: 'user', content: '' }];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAddTurn = (role = 'user') => {
    setMessages((prev) => [
      ...prev,
      { id: generateId(), role, content: '', metrics: null },
    ]);
  };

  const handleClearChat = () => {
    if (isGenerating) {
      handleStop();
    }
    setMessages([{ id: generateId(), role: 'user', content: '' }]);
    addToast('Conversation reset', 'info');
  };

  const handleAddFunction = (fn) => {
    setParameters((prev) => ({
      ...prev,
      customFunctions: [...(prev.customFunctions || []), fn],
    }));
    addToast(`Function '${fn.name}' added`, 'success');
  };

  // Stop Generation / Abort Controller
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setStreamingMessageId(null);
  };

  // Submit & Stream Response
  const handleSubmit = async () => {
    if (isGenerating) return;

    // Filter non-empty messages to prepare request
    const validMessages = [];
    if (systemPrompt && systemPrompt.trim()) {
      validMessages.push({ role: 'system', content: systemPrompt.trim() });
    }

    // Ensure all preceding turns are included
    messages.forEach((m) => {
      if (m.content && m.content.trim()) {
        validMessages.push({ role: m.role, content: m.content.trim() });
      }
    });

    if (validMessages.length === 0 || !validMessages.some((m) => m.role === 'user')) {
      addToast('Please enter a user message before submitting.', 'error');
      return;
    }

    // Check if last turn is an assistant card with content; if so, create assistant placeholder
    const assistantMsgId = generateId();
    const assistantMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      metrics: null,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsGenerating(true);
    setStreamingMessageId(assistantMsgId);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const startTime = performance.now();

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      if (customApiKey) {
        headers['x-groq-api-key'] = customApiKey;
      }

      const bodyPayload = {
        model: selectedModel,
        messages: validMessages,
        temperature: parameters.temperature,
        max_completion_tokens: parameters.max_completion_tokens,
        reasoning_effort: parameters.reasoning_effort,
        stream: parameters.stream,
        json_mode: parameters.json_mode,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg =
          errorData.error || `HTTP error ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      // Non-streaming handling
      if (!parameters.stream) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const reasoning = data.choices?.[0]?.message?.reasoning || null;
        const endTime = performance.now();
        const durationSeconds = (endTime - startTime) / 1000;
        const completionTokens =
          data.usage?.completion_tokens || Math.round(content.split(/\s+/).length * 1.3);
        const tokensPerSecond =
          durationSeconds > 0 ? completionTokens / durationSeconds : 0;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content,
                  reasoning,
                  metrics: {
                    completionTokens,
                    durationSeconds,
                    tokensPerSecond,
                  },
                }
              : msg
          )
        );

        // Append next empty user turn
        setMessages((prev) => [
          ...prev,
          { id: generateId(), role: 'user', content: '' },
        ]);

        setIsGenerating(false);
        setStreamingMessageId(null);
        return;
      }

      // Streaming handling (SSE)
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedContent = '';
      let accumulatedReasoning = '';
      let groqUsage = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const dataString = trimmed.replace(/^data:\s*/, '');
          if (dataString === '[DONE]') continue;

          try {
            const parsed = JSON.parse(dataString);
            const delta = parsed.choices?.[0]?.delta?.content;
            const deltaReasoning = parsed.choices?.[0]?.delta?.reasoning;

            let updated = false;

            if (deltaReasoning) {
              accumulatedReasoning += deltaReasoning;
              updated = true;
            }

            if (delta) {
              accumulatedContent += delta;
              updated = true;
            }

            if (updated) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? {
                        ...msg,
                        content: accumulatedContent,
                        reasoning: accumulatedReasoning || undefined,
                      }
                    : msg
                )
              );
            }

            if (parsed.usage) {
              groqUsage = parsed.usage;
            }
          } catch (jsonErr) {
            // Partial chunk, ignore
          }
        }
      }

      // Final metrics calculation
      const endTime = performance.now();
      const durationSeconds = Math.max(0.01, (endTime - startTime) / 1000);
      const completionTokens =
        groqUsage?.completion_tokens ||
        Math.max(1, Math.round(accumulatedContent.split(/\s+/).length * 1.3));
      const tokensPerSecond = completionTokens / durationSeconds;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content: accumulatedContent,
                metrics: {
                  completionTokens,
                  durationSeconds,
                  tokensPerSecond,
                },
              }
            : msg
        )
      );

      // Add a fresh user input card for next turn
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: 'user', content: '' },
      ]);
    } catch (err) {
      if (err.name === 'AbortError') {
        addToast('Generation stopped by user.', 'info');
      } else {
        console.error('Chat error:', err);
        addToast(err.message || 'Failed to complete chat request.', 'error', 'Request Failed');

        // Remove empty assistant placeholder if no content was received
        setMessages((prev) =>
          prev.filter((msg) => !(msg.id === assistantMsgId && !msg.content))
        );
      }
    } finally {
      setIsGenerating(false);
      setStreamingMessageId(null);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-groq-bg text-gray-200 overflow-hidden">
      {/* 1. Top Navbar */}
      <Navbar
        hasServerKey={hasServerKey}
        customApiKey={customApiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* 2. Page Header with model dropdown & View Code */}
      <PageHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        models={models}
        onOpenViewCode={() => setIsViewCodeOpen(true)}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* 3. Main content area: Chat Area + Parameters Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        <ChatArea
          systemPrompt={systemPrompt}
          setSystemPrompt={setSystemPrompt}
          messages={messages}
          setMessages={setMessages}
          onUpdateMessage={handleUpdateMessage}
          onDeleteMessage={handleDeleteMessage}
          onAddTurn={handleAddTurn}
          onClearChat={handleClearChat}
          onSubmit={handleSubmit}
          onStop={handleStop}
          isGenerating={isGenerating}
          streamingMessageId={streamingMessageId}
        />

        {/* 4. Parameters Sidebar */}
        <ParametersSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          parameters={parameters}
          setParameters={setParameters}
          onOpenAddFunctionModal={() => setIsFunctionModalOpen(true)}
        />
      </div>

      {/* Modals */}
      <ViewCodeModal
        isOpen={isViewCodeOpen}
        onClose={() => setIsViewCodeOpen(false)}
        model={selectedModel}
        systemPrompt={systemPrompt}
        messages={messages}
        parameters={parameters}
      />

      <FunctionModal
        isOpen={isFunctionModalOpen}
        onClose={() => setIsFunctionModalOpen(false)}
        onAddFunction={handleAddFunction}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        hasServerKey={hasServerKey}
        customApiKey={customApiKey}
        onSaveCustomApiKey={setCustomApiKey}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
