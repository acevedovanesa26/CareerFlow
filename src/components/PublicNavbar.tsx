import React from 'react';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

const PublicNavbar: React.FC = () => {
  return (
    <nav className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-zinc-100">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all">
          <div className="bg-brand-bright p-2 rounded-lg text-white shadow-sm">
            <Github size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic text-brand-dark">Career Flow</span>
        </Link>
      </div>
      <div className="hidden md:flex items-center gap-8 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
        <Link to="/about" className="hover:text-brand-bright transition-colors">Nosotros</Link>
        <Link to="/blog" className="hover:text-brand-bright transition-colors">Blog</Link>
        <Link to="/security" className="hover:text-brand-bright transition-colors">Seguridad</Link>
        <a href="/#features" className="hover:text-brand-bright transition-colors">Características</a>
      </div>
      <div className="flex items-center gap-6">
        <Link to="/login" className="btn-primary !py-2.5 !px-8 text-xs uppercase tracking-widest shadow-xl shadow-brand-bright/20">Entrar</Link>
      </div>
    </nav>
  );
};

export default PublicNavbar;
