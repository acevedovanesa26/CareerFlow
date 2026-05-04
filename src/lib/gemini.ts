import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[Gemini] API Key missing in environment");
      throw new Error("No se ha configurado la API Key de Gemini. Por favor, asegúrate de que el entorno esté configurado correctamente.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function callingGeminiWithRetry(
  prompt: string, 
  systemInstruction?: string, 
  isJson: boolean = false
) {
  let ai;
  try {
    ai = getAI();
  } catch (e: any) {
    throw e;
  }
  
  const MODEL_NAME = "gemini-3-flash-preview";
  let lastError: any;
  const backoff = [1000, 2000, 4000];

  for (let i = 0; i <= backoff.length; i++) {
    try {
      console.log(`[Gemini] Llamando a ${MODEL_NAME} (Intento ${i + 1})...`);
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: isJson ? 0.2 : 0.7, // Lower temperature for JSON for more stability
          responseMimeType: isJson ? "application/json" : "text/plain",
        }
      });

      const text = response.text;

      if (!text) {
        throw new Error("Respuesta de IA vacía.");
      }

      if (isJson) {
        try {
          const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
          return JSON.parse(cleanedText);
        } catch (e) {
          console.error("[Gemini] Error parseando JSON:", text);
          throw new Error("La IA no devolvió un JSON válido.");
        }
      }

      return text;
    } catch (error: any) {
      console.error(`[Gemini] Error en intento ${i + 1}:`, error.message || error);
      lastError = error;
      
      // Don't retry if it's a fatal error or permission issue that won't change
      if (error.message?.includes("403") || error.message?.includes("400")) {
        break;
      }

      if (i < backoff.length) {
        await sleep(backoff[i]);
      }
    }
  }

  throw lastError;
}
