import React, { useState } from 'react';
import { Mail, Lock, Bot, ArrowRight, User, AlertCircle, Loader2, Key, Shield, Briefcase, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth(); // getting setUser from context

    // Using view to toggle 'login', 'register' and 'activate'
    const [view, setView] = useState('login');

    const [loading, setLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [cpf, setCpf] = useState('');
    const [role, setRole] = useState('Consultor');
    const [securityKey, setSecurityKey] = useState('');

    // Message states
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // View toggles for passwords
    const [showSecurityKey, setShowSecurityKey] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://automacao-n8n.dczbc9.easypanel.host/webhook/chatBIA';

        try {
            if (view === 'login') {
                // LOGIN VIEW using Webhook to handle array response and forced navigation
                const payload = { action: "login", email, password };
                const response = await axios.post(WEBHOOK_URL, payload);
                console.log('n8n Response:', response.data);

                if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].status === "liberado") {
                    setUser(response.data[0]); // pass to AuthContext
                    localStorage.setItem('user_session', 'active');
                    localStorage.setItem('nomeUsuario', response.data[0].nome || email.split('@')[0]);
                    setError('');
                    navigate('/dashboard'); // replacing Maps('/dashboard') with useNavigate
                } else if (response.data && response.data.status === "liberado") {
                    // Fallback in case it's not an array
                    setUser(response.data);
                    localStorage.setItem('user_session', 'active');
                    localStorage.setItem('nomeUsuario', response.data.nome || email.split('@')[0]);
                    setError('');
                    navigate('/dashboard');
                } else {
                    const errorMsg = Array.isArray(response.data) ? response.data[0]?.mensagem : response.data?.mensagem;
                    setError(errorMsg || 'Credenciais inválidas.');
                }
            }
            else if (view === 'register') {
                // REGISTER VIEW using Webhook
                const payload = { action: "cadastro", fullName, cpf, email, role, securityKey };
                const response = await axios.post(WEBHOOK_URL, payload);

                if (response.data && response.data.status === "liberado") {
                    setView('activate');
                    setSuccessMsg("Cadastro realizado! Agora defina sua senha.");
                } else {
                    setError(response.data?.mensagem || response.data?.error || 'Acesso negado ou erro no cadastro.');
                }
            }
            else if (view === 'activate') {
                // ACTIVATE VIEW (First Login) using Webhook
                if (password !== confirmPassword) {
                    setError("As senhas não coincidem.");
                    setLoading(false);
                    return;
                }

                const payload = { action: "primeiro_login", email, password };
                const response = await axios.post(WEBHOOK_URL, payload);

                if (response.data && (response.data.status === "liberado" || response.data.status?.toLowerCase() === 'sucesso' || !response.data.status)) {
                    setView('login');
                    setSuccessMsg("Senha ativada! Faça o login.");
                    // Reset passwords for the login view
                    setPassword('');
                    setConfirmPassword('');
                } else {
                    setError(response.data?.mensagem || response.data?.error || 'Credenciais inválidas.');
                }
            }
        } catch (err) {
            setError(err.response?.data?.mensagem || err.message || 'Erro de comunicação com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden min-h-[600px]">

                {/* Left Side - Branding (DO NOT TOUCH) */}
                <div className="w-full md:w-1/2 bg-[#005696] flex flex-col items-center justify-center p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                        </svg>
                    </div>

                    <div className="z-10 bg-white/10 p-6 rounded-3xl backdrop-blur-sm mb-6 border border-white/20 shadow-xl">
                        <Bot size={64} className="text-[#FFCC00]" />
                    </div>

                    <h1 className="text-3xl font-bold font-montserrat mb-2 z-10">BIT System</h1>
                    <p className="text-blue-100 text-center z-10 max-w-xs">
                        Transformando educação e negócios através da tecnologia.
                    </p>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 bg-white flex flex-col justify-center p-8 md:p-12 relative">
                    <div className="max-w-md mx-auto w-full">
                        <h2 className="text-2xl font-bold text-[#005696] font-montserrat mb-2">
                            {view === 'login' ? 'Bem-vindo de volta' : view === 'register' ? 'Cadastro Interno' : 'Primeiro Acesso'}
                        </h2>
                        <p className="text-slate-500 mb-8">
                            {view === 'login' ? 'Acesse o BIT Marketing Studio' : view === 'register' ? 'Registre-se no sistema BIT' : 'Defina sua senha de acesso'}
                        </p>

                        {(error || successMsg) && (
                            <div className={`mb-4 p-4 ${error ? 'bg-[#FFCC00]/10 border-[#FFCC00] text-[#005696]' : 'bg-green-50 border-green-500 text-green-700'} border-l-4 rounded-r-lg shadow-sm flex items-center gap-3 text-sm font-medium`}>
                                {error && <AlertCircle size={20} className="text-[#FFCC00] shrink-0" />}
                                <span>{error || successMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {view === 'register' && (
                                <>
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
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/50 focus:border-[#005696] transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">CPF</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Shield size={20} className="text-slate-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={cpf}
                                                onChange={(e) => setCpf(e.target.value)}
                                                placeholder="000.000.000-00"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/50 focus:border-[#005696] transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

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
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/50 focus:border-[#005696] transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Função</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Briefcase size={20} className="text-slate-400" />
                                            </div>
                                            <select
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/50 focus:border-[#005696] transition-all appearance-none"
                                            >
                                                <option value="Vendedor">Vendedor</option>
                                                <option value="Professor">Professor</option>
                                                <option value="Gerente">Gerente</option>
                                                <option value="Desenvolvedor">Desenvolvedor</option>
                                                <option value="Suporte">Suporte</option>
                                                <option value="Pedagogico">Pedagogico</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Chave de Segurança</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock size={20} className="text-slate-400" />
                                            </div>
                                            <input
                                                type={showSecurityKey ? "text" : "password"}
                                                value={securityKey}
                                                onChange={(e) => setSecurityKey(e.target.value)}
                                                placeholder="Sua Chave Secreta"
                                                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/50 focus:border-[#005696] transition-all"
                                                required
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
                                </>
                            )}

                            {(view === 'login' || view === 'activate') && (
                                <>
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
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/50 focus:border-[#005696] transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            {view === 'activate' ? 'Senha (Nova Senha)' : 'Senha'}
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock size={20} className="text-slate-400" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder={view === 'activate' ? "Nova Senha" : "********"}
                                                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/50 focus:border-[#005696] transition-all"
                                                required
                                                minLength={6}
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
                                </>
                            )}

                            {view === 'activate' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Confirmar Senha</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock size={20} className="text-slate-400" />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="********"
                                            className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/50 focus:border-[#005696] transition-all"
                                            required
                                            minLength={6}
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
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#005696] text-white font-bold py-3 mt-4 rounded-xl hover:bg-[#005696]/90 transition-colors shadow-lg shadow-[#005696]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading && <Loader2 className="animate-spin" size={20} />}
                                {loading ? 'BIA está verificando...' : (view === 'login' ? 'Entrar' : view === 'register' ? 'Cadastrar' : 'Ativar Acesso')}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm flex flex-col gap-3">
                            {view === 'login' ? (
                                <>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setView('activate');
                                                setError('');
                                                setSuccessMsg('');
                                            }}
                                            className="font-bold text-[#005696] hover:text-blue-800 transition-colors"
                                        >
                                            Primeiro acesso? Ative sua conta
                                        </button>
                                    </div>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setView('register');
                                                setError('');
                                                setSuccessMsg('');
                                            }}
                                            className="font-bold text-[#005696] hover:text-blue-800 transition-colors"
                                        >
                                            Precisa de acesso? Cadastre-se
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setView('login');
                                        setError('');
                                        setSuccessMsg('');
                                    }}
                                    className="font-bold text-[#005696] hover:text-blue-800 transition-colors"
                                >
                                    Já possui acesso? Fazer Login
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
