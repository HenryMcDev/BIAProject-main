import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

    // New state for verification
    const [needsVerification, setNeedsVerification] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');

    useEffect(() => {
        // Check active session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        checkSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);

            if (event === 'PASSWORD_RECOVERY') {
                setIsPasswordRecovery(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            // handle "Email not confirmed"
            if (error.message.toLowerCase().includes('email not confirmed') || error.message.toLowerCase().includes('not confirmed')) {
                setNeedsVerification(true);
                setPendingEmail(email);
            }
            throw error;
        }
        return { data, error };
    };

    const register = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            throw error;
        }

        // Supabase returns success. Depending on project settings, email confirmation is required.
        setNeedsVerification(true);
        setPendingEmail(email);

        return { data, error };
    };

    const verifyToken = async (email, token) => {
        const WEBHOOK_URL = 'https://automacao-n8n.dczbc9.easypanel.host/webhook/verify-token'; // placeholder n8n Webhook URL

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, token })
        });

        if (!response.ok) {
            throw new Error('Erro ao verificar o código.');
        }

        const result = await response.json();

        setNeedsVerification(false);
        setPendingEmail('');

        return result;
    };

    const logout = () => {
        return supabase.auth.signOut();
    };

    const value = {
        user,
        login,
        register,
        logout,
        verifyToken,
        loading,
        isPasswordRecovery,
        setIsPasswordRecovery,
        needsVerification,
        setNeedsVerification,
        pendingEmail
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
