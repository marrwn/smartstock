// Default suppliers list
export const DEFAULT_SUPPLIERS = [
  { id: 'sup-1', name: 'Apex Components Inc.', phone: '+1 555 382 9102', product: 'Wireless Earbuds' },
  { id: 'sup-2', name: 'Global Tech Distributors', phone: '+1 555 921 4401', product: 'USB-C Cable 2m' },
  { id: 'sup-3', name: 'ProGear Supplies', phone: '+1 555 640 1289', product: 'Smart Watch Series 5' },
  { id: 'sup-4', name: 'Omni Retail Suppliers', phone: '+1 555 771 0023', product: 'Mechanical Keyboard' },
];

export function getSuppliers() {
  const saved = localStorage.getItem('smartstock_suppliers');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return DEFAULT_SUPPLIERS;
    }
  }
  localStorage.setItem('smartstock_suppliers', JSON.stringify(DEFAULT_SUPPLIERS));
  return DEFAULT_SUPPLIERS;
}

export function saveSuppliers(suppliers) {
  localStorage.setItem('smartstock_suppliers', JSON.stringify(suppliers));
}

export function findSupplierForProduct(productName) {
  const list = getSuppliers();
  const found = list.find((s) => s.product.toLowerCase() === productName.toLowerCase());
  if (found) return found;
  // Fallback to custom phone setting or default first supplier
  const customPhone = localStorage.getItem('smartstock_supplier_phone');
  if (customPhone) {
    return { name: 'Configured Supplier', phone: customPhone, product: productName };
  }
  return list[0] || { name: 'Primary Supplier', phone: '', product: productName };
}

export function addPurchaseOrder({ product, qty, supplier, phone }) {
  const saved = localStorage.getItem('smartstock_purchase_orders');
  let orders = [];
  if (saved) {
    try {
      orders = JSON.parse(saved);
    } catch (e) {
      orders = [];
    }
  }

  const newOrder = {
    id: `PO-${Math.floor(1085 + Math.random() * 900)}`,
    product,
    qty,
    supplier,
    phone,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    status: 'Sent',
  };

  orders = [newOrder, ...orders];
  localStorage.setItem('smartstock_purchase_orders', JSON.stringify(orders));
  return newOrder;
}
