import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setUser(null);
        setLoading(false);
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    // Nova chamada remota apontando para a sua VPS n8n
                    const res = await fetch('https://automacao-n8n.dczbc9.easypanel.host/webhook/autorizacao', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: user.email, acao: 'get_profile' })
                    });
                    const data = await res.json();
                    
                    // Validação da chave de sucesso do payload
                    if (data && (data.sucesso || data.authenticated)) {
                        // Guarda informações na sessão e libera o perfil para o resto do App
                        sessionStorage.setItem('usuario_cargo', data.cargo || 'admin');
                        sessionStorage.setItem('usuario_id', data.user_id || '1');
                        setUserProfile(data);
                    } else {
                        // Em caso de falha na autorização, limpa o acesso
                        sessionStorage.removeItem('usuario_cargo');
                        sessionStorage.removeItem('usuario_id');
                        setUserProfile(null);
                        console.warn("Acesso não autorizado pelo n8n:", data);
                    }
                } catch (error) {
                    console.error('Erro ao buscar perfil remoto no n8n:', error);
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
            }
        };
        fetchProfile();
    }, [user]);

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
        loading,
        userProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
