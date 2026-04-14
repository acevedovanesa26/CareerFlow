import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Mic2, 
  FilePlus,
  BarChart3
} from "lucide-react";
import { motion } from "motion/react";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-brand-medium/30">
      {/* Animated Background Mesh */}
      <div className="fixed inset-0 -z-20 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-light/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-medium/10 rounded-full blur-[150px] animate-pulse [animation-delay:2s]" />
      </div>
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-brand-medium rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-brand-dark">CareerFlow AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
            <a href="#features" className="hover:text-brand-medium transition-colors">Funcionalidades</a>
            <a href="#how-it-works" className="hover:text-brand-medium transition-colors">Cómo funciona</a>
            <Link to="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link to="/login">
              <Button className="bg-brand-medium hover:bg-brand-dark">Empezar Gratis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-medium/10 text-brand-medium font-bold text-sm"
            >
              <Sparkles className="h-4 w-4" />
              Impulsado por Gemini AI
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-brand-dark leading-[1.1]"
            >
              Lleva tu carrera profesional al <span className="text-brand-medium">siguiente nivel</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed"
            >
              La plataforma todo-en-uno para construir CVs impactantes, practicar entrevistas con IA y generar documentos corporativos en segundos.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link to="/login">
                <Button size="lg" className="bg-brand-medium hover:bg-brand-dark h-14 px-10 text-lg rounded-xl shadow-2xl shadow-brand-medium/40 transition-all hover:scale-105 active:scale-95">
                  Empezar ahora <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-40 left-10 w-72 h-72 bg-brand-light rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-medium rounded-full blur-[150px]" />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-zinc-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">Todo lo que necesitas para triunfar</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">Herramientas diseñadas por expertos en reclutamiento potenciadas por inteligencia artificial.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Constructor de CV",
                desc: "Formularios inteligentes que te guían paso a paso para crear una hoja de vida optimizada para ATS.",
                icon: FileText,
                color: "bg-blue-500"
              },
              {
                title: "Simulador de Entrevistas",
                desc: "Practica con una IA que simula entrevistas reales y te da feedback detallado sobre tus respuestas.",
                icon: Mic2,
                color: "bg-green-500"
              },
              {
                title: "Generador de Documentos",
                desc: "Crea cartas de presentación, contratos y correos formales en segundos con un tono profesional.",
                icon: FilePlus,
                color: "bg-purple-500"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white", feature.color)}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-brand-dark">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="bg-brand-dark rounded-[2.5rem] p-12 md:p-20 text-white relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">Optimiza tu tiempo y aumenta tus posibilidades</h2>
                <p className="text-zinc-400 text-lg">Nuestros usuarios reportan un aumento del 40% en llamadas para entrevistas tras usar nuestras herramientas de optimización.</p>
                <div className="space-y-4">
                  {[
                    "Análisis de CV en tiempo real",
                    "Feedback constructivo de IA",
                    "Exportación a formatos profesionales",
                    "Privacidad y seguridad garantizada"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-brand-light" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm text-center">
                  <p className="text-4xl font-bold text-brand-light mb-2">95%</p>
                  <p className="text-sm text-zinc-400">Satisfacción</p>
                </div>
                <div className="p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm text-center">
                  <p className="text-4xl font-bold text-brand-light mb-2">+10k</p>
                  <p className="text-sm text-zinc-400">CVs Generados</p>
                </div>
                <div className="p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm text-center">
                  <p className="text-4xl font-bold text-brand-light mb-2">24/7</p>
                  <p className="text-sm text-zinc-400">Soporte IA</p>
                </div>
                <div className="p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm text-center">
                  <p className="text-4xl font-bold text-brand-light mb-2">Free</p>
                  <p className="text-sm text-zinc-400">Plan Inicial</p>
                </div>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-medium/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-light/10 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-zinc-50">
        <div className="container mx-auto px-6 max-w-7xl text-center space-y-8">
          <h2 className="text-4xl font-bold text-brand-dark">¿Listo para transformar tu futuro profesional?</h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-lg">Únete a miles de profesionales que ya están usando CareerFlow AI para alcanzar sus metas.</p>
          <Link to="/login">
            <Button size="lg" className="bg-brand-medium hover:bg-brand-dark h-14 px-12 text-lg rounded-xl">
              Empezar ahora gratis
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
