import React from 'react';
import { Home, User, LogOut, Menu, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const { user, logout, userProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: Home, label: 'Home', path: '/', allowedRoles: ['Developer', 'Desenvolvedor', 'Admin', 'Marketing', 'Vendedor', 'Consultor'] },
        { icon: Shield, label: 'Painel Admin', path: '/admin', allowedRoles: ['Developer', 'Desenvolvedor', 'Admin'] }
    ];

    const cargo = userProfile?.cargo || sessionStorage.getItem('usuario_cargo') || 'Vendedor';

    let visibleItems = menuItems;
    if (cargo !== 'Developer') {
        visibleItems = menuItems.filter(item => item.allowedRoles?.includes(cargo));
    }

    return (
        <aside className={`fixed left-0 top-0 h-screen bg-[#000d1a] border-r border-slate-800 text-white flex flex-col justify-between shadow-2xl z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} hidden md:flex`}>

            {/* Brand / Logo & Toggle */}
            <div className={`p-6 flex items-center border-b border-white/10 shrink-0 ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
                {!isCollapsed && (
                    <h1 className="text-xl font-bold font-sans tracking-wide truncate">
                        BIT <span className="text-[#FFD700]">Assistente</span>
                    </h1>
                )}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0"
                    title={isCollapsed ? "Expandir menu" : "Recolher menu"}
                >
                    <Menu size={22} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
                {visibleItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}
                            title={isCollapsed ? item.label : undefined}
                            className={`w-full flex items-center rounded-xl transition-all duration-300 group ${isCollapsed ? 'justify-center p-3' : 'space-x-4 px-4 py-3.5'
                                } ${isActive
                                    ? 'bg-white/10 text-white outline outline-[#FFD700]/30 shadow-sm'
                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon size={22} className={`shrink-0 transition-colors ${isActive ? 'text-[#FFD700]' : 'group-hover:text-[#FFD700]'}`} />
                            {!isCollapsed && (
                                <span className="font-semibold text-[15px] tracking-wide truncate">{item.label}</span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-3 border-t border-white/10 shrink-0">
                <div
                    className={`flex items-center rounded-xl transition-colors group ${isCollapsed ? 'justify-center p-2' : 'space-x-3 p-3 hover:bg-white/5 cursor-pointer'
                        }`}
                >
                    <div className="w-10 h-10 shrink-0 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[#FFD700] overflow-hidden">
                        <User size={18} />
                    </div>

                    {!isCollapsed && (
                        <div className="flex-1 min-w-0 mr-1">
                            <p className="text-sm font-bold text-white leading-tight truncate">
                                {user?.user_metadata?.full_name || 'Usuário BIT'}
                            </p>
                            <p className="text-[11px] text-white/50 truncate font-medium mt-0.5">{user?.email}</p>
                            <p className="text-xs text-[#FFCC00] font-medium mt-0.5">{userProfile?.cargo || 'Aguardando cargo...'}</p>
                        </div>
                    )}

                    {!isCollapsed && (
                        <button onClick={logout} title="Sair" className="p-1.5 shrink-0 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
