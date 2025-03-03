'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function N8nChat() {
  useEffect(() => {
    // Define the chat initialization function
    (window as any).initN8nChat = () => {
      (window as any).createChat({
        webhookUrl: 'https://vmanrao.app.n8n.cloud/webhook/2d67107c-e1e3-4779-9705-7bc6d7efadab/chat'
      });
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
          (window as any).initN8nChat();
        }}
      />
    </>
  );
} 