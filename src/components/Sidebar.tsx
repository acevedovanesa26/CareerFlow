import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  FileEdit, 
  Search, 
  MessageSquare, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Documentos', icon: FileText, path: '/docs' },
    { name: 'Constructor CV', icon: FileEdit, path: '/cv-builder' },
    { name: 'Analizador CV', icon: Search, path: '/cv-analyzer' },
    { name: 'Entrevistas', icon: MessageSquare, path: '/interview' },
    { name: 'Mi Perfil', icon: User, path: '/profile' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 260 : 80 }}
      className="bg-white border-r border-zinc-100 flex flex-col transition-all duration-300 relative z-40 hidden md:flex h-screen sticky top-0"
    >
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-bright p-2 rounded-lg shadow-sm">
            <Briefcase size={24} className="text-white" />
          </div>
          {isOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-black tracking-tight text-brand-dark whitespace-nowrap italic uppercase"
            >
              Career Flow
            </motion.span>
          )}
        </div>
      </div>

      <nav className="flex-1 mt-4 px-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 p-3 rounded-xl transition-all group
              ${isActive 
                ? 'bg-brand-bright/10 text-brand-bright font-bold' 
                : 'hover:bg-zinc-50 text-zinc-500 hover:text-brand-dark font-medium'}
            `}
          >
            <item.icon size={20} className={`min-w-[20px] ${isOpen ? '' : 'mx-auto'}`} />
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="whitespace-nowrap"
              >
                {item.name}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-100">
        <button
          onClick={logout}
          className="flex items-center gap-4 p-3 w-full rounded-xl hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-all font-medium"
        >
          <LogOut size={20} className={`min-w-[20px] ${isOpen ? '' : 'mx-auto'}`} />
          {isOpen && (
              <span className="whitespace-nowrap">Cerrar Sesión</span>
          )}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggle}
        className="absolute top-1/2 -right-3 bg-white border border-zinc-200 rounded-full p-1 shadow-md text-zinc-400 hover:text-brand-bright hover:scale-110 transition-transform hidden lg:block"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
