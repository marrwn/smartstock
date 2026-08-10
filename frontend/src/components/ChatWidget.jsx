import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquareText, Send, X, Bot, User, Sparkles, Loader2, KeyRound, Lightbulb } from 'lucide-react';
import { sendChatMessage } from '@/lib/api';
import DecryptedText from '@/components/reactbits/DecryptedText';
import { toast } from 'sonner';

const QUICK_PROMPTS = [
  'Which items are at risk of stockout this week?',
  'What is my forecasted revenue for next 7 days?',
  'Draft a WhatsApp reorder message for Widget A',
];

export default function ChatWidget({ syncContext, onOpenApiKeyModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hello! I am SmartStock AI Copilot. Ask me anything about stockout risks, sales volume predictions, or supplier reorders.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendPrompt = async (textToSend) => {
    const userMessage = textToSend || prompt.trim();
    if (!userMessage || loading) return;

    setPrompt('');
    const userMsgObj = { id: Date.now().toString(), role: 'user', text: userMessage };
    setMessages((prev) => [...prev, userMsgObj]);

    const saved = localStorage.getItem('smartstock_llm_settings');
    let provider = 'gemini';
    let apiKey = '';

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.provider) provider = parsed.provider;
        if (parsed.apiKey) apiKey = parsed.apiKey;
      } catch (e) {
        console.error(e);
      }
    }

    if (!apiKey) {
      toast.error('API Key required. Please configure your key in Settings.', {
        action: {
          label: 'Open Settings',
          onClick: () => onOpenApiKeyModal(),
        },
      });
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: '⚠️ API Key missing. Click Settings (gear icon in header) to configure your Gemini or OpenAI API key.',
        },
      ]);
      return;
    }

    setLoading(true);

    try {
      const res = await sendChatMessage({
        prompt: userMessage,
        apiKey,
        provider,
        context: syncContext,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: res.reply || 'No response returned.',
          isNew: true,
        },
      ]);
    } catch (err) {
      const msg = err.message || 'Failed to communicate with AI provider.';
      toast.error(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: `❌ Error: ${msg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendPrompt(prompt);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-sm py-3 px-5 rounded-full shadow-2xl border border-zinc-700 dark:border-white hover:scale-105 active:scale-95 transition-all duration-300 group"
      >
        <Sparkles className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:rotate-12 transition-transform" />
        <span>Ask SmartStock AI</span>
      </button>

      {/* Floating Assistant Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[560px] bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Drawer Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 font-bold shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">SmartStock AI Copilot</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Live Inventory Stream Connected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenApiKeyModal}
                title="Configure API Key"
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <KeyRound className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-800 dark:text-zinc-200 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-medium rounded-br-none shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-bl-none'
                  }`}
                >
                  {m.role === 'assistant' && m.isNew ? (
                    <DecryptedText
                      text={m.text}
                      speed={20}
                      animateOn="view"
                      className="text-zinc-900 dark:text-zinc-100"
                    />
                  ) : (
                    <span>{m.text}</span>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white border border-zinc-800 dark:border-zinc-200 flex items-center justify-center text-white dark:text-zinc-950 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-800 dark:text-zinc-200 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-bl-none px-4 py-2.5 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-900 dark:text-zinc-100" />
                  <span>Evaluating inventory ML metrics...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <Lightbulb className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1" />
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendPrompt(qp)}
                disabled={loading}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 shrink-0 transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-2">
            <Input
              type="text"
              placeholder="Ask about inventory, reorders, predictions..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:ring-zinc-400 rounded-xl"
            />
            <Button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-xl px-3.5 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
