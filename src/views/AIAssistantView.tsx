import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Trash2,
  HelpCircle,
  TrendingDown,
  Clock,
  Store,
  Lightbulb,
  CheckCircle2,
  Loader2,
  Calendar,
} from 'lucide-react';
import { EventPlan, ChatMessage } from '../types';
import { formatCurrency, calculateBudgetStats, calculateTaskStats } from '../utils/formatters';
import { askEventPilotAssistant } from '../services/gemini';
import { useToast } from '../components/common/Toast';

interface AIAssistantViewProps {
  event: EventPlan;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ event }) => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-msg',
      role: 'assistant',
      content: `Hello! I am **EventPilot AI**, your dedicated project manager for **"${event.name}"**.

I have full real-time access to your event data:
- **Guest Count:** ${event.guestCount} guests in ${event.location}
- **Budget:** ${formatCurrency(event.totalBudget, event.currency)}
- **Style & Vision:** ${event.style} (${event.preferences ? `"${event.preferences}"` : 'custom'})
- **Registered Vendors:** ${event.vendors.length} vendors tracked

How can I help you optimize, sequence, or troubleshoot your event plan today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const budgetStats = calculateBudgetStats(event);
  const taskStats = calculateTaskStats(event);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const suggestedQuestions = [
    'What should I book first?',
    `How can I save ${event.currency === 'INR' ? '₹50,000' : '$5,000'}?`,
    'What tasks should I complete this week?',
    'Am I overspending on decoration?',
    'Give me 5 entertainment ideas.',
    'What am I forgetting?',
  ];

  const handleSend = async (questionToSend?: string) => {
    const q = (questionToSend || inputQuestion).trim();
    if (!q || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const reply = await askEventPilotAssistant(event, messages, q);
      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      showToast('Assistant encountered an error, try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `init-msg-${Date.now()}`,
        role: 'assistant',
        content: `Chat history cleared. I'm ready to assist with **"${event.name}"**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    showToast('Chat history reset', 'info');
  };

  // Simple markdown renderer for response messages
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-extrabold text-slate-900 text-sm sm:text-base mt-2 mb-1">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-extrabold text-slate-900 text-base sm:text-lg mt-3 mb-1">
                {line.replace('## ', '')}
              </h3>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-brand-600 font-bold">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatBold(line.substring(2)) }} />
              </div>
            );
          }
          if (/^\d+\.\s/.test(line)) {
            const num = line.match(/^\d+\./)?.[0];
            const text = line.replace(/^\d+\.\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-royal-600 font-bold shrink-0">{num}</span>
                <span dangerouslySetInnerHTML={{ __html: formatBold(text) }} />
              </div>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx} dangerouslySetInnerHTML={{ __html: formatBold(line) }} />;
        })}
      </div>
    );
  };

  const formatBold = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8.5rem)] animate-fade-in pb-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-royal-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">EventPilot AI Consultant</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Grounded in Event Data
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Active Context: {event.name} • {event.guestCount} guests • {formatCurrency(budgetStats.remaining, event.currency)} buffer
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-colors"
          title="Clear Chat History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Chips Bar */}
      <div className="py-2.5 flex items-center gap-2 overflow-x-auto border-b border-slate-100">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-600" /> Prompts:
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="px-3 py-1 bg-white hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-all shadow-xs shrink-0 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-gradient-to-tr from-brand-600 to-royal-600 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-3xl p-4 sm:p-5 shadow-xs ${
                  isUser
                    ? 'bg-brand-600 text-white rounded-tr-sm'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-sm'
                }`}
              >
                {isUser ? (
                  <p className="text-xs sm:text-sm font-medium">{msg.content}</p>
                ) : (
                  renderMessageContent(msg.content)
                )}
                <span
                  className={`text-[10px] mt-2 block ${
                    isUser ? 'text-brand-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-royal-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200/80 rounded-3xl p-4 rounded-tl-sm shadow-xs flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
              <span className="text-xs font-semibold text-slate-500">
                EventPilot AI analyzing event data...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={`Ask EventPilot AI anything about ${event.name}...`}
            disabled={isLoading}
            className="w-full pl-5 pr-28 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-md transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isLoading}
            className="absolute right-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          Powered by Google Gemini 1.5 Flash • Context aware: budget, vendors, timeline & preferences
        </p>
      </div>
    </div>
  );
};

