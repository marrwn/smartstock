import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Search, MessageSquare, ArrowUpDown } from 'lucide-react';
import { findSupplierForProduct, addPurchaseOrder } from '@/lib/suppliers';
import { toast } from 'sonner';

export default function InventoryPage({ data }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('product');
  const [sortOrder, setSortOrder] = useState('asc');

  const inventoryRows = useMemo(() => {
    if (!data || !data.forecasts) return [];
    const map = {};
    data.forecasts.forEach((item) => {
      if (!map[item.product]) {
        map[item.product] = {
          product: item.product,
          category: item.category || 'General',
          total_predicted: 0,
          days_forecasted: 0,
        };
      }
      map[item.product].total_predicted += item.predicted_qty;
      map[item.product].days_forecasted += 1;
    });

    return Object.values(map).map((row) => {
      const warning = (data.stock_warnings || []).find((w) => w.product === row.product);
      const daysLeftNum = warning ? warning.days_left : 99;
      return {
        ...row,
        daily_avg: Math.round(row.total_predicted / (row.days_forecasted || 1)),
        stockout_risk: !!warning,
        days_left_num: daysLeftNum,
        days_left: warning ? warning.days_left : '> 7',
        reorder_qty: warning ? warning.reorder_qty : Math.round(row.total_predicted * 1.5),
      };
    });
  }, [data]);

  const sortedAndFiltered = useMemo(() => {
    return inventoryRows
      .filter((r) => r.product.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [inventoryRows, searchQuery, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleWhatsAppReorder = (item) => {
    const supplierObj = findSupplierForProduct(item.product);
    const text = encodeURIComponent(
      `Reorder needed: ${item.product} — ${item.reorder_qty} units (only ${item.days_left} days of stock left).`
    );

    addPurchaseOrder({
      product: item.product,
      qty: item.reorder_qty,
      supplier: supplierObj.name,
      phone: supplierObj.phone,
    });

    const phoneNum = supplierObj.phone.replace(/[^0-9+]/g, '');
    const whatsappUrl = phoneNum
      ? `https://wa.me/${phoneNum}?text=${text}`
      : `https://wa.me/?text=${text}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    toast.success(`Logged reorder for ${item.product} (+${item.reorder_qty} units) in Purchase Orders.`);
  };

  return (
    <div className="space-y-4 w-full max-w-full min-w-0 overflow-x-hidden animate-in fade-in duration-300">
      <Card className="bg-[#111113] border border-[#27272A] shadow-none rounded-xl p-5 space-y-4 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#FAFAFA]">
              Product Inventory & Safety Thresholds
            </h2>
            <p className="text-xs text-[#A1A1AA]">
              Daily sales velocity, 7-day predicted demand volume, and safety buffers across all active SKUs.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#A1A1AA]" />
            <Input
              type="text"
              placeholder="Search product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-[#09090B] border-[#27272A] text-xs rounded-lg h-8 text-[#FAFAFA] placeholder:text-[#A1A1AA]"
            />
          </div>
        </div>

        <div className="w-full max-w-full overflow-x-auto border border-[#27272A] rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="border-[#27272A] bg-[#09090B]">
                <TableHead className="font-bold text-xs uppercase text-[#A1A1AA] cursor-pointer" onClick={() => handleSort('product')}>
                  Product <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </TableHead>
                <TableHead className="font-bold text-xs uppercase text-[#A1A1AA] text-right cursor-pointer" onClick={() => handleSort('daily_avg')}>
                  Daily Velocity <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </TableHead>
                <TableHead className="font-bold text-xs uppercase text-[#A1A1AA] text-right cursor-pointer" onClick={() => handleSort('total_predicted')}>
                  7-Day Demand <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </TableHead>
                <TableHead className="font-bold text-xs uppercase text-[#A1A1AA] text-center cursor-pointer" onClick={() => handleSort('days_left_num')}>
                  Safety Buffer <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </TableHead>
                <TableHead className="font-bold text-xs uppercase text-[#A1A1AA] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFiltered.map((item) => {
                const itemCritical = item.days_left_num <= 3;
                return (
                  <TableRow key={item.product} className="border-[#27272A]/50 hover:bg-[#18181B]">
                    <TableCell className="font-bold text-[#FAFAFA] text-xs">{item.product}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-[#A1A1AA]">{item.daily_avg} units/day</TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-[#FAFAFA]">{item.total_predicted} units</TableCell>
                    <TableCell className="text-center">
                      {item.stockout_risk ? (
                        <Badge
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            itemCritical
                              ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                              : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                          }`}
                        >
                          {item.days_left} {item.days_left === 1 ? 'day' : 'days'} left
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-[#27272A] text-[#A1A1AA] text-[10px]">
                          Sufficient Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleWhatsAppReorder(item)}
                        className="bg-[#E4E4E7] text-[#09090B] hover:bg-[#FAFAFA] text-[11px] font-bold rounded-lg h-7 px-2.5"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Order (+{item.reorder_qty})
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
