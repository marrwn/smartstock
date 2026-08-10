import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Loader2, Lightbulb, KeyRound } from 'lucide-react';
import { sendChatMessage } from '@/lib/api';
import DecryptedText from '@/components/reactbits/DecryptedText';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const QUICK_PROMPTS = [
  'Which items are at risk of stockout this week?',
  'What is my forecasted revenue for next 7 days?',
  'Draft a WhatsApp reorder message for Widget A',
  'Summarize sales velocity across all categories',
];

export default function ChatPage({ data }) {
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      toast.error('API Key required. Please configure your key in Settings.');
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: '⚠️ API Key missing. Please set your Gemini or OpenAI key in Settings.',
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
        context: data,
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
    <div className="max-w-4xl space-y-4 animate-in fade-in duration-300 w-full">
      <Card className="bg-[#111113] border border-[#27272A] shadow-none rounded-xl overflow-hidden flex flex-col h-[680px] w-full">
        {/* Header */}
        <CardHeader className="p-4 border-b border-[#27272A] flex flex-row items-center justify-between pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] text-[#09090B] flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-[#FAFAFA]">
                AI Copilot Workspace
              </CardTitle>
              <p className="text-[11px] text-[#A1A1AA] font-medium">
                Live inventory context connected
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            render={<Link to="/settings" />}
            className="bg-[#18181B] border-[#27272A] text-xs font-semibold text-[#FAFAFA] hover:bg-[#27272A]"
          >
            <KeyRound className="w-3.5 h-3.5 mr-1" />
            Settings
          </Button>
        </CardHeader>

        {/* Message History */}
        <CardContent className="p-4 flex-1 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#FAFAFA] shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#E4E4E7] text-[#09090B] font-bold shadow-xs'
                    : 'bg-[#09090B] text-[#FAFAFA] border border-[#27272A]'
                }`}
              >
                {m.role === 'assistant' && m.isNew ? (
                  <DecryptedText
                    text={m.text}
                    speed={20}
                    animateOn="view"
                    className="text-[#FAFAFA]"
                  />
                ) : (
                  <span>{m.text}</span>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-[#FAFAFA] border border-[#27272A] flex items-center justify-center text-[#09090B] shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#FAFAFA] shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#09090B] border border-[#27272A] rounded-xl px-4 py-2.5 text-xs text-[#A1A1AA] flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FAFAFA]" />
                <span>Evaluating inventory metrics...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-[#27272A] bg-[#09090B]/50 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0" />
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendPrompt(qp)}
              disabled={loading}
              className="px-3 py-1 rounded-full bg-[#111113] border border-[#27272A] text-[11px] font-semibold text-[#FAFAFA] hover:bg-[#18181B] shrink-0 transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-[#27272A] bg-[#111113] flex items-center gap-2 shrink-0">
          <Input
            type="text"
            placeholder="Ask about inventory, reorders, predictions..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            className="bg-[#09090B] border-[#27272A] text-xs text-[#FAFAFA] placeholder:text-[#52525B] focus-visible:ring-[#E4E4E7] rounded-xl h-10"
          />
          <Button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="bg-[#E4E4E7] text-[#09090B] hover:bg-[#FAFAFA] text-xs font-bold rounded-xl h-10 px-4 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
