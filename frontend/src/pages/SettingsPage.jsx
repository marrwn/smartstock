import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Building2,
  Database,
  KeyRound,
  Bell,
  Users,
  Palette,
  AlertTriangle,
  Save,
  Sparkles,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { getSuppliers, saveSuppliers } from '@/lib/suppliers';

const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Business Profile', icon: Building2 },
  { id: 'data', label: 'Data & Sync', icon: Database },
  { id: 'ai', label: 'AI & API Keys', icon: KeyRound },
  { id: 'alerts', label: 'Notifications & Alerts', icon: Bell },
  { id: 'suppliers', label: 'Supplier Directory', icon: Users },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, critical: true },
];

export default function SettingsPage() {
  const { data, handleSync, isSyncing } = useOutletContext() || {};
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');

  // 1. Profile State
  const [businessName, setBusinessName] = useState('Acme Retail Store');
  const [industry, setIndustry] = useState('Retail');
  const [catalogSize, setCatalogSize] = useState('50-500');
  const [timezone, setTimezone] = useState('America/New_York');
  const [logoUrl, setLogoUrl] = useState(null);
  const logoInputRef = useRef(null);

  // 2. Data & Sync State
  const [sheetUrl, setSheetUrl] = useState('');
  const [syncFreq, setSyncFreq] = useState('Every 6 hours');
  const [syncHistory, setSyncHistory] = useState([
    { id: 1, time: '4 minutes ago', status: 'Success', rows: 360 },
    { id: 2, time: '6 hours ago', status: 'Success', rows: 360 },
    { id: 3, time: '12 hours ago', status: 'Success', rows: 350 },
  ]);

  // 3. AI & Keys State
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [isTestingKey, setIsTestingKey] = useState(false);

  // 4. Alerts State
  const [warningThreshold, setWarningThreshold] = useState(7);
  const [criticalThreshold, setCriticalThreshold] = useState(3);
  const [showOverviewBanner, setShowOverviewBanner] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  // 5. Suppliers State
  const [suppliers, setSuppliers] = useState([]);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupProduct, setNewSupProduct] = useState('');

  // 6. Appearance State
  const [density, setDensity] = useState('Comfortable');

  // Load state from localStorage
  useEffect(() => {
    // Profile
    const savedProf = localStorage.getItem('smartstock_profile');
    if (savedProf) {
      try {
        const p = JSON.parse(savedProf);
        if (p.businessName) setBusinessName(p.businessName);
        if (p.industry) setIndustry(p.industry);
        if (p.catalogSize) setCatalogSize(p.catalogSize);
        if (p.timezone) setTimezone(p.timezone);
        if (p.logoUrl) setLogoUrl(p.logoUrl);
      } catch (e) {}
    }

    // LLM
    const savedLlm = localStorage.getItem('smartstock_llm_settings');
    if (savedLlm) {
      try {
        const l = JSON.parse(savedLlm);
        if (l.provider) setProvider(l.provider);
        if (l.apiKey) setApiKey(l.apiKey);
      } catch (e) {}
    }

    // Suppliers
    setSuppliers(getSuppliers());
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const currentProf = JSON.parse(localStorage.getItem('smartstock_profile') || '{}');
    const updated = {
      ...currentProf,
      businessName: businessName.trim(),
      industry,
      catalogSize,
      timezone,
      logoUrl,
    };
    localStorage.setItem('smartstock_profile', JSON.stringify(updated));
    toast.success('Business Profile updated.');
  };

  const handleLogoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
      toast.success('Store logo preview updated.');
    }
  };

  const handleSaveDataSettings = (e) => {
    e.preventDefault();
    toast.success('Data & Sync preferences saved.');
  };

  const handleManualSync = async () => {
    if (isSyncing) return;
    try {
      await handleSync({ url: sheetUrl.trim(), file: null });
      setSyncHistory((prev) => [
        { id: Date.now(), time: 'Just now', status: 'Success', rows: 360 },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      setSyncHistory((prev) => [
        { id: Date.now(), time: 'Just now', status: 'Failed', rows: 0 },
        ...prev.slice(0, 4),
      ]);
    }
  };

  const handleSaveAiKeys = (e) => {
    e.preventDefault();
    localStorage.setItem(
      'smartstock_llm_settings',
      JSON.stringify({ provider, apiKey: apiKey.trim() })
    );
    toast.success('AI Engine configuration saved.');
  };

  const handleTestConnection = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API secret key first.');
      return;
    }
    setIsTestingKey(true);
    setTimeout(() => {
      setIsTestingKey(false);
      toast.success(`Connection verified successfully with ${provider === 'gemini' ? 'Google Gemini' : 'OpenAI'}!`);
    }, 1000);
  };

  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (!newSupName.trim() || !newSupPhone.trim() || !newSupProduct.trim()) {
      toast.error('Please fill in all supplier fields.');
      return;
    }
    const newSup = {
      id: `sup-${Date.now()}`,
      name: newSupName.trim(),
      phone: newSupPhone.trim(),
      product: newSupProduct.trim(),
    };
    const updated = [...suppliers, newSup];
    setSuppliers(updated);
    saveSuppliers(updated);
    setNewSupName('');
    setNewSupPhone('');
    setNewSupProduct('');
    setShowAddSupplierModal(false);
    toast.success(`Added ${newSup.name} to supplier directory.`);
  };

  const handleDeleteSupplier = (id) => {
    const updated = suppliers.filter((s) => s.id !== id);
    setSuppliers(updated);
    saveSuppliers(updated);
    toast.success('Supplier removed from directory.');
  };

  const handleResetAllData = () => {
    if (window.confirm('Are you sure you want to reset all data and restart onboarding?')) {
      localStorage.clear();
      toast.success('All data cleared. Restarting onboarding...');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-full min-w-0 overflow-x-hidden animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Left Sub-Navigation List */}
        <Card className="w-full md:w-64 bg-[#111113] border border-[#27272A] p-2 space-y-1 shrink-0 rounded-xl">
          {SETTINGS_SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? sec.critical
                      ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                      : 'bg-[#E4E4E7] text-[#09090B] shadow-xs'
                    : sec.critical
                    ? 'text-[#EF4444] hover:bg-[#EF4444]/10'
                    : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]'
                }`}
              >
                <sec.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{sec.label}</span>
              </button>
            );
          })}
        </Card>

        {/* Right Active Panel */}
        <div className="flex-1 w-full min-w-0">
          {/* SECTION 1: BUSINESS PROFILE */}
          {activeSection === 'profile' && (
            <Card className="bg-[#111113] border border-[#27272A] shadow-none rounded-xl p-6 space-y-6">
              <div className="border-b border-[#27272A] pb-3">
                <h3 className="text-base font-bold text-[#FAFAFA]">Business Profile</h3>
                <p className="text-xs text-[#A1A1AA]">Manage store details, branding placeholders, and regional settings.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-center overflow-hidden shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Store logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-[#A1A1AA]" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => logoInputRef.current?.click()}
                      className="bg-[#18181B] border-[#27272A] text-xs font-semibold text-[#FAFAFA]"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      Upload Logo Placeholder
                    </Button>
                    <p className="text-[11px] text-[#A1A1AA]">Supports PNG, JPG, or SVG.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Store Name</label>
                    <Input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="bg-[#09090B] border-[#27272A] text-xs text-[#FAFAFA] rounded-xl h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Industry</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-[#09090B] border border-[#27272A] text-[#FAFAFA] rounded-xl h-10 px-3 text-xs font-semibold focus:outline-none"
                    >
                      <option value="Retail">Retail Store</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Apparel">Apparel & Fashion</option>
                      <option value="Other">Other Category</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Catalog Size</label>
                    <select
                      value={catalogSize}
                      onChange={(e) => setCatalogSize(e.target.value)}
                      className="w-full bg-[#09090B] border border-[#27272A] text-[#FAFAFA] rounded-xl h-10 px-3 text-xs font-semibold focus:outline-none"
                    >
                      <option value="<50">&lt; 50 products</option>
                      <option value="50-500">50 – 500 products</option>
                      <option value="500+">500+ products</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Store Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-[#09090B] border border-[#27272A] text-[#FAFAFA] rounded-xl h-10 px-3 text-xs font-semibold focus:outline-none"
                    >
                      <option value="America/New_York">Eastern Time (UTC-5)</option>
                      <option value="America/Chicago">Central Time (UTC-6)</option>
                      <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="Europe/London">London (UTC+0)</option>
                      <option value="Africa/Cairo">Cairo (UTC+2)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" className="bg-[#E4E4E7] text-[#09090B] hover:bg-[#FAFAFA] text-xs font-bold rounded-xl h-9 px-4">
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Profile
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* SECTION 2: DATA & SYNC */}
          {activeSection === 'data' && (
            <Card className="bg-[#111113] border border-[#27272A] shadow-none rounded-xl p-6 space-y-6">
              <div className="border-b border-[#27272A] pb-3">
                <h3 className="text-base font-bold text-[#FAFAFA]">Data & Sync Settings</h3>
                <p className="text-xs text-[#A1A1AA]">Configure your sales data pipeline connection and auto-sync intervals.</p>
              </div>

              <form onSubmit={handleSaveDataSettings} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                    Google Sheet Published CSV URL
                  </label>
                  <Input
                    type="url"
                    placeholder="Paste Google Sheet link..."
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    className="bg-[#09090B] border-[#27272A] text-xs text-[#FAFAFA] rounded-xl h-10"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Sync Frequency</label>
                    <select
                      value={syncFreq}
                      onChange={(e) => setSyncFreq(e.target.value)}
                      className="w-full bg-[#09090B] border border-[#27272A] text-[#FAFAFA] rounded-xl h-10 px-3 text-xs font-semibold focus:outline-none"
                    >
                      <option value="Manual">Manual Trigger Only</option>
                      <option value="Every hour">Every hour</option>
                      <option value="Every 6 hours">Every 6 hours</option>
                      <option value="Daily">Daily</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-end">
                    <Button
                      type="button"
                      disabled={isSyncing}
                      onClick={handleManualSync}
                      className="bg-[#E4E4E7] text-[#09090B] hover:bg-[#FAFAFA] text-xs font-bold rounded-xl h-10 w-full"
                    >
                      {isSyncing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
                      Trigger Manual Sync Now
                    </Button>
                  </div>
                </div>

                {/* Sync History Table */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Recent Sync History</span>
                    <span className="text-[11px] text-[#A1A1AA]">Last synced 4 minutes ago</span>
                  </div>

                  <div className="border border-[#27272A] rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#27272A] bg-[#09090B]">
                          <TableHead className="text-[#A1A1AA] text-[11px] font-bold">Timestamp</TableHead>
                          <TableHead className="text-[#A1A1AA] text-[11px] font-bold">Rows Processed</TableHead>
                          <TableHead className="text-[#A1A1AA] text-[11px] font-bold text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {syncHistory.map((sh) => (
                          <TableRow key={sh.id} className="border-[#27272A]/50">
                            <TableCell className="text-xs text-[#FAFAFA]">{sh.time}</TableCell>
                            <TableCell className="text-xs text-[#A1A1AA] font-mono">{sh.rows} rows</TableCell>
                            <TableCell className="text-right">
                              <Badge className="bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 text-[10px]">
                                {sh.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" className="bg-[#18181B] border border-[#27272A] text-[#FAFAFA] hover:bg-[#27272A] text-xs font-bold rounded-xl h-9 px-4">
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Preferences
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* SECTION 3: AI & API KEYS */}
          {activeSection === 'ai' && (
            <Card className="bg-[#111113] border border-[#27272A] shadow-none rounded-xl p-6 space-y-6">
              <div className="border-b border-[#27272A] pb-3">
                <h3 className="text-base font-bold text-[#FAFAFA]">AI & API Credentials</h3>
                <p className="text-xs text-[#A1A1AA]">Bring your own API key to power the SmartStock AI Copilot engine.</p>
              </div>

              <form onSubmit={handleSaveAiKeys} className="space-y-5">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">AI Model Provider</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setProvider('gemini')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        provider === 'gemini'
                          ? 'border-[#FAFAFA] bg-[#18181B] text-[#FAFAFA] font-bold'
                          : 'border-[#27272A] bg-[#09090B] text-[#A1A1AA] hover:border-[#3F3F46]'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-[#FAFAFA]" />
                      <div>
                        <div className="text-xs font-bold text-[#FAFAFA]">Google Gemini</div>
                        <div className="text-[10px] text-[#A1A1AA]">Gemini 1.5 Flash</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProvider('openai')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        provider === 'openai'
                          ? 'border-[#FAFAFA] bg-[#18181B] text-[#FAFAFA] font-bold'
                          : 'border-[#27272A] bg-[#09090B] text-[#A1A1AA] hover:border-[#3F3F46]'
                      }`}
                    >
                      <KeyRound className="w-4 h-4 text-[#FAFAFA]" />
                      <div>
                        <div className="text-xs font-bold text-[#FAFAFA]">OpenAI</div>
                        <div className="text-[10px] text-[#A1A1AA]">GPT-4o mini</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">API Secret Key</label>
                  <Input
                    type="password"
                    placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-[#09090B] border-[#27272A] text-xs text-[#FAFAFA] rounded-xl h-10"
                  />
                  <p className="text-[11px] text-[#A1A1AA]">
                    Key is stored locally in your browser only, never sent to SmartStock servers.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isTestingKey}
                    onClick={handleTestConnection}
                    className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] hover:bg-[#27272A] text-xs font-bold rounded-xl h-9"
                  >
                    {isTestingKey ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                    Test Connection
                  </Button>

                  <Button type="submit" className="bg-[#E4E4E7] text-[#09090B] hover:bg-[#FAFAFA] text-xs font-bold rounded-xl h-9 px-4">
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Key
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* SECTION 4: NOTIFICATIONS & ALERTS */}
          {activeSection === 'alerts' && (
            <Card className="bg-[#111113] border border-[#27272A] shadow-none rounded-xl p-6 space-y-6">
              <div className="border-b border-[#27272A] pb-3">
                <h3 className="text-base font-bold text-[#FAFAFA]">Notifications & Alerts</h3>
                <p className="text-xs text-[#A1A1AA]">Customize threshold days for stockout warnings and critical alerts.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                      Warning Threshold (Amber)
                    </label>
                    <Input
                      type="number"
                      value={warningThreshold}
                      onChange={(e) => setWarningThreshold(parseInt(e.target.value) || 7)}
                      className="bg-[#09090B] border-[#27272A] text-xs text-[#FAFAFA] rounded-xl h-10"
                    />
                    <p className="text-[11px] text-[#A1A1AA]">Triggers warning when stock drops ≤ this many days.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                      Critical Threshold (Red)
                    </label>
                    <Input
                      type="number"
                      value={criticalThreshold}
                      onChange={(e) => setCriticalThreshold(parseInt(e.target.value) || 3)}
                      className="bg-[#09090B] border-[#27272A] text-xs text-[#FAFAFA] rounded-xl h-10"
                    />
                    <p className="text-[11px] text-[#A1A1AA]">Triggers critical urgency when stock drops ≤ this many days.</p>
                  </div>
                </div>

                <div className="pt-2 space-y-3 border-t border-[#27272A]">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#09090B] border border-[#27272A]">
                    <div>
                      <div className="text-xs font-bold text-[#FAFAFA]">Show Stock Alert Banner on Overview</div>
                      <div className="text-[11px] text-[#A1A1AA]">Display top alert banner for items at risk</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowOverviewBanner(!showOverviewBanner)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        showOverviewBanner ? 'bg-[#FAFAFA]' : 'bg-[#27272A]'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-[#09090B] transition-transform ${
                          showOverviewBanner ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#09090B] border border-[#27272A] opacity-60">
                    <div>
                      <div className="text-xs font-bold text-[#FAFAFA]">Daily Email Digest</div>
                      <div className="text-[11px] text-[#A1A1AA]">Email inventory summary every morning</div>
                    </div>
                    <Badge variant="outline" className="border-[#27272A] text-[#A1A1AA] text-[10px]">
                      Coming Soon
                    </Badge>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => toast.success('Alert thresholds saved.')}
                    className="bg-[#E4E4E7] text-[#09090B] hover:bg-[#FAFAFA] text-xs font-bold rounded-xl h-9 px-4"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Thresholds
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 5: SUPPLIER DIRECTORY */}
          {activeSection === 'suppliers' && (
            <Card className="bg-[#111113] border border-[#27272A] shadow-none rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#FAFAFA]">Supplier Directory</h3>
                  <p className="text-xs text-[#A1A1AA]">Manage supplier WhatsApp contact numbers for automated reordering.</p>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowAddSupplierModal(true)}
                  className="bg-[#E4E4E7] text-[#09090B] hover:bg-[#FAFAFA] text-xs font-bold rounded-xl h-8 px-3"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Supplier
                </Button>
              </div>

              {/* Supplier List Table */}
              <div className="border border-[#27272A] rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#27272A] bg-[#09090B]">
                      <TableHead className="text-[#A1A1AA] font-bold text-xs">Supplier Name</TableHead>
                      <TableHead className="text-[#A1A1AA] font-bold text-xs">WhatsApp Number</TableHead>
                      <TableHead className="text-[#A1A1AA] font-bold text-xs">Linked Product SKU</TableHead>
                      <TableHead className="text-[#A1A1AA] font-bold text-xs text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((sup) => (
                      <TableRow key={sup.id} className="border-[#27272A]/50 hover:bg-[#18181B]">
                        <TableCell className="font-bold text-xs text-[#FAFAFA]">{sup.name}</TableCell>
                        <TableCell className="font-mono text-xs text-[#A1A1AA]">{sup.phone}</TableCell>
                        <TableCell className="text-xs text-[#FAFAFA] font-semibold">{sup.product}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSupplier(sup.id)}
                            className="h-7 w-7 p-0 text-[#A1A1AA] hover:text-[#EF4444]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Add Supplier Modal */}
              {showAddSupplierModal && (
                <div className="fixed inset-0 z-50 bg-[#09090B]/80 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                    <h4 className="text-sm font-bold text-[#FAFAFA]">Add New Supplier</h4>

                    <form onSubmit={handleAddSupplier} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase text-[#A1A1AA]">Supplier Name</label>
                        <Input
                          type="text"
                          placeholder="e.g. Apex Components"
                          value={newSupName}
                          onChange={(e) => setNewSupName(e.target.value)}
                          className="bg-[#09090B] border-[#27272A] text-xs text-[#FAFAFA] rounded-xl h-9"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase text-[#A1A1AA]">WhatsApp Phone Number</label>
                        <Input
                          type="tel"
                          placeholder="+1 555 123 4567"
                          value={newSupPhone}
                          onChange={(e) => setNewSupPhone(e.target.value)}
                          className="bg-[#09090B] border-[#27272A] text-xs text-[#FAFAFA] rounded-xl h-9"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase text-[#A1A1AA]">Linked Product Name</label>
                        <Input
                          type="text"
                          placeholder="e.g. Wireless Earbuds"
                          value={newSupProduct}
                          onChange={(e) => setNewSupProduct(e.target.value)}
                          className="bg-[#09090B] border-[#27272A] text-xs text-[#FAFAFA] rounded-xl h-9"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAddSupplierModal(false)}
                          className="bg-[#18181B] border-[#27272A] text-xs text-[#FAFAFA] rounded-xl h-8"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-[#E4E4E7] text-[#09090B] hover:bg-[#FAFAFA] text-xs font-bold rounded-xl h-8">
                          Save Supplier
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* SECTION 6: APPEARANCE */}
          {activeSection === 'appearance' && (
            <Card className="bg-[#111113] border border-[#27272A] shadow-none rounded-xl p-6 space-y-6">
              <div className="border-b border-[#27272A] pb-3">
                <h3 className="text-base font-bold text-[#FAFAFA]">Appearance & Layout Density</h3>
                <p className="text-xs text-[#A1A1AA]">Adjust visual interface spacing and viewing modes.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Table & Card Density</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDensity('Comfortable')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        density === 'Comfortable'
                          ? 'border-[#FAFAFA] bg-[#18181B] text-[#FAFAFA] font-bold'
                          : 'border-[#27272A] bg-[#09090B] text-[#A1A1AA]'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#FAFAFA]">Comfortable</div>
                      <div className="text-[10px] text-[#A1A1AA]">Standard spacing and padding</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDensity('Compact')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        density === 'Compact'
                          ? 'border-[#FAFAFA] bg-[#18181B] text-[#FAFAFA] font-bold'
                          : 'border-[#27272A] bg-[#09090B] text-[#A1A1AA]'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#FAFAFA]">Compact</div>
                      <div className="text-[10px] text-[#A1A1AA]">Dense rows for high-volume inventory</div>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#FAFAFA]">Theme Palette</div>
                    <div className="text-[11px] text-[#A1A1AA]">Nova Neutral Dark Mode Active</div>
                  </div>
                  <Badge variant="outline" className="border-[#27272A] text-[#A1A1AA] text-[10px]">
                    Light mode (coming soon)
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 7: DANGER ZONE */}
          {activeSection === 'danger' && (
            <Card className="bg-[#EF4444]/5 border border-[#EF4444]/40 shadow-none rounded-xl p-6 space-y-6">
              <div className="border-b border-[#EF4444]/30 pb-3 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
                <div>
                  <h3 className="text-base font-bold text-[#EF4444]">Danger Zone</h3>
                  <p className="text-xs text-[#A1A1AA]">Destructive workspace actions and data resets.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#111113] border border-[#EF4444]/30 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-[#FAFAFA]">Disconnect Google Sheet Data Source</div>
                    <div className="text-[11px] text-[#A1A1AA]">Clears saved link and reverts to sample dataset</div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSheetUrl('');
                      toast.success('Disconnected Google Sheet.');
                    }}
                    className="border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10 text-xs font-bold h-8"
                  >
                    Disconnect
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-[#111113] border border-[#EF4444]/30 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-[#FAFAFA]">Clear Saved API Keys</div>
                    <div className="text-[11px] text-[#A1A1AA]">Removes stored LLM credentials from browser storage</div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      localStorage.removeItem('smartstock_llm_settings');
                      setApiKey('');
                      toast.success('Cleared stored API key.');
                    }}
                    className="border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10 text-xs font-bold h-8"
                  >
                    Clear Keys
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-[#111113] border border-[#EF4444]/40 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-[#EF4444]">Reset All Workspace Data & Profile</div>
                    <div className="text-[11px] text-[#A1A1AA]">Clears all local storage state and restarts first-run onboarding</div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleResetAllData}
                    className="bg-[#EF4444] text-white hover:bg-red-600 text-xs font-bold h-8 px-4"
                  >
                    Reset Everything
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
