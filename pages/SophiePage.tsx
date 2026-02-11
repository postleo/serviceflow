
import React, { useState, useEffect, useRef } from 'react';
import { Page, ChatMessage, ChatSession } from '../types';
import { IconWand, IconPlus } from '../components/Icons';
import { chatWithSophie } from '../services/gemini';
import { DB } from '../services/db';

interface Props {
  onNavigate: (page: Page) => void;
}

export const SophiePage: React.FC<Props> = ({ onNavigate }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = () => {
      const loadedSessions = DB.getChatSessions();
      setSessions(loadedSessions);
      if (loadedSessions.length > 0 && !currentSessionId) {
          // Do not auto select to allow creating new
      }
  };

  const handleNewChat = () => {
      setCurrentSessionId(null);
      setMessages([{ id: 'init', role: 'sophie', text: "Hello! I'm Sophie. How can I help you today?", timestamp: Date.now() }]);
  };

  const handleSelectSession = (session: ChatSession) => {
      setCurrentSessionId(session.id);
      setMessages(session.messages);
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      DB.deleteChatSession(id);
      if (currentSessionId === id) handleNewChat();
      loadSessions();
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    
    // Create session if it doesn't exist
    let sessionId = currentSessionId;
    let currentSession: ChatSession;

    if (!sessionId) {
        sessionId = Date.now().toString();
        setCurrentSessionId(sessionId);
        currentSession = {
            id: sessionId,
            title: input.substring(0, 30) + "...",
            lastActive: Date.now(),
            messages: updatedMessages
        };
    } else {
        const existing = DB.getChatSession(sessionId);
        currentSession = {
            id: sessionId,
            title: existing?.title || input.substring(0, 30) + "...",
            lastActive: Date.now(),
            messages: updatedMessages
        };
    }
    DB.saveChatSession(currentSession);
    loadSessions(); // Refresh list to show new chat or time update

    try {
      const responseText = await chatWithSophie(updatedMessages.map(m => ({ role: m.role, text: m.text })), input);
      const sophieMsg: ChatMessage = { id: (Date.now()+1).toString(), role: 'sophie', text: responseText, timestamp: Date.now() };
      
      const finalMessages = [...updatedMessages, sophieMsg];
      setMessages(finalMessages);
      
      // Update session with Sophie's response
      currentSession.messages = finalMessages;
      currentSession.lastActive = Date.now();
      DB.saveChatSession(currentSession);
      loadSessions();

    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-2xl shadow-sm border border-oxford-100 overflow-hidden">
      {/* Sidebar List */}
      <div className="w-64 border-r border-oxford-100 flex flex-col bg-oxford-50/50">
          <div className="p-4 border-b border-oxford-100">
              <button 
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 bg-white border border-oxford-200 text-oxford-700 py-2.5 rounded-xl hover:border-primary-500 hover:text-primary-600 transition-colors shadow-sm text-sm font-medium"
              >
                  <IconPlus className="w-4 h-4" /> New Chat
              </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {sessions.map(session => (
                  <div 
                    key={session.id}
                    onClick={() => handleSelectSession(session)}
                    className={`group p-3 rounded-lg cursor-pointer flex justify-between items-center transition-colors ${currentSessionId === session.id ? 'bg-white shadow-sm border border-oxford-200' : 'hover:bg-oxford-100 text-oxford-600'}`}
                  >
                      <div className="truncate text-sm pr-2">
                          <div className={`font-medium ${currentSessionId === session.id ? 'text-oxford-900' : ''}`}>{session.title}</div>
                          <div className="text-[10px] text-oxford-400">{new Date(session.lastActive).toLocaleDateString()}</div>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="opacity-0 group-hover:opacity-100 text-oxford-400 hover:text-red-500 p-1"
                      >
                          ×
                      </button>
                  </div>
              ))}
              {sessions.length === 0 && (
                  <div className="text-center text-xs text-oxford-400 mt-10">No history</div>
              )}
          </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 border-b border-oxford-100 flex items-center gap-3 bg-white">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                S
             </div>
             <div>
                 <h1 className="text-sm font-bold text-oxford-900">Sophie AI</h1>
                 <p className="text-xs text-oxford-500">Gemini 3 Pro Assistant</p>
             </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-oxford-300">
                    Start a new conversation
                </div>
            )}
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-2xl ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${msg.role === 'user' ? 'bg-oxford-200 text-oxford-600' : 'bg-primary-100 text-primary-700'}`}>
                            {msg.role === 'user' ? 'You' : 'S'}
                        </div>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-oxford-900 text-white rounded-tr-none' 
                            : 'bg-white border border-oxford-100 text-oxford-800 rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">S</div>
                        <div className="bg-white border border-oxford-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-2">
                            <span className="w-1.5 h-1.5 bg-oxford-300 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-oxford-300 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-oxford-300 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={endRef} />
        </div>

        <div className="p-4 bg-oxford-50 border-t border-oxford-100">
            <div className="max-w-3xl mx-auto relative">
                <input 
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-oxford-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="Message Sophie..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="absolute right-2 top-2 p-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:bg-oxford-300 transition-colors"
                >
                    <IconWand className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
