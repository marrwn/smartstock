import React, { useState, useRef } from 'react';
import GradientWaves from '@/components/reactbits/GradientWaves';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Box, ArrowRight, Check, Link2, Upload, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingFlow({ onComplete, onSync }) {
  const [step, setStep] = useState(1); // 1: Welcome, 2: Business, 3: Connect, 4: Done
  const [businessName, setBusinessName] = useState('Acme Retail Store');
  const [industry, setIndustry] = useState('Retail');
  const [catalogSize, setCatalogSize] = useState('50-500');
  const [logoUrl, setLogoUrl] = useState(null);
  const [sheetUrl, setSheetUrl] = useState('');
  const logoInputRef = useRef(null);

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
      toast.success('Business logo loaded!');
    }
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    if (!businessName.trim()) {
      toast.error('Please enter your business name.');
      return;
    }
    setStep(3);
  };

  const handleFinishOnboarding = (useSample = false) => {
    const profile = {
      businessName: businessName.trim() || 'Acme Retail Store',
      industry,
      catalogSize,
      logoUrl,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('smartstock_profile', JSON.stringify(profile));

    if (!useSample && sheetUrl.trim()) {
      onSync({ url: sheetUrl.trim(), file: null });
    }

    setStep(4);
    setTimeout(() => {
      onComplete(profile);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#09090B] text-[#FAFAFA] flex items-center justify-center overflow-hidden font-sans">
      {/* Ambient Greyscale Gradient Waves Background */}
      <div className="absolute inset-0 pointer-events-none opacity-80 z-0">
        <GradientWaves
          horizonColor="#121215"
          waveColor="#27272A"
          crestColor="#A1A1AA"
          speed={0.4}
          amplitude={3.0}
          waveScale={0.8}
          swell={35}
          turbulence={25}
          brightness={1.2}
          opacity={1.0}
        />
      </div>

      {/* Onboarding Card Shell */}
      <div className="relative z-10 w-full max-w-lg mx-4 p-8 bg-[#111113]/90 border border-[#27272A] rounded-2xl shadow-2xl backdrop-blur-xl">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === s
                  ? 'w-8 bg-[#E4E4E7]'
                  : step > s
                  ? 'w-4 bg-[#27272A]'
                  : 'w-4 bg-[#18181B]'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#FAFAFA] text-[#09090B] flex items-center justify-center shadow-lg font-bold">
              <Box className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#FAFAFA]">
                Welcome to SmartStock
              </h1>
              <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-sm mx-auto">
                Real-time automated inventory demand forecasting, stockout risk detection, and instant supplier ordering for your business.
              </p>
            </div>

            <div className="pt-4">
              <Button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-[#E4E4E7] text-[#09090B] hover:bg-[#FAFAFA] font-bold text-sm h-11 rounded-xl shadow-sm"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: BUSINESS BASICS */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-5 animate-in fade-in duration-300">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#FAFAFA]">Tell us about your business</h2>
              <p className="text-xs text-[#A1A1AA]">Customize SmartStock for your product catalog.</p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Business Logo / Photo Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                  Business Logo / Photo (Optional)
                </label>
                <div className="flex items-center gap-3.5 pt-1">
                  <div className="w-14 h-14 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-center overflow-hidden shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Business logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-[#A1A1AA]" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                    className="bg-[#09090B] border-[#27272A] text-xs font-semibold text-[#FAFAFA] hover:bg-[#18181B] rounded-xl h-10 px-3.5"
                  >
                    <Upload className="w-3.5 h-3.5 mr-2" />
                    {logoUrl ? 'Change Logo' : 'Upload Business Photo'}
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                  Business / Store Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Acme Retail Store"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="bg-[#09090B] border-[#27272A] text-[#FAFAFA] placeholder:text-[#52525B] focus-visible:ring-[#E4E4E7] rounded-xl h-10 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                    Industry / Category
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-[#09090B] border border-[#27272A] text-[#FAFAFA] rounded-xl h-10 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E4E4E7]"
                  >
                    <option value="Retail">Retail Store</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Apparel">Apparel & Fashion</option>
                    <option value="Other">Other Category</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                    Catalog Size
                  </label>
                  <select
                    value={catalogSize}
                    onChange={(e) => setCatalogSize(e.target.value)}
                    className="w-full bg-[#09090B] border border-[#27272A] text-[#FAFAFA] rounded-xl h-10 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E4E4E7]"
                  >
                    <option value="<50">&lt; 50 products</option>
                    <option value="50-500">50 – 500 products</option>
                    <option value="500+">500+ products</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                className="w-full bg-[#E4E4E7] text-[#09090B] hover:bg-[#FAFAFA] font-bold text-sm h-11 rounded-xl shadow-sm"
              >
                Next: Connect Data
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: CONNECT DATA */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#FAFAFA]">Connect your sales data</h2>
              <p className="text-xs text-[#A1A1AA]">Provide a published Google Sheet link to enable 7-day demand forecasting.</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  Google Sheet Published CSV Link
                </label>
                <Input
                  type="url"
                  placeholder="Paste your Google Sheet link..."
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className="bg-[#09090B] border-[#27272A] text-[#FAFAFA] placeholder:text-[#52525B] focus-visible:ring-[#E4E4E7] rounded-xl h-10 text-sm font-medium"
                />
              </div>
            </div>

            <div className="pt-3 space-y-2">
              <Button
                type="button"
                onClick={() => handleFinishOnboarding(false)}
                className="w-full bg-[#E4E4E7] text-[#09090B] hover:bg-[#FAFAFA] font-bold text-sm h-11 rounded-xl shadow-sm"
              >
                Connect & Launch
                <Check className="w-4 h-4 ml-2" />
              </Button>

              <button
                type="button"
                onClick={() => handleFinishOnboarding(true)}
                className="w-full text-center text-xs font-semibold text-[#A1A1AA] hover:text-[#FAFAFA] py-2 transition-colors"
              >
                Skip for now, use sample sales data →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DONE */}
        {step === 4 && (
          <div className="space-y-6 text-center py-6 animate-in fade-in duration-300">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center">
              <Check className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[#FAFAFA]">
                You're all set, {businessName}!
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                Loading your SmartStock workspace...
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
