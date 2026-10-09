export const LANGUAGES = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    shortLabel: 'EN',
    speechLangCode: 'en-IN',
    flag: '🇮🇳',
    speakLabel: 'Speak it',
    snapLabel: 'Snap it',
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    shortLabel: 'हि',
    speechLangCode: 'hi-IN',
    flag: 'अ',
    speakLabel: 'बोलिए',
    snapLabel: 'फोटो लीजिए',
  },
  {
    code: 'te',
    label: 'Telugu',
    nativeLabel: 'తెలుగు',
    shortLabel: 'తె',
    speechLangCode: 'te-IN',
    flag: 'ఆ',
    speakLabel: 'మాట్లాడండి',
    snapLabel: 'ఫోటో తీయండి',
  },
  {
    code: 'ta',
    label: 'Tamil',
    nativeLabel: 'தமிழ்',
    shortLabel: 'த',
    speechLangCode: 'ta-IN',
    flag: 'த',
    speakLabel: 'பேசுங்கள்',
    snapLabel: 'படம் எடுங்கள்',
  },
];

export const DEFAULT_LANGUAGE = 'en';

export function getLanguage(code) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}
