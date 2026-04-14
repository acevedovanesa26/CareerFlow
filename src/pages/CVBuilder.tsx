import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CVPreview } from "@/components/CVPreview";
import { CVData } from "@/types";
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Download,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { generateCareerContent, SYSTEM_PROMPTS } from "@/lib/gemini";
import { motion, AnimatePresence } from "motion/react";

const initialData: CVData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  },
  experience: [],
  education: [],
  skills: [],
};

import { exportCVToWord } from "@/lib/export";
import { db, collection, addDoc, serverTimestamp, auth, query, where, onSnapshot, deleteDoc, doc } from "@/lib/firebase";
import { Clock, FileText } from "lucide-react";

export default function CVBuilder() {
  const [data, setData] = React.useState<CVData>(initialData);
  const [step, setStep] = React.useState(1);
  const [isImproving, setIsImproving] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [history, setHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "cvs"), where("userId", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setHistory(docs.sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds));
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (cvId: string) => {
    try {
      await deleteDoc(doc(db, "cvs", cvId));
      toast.success("CV eliminado.");
    } catch (error) {
      toast.error("Error al eliminar el CV.");
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      toast.error("Debes iniciar sesión para guardar.");
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, "cvs"), {
        userId: auth.currentUser.uid,
        name: `CV ${data.personalInfo.fullName}`,
        data: data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("¡CV guardado en la nube!");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar el CV.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportCVToWord(data);
      toast.success("¡CV exportado con éxito!");
      // Also save to cloud automatically on export
      handleSave();
    } catch (error) {
      console.error(error);
      toast.error("Error al exportar el CV.");
    }
  };

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [name]: value }
    }));
  };

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: "", position: "", startDate: "", endDate: "", description: "" }]
    }));
  };

  const removeExperience = (index: number) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => i === index ? { ...exp, [field]: value } : exp)
    }));
  };

  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, { school: "", degree: "", year: "" }]
    }));
  };

  const removeEducation = (index: number) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => i === index ? { ...edu, [field]: value } : edu)
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData(prev => ({
      ...prev,
      skills: e.target.value.split(",").map(s => s.trim()).filter(s => s !== "")
    }));
  };

  const improveWithAI = async () => {
    if (!data.personalInfo.summary && data.experience.length === 0) {
      toast.error("Agrega algo de información primero para que la IA pueda ayudarte.");
      return;
    }

    setIsImproving(true);
    try {
      const prompt = `Mejora este perfil profesional y experiencia laboral:\n\nResumen: ${data.personalInfo.summary}\n\nExperiencia: ${JSON.stringify(data.experience)}\n\nDevuelve el resultado en formato JSON con los campos 'summary' (string) y 'experience' (array de objetos con los mismos campos que la entrada).`;
      
      const result = await generateCareerContent(prompt, SYSTEM_PROMPTS.CV_IMPROVER + " IMPORTANTE: Devuelve SOLO el JSON, sin bloques de código markdown.");
      
      if (result) {
        const cleanedResult = result.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanedResult);
        setData(prev => ({
          ...prev,
          personalInfo: { ...prev.personalInfo, summary: parsed.summary },
          experience: parsed.experience
        }));
        toast.success("¡CV mejorado con éxito!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al mejorar con IA. Inténtalo de nuevo.");
    } finally {
      setIsImproving(false);
    }
  };

  const steps = [
    { id: 1, title: "Información Personal" },
    { id: 2, title: "Experiencia Laboral" },
    { id: 3, title: "Educación y Habilidades" },
    { id: 4, title: "Vista Previa" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Constructor de CV" 
        description="Crea tu hoja de vida profesional paso a paso."
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> {isSaving ? "Guardando..." : "Guardar en Nube"}
          </Button>
          <Button className="bg-brand-medium hover:bg-brand-dark" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Exportar Word
          </Button>
        </div>
      </PageHeader>

      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl border shadow-sm">
        {steps.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
              step === s.id ? "bg-brand-medium text-white" : 
              step > s.id ? "bg-brand-light text-brand-dark" : "bg-zinc-100 text-zinc-400"
            )}>
              {s.id}
            </div>
            <span className={cn(
              "text-sm font-medium hidden md:block",
              step === s.id ? "text-brand-dark" : "text-zinc-400"
            )}>
              {s.title}
            </span>
            {s.id < 4 && <ChevronRight className="h-4 w-4 text-zinc-300 hidden md:block" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Datos Personales</CardTitle>
                    <CardDescription>Cuéntanos quién eres y cómo contactarte.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nombre Completo</Label>
                        <Input 
                          id="fullName" 
                          name="fullName" 
                          placeholder="Ej: Juan Pérez" 
                          value={data.personalInfo.fullName}
                          onChange={handlePersonalInfoChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          placeholder="juan@ejemplo.com" 
                          value={data.personalInfo.email}
                          onChange={handlePersonalInfoChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          placeholder="+57 300 123 4567" 
                          value={data.personalInfo.phone}
                          onChange={handlePersonalInfoChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Ubicación</Label>
                        <Input 
                          id="location" 
                          name="location" 
                          placeholder="Ciudad, País" 
                          value={data.personalInfo.location}
                          onChange={handlePersonalInfoChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="summary">Perfil Profesional</Label>
                      <Textarea 
                        id="summary" 
                        name="summary" 
                        placeholder="Breve descripción de tu perfil y objetivos..." 
                        className="min-h-[120px]"
                        value={data.personalInfo.summary}
                        onChange={handlePersonalInfoChange}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-brand-dark">Experiencia Laboral</h2>
                  <Button variant="outline" size="sm" onClick={addExperience}>
                    <Plus className="mr-2 h-4 w-4" /> Agregar
                  </Button>
                </div>
                
                {data.experience.map((exp, index) => (
                  <Card key={index} className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 text-zinc-400 hover:text-red-500"
                      onClick={() => removeExperience(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Empresa</Label>
                          <Input 
                            placeholder="Nombre de la empresa" 
                            value={exp.company}
                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Cargo</Label>
                          <Input 
                            placeholder="Tu cargo" 
                            value={exp.position}
                            onChange={(e) => updateExperience(index, 'position', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Fecha Inicio</Label>
                          <Input 
                            placeholder="Mes Año" 
                            value={exp.startDate}
                            onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Fecha Fin</Label>
                          <Input 
                            placeholder="Mes Año o Actual" 
                            value={exp.endDate}
                            onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Descripción de Logros</Label>
                        <Textarea 
                          placeholder="Describe tus responsabilidades y logros principales..." 
                          className="min-h-[100px]"
                          value={exp.description}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {data.experience.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl bg-zinc-50">
                    <p className="text-zinc-500 mb-4">No has agregado experiencia laboral aún.</p>
                    <Button onClick={addExperience}>Agregar mi primera experiencia</Button>
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Educación</CardTitle>
                      <CardDescription>Tus títulos y formación académica.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={addEducation}>
                      <Plus className="mr-2 h-4 w-4" /> Agregar
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data.education.map((edu, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border shadow-sm text-zinc-400 hover:text-red-500"
                          onClick={() => removeEducation(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="space-y-2">
                          <Label>Institución</Label>
                          <Input 
                            placeholder="Universidad..." 
                            value={edu.school}
                            onChange={(e) => updateEducation(index, 'school', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input 
                            placeholder="Grado obtenido..." 
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Año</Label>
                          <Input 
                            placeholder="Año de graduación" 
                            value={edu.year}
                            onChange={(e) => updateEducation(index, 'year', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Habilidades</CardTitle>
                    <CardDescription>Separa tus habilidades por comas.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input 
                      placeholder="Ej: React, TypeScript, Gestión de Proyectos, Inglés C1..." 
                      value={data.skills.join(", ")}
                      onChange={handleSkillsChange}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-6">
            <Button 
              variant="ghost" 
              disabled={step === 1} 
              onClick={() => setStep(prev => prev - 1)}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="text-brand-medium border-brand-medium hover:bg-brand-medium/5"
                onClick={improveWithAI}
                disabled={isImproving}
              >
                {isImproving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-brand-medium border-t-transparent rounded-full animate-spin" />
                    Mejorando...
                  </div>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Mejorar con IA
                  </>
                )}
              </Button>
              
              {step < 4 ? (
                <Button 
                  className="bg-brand-medium hover:bg-brand-dark"
                  onClick={() => setStep(prev => prev + 1)}
                >
                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button className="bg-brand-medium hover:bg-brand-dark" onClick={() => toast.success("CV Finalizado")}>
                  Finalizar CV
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:block sticky top-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-zinc-500 uppercase text-xs tracking-widest">Vista Previa en Tiempo Real</h3>
              <span className="text-xs text-zinc-400">A4 Format</span>
            </div>
            <CVPreview data={data} />
          </div>

          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-brand-medium" /> CVs Guardados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {history.slice(0, 5).map((cv) => (
                  <div key={cv.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setData(cv.data)}>
                      <div className="p-2 bg-brand-light/20 rounded-lg">
                        <FileText className="h-4 w-4 text-brand-medium" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-brand-dark truncate">{cv.name || "Sin nombre"}</p>
                        <p className="text-[10px] text-zinc-500">{cv.createdAt?.toDate().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cv.id)} className="text-zinc-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
