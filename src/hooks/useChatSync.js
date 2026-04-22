import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { onEvent, offEvent } from '../services/socket';

const WEBHOOK_URL = 'https://automacao-n8n.dczbc9.easypanel.host/webhook/historico-mensagens';

export const useChatSync = (currentPhone) => {
    const [messages, setMessages] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState(null);

    const fetchMessages = useCallback(async () => {
        if (!currentPhone) {
            setMessages([]);
            return;
        }

        try {
            setIsSyncing(true);
            const response = await axios.get(WEBHOOK_URL, {
                params: { phone: currentPhone } 
            });

            const rawData = response.data;
            let finalMessages = [];

            if (Array.isArray(rawData)) {
                const conversationObj = rawData.find(conv => conv.phone === currentPhone || conv.id === currentPhone);
                if (conversationObj && Array.isArray(conversationObj.messages)) {
                    finalMessages = conversationObj.messages;
                } else if (rawData.length > 0 && typeof rawData[0] === 'object' && ('role' in rawData[0] || 'content' in rawData[0])) {
                    finalMessages = rawData.filter(msg => {
                        if (msg.phone && msg.phone !== currentPhone) return false;
                        if (msg.contact_id && msg.contact_id !== currentPhone) return false;
                        return true;
                    });
                } else {
                    finalMessages = rawData;
                }
            } else if (rawData && typeof rawData === 'object') {
                if (Array.isArray(rawData[currentPhone])) {
                    finalMessages = rawData[currentPhone];
                } else if (Array.isArray(rawData.messages)) {
                    finalMessages = rawData.messages.filter(msg => {
                        if (msg.phone && msg.phone !== currentPhone) return false;
                        return true;
                    });
                }
            }

            setMessages(finalMessages);
            setError(null);
        } catch (err) {
            console.error('Real-time sync error [useChatSync]:', err);
            setError('Falha de conexão com o painel para chat.');
        } finally {
            setIsSyncing(false);
        }
    }, [currentPhone]);

    // Busca inicial e registro do socket
    useEffect(() => {
        fetchMessages();

        const handleNewMessage = (payload) => {
            const msgPhone = payload.telefone_cliente || payload.id || payload.phone;
            // Se a msg for para a conversa ativa
            if (msgPhone === currentPhone) {
                setMessages(prev => {
                    // Evita duplicação caso a interface principal tbm tenha inserido via optimistic UI
                    if(payload.id && prev.some(m => m.id === payload.id)) {
                        return prev;
                    }
                    return [...prev, payload];
                });
            }
        };

        if (currentPhone) {
            onEvent('new_message', handleNewMessage);
            onEvent('message_sent', handleNewMessage);
        }

        return () => {
            if (currentPhone) {
                offEvent('new_message', handleNewMessage);
                offEvent('message_sent', handleNewMessage);
            }
        };
    }, [fetchMessages, currentPhone]);

    return {
        messages,
        isSyncing,
        error,
        forceFetch: fetchMessages
    };
};

export default useChatSync;
