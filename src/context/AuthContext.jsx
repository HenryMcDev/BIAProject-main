import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('bit_session');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    const login = (userData) => {
        localStorage.setItem('bit_session', JSON.stringify(userData));
        setUser(userData);
    };

    const register = async (email, password, fullName, securityKey) => {
        try {
            const n8nRes = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://automacao-n8n.dczbc9.easypanel.host/webhook/chatBIA', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'validate_key', securityKey })
            });
            const validation = await n8nRes.json();
            if (!validation.isValid) throw new Error('Chave de Segurança inválida ou expirada pelo n8n.');

            const response = await fetch('https://automacao-n8n.dczbc9.easypanel.host/webhook/chatBIA', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    acao: 'register',
                    email: email || "",
                    password: password || "",
                    fullName: fullName || ""
                })
            });

            const data = await response.json();

            if (data && data.authenticated === true) {
                const userData = data.user || { email: email || "", fullName: fullName || "" };
                setUser(userData);
                sessionStorage.setItem('@BIT_USER', JSON.stringify(userData));
                localStorage.setItem("userEmail", userData.email);
                return { user: userData };
            } else if (data && data.success === false) {
                throw new Error(data.message || 'Erro ao realizar cadastro.');
            }

            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setUserProfile(null);
        localStorage.removeItem('bit_session');
    };

    const value = {
        user,
        setUser,
        login,
        register,
        logout,
        loading,
        userProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
