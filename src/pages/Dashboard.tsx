import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Mic2, 
  FilePlus, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { db, collection, query, where, onSnapshot, auth } from "@/lib/firebase";

export default function Dashboard() {
  const [counts, setCounts] = React.useState({
    cvs: 0,
    interviews: 0,
    documents: 0,
    score: 0
  });
  const [activities, setActivities] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;

    // Fetch counts
    const unsubCVs = onSnapshot(query(collection(db, "cvs"), where("userId", "==", uid)), (snap) => {
      setCounts(prev => ({ ...prev, cvs: snap.size }));
    });

    const unsubDocs = onSnapshot(query(collection(db, "documents"), where("userId", "==", uid)), (snap) => {
      setCounts(prev => ({ ...prev, documents: snap.size }));
    });

    const unsubInterviews = onSnapshot(query(collection(db, "interviews"), where("userId", "==", uid)), (snap) => {
      setCounts(prev => ({ ...prev, interviews: snap.size }));
      
      // Calculate average score
      let totalScore = 0;
      let scoreCount = 0;
      const interviewActivities: any[] = [];

      snap.docs.forEach(doc => {
        const data = doc.data();
        data.messages.forEach((m: any) => {
          if (m.score) {
            totalScore += m.score;
            scoreCount++;
          }
        });
        
        interviewActivities.push({
          id: doc.id,
          type: 'interview',
          title: `Entrevista: ${data.config.role}`,
          date: data.createdAt?.toDate().toLocaleDateString() || 'Reciente',
          status: 'Completado',
          rawDate: data.createdAt?.toDate() || new Date(0)
        });
      });

      if (scoreCount > 0) {
        setCounts(prev => ({ ...prev, score: Math.round((totalScore / (scoreCount * 10)) * 100) }));
      }
      
      setActivities(prev => {
        const other = prev.filter(a => a.type !== 'interview');
        return [...other, ...interviewActivities].sort((a, b) => b.rawDate - a.rawDate).slice(0, 5);
      });
    });

    const unsubCVsActivity = onSnapshot(query(collection(db, "cvs"), where("userId", "==", uid)), (snap) => {
      const cvActivities = snap.docs.map(doc => ({
        id: doc.id,
        type: 'cv',
        title: doc.data().name,
        date: doc.data().createdAt?.toDate().toLocaleDateString() || 'Reciente',
        status: 'Guardado',
        rawDate: doc.data().createdAt?.toDate() || new Date(0)
      }));

      setActivities(prev => {
        const other = prev.filter(a => a.type !== 'cv');
        return [...other, ...cvActivities].sort((a, b) => b.rawDate - a.rawDate).slice(0, 5);
      });
    });

    const unsubDocsActivity = onSnapshot(query(collection(db, "documents"), where("userId", "==", uid)), (snap) => {
      const docActivities = snap.docs.map(doc => ({
        id: doc.id,
        type: 'doc',
        title: doc.data().title,
        date: doc.data().createdAt?.toDate().toLocaleDateString() || 'Reciente',
        status: 'Generado',
        rawDate: doc.data().createdAt?.toDate() || new Date(0)
      }));

      setActivities(prev => {
        const other = prev.filter(a => a.type !== 'doc');
        return [...other, ...docActivities].sort((a, b) => b.rawDate - a.rawDate).slice(0, 5);
      });
    });

    return () => {
      unsubCVs();
      unsubDocs();
      unsubInterviews();
      unsubCVsActivity();
      unsubDocsActivity();
    };
  }, []);

  const stats = [
    { label: "CVs Creados", value: counts.cvs.toString(), icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Entrevistas", value: counts.interviews.toString(), icon: Mic2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Documentos", value: counts.documents.toString(), icon: FilePlus, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Puntaje Promedio", value: `${counts.score}%`, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard" 
        description="Bienvenido de nuevo. Aquí tienes un resumen de tu progreso profesional."
      >
        <Button className="bg-brand-medium hover:bg-brand-dark">
          <FilePlus className="mr-2 h-4 w-4" /> Nuevo Documento
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-brand-dark">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Comienza a mejorar tu perfil profesional hoy mismo.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/cv-builder">
              <div className="group p-6 border rounded-xl hover:border-brand-medium hover:bg-brand-medium/5 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-brand-medium/10 rounded-lg group-hover:bg-brand-medium group-hover:text-white transition-colors">
                    <FileText className="h-6 w-6 text-brand-medium group-hover:text-white" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-zinc-300 group-hover:text-brand-medium transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-1">Constructor de CV</h3>
                <p className="text-sm text-zinc-500">Crea un CV profesional paso a paso con sugerencias de IA.</p>
              </div>
            </Link>
            <Link to="/interview">
              <div className="group p-6 border rounded-xl hover:border-brand-medium hover:bg-brand-medium/5 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-brand-medium/10 rounded-lg group-hover:bg-brand-medium group-hover:text-white transition-colors">
                    <Mic2 className="h-6 w-6 text-brand-medium group-hover:text-white" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-zinc-300 group-hover:text-brand-medium transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-1">Simulador de Entrevistas</h3>
                <p className="text-sm text-zinc-500">Practica entrevistas reales y recibe feedback instantáneo.</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Tus últimas acciones en la plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activities.length > 0 ? activities.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="mt-1">
                    <div className="p-2 bg-zinc-100 rounded-full">
                      {activity.type === 'interview' ? <Mic2 className="h-4 w-4 text-zinc-600" /> : 
                       activity.type === 'cv' ? <FileText className="h-4 w-4 text-zinc-600" /> : 
                       <FilePlus className="h-4 w-4 text-zinc-600" />}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold text-brand-dark leading-none">{activity.title}</p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" />
                      {activity.date}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-brand-medium font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      {activity.status}
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-zinc-400 text-center py-8">No hay actividad reciente.</p>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-zinc-500 hover:text-brand-dark">
              Ver todo el historial
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
