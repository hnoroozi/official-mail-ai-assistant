
export enum UrgencyLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface ReplyTemplate {
  label: string;
  subject: string;
  body: string;
}

export interface TranslatedContent {
  summary_paragraph: string;
  summary_bullets: string[];
  actions: { task: string; completed: boolean }[];
}

export interface LetterAnalysis {
  title: string;
  category: string;
  confidence_score: number; // 0-100
  summary_paragraph: string;
  summary_bullets: string[];
  urgency: {
    level: UrgencyLevel;
    reasons: string[];
  };
  deadlines: {
    date: string;
    description: string;
    reminderSet?: boolean;
  }[];
  actions: {
    task: string;
    completed: boolean;
  }[];
  consequences_if_ignored: string;
  questions_to_ask_office: string[]; 
  extracted_fields: {
    amounts: string[];
    dates: string[];
    reference_numbers: string[];
    organizations: string[];
  };
  suggested_replies: ReplyTemplate[];
  translation?: TranslatedContent;
}

export interface LetterItem {
  id: string;
  createdAt: number;
  imageUrls: string[];
  analysis: LetterAnalysis;
  verifiedFields?: string[];
}

export interface AppSettings {
  userName: string;
  biometricLock: boolean;
  familyVaultEnabled: boolean;
}

export type AppScreen = 'ONBOARDING' | 'HOME' | 'SCAN' | 'PROCESSING' | 'RESULTS' | 'LIBRARY' | 'SETTINGS' | 'CHAT' | 'AGENDA' | 'INSIGHTS' | 'HELP';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type SupportedLanguage = 'English' | 'Spanish' | 'Persian' | 'Chinese' | 'French' | 'Arabic';
