import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import PublicNavbar from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { 
  MessageSquare, 
  User, 
  Calendar, 
  ChevronRight, 
  Send,
  Heart,
  Share2,
  Bookmark,
  ShieldAlert
} from 'lucide-react';
import { db, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from '../lib/firebase';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  name: string;
  text: string;
  createdAt: any;
}

const Blog: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({ name: '', text: '' });
  const [loadingComments, setLoadingComments] = useState(true);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);

  const blogPosts = [
    {
      id: 1,
      title: 'Cómo superar los filtros ATS en 2026',
      excerpt: 'Descubre las claves para que tu CV no sea descartado por la inteligencia artificial de las empresas.',
      content: 'Los algoritmos ATS (Applicant Tracking Systems) han evolucionado. En 2026, ya no basta con repetir palabras clave. La IA semántica ahora busca contexto y logros cuantificables. Asegúrate de que tu CV use un formato limpio, evita tablas complejas y enfócate en verbos de acción. Career Flow te ayuda a identificar estas sutilezas antes de enviar tu aplicación.',
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=1200',
      category: 'Estrategia',
      date: 'May 12, 2026',
      readTime: '5 min'
    },
    {
      id: 2,
      title: 'La guía definitiva para entrevistas virtuales',
      excerpt: 'Desde la iluminación hasta el lenguaje corporal, todo lo que necesitas saber.',
      content: 'Las entrevistas por video son la norma. Practica mirar a la cámara, no a la pantalla. Usa fondos neutros y asegúrate de que tu iluminación sea frontal. Con nuestro simulador de IA, analizamos tu tono de voz y micro-expresiones para darte ventaja competitiva. El éxito está en la preparación proactiva.',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1200',
      category: 'Entrevistas',
      date: 'May 10, 2026',
      readTime: '8 min'
    }
  ];

  useEffect(() => {
    const q = query(collection(db, 'blog_comments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(docs);
      setLoadingComments(false);
    });
    return unsubscribe;
  }, []);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.name || !newComment.text) {
      toast.error('Completa los campos');
      return;
    }
    try {
      await addDoc(collection(db, 'blog_comments'), {
        ...newComment,
        createdAt: serverTimestamp()
      });
      setNewComment({ name: '', text: '' });
      toast.success('¡Comentario enviado!');
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  };

  return (
    <div className="bg-white min-h-screen text-brand-dark">
      <PublicNavbar />

      <main className="max-w-5xl mx-auto px-6 py-20">
        <header className="mb-20">
          <h1 className="text-5xl font-black tracking-tight mb-6 italic uppercase italic">Blog de Carrera</h1>
          <p className="text-xl text-zinc-500 max-w-2xl leading-relaxed">
            Consejos expertos sobre el mercado laboral, tecnología IA y desarrollo profesional.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
          {blogPosts.map((post) => (
            <motion.article 
              key={post.id}
              layout
              className="group bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm hover:shadow-2xl transition-all"
            >
              <div className="relative aspect-[16/9] rounded-[2rem] overflow-hidden mb-8 shadow-inner">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-6 left-6 bg-brand-bright text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-lg shadow-brand-bright/30">
                  {post.category}
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-6">
                <span className="flex items-center gap-2"><Calendar size={14} className="text-brand-bright" /> {post.date}</span>
                <span className="flex items-center gap-2"><User size={14} className="text-brand-bright" /> Career Flow</span>
              </div>
              <h2 className="text-3xl font-black mb-4 group-hover:text-brand-bright transition-colors leading-[1.1] text-brand-dark">{post.title}</h2>
              <p className="text-zinc-500 mb-8 leading-relaxed text-lg">
                {expandedPost === post.id ? post.content : post.excerpt}
              </p>
              <button 
                onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                className="inline-flex items-center gap-3 text-brand-bright font-black uppercase text-xs tracking-[0.2em] hover:gap-5 transition-all group/btn"
              >
                {expandedPost === post.id ? 'Ver menos' : 'Leer artículo completo'} 
                <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.article>
          ))}
        </section>

        {/* Sección de Comentarios de la comunidad */}
        <section className="bg-zinc-50 rounded-[3rem] p-12 border border-zinc-100">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black mb-2 italic uppercase text-brand-dark">Comunidad Career Flow</h2>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-8 flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0">
                <ShieldAlert size={16} />
              </div>
              <p className="text-amber-900 text-xs leading-relaxed">
                <strong>Aviso de Privacidad:</strong> Este es un foro público. Todos los comentarios son visibles para cualquier usuario de la plataforma. Evita compartir datos personales sensibles.
              </p>
            </div>
            <p className="text-zinc-500 mb-12">¿Qué te parece la plataforma? ¡Déjanos tu opinión!</p>

            <form onSubmit={handleComment} className="space-y-6 mb-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block ml-1">Tu Nombre</label>
                  <input 
                    type="text" 
                    value={newComment.name}
                    onChange={e => setNewComment({ ...newComment, name: e.target.value })}
                    className="input-field !bg-white"
                    placeholder="Ej: Laura Gómez"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block ml-1">Comentario</label>
                  <input 
                    type="text" 
                    value={newComment.text}
                    onChange={e => setNewComment({ ...newComment, text: e.target.value })}
                    className="input-field !bg-white"
                    placeholder="Me encanta esta app..."
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full shadow-lg shadow-brand-bright/20 flex items-center justify-center gap-3">
                Enviar Comentario <Send size={18} />
              </button>
            </form>

            <div className="space-y-6">
              {loadingComments ? (
                <p className="text-center text-zinc-400 animate-pulse font-bold uppercase text-[10px] tracking-widest">Cargando comentarios...</p>
              ) : comments.length === 0 ? (
                <p className="text-center text-zinc-400 italic">No hay comentarios aún. ¡Sé el primero!</p>
              ) : (
                comments.map((c) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={c.id} 
                    className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-bright/10 text-brand-bright flex items-center justify-center font-bold">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{c.name}</p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase">
                            {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : 'Hoy'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-zinc-300 hover:text-red-500 transition-colors"><Heart size={16} /></button>
                      </div>
                    </div>
                    <p className="text-zinc-600 leading-relaxed text-sm">{c.text}</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
