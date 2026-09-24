import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  RefreshCw, 
  Trash2, 
  Code, 
  BookOpen, 
  FileText, 
  HelpCircle,
  Lightbulb
} from 'lucide-react';

const AICareerAssistantPage = () => {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: "Hello! I am your CareerBridge AI Placement & Career Mentor 🚀\n\nI can help you prepare for technical campus placements, code reviews, and job interviews.\n\nTry asking me about:\n• MERN / React / Java / Python Roadmaps\n• DSA & LeetCode preparation strategy\n• Operating Systems, DBMS & Computer Networks\n• Improving your Resume ATS score\n• Cracking HR behavioral rounds (STAR method)"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (msgText) => {
    const textToSend = msgText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages = [...messages, { sender: 'user', text: textToSend.trim() }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/career-chat', { 
        message: textToSend.trim(),
        history: newMessages.slice(-6)
      });
      if (res.success && res.reply) {
        setMessages([...newMessages, { sender: 'bot', text: res.reply }]);
      } else {
        setMessages([...newMessages, { 
          sender: 'bot', 
          text: "I'm having trouble processing that right now. Please try again or rephrase your question." 
        }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages([...newMessages, { 
        sender: 'bot', 
        text: "Error connecting to AI Assistant. Please check server status and try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      { 
        sender: 'bot', 
        text: "Chat cleared. What technical topic or placement roadmap would you like to explore next?" 
      }
    ]);
  };

  const topicPrompts = [
    { label: '🚀 MERN Stack Roadmap', query: 'What is the complete roadmap to become a job-ready MERN Stack Developer?' },
    { label: '☕ Java & Spring Boot', query: 'What should I prepare in Core Java and Spring Boot for technical campus placements?' },
    { label: '💡 DSA LeetCode Plan', query: 'What is the best topic-by-topic DSA roadmap to crack coding rounds?' },
    { label: '💻 Operating Systems', query: 'What are the most asked Operating Systems concepts in technical interviews?' },
    { label: '🗄️ DBMS & ACID Rules', query: 'Explain ACID properties, Normalization, and Indexing for database rounds.' },
    { label: '📄 Resume ATS Tips', query: 'How do I optimize my resume and write XYZ formula bullet points to score 90+ ATS?' },
    { label: '🎯 HR STAR Method', query: 'How do I answer behavioral and situational questions using the STAR framework?' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Bot className="w-6 h-6" />
            </span>
            CareerBridge AI Career Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Intelligent placement mentor &amp; technical career advisor for software engineering students.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          title="Reset conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Topic Pills (Touch-scrollable on mobile) */}
      <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap gap-2 pt-1 pb-1">
        {topicPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(p.query)}
            disabled={loading}
            className="whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-full bg-indigo-50/70 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="h-[65vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 flex flex-col justify-between shadow-sm">
        
        {/* Messages Stream */}
        <div className="overflow-y-auto space-y-4 pr-1 sm:pr-2">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'bot' && (
                <div className="w-8 h-8 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div 
                className={`p-4 rounded-3xl text-xs sm:text-sm max-w-xl leading-relaxed whitespace-pre-line shadow-sm ${
                  m.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700/60'
                }`}
              >
                {m.text}
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 text-xs text-indigo-600 dark:text-indigo-400 pl-2 py-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span className="font-medium animate-pulse">AI Assistant is analyzing and drafting your guidance...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }} 
          className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask anything about coding roadmaps, DSA, interviews, or ATS resume tips..."
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AICareerAssistantPage;