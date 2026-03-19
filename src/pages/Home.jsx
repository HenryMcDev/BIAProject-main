import React from 'react';
import ChatSidebar from '../components/ChatSidebar';

const Home = () => {
    return (
        <div className="h-full w-full flex absolute inset-0 bg-slate-50 overflow-hidden">
            <ChatSidebar />
        </div>
    );
};

export default Home;
