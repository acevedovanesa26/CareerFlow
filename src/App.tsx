import * as React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CVBuilder from "./pages/CVBuilder";
import CVAnalyzer from "./pages/CVAnalyzer";
import InterviewSimulator from "./pages/InterviewSimulator";
import DocumentGenerator from "./pages/DocumentGenerator";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Security from "./pages/Security";

import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, db, doc, setDoc, serverTimestamp, type FirebaseUser } from "./lib/firebase";
import { toast } from "sonner";

const Login = () => {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Save user to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      toast.success("¡Bienvenido a CareerFlow AI!");
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/unauthorized-domain') {
        toast.error("Dominio no autorizado. Debes añadir tu URL de Vercel en la consola de Firebase (Authentication > Settings > Authorized Domains).");
      } else {
        toast.error("Error al iniciar sesión con Google.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-dark text-white p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="inline-flex p-4 bg-brand-light rounded-2xl mb-4">
          <svg className="w-12 h-12 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">CareerFlow AI</h1>
        <p className="text-zinc-400 text-lg">Tu compañero inteligente para el éxito profesional.</p>
        
        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-brand-dark font-semibold py-4 px-6 rounded-xl hover:bg-zinc-100 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuar con Google
        </button>
        
        <div className="pt-8 text-zinc-500 text-sm">
          Al continuar, aceptas nuestros Términos y Política de Privacidad.
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Sesión cerrada correctamente.");
    } catch (error) {
      console.error(error);
      toast.error("Error al cerrar sesión.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-dark">
        <div className="w-12 h-12 border-4 border-brand-light border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login />} 
        />
        <Route
          path="/*"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/cv-builder" element={<CVBuilder />} />
                  <Route path="/cv-analyzer" element={<CVAnalyzer />} />
                  <Route path="/interview" element={<InterviewSimulator />} />
                  <Route path="/docs" element={<DocumentGenerator />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/security" element={<Security />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}
