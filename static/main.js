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

  function exportarCSV(leads) {
    const linhas = [['Nome', 'Email', 'Empresa', 'Etapa', 'Valor']];
    leads.forEach(lead => {
      linhas.push([lead.nome, lead.email, lead.empresa, lead.etapa, lead.valor_negocio]);
    });
    const csv = linhas.map(l => l.join(',')).join('\\n');
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
