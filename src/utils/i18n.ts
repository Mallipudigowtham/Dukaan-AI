import { LanguageCode, TransactionType, AuthenticityEvaluation } from '../types';

export const UI_STRINGS: Record<LanguageCode, Record<string, string>> = {
  en: {
    appTitle: 'DukaanAI',
    appSubtitle: 'Smart Kirana Ledger & Stock Assistant',
    loginTitle: 'Shopkeeper Login & Setup',
    loginSubtitle: 'Enter your shop details to personalize your vernacular voice & photo assistant',
    loginNameLabel: 'Shopkeeper / Owner Name',
    loginNamePlaceholder: 'e.g. Ramesh Chandra / Gowtham',
    phoneLabel: 'Phone Number',
    phonePlaceholder: '+91 98765 43210',
    storeNameLabel: 'Kirana Store Name',
    storeNamePlaceholder: 'e.g. Sri Balaji Kirana & General Stores',
    preferredLangLabel: 'Preferred Operational Language',
    loginBtn: 'Enter My Dukaan',
    quickFillDemo: 'Fill Sample Kirana Store Details',
    welcomeBack: 'Welcome back',
    smartAssistantFor: 'Digital ledger & inventory assistant for',
    tabEntry: 'Record Entry',
    tabCredit: 'Credit Book (Udhaar)',
    tabStock: 'Stock & Inventory',
    tabRecords: 'Digital Records & Insights',
    speakIt: 'Speak it',
    snapIt: 'Snap it',
    typeIt: 'Quick Type',
    listening: 'Listening... Speak now',
    pressToSpeak: 'Tap microphone to speak',
    uploadPhoto: 'Upload or snap ledger page / bill',
    evaluateBeforeSaving: 'AI Fraud & Sanity Audit before saving',
    saveToLedger: 'Confirm & Save to Ledger',
    editTransaction: 'Edit Details',
    discard: 'Discard Entry',
    verifiedBadge: 'Verified Authentic',
    cautionBadge: 'Caution: Anomaly Flagged',
    fakeBadge: 'High Risk Fake / Tampered',
    lowStockAlerts: 'Low Stock Alerts',
    unsoldStockAlerts: 'Unsold & Dead Stock',
    reorderHint: 'Reorder Hint',
    tiedUpCapital: 'Tied-up Capital',
    whatsappReminder: 'Send WhatsApp Reminder',
    smsReminder: 'Send SMS',
    totalSales: 'Today Sales',
    pendingUdhaar: 'Total Pending Udhaar',
    inventoryHealth: 'Inventory Health',
    searchRecords: 'Search customer, item, notes...',
    filterType: 'Filter Type',
    allTypes: 'All Types',
    voiceResultTitle: 'Voice Feedback Result',
    listenVoice: 'Listen Voice Output',
    voiceOutputEnabled: 'Voice Audio Feedback Enabled',
    voiceOutputDisabled: 'Voice Audio Feedback Muted',
    replayVoice: 'Replay Voice Result',
    audioSpeaking: 'Speaking out result...',
    switchProfile: 'Switch Store / Log Out',
  },
  te: {
    appTitle: 'దుకాణ్ AI',
    appSubtitle: 'కిరాణా దుకాణం డిజిటల్ లెడ్జర్ & స్టాక్ అసిస్టెంట్',
    loginTitle: 'దుకాణదారుని లాగిన్ & వివరాలు',
    loginSubtitle: 'మీ ప్రాంతీయ భాషా వాయిస్ మరియు ఫోటో లెడ్జర్ కోసం దుకాణ వివరాలను నమోదు చేయండి',
    loginNameLabel: 'దుకాణ యజమాని పేరు',
    loginNamePlaceholder: 'ఉదా: రమేష్ చంద్ర / గౌతమ్',
    phoneLabel: 'మొబైల్ నంబర్',
    phonePlaceholder: '+91 98765 43210',
    storeNameLabel: 'కిరాణా దుకాణం పేరు',
    storeNamePlaceholder: 'ఉదా: శ్రీ బాలాజీ కిరాణా & జనరల్ స్టోర్స్',
    preferredLangLabel: 'మీ ప్రాధాన్యత భాష (Preferred Language)',
    loginBtn: 'దుకాణంలోకి ప్రవేశించండి',
    quickFillDemo: 'నమూనా కిరాణా వివరాలు పూరించండి',
    welcomeBack: 'స్వాగతం',
    smartAssistantFor: 'డిజిటల్ లెడ్జర్ మరియు స్టాక్ అసిస్టెంట్',
    tabEntry: 'ఎంట్రీ నమోదు',
    tabCredit: 'అప్పుల లెక్క (ఉధార్)',
    tabStock: 'సరుకుల నిల్వ (స్టాక్)',
    tabRecords: 'డిజిటల్ రికార్డులు & రిపోర్టులు',
    speakIt: 'నోటితో చెప్పండి (Speak it)',
    snapIt: 'ఫోటో తీయండి (Snap it)',
    typeIt: 'టైప్ చేయండి',
    listening: 'వింటున్నాము... మాట్లాడండి',
    pressToSpeak: 'మైక్రోఫోన్ నొక్కి మాట్లాడండి',
    uploadPhoto: 'ఖాతా పుస్తకం లేదా బిల్లు ఫోటో తీయండి',
    evaluateBeforeSaving: 'రికార్డు చేసే ముందు ఏఐ ప్రామాణికత తనిఖీ',
    saveToLedger: 'ధృవీకరించి ఖాతాలో రాయండి',
    editTransaction: 'వివరాలు సవరించండి',
    discard: 'రద్దు చేయండి',
    verifiedBadge: 'సరైన రికార్డు (ధృవీకరించబడింది)',
    cautionBadge: 'హెచ్చరిక: తేడా గమనించబడింది',
    fakeBadge: 'నకిలీ / మార్చబడిన అనుమానం',
    lowStockAlerts: 'స్టాక్ అయిపోతున్న సరుకులు',
    unsoldStockAlerts: 'అమ్ముడుపోని సరుకులు (డెడ్ స్టాక్)',
    reorderHint: 'తిరిగి ఆర్డర్ చేయాల్సిన సలహా',
    tiedUpCapital: 'ఆగిపోయిన పెట్టుబడి',
    whatsappReminder: 'వాట్సాప్ రిమైండర్ పంపండి',
    smsReminder: 'SMS పంపండి',
    totalSales: 'నేటి అమ్మకాలు',
    pendingUdhaar: 'రావాల్సిన అప్పులు',
    inventoryHealth: 'స్టాక్ పరిస్థితి',
    searchRecords: 'కస్టమర్ లేదా సరుకు వెతకండి...',
    filterType: 'రకం ఎంచుకోండి',
    allTypes: 'అన్ని రకాలు',
    voiceResultTitle: 'వాయిస్ సమాధాన ఫలితం (Voice Result)',
    listenVoice: 'వాయిస్ ఫలితం వినండి',
    voiceOutputEnabled: 'వాయిస్ ఆడియో ఫీడ్‌బ్యాక్ ఆన్ చేయబడింది',
    voiceOutputDisabled: 'వాయిస్ ఆడియో మ్యూట్ చేయబడింది',
    replayVoice: 'మళ్లీ వినండి',
    audioSpeaking: 'వాయిస్ చదువుతోంది...',
    switchProfile: 'దుకాణం మార్చండి / లాగ్ అవుట్',
  },
  ta: {
    appTitle: 'துகான் AI',
    appSubtitle: 'கிராணா கடை டிஜிட்டல் கணக்கு மற்றும் இருப்பு',
    loginTitle: 'கடைக்காரர் உள்நுழைவு & அமைப்பு',
    loginSubtitle: 'உங்கள் குரல் மற்றும் பட கணக்கு உதவியாளரை பயன்படுத்த கடை விவரங்களை உள்ளிடவும்',
    loginNameLabel: 'கடை உரிமையாளர் பெயர்',
    loginNamePlaceholder: 'எ.கா: ரமேஷ் சந்திரா / கௌதம்',
    phoneLabel: 'தொலைபேசி எண்',
    phonePlaceholder: '+91 98765 43210',
    storeNameLabel: 'மளிகை கடை பெயர்',
    storeNamePlaceholder: 'எ.கா: ஸ்ரீ பாலாஜி கிராணா ஸ்டோர்ஸ்',
    preferredLangLabel: 'விருப்பமான மொழி (Preferred Language)',
    loginBtn: 'கடைக்குள் நுழையவும்',
    quickFillDemo: 'மாதிரி கடை விவரங்களை நிரப்பவும்',
    welcomeBack: 'வணக்கம்',
    smartAssistantFor: 'டிஜிட்டல் கணக்கு மற்றும் சரக்கு உதவியாளர்',
    tabEntry: 'பதிவு செய்க',
    tabCredit: 'கடன் புத்தகம் (உதார்)',
    tabStock: 'பொருள் இருப்பு (ஸ்டாக்)',
    tabRecords: 'டிஜிட்டல் ஆவணங்கள்',
    speakIt: 'பேசி பதிவு செய் (Speak it)',
    snapIt: 'படம் பிடி (Snap it)',
    typeIt: 'தட்டச்சு செய்',
    listening: 'கேட்கிறது... பேசுங்கள்',
    pressToSpeak: 'மைக் தட்டி பேசுங்கள்',
    uploadPhoto: 'கணக்கு நோட்டு அல்லது பில் படம் பதிவேற்றவும்',
    evaluateBeforeSaving: 'சேமிக்கும் முன் ஏஐ உண்மைத்தன்மை சோதனை',
    saveToLedger: 'உறுதிசெய்து சேமிக்கவும்',
    editTransaction: 'திருத்தவும்',
    discard: 'ரத்து செய்',
    verifiedBadge: 'உண்மையான பதிவு (சரிபார்க்கப்பட்டது)',
    cautionBadge: 'எச்சரிக்கை: சந்தேகம் உள்ளது',
    fakeBadge: 'போலி அல்லது திருத்தப்பட்ட ஆபத்து',
    lowStockAlerts: 'தீர்ந்துபோகும் இருப்பு எச்சரிக்கை',
    unsoldStockAlerts: 'விற்பனையாகாத சரக்குகள்',
    reorderHint: 'மறுஆர்டர் குறிப்பு',
    tiedUpCapital: 'முடங்கிய முதலீடு',
    whatsappReminder: 'வாட்ஸ்அப் நினைவூட்டல்',
    smsReminder: 'SMS அனுப்பவும்',
    totalSales: 'இன்றைய விற்பனை',
    pendingUdhaar: 'வரவேண்டிய கடன் பாக்கி',
    inventoryHealth: 'சரக்கு நலம்',
    searchRecords: 'தேடவும்...',
    filterType: 'வகை',
    allTypes: 'அனைத்து வகைகள்',
    voiceResultTitle: 'குரல் முடிவு (Voice Result)',
    listenVoice: 'குரல் பதிலை கேட்கவும்',
    voiceOutputEnabled: 'குரல் பதில் இயக்கப்பட்டது',
    voiceOutputDisabled: 'குரல் பதில் முடக்கப்பட்டது',
    replayVoice: 'மீண்டும் கேட்கவும்',
    audioSpeaking: 'குரல் பேசுகிறது...',
    switchProfile: 'கடை மாற்று / வெளியேறு',
  },
  hi: {
    appTitle: 'दुकान AI',
    appSubtitle: 'स्मार्ट किराना बहीखाता एवं स्टॉक सहायक',
    loginTitle: 'दुकानदार लॉगिन एवं सेटअप',
    loginSubtitle: 'अपने वॉयस एवं फोटो बहीखाता सहायक को सक्रिय करने हेतु दुकान का विवरण दर्ज करें',
    loginNameLabel: 'दुकानदार / मालिक का नाम',
    loginNamePlaceholder: 'उदा. रमेश चंद्र / गौतम',
    phoneLabel: 'मोबाइल नंबर',
    phonePlaceholder: '+91 98765 43210',
    storeNameLabel: 'किराना दुकान का नाम',
    storeNamePlaceholder: 'उदा. श्री बालाजी किराना एवं जनरल स्टोर्स',
    preferredLangLabel: 'पसंदीदा कामकाजी भाषा (Preferred Language)',
    loginBtn: 'दुकान में प्रवेश करें',
    quickFillDemo: 'नमूना किराना दुकान विवरण भरें',
    welcomeBack: 'स्वागत है',
    smartAssistantFor: 'डिजिटल बहीखाता एवं स्टॉक सहायक',
    tabEntry: 'एंट्री दर्ज करें',
    tabCredit: 'उधार खाता (क्रेडिट बुक)',
    tabStock: 'स्टॉक व माल इन्वेंटरी',
    tabRecords: 'डिजिटल रिकॉर्ड्स व रिपोर्ट',
    speakIt: 'बोलकर दर्ज करें (Speak it)',
    snapIt: 'फोटो खींचें (Snap it)',
    typeIt: 'टाइप करें',
    listening: 'सुन रहे हैं... बोलिए',
    pressToSpeak: 'माइक दबाकर बोलें',
    uploadPhoto: 'बहीखाता या बिल की फोटो अपलोड करें',
    evaluateBeforeSaving: 'रिकॉर्ड करने से पहले AI फर्जी/सत्यता जांच',
    saveToLedger: 'पुष्टि करें और खाते में जोड़ें',
    editTransaction: 'विवरण संपादित करें',
    discard: 'रद्द करें',
    verifiedBadge: 'सत्यापित असली रिकॉर्ड',
    cautionBadge: 'सावधानी: विसंगति पाई गई',
    fakeBadge: 'फर्जी / छेड़छाड़ की आशंका',
    lowStockAlerts: 'खत्म होने वाला स्टॉक अलर्ट',
    unsoldStockAlerts: 'ना बिका हुआ स्टॉक (डेड स्टॉक)',
    reorderHint: 'पुनः ऑर्डर सुझाव',
    tiedUpCapital: 'फंसा हुआ धन',
    whatsappReminder: 'व्हाट्सएप तकादा भेजें',
    smsReminder: 'SMS भेजें',
    totalSales: 'आज की कुल बिक्री',
    pendingUdhaar: 'कुल बकाया उधारी',
    inventoryHealth: 'स्टॉक स्थिति',
    searchRecords: 'ग्राहक या सामान खोजें...',
    filterType: 'प्रकार चुनें',
    allTypes: 'सभी प्रकार',
    voiceResultTitle: 'ध्वनि परिणाम (Voice Result)',
    listenVoice: 'ध्वनि उत्तर सुनें',
    voiceOutputEnabled: 'ध्वनि उत्तर चालू है',
    voiceOutputDisabled: 'ध्वनि उत्तर बंद है',
    replayVoice: 'पुनः सुनें',
    audioSpeaking: 'ध्वनि उत्तर बोल रहा है...',
    switchProfile: 'दुकान बदलें / लॉग आउट',
  },
};

export function getWhatsAppReminderMessage(
  customerName: string,
  amount: number,
  language: LanguageCode,
  shopName: string = 'Sri Balaji Kirana Store'
): string {
  switch (language) {
    case 'te':
      return `నమస్కారం ${customerName} గారు, ${shopName} లో మీ బాకీ మొత్తం ₹${amount.toLocaleString('en-IN')}. వీలైనప్పుడు చెల్లించగలరు. ధన్యవాదాలు! - ${shopName}`;
    case 'ta':
      return `வணக்கம் ${customerName} அவர்களே, ${shopName} கடையில் உங்கள் நிலுவைத் தொகை ₹${amount.toLocaleString('en-IN')}. வசதியான நேரத்தில் செலுத்தவும். நன்றி! - ${shopName}`;
    case 'hi':
      return `नमस्ते ${customerName} जी, ${shopName} पर आपकी कुल बकाया राशि ₹${amount.toLocaleString('en-IN')} है। कृपया सुविधानुसार भुगतान करने का कष्ट करें। धन्यवाद! - ${shopName}`;
    case 'en':
    default:
      return `Namaste ${customerName} ji, your pending udhaar balance at ${shopName} is ₹${amount.toLocaleString('en-IN')}. Please clear when convenient. Thank you! - ${shopName}`;
  }
}

/**
 * Generates spoken and textual response in the preferred language
 * after speaking or parsing an entry
 */
export function generateVoiceFeedback(
  candidate: {
    type: TransactionType;
    item: string;
    quantity: number;
    unit: string;
    amount: number;
    customer: string;
    evaluation: AuthenticityEvaluation;
  },
  language: LanguageCode
): { spokenText: string; displayText: string } {
  const isVerified = candidate.evaluation.verdict === 'VERIFIED';

  switch (language) {
    case 'te': {
      let typeText = 'నగదు అమ్మకం';
      if (candidate.type === 'credit') typeText = 'అప్పు (ఉధార్)';
      if (candidate.type === 'payment') typeText = 'వసూలు చెల్లింపు';
      if (candidate.type === 'restock') typeText = 'కొత్త స్టాక్ కొనుగోలు';

      const authText = isVerified ? 'ఈ రికార్డు ధృవీకరించబడింది.' : 'హెచ్చరిక: ఇందులో తేడాలు గమనించబడ్డాయి.';
      const spokenText = `${candidate.customer} గారికి ${candidate.quantity} ${candidate.unit} ${candidate.item}, ${typeText}గా ₹${candidate.amount} నమోదు చేయబడింది. ${authText}`;
      const displayText = `✅ ${candidate.customer} | ${candidate.item} (${candidate.quantity} ${candidate.unit}) | ${typeText} | ₹${candidate.amount} | ${candidate.evaluation.verdict}`;
      return { spokenText, displayText };
    }
    case 'ta': {
      let typeText = 'ரொக்க விற்பனை';
      if (candidate.type === 'credit') typeText = 'கடன் (உதார்)';
      if (candidate.type === 'payment') typeText = 'கடன் வசூல்';
      if (candidate.type === 'restock') typeText = 'புதிய சரக்கு கொள்முதல்';

      const authText = isVerified ? 'இந்த பதிவு சரிபார்க்கப்பட்டது.' : 'எச்சரிக்கை: இதில் விபரம் முரண்பாடு உள்ளது.';
      const spokenText = `${candidate.customer} அவர்களுக்கு ${candidate.quantity} ${candidate.unit} ${candidate.item}, ${typeText} ஆக ₹${candidate.amount} பதிவு செய்யப்பட்டது. ${authText}`;
      const displayText = `✅ ${candidate.customer} | ${candidate.item} (${candidate.quantity} ${candidate.unit}) | ${typeText} | ₹${candidate.amount} | ${candidate.evaluation.verdict}`;
      return { spokenText, displayText };
    }
    case 'hi': {
      let typeText = 'नकद बिक्री';
      if (candidate.type === 'credit') typeText = 'उधार खाता';
      if (candidate.type === 'payment') typeText = 'उधारी वसूली';
      if (candidate.type === 'restock') typeText = 'स्टॉक माल आवक';

      const authText = isVerified ? 'रिकॉर्ड प्रामाणिक एवं सत्यापित है।' : 'सावधानी: इस रिकॉर्ड में विसंगति पाई गई है।';
      const spokenText = `${candidate.customer} के खाते में ${candidate.quantity} ${candidate.unit} ${candidate.item}, ${typeText} के रूप में ₹${candidate.amount} दर्ज किया गया है। ${authText}`;
      const displayText = `✅ ${candidate.customer} | ${candidate.item} (${candidate.quantity} ${candidate.unit}) | ${typeText} | ₹${candidate.amount} | ${candidate.evaluation.verdict}`;
      return { spokenText, displayText };
    }
    case 'en':
    default: {
      const typeText = candidate.type.toUpperCase();
      const authText = isVerified ? 'Record verified authentic.' : 'Caution: record has anomaly flags.';
      const spokenText = `Recorded ${candidate.quantity} ${candidate.unit} of ${candidate.item} as ${typeText} for ${candidate.customer} at ₹${candidate.amount}. ${authText}`;
      const displayText = `✅ ${candidate.customer} | ${candidate.item} (${candidate.quantity} ${candidate.unit}) | ${typeText} | ₹${candidate.amount} | ${candidate.evaluation.verdict}`;
      return { spokenText, displayText };
    }
  }
}

/**
 * Triggers Browser Web SpeechSynthesis in the target language
 */
export function speakVernacularText(
  text: string,
  language: LanguageCode,
  onEnd?: () => void
): void {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose appropriate locale
    switch (language) {
      case 'te':
        utterance.lang = 'te-IN';
        break;
      case 'ta':
        utterance.lang = 'ta-IN';
        break;
      case 'hi':
        utterance.lang = 'hi-IN';
        break;
      case 'en':
      default:
        utterance.lang = 'en-IN';
        break;
    }

    utterance.rate = 0.95; // Slightly slower for clear kirana auditory feedback
    utterance.pitch = 1.0;

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(utterance.lang) || v.lang.startsWith(language));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis error:', err);
    if (onEnd) onEnd();
  }
}
