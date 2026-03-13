import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Shield, Briefcase, Bot, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://automacao-n8n.dczbc9.easypanel.host/webhook/chatBIA';

const AuthScreens = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth(); // Assuming useAuth is used to manage session as in Login.jsx. Let's use it for the navigate("/") to work nicely later.

    const [isFirstLogin, setIsFirstLogin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Shared Fields
    const [email, setEmail] = useState('');

    // Register Fields
    const [fullName, setFullName] = useState('');
    const [cpf, setCpf] = useState('');
    const [role, setRole] = useState('Consultor');
    const [securityKey, setSecurityKey] = useState('');
    const [showSecurityKey, setShowSecurityKey] = useState(false);

    // First Login Fields
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const isFirstLoginValid = password && confirmPassword && password === confirmPassword;

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const payload = { 
                action: "cadastro", 
                fullName, 
                cpf, 
                email, 
                role, 
                securityKey 
            };
            const response = await axios.post(WEBHOOK_URL, payload);

            if (response.data && response.data.status === "liberado") {
                // If register automatically logs the user in, we could set user, but usually it might not.
                // The instructions say "Navigation: If response is status: "liberado", use 'useNavigate' to go to "/"" for FIRST LOGIN.
                // For REGISTER, it doesn't specify navigation. But let's assume setting them to first login or navigating.
                // Let's just set them to first login to setup password, or maybe the prompt assumes something else. 
                // "Navigation: Add a "Primeiro login?..." toggle. Let's just switch to first login on success or navigate if needed.
                setIsFirstLogin(true); 
                setError('');
            } else {
                setError(response.data?.mensagem || response.data?.error || 'Acesso negado ou erro no cadastro.');
            }
        } catch (err) {
            setError(err.response?.data?.mensagem || err.message || 'Erro de comunicação com o servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFirstLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!isFirstLoginValid) {
            setError('As senhas não coincidem.');
            return;
        }

        setIsLoading(true);

        try {
            const payload = { 
                action: "primeiro_login", 
                email, 
                password 
            };
            const response = await axios.post(WEBHOOK_URL, payload);

            if (response.data && (response.data.status === "liberado" || response.data.status?.toLowerCase() === 'sucesso' || !response.data.status)) {
                // Assume setting user info like in Login.jsx just to keep the app working, or just navigating to "/"
                const userData = {
                    nome: response.data.nome || email.split('@')[0],
                    email: email,
                    role: response.data.role || "User"
                };
                localStorage.setItem('nomeUsuario', userData.nome);
                if (setUser) setUser(userData);

                navigate('/');
            } else {
                setError(response.data?.mensagem || response.data?.error || 'Credenciais inválidas.');
            }
        } catch (err) {
            setError(err.response?.data?.mensagem || err.message || 'Erro de comunicação com o servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden">
                <div className="text-center mb-6">
                    <div className="bg-slate-100 p-4 rounded-full inline-block mb-4 shadow-sm">
                        <Bot size={48} className="text-[#005696]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#005696] mb-2">
                        {!isFirstLogin ? 'Cadastro Interno' : 'Primeiro Acesso'}
                    </h2>
                    <p className="text-slate-500 text-sm">
                        {!isFirstLogin 
                            ? 'Preencha os dados corporativos para solicitar acesso.' 
                            : 'Defina sua senha de acesso ao portal BIT.'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-500 rounded-r-lg shadow-sm text-sm font-medium">
                        {error}
                    </div>
                )}

                {!isFirstLogin ? (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Nome Completo</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/40 transition-all text-sm"
                                    placeholder="Seu nome completo"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">CPF</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Shield size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)}
                                    className="w-full px-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/40 transition-all text-sm"
                                    placeholder="000.000.000-00"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Email Corporativo</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/40 transition-all text-sm"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Função</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Briefcase size={18} className="text-slate-400" />
                                </div>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/40 transition-all text-sm appearance-none"
                                >
                                    <option value="Consultor">Consultor</option>
                                    <option value="Analista">Analista</option>
                                    <option value="Gerente">Gerente</option>
                                    <option value="Instrutor">Instrutor</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Chave de Segurança</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type={showSecurityKey ? "text" : "password"}
                                    required
                                    value={securityKey}
                                    onChange={(e) => setSecurityKey(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/40 transition-all text-sm"
                                    placeholder="Chave fornecida pelo RH"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSecurityKey(!showSecurityKey)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showSecurityKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#005696] text-white font-bold py-3 mt-6 rounded-lg hover:bg-opacity-90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading && <Loader2 className="animate-spin" size={20} />}
                            {isLoading ? 'Enviando...' : 'Solicitar Cadastro'}
                        </button>

                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsFirstLogin(true);
                                    setError('');
                                }}
                                className="text-sm font-semibold text-[#005696] hover:underline"
                            >
                                Primeiro login? Ative sua conta
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleFirstLoginSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Email Corporativo</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/40 transition-all text-sm"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Nova Senha</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/40 transition-all text-sm"
                                    placeholder="Mínimo 6 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Confirmar Senha</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/40 transition-all text-sm"
                                    placeholder="Repita sua nova senha"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || (password && confirmPassword && !isFirstLoginValid)}
                            className="w-full bg-[#005696] text-white font-bold py-3 mt-6 rounded-lg hover:bg-opacity-90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading && <Loader2 className="animate-spin" size={20} />}
                            {isLoading ? 'Processando...' : 'Acessar Sistema'}
                        </button>

                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsFirstLogin(false);
                                    setError('');
                                }}
                                className="text-sm font-semibold text-[#005696] hover:underline"
                            >
                                Voltar para Cadastro corporativo
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AuthScreens;
