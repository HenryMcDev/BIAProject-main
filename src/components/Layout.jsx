import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex overflow-hidden">
            {/* Sidebar (Desktop) */}
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} h-screen overflow-hidden relative`}>

                {/* Mobile Header */}
                <header className="md:hidden bg-[#000d1a] text-white p-4 flex items-center justify-between shadow-md z-20 shrink-0">
                    <span className="font-bold text-lg">BIT System</span>
                    <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-white/10">
                        <Menu size={24} />
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 w-full h-full p-0 overflow-hidden relative">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
