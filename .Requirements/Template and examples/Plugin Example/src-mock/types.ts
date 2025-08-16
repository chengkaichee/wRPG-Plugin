import type { OpenAI } from "openai";
import * as z from "zod/v4";

// OpenRouter API Response Types
export const OpenRouterModel = z.object({
  id: z.string(),
  name: z.string(),
  created: z.number().optional(),
  input_modalities: z.array(z.string()).optional(),
  output_modalities: z.array(z.string()).optional(),
  context_length: z.number().optional(),
  max_output_length: z.number().optional(),
  pricing: z
    .object({
      prompt: z.string(),
      completion: z.string(),
      image: z.string().optional(),
      request: z.string().optional(),
    })
    .optional(),
  supported_sampling_parameters: z.array(z.string()).optional(),
  supported_features: z.array(z.string()).optional(),
  description: z.string().optional(),
});

export const OpenRouterModelsResponse = z.object({
  data: z.array(OpenRouterModel),
});

// Configuration Types
export const OpenRouterConfig = z.object({
  apiKey: z.string().min(1, "API key is required"),
  selectedModel: z.string().optional(),
  baseUrl: z.string().url().default("https://openrouter.ai/api/v1"),
});

// Standardized Model Interface (compatible with existing Model schema)
export const StandardizedModel = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  provider: z.string(),
  contextLength: z.number().optional(),
  pricing: z
    .object({
      input: z.number(),
      output: z.number(),
    })
    .optional(),
});

// Provider Interface
export interface AIProvider {
  type: "llamacpp" | "openrouter";
  validateConfig(config: unknown): boolean;
  fetchModels(config: OpenRouterConfigType): Promise<StandardizedModelType[]>;
  testConnection(config: OpenRouterConfigType): Promise<void>;
  createClient(config: OpenRouterConfigType): OpenAI;
}

// Error Types
export const OpenRouterError = z.object({
  error: z.object({
    code: z.number(),
    message: z.string(),
    type: z.string().optional(),
  }),
});

export const OpenRouterApiError = z.object({
  status: z.number(),
  message: z.string(),
  code: z.string().optional(),
});

// Type exports
export type OpenRouterModelType = z.infer<typeof OpenRouterModel>;
export type OpenRouterModelsResponseType = z.infer<typeof OpenRouterModelsResponse>;
export type OpenRouterConfigType = z.infer<typeof OpenRouterConfig>;
export type StandardizedModelType = z.infer<typeof StandardizedModel>;
export type OpenRouterErrorType = z.infer<typeof OpenRouterError>;
export type OpenRouterApiErrorType = z.infer<typeof OpenRouterApiError>;

// API Client Utilities
export class OpenRouterApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: OpenRouterConfigType) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
      "X-Title": "Waidrin",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: OpenRouterApiErrorType;

      try {
        const parsedError = JSON.parse(errorText);
        errorData = {
          status: response.status,
          message: parsedError.error?.message || response.statusText,
          code: parsedError.error?.type || response.status.toString(),
        };
      } catch {
        errorData = {
          status: response.status,
          message: response.statusText,
          code: response.status.toString(),
        };
      }

      throw new OpenRouterApiException(errorData);
    }

    return response.json();
  }

  async fetchModels(): Promise<OpenRouterModelsResponseType> {
    return this.makeRequest<OpenRouterModelsResponseType>("/models");
  }

  async testConnection(): Promise<void> {
    // Simple test call to verify API key and connectivity
    await this.fetchModels();
  }
}

// Custom Error Class
export class OpenRouterApiException extends Error {
  public readonly status: number;
  public readonly code?: string;

  constructor(error: OpenRouterApiErrorType) {
    super(error.message);
    this.name = "OpenRouterApiException";
    this.status = error.status;
    this.code = error.code;
  }

  isRateLimited(): boolean {
    return this.status === 429;
  }

  isAuthenticationError(): boolean {
    return this.status === 401;
  }

  isInsufficientCredits(): boolean {
    return this.status === 402;
  }

  isModelUnavailable(): boolean {
    return this.status === 502 || this.status === 503;
  }
}

// Utility Functions
