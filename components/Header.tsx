
import React, { useState } from 'react';
import { IconBell, IconMenu } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { Page } from '../types';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-oxford-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="md:hidden flex items-center gap-2">
        <button className="p-2 text-oxford-600">
          <IconMenu className="w-5 h-5" />
        </button>
        <div className="w-5 h-5 rounded bg-gradient-to-br from-primary-500 to-primary-600" />
      </div>

      <div className="hidden md:block text-sm text-oxford-500">
        <span className="opacity-75">Workplace</span> <span className="mx-1">/</span> <span className="font-medium text-oxford-800">Maison Verde</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-oxford-400 hover:text-oxford-600 transition-colors relative">
          <IconBell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500 border border-white"></span>
        </button>
        
        <div className="relative pl-4 border-l border-oxford-200">
            <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 focus:outline-none"
            >
                <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-oxford-800">{user?.username}</div>
                    <div className="text-[10px] text-oxford-500 uppercase">{user?.role}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-oxford-800 text-white flex items-center justify-center text-xs font-medium ring-2 ring-white shadow-sm hover:bg-oxford-700 transition-colors">
                    {user?.username.substring(0,2).toUpperCase()}
                </div>
            </button>

            {showProfileMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-oxford-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-oxford-50">
                        <p className="text-xs text-oxford-500">Signed in as</p>
                        <p className="text-sm font-medium text-oxford-900 truncate">{user?.email}</p>
                    </div>
                    <div className="p-1">
                        <button onClick={() => { setShowProfileMenu(false); onNavigate(Page.SETTINGS); }} className="w-full text-left px-3 py-2 text-sm text-oxford-600 hover:bg-oxford-50 rounded-lg">Settings</button>
                        <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">Log Out</button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};
