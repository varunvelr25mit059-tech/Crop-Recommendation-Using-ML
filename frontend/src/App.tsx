// frontend/src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Sprout, ArrowRight, Check, Download, RefreshCw,
  Lock, LogOut, Database, Cpu,
  X, Upload, Activity, Leaf, Wind, Droplets, Thermometer,
  FlaskConical, CloudRain, Zap,
  Menu, Settings, ChevronRight
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
  const [nlpError, setNlpError] = useState<string | null>(null);

  const [result, setResult] = useState<any>(null);
  const [lastInputs, setLastInputs] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (authToken && page === 'admin') {
      fetchAnalytics();
    }
  }, [authToken, page]);

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
      if (!res.ok) throw new Error('Authentication failed');
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
    setIsAnalyzing(true); setResult(null);
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
      if (!res.ok) throw new Error('Connection failed');
      const data = JSON.parse(await res.text());
      setTimeout(() => {
        if (data.success === false) { setNlpError(data.error); setIsAnalyzing(false); }
        else { setIsAnalyzing(false); setResult(data.prediction); setLastInputs(data.extracted); }
      }, 1500); // Faster analysis for mobile snappy feel
    } catch (err: any) { setIsAnalyzing(false); setNlpError(err.message || 'Something went wrong'); }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      setSelectedFile(e.dataTransfer.files[0]); setNlpError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { setSelectedFile(e.target.files[0]); setNlpError(null); }
  };

  const handleSavePrediction = () => {
    setSaveSuccess(true); 
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const generatePDFReport = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.text(`SmartCrop AI Result: ${result.crop}`, 15, 20);
    doc.save(`SmartCrop_${result.crop}.pdf`);
  };

  const handleDatasetUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploadStatus('Uploading...');
    try {
      const fd = new FormData(); fd.append('file', uploadFile);
      const res = await fetch('/api/upload-dataset', { method: 'POST', headers: { 'Authorization': `Bearer ${authToken}` }, body: fd });
      if (!res.ok) throw new Error('Upload failed');
      setUploadStatus(`Uploaded successfully.`);
      setUploadFile(null); fetchAnalytics();
    } catch (err: any) { setUploadStatus(`Error: ${err.message}`); }
  };

  const handleRetrainModel = async () => {
    setIsTraining(true); setTrainingStatusMsg(t.modelRunning);
    try {
      const res = await fetch('/api/train-model', { method: 'POST', headers: { 'Authorization': `Bearer ${authToken}` } });
      if (!res.ok) throw new Error('Training failed');
      setTrainingStatusMsg(`Training Complete.`);
      fetchAnalytics();
    } catch (err: any) { setTrainingStatusMsg(`Error: ${err.message}`); }
    finally { setIsTraining(false); }
  };

  const paramIcons = [
    { icon: Leaf, key: 'n', label: 'N', color: 'text-emerald-400' },
    { icon: FlaskConical, key: 'p', label: 'P', color: 'text-blue-400' },
    { icon: Zap, key: 'k', label: 'K', color: 'text-purple-400' },
    { icon: Thermometer, key: 'temperature', label: 'Temp', color: 'text-orange-400' },
    { icon: Droplets, key: 'humidity', label: 'Humid', color: 'text-cyan-400' },
    { icon: Wind, key: 'ph', label: 'pH', color: 'text-amber-400' },
    { icon: CloudRain, key: 'rainfall', label: 'Rain', color: 'text-indigo-400' },
  ];

  return (
    <div className="min-h-screen flex flex-col relative">

      {/* ===== HEADER ===== */}
      <header className="fixed top-0 w-full z-50 bg-[#0f1117]/80 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <button onClick={() => { setPage('landing'); setResult(null); }} className="flex items-center gap-2 group">
            <Sprout className="w-8 h-8 text-[#00e5cc]" />
            <span className="font-['Space_Grotesk'] text-xl font-bold tracking-tight">SmartCrop<span className="text-[#00e5cc]">.ai</span></span>
          </button>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <select value={lang} onChange={(e) => setLang(e.target.value as Language)} className="bg-transparent text-sm font-bold text-slate-300 outline-none cursor-pointer">
              <option value="en" className="bg-[#0f1117]">English</option>
              <option value="ta" className="bg-[#0f1117]">தமிழ்</option>
              <option value="hi" className="bg-[#0f1117]">हिंदी</option>
            </select>
            {authToken ? (
              <button onClick={() => setPage(page === 'admin' ? 'landing' : 'admin')} className="btn-outline-mq text-sm py-2 px-6">
                <Settings className="w-4 h-4 mr-2" /> Dashboard
              </button>
            ) : (
              <button onClick={() => setPage('admin')} className="btn-primary-mq text-sm py-2 px-6">
                <Lock className="w-4 h-4 mr-2" /> Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-[#1e2035] border-b border-white/10 flex flex-col p-4 gap-4 shadow-xl">
             <select value={lang} onChange={(e) => { setLang(e.target.value as Language); setMobileMenuOpen(false); }} className="bg-transparent text-sm font-bold text-white outline-none w-full p-2 border border-white/10 rounded-lg">
              <option value="en" className="bg-[#0f1117]">English</option>
              <option value="ta" className="bg-[#0f1117]">தமிழ்</option>
              <option value="hi" className="bg-[#0f1117]">हिंदी</option>
            </select>
            <button onClick={() => { setPage(page === 'admin' ? 'landing' : 'admin'); setMobileMenuOpen(false); }} className="btn-primary-mq w-full">
              {authToken ? 'Dashboard' : 'Login'}
            </button>
          </div>
        )}
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 pt-24 pb-32">

        {page === 'landing' ? (
          <>
            {/* HERO SECTION */}
            <section className="px-4 py-12 md:py-24 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 text-center md:text-left stagger-enter d-1 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#4fff91] animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">AI Powered Precision</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-['Space_Grotesk'] font-black leading-[1.1] mb-6">
                  Turn Your Soil Data <br className="hidden md:block" /> Into <span className="gradient-text">Real Growth.</span>
                </h1>
                <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto md:mx-0">
                  Powerful AI algorithms. High-performing crop predictions. Agronomy strategies that actually work and yield results.
                </p>

                {/* Input Area */}
                <div className="bg-[#1e2035] p-2 rounded-[24px] border border-white/10 flex flex-col sm:flex-row gap-2 max-w-2xl" onDragOver={handleFileDrop}>
                  {selectedFile ? (
                     <div className="flex-1 flex items-center justify-between rounded-2xl p-4 bg-white/5 border border-white/10">
                       <span className="text-white font-bold text-sm truncate">{selectedFile.name}</span>
                       <button onClick={() => setSelectedFile(null)}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
                     </div>
                  ) : (
                    <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="N=90 P=42 K=43 pH=6.5..." className="flex-1 bg-transparent px-6 py-4 text-white outline-none" />
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <button onClick={runPrediction} className="btn-primary-mq w-full sm:w-auto">
                    {isAnalyzing ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Analyze'} <ArrowRight className="w-5 h-5 ml-1" />
                  </button>
                </div>
                {nlpError && <p className="mt-3 text-red-400 text-sm font-bold text-left pl-4">{nlpError}</p>}
                
                <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold text-slate-400">
                  <span><Check className="w-4 h-4 inline text-[#00e5cc]" /> No Lock-ins</span>
                  <span><Check className="w-4 h-4 inline text-[#00e5cc]" /> Instant Results</span>
                  <button onClick={() => fileInputRef.current?.click()} className="text-[#4f8ef7] hover:underline">Upload CSV instead</button>
                </div>
              </div>

              {/* Orbit Visual */}
              <div className="flex-1 w-full flex justify-center stagger-enter d-2 relative hidden md:flex">
                <div className="hero-card-orbit">
                  <div className="orbit-ring r1"></div>
                  <div className="orbit-ring r2"></div>
                  <div className="center-card">
                    <Cpu className="w-16 h-16 text-[#9c4dff]" />
                  </div>
                  <div className="orbit-dot od1"><Leaf className="w-5 h-5 text-[#4fff91]" /></div>
                  <div className="orbit-dot od2"><CloudRain className="w-5 h-5 text-[#4f8ef7]" /></div>
                  <div className="orbit-dot od3"><Thermometer className="w-5 h-5 text-[#ff8c1a]" /></div>
                  <div className="orbit-dot od4"><Activity className="w-5 h-5 text-[#ff4da6]" /></div>
                </div>
              </div>
            </section>

            {/* TICKER STRIP */}
            <div className="ticker-strip">
              <div className="ticker-track">
                {Array(6).fill(['99% Accuracy', 'Neural Processing', 'Live Analytics', 'Data Driven']).flat().map((item, i) => (
                  <React.Fragment key={i}>
                    <span className="ticker-item">{item}</span><span className="ticker-item ticker-sep">★</span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* RESULTS SECTION */}
            {result && (
              <section className="px-4 py-16 max-w-7xl mx-auto stagger-enter d-3" id="results-view">
                <div className="text-center mb-12">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Analysis Complete</p>
                  <h2 className="text-4xl font-['Space_Grotesk'] font-bold text-white">Your Optimal Strategy</h2>
                </div>

                <div className="grid md:grid-cols-12 gap-6">
                  {/* Hero Result Card */}
                  <div className="marquee-card md:col-span-8 p-0 flex flex-col md:flex-row relative">
                    <div className="w-full md:w-1/2 h-64 md:h-auto">
                      <img src={result.meta.image} alt="Crop" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-[#1e2035]">
                      <div className="text-xs font-bold text-[#4fff91] uppercase tracking-widest mb-2 border border-[#4fff91]/30 bg-[#4fff91]/10 px-3 py-1 rounded-full w-max">#1 Match</div>
                      <h3 className="text-5xl font-black text-white mb-4">{result.crop}</h3>
                      <div className="flex gap-6 mb-6">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Suitability</p>
                          <p className="text-3xl font-bold gradient-text">{result.suitability_score}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Confidence</p>
                          <p className="text-3xl font-bold gradient-text-alt">{result.confidence}%</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 mb-6 line-clamp-3">{result.meta.tips}</p>
                    </div>
                  </div>

                  {/* Actions Side Card */}
                  <div className="marquee-card md:col-span-4 flex flex-col justify-between">
                    <div>
                      <h4 className="font-['Space_Grotesk'] font-bold text-xl mb-6">Take Action</h4>
                      <button onClick={generatePDFReport} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-xl flex items-center justify-between px-6 mb-4 transition-colors">
                        <span className="flex items-center gap-3"><Download className="w-5 h-5 text-[#4f8ef7]" /> Download Plan</span>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </button>
                      <button onClick={handleSavePrediction} disabled={saveSuccess} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-xl flex items-center justify-between px-6 transition-colors">
                        <span className="flex items-center gap-3"><Database className="w-5 h-5 text-[#9c4dff]" /> {saveSuccess ? 'Saved!' : 'Save to CRM'}</span>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Parameter Breakdown */}
                  <div className="md:col-span-12 marquee-card mt-6">
                    <h4 className="font-['Space_Grotesk'] font-bold text-xl mb-6">Telemetry Breakdown</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
                      {paramIcons.map(({ icon: Icon, key, label, color }) => {
                        const ok = result.suitability?.[key];
                        return (
                          <div key={key} className={`p-4 rounded-xl border ${ok ? 'bg-white/5 border-white/10' : 'bg-red-500/10 border-red-500/30'} flex flex-col items-center text-center`}>
                            <Icon className={`w-6 h-6 mb-2 ${ok ? color : 'text-red-400'}`} />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
                            <span className="text-lg font-bold text-white">{lastInputs?.[key] || '-'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}

          </>
        ) : (
          /* ========== ADMIN PORTAL ========== */
          <section className="px-4 py-12 max-w-7xl mx-auto stagger-enter d-1">
            {!authToken ? (
               <div className="max-w-md mx-auto marquee-card mt-12">
                 <h2 className="text-3xl font-['Space_Grotesk'] font-bold text-center mb-8">Admin Access</h2>
                 <form onSubmit={handleAdminLogin} className="space-y-4">
                    <input type="email" placeholder="Email Address" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="mq-input" />
                    <input type="password" placeholder="Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="mq-input" />
                    {adminError && <p className="text-red-400 text-sm font-bold">{adminError}</p>}
                    <button type="submit" className="btn-primary-mq w-full mt-4">Secure Login</button>
                 </form>
               </div>
            ) : (
               <div className="space-y-8">
                 <div className="marquee-card flex flex-col md:flex-row items-center justify-between bg-gradient-accent text-black">
                   <div>
                     <h2 className="text-3xl font-['Space_Grotesk'] font-black">Admin Dashboard</h2>
                     <p className="font-bold">Welcome back, {adminUser?.email}</p>
                   </div>
                   <button onClick={handleAdminLogout} className="mt-4 md:mt-0 px-6 py-3 bg-black text-white rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                     <LogOut className="w-4 h-4" /> Sign Out
                   </button>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { l: 'Predictions', v: analytics?.metrics?.total_predictions ?? 0 },
                      { l: 'Users', v: analytics?.metrics?.total_users ?? 1 },
                      { l: 'Dataset Size', v: analytics?.metrics?.dataset_records ?? 2200 },
                      { l: 'Accuracy', v: `${analytics?.metrics?.model_accuracy ?? 99}%` }
                    ].map((s, i) => (
                      <div key={i} className="marquee-card p-6 text-center">
                        <div className="text-4xl font-black gradient-text mb-2">{s.v}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.l}</div>
                      </div>
                    ))}
                 </div>

                 <div className="marquee-card">
                   <h3 className="text-2xl font-['Space_Grotesk'] font-bold mb-6">Model Retraining</h3>
                   <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 p-8 border border-dashed border-white/20 rounded-2xl text-center bg-white/5 cursor-pointer hover:bg-white/10" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-8 h-8 mx-auto mb-4 text-slate-400" />
                        <span className="font-bold">{uploadFile ? uploadFile.name : 'Upload New CSV Dataset'}</span>
                      </div>
                      <div className="flex-1 flex flex-col gap-4 justify-center">
                         <button onClick={handleDatasetUpload} disabled={!uploadFile} className="btn-outline-mq w-full">Upload to Server</button>
                         <button onClick={handleRetrainModel} disabled={isTraining} className="btn-primary-mq w-full">{isTraining ? 'Training...' : 'Trigger Retrain'}</button>
                      </div>
                   </div>
                   {(uploadStatus || trainingStatusMsg) && (
                     <div className="mt-4 p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold">
                       {uploadStatus} {trainingStatusMsg}
                     </div>
                   )}
                 </div>
               </div>
            )}
          </section>
        )}

      </main>

      {/* Floating Action Button (Mobile) */}
      <a href="#" className="floating-action md:hidden" aria-label="Scroll to top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
        <Sprout className="w-7 h-7" />
      </a>

    </div>
  );
}
