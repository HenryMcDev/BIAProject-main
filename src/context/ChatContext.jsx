import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { connectSocket, disconnectSocket, onEvent, offEvent } from '../services/socket';

const ChatContext = createContext();

export const useChat = () => {
    return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
    const [activeContact, setActiveContact] = useState(null); // { name, phone, ... }
    const [messages, setMessages] = useState([]);
    const [contacts, setContacts] = useState([]);

    const fetchMessages = async (phone) => {
        try {
            const response = await axios.get('https://automacao-n8n.dczbc9.easypanel.host/webhook/historico-mensagens', {
                params: { phone }
            });
            if (response.data && Array.isArray(response.data)) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const fetchContacts = async () => {
        try {
            // Using a generic n8n webhook for contacts as it wasn't specified uniquely, or we could fallback
            const response = await axios.get('https://automacao-n8n.dczbc9.easypanel.host/webhook/contatos');
            if (response.data && Array.isArray(response.data)) {
                setContacts(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    // Effect for Socket Initialization
    useEffect(() => {
        let currentSessionData = {};
        try {
            currentSessionData = JSON.parse(localStorage.getItem('bit_session') || '{}');
        } catch(e) {}
        
        const userId = currentSessionData?.user?.id;
        if (!userId) {
             console.warn("User ID not found, socket won't connect properly.");
             return;
        }

        connectSocket(userId);

        const handleNewMessage = (payload) => {
            // Injetar a mensagem se ela for pra conversa atual ou só pra manter state
            setMessages(prev => {
                if (payload.id && prev.some(m => m.id === payload.id)) {
                    return prev;
                }
                return [...prev, payload];
            });
        };

        const handleStatusUpdate = (payload) => {
            // Atualizar status do contato na listagem
            setContacts(prevContacts => prevContacts.map(contact => {
                const isMatch = (contact.id && contact.id === payload.id) || 
                               (contact.telefone_cliente && contact.telefone_cliente === payload.telefone_cliente);
                if (isMatch) {
                    return { ...contact, ...payload.updateData }; // payload.updateData tem as changes (cor, lead)
                }
                return contact;
            }));

            // Se o atual for o que mudou, atualiza ativo também
            setActiveContact(prev => {
                if (!prev) return prev;
                const isMatch = (prev.id && prev.id === payload.id) || 
                               (prev.telefone_cliente && prev.telefone_cliente === payload.telefone_cliente);
                return isMatch ? { ...prev, ...payload.updateData } : prev;
            });
        };

        onEvent('new_message', handleNewMessage);
        onEvent('status_update', handleStatusUpdate);

        return () => {
            offEvent('new_message', handleNewMessage);
            offEvent('status_update', handleStatusUpdate);
            disconnectSocket();
        };
    }, []);

    // Effect for changing active contact
    useEffect(() => {
        if (activeContact?.phone) {
            fetchMessages(activeContact.phone);
        } else {
            setMessages([]);
        }
    }, [activeContact]);

    return (
        <ChatContext.Provider value={{ activeContact, setActiveContact, messages, setMessages, contacts, fetchContacts }}>
            {children}
        </ChatContext.Provider>
    );
};
