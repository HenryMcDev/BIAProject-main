import React, { useState } from 'react';
import { Mail, Lock, Bot, ArrowRight, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const Login = () => {
    const { login, register } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegistering) {
                const { error } = await register(email, password, fullName);
                if (error) throw error;
            } else {
                const { error } = await login(email, password);
                if (error) throw error;
            }
        } catch (err) {
            setError(err.message === 'Invalid login credentials'
                ? 'Email ou senha incorretos.'
                : err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setMessage('O Gera Z enviou as instruções para o seu e-mail!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden min-h-[600px]">

                {/* Left Side - Branding */}
                <div className="w-full md:w-1/2 bg-bit-blue flex flex-col items-center justify-center p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                        </svg>
                    </div>

                    <div className="z-10 bg-white/10 p-6 rounded-3xl backdrop-blur-sm mb-6 border border-white/20 shadow-xl">
                        <Bot size={64} className="text-white" />
                    </div>

                    <h1 className="text-3xl font-bold font-montserrat mb-2 z-10">BIT System</h1>
                    <p className="text-blue-100 text-center z-10 max-w-xs">
                        Transformando educação e negócios através da tecnologia.
                    </p>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 bg-white flex flex-col justify-center p-8 md:p-12 relative">
                    <div className="max-w-md mx-auto w-full">
                        <h2 className="text-2xl font-bold text-bit-blue font-montserrat mb-2">
                            {isForgotPassword 
                                ? 'Recuperar Senha' 
                                : isRegistering 
                                    ? 'Crie sua conta' 
                                    : 'Bem-vindo de volta'}
                        </h2>
                        <p className="text-slate-500 mb-8">
                            {isForgotPassword
                                ? 'Digite seu e-mail para receber as instruções'
                                : isRegistering
                                    ? 'Junte-se ao time de marketing da BIT'
                                    : 'Acesse o BIT Marketing Studio'}
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm">
                                {message}
                            </div>
                        )}

                        <form onSubmit={isForgotPassword ? handleResetPassword : handleSubmit} className="space-y-4">

                            {!isForgotPassword && isRegistering && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Nome Completo</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User size={20} className="text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Seu Nome"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bit-blue/50 focus:border-bit-blue transition-all"
                                            required={!isForgotPassword && isRegistering}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail size={20} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bit-blue/50 focus:border-bit-blue transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {!isForgotPassword && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-700">Senha</label>
                                        {!isRegistering && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsForgotPassword(true);
                                                    setError('');
                                                    setMessage('');
                                                }}
                                                className="text-xs font-semibold text-bit-blue hover:text-blue-700 transition-colors"
                                            >
                                                Esqueceu a senha?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock size={20} className="text-slate-400" />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="********"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bit-blue/50 focus:border-bit-blue transition-all"
                                            required={!isForgotPassword}
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-bit-blue text-white font-bold py-3 mt-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processando...' : (isForgotPassword ? 'Enviar Instruções' : isRegistering ? 'Criar Conta' : 'Entrar')}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm">
                            {isForgotPassword ? (
                                <button
                                    onClick={() => {
                                        setIsForgotPassword(false);
                                        setError('');
                                        setMessage('');
                                    }}
                                    className="font-bold text-bit-blue hover:text-blue-700 transition-colors"
                                >
                                    Voltar para o Login
                                </button>
                            ) : (
                                <>
                                    <span className="text-slate-500">
                                        {isRegistering ? 'Já tem uma conta? ' : 'Não tem conta? '}
                                    </span>
                                    <button
                                        onClick={() => {
                                            setIsRegistering(!isRegistering);
                                            setError('');
                                        }}
                                        className="font-bold text-bit-blue hover:text-blue-700 transition-colors"
                                    >
                                        {isRegistering ? 'Fazer Login' : 'Cadastre-se'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
