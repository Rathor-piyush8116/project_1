import React, { useState } from 'react';
import { X, Code, Plus } from 'lucide-react';

export default function FunctionModal({ isOpen, onClose, onAddFunction }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parametersJson, setParametersJson] = useState(`{
  "type": "object",
  "properties": {
    "location": {
      "type": "string",
      "description": "City and state, e.g. San Francisco, CA"
    }
  },
  "required": ["location"]
}`);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddFunction({
      name: name.trim().replace(/\s+/g, '_'),
      description: description.trim() || 'Custom function tool',
      parameters: parametersJson,
    });

    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-groq-border bg-groq-panel shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-groq-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-groq-accent" />
            <h3 className="text-base font-bold text-white">Add Custom Function Tool</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-groq-panel-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Function Name <span className="text-groq-accent">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. get_current_weather"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-groq-input border border-groq-border text-gray-200 placeholder-gray-500 focus:outline-none focus:border-groq-accent font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="e.g. Get the current weather for a given location"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-groq-input border border-groq-border text-gray-200 placeholder-gray-500 focus:outline-none focus:border-groq-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Parameters (JSON Schema)
            </label>
            <textarea
              rows={6}
              value={parametersJson}
              onChange={(e) => setParametersJson(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#111317] border border-groq-border text-gray-200 focus:outline-none focus:border-groq-accent font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-groq-panel-secondary text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-groq-accent hover:bg-groq-accent-hover text-white font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Function</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
