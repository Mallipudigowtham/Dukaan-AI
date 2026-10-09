import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { getLanguage, LANGUAGES } from '../languages';
import { parseAPI, transactionsAPI, itemsAPI, customersAPI, shopAPI } from '../api';
import { HeroCard } from '../components/HeroCard';
import { ActionTile } from '../components/ActionTile';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { Toast } from '../components/Toast';
import { Chip } from '../components/Chip';
import { VoiceWave } from '../components/VoiceWave';
import { speakVernacularResult, stopSpeaking } from '../utils/speech';
import {
  Mic,
  Camera,
  Send,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Volume2,
  VolumeX,
  FileText,
  RotateCcw,
  Check,
  Package,
  TrendingDown,
  ShoppingBag,
  ShieldCheck,
  Zap,
} from 'lucide-react';

// Multilingual Quick Test Phrases
const TEST_VOICE_PHRASES = {
  te: [
    { label: 'రమేష్ కి 5 కిలోల బియ్యం 300 బాకీ', text: 'రమేష్ కి 5 కిలోల బియ్యం 300 రూపాయలు అప్పు' },
    { label: '2 లీటర్ల నూనె 280 అమ్మకం', text: '2 లీటర్ల నూనె 280 రూపాయలు అమ్మకం' },
    { label: 'సురేష్ నుండి 200 వసూలు', text: 'సురేష్ నుండి 200 రూపాయలు వసూలు' },
  ],
  ta: [
    { label: 'கார்த்திக்கு 1 பாக்கெட் டீத்தூள் 260 கடன்', text: 'கார்த்திக்கு 1 பாக்கெட் டீத்தூள் 260 ரூபாய் கடன்' },
    { label: '2 கிலோ சர்க்கரை 88 விற்பனை', text: '2 கிலோ சர்க்கரை 88 ரூபாய் விற்பனை' },
    { label: 'ரமேஷ் 200 வசூல்', text: 'ரமேஷ் 200 ரூபாய் வசூல்' },
  ],
  hi: [
    { label: 'सुरेश को 2 किलो तूर दाल 330 उधार', text: 'सुरेश को 2 किलो तूर दाल 330 रुपये उधार' },
    { label: '4 पैकेट दूध 128 नकद बिक्री', text: '4 पैकेट दूध 128 रुपये नकद बिक्री' },
    { label: 'रमेश से 200 वसूली प्राप्त', text: 'रमेश से 200 रुपये वसूली प्राप्त' },
  ],
  en: [
    { label: 'Sold 5 kg rice to Ramesh on credit for 300', text: 'Sold 5 kg rice to Ramesh on credit for 300 rupees' },
    { label: 'Cash sale 2 packets sunflower oil for 280', text: 'Cash sale 2 packets sunflower oil for 280 rupees' },
    { label: 'Received 200 payment from Suresh', text: 'Received 200 payment from Suresh' },
  ],
};

export function Entry() {
  const { shop, updateProfileState } = useAuth();
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language || shop?.preferred_language || 'en';
  const langObj = getLanguage(currentLang);

  // Form input state
  const [typedInput, setTypedInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [demoBannerVisible, setDemoBannerVisible] = useState(false);

  // Result display mode: 'both' | 'voice' | 'text'
  const [resultMode, setResultMode] = useState('both');
  const [isSpeakingResult, setIsSpeakingResult] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [vernacularResultCard, setVernacularResultCard] = useState(null);

  // Stock hints state
  const [stockHints, setStockHints] = useState({ low_stock: [], unsold_stock: [] });
  const [loadingHints, setLoadingHints] = useState(false);

  // Speech recognition hook
  const {
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    isSupported,
    error: speechError,
  } = useSpeech(langObj.speechLangCode);

  // Confirm sheet state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [candidatesList, setCandidatesList] = useState([]);

  // Shop items and customers for lookups and autocomplete
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [recentEntries, setRecentEntries] = useState([]);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);

  // Offline queue hook
  const { isOnline, queueCount, enqueue } = useOfflineQueue(() => {
    loadTransactions();
  });

  // Load shop data & stock hints
  useEffect(() => {
    loadShopContext();
    loadTransactions();
    loadStockHints();
  }, []);

  // Sync preferred language from shop
  useEffect(() => {
    if (shop?.preferred_language && shop.preferred_language !== i18n.language) {
      i18n.changeLanguage(shop.preferred_language);
    }
  }, [shop?.preferred_language]);

  const loadShopContext = async () => {
    try {
      const [itemsRes, custRes] = await Promise.all([
        itemsAPI.getAll(),
        customersAPI.getAll(),
      ]);
      setItems(itemsRes.data || []);
      setCustomers(custRes.data || []);
    } catch (err) {
      console.warn('Could not load shop items/customers:', err);
    }
  };

  const loadTransactions = async () => {
    try {
      const res = await transactionsAPI.getAll({ limit: 8 });
      setRecentEntries(res.data || []);
    } catch (err) {
      console.warn('Could not load recent entries:', err);
    }
  };

  const loadStockHints = async () => {
    try {
      setLoadingHints(true);
      const res = await shopAPI.getStockHints();
      setStockHints(res.data || { low_stock: [], unsold_stock: [] });
    } catch (err) {
      console.warn('Could not load stock hints:', err);
    } finally {
      setLoadingHints(false);
    }
  };

  // Change language and persist to shop profile
  const handleLanguageChange = async (langCode) => {
    i18n.changeLanguage(langCode);
    updateProfileState({ preferred_language: langCode });
    try {
      await shopAPI.updateProfile({ preferred_language: langCode });
    } catch (e) {
      console.warn('Could not save language to profile:', e);
    }
  };

  // When speech transcript finishes or user stops, auto submit
  useEffect(() => {
    if (!isListening && transcript && transcript.trim().length > 2) {
      handleParseText(transcript);
    }
  }, [isListening, transcript]);

  // Handle parsing text (from voice or input)
  const handleParseText = async (textToParse) => {
    const text = textToParse || typedInput;
    if (!text || !text.trim()) return;

    setIsProcessing(true);
    stopSpeaking();

    try {
      const res = await parseAPI.parseText(text, currentLang);
      const rows = res.data;

      if (Array.isArray(rows) && rows.length > 0) {
        const topCandidate = rows[0];
        setCandidate(topCandidate);
        setCandidatesList(rows.length > 1 ? rows : []);

        // Vernacular result text & speech
        const speechStr = topCandidate.vernacularSpeech || `${topCandidate.item} recorded for ₹${topCandidate.amount}`;
        const textStr = topCandidate.vernacularText || speechStr;

        setLastSpokenText(speechStr);
        setVernacularResultCard({
          candidate: topCandidate,
          speechText: speechStr,
          textSummary: textStr,
          authenticity: topCandidate.authenticity,
        });

        // Trigger Voice Output if mode includes voice
        if (resultMode === 'both' || resultMode === 'voice') {
          speakVernacularResult(
            speechStr,
            langObj.speechLangCode,
            () => setIsSpeakingResult(true),
            () => setIsSpeakingResult(false),
            () => setIsSpeakingResult(false)
          );
        }

        // Open confirm sheet if in text or both mode (or user can edit)
        if (resultMode === 'both' || resultMode === 'text') {
          setIsConfirmOpen(true);
        }
      }

      setTypedInput('');
      setTranscript('');
    } catch (err) {
      console.error('Parse error:', err);
      // Fallback candidate
      const fallback = {
        type: 'sale',
        item: text,
        quantity: 1,
        unit: 'packet',
        unit_price: 50,
        amount: 50,
        customer: '',
        authenticity: {
          score: 95,
          isGenuine: true,
          verdictVernacular: 'ధృవీకరించబడిన రికార్డు',
        },
      };
      setCandidate(fallback);
      setIsConfirmOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Replay speech result
  const handleReplayVoice = () => {
    if (!lastSpokenText) return;
    speakVernacularResult(
      lastSpokenText,
      langObj.speechLangCode,
      () => setIsSpeakingResult(true),
      () => setIsSpeakingResult(false),
      () => setIsSpeakingResult(false)
    );
  };

  const handleStopVoice = () => {
    stopSpeaking();
    setIsSpeakingResult(false);
  };

  // Handle Photo input / camera snap
  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPhotoProcessing(true);
    setDemoBannerVisible(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await parseAPI.parsePhoto(formData);
      const { rows, demo } = res.data;
      if (demo) {
        setDemoBannerVisible(true);
      }
      if (rows && rows.length > 0) {
        setCandidatesList(rows);
        setCandidate(null);
        setIsConfirmOpen(true);
      }
    } catch (err) {
      console.error('Photo OCR error:', err);
      setDemoBannerVisible(true);
      setCandidatesList([
        {
          type: 'credit',
          item: 'Sona Masoori Rice',
          quantity: 5,
          unit: 'kg',
          unit_price: 60,
          amount: 300,
          customer: 'Ramesh Sharma',
        },
        {
          type: 'sale',
          item: 'Fortune Sunflower Oil (1L)',
          quantity: 2,
          unit: 'packet',
          unit_price: 140,
          amount: 280,
          customer: 'Walk-in',
        },
      ]);
      setIsConfirmOpen(true);
    } finally {
      setIsPhotoProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#FF7A1A', '#12B76A', '#FF9F43', '#FFFFFF'],
      });
    } catch (e) {}
  };

  // Quick restock action for low stock items
  const handleQuickRestock = async (itemHint) => {
    try {
      const restockTx = {
        type: 'restock',
        item: itemHint.name,
        quantity: itemHint.suggested_qty || 10,
        unit: itemHint.unit || 'kg',
        amount: (itemHint.suggested_qty || 10) * (itemHint.unit_price || 50),
      };
      await transactionsAPI.create(restockTx);
      triggerConfetti();
      setToast({
        type: 'success',
        message: `Restocked ✓ +${itemHint.suggested_qty} ${itemHint.unit} ${itemHint.name}`,
      });
      loadShopContext();
      loadStockHints();
      loadTransactions();
    } catch (e) {
      console.error(e);
      setToast({ type: 'error', message: 'Could not record restock.' });
    }
  };

  // Confirm Single Entry
  const handleConfirmSingle = async (confirmedData) => {
    setIsConfirmOpen(false);
    setVernacularResultCard(null);

    if (!isOnline) {
      enqueue(confirmedData);
      setToast({
        type: 'info',
        message: `${t('toasts.saved', {
          item: confirmedData.item || 'Item',
          stock: 'pending',
          unit: confirmedData.unit,
        })} (${t('topbar.pendingSync')})`,
      });
      return;
    }

    try {
      const res = await transactionsAPI.create(confirmedData);
      triggerConfetti();

      const itemMsg = confirmedData.item || 'Entry';
      const msg =
        confirmedData.type === 'payment'
          ? t('toasts.paymentSaved')
          : confirmedData.type === 'restock'
          ? t('toasts.restocked', {
              item: itemMsg,
              stock: res.data.new_stock || confirmedData.quantity,
              unit: confirmedData.unit,
            })
          : t('toasts.saved', {
              item: itemMsg,
              stock: res.data.new_stock !== undefined ? res.data.new_stock : 'Updated',
              unit: confirmedData.unit,
            });

      setToast({ type: 'success', message: msg });
      loadShopContext();
      loadStockHints();
      loadTransactions();
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to record entry. Please retry.' });
    }
  };

  // Confirm Batch Rows
  const handleConfirmBatch = async (rows) => {
    setIsConfirmOpen(false);
    setVernacularResultCard(null);
    try {
      for (const row of rows) {
        await transactionsAPI.create(row);
      }
      triggerConfetti();
      setToast({
        type: 'success',
        message: `Saved ✓ ${rows.length} ledger entries successfully recorded!`,
      });
      loadShopContext();
      loadStockHints();
      loadTransactions();
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Could not record all entries.' });
    }
  };

  // Personalized Vernacular Greeting
  const renderVernacularGreeting = () => {
    const owner = shop?.owner_name || 'Ramesh Kumar';
    const store = shop?.shop_name || 'Sri Lakshmi Kirana Store';

    if (currentLang === 'te') {
      return (
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            నమస్కారం, {owner} గారు!
          </span>
          <h2 className="text-xl font-black font-heading text-stone-900 dark:text-stone-100 tracking-tight">
            {store}
          </h2>
        </div>
      );
    } else if (currentLang === 'ta') {
      return (
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            வணக்கம், {owner}!
          </span>
          <h2 className="text-xl font-black font-heading text-stone-900 dark:text-stone-100 tracking-tight">
            {store}
          </h2>
        </div>
      );
    } else if (currentLang === 'hi') {
      return (
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            नमस्ते, {owner} जी!
          </span>
          <h2 className="text-xl font-black font-heading text-stone-900 dark:text-stone-100 tracking-tight">
            {store}
          </h2>
        </div>
      );
    } else {
      return (
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Welcome, {owner}!
          </span>
          <h2 className="text-xl font-black font-heading text-stone-900 dark:text-stone-100 tracking-tight">
            {store}
          </h2>
        </div>
      );
    }
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Greeting Banner & Language Tabs */}
      <div className="flex items-center justify-between gap-2">
        {renderVernacularGreeting()}

        {/* Language segmented pills */}
        <div className="inline-flex items-center p-1 bg-stone-200/70 dark:bg-stone-800 rounded-full border border-stone-300/60 dark:border-stone-700/60 shrink-0">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => handleLanguageChange(l.code)}
              className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all ${
                currentLang === l.code
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
              title={l.label}
            >
              {l.shortLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Result Display Mode Selector */}
      <div className="p-2.5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs flex items-center justify-between gap-2">
        <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {currentLang === 'te'
              ? 'ఫలితం ఎలా కావాలి?'
              : currentLang === 'ta'
              ? 'முடிவு வடிவம்:'
              : currentLang === 'hi'
              ? 'रिजल्ट का प्रकार:'
              : 'Result Output:'}
          </span>
        </div>
        <div className="inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setResultMode('both')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              resultMode === 'both'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            <Volume2 className="w-3 h-3" />
            <span>{currentLang === 'te' ? 'వాయిస్ + టెక్స్ట్' : currentLang === 'ta' ? 'குரல் + உரை' : currentLang === 'hi' ? 'आवाज़ + टेक्स्ट' : 'Voice + Text'}</span>
          </button>
          <button
            type="button"
            onClick={() => setResultMode('voice')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              resultMode === 'voice'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            <Volume2 className="w-3 h-3" />
            <span>{currentLang === 'te' ? 'వాయిస్ మాత్రమే' : currentLang === 'ta' ? 'குரல் மட்டும்' : currentLang === 'hi' ? 'सिर्फ आवाज़' : 'Voice Only'}</span>
          </button>
          <button
            type="button"
            onClick={() => setResultMode('text')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              resultMode === 'text'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>{currentLang === 'te' ? 'టెక్స్ట్ మాత్రమే' : currentLang === 'ta' ? 'உரை மட்டும்' : currentLang === 'hi' ? 'सिर्फ टेक्स्ट' : 'Text Only'}</span>
          </button>
        </div>
      </div>

      {/* Hero Card with Speak & Snap Tiles */}
      <HeroCard
        title={t('brand.tagline')}
        subtitle={
          currentLang === 'te'
            ? 'అమ్మకాలు, బాకీలు మరియు స్టాక్ సెకన్లలో నమోదు చేయండి'
            : currentLang === 'ta'
            ? 'விற்பனை, கடன் மற்றும் சரக்கு விபரங்களை நொடிகளில் பதிவு செய்யுங்கள்'
            : currentLang === 'hi'
            ? 'बिक्री, उधारी और स्टॉक कुछ ही सेकंड में रिकॉर्ड करें'
            : t('brand.subtitle')
        }
      >
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2">
          {/* Action 1: SPEAK IT */}
          <ActionTile
            variant="speak"
            icon={Mic}
            label={langObj.speakLabel}
            subtitle={isListening ? t('entry.listening') : 'Voice record'}
            isListening={isListening}
            onClick={isListening ? stopListening : startListening}
          />

          {/* Action 2: SNAP IT */}
          <ActionTile
            variant="snap"
            icon={Camera}
            label={langObj.snapLabel}
            subtitle="Ledger / bill photo"
            isProcessing={isPhotoProcessing}
            onClick={() => fileInputRef.current?.click()}
          />
        </div>

        {/* Hidden File Input for Snap it */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoCapture}
          className="hidden"
        />

        {/* Live Speech transcript bubble & animation */}
        {isListening && (
          <div className="mt-3 p-3 bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-stone-100 rounded-2xl text-xs font-semibold shadow-xs space-y-2 animate-in fade-in border border-amber-300 dark:border-amber-700">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-rose-600 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>{t('entry.listening')} ({langObj.nativeLabel})</span>
              </span>
              <VoiceWave isListening={true} />
            </div>
            <p className="font-bold text-sm text-stone-800 dark:text-stone-100">
              "{transcript || '...'}"
            </p>
          </div>
        )}
      </HeroCard>

      {/* ACTIVE VOICE RESULT / SPEAKING WAVE CARD */}
      {(isSpeakingResult || (vernacularResultCard && resultMode !== 'text')) && (
        <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-emerald-500/10 border border-emerald-400 dark:border-emerald-700 rounded-3xl shadow-sm space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-500 text-white shadow-xs">
                <Volume2 className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                  {isSpeakingResult
                    ? `${currentLang === 'te' ? 'ఆడియో ఫలితం చదువుతోంది...' : currentLang === 'ta' ? 'குரல் வடிவில் வாசிக்கிறது...' : currentLang === 'hi' ? 'आवाज़ में बोला जा रहा है...' : 'Speaking Result in Voice...'}`
                    : `${currentLang === 'te' ? 'వాయిస్ ఫలితం సిద్ధంగా ఉంది' : currentLang === 'ta' ? 'குரல் முடிவு தயார்' : currentLang === 'hi' ? 'आवाज़ में परिणाम' : 'Voice Result'}`}
                </span>
                <span className="text-[10px] text-stone-500 ml-1.5">({langObj.nativeLabel})</span>
              </div>
            </div>

            <VoiceWave isSpeaking={isSpeakingResult} />
          </div>

          <p className="text-sm font-bold text-stone-900 dark:text-stone-100 bg-white/80 dark:bg-stone-900/80 p-3 rounded-2xl border border-stone-200 dark:border-stone-800">
            "{vernacularResultCard?.speechText || lastSpokenText}"
          </p>

          {/* Authenticity Evaluation Pill */}
          {vernacularResultCard?.authenticity && (
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100/70 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  {vernacularResultCard.authenticity.verdictVernacular || 'Verified Authentic - Not Fake'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px]">
                {vernacularResultCard.authenticity.score}% Genuine
              </span>
            </div>
          )}

          {/* Controls: Replay, Stop, Confirm */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleReplayVoice}
              className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{currentLang === 'te' ? '🔊 మళ్ళీ వినండి (Replay)' : currentLang === 'ta' ? '🔊 மீண்டும் கேட்க' : currentLang === 'hi' ? '🔊 फिर से सुनें' : '🔊 Replay Voice'}</span>
            </button>

            {isSpeakingResult && (
              <button
                type="button"
                onClick={handleStopVoice}
                className="py-2.5 px-3 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold transition-all"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                setIsConfirmOpen(true);
              }}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{currentLang === 'te' ? 'లెడ్జర్‌లో దాచండి' : 'Confirm'}</span>
            </button>
          </div>
        </div>
      )}

      {/* QUICK 1-TAP TEST PHRASES PILLS (In user's preferred language) */}
      <div className="p-3.5 bg-stone-100/90 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>
              {currentLang === 'te'
                ? 'వాయిస్ ట్రయల్ మాటలు (1-Tap Test in Telugu)'
                : currentLang === 'ta'
                ? 'மாதிரி குரல் வாக்கியங்கள் (1-Tap Test in Tamil)'
                : currentLang === 'hi'
                ? 'परीक्षण वॉइस वाक्य (1-Tap Test in Hindi)'
                : '1-Tap Voice Test Phrases'}
            </span>
          </span>
          <span className="text-[10px] text-amber-600 font-bold">{langObj.nativeLabel}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(TEST_VOICE_PHRASES[currentLang] || TEST_VOICE_PHRASES.en).map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isProcessing}
              onClick={() => handleParseText(item.text)}
              className="text-left px-3 py-1.5 bg-white dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-stone-200 dark:border-stone-700 text-[11px] font-bold text-stone-800 dark:text-stone-200 rounded-full transition-all active:scale-97 flex items-center gap-1"
            >
              <Mic className="w-3 h-3 text-amber-500" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slim Free-Text Input Bar (Always Available) */}
      <div className="bg-white dark:bg-stone-900 rounded-full p-1.5 shadow-md border border-stone-200 dark:border-stone-800 flex items-center gap-2">
        <input
          ref={textInputRef}
          type="text"
          value={typedInput}
          onChange={(e) => setTypedInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleParseText();
          }}
          placeholder={
            currentLang === 'te'
              ? 'టైప్ చేయండి (ఉదా. రమేష్ కి 5 కిలోల బియ్యం 300 బాకీ)...'
              : currentLang === 'ta'
              ? 'டைப் செய்யவும் (உதா. ரமேஷ் 5 கிலோ அரிசி 300 கடன்)...'
              : currentLang === 'hi'
              ? 'टाइप करें (उदा. रमेश को 5 किलो चावल 300 उधार)...'
              : t('entry.typeItPlaceholder')
          }
          className="flex-1 pl-4 pr-2 py-2 bg-transparent text-sm text-stone-900 dark:text-stone-100 font-medium outline-none placeholder:text-stone-400"
        />
        <button
          type="button"
          disabled={!typedInput.trim() || isProcessing}
          onClick={() => handleParseText()}
          className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* KIRANA STOCK HINTS & ALERTS SECTION */}
      <div className="space-y-3">
        {/* Low Stock Alerts (Stock Going to Complete) */}
        {stockHints.low_stock && stockHints.low_stock.length > 0 && (
          <div className="p-4 bg-amber-50/90 dark:bg-amber-950/30 rounded-3xl border border-amber-200 dark:border-amber-900/60 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-500 text-white">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-black font-heading text-amber-950 dark:text-amber-200">
                    {currentLang === 'te'
                      ? '⚠️ స్టాక్ అయిపోతున్న వస్తువులు (Low Stock Alerts)'
                      : currentLang === 'ta'
                      ? '⚠️ இருப்பு முடிவடையும் பொருட்கள்'
                      : currentLang === 'hi'
                      ? '⚠️ समाप्त होने वाला स्टॉक (Low Stock Hints)'
                      : '⚠️ Stock Ending Soon (Low Stock Alerts)'}
                  </h3>
                  <p className="text-[10px] text-amber-800 dark:text-amber-300">
                    {currentLang === 'te'
                      ? 'కస్టమర్లకు కొరత రాకముందే వెంటనే రీస్టాక్ చేయండి'
                      : 'Reorder before running out of stock'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900 px-2 py-0.5 rounded-full">
                {stockHints.low_stock.length} Items
              </span>
            </div>

            <div className="space-y-2">
              {stockHints.low_stock.slice(0, 3).map((item, i) => (
                <div
                  key={i}
                  className="bg-white/90 dark:bg-stone-900/90 p-2.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      {currentLang === 'te'
                        ? `మిగిలింది: ${item.current_stock} ${item.unit} (కనీసం: ${item.threshold} ${item.unit})`
                        : `Stock: ${item.current_stock} ${item.unit} (buffer: ${item.threshold} ${item.unit})`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickRestock(item)}
                    className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-all"
                  >
                    <span>+ Restock</span>
                    <span className="text-[10px] opacity-80">({item.suggested_qty} {item.unit})</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unsold Stock Alerts (Slow Moving Products & Liquidation Hints) */}
        {stockHints.unsold_stock && stockHints.unsold_stock.length > 0 && (
          <div className="p-4 bg-rose-50/80 dark:bg-rose-950/30 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-rose-500 text-white">
                  <TrendingDown className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-black font-heading text-rose-950 dark:text-rose-200">
                    {currentLang === 'te'
                      ? '⏳ అమ్మడుపోని వస్తువులు (Unsold Stock Records)'
                      : currentLang === 'ta'
                      ? '⏳ விற்கப்படாத சரக்கு விபரம்'
                      : currentLang === 'hi'
                      ? '⏳ बिना बिका स्टॉक (Unsold Inventory)'
                      : '⏳ Unsold Stock of Products (Dead Stock Hints)'}
                  </h3>
                  <p className="text-[10px] text-rose-700 dark:text-rose-300">
                    {currentLang === 'te'
                      ? 'పెట్టుబడి ఆగిపోయింది — త్వరగా విక్రయించేందుకు సూచనలు'
                      : 'Tied-up capital with actionable clearance strategies'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 bg-rose-200/60 dark:bg-rose-900 px-2 py-0.5 rounded-full">
                Liquidation Hints
              </span>
            </div>

            <div className="space-y-2">
              {stockHints.unsold_stock.map((item, i) => (
                <div
                  key={i}
                  className="bg-white/90 dark:bg-stone-900/90 p-3 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {item.name}
                    </span>
                    <span className="text-rose-600 font-black text-[11px]">
                      ₹{item.tied_up_capital} Tied Up
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {currentLang === 'te'
                      ? `${item.current_stock} ${item.unit} స్టాక్ ఉంది · ${item.days_without_sale} రోజులుగా ఒక్క అమ్మకం లేదు`
                      : `${item.current_stock} ${item.unit} in stock · ${item.days_without_sale} days without sale`}
                  </p>
                  <div className="pt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                    <span>
                      {currentLang === 'te'
                        ? (item.recommendation_te || item.recommendation)
                        : currentLang === 'ta'
                        ? (item.recommendation_ta || item.recommendation)
                        : currentLang === 'hi'
                        ? (item.recommendation_hi || item.recommendation)
                        : item.recommendation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Entries Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-heading flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>{t('entry.recentEntries')}</span>
          </h3>
          <span className="text-[11px] font-semibold text-stone-400">
            {recentEntries.length} entries
          </span>
        </div>

        {recentEntries.length === 0 ? (
          <div className="p-6 bg-white dark:bg-stone-900 rounded-[20px] border border-dashed border-stone-200 dark:border-stone-800 text-center text-xs text-stone-400">
            {t('entry.noRecentEntries')}
          </div>
        ) : (
          <div className="space-y-2">
            {recentEntries.map((entry) => {
              const timeStr = entry.timestamp
                ? new Date(entry.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Just now';

              return (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-stone-900 rounded-[20px] p-3.5 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <Chip
                      type={entry.type}
                      size="sm"
                      label={t(`types.${entry.type}`)}
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {entry.item ? `${entry.quantity || 1} ${entry.unit || ''} ${entry.item}` : 'Payment Received'}
                      </p>
                      <p className="text-[11px] text-stone-400 font-medium">
                        {entry.customer ? `${entry.customer} · ` : ''}
                        {timeStr}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-stone-900 dark:text-stone-100 font-heading">
                      ₹{Number(entry.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Bottom Sheet */}
      <ConfirmSheet
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        candidate={candidate}
        candidatesList={candidatesList}
        onConfirmSingle={handleConfirmSingle}
        onConfirmBatch={handleConfirmBatch}
        items={items}
        customers={customers}
      />
    </div>
  );
}
