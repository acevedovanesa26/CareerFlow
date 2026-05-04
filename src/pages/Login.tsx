import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Github,
  Zap,
  Star,
  Award,
  RotateCcw
} from 'lucide-react';
import zxcvbn from 'zxcvbn';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { 
    user,
    signInWithGoogle, 
    signInWithMicrosoft, 
    registerWithEmail, 
    loginWithEmail,
    resetPassword
  } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const [passStrength, setPassStrength] = useState<{ score: number, label: string, color: string }>({
    score: 0,
    label: 'Muy Débil',
    color: 'bg-red-500'
  });

  useEffect(() => {
    if (!isLogin && formData.password) {
      const result = zxcvbn(formData.password);
      const labels = ['Muy Débil', 'Débil', 'Media', 'Fuerte', 'Muy Fuerte'];
      const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-brand-bright'];
      setPassStrength({
        score: result.score,
        label: labels[result.score],
        color: colors[result.score]
      });
    } else {
      setPassStrength({ score: 0, label: 'Muy Débil', color: 'bg-zinc-100' });
    }
  }, [formData.password, isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgot) {
        if (!formData.email) {
          toast.error('Ingresa tu correo para recuperar la contraseña');
          setLoading(false);
          return;
        }
        await resetPassword(formData.email);
        setIsForgot(false);
        setLoading(false);
        return;
      }

      if (isLogin) {
        await loginWithEmail(formData.email, formData.password);
        // navigate is handled by useEffect
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }
        if (passStrength.score < 2) {
          toast.error('La contraseña es demasiado débil');
          setLoading(false);
          return;
        }
        await registerWithEmail(formData.email, formData.password, formData.name);
        // navigate is handled by useEffect
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { title: 'Generador de documentos con IA', description: 'Crea CVs y cartas profesionales en segundos.', icon: Zap },
    { title: 'Simulación de entrevistas', description: 'Practica con feedback real de un Senior HR.', icon: Award },
    { title: 'Análisis semántico de CV', description: 'Optimiza tu perfil para superar sistemas ATS.', icon: Star },
  ];

  return (
    <div className="min-h-screen flex bg-white font-body">
      {/* Columna Izquierda - Branding (Desktop only) */}
      <div className="hidden lg:flex w-1/2 bg-zinc-50 p-16 flex-col justify-between text-brand-dark relative overflow-hidden border-r border-zinc-100">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-bright/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-bright/5 rounded-full blur-[80px]"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20">
            <div className="bg-brand-bright p-2.5 rounded-xl shadow-lg shadow-brand-bright/20 text-white">
              <Github size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-brand-dark">Career Flow</h1>
          </div>
          
          <h2 className="text-6xl font-black leading-[1.1] mb-16 tracking-tight text-brand-dark">
            Impulsa tu carrera <br />
            con <span className="text-brand-bright">IA Profesional</span>
          </h2>
          
          <div className="space-y-12 max-w-md">
            {benefits.map((b, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex gap-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-lg shadow-zinc-200/50 border border-zinc-100">
                  <b.icon className="text-brand-bright" size={28} />
                </div>
                <div>
                  <h3 className="font-black text-xl mb-1 text-brand-dark">{b.title}</h3>
                  <p className="text-zinc-500 text-base leading-relaxed">{b.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
          Colombia 2026 — El futuro del talento
        </div>
      </div>

      {/* Columna Derecha - Forms */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-zinc-50/50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-brand-dark/5 p-10 border border-zinc-100"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-3xl font-black text-brand-dark mb-1">
                {isForgot ? 'Recuperar' : (isLogin ? 'Bienvenido' : 'Únete')}
              </h3>
              <p className="text-sm text-zinc-400 font-medium">
                {isForgot ? 'Te enviaremos un enlace' : (isLogin ? 'Ingresa tus credenciales' : 'Empieza gratis hoy')}
              </p>
            </div>
            {!isForgot && (
              <button 
                onClick={() => { setIsLogin(!isLogin); setIsForgot(false); }}
                className="bg-brand-bright/10 text-brand-bright font-black text-xs px-4 py-2 rounded-full uppercase tracking-wider hover:bg-brand-bright hover:text-white transition-all"
              >
                {isLogin ? 'Nueva Cuenta' : 'Tengo Cuenta'}
              </button>
            )}
            {isForgot && (
               <button 
               onClick={() => setIsForgot(false)}
               className="text-brand-bright font-bold text-sm hover:underline"
             >
               Volver
             </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && !isForgot && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                      type="text" required
                      value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Juan Pérez"
                      className="input-field pl-11 !bg-zinc-50 border-none focus:!bg-white"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="email" required
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@correo.com"
                  className="input-field pl-11 !bg-zinc-50 border-none focus:!bg-white"
                />
              </div>
            </div>

            {!isForgot && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Contraseña</label>
                    {isLogin && (
                      <button type="button" onClick={() => setIsForgot(true)} className="text-[10px] font-bold text-brand-bright hover:underline uppercase tracking-widest">
                        ¿Olvidaste tu contraseña?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                      type={showPass ? "text" : "password"} 
                      required={!isForgot}
                      value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="input-field pl-11 pr-11 !bg-zinc-50 border-none focus:!bg-white"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {!isLogin && formData.password && (
                    <div className="mt-3 space-y-2 px-1">
                       <div className="grid grid-cols-4 gap-1.5 h-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`rounded-full transition-colors ${i <= passStrength.score + 1 ? passStrength.color : 'bg-zinc-100'}`}></div>
                        ))}
                      </div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex justify-between">
                        <span>Fortaleza de seguridad</span>
                        <span className={passStrength.score >= 2 ? 'text-brand-bright' : 'text-red-500'}>{passStrength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Confirmar Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        type={showPass ? "text" : "password"} required
                        value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="input-field pl-11 !bg-zinc-50 border-none focus:!bg-white"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-3 mt-8 !py-4 shadow-xl shadow-brand-bright/20 disabled:opacity-70"
            >
              {loading ? (
                <RotateCcw className="animate-spin" size={20} />
              ) : (
                <>
                  {isForgot ? 'Enviar Enlace' : (isLogin ? 'Iniciar Sesión' : 'Registrarme Gratuitamente')}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {!isForgot && (
            <>
              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-100"></span></div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4 text-zinc-300">O ingresa rápido con</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={signInWithGoogle}
                  className="flex items-center justify-center gap-3 py-3 border border-zinc-100 rounded-xl hover:bg-zinc-50 transition-all font-bold text-xs uppercase tracking-wider text-zinc-600"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button 
                  onClick={signInWithMicrosoft}
                  className="flex items-center justify-center gap-3 py-3 border border-zinc-100 rounded-xl hover:bg-zinc-50 transition-all font-bold text-xs uppercase tracking-wider text-zinc-600"
                >
                  <svg className="w-5 h-5" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z"/><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  Microsoft
                </button>
              </div>
            </>
          )}

          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-10 leading-relaxed">
            Al continuar aceptas nuestros <br />
            <a href="/terms" className="text-brand-bright hover:underline">Términos</a> y <a href="/privacy" className="text-brand-bright hover:underline">Políticas</a>
          </p>

          <div className="mt-8 p-4 bg-brand-bright/5 rounded-2xl border border-brand-bright/10 text-left">
            <div className="flex gap-3">
              <RotateCcw className="text-brand-bright shrink-0" size={16} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-dark mb-1">¿Problemas al iniciar sesión?</p>
                <p className="text-[10px] text-zinc-500 leading-tight">
                  Debido a políticas de seguridad del navegador, si el login falla con "error de red", te recomendamos <a href={window.location.href} target="_blank" rel="noopener noreferrer" className="text-brand-bright font-bold hover:underline">abrir la aplicación en una pestaña nueva</a>.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
