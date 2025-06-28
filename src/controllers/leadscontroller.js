const { v4: uuidv4 } = require('uuid');
let leads = [];

exports.criarLead = (req, res) => {
  const { nome, email, telefone, etapa, responsavel } = req.body;
  const now = new Date();
  const lead = {
    id: uuidv4(),
    nome, email, telefone,
    etapa: etapa || 'novo',
    responsavel,
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

exports.alterarEtapa = (req, res) => {
  const { id } = req.params;
  const { etapa } = req.body;
  const lead = leads.find(l => l.id === id);
  if (!lead) return res.status(404).json({ erro: 'Lead não encontrado' });

  // Validação para etapa final 'Cliente' (exemplo simplificado)
  if (etapa === 'cliente') {
    if (!lead.nome || !lead.email || !lead.telefone) {
      return res.status(400).json({ erro: 'Dados cadastrais incompletos para fechar negócio' });
    }
    // Poderia ter validações financeiras aqui (valor, vencimento, tipo cobrança)
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
