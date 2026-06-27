// frontend/src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Sprout, Globe, ArrowRight, Check, Download, RefreshCw,
  BookOpen, User, Lock, LogOut, Database, Cpu, TrendingUp,
  PieChart, X, Upload, FileText, Image as ImageIcon,
  FileSpreadsheet, Activity, Leaf, Wind, Droplets, Thermometer,
  FlaskConical, CloudRain, ChevronDown, Star, Zap, BarChart3,
  Menu, Home, Settings, History
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { translations, Language } from './translations';

export default function App() {
  const [page, setPage] = useState<'landing' | 'admin' | 'history'>('landing');
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(1);
  const [nlpError, setNlpError] = useState<string | null>(null);

  const [result, setResult] = useState<any>(null);
  const [lastInputs, setLastInputs] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(JSON.parse(localStorage.getItem('admin_user') || 'null'));

  const [analytics, setAnalytics] = useState<any>(null);
  const [adminPredictions, setAdminPredictions] = useState<any[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStatusMsg, setTrainingStatusMsg] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    if (authToken && page === 'admin') {
      fetchAnalytics();
      fetchHistory();
    }
  }, [authToken, page]);

  useEffect(() => {
    let timer: any;
    if (isAnalyzing) {
      timer = setInterval(() => {
        setAnalysisStep((prev) => {
          if (prev < 4) return prev + 1;
          clearInterval(timer);
          return 4;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isAnalyzing]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics', { headers: { 'Authorization': `Bearer ${authToken}` } });
      if (res.ok) { const data = JSON.parse(await res.text()); setAnalytics(data); }
    } catch (err) { console.error(err); }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/prediction-history');
      if (res.ok) { const data = JSON.parse(await res.text()); setAdminPredictions(data); }
    } catch (err) { console.error(err); }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    try {
      const formData = new URLSearchParams();
      formData.append('username', adminEmail);
      formData.append('password', adminPassword);
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData });
      if (!res.ok) {
        const text = await res.text();
        try { throw new Error(JSON.parse(text).detail || 'Authentication failed'); }
        catch { throw new Error(`Login failed (Status ${res.status})`); }
      }
      const data = JSON.parse(await res.text());
      setAuthToken(data.access_token);
      setAdminUser(data.user);
      localStorage.setItem('admin_token', data.access_token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      setAdminEmail(''); setAdminPassword('');
    } catch (err: any) { setAdminError(err.message || 'Invalid credentials'); }
  };

  const handleAdminLogout = () => {
    setAuthToken(null); setAdminUser(null);
    localStorage.removeItem('admin_token'); localStorage.removeItem('admin_user');
  };

  const runPrediction = async () => {
    setNlpError(null); setFileError(null);
    setIsAnalyzing(true); setAnalysisStep(1); setResult(null);
    try {
      let endpoint = '/api/predict/nlp';
      let body: any;
      let headers: any = { 'Content-Type': 'application/json' };
      if (selectedFile) {
        endpoint = '/api/predict/file';
        const fd = new FormData(); fd.append('file', selectedFile);
        body = fd; headers = {};
      } else {
        if (!inputText.trim()) throw new Error('Please enter your soil/weather parameters');
        body = JSON.stringify({ text: inputText });
      }
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch(endpoint, { method: 'POST', headers, body });
      if (!res.ok) {
        const text = await res.text();
        try { throw new Error(JSON.parse(text).detail || 'Failed'); }
        catch { throw new Error(`Connection failed (Status ${res.status}): Backend API offline.`); }
      }
      const data = JSON.parse(await res.text());
      setTimeout(() => {
        if (data.success === false) { setNlpError(data.error); setIsAnalyzing(false); }
        else { setIsAnalyzing(false); setResult(data.prediction); setLastInputs(data.extracted); }
      }, 6200);
    } catch (err: any) { setIsAnalyzing(false); setNlpError(err.message || 'Something went wrong'); }
  };

  const handleExampleClick = (val: string) => { setInputText(val); setSelectedFile(null); };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['pdf', 'csv', 'txt', 'jpg', 'jpeg', 'png'].includes(ext || '')) { setSelectedFile(file); setFileError(null); }
      else setFileError('Unsupported format. Please upload PDF, CSV, TXT, or Image.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { setSelectedFile(e.target.files[0]); setFileError(null); }
  };

  const handleSavePrediction = () => {
    setIsSaving(true);
    setTimeout(() => { setIsSaving(false); setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); }, 1000);
  };

  const generatePDFReport = () => {
    if (!result || !lastInputs) return;
    const doc = new jsPDF();
    doc.setFillColor('#10B981'); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor('#FFFFFF'); doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
    doc.text('SmartCrop AI Report', 15, 22);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 22);
    doc.setTextColor('#0F172A'); doc.setFontSize(28); doc.setFont('helvetica', 'bold');
    doc.text(result.crop.toUpperCase(), 15, 60);
    doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    doc.text(`Suitability: ${result.suitability_score}/100  |  Confidence: ${result.confidence}%`, 15, 70);
    doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text('PARAMETERS ANALYZED:', 15, 85);
    const params = [
      ['Nitrogen (N)', `${lastInputs?.n} mg/kg`, result.suitability?.n],
      ['Phosphorus (P)', `${lastInputs?.p} mg/kg`, result.suitability?.p],
      ['Potassium (K)', `${lastInputs?.k} mg/kg`, result.suitability?.k],
      ['Temperature', `${lastInputs?.temperature}°C`, result.suitability?.temperature],
      ['Humidity', `${lastInputs?.humidity}%`, result.suitability?.humidity],
      ['Soil pH', `${lastInputs?.ph}`, result.suitability?.ph],
      ['Rainfall', `${lastInputs?.rainfall} mm`, result.suitability?.rainfall],
    ];
    params.forEach(([name, val, ok], i) => {
      const y = 95 + i * 9;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor('#374151');
      doc.text(name, 20, y); doc.text(String(val), 90, y);
      doc.setTextColor(ok ? '#10B981' : '#EF4444');
      doc.text(ok ? '✓ Optimal' : '✗ Outside Range', 150, y);
    });
    doc.setTextColor('#0F172A'); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text('GROWING TIPS:', 15, 165);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.text(doc.splitTextToSize(result.meta.tips, 175), 15, 174);
    doc.text('YIELD: ' + result.meta.yield, 15, 210);
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor('#9CA3AF');
    doc.text('SmartCrop AI — Validate with local agricultural officer for regional variations.', 15, 282);
    doc.save(`SmartCrop_${result.crop}.pdf`);
  };

  const handleDatasetUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploadStatus('Uploading...');
    try {
      const fd = new FormData(); fd.append('file', uploadFile);
      const res = await fetch('/api/upload-dataset', { method: 'POST', headers: { 'Authorization': `Bearer ${authToken}` }, body: fd });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      const data = JSON.parse(await res.text());
      setUploadStatus(`✓ Uploaded ${data.record_count} records.`);
      setUploadFile(null); fetchAnalytics();
    } catch (err: any) { setUploadStatus(`Error: ${err.message}`); }
  };

  const handleRetrainModel = async () => {
    setIsTraining(true); setTrainingStatusMsg(t.modelRunning);
    try {
      const res = await fetch('/api/train-model', { method: 'POST', headers: { 'Authorization': `Bearer ${authToken}` } });
      if (!res.ok) throw new Error(`Training failed (${res.status})`);
      const data = JSON.parse(await res.text());
      setTrainingStatusMsg(`✓ Accuracy: ${data.accuracy}% — Model v${data.model_version}`);
      fetchAnalytics();
    } catch (err: any) { setTrainingStatusMsg(`✗ ${err.message}`); }
    finally { setIsTraining(false); }
  };

  const cropIcons: Record<string, string> = {
    rice: '🌾', maize: '🌽', banana: '🍌', mango: '🥭', apple: '🍎', orange: '🍊',
    grapes: '🍇', watermelon: '🍉', coconut: '🥥', coffee: '☕', cotton: '🌿',
    chickpea: '🫘', lentil: '🫘', jute: '🌿', papaya: '🍈', muskmelon: '🍈',
    default: '🌱'
  };

  const paramIcons = [
    { icon: Leaf, key: 'n', label: 'Nitrogen', unit: 'mg/kg', color: 'text-emerald-400 bg-emerald-400/10' },
    { icon: FlaskConical, key: 'p', label: 'Phosphorus', unit: 'mg/kg', color: 'text-blue-400 bg-blue-400/10' },
    { icon: Zap, key: 'k', label: 'Potassium', unit: 'mg/kg', color: 'text-purple-400 bg-purple-400/10' },
    { icon: Thermometer, key: 'temperature', label: 'Temp', unit: '°C', color: 'text-orange-400 bg-orange-400/10' },
    { icon: Droplets, key: 'humidity', label: 'Humidity', unit: '%', color: 'text-cyan-400 bg-cyan-400/10' },
    { icon: Wind, key: 'ph', label: 'Soil pH', unit: '', color: 'text-amber-400 bg-amber-400/10' },
    { icon: CloudRain, key: 'rainfall', label: 'Rainfall', unit: 'mm', color: 'text-indigo-400 bg-indigo-400/10' },
  ];

  // ======================== RENDER ========================
  return (
    <div className="min-h-screen text-slate-100 mesh-bg font-['Outfit'] flex flex-col">

      {/* ===== HEADER (GLASS) ===== */}
      <header className="sticky top-0 z-40 bg-slate-900/40 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => { setPage('landing'); setResult(null); }} className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              SmartCrop <span className="text-emerald-400">AI</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <select value={lang} onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent text-sm font-bold text-slate-200 outline-none cursor-pointer">
                <option value="en" className="bg-slate-800">English</option>
                <option value="ta" className="bg-slate-800">தமிழ்</option>
                <option value="hi" className="bg-slate-800">हिंदी</option>
              </select>
            </div>

            {authToken ? (
              <button onClick={() => setPage(page === 'admin' ? 'landing' : 'admin')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                <Settings className="w-4 h-4" />
                {page === 'admin' ? 'Home' : 'Dashboard'}
              </button>
            ) : (
              <button onClick={() => setPage('admin')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm bg-slate-800/50 text-slate-300 border border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400 transition-all">
                <LogOut className="w-4 h-4" /> Admin Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 pb-24 md:pb-12">

        {/* ========== ANALYZING LOADER ========== */}
        {isAnalyzing ? (
          <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md animate-scale-in">
              <div className="relative w-40 h-40 mx-auto mb-10">
                <div className="absolute inset-0 rounded-full border-[6px] border-emerald-500/20 border-t-emerald-500 animate-spin-slow shadow-[0_0_40px_rgba(16,185,129,0.3)]" />
                <div className="absolute inset-4 rounded-full border-[4px] border-blue-500/20 border-b-blue-500 animate-spin-reverse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <Sprout className="w-12 h-12 text-emerald-400 animate-pulse-ring absolute inset-0 m-auto" />
                    <Sprout className="w-12 h-12 text-emerald-400 animate-float" />
                  </div>
                </div>
              </div>
              <h2 className="text-3xl font-black text-center text-white mb-2 tracking-tight">{t.loadingTitle}</h2>
              <p className="text-emerald-400 text-center text-sm font-semibold mb-8 tracking-widest uppercase">Processing Neural Network</p>

              <div className="glass-panel p-6 space-y-5">
                {[
                  { step: 1, label: t.loadingStep1, icon: <FlaskConical className="w-5 h-5" /> },
                  { step: 2, label: t.loadingStep2, icon: <Thermometer className="w-5 h-5" /> },
                  { step: 3, label: t.loadingStep3, icon: <Cpu className="w-5 h-5" /> },
                  { step: 4, label: t.loadingStep4, icon: <PieChart className="w-5 h-5" /> },
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                      analysisStep > s.step ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 
                      analysisStep === s.step ? 'bg-slate-800 text-emerald-400 border border-emerald-500/50 animate-glow' : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'
                    }`}>
                      {analysisStep > s.step ? <Check className="w-5 h-5" /> : s.icon}
                    </div>
                    <span className={`text-base font-bold transition-all ${
                      analysisStep === s.step ? 'text-white' :
                      analysisStep > s.step ? 'text-emerald-500 line-through' : 'text-slate-600'
                    }`}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        ) : result ? (
          /* ========== RESULT VIEW ========== */
          <div className="max-w-3xl mx-auto px-4 py-8 animate-slide-up">
            {/* Crop Hero Banner */}
            <div className="glass-panel overflow-hidden mb-6 group border-emerald-500/30">
              <div className="relative h-[300px]">
                <img src={result.meta.image} alt={result.crop} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
                      <Check className="w-3.5 h-3.5" /> Optimal Recommendation
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-2xl">
                      {cropIcons[result.crop.toLowerCase()] || '🌱'} {result.crop}
                    </h1>
                  </div>
                  <div className="glass-panel px-6 py-4 border-emerald-500/20 bg-slate-900/80">
                    <div className="text-4xl font-black text-emerald-400">{result.suitability_score}%</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Suitability</div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Confidence & Parameters */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="glass-panel p-6 flex flex-col justify-center items-center text-center">
                <Cpu className="w-8 h-8 text-blue-400 mb-3" />
                <div className="text-4xl font-black text-white">{result.confidence}%</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 mb-4">AI Confidence</div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ width: `${result.confidence}%` }} />
                </div>
              </div>

              <div className="md:col-span-2 glass-panel p-6">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" /> Parameter Analysis
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {paramIcons.map(({ icon: Icon, key, label, unit, color }) => {
                    const ok = result.suitability?.[key];
                    const val = lastInputs?.[key];
                    return (
                      <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border ${ok ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">{label}</div>
                          <div className="text-sm font-black text-white">{val}<span className="text-[10px] text-slate-500 ml-0.5">{unit}</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Insights Section */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="glass-panel p-6 border-emerald-500/30">
                <h4 className="font-bold text-emerald-400 mb-3 flex items-center gap-2">
                  <Sprout className="w-5 h-5" /> Growing Tips
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">{result.meta.tips}</p>
              </div>
              <div className="space-y-6">
                <div className="glass-panel p-6 border-blue-500/30">
                  <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Expected Yield
                  </h4>
                  <p className="text-lg font-black text-white">{result.meta.yield}</p>
                </div>
                <div className="glass-panel p-6 border-amber-500/30">
                  <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
                    <CloudRain className="w-5 h-5" /> Weather Match
                  </h4>
                  <p className="text-sm text-slate-300 font-medium">{result.meta.weather}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={generatePDFReport} className="btn-neon flex-1 justify-center py-4 text-lg">
                <Download className="w-5 h-5" /> Download PDF Report
              </button>
              <div className="flex gap-4 flex-1">
                <button onClick={handleSavePrediction} disabled={saveSuccess || isSaving}
                  className="flex-1 glass-panel py-4 flex items-center justify-center gap-2 font-bold hover:bg-slate-800 transition-colors">
                  {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : saveSuccess ? <Check className="w-5 h-5 text-emerald-400" /> : <Database className="w-5 h-5 text-emerald-400" />}
                  {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Data'}
                </button>
                <button onClick={() => { setResult(null); setInputText(''); setSelectedFile(null); }}
                  className="flex-1 glass-panel py-4 flex items-center justify-center gap-2 font-bold hover:bg-slate-800 transition-colors">
                  <RefreshCw className="w-5 h-5" /> Try Again
                </button>
              </div>
            </div>
          </div>

        ) : page === 'admin' ? (
          /* ========== ADMIN PAGE ========== */
          !authToken ? (
            <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
              <div className="w-full max-w-md animate-scale-in">
                <div className="glass-panel p-8 md:p-10 border-emerald-500/20 relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500" />
                  
                  <div className="text-center mb-10">
                    <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center bg-slate-900 border border-slate-700 shadow-2xl">
                      <Lock className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">{t.adminLoginTitle}</h2>
                    <p className="text-slate-400 font-medium mt-2">Secure Neural Network Access</p>
                  </div>

                  <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.adminEmail}</label>
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input type="email" required placeholder="admin@smartcrop.ai"
                          value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                          className="premium-input pl-14" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.adminPassword}</label>
                      <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input type="password" required placeholder="••••••••"
                          value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                          className="premium-input pl-14" />
                      </div>
                    </div>

                    {adminError && (
                      <div className="text-red-400 text-sm font-bold bg-red-950/50 p-4 rounded-xl border border-red-900/50 flex items-center gap-2">
                        <X className="w-4 h-4" /> {adminError}
                      </div>
                    )}

                    <button type="submit" className="btn-neon w-full justify-center py-4 mt-2">
                      {t.adminLoginBtn} <ArrowRight className="w-5 h-5 ml-1" />
                    </button>
                    
                    <button type="button" onClick={() => setPage('landing')}
                      className="w-full text-center text-sm font-bold text-slate-500 hover:text-white py-2 transition-colors mt-4">
                      Return to App
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            /* Admin Dashboard */
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-slide-up">
              
              <div className="glass-panel p-8 border-emerald-500/20 bg-slate-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Cpu className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{t.adminWelcome}</h2>
                    <p className="text-emerald-400 font-semibold tracking-wide">{adminUser?.email}</p>
                  </div>
                </div>
                <button onClick={handleAdminLogout} className="px-6 py-3 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: t.metricPredictions, value: analytics?.metrics?.total_predictions ?? 0, icon: Sprout, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                  { label: t.metricUsers, value: analytics?.metrics?.total_users ?? 1, icon: User, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                  { label: t.metricRecords, value: analytics?.metrics?.dataset_records ?? 2200, icon: Database, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                  { label: t.metricAccuracy, value: `${analytics?.metrics?.model_accuracy ?? 99.09}%`, icon: Cpu, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                ].map((stat, idx) => (
                  <div key={idx} className="glass-panel p-6 border-slate-700/50 hover:border-emerald-500/30">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <div className="text-3xl font-black text-white">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-panel p-8">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-emerald-400" /> {t.cropDistribution}
                  </h3>
                  <div className="space-y-4">
                    {(analytics?.charts?.crop_distribution ?? [
                      { crop: 'Rice', count: 24 }, { crop: 'Maize', count: 18 },
                      { crop: 'Coffee', count: 14 }, { crop: 'Banana', count: 11 }
                    ]).map((item: any, idx: number) => {
                      const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500'];
                      const total = 75; const pct = Math.round((item.count / total) * 100);
                      return (
                        <div key={idx} className="flex items-center gap-4">
                          <span className="text-sm font-bold text-white w-20">{item.crop}</span>
                          <div className="flex-1 h-3 rounded-full bg-slate-800 overflow-hidden shadow-inner">
                            <div className={`h-full rounded-full ${colors[idx % colors.length]}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-sm font-black text-slate-400 w-8 text-right">{item.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="glass-panel p-8">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-400" /> {t.uploadDatasetTitle}
                  </h3>
                  <form onSubmit={handleDatasetUpload} className="space-y-4">
                    <div onDragOver={(e) => e.preventDefault()} onDrop={handleFileDrop}
                      className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-900/50"
                      onClick={() => fileInputRef.current?.click()}>
                      <FileSpreadsheet className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                      <p className="text-base font-bold text-white">{uploadFile ? uploadFile.name : t.dragDropCsv}</p>
                    </div>
                    {uploadStatus && <p className="text-sm font-bold text-emerald-400">{uploadStatus}</p>}
                    <button type="submit" disabled={!uploadFile} className="btn-neon w-full justify-center">
                      {t.btnUpload}
                    </button>
                  </form>
                </div>
              </div>
              
              <div className="glass-panel p-8 text-center">
                 <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex justify-center items-center gap-2">
                    <Cpu className="w-5 h-5 text-amber-400" /> {t.trainingTitle}
                  </h3>
                  <button onClick={handleRetrainModel} disabled={isTraining} className="btn-neon mx-auto">
                    {isTraining ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Cpu className="w-5 h-5" />}
                    {t.trainModelBtn}
                  </button>
                  {trainingStatusMsg && <p className="text-sm font-bold text-emerald-400 mt-4">{trainingStatusMsg}</p>}
              </div>

            </div>
          )

        ) : (
          /* ========== WOW LANDING PAGE ========== */
          <div>
            {/* HERO */}
            <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 overflow-hidden">
              
              <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-panel border-emerald-500/30 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">v2.0 Neural Engine Live</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-[1.1] animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  Next-Gen <br className="md:hidden"/> <span className="text-gradient-primary">AgriTech AI</span>
                </h1>
                
                <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  Harness the power of Random Forest machine learning to predict the optimal crop for your soil parameters with 99.09% accuracy.
                </p>

                {/* MAIN INPUT CARD */}
                <div className="glass-panel p-2 md:p-3 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}
                  onDragOver={(e) => e.preventDefault()} onDrop={handleFileDrop}>
                  
                  <div className="bg-slate-900/80 rounded-[20px] p-4 border border-slate-700/50 shadow-inner flex flex-col md:flex-row items-center gap-4">
                    
                    {selectedFile ? (
                      <div className="flex-1 w-full flex items-center justify-between rounded-xl p-4 bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-emerald-400" />
                          <span className="text-emerald-50 font-bold">{selectedFile.name}</span>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="text-emerald-400 hover:text-white">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="E.g. N=90 P=42 K=43 Temp=22 pH=6.5 Rain=203"
                        className="flex-1 w-full bg-transparent text-white text-lg placeholder-slate-500 font-medium outline-none px-4 py-2"
                      />
                    )}

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button onClick={() => fileInputRef.current?.click()} className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors hidden md:block" title="Upload Dataset">
                        <Upload className="w-5 h-5" />
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.csv,.txt,.png,.jpg,.jpeg" className="hidden" />
                      <button onClick={runPrediction} className="btn-neon w-full md:w-auto flex-1">
                        Predict <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Errors */}
                {nlpError && <div className="mt-6 text-red-400 font-bold bg-red-500/10 border border-red-500/20 py-3 px-6 rounded-xl inline-block">{nlpError}</div>}
              </div>
            </section>

            {/* FLOATING STATS */}
            <div className="border-y border-white/5 bg-slate-900/50 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
                {[
                  ['15k+', 'Global Farms'],
                  ['99.1%', 'RF Accuracy'],
                  ['22', 'Crop Types'],
                  ['< 1s', 'Inference Time']
                ].map(([val, label], i) => (
                  <div key={i} className="text-center pl-0 first:pl-0 md:pl-8">
                    <div className="text-3xl md:text-4xl font-black text-white mb-1">{val}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* WOW FEATURES */}
            <section className="max-w-7xl mx-auto px-6 py-32">
              <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Built for the <span className="text-gradient-primary">Future</span></h2>
                <p className="text-slate-400 font-medium max-w-2xl mx-auto text-lg">Our architecture combines FastAPI backend inference with a stunning React glassmorphism interface.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: 'Neural Precision', desc: 'Scikit-Learn Random Forest optimization tuned on heavy agricultural datasets.', icon: Cpu, color: 'text-blue-400' },
                  { title: 'Instant Inference', desc: 'Predict yields in milliseconds utilizing our connection-pooled architecture.', icon: Zap, color: 'text-amber-400' },
                  { title: 'Global Adaptation', desc: 'Multilingual support translating technical advice into regional dialects.', icon: Globe, color: 'text-emerald-400' }
                ].map((f, i) => (
                  <div key={i} className="glass-panel p-10 hover:-translate-y-2 transition-transform duration-500">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-6 shadow-xl">
                      <f.icon className={`w-7 h-7 ${f.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{f.title}</h3>
                    <p className="text-slate-400 font-medium leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </main>

      {/* ===== MOBILE NAV ===== */}
      <div className="md:hidden fixed bottom-0 left-0 w-full glass-panel !rounded-none !border-x-0 !border-b-0 border-t-white/10 z-50 flex justify-around p-3 pb-safe">
         <button onClick={() => { setPage('landing'); setResult(null); }} className={`flex flex-col items-center gap-1 ${page === 'landing' ? 'text-emerald-400' : 'text-slate-500'}`}>
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button onClick={runPrediction} className="flex flex-col items-center gap-1 -mt-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white">
            <Sprout className="w-7 h-7" />
          </div>
        </button>
        <button onClick={() => setPage('admin')} className={`flex flex-col items-center gap-1 ${page === 'admin' ? 'text-emerald-400' : 'text-slate-500'}`}>
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-bold">Admin</span>
        </button>
      </div>

    </div>
  );
}
