// frontend/src/translations.ts

export type Language = 'en' | 'ta' | 'hi';

export interface TranslationSet {
  title: string;
  heroTitle: string;
  heroSub: string;
  placeholder: string;
  orUpload: string;
  examples: string;
  ctaButton: string;
  home: string;
  admin: string;
  predictions: string;
  features: string;
  howItWorks: string;
  benefits: string;
  testimonials: string;
  faq: string;
  footerRights: string;
  
  // Loading screen
  loadingTitle: string;
  loadingStep1: string;
  loadingStep2: string;
  loadingStep3: string;
  loadingStep4: string;

  // Results screen
  resultTitle: string;
  suitabilityScore: string;
  confidence: string;
  suitabilityReasoning: string;
  growingTips: string;
  weatherComp: string;
  soilComp: string;
  expectedYield: string;
  farmingAdvice: string;
  btnDownloadPdf: string;
  btnSavePrediction: string;
  btnPredictAgain: string;
  savingPrediction: string;
  savedSuccess: string;

  // Reasoning matches
  nitrogenMatch: string;
  tempMatch: string;
  rainMatch: string;
  soilMatch: string;

  // Feature cards
  featTitle: string;
  featSub: string;
  feat1Title: string;
  feat1Desc: string;
  feat2Title: string;
  feat2Desc: string;
  feat3Title: string;
  feat3Desc: string;
  feat4Title: string;
  feat4Desc: string;
  feat5Title: string;
  feat5Desc: string;
  feat6Title: string;
  feat6Desc: string;

  // Admin Dashboard
  adminLoginTitle: string;
  adminEmail: string;
  adminPassword: string;
  adminLoginBtn: string;
  adminLogoutBtn: string;
  adminBackBtn: string;
  adminWelcome: string;
  metricPredictions: string;
  metricUsers: string;
  metricRecords: string;
  metricAccuracy: string;
  cropDistribution: string;
  predictionTrends: string;
  modelPerformance: string;
  userActivity: string;
  uploadDatasetTitle: string;
  dragDropCsv: string;
  btnUpload: string;
  trainingTitle: string;
  trainModelBtn: string;
  modelStatus: string;
  modelRunning: string;
  modelIdle: string;
  trainSuccess: string;
}

export const translations: Record<Language, TranslationSet> = {
  en: {
    title: "SmartCrop AI",
    heroTitle: "Smart Crop Recommendations Powered by AI",
    heroSub: "Get the best crop recommendation based on soil nutrients and weather conditions.",
    placeholder: "Describe your soil and weather conditions or upload a report...",
    orUpload: "Drop PDF, CSV or Image here to analyze automatically",
    examples: "Examples: N=90 P=42 K=43 Temperature=20 Humidity=82 pH=6.5 Rainfall=203",
    ctaButton: "Analyze Farm",
    home: "Home",
    admin: "Admin Dashboard",
    predictions: "History",
    features: "Features",
    howItWorks: "How It Works",
    benefits: "Benefits",
    testimonials: "Testimonials",
    faq: "FAQ",
    footerRights: "© 2026 SmartCrop AI. All rights reserved.",
    
    loadingTitle: "AI Agronomist Analysing...",
    loadingStep1: "Analyzing Soil Nutrients (Nitrogen, Phosphorus, Potassium)",
    loadingStep2: "Processing Climate Conditions (Temp, Humidity, Rainfall)",
    loadingStep3: "Comparing with Trained Random Forest Dataset",
    loadingStep4: "Generating Smart Recommendation Report",

    resultTitle: "Recommendation Result",
    suitabilityScore: "Suitability Score",
    confidence: "Confidence",
    suitabilityReasoning: "Suitability Reasoning",
    growingTips: "Growing Tips",
    weatherComp: "Weather Compatibility",
    soilComp: "Soil Compatibility",
    expectedYield: "Expected Yield",
    farmingAdvice: "Farming Advice",
    btnDownloadPdf: "Download PDF Report",
    btnSavePrediction: "Save Prediction",
    btnPredictAgain: "Predict Again",
    savingPrediction: "Saving...",
    savedSuccess: "Prediction saved successfully!",

    nitrogenMatch: "Nitrogen Level Matches",
    tempMatch: "Temperature is Optimal",
    rainMatch: "Rainfall Level Matches",
    soilMatch: "Soil pH is Compatible",

    featTitle: "Engineered for High-Yield Precision",
    featSub: "Empowering growers with automated analysis and data-driven intelligence.",
    feat1Title: "AI Crop Recommendation",
    feat1Desc: "Instantly identify the perfect crop choice for your farm's unique profile.",
    feat2Title: "Soil Analysis",
    feat2Desc: "Check Nitrogen, Phosphorus, and Potassium levels to optimize health.",
    feat3Title: "Climate Analysis",
    feat3Desc: "Match local humidity, rainfall, and temperature variables.",
    feat4Title: "Smart Predictions",
    feat4Desc: "Random Forest Classifier trained for 99% accuracy.",
    feat5Title: "Data-Driven Farming",
    feat5Desc: "Transition from guesswork to statistical yield maximization.",
    feat6Title: "Better Yield Planning",
    feat6Desc: "Predict crop volumes per hectare before you plant a single seed.",

    adminLoginTitle: "Secure Administrator Access",
    adminEmail: "Admin Email",
    adminPassword: "Password",
    adminLoginBtn: "Sign In as Admin",
    adminLogoutBtn: "Logout",
    adminBackBtn: "Back to Home",
    adminWelcome: "Admin Control Center",
    metricPredictions: "Total Predictions",
    metricUsers: "Total Users",
    metricRecords: "Dataset Records",
    metricAccuracy: "Model Accuracy",
    cropDistribution: "Crop Distribution",
    predictionTrends: "Prediction Trends",
    modelPerformance: "Model Training Performance",
    userActivity: "Platform User Activity",
    uploadDatasetTitle: "Upload New Agricultural Dataset",
    dragDropCsv: "Drag and drop CSV files here to update crop models",
    btnUpload: "Upload CSV",
    trainingTitle: "Random Forest Model Training",
    trainModelBtn: "Retrain Classifier Model",
    modelStatus: "Training System Status",
    modelRunning: "Model Training in Progress...",
    modelIdle: "Ready to Train",
    trainSuccess: "Model trained successfully! New version active."
  },
  ta: {
    title: "ஸ்மார்ட்கிராப் AI",
    heroTitle: "செயற்கை நுண்ணறிவு மூலம் ஸ்மார்ட் பயிர் பரிந்துரைகள்",
    heroSub: "மண் சத்துக்கள் மற்றும் வானிலை நிலவரங்களின் அடிப்படையில் சிறந்த பயிர் பரிந்துரையைப் பெறுங்கள்.",
    placeholder: "உங்கள் மண் மற்றும் வானிலை நிலவரங்களை விவரிக்கவும் அல்லது அறிக்கையை பதிவேற்றவும்...",
    orUpload: "தானாக பகுப்பாய்வு செய்ய PDF, CSV அல்லது படத்தை இங்கே பதிவேற்றவும்",
    examples: "உதாரணங்கள்: N=90 P=42 K=43 வெப்பநிலை=20 ஈரப்பதம்=82 pH=6.5 மழைப்பொழிவு=203",
    ctaButton: "பண்ணையை பகுப்பாய்வு செய்க",
    home: "முகப்பு",
    admin: "நிர்வாகி பகுதி",
    predictions: "வரலாறு",
    features: "அம்சங்கள்",
    howItWorks: "செயல்படும் முறை",
    benefits: "நன்மைகள்",
    testimonials: "மதிப்புரைகள்",
    faq: "கேள்வி-பதில்",
    footerRights: "© 2026 ஸ்மார்ட்கிராப் AI. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
    
    loadingTitle: "AI பயிர் நிபுணர் பகுப்பாய்வு செய்கிறார்...",
    loadingStep1: "மண் சத்துக்களை பகுப்பாய்வு செய்தல் (நைட்ரஜன், பாஸ்பரஸ், பொட்டாசியம்)",
    loadingStep2: "வானிலை நிலவரங்களை செயலாக்குதல் (வெப்பம், ஈரப்பதம், மழை)",
    loadingStep3: "பயிற்சி அளிக்கப்பட்ட ரேண்டம் ஃபாரஸ்ட் தரவுகளுடன் ஒப்பிடுதல்",
    loadingStep4: "பயிர் பரிந்துரை அறிக்கையை உருவாக்குதல்",

    resultTitle: "பரிந்துரைக்கப்பட்ட பயிர் முடிவு",
    suitabilityScore: "பொருத்தமான மதிப்பெண்",
    confidence: "நம்பகத்தன்மை",
    suitabilityReasoning: "பொருத்தத்திற்கான காரணங்கள்",
    growingTips: "வளரும் குறிப்புகள்",
    weatherComp: "வானிலை இணக்கம்",
    soilComp: "மண் இணக்கம்",
    expectedYield: "எதிர்பார்க்கப்படும் மகசூல்",
    farmingAdvice: "விவசாய ஆலோசனை",
    btnDownloadPdf: "PDF அறிக்கையைப் பதிவிறக்குக",
    btnSavePrediction: "முடிவைச் சேமிக்கவும்",
    btnPredictAgain: "மீண்டும் கணிக்கவும்",
    savingPrediction: "சேமிக்கப்படுகிறது...",
    savedSuccess: "பரிந்துரை வெற்றிகரமாக சேமிக்கப்பட்டது!",

    nitrogenMatch: "நைட்ரஜன் அளவு சரியாக உள்ளது",
    tempMatch: "வெப்பநிலை உகந்ததாக உள்ளது",
    rainMatch: "மழைப்பொழிவு அளவு பொருந்துகிறது",
    soilMatch: "மண்ணின் pH இணக்கமாக உள்ளது",

    featTitle: "அதிக மகசூல் துல்லியத்திற்காக வடிவமைக்கப்பட்டது",
    featSub: "தானியங்கி பகுப்பாய்வு மற்றும் தரவு சார்ந்த நுண்ணறிவு மூலம் விவசாயிகளுக்கு அதிகாரம் அளித்தல்.",
    feat1Title: "AI பயிர் பரிந்துரை",
    feat1Desc: "உங்கள் பண்ணையின் தனித்துவமான மண்ணிற்கு சரியான பயிர் தேர்வை உடனடியாகக் கண்டறியவும்.",
    feat2Title: "மண் பகுப்பாய்வு",
    feat2Desc: "மண் ஆரோக்கியத்தை மேம்படுத்த நைட்ரஜன், பாஸ்பரஸ் மற்றும் பொட்டாசியம் அளவை சரிபார்க்கவும்.",
    feat3Title: "காலநிலை பகுப்பாய்வு",
    feat3Desc: "உள்ளூர் ஈரப்பதம், மழை மற்றும் வெப்பநிலை மாறிகளை துல்லியமாக பொருத்தவும்.",
    feat4Title: "ஸ்மார்ட் கணிப்புகள்",
    feat4Desc: "99% துல்லியத்திற்காக பயிற்சி அளிக்கப்பட்ட கணிப்பான் மாதிரி.",
    feat5Title: "தரவு சார்ந்த விவசாயம்",
    feat5Desc: "ஊக விவசாயத்திலிருந்து விலகி புள்ளிவிவர மகசூல் அதிகரிப்புக்கு மாறவும்.",
    feat6Title: "சிறந்த மகசூல் திட்டமிடல்",
    feat6Desc: "விதையை நடுவதற்கு முன்பே ஒரு ஹெக்டேருக்கான பயிர் உற்பத்தியை கணிக்கவும்.",

    adminLoginTitle: "பாதுகாப்பான நிர்வாகி அணுகல்",
    adminEmail: "நிர்வாகி மின்னஞ்சல்",
    adminPassword: "கடவுச்சொல்",
    adminLoginBtn: "நிர்வாகியாக உள்நுழையவும்",
    adminLogoutBtn: "வெளியேறு",
    adminBackBtn: "முகப்புப் பக்கத்திற்கு",
    adminWelcome: "நிர்வாகக் கட்டுப்பாட்டு மையம்",
    metricPredictions: "மொத்த கணிப்புகள்",
    metricUsers: "மொத்த பயனர்கள்",
    metricRecords: "தரவு பதிவுகள்",
    metricAccuracy: "மாதிரி துல்லியம்",
    cropDistribution: "பயிர்களின் விநியோகம்",
    predictionTrends: "கணிப்புகளின் போக்கு",
    modelPerformance: "மாதிரி பயிற்சி செயல்திறன்",
    userActivity: "பயனர் செயல்பாடு",
    uploadDatasetTitle: "புதிய விவசாய தரவுத்தொகுப்பை பதிவேற்றுக",
    dragDropCsv: "மாதிரிகளைப் புதுப்பிக்க CSV கோப்புகளை இங்கே இழுத்துப் போடவும்",
    btnUpload: "CSV பதிவேற்றுக",
    trainingTitle: "ரேண்டம் ஃபாரஸ்ட் மாதிரி பயிற்சி",
    trainModelBtn: "மாதிரியை மீண்டும் பயிற்றுவிக்கவும்",
    modelStatus: "பயிற்சி அமைப்பின் நிலை",
    modelRunning: "மாதிரி பயிற்சி பெறுகிறது...",
    modelIdle: "பயிற்றுவிக்க தயாராக உள்ளது",
    trainSuccess: "மாதிரி வெற்றிகரமாக பயிற்றுவிக்கப்பட்டது! புதிய பதிப்பு செயல்பாட்டில் உள்ளது."
  },
  hi: {
    title: "स्मार्टक्रॉप AI",
    heroTitle: "AI द्वारा संचालित स्मार्ट फसल सिफारिशें",
    heroSub: "मिट्टी के पोषक तत्वों और मौसम की स्थिति के आधार पर सर्वोत्तम फसल की सिफारिश प्राप्त करें।",
    placeholder: "अपनी मिट्टी और मौसम की स्थिति का वर्णन करें या एक रिपोर्ट अपलोड करें...",
    orUpload: "स्वचालित विश्लेषण के लिए PDF, CSV या छवि यहां अपलोड करें",
    examples: "उदाहरण: N=90 P=42 K=43 तापमान=20 आर्द्रता=82 pH=6.5 वर्षा=203",
    ctaButton: "खेत का विश्लेषण करें",
    home: "होम",
    admin: "एडमिन पैनल",
    predictions: "इतिहास",
    features: "विशेषताएं",
    howItWorks: "यह कैसे काम करता है",
    benefits: "लाभ",
    testimonials: "समीक्षाएं",
    faq: "अक्सर पूछे जाने वाले प्रश्न",
    footerRights: "© 2026 स्मार्टक्रॉप AI. सर्वाधिकार सुरक्षित।",
    
    loadingTitle: "AI कृषि वैज्ञानिक विश्लेषण कर रहा है...",
    loadingStep1: "मिट्टी के पोषक तत्वों का विश्लेषण (नाइट्रोजन, फास्फोरस, पोटेशियम)",
    loadingStep2: "जलवायु परिस्थितियों का प्रसंस्करण (तापमान, आर्द्रता, वर्षा)",
    loadingStep3: "प्रशिक्षित रैंडम फॉरेस्ट डेटासेट के साथ तुलना",
    loadingStep4: "स्मार्ट फसल सिफारिश रिपोर्ट तैयार करना",

    resultTitle: "सिफारिश की गई फसल",
    suitabilityScore: "उपयुक्तता स्कोर",
    confidence: "सटीकता दर",
    suitabilityReasoning: "उपयुक्तता का कारण",
    growingTips: "फसल उगाने के टिप्स",
    weatherComp: "मौसम अनुकूलता",
    soilComp: "मिट्टी अनुकूलता",
    expectedYield: "अनुमानित उपज",
    farmingAdvice: "कृषि सलाह",
    btnDownloadPdf: "PDF रिपोर्ट डाउनलोड करें",
    btnSavePrediction: "परिणाम सहेजें",
    btnPredictAgain: "पुनः अनुमान लगाएं",
    savingPrediction: "सहेजा जा रहा है...",
    savedSuccess: "अनुमान सफलतापूर्वक सहेज लिया गया है!",

    nitrogenMatch: "नाइट्रोजन स्तर उपयुक्त है",
    tempMatch: "तापमान इष्टतम है",
    rainMatch: "वर्षा का स्तर अनुकूल है",
    soilMatch: "मिट्टी का pH अनुकूल है",

    featTitle: "उच्च उपज परिशुद्धता के लिए निर्मित",
    featSub: "स्वचालित विश्लेषण और डेटा-संचालित बुद्धिमत्ता के साथ किसानों को सशक्त बनाना।",
    feat1Title: "AI फसल सिफारिश",
    feat1Desc: "अपने खेत की मिट्टी के प्रोफाइल के लिए तुरंत सही फसल की पहचान करें।",
    feat2Title: "मिट्टी का विश्लेषण",
    feat2Desc: "स्वास्थ्य को अनुकूलित करने के लिए नाइट्रोजन, फास्फोरस और पोटेशियम स्तर की जांच करें।",
    feat3Title: "जलवायु विश्लेषण",
    feat3Desc: "स्थानीय आर्द्रता, वर्षा और तापमान चर को सटीक रूप से मिलाएं।",
    feat4Title: "स्मार्ट भविष्यवाणियां",
    feat4Desc: "99% सटीकता के लिए प्रशिक्षित रैंडम फॉरेस्ट मॉडल।",
    feat5Title: "डेटा-संचालित खेती",
    feat5Desc: "अनुमानित खेती से हटकर सांख्यिकीय उपज अधिकतमकरण पर जाएं।",
    feat6Title: "बेहतर उपज योजना",
    feat6Desc: "बीज बोने से पहले ही प्रति हेक्टेयर फसल उत्पादन का अनुमान लगाएं।",

    adminLoginTitle: "सुरक्षित एडमिन पहुंच",
    adminEmail: "एडमिन ईमेल",
    adminPassword: "पासवर्ड",
    adminLoginBtn: "एडमिन के रूप में साइन इन करें",
    adminLogoutBtn: "लॉगआउट",
    adminBackBtn: "होम पेज पर जाएं",
    adminWelcome: "एडमिन नियंत्रण केंद्र",
    metricPredictions: "कुल भविष्यवाणियां",
    metricUsers: "कुल उपयोगकर्ता",
    metricRecords: "डेटासेट रिकॉर्ड्स",
    metricAccuracy: "मॉडल सटीकता",
    cropDistribution: "फसलों का वितरण",
    predictionTrends: "भविष्यवाणियों का रुझान",
    modelPerformance: "मॉडल प्रशिक्षण प्रदर्शन",
    userActivity: "उपयोगकर्ता गतिविधि",
    uploadDatasetTitle: "नया कृषि डेटासेट अपलोड करें",
    dragDropCsv: "मॉडल अपडेट करने के लिए CSV फाइलें यहां खींचें और छोड़ें",
    btnUpload: "CSV अपलोड करें",
    trainingTitle: "रैंडम फॉरेस्ट मॉडल प्रशिक्षण",
    trainModelBtn: "मॉडल को पुनः प्रशिक्षित करें",
    modelStatus: "प्रशिक्षण प्रणाली की स्थिति",
    modelRunning: "मॉडल का प्रशिक्षण चल रहा है...",
    modelIdle: "प्रशिक्षण के लिए तैयार",
    trainSuccess: "मॉडल सफलतापूर्वक प्रशिक्षित! नया संस्करण सक्रिय है।"
  }
};
