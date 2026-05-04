import React from 'react';
import PublicNavbar from '../components/PublicNavbar';

import { Footer } from '../components/Footer';

const Terms: React.FC = () => {
  return (
    <div className="bg-white min-h-screen text-brand-dark">
      <PublicNavbar />
      <main className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-black mb-12 tracking-tight italic uppercase">Términos de Servicio</h1>
        <div className="space-y-12 text-zinc-600 leading-relaxed max-w-3xl">
          <section>
            <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Aceptación de los Términos</h2>
            <p className="mb-4">
              Al acceder y utilizar Career Flow, aceptas cumplir con estos términos de servicio. Si no estás de acuerdo con alguna parte de estos términos, no podrás utilizar nuestros servicios.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Uso del Servicio</h2>
            <p className="mb-4">
              Career Flow proporciona herramientas basadas en IA para ayudar en el desarrollo profesional. No garantizamos la obtención automática de empleo, ya que los resultados dependen de la aplicación propia del usuario y factores externos del mercado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Propiedad Intelectual</h2>
            <p className="mb-4">
              Mantienes la propiedad de todo el contenido que subas o generes en Career Flow. Nos otorgas una licencia limitada para procesar este contenido con el fin exclusivo de proporcionarte el servicio.
            </p>
          </section>

          <section>
             <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Limitación de Responsabilidad</h2>
             <p>
                Career Flow no se hace responsable de daños indirectos derivados del uso o la imposibilidad de uso del servicio.
             </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
