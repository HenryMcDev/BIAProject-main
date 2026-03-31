import React, { useState, useEffect } from 'react';
import DeleteSecurityKey from '../components/DeleteSecurityKey';

const PainelAdmin = () => {
  const [chaves, setChaves] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [funcionarioNome, setFuncionarioNome] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [chaveRecente, setChaveRecente] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const fetchChaves = async () => {
      try {
        const response = await fetch('https://automacao-n8n.dczbc9.easypanel.host/webhook/security-key');
        const data = await response.json();
        setChaves(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao consultar chaves:", error);
      }
    };
    fetchChaves();
  }, []);

  const handleGerarChave = async (e) => {
    e.preventDefault();
    if (!funcionarioNome.trim()) return;

    const novaChavePlana = `BIT-${Math.random().toString(36).substring(2,10).toUpperCase()}`;
    const payload = {
      chave_plana: novaChavePlana,
      funcionario_id: funcionarioNome,
      admin_id: "b74f0449-1efe-11f1-bdd9-02420a000102"
    };

    try {
      await fetch('https://automacao-n8n.dczbc9.easypanel.host/webhook/security-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setChaveRecente(novaChavePlana);
      setMensagemSucesso(`Chave gerada com sucesso para o funcionário: ${funcionarioNome}`);
      setIsModalOpen(false);
      setFuncionarioNome('');
      
      setChaves(prev => [{
        funcionario_destino: payload.funcionario_id,
        chave_gerada: novaChavePlana,
        status: 'valida',
        gerado_por_id: 'Usuário BIT',
        data_geracao: new Date().toLocaleString()
      }, ...prev]);

      setTimeout(() => {
        setMensagemSucesso('');
        setChaveRecente('');
      }, 15000);
    } catch (error) {
      console.error("Erro ao enviar chave:", error);
    }
  };

  return (
    <div className="flex-1 w-full h-full bg-slate-900 overflow-y-auto p-4 md:p-8 font-montserrat">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
        <p className="text-slate-400 mb-8">Gerencie acessos, configurações e chaves de segurança do sistema corporativo.</p>

        {mensagemSucesso && (
          <div className="bg-green-900 border border-green-700 text-white p-4 rounded-lg mb-6 shadow-xl flex flex-col gap-3 transition-all animate-in fade-in slide-in-from-top-4">
            <span className="font-bold text-green-100">{mensagemSucesso}</span>
            {chaveRecente && (
              <div className="flex items-center justify-between bg-gray-900 p-3 rounded-md border border-gray-700">
                <code className="text-yellow-400 font-mono tracking-wider text-lg">{chaveRecente}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(chaveRecente);
                    setCopiado(true);
                    setTimeout(() => setCopiado(false), 2000);
                  }}
                  className={`px-4 py-2 rounded text-sm font-bold transition-all duration-300 ${copiado ? 'bg-green-500 text-white scale-105' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                >
                  {copiado ? 'Copiado! ✓' : 'Copiar Chave'}
                </button>
              </div>
            )}
            <span className="text-xs text-gray-300 italic">Atenção: Copie a chave agora. Ela não será exibida novamente por motivos de segurança.</span>
          </div>
        )}

        <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 mt-6 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Gestão de Chaves de Segurança - Uso Único</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FFCC00] hover:bg-yellow-500 text-slate-900 font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-md"
            >
              <span className="mr-2 text-lg leading-none">+</span> Gerar Nova Chave
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead className="border-b border-gray-700 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4">Funcionário Destinatário</th>
                  <th className="py-3 px-4">Chave Gerada</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Gerado Por</th>
                  <th className="py-3 px-4">Data Geração</th>
                  <th className="py-3 px-4 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {chaves.length > 0 ? (
                  chaves.map((chave, index) => (
                    <tr key={chave.id || index} className="border-b border-gray-700 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-sm text-gray-300">{chave.funcionario_destino}</td>
                      <td className="py-4 px-4 text-sm font-mono text-gray-400">{chave.chave_gerada}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${chave.status === 'valida' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                          {chave.status === 'valida' ? 'Válida' : 'Utilizada'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-300">{chave.gerado_por_id}</td>
                      <td className="py-4 px-4 text-sm text-gray-300">
                        {chave.data_geracao ? new Date(chave.data_geracao).toLocaleString('pt-BR') : '-'}
                      </td>
                      <td className="py-4 px-4 flex justify-end">
                        <DeleteSecurityKey 
                          encryptedKey={chave.id || chave.chave_gerada} 
                          onDeleteSuccess={() => {
                            setChaves(prev => prev.filter(c => (c.id || c.chave_gerada) !== (chave.id || chave.chave_gerada)));
                          }}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500 text-sm">
                      Nenhuma chave registrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl text-white font-bold mb-3 font-montserrat">Nova Chave de Segurança</h3>
            
            <div className="bg-yellow-900/30 border-l-4 border-yellow-500 p-3 mb-4 rounded text-sm">
              <p className="text-yellow-200">
                <strong className="font-bold text-yellow-500">Aviso Importante:</strong> A chave de segurança será exibida <span className="underline font-bold">apenas uma vez</span> após a geração. Certifique-se de copiá-la imediatamente na próxima tela.
              </p>
            </div>

            <form onSubmit={handleGerarChave}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Funcionário Destinatário</label>
                <input
                  type="text"
                  required
                  value={funcionarioNome}
                  onChange={e => setFuncionarioNome(e.target.value)}
                  placeholder="Nome do funcionário"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFCC00]/50"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors font-medium border border-transparent hover:border-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!funcionarioNome.trim()}
                  className="px-6 py-2 rounded-lg bg-[#FFCC00] hover:bg-yellow-500 text-slate-900 font-bold shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Gerar e Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PainelAdmin;
