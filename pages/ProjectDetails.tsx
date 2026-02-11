
import React, { useEffect, useState } from 'react';
import { Page, TrainingPack, TrainingItem } from '../types';
import { DB } from '../services/db';
import { IconWand, IconCheck, IconEdit } from '../components/Icons';

// Icons for actions
const IconTrash = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);

const IconCopy = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);

const IconChevronLeft = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);

interface Props {
  packId: string | null;
  onNavigate: (page: Page) => void;
}

export const ProjectDetails: React.FC<Props> = ({ packId, onNavigate }) => {
  const [pack, setPack] = useState<TrainingPack | undefined>(undefined);

  const loadPack = () => {
      if (packId) {
          setPack(DB.getPackById(packId));
      }
  };

  useEffect(() => {
    loadPack();
  }, [packId]);

  if (!pack) return <div>Project not found.</div>;

  const handleDelete = (itemId: string) => {
      if (confirm('Are you sure you want to delete this asset?')) {
          DB.deletePackItem(pack.id, itemId);
          loadPack();
      }
  };

  const handleDuplicate = (itemId: string) => {
      DB.duplicatePackItem(pack.id, itemId);
      loadPack();
  };

  const calculateProgress = () => {
      if (pack.items.length === 0) return 0;
      const completed = pack.items.filter(i => i.status === 'ready').length;
      return Math.round((completed / pack.items.length) * 100);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button 
            onClick={() => onNavigate(Page.PACKS)}
            className="flex items-center gap-2 text-sm text-oxford-500 hover:text-oxford-800 transition-colors w-max"
        >
            <IconChevronLeft className="w-4 h-4" />
            Back to Packs
        </button>

        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-oxford-900">{pack.title}</h1>
                <p className="text-oxford-500 mt-1">{pack.subtitle}</p>
            </div>
            <button 
                onClick={() => onNavigate(Page.CAPTURE)}
                className="flex items-center gap-2 bg-oxford-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-oxford-800 transition-colors shadow-lg"
            >
                <IconWand className="w-4 h-4" />
                Generate New Asset
            </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-4 rounded-xl border border-oxford-100 shadow-sm flex items-center gap-4">
            <div className="flex-1">
                <div className="flex justify-between text-xs font-medium mb-2">
                    <span className="text-oxford-600">Project Completion</span>
                    <span className="text-primary-600">{calculateProgress()}%</span>
                </div>
                <div className="w-full bg-oxford-100 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full transition-all duration-500" style={{ width: `${calculateProgress()}%` }}></div>
                </div>
            </div>
        </div>
      </div>

      {/* File Management List */}
      <div className="bg-white rounded-2xl shadow-sm border border-oxford-100 overflow-hidden">
        <div className="p-4 border-b border-oxford-100 bg-oxford-50 flex justify-between items-center">
            <h3 className="font-semibold text-oxford-900">Project Assets</h3>
            <span className="text-xs text-oxford-500">{pack.items.length} items</span>
        </div>
        
        <div className="divide-y divide-oxford-50">
            {pack.items.length === 0 ? (
                <div className="p-10 text-center text-oxford-400">
                    No assets in this project yet. Start generating!
                </div>
            ) : (
                pack.items.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-oxford-50/50 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                                item.status === 'ready' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-oxford-100 border-oxford-200 text-oxford-400'
                            }`}>
                                {item.status === 'ready' ? <IconCheck className="w-5 h-5" /> : <div className="w-3 h-3 rounded-full bg-oxford-300"></div>}
                            </div>
                            <div>
                                <h4 className="font-medium text-oxford-900 text-sm">{item.title}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-oxford-500">{item.type}</span>
                                    <span className="text-[10px] text-oxford-300">•</span>
                                    <span className="text-xs text-oxford-400">Last updated {new Date(item.lastUpdated).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleDuplicate(item.id)}
                                title="Duplicate"
                                className="p-2 text-oxford-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            >
                                <IconCopy className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => onNavigate(Page.CAPTURE)}
                                title="Edit / Resume"
                                className="p-2 text-oxford-400 hover:text-oxford-800 hover:bg-oxford-200 rounded-lg transition-colors"
                            >
                                <IconEdit className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-oxford-200 mx-1"></div>
                            <button 
                                onClick={() => handleDelete(item.id)}
                                title="Delete"
                                className="p-2 text-oxford-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <IconTrash className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};
