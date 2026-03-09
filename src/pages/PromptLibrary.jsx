import React, { useState, useEffect } from 'react';
import { Search, Copy, Check, Share2, Terminal, Maximize2, X, BookOpen, Calendar } from 'lucide-react';
// import { supabase } from '../services/supabase';

const PromptLibrary = () => {
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [selectedPrompt, setSelectedPrompt] = useState(null);

    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        try {
            setLoading(true);
            console.log("Data ready for n8n transfer:", { action: "fetch_prompts" });
            /*
            const { data, error } = await supabase
                .from('saved_prompts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPrompts(data || []);
            */
            setPrompts([]);
        } catch (error) {
            console.error('Erro ao buscar prompts:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleShare = (prompt) => {
        const textToShare = `Prompt BIT: "${prompt.title}"\n\n${prompt.prompt_text}`;
        if (navigator.share) {
            navigator.share({ title: 'Prompt BIT', text: textToShare }).catch(console.error);
        } else {
            navigator.clipboard.writeText(textToShare);
            // Opcional: Adicionar um toast notification aqui
        }
    };

    const filteredPrompts = prompts.filter(prompt =>
        prompt.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.prompt_text?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-8">
            {/* Header e Busca */}
            <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold font-sans text-bit-blue flex items-center gap-2">
                        <BookOpen className="text-bit-yellow" /> Acervo de Prompts
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 ml-10">Biblioteca oficial de inteligência BIT.</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-bit-blue transition-colors" size={18} />
                    <input
                        type="text" placeholder="Buscar prompts..."
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-bit-blue w-64 focus:w-96 transition-all duration-300 shadow-sm"
                    />
                </div>
            </div>

            {/* Grid de Cards */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-bit-blue"></div></div>
                ) : filteredPrompts.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">Nenhum prompt encontrado.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredPrompts.map((prompt) => (
                            <div key={prompt.id} className="group bg-white rounded-xl p-5 shadow-sm hover:shadow-lg border border-slate-100 hover:border-bit-blue/30 transition-all duration-300 flex flex-col h-full relative">
                                {/* Botão Expandir (Overlay no Hover) */}
                                <div onClick={() => setSelectedPrompt(prompt)} className="cursor-pointer grow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1 pr-3 overflow-hidden">
                                            <h3 className="font-bold text-slate-800 truncate" title={prompt.title}>{prompt.title || 'Sem Título'}</h3>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mt-1">
                                                <Calendar size={10} /> {new Date(prompt.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <Maximize2 size={16} className="text-slate-300 group-hover:text-bit-blue transition-colors shrink-0" />
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-100 group-hover:bg-slate-100 transition-colors">
                                        <p className="font-mono text-xs text-slate-600 line-clamp-4 leading-relaxed">{prompt.prompt_text}</p>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-auto">
                                    <button onClick={() => handleCopy(prompt.prompt_text, prompt.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${copiedId === prompt.id ? 'bg-green-50 text-green-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                                        {copiedId === prompt.id ? <Check size={14} /> : <Copy size={14} />} <span>{copiedId === prompt.id ? 'Copiado' : 'Copiar'}</span>
                                    </button>
                                    <button onClick={() => handleShare(prompt)} className="text-slate-400 hover:text-bit-blue p-1.5 rounded-md hover:bg-slate-50"><Share2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- MODAL (LIGHTBOX) CORRIGIDO --- */}
            {selectedPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedPrompt(null)}
                    ></div>

                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all scale-100">
                        {/* Header Modal - Ajuste de Layout (Padding Right + Break Words) */}
                        <div className="flex justify-between items-start p-6 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex-1 pr-12">
                                <h2 className="text-xl font-bold text-bit-blue wrap-break-word leading-tight">{selectedPrompt.title}</h2>
                                <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                                    <Calendar size={12} /> Criado em {new Date(selectedPrompt.created_at).toLocaleDateString()}
                                    {selectedPrompt.aspect_ratio && <span className="bg-white border border-slate-200 px-2 rounded text-[10px] uppercase font-bold text-slate-400">{selectedPrompt.aspect_ratio}</span>}
                                </p>
                            </div>
                            <button onClick={() => setSelectedPrompt(null)} className="absolute right-6 top-6 text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-8 overflow-y-auto bg-slate-50 custom-scrollbar">
                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                <pre className="font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {selectedPrompt.prompt_text}
                                </pre>
                            </div>
                        </div>

                        {/* Footer Modal - Botão com Feedback */}
                        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 items-center">
                            <button onClick={() => handleShare(selectedPrompt)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm border border-slate-200 transition-colors">
                                Compartilhar
                            </button>

                            <button
                                onClick={() => handleCopy(selectedPrompt.prompt_text, selectedPrompt.id)}
                                className={`px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-all duration-200 flex items-center gap-2
                                    ${copiedId === selectedPrompt.id
                                        ? 'bg-green-600 text-white shadow-green-900/20 scale-105'
                                        : 'bg-bit-blue text-white hover:bg-blue-700 shadow-blue-900/10'
                                    }`}
                            >
                                {copiedId === selectedPrompt.id ? (
                                    <> <Check size={18} /> Copiado! </>
                                ) : (
                                    <> <Copy size={18} /> Copiar Prompt Completo </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromptLibrary;
