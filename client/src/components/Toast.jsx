import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-up ${
              isError
                ? 'bg-[#221314]/95 border-red-500/40 text-red-200 shadow-red-950/50'
                : isSuccess
                ? 'bg-[#122216]/95 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50'
                : 'bg-groq-panel/95 border-groq-border text-gray-200'
            }`}
          >
            {isError ? (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            ) : isSuccess ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-groq-accent shrink-0 mt-0.5" />
            )}

            <div className="flex-1 text-sm leading-relaxed">
              {toast.title && <div className="font-semibold mb-0.5">{toast.title}</div>}
              <div>{toast.message}</div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-gray-400 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-md"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
