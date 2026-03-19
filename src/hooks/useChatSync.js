import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const WEBHOOK_URL = 'https://automacao-n8n.dczbc9.easypanel.host/webhook/historico-mensagens';

/**
 * Hook customizado para sincronização em tempo real das mensagens (polling).
 * Atende estritamente à regra fundamental: é uma adição modular e não-destrutiva.
 * 
 * Consumo assíncrono do JSON do n8n, aplicando filtro para separar as conversas
 * e expondo dados atualizados para a interface.
 *
 * @param {string} currentPhone - O telefone da conversa ativa para filtragem.
 * @param {number} pollingIntervalMs - Tempo do polling em milissegundos. Padrão 3000ms.
 * @returns {object} { messages, isSyncing, error, forceFetch }
 */
export const useChatSync = (currentPhone, pollingIntervalMs = 3000) => {
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
                // Passa o telefone por parâmetro para otimização inicial da query caso o webhook suporte
                params: { phone: currentPhone } 
            });

            // "O seu código deve consumir esse JSON, aplicar a lógica de filtro para separar as conversas..."
            // A lógica de filtro abaixo lida de maneira robusta para extrair as mensagens exatas da conversa.
            const rawData = response.data;
            let finalMessages = [];

            if (Array.isArray(rawData)) {
                // Cenário 1: Webhook retorna array aglomerando { phone, messages: [] }
                const conversationObj = rawData.find(conv => conv.phone === currentPhone || conv.id === currentPhone);
                if (conversationObj && Array.isArray(conversationObj.messages)) {
                    finalMessages = conversationObj.messages;
                } 
                // Cenário 2: Webhook retorna flat array das mensagens com chave phone em cada item 
                else if (rawData.length > 0 && typeof rawData[0] === 'object' && ('role' in rawData[0] || 'content' in rawData[0])) {
                    finalMessages = rawData.filter(msg => {
                        // Se a mensagem possuir número de telefone anexado, deve ser compatível.
                        if (msg.phone && msg.phone !== currentPhone) return false;
                        if (msg.contact_id && msg.contact_id !== currentPhone) return false;
                        return true;
                    });
                }
                // Cenário 3: Array direta de mensagens para este exato telefone que o n8n já enviou devidamente filtrado
                else {
                    finalMessages = rawData;
                }
            } else if (rawData && typeof rawData === 'object') {
                // Cenário 4: Objeto dicionário separado por chaves de telefone { "55119...": [msgs] }
                if (Array.isArray(rawData[currentPhone])) {
                    finalMessages = rawData[currentPhone];
                }
                // Cenário 5: Payload de wrapper com objeto principal success e uma subchave "messages"
                else if (Array.isArray(rawData.messages)) {
                    // Filtra de forma defensiva se contiver múltiplos logs
                    finalMessages = rawData.messages.filter(msg => {
                        if (msg.phone && msg.phone !== currentPhone) return false;
                        return true;
                    });
                }
            }

            // Expor dados atualizados
            setMessages(finalMessages);
            setError(null);
        } catch (err) {
            console.error('Real-time sync error [useChatSync]:', err);
            setError('Falha de conexão com o painel para chat.');
        } finally {
            setIsSyncing(false);
        }
    }, [currentPhone]);

    useEffect(() => {
        let intervalId;

        // Requisição imperativa inicial
        fetchMessages();

        // Manter dados quentes em requisição sincrônica periódica (polling)
        if (currentPhone && pollingIntervalMs > 0) {
            intervalId = setInterval(fetchMessages, pollingIntervalMs);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [fetchMessages, pollingIntervalMs, currentPhone]);

    return {
        messages,
        isSyncing,
        error,
        forceFetch: fetchMessages
    };
};

export default useChatSync;
