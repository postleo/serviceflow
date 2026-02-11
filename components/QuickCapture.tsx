import React, { useState } from 'react';
import { IconMic, IconPlus } from './Icons';

interface QuickCaptureProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const QuickCapture: React.FC<QuickCaptureProps> = ({ isOpen, onOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'record' | 'type'>('record');

  if (!isOpen) {
    return (
      <button 
        onClick={onOpen}
        className="fixed right-6 bottom-6 z-30 flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white pl-4 pr-5 py-3 rounded-full shadow-xl shadow-primary-500/25 transition-all hover:-translate-y-1 active:scale-95"
      >
        <span className="w-2 h-2 rounded-full bg-red-200 animate-pulse"></span>
        <span className="font-medium text-sm">Quick capture</span>
      </button>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-oxford-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl border border-oxford-100 overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-4 border-b border-oxford-100 flex items-center justify-between bg-oxford-50/50">
            <div>
              <h3 className="font-semibold text-oxford-900">Quick Capture</h3>
              <p className="text-xs text-oxford-500">Capture an idea on the fly</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-oxford-100 text-oxford-500 text-lg">
              ×
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex bg-oxford-100 p-1 rounded-full w-max">
              <button 
                onClick={() => setActiveTab('record')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activeTab === 'record' ? 'bg-white text-oxford-900 shadow-sm' : 'text-oxford-500 hover:text-oxford-700'}`}
              >
                Record
              </button>
              <button 
                onClick={() => setActiveTab('type')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activeTab === 'type' ? 'bg-white text-oxford-900 shadow-sm' : 'text-oxford-500 hover:text-oxford-700'}`}
              >
                Type
              </button>
            </div>

            {activeTab === 'record' ? (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center border-2 border-red-200 relative">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                </div>
                <div>
                  <div className="text-red-900 font-semibold text-sm">Recording... 00:08</div>
                  <div className="text-red-700/70 text-xs mt-1">Listening to your idea</div>
                </div>
              </div>
            ) : (
              <textarea 
                className="w-full h-24 p-3 bg-oxford-50 border border-oxford-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                placeholder="Type your idea here..."
                autoFocus
              />
            )}

            <div>
              <label className="block text-xs font-medium text-oxford-500 mb-2">Destination</label>
              <select className="w-full text-sm bg-oxford-50 border border-oxford-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none">
                <option>Inbox (Drafts)</option>
                <option>New Server Onboarding</option>
                <option>Menu Knowledge</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-oxford-50 border-t border-oxford-100 flex justify-end gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-oxford-600 hover:bg-oxford-200 rounded-lg transition-colors"
            >
              Discard
            </button>
            <button className="px-4 py-2 text-xs font-medium bg-oxford-900 text-white rounded-lg hover:bg-oxford-800 transition-colors shadow-sm">
              Save to Inbox
            </button>
          </div>
        </div>
      </div>
    </>
  );
};