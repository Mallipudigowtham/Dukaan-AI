// Vernacular Text-to-Speech (Web Speech Synthesis) utility

export function getVoiceForLanguage(langCode) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();

  const langPrefix = langCode.toLowerCase().split('-')[0];

  // Try exact match first
  let match = voices.find((v) => v.lang.toLowerCase() === langCode.toLowerCase());
  if (match) return match;

  // Try matching prefix (e.g. 'te', 'ta', 'hi', 'en')
  match = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
  if (match) return match;

  // Try Indian English fallback if available
  if (langPrefix === 'en') {
    match = voices.find((v) => v.lang.toLowerCase().includes('in'));
    if (match) return match;
  }

  return voices[0] || null;
}

export function speakVernacularResult(text, langCode = 'en-IN', onStart, onEnd, onError) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this browser.');
    if (onError) onError('Speech synthesis not supported');
    return null;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending utterance

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.95; // Slightly slower for better kirana shop clarity
    utterance.pitch = 1.0;

    const voice = getVoiceForLanguage(langCode);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      if (onError) onError(e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (err) {
    console.error('Failed to trigger speech synthesis:', err);
    if (onError) onError(err);
    if (onEnd) onEnd();
    return null;
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
