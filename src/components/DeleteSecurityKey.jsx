import React, { useState } from 'react';
import { Trash2, Loader2, CheckCircle2, X } from 'lucide-react';

export default function DeleteSecurityKey({ encryptedKey, onDeleteSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [toastMessage, setToastMessage] = useState('');

  const handleDelete = async () => {
    const userEmail = localStorage.getItem("userEmail");
    
    if (!userEmail) {
      setStatus('error');
      setToastMessage('Erro: Usuário não identificado. Faça login novamente.');
      setTimeout(() => {
        setStatus('idle');
        setToastMessage('');
      }, 3000);
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch('https://automacao-n8n.dczbc9.easypanel.host/webhook/chatBIA', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deletar_key',
          securityKey: encryptedKey,
          email: userEmail,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setStatus('success');
        setToastMessage('Chave deletada com sucesso!');
        setTimeout(() => {
          setIsOpen(false);
          setStatus('idle');
          setToastMessage('');
          if (onDeleteSuccess) {
            onDeleteSuccess();
          }
        }, 2000);
      } else {
        throw new Error('Falha ao deletar chave');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setToastMessage('Erro ao deletar chave. Tente novamente.');
      setTimeout(() => {
        setStatus('idle');
        setToastMessage('');
      }, 3000);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-slate-400 hover:text-red-500 transition-all duration-300 p-2 rounded-full hover:bg-white/5"
        title="Deletar Chave"
      >
        <Trash2 size={18} />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
           {/* Backdrop to close modal on outside click (optional but good practice) */}
          <div className="absolute inset-0" onClick={() => status !== 'loading' && setIsOpen(false)}></div>

          <div 
            className="bg-[#0f172a] rounded-2xl border border-white/10 p-6 w-[90%] max-w-md shadow-2xl transform transition-all duration-300 scale-100 opacity-100 font-montserrat flex flex-col items-center text-center relative z-10"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              Confirmar Exclusão
            </h3>
            
            <p className="text-slate-300 mb-6 text-sm">
              Você tem certeza que quer deletar? Esta ação não pode ser desfeita.
            </p>

            <div className="flex items-center justify-center gap-4 w-full">
              <button
                onClick={() => setIsOpen(false)}
                disabled={status === 'loading'}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50 font-montserrat"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleDelete}
                disabled={status === 'loading' || status === 'success'}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center min-h-[40px] font-montserrat"
              >
                {status === 'loading' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : status === 'success' ? (
                  <CheckCircle2 size={18} />
                ) : (
                  'Deletar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-4 right-4 z-[200] px-4 py-3 rounded-xl shadow-lg font-montserrat text-sm flex items-center gap-2 transition-all duration-300 transform translate-y-0 opacity-100
          ${status === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white border border-red-500/20'}`}
        >
          {status === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
          {toastMessage}
        </div>
      )}
    </>
  );
}
