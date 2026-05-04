import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Menu,
  ChevronDown,
  Settings,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { profile, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const notifications = [
    { id: 1, text: 'Tu Hoja de Vida ha sido generada exitosamente.', time: 'Hace 5m', icon: '📄', read: false },
    { id: 2, text: 'Nuevo logro desbloqueado: Entrevista Nivel Senior.', time: 'Hace 1h', icon: '🏆', read: true },
    { id: 3, text: 'Análisis de CV completado con un puntaje de 85/100.', time: 'Hace 3h', icon: '✨', read: true },
  ];

  return (
    <header className="bg-white border-b border-zinc-100 h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="md:hidden p-2 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors">
          <Menu size={24} />
        </button>
        
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar en Career Flow..."
            className="bg-zinc-50 border border-zinc-100 rounded-xl pl-10 pr-4 py-2 w-64 focus:ring-2 focus:ring-brand-bright/20 focus:border-brand-bright outline-none transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowDropdown(false);
            }}
            className="p-2 hover:bg-zinc-50 rounded-xl transition-all text-zinc-400 relative"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-bright rounded-full border-2 border-white"></span>
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-4 w-80 bg-white border border-zinc-100 rounded-2xl shadow-xl py-4 z-50"
              >
                <div className="px-6 mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-brand-dark">Notificaciones</h3>
                  <span className="text-[10px] font-black uppercase text-brand-bright bg-brand-bright/10 px-2 py-0.5 rounded">3 Nuevas</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="px-6 py-4 hover:bg-zinc-50 transition-colors cursor-pointer border-b border-zinc-50 last:border-0 flex gap-4">
                      <span className="text-xl shrink-0">{notif.icon}</span>
                      <div>
                        <p className={`text-xs ${notif.read ? 'text-zinc-500' : 'text-zinc-900 font-bold'}`}>{notif.text}</p>
                        <p className="text-[10px] text-zinc-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 mt-4">
                  <button className="text-xs font-bold text-center w-full text-brand-bright hover:underline">Ver todas las notificaciones</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative border-l border-zinc-100 pl-4 md:pl-6 ml-2">
          <button 
            onClick={() => {
              setShowDropdown(!showDropdown);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 hover:opacity-80 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-bright overflow-hidden flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile?.displayName?.charAt(0) || 'U'
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-bold text-brand-dark truncate max-w-[120px]">{profile?.displayName || 'Usuario'}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{profile?.stats.level || 'Principiante'}</p>
            </div>
            <ChevronDown size={14} className={`text-zinc-300 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-4 w-56 bg-white border border-zinc-100 rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
              >
                <Link to="/profile" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-zinc-50 transition-colors text-zinc-600 font-medium">
                  <User size={16} /> Perfil
                </Link>
                <Link to="/profile" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-zinc-50 transition-colors text-zinc-600 font-medium">
                  <Settings size={16} /> Configuración
                </Link>
                <div className="border-t border-zinc-50 my-1"></div>
                <button 
                  onClick={logout}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
