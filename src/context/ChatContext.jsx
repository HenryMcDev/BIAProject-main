import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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

    useEffect(() => {
        let intervalId;
        if (activeContact?.phone) {
            fetchMessages(activeContact.phone);
            intervalId = setInterval(() => {
                fetchMessages(activeContact.phone);
            }, 3000);
        } else {
            setMessages([]);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [activeContact]);

    return (
        <ChatContext.Provider value={{ activeContact, setActiveContact, messages, setMessages, contacts, fetchContacts }}>
            {children}
        </ChatContext.Provider>
    );
};
