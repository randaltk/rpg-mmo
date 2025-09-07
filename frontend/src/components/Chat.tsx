'use client';

import { useState, useRef, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';

export default function Chat() {
  const [message, setMessage] = useState('');
  const { chatMessages, sendChatMessage } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendChatMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {chatMessages.map((msg, index) => (
          <div key={index} className="mb-1 text-sm">
            <span className="font-bold text-blue-400">
              {msg.id.substring(0, 8)}:
            </span>
            <span className="ml-2">{msg.msg}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="chat-input"
          maxLength={100}
        />
      </form>
    </div>
  );
}

