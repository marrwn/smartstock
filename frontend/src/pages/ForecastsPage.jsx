import React from 'react';
import DemandChart from '@/components/DemandChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Package } from 'lucide-react';

export default function ForecastsPage({ data }) {
  if (!data || !data.forecasts) return null;

  // Group forecasts by product
  const forecastsByProduct = {};
  data.forecasts.forEach((f) => {
    if (!forecastsByProduct[f.product]) forecastsByProduct[f.product] = [];
    forecastsByProduct[f.product].push(f);
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Primary Full Demand Chart */}
      <DemandChart forecasts={data.forecasts} />

      {/* Per-Product Forecast Breakdown Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Daily Forecast Breakdown by Product
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(forecastsByProduct).map((prod) => {
            const items = forecastsByProduct[prod];
            const totalQty = items.reduce((acc, c) => acc + c.predicted_qty, 0);

            return (
              <Card
                key={prod}
                className="bg-[#111114] dark:bg-[#111114] bg-white border border-zinc-200 dark:border-zinc-800/60 shadow-none rounded-xl overflow-hidden"
              >
                <CardHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800/60 flex flex-row items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-teal-500" />
                    <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {prod}
                    </CardTitle>
                  </div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700">
                    7-Day Total: {totalQty} units
                  </span>
                </CardHeader>

                <CardContent className="p-4 pt-3 space-y-2">
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {items.map((item, idx) => {
                      const dayLabel = new Date(item.day).toLocaleDateString('en-US', { weekday: 'narrow' });
                      return (
                        <div
                          key={idx}
                          className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/40 flex flex-col items-center gap-1"
                        >
                          <span className="text-[10px] font-bold text-zinc-400 uppercase">
                            {dayLabel}
                          </span>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {item.predicted_qty}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
