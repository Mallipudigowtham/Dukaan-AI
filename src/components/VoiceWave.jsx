import React from 'react';

export function VoiceWave({
  isActive = false,
  isListening = false,
  isSpeaking = false,
  className = '',
  color = 'amber',
}) {
  const active = isActive || isListening || isSpeaking;
  if (!active) return null;

  const barColor = isSpeaking ? 'bg-emerald-500' : 'bg-amber-500';

  return (
    <div className={`flex items-center justify-center gap-1 h-8 ${className}`}>
      {[8, 18, 28, 22, 32, 16, 26, 12, 20, 10].map((h, i) => (
        <span
          key={i}
          className={`w-1 ${barColor} rounded-full transition-all`}
          style={{
            height: `${h}px`,
            animation: 'pulse 0.7s infinite alternate ease-in-out',
            animationDelay: `${(i % 5) * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}
