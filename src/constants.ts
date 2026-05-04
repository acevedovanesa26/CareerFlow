import { UserLevel } from "./types";

export const AREAS_PROFESIONALES = [
  "Tecnología", "Marketing", "Finanzas", "Recursos Humanos", 
  "Salud", "Educación", "Derecho", "Logística", 
  "Ventas", "Diseño", "Operaciones", "Otros"
];

export const MODALIDADES_ENTREVISTA = [
  { id: 'conductual', label: 'Conductual', description: 'Se enfoca en comportamientos pasados y situaciones reales.' },
  { id: 'tecnica', label: 'Técnica', description: 'Evalúa conocimientos específicos y habilidades técnicas.' },
  { id: 'competencias', label: 'Por Competencias', description: 'Mide habilidades específicas como liderazgo o trabajo en equipo.' },
  { id: 'situacional', label: 'Situacional', description: 'Plantea escenarios hipotéticos para ver cómo reaccionas.' },
  { id: 'mixta', label: 'Mixta', description: 'Una combinación balanceada de todos los tipos anteriores.' }
];

export const DOCUMENT_TYPES = [
  { id: 'hoja_de_vida', label: 'Hoja de Vida', description: 'Tu carta de presentación profesional principal.', icon: 'FileText' },
  { id: 'carta_presentacion', label: 'Carta de Presentación', description: 'Complementa tu CV destacando tu motivación.', icon: 'Mail' },
  { id: 'contrato', label: 'Contrato Básico', description: 'Estructura legal para acuerdos laborales simples.', icon: 'ShieldCheck' },
  { id: 'correo_formal', label: 'Correo Formal', description: 'Comunicaciones profesionales efectivas.', icon: 'AtSign' },
  { id: 'carta_renuncia', label: 'Carta de Renuncia', description: 'Finaliza una etapa laboral con profesionalismo.', icon: 'LogOut' },
  { id: 'carta_recomendacion', label: 'Carta de Recomendación', description: 'Respalda el talento de otros colegas.', icon: 'Star' }
];

export const CV_SECTIONS = [
  { id: 'personal', label: 'Datos Personales', icon: 'User' },
  { id: 'perfil', label: 'Perfil Profesional', icon: 'FileUser' },
  { id: 'experiencia', label: 'Experiencia Laboral', icon: 'Briefcase' },
  { id: 'educacion', label: 'Educación', icon: 'GraduationCap' },
  { id: 'habilidades_tech', label: 'Habilidades Técnicas', icon: 'Code' },
  { id: 'habilidades_blandas', label: 'Habilidades Blandas', icon: 'Users' },
  { id: 'idiomas', label: 'Idiomas', icon: 'Languages' },
  { id: 'certificaciones', label: 'Certificaciones', icon: 'Award' },
  { id: 'proyectos', label: 'Proyectos', icon: 'Layout' }
];

export const DEFAULT_USER_STATS = {
  totalDocuments: 0,
  totalInterviews: 0,
  averageScore: 0,
  bestScore: 0,
  streakDays: 0,
  level: 'principiante' as UserLevel
};

export const SYSTEM_PROMPTS = {
  DOCUMENT_GENERATOR: `Eres un redactor profesional de documentos corporativos y expertos en reclutamiento.
Tu tarea es generar un documento de tipo {type} con estilo {style} en idioma {language}.
Utiliza los siguientes datos proporcionados por el usuario:
{userData}

Instrucciones de Formato CRÍTICAS para Exportación Limpia:
1. NO uses símbolos de Markdown como #, ##, ###, **, _, <, >.
2. Usa MAYÚSCULAS para resaltar los encabezados de sección (ej. EXPERIENCIA LABORAL).
3. Usa guiones simples (-) para las listas de logros o responsabilidades.
4. NUNCA pongas correos o enlaces entre símbolos < > ya que rompen la exportación.
5. NO inventes información personal. Si falta un dato esencial, deja [Marcador de Posición].
6. Usa verbos de acción fuertes y lenguaje persuasivo.
7. El resultado debe ser texto profesional y estructurado, listo para una exportación limpia a PDF/Word sin caracteres de formato adicionales.
`,
  CV_ANALYZER: `Eres un experto Reclutador y Analista de Sistemas ATS. 
Analiza el siguiente texto extraído de una hoja de vida:
{cvText}

Debes evaluar el CV basándote en: estructura, impacto de logros, palabras clave del sector y claridad.
Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "overallScore": número(0-100),
  "sectionScores": { "perfil": num, "experiencia": num, ... },
  "errors": [ { "field": "string", "severity": "alta|media|baja", "section": "string", "description": "string" } ],
  "improvements": [ { "priority": "alta|media|baja", "description": "string" } ],
  "keywords": { "found": ["string"], "suggested": ["string"] },
  "atsCompatible": boolean,
  "atsExplanation": "string",
  "rewrittenSections": { "sectionName": "texto mejorado" }
}
`,
  INTERVIEW_QUESTION_GENERATOR: `Eres un experto Entrevistador Senior. Genera {count} preguntas de entrevista para el cargo de {position} en el área de {area}, nivel {level}, modalidad {modality}.
El contexto es el mercado laboral de Latinoamérica.
Responde ÚNICAMENTE en formato JSON:
{
  "questions": [
    { "question": "string", "type": "string", "difficulty": "junior|mid|senior" }
  ]
}
`,
  INTERVIEW_EVALUATOR: `Evalúa la siguiente respuesta de entrevista basándote en el cargo {position}.
Pregunta: {question}
Respuesta del Usuario: {userAnswer}

Analiza en 5 dimensiones (0-100): Claridad, Coherencia, Profesionalismo, Relevancia, Estructura STAR.
Responde ÚNICAMENTE en formato JSON:
{
  "scores": { "claridad": num, "coherencia": num, "profesionalismo": num, "relevancia": num, "estructuraSTAR": num },
  "overallScore": num,
  "feedback": "string detallado por dimensión",
  "idealAnswer": "string con una respuesta modelo perfecta",
  "strengths": ["string"],
  "improvements": ["string"]
}
`
};
