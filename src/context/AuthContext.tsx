import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  FirebaseUser,
  googleProvider,
  microsoftProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from '../lib/firebase';
import { UserProfile, UserStats } from '../types';
import { DEFAULT_USER_STATS } from '../constants';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        let needsUpdate = false;
        
        // Merge missing defaults for legacy users
        if (!data.preferences) {
          data.preferences = {
            darkMode: false,
            emailNotifications: { welcome: true, interviewReport: true, weeklySummary: true, inactivity: true },
            idioma: 'es',
            fontSize: 'medium'
          };
          needsUpdate = true;
        }
        if (!data.stats) {
          data.stats = DEFAULT_USER_STATS;
          needsUpdate = true;
        }
        if (data.provider === undefined) {
          data.provider = auth.currentUser?.providerData[0]?.providerId || 'password';
          needsUpdate = true;
        }

        if (needsUpdate) {
          await updateDoc(docRef, { 
            preferences: data.preferences, 
            stats: data.stats,
            provider: data.provider 
          });
        }
        setProfile(data);
      } else {
        // Create default profile if not exists
        const newProfile: UserProfile = {
          uid,
          email: auth.currentUser?.email || '',
          displayName: auth.currentUser?.displayName || '',
          photoURL: auth.currentUser?.photoURL || '',
          provider: auth.currentUser?.providerData[0]?.providerId || 'password',
          role: 'user',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          preferences: {
            darkMode: false,
            emailNotifications: { welcome: true, interviewReport: true, weeklySummary: true, inactivity: true },
            idioma: 'es',
            fontSize: 'medium'
          },
          stats: DEFAULT_USER_STATS,
          cargo: '',
          area: '',
          ciudad: '',
          pais: '',
          linkedin: ''
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  useEffect(() => {
    // We use a ref to track if ofAuthStateChanged has fired
    let fired = false;

    const authTimeout = setTimeout(() => {
      if (!fired) {
        setLoading(false);
        console.warn("Auth timeout reached, forcing loading false");
      }
    }, 6000); // 6 second safety timeout

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      fired = true;
      try {
        clearTimeout(authTimeout);
        setUser(u);
        if (u) {
          await fetchProfile(u.uid);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth status change error:", error);
        toast.error("Error al conectar con la base de datos");
      } finally {
        setLoading(false);
      }
    });
    return () => {
      unsubscribe();
      clearTimeout(authTimeout);
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Sesión iniciada con Google');
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      if (error.code === 'auth/network-request-failed') {
        toast.error('Error de red al iniciar sesión. Esto suele ocurrir por bloqueadores de anuncios o restricciones del navegador (iframe). Prueba abriendo la app en una pestaña nueva.', { duration: 10000 });
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('El inicio de sesión con Google no está habilitado en la consola de Firebase. Por favor actívalo en Authentication > Sign-in method.', { duration: 8000 });
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('La ventana de inicio de sesión se cerró.');
      } else {
        toast.error('Error al iniciar sesión: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  const signInWithMicrosoft = async () => {
    try {
      await signInWithPopup(auth, microsoftProvider);
      toast.success('Sesión iniciada con Microsoft');
    } catch (error: any) {
      console.error("Microsoft Auth Error:", error);
      if (error.code === 'auth/network-request-failed') {
        toast.error('Error de red. Prueba abriendo la app en una pestaña nueva o desactiva bloqueadores de anuncios.', { duration: 10000 });
      } else {
        toast.error('Error al iniciar sesión: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      
      // Attempt to update profile name
      try {
        await updateProfile(cred.user, { displayName: name });
      } catch (e) {
        console.warn("Could not update display name during register:", e);
      }

      // Attempt to send verification email (non-blocking)
      try {
        await sendEmailVerification(cred.user);
        setTimeout(() => {
          toast('Te hemos enviado un correo de verificación. Por favor revisa tu bandeja de entrada o spam.', {
            icon: '✉️',
            duration: 8000
          });
        }, 3000);
      } catch (e: any) {
        console.warn("Could not send verification email:", e);
        if (e.code === 'auth/too-many-requests') {
          toast.error('Has solicitado demasiados correos de verificación. Intenta más tarde.');
        }
      }

      localStorage.setItem(`welcome_${cred.user.uid}`, 'true');
      toast.success('¡Registro exitoso! Ya puedes usar Career Flow.');
      
    } catch (error: any) {
      console.error("Register Error:", error);
      if (error.code === 'auth/network-request-failed') {
        toast.error('Error de red. Verifica tu conexión o intenta en una pestaña nueva.', { duration: 8000 });
      } else {
        let msg = 'Error en el registro';
        if (error.code === 'auth/email-already-in-use') msg = 'Este correo ya está en uso';
        if (error.code === 'auth/invalid-email') msg = 'Correo no válido';
        if (error.code === 'auth/weak-password') msg = 'La contraseña es muy débil';
        toast.error(msg + ': ' + (error.message || 'Error desconocido'));
      }
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast.success('Sesión iniciada');
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === 'auth/network-request-failed') {
        toast.error('Error de red al iniciar sesión. Intenta en una pestaña nueva o revisa bloqueadores de anuncios.', { duration: 8000 });
      } else {
        toast.error('Error al iniciar sesión: ' + (error.message || 'Error desconocido'));
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Sesión cerrada');
    } catch (error: any) {
      toast.error('Error al cerrar sesión');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Enlace de recuperación enviado al correo.');
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, 
      signInWithGoogle, signInWithMicrosoft, 
      registerWithEmail, loginWithEmail, logout,
      resetPassword, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
