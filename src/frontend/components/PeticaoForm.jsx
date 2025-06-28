import React, { useState } from 'react';
import axios from 'axios';

const tipos = [
  { value: 'oposicao', label: 'Oposição' },
  { value: 'recurso', label: 'Recurso' },
  { value: 'manifestacao', label: 'Manifestação' },
  { value: 'relatorio', label: 'Relatório Técnico' },
];

export default function PeticaoForm() {
  const [tipoPeticao, setTipoPeticao] = useState(tipos[0].value);
  const [numProcesso, setNumProcesso] = useState('');
  const [dadosProcesso, setDadosProcesso] = useState(null);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);

  const buscarDadosProcesso = async () => {
    if (!numProcesso) return alert('Informe o número do processo');

    // Simulação: aqui você pode integrar com a API de consulta INPI para buscar dados reais
    // Por enquanto usamos dados mockados
    setDadosProcesso({
      numero: numProcesso,
      titular: 'Empresa Exemplo Ltda',
      status: 'Em andamento',
      classesNice: ['35', '42'],
      ultimosDespachos: ['Despacho A', 'Despacho B']
    });
  };

  const gerarPeticao = async () => {
    if (!dadosProcesso) return alert('Busque os dados do processo antes');
    setLoading(true);
    try {
      const res = await axios.post('/peticoes/gerar', { tipoPeticao, dadosProcesso });
      setTexto(res.data.texto);
    } catch (error) {
      alert('Erro ao gerar petição');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Geração de Petição</h2>

      <select
        className="w-full mb-4 p-2 border rounded"
        value={tipoPeticao}
        onChange={e => setTipoPeticao(e.target.value)}
      >
        {tipos.map(t => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Número do Processo INPI"
        className="w-full mb-4 p-2 border rounded"
        value={numProcesso}
        onChange={e => setNumProcesso(e.target.value)}
      />

      <button
        onClick={buscarDadosProcesso}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Buscar dados do processo
      </button>

      {dadosProcesso && (
        <pre className="mb-4 p-2 bg-gray-100 rounded text-sm">{JSON.stringify(dadosProcesso, null, 2)}</pre>
      )}

      <textarea
        rows="12"
        className="w-full mb-4 p-2 border rounded font-mono"
        value={texto}
        onChange={e => setTexto(e.target.value)}
        placeholder="Texto da petição gerada aparecerá aqui..."
      />

      <div className="flex gap-4">
        <button
          onClick={gerarPeticao}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Gerando...' : 'Gerar Petição com IA'}
        </button>
        <button
          onClick={() => alert('Visualização do formato final - implementar')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Visualizar Formato Final
        </button>
        <button
          onClick={() => alert('Download PDF - implementar')}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Baixar PDF
        </button>
      </div>
    </div>
  );
}
