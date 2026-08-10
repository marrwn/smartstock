import React from 'react';
import KpiCards from '@/components/KpiCards';
import StockAlertBanner from '@/components/StockAlertBanner';
import DemandChart from '@/components/DemandChart';
import ModelLeaderboard from '@/components/ModelLeaderboard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OverviewPage({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-5 w-full max-w-full min-w-0 overflow-x-hidden animate-in fade-in duration-300">
      {/* Elevated Stock Alert Banner */}
      <StockAlertBanner stockWarnings={data.stock_warnings} />

      {/* Flatter KPI Status Strip */}
      <KpiCards kpis={data.kpis} />

      {/* Demand Chart & Model Accuracy Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
        <DemandChart forecasts={data.forecasts} />
        
        <div className="space-y-3 flex flex-col justify-between w-full">
          <ModelLeaderboard leaderboard={data.leaderboard} />
          <div className="flex justify-end pt-1">
            <Button
              variant="outline"
              size="sm"
              render={<Link to="/models" />}
              className="bg-[#111113] border-[#27272A] text-xs font-semibold rounded-lg text-[#FAFAFA] hover:bg-[#18181B]"
            >
              View Full Model Accuracy Report
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
