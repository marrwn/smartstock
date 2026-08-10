import React from 'react';
import ShinyButton from '@/components/reactbits/ShinyButton';
import ClickSpark from '@/components/reactbits/ClickSpark';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MessageSquare, ArrowUpRight, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { findSupplierForProduct, addPurchaseOrder } from '@/lib/suppliers';

export default function StockAlertBanner({ stockWarnings = [] }) {
  if (!stockWarnings || stockWarnings.length === 0) {
    return null;
  }

  // Find worst severity
  const minDays = Math.min(...stockWarnings.map((w) => w.days_left));
  const isCritical = minDays <= 3; // Red if <= 3 days, Amber if > 3 days

  const stripeColor = isCritical
    ? 'border-l-4 border-l-[#EF4444]'
    : 'border-l-4 border-l-[#F59E0B]';

  const handleWhatsAppReorder = (item) => {
    const supplierObj = findSupplierForProduct(item.product);
    const text = encodeURIComponent(
      `Reorder needed: ${item.product} — ${item.reorder_qty} units (only ${item.days_left} days of stock left).`
    );

    // Log purchase order to Purchase Orders history page
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

  const handleCreatePO = (item) => {
    const supplierObj = findSupplierForProduct(item.product);
    const newPO = addPurchaseOrder({
      product: item.product,
      qty: item.reorder_qty,
      supplier: supplierObj.name,
      phone: supplierObj.phone,
    });

    toast.success(`Created Purchase Order ${newPO.id} for ${item.product} (+${item.reorder_qty} units)`);
  };

  return (
    <div
      className={`p-5 bg-[#111113] border border-[#27272A] shadow-lg rounded-xl transition-all w-full ${stripeColor}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={`w-4 h-4 ${isCritical ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}
            />
            <h3 className="text-base font-bold text-[#FAFAFA] tracking-tight">
              Action Needed: {stockWarnings.length} {stockWarnings.length === 1 ? 'Item' : 'Items'} Low on Stock
            </h3>
          </div>
          <p className="text-xs text-[#A1A1AA]">
            Stock levels below 7-day safety threshold. Create purchase order or send WhatsApp reorder to suppliers.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full">
        {stockWarnings.map((item, idx) => {
          const itemCritical = item.days_left <= 3;
          const supplier = findSupplierForProduct(item.product);
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-lg border flex flex-col justify-between gap-3 ${
                itemCritical
                  ? 'bg-[#EF4444]/10 border-[#EF4444]/30'
                  : 'bg-[#F59E0B]/10 border-[#F59E0B]/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#FAFAFA] text-sm block">
                    {item.product}
                  </span>
                  <span className="text-[10px] text-[#A1A1AA]">{supplier.name}</span>
                </div>
                <Badge
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    itemCritical
                      ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                      : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                  }`}
                >
                  {item.days_left} {item.days_left === 1 ? 'day' : 'days'} left
                </Badge>
              </div>

              <div className="text-xs text-[#A1A1AA] flex items-center justify-between font-medium">
                <span>Suggested reorder:</span>
                <span className="font-bold text-[#FAFAFA] text-xs">
                  +{item.reorder_qty} units
                </span>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <ClickSpark sparkColor="#E4E4E7" sparkCount={8} className="flex-1">
                  <ShinyButton
                    onClick={() => handleWhatsAppReorder(item)}
                    className="w-full text-xs py-1.5 px-3 rounded-lg font-semibold bg-[#E4E4E7] text-[#09090B] hover:bg-[#FAFAFA]"
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1" />
                    Order on WhatsApp
                    <ArrowUpRight className="w-3 h-3 ml-auto opacity-70" />
                  </ShinyButton>
                </ClickSpark>

                <button
                  type="button"
                  onClick={() => handleCreatePO(item)}
                  title="Create Purchase Order"
                  className="p-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-[#FAFAFA] hover:bg-[#27272A] transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
