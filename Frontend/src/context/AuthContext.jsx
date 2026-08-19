import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [user, setUser] = useState(null);

    const api = axios.create({
        baseURL: 'http://localhost:8000/api',
    });

    api.interceptors.request.use(config => {
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    React.useEffect(() => {
        if (token) {
            api.get('/auth/profile/')
                .then(res => setUser(res.data))
                .catch(err => {
                    console.error("Failed to fetch user profile", err);
                    if (err.response && err.response.status === 401) {
                        logout();
                    }
                });
        } else {
            setUser(null);
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login/', { email, password });
            if (response.data.access) {
                setToken(response.data.access);
                localStorage.setItem('token', response.data.access);
                return true;
            }
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    };

    const register = async (name, email, password, password_confirm) => {
        try {
            const response = await api.post('/auth/register/', { name, email, password, password_confirm });
            
            const access = response.data.tokens ? response.data.tokens.access : response.data.access;
            if (access) {
                setToken(access);
                localStorage.setItem('token', access);
                return true;
            }
        } catch (error) {
            console.error("Register failed:", error);
            return false;
        }
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ token, user, setUser, login, register, logout, api }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
