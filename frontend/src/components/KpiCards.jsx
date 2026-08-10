import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import CountUp from '@/components/reactbits/CountUp';

export default function KpiCards({ kpis }) {
  const { revenue = 0, orders = 0, forecast_next_7d = 0 } = kpis || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* 1. Total Revenue */}
      <Card className="bg-[#111113] border border-[#27272A] shadow-none rounded-xl overflow-hidden">
        <CardContent className="p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
            Total Revenue
          </p>
          <div className="flex items-baseline gap-0.5 text-2xl sm:text-3xl font-extrabold text-[#FAFAFA] tracking-tight">
            <span>$</span>
            <CountUp
              from={0}
              to={revenue}
              duration={1.5}
              separator=","
              className="text-[#FAFAFA]"
            />
          </div>
          <p className="text-[11px] text-[#22C55E] font-medium pt-0.5">
            +14.2% vs previous period
          </p>
        </CardContent>
      </Card>

      {/* 2. Total Orders */}
      <Card className="bg-[#111113] border border-[#27272A] shadow-none rounded-xl overflow-hidden">
        <CardContent className="p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
            Total Orders
          </p>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#FAFAFA] tracking-tight">
            <CountUp
              from={0}
              to={orders}
              duration={1.2}
              separator=","
              className="text-[#FAFAFA]"
            />
          </div>
          <p className="text-[11px] text-[#A1A1AA] font-medium pt-0.5">
            Past 90 days total
          </p>
        </CardContent>
      </Card>

      {/* 3. 7-Day Forecast */}
      <Card className="bg-[#111114] border border-[#27272A] shadow-none rounded-xl overflow-hidden">
        <CardContent className="p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
            7-Day Forecast
          </p>
          <div className="flex items-baseline gap-1 text-2xl sm:text-3xl font-extrabold text-[#FAFAFA] tracking-tight">
            <CountUp
              from={0}
              to={forecast_next_7d}
              duration={1.5}
              separator=","
              className="text-[#FAFAFA]"
            />
            <span className="text-xs font-normal text-[#A1A1AA]">units</span>
          </div>
          <p className="text-[11px] text-[#A1A1AA] font-medium pt-0.5">
            Predicted demand, next 7 days
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
