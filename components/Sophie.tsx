
import React, { useState, useRef, useEffect } from 'react';
import { IconWand, IconMic } from './Icons';
import { chatWithSophie } from '../services/gemini';
import { DB } from '../services/db';
import { ChatMessage, ChatSession } from '../types';

export const Sophie: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'sophie', text: "Hi! I'm Sophie. Need help brainstorming a training topic?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Save session to DB when messages change
  useEffect(() => {
      if (messages.length > 1) { // Don't save default init only
          const sessionId = activeSessionId || Date.now().toString();
          if (!activeSessionId) setActiveSessionId(sessionId);

          const session: ChatSession = {
              id: sessionId,
              title: messages[1]?.text.substring(0, 30) + '...' || 'New Chat',
              lastActive: Date.now(),
              messages: messages
          };
          DB.saveChatSession(session);
      }
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatWithSophie(messages.map(m => ({role: m.role, text: m.text})), textToSend);
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'sophie', text: response, timestamp: Date.now() }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'sophie', text: "I'm having trouble connecting right now.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const toggleMic = () => {
      if (!('webkitSpeechRecognition' in window)) {
          alert("Speech recognition not supported in this browser.");
          return;
      }

      if (isListening) {
          // STOP and SEND
          if (recognitionRef.current) {
              recognitionRef.current.stop();
          }
          setIsListening(false);
          // Sending happens in onend/onresult logic usually, but here we can force send current input buffer
          // if we were streaming. Since simple API returns final transcript:
          return;
      }

      // START
      setIsListening(true);
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognitionRef.current = recognition;

      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          // Auto send when result comes back
          handleSend(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
  };

  return (
    <>
      {/* Floating Trigger - Moved Horizontally next to Quick Capture */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-48 z-40 flex items-center gap-2 bg-white text-oxford-900 px-4 py-3 rounded-full shadow-lg border border-oxford-100 transition-all hover:scale-105 ${isOpen ? 'ring-2 ring-primary-500' : ''}`}
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 flex items-center justify-center text-white text-[10px] font-bold">
            AI
        </div>
        <span className="font-medium text-sm">Ask Sophie</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 h-[450px] bg-white rounded-2xl shadow-2xl border border-oxford-200 z-50 flex flex-col animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-oxford-100 bg-gradient-to-r from-oxford-50 to-white rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                S
              </div>
              <div>
                <h3 className="font-bold text-oxford-900 text-sm">Sophie</h3>
                <p className="text-[10px] text-oxford-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Gemini 3 Powered
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-oxford-400 hover:text-oxford-600">×</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-oxford-50/30">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                    ? 'bg-oxford-900 text-white rounded-br-none' 
                    : 'bg-white border border-oxford-100 text-oxford-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-oxford-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-oxford-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-oxford-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-oxford-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-oxford-100 bg-white rounded-b-2xl">
            <div className={`flex items-center gap-2 bg-oxford-50 border border-oxford-200 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-400 transition-all ${isListening ? 'ring-2 ring-red-500 border-red-500 bg-red-50' : ''}`}>
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isListening}
                className="flex-1 bg-transparent text-sm focus:outline-none disabled:text-oxford-400"
                placeholder={isListening ? "Listening... click mic to send" : "Ask Sophie..."}
              />
              <button 
                onClick={toggleMic}
                className={`${isListening ? 'text-red-600 animate-pulse scale-110' : 'text-oxford-400 hover:text-primary-600'}`}
              >
                <IconMic className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isListening}
                className="text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-transform"
              >
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white">
                  <IconWand className="w-3 h-3" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
