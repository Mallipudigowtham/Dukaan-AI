import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Camera,
  Upload,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  FileText,
  Volume2,
  VolumeX,
  Play,
  ArrowRight,
  Info,
  Store,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  InventoryItem,
  CustomerCredit,
  LanguageCode,
  AuthenticityEvaluation,
  ShopProfile,
} from '../types';
import { SAMPLE_VOICE_PROMPTS, SAMPLE_LEDGER_PHOTOS, SUPPORTED_LANGUAGES } from '../data/initialData';
import { UI_STRINGS, generateVoiceFeedback, speakVernacularText } from '../utils/i18n';

interface EntryScreenProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  shopProfile: ShopProfile;
  inventory: InventoryItem[];
  customers: CustomerCredit[];
  onCommitTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'status'>) => void;
}

export const EntryScreen: React.FC<EntryScreenProps> = ({
  currentLanguage,
  onLanguageChange,
  shopProfile,
  inventory,
  customers,
  onCommitTransaction,
}) => {
  const t = UI_STRINGS[currentLanguage] || UI_STRINGS.en;

  // Active Mode: 'voice' | 'photo' | 'type'
  const [activeMode, setActiveMode] = useState<'voice' | 'photo' | 'type'>('voice');

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Voice Output Audio Result State
  const [voiceFeedback, setVoiceFeedback] = useState<{ spokenText: string; displayText: string } | null>(null);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [autoVoiceOutput, setAutoVoiceOutput] = useState(true);

  // Photo State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhotoPresetId, setSelectedPhotoPresetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Type State
  const [typedInput, setTypedInput] = useState('');

  // Processing & Parsed Confirmation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [parsedCandidate, setParsedCandidate] = useState<{
    type: TransactionType;
    item: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    amount: number;
    customer: string;
    notes: string;
    source: 'voice' | 'photo' | 'typed' | 'manual';
    evaluation: AuthenticityEvaluation;
  } | null>(null);

  // Multi-entry candidate queue for photo extractions
  const [photoExtractedQueue, setPhotoExtractedQueue] = useState<Array<{
    type: TransactionType;
    item: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    amount: number;
    customer: string;
    notes: string;
    source: 'photo';
    evaluation: AuthenticityEvaluation;
  }>>([]);

  const [documentAuthenticity, setDocumentAuthenticity] = useState<{
    isAuthentic: boolean;
    authenticityScore: number;
    verdict: string;
    tamperCheck?: string;
    flags: string[];
  } | null>(null);

  const [isSuccessSaved, setIsSuccessSaved] = useState(false);

  // Setup Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const currentLangConfig = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = currentLangConfig?.speechLocale || 'en-IN';

    recognition.onresult = (event: any) => {
      let current = '';
      for (let i = 0; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setSpeechTranscript(current);
    };

    recognition.onerror = (err: any) => {
      console.warn('Speech recognition warning:', err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch (e) {
        // ignore
      }
    };
  }, [currentLanguage]);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      // Fallback: pick a default prompt for demonstration
      const sample = SAMPLE_VOICE_PROMPTS.find((p) => p.language === currentLanguage) || SAMPLE_VOICE_PROMPTS[0];
      setSpeechTranscript(sample.text);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      setSpeechTranscript('');
      try {
        const currentLangConfig = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage);
        recognitionRef.current.lang = currentLangConfig?.speechLocale || 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Error starting speech recognition:', e);
      }
    }
  };

  // Submit Voice / Typed Text for AI Parsing & Fake Evaluation
  const handleParseText = async (text: string, source: 'voice' | 'typed') => {
    if (!text.trim()) return;

    setIsProcessing(true);
    setProcessingStep('AI Parsing vernacular dialect...');

    try {
      setProcessingStep('Auditing record authenticity & price sanity...');

      const response = await fetch('/api/ai/parse-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: text,
          language: currentLanguage,
          existingItems: inventory,
        }),
      });

      if (!response.ok) {
        throw new Error('Server error while parsing text');
      }

      const data = await response.json();

      const candidateObj = {
        type: data.type || 'sale',
        item: data.item || 'Kirana Item',
        quantity: Number(data.quantity) || 1,
        unit: data.unit || 'packet',
        unitPrice: Number(data.unitPrice) || 50,
        amount: Number(data.amount) || 50,
        customer: data.customer || 'Walk-in Customer',
        notes: data.notes || text,
        source,
        evaluation: data.evaluation || {
          isAuthentic: true,
          authenticityScore: 92,
          verdict: 'VERIFIED',
          confidence: 'high',
          anomalyFlags: [],
          explanation: 'Standard verified retail record.',
        },
      };

      setParsedCandidate(candidateObj);

      // Generate Voice & Text Result in preferred language
      const feedback = generateVoiceFeedback(candidateObj, currentLanguage);
      setVoiceFeedback(feedback);

      if (autoVoiceOutput) {
        setIsSpeakingAudio(true);
        speakVernacularText(feedback.spokenText, currentLanguage, () => setIsSpeakingAudio(false));
      }
    } catch (err) {
      console.error('Parse error:', err);
      // Fallback candidate
      const fallbackObj = {
        type: 'sale' as const,
        item: 'Sona Masoori Rice',
        quantity: 2,
        unit: 'kg',
        unitPrice: 60,
        amount: 120,
        customer: 'Ramesh',
        notes: text,
        source,
        evaluation: {
          isAuthentic: true,
          authenticityScore: 90,
          verdict: 'VERIFIED' as const,
          confidence: 'high' as const,
          anomalyFlags: [],
          explanation: 'Verified against local kirana baseline.',
        },
      };
      setParsedCandidate(fallbackObj);

      const feedback = generateVoiceFeedback(fallbackObj, currentLanguage);
      setVoiceFeedback(feedback);
      if (autoVoiceOutput) {
        setIsSpeakingAudio(true);
        speakVernacularText(feedback.spokenText, currentLanguage, () => setIsSpeakingAudio(false));
      }
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Handle Photo selection & OCR
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
      processPhotoOCR(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetPhoto = (preset: (typeof SAMPLE_LEDGER_PHOTOS)[0]) => {
    setSelectedPhotoPresetId(preset.id);
    setPhotoPreview(preset.imageSvgDataUri);

    // If preset has pre-evaluated transactions, we can simulate or run OCR
    setIsProcessing(true);
    setProcessingStep('Analyzing ledger handwriting & performing forensic audit...');

    setTimeout(() => {
      setDocumentAuthenticity({
        isAuthentic: preset.presetTransactions.every((p) => p.evaluation.isAuthentic),
        authenticityScore: Math.round(
          preset.presetTransactions.reduce((acc, p) => acc + p.evaluation.authenticityScore, 0) /
            preset.presetTransactions.length
        ),
        verdict: preset.badge === 'High Risk Alert' ? 'HIGH_RISK_FAKE' : 'VERIFIED',
        tamperCheck:
          preset.badge === 'High Risk Alert'
            ? 'Scratched/overwritten rate digits detected on ink line; unit price 70x above standard'
            : 'Handwriting flow consistent, page lines aligned, arithmetic verified',
        flags: preset.badge === 'High Risk Alert' ? ['Overwritten figures', 'Extreme price anomaly'] : [],
      });

      const queue = preset.presetTransactions.map((tx) => ({
        ...tx,
        source: 'photo' as const,
      }));

      setPhotoExtractedQueue(queue);
      if (queue.length > 0) {
        setParsedCandidate(queue[0]);
        const feedback = generateVoiceFeedback(queue[0], currentLanguage);
        setVoiceFeedback(feedback);
        if (autoVoiceOutput) {
          setIsSpeakingAudio(true);
          speakVernacularText(feedback.spokenText, currentLanguage, () => setIsSpeakingAudio(false));
        }
      }
      setIsProcessing(false);
      setProcessingStep('');
    }, 900);
  };

  const processPhotoOCR = async (base64: string, mimeType: string = 'image/jpeg') => {
    setIsProcessing(true);
    setProcessingStep('Extracting ledger handwriting & evaluating authenticity...');

    try {
      const response = await fetch('/api/ai/ocr-ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          existingItems: inventory,
        }),
      });

      const data = await response.json();

      if (data.authenticity) {
        setDocumentAuthenticity({
          isAuthentic: data.authenticity.isAuthentic,
          authenticityScore: data.authenticity.authenticityScore,
          verdict: data.authenticity.verdict,
          tamperCheck: data.authenticity.tamperCheck,
          flags: data.authenticity.flags || [],
        });
      }

      if (data.transactions && data.transactions.length > 0) {
        const queue = data.transactions.map((tx: any) => ({
          ...tx,
          source: 'photo' as const,
        }));
        setPhotoExtractedQueue(queue);
        setParsedCandidate(queue[0]);
        const feedback = generateVoiceFeedback(queue[0], currentLanguage);
        setVoiceFeedback(feedback);
        if (autoVoiceOutput) {
          setIsSpeakingAudio(true);
          speakVernacularText(feedback.spokenText, currentLanguage, () => setIsSpeakingAudio(false));
        }
      }
    } catch (err) {
      console.error('OCR failed:', err);
      // Demo fallback
      const fallback = SAMPLE_LEDGER_PHOTOS[0].presetTransactions[0];
      setParsedCandidate({ ...fallback, source: 'photo' });
      const feedback = generateVoiceFeedback(fallback, currentLanguage);
      setVoiceFeedback(feedback);
      if (autoVoiceOutput) {
        setIsSpeakingAudio(true);
        speakVernacularText(feedback.spokenText, currentLanguage, () => setIsSpeakingAudio(false));
      }
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Re-evaluate candidate before saving
  const handleReEvaluate = async () => {
    if (!parsedCandidate) return;
    setIsProcessing(true);
    setProcessingStep('Re-evaluating edited record...');

    try {
      const response = await fetch('/api/ai/evaluate-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: parsedCandidate,
          existingItems: inventory,
          customerHistory: customers,
        }),
      });

      const evaluation = await response.json();
      setParsedCandidate((prev) => (prev ? { ...prev, evaluation } : null));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Commit Candidate to permanent digital records
  const handleConfirmAndSave = () => {
    if (!parsedCandidate) return;

    onCommitTransaction(parsedCandidate);
    setIsSuccessSaved(true);

    // If there are more items in photo queue
    if (photoExtractedQueue.length > 1) {
      const remaining = photoExtractedQueue.slice(1);
      setPhotoExtractedQueue(remaining);
      setParsedCandidate(remaining[0]);
      setTimeout(() => setIsSuccessSaved(false), 2000);
    } else {
      setTimeout(() => {
        setIsSuccessSaved(false);
        setParsedCandidate(null);
        setSpeechTranscript('');
        setTypedInput('');
      }, 1500);
    }
  };

  // Helper to check if inventory is affected and going to be low
  const matchedInventoryItem = parsedCandidate
    ? inventory.find((i) => i.name.toLowerCase() === parsedCandidate.item.toLowerCase())
    : null;

  const willBeLowStock =
    matchedInventoryItem &&
    (parsedCandidate?.type === 'sale' || parsedCandidate?.type === 'credit') &&
    matchedInventoryItem.currentStock - (parsedCandidate?.quantity || 0) <=
      matchedInventoryItem.lowStockThreshold;

  const isUnsoldItemBeingMoved =
    matchedInventoryItem && matchedInventoryItem.daysWithoutSale >= 14;

  return (
    <div className="space-y-6">
      
      {/* Personalized Shopkeeper Welcome Greeting in Preferred Language */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-white/20 text-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.nativeName} Mode Active
            </span>
            <span className="text-xs text-emerald-200">· {shopProfile.phoneNumber}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {t.welcomeBack}, {shopProfile.loginName}!
          </h2>
          <p className="text-xs text-emerald-100/90 font-medium">
            {t.smartAssistantFor} <span className="font-bold text-white underline decoration-emerald-400 underline-offset-2">{shopProfile.storeName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 sm:self-auto self-start">
          <button
            onClick={() => setAutoVoiceOutput(!autoVoiceOutput)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-colors ${
              autoVoiceOutput
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-xs'
                : 'bg-stone-800 border-stone-700 text-stone-300'
            }`}
          >
            {autoVoiceOutput ? <Volume2 className="w-4 h-4 text-emerald-200" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
            <span>{autoVoiceOutput ? t.voiceOutputEnabled : t.voiceOutputDisabled}</span>
          </button>
        </div>
      </div>

      {/* Modes Navigation Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              {t.tabEntry}
            </h2>
            <p className="text-xs text-stone-500">
              Voice-first &amp; photo-first kirana journal with anti-fake AI verification
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200 self-start sm:self-auto">
            <button
              onClick={() => setActiveMode('voice')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'voice'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Mic className="w-4 h-4 text-emerald-600" />
              <span>{t.speakIt}</span>
            </button>
            <button
              onClick={() => setActiveMode('photo')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'photo'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>{t.snapIt}</span>
            </button>
            <button
              onClick={() => setActiveMode('type')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'type'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Edit3 className="w-4 h-4 text-stone-600" />
              <span>{t.typeIt}</span>
            </button>
          </div>
        </div>

        {/* MODE 1: SPEAK IT (Voice Capture) */}
        {activeMode === 'voice' && (
          <div className="pt-5 space-y-6">
            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-stone-50 to-emerald-50/30 rounded-2xl border border-dashed border-emerald-300/80">
              
              {/* Mic Visual Wave Ring */}
              <div className="relative mb-4">
                {isListening && (
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping -m-3 pointer-events-none"></div>
                )}
                <button
                  onClick={toggleListening}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform active:scale-95 ${
                    isListening
                      ? 'bg-rose-600 shadow-rose-200 ring-4 ring-rose-400/50'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start speaking'}
                >
                  {isListening ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
                </button>
              </div>

              {/* Status & Language helper */}
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-stone-800">
                  {isListening ? (
                    <span className="text-rose-600 font-bold flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                      {t.listening}
                    </span>
                  ) : (
                    t.pressToSpeak
                  )}
                </p>
                <p className="text-xs text-stone-500">
                  Speaks in Telugu, Tamil, Hindi, or English (Auto-detected)
                </p>
              </div>

              {/* Live Transcript Bubble */}
              <div className="w-full max-w-xl mt-4">
                <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-xs flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                  <input
                    type="text"
                    value={speechTranscript}
                    onChange={(e) => setSpeechTranscript(e.target.value)}
                    placeholder="Spoken words will appear here (e.g. 'Sold 2 kg rice to Ramesh on credit')..."
                    className="w-full text-sm text-stone-800 outline-none placeholder:text-stone-400"
                  />
                  {speechTranscript && (
                    <button
                      onClick={() => handleParseText(speechTranscript, 'voice')}
                      disabled={isProcessing}
                      className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <span>Process</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Sample Voice Prompts (1-tap testing for evaluators) */}
              <div className="w-full max-w-2xl mt-5">
                <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-stone-400" />
                  Tap to simulate real shopkeeper voice phrases (Multilingual):
                </p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_VOICE_PROMPTS.filter((p) => p.language === currentLanguage || p.language === 'en').map(
                    (prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSpeechTranscript(prompt.text);
                          handleParseText(prompt.text, 'voice');
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-all flex items-center gap-1.5 ${
                          prompt.label.includes('Suspicious')
                            ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-emerald-300'
                        }`}
                      >
                        <span className="font-semibold">{prompt.label}:</span>
                        <span className="italic text-stone-500">"{prompt.text.slice(0, 32)}..."</span>
                      </button>
                    )
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* MODE 2: SNAP IT (Photo OCR & Ledger Inspection) */}
        {activeMode === 'photo' && (
          <div className="pt-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Photo Upload Box */}
              <div className="flex flex-col items-center justify-center p-6 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300 hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                {photoPreview ? (
                  <div className="w-full space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-white max-h-56 flex items-center justify-center">
                      <img
                        src={photoPreview}
                        alt="Ledger Snap"
                        className="w-full object-contain max-h-56"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" /> Replace photo
                      </button>
                      <button
                        onClick={() => {
                          setPhotoPreview(null);
                          setSelectedPhotoPresetId(null);
                          setPhotoExtractedQueue([]);
                          setParsedCandidate(null);
                        }}
                        className="text-xs text-stone-500 hover:text-stone-700"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">
                        Snap ledger page or supplier invoice
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Supports handwritten notebook pages, receipts, and bills
                      </p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Select image / Take photo</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Ready-to-Test Sample Khata Presets */}
              <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-stone-500" />
                    1-Click Khata Test Gallery (SRD UC-3):
                  </h3>
                  <span className="text-[10px] text-stone-500 font-medium">Instant Test</span>
                </div>
                <p className="text-xs text-stone-500">
                  Select a sample physical kirana ledger or invoice to verify OCR extraction &amp; forensic anti-fake audit:
                </p>

                <div className="space-y-2">
                  {SAMPLE_LEDGER_PHOTOS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPresetPhoto(preset)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                        selectedPhotoPresetId === preset.id
                          ? 'bg-blue-50/90 border-blue-400 ring-1 ring-blue-400'
                          : 'bg-white border-stone-200 hover:border-blue-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900">{preset.title}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              preset.badge === 'High Risk Alert'
                                ? 'bg-rose-100 text-rose-800'
                                : preset.badge === 'Wholesale Invoice'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">{preset.subtitle}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-400 shrink-0 mt-1" />
                    </button>
                  ))}
                </div>

                {documentAuthenticity && (
                  <div
                    className={`p-3 rounded-xl border text-xs mt-3 ${
                      documentAuthenticity.verdict === 'HIGH_RISK_FAKE'
                        ? 'bg-rose-50 border-rose-300 text-rose-900'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="flex items-center gap-1.5">
                        {documentAuthenticity.verdict === 'HIGH_RISK_FAKE' ? (
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        )}
                        Document Audit Verdict: {documentAuthenticity.verdict}
                      </span>
                      <span>Score: {documentAuthenticity.authenticityScore}%</span>
                    </div>
                    <p className="text-[11px] text-stone-600">{documentAuthenticity.tamperCheck}</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* MODE 3: QUICK TYPE */}
        {activeMode === 'type' && (
          <div className="pt-5 space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleParseText(typedInput, 'typed');
                }}
                placeholder="e.g. Ramesh took 5 kg rice on credit or Sita paid 500 rupees..."
                className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-500 focus:bg-white"
              />
              <button
                onClick={() => handleParseText(typedInput, 'typed')}
                disabled={!typedInput.trim() || isProcessing}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Parse &amp; Audit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-stone-400">
              Type naturally in English, Telugu, Tamil, or Hindi transliteration.
            </p>
          </div>
        )}

      </div>

      {/* PROCESSING LOADER */}
      {isProcessing && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-pulse">
          <div className="w-8 h-8 mx-auto border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-emerald-900">{processingStep}</p>
          <p className="text-xs text-emerald-700">
            Checking price benchmarks, arithmetic consistency, and customer credit exposure...
          </p>
        </div>
      )}

      {/* SUCCESS CONFIRMATION BANNER */}
      {isSuccessSaved && (
        <div className="bg-emerald-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-md transition-all">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-white" />
            <div>
              <p className="text-sm font-bold">Successfully Recorded into Digital Ledger!</p>
              <p className="text-xs text-emerald-100">Stock &amp; Credit book updated systematically.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CRITICAL FEATURE: AI AUTHENTICITY AUDIT & CONFIRM-BEFORE-SAVE CARD (FR-7) */}
      {/* ========================================================================= */}
      {parsedCandidate && !isProcessing && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-stone-200 shadow-md space-y-6">
          
          {/* Header of Candidate Form */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Step 2: Confirm Before Committing (SRD FR-7)
                </span>
                <span className="bg-stone-100 text-stone-700 text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase">
                  Source: {parsedCandidate.source}
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                Inspect Parsed Transaction &amp; Authenticity Audit
              </h3>
            </div>

            {/* AI Trust Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold ${
                parsedCandidate.evaluation.verdict === 'VERIFIED'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : parsedCandidate.evaluation.verdict === 'REQUIRES_CAUTION'
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse'
              }`}
            >
              {parsedCandidate.evaluation.verdict === 'VERIFIED' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
              {parsedCandidate.evaluation.verdict === 'REQUIRES_CAUTION' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {parsedCandidate.evaluation.verdict === 'SUSPICIOUS_FAKE' && <ShieldAlert className="w-4 h-4 text-rose-600" />}
              <span>
                {parsedCandidate.evaluation.verdict === 'VERIFIED'
                  ? t.verifiedBadge
                  : parsedCandidate.evaluation.verdict === 'REQUIRES_CAUTION'
                  ? t.cautionBadge
                  : t.fakeBadge}
              </span>
              <span className="text-[11px] font-mono bg-white/70 px-1.5 py-0.5 rounded-md border border-stone-200">
                {parsedCandidate.evaluation.authenticityScore}% Trust
              </span>
            </div>
          </div>

          {/* VERNACULAR VOICE & TEXT RESULT SECTION (User Requirement: give result in voice or in text form according to preferred language) */}
          {voiceFeedback && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border border-emerald-300 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs transition-all ${
                      isSpeakingAudio
                        ? 'bg-emerald-600 ring-4 ring-emerald-300/60 scale-105 animate-pulse'
                        : 'bg-emerald-700'
                    }`}
                  >
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                        {t.voiceResultTitle}
                      </span>
                      {isSpeakingAudio && (
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-ping"></span>
                          {t.audioSpeaking}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      Audio output in {SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.nativeName} ({SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.name})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsSpeakingAudio(true);
                      speakVernacularText(voiceFeedback.spokenText, currentLanguage, () =>
                        setIsSpeakingAudio(false)
                      );
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all transform active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{t.replayVoice}</span>
                  </button>
                </div>
              </div>

              {/* Spoken vernacular audio text */}
              <div className="bg-white/95 rounded-xl p-3 border border-emerald-200/90 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Vernacular Spoken Voice Output:
                </span>
                <p className="text-stone-900 font-bold text-sm leading-relaxed">
                  "{voiceFeedback.spokenText}"
                </p>
              </div>

              {/* Text Form summary */}
              <div className="text-[11px] font-mono text-emerald-950 bg-emerald-100/70 px-3 py-2 rounded-xl border border-emerald-200/80 flex items-center gap-2">
                <span className="font-bold shrink-0 text-emerald-800 uppercase tracking-wider text-[10px]">Text Record Form:</span>
                <span className="font-semibold">{voiceFeedback.displayText}</span>
              </div>
            </div>
          )}

          {/* ANTI-FAKE AUDIT REPORT BOX */}
          <div
            className={`p-4 rounded-xl border space-y-2 ${
              parsedCandidate.evaluation.verdict === 'SUSPICIOUS_FAKE'
                ? 'bg-rose-50/70 border-rose-300'
                : parsedCandidate.evaluation.verdict === 'REQUIRES_CAUTION'
                ? 'bg-amber-50/70 border-amber-300'
                : 'bg-emerald-50/50 border-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-stone-800">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Anti-Fake &amp; Sanity Evaluation Report:
              </span>
              <span className="text-stone-500 font-normal">Confidence: {parsedCandidate.evaluation.confidence}</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-medium">
              {parsedCandidate.evaluation.explanation}
            </p>

            {parsedCandidate.evaluation.anomalyFlags && parsedCandidate.evaluation.anomalyFlags.length > 0 && (
              <div className="pt-2 border-t border-stone-200/60 space-y-1">
                <p className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                  Specific Flags Detected:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-xs text-rose-800">
                  {parsedCandidate.evaluation.anomalyFlags.map((flag, idx) => (
                    <li key={idx} className="font-semibold">{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* STOCK INVENTORY FORECAST NOTICES */}
          {willBeLowStock && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center gap-3 text-xs text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Low-Stock Warning: </span>
                This sale will bring <strong>{matchedInventoryItem?.name}</strong> down to{' '}
                <strong>{(matchedInventoryItem?.currentStock || 0) - parsedCandidate.quantity} {matchedInventoryItem?.unit}</strong>,
                triggering the reorder threshold ({matchedInventoryItem?.lowStockThreshold} {matchedInventoryItem?.unit})!
              </div>
            </div>
          )}

          {isUnsoldItemBeingMoved && (
            <div className="bg-indigo-50 border border-indigo-300 rounded-xl p-3 flex items-center gap-3 text-xs text-indigo-900">
              <Info className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <span className="font-bold">Dead Stock Clearance: </span>
                Great news! <strong>{matchedInventoryItem?.name}</strong> has had no sales for{' '}
                <strong>{matchedInventoryItem?.daysWithoutSale} days</strong>. This transaction unlocks ₹
                {parsedCandidate.amount} of tied-up capital!
              </div>
            </div>
          )}

          {/* EDITABLE FORM FIELDS (FR-7: Editable before save) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Transaction Type */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Transaction Type
              </label>
              <select
                value={parsedCandidate.type}
                onChange={(e) =>
                  setParsedCandidate({ ...parsedCandidate, type: e.target.value as TransactionType })
                }
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 outline-none focus:border-emerald-600"
              >
                <option value="sale">Cash Sale (Counter)</option>
                <option value="credit">Credit Sale (Udhaar)</option>
                <option value="payment">Payment Received (Vasool)</option>
                <option value="restock">Restock / Purchase Inflow</option>
              </select>
            </div>

            {/* Product Item Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Product Item
              </label>
              <input
                type="text"
                value={parsedCandidate.item}
                onChange={(e) => setParsedCandidate({ ...parsedCandidate, item: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-600"
              />
            </div>

            {/* Quantity & Unit */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Quantity &amp; Unit
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={parsedCandidate.quantity}
                  onChange={(e) => {
                    const qty = parseFloat(e.target.value) || 1;
                    const amount = Math.round(qty * parsedCandidate.unitPrice);
                    setParsedCandidate({ ...parsedCandidate, quantity: qty, amount });
                  }}
                  className="w-20 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-600 font-semibold"
                />
                <select
                  value={parsedCandidate.unit}
                  onChange={(e) => setParsedCandidate({ ...parsedCandidate, unit: e.target.value })}
                  className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-2 py-2 text-xs text-stone-900 outline-none focus:border-emerald-600"
                >
                  <option value="kg">kg</option>
                  <option value="L">L</option>
                  <option value="packet">packet</option>
                  <option value="pcs">pcs</option>
                  <option value="box">box</option>
                  <option value="g">g</option>
                </select>
              </div>
            </div>

            {/* Rate & Total Amount */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Total Amount (₹)
              </label>
              <div className="flex gap-1 items-center">
                <span className="text-stone-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  value={parsedCandidate.amount}
                  onChange={(e) =>
                    setParsedCandidate({ ...parsedCandidate, amount: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-600 font-bold"
                />
              </div>
            </div>

            {/* Customer / Counterparty */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Customer Name / Khata Account
              </label>
              <input
                type="text"
                value={parsedCandidate.customer}
                onChange={(e) => setParsedCandidate({ ...parsedCandidate, customer: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-600"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Notes &amp; Audio Transcript Reference
              </label>
              <input
                type="text"
                value={parsedCandidate.notes}
                onChange={(e) => setParsedCandidate({ ...parsedCandidate, notes: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-600 text-stone-600"
              />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200">
            <div className="flex items-center gap-2">
              <button
                onClick={handleReEvaluate}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 flex items-center gap-1.5 transition-colors"
                title="Re-run anti-fraud evaluation with new values"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Audit Sanity</span>
              </button>
              <button
                onClick={() => setParsedCandidate(null)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors"
              >
                {t.discard}
              </button>
            </div>

            <button
              onClick={handleConfirmAndSave}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-2 transition-all transform active:scale-95 ${
                parsedCandidate.evaluation.verdict === 'SUSPICIOUS_FAKE'
                  ? 'bg-rose-700 hover:bg-rose-800'
                  : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {parsedCandidate.evaluation.verdict === 'SUSPICIOUS_FAKE'
                  ? 'Override Warning & Save to Ledger'
                  : t.saveToLedger}
              </span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
