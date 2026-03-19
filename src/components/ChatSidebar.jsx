import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import ChatInterface from './ChatInterface';

function ChatSidebar() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactsList, setContactsList] = useState([]);

  // Initial Contacts Fetch
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://automacao-n8n.dczbc9.easypanel.host/webhook/historico-mensagens');

        let contactsArray = [];
        if (Array.isArray(response.data)) {
          const sortedData = [...response.data].sort((a, b) => new Date(b.data_envio || 0) - new Date(a.data_envio || 0));

          const mapped = sortedData
            .filter(item => item && item.telefone_cliente)
            .map(item => ({
              remetente: item.remetente || item.telefone_cliente,
              telefone_cliente: item.telefone_cliente,
              conteudo: item.conteudo || '',
              data_envio: item.data_envio || ''
            }));

          const seen = new Set();
          contactsArray = mapped.filter(c => {
            if (seen.has(c.telefone_cliente)) return false;
            seen.add(c.telefone_cliente);
            return true;
          });
        }
        setContactsList(contactsArray);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError('Erro ao carregar lista de contatos.');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleCarregarTeste = () => {
    const testPhone = '5534999548090';
    setSelectedContact(testPhone);
  };

  // Select first contact by default
  useEffect(() => {
    if (contactsList.length > 0 && !selectedContact) {
      setSelectedContact(contactsList[0].telefone_cliente);
    }
  }, [contactsList, selectedContact]);

  const formatTime = (ts) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
      }).format(new Date(ts));
    } catch {
      return ts;
    }
  };

  return (
    <div className="flex h-full w-full bg-gray-50 text-gray-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 flex flex-col shadow-sm z-10 shrink-0 transition-all duration-300 ${selectedContact ? 'hidden md:flex md:w-80' : 'w-full md:w-80 flex'}`}>
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Contatos
          </h2>
          <button
            onClick={handleCarregarTeste}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md shadow-sm transition-colors font-medium active:scale-95 shrink-0"
            title="Carregar telefone de teste: 5534999548090"
          >
            Carregar Teste
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full">
          {loading ? (
            <div className="p-6 flex flex-col gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse w-full"></div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500 text-sm">
              Erro ao carregar contatos.
            </div>
          ) : contactsList.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              Nenhum contato encontrado.
            </div>
          ) : (
            <ul className="flex flex-col w-full">
              {contactsList.map(contact => (
                <li key={contact.telefone_cliente} className="w-full">
                  <button
                    onClick={() => setSelectedContact(contact.telefone_cliente)}
                    className={`w-full text-left px-3 py-3 transition-colors flex items-center gap-3 border-b border-gray-100
                      ${selectedContact === contact.telefone_cliente ? 'bg-[#f0f2f5]' : 'bg-white hover:bg-[#f5f6f6]'}`}
                  >
                    {/* User Avatar SVG */}
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                      <svg className="w-10 h-10 text-gray-400 mt-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>

                    {/* Name, Time, and Message Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="text-[15px] font-medium text-gray-800 truncate pr-2">
                          {contact.remetente}
                        </p>
                        {contact.data_envio && (
                          <p className="text-[11px] text-gray-500 shrink-0 font-medium">
                            {formatTime(contact.data_envio)}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {contact.conteudo || contact.telefone_cliente}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main Panel */}
      <div className={`flex-1 bg-white relative ${selectedContact ? 'flex flex-col' : 'hidden md:flex md:flex-col'}`}>
        {selectedContact && (
          <button 
              onClick={() => setSelectedContact(null)}
              className="md:hidden absolute top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md text-slate-600 hover:text-slate-800"
          >
              <ArrowLeft size={20} />
          </button>
        )}
        <ChatInterface selectedContact={selectedContact} />
      </div>
    </div>
  );
}

export default ChatSidebar;
