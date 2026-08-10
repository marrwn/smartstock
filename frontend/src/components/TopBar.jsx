import React from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import SyncBar from '@/components/SyncBar';

const pageTitles = {
  '/': 'Overview',
  '/inventory': 'Product Inventory',
  '/orders': 'Purchase Orders',
  '/forecasts': 'Demand Forecasts',
  '/models': 'ML Model Accuracy',
  '/settings': 'Settings',
  '/chat': 'Ask AI Copilot',
};

export default function TopBar({ onSync, isSyncing }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-[#27272A] bg-[#09090B]/95 backdrop-blur-md px-4 transition-colors duration-300">
      {/* Left: Sidebar Trigger + Title */}
      <div className="flex items-center gap-3 shrink-0">
        <SidebarTrigger className="text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]" />
        <div className="h-4 w-px bg-[#27272A]" />
        <h1 className="text-sm font-bold text-[#FAFAFA] tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right: Full-width Spacious SyncBar Input */}
      <div className="flex-1 flex justify-end max-w-xl">
        <SyncBar onSync={onSync} isSyncing={isSyncing} />
      </div>
    </header>
  );
}
