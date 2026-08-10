import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import TopBar from '@/components/TopBar';
import OnboardingFlow from '@/components/OnboardingFlow';
import { syncData } from '@/lib/api';
import { toast } from 'sonner';

export default function Layout() {
  const [data, setData] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('smartstock_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('smartstock_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('smartstock_theme', theme);
  }, [theme]);

  // Initial auto sync on load so pages have data
  useEffect(() => {
    if (profile) {
      handleSync({ url: '', file: null });
    }
  }, [profile]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSync = async ({ url, file }) => {
    setIsSyncing(true);
    try {
      const result = await syncData({ sourceUrl: url, file });
      setData(result);
      setIsSyncing(false);
    } catch (err) {
      setIsSyncing(false);
      toast.error(err.message || 'Failed to sync sales dataset.');
    }
  };

  const handleOnboardingComplete = (newProfile) => {
    setProfile(newProfile);
    if (!data) {
      handleSync({ url: '', file: null });
    }
  };

  // If first time user (no profile saved), show full-screen onboarding sequence
  if (!profile) {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        onSync={handleSync}
      />
    );
  }

  const stockWarningsCount = data?.stock_warnings?.length || 0;

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="w-full max-w-full min-w-0 overflow-x-hidden flex-1 flex flex-col bg-[#09090B]">
        <TopBar
          onSync={handleSync}
          isSyncing={isSyncing}
          theme={theme}
          onToggleTheme={toggleTheme}
          stockWarningsCount={stockWarningsCount}
        />
        <main className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden p-4 sm:p-6 bg-[#09090B] text-[#FAFAFA] transition-colors duration-300">
          <Outlet context={{ data, handleSync, isSyncing, profile }} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
