// ─── Enums (union types) ───────────────────────────────────────────

export type ReportStatus = 'draft' | 'classified' | 'confirmed';
export type Importance = 'high' | 'medium' | 'low';
export type ReportType = 'monthly' | 'quarterly' | 'yearly';
export type Theme = 'light' | 'dark' | 'system';
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// ─── Core Data Entities ────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  sortOrder: number;
  isDefault: boolean;
  createdAt: Date;
}

export interface ReportItem {
  id: string;
  content: string;
  categoryId: string;
  importance: Importance;
  timeSpent: number | null;
}

export interface WeeklyReport {
  id: string;
  year: number;
  week: number;
  weekStart: Date;
  weekEnd: Date;
  rawContent: string;
  items: ReportItem[];
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedReport {
  id: string;
  type: ReportType;
  year: number;
  period: number;
  title: string;
  content: string;
  sourceReportIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  apiKey: string;
  theme: Theme;
  defaultCategories: string[];
  reportLanguage: string;
}

// ─── Toast ─────────────────────────────────────────────────────────

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// ─── AI Provider ──────────────────────────────────────────────────

export type AIProviderType = 'anthropic' | 'openai' | 'gemini';

export interface AIModelInfo {
  id: string;
  name: string;
  tag?: string;
  default?: boolean;
}

export interface AIProviderConfig {
  provider: AIProviderType;
  model: string;
  apiKey: string;
}

// ─── AI Classification ────────────────────────────────────────────

export interface ClassificationResultItem {
  content: string;
  categoryId: string;
  importance: Importance;
}
