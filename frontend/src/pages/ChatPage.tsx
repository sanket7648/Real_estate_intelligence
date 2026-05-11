import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, Sparkles } from 'lucide-react';
import PropertyCard from '../components/ui/PropertyCard';
import { API_BASE_URL } from '../config';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  properties?: any[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    sender: 'ai',
    text: "Hello! I'm your AI Real Estate Assistant. I can scan all 20,000 properties in milliseconds. Try asking me:\n\n• 'Find me a 3 BHK in Bangalore under 1.5 Cr'\n• 'Show me luxury villas for sale in Mumbai'\n• 'I need a 2 BHK for rent in Pune below 40000'"
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.reply,
          properties: data.properties
        }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: "Sorry, I'm having trouble connecting to the database right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-100px)] flex flex-col animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/20">
          <Bot size={20} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white font-grotesk">AI Property Concierge</h1>
          <p className="text-slate-400 text-sm">Natural language search powered by Postgres & NLP</p>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 glass rounded-3xl border border-white/10 flex flex-col overflow-hidden">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-sky-500' : 'bg-blue-600'}`}>
                {msg.sender === 'user' ? <User size={18} className="text-white" /> : <Sparkles size={18} className="text-white" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-5 py-3.5 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-sky-500 text-white rounded-tr-sm' 
                    : 'bg-white/10 text-white rounded-tl-sm border border-white/5'
                }`}>
                  {msg.text}
                </div>

                {/* Render Properties if AI returns them */}
                {msg.properties && msg.properties.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                    {msg.properties.map((p, i) => (
                      <div key={i} className="transform scale-95 origin-top-left w-[280px]">
                        <PropertyCard property={p} compact />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 flex-row">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-600">
                <Sparkles size={18} className="text-white" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white/10 rounded-tl-sm border border-white/5 flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/40 border-t border-white/10">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., Find me a 3 BHK in Bangalore under 2 Cr..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white outline-none focus:border-blue-500/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-2 bottom-2 w-12 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-slate-500 text-white flex items-center justify-center transition-colors"
            >
              <Send size={18} className={input.trim() ? 'ml-1' : ''} />
            </button>
          </form>
          <div className="text-center mt-2 text-xs text-slate-500">
            Powered by Postgres Full-Text Search & NLP
          </div>
        </div>
      </div>
    </div>
  );
}