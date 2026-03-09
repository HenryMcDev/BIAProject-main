import React, { useState } from 'react';
import { Mail, Lock, Bot, ArrowRight, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const auth = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [jobRole, setJobRole] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Verification States
    const [token, setToken] = useState('');
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifyError, setVerifyError] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();
        setVerifyError('');
        setVerifyLoading(true);
        try {
            await auth.verifyToken(auth.pendingEmail, token);
            setSuccessMsg('Verificação concluída com sucesso!');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } catch (err) {
            setVerifyError(err.message || 'Código inválido.');
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            await submitToWebhook("ResendVerification", { "Email": auth?.pendingEmail });
            setSuccessMsg("Novo código enviado com sucesso.");
        } catch (err) {
            setVerifyError("Erro ao reenviar código.");
        }
    };

    const submitToWebhook = async (actionName, payloadData) => {
        const securityKey = crypto.randomUUID();
        const finalPayload = {
            "Ação": actionName,
            "ChaveSeguranca": securityKey,
            ...payloadData
        };

        const response = await fetch('https://automacao-n8n.dczbc9.easypanel.host/webhook-test/chatBIA', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload)
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        return await response.json();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (isForgotPassword) {
                await submitToWebhook("RecuperarSenha", { "Email": email });
                setSuccessMsg("Instruções de recuperação enviadas para o seu e-mail.");
            } else if (isRegistering) {
                await auth.register(email, password, fullName);
                setFullName('');
                setEmail('');
                setPassword('');
                setJobRole('');
                // Note: AuthContext handles needsVerification state
            } else {
                await auth.login(email, password);
                window.location.href = '/';
            }
        } catch (err) {
            if (err.message && err.message.toLowerCase().includes('not confirmed')) {
                // Ignore, as AuthContext handles needsVerification
            } else {
                setError(err.message || 'Ocorreu um erro inesperado.');
            }
        } finally {
            setLoading(false);
        }
    };

    const VerificationModal = () => (
        <div className="fixed inset-0 bg-[#005696]/90 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <h3 className="text-2xl font-bold font-montserrat text-[#005696] mb-2 text-center">Verificação de E-mail</h3>
                <p className="text-slate-600 mb-6 text-center">
                    Enviamos um código de 6 dígitos para o e-mail <strong>{auth.pendingEmail}</strong>.
                    Por favor, insira-o abaixo para continuar.
                </p>

                {verifyError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle size={16} />
                        {verifyError}
                    </div>
                )}
                {successMsg && !verifyError && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm">
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                    <div className="space-y-2">
                        <input
                            type="text"
                            maxLength={6}
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="000000"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005696]/50 focus:border-[#005696] text-center text-2xl tracking-[0.5em] font-mono transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={verifyLoading || token.length !== 6}
                        className="w-full bg-[#FFCC00] text-gray-900 font-bold py-3 rounded-xl hover:bg-[#e6b800] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {verifyLoading ? <Loader2 className="animate-spin" size={20} /> : 'Verificar Código'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-sm font-bold text-[#005696] hover:text-blue-800 transition-colors"
                    >
                        Não recebeu? Reenviar código
                    </button>
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={() => auth.setNeedsVerification(false)}
                            className="text-xs text-slate-500 hover:text-slate-700 underline"
                        >
                            Voltar ao login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            {auth?.needsVerification && <VerificationModal />}
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
                        {successMsg && (
                            <div className="mb-4 p-3 bg-green-900/30 border border-green-500 text-green-400 rounded-lg flex items-center gap-2 text-sm">
                                {successMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {!isForgotPassword && isRegistering && (
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
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bit-blue/50 focus:border-bit-blue transition-all"
                                                required={!isForgotPassword && isRegistering}
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
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bit-blue/50 focus:border-bit-blue transition-all"
                                                required={!isForgotPassword && isRegistering}
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
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bit-blue/50 focus:border-bit-blue transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {!isForgotPassword && (
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
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bit-blue/50 focus:border-bit-blue transition-all"
                                            required={!isForgotPassword}
                                            minLength={6}
                                        />
                                    </div>
                                    {!isRegistering && (
                                        <div className="mt-1 text-right">
                                            <span
                                                onClick={() => {
                                                    setIsForgotPassword(true);
                                                    setError('');
                                                    setSuccessMsg('');
                                                }}
                                                className="text-yellow-500 hover:text-yellow-400 cursor-pointer text-sm font-semibold transition-colors inline-block"
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
                                className="w-full bg-yellow-500 text-gray-900 font-bold py-3 mt-4 rounded-xl hover:bg-yellow-600 transition-colors shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processando...' : (isForgotPassword ? 'Recuperar Senha' : isRegistering ? 'Criar Conta' : 'Entrar')}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm">
                            {isForgotPassword ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsForgotPassword(false);
                                        setError('');
                                        setSuccessMsg('');
                                    }}
                                    className="font-bold text-bit-blue hover:text-blue-700 transition-colors"
                                >
                                    Voltar ao Login
                                </button>
                            ) : (
                                <>
                                    <span className="text-slate-500">
                                        {isRegistering ? 'Já tem uma conta? ' : 'Não tem conta? '}
                                    </span>
                                    <button
                                        type="button"
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
