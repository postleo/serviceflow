
import React, { useEffect, useState } from 'react';
import { DeliverableType, HistoryEntry } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { DB } from '../services/db';

interface LibraryProps {
    onEdit?: (asset: HistoryEntry) => void;
}

export const Library: React.FC<LibraryProps> = ({ onEdit }) => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (user) {
        setAssets(DB.getAssets(user.id));
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-oxford-900">Library</h1>
          <p className="text-oxford-500 text-sm mt-1">All your generated training assets</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-oxford-100 overflow-hidden">
        <div className="p-4 border-b border-oxford-100 flex gap-4 bg-oxford-50/50 overflow-x-auto">
          <input 
            type="text" 
            placeholder="Search materials..." 
            className="px-4 py-2 rounded-lg border border-oxford-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64 bg-white"
          />
          <select className="px-4 py-2 rounded-lg border border-oxford-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>All Types</option>
            {Object.values(DeliverableType).map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-white text-xs uppercase text-oxford-400 font-medium tracking-wider border-b border-oxford-100">
            <tr>
              <th className="px-6 py-4 font-semibold">Title</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-oxford-50">
            {assets.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-oxford-400">No assets found in library.</td>
                </tr>
            ) : assets.map((asset) => (
              <tr key={asset.id} className="group hover:bg-oxford-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-oxford-800">{asset.title}</td>
                <td className="px-6 py-4 text-oxford-500">{asset.type}</td>
                <td className="px-6 py-4 text-oxford-500">{new Date(asset.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onEdit?.(asset)}
                    className="text-primary-600 hover:text-primary-800 font-medium text-xs cursor-pointer"
                  >
                    Resume/Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
