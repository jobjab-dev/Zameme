'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

interface ChatMessage {
  user: string;
  message: string;
  timestamp: number;
}

export function TokenChat({ tokenAddress }: { tokenAddress: string }) {
  const { address } = useAccount();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const chatKey = `chat_${tokenAddress}`;

  // Load messages from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(chatKey);
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load chat');
      }
    }

    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      const stored = localStorage.getItem(chatKey);
      if (stored) {
        try {
          setMessages(JSON.parse(stored));
        } catch (e) {
          // ignore
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [chatKey]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    if (!address) {
      alert('Please connect wallet to chat');
      return;
    }

    const newMessage: ChatMessage = {
      user: address,
      message: inputMessage.trim(),
      timestamp: Date.now(),
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    localStorage.setItem(chatKey, JSON.stringify(updated));
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-yellow-400 text-black p-4 md:p-6 rounded-lg border-4 border-yellow-400">
      <h2 className="text-xl md:text-2xl font-black mb-4">💬 Chat</h2>

      {/* Messages */}
      <div className="bg-white border-2 border-black rounded p-3 mb-3 h-[300px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Be the first to chat! 💬
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg, i) => (
              <div key={i} className="text-sm">
                <span className="font-bold text-yellow-600">
                  {msg.user === address ? 'You' : `${msg.user.slice(0, 6)}...${msg.user.slice(-4)}`}
                </span>
                <span className="text-gray-500 text-xs ml-2">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
                <p className="text-black mt-1">{msg.message}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          maxLength={200}
          className="flex-1 p-3 bg-white border-2 border-black rounded text-sm"
        />
        <button
          onClick={handleSend}
          disabled={!inputMessage.trim() || !address}
          className="px-6 bg-black text-yellow-400 font-bold rounded hover:bg-gray-900 disabled:opacity-50 transition-all"
        >
          Send
        </button>
      </div>

      <p className="text-xs text-center mt-2 opacity-75">
        💡 Chat is stored locally (demo mode)
      </p>
    </div>
  );
}

