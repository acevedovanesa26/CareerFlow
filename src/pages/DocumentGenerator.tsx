import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Mail, 
  ShieldCheck, 
  AtSign, 
  LogOut, 
  Star,
  ChevronRight,
  ChevronLeft,
  Wand2,
  Download,
  Save,
  CheckCircle2,
  RefreshCw,
  Eye,
  Type
} from 'lucide-react';
import { DOCUMENT_TYPES, SYSTEM_PROMPTS } from '../constants';
import { callingGeminiWithRetry } from '../lib/gemini';
import { useAuth } from '../context/AuthContext';
import { db, doc, setDoc, serverTimestamp, arrayUnion, handleFirestoreError, OperationType } from '../lib/firebase';
import { exportToWord, exportToPDF } from '../lib/export';
import toast from 'react-hot-toast';

const DocumentGenerator: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState('');
  
  const [config, setConfig] = useState({
    type: 'hoja_de_vida',
    style: 'formal',
    language: 'es',
    tone: 'profesional',
    length: 'media'
  });

  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimer = useRef<any>(null);

  // Auto-save logic
  useEffect(() => {
    if (content && user) {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(async () => {
        try {
          const docId = currentDocId || `doc_${user.uid}_${Date.now()}`;
          if (!currentDocId) setCurrentDocId(docId);

          await setDoc(doc(db, 'documents', docId), {
            userId: user.uid,
            ...config,
            content,
            formData,
            status: 'borrador',
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            versions: arrayUnion({ content, updatedAt: new Date().toISOString() })
          }, { merge: true });
          setLastSaved(new Date());
        } catch (e) {
          console.error("Auto-save failed", e);
        }
      }, 60000);
    }
    return () => clearTimeout(autoSaveTimer.current);
  }, [content, user, currentDocId]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenMessage('Analizando tu información...');
    await new Promise(r => setTimeout(r, 1000));
    setGenMessage('Conectando con el experto en reclutamiento...');
    await new Promise(r => setTimeout(r, 1000));
    setGenMessage('Generando contenido personalizado...');

    try {
      const prompt = SYSTEM_PROMPTS.DOCUMENT_GENERATOR
        .replace('{type}', config.type)
        .replace('{style}', config.style)
        .replace('{language}', config.language)
        .replace('{userData}', JSON.stringify(formData));

      const result = await callingGeminiWithRetry(prompt, "Eres un experto en redacción profesional.");
      setContent(result);
      setStep(6);
      toast.success('¡Documento generado con éxito!');
    } catch (error: any) {
      toast.error('Fallo en la generación: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleAIAssist = async (action: 'extend' | 'tone' | 'spell') => {
    setLoading(true);
    try {
      let promptPrefix = '';
      if (action === 'extend') {
        promptPrefix = "Extiende el siguiente contenido para hacerlo más detallado y profesional, manteniendo la estructura original y sin inventar datos:";
      } else if (action === 'tone') {
        promptPrefix = "Cambia el tono del siguiente contenido para que sea más impactante, profesional y persuasivo:";
      } else if (action === 'spell') {
        promptPrefix = "Corrige la ortografía y gramática del siguiente contenido, asegurando una redacción impecable:";
      }

      const result = await callingGeminiWithRetry(`${promptPrefix}\n\n${content}`, "Eres un editor senior experto en redacción profesional.");
      setContent(result);
      toast.success('¡IA ha mejorado tu contenido!');
    } catch (error: any) {
      toast.error('Error con el asistente IA: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!user) return;
    setGenerating(true);
    setGenMessage('Finalizando y guardando tu documento...');
    try {
      const docId = currentDocId || `doc_${user.uid}_${Date.now()}`;
      await setDoc(doc(db, 'documents', docId), {
        userId: user.uid,
        ...config,
        content,
        formData,
        status: 'completado',
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setStep(7);
      toast.success('¡Documento guardado exitosamente!');
    } catch (e: any) {
      toast.error('Error al finalizar: ' + e.message);
      handleFirestoreError(e, OperationType.WRITE, 'documents');
    } finally {
      setGenerating(false);
    }
  };

  const steps = [
    { num: 1, name: 'Tipo' },
    { num: 2, name: 'Estilo' },
    { num: 3, name: 'Datos' },
    { num: 4, name: 'Opciones' },
    { num: 5, name: 'Generación' },
    { num: 6, name: 'Vista Previa' },
    { num: 7, name: 'Listo' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Stepper */}
      <div className="flex items-center justify-between px-4 mb-12">
        {steps.map((s, i) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                step >= s.num ? 'bg-brand-bright text-white shadow-lg shadow-brand-bright/30' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
              }`}>
                {step > s.num ? <CheckCircle2 size={20} /> : s.num}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-widest ${step >= s.num ? 'text-brand-bright' : 'text-zinc-400'}`}>
                {s.name}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-[2px] mx-4 bg-zinc-200 dark:bg-zinc-800 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: step > s.num ? '100%' : '0%' }}
                  className="absolute top-0 left-0 h-full bg-brand-bright"
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Type Selection */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {DOCUMENT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => { setConfig({ ...config, type: type.id as any }); setStep(2); }}
                className={`card text-left group transition-all p-8 flex flex-col gap-4 border-2 ${
                  config.type === type.id ? 'border-brand-bright bg-brand-bright/5' : 'border-transparent'
                }`}
              >
                <div className="p-4 rounded-2xl bg-brand-bright/10 text-brand-bright group-hover:scale-110 transition-transform w-fit">
                  {type.id === 'hoja_de_vida' && <FileText size={32} />}
                  {type.id === 'carta_presentacion' && <Mail size={32} />}
                  {type.id === 'contrato' && <ShieldCheck size={32} />}
                  {type.id === 'correo_formal' && <AtSign size={32} />}
                  {type.id === 'carta_renuncia' && <LogOut size={32} />}
                  {type.id === 'carta_recomendacion' && <Star size={32} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{type.label}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">{type.description}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {/* Step 2: Style Selection */}
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
             {['formal', 'ejecutivo', 'creativo', 'minimalista'].map((style) => (
              <button
                key={style}
                onClick={() => { setConfig({ ...config, style: style as any }); setStep(3); }}
                className={`card overflow-hidden group transition-all border-2 ${
                  config.style === style ? 'border-brand-bright' : 'border-transparent'
                }`}
              >
                <div className="h-48 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center p-4">
                   <div className="w-full h-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded shadow-sm flex flex-col p-4 gap-2">
                      <div className="h-2 w-1/2 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
                      <div className="h-2 w-full bg-zinc-50 dark:bg-zinc-800 rounded"></div>
                      <div className="h-2 w-3/4 bg-zinc-50 dark:bg-zinc-800 rounded"></div>
                   </div>
                </div>
                <div className="p-4 bg-white dark:bg-zinc-900">
                  <h4 className="font-bold capitalize">{style}</h4>
                  <p className="text-xs text-zinc-500 mt-1">Perfecto para roles corporativos</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {/* Step 3: Form Data */}
        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="card max-w-2xl mx-auto"
          >
            <h3 className="text-xl font-bold mb-6">Detalles del Documento</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Nombre del Cargo / Título</label>
                <input 
                  type="text" 
                  value={formData.title || ''} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Desarrollador Senior Full Stack" 
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Empresa / Destinatario</label>
                <input 
                  type="text" 
                  value={formData.target || ''} 
                  onChange={e => setFormData({ ...formData, target: e.target.value })}
                  placeholder="Ej: Google Latinoamérica" 
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Logros Clave / Información Adicional</label>
                <textarea 
                  rows={6}
                  value={formData.extra || ''} 
                  onChange={e => setFormData({ ...formData, extra: e.target.value })}
                  placeholder="Menciona tus logros principales o información que desees incluir..." 
                  className="input-field resize-none"
                />
              </div>
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(2)} className="btn-secondary px-8">Volver</button>
                <button onClick={() => setStep(4)} className="btn-primary px-8">Siguiente</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Options */}
        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="card max-w-2xl mx-auto"
          >
            <h3 className="text-xl font-bold mb-8 text-center">Personalización Final</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="label">Idioma</label>
                  <select 
                    value={config.language} 
                    onChange={e => setConfig({ ...config, language: e.target.value })}
                    className="input-field cursor-pointer"
                  >
                    <option value="es">Español (Recomendado)</option>
                    <option value="en">Inglés (Global)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Tono</label>
                  <select 
                    value={config.tone} 
                    onChange={e => setConfig({ ...config, tone: e.target.value })}
                    className="input-field cursor-pointer"
                  >
                    <option value="profesional">Profesional & Serio</option>
                    <option value="cercano">Cercano & Amigable</option>
                    <option value="persuasivo">Persuasivo & Entusiasta</option>
                  </select>
                </div>
              </div>
              <div className="space-y-6">
                 <div>
                  <label className="label">Longitud</label>
                  <select 
                    value={config.length} 
                    onChange={e => setConfig({ ...config, length: e.target.value })}
                    className="input-field cursor-pointer"
                  >
                    <option value="corta">Corta (Concisa)</option>
                    <option value="media">Media (Equilibrada)</option>
                    <option value="larga">Larga (Detallada)</option>
                  </select>
                </div>
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                   <p className="text-xs font-semibold text-primary/80">
                     ✨ Gemini AI optimizará el contenido basándose en estas preferencias.
                   </p>
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-8">
              <button onClick={() => setStep(3)} className="btn-secondary px-8">Volver</button>
              <button onClick={handleGenerate} className="btn-primary flex items-center gap-2 group">
                Generar con IA <Wand2 size={18} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Loading / Generating */}
        {generating && (
          <motion.div 
            key="step5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-8"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-zinc-100 dark:border-zinc-800 rounded-full"></div>
              <div className="w-24 h-24 border-4 border-brand-bright border-t-transparent rounded-full animate-spin absolute top-0"></div>
              <Wand2 size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-bright animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">{genMessage}</h3>
              <p className="text-zinc-500">Esto suele tardar unos 10-15 segundos.</p>
            </div>
          </motion.div>
        )}

        {/* Step 6: Preview / Editor */}
        {step === 6 && !generating && (
          <motion.div 
            key="step6"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Toolbar */}
            <div className="lg:col-span-3 card py-3 px-6 flex items-center justify-between sticky top-24 z-20 shadow-xl">
               <div className="flex items-center gap-4">
                 <button onClick={() => setStep(4)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                   <ChevronLeft size={20} />
                 </button>
                 <span className="font-bold text-sm hidden md:block">Editando: {formData.title || 'Documento'}</span>
               </div>
               
               <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-zinc-400 mr-4">
                    {lastSaved ? (
                      <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Guardado {lastSaved.toLocaleTimeString()}</span>
                    ) : (
                      <span className="flex items-center gap-1 animate-pulse"><RefreshCw size={12} /> Guardando...</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                    <button onClick={() => exportToWord('Documento', content)} className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-blue-500 tooltip-trigger" title="Word">
                      <Download size={18} />
                    </button>
                    <button onClick={() => exportToPDF('Documento', content)} className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-red-500 tooltip-trigger" title="PDF">
                      <Eye size={18} />
                    </button>
                  </div>
                  <button 
                    onClick={handleFinalize}
                    className="btn-primary !py-2 !px-4 flex items-center gap-2 text-sm z-30"
                  >
                    Finalizar <Save size={16} />
                  </button>
               </div>
            </div>

            {/* Editor */}
            <div className={`lg:col-span-2 card !p-0 overflow-hidden min-h-[700px] flex flex-col relative ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
              {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-zinc-900/50">
                  <RefreshCw className="animate-spin text-brand-bright" size={32} />
                </div>
              )}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 border-b border-zinc-200 dark:border-zinc-800 flex gap-2">
                 <button className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-500 transition-all active:scale-95"><Type size={16} /></button>
                 <button 
                   onClick={() => handleAIAssist('extend')}
                   className="flex items-center gap-2 px-3 py-1 bg-brand-bright/10 text-brand-bright rounded-lg text-xs font-bold hover:bg-brand-bright hover:text-white transition-all ml-auto"
                 >
                    <Wand2 size={14} /> Mejorar Sección
                 </button>
              </div>
              <textarea 
                value={content || ''}
                onChange={e => setContent(e.target.value)}
                className="flex-1 w-full bg-white dark:bg-zinc-900 p-12 outline-none font-body text-lg leading-relaxed resize-none"
              />
            </div>

            {/* Sidebar Tools */}
            <div className="space-y-6">
               <div className="card">
                  <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-zinc-400">Asistente IA</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleAIAssist('extend')}
                      className="w-full btn-secondary !py-2 !text-xs !bg-zinc-100 !text-zinc-800 dark:!bg-zinc-800 dark:!text-zinc-200 hover:!bg-brand-bright hover:!text-white flex items-center justify-between group"
                    >
                       Extender Contenido <ChevronRight size={14} className="group-hover:translate-x-1" />
                    </button>
                    <button 
                      onClick={() => handleAIAssist('tone')}
                      className="w-full btn-secondary !py-2 !text-xs !bg-zinc-100 !text-zinc-800 dark:!bg-zinc-800 dark:!text-zinc-200 hover:!bg-brand-bright hover:!text-white flex items-center justify-between group"
                    >
                       Cambiar Tono <ChevronRight size={14} className="group-hover:translate-x-1" />
                    </button>
                    <button 
                      onClick={() => handleAIAssist('spell')}
                      className="w-full btn-secondary !py-2 !text-xs !bg-zinc-100 !text-zinc-800 dark:!bg-zinc-800 dark:!text-zinc-200 hover:!bg-brand-bright hover:!text-white flex items-center justify-between group"
                    >
                       Revisar Ortografía <ChevronRight size={14} className="group-hover:translate-x-1" />
                    </button>
                  </div>
               </div>

               <div className="card">
                  <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-zinc-400">Versiones</h3>
                  <div className="space-y-4">
                     {[1, 2, 3].map(v => (
                       <div key={v} className="flex items-center gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer group">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold">V{v}</div>
                          <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Hoy, 14:30</p>
                            <p className="text-xs truncate max-w-[120px]">Versión editada por usuario</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
        {/* Step 7: Success / Finalized */}
        {step === 7 && (
          <motion.div 
            key="step7"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center space-y-8 py-12"
          >
            <div className="relative inline-block">
               <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <CheckCircle2 size={64} className="text-green-500" />
               </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-brand-dark">¡Documento Listo!</h2>
              <p className="text-zinc-500 mt-2">Tu documento ha sido guardado exitosamente y está listo para ser usado en tus aplicaciones laborales.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <button onClick={() => exportToPDF('Documento', content)} className="btn-primary flex items-center justify-center gap-2">
                 Descargar PDF <Download size={18} />
               </button>
               <button onClick={() => exportToWord('Documento', content)} className="btn-secondary flex items-center justify-center gap-2">
                 Descargar Word <Download size={18} />
               </button>
            </div>

            <div className="pt-8 flex flex-col items-center gap-4">
               <button onClick={() => setStep(1)} className="text-brand-bright font-bold hover:underline">
                 Crear otro documento
               </button>
               <a href="/dashboard" className="text-zinc-400 text-sm hover:text-zinc-600">
                 Volver al Dashboard
               </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentGenerator;
