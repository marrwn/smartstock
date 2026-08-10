import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Link2, RefreshCw } from 'lucide-react';
import ClickSpark from '@/components/reactbits/ClickSpark';

export default function SyncBar({ onSync, isSyncing }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSyncing) return;
    onSync({ url: url.trim(), file: null });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2 max-w-xl w-full">
      <div className="relative flex-1 min-w-[200px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A1A1AA]">
          <Link2 className="w-3.5 h-3.5" />
        </div>
        <Input
          type="url"
          placeholder="Paste your Google Sheet link..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isSyncing}
          className="pl-8 bg-[#111113] border-[#27272A] text-[#FAFAFA] placeholder:text-[#A1A1AA] focus-visible:ring-[#E4E4E7] rounded-xl font-medium text-xs h-9 w-full shadow-none"
        />
      </div>

      <ClickSpark sparkColor="#E4E4E7" sparkCount={8} sparkRadius={16}>
        <Button
          type="submit"
          disabled={isSyncing}
          className="bg-[#E4E4E7] text-[#09090B] hover:bg-[#FAFAFA] font-bold text-xs h-9 rounded-xl px-4 shrink-0 shadow-sm"
        >
          {isSyncing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Sync Data
            </>
          )}
        </Button>
      </ClickSpark>
    </form>
  );
}
