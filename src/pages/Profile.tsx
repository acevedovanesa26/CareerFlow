import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Briefcase, 
  MapPin, 
  Linkedin, 
  Github, 
  Settings, 
  Shield, 
  Bell, 
  Save, 
  Camera,
  Globe,
  ExternalLink
} from 'lucide-react';
import { db, doc, updateDoc, sendEmailVerification, serverTimestamp, handleFirestoreError, OperationType } from '../lib/firebase';
import { AREAS_PROFESIONALES } from '../constants';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const Profile: React.FC = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    cargo: profile?.cargo || '',
    area: profile?.area || AREAS_PROFESIONALES[0],
    ciudad: profile?.ciudad || '',
    pais: profile?.pais || '',
    linkedin: profile?.linkedin || '',
    github: profile?.github || '',
    portfolio: profile?.portfolio || '',
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      await refreshProfile();
      toast.success('Perfil actualizado correctamente');
    } catch (e: any) {
      toast.error('Error al actualizar: ' + e.message);
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
         <h1 className="text-3xl font-bold tracking-tight">Mi Perfil Profesional</h1>
         <p className="text-zinc-500 mt-1">Gestiona tu información personal y preferencias de la cuenta.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Side: Avatar & Levels */}
         <div className="lg:col-span-1 space-y-6">
            <div className="card text-center">
               <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="w-full h-full rounded-3xl bg-brand-bright overflow-hidden border-4 border-white shadow-xl flex items-center justify-center text-4xl font-bold text-white uppercase italic">
                     {profile?.photoURL ? (
                        <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                        profile?.displayName?.charAt(0) || 'U'
                     )}
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-zinc-100 text-brand-bright hover:scale-110 transition-transform">
                     <Camera size={16} />
                  </button>
               </div>
               <h3 className="text-xl font-bold text-brand-dark">{profile?.displayName}</h3>
               <div className="flex flex-col items-center gap-1 mb-6">
                 <p className="text-sm text-zinc-500">{profile?.email}</p>
                 {user && !user.emailVerified && (
                   <button 
                     id="verify-email-btn"
                     onClick={async () => {
                       try {
                         await sendEmailVerification(user);
                         toast.success('Correo de verificación enviado. Revisa tu bandeja de entrada.');
                       } catch (e: any) {
                         toast.error('Error: ' + e.message);
                       }
                     }}
                     className="text-[10px] font-bold text-brand-bright hover:underline uppercase tracking-tighter"
                   >
                     Verificar Email ahora
                   </button>
                 )}
                 {user?.emailVerified && (
                   <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase">
                     <Shield size={10} /> Cuenta Verificada
                   </span>
                 )}
               </div>
               
               <div className="flex items-center justify-center gap-2 mb-8">
                  <span className="bg-brand-bright text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic">{profile?.stats?.level || 'Principiante'}</span>
                  <span className="bg-zinc-100 text-zinc-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">ID: {user?.uid.slice(0, 8)}</span>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 rounded-2xl">
                     <p className="text-2xl font-black text-brand-dark">{profile?.stats?.bestScore || 0}</p>
                     <p className="text-[10px] font-bold text-zinc-400 tracking-wider">Mejor Puntaje</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl">
                     <p className="text-2xl font-black text-brand-dark">{profile?.stats?.streakDays || 0}</p>
                     <p className="text-[10px] font-bold text-zinc-400 tracking-wider">Racha Días</p>
                  </div>
               </div>
            </div>

            <div className="card">
               <h4 className="text-sm font-black uppercase text-zinc-400 tracking-widest mb-6">Seguridad</h4>
               <nav className="space-y-2">
                  <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-all font-semibold text-sm text-zinc-600">
                     <div className="flex items-center gap-3"><Shield size={18} /> Password</div>
                     <ExternalLink size={14} className="text-zinc-300" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-all font-semibold text-sm text-zinc-600">
                     <div className="flex items-center gap-3"><Bell size={18} /> Notificaciones</div>
                     <span className="w-2 h-2 bg-brand-bright rounded-full"></span>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-all font-semibold text-sm text-zinc-600">
                     <div className="flex items-center gap-3"><Globe size={18} /> Idioma & Región</div>
                     <span className="text-[10px] text-zinc-400 font-bold">ES-CO</span>
                  </button>
               </nav>
            </div>
         </div>

         {/* Right Side: Forms */}
         <div className="lg:col-span-2">
            <form onSubmit={handleUpdate} className="card !p-10 space-y-8 bg-white">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                     <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-brand-dark">
                        <Settings size={20} className="text-brand-bright" /> Información General
                     </h3>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">Nombre para mostrar</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        type="text" 
                        value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                        className="input-field pl-11"
                        placeholder="Tu nombre"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">Correo Electrónico</label>
                    <div className="relative opacity-60">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input type="text" readOnly value={profile?.email || ''} className="input-field pl-11 bg-zinc-50 cursor-not-allowed" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">Cargo / Especialidad</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        type="text" 
                        value={formData.cargo} onChange={e => setFormData({ ...formData, cargo: e.target.value })}
                        className="input-field pl-11"
                        placeholder="Ej: Data Scientist"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">Área Profesional</label>
                    <select 
                      value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })}
                      className="input-field cursor-pointer"
                    >
                      {AREAS_PROFESIONALES.map(area => <option key={area} value={area}>{area}</option>)}
                    </select>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-zinc-100">
                  <div className="col-span-2">
                     <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-brand-dark">
                        <MapPin size={20} className="text-brand-bright" /> Ubicación
                     </h3>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">Ciudad</label>
                    <input 
                      type="text" 
                      value={formData.ciudad} onChange={e => setFormData({ ...formData, ciudad: e.target.value })}
                      className="input-field"
                      placeholder="Ej: Bogotá"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">País</label>
                    <input 
                      type="text" 
                      value={formData.pais} onChange={e => setFormData({ ...formData, pais: e.target.value })}
                      className="input-field"
                      placeholder="Ej: Colombia"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-zinc-100">
                  <div className="col-span-2">
                     <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-brand-dark">
                        <Linkedin size={20} className="text-brand-bright" /> Redes & Portfolio
                     </h3>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">LinkedIn</label>
                    <input 
                      type="text" 
                      value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                      className="input-field"
                      placeholder="URL de LinkedIn"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">GitHub</label>
                    <input 
                      type="text" 
                      value={formData.github} onChange={e => setFormData({ ...formData, github: e.target.value })}
                      className="input-field"
                      placeholder="URL de GitHub"
                    />
                  </div>
               </div>

               <div className="flex justify-end gap-4 pt-8">
                  <button type="button" className="btn-secondary !bg-zinc-100 !text-zinc-800 hover:!bg-zinc-200 border-none">Cancelar</button>
                  <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-12 shadow-lg shadow-brand-bright/20">
                     {loading ? <RotateCw className="animate-spin" size={18} /> : <Save size={18} />}
                     Guardar Cambios
                  </button>
               </div>
            </form>
         </div>
      </div>
    </div>
  );
};

const RotateCw = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);

export default Profile;
