// controllers/leadsController.js
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

let leads = [];

const validarDadosParaFechamento = (lead) => {
  const { nome, cpfCnpj, endereco, email, financeiro } = lead;
  if (!nome || !cpfCnpj || !endereco || !email) return false;
  if (!financeiro || !financeiro.valor || !financeiro.vencimento || !financeiro.tipo) return false;
  return true;
};

exports.criarLead = (req, res) => {
  const { nome, email, telefone, etapa, responsavel, cpfCnpj, endereco, financeiro } = req.body;
  const now = new Date();
  const lead = {
    id: uuidv4(),
    nome,
    email,
    telefone,
    etapa: etapa || 'novo',
    responsavel,
    cpfCnpj,
    endereco,
    financeiro, // { valor, tipo, vencimento }
    criadoEm: now,
    atualizadoEm: now
  };
  leads.push(lead);
  res.status(201).json(lead);
};

exports.listarLeads = (req, res) => {
  const { responsavelId } = req.query;
  if (responsavelId) {
    return res.json(leads.filter(l => l.responsavel?.id === responsavelId));
  }
  res.json(leads);
};

exports.atualizarLead = (req, res) => {
  const { id } = req.params;
  const lead = leads.find(l => l.id === id);
  if (!lead) return res.status(404).json({ erro: 'Lead não encontrado' });
  Object.assign(lead, req.body, { atualizadoEm: new Date() });
  res.json(lead);
};

exports.alterarEtapa = async (req, res) => {
  const { id } = req.params;
  const { etapa } = req.body;
  const lead = leads.find(l => l.id === id);
  if (!lead) return res.status(404).json({ erro: 'Lead não encontrado' });

  if (['negocio_fechado', 'cliente'].includes(etapa.toLowerCase())) {
    if (!validarDadosParaFechamento(lead)) {
      return res.status(400).json({ erro: 'Dados cadastrais e financeiros incompletos para fechamento' });
    }
    try {
      const response = await axios.post('http://localhost:5000/api/financeiro/cobranca', {
        cliente: {
          nome: lead.nome,
          cpfCnpj: lead.cpfCnpj,
          endereco: lead.endereco,
          email: lead.email
        },
        valor: lead.financeiro.valor,
        tipo: lead.financeiro.tipo,
        vencimento: lead.financeiro.vencimento
      });
      console.log('Cobrança gerada:', response.data);
    } catch (error) {
      console.error('Erro financeiro:', error.message);
      return res.status(500).json({ erro: 'Falha na geração da cobrança financeira' });
    }
  }

  lead.etapa = etapa;
  lead.atualizadoEm = new Date();
  res.json(lead);
};

exports.deletarLead = (req, res) => {
  const { id } = req.params;
  leads = leads.filter(l => l.id !== id);
  res.status(204).send();
};

exports.estatisticas = (req, res) => {
  const qtdPorEtapa = {};
  const qtdPorResponsavel = {};
  leads.forEach(l => {
    qtdPorEtapa[l.etapa] = (qtdPorEtapa[l.etapa] || 0) + 1;
    const rNome = l.responsavel?.nome || 'Sem responsável';
    qtdPorResponsavel[rNome] = (qtdPorResponsavel[rNome] || 0) + 1;
  });
  res.json({ qtdPorEtapa, qtdPorResponsavel });
};
