export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: number;
}

export interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    year: string;
  }>;
  skills: string[];
}

export interface InterviewSession {
  id: string;
  userId: string;
  role: string;
  area: string;
  level: string;
  questions: Array<{
    question: string;
    answer?: string;
    feedback?: string;
    score?: number;
  }>;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: number;
}

export interface GeneratedDocument {
  id: string;
  userId: string;
  type: 'cv' | 'cover-letter' | 'contract' | 'email';
  title: string;
  content: string;
  createdAt: number;
}
