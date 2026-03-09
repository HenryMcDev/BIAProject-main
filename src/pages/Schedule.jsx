import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Instagram, Upload, Wand2, X, Save, Clock, Trash2, CheckCircle, FileImage, AlertCircle } from 'lucide-react';
// import { supabase } from '../services/supabase';
import { sendMessageToOpenRouter } from '../services/openRouter';

const Schedule = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form States
    const [caption, setCaption] = useState('');
    const [hashtags, setHashtags] = useState('');
    const [date, setDate] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Process States
    const [uploading, setUploading] = useState(false);
    const [generatingTags, setGeneratingTags] = useState(false);

    // Proxy URL defined in vite.config.js
    const PROXY_URL = "/n8n-webhook/webhook-test/mkt-project";

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            console.log("Data ready for n8n transfer:", { action: "fetch_posts_schedule" });
            /*
            const { data, error } = await supabase
                .from('scheduled_posts')
                .select('*')
                // Orders by the new standard key 'post_date' if available, or created_at
                .order('created_at', { ascending: false });
            if (error) throw error;
            */
            const data = [];
            setPosts(data || []);
        } catch (error) {
            console.error('Erro ao buscar posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Helper: Convert File to Base64
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const generateHashtags = async () => {
        if (!caption) return alert("Escreva uma legenda primeiro para a IA analisar!");
        setGeneratingTags(true);
        try {
            const prompt = `Atue como um estrategista de Instagram. Analise esta legenda e crie 10 hashtags virais e relevantes em Português do Brasil: "${caption}". Retorne APENAS as hashtags separadas por espaço.`;
            const response = await sendMessageToOpenRouter([{ role: 'user', content: prompt }]);
            setHashtags(prev => prev + (prev ? ' ' : '') + response.content);
        } catch (error) {
            alert("Erro ao gerar hashtags. Verifique sua conexão.");
        } finally {
            setGeneratingTags(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!date || !imageFile) return alert("Por favor, adicione uma imagem e a data do agendamento.");
        setUploading(true);

        try {
            // 1. Prepare Data (Convert Image to Base64)
            const base64Image = await convertFileToBase64(imageFile);

            // --- STRICT DATA CONTRACT ---
            const payload = {
                caption: caption,
                hashtags: hashtags,
                post_date: new Date(date).toISOString(), // Standard ISO Format
                image_content: base64Image,              // Base64 String
                status: 'pending'                        // Fixed Status
            };
            // ----------------------------

            console.log("Payload Contract:", { ...payload, image_content: "BASE64_STRING_HIDDEN_LOG" });

            // 2. Dispatch to n8n (Automation) via Proxy
            const n8nResponse = await fetch(PROXY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!n8nResponse.ok) {
                const errorText = await n8nResponse.text();
                console.warn("Alerta n8n:", errorText);
            } else {
                console.log("Sucesso n8n!");
            }

            // 3. Dispatch to Supabase (Persistence)
            // Note: 'scheduled_posts' table must have columns: caption, hashtags, post_date, image_content, status
            console.log("Data ready for n8n transfer:", payload);
            /*
            const { error: dbError } = await supabase
                .from('scheduled_posts')
                .insert([payload]);

            if (dbError) throw dbError;
            */

            // 4. Feedback & Cleanup
            alert("Post agendado com sucesso! 🚀");
            setShowModal(false);
            resetForm();
            fetchPosts();

        } catch (error) {
            console.error(error);
            alert(`Erro no processo: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setCaption('');
        setHashtags('');
        setDate('');
        setImageFile(null);
        setImagePreview(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-bit-blue font-sans flex items-center gap-2">
                        <Instagram className="text-bit-yellow" /> Agendamentos Instagram
                    </h1>
                    <p className="text-slate-500 mt-1">Gerencie a fila de publicações visuais da BIT.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-bit-yellow text-slate-900 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-yellow-400 transition-all flex items-center gap-2"
                >
                    <Plus size={20} /> Novo Post
                </button>
            </div>

            {/* Posts Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.length === 0 && !loading && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-100 border-dashed">
                        <Instagram size={48} className="mb-4 opacity-20" />
                        <p>Nenhum post na fila. Hora de criar!</p>
                    </div>
                )}

                {posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all flex gap-4 group">
                        <div className="w-24 h-24 bg-slate-50 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center">
                            {/* Display Logic: Supports Base64 (image_content) or fallback */}
                            {post.image_content && post.image_content.startsWith('data:image') ? (
                                <img src={post.image_content} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-300">
                                    <FileImage size={24} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${post.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-bit-yellow/20 text-yellow-800'}`}>
                                        {post.status === 'sent' ? 'Enviado' : 'Na Fila'}
                                    </span>
                                    <Trash2 size={16} className="text-slate-300 hover:text-red-500 cursor-pointer" />
                                </div>
                                <h3 className="font-bold text-slate-800 truncate text-sm" title={post.caption}>{post.caption || 'Sem legenda'}</h3>
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                                {/* Use post_date if available, with safe fallback */}
                                <Clock size={12} /> {post.post_date ? new Date(post.post_date).toLocaleString('pt-BR') : 'Data Pendente'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="bg-bit-blue p-6 flex justify-between items-center sticky top-0 z-10">
                            <h2 className="text-white font-bold text-xl flex items-center gap-2">
                                <Instagram className="text-bit-yellow" /> Criar Novo Post
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

                            {/* Upload Area */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block">1. Imagem do Post</label>
                                <label className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-bit-blue hover:bg-slate-50 transition-all relative overflow-hidden group">
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">Trocar Imagem</div>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="text-slate-400 mb-2 group-hover:text-bit-blue transition-colors" size={32} />
                                            <span className="text-sm text-slate-500 font-medium">Clique para enviar imagem</span>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                            </div>

                            {/* Content */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm font-bold text-slate-700">2. Legenda</label>
                                        <button
                                            type="button"
                                            onClick={generateHashtags}
                                            disabled={generatingTags || !caption}
                                            className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center gap-1.5 transition-colors disabled:opacity-50 font-bold border border-indigo-100"
                                        >
                                            <Wand2 size={12} /> {generatingTags ? 'Criando Mágica...' : 'Gerar Hashtags IA'}
                                        </button>
                                    </div>
                                    <textarea
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        placeholder="Escreva a legenda incrível aqui..."
                                        className="w-full h-24 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-bit-blue/20 focus:border-bit-blue outline-none resize-none text-slate-700"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-slate-700">Hashtags</label>
                                    <input
                                        type="text"
                                        value={hashtags}
                                        onChange={(e) => setHashtags(e.target.value)}
                                        placeholder="#hashtags #serão #geradas #aqui"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-bit-blue font-medium focus:ring-2 focus:ring-bit-blue/20 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">3. Data da Publicação</label>
                                <input
                                    type="datetime-local"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-bit-blue/20 outline-none text-slate-700 font-medium"
                                />
                            </div>

                            {/* Footer */}
                            <div className="pt-4 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full bg-bit-blue text-white font-bold py-4 rounded-xl shadow-lg hover:bg-bit-dark hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Processando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} /> Agendar Publicação
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
                                    <CheckCircle size={10} className="text-green-500" />
                                    Strict Data Contract: JSON + Base64
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedule;
