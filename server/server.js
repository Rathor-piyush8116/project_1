import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from current directory or parent directory
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0);
  res.json({
    status: 'ok',
    hasKey,
    timestamp: new Date().toISOString()
  });
});

// Available models list (curated with popular Groq models)
app.get('/api/models', async (req, res) => {
  const apiKey = req.headers['x-groq-api-key'] || process.env.GROQ_API_KEY;
  
  const defaultModels = [
    { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B (Groq)', context_window: 131072, developer: 'OpenAI / Groq' },
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', context_window: 128000, developer: 'Meta' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', context_window: 128000, developer: 'Meta' },
    { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill Llama 70B', context_window: 128000, developer: 'DeepSeek' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', context_window: 32768, developer: 'Mistral' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT', context_window: 8192, developer: 'Google' }
  ];

  if (!apiKey) {
    return res.json({ data: defaultModels, source: 'fallback' });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`
      }
    });

    if (groqRes.ok) {
      const data = await groqRes.json();
      // Filter out whisper or audio models for chat playground
      const chatModels = (data.data || [])
        .filter(m => !m.id.includes('whisper') && !m.id.includes('embed') && m.active !== false)
        .map(m => ({
          id: m.id,
          name: m.id,
          context_window: m.context_window || 128000,
          developer: m.owned_by || 'Groq'
        }));
      
      // Ensure openai/gpt-oss-120b is in the list
      if (!chatModels.some(m => m.id === 'openai/gpt-oss-120b')) {
        chatModels.unshift({
          id: 'openai/gpt-oss-120b',
          name: 'GPT OSS 120B (Groq)',
          context_window: 131072,
          developer: 'OpenAI / Groq'
        });
      }

      return res.json({ data: chatModels, source: 'groq' });
    }
  } catch (err) {
    console.warn('Failed to fetch models from Groq API, using default list:', err.message);
  }

  return res.json({ data: defaultModels, source: 'fallback' });
});

// Chat completions endpoint (supports both streaming SSE and JSON)
app.post('/api/chat', async (req, res) => {
  const {
    model = 'openai/gpt-oss-120b',
    messages = [],
    temperature = 1,
    max_completion_tokens = 2048,
    reasoning_effort,
    stream = true,
    json_mode = false
  } = req.body;

  const apiKey = (req.headers['x-groq-api-key'] || process.env.GROQ_API_KEY || '').trim();

  if (!apiKey) {
    return res.status(401).json({
      error: 'GROQ_API_KEY is not configured on the server. Please add your key to the .env file or configure it in Settings.'
    });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: 'Messages must be a non-empty array.'
    });
  }

  // Sanitize messages
  const sanitizedMessages = messages.map(msg => ({
    role: msg.role === 'system' ? 'system' : msg.role === 'assistant' ? 'assistant' : 'user',
    content: typeof msg.content === 'string' ? msg.content : String(msg.content || '')
  })).filter(msg => msg.content.trim().length > 0 || msg.role === 'assistant');

  if (sanitizedMessages.length === 0) {
    return res.status(400).json({
      error: 'At least one message with content is required.'
    });
  }

  // Build Groq payload
  const groqPayload = {
    model,
    messages: sanitizedMessages,
    temperature: typeof temperature === 'number' ? Math.max(0, Math.min(2, temperature)) : 1,
    stream: Boolean(stream)
  };

  if (max_completion_tokens) {
    const tokens = parseInt(max_completion_tokens, 10);
    if (!isNaN(tokens) && tokens > 0) {
      // Groq supports max_tokens and max_completion_tokens
      groqPayload.max_tokens = tokens;
    }
  }

  if (json_mode) {
    groqPayload.response_format = { type: 'json_object' };
  }

  if (stream) {
    groqPayload.stream_options = { include_usage: true };
  }

  if (reasoning_effort && ['low', 'medium', 'high'].includes(reasoning_effort)) {
    // Only pass reasoning_effort if user selected or if reasoning model
    if (model.includes('r1') || model.includes('reasoning') || model.includes('deepseek')) {
      groqPayload.reasoning_effort = reasoning_effort;
    }
  }

  const controller = new AbortController();
  // Only abort if the client closed connection before response completed
  res.on('close', () => {
    if (!res.writableEnded) {
      controller.abort();
    }
  });

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(groqPayload),
      signal: controller.signal
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      let errorMessage = `Groq API Error (${groqResponse.status})`;
      try {
        const errorJson = JSON.parse(errText);
        if (errorJson.error && errorJson.error.message) {
          errorMessage = errorJson.error.message;
        }
      } catch (e) {
        if (errText) errorMessage = errText;
      }

      return res.status(groqResponse.status).json({ error: errorMessage });
    }

    if (!stream) {
      // Non-streaming response
      const data = await groqResponse.json();
      return res.json(data);
    }

    // Set SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering (e.g. Nginx)
    res.flushHeaders?.();

    const reader = groqResponse.body.getReader();
    const decoder = new TextDecoder('utf-8');

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
      res.end();
    } catch (streamError) {
      if (streamError.name !== 'AbortError') {
        console.error('Error during streaming chunk write:', streamError);
      }
      res.end();
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      // Client closed the connection
      return;
    }
    console.error('Request to Groq API failed:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        error: `Server failed to contact Groq API: ${err.message}`
      });
    }
    res.end();
  }
});

// Serve frontend build if exists in production
const clientDist = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDist, 'index.html'), err => {
    if (err) {
      next();
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Groq Playground backend server listening on http://localhost:${PORT}`);
});
