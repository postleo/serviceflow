
import { User, AuthToken, TrainingPack, HistoryEntry, UserRole, TrainingItem, ChatSession } from "../types";

// --- SEED DATA ---
const SEED_ADMIN: User = {
    id: 'admin-1',
    username: 'System Admin',
    email: 'admin',
    role: 'admin',
    token: 'MASTER-KEY-123'
};

const SEED_TOKENS: AuthToken[] = [
    { code: 'MASTER-KEY-123', assignedToEmail: 'admin', createdBy: 'system', status: 'active', role: 'admin' },
    { code: 'MANAGER-KEY-001', assignedToEmail: 'alex@maison.com', createdBy: 'admin-1', status: 'active', role: 'manager' }
];

// --- DB SERVICE ---
export const DB = {
    // --- AUTH & USERS ---
    init: () => {
        if (!localStorage.getItem('sf_tokens')) {
            localStorage.setItem('sf_tokens', JSON.stringify(SEED_TOKENS));
        }
        if (!localStorage.getItem('sf_users')) {
            localStorage.setItem('sf_users', JSON.stringify([SEED_ADMIN]));
        }
    },

    login: (email: string, token: string): User | null => {
        const tokens = JSON.parse(localStorage.getItem('sf_tokens') || '[]') as AuthToken[];
        const validToken = tokens.find(t => t.code === token && t.assignedToEmail === email && t.status === 'active');

        if (!validToken) return null;

        const users = JSON.parse(localStorage.getItem('sf_users') || '[]') as User[];
        let user = users.find(u => u.email === email);

        if (!user) {
            user = {
                id: Date.now().toString(),
                username: email.split('@')[0],
                email: email,
                role: validToken.role,
                token: token
            };
            users.push(user);
            localStorage.setItem('sf_users', JSON.stringify(users));
        }

        return user;
    },

    updateUser: (id: string, updates: Partial<User>): User | null => {
        const users = JSON.parse(localStorage.getItem('sf_users') || '[]') as User[];
        const idx = users.findIndex(u => u.id === id);
        if (idx === -1) return null;

        users[idx] = { ...users[idx], ...updates };
        localStorage.setItem('sf_users', JSON.stringify(users));
        return users[idx];
    },

    // --- TOKENS (ADMIN) ---
    getTokens: (): AuthToken[] => {
        return JSON.parse(localStorage.getItem('sf_tokens') || '[]');
    },

    createToken: (email: string, role: UserRole, creatorId: string): AuthToken => {
        const tokens = DB.getTokens();
        const newToken: AuthToken = {
            code: Math.random().toString(36).substring(2, 10).toUpperCase(),
            assignedToEmail: email,
            createdBy: creatorId,
            status: 'active',
            role
        };
        tokens.push(newToken);
        localStorage.setItem('sf_tokens', JSON.stringify(tokens));
        return newToken;
    },

    revokeToken: (code: string) => {
        const tokens = DB.getTokens();
        const idx = tokens.findIndex(t => t.code === code);
        if (idx !== -1) {
            tokens[idx].status = 'revoked';
            localStorage.setItem('sf_tokens', JSON.stringify(tokens));
        }
    },

    // --- PACKS & PROJECTS ---
    getPacks: (userId: string): TrainingPack[] => {
        const packs = JSON.parse(localStorage.getItem('sf_packs') || '[]') as TrainingPack[];
        return packs.filter(p => p.userId === userId || p.userId === 'admin-1'); 
    },

    getPackById: (packId: string): TrainingPack | undefined => {
        const packs = JSON.parse(localStorage.getItem('sf_packs') || '[]') as TrainingPack[];
        return packs.find(p => p.id === packId);
    },

    createPack: (userId: string, title: string, subtitle: string, initialItems: any[] = []): TrainingPack => {
        const packs = JSON.parse(localStorage.getItem('sf_packs') || '[]') as TrainingPack[];
        const newPack: TrainingPack = {
            id: Date.now().toString(),
            userId,
            title,
            subtitle,
            progress: 0,
            status: 'active',
            items: initialItems.map((item, idx) => ({
                id: `item-${Date.now()}-${idx}`,
                title: item.title,
                type: item.type || 'Service Sequence Cards',
                status: 'draft',
                lastUpdated: new Date().toISOString()
            }))
        };
        packs.push(newPack);
        localStorage.setItem('sf_packs', JSON.stringify(packs));
        return newPack;
    },

    // --- FILE MANAGEMENT (Pack Items) ---
    deletePackItem: (packId: string, itemId: string) => {
        const packs = JSON.parse(localStorage.getItem('sf_packs') || '[]') as TrainingPack[];
        const packIndex = packs.findIndex(p => p.id === packId);
        if (packIndex === -1) return;

        packs[packIndex].items = packs[packIndex].items.filter(i => i.id !== itemId);
        localStorage.setItem('sf_packs', JSON.stringify(packs));
    },

    duplicatePackItem: (packId: string, itemId: string) => {
        const packs = JSON.parse(localStorage.getItem('sf_packs') || '[]') as TrainingPack[];
        const packIndex = packs.findIndex(p => p.id === packId);
        if (packIndex === -1) return;

        const item = packs[packIndex].items.find(i => i.id === itemId);
        if (!item) return;

        const newItem: TrainingItem = {
            ...item,
            id: `item-${Date.now()}`,
            title: `${item.title} (Copy)`,
            lastUpdated: new Date().toISOString()
        };
        
        packs[packIndex].items.push(newItem);
        localStorage.setItem('sf_packs', JSON.stringify(packs));
    },

    // --- ASSETS / HISTORY ---
    getAssets: (userId: string): HistoryEntry[] => {
        const history = JSON.parse(localStorage.getItem('sf_history') || '[]') as HistoryEntry[];
        return history.filter(h => h.userId === userId);
    },

    saveAsset: (userId: string, asset: Omit<HistoryEntry, 'id' | 'userId'>) => {
        const history = JSON.parse(localStorage.getItem('sf_history') || '[]') as HistoryEntry[];
        const newEntry: HistoryEntry = {
            ...asset,
            id: Date.now().toString(),
            userId
        };
        localStorage.setItem('sf_history', JSON.stringify([newEntry, ...history]));
        return newEntry;
    },

    // --- CHAT SESSIONS (SOPHIE) ---
    getChatSessions: (): ChatSession[] => {
        return JSON.parse(localStorage.getItem('sf_chat_sessions') || '[]').sort((a: ChatSession, b: ChatSession) => b.lastActive - a.lastActive);
    },

    getChatSession: (id: string): ChatSession | undefined => {
        const sessions = DB.getChatSessions();
        return sessions.find(s => s.id === id);
    },

    saveChatSession: (session: ChatSession) => {
        let sessions = DB.getChatSessions();
        const idx = sessions.findIndex(s => s.id === session.id);
        if (idx !== -1) {
            sessions[idx] = session;
        } else {
            sessions.push(session);
        }
        localStorage.setItem('sf_chat_sessions', JSON.stringify(sessions));
    },

    deleteChatSession: (id: string) => {
        const sessions = DB.getChatSessions().filter(s => s.id !== id);
        localStorage.setItem('sf_chat_sessions', JSON.stringify(sessions));
    }
};

DB.init();
