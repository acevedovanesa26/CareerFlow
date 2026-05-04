import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  User, 
  Mic, 
  TrendingUp, 
  ChevronRight, 
  Play,
  RotateCcw,
  Trophy,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle,
  Wand2,
  Star,
  Zap
} from 'lucide-react';
import { MODALIDADES_ENTREVISTA, AREAS_PROFESIONALES, SYSTEM_PROMPTS } from '../constants';
import { callingGeminiWithRetry } from '../lib/gemini';
import { useAuth } from '../context/AuthContext';
import { db, doc, setDoc, serverTimestamp, increment, updateDoc, handleFirestoreError, OperationType } from '../lib/firebase';
import { InterviewData, InterviewQuestion } from '../types';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const InterviewSimulator: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  
  // Game State
  const [gameState, setGameState] = useState<'setup' | 'loading' | 'active' | 'completed'>('setup');
  const [config, setConfig] = useState({
    position: '',
    area: AREAS_PROFESIONALES[0],
    level: 'junior',
    modality: 'conductual',
    questionsCount: 5,
    language: 'es'
  });

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState<InterviewQuestion[]>([]);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (gameState === 'active') {
       intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
       clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [gameState]);

  const handleStart = async () => {
    if (!config.position) {
      toast.error('Por favor ingresa un cargo');
      return;
    }
    
    setGameState('loading');
    setAnswers([]);
    setCurrentIndex(0);
    setFinalScore(0);
    try {
      const prompt = SYSTEM_PROMPTS.INTERVIEW_QUESTION_GENERATOR
        .replace('{count}', String(config.questionsCount))
        .replace('{position}', config.position)
        .replace('{area}', config.area)
        .replace('{level}', config.level)
        .replace('{modality}', config.modality);

      const result = await callingGeminiWithRetry(prompt, "Eres un entrevistador senior.", true);
      setQuestions(result.questions);
      setGameState('active');
      setTimer(0);
    } catch (e: any) {
      if (e.message.includes('429') || e.message.includes('quota')) {
        toast.error('Has alcanzado el límite de uso de IA por hoy. Inténtalo de nuevo mañana o usa tu propio API Key.', { duration: 10000 });
      } else {
        toast.error('Error al generar preguntas: ' + e.message);
      }
      setGameState('setup');
    }
  };

  const handleNext = async () => {
    if (!userAnswer.trim()) {
      toast.error('Por favor escribe tu respuesta antes de continuar');
      return;
    }

    setSubmitting(true);
    try {
      const prompt = SYSTEM_PROMPTS.INTERVIEW_EVALUATOR
        .replace('{position}', config.position)
        .replace('{question}', questions[currentIndex].question)
        .replace('{userAnswer}', userAnswer);

      const evaluation = await callingGeminiWithRetry(prompt, "Eres un evaluador de RRHH experto.", true);
      
      const answerRecord: InterviewQuestion = {
        question: questions[currentIndex].question,
        userAnswer,
        aiScore: evaluation.overallScore,
        aiFeedback: evaluation.feedback,
        idealAnswer: evaluation.idealAnswer,
        timeSpent: timer,
        type: questions[currentIndex].type,
        difficulty: questions[currentIndex].difficulty
      };

      setAnswers([...answers, answerRecord]);
      setUserAnswer('');
      setTimer(0);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        await finishInterview([...answers, answerRecord]);
      }
    } catch (e: any) {
      toast.error('Error al evaluar respuesta: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const finishInterview = async (allAnswers: InterviewQuestion[]) => {
    if (!user) return;
    
    const totalScore = Math.round(allAnswers.reduce((acc, curr) => acc + curr.aiScore, 0) / allAnswers.length);
    setFinalScore(totalScore);
    
    const interviewData: InterviewData = {
      userId: user.uid,
      ...config as any,
      status: 'completada',
      totalScore,
      dimensionScores: {
        claridad: 80, // Simulation, would come from AI ideally
        coherencia: 75,
        profesionalismo: 90,
        relevancia: 85,
        estructuraSTAR: 70
      },
      duration: allAnswers.reduce((acc, curr) => acc + curr.timeSpent, 0),
      completedAt: serverTimestamp(),
      questions: allAnswers
    };

    try {
      // Save to Firebase
      const interviewId = `interview_${user.uid}_${Date.now()}`;
      await setDoc(doc(db, 'interviews', interviewId), interviewData);

      // Update user stats
      await updateDoc(doc(db, 'users', user.uid), {
        'stats.totalInterviews': increment(1),
        'stats.averageScore': Math.round(((profile?.stats?.averageScore || 0) * (profile?.stats?.totalInterviews || 0) + totalScore) / ((profile?.stats?.totalInterviews || 0) + 1)),
        'stats.bestScore': totalScore > (profile?.stats?.bestScore || 0) ? totalScore : (profile?.stats?.bestScore || 0),
        'stats.streakDays': increment(1)
      });
    } catch (e: any) {
      console.error("Error saving interview results:", e);
      handleFirestoreError(e, OperationType.WRITE, 'interviews');
    }

    setGameState('completed');
    await refreshProfile();

    if (totalScore >= 80) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#27AE60', '#2ECC71', '#ffffff']
      });
      toast.success('¡Excelente desempeño! Superaste los 80 puntos.', { duration: 5000, icon: '🏆' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <AnimatePresence mode="wait">
        
        {/* Setup State */}
        {gameState === 'setup' && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-8 py-8"
          >
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight">Simulador de Entrevistas Pro</h1>
              <p className="text-zinc-500">Practica con nuestra IA entrenada para detectar fortalezas y debilidades profesionales.</p>
            </div>

            <div className="card grid grid-cols-1 md:grid-cols-2 gap-8 !p-8 border-brand-bright/20 border-2">
               <div className="space-y-6">
                  <div>
                    <label className="label">¿Para qué cargo te preparas?</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        type="text" 
                        value={config.position} 
                        onChange={e => setConfig({ ...config, position: e.target.value })}
                        className="input-field pl-11"
                        placeholder="Ej: Gerente de Ventas"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Nivel de Seniority</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['junior', 'intermedio', 'senior', 'liderazgo'].map(lv => (
                        <button 
                          key={lv}
                          onClick={() => setConfig({ ...config, level: lv as any })}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                            config.level === lv ? 'bg-brand-bright text-white border-brand-bright' : 'bg-transparent text-zinc-500 border-zinc-200'
                          }`}
                        >
                          {lv}
                        </button>
                      ))}
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                 <div>
                    <label className="label">Área Profesional</label>
                    <select 
                      value={config.area} 
                      onChange={e => setConfig({ ...config, area: e.target.value })}
                      className="input-field cursor-pointer"
                    >
                      {AREAS_PROFESIONALES.map(area => <option key={area} value={area}>{area}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Cantidad de preguntas</label>
                    <input 
                      type="range" min="3" max="10" 
                      value={config.questionsCount}
                      onChange={e => setConfig({ ...config, questionsCount: parseInt(e.target.value) })}
                      className="w-full accent-brand-bright h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer mt-4"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-zinc-400 mt-2 px-1">
                      <span>3 PREGUNTAS</span>
                      <span className="text-brand-bright">{config.questionsCount} PREGUNTAS</span>
                      <span>10 PREGUNTAS</span>
                    </div>
                  </div>
               </div>

               <div className="md:col-span-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <label className="label mb-4">Modalidad de la entrevista</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                     {MODALIDADES_ENTREVISTA.map(mod => (
                        <button
                          key={mod.id}
                          onClick={() => setConfig({ ...config, modality: mod.id as any })}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                            config.modality === mod.id ? 'border-brand-bright bg-brand-bright/5' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'
                          }`}
                        >
                           <div className={`p-2 rounded-lg ${config.modality === mod.id ? 'bg-brand-bright text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                             {mod.id === 'conductual' && <User size={20} />}
                             {mod.id === 'tecnica' && <Wand2 size={20} />}
                             {mod.id === 'competencias' && <Star size={20} />}
                             {mod.id === 'situacional' && <AlertCircle size={20} />}
                             {mod.id === 'mixta' && <RotateCcw size={20} />}
                           </div>
                           <span className="text-[10px] uppercase font-black text-center tracking-tighter">{mod.label}</span>
                        </button>
                     ))}
                  </div>
               </div>

               <div className="md:col-span-2 pt-8 flex justify-center">
                  <button onClick={handleStart} className="btn-primary !px-16 !py-5 text-xl flex items-center gap-4 group">
                     Iniciar Simulación <Play size={24} className="group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {gameState === 'loading' && (
          <motion.div key="loading" className="flex-1 flex flex-col items-center justify-center gap-8">
             <div className="relative">
                <div className="w-32 h-32 border-4 border-zinc-100 rounded-full"></div>
                <div className="w-32 h-32 border-4 border-brand-bright border-t-transparent rounded-full animate-spin absolute top-0"></div>
                <MessageSquare className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-bright" size={40} />
             </div>
             <div className="text-center">
               <h2 className="text-2xl font-bold">Generando escenario personalizado...</h2>
               <p className="text-zinc-500 mt-2">Nuestra IA está preparando preguntas de nivel {config.level} para {config.position}.</p>
             </div>
          </motion.div>
        )}

        {/* Active State */}
        {gameState === 'active' && (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-8 py-8">
             {/* Progress Header */}
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="bg-brand-bright/10 text-brand-bright px-3 py-1 rounded-full text-xs font-black uppercase">
                     Pregunta {currentIndex + 1} de {questions.length}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-zinc-400">
                     <Clock size={14} /> {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="flex gap-1">
                   {questions.map((_, i) => (
                     <div key={i} className={`h-1 w-8 rounded-full transition-all ${i <= currentIndex ? 'bg-brand-bright' : 'bg-zinc-200'}`} />
                   ))}
                </div>
             </div>

             {/* Question Card */}
             <div className="card !p-8 relative overflow-hidden bg-brand-bright/[0.03] border-2 border-brand-bright/20 shadow-xl rounded-[2.5rem]">
                <div className="absolute -top-12 -right-12 p-8 text-brand-bright opacity-10 pointer-events-none rotate-12">
                  <MessageSquare size={160} />
                </div>
                <div className="relative z-10 flex flex-col items-center text-center py-4">
                   <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-8 shadow-xl shadow-brand-bright/10 ring-4 ring-brand-bright/5">
                     <User size={36} className="text-brand-bright" />
                   </div>
                   <h3 className="text-2xl md:text-3xl font-black leading-tight max-w-2xl text-zinc-900">
                     {questions[currentIndex]?.question}
                   </h3>
                   <div className="mt-8 flex flex-wrap justify-center gap-3">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-brand-bright/20 rounded-full text-[10px] uppercase font-black tracking-widest text-brand-bright shadow-sm">
                        <Zap size={14} /> Recomendación: Sé específico
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-zinc-200 rounded-full text-[10px] uppercase font-black tracking-widest text-zinc-500 shadow-sm">
                        <Star size={14} /> Nivel {config.level}
                      </div>
                   </div>
                </div>
             </div>

             {/* Answer Section */}
               <div className="flex-1 flex flex-col gap-4 relative z-30">
                <div className="flex-1 card relative !p-6 border-2 border-zinc-200 focus-within:border-brand-bright focus-within:ring-4 focus-within:ring-brand-bright/5 transition-all bg-white shadow-xl rounded-[2rem]">
                  <textarea 
                    id="interview-answer-textarea"
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    autoFocus
                    placeholder="Escribe tu respuesta aquí... Sé claro y estructurado."
                    className="w-full h-full min-h-[350px] bg-transparent outline-none resize-none text-lg leading-relaxed text-zinc-900 relative z-40 p-4 font-medium"
                  />
                  <div className="absolute bottom-8 right-8 flex items-center gap-4 z-50">
                     <button title="Dictar respuesta" className="p-4 bg-zinc-100 hover:bg-brand-bright hover:text-white rounded-2xl text-zinc-400 transition-all shadow-md group">
                        <Mic size={24} className="group-hover:scale-110 transition-transform" />
                     </button>
                     <button 
                       onClick={handleNext}
                       disabled={submitting}
                       className="btn-primary !p-5 rounded-2xl flex items-center gap-3 shadow-xl shadow-brand-bright/30"
                     >
                       {submitting ? <RotateCcw className="animate-spin" size={28} /> : <Send size={28} />}
                       <span className="font-black uppercase tracking-widest text-sm">{submitting ? 'Evaluando...' : 'Enviar'}</span>
                     </button>
                  </div>
                </div>
             </div>
          </motion.div>
        )}

        {/* Completed State */}
        {gameState === 'completed' && (
          <motion.div key="completed" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="py-12 space-y-12 pb-24">
             <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-brand-bright/10 text-brand-bright rounded-full flex items-center justify-center mx-auto mb-6">
                   <Trophy size={48} />
                </div>
                <h2 className="text-4xl font-extrabold tracking-tight">¡Misión Completada!</h2>
                <div className="flex items-center justify-center gap-4 py-4">
                   <div className="text-center border-r border-zinc-200 pr-8">
                      <p className="text-xs font-bold text-zinc-500 uppercase">Puntaje Global</p>
                      <p className="text-5xl font-black text-brand-bright">{finalScore}</p>
                   </div>
                   <div className="text-center">
                      <p className="text-xs font-bold text-zinc-500 uppercase">Nivel Estimado</p>
                      <p className="text-3xl font-black">{config.level.toUpperCase()}</p>
                   </div>
                </div>
                <button onClick={() => setGameState('setup')} className="text-brand-bright font-bold hover:underline flex items-center gap-2 mx-auto">
                   <RotateCcw size={18} /> Intentar Simulación de nuevo
                </button>
             </div>

             <div className="space-y-8">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                   <TrendingUp className="text-brand-bright" /> Feedback Detallado por Pregunta
                </h3>
                {answers.map((ans, i) => (
                   <div key={i} className="card !p-8 space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-sm">#{i+1}</span>
                            <h4 className="font-bold text-lg">{ans.question}</h4>
                         </div>
                         <div className="flex items-center gap-2 bg-brand-bright/10 text-brand-bright px-4 py-2 rounded-xl">
                            <Star size={16} fill="currentColor" />
                            <span className="font-black">{ans.aiScore}%</span>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-zinc-50">
                         <div className="space-y-3">
                            <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Tu Respuesta</p>
                            <p className="text-sm text-zinc-600 italic">"{ans.userAnswer}"</p>
                         </div>
                         <div className="space-y-3">
                            <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Feedback del Evaluador</p>
                            <p className="text-sm text-zinc-600">{ans.aiFeedback}</p>
                         </div>
                      </div>

                      <div className="bg-zinc-50 p-6 rounded-2xl">
                         <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 size={16} className="text-green-500" />
                            <p className="text-xs font-black uppercase text-green-500">Respuesta Ideal Sugerida</p>
                         </div>
                         <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                            {ans.idealAnswer}
                         </p>
                      </div>
                   </div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewSimulator;
