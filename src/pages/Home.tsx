import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Zap, 
  Star, 
  Globe, 
  Github, 
  PlayCircle,
  Target,
  MessageSquare,
  Download,
  TrendingUp,
  Search,
  CheckCircle2,
  Cpu,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PublicNavbar from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { db, collection, addDoc, serverTimestamp } from '../lib/firebase';

const Home: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-white min-h-screen overflow-x-hidden text-brand-dark">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8 }}
          className="relative z-30"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-bright/10 text-brand-bright rounded-full text-xs font-black uppercase tracking-widest mb-8">
            <Zap size={14} /> Potenciado por IA de última generación
          </div>
          <h1 className="text-6xl lg:text-8xl font-black leading-[1] tracking-tighter mb-8">
            Tu Carrera, <br />
            <span className="text-brand-bright">Impulsada</span> <br />
            por Datos.
          </h1>
          <p className="text-xl text-zinc-500 mb-10 max-w-lg leading-relaxed">
            La plataforma definitiva para profesionales que buscan destacar. Analiza tu CV, simula entrevistas y acelera tu éxito laboral con herramientas de IA inteligente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 relative z-20">
            <Link to="/login" id="hero-start-btn" className="btn-primary !px-10 !py-5 text-xl flex items-center justify-center gap-3 shadow-xl shadow-brand-bright/20 border-none">
               Empezar Ahora <ArrowRight size={22} />
            </Link>
            <Link to="/about" id="hero-about-btn" className="btn-secondary !bg-white !text-brand-dark border-2 border-zinc-100 !px-10 !py-5 text-xl flex items-center justify-center gap-3 hover:!bg-zinc-50 hover:border-brand-bright/20">
               Sobre Nosotros <Star size={22} />
            </Link>
          </div>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, scale: 0.9 }} 
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1 }}
           className="relative z-10"
        >
          <div className="absolute inset-0 bg-brand-bright/10 blur-[120px] rounded-full scale-150 pointer-events-none -z-10"></div>
          <div className="relative card !p-2 bg-white border-8 border-zinc-50 shadow-2xl rounded-[3rem] overflow-hidden">
             <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" alt="Dashboard" className="rounded-[2.5rem] w-full" />
             <div className="absolute bottom-10 left-10 card !bg-white/95 backdrop-blur-xl border-none shadow-2xl p-6 flex gap-5 items-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-bright text-white flex items-center justify-center shadow-lg shadow-brand-bright/30">
                   <TrendingUp size={28} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-1">Impacto Profesional</p>
                   <p className="text-2xl font-black">+45% Éxito</p>
                </div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section className="py-32 bg-white overflow-hidden">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24">
               <span className="text-brand-bright text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Proceso de Éxito</span>
               <h2 className="text-5xl font-black tracking-tighter italic uppercase italic">¿Cómo funciona Career Flow?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-20 relative px-4 z-10">
               <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-50 -translate-y-1/2 hidden md:block -z-10 opacity-50"></div>
               {[
                 { 
                   step: '01', 
                   title: 'Sube tu Perfil', 
                   desc: 'Importa tu CV actual o crea uno desde cero con nuestro editor inteligente.',
                   icon: FileText,
                   link: '/cv-builder'
                 },
                 { 
                   step: '02', 
                   title: 'Analiza con IA', 
                   desc: 'Nuestra tecnología escanea miles de vacantes para darte recomendaciones exactas.',
                   icon: Cpu,
                   link: '/cv-analyzer'
                 },
                 { 
                   step: '03', 
                   title: 'Conquista la Oferta', 
                   desc: 'Simula la entrevista con IA y genera las cartas perfectas para ser contratado.',
                   icon: Target,
                   link: '/interview'
                 }
               ].map((s, i) => (
                 <motion.div 
                    key={i}
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 30 }}
                    viewport={{ once: true }}
                    className="relative z-10 text-center group"
                 >
                    <Link to={s.link} className="block group">
                      <div className="w-20 h-20 rounded-3xl bg-brand-bright text-white flex items-center justify-center mx-auto mb-8 text-3xl font-black italic shadow-xl shadow-brand-bright/30 border-4 border-white group-hover:scale-110 transition-transform">
                         <s.icon size={32} />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-brand-bright transition-colors">{s.title}</h3>
                      <p className="text-zinc-500 leading-relaxed text-sm px-4">{s.desc}</p>
                      <div className="mt-6 text-[10px] font-black text-brand-bright uppercase tracking-widest">{s.step} Paso</div>
                    </Link>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-zinc-50/50 py-32 border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center max-w-2xl mx-auto mb-24">
              <h2 className="text-5xl font-black tracking-tight mb-6 text-brand-dark italic uppercase italic">Poder absoluto <br />en tus manos</h2>
              <p className="text-lg text-zinc-500">Herramientas que antes eran exclusivas para agencias de reclutamiento.</p>
           </div>

           <motion.div 
              variants={container} initial="hidden" whileInView="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
           >
              {[
                { title: 'Generación Dinámica', desc: 'Crea CVs, cartas de presentación y perfiles LinkedIn con el tono profesional perfecto.', icon: Zap },
                { title: 'Análisis ATS Real', desc: 'Escanea tu CV con la misma tecnología que usan las empresas de Fortune 500.', icon: Search },
                { title: 'Simulador de Entrevistas', desc: 'Recibe feedback instantáneo de una IA sobre tu tono de voz y respuestas clave.', icon: MessageSquare },
                { title: 'IA Semántica Pro', desc: 'Analizamos palabras clave ocultas en las ofertas para resaltar tu experiencia.', icon: Globe },
                { title: 'Exportación Formateada', desc: 'Descarga tus documentos listos para impresión o envío digital en alta calidad.', icon: Download },
                { title: 'Racha de Éxito', desc: 'Lleva el control de tus aplicaciones y mantente motivado con gamificación profesional.', icon: TrendingUp },
              ].map((f, i) => (
                <motion.div key={i} variants={item} className="card group hover:!border-brand-bright transition-all p-12 bg-white shadow-sm hover:shadow-2xl border-zinc-100">
                   <div className="w-16 h-16 rounded-2xl bg-zinc-50 text-brand-bright flex items-center justify-center mb-8 group-hover:bg-brand-bright group-hover:text-white transition-all transform group-hover:rotate-6 shadow-sm">
                      <f.icon size={32} />
                   </div>
                   <h3 className="text-2xl font-black mb-4 text-brand-dark">{f.title}</h3>
                   <p className="text-zinc-500 leading-relaxed text-base">{f.desc}</p>
                </motion.div>
              ))}
           </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
