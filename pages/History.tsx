
import React, { useEffect, useState } from 'react';
import { Page, HistoryEntry } from '../types';
import { IconPlay, IconWand } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { DB } from '../services/db';

interface Props {
    onNavigate: (page: Page) => void;
    onEdit?: (asset: HistoryEntry) => void;
}

export const History: React.FC<Props> = ({ onNavigate, onEdit }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    useEffect(() => {
        if (user) {
            setHistory(DB.getAssets(user.id));
        }
    }, [user]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-oxford-900">Activity History</h1>
                <p className="text-oxford-500 text-sm mt-1">Resume your previous generations.</p>
            </div>

            {history.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-oxford-100 p-12 text-center">
                    <div className="w-16 h-16 bg-oxford-100 rounded-full flex items-center justify-center mx-auto mb-4 text-oxford-400">
                        <IconWand className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-oxford-900">No history yet</h3>
                    <p className="text-oxford-500 text-sm mt-2 mb-6">Start creating content to see it here.</p>
                    <button 
                        onClick={() => onNavigate(Page.CAPTURE)}
                        className="px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600"
                    >
                        Create Content
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-oxford-100 overflow-hidden hover:shadow-md transition-shadow group">
                            {/* Preview Area */}
                            <div className="h-40 bg-oxford-50 relative overflow-hidden flex items-center justify-center">
                                {item.data.visualCode ? (
                                    <div 
                                        className="w-full h-full scale-50 origin-center opacity-75"
                                        dangerouslySetInnerHTML={{ __html: item.data.visualCode }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-oxford-300">
                                        {item.type === 'Audio Training' ? <IconPlay className="w-12 h-12" /> : <span className="text-4xl font-serif opacity-20">Aa</span>}
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider text-oxford-800 shadow-sm border border-oxford-100">
                                    {item.type}
                                </div>
                            </div>
                            
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-oxford-900 line-clamp-1">{item.title}</h3>
                                </div>
                                <p className="text-xs text-oxford-500 line-clamp-2 mb-4 h-8">{item.preview}</p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-oxford-50">
                                    <span className="text-[10px] text-oxford-400">{new Date(item.date).toLocaleDateString()}</span>
                                    <button 
                                        onClick={() => onEdit?.(item)} 
                                        className="text-xs font-bold text-primary-600 hover:text-primary-700"
                                    >
                                        Resume Editing →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
