"use client";

// contexts/WebSocketContext.tsx
// WebSocket context provider for managing real-time communication

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketMessage, WebSocketMessageType } from '@/types/websocket';
import { getWsUrl } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

interface WebSocketContextType {
  sendMessage: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
  isConnected: boolean;
  connectionError: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

const WS_URL = getWsUrl();
const RECONNECT_INTERVAL = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
const MAX_RECONNECT_TIMEOUT = 10000;

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef<number>(0);
  const isClosing = useRef<boolean>(false);
  const mounted = useRef<boolean>(false);
  const lastTimerSuggestion = useRef<string>('');
  const processedMessages = useRef(new Set<string>());
  const messageCache = useRef<Set<string>>(new Set());

  const handleConnectionError = (error: string) => {
    if (!mounted.current) return;
    console.warn(`WebSocket connection error: ${error}`);
    setConnectionError(error);
    setIsConnected(false);
  };

  const clearTimeouts = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
  };

  const connectWebSocket = useCallback(() => {
    if (!mounted.current) return;
    if (!user) {
      console.log('No user authenticated, delaying WebSocket connection');
      return;
    }
    
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }
    if (ws.current?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket connection in progress');
      return;
    }
      
    // Force close existing connection if in a bad state
    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
      ws.current.close();
      ws.current = null;
    }

    clearTimeouts();
    
    try {
      console.log(`Attempting to connect to ${WS_URL}`);
      ws.current = new WebSocket(`${WS_URL}?user_id=${user.id}`);

      ws.current.onopen = () => {
        if (!mounted.current) return;
        console.log('WebSocket connection established');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        
        // Send initial message with user_id
        ws.current?.send(JSON.stringify({ 
          type: 'init',
          user_id: user.id
        }));
      };

      ws.current.onclose = (event) => {
        if (!mounted.current) return;
        if (isClosing.current) {
          isClosing.current = false;
          return;
        }

        console.log('WebSocket connection closed:', event);
        setIsConnected(false);
        
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts.current), MAX_RECONNECT_TIMEOUT);
          setTimeout(connectWebSocket, timeout);
          reconnectAttempts.current++;
        }
      };

      ws.current.onmessage = (event) => {
        if (!mounted.current) return;
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          // Only log completed messages or non-stream messages
          if (message.done || message.type !== 'stream') {
            console.log('Received WebSocket message:', message);
          }
          
          const messageId = `${message.type}-${message.conversation_id}-${message.payload}`;
          if (messageCache.current.has(messageId)) return;
          messageCache.current.add(messageId);

          setTimeout(() => messageCache.current.delete(messageId), 5000);
          
          switch (message.type) {
            case 'stream':
              if (!message.done) {
                // console.log('Streaming response:', message.payload);
                setLastMessage(message);
              } else {
                // Handle completion of stream
                setLastMessage({
                  ...message,
                  done: true
                });
              }
              break;
              
            case 'timer_suggestion':
              // Type guard to ensure payload is TimerSuggestionPayload
              if (message.payload && 
                  typeof message.payload === 'object' && 
                  'duration' in message.payload && 
                  'description' in message.payload) {
                const suggestionKey = `${message.payload.duration}-${message.payload.description}`;
                if (lastTimerSuggestion.current === suggestionKey) {
                  return; // Skip duplicate suggestion
                }
                lastTimerSuggestion.current = suggestionKey;
                console.log('Timer suggestion received:', message.payload);
                setLastMessage(message);
              }
              break;
              
            case 'timer_start':
              console.log('Timer start received:', message);
              setLastMessage(message);
              break;
              
            case 'timer_update':
              console.log('Timer update received:', message.payload);
              setLastMessage(message);
              break;
              
            case 'timer_complete':
              console.log('Timer completed:', message.payload);
              setLastMessage(message);
              break;
              
            default:
              console.warn('Unknown message type:', message.type);
              setLastMessage(message);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onerror = () => {
        if (!mounted.current) return;
        handleConnectionError('Failed to establish connection');
      };

    } catch (error) {
      if (!mounted.current) return;
      handleConnectionError(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [user]);

  useEffect(() => {
    mounted.current = true;
    connectWebSocket();

    return () => {
      mounted.current = false;
      isClosing.current = true;
      clearTimeouts();
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [user]);

  const sendMessage = (message: WebSocketMessage) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected. Message not sent:', message);
      return;
    }

    try {
      ws.current.send(JSON.stringify(message));
    } catch (error) {
      handleConnectionError(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Cleanup old messages periodically
  useEffect(() => {
    const cleanup = () => {
      processedMessages.current.clear();
    };
    const timer = setTimeout(cleanup, 5000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const cleanup = () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
    
    window.addEventListener('cleanup-before-logout', cleanup);
    return () => window.removeEventListener('cleanup-before-logout', cleanup);
  }, []);

  return (
    <WebSocketContext.Provider value={{ 
      sendMessage, 
      lastMessage, 
      isConnected,
      connectionError 
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}