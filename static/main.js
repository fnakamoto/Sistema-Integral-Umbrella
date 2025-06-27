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
  const filtroSemana = document.getElementById('filtroSemana');
  const filtroMes = document.getElementById('filtroMes');
  const filtroAno = document.getElementById('filtroAno');

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

  if (filtroSemana) {
    filtroSemana.addEventListener('click', () => {
      const hoje = new Date();
      const diaSemana = hoje.getDay();
      const inicio = new Date(hoje);
      const fim = new Date(hoje);
      inicio.setDate(hoje.getDate() - diaSemana + 1);
      fim.setDate(inicio.getDate() + 6);
      filtroDataInicio.value = inicio.toISOString().substring(0, 10);
      filtroDataFim.value = fim.toISOString().substring(0, 10);
      aplicarFiltros();
    });
  }

  if (filtroMes) {
    filtroMes.addEventListener('click', () => {
      const hoje = new Date();
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      filtroDataInicio.value = inicio.toISOString().substring(0, 10);
      filtroDataFim.value = fim.toISOString().substring(0, 10);
      aplicarFiltros();
    });
  }

  if (filtroAno) {
    filtroAno.addEventListener('click', () => {
      const hoje = new Date();
      const inicio = new Date(hoje.getFullYear(), 0, 1);
      const fim = new Date(hoje.getFullYear(), 11, 31);
      filtroDataInicio.value = inicio.toISOString().substring(0, 10);
      filtroDataFim.value = fim.toISOString().substring(0, 10);
      aplicarFiltros();
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

  function exportarCSV(leads) {
    const header = ['Nome', 'Email', 'Empresa', 'Valor', 'Etapa', 'Data de Criação'];
    const rows = leads.map(l =>
      [l.nome, l.email, l.empresa || '', l.valor_negocio || '', l.etapa, l.data_criacao || '']
    );
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads-exportados.csv';
    a.click();
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
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff <= 2;
  }

  function diasInatividade(dataMaisRecente) {
    const agora = new Date();
    const ultima = new Date(dataMaisRecente);
    return Math.floor((agora - ultima) / (1000 * 60 * 60 * 24));
  }

  // TODO: renderPipeline e demais funções seguem como implementado nas etapas anteriores...

  renderPipeline(); // inicia carregamento
});
