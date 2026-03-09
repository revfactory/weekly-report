export const CATEGORY_COLOR_PRESETS = [
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#06B6D4', // Cyan
  '#78716C', // Stone
] as const;

export const IMPORTANCE_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#3B82F6',
} as const;

export const IMPORTANCE_LABELS = {
  high: '높음',
  medium: '보통',
  low: '낮음',
} as const;

export const REPORT_STATUS_LABELS = {
  draft: '임시저장',
  classified: '분류완료',
  confirmed: '확인완료',
} as const;

export const REPORT_STATUS_COLORS = {
  draft: '#9CA3AF',
  classified: '#3B82F6',
  confirmed: '#22C55E',
} as const;

export const REPORT_TYPE_LABELS = {
  monthly: '월간',
  quarterly: '분기',
  yearly: '연간',
} as const;

export const API_KEY_STORAGE_KEY = 'weekpulse-api-key';
export const THEME_STORAGE_KEY = 'weekpulse-theme';

// ─── AI Provider ──────────────────────────────────────────────────

export const AI_PROVIDER_STORAGE_KEY = 'weekpulse-ai-provider';
export const AI_MODEL_STORAGE_KEY = 'weekpulse-ai-model';
export const AI_API_KEY_STORAGE_PREFIX = 'weekpulse-apikey-';

import type { AIProviderType, AIModelInfo } from '@/types';

export const AI_PROVIDER_LABELS: Record<AIProviderType, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  gemini: 'Gemini',
};

export const AI_PROVIDER_MODELS: Record<AIProviderType, AIModelInfo[]> = {
  anthropic: [
    { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', tag: '추천 · 균형', default: true },
    { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', tag: '최고 성능' },
    { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', tag: '빠름 · 경제적' },
  ],
  openai: [
    { id: 'gpt-5.4', name: 'GPT-5.4', tag: '추천 · 균형', default: true },
    { id: 'gpt-5.4-pro', name: 'GPT-5.4 Pro', tag: '고성능' },
    { id: 'gpt-5-mini', name: 'GPT-5 Mini', tag: '빠름 · 경제적' },
    { id: 'o4-mini', name: 'o4 Mini', tag: '추론 특화' },
    { id: 'o3-pro', name: 'o3 Pro', tag: '추론 최강' },
  ],
  gemini: [
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', tag: '추천 · 최신', default: true },
    { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite', tag: '빠름 · 경제적' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', tag: '안정적' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tag: '빠름' },
  ],
};

export const AI_PROVIDER_KEY_PLACEHOLDERS: Record<AIProviderType, string> = {
  anthropic: 'sk-ant-...',
  openai: 'sk-...',
  gemini: 'AIza...',
};

export const MAX_REPORT_CONTENT_LENGTH = 10000;
export const MAX_CATEGORY_NAME_LENGTH = 50;
export const MAX_ITEM_CONTENT_LENGTH = 500;
