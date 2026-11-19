import React, { useState } from 'react';
import { X, Key, ShieldCheck, Check, ExternalLink } from 'lucide-react';

export default function ApiKeyModal({
  isOpen,
  onClose,
  hasServerKey,
  customApiKey,
  onSaveCustomApiKey,
}) {
  const [keyInput, setKeyInput] = useState(customApiKey || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveCustomApiKey(keyInput.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setKeyInput('');
    onSaveCustomApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-groq-border bg-groq-panel shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-groq-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-groq-accent/20 border border-groq-accent/40 flex items-center justify-center">
              <Key className="w-4 h-4 text-groq-accent" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Groq API Key Configuration</h3>
              <p className="text-xs text-gray-400">Keep your secret key safe on the backend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-groq-panel-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          {/* Server status pill */}
          <div className="p-3.5 rounded-xl border bg-groq-panel-secondary/50 flex items-start gap-3">
            <ShieldCheck
              className={`w-5 h-5 mt-0.5 shrink-0 ${
                hasServerKey ? 'text-emerald-400' : 'text-amber-400'
              }`}
            />
            <div className="space-y-1">
              <div className="font-semibold text-gray-200">
                {hasServerKey ? 'Backend .env Key Detected' : 'No .env Key Detected'}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {hasServerKey
                  ? 'Your backend has GROQ_API_KEY set in .env. It will be used securely without exposing it to the browser.'
                  : 'You can configure GROQ_API_KEY in the server/.env file or paste a key below for this browser session.'}
              </p>
            </div>
          </div>

          {/* Custom key override */}
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Custom API Key Override (Optional)
              </label>
              <input
                type="password"
                placeholder="gsk_..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-groq-input border border-groq-border text-gray-200 placeholder-gray-500 focus:outline-none focus:border-groq-accent font-mono text-xs"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Stored in browser localStorage and sent securely via headers to the proxy backend.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              {customApiKey ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-red-400 hover:text-red-300 underline"
                >
                  Clear Browser Key
                </button>
              ) : (
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-groq-accent hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Get a Groq API Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg bg-groq-panel-secondary text-gray-300 hover:text-white text-xs font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-groq-accent hover:bg-groq-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-glow-subtle"
                >
                  {saved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Key</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
