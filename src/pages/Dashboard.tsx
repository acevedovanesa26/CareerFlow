import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  MessageSquare, 
  Trophy, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Calendar,
  Zap,
  ArrowRight,
  Search,
  Download
} from 'lucide-react';
import { exportReportToPDF } from '../lib/export';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { X, Check } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  const [showFullReport, setShowFullReport] = React.useState(false);

  const kpiData = [
    { title: 'Documentos', value: profile?.stats?.totalDocuments || 0, change: '+12%', icon: FileText, desc: 'Este mes' },
    { title: 'Entrevistas', value: profile?.stats?.totalInterviews || 0, change: '+5%', icon: MessageSquare, desc: 'Este mes' },
    { title: 'Puntaje Promedio', value: `${profile?.stats?.averageScore || 0}%`, change: '+8%', icon: Trophy, desc: 'Mejora progresiva' },
    { title: 'Días Activo', value: profile?.stats?.streakDays || 0, change: '+2', icon: Zap, desc: 'Racha actual' },
  ];

  const interviewTrend = [
    { name: '1 May', score: 65 },
    { name: '5 May', score: 72 },
    { name: '10 May', score: 68 },
    { name: '15 May', score: 85 },
    { name: '20 May', score: 82 },
    { name: '25 May', score: 91 },
  ];

  const docDistribution = [
    { name: 'CV', count: 12 },
    { name: 'Cartas', count: 8 },
    { name: 'Correos', count: 15 },
    { name: 'Otros', count: 5 },
  ];

  const competencyData = [
    { subject: 'Claridad', A: 80, fullMark: 100 },
    { subject: 'Coherencia', A: 90, fullMark: 100 },
    { subject: 'Profesionalismo', A: 85, fullMark: 100 },
    { subject: 'Relevancia', A: 70, fullMark: 100 },
    { subject: 'Estructura', A: 75, fullMark: 100 },
  ];

  const recentActivity = [
    { id: 1, type: 'document', name: 'Hoja de Vida Senior', date: 'Hace 2 horas', status: 'Completado' },
    { id: 2, type: 'interview', name: 'Entrevista Full Stack', date: 'Ayer', status: '85/100' },
    { id: 3, type: 'document', name: 'Carta de Presentación Google', date: 'Hace 3 días', status: 'Borrador' },
  ];

  const weeklyPerformance = [
    { day: 'Lun', value: 45 },
    { day: 'Mar', value: 52 },
    { day: 'Mie', value: 38 },
    { day: 'Jue', value: 65 },
    { day: 'Vie', value: 48 },
    { day: 'Sab', value: 72 },
    { day: 'Dom', value: 68 },
  ];

  const handleExport = async (type: string) => {
    const toastId = toast.loading(`Generando reporte en formato ${type.toUpperCase()}...`);
    
    try {
      if (type === 'pdf') {
        const reportData = [
          ...kpiData.map(k => ({ label: k.title, value: k.value })),
          { label: '--- COMPETENCIAS ---', value: '' },
          ...competencyData.map(c => ({ label: c.subject, value: `${c.A}%` })),
          { label: '--- LOGROS ---', value: '' },
          { label: 'Consistencia', value: '95%' },
          { label: 'Mejora Entrevistas', value: '15%' },
          { label: 'Racha', value: `${profile?.stats?.streakDays || 0} días` }
        ];
        await exportReportToPDF(`Reporte de Desempeño - ${profile?.displayName || 'Usuario'}`, reportData);
        toast.success('¡Reporte descargado!', { id: toastId });
      } else {
        // Fallback for other types or implement them if needed
        setTimeout(() => {
          toast.success('Documento generado con éxito', { id: toastId });
        }, 1500);
      }
    } catch (e) {
      toast.error('Error al generar reporte', { id: toastId });
    }
  };

  return (
    <div className="space-y-8 pb-12 bg-white">
      {/* Header / Welcome */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-50/50 p-8 rounded-[2.5rem] border border-zinc-100">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-brand-dark">¡Hola, {profile?.displayName?.split(' ')[0] || 'Profesional'}! 👋</h1>
          <p className="text-zinc-500 mt-1 font-medium">Aquí tienes el resumen de tu progreso laboral hoy.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => handleExport('pdf')}
            className="btn-secondary !py-2.5 !px-5 flex items-center gap-2 border-zinc-200 text-zinc-600 hover:border-brand-bright/40 text-sm font-bold"
          >
            <Download size={18} /> Exportar PDF
          </button>
          <button 
            onClick={() => setShowFullReport(true)}
            className="btn-primary !py-2.5 !px-6 flex items-center gap-2 shadow-lg shadow-brand-bright/20 border-none text-sm"
          >
            <Calendar size={18} /> Ver Reporte Completo
          </button>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card group cursor-default"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-brand-bright/10 text-brand-bright group-hover:bg-brand-bright group-hover:text-white transition-all">
                <kpi.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                <ArrowUpRight size={14} />
                {kpi.change}
              </div>
            </div>
            <h4 className="text-4xl font-bold tracking-tighter">{kpi.value}</h4>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm font-semibold">{kpi.title}</p>
              <p className="text-xs text-zinc-400">{kpi.desc}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Charts Central */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Productivity Bar Chart */}
        <div className="lg:col-span-1 card !p-8 bg-white border-2 border-zinc-50">
          <h3 className="text-2xl font-black text-brand-dark tracking-tight mb-1">Productividad</h3>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-10">Actividad últimos 7 días</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#10B981" 
                  radius={[6, 6, 0, 0]} 
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="lg:col-span-2 card overflow-hidden !p-8 bg-white border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-brand-dark tracking-tight">Evolución de Carrera</h3>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-1">Nivel de preparación vs Tiempo</p>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={interviewTrend}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F9FAFB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: '900' }} 
                  dy={10} 
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '20px' }}
                  itemStyle={{ fontWeight: '900', color: '#064E3B' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#10B981" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Bottom Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recents */}
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Actividad Reciente</h3>
            <button className="text-brand-bright text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Ver todo <ArrowRight size={16} />
            </button>
          </div>
          <div className="space-y-6">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 p-2 -mx-2 rounded-xl transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${item.type === 'document' ? 'bg-blue-500/10 text-blue-500' : 'bg-brand-bright/10 text-brand-bright'}`}>
                    {item.type === 'document' ? <FileText size={20} /> : <MessageSquare size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock size={12} /> {item.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                    item.status.includes('85') ? 'bg-brand-bright/10 text-brand-bright' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'Generar Documento', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', path: '/docs' },
              { label: 'Iniciar Entrevista', icon: MessageSquare, color: 'text-brand-bright', bg: 'bg-brand-bright/10', path: '/interview' },
              { label: 'Analizar CV', icon: Search, color: 'text-orange-500', bg: 'bg-orange-500/10', path: '/cv-analyzer' },
              { label: 'Ver Progreso', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10', path: '/profile' },
            ].map((action, i) => (
              <Link
                key={i}
                to={action.path}
                className="card flex flex-col items-center justify-center gap-4 text-center group transition-all hover:shadow-xl border-zinc-100 hover:border-brand-bright"
              >
                <div className={`p-4 rounded-2xl ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon size={32} />
                </div>
                <span className="font-bold text-sm leading-tight text-brand-dark">{action.label}</span>
              </Link>
            ))}
          </div>
      </section>
      <AnimatePresence>
        {showFullReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFullReport(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
                <div>
                  <h2 className="text-2xl font-black text-brand-dark dark:text-white">Reporte de Desempeño Detallado</h2>
                  <p className="text-zinc-500 text-sm mt-1">Análisis integral de tu actividad en CareerFlow AI</p>
                </div>
                <button 
                  onClick={() => setShowFullReport(false)}
                  className="p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <h3 className="font-bold text-lg flex items-center gap-2">
                         <Trophy className="text-brand-bright" size={20} /> Logros Destacados
                       </h3>
                       <div className="space-y-4">
                          {[
                            'Consistencia semanal del 95% en creación de documentos.',
                            'Mejora del 15% en el puntaje de entrevistas técnicas.',
                            'Optimización semántica de 3 versiones de Hoja de Vida.',
                            'Racha de 5 días seguidos preparando aplicaciones.'
                          ].map((item, i) => (
                            <div key={i} className="flex gap-3 items-start">
                               <div className="p-1 rounded-full bg-green-500/10 text-green-500 mt-0.5">
                                 <Check size={12} />
                               </div>
                               <p className="text-sm text-zinc-600 dark:text-zinc-400">{item}</p>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="card !bg-zinc-50 dark:!bg-zinc-800/30">
                       <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-400 mb-6">Radar de Competencias AI</h3>
                       <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={competencyData}>
                              <PolarGrid stroke="#E5E7EB" />
                              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                              <Radar name="Usuario" dataKey="A" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                            </RadarChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <h3 className="font-bold text-lg mb-4">Análisis de Tendencias</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      Basado en tu actividad reciente, hemos notado que prefieres roles en el sector de {profile?.area || 'Tecnología'}. Tu tasa de éxito en simulaciones de entrevistas ha incrementado significativamente en la última semana, especialmente en preguntas situacionales y de liderazgo.
                    </p>
                 </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-4">
                 <button 
                   onClick={() => handleExport('pdf')}
                   className="btn-secondary !bg-white dark:!bg-zinc-900 flex items-center gap-2"
                 >
                    <Download size={18} /> Descargar Reporte Completo
                 </button>
                 <button 
                   onClick={() => setShowFullReport(false)}
                   className="btn-primary"
                 >
                    Cerrar Informe
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
