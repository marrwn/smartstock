import React from 'react';
import { BrowserRouter, Routes, Route, useOutletContext } from 'react-router-dom';
import Layout from '@/components/Layout';
import OverviewPage from '@/pages/OverviewPage';
import InventoryPage from '@/pages/InventoryPage';
import OrdersPage from '@/pages/OrdersPage';
import ForecastsPage from '@/pages/ForecastsPage';
import ModelsPage from '@/pages/ModelsPage';
import SettingsPage from '@/pages/SettingsPage';
import ChatPage from '@/pages/ChatPage';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

function OverviewRoute() {
  const { data } = useOutletContext();
  return <OverviewPage data={data} />;
}

function InventoryRoute() {
  const { data } = useOutletContext();
  return <InventoryPage data={data} />;
}

function ForecastsRoute() {
  const { data } = useOutletContext();
  return <ForecastsPage data={data} />;
}

function ModelsRoute() {
  const { data } = useOutletContext();
  return <ModelsPage data={data} />;
}

function ChatRoute() {
  const { data } = useOutletContext();
  return <ChatPage data={data} />;
}

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<OverviewRoute />} />
            <Route path="inventory" element={<InventoryRoute />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="forecasts" element={<ForecastsRoute />} />
            <Route path="models" element={<ModelsRoute />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="chat" element={<ChatRoute />} />
          </Route>
        </Routes>
        <Toaster theme="dark" position="top-right" richColors />
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
