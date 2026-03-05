import React, { useState } from 'react';
import { Sparkles, Save, Copy, Loader2, Check, Image as ImageIcon, Plus, X, ChevronDown, Trash2 } from 'lucide-react';
import { sendMessageToOpenRouter, GEMINI_PROMPT_SYSTEM } from '../services/openRouter';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const CreateArt = () => {
    const { user } = useAuth();

    // Estados do Formulário
    const [idea, setIdea] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [style, setStyle] = useState('3D BIT (Padrão)');

    // Estado Multi-Imagens (Array de objetos: { url, file, id })
    const [refImages, setRefImages] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Estados de Processamento
    const [optimizedPrompt, setOptimizedPrompt] = useState('');
    const [loadingPrompt, setLoadingPrompt] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedId, setSavedId] = useState(null);

    // --- 1. UPLOAD MÚLTIPLO ---
    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0 || !user) return;

        // Verifica limite (Máx 3)
        if (refImages.length + files.length > 3) {
            alert("Você pode adicionar no máximo 3 imagens de referência.");
            return;
        }

        setUploading(true);
        const newImages = [];

        try {
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

                // Upload Supabase
                const { error: uploadError } = await supabase.storage
                    .from('ref-images')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                // Get URL
                const { data } = supabase.storage
                    .from('ref-images')
                    .getPublicUrl(fileName);

                newImages.push({
                    id: fileName, // ID único
                    url: data.publicUrl,
                    file: file
                });
            }

            setRefImages(prev => [...prev, ...newImages]);

        } catch (error) {
            console.error('Erro upload:', error);
            alert('Erro ao enviar imagem.');
        } finally {
            setUploading(false);
            // Limpa o input para permitir selecionar o mesmo arquivo se quiser
            e.target.value = null;
        }
    };

    const removeImage = (idToRemove) => {
        setRefImages(prev => prev.filter(img => img.id !== idToRemove));
    };

    // --- 2. GERAÇÃO INTELIGENTE (FUSÃO) ---
    const handleOptimizePrompt = async () => {
        if (!idea.trim() && refImages.length === 0) {
            alert("Adicione uma ideia ou imagens para começar.");
            return;
        }
        setLoadingPrompt(true);
        setSavedId(null);

        try {
            let userMessage = `Ideia Principal: ${idea}\nFormato: ${aspectRatio}\nEstilo: ${style}`;

            // Lógica de Referência
            if (refImages.length > 0) {
                const imageUrls = refImages.map(img => img.url).join(', ');

                if (refImages.length === 1) {
                    userMessage += `\n\n[REFERÊNCIA ÚNICA]: O usuário anexou 1 imagem (${imageUrls}). Use-a como guia visual estrito para a composição.`;
                } else {
                    userMessage += `\n\n[FUSÃO DE IMAGENS]: O usuário anexou ${refImages.length} imagens de referência. \nURLs: [${imageUrls}]. \nINSTRUÇÃO: Crie um prompt que COMBINE/MESCLE os elementos visuais dessas imagens em uma única cena coesa, seguindo a Ideia Principal.`;
                }
            }

            const response = await sendMessageToOpenRouter(
                [{ role: 'user', content: userMessage }],
                GEMINI_PROMPT_SYSTEM
            );

            let cleanText = response.content.replace(/^"|"$/g, '');
            setOptimizedPrompt(cleanText);

        } catch (error) {
            console.error(error);
            alert('Erro ao gerar prompt.');
        } finally {
            setLoadingPrompt(false);
        }
    };

    // --- 3. SALVAR (COM JSON DE IMAGENS) ---
    const handleSavePrompt = async () => {
        if (!optimizedPrompt || !user) return;
        setIsSaving(true);

        try {
            // Prepara lista de URLs para salvar
            const imagesJson = JSON.stringify(refImages.map(img => img.url));

            const { error } = await supabase.from('saved_prompts').insert({
                user_id: user.id,
                title: idea || 'Fusão de Imagens',
                prompt_text: optimizedPrompt,
                aspect_ratio: aspectRatio,
                style: style,
                platform: 'gemini',
                reference_images: imagesJson // Salva na nova coluna
            });

            if (error) throw error;

            setSavedId('saved');
            setTimeout(() => setSavedId(null), 3000);

        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 h-full overflow-y-auto bg-slate-50 min-h-screen font-sans">
            <h1 className="text-3xl font-bold font-montserrat text-bit-blue mb-2 tracking-tight">Gerador de Prompts BIT</h1>
            <p className="text-slate-500 mb-8">Crie comandos profissionais e mescle referências visuais.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start min-h-[600px]">

                {/* --- ESQUERDA: INPUTS --- */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col space-y-6">

                    {/* Área de Thumbnails (Estilo Gemini) */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-700">Imagens de Referência</label>
                            <span className="text-xs text-slate-400">{refImages.length}/3</span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {/* Lista de Imagens */}
                            {refImages.map((img) => (
                                <div key={img.id} className="relative w-20 h-20 group">
                                    <img src={img.url} alt="Ref" className="w-full h-full object-cover rounded-xl border border-slate-200" />
                                    <button
                                        onClick={() => removeImage(img.id)}
                                        className="absolute -top-2 -right-2 bg-white shadow-md rounded-full p-1 text-slate-500 hover:text-red-500 transition-colors border border-slate-100 opacity-0 group-hover:opacity-100"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}

                            {/* Botão Adicionar (+), some se chegar a 3 */}
                            {refImages.length < 3 && (
                                <label className={`w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-bit-blue/50 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {uploading ? (
                                        <Loader2 className="animate-spin text-bit-blue" size={20} />
                                    ) : (
                                        <>
                                            <Plus className="text-slate-400 mb-1" size={24} />
                                            <span className="text-[10px] text-slate-500 font-medium">Add</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Texto Ideia */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Sua Ideia</label>
                        <textarea
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            placeholder="Descreva o que criar... (Ex: Um robô futurista usando os elementos das imagens acima)"
                            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bit-blue/20 resize-none text-sm placeholder:text-slate-400"
                        />
                    </div>

                    {/* Dropdowns */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 relative">
                            <label className="text-sm font-bold text-slate-700">Formato</label>
                            <div className="relative">
                                <select
                                    value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}
                                    className="w-full p-3 pr-10 bg-white border border-slate-200 rounded-xl appearance-none text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-bit-blue/20 cursor-pointer"
                                >
                                    <option value="1:1">1:1 (Quadrado)</option>
                                    <option value="16:9">16:9 (Youtube)</option>
                                    <option value="9:16">9:16 (Stories)</option>
                                    <option value="4:5">4:5 (Feed)</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="space-y-2 relative">
                            <label className="text-sm font-bold text-slate-700">Estilo Visual</label>
                            <div className="relative">
                                <select
                                    value={style} onChange={(e) => setStyle(e.target.value)}
                                    className="w-full p-3 pr-10 bg-white border border-slate-200 rounded-xl appearance-none text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-bit-blue/20 cursor-pointer"
                                >
                                    <option value="3D BIT (Padrão)">3D BIT (Padrão)</option>
                                    <option value="Fotorealista">Fotorealista</option>
                                    <option value="Ilustração Vetorial">Ilustração 2D</option>
                                    <option value="Cinematográfico">Cinematográfico</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleOptimizePrompt}
                        disabled={loadingPrompt || (!idea.trim() && refImages.length === 0)}
                        className="mt-auto flex items-center justify-center gap-2 w-full py-4 bg-bit-yellow text-slate-900 font-bold rounded-xl hover:bg-yellow-400 hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        {loadingPrompt ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                        Gerar Super-Prompt
                    </button>
                </div>

                {/* --- DIREITA: RESULTADO --- */}
                <div className="bg-slate-900 text-white rounded-3xl shadow-2xl p-8 flex flex-col relative overflow-hidden h-full min-h-[600px] border border-slate-800">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Sparkles size={180} /></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-bit-blue/20 rounded-full blur-3xl pointer-events-none"></div>

                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-bit-yellow relative z-10">
                        <Sparkles className="text-bit-yellow" size={24} />
                        Resultado Final
                    </h2>

                    <div className="flex-1 flex flex-col relative z-10">
                        {loadingPrompt ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-pulse opacity-80">
                                <Loader2 size={64} className="animate-spin text-bit-blue" />
                                <div className="text-center"><p className="text-lg font-medium">Analisando imagens...</p></div>
                            </div>
                        ) : optimizedPrompt ? (
                            <div className="flex-1 flex flex-col animate-fade-in">
                                <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-md overflow-y-auto mb-6 custom-scrollbar shadow-inner max-h-[400px]">
                                    <p className="font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap select-all">{optimizedPrompt}</p>
                                </div>
                                <div className="mt-auto flex gap-3">
                                    <button onClick={() => navigator.clipboard.writeText(optimizedPrompt)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group">
                                        <Copy size={18} className="group-hover:text-white text-slate-400 transition-colors" /> Copiar
                                    </button>
                                    <button onClick={handleSavePrompt} disabled={isSaving || savedId === 'saved'}
                                        className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${savedId === 'saved' ? 'bg-green-600 cursor-default' : 'bg-bit-blue hover:bg-blue-600 hover:scale-[1.02] shadow-blue-900/40'}`}>
                                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : savedId === 'saved' ? <Check size={20} /> : <Save size={20} />}
                                        {savedId === 'saved' ? 'Salvo!' : 'Salvar na Biblioteca'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 px-8">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                                    <ImageIcon size={32} className="text-slate-500" />
                                </div>
                                <p className="text-base font-medium text-slate-300">Aguardando Geração</p>
                                <p className="text-sm text-slate-500 mt-2 max-w-xs">Adicione imagens e descreva sua ideia para gerar o prompt.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateArt;
