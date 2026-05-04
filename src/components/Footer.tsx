import { Briefcase, Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-zinc-50/50 text-zinc-600 pt-32 pb-16 border-t border-zinc-100 relative overflow-hidden">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-bright/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-bright rounded-2xl text-white shadow-lg shadow-brand-bright/30">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="font-black text-2xl tracking-tighter uppercase italic text-brand-dark">CareerFlow AI</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
              Potenciando tu carrera profesional con inteligencia artificial de vanguardia colombiana. 
              Genera documentos, practica entrevistas y construye tu futuro hoy mismo.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Linkedin].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 border border-zinc-200 rounded-xl flex items-center justify-center hover:border-brand-bright hover:text-brand-bright transition-all">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-brand-bright mb-10">Plataforma</h3>
            <ul className="space-y-4 text-zinc-500 text-sm font-bold">
              <li><Link to="/cv-builder" className="hover:text-brand-bright transition-colors">CV Inteligente</Link></li>
              <li><Link to="/interview" className="hover:text-brand-bright transition-colors">Simulador IA</Link></li>
              <li><Link to="/docs" className="hover:text-brand-bright transition-colors">Generador Doc</Link></li>
              <li><Link to="/dashboard" className="hover:text-brand-bright transition-colors">Panel Control</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-brand-bright mb-10">Empresa</h3>
            <ul className="space-y-4 text-zinc-500 text-sm font-bold">
              <li><Link to="/about" className="hover:text-brand-bright transition-colors">Sobre Nosotros</Link></li>
              <li><Link to="/blog" className="hover:text-brand-bright transition-colors">Blog & Noticias</Link></li>
              <li><Link to="/contact" className="hover:text-brand-bright transition-colors">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-brand-bright mb-10">Legal</h3>
            <ul className="space-y-4 text-zinc-500 text-sm font-bold">
              <li><Link to="/terms" className="hover:text-brand-bright transition-colors">Términos y Condiciones</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-bright transition-colors">Privacidad</Link></li>
              <li><Link to="/security" className="hover:text-brand-bright transition-colors">Seguridad</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-brand-bright mb-10">Soporte Express</h3>
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
               <p className="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest">¿Necesitas ayuda?</p>
               <a href="mailto:soporte@careerflow.ai" className="flex items-center gap-3 text-brand-dark font-black hover:text-brand-bright transition-colors">
                 <Mail size={18} className="text-brand-bright" /> soporte@cf.ai
               </a>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-zinc-100 text-center">
            <p className="text-zinc-300 text-[10px] font-black uppercase tracking-[0.5em]">
              © {new Date().getFullYear()} Career Flow Colombia. El futuro fluye aquí.
            </p>
        </div>
      </div>
    </footer>
  );
}
