import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
    // חשוב לבדוק שאנחנו בדפדפן (Client Side) לפני שניגשים ל-localStorage
    if (typeof window !== 'undefined') {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
            try {
                const parsed = JSON.parse(authStorage);
                // שליפה בטוחה של הטוקן לפי המבנה של Zustand
                const token = parsed.state?.token || parsed.token; 
                
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (e) {
                console.error("Axios Auth Error:", e);
            }
        }
    }
    return config;
}, (error) => Promise.reject(error));

// פונקציית התחברות
export const loginUser = async (credentials: any) => {
    // בגלל ששינינו בשרת ל-User model, אנחנו מוודאים שיש username (גם אם הוא דאמי)
    const data = {
        ...credentials,
        username: credentials.username || credentials.email // שיהיה ל-Pydantic מה לקרוא
    };
    const response = await api.post('/users/login', data); 
    return response.data;
};

// פונקציית הרשמה
export const registerUser = async (userData: any) => {
    const response = await api.post('/users/signup', userData); 
    return response.data;
};

export default api;