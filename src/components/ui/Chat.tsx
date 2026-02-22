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
    <div className="fixed bottom-20 left-4 w-[300px] max-h-[220px] bg-[#0A0E27]/85 backdrop-blur-sm border-2 border-[#D4AF37]/30 rounded-lg p-3 z-40">
      <div className="text-xs font-cinzel font-bold text-[#D4AF37]/60 uppercase tracking-wider mb-2">Chat</div>
      <div className="max-h-[140px] overflow-y-auto mb-2 space-y-1 pr-1">
        {chatMessages.map((msg, index) => (
          <div key={index} className="text-sm">
            <span className="font-bold text-[#D4AF37]">
              {msg.id.substring(0, 8)}:
            </span>
            <span className="ml-2 text-white/80">{msg.msg}</span>
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
          className="w-full px-3 py-2 bg-[#1A3A52]/60 border border-[#D4AF37]/30 rounded text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#D4AF37] focus:shadow-[0_0_10px_rgba(212,175,55,0.2)] transition-all"
          maxLength={100}
        />
      </form>
    </div>
  );
}
