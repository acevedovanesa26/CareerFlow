import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Zap, 
  TrendingUp, 
  Target,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowRight,
  Plus,
  Download
} from 'lucide-react';
import { extractTextFromFile } from '../lib/extraction';
import { callingGeminiWithRetry } from '../lib/gemini';
import { SYSTEM_PROMPTS } from '../constants';
import { CVAnalysis } from '../types';
import { db, doc, setDoc, serverTimestamp, handleFirestoreError, OperationType } from '../lib/firebase';
import { exportReportToPDF } from '../lib/export';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';

const CVAnalyzer: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CVAnalysis | null>(null);
  const [status, setStatus] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1
  });

  const handleAnalyze = async () => {
    if (!file || !user) return;
    
    setAnalyzing(true);
    setStatus('Leyendo archivo...');
    
    try {
      setStatus('Extrayendo texto del documento...');
      const text = await extractTextFromFile(file);
      
      if (!text || text.trim().length < 50) {
        throw new Error('No se pudo extraer suficiente texto del documento. Asegúrate de que no sea solo una imagen o esté protegido.');
      }

      setStatus('Realizando análisis semántico con IA...');

      const prompt = SYSTEM_PROMPTS.CV_ANALYZER.replace('{cvText}', text);
      const analysisRaw = await callingGeminiWithRetry(prompt, "Eres un sistema de análisis ATS avanzado.", true);
      
      const analysis: CVAnalysis = {
        userId: user.uid,
        fileName: file.name,
        fileUrl: '', // Could upload to Firebase Storage if needed
        extractedText: text,
        ...analysisRaw,
        createdAt: serverTimestamp()
      };

      // Save to Firebase
      const analysisId = `analysis_${user.uid}_${Date.now()}`;
      await setDoc(doc(db, 'cv_analyses', analysisId), analysis);

      setResult(analysis);
      toast.success('Análisis completado');
    } catch (error: any) {
      toast.error('Error durante el análisis: ' + error.message);
      handleFirestoreError(error, OperationType.WRITE, 'cv_analyses');
    } finally {
      setAnalyzing(false);
    }
  };

  const chartData = result ? Object.entries(result.sectionScores).map(([key, val]) => ({ name: key, score: val })) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Analizador de CV Semántico</h1>
           <p className="text-zinc-500 mt-2">Sube tu CV para recibir una evaluación detallada ante sistemas ATS.</p>
        </div>
        {result && (
          <button onClick={() => { setResult(null); setFile(null); }} className="btn-secondary !bg-zinc-100 !text-zinc-800">
            Analizar otro
          </button>
        )}
      </header>

      {!result && !analyzing && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card !p-0 overflow-hidden"
        >
          <div 
            {...getRootProps()} 
            className={`p-20 border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center gap-6 cursor-pointer transition-all ${
              isDragActive ? 'border-brand-bright bg-brand-bright/5' : 'border-zinc-100 hover:border-brand-bright/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-20 h-20 rounded-3xl bg-brand-bright/10 text-brand-bright flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload size={40} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold">Arrastra tu archivo aquí</h3>
              <p className="text-zinc-500 mt-2">Soporta formatos PDF y Word (.docx)</p>
            </div>
          </div>
          
          {file && (
            <div className="p-6 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText className="text-brand-bright" size={24} />
                <div>
                   <p className="font-bold">{file.name}</p>
                   <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-2 hover:bg-zinc-200 rounded-lg">
                 <X size={20} />
              </button>
            </div>
          )}

          <div className="p-8 bg-white border-t border-zinc-100 flex justify-center">
            <button 
              disabled={!file}
              onClick={handleAnalyze}
              className={`btn-primary px-12 py-4 flex items-center gap-3 ${!file && 'opacity-50 cursor-not-allowed'}`}
            >
               Iniciar Análisis <Search size={20} />
            </button>
          </div>
        </motion.div>
      )}

      {analyzing && (
        <div className="flex flex-col items-center justify-center py-24 gap-8">
           <div className="relative">
              <div className="w-24 h-24 border-4 border-zinc-100 dark:border-zinc-800 rounded-full"></div>
              <div className="w-24 h-24 border-4 border-brand-bright border-t-transparent rounded-full animate-spin absolute top-0"></div>
           </div>
           <div className="text-center">
              <h3 className="text-2xl font-bold">{status}</h3>
              <p className="text-zinc-500 mt-2">Este proceso puede tomar hasta 20 segundos según la extensión de tu CV.</p>
           </div>
        </div>
      )}

      {result && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Main Score & Top Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
             <div className="card lg:col-span-1 flex flex-col items-center justify-center text-center py-10">
                <div className="relative mb-6">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-zinc-100" />
                    <motion.circle 
                      cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                      strokeDasharray={440}
                      initial={{ strokeDashoffset: 440 }}
                      animate={{ strokeDashoffset: 440 - (440 * result.overallScore) / 100 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="text-brand-bright"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="text-4xl font-black">{result.overallScore}</span>
                    <span className="text-xs font-bold text-zinc-400 block -mt-1">/ 100</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold">Puntaje Global</h3>
                <p className="text-sm text-zinc-500 mt-1">Calificación AI Semántica</p>
             </div>

             <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Compatibilidad ATS', value: result.atsCompatible ? 'Alta' : 'Baja', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { label: 'Errores Críticos', value: result.errors.filter(e => e.severity === 'alta').length, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
                  { label: 'Oportunidades', value: result.improvements.length, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                ].map((stat, i) => (
                  <div key={i} className="card flex flex-col justify-between">
                     <div className={`p-3 rounded-xl w-fit ${stat.bg} ${stat.color}`}>
                       <stat.icon size={24} />
                     </div>
                     <div className="mt-4">
                       <p className="text-sm font-semibold text-zinc-500">{stat.label}</p>
                       <p className="text-3xl font-black mt-1">{stat.value}</p>
                     </div>
                  </div>
                ))}
                
                <div className="card md:col-span-3">
                   <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Palabras Clave Encontradas</h4>
                   <div className="flex flex-wrap gap-2">
                     {result.keywords.found.map((kw, i) => (
                       <span key={i} className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold flex items-center gap-2">
                         <CheckCircle2 size={12} /> {kw}
                       </span>
                     ))}
                     {result.keywords.suggested.map((kw, i) => (
                        <span key={i} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-full text-xs font-bold flex items-center gap-2">
                          <Plus size={12} /> Sugerida: {kw}
                        </span>
                     ))}
                   </div>
                </div>
             </div>
          </div>

          {/* Detailed Analysis Tabs/Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Section Scores Chart */}
             <div className="card">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                  <TrendingUp size={20} className="text-brand-bright" /> Desglose por Sección
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                      <XAxis type="number" hide domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                      <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={20}>
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.score > 70 ? '#27AE60' : entry.score > 40 ? '#F2994A' : '#EB5757'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Critical Errors */}
             <div className="card">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-500" /> Errores Críticos & Erratas
                </h3>
                <div className="space-y-4">
                  {result.errors.map((error, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                       <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                          <ShieldCheck size={20} />
                       </div>
                       <div>
                         <div className="flex items-center gap-2">
                           <span className="font-bold text-sm">{error.field}</span>
                           <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                             error.severity === 'alta' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                           }`}>
                             Prioridad {error.severity}
                           </span>
                         </div>
                         <p className="text-xs text-zinc-500 mt-1">{error.description}</p>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          {/* Recommendation & Roadmap */}
          <div className="card bg-brand-dark text-white overflow-hidden relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-bright/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
             <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                <div className="md:col-span-2">
                   <h3 className="text-2xl font-bold mb-4">Hoja de Ruta para tu CV</h3>
                   <div className="space-y-6">
                      {result.improvements.map((imp, i) => (
                        <div key={i} className="flex gap-4 group">
                           <div className="w-8 h-8 rounded-lg bg-brand-bright text-white flex items-center justify-center font-bold text-sm shrink-0">
                             {i + 1}
                           </div>
                           <p className="text-zinc-300 transform group-hover:translate-x-2 transition-transform duration-300">
                             {imp.description}
                           </p>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="flex flex-col gap-4">
                   <p className="text-sm font-medium text-zinc-400">¿Quieres aplicar estos cambios automáticamente?</p>
                   <button 
                     onClick={() => navigate('/cv-builder')}
                     className="btn-primary flex items-center justify-center gap-2 !bg-white !text-brand-dark hover:!bg-zinc-100"
                   >
                      Optimizar con IA <Zap size={18} />
                   </button>
                   <button 
                     onClick={() => {
                        const reportData = [
                          { label: 'Puntaje Global', value: `${result.overallScore}/100` },
                          { label: 'Compatibilidad ATS', value: result.atsCompatible ? 'Alta' : 'Baja' },
                          { label: 'ATS Explicación', value: result.atsExplanation },
                          { label: '--- PUNTAJES POR SECCIÓN ---', value: '' },
                          ...Object.entries(result.sectionScores).map(([k, v]) => ({ label: k, value: `${v}%` })),
                        ];
                        exportReportToPDF(`Análisis de CV - ${result.fileName}`, reportData);
                     }}
                     className="text-white font-bold flex items-center gap-2 text-sm justify-center hover:opacity-80"
                   >
                      Descargar informe <Download size={16} />
                   </button>
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CVAnalyzer;
