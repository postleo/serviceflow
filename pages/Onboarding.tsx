
import React from 'react';
import { Page } from '../types';
import { DB } from '../services/db';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onNavigate: (page: Page) => void;
}

export const Onboarding: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();

  const handleSelectPack = (title: string, desc: string) => {
      if (!user) return;
      // Create pack in DB
      DB.createPack(user.id, title, desc, [
          { title: 'Sequence Walkthrough', type: 'Service Sequence Cards' },
          { title: 'Key Scripts', type: 'Script Card' }
      ]);
      onNavigate(Page.PACKS);
  };

  return (
    <div className="max-w-4xl mx-auto pt-10">
      <div className="mb-8">
        <div className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Step 1 of 2</div>
        <h1 className="text-3xl font-bold text-oxford-900">Let's create your first pack</h1>
        <p className="text-oxford-500 mt-2">Pick a starting point. We've pre-configured the AI for these common scenarios.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[
          { title: 'New Servers: First 3 Shifts', desc: 'Greeting, seating, menu basics and closing.', recommended: true },
          { title: 'Menu Presentation', desc: 'How to describe dishes and sell specials.' },
          { title: 'Handling Complaints', desc: 'Empathy, escalation paths and refunds.' },
          { title: 'Table Layout & Sections', desc: 'Zones, sections and coverage maps.' },
        ].map((opt, idx) => (
          <div 
            key={idx}
            className="group relative bg-white border border-oxford-200 p-6 rounded-2xl hover:border-primary-500 cursor-pointer transition-all hover:shadow-md"
            onClick={() => handleSelectPack(opt.title, opt.desc)}
          >
            {opt.recommended && (
              <span className="absolute top-4 right-4 text-[10px] font-bold bg-primary-100 text-primary-700 px-2 py-1 rounded-full uppercase">
                Recommended
              </span>
            )}
            <h3 className="font-bold text-oxford-900 mb-2">{opt.title}</h3>
            <p className="text-sm text-oxford-500">{opt.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <button onClick={() => onNavigate(Page.HOME)} className="text-sm font-medium text-oxford-500 hover:text-oxford-800">Skip for now</button>
        <button onClick={() => onNavigate(Page.CAPTURE)} className="px-6 py-3 bg-oxford-900 text-white rounded-full font-medium shadow-lg hover:bg-oxford-800 transition-all">
          Start from Scratch
        </button>
      </div>
    </div>
  );
};
