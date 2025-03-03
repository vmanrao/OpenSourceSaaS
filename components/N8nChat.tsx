'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function N8nChat() {
  useEffect(() => {
    // Load the chat widget after the component mounts
    const loadChat = async () => {
      try {
        const { createChat } = await import('https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js');
        createChat({
          webhookUrl: 'https://vmanrao.app.n8n.cloud/webhook/2d67107c-e1e3-4779-9705-7bc6d7efadab/chat'
        });
      } catch (error) {
        console.error('Error loading n8n chat:', error);
      }
    };

    loadChat();
  }, []);

  return null;
} 