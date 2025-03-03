'use client';

import { useEffect } from 'react';
import Script from 'next/script';

// Define types for the n8n chat API
interface N8nChatConfig {
  webhookUrl: string;
}

interface N8nChatWindow extends Window {
  createChat?: (config: N8nChatConfig) => void;
  initN8nChat?: () => void;
}

declare const window: N8nChatWindow;

export default function N8nChat() {
  useEffect(() => {
    // Define the chat initialization function
    window.initN8nChat = () => {
      if (window.createChat) {
        window.createChat({
          webhookUrl: 'https://vmanrao.app.n8n.cloud/webhook/2d67107c-e1e3-4779-9705-7bc6d7efadab/chat'
        });
      }
    };
  }, []);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js"
        strategy="lazyOnload"
        type="module"
        onLoad={() => {
          // Call the initialization function after the script loads
          window.initN8nChat?.();
        }}
      />
    </>
  );
} 