import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Check, CheckCheck, MoreVertical, Paperclip, Phone, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { connectSocket, disconnectSocket, onEvent, offEvent, getSocket } from '../services/socket';

const formatTime = (ts) => {
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(ts));
  } catch {
    return ts;
  }
};

const ChatInterface = ({ contact }) => {
  const { session } = useAuth();
  const selectedContact = contact;
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const selectedContactRef = useRef(contact);

  useEffect(() => {
    selectedContactRef.current = contact;
  }, [contact]);

  useEffect(() => {
    let currentSessionData = {};
    try {
        currentSessionData = JSON.parse(localStorage.getItem('bit_session') || '{}');
    } catch(e) {}
    
    // Prioritize context session, fallback to localStorage
    const userId = session?.user?.id || currentSessionData?.user?.id;
    if (!userId) return;

    connectSocket(userId);

    const handleNewMessage = (payload) => {
      const activeContact = selectedContactRef.current;
      const activeChatId = activeContact?.telefone_cliente || activeContact?.telefone || activeContact?.phone || activeContact?.id;
      const payloadChatId = payload.chatId || payload.telefone_cliente || payload.id;

      if (payloadChatId === activeChatId) {
        setChatMessages(prev => {
          if (payload.id && prev.some(m => m.id === payload.id)) {
            return prev;
          }
          return [...prev, payload];
        });
      }
    };

    onEvent('new_message', handleNewMessage);
    onEvent('message_sent', handleNewMessage); // Confirmations

    return () => {
      offEvent('new_message', handleNewMessage);
      offEvent('message_sent', handleNewMessage);
      // Let Context handle socket disconnect if they are shared, or keep it if independent 
      // but typical pattern is single instance so disconnectSocket might kill Context socket if unmounted.
      // We'll keep it as the user had it.
      disconnectSocket();
    };
  }, [session]);

  useEffect(() => {
    if (!selectedContact) {
      setChatMessages([]);
      return;
    }

    setChatMessages([]);

    const fetchHistory = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const response = await fetch(`https://automacao-n8n.dczbc9.easypanel.host/webhook/chatinterface?id=${selectedContact.telefone_cliente || selectedContact.telefone || selectedContact.id}`);
        if (response.ok) {
          const data = await response.json();
          setChatMessages(Array.isArray(data) ? data : []);
        } else {
          setChatMessages([]);
        }
      } catch (error) {
        console.error("Erro na requisição (historico):", error);
        setChatMessages([]);
      }
    };

    fetchHistory();
    // Remover o setInterval que causava o polling contínuo
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    const textoDigitado = newMessage;
    const customerPhone = selectedContact?.telefone_cliente || selectedContact?.phone || selectedContact?.id;

    if (!textoDigitado.trim() || !customerPhone) return;

    // Fetch localized data for nested logic verification
    let currentSessionData = {};
    try {
        currentSessionData = JSON.parse(localStorage.getItem('bit_session') || '{}');
    } catch(e) {}
    const currentUser = currentSessionData.user || {};

    const novaMensagemTemp = {
      id: Date.now(),
      telefone_cliente: customerPhone,
      remetente: currentUser.fullName || currentUser.nome || "BIA",
      conteudo: textoDigitado.trim(),
      data_envio: new Date().toISOString(),
      usuario_id: currentUser.id || "unknown"
    };

    // Optimistic Update: Update UI first
    setChatMessages(prev => [...prev, novaMensagemTemp]);
    setNewMessage('');

    try {
      const payload = {
        ...novaMensagemTemp,
        message: textoDigitado.trim(),
        history: chatMessages,
        idUsuarioLogado: currentUser.id || 'N/A',
        setorUsuario: currentUser.unidade || currentUser.department || 'N/A',
        user_context: currentUser
      };

      // Disparar envio via Socket ao invés de fetch REST
      const socket = getSocket();
      if (socket) {
        socket.emit('send_response', payload);
      } else {
        console.error("Socket not connected, cannot send message.");
      }
    } catch (error) {
      console.error("Erro ao enviar a mensagem pelo socket:", error);
    }
  };

  const scrollbarHiddenClass = "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600";

  if (!selectedContact) {
    return <div className="flex-1 bg-[#0b141a] flex items-center justify-center text-slate-500 font-montserrat">Select a contact to start chatting</div>;
  }

  return (
    <div className="flex flex-col h-full w-full relative bg-[#0b141a] font-montserrat">
      {/* Chat Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" style={{ backgroundImage: 'url("https://static.whatsapp.net/rsrc.php/v3/yl/r/r_QZ352iI4R.png")' }}></div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#0b141a] sticky top-0 shrink-0 z-20 w-full shadow-sm">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-bold">{selectedContact.remetente ? selectedContact.remetente.charAt(0).toUpperCase() : "C"}</span>
          </div>
          <div>
            <h2 className="text-white font-semibold flex items-center gap-2">
              {selectedContact.remetente || "Cliente"}
              <span className="w-2 h-2 rounded-full bg-bit-yellow animate-pulse" title="Live Connection" />
            </h2>
            <p className="text-xs text-gray-400">online</p>
          </div>
        </div>
        <div className="flex items-center gap-5 text-slate-400">
          <button className="hover:text-slate-200 transition-colors"><Video className="w-5 h-5" /></button>
          <button className="hover:text-slate-200 transition-colors"><Phone className="w-5 h-5" /></button>
          <button className="hover:text-slate-200 transition-colors ml-2"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto w-full p-4 md:p-6 space-y-4 relative scroll-smooth z-10 ${scrollbarHiddenClass}`}>
        <div className="flex justify-center mb-6">
          <div className="bg-slate-800/80 text-slate-300 text-xs px-3 py-1.5 rounded-lg shadow-sm">
            As mensagens são protegidas. Design inspirado no WhatsApp.
          </div>
        </div>

        {chatMessages && chatMessages.length > 0 ? (
          chatMessages.map((message) => (
            <div
              key={message.id || Math.random()}
              className={`flex w-full ${message.usuario_id === null ? 'justify-start' : 'justify-end'} mb-2`}
            >
              <div
                className={`${message.usuario_id === null
                  ? 'bg-slate-800 text-white rounded-2xl rounded-tl-none'
                  : 'bg-[#FFCC00] text-slate-900 rounded-2xl rounded-tr-none font-medium'
                  } p-3 max-w-[80%] relative group shadow-md`}
              >
                <div className="flex flex-col">
                  <p className="text-[15px] leading-snug whitespace-pre-wrap pb-1.5">{message.conteudo}</p>
                  <div className={`text-[10px] text-right mt-1 select-none flex items-center justify-end gap-1 ${message.usuario_id === null ? 'text-slate-400' : 'text-slate-700'}`}>
                    <span>{formatTime(message.data_envio)}</span>
                    {message.usuario_id !== null ? <CheckCheck className="w-[14px] h-[14px]" /> : <Check className="w-[14px] h-[14px]" />}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-500">Iniciando conversa...</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-slate-900 px-4 py-3 shrink-0 flex items-center gap-3 z-10 w-full border-t border-slate-800">
        <button className="text-slate-400 hover:text-slate-200 p-2 transition-colors">
          <Paperclip className="w-5 h-5" />
        </button>
        <div className="flex-1 bg-slate-800 rounded-xl overflow-hidden h-12 flex items-center px-4 border border-slate-700 focus-within:border-[#005696] transition-colors">
          <input
            type="text"
            placeholder="Digite sua mensagem"
            className="w-full h-full bg-transparent text-[15px] text-slate-200 outline-none placeholder-slate-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="w-12 h-12 rounded-full bg-[#005696] hover:bg-blue-800 transition-colors flex items-center justify-center shadow-md shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
