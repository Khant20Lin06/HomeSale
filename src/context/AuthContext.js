'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();



    useEffect(() => {
        const checkAuth = async () => {
            const token = Cookies.get('token'); // Check cookie instead of localStorage
            const savedUser = localStorage.getItem('user');
            if (token && savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (e) {
                    // JSON parse error, clear everything
                    Cookies.remove('token');
                    localStorage.removeItem('user');
                }
            } else if (token && !savedUser) {
                // Token exists but user data missing (loop condition)
                Cookies.remove('token');
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const { data } = await api.post('/auth/login', { username, password });
            Cookies.set('token', data.token, { expires: 1 }); // Expires in 1 day
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            router.push('/dashboard');
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const logout = () => {
        Cookies.remove('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
