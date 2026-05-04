import React from 'react';
import PublicNavbar from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { Target, Users, Zap, Award, Globe, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="bg-white min-h-screen text-brand-dark">
      <PublicNavbar />

      <main>
        {/* Story Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <span className="text-brand-bright text-[10px] font-black uppercase tracking-[0.2em] mb-4 block">Nuestra Historia</span>
            <h1 className="text-6xl font-black tracking-tighter mb-8 leading-tight">
              Reinventando la <br />
              <span className="text-brand-bright">Búsqueda Laboral</span>
            </h1>
            <p className="text-xl text-zinc-500 mb-8 leading-relaxed">
              Career Flow nació en Colombia con la misión de democratizar herramientas de élite para profesionales. Creemos que la inteligencia artificial no reemplaza al talento, sino que lo potencia.
            </p>
            <div className="space-y-4">
               <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 italic font-medium text-zinc-600 mb-8">
                  "Nuestra meta es que cada candidato tenga la confianza de un profesional Senior en su próxima entrevista."
               </div>
               <Link to="/login" className="btn-primary !px-10 !py-4 flex items-center gap-3 w-fit shadow-xl shadow-brand-bright/20 border-none group">
                 Empezar ahora <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
          </motion.div>
          <div className="relative">
             <div className="absolute inset-0 bg-brand-bright/10 blur-[100px] rounded-full scale-110"></div>
             <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2400" className="relative rounded-[3rem] shadow-2xl border-8 border-white" alt="Team" />
          </div>
        </section>

        {/* Values */}
        <section className="bg-zinc-50/50 py-32 border-y border-zinc-100">
           <div className="max-w-7xl mx-auto px-6 text-center mb-20">
              <h2 className="text-4xl font-black mb-4">Lo que nos mueve</h2>
              <p className="text-zinc-500 max-w-xl mx-auto">Valores que guían cada línea de código que escribimos para tu futuro.</p>
           </div>
           <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Excelencia IA', desc: 'Usamos los modelos más avanzados para garantizar precisión en cada análisis.', icon: Zap },
                { title: 'Pasión por el Talento', desc: 'Ayudamos a las personas a descubrir su verdadero valor en el mercado.', icon: Heart },
                { title: 'Impacto Global', desc: 'Tecnología colombiana con alcance mundial e impacto real.', icon: Globe },
              ].map((v, i) => (
                <div key={i} className="card !p-12 text-center group bg-white">
                   <div className="w-16 h-16 rounded-2xl bg-brand-bright/10 text-brand-bright flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                      <v.icon size={32} />
                   </div>
                   <h3 className="text-2xl font-bold mb-4">{v.title}</h3>
                   <p className="text-zinc-500">{v.desc}</p>
                </div>
              ))}
           </div>
        </section>

        {/* Stats */}
        <section className="py-32">
           <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-16 items-center">
              <div>
                 <h2 className="text-4xl font-black mb-2 italic uppercase">Números que inspiran</h2>
                 <p className="text-zinc-500">Nuestra comunidad crece día a día.</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-12 text-center">
                 <div>
                    <p className="text-5xl font-black text-brand-bright mb-2">+50K</p>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">CVs Optimizados</p>
                 </div>
                 <div>
                    <p className="text-5xl font-black text-brand-bright mb-2">95%</p>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Tasa de éxito</p>
                 </div>
                 <div className="hidden lg:block">
                    <p className="text-5xl font-black text-brand-bright mb-2">24/7</p>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Soporte IA</p>
                 </div>
              </div>
           </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
