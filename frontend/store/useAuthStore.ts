import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
    user: any | null;
    token: string | null; // חייבים לשמור את הטוקן בנפרד!
    isAuthenticated: boolean;
    login: (userData: any, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            
            // כשמתחברים, שומרים גם את המשתמש וגם את הטוקן מהשרת
            login: (userData, token) => set({ 
                user: userData, 
                token: token, 
                isAuthenticated: true 
            }),
            
            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                localStorage.removeItem('auth-storage'); // ניקוי יסודי
            },
        }),
        {
            name: 'auth-storage', // שם המפתח ב-LocalStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
);