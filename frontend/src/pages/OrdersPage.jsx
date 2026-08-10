import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { ShoppingBag, Search, Plus, MessageSquare, CheckCircle, Clock, Truck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_ORDERS = [
  {
    id: 'PO-1084',
    product: 'Wireless Earbuds',
    qty: 45,
    supplier: 'Apex Components Inc.',
    phone: '+1 555 382 9102',
    date: new Date(Date.now() - 3600000 * 5).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    status: 'Confirmed',
  },
  {
    id: 'PO-1083',
    product: 'USB-C Cable 2m',
    qty: 60,
    supplier: 'Global Tech Distributors',
    phone: '+1 555 921 4401',
    date: new Date(Date.now() - 3600000 * 26).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    status: 'Sent',
  },
  {
    id: 'PO-1080',
    product: 'Smart Watch Series 5',
    qty: 25,
    supplier: 'Apex Components Inc.',
    phone: '+1 555 382 9102',
    date: new Date(Date.now() - 3600000 * 72).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    status: 'Received',
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const saved = localStorage.getItem('smartstock_purchase_orders');
    if (saved) {
      try {
        setOrders(JSON.parse(saved));
      } catch (e) {
        setOrders(DEFAULT_ORDERS);
      }
    } else {
      setOrders(DEFAULT_ORDERS);
      localStorage.setItem('smartstock_purchase_orders', JSON.stringify(DEFAULT_ORDERS));
    }
  }, []);

  const saveOrders = (updated) => {
    setOrders(updated);
    localStorage.setItem('smartstock_purchase_orders', JSON.stringify(updated));
  };

  const handleStatusChange = (orderId, newStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    saveOrders(updated);
    toast.success(`Updated ${orderId} status to ${newStatus}`);
  };

  const handleDeleteOrder = (orderId) => {
    const updated = orders.filter((o) => o.id !== orderId);
    saveOrders(updated);
    toast.success(`Removed ${orderId} from order log.`);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 w-full max-w-full min-w-0 overflow-x-hidden animate-in fade-in duration-300">
      <Card className="bg-[#111113] border border-[#27272A] shadow-none rounded-xl p-5 space-y-4 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#FAFAFA]" />
              <h2 className="text-base font-bold text-[#FAFAFA]">
                Purchase Orders Log
              </h2>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              History of supplier reorders triggered via WhatsApp or automated PO creation.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#A1A1AA]" />
              <Input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-[#09090B] border-[#27272A] text-xs rounded-lg h-8 text-[#FAFAFA] placeholder:text-[#A1A1AA]"
              />
            </div>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'Sent', 'Confirmed', 'Received'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-[#E4E4E7] text-[#09090B]'
                  : 'bg-[#18181B] text-[#A1A1AA] hover:text-[#FAFAFA] border border-[#27272A]'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st}
            </button>
          ))}
        </div>

        {/* Table Container */}
        <div className="w-full max-w-full overflow-x-auto border border-[#27272A] rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="border-[#27272A] bg-[#09090B]">
                <TableHead className="font-bold text-xs uppercase text-[#A1A1AA]">Order ID</TableHead>
                <TableHead className="font-bold text-xs uppercase text-[#A1A1AA]">Product</TableHead>
                <TableHead className="font-bold text-xs uppercase text-[#A1A1AA] text-right">Quantity</TableHead>
                <TableHead className="font-bold text-xs uppercase text-[#A1A1AA]">Supplier</TableHead>
                <TableHead className="font-bold text-xs uppercase text-[#A1A1AA]">Date Sent</TableHead>
                <TableHead className="font-bold text-xs uppercase text-[#A1A1AA] text-center">Fulfillment Status</TableHead>
                <TableHead className="font-bold text-xs uppercase text-[#A1A1AA] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-xs text-[#A1A1AA]">
                    No purchase orders matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-[#27272A]/50 hover:bg-[#18181B]">
                    <TableCell className="font-bold text-xs text-[#FAFAFA] font-mono">{order.id}</TableCell>
                    <TableCell className="font-semibold text-xs text-[#FAFAFA]">{order.product}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-[#FAFAFA]">+{order.qty} units</TableCell>
                    <TableCell className="text-xs text-[#A1A1AA]">
                      <div className="font-semibold text-[#FAFAFA]">{order.supplier}</div>
                      <div className="text-[10px] text-[#A1A1AA]">{order.phone}</div>
                    </TableCell>
                    <TableCell className="text-xs text-[#A1A1AA]">{order.date}</TableCell>
                    <TableCell className="text-center">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-md border bg-[#09090B] focus:outline-none cursor-pointer ${
                          order.status === 'Received'
                            ? 'text-[#22C55E] border-[#22C55E]/30'
                            : order.status === 'Confirmed'
                            ? 'text-[#FAFAFA] border-[#27272A]'
                            : 'text-[#F59E0B] border-[#F59E0B]/30'
                        }`}
                      >
                        <option value="Sent">Sent</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Received">Received</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOrder(order.id)}
                        className="h-7 w-7 p-0 text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#18181B]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
