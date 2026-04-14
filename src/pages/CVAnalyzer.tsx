import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { generateCareerContent, SYSTEM_PROMPTS } from "@/lib/gemini";
import { FileSearch, Sparkles, AlertCircle, CheckCircle2, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";

export default function CVAnalyzer() {
  const [content, setContent] = React.useState("");
  const [analysis, setAnalysis] = React.useState("");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast.error("Por favor pega el contenido de tu CV para analizar.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const prompt = `Analiza el siguiente contenido de una hoja de vida (CV). Detecta errores, da sugerencias de mejora y proporciona una versión optimizada de las partes más débiles:\n\n${content}`;
      const response = await generateCareerContent(prompt, SYSTEM_PROMPTS.CV_IMPROVER);
      if (response) {
        setAnalysis(response);
        toast.success("¡Análisis completado!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al analizar el CV.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Analizador de CV" 
        description="Sube o pega tu CV para recibir sugerencias de mejora instantáneas con IA."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenido de tu CV</CardTitle>
              <CardDescription>Pega el texto de tu hoja de vida actual aquí.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Pega aquí el contenido de tu PDF o Word..." 
                className="min-h-[400px] font-mono text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Button 
                className="w-full bg-brand-medium hover:bg-brand-dark h-12"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "Analizando..." : (
                  <>
                    <FileSearch className="mr-2 h-4 w-4" /> Analizar con IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="h-full flex flex-col min-h-[500px]">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-medium" />
                Resultados del Análisis
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {analysis ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 bg-white h-full overflow-y-auto"
                >
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-12 text-center space-y-4">
                  <div className="p-4 bg-zinc-50 rounded-full">
                    <ListChecks className="h-12 w-12 opacity-20" />
                  </div>
                  <p>Pega el contenido de tu CV a la izquierda para ver el análisis detallado.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
