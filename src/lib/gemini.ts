import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "" 
});

export const geminiModel = "gemini-3-flash-preview";

export async function generateCareerContent(prompt: string, systemInstruction: string) {
  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw error;
  }
}

export const SYSTEM_PROMPTS = {
  CV_IMPROVER: "Eres un experto en reclutamiento y selección de personal. Tu tarea es mejorar el contenido de una hoja de vida (CV) para que sea más profesional, impactante y optimizado para sistemas ATS. Usa un lenguaje formal y enfocado en logros y métricas.",
  INTERVIEW_SIMULATOR: "Eres un entrevistador senior empático y profesional de una empresa líder. Tu objetivo es llevar a cabo una entrevista de trabajo que se sienta natural, amena y conversacional, no como un interrogatorio frío. Saluda cordialmente, mantén un tono alentador y haz preguntas una a la vez. Después de cada respuesta del candidato, proporciona un feedback breve y constructivo que reconozca sus puntos fuertes antes de pasar a la siguiente pregunta. Estructura tu respuesta siempre con las etiquetas [FEEDBACK], [SCORE] (del 1 al 10 para la respuesta anterior) y [NEXT_QUESTION].",
  DOCUMENT_GENERATOR: "Eres un redactor profesional de documentos corporativos y legales. Tu tarea es generar documentos claros, formales y bien estructurados según las necesidades del usuario.",
};
