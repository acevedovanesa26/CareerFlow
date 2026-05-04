import React from 'react';
import PublicNavbar from '../components/PublicNavbar';
import { Footer } from '../components/Footer';

const Privacy: React.FC = () => {
  return (
    <div className="bg-white min-h-screen text-brand-dark">
      <PublicNavbar />
      <main className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-black mb-12 tracking-tight italic uppercase">Política de Privacidad</h1>
        <div className="space-y-12 text-zinc-600 leading-relaxed max-w-3xl">
          <section>
            <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Recopilación de Información</h2>
            <p className="mb-4">
              En Career Flow, nos tomamos muy en serio la seguridad de tus datos. Recopilamos información personal básica (nombre, correo electrónico) y datos relacionados con tu carrera profesional cuando utilizas nuestras herramientas de generación de CV y análisis.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Uso de Inteligencia Artificial</h2>
            <p className="mb-4">
              Utilizamos modelos de IA avanzados para analizar y mejorar tus documentos. Tus datos se procesan de forma privada y no se utilizan para entrenar modelos públicos sin tu consentimiento explícito.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Seguridad de los Datos</h2>
            <p className="mb-4">
              Implementamos medidas de seguridad de vanguardia para proteger tus datos contra el acceso no autorizado, la alteración o la divulgación ilícita. Utilizamos encriptación de extremo a extremo y protocolos de seguridad de Firebase.
            </p>
          </section>

          <section>
             <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Tus Derechos</h2>
             <p>
                Tienes derecho a acceder, corregir o eliminar tus datos personales en cualquier momento desde tu panel de ajustes en Career Flow.
             </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
