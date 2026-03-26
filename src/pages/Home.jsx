import React, { useState } from 'react';
import ChatSidebar from '../components/ChatSidebar';
import ChatInterface from '../components/ChatInterface';

const Home = () => {
    const [selectedContact, setSelectedContact] = useState(null);

    return (
        <div className="h-full w-full flex absolute inset-0 bg-slate-50 overflow-hidden font-montserrat">
            <ChatSidebar 
                selectedContact={selectedContact} 
                setSelectedContact={setSelectedContact} 
            />
            <ChatInterface 
                contact={selectedContact} 
            />
        </div>
    );
};

export default Home;
