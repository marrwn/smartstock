import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, Sparkles, Check, Cpu } from 'lucide-react';
import { toast } from 'sonner';

export default function ApiKeyModal({ open, onOpenChange }) {
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('smartstock_llm_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.provider) setProvider(parsed.provider);
        if (parsed.apiKey) setApiKey(parsed.apiKey);
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, [open]);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem(
      'smartstock_llm_settings',
      JSON.stringify({ provider, apiKey: apiKey.trim() })
    );
    toast.success('AI Engine configuration updated!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 sm:max-w-md rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-semibold text-xs uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>AI Copilot Engine</span>
          </div>
          <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white">
            LLM Provider & Credentials
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs">
            Enter your API credentials to power real-time AI inventory queries. Keys are held exclusively in your local browser session.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Select Intelligence Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  provider === 'gemini'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-semibold shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  Google Gemini
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Gemini 1.5 Flash</span>
              </button>

              <button
                type="button"
                onClick={() => setProvider('openai')}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  provider === 'openai'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-semibold shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-sm">
                  <KeyRound className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  OpenAI
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">GPT-4o mini</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              API Key ({provider === 'gemini' ? 'Gemini Key' : 'OpenAI Secret Key'})
            </label>
            <Input
              type="password"
              placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-zinc-400 rounded-xl"
            />
          </div>

          <DialogFooter className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-xl text-xs font-semibold"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Save Configuration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
