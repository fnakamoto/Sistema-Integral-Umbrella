const pipelineContainer = document.getElementById('pipeline-container');
const leadForm = document.getElementById('lead-form');
let draggedLeadId = null;

// Modal elements
const followUpModal = document.getElementById('followUpModal');
const closeButton = document.querySelector('.close-button');
const modalLeadName = document.getElementById('modalLeadName');
const modalLeadEmail = document.getElementById('modalLeadEmail');
const templateSelect = document.getElementById('templateSelect');
const assuntoEmail = document.getElementById('assuntoEmail');
const conteudoEmail = document.getElementById('conteudoEmail');
const sendFollowUpButton = document.getElementById('sendFollowUpButton');
const modalMessage = document.getElementById('modalMessage');

let currentLeadIdForFollowUp = null;
let allTemplates = [];

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
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function fetchLeads() {
  try {
    const response = await fetch('/api/leads');
    if (!response.ok) throw new Error(response.status);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar leads:", error);
    pipelineContainer.innerHTML = '<div class="loading-message" style="color: red;">Erro ao carregar leads.</div>';
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

async function fetchTemplates() {
  try {
    const response = await fetch('/api/templates');
    if (!response.ok) throw new Error(response.status);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar templates:", error);
    return [];
  }
}

async function fetchLeadInteractions(leadId) {
  try {
    const response = await fetch(`/api/leads/${leadId}/interacoes`);
    if (!response.ok) throw new Error(response.status);
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar interações do lead ${leadId}:`, error);
    return [];
  }
}

async function updateLeadStage(leadId, newStage) {
  try {
    const response = await fetch(`/api/leads/${leadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ etapa: newStage })
    });
    if (!response.ok) throw new Error(response.status);
    return true;
  } catch (error) {
    console.error("Erro ao atualizar etapa:", error);
    alert("Erro ao mover o lead.");
    return false;
  }
}

leadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.getElementById('lead-name').value;
  const email = document.getElementById('lead-email').value;
  const empresa = document.getElementById('lead-company').value;
  const valor = document.getElementById('lead-value').value;

  const lead = {
    nome, email, empresa,
    valor_negocio: valor ? parseFloat(valor) : null,
    etapa: 'Primeiro contato'
  };

  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
    if (!response.ok) throw new Error(response.status);
    await response.json();
    leadForm.reset();
    renderPipeline();
  } catch (error) {
    console.error("Erro ao criar lead:", error);
    alert("Erro ao criar o lead.");
  }
});

async function openFollowUpModal(leadId, name, email) {
  currentLeadIdForFollowUp = leadId;
  modalLeadName.textContent = name;
  modalLeadEmail.textContent = email;
  modalMessage.style.display = 'none';
  modalMessage.className = 'modal-message';

  templateSelect.innerHTML = '<option>Carregando...</option>';
  allTemplates = await fetchTemplates();

  templateSelect.innerHTML = '';
  if (!allTemplates.length) {
    templateSelect.innerHTML = '<option>Nenhum template disponível</option>';
    sendFollowUpButton.disabled = true;
    assuntoEmail.value = '';
    conteudoEmail.value = '';
  } else {
    templateSelect.innerHTML = '<option value="">Selecione um template...</option>';
    allTemplates.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.etapa} - ${t.assunto}`;
      opt.dataset.assunto = t.assunto;
      opt.dataset.conteudo = t.conteudo;
      templateSelect.appendChild(opt);
    });
    sendFollowUpButton.disabled = false;
  }

  followUpModal.style.display = 'flex';
}

templateSelect.addEventListener('change', () => {
  const opt = templateSelect.selectedOptions[0];
  assuntoEmail.value = opt?.dataset.assunto || '';
  conteudoEmail.value = opt?.dataset.conteudo || '';
});

function closeFollowUpModal() {
  followUpModal.style.display = 'none';
  currentLeadIdForFollowUp = null;
  assuntoEmail.value = '';
  conteudoEmail.value = '';
  templateSelect.value = '';
}

closeButton.addEventListener('click', closeFollowUpModal);
window.addEventListener('click', e => {
  if (e.target === followUpModal) closeFollowUpModal();
});

sendFollowUpButton.addEventListener('click', async () => {
  const templateId = templateSelect.value;
  const assunto = assuntoEmail.value;
  const conteudo = conteudoEmail.value;

  if (!assunto || !conteudo) {
    modalMessage.textContent = 'Assunto e conteúdo são obrigatórios.';
    modalMessage.classList.add('error');
    modalMessage.style.display = 'block';
    return;
  }

  modalMessage.style.display = 'none';
  sendFollowUpButton.disabled = true;

  try {
    const response = await fetch(`/api/automation/trigger-followup/${currentLeadIdForFollowUp}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: templateId || null, assunto_customizado: assunto, conteudo_customizado: conteudo })
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.error || response.status);

    modalMessage.textContent = result.message || 'Follow-up enviado com sucesso!';
    modalMessage.classList.add('success');
    modalMessage.style.display = 'block';

    setTimeout(() => {
      closeFollowUpModal();
      renderPipeline();
    }, 2000);

  } catch (error) {
    modalMessage.textContent = `Erro ao enviar follow-up: ${error.message}`;
    modalMessage.classList.add('error');
    modalMessage.style.display = 'block';
  } finally {
    sendFollowUpButton.disabled = false;
  }
});

async function renderPipeline() {
  pipelineContainer.innerHTML = '';
  const [leads, pipelineStats] = await Promise.all([fetchLeads(), fetchPipelineStats()]);

  const leadsMap = new Map(leads.map(l => [l.id, l]));
  const interactions = await Promise.all(leads.map(l => fetchLeadInteractions(l.id)));
  const interactionsMap = new Map(leads.map((l, i) => [l.id, interactions[i]]));

  etapas.forEach(etapa => {
    const col = document.createElement('div');
    col.className = 'pipeline-column';
    col.dataset.etapa = etapa;

    col.addEventListener('dragover', e => {
      e.preventDefault();
      col.classList.add('drag-over');
    });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', async () => {
      col.classList.remove('drag-over');
      if (draggedLeadId) {
        const sucesso = await updateLeadStage(draggedLeadId, etapa);
        if (sucesso) renderPipeline();
        draggedLeadId = null;
      }
    });

    const header = document.createElement('div');
    header.className = 'column-header';
    header.innerHTML = `<span>${etapa}</span><span>${(pipelineStats.pipeline[etapa]?.count || 0)} leads (${formatCurrency(pipelineStats.pipeline[etapa]?.total_valor || 0)})</span>`;
    col.appendChild(header);

    leads.filter(l => l.etapa === etapa).forEach(lead => {
      const card = document.createElement('div');
      card.className = 'lead-card';
      card.draggable = true;
      card.dataset.leadId = lead.id;

      card.addEventListener('dragstart', e => {
        draggedLeadId = lead.id;
        e.dataTransfer.setData('text/plain', lead.id);
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => card.classList.remove('dragging'));

      card.innerHTML = `
        <h4>${lead.nome}</h4>
        <p>${lead.email}</p>
        ${lead.empresa ? `<p>Empresa: ${lead.empresa}</p>` : ''}
        ${lead.valor_negocio !== null ? `<p class="value">Valor: ${formatCurrency(lead.valor_negocio)}</p>` : ''}
        <button class="follow-up-button" data-lead-id="${lead.id}" data-lead-name="${lead.nome}" data-lead-email="${lead.email}">Follow-up</button>
      `;

      const interactions = interactionsMap.get(lead.id) || [];
      if (interactions.length) {
        const hist = interactions.slice(0, 3).map(i =>
          `<div class="interaction-item"><span>${i.tipo}: ${i.assunto}</span><span class="date">${formatDate(i.data_envio)}</span></div>`
        ).join('');
        card.innerHTML += `<div class="interaction-history"><h5>Últimas Interações:</h5>${hist}</div>`;
      }

      col.appendChild(card);
    });

    pipelineContainer.appendChild(col);
  });

  document.querySelectorAll('.follow-up-button').forEach(btn => {
    btn.addEventListener('click', e => {
      openFollowUpModal(
        e.target.dataset.leadId,
        e.target.dataset.leadName,
        e.target.dataset.leadEmail
      );
    });
  });
}

const initializeTemplatesButton = document.getElementById('initializeTemplatesButton');
if (initializeTemplatesButton) {
  initializeTemplatesButton.addEventListener('click', async () => {
    if (confirm('Inicializar templates padrão? Isso pode duplicar templates.')) {
      try {
        const response = await fetch('/api/automation/inicializar-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        alert(response.ok ? result.message : result.error || 'Erro desconhecido');
        if (followUpModal.style.display === 'flex') {
          openFollowUpModal(currentLeadIdForFollowUp, modalLeadName.textContent, modalLeadEmail.textContent);
        }
      } catch (error) {
        console.error("Erro ao inicializar templates:", error);
        alert("Erro ao inicializar templates.");
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', renderPipeline);
