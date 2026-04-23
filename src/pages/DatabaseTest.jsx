import React, { useEffect, useState } from 'react';

export default function DatabaseTest() {
  const [mensagens, setMensagens] = useState([]);
  const [status, setStatus] = useState('Carregando mensagens da VPS...');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/api/teste-mensagens')
      .then(res => res.json())
      .then(data => {
        if (data.erro) {
          setStatus(`❌ Falha técnica: ${data.erro} - ${data.detalhes}`);
          setHasError(true);
        } else {
          setMensagens(data);
          setStatus('✅ Dados carregados com sucesso! Conexão com a VPS estabelecida.');
          setHasError(false);
        }
      })
      .catch(err => {
        setStatus(`❌ Erro crítico de rede: Não foi possível conectar ao servidor local. Detalhes: ${err.message}`);
        setHasError(true);
      });
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4 text-slate-800">Teste de Conexão VPS</h2>
      
      {/* Exibição visual do status */}
      <div className={`p-4 mb-6 rounded-md font-medium border ${hasError ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
        {status}
      </div>
      
      {!hasError && mensagens.length > 0 && (
        <table className="min-w-full table-auto border-collapse border border-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-100 text-slate-800">
              <th className="border p-3 text-left">ID</th>
              <th className="border p-3 text-left">Remetente</th>
              <th className="border p-3 text-left">Conteúdo</th>
              <th className="border p-3 text-left">Data</th>
            </tr>
          </thead>
          <tbody className="text-slate-600">
            {mensagens.map((msg) => (
              <tr key={msg.id} className="hover:bg-slate-50 transition-colors">
                <td className="border p-3">{msg.id}</td>
                <td className="border p-3 font-medium text-slate-700">
                  {msg.remetente || <span className="text-slate-400 italic">Desconhecido</span>}
                  <div className="text-xs text-slate-500 mt-1">{msg.telefone_cliente}</div>
                </td>
                <td className="border p-3 whitespace-pre-wrap">{msg.conteudo}</td>
                <td className="border p-3 whitespace-nowrap">
                  {new Date(msg.data_envio).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {!hasError && mensagens.length === 0 && status.includes('sucesso') && (
        <div className="text-center p-8 text-slate-500 border border-dashed border-slate-300 rounded-md">
          Nenhuma mensagem encontrada no banco de dados.
        </div>
      )}
    </div>
  );
}
