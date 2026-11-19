import React from 'react';
import { Zap, Key, ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function Navbar({ hasServerKey, customApiKey, onOpenApiKeyModal }) {
  const isKeyActive = hasServerKey || Boolean(customApiKey);

  return (
    <header className="h-14 border-b border-groq-border bg-groq-panel/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between select-none z-30 sticky top-0">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-groq-accent/15 border border-groq-accent/30 flex items-center justify-center text-groq-accent group-hover:scale-105 transition-transform shadow-glow-subtle">
            <Zap className="w-4 h-4 fill-groq-accent text-groq-accent" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-lg tracking-tight text-white font-mono">groq-clone</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-groq-panel-secondary border border-groq-border text-gray-400">
              LPU™ Fast
            </span>
          </div>
        </a>
      </div>

      {/* Right: Nav Links and Profile */}
      <div className="flex items-center gap-2 sm:gap-6">
        <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <a
            href="#playground"
            className="px-3 py-1.5 rounded-md text-groq-accent bg-groq-accent-subtle/50 font-semibold transition-colors"
          >
            Playground
          </a>
          <button
            onClick={onOpenApiKeyModal}
            className="px-3 py-1.5 rounded-md text-gray-300 hover:text-white hover:bg-groq-panel-secondary transition-colors hidden sm:flex items-center gap-1.5"
          >
            <span>API Keys</span>
            {isKeyActive ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="API Key Active" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500" title="API Key Missing" />
            )}
          </button>
          <a
            href="https://console.groq.com"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-md text-gray-300 hover:text-white hover:bg-groq-panel-secondary transition-colors hidden md:flex items-center gap-1"
          >
            <span>Dashboard</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
          <a
            href="https://console.groq.com/docs"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-md text-gray-300 hover:text-white hover:bg-groq-panel-secondary transition-colors hidden md:flex items-center gap-1"
          >
            <span>Docs</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
        </nav>

        {/* API Key Quick Pill */}
        <button
          onClick={onOpenApiKeyModal}
          className={`px-2.5 py-1 rounded-full text-xs font-mono border flex items-center gap-1.5 transition-colors ${
            isKeyActive
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:border-emerald-500/60'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:border-amber-500/70 animate-pulse'
          }`}
          title={isKeyActive ? 'Groq API Key Ready' : 'Configure Groq API Key'}
        >
          {isKeyActive ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="hidden sm:inline">{isKeyActive ? 'API Key Active' : 'Set Key'}</span>
        </button>

        {/* Circular Avatar */}
        <div className="relative group cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-groq-accent to-amber-500 p-[1.5px] shadow-sm hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-[#1c1e23] flex items-center justify-center text-xs font-semibold text-white">
              G
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
