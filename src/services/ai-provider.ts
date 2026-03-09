import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProviderConfig } from '@/types';

export interface AIProvider {
  chat(system: string, user: string, maxTokens: number): Promise<string>;
}

class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    this.model = model;
  }

  async chat(system: string, user: string, maxTokens: number): Promise<string> {
    const res = await this.client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    });
    const text = res.content.find((b) => b.type === 'text');
    if (!text || text.type !== 'text') throw new Error('AI 응답에 텍스트가 없습니다.');
    return text.text;
  }
}

class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    this.model = model;
  }

  async chat(system: string, user: string, maxTokens: number): Promise<string> {
    const isReasoningModel = /^o[0-9]/.test(this.model);
    // 추론 모델은 추론 토큰이 max_completion_tokens에 포함되므로 8배 확보
    const tokens = isReasoningModel ? Math.max(maxTokens * 8, 16384) : maxTokens;

    const res = await this.client.chat.completions.create({
      model: this.model,
      max_completion_tokens: tokens,
      messages: [
        ...(isReasoningModel ? [] : [{ role: 'system' as const, content: system }]),
        { role: 'user' as const, content: isReasoningModel ? `${system}\n\n${user}` : user },
      ],
    });
    const text = res.choices[0]?.message?.content;
    if (!text) throw new Error('AI 응답에 텍스트가 없습니다.');
    return text;
  }
}

class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async chat(system: string, user: string, maxTokens: number): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: this.model,
      systemInstruction: { role: 'system', parts: [{ text: system }] },
      generationConfig: { maxOutputTokens: maxTokens },
    });
    const result = await model.generateContent(user);
    const text = result.response.text();
    if (!text) throw new Error('AI 응답에 텍스트가 없습니다.');
    return text;
  }
}

export function createProvider(config: AIProviderConfig): AIProvider {
  if (!config.apiKey) throw new Error('API_KEY_NOT_SET');

  switch (config.provider) {
    case 'anthropic':
      return new AnthropicProvider(config.apiKey, config.model);
    case 'openai':
      return new OpenAIProvider(config.apiKey, config.model);
    case 'gemini':
      return new GeminiProvider(config.apiKey, config.model);
  }
}

/** 테스트에 안전한 모델 ID (2026-03 기준 존재 확실, 경제적 모델) */
export const SAFE_TEST_MODELS: Record<string, string> = {
  anthropic: 'claude-haiku-4-5-20251001',
  openai: 'gpt-5-mini',
  gemini: 'gemini-2.5-flash',
};
