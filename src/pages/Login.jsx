import React, { useState } from 'react';
import { Mail, Lock, Bot, ArrowRight, User, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [authStep, setAuthStep] = useState('login'); // 'login', 'register', 'recovery'
    const [loading, setLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [jobRole, setJobRole] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        // Form Validation
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            setError('Por favor, insira um e-mail válido.');
            return;
        }

        if (authStep !== 'recovery' && password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (authStep === 'register' && (!fullName || !jobRole)) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                action: authStep,
                email: email,
                password: password,
                ...(authStep === 'register' && { fullName: fullName, jobRole: jobRole })
            };

            const WEBHOOK_URL = 'https://automacao-n8n.dczbc9.easypanel.host/webhook-test/chatBIA';

            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.statusText}`);
            }

            const data = await response.json();

            // Handle Response
            if (data.status === 'liberado') {
                // Store temporary session data if needed
                localStorage.setItem('bit_user_email', email);
                localStorage.setItem('bit_session', 'active');

                setSuccessMsg('Acesso liberado! Redirecionando...');
                setTimeout(() => navigate('/dashboard'), 1000);
            } else if (data.status === 'bloqueado') {
                setError(data.message || 'Acesso bloqueado. Verifique suas credenciais e tente novamente.');
            } else {
                // Handle success cases where status is not explicitly 'liberado'
                if (authStep === 'recovery') {
                    setSuccessMsg('Instruções de recuperação enviadas para o seu e-mail.');
                    setTimeout(() => {
                        setAuthStep('login');
                        setSuccessMsg('');
                    }, 3000);
                } else if (authStep === 'register') {
                    setSuccessMsg('Cadastro realizado com sucesso! Você pode fazer login agora.');
                    setTimeout(() => {
                        setAuthStep('login');
                        setSuccessMsg('');
                    }, 3000);
                } else {
                    // Fallback for login just in case
                    localStorage.setItem('bit_user_email', email);
                    localStorage.setItem('bit_session', 'active');
                    navigate('/dashboard');
                }
            }

        } catch (err) {
            setError(err.message || 'Ocorreu um erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden min-h-[600px]">

                {/* Left Side - Branding */}
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
                            {authStep === 'recovery'
                                ? 'Recuperar Senha'
                                : authStep === 'register'
                                    ? 'Crie sua conta'
                                    : 'Bem-vindo de volta'}
                        </h2>
                        <p className="text-slate-500 mb-8">
                            {authStep === 'recovery'
                                ? 'Digite seu e-mail para receber as instruções'
                                : authStep === 'register'
                                    ? 'Junte-se ao time de marketing da BIT'
                                    : 'Acesso seguro ao portal BIT'}
                        </p>

                        {error && (
                            <div className="mb-4 p-4 bg-[#FFCC00]/10 border-l-4 border-[#FFCC00] text-[#005696] rounded-r-lg shadow-sm flex items-center gap-3 text-sm font-medium">
                                <AlertCircle size={20} className="text-[#FFCC00] shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        {successMsg && (
                            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg shadow-sm flex items-center gap-3 text-sm font-medium">
                                <span>{successMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {authStep === 'register' && (
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
                                                required={authStep === 'register'}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Função</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Bot size={20} className="text-slate-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={jobRole}
                                                onChange={(e) => setJobRole(e.target.value)}
                                                placeholder="Sua Função (ex: Analista)"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/50 focus:border-[#005696] transition-all"
                                                required={authStep === 'register'}
                                            />
                                        </div>
                                    </div>
                                </>
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
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/50 focus:border-[#005696] transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {authStep !== 'recovery' && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-700">Senha</label>
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
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/50 focus:border-[#005696] transition-all"
                                            required={authStep !== 'recovery'}
                                            minLength={6}
                                        />
                                    </div>
                                    {authStep === 'login' && (
                                        <div className="mt-1 text-right">
                                            <span
                                                onClick={() => {
                                                    setAuthStep('recovery');
                                                    setError('');
                                                    setSuccessMsg('');
                                                }}
                                                className="text-[#005696] hover:text-[#005696]/80 cursor-pointer text-sm font-semibold transition-colors inline-block"
                                            >
                                                Esqueci minha senha
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#FFCC00] text-[#005696] font-bold py-3 mt-4 rounded-xl hover:bg-[#FFCC00]/90 transition-colors shadow-lg shadow-[#FFCC00]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading && <Loader2 className="animate-spin" size={20} />}
                                {loading ? 'Processando...' : (authStep === 'recovery' ? 'Recuperar Senha' : authStep === 'register' ? 'Criar Conta' : 'Entrar')}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm">
                            {authStep === 'recovery' ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAuthStep('login');
                                        setError('');
                                        setSuccessMsg('');
                                    }}
                                    className="font-bold text-[#005696] hover:text-blue-800 transition-colors"
                                >
                                    Voltar ao Login
                                </button>
                            ) : (
                                <>
                                    <span className="text-slate-500">
                                        {authStep === 'register' ? 'Já tem uma conta? ' : 'Não tem conta? '}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAuthStep(authStep === 'register' ? 'login' : 'register');
                                            setError('');
                                            setSuccessMsg('');
                                        }}
                                        className="font-bold text-[#005696] hover:text-blue-800 transition-colors"
                                    >
                                        {authStep === 'register' ? 'Fazer Login' : 'Cadastre-se'}
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
