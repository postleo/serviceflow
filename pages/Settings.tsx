
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
      if (user) setUsername(user.username);
  }, [user]);

  const handleSave = () => {
      if (username.trim()) {
          updateProfile(username);
          setMessage('Settings saved successfully!');
          setTimeout(() => setMessage(''), 3000);
      }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-20">
      <div>
        <h1 className="text-2xl font-bold text-oxford-900">Settings</h1>
        <p className="text-oxford-500 text-sm mt-1">Configure your AI Agents and Workspace preferences.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Profile */}
          <div className="bg-white rounded-2xl shadow-sm border border-oxford-100 p-6">
            <h2 className="text-lg font-semibold text-oxford-900 mb-4">Your Profile</h2>
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-oxford-700 mb-2">Display Name</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-oxford-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-oxford-900" 
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-oxford-700 mb-2">Email</label>
                    <input 
                        type="text" 
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-2 rounded-lg border border-oxford-200 text-sm bg-oxford-50 text-oxford-500 cursor-not-allowed" 
                    />
                </div>
            </div>
          </div>

          {/* Brand Voice */}
          <div className="bg-white rounded-2xl shadow-sm border border-oxford-100 p-6">
            <h2 className="text-lg font-semibold text-oxford-900 mb-4">Brand Voice & Tone</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-oxford-700 mb-2">Workspace Name</label>
                    <input type="text" defaultValue="Maison Verde" className="w-full px-4 py-2 rounded-lg border border-oxford-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-oxford-900" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-oxford-700 mb-2">Communication Style</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['Formal', 'Casual', 'Encouraging', 'Direct'].map(tone => (
                            <button key={tone} className={`px-4 py-2 rounded-lg text-sm border text-left ${tone === 'Encouraging' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-oxford-200 text-oxford-600 hover:bg-oxford-50'}`}>
                                {tone}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
          </div>

          {/* Workflow Personalization */}
          <div className="bg-white rounded-2xl shadow-sm border border-oxford-100 p-6">
            <h2 className="text-lg font-semibold text-oxford-900 mb-4">Workflow Preferences</h2>
            <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-oxford-700">Enable Audio Generation (Native Audio)</label>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300" />
                 </div>
                 <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-oxford-700">Enable Image Generation (Nano Banana)</label>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300" />
                 </div>
                 <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-oxford-700">Enable Mermaid Diagrams (HTML/Code)</label>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300" />
                 </div>
            </div>
          </div>

          {/* Visual Agent Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-oxford-100 p-6">
            <h2 className="text-lg font-semibold text-oxford-900 mb-4">Visual Director Agent</h2>
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-oxford-700 mb-2">Illustration Style</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-oxford-200 text-sm bg-white text-oxford-900">
                        <option>Minimalist Vector</option>
                        <option>Hand Drawn Sketch</option>
                        <option>3D Realistic</option>
                        <option>Corporate Memphis</option>
                    </select>
                </div>
            </div>
          </div>

          {/* Sophie Configuration */}
           <div className="bg-white rounded-2xl shadow-sm border border-oxford-100 p-6">
            <h2 className="text-lg font-semibold text-oxford-900 mb-4">Sophie (AI Assistant)</h2>
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-oxford-700 mb-2">Personality Profile</label>
                    <div className="space-y-2">
                        {['Helper (Friendly & Patient)', 'Coach (Motivating & Challenging)', 'Manager (Concise & Strict)'].map((p, i) => (
                             <div key={i} className="flex items-center gap-3 p-3 border border-oxford-200 rounded-xl hover:bg-oxford-50 cursor-pointer">
                                <input type="radio" name="sophie" defaultChecked={i===0} className="text-primary-600 focus:ring-primary-500" />
                                <span className="text-sm text-oxford-700">{p}</span>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-6 border-t border-oxford-200">
        {message && <span className="text-green-600 text-sm font-medium animate-in fade-in">{message}</span>}
        <button onClick={handleSave} className="px-8 py-3 bg-oxford-900 text-white rounded-xl font-medium shadow-lg hover:bg-oxford-800 transition-all hover:scale-[1.02]">
            Save Configuration
        </button>
      </div>
    </div>
  );
};
