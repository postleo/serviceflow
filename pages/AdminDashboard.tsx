
import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import { AuthToken, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [tokens, setTokens] = useState<AuthToken[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState<UserRole>('staff');

    useEffect(() => {
        loadTokens();
    }, []);

    const loadTokens = () => {
        setTokens(DB.getTokens());
    };

    const handleCreateToken = () => {
        if (!newEmail || !user) return;
        DB.createToken(newEmail, newRole, user.id);
        setNewEmail('');
        loadTokens();
    };

    const handleRevoke = (code: string) => {
        DB.revokeToken(code);
        loadTokens();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-oxford-900">Admin Dashboard</h1>
                <p className="text-oxford-500 text-sm mt-1">Manage user access tokens.</p>
            </div>

            {/* Token Generator */}
            <div className="bg-white rounded-2xl shadow-sm border border-oxford-100 p-6">
                <h2 className="font-semibold text-oxford-900 mb-4">Generate New Access Token</h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <input 
                        className="flex-1 px-4 py-2 border border-oxford-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="User Email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                    />
                    <select 
                        className="px-4 py-2 border border-oxford-200 rounded-lg bg-white"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as UserRole)}
                    >
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button 
                        onClick={handleCreateToken}
                        className="px-6 py-2 bg-oxford-900 text-white rounded-lg font-medium hover:bg-oxford-800"
                    >
                        Generate Token
                    </button>
                </div>
            </div>

            {/* Token List */}
            <div className="bg-white rounded-2xl shadow-sm border border-oxford-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-oxford-50 border-b border-oxford-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-oxford-600">Token Code</th>
                            <th className="px-6 py-4 font-semibold text-oxford-600">Assigned To</th>
                            <th className="px-6 py-4 font-semibold text-oxford-600">Role</th>
                            <th className="px-6 py-4 font-semibold text-oxford-600">Status</th>
                            <th className="px-6 py-4 font-semibold text-oxford-600 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-oxford-100">
                        {tokens.map((t) => (
                            <tr key={t.code}>
                                <td className="px-6 py-4 font-mono font-medium">{t.code}</td>
                                <td className="px-6 py-4 text-oxford-600">{t.assignedToEmail}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-oxford-100 rounded text-xs uppercase font-bold text-oxford-600">{t.role}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                        t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {t.status === 'active' && (
                                        <button 
                                            onClick={() => handleRevoke(t.code)}
                                            className="text-red-600 hover:text-red-800 font-medium text-xs"
                                        >
                                            Revoke
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
