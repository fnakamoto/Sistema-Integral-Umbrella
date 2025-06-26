document.addEventListener('DOMContentLoaded', () => {
  const pipelineContainer = document.getElementById('pipeline-container');
  const leadForm = document.getElementById('lead-form');

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
  let leadAtualId = null;

  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  }

  async function fetchLeads() {
    try {
      const response = await fetch('/api/leads');
      return await response.json();
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

  async function updateLeadStage(id, newStage) {
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etapa: newStage })
      });
      renderPipeline();
    } catch (err) {
      alert("Erro ao atualizar etapa do lead.");
    }
  }

  async function renderPipeline() {
    pipelineContainer.innerHTML = '';
    const [leads, stats] = await Promise.all([fetchLeads(), fetchPipelineStats()]);

    etapas.forEach(etapa => {
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
        leadsEtapa.forEach(lead => {
          const card = document.createElement('div');
          card.className = 'lead-card';
          card.innerHTML = `
            <h4>${lead.nome}</h4>
            <p>${lead.email}</p>
            <p>${lead.empresa || ''}</p>
            <p class="value">Valor: ${formatCurrency(lead.valor_negocio)}</p>
            <label style="font-size: 0.85em;">Alterar etapa:</label>
            <select data-id="${lead.id}" class="etapa-select">
              ${etapas.map(et => `<option value="${et}" ${et === lead.etapa ? 'selected' : ''}>${et}</option>`).join('')}
            </select>
            <button class="ver-detalhes" data-id="${lead.id}" data-nome="${lead.nome}" data-email="${lead.email}">Ver detalhes</button>
          `;
          col.appendChild(card);
        });
      }

      pipelineContainer.appendChild(col);
    });

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

        modal.style.display = 'flex';
      });
    });
  }

  closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });

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
