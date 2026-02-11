
import React, { useState } from 'react';
import { Page } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onNavigate?: (page: Page) => void;
}

export const Auth: React.FC<Props> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email, token);
    setLoading(false);
    
    if (success) {
      onNavigate?.(Page.HOME);
    } else {
      setError('Invalid email or access token.');
    }
  };

  // Preset demo credentials helper
  const fillDemo = () => {
      setEmail('admin');
      setToken('MASTER-KEY-123');
  };

  return (
    <div className="min-h-screen bg-oxford-900 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        <div className="md:w-1/2 bg-oxford-900 p-10 flex flex-col justify-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
             <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 mb-8" />
             <h2 className="text-3xl font-bold mb-4">Train your team,<br/>faster than ever.</h2>
             <p className="text-oxford-300 text-sm leading-relaxed mb-8">
               Turn your service know-how into professional cards, diagrams, audio, and video in minutes using Gemini AI.
             </p>
          </div>
        </div>

        <div className="md:w-1/2 p-10 flex flex-col justify-center bg-white">
          <h3 className="text-xl font-bold text-oxford-900 mb-6">Log in with Access Token</h3>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-oxford-500 mb-1">Work Email / Username</label>
              <input 
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-oxford-200 text-sm bg-white text-oxford-900 placeholder-oxford-400 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="admin"
              />
            </div>
            
            <div>
               <label htmlFor="token" className="block text-xs font-medium text-oxford-500 mb-1">Access Token</label>
               <input 
                id="token"
                name="token"
                type="password"
                autoComplete="current-password"
                value={token}
                onChange={e => setToken(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-oxford-200 text-sm bg-white text-oxford-900 placeholder-oxford-400 focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
                placeholder="••••••••"
              />
            </div>

            {error && <div className="text-red-500 text-xs font-medium">{error}</div>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </button>
            
            <div className="text-center mt-4">
                <button type="button" onClick={fillDemo} className="text-xs text-primary-600 hover:underline">Use Demo Credentials</button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
