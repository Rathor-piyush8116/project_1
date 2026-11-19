import React from 'react';
import {
  Sliders,
  X,
  HelpCircle,
  Plus,
  Trash2,
  Globe,
  Terminal,
  Cpu,
  Layers,
  Server,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { DEFAULT_PARAMETERS } from '../utils/constants';

export default function ParametersSidebar({
  isOpen,
  onClose,
  parameters,
  setParameters,
  onOpenAddFunctionModal,
}) {
  const updateParam = (key, value) => {
    setParameters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateTool = (toolKey, value) => {
    setParameters((prev) => ({
      ...prev,
      tools: {
        ...prev.tools,
        [toolKey]: value,
      },
    }));
  };

  const removeCustomFunction = (index) => {
    setParameters((prev) => ({
      ...prev,
      customFunctions: prev.customFunctions.filter((_, i) => i !== index),
    }));
  };

  const handleResetDefaults = () => {
    setParameters(DEFAULT_PARAMETERS);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 right-0 h-full w-80 sm:w-88 bg-groq-panel border-l border-groq-border z-40 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:hidden'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-14 px-5 border-b border-groq-border flex items-center justify-between bg-groq-panel/80">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-groq-accent" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-white">
              Parameters
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetDefaults}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-groq-panel-secondary transition-colors"
              title="Reset parameters to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-groq-panel-secondary transition-colors"
              aria-label="Close parameters sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable controls */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
          {/* Temperature Slider & Number Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                <span>Temperature</span>
                <span title="Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic." className="text-gray-500 hover:text-gray-300 cursor-help">
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </label>
              <input
                type="number"
                min="0"
                max="2"
                step="0.01"
                value={parameters.temperature}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  updateParam('temperature', isNaN(val) ? 0 : Math.max(0, Math.min(2, val)));
                }}
                className="w-16 px-2 py-0.5 text-right text-xs font-mono rounded bg-groq-input border border-groq-border text-gray-200 focus:outline-none focus:border-groq-accent"
              />
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={parameters.temperature}
              onChange={(e) => updateParam('temperature', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>0 (Precise)</span>
              <span>1 (Default)</span>
              <span>2 (Creative)</span>
            </div>
          </div>

          {/* Max Completion Tokens */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                <span>Max Completion Tokens</span>
                <span title="The maximum number of tokens to generate. Requests can use up to 8192 tokens." className="text-gray-500 hover:text-gray-300 cursor-help">
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </label>
              <input
                type="number"
                min="1"
                max="8192"
                step="32"
                value={parameters.max_completion_tokens}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateParam('max_completion_tokens', isNaN(val) ? 1 : Math.max(1, Math.min(8192, val)));
                }}
                className="w-20 px-2 py-0.5 text-right text-xs font-mono rounded bg-groq-input border border-groq-border text-gray-200 focus:outline-none focus:border-groq-accent"
              />
            </div>
            <input
              type="range"
              min="1"
              max="8192"
              step="32"
              value={parameters.max_completion_tokens}
              onChange={(e) => updateParam('max_completion_tokens', parseInt(e.target.value, 10))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>1</span>
              <span>2048</span>
              <span>8192</span>
            </div>
          </div>

          {/* Reasoning Dropdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                <span>Reasoning Effort</span>
                <span title="Constrains effort on reasoning for models that support it (e.g., DeepSeek R1 / o-series)." className="text-gray-500 hover:text-gray-300 cursor-help">
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </label>
            </div>
            <select
              value={parameters.reasoning_effort || 'low'}
              onChange={(e) => updateParam('reasoning_effort', e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-groq-input border border-groq-border text-xs font-mono text-gray-200 focus:outline-none focus:border-groq-accent"
            >
              <option value="low">Low (Default)</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Toggles: Stream & JSON Mode */}
          <div className="pt-2 border-t border-groq-border space-y-3">
            {/* Stream Toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-xs font-semibold text-gray-200">Stream</div>
                <div className="text-[11px] text-gray-400">Stream tokens in real-time via SSE</div>
              </div>
              <button
                type="button"
                onClick={() => updateParam('stream', !parameters.stream)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  parameters.stream ? 'bg-groq-accent' : 'bg-groq-panel-secondary'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    parameters.stream ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* JSON Mode Toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-xs font-semibold text-gray-200">JSON Mode</div>
                <div className="text-[11px] text-gray-400">Guarantees output is valid JSON</div>
              </div>
              <button
                type="button"
                onClick={() => updateParam('json_mode', !parameters.json_mode)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  parameters.json_mode ? 'bg-groq-accent' : 'bg-groq-panel-secondary'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    parameters.json_mode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Built-in Tools (UI only) */}
          <div className="pt-4 border-t border-groq-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-gray-400">
                Built-in Tools
              </span>
              <span className="text-[10px] text-gray-500 font-mono">UI Preview</span>
            </div>

            {/* Browser Search */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-groq-panel-secondary/60 border border-groq-border">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="text-xs font-medium text-gray-200">Browser Search</div>
                  <div className="text-[10px] text-gray-500">Live internet search</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateTool('browserSearch', !parameters.tools?.browserSearch)}
                className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  parameters.tools?.browserSearch ? 'bg-groq-accent' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    parameters.tools?.browserSearch ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Code Interpreter */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-groq-panel-secondary/60 border border-groq-border">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-medium text-gray-200">Code Interpreter</div>
                  <div className="text-[10px] text-gray-500">Sandboxed Python execution</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateTool('codeInterpreter', !parameters.tools?.codeInterpreter)}
                className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  parameters.tools?.codeInterpreter ? 'bg-groq-accent' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    parameters.tools?.codeInterpreter ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Custom Function Tools (UI only) */}
          <div className="pt-4 border-t border-groq-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-gray-400">
                Custom Function Tools
              </span>
              <button
                type="button"
                onClick={onOpenAddFunctionModal}
                className="text-xs text-groq-accent hover:text-groq-accent-hover flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {parameters.customFunctions && parameters.customFunctions.length > 0 ? (
              <div className="space-y-2">
                {parameters.customFunctions.map((fn, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-groq-panel-secondary/60 border border-groq-border text-xs"
                  >
                    <div className="truncate mr-2">
                      <div className="font-mono font-semibold text-gray-200 truncate">{fn.name}</div>
                      <div className="text-[11px] text-gray-500 truncate">{fn.description}</div>
                    </div>
                    <button
                      onClick={() => removeCustomFunction(i)}
                      className="text-gray-500 hover:text-red-400 p-1 rounded"
                      title="Remove function"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-dashed border-groq-border text-center text-xs text-gray-500">
                No custom functions added yet.
              </div>
            )}
          </div>

          {/* MCP Servers (UI only) */}
          <div className="pt-4 border-t border-groq-border space-y-3 pb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-gray-400">
                MCP Servers
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Model Context Protocol</span>
            </div>

            <div className="p-3 rounded-lg bg-groq-panel-secondary/40 border border-groq-border text-xs space-y-2">
              <div className="flex items-center gap-2 text-gray-300">
                <Server className="w-4 h-4 text-purple-400" />
                <span className="font-medium">MCP Endpoints</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Connect external Model Context Protocol servers to provide dynamic context and external tools.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  className="w-full py-1.5 px-2 rounded-md bg-groq-panel border border-groq-border hover:border-groq-border-light text-gray-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  onClick={() => alert('MCP Server connection interface (UI feature)')}
                >
                  <Plus className="w-3.5 h-3.5 text-purple-400" />
                  <span>Connect MCP Server</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
