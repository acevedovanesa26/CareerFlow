import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Zap, X, ChevronRight, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const WelcomeModal: React.FC = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (user) {
      const welcomeFlag = localStorage.getItem(`welcome_${user.uid}`);
      if (welcomeFlag === 'true') {
        setTimeout(() => setShow(true), 1500);
      }
    }
  }, [user]);

  const close = () => {
    if (user) {
      localStorage.removeItem(`welcome_${user.uid}`);
    }
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-brand-dark/40 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white max-w-lg w-full rounded-[3rem] overflow-hidden shadow-2xl relative"
          >
            <button 
              onClick={close}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors z-20 text-zinc-400"
            >
              <X size={20} />
            </button>

            <div className="bg-brand-bright p-12 text-white relative overflow-hidden">
               <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
               <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="bg-white/20 p-4 rounded-3xl mb-6 backdrop-blur-xl">
                    <Mail size={48} className="text-white" />
                  </div>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">¡Bienvenido a la Élite!</h2>
                  <p className="text-white/80 font-bold uppercase text-[10px] tracking-[0.4em]">Acabas de recibir un impulso de IA</p>
               </div>
            </div>

            <div className="p-12 text-center">
               <div className="flex gap-4 mb-8">
                  <div className="flex-1 bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                    <Zap className="text-brand-bright mx-auto mb-3" size={24} />
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Status</p>
                    <p className="font-black text-brand-dark">PRO ACTIVO</p>
                  </div>
                  <div className="flex-1 bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                    <Gift className="text-brand-bright mx-auto mb-3" size={24} />
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Bonus</p>
                    <p className="font-black text-brand-dark">5 CRÉDITOS IA</p>
                  </div>
               </div>

               <h3 className="text-xl font-bold mb-4 text-brand-dark">Felicidades, {user?.displayName?.split(' ')[0]}</h3>
               <p className="text-zinc-500 italic mb-10 leading-relaxed">
                 "Tu carrera no es una línea recta, es un flujo constante de oportunidades. Estamos aquí para asegurarnos de que fluyas hacia el éxito."
               </p>

               <button 
                onClick={close}
                className="btn-primary w-full !py-4 flex items-center justify-center gap-3 shadow-xl shadow-brand-bright/20 border-none group"
               >
                 EXPLORAR MI DASHBOARD <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;
