const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function syncData({ sourceUrl, file } = {}) {
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
    });
  } else {
    response = await fetch(`${BASE_URL}/api/v1/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ source_url: sourceUrl || '' }),
    });
  }

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.detail || data.message || 'Failed to sync sales data';
    throw new Error(errorMsg);
  }

  return data;
}

export async function sendChatMessage({ prompt, apiKey, provider = 'gemini', context = null }) {
  if (!apiKey) {
    throw new Error('API Key is missing. Please set your API key in Settings.');
  }

  const response = await fetch(`${BASE_URL}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      prompt,
      provider,
      context,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.detail || 'Failed to get response from AI Assistant';
    throw new Error(errorMsg);
  }

  return data;
}
