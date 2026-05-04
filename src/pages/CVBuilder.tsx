import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  Plus, 
  Trash2, 
  GripVertical, 
  Wand2, 
  Download,
  Eye,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Save,
  RotateCw
} from 'lucide-react';
import { CV_SECTIONS } from '../constants';
import { exportElementToPDF, exportCVToWord } from '../lib/export';
import { db, doc, setDoc, getDoc, serverTimestamp, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CVBuilder: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>('personal');
  const [data, setData] = useState<any>({
    personal: { fullName: '', role: '', email: '', phone: '', location: '', linkedin: '', github: '' },
    perfil: '',
    experience: [],
    education: [],
    skills: [],
    soft_skills: [],
    languages: [],
    certifications: [],
    projects: []
  });

  const previewRef = React.useRef<HTMLDivElement>(null);

  const [skillsInput, setSkillsInput] = useState('');
  const [softSkillsInput, setSoftSkillsInput] = useState('');
  const [improving, setImproving] = useState<string | null>(null);

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasCV, setHasCV] = useState(false);

  // Load existing CV
  useEffect(() => {
    const loadCV = async () => {
      if (!user) return;
      try {
        const docSnap = await getDoc(doc(db, 'cvs', `cv_${user.uid}`));
        if (docSnap.exists()) {
          setHasCV(true);
          const savedData = docSnap.data().data;
          const updatedData = {
            ...data, // Keep defaults
            ...savedData,
            skills: savedData.skills || [],
            soft_skills: savedData.soft_skills || [],
            languages: savedData.languages || [],
            certifications: savedData.certifications || [],
            projects: savedData.projects || [],
          };
          setData(updatedData);
          setSkillsInput((updatedData.skills || []).join(', '));
          setSoftSkillsInput((updatedData.soft_skills || []).join(', '));

          if (docSnap.data().updatedAt) {
            setLastSaved(docSnap.data().updatedAt.toDate());
          }
        }
      } catch (e: any) {
        console.error("Error loading CV:", e);
        if (e.code !== 'permission-denied') {
           toast.error('Error al cargar tu CV.');
        } else {
          handleFirestoreError(e, OperationType.GET, `cvs/cv_${user.uid}`);
        }
      } finally {
        setLoading(false);
      }
    };
    loadCV();
  }, [user]);

  // Auto-save logic with longer debounce to avoid rate limits
  useEffect(() => {
    if (loading || !user) return;
    
    const timer = setTimeout(() => {
      handleSave(true);
    }, 60000); // 60 seconds of inactivity to be very safe
    
    return () => clearTimeout(timer);
  }, [data]);

  const handleSave = async (isAuto = false) => {
    if (!user) return;
    if (!isAuto) setSaving(true);
    try {
      const saveData: any = {
        userId: user.uid,
        data,
        updatedAt: serverTimestamp()
      };

      // Add createdAt only if it's the first time
      if (!hasCV) {
        saveData.createdAt = serverTimestamp();
      }

      await setDoc(doc(db, 'cvs', `cv_${user.uid}`), saveData, { merge: true });
      setHasCV(true);
      setLastSaved(new Date());
      if (!isAuto) toast.success('CV Guardado Correctamente');
    } catch (e: any) {
      if (!isAuto) {
        toast.error('Error al guardar: ' + e.message);
        handleFirestoreError(e, OperationType.WRITE, `cvs/cv_${user.uid}`);
      }
    } finally {
      if (!isAuto) setSaving(false);
    }
  };

  // Sync local inputs when data changes from external sources
  useEffect(() => {
    if (data.skills && data.skills.join(', ') !== skillsInput.split(',').map((s: string) => s.trim()).filter(Boolean).join(', ')) {
      setSkillsInput(data.skills.join(', '));
    }
  }, [data.skills]);

  useEffect(() => {
    if (data.soft_skills && data.soft_skills.join(', ') !== softSkillsInput.split(',').map((s: string) => s.trim()).filter(Boolean).join(', ')) {
      setSoftSkillsInput(data.soft_skills.join(', '));
    }
  }, [data.soft_skills]);

  const improveSection = async (sectionId: string) => {
    setImproving(sectionId);
    try {
      let prompt = "";
      let system = "Eres un experto en reclutamiento y redacción de CVs. Tu tarea es optimizar la sección proporcionada para que sea más profesional, use palabras de acción y esté orientada a logros. Mantén el idioma en español.";

      if (sectionId === 'perfil') {
        prompt = `Optimiza este resumen profesional para un CV de ${data.personal.role || 'un profesional'}: "${data.perfil}". Sé conciso pero impactante.`;
      } else if (sectionId === 'experiencia') {
        prompt = `Optimiza estas descripciones de experiencia laboral para un CV de ${data.personal.role || 'un profesional'}: ${JSON.stringify(data.experience)}. Devuelve el mismo formato JSON pero con las descripciones mejoradas.`;
      } else {
        prompt = `Optimiza esta sección de ${sectionId}: ${JSON.stringify(data[sectionId])}. Devuelve un JSON con el contenido mejorado.`;
      }

      // Import dynamic call to avoid circular or missing dependencies if any
      const { callingGeminiWithRetry } = await import('../lib/gemini');
      const result = await callingGeminiWithRetry(prompt, system, sectionId !== 'perfil');
      
      if (sectionId === 'perfil') {
        setData({ ...data, perfil: result });
      } else {
        setData({ ...data, [sectionId]: result });
      }
      toast.success('Sección optimizada con éxito');
    } catch (error) {
      console.error("AI Improvement failed:", error);
      toast.error('Error al optimizar con IA');
    } finally {
      setImproving(null);
    }
  };

  const progress = 45; // Simulated for now

  const addExperience = () => {
    setData({
      ...data,
      experience: [...data.experience, { company: '', position: '', start: '', end: '', desc: '', current: false }]
    });
  };

  const removeExperience = (index: number) => {
    setData({
      ...data,
      experience: data.experience.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full min-h-[calc(100vh-160px)]">
      {/* Editor Lateral */}
      <div className="space-y-6 overflow-y-auto pr-2 pb-20">
        <div className="flex items-center justify-between sticky top-0 bg-bg-light dark:bg-bg-dark z-10 py-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Constructor de CV</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-48 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-brand-bright" />
              </div>
              <span className="text-xs font-bold text-brand-bright">{progress}% Completado</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={() => handleSave()}
               disabled={saving}
               className="btn-primary !py-2 !px-4 text-xs flex items-center gap-2"
             >
                {saving ? <RotateCw size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Guardando...' : 'Guardar CV'}
             </button>
             <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-zinc-400">
               <CheckCircle2 size={12} className={lastSaved ? "text-green-500" : "text-zinc-300"} /> 
               {lastSaved ? `Guardado ${lastSaved?.toLocaleTimeString()}` : 'No guardado'}
             </div>
          </div>
        </div>

        <div className="space-y-4">
          {CV_SECTIONS.map((section) => (
            <div key={section.id} className="card !p-0 overflow-hidden border-zinc-200 dark:border-zinc-800">
              <button 
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                className="w-full p-5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all font-bold"
              >
                <div className="flex items-center gap-4">
                   <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {/* En un caso real usaría <section.icon /> */}
                      <AlertCircle size={18} />
                   </div>
                   {section.label}
                </div>
                <ChevronDown size={20} className={`transition-transform duration-300 ${activeSection === section.id ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeSection === section.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-zinc-100 dark:border-zinc-800 p-6 space-y-4 bg-zinc-50/50 dark:bg-zinc-800/20"
                  >
                    {section.id === 'personal' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                           <label className="label">Nombre Completo</label>
                           <input type="text" className="input-field" placeholder="Nombre completo" value={data.personal.fullName || ''} onChange={e => setData({...data, personal: {...data.personal, fullName: e.target.value}})} />
                        </div>
                        <div>
                           <label className="label">Cargo Actual</label>
                           <input type="text" className="input-field" placeholder="Ej: UI Designer" value={data.personal.role || ''} onChange={e => setData({...data, personal: {...data.personal, role: e.target.value}})} />
                        </div>
                        <div>
                           <label className="label">LinkedIn</label>
                           <input type="text" className="input-field" placeholder="linkedin.com/in/usuario" value={data.personal.linkedin || ''} onChange={e => setData({...data, personal: {...data.personal, linkedin: e.target.value}})} />
                        </div>
                        <div>
                           <label className="label">GitHub / Portfolio</label>
                           <input type="text" className="input-field" placeholder="url de tu trabajo" value={data.personal.github || ''} onChange={e => setData({...data, personal: {...data.personal, github: e.target.value}})} />
                        </div>
                        <div>
                           <label className="label">Email</label>
                           <input type="email" className="input-field" placeholder="email@ejemplo.com" value={data.personal.email || ''} onChange={e => setData({...data, personal: {...data.personal, email: e.target.value}})} />
                        </div>
                        <div>
                           <label className="label">Ubicación</label>
                           <input type="text" className="input-field" placeholder="Ciudad, País" value={data.personal.location || ''} onChange={e => setData({...data, personal: {...data.personal, location: e.target.value}})} />
                        </div>
                      </div>
                    )}

                    {section.id === 'perfil' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="label">Resumen Profesional</label>
                          <button 
                            onClick={() => improveSection('perfil')}
                            disabled={improving === 'perfil'}
                            className="flex items-center gap-1 text-xs font-bold text-brand-bright hover:underline disabled:opacity-50"
                          >
                            {improving === 'perfil' ? <RotateCw size={12} className="animate-spin" /> : <Wand2 size={12} />}
                            {improving === 'perfil' ? 'Mejorando...' : 'Mejorar con IA'}
                          </button>
                        </div>
                        <textarea rows={5} className="input-field resize-none" placeholder="Cuenta brevemente tu trayectoria..." value={data.perfil || ''} onChange={e => setData({...data, perfil: e.target.value})}></textarea>
                      </div>
                    )}

                    {section.id === 'experiencia' && (
                      <div className="space-y-6">
                        {data.experience.map((exp: any, i: number) => (
                           <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 relative group">
                              <button onClick={() => removeExperience(i)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={18} />
                              </button>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                  <label className="label">Empresa</label>
                                  <input type="text" className="input-field py-2" placeholder="Nombre de la empresa" value={exp.company || ''} onChange={e => {
                                    const next = [...data.experience];
                                    next[i].company = e.target.value;
                                    setData({...data, experience: next});
                                  }} />
                                </div>
                                <div className="col-span-2">
                                  <label className="label">Cargo</label>
                                  <input type="text" className="input-field py-2" placeholder="Cargo ocupado" value={exp.position || ''} onChange={e => {
                                    const next = [...data.experience];
                                    next[i].position = e.target.value;
                                    setData({...data, experience: next});
                                  }} />
                                </div>
                                <div>
                                  <label className="label">Inicio</label>
                                  <input type="text" className="input-field py-2" placeholder="Mes Año" value={exp.start || ''} onChange={e => {
                                    const next = [...data.experience];
                                    next[i].start = e.target.value;
                                    setData({...data, experience: next});
                                  }} />
                                </div>
                                <div>
                                  <label className="label">Fin</label>
                                  <input type="text" className="input-field py-2" placeholder="Mes Año" disabled={exp.current} value={exp.end || ''} onChange={e => {
                                    const next = [...data.experience];
                                    next[i].end = e.target.value;
                                    setData({...data, experience: next});
                                  }} />
                                </div>
                                <div className="col-span-2 flex items-center gap-2">
                                  <input type="checkbox" className="w-4 h-4" checked={exp.current || false} onChange={e => {
                                    const next = [...data.experience];
                                    next[i].current = e.target.checked;
                                    if (e.target.checked) next[i].end = '';
                                    setData({...data, experience: next});
                                  }} />
                                  <span className="text-xs font-medium">Trabajo actual</span>
                                </div>
                                <div className="col-span-2">
                                  <label className="label">Logros / Responsabilidades</label>
                                  <textarea className="input-field py-2" rows={3} placeholder="Describe tus logros..." value={exp.desc || ''} onChange={e => {
                                    const next = [...data.experience];
                                    next[i].desc = e.target.value;
                                    setData({...data, experience: next});
                                  }} />
                                </div>
                              </div>
                           </div>
                        ))}
                        <button onClick={addExperience} className="w-full py-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 hover:border-brand-bright hover:text-brand-bright transition-all flex items-center justify-center gap-2 font-bold text-sm">
                          <Plus size={18} /> Agregar Experiencia
                        </button>
                      </div>
                    )}

                    {section.id === 'educacion' && (
                      <div className="space-y-6">
                        {(data.education || []).map((edu: any, i: number) => (
                           <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 relative group">
                              <button onClick={() => {
                                const newEdu = [...data.education];
                                newEdu.splice(i, 1);
                                setData({...data, education: newEdu});
                              }} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={18} />
                              </button>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                  <label className="label">Institución</label>
                                  <input type="text" className="input-field py-2" placeholder="Universidad / Instituto" value={edu.school || ''} onChange={e => {
                                    const newEdu = [...data.education];
                                    newEdu[i].school = e.target.value;
                                    setData({...data, education: newEdu});
                                  }} />
                                </div>
                                <div>
                                  <label className="label">Título</label>
                                  <input type="text" className="input-field py-2" placeholder="Ej: Ing. Sistemas" value={edu.degree || ''} onChange={e => {
                                    const newEdu = [...data.education];
                                    newEdu[i].degree = e.target.value;
                                    setData({...data, education: newEdu});
                                  }} />
                                </div>
                                <div>
                                  <label className="label">Año</label>
                                  <input type="text" className="input-field py-2" placeholder="Año de grado" value={edu.year || ''} onChange={e => {
                                    const newEdu = [...data.education];
                                    newEdu[i].year = e.target.value;
                                    setData({...data, education: newEdu});
                                  }} />
                                </div>
                              </div>
                           </div>
                        ))}
                        <button onClick={() => setData({...data, education: [...(data.education || []), { school: '', degree: '', year: '' }]})} className="w-full py-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 hover:border-brand-bright hover:text-brand-bright transition-all flex items-center justify-center gap-2 font-bold text-sm">
                          <Plus size={18} /> Agregar Educación
                        </button>
                      </div>
                    )}

                    {section.id === 'habilidades_tech' && (
                      <div className="space-y-4">
                        <label className="label">Habilidades (separadas por coma)</label>
                        <textarea 
                          className="input-field" 
                          placeholder="React, Node.js, Python, AWS..." 
                          value={skillsInput} 
                          onChange={e => {
                            const val = e.target.value;
                            setSkillsInput(val);
                            // Only update data when the actual list changes to avoid unnecessary re-renders of preview
                            const newList = val.split(',').map(s => s.trim()).filter(Boolean);
                            if (newList.join(',') !== data.skills.join(',')) {
                              setData({...data, skills: newList});
                            }
                          }} 
                        />
                      </div>
                    )}

                    {section.id === 'habilidades_blandas' && (
                      <div className="space-y-4">
                        <label className="label">Habilidades Blandas (separadas por coma)</label>
                        <textarea 
                          className="input-field" 
                          placeholder="Liderazgo, Comunicación, Trabajo en equipo..." 
                          value={softSkillsInput} 
                          onChange={e => {
                            const val = e.target.value;
                            setSoftSkillsInput(val);
                            const newList = val.split(',').map(s => s.trim()).filter(Boolean);
                            if (newList.join(',') !== data.soft_skills.join(',')) {
                              setData({...data, soft_skills: newList});
                            }
                          }} 
                        />
                      </div>
                    )}

                    {section.id === 'idiomas' && (
                      <div className="space-y-4">
                        {data.languages.map((lang: any, i: number) => (
                          <div key={i} className="flex gap-2 items-center">
                            <input type="text" className="input-field" placeholder="Idioma" value={lang.name || ''} onChange={e => {
                              const next = [...data.languages];
                              next[i].name = e.target.value;
                              setData({...data, languages: next});
                            }} />
                            <select className="input-field w-32" value={lang.level || 'Básico'} onChange={e => {
                              const next = [...data.languages];
                              next[i].level = e.target.value;
                              setData({...data, languages: next});
                            }}>
                               <option value="Básico">Básico</option>
                               <option value="Intermedio">Intermedio</option>
                               <option value="Avanzado">Avanzado</option>
                               <option value="Nativo">Nativo</option>
                            </select>
                            <button onClick={() => setData({...data, languages: data.languages.filter((_: any, idx: number) => idx !== i)})} className="p-2 text-red-500"><Trash2 size={16} /></button>
                          </div>
                        ))}
                        <button onClick={() => setData({...data, languages: [...data.languages, { name: '', level: 'Básico' }]})} className="btn-secondary !py-2 flex items-center justify-center gap-2">
                          <Plus size={14} /> Agregar Idioma
                        </button>
                      </div>
                    )}

                    {section.id === 'certificaciones' && (
                      <div className="space-y-4">
                         {(data.certifications || []).map((cert: any, i: number) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 relative">
                               <button onClick={() => setData({...data, certifications: data.certifications.filter((_: any, idx: number) => idx !== i)})} className="absolute top-2 right-2 text-red-500"><Trash2 size={16} /></button>
                               <input type="text" className="input-field mb-2" placeholder="Nombre de la certificación" value={cert.name || ''} onChange={e => {
                                 const next = [...data.certifications];
                                 next[i].name = e.target.value;
                                 setData({...data, certifications: next});
                               }} />
                               <input type="text" className="input-field" placeholder="Emisor (ej: Google, AWS)" value={cert.issuer || ''} onChange={e => {
                                 const next = [...data.certifications];
                                 next[i].issuer = e.target.value;
                                 setData({...data, certifications: next});
                               }} />
                            </div>
                         ))}
                         <button onClick={() => setData({...data, certifications: [...(data.certifications || []), { name: '', issuer: '' }]})} className="btn-secondary !py-2 flex items-center justify-center gap-2 w-full">
                           <Plus size={14} /> Agregar Certificación
                         </button>
                      </div>
                    )}

                    {section.id === 'proyectos' && (
                      <div className="space-y-4">
                        {(data.projects || []).map((proj: any, i: number) => (
                           <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 relative">
                              <button onClick={() => setData({...data, projects: data.projects.filter((_: any, idx: number) => idx !== i)})} className="absolute top-2 right-2 text-red-500"><Trash2 size={16} /></button>
                              <input type="text" className="input-field mb-2" placeholder="Título del proyecto" value={proj.title || ''} onChange={e => {
                                const next = [...data.projects];
                                next[i].title = e.target.value;
                                setData({...data, projects: next});
                              }} />
                              <textarea className="input-field" placeholder="Breve descripción..." value={proj.desc || ''} onChange={e => {
                                const next = [...data.projects];
                                next[i].desc = e.target.value;
                                setData({...data, projects: next});
                              }} />
                           </div>
                        ))}
                        <button onClick={() => setData({...data, projects: [...(data.projects || []), { title: '', desc: '' }]})} className="btn-secondary !py-2 flex items-center justify-center gap-2 w-full">
                          <Plus size={14} /> Agregar Proyecto
                        </button>
                      </div>
                    )}

                    <div className="flex justify-end pt-4">
                       <button 
                         onClick={() => improveSection(section.id)}
                         disabled={!!improving}
                         className="flex items-center gap-2 px-3 py-1 bg-brand-bright/10 text-brand-bright rounded-lg text-xs font-bold hover:bg-brand-bright hover:text-white transition-all disabled:opacity-50"
                       >
                          {improving === section.id ? <RotateCw size={14} className="animate-spin" /> : <Wand2 size={14} />}
                          {improving === section.id ? 'Optimizando...' : 'Mejorar Sección con IA'}
                       </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Preview en tiempo real */}
      <div className="hidden xl:block sticky top-24 h-fit max-h-[calc(100vh-160px)]">
         <div className="card h-full !p-0 shadow-2xl flex flex-col border-zinc-300 dark:border-zinc-800 overflow-hidden transform-gpu transition-all">
            {/* CV Toolbar */}
            <div className="bg-zinc-100 dark:bg-zinc-800 p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
               </div>
               <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (previewRef.current) {
                        exportElementToPDF(previewRef.current, `CV_${(data.personal.fullName || 'User').replace(/\s+/g, '_')}.pdf`);
                      }
                    }} 
                    className="p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm hover:scale-105 transition-all text-red-500"
                    title="Exportar PDF"
                  >
                    <Download size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      exportCVToWord(data, `CV_${(data.personal.fullName || 'User').replace(/\s+/g, '_')}.docx`);
                    }} 
                    className="p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm hover:scale-105 transition-all text-blue-500"
                    title="Exportar Word"
                  >
                    <FileText size={18} />
                  </button>
               </div>
            </div>

            <div className="flex-1 bg-white dark:bg-zinc-900 overflow-y-auto p-12 shadow-inner scroll-smooth">
              <div 
                ref={previewRef} 
                id="cv-preview"
                className="max-w-[800px] mx-auto min-h-full bg-white p-8"
              >
                {/* Header */}
                <header className="mb-8 border-b-2 border-brand-dark pb-6">
                  <h1 className="text-4xl font-extrabold text-brand-dark tracking-tighter uppercase">{data.personal.fullName || 'TU NOMBRE COMPLETO'}</h1>
                  <p className="text-xl font-medium text-zinc-500 mt-2">{data.personal.role || 'TU CARGO ACTUAL'}</p>
                  <div className="flex flex-wrap gap-4 mt-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1">{data.personal.email || 'correo@ejemplo.com'}</span>
                    <span className="flex items-center gap-1">{data.personal.phone || '+00 000 000 000'}</span>
                    <span className="flex items-center gap-1">{data.personal.location || 'Ciudad, País'}</span>
                    <span className="flex items-center gap-1">{data.personal.linkedin || 'LinkedIn'}</span>
                  </div>
                </header>

                {/* Perfil */}
                <section className="mb-10">
                   <h2 className="text-[10px] uppercase font-black tracking-widest text-brand-bright mb-4 flex items-center gap-3">
                     Perfil Profesional <span className="flex-1 h-[1px] bg-zinc-100 dark:bg-zinc-800"></span>
                   </h2>
                   <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                     {data.perfil || 'Aquí aparecerá tu resumen ejecutivo.'}
                   </p>
                </section>

                <div className="grid grid-cols-3 gap-10">
                  <div className="col-span-2 space-y-10">
                    {/* Experiencia */}
                    <section>
                       <h2 className="text-[10px] uppercase font-black tracking-widest text-brand-bright mb-6 flex items-center gap-3">
                         Experiencia Laboral <span className="flex-1 h-[1px] bg-zinc-100 dark:bg-zinc-800"></span>
                       </h2>
                       <div className="space-y-8">
                         {data.experience.length > 0 ? data.experience.map((exp: any, i: number) => (
                           <div key={i} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-brand-medium before:rounded-full after:absolute after:left-[3px] after:top-4 after:bottom-[-20px] after:w-[2px] after:bg-zinc-100 dark:after:bg-zinc-800 last:after:hidden">
                              <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <h3 className="font-bold text-sm text-zinc-800 dark:text-white leading-none">{exp.position || 'Cargo'}</h3>
                                    <p className="text-[10px] font-bold text-brand-medium mt-1">{exp.company || 'Empresa'}</p>
                                 </div>
                                 <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded">
                                    {exp.start} — {exp.current ? 'Actual' : exp.end}
                                 </p>
                              </div>
                              <p className="text-[11px] text-zinc-500 whitespace-pre-line">{exp.desc}</p>
                           </div>
                         )) : (
                            <p className="text-xs text-zinc-400 italic">No se ha agregado experiencia laboral.</p>
                         )}
                       </div>
                    </section>

                    {/* Proyectos */}
                    {data.projects?.length > 0 && (
                      <section>
                        <h2 className="text-[10px] uppercase font-black tracking-widest text-brand-bright mb-6 flex items-center gap-3">
                           Proyectos Destacados <span className="flex-1 h-[1px] bg-zinc-100 dark:bg-zinc-800"></span>
                        </h2>
                        <div className="space-y-4">
                           {data.projects.map((proj: any, i: number) => (
                             <div key={i}>
                               <h3 className="font-bold text-xs text-zinc-800">{proj.title}</h3>
                               <p className="text-[10px] text-zinc-500 mt-1">{proj.desc}</p>
                             </div>
                           ))}
                        </div>
                      </section>
                    )}
                  </div>

                  <div className="space-y-10">
                    {/* Habilidades Tech */}
                    <section>
                       <h2 className="text-[10px] uppercase font-black tracking-widest text-brand-bright mb-4">Habilidades Tech</h2>
                       <div className="flex flex-wrap gap-1">
                          {(data.skills || []).map((skill: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[9px] font-bold whitespace-nowrap">{skill}</span>
                          ))}
                       </div>
                    </section>

                    {/* Habilidades Blandas */}
                    {data.soft_skills?.length > 0 && (
                      <section>
                        <h2 className="text-[10px] uppercase font-black tracking-widest text-brand-bright mb-4">Habilidades Blandas</h2>
                        <div className="flex flex-wrap gap-1">
                           {data.soft_skills.map((skill: string, i: number) => (
                             <span key={i} className="px-2 py-0.5 bg-brand-bright/5 text-brand-bright rounded text-[9px] font-bold whitespace-nowrap">{skill}</span>
                           ))}
                        </div>
                      </section>
                    )}

                    {/* Idiomas */}
                    {data.languages?.length > 0 && (
                      <section>
                        <h2 className="text-[10px] uppercase font-black tracking-widest text-brand-bright mb-4">Idiomas</h2>
                        <div className="space-y-2">
                           {data.languages.map((lang: any, i: number) => (
                             <div key={i} className="flex justify-between items-center text-[10px]">
                               <span className="font-bold text-zinc-700">{lang.name}</span>
                               <span className="text-zinc-400">{lang.level}</span>
                             </div>
                           ))}
                        </div>
                      </section>
                    )}

                    {/* Educación */}
                    <section>
                       <h2 className="text-[10px] uppercase font-black tracking-widest text-brand-bright mb-4">Educación</h2>
                       <div className="space-y-4">
                          {(data.education || []).map((edu: any, i: number) => (
                            <div key={i}>
                               <h3 className="font-bold text-[10px] text-zinc-800">{edu.degree}</h3>
                               <p className="text-[9px] text-zinc-500">{edu.school} • {edu.year}</p>
                            </div>
                          ))}
                       </div>
                    </section>

                    {/* Certificaciones */}
                    {(data.certifications || []).length > 0 && (
                      <section>
                        <h2 className="text-[10px] uppercase font-black tracking-widest text-brand-bright mb-4">Certificaciones</h2>
                        <div className="space-y-3">
                           {data.certifications.map((cert: any, i: number) => (
                             <div key={i}>
                               <h3 className="font-bold text-[10px] text-zinc-800">{cert.name}</h3>
                               <p className="text-[9px] text-zinc-500">{cert.issuer}</p>
                             </div>
                           ))}
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CVBuilder;
