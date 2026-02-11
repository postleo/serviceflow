
import React, { useEffect, useState } from 'react';
import { Page, HistoryEntry, TrainingPack } from '../types';
import { IconWand, IconPack } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { DB } from '../services/db';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [recentAssets, setRecentAssets] = useState<HistoryEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [activePackName, setActivePackName] = useState("No Active Pack");

  useEffect(() => {
    if (user) {
        const assets = DB.getAssets(user.id);
        setRecentAssets(assets.slice(0, 5)); // Top 5

        // Calculate progress
        const packs = DB.getPacks(user.id);
        if (packs.length > 0) {
            const active = packs[0]; // Simplification for demo
            setActivePackName(active.title);
            if (active.items.length > 0) {
                const done = active.items.filter(i => i.status === 'ready').length;
                setProgress(Math.round((done / active.items.length) * 100));
            }
        }
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-oxford-900">Hi, {user?.username}</h1>
          <p className="text-oxford-500 text-sm mt-1">Ready to train your team today?</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onNavigate(Page.CAPTURE)}
            className="flex items-center gap-2 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.02]"
          >
            <IconWand className="w-4 h-4" />
            Create Material
          </button>
          <button 
            onClick={() => onNavigate(Page.ONBOARDING)}
            className="flex items-center gap-2 bg-white border border-oxford-200 hover:bg-oxford-50 text-oxford-700 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
          >
            <IconPack className="w-4 h-4" />
            Create Pack
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-oxford-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-oxford-900">Quick Actions</h2>
                <p className="text-xs text-oxford-500">Start from a common deliverable</p>
              </div>
              <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full uppercase tracking-wide">Popular</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Service Sequence Cards', desc: 'Step-by-step service flow', tags: ['Cards', 'PDF'] },
                { title: 'Table Layout Guide', desc: 'Zones, sections and traffic', tags: ['Diagram'] },
                { title: 'Menu Script', desc: 'Talking through specials', tags: ['Script', 'Audio'] },
                { title: 'Problem Resolution', desc: 'Handling complaints', tags: ['Flowchart'] },
              ].map((action, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onNavigate(Page.CAPTURE)}
                  className="group p-4 rounded-xl bg-oxford-50 border border-oxford-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer"
                >
                  <h3 className="font-semibold text-sm text-oxford-900 group-hover:text-primary-700 transition-colors">{action.title}</h3>
                  <p className="text-xs text-oxford-500 mt-1 mb-3">{action.desc}</p>
                  <div className="flex gap-2">
                    {action.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-white border border-oxford-200 px-2 py-0.5 rounded-full text-oxford-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Training */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-oxford-100">
             <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-oxford-900">Recent Materials</h2>
                <p className="text-xs text-oxford-500">Your latest generations</p>
              </div>
              <button 
                onClick={() => onNavigate(Page.LIBRARY)}
                className="text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                View all
              </button>
            </div>
            
            {recentAssets.length === 0 ? (
                <p className="text-sm text-oxford-400 py-4 italic">No materials generated yet.</p>
            ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                    <tr className="border-b border-oxford-100 text-xs uppercase text-oxford-400 font-medium tracking-wider">
                        <th className="pb-3 pl-1 font-semibold">Title</th>
                        <th className="pb-3 font-semibold">Type</th>
                        <th className="pb-3 font-semibold">Date</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-oxford-50">
                    {recentAssets.map(asset => (
                        <tr key={asset.id} className="group hover:bg-oxford-50/50 transition-colors">
                            <td className="py-3 pl-1 font-medium text-oxford-800">{asset.title}</td>
                            <td className="py-3 text-oxford-500">{asset.type}</td>
                            <td className="py-3 text-oxford-400 text-xs">{new Date(asset.date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-oxford-100">
            <h2 className="text-base font-semibold text-oxford-900 mb-1">Completion Snapshot</h2>
            <p className="text-xs text-oxford-500 mb-6">Team progress on active packs</p>
            
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                  <circle cx="48" cy="48" r="40" stroke="#f97316" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - progress/100)} className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold text-oxford-900">{progress}%</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-sm font-medium text-oxford-900 line-clamp-1">{activePackName}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-oxford-600">
                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                    <span>Assets Ready</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-oxford-600">
                    <div className="w-2 h-2 rounded-full bg-oxford-200"></div>
                    <span>In Progress</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-oxford-900 to-oxford-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full filter blur-[60px] opacity-20 transform translate-x-10 -translate-y-10"></div>
            
            <h3 className="text-lg font-semibold mb-2 relative z-10">Pro Tip</h3>
            <p className="text-sm text-oxford-300 mb-4 relative z-10">
              Capture your best explanation of a complex task. Gemini will distill your expertise into a clear, reusable sequence for the whole team.
            </p>
            <button 
              onClick={() => onNavigate(Page.CAPTURE)}
              className="relative z-10 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Try Audio Capture
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
