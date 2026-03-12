import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setUser(null);
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch('https://automacao-n8n.dczbc9.easypanel.host/webhook/chatBIA', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    acao: 'login',
                    email: email || "",
                    password: password || "",
                    fullName: ""
                })
            });

            const data = await response.json();

            if (data && data.authenticated === true) {
                const userData = data.user || { email: email || "" };
                setUser(userData);
                return { user: userData };
            } else {
                throw new Error(data.message || 'Erro ao realizar login.');
            }
        } catch (error) {
            throw error;
        }
    };

    const register = async (email, password, fullName) => {
        try {
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
    };

    const value = {
        user,
        setUser,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
