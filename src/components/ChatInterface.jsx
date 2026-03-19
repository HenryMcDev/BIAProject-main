import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const formatTime = (ts) => {
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(ts));
  } catch {
    return ts;
  }
};

const ChatInterface = ({ selectedContact }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef(null);

  const fetchHistory = async () => {
    if (!selectedContact) return;
    try {
      const url = `https://automacao-n8n.dczbc9.easypanel.host/webhook/historico-mensagens?telefone=${selectedContact}`;
      const response = await axios.get(url);

      if (Array.isArray(response.data)) {
        // Normalize payload to match { remetente, conteudo, data_envio }
        const parsed = response.data.map(item => ({
          id: item.id || Math.random().toString(36).substring(7),
          remetente: item.remetente ? String(item.remetente).trim().toLowerCase() : 'user',
          conteudo: item.conteudo || item.mensagem || item.text || '',
          data_envio: item.data_envio || item.timestamp || item.data || new Date().toISOString()
        })).sort((a, b) => new Date(a.data_envio) - new Date(b.data_envio));

        setMessages(parsed);
      }
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    }
  };

  useEffect(() => {
    let interval;

    fetchHistory();

    if (selectedContact) {
      interval = setInterval(fetchHistory, 3000);
    }

    return () => clearInterval(interval);
  }, [selectedContact]);

  const handleSendMessage = async () => {
    const BIA_NUMBER = '553436129728';
    const customerPhone = typeof selectedContact === 'object' ? selectedContact?.phone : selectedContact;

    if (!newMessage.trim() || !customerPhone) return;

    try {
      await axios.post('https://automacao-n8n.dczbc9.easypanel.host/webhook/historico-mensagens', {
        senderPhone: BIA_NUMBER,
        senderName: 'BIA',
        customerPhone: customerPhone,
        message: newMessage.trim()
      });
      setNewMessage('');
      fetchHistory();
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!selectedContact) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
        <p className="font-medium text-lg">Selecione um contato para ver o histórico</p>
      </div>
    );
  }

  // To be responsive, make it full width and flex-1. The parent dictates the layout.
  // Contact name display fix: selectedContact may be an object or string
  const displayContact = typeof selectedContact === 'object' ? (selectedContact.name || selectedContact.phone || 'Contato') : selectedContact;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden h-full w-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white shadow-sm flex items-center justify-between shrink-0 z-10 w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-bit-blue flex items-center justify-center text-white font-bold shadow-sm shrink-0">
            {displayContact.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-slate-800 truncate">{displayContact}</h3>
            <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              Online
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto w-full p-4 md:p-6 space-y-4 relative scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col text-slate-400">
            <div className="bg-white/80 px-4 py-2 rounded-full shadow-sm text-sm font-medium">
              Nenhuma conversa iniciada
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isUser = msg.remetente === 'user';

            return (
              <div
                key={msg.id || i}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 w-full`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] p-3 shadow-sm relative flex flex-col gap-1 break-words
                    ${isUser
                      ? 'bg-bit-blue text-white rounded-2xl rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-none'}`}
                >
                  <p className="text-[14.5px] leading-snug whitespace-pre-wrap px-1">{msg.conteudo}</p>
                  <span
                    className={`text-[10px] text-right self-end -mb-1 ml-4 select-none whitespace-nowrap
                      ${isUser ? 'text-blue-100' : 'text-slate-400'}`}
                  >
                    {formatTime(msg.data_envio)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="bg-slate-100 px-3 md:px-4 py-3 shrink-0 flex items-center gap-2 z-10 w-full border-t border-slate-200">
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-11 flex items-center">
          <input
            type="text"
            placeholder="Digite sua mensagem"
            className="w-full h-full bg-transparent px-4 text-[15px] text-slate-800 outline-none"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="w-11 h-11 rounded-xl bg-bit-blue hover:bg-blue-800 transition-colors flex items-center justify-center shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
