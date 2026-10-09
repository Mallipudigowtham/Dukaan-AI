import React from 'react';
import { VoiceWave } from './VoiceWave';

export function ActionTile({
  icon: Icon,
  label,
  subtitle,
  onClick,
  isListening = false,
  isProcessing = false,
  variant = 'speak',
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden h-[140px] rounded-[28px] p-4 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between select-none touch-target group border shadow-md active:scale-95 ${
        variant === 'speak' && isListening
          ? 'bg-rose-500 text-white border-rose-400 ring-4 ring-rose-400/40 shadow-rose-200'
          : 'bg-white/95 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 border-white/40 dark:border-stone-800 hover:shadow-lg'
      } ${className}`}
    >
      {/* Scan line effect if processing */}
      {isProcessing && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-scan-line shadow-[0_0_8px_rgba(255,122,26,0.8)]" />
        </div>
      )}

      {/* Top row: Icon and Wave/State */}
      <div className="flex items-center justify-between w-full">
        <div
          className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
            variant === 'speak' && isListening
              ? 'bg-white text-rose-600'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110'
          }`}
        >
          {variant === 'speak' && isListening && (
            <div className="absolute inset-0 rounded-2xl bg-rose-400 animate-pulse-ring -m-2 pointer-events-none" />
          )}
          <Icon className="w-6 h-6 z-10" />
        </div>

        {variant === 'speak' && isListening ? (
          <VoiceWave isListening={true} />
        ) : isProcessing ? (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full animate-pulse">
            Processing
          </span>
        ) : null}
      </div>

      {/* Bottom row: Labels */}
      <div>
        <h3 className="text-lg font-black tracking-tight font-heading leading-tight line-clamp-1">
          {label}
        </h3>
        {subtitle && (
          <p
            className={`text-xs font-semibold leading-tight mt-0.5 line-clamp-1 ${
              variant === 'speak' && isListening
                ? 'text-white/80'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </button>
  );
}
