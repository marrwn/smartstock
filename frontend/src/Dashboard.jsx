import React, { useState, useEffect } from 'react';
import SyncBar from '@/components/SyncBar';
import ApiKeyModal from '@/components/ApiKeyModal';
import KpiCards from '@/components/KpiCards';
import StockAlertBanner from '@/components/StockAlertBanner';
import ModelLeaderboard from '@/components/ModelLeaderboard';
import DemandChart from '@/components/DemandChart';
import ChatWidget from '@/components/ChatWidget';
import ShinyButton from '@/components/reactbits/ShinyButton';
import ClickSpark from '@/components/reactbits/ClickSpark';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from '@/components/ui/empty';
import {
  Settings,
  Database,
  Play,
  Sun,
  Moon,
  Building2,
  LayoutDashboard,
  Boxes,
  Cpu,
  Search,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { syncData } from '@/lib/api';
import { toast } from 'sonner';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Theme State (Dark Mode default)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('smartstock_theme') || 'dark';
  });

  // Active Tab State
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('smartstock_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSync = async ({ url, file }) => {
    setIsSyncing(true);
    setSyncProgress(20);
    setProgressText('Processing sales data...');

    const t1 = setTimeout(() => {
      setSyncProgress(50);
      setProgressText('Fitting forecasting models...');
    }, 600);

    const t2 = setTimeout(() => {
      setSyncProgress(85);
      setProgressText('Calculating stockout risks...');
    }, 1200);

    try {
      const result = await syncData({ sourceUrl: url, file });
      clearTimeout(t1);
      clearTimeout(t2);
      setSyncProgress(100);
      setProgressText('Forecast complete');

      setTimeout(() => {
        setData(result);
        setHasSynced(true);
        setIsSyncing(false);
        toast.success('Sales data updated and forecasts calculated.');
      }, 350);
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsSyncing(false);
      setSyncProgress(0);
      toast.error(err.message || 'Failed to sync sales dataset.');
    }
  };

  // Group forecasts for inventory table
  const inventoryRows = React.useMemo(() => {
    if (!data || !data.forecasts) return [];
    const map = {};
    data.forecasts.forEach((item) => {
      if (!map[item.product]) {
        map[item.product] = {
          product: item.product,
          total_predicted: 0,
          days_forecasted: 0,
        };
      }
      map[item.product].total_predicted += item.predicted_qty;
      map[item.product].days_forecasted += 1;
    });

    return Object.values(map).map((row) => {
      const warning = (data.stock_warnings || []).find((w) => w.product === row.product);
      return {
        ...row,
        daily_avg: Math.round(row.total_predicted / (row.days_forecasted || 1)),
        stockout_risk: !!warning,
        days_left: warning ? warning.days_left : '> 7',
        reorder_qty: warning ? warning.reorder_qty : Math.round(row.total_predicted * 1.5),
      };
    });
  }, [data]);

  const filteredInventory = inventoryRows.filter((r) =>
    r.product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWhatsAppReorder = (item) => {
    const text = encodeURIComponent(
      `Reorder needed: ${item.product} — ${item.reorder_qty} units (only ${item.days_left} days of stock left).`
    );
    const supplierNumber = localStorage.getItem('smartstock_supplier_phone') || '';
    const whatsappUrl = supplierNumber
      ? `https://wa.me/${supplierNumber}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] dark:bg-[#0A0A0C] bg-[#F8F9FA] text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300 pb-20">
      {/* App Top Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-[#0E0E11]/95 backdrop-blur-md px-4 sm:px-6 py-3 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Brand & Active Store */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-bold text-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  SmartStock
                </span>
                <span className="text-zinc-400 dark:text-zinc-600">/</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Acme Retail Store
                </span>
              </div>
            </div>
          </div>

          {/* SyncBar & Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <SyncBar onSync={handleSync} isSyncing={isSyncing} />

            {/* Light / Dark Mode Toggle */}
            <Button
              type="button"
              variant="outline"
              onClick={toggleTheme}
              className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl shrink-0 p-2 h-9 w-9"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
            </Button>

            {/* Settings Trigger */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsApiKeyModalOpen(true)}
              className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl shrink-0 p-2 h-9 w-9"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        
        {/* Syncing Progress Bar */}
        {isSyncing && (
          <div className="bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                {progressText}
              </span>
              <span>{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="h-1.5">
              <ProgressTrack className="bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <ProgressIndicator className="bg-zinc-900 dark:bg-zinc-100 h-full transition-all duration-300" />
              </ProgressTrack>
            </Progress>
          </div>
        )}

        {/* Loading Skeletons */}
        {isSyncing ? (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-24 bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800 rounded-xl" />
              <Skeleton className="h-24 bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800 rounded-xl" />
              <Skeleton className="h-24 bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800 rounded-xl" />
            </div>
            <Skeleton className="h-40 bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800 rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Skeleton className="h-72 bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800 rounded-xl" />
              <Skeleton className="h-72 bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800 rounded-xl" />
            </div>
          </div>
        ) : !hasSynced ? (
          /* Plain Merchant Empty State */
          <div className="my-12">
            <Empty className="bg-white dark:bg-[#111114] border border-dashed border-zinc-300 dark:border-zinc-800 p-8 sm:p-12 rounded-2xl max-w-xl mx-auto shadow-sm">
              <EmptyMedia variant="icon" className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 mb-2">
                <Database className="w-6 h-6" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  No Sales Data Loaded
                </EmptyTitle>
                <EmptyDescription className="text-zinc-500 dark:text-zinc-400 text-xs max-w-sm">
                  Paste a Google Sheet published CSV URL above or upload a CSV file to generate 7-day demand forecasts.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="mt-4">
                <ClickSpark sparkColor="#e4e4e7" sparkCount={10}>
                  <ShinyButton
                    onClick={() => handleSync({ url: '', file: null })}
                    className="py-2.5 px-5 rounded-xl text-xs font-bold"
                  >
                    <Play className="w-3.5 h-3.5 mr-2" />
                    Load Sample Sales Data
                  </ShinyButton>
                </ClickSpark>
              </EmptyContent>
            </Empty>
          </div>
        ) : (
          /* Live Merchant Dashboard */
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Tab Header Bar */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-2.5">
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Overview
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('inventory')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'inventory'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Boxes className="w-3.5 h-3.5" />
                  Products & Stock ({inventoryRows.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('models')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'models'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  Forecast Models
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Synced</span>
              </div>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* Elevated Stock Alert Card */}
                <StockAlertBanner stockWarnings={data.stock_warnings} />

                {/* Flatter Tighter KPI Status Strip */}
                <KpiCards kpis={data.kpis} />

                {/* Mid-weight Chart & Model Leaderboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <DemandChart forecasts={data.forecasts} />
                  <ModelLeaderboard leaderboard={data.leaderboard} />
                </div>
              </div>
            )}

            {/* TAB 2: INVENTORY TABLE */}
            {activeTab === 'inventory' && (
              <div className="bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/60 shadow-none rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Product Inventory & Forecasts
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Current stock status, daily demand rates, and supplier reorder options.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-60">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
                    <Input
                      type="text"
                      placeholder="Filter product..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs rounded-lg h-8"
                    />
                  </div>
                </div>

                <div className="border border-zinc-200 dark:border-zinc-800/60 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-900/40">
                        <TableHead className="font-bold text-xs uppercase text-zinc-500 dark:text-zinc-400">Product</TableHead>
                        <TableHead className="font-bold text-xs uppercase text-zinc-500 dark:text-zinc-400 text-right">Daily Rate</TableHead>
                        <TableHead className="font-bold text-xs uppercase text-zinc-500 dark:text-zinc-400 text-right">7-Day Demand</TableHead>
                        <TableHead className="font-bold text-xs uppercase text-zinc-500 dark:text-zinc-400 text-center">Stock Status</TableHead>
                        <TableHead className="font-bold text-xs uppercase text-zinc-500 dark:text-zinc-400 text-right">Reorder</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory.map((item) => {
                        const itemCritical = item.days_left <= 3;
                        return (
                          <TableRow key={item.product} className="border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                            <TableCell className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{item.product}</TableCell>
                            <TableCell className="text-right font-mono text-xs text-zinc-600 dark:text-zinc-400">{item.daily_avg} units/day</TableCell>
                            <TableCell className="text-right font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.total_predicted} units</TableCell>
                            <TableCell className="text-center">
                              {item.stockout_risk ? (
                                <Badge
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                    itemCritical
                                      ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800'
                                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                                  }`}
                                >
                                  {item.days_left} {item.days_left === 1 ? 'day' : 'days'} left
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-[10px]">
                                  Sufficient Stock
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleWhatsAppReorder(item)}
                                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white text-[11px] font-semibold rounded-lg h-7 px-2.5"
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                WhatsApp (+{item.reorder_qty})
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* TAB 3: MODEL DIAGNOSTICS */}
            {activeTab === 'models' && (
              <div className="space-y-5">
                <ModelLeaderboard leaderboard={data.leaderboard} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Chat Assistant */}
      <ChatWidget
        syncContext={data}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Settings Modal */}
      <ApiKeyModal
        open={isApiKeyModalOpen}
        onOpenChange={setIsApiKeyModalOpen}
      />
    </div>
  );
}
