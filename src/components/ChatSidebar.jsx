import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Sparkles, UserCheck, ToggleLeft, ToggleRight, Search, MessageSquare, Loader2 } from 'lucide-react';

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://automacao-n8n.dczbc9.easypanel.host/webhook/historico-mensagens';

const ChatInterface = () => {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isManual, setIsManual] = useState(false);
    const [loadingContacts, setLoadingContacts] = useState(false);

    useEffect(() => {
        const fetchContacts = async () => {
            setLoadingContacts(true);
            try {
                const response = await axios.get(WEBHOOK_URL);
                if (response.data && Array.isArray(response.data)) {
                    setContacts(response.data);
                } else if (response.data && response.data.contacts) {
                    setContacts(response.data.contacts);
                }
            } catch (error) {
                console.error("Error fetching contacts", error);
            } finally {
                setLoadingContacts(false);
            }
        };

        fetchContacts();
    }, []);

    return (
        <div className="flex h-full w-full bg-white overflow-hidden">
            {/* LEFT SIDEBAR (Contacts) */}
            <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col z-10 shrink-0">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 shrink-0">
                    <h2 className="text-xl font-bold text-slate-800 font-montserrat tracking-tight">Contatos</h2>
                </div>

                {/* Contacts List */}
                <div className="flex-1 overflow-y-auto space-y-0.5 p-2">
                    {loadingContacts ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <Loader2 className="animate-spin mb-2" size={24} />
                            <span className="text-sm">Carregando contatos...</span>
                        </div>
                    ) : contacts.length > 0 ? (
                        contacts.map((contact, index) => {
                            // Handle possible ID fields returned by webhook
                            const id = contact.id || contact.telefone || contact.phone || index;
                            const name = contact.nome || contact.name || 'Desconhecido';
                            const lastMessage = contact.lastMessage || contact.ultima_mensagem || '';
                            const isActive = selectedContact?.id === id;

                            const normalizedContact = { ...contact, id, name, lastMessage };

                            return (
                                <div
                                    key={id}
                                    onClick={() => setSelectedContact(normalizedContact)}
                                    className={`cursor-pointer transition-colors border-b border-slate-100 p-3 rounded-lg flex flex-col ${
                                        isActive
                                            ? 'bg-slate-100 border-r-4 border-[#FFCC00]'
                                            : 'hover:bg-slate-50 border-r-4 border-transparent'
                                    }`}
                                >
                                    <span className="font-bold text-slate-800 text-sm truncate">{name}</span>
                                    <span className="text-xs text-slate-500 truncate mt-1">
                                        {lastMessage || 'Nova conversa'}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-slate-400 mt-10">
                            <MessageSquare size={32} className="mb-3 opacity-50 text-slate-300" />
                            <span className="text-sm text-center">Nenhuma conversa encontrada</span>
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN AREA (Chat) */}
            <div className="flex-1 flex flex-col bg-white">
                
            </div>
        </div>
    );
};

export default ChatSidebar;
