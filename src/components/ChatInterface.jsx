import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, UserCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://hook.us2.make.com/dummy-webhook-url-replace-me';

const ChatInterface = ({ selectedLead }) => {
    // Note: useAuth might provide the currently logged in human attendant.
    const { user } = useAuth();

    const [messages, setMessages] = useState([
        {
            role: 'client',
            content: 'Olá, gostaria de saber mais.',
            sender_name: selectedLead?.name || 'Cliente'
        },
        {
            role: 'assistant',
            content: 'Olá! Sou BIA, sua assistente virtual. Como posso lhe ajudar a obter os melhores resultados hoje?',
            sender_type: 'bot'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Default to true if the lead is AI active
    const [isAiActive, setIsAiActive] = useState(selectedLead?.isAiActive ?? true);
    const messagesEndRef = useRef(null);

    // Update AI active state if lead changes
    useEffect(() => {
        setIsAiActive(selectedLead?.isAiActive ?? true);
    }, [selectedLead]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const notifyTakeoverWebhook = async (isActive) => {
        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: selectedLead?.id,
                    bot_enabled: isActive,
                    operator: user?.user_metadata?.full_name || 'Usuário BIT',
                    timestamp: new Date().toISOString()
                })
            });
            console.log(`N8N Webhook dispatched. bot_enabled: ${isActive}`);
        } catch (error) {
            console.error('Failed to notify N8N about takeover:', error);
        }
    };

    const toggleAiActive = () => {
        const newState = !isAiActive;
        setIsAiActive(newState);

        notifyTakeoverWebhook(newState);

        if (!newState) {
            setMessages(prev => [...prev, {
                role: 'system',
                content: 'Você assumiu o controle. BIA pausou o atendimento.'
            }]);
        } else {
            setMessages(prev => [...prev, {
                role: 'system',
                content: 'Controle retornado para BIA.'
            }]);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isAiActive) return;

        const userName = user?.user_metadata?.full_name || 'Você';

        const humanMessage = {
            role: 'user',
            content: input,
            sender_type: 'human',
            sender_id: user?.id || 'manual-user',
            sender_name: userName
        };

        const newMessages = [...messages, humanMessage];

        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const payload = { message: input, history: messages };
            const response = await axios.post(import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL || 'YOUR_N8N_WEBHOOK_URL_HERE', payload);
            
            const aiText = response.data.output || response.data.reply || response.data.text || 'Resposta recebida, mas formato não reconhecido.';
            const aiResponse = { role: 'assistant', content: aiText };
            
            setMessages(prev => [...prev, aiResponse]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'system',
                content: err.response?.data?.message || err.message || 'Erro ao processar resposta do servidor.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#efeae2] relative overflow-hidden">

            {/* Header / WhatsApp style */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shadow-sm z-10 shrink-0">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mr-3">
                        <User size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-800 leading-tight">
                            {selectedLead?.name || 'Selecione um contato'}
                        </h2>
                        {isAiActive && (
                            <div className="flex items-center mt-0.5">
                                <Sparkles size={12} className="text-[#FFD700] mr-1" />
                                <span className="text-xs font-semibold text-[#FFD700]">BIA está gerenciando este chat</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Control Toggle */}
                <div className="flex items-center space-x-3">
                    <span className={`text-sm font-semibold ${isAiActive ? 'text-[#FFD700]' : 'text-slate-500'}`}>
                        {isAiActive ? 'BIA Active' : 'Manual Control'}
                    </span>
                    <button
                        onClick={toggleAiActive}
                        className={`flex items-center transition-colors focus:outline-none ${isAiActive ? 'text-[#000d1a]' : 'text-slate-400'}`}
                        title={isAiActive ? "Desativar BIA" : "Ativar BIA"}
                    >
                        {isAiActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#efeae2]">
                {messages.map((msg, index) => {
                    // System messages (Centered)
                    if (msg.role === 'system') {
                        return (
                            <div key={index} className="flex w-full justify-center">
                                <div className="bg-white/90 backdrop-blur-sm text-slate-600 text-xs px-4 py-2 rounded-lg shadow-sm font-medium border border-slate-200 inline-block my-2">
                                    {msg.content}
                                </div>
                            </div>
                        );
                    }

                    // Client overrides as role: 'client' or legacy 'user' without sender_type
                    // They align LEFT
                    const isIncoming = msg.role === 'client' || (msg.role === 'user' && !msg.sender_type);

                    // Outgoing messages (BIA or Human via platform)
                    // They align RIGHT
                    const isOutgoing = !isIncoming;
                    const isHumanSender = msg.sender_type === 'human';

                    return (
                        <div className={`flex w-full ${isIncoming ? 'justify-start' : 'justify-end'}`}>
                            <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isIncoming ? 'items-start' : 'items-end'}`}>
                                {/* Identification Label (BIA or Human user name) */}
                                {isOutgoing && (
                                    <div className="flex justify-end w-full pr-1 mb-1">
                                        {isHumanSender ? (
                                            <span className="text-[11px] font-semibold text-slate-500 flex items-center">
                                                <UserCheck size={12} className="mr-1" /> Enviado por {msg.sender_name}
                                            </span>
                                        ) : (
                                            <span className="text-[11px] font-bold text-[#FFD700] ml-1">BIA ✨</span>
                                        )}
                                    </div>
                                )}
                                {isIncoming && (
                                    <div className="flex justify-start w-full pl-1 mb-1">
                                        <span className="text-[11px] font-semibold text-slate-500">{msg.sender_name || 'Cliente'}</span>
                                    </div>
                                )}

                                <div className={`px-4 py-2.5 shadow-sm text-sm md:text-base leading-relaxed relative ${isIncoming
                                    ? 'bg-slate-200 text-slate-800 rounded-2xl rounded-tl-none border border-slate-300' // Incoming Style (Client)
                                    : 'bg-[#000d1a] text-white rounded-2xl rounded-tr-none border border-[#FFD700]' // Outgoing Style (Human/BIA)
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[#f0f2f5] border-t border-slate-200 relative shrink-0">
                {/* Overlay when BIA is active */}
                {isAiActive && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center border-t border-slate-200">
                        <div className="bg-white border border-[#FFD700] text-[#000d1a] px-5 py-3 rounded-xl shadow-lg flex flex-col items-center">
                            <span className="font-bold mb-1 flex items-center"><Bot className="mr-2 text-[#FFD700]" size={20} /> BIA Ativa</span>
                            <span className="text-sm">Assuma o controle para responder manualmente.</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center bg-white rounded-xl shadow-sm border border-slate-200">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading || isAiActive}
                        placeholder={isAiActive ? "Aguardando BIA..." : "Digite uma mensagem..."}
                        className="w-full bg-transparent text-slate-800 rounded-xl py-3.5 pl-4 pr-14 focus:outline-none transition-all disabled:opacity-60 disabled:bg-slate-50 font-sans"
                    />
                    <button
                        type="submit"
                        disabled={loading || isAiActive || !input.trim()}
                        className="absolute right-2 p-2 bg-[#000d1a] text-[#FFD700] rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;
