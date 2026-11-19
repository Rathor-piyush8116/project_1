import React, { useState, useRef, useEffect } from 'react';
import { Code2, ChevronDown, Check, Sliders, Sparkles } from 'lucide-react';

export default function PageHeader({
  activeTab,
  setActiveTab,
  selectedModel,
  setSelectedModel,
  models,
  onOpenViewCode,
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentModelObj = models.find(m => m.id === selectedModel) || {
    id: selectedModel,
    name: selectedModel,
    displayName: selectedModel,
    developer: 'Groq',
    contextWindow: 128000,
  };

  return (
    <div className="border-b border-groq-border bg-groq-bg/95 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Left: Title & Chat/Studio Toggle */}
      <div className="flex items-center gap-4 sm:gap-6">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Playground</span>
        </h1>

        {/* Segmented Chat / Studio Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-groq-panel border border-groq-border text-xs font-medium">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'chat'
                ? 'bg-groq-panel-secondary text-white font-semibold shadow-sm border border-groq-border/80'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'studio'
                ? 'bg-groq-panel-secondary text-white font-semibold shadow-sm border border-groq-border/80'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            title="Studio view (Interactive canvas mode)"
          >
            <span>Studio</span>
            <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-groq-accent/20 text-groq-accent font-mono">
              Beta
            </span>
          </button>
        </div>
      </div>

      {/* Right: Model Selector & View Code & Sidebar Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Model dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-groq-panel border border-groq-border hover:border-groq-border-light text-sm font-medium text-gray-200 hover:text-white transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-groq-accent" />
            <span className="font-mono text-xs sm:text-sm font-semibold max-w-[150px] sm:max-w-[220px] truncate">
              {currentModelObj.displayName || currentModelObj.name || selectedModel}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180 text-white' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-groq-panel border border-groq-border shadow-2xl z-50 py-1.5 overflow-hidden animate-slide-up backdrop-blur-lg">
              <div className="px-3 py-2 border-b border-groq-border/60 text-xs font-semibold uppercase tracking-wider text-groq-muted flex items-center justify-between">
                <span>Select Groq Model</span>
                <span className="text-[10px] text-gray-500 font-mono">LPU Inferred</span>
              </div>
              <div className="max-h-80 overflow-y-auto p-1 divide-y divide-groq-border/30">
                {models.map(model => {
                  const isSelected = model.id === selectedModel;
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start justify-between gap-2 transition-colors ${
                        isSelected
                          ? 'bg-groq-accent-subtle/70 text-white'
                          : 'hover:bg-groq-panel-secondary text-gray-300 hover:text-white'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-white truncate">
                            {model.displayName || model.name}
                          </span>
                          {model.developer && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-groq-panel border border-groq-border text-gray-400 font-sans">
                              {model.developer}
                            </span>
                          )}
                        </div>
                        {model.id !== model.displayName && (
                          <div className="font-mono text-[11px] text-gray-400 truncate mt-0.5">
                            {model.id}
                          </div>
                        )}
                        {model.description && (
                          <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                            {model.description}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 pt-0.5">
                        {isSelected && <Check className="w-4 h-4 text-groq-accent" />}
                        {model.contextWindow && (
                          <span className="text-[10px] text-gray-500 font-mono">
                            {Math.round(model.contextWindow / 1024)}k ctx
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* View Code button */}
        <button
          onClick={onOpenViewCode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-groq-panel border border-groq-border hover:border-groq-border-light text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-all shadow-sm"
          title="View equivalent cURL, Python & JS fetch code"
        >
          <Code2 className="w-4 h-4 text-gray-400" />
          <span className="hidden sm:inline">View code</span>
        </button>

        {/* Toggle Parameters Sidebar (Mobile & Desktop) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-2 rounded-lg border transition-all ${
            isSidebarOpen
              ? 'bg-groq-panel-secondary border-groq-border-light text-white'
              : 'bg-groq-panel border-groq-border text-gray-400 hover:text-white'
          }`}
          title="Toggle Parameters Panel"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
