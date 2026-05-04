import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { ShieldCheck, Lock, ShieldAlert, Cpu, Eye, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const Security: React.FC = () => {
  return (
    <div className="bg-white min-h-screen text-brand-dark">
      <PublicNavbar />

      <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="text-brand-bright text-[10px] font-black uppercase tracking-[0.2em] mb-4 block">Seguridad Career Flow</span>
          <h1 className="text-6xl font-black tracking-tighter mb-6">Tu carrera, <br /><span className="text-brand-bright">Protegida</span></h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Implementamos estándares de seguridad de nivel bancario para asegurar que tu información profesional esté siempre a salvo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            { 
              title: 'Cifrado Total', 
              desc: 'Tus documentos y datos personales están protegidos con encriptación AES-256 en reposo y TLS 1.3 en tránsito.',
              icon: Lock,
              color: 'bg-blue-500'
            },
            { 
              title: 'Privacidad IA', 
              desc: 'Tus interacciones con nuestra IA son privadas. No compartimos tus datos con terceros para entrenamiento de modelos.',
              icon: Cpu,
              color: 'bg-brand-bright'
            },
            { 
              title: 'Acceso Seguro', 
              desc: 'Autenticación robusta respaldada por Google y Firebase, garantizando que solo tú accedas a tu perfil.',
              icon: ShieldCheck,
              color: 'bg-green-500'
            }
          ].map((item, i) => (
            <div key={i} className="card !p-12 hover:shadow-2xl transition-all border-2 border-zinc-50">
              <div className={`w-16 h-16 rounded-2xl ${item.color} text-white flex items-center justify-center mb-8 shadow-lg`}>
                <item.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-zinc-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <section className="bg-zinc-50 rounded-[3rem] p-12 md:p-20 border border-zinc-100 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-brand-bright/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
           
           <div className="max-w-3xl relative z-10">
              <h2 className="text-4xl font-black mb-12 italic uppercase">Compromiso de Datos</h2>
              <div className="space-y-8">
                 {[
                   { title: 'Tus datos son tuyos', text: 'Puedes exportar o eliminar toda tu información en cualquier momento desde tu perfil.' },
                   { title: 'Sin SPAM', text: 'Solo te enviaremos correos críticos para tu cuenta o verificaciones de seguridad.' },
                   { title: 'IA Ética', text: 'Nuestros algoritmos están diseñados para ser objetivos y reducir sesgos en tu carrera.' },
                   { title: 'Infraestructura Google', text: 'Operamos sobre los servidores más seguros del mundo para garantizar disponibilidad 99.9%.' }
                 ].map((c, i) => (
                   <div key={i} className="flex gap-6">
                      <div className="mt-1">
                         <CheckCircle2 className="text-brand-bright" size={24} />
                      </div>
                      <div>
                         <h4 className="text-xl font-bold mb-2">{c.title}</h4>
                         <p className="text-zinc-500">{c.text}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        <section className="mt-32 py-20 border-t border-zinc-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
             <div>
                <h3 className="text-3xl font-black mb-6 italic uppercase">¿Problemas con el correo?</h3>
                <p className="text-zinc-500 mb-8 leading-relaxed">
                  Si no estás recibiendo nuestros correos de verificación, es probable que tu servidor de correo los esté filtrando. Por favor revisa tu carpeta de <strong>SPAM</strong> o agrega nuestro dominio a tu lista de confianza.
                </p>
                <div className="flex gap-4">
                   <div className="p-4 bg-red-50 rounded-2xl text-red-600">
                      <ShieldAlert size={32} />
                   </div>
                   <p className="text-sm text-zinc-400 max-w-xs">
                     Nunca te pediremos tu contraseña por correo electrónico. Mantén tus credenciales seguras.
                   </p>
                </div>
             </div>
             <div className="bg-brand-dark p-12 rounded-[2rem] text-white">
                <Eye className="text-brand-bright mb-6" size={40} />
                <h4 className="text-2xl font-bold mb-4">Transparencia Total</h4>
                <p className="text-zinc-400 mb-8">
                  Nuestra política de privacidad detalla exactamente cómo manejamos cada bit de información. Tu confianza es nuestro activo más valioso.
                </p>
                <Link 
                  to="/privacy"
                  className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all border border-white/10 flex items-center justify-center text-center"
                >
                   Ver Política de Privacidad
                </Link>
             </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Security;
