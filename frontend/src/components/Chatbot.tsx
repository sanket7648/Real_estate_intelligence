import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, MessageSquare, ChevronDown } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  properties?: any[];
}

const formatPrice = (p: number) => {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)}Cr`;
  return `₹${(p / 100000).toFixed(1)}L`;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  
  // NEW: This holds the AI's memory (city, budget, bhk) across messages
  const [chatContext, setChatContext] = useState<any>({}); 
  
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    sender: 'ai',
    text: "Hello! I'm your AI Concierge. How can I help you find your dream property today?\n\nTry: 'Find me a 3 BHK in Bangalore under 2 Cr'"
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch('${API_BASE_URL}/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send the message AND the current memory context
        body: JSON.stringify({ message: userMessage, context: chatContext }) 
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the component's memory with the new context from the backend
        setChatContext(data.new_context);

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.reply,
          properties: data.properties
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 hover:scale-110'}`}
      >
        <MessageSquare size={24} className="text-white" />
      </button>

      {/* Chat Window Overlay */}
      <div 
        className={`fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-h-[85vh] max-w-[calc(100vw-3rem)] glass bg-[#0a1128]/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AI Assistant</h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1">
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-sky-500' : 'bg-blue-600'}`}>
                {msg.sender === 'user' ? <User size={14} className="text-white" /> : <Sparkles size={14} className="text-white" />}
              </div>

              <div className={`max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-4 py-2.5 rounded-2xl whitespace-pre-wrap text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-sky-500 text-white rounded-tr-sm' 
                    : 'bg-white/10 text-white rounded-tl-sm border border-white/5'
                }`}>
                  {msg.text}
                </div>

                {/* Compact Property List (Dynamic options) */}
                {msg.properties && msg.properties.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2 w-full">
                    {msg.properties.map((p, i) => (
                      <div key={i} className="flex gap-3 p-2 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer">
                        <img src={p.image} alt={p.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0 py-0.5">
                          <h4 className="text-white text-xs font-bold line-clamp-1">{p.title}</h4>
                          <div className="text-[10px] text-slate-400 mt-0.5">{p.location}, {p.city}</div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-bold text-sky-400">{formatPrice(p.price)}</span>
                            <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-slate-300">{p.bhk} BHK</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 flex-row">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-600">
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/10 rounded-tl-sm border border-white/5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-3 bg-black/20 border-t border-white/10 rounded-b-3xl">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message AI Assistant..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white outline-none focus:border-blue-500/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-1.5 top-1.5 bottom-1.5 w-9 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-slate-500 text-white flex items-center justify-center transition-colors"
            >
              <Send size={14} className={input.trim() ? 'ml-0.5' : ''} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}