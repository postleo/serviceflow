
import React, { useState } from 'react';
import { Page } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { IconHome, IconPack, IconCapture, IconLibrary, IconSettings, IconPlus } from './Icons';

const IconHistory = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);

const IconChat = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
);

const IconShield = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

const IconHelp = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
);

const IconChevronLeft = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
);

const IconChevronRight = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
);

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: Page.HOME, label: 'Home', icon: IconHome },
    { id: Page.PACKS, label: 'Training Packs', icon: IconPack },
    { id: Page.CAPTURE, label: 'Capture Workspace', icon: IconCapture },
    { id: Page.LIBRARY, label: 'Library', icon: IconLibrary },
    { id: Page.SOPHIE_CHAT, label: 'Sophie Chat', icon: IconChat }, 
    { id: Page.HISTORY, label: 'Activity', icon: IconHistory },
    { id: Page.SETTINGS, label: 'Settings', icon: IconSettings },
    { id: Page.HELP, label: 'Help & Guide', icon: IconHelp },
  ];

  if (user?.role === 'admin') {
      navItems.push({ id: Page.ADMIN, label: 'Admin Panel', icon: IconShield });
  }

  return (
    <aside 
      className={`hidden md:flex flex-col bg-oxford-900 text-slate-300 h-screen border-r border-oxford-800 shrink-0 transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'}`}
    >
      <div className={`h-16 flex items-center border-b border-oxford-800 ${collapsed ? 'justify-center' : 'px-6'}`}>
        <div className="w-6 h-6 rounded bg-gradient-to-br from-primary-500 to-primary-600 flex-shrink-0" />
        {!collapsed && <span className="font-bold text-white tracking-wide uppercase text-sm ml-3 truncate">ServiceFlow</span>}
      </div>

      <div className="flex-1 py-6 px-3 overflow-y-auto overflow-x-hidden">
        {!collapsed && <div className="mb-2 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Main</div>}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : ''}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary-500/10 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] border border-primary-500/20' 
                    : 'hover:bg-oxford-800 hover:text-white border border-transparent'
                  } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-500' : 'text-slate-500 group-hover:text-slate-300'} ${collapsed ? '' : 'mr-3'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-oxford-800 flex flex-col gap-2">
        <button 
          onClick={() => onNavigate(Page.ONBOARDING)}
          className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-2.5 rounded-full text-sm font-medium shadow-lg shadow-primary-900/20 transition-all active:scale-[0.98] ${collapsed ? 'px-0' : 'px-4'}`}
        >
          <IconPlus className="w-5 h-5" />
          {!collapsed && <span>New Pack</span>}
        </button>
        <button 
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 text-oxford-500 hover:text-white transition-colors"
        >
            {collapsed ? <IconChevronRight className="w-4 h-4" /> : <IconChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
