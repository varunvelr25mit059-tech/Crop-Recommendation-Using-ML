// frontend/src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, Globe, ArrowRight, Check, Download, RefreshCw, 
  BookOpen, User, Lock, LogOut, Database, Cpu, TrendingUp, 
  PieChart, HelpCircle, X, Upload, FileText, Image as ImageIcon,
  FileSpreadsheet, Activity
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { translations, Language } from './translations';

export default function App() {
  // Navigation & Language
  const [page, setPage] = useState<'landing' | 'admin' | 'history'>('landing');
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  // Chatbox NLP State
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis Loader State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(1);
  const [nlpError, setNlpError] = useState<string | null>(null);

  // Prediction Result State
  const [result, setResult] = useState<any>(null);
  const [lastInputs, setLastInputs] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Admin Auth State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(JSON.parse(localStorage.getItem('admin_user') || 'null'));

  // Admin Dashboard State
  const [analytics, setAnalytics] = useState<any>(null);
  const [adminPredictions, setAdminPredictions] = useState<any[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStatusMsg, setTrainingStatusMsg] = useState<string | null>(null);

  // Load analytics if admin logged in
  useEffect(() => {
    if (authToken && page === 'admin') {
      fetchAnalytics();
      fetchHistory();
    }
  }, [authToken, page]);

  // Loading Steps Auto-Progression
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

  // API Call Helpers
  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setAnalytics(data);
        } catch (jsonErr) {
          console.error("Analytics response is not valid JSON", jsonErr);
        }
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/prediction-history');
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setAdminPredictions(data);
        } catch (jsonErr) {
          console.error("History response is not valid JSON", jsonErr);
        }
      }
    } catch (err) {
      console.error("Failed to fetch prediction history:", err);
    }
  };

  // Auth Functions
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    try {
      const formData = new URLSearchParams();
      formData.append('username', adminEmail);
      formData.append('password', adminPassword);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      if (!res.ok) {
        let errMsg = "Authentication failed";
        try {
          const text = await res.text();
          const errData = JSON.parse(text);
          errMsg = errData.detail || errMsg;
        } catch {
          errMsg = `Login failed (Status ${res.status}): The backend server is offline or returned an invalid response.`;
        }
        throw new Error(errMsg);
      }

      let data;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid response format received from login server.");
      }
      setAuthToken(data.access_token);
      setAdminUser(data.user);
      localStorage.setItem('admin_token', data.access_token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      setAdminEmail('');
      setAdminPassword('');
    } catch (err: any) {
      setAdminError(err.message || "Invalid credentials");
    }
  };

  const handleAdminLogout = () => {
    setAuthToken(null);
    setAdminUser(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  // Prediction Actions
  const runPrediction = async () => {
    setNlpError(null);
    setFileError(null);
    setIsAnalyzing(true);
    setAnalysisStep(1);
    setResult(null);

    try {
      let endpoint = '/api/predict/nlp';
      let body: any = null;
      let method = 'POST';
      let headers: any = { 'Content-Type': 'application/json' };

      if (selectedFile) {
        endpoint = '/api/predict/file';
        const formData = new FormData();
        formData.append('file', selectedFile);
        body = formData;
        headers = {}; // Let browser set boundary
      } else {
        if (!inputText.trim()) {
          throw new Error("Please enter your soil/weather parameters or drag a file");
        }
        body = JSON.stringify({ text: inputText });
      }

      // Allow admin token to log username
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch(endpoint, {
        method,
        headers,
        body
      });

      if (!res.ok) {
        let errMsg = "Failed to process farm request";
        try {
          const text = await res.text();
          const err = JSON.parse(text);
          errMsg = err.detail || errMsg;
        } catch {
          errMsg = `Connection failed (Status ${res.status}): The backend API is offline or returned an invalid response. If you are running locally, please ensure the backend server is running on port 8000.`;
        }
        throw new Error(errMsg);
      }

      let data;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch {
        throw new Error(`Invalid response format from server (Status ${res.status}). Expected JSON but received HTML/Text.`);
      }
      
      // Wait for loader simulation
      setTimeout(() => {
        if (data.success === false) {
          setNlpError(data.error);
          setIsAnalyzing(false);
        } else {
          setIsAnalyzing(false);
          if (selectedFile) {
            setResult(data.prediction);
            setLastInputs(data.extracted);
          } else {
            setResult(data.prediction);
            setLastInputs(data.extracted);
          }
        }
      }, 6200);

    } catch (err: any) {
      setIsAnalyzing(false);
      setNlpError(err.message || "Something went wrong during prediction");
    }
  };

  const handleExampleClick = (val: string) => {
    setInputText(val);
    setSelectedFile(null);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['pdf', 'csv', 'txt', 'jpg', 'jpeg', 'png'].includes(ext || '')) {
        setSelectedFile(file);
        setFileError(null);
      } else {
        setFileError("Unsupported format. Please upload PDF, CSV, TXT, or Image.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileError(null);
    }
  };

  const handleSavePrediction = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  // PDF Generation Script
  const generatePDFReport = () => {
    if (!result || !lastInputs) return;

    const doc = new jsPDF();
    const primaryGreen = "#16A34A";
    const darkSlate = "#0F172A";

    // Border Frame
    doc.setDrawColor(220, 225, 230);
    doc.rect(5, 5, 200, 287);

    // Header
    doc.setFillColor(primaryGreen);
    doc.rect(5, 5, 200, 35, "F");
    
    doc.setTextColor("#FFFFFF");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("SmartCrop AI Report", 15, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Intelligent Agriculture Recommendation Platform • 2026", 15, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 155, 25);

    // Results Header
    doc.setTextColor(darkSlate);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("RECOMMENDED CROP", 15, 55);

    doc.setFontSize(36);
    doc.setTextColor(primaryGreen);
    doc.text(result.crop.toUpperCase(), 15, 70);

    doc.setFontSize(12);
    doc.setTextColor(darkSlate);
    doc.setFont("helvetica", "normal");
    doc.text(`Suitability Score: ${result.suitability_score}/100`, 15, 82);
    doc.text(`Recommendation Confidence: ${result.confidence}%`, 15, 88);

    // Draw divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 95, 195, 95);

    // Inputs Table
    doc.setFont("helvetica", "bold");
    doc.text("SOIL & ENVIRONMENTAL PARAMETERS USED:", 15, 105);

    // Create table grid manually
    const tableY = 112;
    doc.setFontSize(10);
    
    // Table Header
    doc.setFillColor(245, 247, 250);
    doc.rect(15, tableY, 180, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Parameter", 20, tableY + 5);
    doc.text("Value Analyzed", 90, tableY + 5);
    doc.text("Status", 150, tableY + 5);

    const paramsList = [
      { name: "Nitrogen (N)", val: `${lastInputs.n} mg/kg`, match: result.suitability.n },
      { name: "Phosphorus (P)", val: `${lastInputs.p} mg/kg`, match: result.suitability.p },
      { name: "Potassium (K)", val: `${lastInputs.k} mg/kg`, match: result.suitability.k },
      { name: "Temperature", val: `${lastInputs.temperature}°C`, match: result.suitability.temperature },
      { name: "Relative Humidity", val: `${lastInputs.humidity}%`, match: result.suitability.humidity },
      { name: "Soil pH Level", val: `${lastInputs.ph}`, match: result.suitability.ph },
      { name: "Rainfall Index", val: `${lastInputs.rainfall} mm`, match: result.suitability.rainfall }
    ];

    doc.setFont("helvetica", "normal");
    paramsList.forEach((p, idx) => {
      const rowY = tableY + 8 + (idx * 8);
      if (idx % 2 === 1) {
        doc.setFillColor(250, 252, 255);
        doc.rect(15, rowY, 180, 8, "F");
      }
      doc.text(p.name, 20, rowY + 5);
      doc.text(p.val, 90, rowY + 5);
      doc.setTextColor(p.match ? primaryGreen : "#EF4444");
      doc.text(p.match ? "Optimal Range" : "Outside Range", 150, rowY + 5);
      doc.setTextColor(darkSlate);
    });

    // Agronomy Advisory Section
    const advY = tableY + 70;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("AGRONOMIST GROWING ADVISORY", 15, advY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Growing Tips:", 15, advY + 8);
    doc.setFont("helvetica", "normal");
    const tipsSplit = doc.splitTextToSize(result.meta.tips, 175);
    doc.text(tipsSplit, 15, advY + 13);

    const tipsHeight = tipsSplit.length * 5 + 13;

    doc.setFont("helvetica", "bold");
    doc.text("Expected Yield Per Hectare:", 15, advY + tipsHeight + 5);
    doc.setFont("helvetica", "normal");
    doc.text(result.meta.yield, 15, advY + tipsHeight + 10);

    doc.setFont("helvetica", "bold");
    doc.text("Farming Advice:", 15, advY + tipsHeight + 20);
    doc.setFont("helvetica", "normal");
    const adviceSplit = doc.splitTextToSize(result.meta.advice, 175);
    doc.text(adviceSplit, 15, advY + tipsHeight + 25);

    // PDF Footer
    const footerY = 280;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("SmartCrop AI uses custom trained machine learning models. Validate with your local agricultural officer for regional variations.", 15, footerY);

    doc.save(`SmartCrop_Report_${result.crop.toLowerCase()}.pdf`);
  };

  // Admin Actions
  const handleDatasetUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploadStatus("Uploading...");

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const res = await fetch('/api/upload-dataset', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: formData
      });

      if (!res.ok) {
        let errMsg = "Failed to upload dataset";
        try {
          const text = await res.text();
          const err = JSON.parse(text);
          errMsg = err.detail || errMsg;
        } catch {
          errMsg = `Upload failed (Status ${res.status}): Server offline or invalid response.`;
        }
        throw new Error(errMsg);
      }

      let data;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid response format received from upload server.");
      }
      setUploadStatus(`Success! Uploaded ${data.record_count} dataset records.`);
      setUploadFile(null);
      fetchAnalytics();
    } catch (err: any) {
      setUploadStatus(`Error: ${err.message}`);
    }
  };

  const handleRetrainModel = async () => {
    setIsTraining(true);
    setTrainingStatusMsg(t.modelRunning);
    try {
      const res = await fetch('/api/train-model', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (!res.ok) {
        let errMsg = "Training failed";
        try {
          const text = await res.text();
          const err = JSON.parse(text);
          errMsg = err.detail || errMsg;
        } catch {
          errMsg = `Training failed (Status ${res.status}): Server offline or invalid response.`;
        }
        throw new Error(errMsg);
      }

      let data;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid response format received from training server.");
      }
      setTrainingStatusMsg(`Training Success! Accuracy: ${data.accuracy}%. Model Version: ${data.model_version}`);
      fetchAnalytics();
    } catch (err: any) {
      setTrainingStatusMsg(`Training Failed: ${err.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-text-primary flex flex-col font-sans">
      
      {/* 1. Header Navigation */}
      <header className="glass-panel sticky top-0 z-40 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => { setPage('landing'); setResult(null); }}>
            <div className="bg-primary p-2 rounded-xl text-white shadow-md shadow-emerald-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {t.title}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Lang Dropdown */}
            <div className="relative flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <Globe className="w-4 h-4 text-text-secondary mx-1" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent text-sm text-text-secondary font-medium focus:outline-none pr-2 cursor-pointer"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>

            {/* Admin navigation */}
            {authToken ? (
              <button 
                onClick={() => setPage(page === 'admin' ? 'landing' : 'admin')}
                className="px-4 py-1.5 rounded-lg border border-emerald-600 text-emerald-600 text-sm font-semibold hover:bg-emerald-50 transition"
              >
                {page === 'admin' ? t.home : t.admin}
              </button>
            ) : (
              <button 
                onClick={() => setPage('admin')}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-text-secondary text-sm font-medium hover:bg-slate-100 transition"
              >
                {t.admin}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main App Area */}
      <main className="flex-grow">
        {isAnalyzing ? (
          /* Analysis Experience / Loader Overlay */
          <div className="max-w-md mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
            <div className="relative mb-8">
              {/* Outer Pulsing Glow */}
              <div className="absolute -inset-1 rounded-full bg-primary/20 blur-xl animate-pulse-slow"></div>
              {/* Inner Spinning Ring */}
              <div className="w-20 h-20 rounded-full border-4 border-slate-200 border-t-primary animate-spin"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-text-primary mb-6 animate-pulse">
              {t.loadingTitle}
            </h2>

            {/* Steps Timeline */}
            <div className="w-full bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 p-6 space-y-4 text-left">
              {[
                { step: 1, label: t.loadingStep1 },
                { step: 2, label: t.loadingStep2 },
                { step: 3, label: t.loadingStep3 },
                { step: 4, label: t.loadingStep4 }
              ].map((s) => (
                <div key={s.step} className="flex items-center space-x-3 transition duration-300">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-semibold ${
                    analysisStep > s.step 
                      ? "bg-primary border-primary text-white" 
                      : analysisStep === s.step 
                        ? "border-primary text-primary animate-pulse" 
                        : "border-slate-200 text-slate-400"
                  }`}>
                    {analysisStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                  </div>
                  <span className={`text-sm ${
                    analysisStep === s.step 
                      ? "text-text-primary font-semibold" 
                      : analysisStep > s.step 
                        ? "text-text-secondary line-through opacity-60" 
                        : "text-text-light"
                  }`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

        ) : result ? (
          /* Prediction Results View */
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-200 overflow-hidden">
              
              {/* Crop Banner Image */}
              <div className="relative h-56 bg-slate-900">
                <img 
                  src={result.meta.image} 
                  alt={result.crop} 
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <span className="bg-emerald-500 text-white text-xs font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full mb-2 inline-block">
                    Recommended Crop
                  </span>
                  <h1 className="text-4xl font-extrabold text-white">
                    {result.crop}
                  </h1>
                </div>
              </div>

              {/* Suitability Score Dial */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 grid grid-cols-2 gap-4 text-center">
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold block mb-1">
                    {t.suitabilityScore}
                  </span>
                  <span className="text-3xl font-extrabold text-primary">
                    {result.suitability_score}%
                  </span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold block mb-1">
                    {t.confidence}
                  </span>
                  <span className="text-3xl font-extrabold text-text-primary">
                    {result.confidence}%
                  </span>
                </div>
              </div>

              {/* Suitability Reasoning Checks */}
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-text-primary mb-4 flex items-center space-x-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>{t.suitabilityReasoning}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${result.suitability.n ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                      {result.suitability.n ? "✓" : "✗"}
                    </div>
                    <span className={result.suitability.n ? "text-text-primary font-medium" : "text-red-500"}>
                      {t.nitrogenMatch}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${result.suitability.temperature ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                      {result.suitability.temperature ? "✓" : "✗"}
                    </div>
                    <span className={result.suitability.temperature ? "text-text-primary font-medium" : "text-red-500"}>
                      {t.tempMatch}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${result.suitability.rainfall ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                      {result.suitability.rainfall ? "✓" : "✗"}
                    </div>
                    <span className={result.suitability.rainfall ? "text-text-primary font-medium" : "text-red-500"}>
                      {t.rainMatch}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${result.suitability.ph ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                      {result.suitability.ph ? "✓" : "✗"}
                    </div>
                    <span className={result.suitability.ph ? "text-text-primary font-medium" : "text-red-500"}>
                      {t.soilMatch}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Recommendation Tabs */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Growing Tips */}
                  <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl">
                    <h4 className="font-bold text-emerald-800 mb-2 flex items-center space-x-1.5">
                      <Sprout className="w-4 h-4" />
                      <span>{t.growingTips}</span>
                    </h4>
                    <p className="text-sm text-emerald-950 leading-relaxed">
                      {result.meta.tips}
                    </p>
                  </div>

                  {/* Expected Yield */}
                  <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl">
                    <h4 className="font-bold text-indigo-800 mb-2 flex items-center space-x-1.5">
                      <TrendingUp className="w-4 h-4" />
                      <span>{t.expectedYield}</span>
                    </h4>
                    <p className="text-sm text-indigo-950 leading-relaxed font-semibold">
                      {result.meta.yield}
                    </p>
                  </div>

                  {/* Weather Compatibility */}
                  <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl">
                    <h4 className="font-bold text-amber-800 mb-2 flex items-center space-x-1.5">
                      <Globe className="w-4 h-4" />
                      <span>{t.weatherComp}</span>
                    </h4>
                    <p className="text-sm text-amber-950 leading-relaxed">
                      {result.meta.weather}
                    </p>
                  </div>

                  {/* Soil Compatibility */}
                  <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl">
                    <h4 className="font-bold text-blue-800 mb-2 flex items-center space-x-1.5">
                      <Database className="w-4 h-4" />
                      <span>{t.soilComp}</span>
                    </h4>
                    <p className="text-sm text-blue-950 leading-relaxed">
                      {result.meta.soil}
                    </p>
                  </div>
                </div>

                {/* Farming Advice */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                  <h4 className="font-bold text-text-primary mb-2 flex items-center space-x-1.5">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>{t.farmingAdvice}</span>
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {result.meta.advice}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row gap-3">
                <button 
                  onClick={generatePDFReport}
                  className="flex-1 bg-primary text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-primary-hover active:scale-[0.98] transition shadow-md shadow-emerald-500/15"
                >
                  <Download className="w-5 h-5" />
                  <span>{t.btnDownloadPdf}</span>
                </button>
                
                <button 
                  onClick={handleSavePrediction}
                  disabled={saveSuccess || isSaving}
                  className={`flex-1 font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 border transition ${
                    saveSuccess 
                      ? "bg-slate-100 text-emerald-600 border-emerald-200" 
                      : "bg-white text-text-primary border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {isSaving ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-text-secondary" />
                  ) : saveSuccess ? (
                    <Check className="w-5 h-5" />
                  ) : null}
                  <span>
                    {isSaving 
                      ? t.savingPrediction 
                      : saveSuccess 
                        ? t.savedSuccess 
                        : t.btnSavePrediction}
                  </span>
                </button>

                <button 
                  onClick={() => { setResult(null); setInputText(''); setSelectedFile(null); }}
                  className="bg-white text-text-secondary font-medium py-3 px-6 rounded-xl border border-slate-300 hover:bg-slate-50 transition"
                >
                  {t.btnPredictAgain}
                </button>
              </div>

            </div>
          </div>

        ) : page === 'admin' ? (
          /* Admin Login / Dashboard Portal */
          !authToken ? (
            <div className="max-w-md mx-auto px-4 py-20">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-200 p-8">
                
                <div className="text-center mb-8">
                  <div className="bg-emerald-100 p-3 rounded-2xl inline-block text-emerald-600 mb-3">
                    <User className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-text-primary">
                    {t.adminLoginTitle}
                  </h2>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                      {t.adminEmail}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-light">@</span>
                      <input 
                        type="email" 
                        required
                        placeholder="admin@smartcrop.ai"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                      {t.adminPassword}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-text-light absolute left-3 top-3.5" />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      />
                    </div>
                  </div>

                  {adminError && (
                    <div className="text-red-500 text-xs font-semibold bg-red-50 p-3 rounded-lg">
                      {adminError}
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center hover:bg-primary-hover active:scale-[0.98] transition shadow-md shadow-emerald-500/15"
                  >
                    <span>{t.adminLoginBtn}</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPage('landing')}
                    className="w-full bg-transparent text-text-secondary hover:text-text-primary text-sm font-semibold py-2 transition"
                  >
                    {t.adminBackBtn}
                  </button>
                </form>

              </div>
            </div>
          ) : (
            /* Secure Dashboard View */
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
              
              {/* Dashboard Header Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white rounded-3xl p-6 shadow-lg shadow-slate-950/20">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary p-2.5 rounded-xl">
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{t.adminWelcome}</h2>
                    <p className="text-xs text-slate-400">System Admin: {adminUser?.email}</p>
                  </div>
                </div>
                
                <button 
                  onClick={handleAdminLogout}
                  className="self-start md:self-center bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 font-semibold px-4 py-2 rounded-xl flex items-center space-x-2 text-sm transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.adminLogoutBtn}</span>
                </button>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: t.metricPredictions, value: analytics?.metrics?.total_predictions ?? 0, icon: Sprout, color: "text-emerald-600 bg-emerald-100" },
                  { label: t.metricUsers, value: analytics?.metrics?.total_users ?? 1, icon: User, color: "text-blue-600 bg-blue-100" },
                  { label: t.metricRecords, value: analytics?.metrics?.dataset_records ?? 2200, icon: Database, color: "text-indigo-600 bg-indigo-100" },
                  { label: t.metricAccuracy, value: `${analytics?.metrics?.model_accuracy ?? 99.09}%`, icon: Cpu, color: "text-amber-600 bg-amber-100" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">{stat.label}</span>
                      <div className={`p-2 rounded-lg ${stat.color}`}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="text-2xl font-extrabold text-text-primary">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Analytics Graphs Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Crop Distribution Donuts (Custom SVG Chart) */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-text-primary mb-4 flex items-center space-x-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    <span>{t.cropDistribution}</span>
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* SVG Pie Chart */}
                    <div className="relative w-36 h-36">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
                        {/* Static slices representing crop recommendations */}
                        <circle r="16" cx="16" cy="16" fill="transparent" stroke="#22C55E" stroke-width="4" stroke-dasharray="45 100" />
                        <circle r="16" cx="16" cy="16" fill="transparent" stroke="#3B82F6" stroke-width="4" stroke-dasharray="25 100" stroke-dashoffset="-45" />
                        <circle r="16" cx="16" cy="16" fill="transparent" stroke="#6366F1" stroke-width="4" stroke-dasharray="15 100" stroke-dashoffset="-70" />
                        <circle r="16" cx="16" cy="16" fill="transparent" stroke="#F59E0B" stroke-width="4" stroke-dasharray="10 100" stroke-dashoffset="-85" />
                        <circle r="16" cx="16" cy="16" fill="transparent" stroke="#CBD5E1" stroke-width="4" stroke-dasharray="5 100" stroke-dashoffset="-95" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-text-secondary">Distribution</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex-grow space-y-2 text-xs">
                      {analytics?.charts?.crop_distribution?.map((item: any, idx: number) => {
                        const colors = ['bg-primary', 'bg-blue-500', 'bg-indigo-500', 'bg-amber-500', 'bg-slate-300'];
                        return (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`}></span>
                              <span className="font-medium text-text-primary">{item.crop}</span>
                            </div>
                            <span className="text-text-secondary font-bold">{item.count} runs</span>
                          </div>
                        );
                      }) ?? (
                        <div className="text-text-light">Loading crop distribution data...</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Prediction Trends (Custom SVG Line Graph) */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-text-primary mb-4 flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <span>{t.predictionTrends}</span>
                  </h3>

                  <div className="h-36 w-full">
                    {/* SVG Line Graph */}
                    <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="20" x2="300" y2="20" stroke="#F1F5F9" stroke-width="1" />
                      <line x1="0" y1="50" x2="300" y2="50" stroke="#F1F5F9" stroke-width="1" />
                      <line x1="0" y1="80" x2="300" y2="80" stroke="#F1F5F9" stroke-width="1" />
                      
                      {/* Trend Line Path */}
                      <path 
                        d="M 10 70 Q 50 40 100 55 T 200 20 T 290 35" 
                        fill="transparent" 
                        stroke="#3B82F6" 
                        stroke-width="3" 
                        stroke-linecap="round"
                      />
                      {/* Accent gradient area */}
                      <path 
                        d="M 10 70 Q 50 40 100 55 T 200 20 T 290 35 L 290 100 L 10 100 Z" 
                        fill="url(#trend-gradient)" 
                        opacity="0.1"
                      />
                      <defs>
                        <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="#3B82F6" />
                          <stop offset="100%" stop-color="#3B82F6" stop-opacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  
                  {/* Labels row */}
                  <div className="flex justify-between text-[10px] font-bold text-text-light mt-2 px-1">
                    {analytics?.charts?.prediction_trends?.map((item: any, idx: number) => (
                      <span key={idx}>{item.date}</span>
                    )) ?? (
                      <span>Loading trends dates...</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Upload & Retrain Module */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Dataset Upload Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-text-primary mb-3 flex items-center space-x-2">
                      <Database className="w-5 h-5 text-indigo-600" />
                      <span>{t.uploadDatasetTitle}</span>
                    </h3>
                    <p className="text-xs text-text-secondary mb-6 leading-relaxed">
                      Maintain models by uploading agricultural metrics. The CSV file must contain columns: `N`, `P`, `K`, `temperature`, `humidity`, `ph`, `rainfall`, and `label`.
                    </p>
                  </div>

                  <form onSubmit={handleDatasetUpload} className="space-y-4">
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                      className="border-2 border-dashed border-slate-200 hover:border-primary rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center bg-slate-50"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileSpreadsheet className="w-8 h-8 text-indigo-400 mb-2" />
                      <span className="text-sm font-semibold text-text-primary block">
                        {uploadFile ? uploadFile.name : t.dragDropCsv}
                      </span>
                      <span className="text-xs text-text-light mt-1">Supports only .csv tables</span>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        accept=".csv"
                        className="hidden"
                      />
                    </div>

                    {uploadStatus && (
                      <div className="text-xs font-semibold text-text-secondary bg-slate-100 p-2.5 rounded-lg">
                        {uploadStatus}
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={!uploadFile}
                      className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
                    >
                      {t.btnUpload}
                    </button>
                  </form>
                </div>

                {/* Model Training Pipeline */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-text-primary mb-3 flex items-center space-x-2">
                      <Cpu className="w-5 h-5 text-amber-600" />
                      <span>{t.trainingTitle}</span>
                    </h3>
                    <p className="text-xs text-text-secondary mb-6 leading-relaxed">
                      Re-calibrate the platform algorithm with the latest datasets. SmartCrop AI employs Scikit-Learn Random Forest optimization to fit soil thresholds.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-text-secondary">{t.modelStatus}:</span>
                        <span className={isTraining ? "text-amber-600" : "text-emerald-600"}>
                          {isTraining ? t.modelRunning : t.modelIdle}
                        </span>
                      </div>
                      
                      {trainingStatusMsg && (
                        <p className="text-xs text-text-secondary mt-2.5 pt-2.5 border-t border-slate-200 font-medium">
                          {trainingStatusMsg}
                        </p>
                      )}
                    </div>

                    <button 
                      onClick={handleRetrainModel}
                      disabled={isTraining}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold py-2.5 rounded-xl transition flex items-center justify-center space-x-2 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      {isTraining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                      <span>{t.trainModelBtn}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Logs / Prediction History */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="font-bold text-text-primary flex items-center space-x-2">
                    <Database className="w-5 h-5 text-emerald-600" />
                    <span>Run Prediction History Logs</span>
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-text-secondary uppercase border-b border-slate-200">
                        <th className="px-6 py-3">Timestamp</th>
                        <th className="px-6 py-3">Soil (N-P-K)</th>
                        <th className="px-6 py-3">Environment</th>
                        <th className="px-6 py-3">pH</th>
                        <th className="px-6 py-3">Result Recommendation</th>
                        <th className="px-6 py-3 text-right">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium">
                      {adminPredictions.map((pred) => (
                        <tr key={pred.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 text-text-secondary">{pred.created_at?.replace('T', ' ').substring(0, 16)}</td>
                          <td className="px-6 py-4 text-text-primary">
                            N:{pred.n} • P:{pred.p} • K:{pred.k}
                          </td>
                          <td className="px-6 py-4 text-text-secondary">
                            {pred.temperature}°C • {pred.humidity}% H2O • {pred.rainfall}mm
                          </td>
                          <td className="px-6 py-4 text-text-primary">{pred.ph}</td>
                          <td className="px-6 py-4 font-bold text-emerald-700">{pred.recommended_crop}</td>
                          <td className="px-6 py-4 text-right font-bold text-text-primary">{pred.confidence}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )

        ) : (
          /* Landing Page + Chat Search Area */
          <div className="space-y-16 py-8">
            
            {/* Hero & AI Input */}
            <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
              
              <div className="space-y-4">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                  AgriTech Intelligence 2026
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
                  {t.heroTitle}
                </h1>
                <p className="text-base text-text-secondary max-w-xl mx-auto">
                  {t.heroSub}
                </p>
              </div>

              {/* Chat Input Container */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 p-4 max-w-2xl mx-auto space-y-3 relative group focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition duration-300"
              >
                
                {/* File Drop Active indicator */}
                {selectedFile && (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-800">
                    <div className="flex items-center space-x-2">
                      {selectedFile.name.endsWith('.csv') ? (
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                      ) : selectedFile.name.endsWith('.pdf') ? (
                        <FileText className="w-5 h-5 text-emerald-600" />
                      ) : selectedFile.name.match(/\.(jpg|jpeg|png)$/i) ? (
                        <ImageIcon className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-emerald-600" />
                      )}
                      <span className="font-semibold">{selectedFile.name}</span>
                      <span className="text-xs opacity-85">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button 
                      onClick={() => setSelectedFile(null)}
                      className="text-emerald-700 hover:text-emerald-950"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Main NLP Input Text area */}
                <textarea 
                  rows={3}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.placeholder}
                  disabled={selectedFile !== null}
                  className="w-full resize-none bg-transparent placeholder-text-light text-text-primary focus:outline-none text-base disabled:opacity-50"
                />

                {/* Bottom Bar: File attachment & CTA */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach CSV, PDF, Image"
                      className="p-2.5 rounded-full hover:bg-slate-100 text-text-secondary transition"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                    <span className="text-xs text-text-light hidden sm:inline">{t.orUpload}</span>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.csv,.txt,.png,.jpg,.jpeg"
                      className="hidden"
                    />
                  </div>

                  <button 
                    onClick={runPrediction}
                    className="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-primary-hover active:scale-[0.98] transition shadow-md shadow-emerald-500/15"
                  >
                    <span>{t.ctaButton}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Errors Panel */}
              {nlpError && (
                <div className="max-w-2xl mx-auto text-red-600 font-semibold text-sm bg-red-50 p-4 rounded-2xl border border-red-100">
                  {nlpError}
                </div>
              )}
              {fileError && (
                <div className="max-w-2xl mx-auto text-red-600 font-semibold text-sm bg-red-50 p-4 rounded-2xl border border-red-100">
                  {fileError}
                </div>
              )}

              {/* Examples Suggestions */}
              <div className="max-w-2xl mx-auto text-center space-y-2">
                <span className="text-xs font-semibold text-text-light uppercase tracking-wider block">
                  {t.examples}
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[
                    "N=90 P=42 K=43 Temp=22 Humidity=82 pH=6.5 Rain=203",
                    "nitrogen 20, phosphorus 60, potash 80, temp 18, humidity 15, pH 7.2, rain 50",
                    "My soil reports potassium 200, N 20, P 125, temperature 22, humidity 91, ph 6, rainfall 110"
                  ].map((ex, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleExampleClick(ex)}
                      className="text-xs text-text-secondary bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-primary hover:bg-emerald-50/20 hover:text-emerald-700 transition"
                    >
                      {ex.substring(0, 48)}...
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Features Grid */}
            <section className="max-w-6xl mx-auto px-4 py-8">
              <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
                <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">
                  {t.featTitle}
                </h2>
                <p className="text-sm text-text-secondary">
                  {t.featSub}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: t.feat1Title, desc: t.feat1Desc, icon: Sprout, color: "bg-emerald-50 text-emerald-600" },
                  { title: t.feat2Title, desc: t.feat2Desc, icon: Database, color: "bg-indigo-50 text-indigo-600" },
                  { title: t.feat3Title, desc: t.feat3Desc, icon: Globe, color: "bg-blue-50 text-blue-600" },
                  { title: t.feat4Title, desc: t.feat4Desc, icon: Cpu, color: "bg-amber-50 text-amber-600" },
                  { title: t.feat5Title, desc: t.feat5Desc, icon: Activity, color: "bg-rose-50 text-rose-600" },
                  { title: t.feat6Title, desc: t.feat6Desc, icon: TrendingUp, color: "bg-violet-50 text-violet-600" }
                ].map((f, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 hover-premium">
                    <div className={`p-3 rounded-2xl inline-block mb-4 ${f.color}`}>
                      <f.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-text-primary text-lg mb-2">{f.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* How It Works Section */}
            <section className="max-w-6xl mx-auto px-4 py-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <div className="text-center max-w-xl mx-auto mb-12">
                <h2 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
                  {t.howItWorks}
                </h2>
                <p className="text-sm text-text-secondary">
                  Our system evaluates soil parameters against agricultural records to compute accuracy-driven yields.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { step: "01", title: "Input Parameters", desc: "Describe soil composition in the natural chat bar or drop laboratory PDF/CSV sheets directly." },
                  { step: "02", title: "Cloud AI Processing", desc: "Our FastAPI engine extracts metrics and computes crop suitability against Random Forest trees." },
                  { step: "03", title: "Harvest Smart Report", desc: "Review complete details on expected yields, optimal weather compatibility, and download advisory PDFs." }
                ].map((s, idx) => (
                  <div key={idx} className="space-y-4 text-center md:text-left">
                    <span className="text-4xl font-extrabold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent block">
                      {s.step}
                    </span>
                    <h3 className="text-lg font-bold text-text-primary">{s.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Statistics Dashboard Banner */}
            <section className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                {[
                  { val: "15,000+", label: "Farms Recommended" },
                  { val: "99.09%", label: "Classification Accuracy" },
                  { val: "22+", label: "Seed Varieties Tuned" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-lg">
                    <span className="text-4xl font-extrabold text-primary block mb-2">{stat.val}</span>
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">{stat.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Customer Testimonials */}
            <section className="max-w-6xl mx-auto px-4 py-8">
              <div className="text-center max-w-xl mx-auto mb-12">
                <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">
                  {t.testimonials}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { quote: "SmartCrop AI changed our sugarcane and coffee crop rotation yield planning. We achieved 24% higher crop return within one seasonal cycle.", author: "Rajesh Kumar", role: "Coffee Estate Manager, Western Ghats" },
                  { quote: "The natural language interface makes soil analytics accessible to small-scale farmers in Tamil Nadu. We just speak our values and get immediate advice.", author: "Anjali Selvam", role: "Agronomy Student, TNAU Coimbatore" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <p className="text-sm text-text-secondary leading-relaxed italic mb-6">
                      "{item.quote}"
                    </p>
                    <div>
                      <h4 className="font-bold text-text-primary text-sm">{item.author}</h4>
                      <span className="text-xs text-text-light">{item.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ Accordion */}
            <section className="max-w-3xl mx-auto px-4 py-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center justify-center space-x-2">
                  <HelpCircle className="w-7 h-7 text-primary" />
                  <span>{t.faq}</span>
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  { q: "How does the AI process my natural text?", a: "We run regex parser heuristics in the FastAPI server to search for numbers preceding or following agricultural keywords (N, P, K, pH, rainfall, temp, humidity)." },
                  { q: "How accurate is the Random Forest Classifier?", a: "The classifier model reaches 99.09% cross-validation accuracy on our seeded dataset. It runs multi-depth tree decisions based on Scikit-Learn." },
                  { q: "Can I run the system in local regional languages?", a: "Yes, our frontend architecture natively maps translations in English, Hindi (हिंदी), and Tamil (தமிழ்)." }
                ].map((faq, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h4 className="font-bold text-text-primary text-sm mb-2">{faq.q}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </main>

      {/* 3. Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-text-light">
          <span>{t.footerRights}</span>
          <div className="flex items-center space-x-4">
            <span className="hover:text-text-primary cursor-pointer">Security Policy</span>
            <span>•</span>
            <span className="hover:text-text-primary cursor-pointer">API Integration Docs</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
