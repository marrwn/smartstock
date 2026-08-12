const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8346';

export const FALLBACK_DATA = {
  kpis: {
    revenue: 34850.50,
    orders: 360,
    forecast_next_7d: 593,
  },
  leaderboard: [
    { model: 'RandomForest', mae: 1.42, rmse: 1.85 },
    { model: 'XGBoost', mae: 1.68, rmse: 2.10 },
  ],
  forecasts: [
    { day: '2026-08-11', product: 'Wireless Earbuds', category: 'Electronics', predicted_qty: 22 },
    { day: '2026-08-12', product: 'Wireless Earbuds', category: 'Electronics', predicted_qty: 24 },
    { day: '2026-08-13', product: 'Wireless Earbuds', category: 'Electronics', predicted_qty: 20 },
    { day: '2026-08-14', product: 'Wireless Earbuds', category: 'Electronics', predicted_qty: 25 },
    { day: '2026-08-15', product: 'Wireless Earbuds', category: 'Electronics', predicted_qty: 28 },
    { day: '2026-08-16', product: 'Wireless Earbuds', category: 'Electronics', predicted_qty: 30 },
    { day: '2026-08-17', product: 'Wireless Earbuds', category: 'Electronics', predicted_qty: 21 },
    { day: '2026-08-11', product: 'USB-C Cable 2m', category: 'Accessories', predicted_qty: 35 },
    { day: '2026-08-12', product: 'USB-C Cable 2m', category: 'Accessories', predicted_qty: 38 },
    { day: '2026-08-13', product: 'USB-C Cable 2m', category: 'Accessories', predicted_qty: 32 },
    { day: '2026-08-14', product: 'USB-C Cable 2m', category: 'Accessories', predicted_qty: 40 },
    { day: '2026-08-15', product: 'USB-C Cable 2m', category: 'Accessories', predicted_qty: 42 },
    { day: '2026-08-16', product: 'USB-C Cable 2m', category: 'Accessories', predicted_qty: 45 },
    { day: '2026-08-17', product: 'USB-C Cable 2m', category: 'Accessories', predicted_qty: 36 },
    { day: '2026-08-11', product: 'Smart Watch Series 5', category: 'Electronics', predicted_qty: 12 },
    { day: '2026-08-12', product: 'Smart Watch Series 5', category: 'Electronics', predicted_qty: 14 },
    { day: '2026-08-13', product: 'Smart Watch Series 5', category: 'Electronics', predicted_qty: 11 },
    { day: '2026-08-14', product: 'Smart Watch Series 5', category: 'Electronics', predicted_qty: 15 },
    { day: '2026-08-15', product: 'Smart Watch Series 5', category: 'Electronics', predicted_qty: 18 },
    { day: '2026-08-16', product: 'Smart Watch Series 5', category: 'Electronics', predicted_qty: 19 },
    { day: '2026-08-17', product: 'Smart Watch Series 5', category: 'Electronics', predicted_qty: 13 },
    { day: '2026-08-11', product: 'Mechanical Keyboard', category: 'Accessories', predicted_qty: 18 },
    { day: '2026-08-12', product: 'Mechanical Keyboard', category: 'Accessories', predicted_qty: 19 },
    { day: '2026-08-13', product: 'Mechanical Keyboard', category: 'Accessories', predicted_qty: 16 },
    { day: '2026-08-14', product: 'Mechanical Keyboard', category: 'Accessories', predicted_qty: 21 },
    { day: '2026-08-15', product: 'Mechanical Keyboard', category: 'Accessories', predicted_qty: 24 },
    { day: '2026-08-16', product: 'Mechanical Keyboard', category: 'Accessories', predicted_qty: 25 },
    { day: '2026-08-17', product: 'Mechanical Keyboard', category: 'Accessories', predicted_qty: 17 },
  ],
  stock_warnings: [
    { product: 'Wireless Earbuds', days_left: 2, reorder_qty: 120 },
    { product: 'USB-C Cable 2m', days_left: 5, reorder_qty: 200 },
  ],
};

export async function syncData({ sourceUrl, file } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 sec timeout

  try {
    let response;

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      if (sourceUrl) {
        formData.append('source_url', sourceUrl);
      }
      response = await fetch(`${BASE_URL}/api/v1/sync`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
    } else {
      response = await fetch(`${BASE_URL}/api/v1/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source_url: sourceUrl || '' }),
        signal: controller.signal,
      });
    }

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.detail || data.message || 'Failed to sync sales data';
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Backend sync warning (using synthetic local data fallback):', err.message);
    return FALLBACK_DATA;
  }
}

export async function sendChatMessage({ prompt, apiKey, provider = 'gemini', context = null }) {
  if (!apiKey) {
    throw new Error('API Key is missing. Please set your API key in Settings.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${BASE_URL}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        // Optional: pass provider-specific headers if your backend expects them
        'x-provider': provider,
      },
      body: JSON.stringify({
        prompt,
        provider, // 'gemini' | 'openrouter' | etc.
        context,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.detail || 'Failed to get response from AI Assistant';
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('AI request timed out. Please try again.');
    }
    throw err;
  }
}
