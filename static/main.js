document.addEventListener('DOMContentLoaded', () => {
  const pipelineContainer = document.getElementById('pipeline-container');
  const leadForm = document.getElementById('lead-form');
  const executarAutomacoesBtn = document.getElementById('executarAutomacoesBtn');
  const btnExportarCSV = document.getElementById('btnExportarCSV');
  const temaToggle = document.getElementById('temaToggle');

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
  const filtroSemana = document.getElementById('filtroSemana');
  const filtroMes = document.getElementById('filtroMes');
  const filtroAno = document.getElementById('filtroAno');

  let leadAtualId = null;
  let leadsOriginais = [];
  let leadsFiltrados = [];

  const temaAtual = localStorage.getItem('tema');
  if (temaAtual === 'escuro') document.body.setAttribute('data-tema', 'escuro');

  if (temaToggle) {
    temaToggle.addEventListener('click', () => {
      const atual = document.body.getAttribute('data-tema');
      const novoTema = atual === 'escuro' ? 'claro' : 'escuro';
      document.body.setAttribute('data-tema', novoTema);
      localStorage.setItem('tema', novoTema);
    });
  }

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (btnExportarCSV) {
    btnExportarCSV.addEventListener('click', () => {
      exportarCSV(leadsFiltrados.length ? leadsFiltrados : leadsOriginais);
    });
  }

  filtroSemana.addEventListener('click', () => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje);
    primeiroDia.setDate(hoje.getDate() - hoje.getDay());
    const ultimoDia = new Date(primeiroDia);
    ultimoDia.setDate(primeiroDia.getDate() + 6);
    filtroDataInicio.value = primeiroDia.toISOString().slice(0, 10);
    filtroDataFim.value = ultimoDia.toISOString().slice(0, 10);
    aplicarFiltros();
  });

  filtroMes.addEventListener('click', () => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    filtroDataInicio.value = primeiroDia.toISOString().slice(0, 10);
    filtroDataFim.value = ultimoDia.toISOString().slice(0, 10);
    aplicarFiltros();
  });

  filtroAno.addEventListener('click', () => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), 0, 1);
    const ultimoDia = new Date(hoje.getFullYear(), 11, 31);
    filtroDataInicio.value = primeiroDia.toISOString().slice(0, 10);
    filtroDataFim.value = ultimoDia.toISOString().slice(0, 10);
    aplicarFiltros();
  });

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

  function aplicarFiltros() {
    leadsFiltrados = leadsOriginais.filter(lead => {
      const dataLead = new Date(lead.data_criacao);
      const inicio = filtroDataInicio.value ? new Date(filtroDataInicio.value) : null;
      const fim = filtroDataFim.value ? new Date(filtroDataFim.value) : null;

      return (!inicio || dataLead >= inicio) &&
             (!fim || dataLead <= fim) &&
             (!filtroEtapa.value || lead.etapa === filtroEtapa.value) &&
             (!filtroUsuario.value || lead.usuario === filtroUsuario.value) &&
             (!filtroBusca.value || lead.nome.includes(filtroBusca.value) || lead.email.includes(filtroBusca.value));
    });
    renderPipeline();
  }

  function formatCurrency(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function renderResumoUsuarios(leads) {
    const container = document.getElementById('resumo-usuarios');
    if (!container) {
      console.warn('❌ ID resumo-usuarios não encontrado no DOM. Renderização ignorada.');
      return;
    }

    const usuarios = {};
    leads.forEach(lead => {
      const usuario = lead.usuario || 'Sem usuário';
      if (!usuarios[usuario]) usuarios[usuario] = { total: 0, valor: 0, clientes: 0 };
      usuarios[usuario].total++;
      usuarios[usuario].valor += lead.valor_negocio || 0;
      if (lead.etapa === 'Cliente') usuarios[usuario].clientes++;
    });

    container.innerHTML = '';
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
        const container = document.getElementById('pipeline-container');
        container.innerHTML = '';
        etapas.forEach(etapa => {
          const coluna = document.createElement('div');
          coluna.className = 'pipeline-column';
          const header = document.createElement('div');
          header.className = 'column-header';
          header.innerHTML = `<span>${etapa}</span><span>${formatCurrency(lista.filter(l => l.etapa === etapa).reduce((s, l) => s + (l.valor_negocio || 0), 0))}</span>`;
          coluna.appendChild(header);
          lista.filter(l => l.etapa === etapa).forEach(lead => {
            const card = document.createElement('div');
            card.className = 'lead-card';
            card.innerHTML = `<strong>${lead.nome}</strong><br>${lead.email}<br>${lead.empresa || ''}<br><span class="badge">${lead.usuario || 'Sem usuário'}</span>`;
            card.onclick = () => abrirModal(lead);
            coluna.appendChild(card);
          });
          container.appendChild(coluna);
        });

        console.log('➡️ Chamando renderResumoUsuarios() com', lista.length, 'leads');
        renderResumoUsuarios(lista);
        atualizarIndicadores(lista);
      });
  }

  function atualizarIndicadores(leads) {
    document.getElementById('indicadorTotalLeads').textContent = leads.length;
    document.getElementById('indicadorTotalValor').textContent = formatCurrency(leads.reduce((s, l) => s + (l.valor_negocio || 0), 0));
    document.getElementById('indicadorInativos').textContent = leads.filter(l => {
      const dias = (Date.now() - new Date(l.ultima_interacao).getTime()) / (1000 * 60 * 60 * 24);
      return dias > 10;
    }).length;
    document.getElementById('indicadorRecentes').textContent = leads.filter(l => {
      const dias = (Date.now() - new Date(l.ultima_interacao).getTime()) / (1000 * 60 * 60 * 24);
      return dias <= 3;
    }).length;
    document.getElementById('indicadorHoje').textContent = leads.filter(l => {
      const hoje = new Date().toISOString().split('T')[0];
      return (l.agendamentos || []).some(a => a.data === hoje);
    }).length;
  }

  function abrirModal(lead) {
    leadAtualId = lead.id;
    nomeSpan.textContent = lead.nome;
    emailSpan.textContent = lead.email;
    modal.style.display = 'flex';
    novaObservacao.value = '';
    novaObservacao.focus();
  }

  function exportarCSV(leads) {
    const linhas = [['Nome', 'Email', 'Empresa', 'Etapa', 'Valor']];
    leads.forEach(lead => {
      linhas.push([lead.nome, lead.email, lead.empresa, lead.etapa, lead.valor_negocio]);
    });
    const csv = linhas.map(l => l.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  renderPipeline();
});
