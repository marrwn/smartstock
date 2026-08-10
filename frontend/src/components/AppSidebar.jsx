import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  Home,
  Package,
  ShoppingBag,
  TrendingUp,
  Cpu,
  MessageSquare,
  Settings,
  Box,
  Building2,
} from 'lucide-react';

const mainNavItems = [
  { title: 'Overview', url: '/', icon: Home },
  { title: 'Product Inventory', url: '/inventory', icon: Package },
  { title: 'Purchase Orders', url: '/orders', icon: ShoppingBag },
  { title: 'Demand Forecasts', url: '/forecasts', icon: TrendingUp },
  { title: 'ML Model Accuracy', url: '/models', icon: Cpu },
];

const toolNavItems = [
  { title: 'Ask AI Copilot', url: '/chat', icon: MessageSquare },
];

export default function AppSidebar() {
  const location = useLocation();
  const [businessName, setBusinessName] = useState('Acme Retail Store');
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('smartstock_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.businessName) setBusinessName(parsed.businessName);
        if (parsed.logoUrl) setLogoUrl(parsed.logoUrl);
      } catch (e) {
        console.error(e);
      }
    }
  }, [location.pathname]);

  return (
    <Sidebar collapsible="icon" className="border-r border-[#27272A] bg-[#0B0B0D] text-[#FAFAFA]">
      {/* Sidebar Header */}
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-pointer flex items-center gap-3">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#FAFAFA] text-[#09090B] font-bold overflow-hidden shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt={businessName} className="w-full h-full object-cover" />
                ) : (
                  <Box className="size-4" />
                )}
              </div>
              <div className="flex flex-col gap-0.5 text-left leading-none">
                <span className="font-extrabold text-sm tracking-tight text-[#FAFAFA]">SmartStock</span>
                <span className="text-[10px] text-[#A1A1AA] font-medium">Inventory Copilot</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className="my-1 bg-[#27272A]" />

      {/* Sidebar Content */}
      <SidebarContent className="px-2">
        {/* Main Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] px-2 py-1">
            Main Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {mainNavItems.map((item) => {
                const isActive =
                  item.url === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-9.5 px-3 flex items-center gap-3 font-semibold text-xs rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#E4E4E7] text-[#09090B] font-bold shadow-xs'
                          : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]'
                      }`}
                      render={<Link to={item.url} />}
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] px-2 py-1">
            Copilot Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {toolNavItems.map((item) => {
                const isActive = location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-9.5 px-3 flex items-center gap-3 font-semibold text-xs rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#E4E4E7] text-[#09090B] font-bold shadow-xs'
                          : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]'
                      }`}
                      render={<Link to={item.url} />}
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="p-2 space-y-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={location.pathname === '/settings'}
              tooltip="Settings"
              className={`h-9.5 px-3 flex items-center gap-3 font-semibold text-xs rounded-lg transition-colors ${
                location.pathname === '/settings'
                  ? 'bg-[#E4E4E7] text-[#09090B] font-bold shadow-xs'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]'
              }`}
              render={<Link to="/settings" />}
            >
              <Settings className="size-4 shrink-0" />
              <span className="truncate">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Store Profile Card (Slightly Larger with Profile Picture Avatar) */}
        <div className="p-3 rounded-xl bg-[#111113] border border-[#27272A] group-data-[collapsible=icon]:hidden flex items-center justify-between min-h-[56px]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="size-9 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#FAFAFA] font-bold shrink-0 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={businessName} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-4.5 h-4.5 text-[#E4E4E7]" />
              )}
            </div>
            <div className="text-xs leading-tight truncate">
              <p className="font-bold text-[#FAFAFA] truncate text-xs">{businessName}</p>
              <p className="text-[10px] text-[#A1A1AA] font-medium pt-0.5">Active Store</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0 ml-1" />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
