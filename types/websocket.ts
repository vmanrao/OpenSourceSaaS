// types/websocket.ts
// Type definitions for WebSocket messages and timer-related functionality

// Timer interfaces
export interface Timer {
  timerId: string;
  duration: number;
  description: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
}

// Payload interfaces
export interface TimerStartPayload {
  timerId: string;
  duration: number;
  description: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
}

export interface TimerCompletePayload {
  timerId: string;
  description: string;
  completedAt: number;
}

export interface TimerUpdatePayload {
  timers: Timer[];
  timerId: string;
  remainingTime: number;
}

export interface TimerSuggestionPayload {
  duration: number | string;
  description: string;
  needs_confirmation: boolean;
}

export interface TimerSuggestionResponsePayload {
  confirmed: boolean;
  duration: number;
  description: string;
}

// WebSocket message types
export type WebSocketMessageType = 
  | 'transcript' 
  | 'response' 
  | 'timer_complete' 
  | 'timer_update'
  | 'timer_suggestion'
  | 'timer_start'
  | 'timer_suggestion_response'
  | 'ping'
  | 'pong'
  | 'transcript_response'
  | 'interrupted'
  | 'stream'
  | 'recipe_selected'
  | 'error'

// Add new interface for recipe selection
export interface RecipeSelectedPayload {
  recipe_id: string;
  recipe_title: string;
}

// Union type for all possible payloads
export type WebSocketPayload = 
  | string  // for transcript and response
  | TimerCompletePayload
  | TimerUpdatePayload
  | TimerStartPayload
  | TimerSuggestionResponsePayload
  | RecipeSelectedPayload
  | TimerSuggestionPayload
  | null;   // for ping/pong messages

// WebSocket message interface
export interface WebSocketMessage {
  type: WebSocketMessageType;
  text?: string;
  payload?: string | TranscriptPayload | TimerCompletePayload | TimerUpdatePayload | RecipeSelectedPayload | TimerStartPayload | TimerSuggestionResponsePayload | TimerSuggestionPayload;
  conversation_id?: string;
  done?: boolean;
}

// Helper type guard functions
export const isTimerComplete = (payload: unknown): payload is TimerCompletePayload => {
  return typeof payload === 'object' && payload !== null && 'timerId' in payload;
};

export const isTimerUpdate = (payload: unknown): payload is TimerUpdatePayload => {
  return typeof payload === 'object' && payload !== null && 'timers' in payload;
};

// Update existing WebSocket types
export interface TranscriptPayload {
  text: string;
  timestamp: string;
  isFinal?: boolean;
}

// Update VoiceTranscript interface
export interface VoiceTranscript {
  type: 'transcript';
  payload: TranscriptPayload;
  conversation_id?: string;
}

export interface VoiceResponse {
  type: 'transcript_response' | 'response';
  text: string;
  payload?: string;
} 