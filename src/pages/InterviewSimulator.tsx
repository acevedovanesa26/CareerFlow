import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { INTERVIEW_AREAS, INTERVIEW_LEVELS } from "@/constants";
import { generateCareerContent, SYSTEM_PROMPTS } from "@/lib/gemini";
import { db, collection, addDoc, updateDoc, doc, serverTimestamp, auth, query, where, onSnapshot, deleteDoc } from "@/lib/firebase";
import { Mic2, Send, User, Bot, Sparkles, RefreshCcw, CheckCircle2, AlertCircle, Trash2, Clock, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: 'bot' | 'user';
  content: string;
  feedback?: string;
  score?: number;
}

export default function InterviewSimulator() {
  const [isStarted, setIsStarted] = React.useState(false);
  const [interviewId, setInterviewId] = React.useState<string | null>(null);
  const [config, setConfig] = React.useState({
    role: "",
    area: "",
    level: "",
  });
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [history, setHistory] = React.useState<any[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "interviews"), where("userId", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setHistory(docs.sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds));
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteInterview = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "interviews", id));
      toast.success("Entrevista eliminada.");
      if (interviewId === id) {
        resetInterview();
      }
    } catch (error) {
      toast.error("Error al eliminar.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const saveInterview = async (newMessages: Message[]) => {
    if (!auth.currentUser) return;

    try {
      if (!interviewId) {
        const docRef = await addDoc(collection(db, "interviews"), {
          userId: auth.currentUser.uid,
          config,
          messages: newMessages,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setInterviewId(docRef.id);
      } else {
        await updateDoc(doc(db, "interviews", interviewId), {
          messages: newMessages,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error saving interview:", error);
    }
  };

  const startInterview = async () => {
    if (!config.role || !config.area || !config.level) {
      toast.error("Por favor completa todos los campos de configuración.");
      return;
    }

    setIsStarted(true);
    setIsLoading(true);
    try {
      const prompt = `Inicia una entrevista para el cargo de ${config.role} en el área de ${config.area} para un nivel ${config.level}. Preséntate brevemente y haz la primera pregunta.`;
      const response = await generateCareerContent(prompt, SYSTEM_PROMPTS.INTERVIEW_SIMULATOR);
      if (response) {
        const initialMessages: Message[] = [{ role: 'bot', content: response }];
        setMessages(initialMessages);
        saveInterview(initialMessages);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al iniciar la entrevista.");
      setIsStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    const updatedMessagesWithUser: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessagesWithUser);
    setIsLoading(true);

    try {
      const history = updatedMessagesWithUser.map(m => `${m.role === 'bot' ? 'Entrevistador' : 'Candidato'}: ${m.content}`).join("\n");
      const prompt = `Historial de la entrevista:\n${history}\n\nCandidato: ${userMessage}\n\nComo entrevistador, evalúa brevemente la respuesta anterior (da un puntaje de 1 a 10 y feedback constructivo) y luego haz la siguiente pregunta de la entrevista. Devuelve el resultado en un formato claro: [FEEDBACK] ... [SCORE] ... [NEXT_QUESTION] ...`;
      
      const response = await generateCareerContent(prompt, SYSTEM_PROMPTS.INTERVIEW_SIMULATOR);
      
      if (response) {
        // Simple parsing for feedback and score
        const feedbackMatch = response.match(/\[FEEDBACK\](.*?)\[SCORE\]/s);
        const scoreMatch = response.match(/\[SCORE\](.*?)\[NEXT_QUESTION\]/s);
        const nextQuestionMatch = response.match(/\[NEXT_QUESTION\](.*)/s);

        const feedback = feedbackMatch ? feedbackMatch[1].trim() : undefined;
        const score = scoreMatch ? parseInt(scoreMatch[1].trim()) : undefined;
        const nextQuestion = nextQuestionMatch ? nextQuestionMatch[1].trim() : response;

        const finalMessages: Message[] = [
          ...messages,
          { role: 'user', content: userMessage, feedback, score },
          { role: 'bot', content: nextQuestion }
        ];
        
        setMessages(finalMessages);
        saveInterview(finalMessages);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al procesar tu respuesta.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    setIsStarted(false);
    setInterviewId(null);
    setMessages([]);
    setConfig({ role: "", area: "", level: "" });
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col pb-2">
      <PageHeader 
        title="Simulador de Entrevistas" 
        description="Practica entrevistas reales con nuestra IA y recibe feedback instantáneo."
        className="mb-0"
      >
        {isStarted && (
          <Button variant="outline" onClick={resetInterview}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Reiniciar
          </Button>
        )}
      </PageHeader>

      {!isStarted ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex items-center justify-center overflow-y-auto min-h-0"
        >
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-brand-medium/10 rounded-full flex items-center justify-center mb-4">
                <Mic2 className="h-8 w-8 text-brand-medium" />
              </div>
              <CardTitle className="text-2xl">Configura tu Entrevista</CardTitle>
              <CardDescription>Dinos para qué cargo te estás preparando.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Cargo / Posición</Label>
                  <Input 
                    placeholder="Ej: Desarrollador Frontend" 
                    value={config.role}
                    onChange={(e) => setConfig(prev => ({ ...prev, role: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Área Profesional</Label>
                  <Select onValueChange={(v: string) => setConfig(prev => ({ ...prev, area: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un área" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVIEW_AREAS.map(area => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nivel de Experiencia</Label>
                  <Select onValueChange={(v: string) => setConfig(prev => ({ ...prev, level: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVIEW_LEVELS.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                className="w-full bg-brand-medium hover:bg-brand-dark h-12 text-lg"
                onClick={startInterview}
                disabled={isLoading}
              >
                {isLoading ? "Iniciando..." : "Comenzar Simulación"}
              </Button>

              {history.length > 0 && (
                <div className="pt-6 border-t">
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Historial de Entrevistas
                  </h3>
                  <div className="space-y-3">
                    {history.slice(0, 3).map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 border rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setInterviewId(item.id);
                          setMessages(item.messages);
                          setConfig(item.config);
                          setIsStarted(true);
                        }}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-brand-light/20 rounded-lg shrink-0">
                            <MessageSquare className="h-4 w-4 text-brand-medium" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-brand-dark truncate">{item.config.role}</p>
                            <p className="text-[10px] text-zinc-500">{item.createdAt?.toDate().toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => handleDeleteInterview(item.id, e)}
                          className="text-zinc-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
          <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-2xl bg-white/80 backdrop-blur-sm min-h-0">
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6 space-y-8 pb-20">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-4 max-w-[85%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      msg.role === 'bot' ? "bg-brand-medium/10 text-brand-medium" : "bg-zinc-100 text-zinc-600"
                    )}>
                      {msg.role === 'bot' ? <Bot className="h-6 w-6" /> : <User className="h-6 w-6" />}
                    </div>
                    <div className="space-y-2">
                      <div className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed",
                        msg.role === 'bot' ? "bg-zinc-50 text-zinc-800 rounded-tl-none" : "bg-brand-medium text-white rounded-tr-none"
                      )}>
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                      
                      {msg.role === 'user' && msg.feedback && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-brand-light/20 border border-brand-light/30 p-3 rounded-xl space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-medium flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> Feedback de IA
                            </span>
                            {msg.score && (
                              <Badge variant="outline" className="bg-white text-brand-medium border-brand-medium">
                                Puntaje: {msg.score}/10
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-brand-dark italic">"{msg.feedback}"</p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 max-w-[85%]">
                    <div className="w-10 h-10 rounded-full bg-brand-medium/10 text-brand-medium flex items-center justify-center shrink-0">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-2xl rounded-tl-none flex gap-1">
                      <div className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t bg-zinc-50/50">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <Input 
                  placeholder="Escribe tu respuesta aquí..." 
                  className="bg-white h-12"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                />
                <Button 
                  className="h-12 w-12 bg-brand-medium hover:bg-brand-dark"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-[10px] text-center text-zinc-400 mt-2">
                Presiona Enter para enviar. La IA evaluará tu respuesta y continuará la entrevista.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
