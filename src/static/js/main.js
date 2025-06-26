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

  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  }

  async function fetchLeads() {
    try {
      const response = await fetch('/api/leads');
      if (!response.ok) throw new Error(response.status);
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
      if (!response.ok) throw new Error(response.status);
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return { pipeline: {} };
    }
  }

  async function updateLeadStage(id, newStage) {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etapa: newStage })
      });
      if (!response.ok) throw new Error(response.status);
      console.log(`Lead ${id} movido para ${newStage}`);
      renderPipeline();
    } catch (err) {
      alert("Erro ao atualizar etapa do lead.");
      console.error(err);
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
  }

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
        if (!response.ok) throw new Error(response.status);
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
