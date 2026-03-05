import React from 'react';
import { Sparkles, User } from 'lucide-react';

const mockLeads = [
    { id: 1, name: 'João Silva', lastMessage: 'Olá, gostaria de saber mais.', isAiActive: true, time: '10:42' },
    { id: 2, name: 'Maria Santos', lastMessage: 'Qual o valor do plano?', isAiActive: false, time: '09:15' },
    { id: 3, name: 'Carlos Ferreira', lastMessage: 'Obrigado!', isAiActive: true, time: 'Ontem' },
];

const ChatList = ({ selectedLeadId, onSelectLead }) => {
    return (
        <div className="w-full h-full bg-white flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center">
                <h2 className="text-lg font-bold font-sans text-slate-800">Conversas Ativas</h2>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {mockLeads.map((lead) => (
                    <div
                        key={lead.id}
                        onClick={() => onSelectLead(lead)}
                        className={`flex items-center p-4 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50 ${selectedLeadId === lead.id ? 'bg-indigo-50' : ''}`}
                    >
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mr-4 flex-shrink-0">
                            <User size={24} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="text-sm font-semibold text-slate-800 truncate pr-2">{lead.name}</h3>
                                <span className="text-xs text-slate-400 flex-shrink-0">{lead.time}</span>
                            </div>
                            <div className="flex items-center text-sm text-slate-500">
                                {lead.isAiActive && (
                                    <span title="BIA está gerenciando este chat">
                                        <Sparkles size={14} className="text-bit-yellow mr-1 flex-shrink-0" />
                                    </span>
                                )}
                                <p className="truncate">{lead.lastMessage}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatList;
