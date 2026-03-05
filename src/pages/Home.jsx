import React, { useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import ChatList from '../components/ChatList';

const Home = () => {
    const [selectedLead, setSelectedLead] = useState({
        id: 1,
        name: 'João Silva',
        lastMessage: 'Olá, gostaria de saber mais.',
        isAiActive: true,
        time: '10:42'
    });

    return (
        <div className="h-full w-full flex flex-col md:flex-row absolute inset-0 bg-slate-50">
            {/* Sidebar de Chats */}
            <div className="hidden md:block w-80 lg:w-96 shrink-0 border-r border-slate-200 bg-white shadow-sm z-10">
                <ChatList
                    selectedLeadId={selectedLead?.id}
                    onSelectLead={setSelectedLead}
                />
            </div>

            {/* Área Principal do Chat */}
            <div className="flex-1 min-w-0 bg-slate-50 relative">
                <ChatInterface selectedLead={selectedLead} />
            </div>
        </div>
    );
};

export default Home;
