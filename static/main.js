document.addEventListener('DOMContentLoaded', () => {
  const etapas = [
    'Primeiro contato',
    'Apresentação comercial',
    'Viabilidade',
    'Proposta',
    'Negociação',
    'Cliente',
    'Follow-up',
    'Negócio perdido'
  ];

  let leadAtualId = null;
  let leadsOriginais = [];
  let leadsFiltrados = [];

  const leadForm = document.getElementById('lead-form');
  const pipelineContainer = document.getElementById('pipeline-container');
  const closeModalBtn = document.getElementById('closeDetalhes');
  const modal = document.getElementById('detalhesModal');
  const nomeSpan = document.getElementById('detalhesNome');
  const emailSpan = document.getElementById('detalhesEmail');
  const novaObservacao = document.getElementById('novaObservacao');
  const salvarObsBtn = document.getElementById('btnSalvarObservacao');
  const templateSelect = document.getElementById('templateSelect');
  const dataAgendada = document.getElementById('dataAgendada');
  const agendarBtn = document.getElementById('btnAgendarAutomacao');
  const agendamentosLista = document.getElementById('agendamentosLista');
  const historicoLista = document.getElementById('historicoLista');
  const observacoesLista = document.getElementById('observacoesLista');
  const interacoesLista = document.getElementById('interacoesLista');

  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const novoLead = {
      nome: document.getElementById('lead-name').value,
      email: document.getElementById('lead-email').value,
      empresa: document.getElementById('lead-company').value,
      valor_negocio: parseFloat(document.getElementById('lead-value').value || 0)
    };
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoLead)
    });
    if (res.ok) {
      leadForm.reset();
      renderPipeline();
    } else {
      alert('Erro ao cadastrar lead');
    }
  });

  closeModalBtn.addEventListener('click', () => modal.style.display = 'none');

  salvarObsBtn.addEventListener('click', async () => {
    const texto = novaObservacao.value;
    if (!texto.trim()) return;
    await fetch(`/api/leads/${leadAtualId}/observacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto })
    });
    novaObservacao.value = '';
    renderPipeline();
  });

  agendarBtn.addEventListener('click', async () => {
    if (!confirm('Deseja agendar esta automação?')) return;
    const template = templateSelect.value;
    const data = dataAgendada.value;
    if (!template || !data) return alert('Preencha todos os campos');
    await fetch(`/api/leads/${leadAtualId}/agendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template, data })
    });
    renderPipeline();
  });

  function formatCurrency(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function renderResumoUsuarios(leads) {
    const container = document.getElementById('resumo-usuarios');
    if (!container) {
      console.warn('⚠️ Não encontrou #resumo-usuarios. Ignorando renderResumoUsuarios.');
      return;
    }

    container.innerHTML = '';
    const usuarios = {};

    leads.forEach(lead => {
      const usuario = lead.usuario || 'Sem usuário';
      if (!usuarios[usuario]) usuarios[usuario] = { total: 0, valor: 0, clientes: 0 };
      usuarios[usuario].total++;
      usuarios[usuario].valor += lead.valor_negocio || 0;
      if (lead.etapa === 'Cliente') usuarios[usuario].clientes++;
    });

    Object.entries(usuarios).forEach(([nome, dados]) => {
      const card = document.createElement('div');
      card.className = 'usuario-card';
      card.innerHTML = `
        <h4>${nome}</h4>
        <p>Leads: ${dados.total}</p>
        <p>Valor Total: ${formatCurrency(dados.valor)}</p>
        <p>Clientes: ${dados.clientes}</p>
      `;
      container.appendChild(card);
    });
  }

  function renderPipeline() {
    fetch('/api/leads')
      .then(res => res.json())
      .then(leads => {
        leadsOriginais = leads;
        const lista = leadsFiltrados.length ? leadsFiltrados : leadsOriginais;
        pipelineContainer.innerHTML = '';
        etapas.forEach(etapa => {
          const coluna = document.createElement('div');
          coluna.className = 'pipeline-column';
          const header = document.createElement('div');
          header.className = 'column-header';
          header.innerHTML = `<span>${etapa}</span><span>${formatCurrency(
            lista.filter(l => l.etapa === etapa).reduce((s, l) => s + (l.valor_negocio || 0), 0)
          )}</span>`;
          coluna.appendChild(header);
          lista.filter(l => l.etapa === etapa).forEach(lead => {
            const card = document.createElement('div');
            card.className = 'lead-card';
            card.innerHTML = `
              <strong>${lead.nome}</strong><br>
              ${lead.email}<br>
              ${lead.empresa || ''}<br>
              <span class="badge">${lead.usuario || 'Sem usuário'}</span>`;
            card.onclick = () => abrirModal(lead);
            coluna.appendChild(card);
          });
          pipelineContainer.appendChild(coluna);
        });

        renderResumoUsuarios(lista);
        atualizarIndicadores(lista);
      });
  }

  function atualizarIndicadores(leads) {
    const total = leads.length;
    const totalValor = leads.reduce((s, l) => s + (l.valor_negocio || 0), 0);
    const inativos = leads.filter(l => {
      const dias = (Date.now() - new Date(l.ultima_interacao).getTime()) / (1000 * 60 * 60 * 24);
      return dias > 10;
    }).length;
    const recentes = leads.filter(l => {
      const dias = (Date.now() - new Date(l.ultima_interacao).getTime()) / (1000 * 60 * 60 * 24);
      return dias <= 3;
    }).length;
    const agendadosHoje = leads.filter(l => {
      const hoje = new Date().toISOString().split('T')[0];
      return (l.agendamentos || []).some(a => a.data === hoje);
    }).length;

    document.getElementById('indicadorTotalLeads').textContent = total;
    document.getElementById('indicadorTotalValor').textContent = formatCurrency(totalValor);
    document.getElementById('indicadorInativos').textContent = inativos;
    document.getElementById('indicadorRecentes').textContent = recentes;
    document.getElementById('indicadorHoje').textContent = agendadosHoje;
  }

  function abrirModal(lead) {
    leadAtualId = lead.id;
    nomeSpan.textContent = lead.nome;
    emailSpan.textContent = lead.email;
    novaObservacao.value = '';
    modal.style.display = 'flex';
  }

  // ✅ Executa após o DOM estar 100% pronto
  setTimeout(() => {
    renderPipeline();
  }, 200);
});
