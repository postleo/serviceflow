
import React, { useEffect, useState } from 'react';
import { Page, TrainingPack } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { DB } from '../services/db';

interface Props {
  onNavigate: (page: Page) => void;
  onSelectPack: (id: string) => void;
}

export const TrainingPacks: React.FC<Props> = ({ onNavigate, onSelectPack }) => {
  const { user } = useAuth();
  const [packs, setPacks] = useState<TrainingPack[]>([]);

  useEffect(() => {
    if (user) {
        setPacks(DB.getPacks(user.id));
    }
  }, [user]);

  const handlePackClick = (packId: string) => {
      onSelectPack(packId);
      onNavigate(Page.PROJECT_DETAILS);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-oxford-900">Training Packs</h1>
          <p className="text-oxford-500 text-sm mt-1">Manage your course curriculum</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => onNavigate(Page.ONBOARDING)} className="px-4 py-2 bg-oxford-900 text-white rounded-lg text-sm font-medium hover:bg-oxford-800">+ New Pack</button>
        </div>
      </div>

      {packs.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-oxford-100 text-center">
              <h3 className="text-oxford-900 font-medium">No Training Packs</h3>
              <p className="text-oxford-500 text-sm mt-2 mb-4">Get started by creating a new curriculum for your team.</p>
              <button onClick={() => onNavigate(Page.ONBOARDING)} className="text-primary-600 hover:text-primary-700 font-medium text-sm">Create First Pack</button>
          </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {packs.map(pack => (
                <div 
                    key={pack.id} 
                    className="bg-white rounded-2xl p-6 shadow-sm border border-oxford-100 cursor-pointer hover:shadow-md hover:border-primary-200 transition-all"
                    onClick={() => handlePackClick(pack.id)}
                >
                    <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="font-semibold text-oxford-900">{pack.title}</h2>
                        <p className="text-xs text-oxford-500">{pack.subtitle}</p>
                    </div>
                    <span className="text-xs font-bold bg-oxford-50 text-primary-600 px-2 py-1 rounded-md">
                        Open Project →
                    </span>
                    </div>

                    <div className="relative pl-4 space-y-4 before:absolute before:inset-y-0 before:left-2 before:w-0.5 before:bg-oxford-100">
                    {pack.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="relative pl-6">
                            <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 bg-white z-10 ${
                                item.status === 'ready' ? 'border-primary-500' : 
                                item.status === 'draft' ? 'border-oxford-300 bg-oxford-100' : 'border-oxford-200'
                            }`}></div>
                            
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm text-oxford-700">{item.title}</h3>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                    item.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-oxford-100 text-oxford-500'
                                }`}>
                                    {item.status}
                                </span>
                            </div>
                        </div>
                    ))}
                    {pack.items.length > 3 && (
                        <div className="pl-6 text-xs text-oxford-400 italic">
                            + {pack.items.length - 3} more items...
                        </div>
                    )}
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};
