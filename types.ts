
export enum Page {
  HOME = 'home',
  PACKS = 'packs',
  PROJECT_DETAILS = 'project_details',
  CAPTURE = 'capture',
  LIBRARY = 'library',
  HISTORY = 'history',
  SETTINGS = 'settings',
  AUTH = 'auth',
  ONBOARDING = 'onboarding',
  SOPHIE_CHAT = 'sophie_chat',
  ADMIN = 'admin',
  HELP = 'help'
}

export enum DeliverableType {
  CARDS = 'Service Sequence Cards',
  DIAGRAM = 'Layout Diagram',
  SCRIPT = 'Script Card',
  FLOWCHART = 'Problem Resolution Flowchart',
  AUDIO = 'Audio Training',
  CODE_MODULE = 'Interactive Module',
  SLIDES = 'Visual Slideshow',
  VIDEO = 'Training Video'
}

// Auth & User Types
export type UserRole = 'admin' | 'manager' | 'staff';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  token?: string; // The access token used to login
}

export interface AuthToken {
  code: string;
  assignedToEmail: string;
  createdBy: string;
  status: 'active' | 'used' | 'revoked';
  role: UserRole;
}

// Data Types
export interface TrainingPack {
  id: string;
  userId: string;
  title: string;
  subtitle: string;
  progress: number; 
  items: TrainingItem[];
  status: 'active' | 'archived';
}

export interface TrainingItem {
  id: string;
  title: string;
  type: DeliverableType;
  status: 'draft' | 'ready' | 'processing';
  lastUpdated: string;
  content?: AgentOutput;
}

// Agent Output Structures
export interface AgentOutput {
  title: string;
  summary: string;
  steps?: Array<{
    stepNumber: number;
    action: string;
    script: string;
    visualCue: string;
  }>;
  visualCode?: string; // SVG or HTML code with Mermaid
  visualImage?: string; // Base64 Image
  visualSlides?: string[]; // Array of Base64 Images for slideshow
  visualType?: 'svg' | 'html' | 'image' | 'slides';
  audioAsset?: string;
  guideHtml?: string; // Full HTML Training Guide
}

export interface UserSettings {
  workspaceName: string;
  accentColor: string;
  brandTone: 'Formal' | 'Casual' | 'Encouraging' | 'Direct';
  visualStyle: 'Minimalist' | 'Cartoon' | 'Realistic' | 'Sketch';
  sophiePersonality: 'Helper' | 'Coach' | 'Manager';
  enableAudio: boolean;
  enableImages: boolean;
  enableDiagrams: boolean;
}

export interface HistoryEntry {
  id: string;
  userId: string;
  date: string;
  title: string;
  type: DeliverableType;
  preview: string;
  data: AgentOutput;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'sophie';
    text: string;
    timestamp: number;
}

export interface ChatSession {
    id: string;
    title: string;
    lastActive: number;
    messages: ChatMessage[];
}
