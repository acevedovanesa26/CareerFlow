import { Briefcase, Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white pt-16 pb-8 border-t border-white/10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-brand-light rounded-lg">
                <Briefcase className="w-6 h-6 text-brand-dark" />
              </div>
              <span className="font-bold text-xl tracking-tight">CareerFlow AI</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Potenciando tu carrera profesional con inteligencia artificial de vanguardia. 
              Genera documentos, practica entrevistas y construye tu futuro hoy.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-zinc-400 hover:text-brand-light transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-zinc-400 hover:text-brand-light transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-zinc-400 hover:text-brand-light transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-zinc-400 hover:text-brand-light transition-colors"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-6 text-lg">Plataforma</h3>
            <ul className="space-y-4 text-zinc-400 text-sm">
              <li><Link to="/cv-builder" className="hover:text-white transition-colors">Constructor de CV</Link></li>
              <li><Link to="/interview" className="hover:text-white transition-colors">Simulador de Entrevistas</Link></li>
              <li><Link to="/docs" className="hover:text-white transition-colors">Generador de Documentos</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Panel de Control</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-6 text-lg">Legal</h3>
            <ul className="space-y-4 text-zinc-400 text-sm">
              <li><Link to="/terms" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
              <li><Link to="/security" className="hover:text-white transition-colors">Seguridad</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-6 text-lg">Contacto</h3>
            <ul className="space-y-4 text-zinc-400 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-brand-light" />
                soporte@careerflow.ai
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-brand-light" />
                +57 (300) 123-4567
              </li>
              <li className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-brand-light" />
                Bogotá, Colombia
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-zinc-500 text-xs">
          <p>© {new Date().getFullYear()} CareerFlow AI. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
