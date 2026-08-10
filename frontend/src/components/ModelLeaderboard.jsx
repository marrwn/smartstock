import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

export default function ModelLeaderboard({ leaderboard = [] }) {
  if (!leaderboard || leaderboard.length === 0) return null;

  return (
    <Card className="bg-[#111113] border border-[#27272A] shadow-none rounded-xl overflow-hidden w-full">
      <CardHeader className="pb-3 border-b border-[#27272A]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold text-[#FAFAFA] uppercase tracking-wider">
            Model Accuracy
          </CardTitle>
          <span className="text-[11px] font-semibold text-[#A1A1AA]">
            Validated on recent sales
          </span>
        </div>
        <CardDescription className="text-xs text-[#A1A1AA]">
          Lower error scores indicate more reliable demand predictions for your store.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 w-full overflow-x-auto">
        <div className="w-full min-w-[500px]">
          <Table>
            <TableHeader>
              <TableRow className="border-[#27272A] hover:bg-transparent">
                <TableHead className="text-[#A1A1AA] font-semibold text-xs uppercase tracking-wider">Model</TableHead>
                <TableHead className="text-[#A1A1AA] font-semibold text-xs uppercase tracking-wider text-right">Mean Error (MAE)</TableHead>
                <TableHead className="text-[#A1A1AA] font-semibold text-xs uppercase tracking-wider text-right">Std Error (RMSE)</TableHead>
                <TableHead className="text-[#A1A1AA] font-semibold text-xs uppercase tracking-wider text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((item, idx) => {
                const isBest = idx === 0;
                return (
                  <TableRow
                    key={item.model}
                    className={`border-[#27272A]/50 transition-colors ${
                      isBest
                        ? 'bg-[#18181B] font-semibold'
                        : 'hover:bg-[#18181B]/50'
                    }`}
                  >
                    <TableCell className="font-bold text-[#FAFAFA] text-xs">
                      {item.model}
                    </TableCell>
                    <TableCell className="text-right text-[#FAFAFA] font-mono text-xs">
                      {item.mae.toFixed(2)} units
                    </TableCell>
                    <TableCell className="text-right text-[#A1A1AA] font-mono text-xs">
                      {item.rmse.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      {isBest ? (
                        <Badge className="bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 text-[10px] font-bold px-2 py-0.5">
                          <Check className="w-3 h-3 mr-0.5 inline" />
                          Highest Accuracy
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-[#27272A] text-[#A1A1AA] text-[10px]">
                          Secondary Model
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
