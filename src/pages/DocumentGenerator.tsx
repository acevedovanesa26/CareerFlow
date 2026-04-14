import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DOCUMENT_TYPES } from "@/constants";
import { generateCareerContent, SYSTEM_PROMPTS } from "@/lib/gemini";
import { Trash2, FileText, Mail, FileCheck, Send, Sparkles, Download, Copy, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";
import { exportDocToWord } from "@/lib/export";
import { db, collection, addDoc, serverTimestamp, auth, query, where, onSnapshot, deleteDoc, doc, getDocs } from "@/lib/firebase";

export default function DocumentGenerator() {
  const [type, setType] = React.useState("");
  const [formData, setFormData] = React.useState({
    context: "",
    recipient: "",
    tone: "formal",
  });
  const [result, setResult] = React.useState("");
  const [history, setHistory] = React.useState<any[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "documents"), where("userId", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setHistory(docs.sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds));
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (docId: string) => {
    try {
      await deleteDoc(doc(db, "documents", docId));
      toast.success("Documento eliminado.");
      if (result && history.find(h => h.id === docId)?.content === result) {
        setResult("");
      }
    } catch (error) {
      toast.error("Error al eliminar el documento.");
    }
  };

  const handleSave = async (content: string) => {
    if (!auth.currentUser || !content) return;

    setIsSaving(true);
    try {
      const docType = DOCUMENT_TYPES.find(t => t.id === type)?.label || "Documento";
      await addDoc(collection(db, "documents"), {
        userId: auth.currentUser.uid,
        type: type,
        title: docType,
        content: content,
        createdAt: serverTimestamp(),
      });
      toast.success("Documento guardado en tu historial.");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar el documento.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const docType = DOCUMENT_TYPES.find(t => t.id === type)?.label || "Documento";
      await exportDocToWord(docType, result);
      toast.success("¡Documento exportado con éxito!");
    } catch (error) {
      console.error(error);
      toast.error("Error al exportar el documento.");
    }
  };

  const handleGenerate = async () => {
    if (!type || !formData.context) {
      toast.error("Por favor selecciona un tipo de documento y proporciona el contexto.");
      return;
    }

    setIsGenerating(true);
    try {
      const docType = DOCUMENT_TYPES.find(t => t.id === type)?.label;
      const prompt = `Genera un ${docType} basado en la siguiente información:\n\nContexto: ${formData.context}\nDestinatario: ${formData.recipient}\nTono: ${formData.tone}\n\nEl documento debe ser profesional, estar bien estructurado y listo para usar.`;
      
      const response = await generateCareerContent(prompt, SYSTEM_PROMPTS.DOCUMENT_GENERATOR);
      if (response) {
        setResult(response);
        toast.success("¡Documento generado con éxito!");
        handleSave(response);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al generar el documento.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Generador de Documentos" 
        description="Crea cartas, contratos y correos formales optimizados con IA en segundos."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Documento</CardTitle>
              <CardDescription>Define qué tipo de documento necesitas y para qué.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tipo de Documento</Label>
                <div className="grid grid-cols-2 gap-3">
                  {DOCUMENT_TYPES.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setType(doc.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                        type === doc.id 
                          ? "border-brand-medium bg-brand-medium/5 text-brand-dark" 
                          : "border-zinc-100 hover:border-zinc-200 text-zinc-500"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        type === doc.id ? "bg-brand-medium text-white" : "bg-zinc-100"
                      )}>
                        {doc.id === 'cv' && <FileText className="h-5 w-5" />}
                        {doc.id === 'cover-letter' && <Mail className="h-5 w-5" />}
                        {doc.id === 'contract' && <FileCheck className="h-5 w-5" />}
                        {doc.id === 'email' && <Send className="h-5 w-5" />}
                      </div>
                      <span className="font-semibold text-sm">{doc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient">Destinatario (Opcional)</Label>
                <Input 
                  id="recipient" 
                  placeholder="Ej: Departamento de RRHH, Cliente X..." 
                  value={formData.recipient}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tono del Documento</Label>
                <Select value={formData.tone} onValueChange={(v) => setFormData(prev => ({ ...prev, tone: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tono" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal y Corporativo</SelectItem>
                    <SelectItem value="creative">Creativo e Innovador</SelectItem>
                    <SelectItem value="executive">Ejecutivo y Directo</SelectItem>
                    <SelectItem value="friendly">Amigable pero Profesional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="context">Contexto / Información Clave</Label>
                <Textarea 
                  id="context" 
                  placeholder="Describe qué debe incluir el documento, motivos, fechas, etc..." 
                  className="min-h-[150px]"
                  value={formData.context}
                  onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                />
              </div>

              <Button 
                className="w-full bg-brand-medium hover:bg-brand-dark h-12"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generando...
                  </div>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generar con IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="flex flex-col min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between border-bottom">
              <div>
                <CardTitle>Resultado</CardTitle>
                <CardDescription>Tu documento generado aparecerá aquí.</CardDescription>
              </div>
              {result && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
              {result ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 bg-white flex-1 overflow-y-auto"
                >
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-zinc-400 p-12 text-center space-y-4">
                  <div className="p-4 bg-zinc-50 rounded-full">
                    <FileText className="h-12 w-12 opacity-20" />
                  </div>
                  <p>Completa el formulario de la izquierda para generar tu documento.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-brand-medium" /> Historial Reciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {history.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setResult(doc.content)}>
                      <div className="p-2 bg-brand-light/20 rounded-lg">
                        <FileText className="h-4 w-4 text-brand-medium" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-brand-dark">{doc.title}</p>
                        <p className="text-[10px] text-zinc-500">{doc.createdAt?.toDate().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)} className="text-zinc-400 hover:text-red-500">
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
