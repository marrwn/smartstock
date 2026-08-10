import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

const CHART_BAR_COLORS = ['#0d9488', '#14b8a6', '#2DD4BF', '#5EEAD4', '#99F6E4'];

export default function DemandChart({ forecasts = [] }) {
  if (!forecasts || forecasts.length === 0) return null;

  // Aggregate 7-day forecast total by product
  const productTotals = forecasts.reduce((acc, curr) => {
    const p = curr.product;
    acc[p] = (acc[p] || 0) + curr.predicted_qty;
    return acc;
  }, {});

  const chartData = Object.keys(productTotals).map((prod) => ({
    product: prod,
    quantity: productTotals[prod],
  }));

  return (
    <Card className="bg-[#111114] dark:bg-[#111114] bg-white border border-zinc-200 dark:border-zinc-800/60 shadow-none rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-200 dark:border-zinc-800/60">
        <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Predicted 7-Day Demand by Product
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
          Expected unit sales for the upcoming week based on historical sales trends.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5 pb-3">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.4} />
              <XAxis
                dataKey="product"
                stroke="#71717a"
                tick={{ fill: '#71717a', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
              />
              <YAxis
                stroke="#71717a"
                tick={{ fill: '#71717a', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  borderRadius: '8px',
                  color: '#f4f4f5',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
                formatter={(value) => [`${value} units`, '7-Day Demand']}
                cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
              />
              <Bar dataKey="quantity" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_BAR_COLORS[index % CHART_BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
