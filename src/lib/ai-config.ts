import {
  AI_PROVIDER_STORAGE_KEY,
  AI_MODEL_STORAGE_KEY,
  AI_API_KEY_STORAGE_PREFIX,
  AI_PROVIDER_MODELS,
  API_KEY_STORAGE_KEY,
} from './constants';
import type { AIProviderType, AIProviderConfig } from '@/types';

/** 기존 단일 API 키를 anthropic 프로바이더 키로 마이그레이션 */
function migrateOldApiKey(): void {
  const oldKey = localStorage.getItem(API_KEY_STORAGE_KEY);
  if (oldKey && !localStorage.getItem(`${AI_API_KEY_STORAGE_PREFIX}anthropic`)) {
    localStorage.setItem(`${AI_API_KEY_STORAGE_PREFIX}anthropic`, oldKey);
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

export function getActiveProvider(): AIProviderType {
  migrateOldApiKey();
  return (localStorage.getItem(AI_PROVIDER_STORAGE_KEY) as AIProviderType) ?? 'anthropic';
}

export function setActiveProvider(provider: AIProviderType): void {
  localStorage.setItem(AI_PROVIDER_STORAGE_KEY, provider);
  const defaultModel =
    AI_PROVIDER_MODELS[provider].find((m) => m.default)?.id ??
    AI_PROVIDER_MODELS[provider][0].id;
  localStorage.setItem(AI_MODEL_STORAGE_KEY, defaultModel);
}

export function getActiveModel(): string {
  const provider = getActiveProvider();
  const stored = localStorage.getItem(AI_MODEL_STORAGE_KEY);
  const validModels = AI_PROVIDER_MODELS[provider].map((m) => m.id);
  if (stored && validModels.includes(stored)) return stored;
  return AI_PROVIDER_MODELS[provider].find((m) => m.default)?.id ?? validModels[0];
}

export function setActiveModel(model: string): void {
  localStorage.setItem(AI_MODEL_STORAGE_KEY, model);
}

export function getApiKey(provider: AIProviderType): string {
  migrateOldApiKey();
  return localStorage.getItem(`${AI_API_KEY_STORAGE_PREFIX}${provider}`) ?? '';
}

export function setApiKey(provider: AIProviderType, key: string): void {
  if (key.trim()) {
    localStorage.setItem(`${AI_API_KEY_STORAGE_PREFIX}${provider}`, key.trim());
  } else {
    localStorage.removeItem(`${AI_API_KEY_STORAGE_PREFIX}${provider}`);
  }
}

export function getActiveConfig(): AIProviderConfig {
  const provider = getActiveProvider();
  return {
    provider,
    model: getActiveModel(),
    apiKey: getApiKey(provider),
  };
}
