export type UserRole = 'user' | 'admin';
export type UserLevel = 'principiante' | 'intermedio' | 'avanzado' | 'experto';

export interface UserPreferences {
  darkMode: boolean;
  emailNotifications: {
    welcome: boolean;
    interviewReport: boolean;
    weeklySummary: boolean;
    inactivity: boolean;
  };
  idioma: 'es' | 'en';
  fontSize: 'small' | 'medium' | 'large';
}

export interface UserStats {
  totalDocuments: number;
  totalInterviews: number;
  averageScore: number;
  bestScore: number;
  streakDays: number;
  level: UserLevel;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  provider: string;
  cargo: string;
  area: string;
  ciudad: string;
  pais: string;
  linkedin: string;
  github?: string;
  portfolio?: string;
  createdAt: any;
  lastLogin: any;
  role: UserRole;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface DocumentVersion {
  content: string;
  updatedAt: any;
}

export interface DocumentData {
  id?: string;
  userId: string;
  type: 'hoja_de_vida' | 'carta_presentacion' | 'contrato' | 'correo_formal' | 'carta_renuncia' | 'carta_recomendacion';
  style: 'formal' | 'ejecutivo' | 'creativo' | 'minimalista';
  language: 'es' | 'en';
  content: string;
  formData: any;
  status: 'borrador' | 'completado';
  createdAt: any;
  updatedAt: any;
  versions: DocumentVersion[];
}

export interface InterviewQuestion {
  question: string;
  userAnswer: string;
  aiScore: number;
  aiFeedback: string;
  idealAnswer: string;
  timeSpent: number;
  type?: string;
  difficulty?: string;
}

export interface InterviewData {
  id?: string;
  userId: string;
  position: string;
  area: string;
  level: 'junior' | 'intermedio' | 'senior' | 'liderazgo';
  modality: 'conductual' | 'tecnica' | 'competencias' | 'situacional' | 'mixta';
  questionsCount: number;
  language: 'es' | 'en';
  status: 'en_progreso' | 'completada';
  totalScore: number;
  dimensionScores: {
    claridad: number;
    coherencia: number;
    profesionalismo: number;
    relevancia: number;
    estructuraSTAR: number;
  };
  duration: number;
  completedAt: any;
  questions: InterviewQuestion[];
}

export interface CVAnalysis {
  id?: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  extractedText: string;
  overallScore: number;
  sectionScores: Record<string, number>;
  errors: { field: string; severity: 'alta' | 'media' | 'baja'; section: string; description: string; }[];
  improvements: { priority: string; description: string; }[];
  keywords: { found: string[]; suggested: string[]; };
  atsCompatible: boolean;
  atsExplanation?: string;
  rewrittenSections: Record<string, string>;
  createdAt: any;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: any;
}
