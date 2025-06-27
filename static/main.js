document.addEventListener('DOMContentLoaded', () => {
  const pipelineContainer = document.getElementById('pipeline-container');
  const leadForm = document.getElementById('lead-form');
  const executarAutomacoesBtn = document.getElementById('executarAutomacoesBtn');
  const btnExportarCSV = document.getElementById('btnExportarCSV');

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

  const modal = document.getElementById('detalhesModal');
  const closeModalBtn = document.getElementById('closeDetalhes');
  const nomeSpan = document.getElementById('detalhesNome');
  const emailSpan = document.getElementById('detalhesEmail');
  const observacoesLista = document.getElementById('observacoesLista');
  const interacoesLista = document.getElementById('interacoesLista');
  const novaObservacao = document.getElementById('novaObservacao');
  const salvarObsBtn = document.getElementById('btnSalvarObservacao');
  const templateSelect = document.getElementById('templateSelect');
  const dataAgendada = document.getElementById('dataAgendada');
  const agendarBtn = document.getElementById('btnAgendarAutomacao');
  const agendamentosLista = document.getElementById('agendamentosLista');
  const historicoLista = document.getElementById('historicoLista');

  const filtroDataInicio = document.getElementById('filtroDataInicio');
  const filtroDataFim = document.getElementById('filtroDataFim');
  const filtroEtapa = document.getElementById('filtroEtapa');
  const filtroUsuario = document.getElementById('filtroUsuario');
  const filtroBusca = document.getElementById('filtroBusca');
  const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');

  let leadAtualId = null;
  let leadsOriginais = [];
  let leadsFiltrados = [];

  etapas.forEach(etapa => {
    const opt = document.createElement('option');
    opt.value = etapa;
    opt.textContent = etapa;
    filtroEtapa.appendChild(opt);
  });

  if (executarAutomacoesBtn) {
    executarAutomacoesBtn.addEventListener('click', async () => {
      const res = await fetch('/api/executar-agendamentos', { method: 'POST' });
      const resultado = await res.json();
      alert(`${resultado.enviados.length} automações executadas com sucesso!`);
      renderPipeline();
    });
  }

  if (btnAplicarFiltros) {
    btnAplicarFiltros.addEventListener('click', () => {
      aplicarFiltros();
    });
  }

  if (btnExportarCSV) {
    btnExportarCSV.addEventListener('click', () => {
      exportarCSV(leadsFiltrados.length ? leadsFiltrados : leadsOriginais);
    });
  }

  function aplicarFiltros() {
    const inicio = filtroDataInicio?.value;
    const fim = filtroDataFim?.value;
    const etapa = filtroEtapa?.value;
    const usuario = filtroUsuario?.value;
    const termo = filtroBusca?.value.toLowerCase();

    leadsFiltrados = leadsOriginais.filter(lead => {
      const criado = new Date(lead.data_criacao);
      const okData = (!inicio || criado >= new Date(inicio)) && (!fim || criado <= new Date(fim));
      const okEtapa = !etapa || lead.etapa === etapa;
      const okUsuario = !usuario || lead.usuario === usuario;
      const okBusca = !termo || (lead.nome.toLowerCase().includes(termo) || lead.email.toLowerCase().includes(termo));
      return okData && okEtapa && okUsuario && okBusca;
    });

    renderPipeline(leadsFiltrados);
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  }

  function isToday(dateStr) {
    const today = new Date();
    const d = new Date(dateStr);
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth() === today.getMonth() &&
           d.getDate() === today.getDate();
  }

  function isRecent(dateStr) {
    const now = new Date();
    const d = new Date(dateStr);
    const diff = (now - d) / (1000 * 60 * 60 * 24); // em dias
    return diff <= 2;
  }
  async function fetchLeads() {
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();
      leadsOriginais = data;
      return data;
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
      pipelineContainer.innerHTML = '<p style="color:red">Erro ao carregar leads.</p>';
      return [];
    }
  }

  async function fetchPipelineStats() {
    try {
      const response = await fetch('/api/pipeline');
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return { pipeline: {} };
    }
  }

  async function fetchExtras(leadId) {
    const [interRes, agendRes] = await Promise.all([
      fetch(`/api/leads/${leadId}/interacoes`).then(r => r.json()),
      fetch(`/api/leads/${leadId}/agendamentos`).then(r => r.json())
    ]);
    return { interacoes: interRes, agendamentos: agendRes };
  }

  async function renderPipeline(leads = null) {
    pipelineContainer.innerHTML = '';
    if (!leads) leads = await fetchLeads();
    const stats = await fetchPipelineStats();

    for (const etapa of etapas) {
      const col = document.createElement('div');
      col.className = 'pipeline-column';

      const etapaStats = stats.pipeline[etapa] || { count: 0, total_valor: 0 };
      const header = document.createElement('div');
      header.className = 'column-header';
      header.innerHTML = `
        <span>${etapa}</span>
        <span>${etapaStats.count} lead(s) (${formatCurrency(etapaStats.total_valor)})</span>
      `;
      col.appendChild(header);

      const leadsEtapa = leads.filter(lead => lead.etapa === etapa);

      if (leadsEtapa.length === 0) {
        const vazio = document.createElement('div');
        vazio.innerHTML = "<p style='color:gray;font-size:0.9em;'>Nenhum lead</p>";
        col.appendChild(vazio);
      } else {
        for (const lead of leadsEtapa) {
          const card = document.createElement('div');
          card.className = 'lead-card';

          const { interacoes, agendamentos } = await fetchExtras(lead.id);

          const interRecentes = interacoes.some(i => isRecent(i.data_envio));
          const agendHoje = agendamentos.some(a => isToday(a.data_agendada));

          let alertas = '';
          if (agendHoje) alertas += '<span class="badge">Agendado hoje</span> ';
          if (interRecentes) alertas += '<span class="badge blue">Interação recente</span>';

          card.innerHTML = `
            <h4>${lead.nome}</h4>
            <p>${lead.email}</p>
            <p>${lead.empresa || ''}</p>
            <p>${alertas}</p>
            <p class="value">Valor: ${formatCurrency(lead.valor_negocio)}</p>
            <label style="font-size: 0.85em;">Alterar etapa:</label>
            <select data-id="${lead.id}" class="etapa-select">
              ${etapas.map(et => `<option value="${et}" ${et === lead.etapa ? 'selected' : ''}>${et}</option>`).join('')}
            </select>
            <button class="ver-detalhes" data-id="${lead.id}" data-nome="${lead.nome}" data-email="${lead.email}">Ver detalhes</button>
          `;
          col.appendChild(card);
        }
      }

      pipelineContainer.appendChild(col);
    }

    document.querySelectorAll('.etapa-select').forEach(select => {
      select.addEventListener('change', e => {
        const leadId = e.target.getAttribute('data-id');
        const novaEtapa = e.target.value;
        updateLeadStage(leadId, novaEtapa);
      });
    });

    document.querySelectorAll('.ver-detalhes').forEach(btn => {
      btn.addEventListener('click', async e => {
        const leadId = e.target.getAttribute('data-id');
        const nome = e.target.getAttribute('data-nome');
        const email = e.target.getAttribute('data-email');
        leadAtualId = leadId;
        nomeSpan.textContent = nome;
        emailSpan.textContent = email;
        observacoesLista.innerHTML = '';
        interacoesLista.innerHTML = '';
        novaObservacao.value = '';

        const obsRes = await fetch(`/api/leads/${leadId}/observacoes`);
        const interRes = await fetch(`/api/leads/${leadId}/interacoes`);
        const observacoes = await obsRes.json();
        const interacoes = await interRes.json();

        observacoes.forEach(o => {
          const li = document.createElement('li');
          li.textContent = `${o.conteudo} (${new Date(o.data_criacao).toLocaleString()})`;
          observacoesLista.appendChild(li);
        });

        interacoes.slice(0, 5).forEach(i => {
          const li = document.createElement('li');
          li.textContent = `${i.tipo}: ${i.assunto} (${new Date(i.data_envio).toLocaleString()})`;
          interacoesLista.appendChild(li);
        });

        await carregarTemplates();
        await carregarAgendamentos(leadId);
        await renderHistorico(leadId);
        modal.style.display = 'flex';
      });
    });
  }

  closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
  salvarObsBtn.addEventListener('click', async () => {
    const texto = novaObservacao.value.trim();
    if (!texto) return;
    await fetch(`/api/leads/${leadAtualId}/observacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conteudo: texto })
    });
    renderPipeline();
    modal.style.display = 'none';
  });

  agendarBtn.addEventListener('click', salvarAgendamento);

  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('lead-name').value;
      const email = document.getElementById('lead-email').value;
      const empresa = document.getElementById('lead-company').value;
      const valor = document.getElementById('lead-value').value;

      const novoLead = {
        nome,
        email,
        empresa,
        valor_negocio: valor ? parseFloat(valor) : null,
        etapa: 'Primeiro contato'
      };

      try {
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novoLead)
        });
        await response.json();
        leadForm.reset();
        renderPipeline();
      } catch (err) {
        console.error("Erro ao cadastrar lead:", err);
      }
    });
  }

  renderPipeline();
});
