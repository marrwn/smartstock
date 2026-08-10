import React from 'react';
import ModelLeaderboard from '@/components/ModelLeaderboard';
import { Card } from '@/components/ui/card';
import { Cpu } from 'lucide-react';

export default function ModelsPage({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-5 w-full max-w-full min-w-0 overflow-x-hidden animate-in fade-in duration-300">
      {/* Full Leaderboard Table Container */}
      <div className="w-full max-w-full overflow-x-auto">
        <ModelLeaderboard leaderboard={data.leaderboard} />
      </div>

      {/* Model Technical Diagnostics Card with Responsive Grid */}
      <Card className="bg-[#111113] border border-[#27272A] shadow-none rounded-xl p-5 space-y-4 w-full">
        <div className="flex items-center gap-2 border-b border-[#27272A] pb-3">
          <Cpu className="w-4 h-4 text-[#A1A1AA]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#FAFAFA]">
            Model Evaluation Diagnostics
          </h3>
        </div>

        {/* Responsive Wrap Grid for 3 Diagnostic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          <div className="p-3.5 rounded-lg bg-[#09090B] border border-[#27272A] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
              Evaluated Features
            </span>
            <p className="text-xs font-semibold text-[#FAFAFA]">
              Price, Day of Week, Weekend Flag, US Holiday Flag
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#09090B] border border-[#27272A] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
              Validation Strategy
            </span>
            <p className="text-xs font-semibold text-[#FAFAFA]">
              20% Out-of-Sample Holdout Split
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#09090B] border border-[#27272A] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
              Selection Criterion
            </span>
            <p className="text-xs font-semibold text-[#FAFAFA]">
              Lowest Mean Absolute Error (MAE)
            </p>
          </div>
        </div>

        <div className="text-xs text-[#A1A1AA] leading-relaxed pt-1">
          <p>
            Models are trained independently on each product line using historical daily sales. Whichever algorithm achieves lower error on validation data is automatically chosen to generate that product's 7-day demand predictions.
          </p>
        </div>
      </Card>
    </div>
  );
}
