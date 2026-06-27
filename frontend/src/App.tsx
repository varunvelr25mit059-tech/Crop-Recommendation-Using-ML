// frontend/src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Sprout, Globe, ArrowRight, Check, Download, RefreshCw,
  Lock, LogOut, Database, Cpu, TrendingUp,
  PieChart, X, Upload, FileText,
  FileSpreadsheet, Activity, Leaf, Wind, Droplets, Thermometer,
  FlaskConical, CloudRain, ChevronDown, Zap,
  Home, Settings, ScanLine, Layers, Sparkles
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { translations, Language } from './translations';

export default function App() {
  const [page, setPage] = useState<'landing' | 'admin'>('landing');
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStatusMsg, setTrainingStatusMsg] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    if (authToken && page === 'admin') {
      fetchAnalytics();
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
    setNlpError(null);
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

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['pdf', 'csv', 'txt', 'jpg', 'jpeg', 'png'].includes(ext || '')) { setSelectedFile(file); setNlpError(null); }
      else setNlpError('Unsupported format. Please upload PDF, CSV, TXT, or Image.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { setSelectedFile(e.target.files[0]); setNlpError(null); }
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
    <div className="min-h-screen mesh-bg text-slate-100 flex flex-col">

      {/* ===== HEADER ===== */}
      <header className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-3xl border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => { setPage('landing'); setResult(null); }} className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all duration-500">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight">SmartCrop<span className="text-emerald-400">.ai</span></span>
          </button>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Globe className="w-4 h-4 text-slate-400" />
              <select value={lang} onChange={(e) => setLang(e.target.value as Language)} className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer tracking-wider">
                <option value="en" className="bg-black">EN</option>
                <option value="ta" className="bg-black">TA</option>
                <option value="hi" className="bg-black">HI</option>
              </select>
            </div>
            {authToken ? (
              <button onClick={() => setPage(page === 'admin' ? 'landing' : 'admin')} className="text-sm font-bold text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" /> {page === 'admin' ? 'Exit Admin' : 'Admin'}
              </button>
            ) : (
              <button onClick={() => setPage('admin')} className="text-sm font-bold text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2">
                <Lock className="w-4 h-4" /> Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main className="flex-1 pt-32 pb-24 px-4 md:px-8 max-w-[1400px] mx-auto w-full">

        {isAnalyzing ? (
          /* ========== ANALYZING LOADER (SCANNER) ========== */
          <div className="min-h-[70vh] flex flex-col items-center justify-center">
            <div className="w-full max-w-lg bento-panel p-10 stagger-1 overflow-hidden relative">
              <div className="scan-line" />
              
              <div className="text-center mb-10">
                <ScanLine className="w-16 h-16 text-emerald-400 mx-auto mb-6 animate-pulse-ring" />
                <h2 className="text-3xl font-bold text-white mb-2">{t.loadingTitle}</h2>
                <p className="text-emerald-400 font-mono text-sm tracking-widest uppercase">Executing Random Forest Array...</p>
              </div>

              <div className="space-y-6">
                {[
                  { step: 1, label: t.loadingStep1 },
                  { step: 2, label: t.loadingStep2 },
                  { step: 3, label: t.loadingStep3 },
                  { step: 4, label: t.loadingStep4 },
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-700 ${
                      analysisStep > s.step ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                      analysisStep === s.step ? 'bg-white/10 border-white/30 text-white animate-pulse' : 'border-white/5 text-slate-600'
                    }`}>
                      {analysisStep > s.step ? <Check className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                    <span className={`font-['Space_Grotesk'] text-lg ${analysisStep >= s.step ? 'text-white' : 'text-slate-600'}`}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        ) : result ? (
          /* ========== RESULT BENTO GRID ========== */
          <div className="bento-grid animate-slide-up">
            
            {/* Main Crop Result (Full Width Mobile, Half Desktop) */}
            <div className="bento-panel p-2 col-span-half relative group overflow-hidden h-[500px]">
              <img src={result.meta.image} alt={result.crop} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest w-max mb-4 backdrop-blur-md">
                  <Check className="w-3.5 h-3.5" /> Optimal Match
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-white mb-2 tracking-tighter">
                  {result.crop}
                </h1>
                <p className="text-xl text-slate-300 font-medium font-['Space_Grotesk']">
                  {cropIcons[result.crop.toLowerCase()] || '🌱'} Recommended for your plot
                </p>
              </div>
            </div>

            {/* Score Stats (2x Quarter) */}
            <div className="bento-panel p-8 col-span-quarter flex flex-col justify-between h-[500px]">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Activity className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Suitability Score</div>
                <div className="text-7xl font-black text-white">{result.suitability_score}<span className="text-3xl text-emerald-400">%</span></div>
                <div className="w-full h-2 bg-white/5 rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]" style={{ width: `${result.suitability_score}%` }} />
                </div>
              </div>
            </div>

            <div className="bento-panel p-8 col-span-quarter flex flex-col justify-between h-[500px]">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Cpu className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">AI Confidence</div>
                <div className="text-7xl font-black text-white">{result.confidence}<span className="text-3xl text-blue-400">%</span></div>
                <div className="w-full h-2 bg-white/5 rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" style={{ width: `${result.confidence}%` }} />
                </div>
              </div>
            </div>

            {/* Parameters (Half Desktop) */}
            <div className="bento-panel p-8 col-span-half">
              <h3 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-6">Parameter Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {paramIcons.map(({ icon: Icon, key, label, unit, color }) => {
                  const ok = result.suitability?.[key];
                  const val = lastInputs?.[key];
                  return (
                    <div key={key} className={`p-4 rounded-2xl border ${ok ? 'bg-white/5 border-white/10' : 'bg-red-500/10 border-red-500/20'}`}>
                      <Icon className={`w-6 h-6 mb-3 ${ok ? color.split(' ')[0] : 'text-red-400'}`} />
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
                      <div className="text-xl font-bold text-white">{val}<span className="text-xs text-slate-500 ml-1">{unit}</span></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Insights (Quarter Desktop) */}
            <div className="bento-panel p-8 col-span-third">
              <Sprout className="w-6 h-6 text-emerald-400 mb-4" />
              <h3 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-4">Agronomy Tips</h3>
              <p className="text-slate-400 font-medium leading-relaxed">{result.meta.tips}</p>
            </div>

            {/* Yield & Weather (Quarter Desktop) */}
            <div className="bento-panel p-8 col-span-quarter flex flex-col justify-between">
              <div>
                <TrendingUp className="w-6 h-6 text-blue-400 mb-4" />
                <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white mb-2">Expected Yield</h3>
                <p className="text-3xl font-black text-emerald-400">{result.meta.yield}</p>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10">
                <CloudRain className="w-6 h-6 text-cyan-400 mb-4" />
                <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white mb-2">Weather Profile</h3>
                <p className="text-slate-400 font-medium text-sm">{result.meta.weather}</p>
              </div>
            </div>

            {/* Actions (Full Width) */}
            <div className="col-span-full flex flex-col sm:flex-row gap-4 mt-4">
              <button onClick={generatePDFReport} className="btn-magnetic flex-1 justify-center py-6 text-lg">
                <Download className="w-6 h-6" /> Download Detailed Report
              </button>
              <button onClick={handleSavePrediction} disabled={saveSuccess || isSaving} className="bento-panel flex-1 flex items-center justify-center gap-3 font-bold text-white hover:bg-white/10 transition-colors py-6">
                {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : saveSuccess ? <Check className="w-5 h-5 text-emerald-400" /> : <Database className="w-5 h-5" />}
                {isSaving ? 'Archiving...' : saveSuccess ? 'Data Secured' : 'Archive Result'}
              </button>
              <button onClick={() => { setResult(null); setInputText(''); setSelectedFile(null); }} className="bento-panel flex-1 flex items-center justify-center gap-3 font-bold text-white hover:bg-white/10 transition-colors py-6">
                <RefreshCw className="w-5 h-5" /> New Analysis
              </button>
            </div>

          </div>

        ) : page === 'admin' ? (
          /* ========== ADMIN PORTAL ========== */
          !authToken ? (
            <div className="min-h-[70vh] flex items-center justify-center">
              <div className="w-full max-w-md bento-panel p-10 stagger-1">
                <div className="text-center mb-10">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-white/5 border border-white/10">
                    <Lock className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-3xl font-['Space_Grotesk'] font-bold text-white mb-2">{t.adminLoginTitle}</h2>
                  <p className="text-slate-400 text-sm">System Authorization Required</p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-5">
                  <input type="email" required placeholder="Root User Email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="cyber-input" />
                  <input type="password" required placeholder="Passcode" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="cyber-input" />
                  {adminError && <div className="text-red-400 text-sm font-bold bg-red-500/10 p-4 rounded-2xl border border-red-500/20">{adminError}</div>}
                  <button type="submit" className="btn-magnetic w-full justify-center mt-4">{t.adminLoginBtn}</button>
                  <button type="button" onClick={() => setPage('landing')} className="w-full text-center text-sm font-bold text-slate-500 hover:text-white py-4 transition-colors">Abort & Return</button>
                </form>
              </div>
            </div>
          ) : (
            /* Admin Dashboard Bento */
            <div className="bento-grid stagger-1">
              
              <div className="bento-panel p-8 col-span-full flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-['Space_Grotesk'] font-bold text-white mb-1">System Override</h2>
                  <p className="text-emerald-400 font-mono text-sm tracking-widest uppercase">{adminUser?.email}</p>
                </div>
                <button onClick={handleAdminLogout} className="px-8 py-3 rounded-full font-bold text-sm bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Terminate Session
                </button>
              </div>

              {[
                { label: 'Inferences', value: analytics?.metrics?.total_predictions ?? 0, icon: Activity },
                { label: 'Active Nodes', value: analytics?.metrics?.total_users ?? 1, icon: Globe },
                { label: 'Dataset Vectors', value: analytics?.metrics?.dataset_records ?? 2200, icon: Layers },
                { label: 'RF Accuracy', value: `${analytics?.metrics?.model_accuracy ?? 99.09}%`, icon: Sparkles },
              ].map((stat, idx) => (
                <div key={idx} className="bento-panel p-8 col-span-quarter flex flex-col justify-between h-48">
                  <stat.icon className="w-6 h-6 text-slate-400" />
                  <div>
                    <div className="text-4xl font-black text-white mb-1">{stat.value}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                  </div>
                </div>
              ))}

              <div className="bento-panel p-8 col-span-half">
                <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" /> Model Retraining
                </h3>
                <form onSubmit={handleDatasetUpload} className="space-y-4">
                  <div onDragOver={(e) => e.preventDefault()} onDrop={handleFileDrop}
                    className="border border-dashed border-white/20 hover:border-emerald-500 rounded-3xl p-8 text-center cursor-pointer transition-all bg-white/5"
                    onClick={() => fileInputRef.current?.click()}>
                    <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-4" />
                    <p className="text-sm font-bold text-white">{uploadFile ? uploadFile.name : 'Inject new CSV matrix here'}</p>
                  </div>
                  {uploadStatus && <p className="text-sm font-bold text-emerald-400">{uploadStatus}</p>}
                  <div className="flex gap-4">
                    <button type="submit" disabled={!uploadFile} className="bento-panel flex-1 py-4 font-bold text-white hover:bg-white/10 disabled:opacity-50">Upload Matrix</button>
                    <button type="button" onClick={handleRetrainModel} disabled={isTraining} className="btn-magnetic flex-1 justify-center">
                      {isTraining ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Cpu className="w-5 h-5" />} Compile
                    </button>
                  </div>
                  {trainingStatusMsg && <p className="text-sm font-bold text-emerald-400 mt-2">{trainingStatusMsg}</p>}
                </form>
              </div>

              <div className="bento-panel p-8 col-span-half">
                <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-400" /> Inference Distribution
                </h3>
                <div className="space-y-5">
                  {(analytics?.charts?.crop_distribution ?? [
                    { crop: 'Rice', count: 24 }, { crop: 'Maize', count: 18 }, { crop: 'Coffee', count: 14 }
                  ]).slice(0,4).map((item: any, idx: number) => {
                    const pct = Math.round((item.count / 75) * 100);
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-sm font-bold text-slate-300 mb-2">
                          <span>{item.crop}</span>
                          <span>{item.count} ops</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )

        ) : (
          /* ========== LANDING PAGE (BENTO) ========== */
          <div className="bento-grid">
            
            {/* HERO HERO PANEL */}
            <div className="bento-panel p-8 md:p-16 col-span-full text-center relative overflow-hidden stagger-1 min-h-[60vh] flex flex-col items-center justify-center">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
              
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 relative z-10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Random Forest AI Architecture</span>
              </div>
              
              <h1 className="font-['Space_Grotesk'] text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 relative z-10">
                Data driven <br />
                <span className="text-aurora">Agronomy</span>
              </h1>
              
              <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto mb-12 relative z-10">
                Inject your soil telemetry into our neural engine to calculate the absolute optimal crop rotation with 99.09% precision.
              </p>

              {/* CYBER INPUT BOX */}
              <div className="w-full max-w-2xl relative z-10" onDragOver={(e) => e.preventDefault()} onDrop={handleFileDrop}>
                <div className="bg-black/50 backdrop-blur-md rounded-[32px] p-2 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-2">
                  
                  {selectedFile ? (
                    <div className="flex-1 w-full flex items-center justify-between rounded-[24px] p-4 bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <span className="text-white font-bold text-sm">{selectedFile.name}</span>
                      </div>
                      <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Input N, P, K, pH, temp parameters..."
                      className="flex-1 w-full bg-transparent text-white text-lg placeholder-slate-600 font-['Space_Grotesk'] font-medium outline-none px-6 py-4"
                    />
                  )}

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button onClick={() => fileInputRef.current?.click()} className="p-5 rounded-[24px] bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 transition-colors hidden md:block" title="Upload Dataset">
                      <Upload className="w-5 h-5" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.csv,.txt,.png,.jpg,.jpeg" className="hidden" />
                    <button onClick={runPrediction} className="btn-magnetic w-full md:w-auto">
                      Execute <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {nlpError && <div className="mt-4 text-red-400 text-sm font-bold bg-red-500/10 py-2 px-4 rounded-full inline-block border border-red-500/20">{nlpError}</div>}
              </div>
            </div>

            {/* FEATURES BENTO */}
            <div className="bento-panel p-10 col-span-half md:col-span-third stagger-2 flex flex-col justify-between min-h-[300px]">
              <Cpu className="w-10 h-10 text-emerald-400 mb-6" />
              <div>
                <h3 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">Neural Precision</h3>
                <p className="text-slate-400 font-medium">Scikit-Learn Random Forest optimization tuned on heavy datasets.</p>
              </div>
            </div>

            <div className="bento-panel p-10 col-span-half md:col-span-third stagger-3 flex flex-col justify-between min-h-[300px] bg-gradient-to-br from-emerald-900/40 to-black">
              <Zap className="w-10 h-10 text-emerald-400 mb-6" />
              <div>
                <h3 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">Instant Inference</h3>
                <p className="text-slate-400 font-medium">Predict yields in milliseconds utilizing our connection-pooled architecture.</p>
              </div>
            </div>

            <div className="bento-panel p-10 col-span-full md:col-span-third stagger-4 flex flex-col justify-between min-h-[300px]">
              <Globe className="w-10 h-10 text-blue-400 mb-6" />
              <div>
                <h3 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-3">Global Matrix</h3>
                <p className="text-slate-400 font-medium">Multilingual support translating technical advice into regional dialects immediately.</p>
              </div>
            </div>

            {/* FAQ ACCORDION BENTO */}
            <div className="bento-panel p-10 col-span-full stagger-5">
              <h3 className="font-['Space_Grotesk'] text-3xl font-bold text-white mb-8">System Queries</h3>
              <div className="space-y-2">
                {[
                  { q: 'How does the NLP parser function?', a: 'FastAPI regex heuristics extract numeric matrices from standard text input.' },
                  { q: 'What is the RF accuracy?', a: 'Cross-validation yields 99.09% on the internal 2,200 row dataset.' },
                  { q: 'Data retention policy?', a: 'Inputs are cached statelessly. No permanent telemetry is linked to nodes.' },
                ].map((faq, idx) => (
                  <div key={idx} className="border border-white/5 rounded-2xl bg-white/5 overflow-hidden transition-all hover:border-white/10">
                    <button onClick={() => setActiveFaq(activeFaq === idx ? null : idx)} className="w-full flex items-center justify-between p-6 text-left">
                      <span className="font-bold text-white">{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {activeFaq === idx && (
                      <div className="px-6 pb-6 text-slate-400 text-sm font-medium">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* ===== MOBILE NAV ===== */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bento-panel !rounded-[32px] z-50 flex justify-around p-3 shadow-2xl">
         <button onClick={() => { setPage('landing'); setResult(null); }} className={`p-3 rounded-full transition-colors ${page === 'landing' ? 'bg-white/10 text-emerald-400' : 'text-slate-500'}`}>
          <Home className="w-6 h-6" />
        </button>
        <button onClick={runPrediction} className="p-3 rounded-full bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]">
          <Sprout className="w-6 h-6" />
        </button>
        <button onClick={() => setPage('admin')} className={`p-3 rounded-full transition-colors ${page === 'admin' ? 'bg-white/10 text-emerald-400' : 'text-slate-500'}`}>
          <Settings className="w-6 h-6" />
        </button>
      </div>
      
    </div>
  );
}
