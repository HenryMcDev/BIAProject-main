import React, { useState, useEffect } from 'react';
import { CheckCheck, UserCircle, Search, MessageSquarePlus, MoreVertical } from 'lucide-react';

const ChatSidebar = ({ selectedContact, setSelectedContact }) => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const scrollbarHiddenClass = "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600";

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('https://automacao-n8n.dczbc9.easypanel.host/webhook/chatsiderbar');
        if (response.ok) {
          const data = await response.json();
          setContacts(Array.isArray(data) ? data : []);
        } else {
          setContacts([]);
        }
      } catch (error) {
        console.error("Erro ao buscar contatos:", error);
        setContacts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
    const interval = setInterval(fetchContacts, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-80 h-full bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 font-montserrat z-20">
      {/* Sidebar Header */}
      <div className="h-16 p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#001f3f] flex items-center justify-center font-bold text-[#FFCC00] shadow-md border border-[#FFCC00]/20">
            BIT
          </div>
          <h2 className="text-slate-100 font-semibold tracking-wide">Contatos</h2>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <button className="hover:text-slate-200 transition-colors"><MessageSquarePlus className="w-5 h-5" /></button>
          <button className="hover:text-slate-200 transition-colors"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900 shrink-0">
        <div className="bg-slate-800 rounded-lg flex items-center px-3 h-10">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar conversa" 
            className="bg-transparent border-none outline-none w-full ml-3 text-sm text-slate-200 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className={`flex-1 overflow-y-auto ${scrollbarHiddenClass}`}>
        <div className="flex flex-col gap-1 p-2">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="w-8 h-8 rounded-full border-4 border-[#FFCC00] border-t-transparent animate-spin"></div>
            </div>
          ) : contacts && contacts.length > 0 ? (
            contacts.map(contact => {
              const isSelected = selectedContact?.id === contact.id;

              return (
                <div 
                  key={contact.id || Math.random()} 
                  onClick={() => setSelectedContact(contact)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors rounded-lg overflow-hidden ${
                    isSelected 
                      ? 'bg-slate-800 border-l-4 border-[#FFCC00]' 
                      : 'hover:bg-slate-800/80 border-l-4 border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">{contact.remetente ? contact.remetente.charAt(0).toUpperCase() : "C"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{contact.remetente || "Cliente"}</h3>
                    <p className="text-xs text-gray-400 truncate">{contact.conteudo}</p>
                  </div>
                </div>
              );
            })
          ) : (
             <p className="text-center text-slate-500 p-4">Nenhum contato encontrado</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
