const pipelineContainer = document.getElementById('pipeline-container');
const leadForm = document.getElementById('lead-form');
let draggedLeadId = null; // Variável para armazenar o ID do lead sendo arrastado

// Elementos do Modal
const followUpModal = document.getElementById('followUpModal');
const closeButton = document.querySelector('.close-button');
const modalLeadName = document.getElementById('modalLeadName');
const modalLeadEmail = document.getElementById('modalLeadEmail');
const templateSelect = document.getElementById('templateSelect');
const assuntoEmail = document.getElementById('assuntoEmail'); // Novo
const conteudoEmail = document.getElementById('conteudoEmail'); // Novo
const sendFollowUpButton = document.getElementById('sendFollowUpButton');
const modalMessage = document.getElementById('modalMessage');

let currentLeadIdForFollowUp = null; // Armazena o ID do lead para o qual o modal foi aberto
let allTemplates = []; // Armazena todos os templates para fácil acesso

// Definir as etapas do pipeline (deve ser a mesma lista do backend)
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

async function fetchLeads() {
    try {
        const response = await fetch('/api/leads');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const leads = await response.json();
        return leads;
    } catch (error) {
        console.error("Erro ao buscar leads:", error);
        pipelineContainer.innerHTML = '<div class="loading-message" style="color: red;">Erro ao carregar leads. Verifique o console para detalhes.</div>';
        return [];
    }
}

async function fetchPipelineStats() {
    try {
        const response = await fetch('/api/pipeline');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const stats = await response.json();
        return stats;
    } catch (error) {
        console.error("Erro ao buscar estatísticas do pipeline:", error);
        return { pipeline: {} };
    }
}

async function fetchTemplates() {
    try {
        const response = await fetch('/api/templates');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const templates = await response.json();
        return templates;
    } catch (error) {
        console.error("Erro ao buscar templates:", error);
        return [];
    }
}

async function fetchLeadInteractions(leadId) {
    try {
        const response = await fetch(`/api/leads/${leadId}/interacoes`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const interactions = await response.json();
        return interactions;
    } catch (error) {
        console.error(`Erro ao buscar interações para o lead ${leadId}:`, error);
        return [];
    }
}

function formatCurrency(value) {
    if (value === null || value === undefined) {
        return 'R$ 0,00';
    }
    // Garante que o valor é um número e formata para moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
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

// Função para atualizar a etapa do lead no backend
async function updateLeadStage(leadId, newStage) {
    try {
        const response = await fetch(`/api/leads/${leadId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ etapa: newStage })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const updatedLead = await response.json();
        console.log(`Lead ${updatedLead.nome} atualizado para a etapa: ${updatedLead.etapa}`);
        return true;
    } catch (error) {
        console.error("Erro ao atualizar etapa do lead:", error);
        alert("Erro ao mover o lead. Por favor, tente novamente.");
        return false;
    }
}

// Função para criar um novo lead
leadForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    const name = document.getElementById('lead-name').value;
    const email = document.getElementById('lead-email').value;
    const company = document.getElementById('lead-company').value;
    const value = document.getElementById('lead-value').value;

    const newLeadData = {
        nome: name,
        email: email,
        empresa: company,
        valor_negocio: value ? parseFloat(value) : null, // Converte para float, ou null se vazio
        etapa: 'Primeiro contato' // Novo lead sempre começa na primeira etapa
    };

    try {
        const response = await fetch('/api/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newLeadData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const createdLead = await response.json();
        console.log('Lead criado com sucesso:', createdLead);
        leadForm.reset(); // Limpa o formulário
        renderPipeline(); // Re-renderiza o pipeline para mostrar o novo lead
    } catch (error) {
        console.error("Erro ao criar lead:", error);
        alert("Erro ao criar o lead. Por favor, verifique os dados e tente novamente.");
    }
});

// Funções do Modal de Follow-up
async function openFollowUpModal(leadId, leadName, leadEmail) {
    currentLeadIdForFollowUp = leadId;
    modalLeadName.textContent = leadName;
    modalLeadEmail.textContent = leadEmail;
    modalMessage.style.display = 'none'; // Esconde mensagens anteriores
    modalMessage.className = 'modal-message'; // Limpa classes de estilo

    // Carregar templates
    templateSelect.innerHTML = '<option value="">Carregando templates...</option>';
    allTemplates = await fetchTemplates(); // Armazena os templates globalmente
    
    templateSelect.innerHTML = ''; // Limpa opções de carregamento
    if (allTemplates.length === 0) {
        templateSelect.innerHTML = '<option value="">Nenhum template disponível</option>';
        sendFollowUpButton.disabled = true;
        assuntoEmail.value = '';
        conteudoEmail.value = '';
    } else {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Selecione um template...';
        templateSelect.appendChild(defaultOption);

        allTemplates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.etapa + ' - ' + template.assunto;
            option.dataset.assunto = template.assunto; // Armazena assunto no dataset
            option.dataset.conteudo = template.conteudo; // Armazena conteúdo no dataset
            templateSelect.appendChild(option);
        });
        sendFollowUpButton.disabled = false;
        // Seleciona o primeiro template por padrão ou limpa os campos
        templateSelect.value = ''; // Começa sem template selecionado
        assuntoEmail.value = '';
        conteudoEmail.value = '';
    }

    followUpModal.style.display = 'flex'; // Exibe o modal
}

// Listener para quando o template é selecionado
templateSelect.addEventListener('change', () => {
    const selectedOption = templateSelect.options[templateSelect.selectedIndex];
    if (selectedOption && selectedOption.value) {
        assuntoEmail.value = selectedOption.dataset.assunto || '';
        conteudoEmail.value = selectedOption.dataset.conteudo || '';
    } else {
        assuntoEmail.value = '';
        conteudoEmail.value = '';
    }
});


function closeFollowUpModal() {
    followUpModal.style.display = 'none'; // Esconde o modal
    currentLeadIdForFollowUp = null;
    assuntoEmail.value = ''; // Limpa campos ao fechar
    conteudoEmail.value = ''; // Limpa campos ao fechar
    templateSelect.value = ''; // Reseta seleção do template
}

closeButton.addEventListener('click', closeFollowUpModal);
window.addEventListener('click', (event) => {
    if (event.target === followUpModal) {
        closeFollowUpModal();
    }
});

sendFollowUpButton.addEventListener('click', async () => {
    const selectedTemplateId = templateSelect.value;
    const customAssunto = assuntoEmail.value;
    const customConteudo = conteudoEmail.value;

    if (!customAssunto || !customConteudo) {
        modalMessage.textContent = 'Assunto e Conteúdo do e-mail são obrigatórios.';
        modalMessage.classList.add('error');
        modalMessage.style.display = 'block';
        return;
    }

    modalMessage.style.display = 'none'; // Esconde mensagens anteriores
    sendFollowUpButton.disabled = true; // Desabilita o botão para evitar múltiplos cliques

    try {
        const response = await fetch(`/api/automation/trigger-followup/${currentLeadIdForFollowUp}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                template_id: selectedTemplateId || null,
                assunto_customizado: customAssunto,
                conteudo_customizado: customConteudo
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
        }

        modalMessage.textContent = result.message || 'Follow-up enviado com sucesso!';
        modalMessage.classList.add('success');
        modalMessage.style.display = 'block';
        
        // Opcional: Fechar modal após alguns segundos ou deixar o usuário fechar
        setTimeout(() => {
            closeFollowUpModal();
            renderPipeline(); // Re-renderiza para atualizar qualquer status ou histórico
        }, 2000);

    } catch (error) {
        console.error("Erro ao enviar follow-up:", error);
        modalMessage.textContent = `Erro ao enviar follow-up: ${error.message}`;
        modalMessage.classList.add('error');
        modalMessage.style.display = 'block';
    } finally {
        sendFollowUpButton.disabled = false; // Reabilita o botão
    }
});


async function renderPipeline() {
    pipelineContainer.innerHTML = ''; // Limpa a mensagem de carregamento

    const [leads, pipelineStats] = await Promise.all([
        fetchLeads(),
        fetchPipelineStats()
    ]);

    // Mapeia leads por ID para fácil acesso
    const leadsMap = new Map(leads.map(lead => [lead.id, lead]));

    // Busca interações para todos os leads em paralelo
    const interactionPromises = leads.map(lead => fetchLeadInteractions(lead.id));
    const allInteractions = await Promise.all(interactionPromises);

    // Mapeia interações por leadId
    const interactionsMap = new Map();
    leads.forEach((lead, index) => {
        interactionsMap.set(lead.id, allInteractions[index]);
    });


    etapas.forEach(etapa => {
        const column = document.createElement('div');
        column.classList.add('pipeline-column');
        column.dataset.etapa = etapa; // Adiciona um data attribute para identificar a etapa

        // Adiciona eventos de drag and drop para as colunas
        column.addEventListener('dragover', (e) => {
            e.preventDefault(); // Permite o drop
            column.classList.add('drag-over');
        });
        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });
        column.addEventListener('drop', async (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');
            if (draggedLeadId) {
                const newStage = column.dataset.etapa;
                const success = await updateLeadStage(draggedLeadId, newStage);
                if (success) {
                    renderPipeline(); // Re-renderiza o pipeline após o sucesso
                }
                draggedLeadId = null; // Limpa o ID do lead arrastado
            }
        });

        const columnHeader = document.createElement('div');
        columnHeader.classList.add('column-header');
        
        const etapaName = document.createElement('span');
        etapaName.textContent = etapa;
        columnHeader.appendChild(etapaName);

        const stats = pipelineStats.pipeline[etapa] || { count: 0, total_valor: 0 };
        const totalValueSpan = document.createElement('span');
        totalValueSpan.textContent = `${stats.count} leads (${formatCurrency(stats.total_valor)})`;
        columnHeader.appendChild(totalValueSpan);

        column.appendChild(columnHeader);

        const leadsInThisStage = leads.filter(lead => lead.etapa === etapa);

        leadsInThisStage.forEach(lead => {
            const card = document.createElement('div');
            card.classList.add('lead-card');
            card.dataset.leadId = lead.id; // Adiciona um data attribute para identificar o lead
            card.draggable = true; // Torna o card arrastável

            // Adiciona eventos de drag and drop para os cards
            card.addEventListener('dragstart', (e) => {
                draggedLeadId = lead.id;
                e.dataTransfer.setData('text/plain', lead.id); // Necessário para Firefox
                card.classList.add('dragging');
            });
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });

            let cardHtml = `
                <h4>${lead.nome}</h4>
                <p>${lead.email}</p>
                ${lead.empresa ? `<p>Empresa: ${lead.empresa}</p>` : ''}
                ${lead.valor_negocio !== null ? `<p class="value">Valor: ${formatCurrency(lead.valor_negocio)}</p>` : ''}
                <button class="follow-up-button" data-lead-id="${lead.id}" data-lead-name="${lead.nome}" data-lead-email="${lead.email}">Follow-up</button>
            `;

            // Adiciona histórico de interações
            const interactions = interactionsMap.get(lead.id) || [];
            if (interactions.length > 0) {
                cardHtml += `<div class="interaction-history"><h5>Últimas Interações:</h5>`;
                // Limita às 3 últimas interações para não sobrecarregar o card
                interactions.slice(0, 3).forEach(interaction => {
                    cardHtml += `
                        <div class="interaction-item">
                            <span>${interaction.tipo.charAt(0).toUpperCase() + interaction.tipo.slice(1)}: ${interaction.assunto}</span>
                            <span class="date">${formatDate(interaction.data_envio)}</span>
                        </div>
                    `;
                });
                cardHtml += `</div>`;
            }

            card.innerHTML = cardHtml;
            column.appendChild(card);
        });

        pipelineContainer.appendChild(column);
    });

    // Adiciona event listeners para os botões de follow-up após a renderização
    document.querySelectorAll('.follow-up-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const leadId = e.target.dataset.leadId;
            const leadName = e.target.dataset.leadName;
            const leadEmail = e.target.dataset.leadEmail;
            openFollowUpModal(leadId, leadName, leadEmail);
        });
    });
}

// Lógica para o botão de inicialização de templates
const initializeTemplatesButton = document.getElementById('initializeTemplatesButton');
if (initializeTemplatesButton) {
    initializeTemplatesButton.addEventListener('click', async () => {
        if (confirm('Tem certeza que deseja inicializar os templates padrão? Isso pode adicionar templates duplicados se já existirem.')) {
            try {
                const response = await fetch('/api/automation/inicializar-templates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    // Recarrega os templates no modal se ele estiver aberto
                    if (followUpModal.style.display === 'flex') {
                        openFollowUpModal(currentLeadIdForFollowUp, modalLeadName.textContent, modalLeadEmail.textContent);
                    }
                } else {
                    alert(`Erro: ${result.error || 'Falha ao inicializar templates.'}`);
                }
            } catch (error) {
                console.error("Erro ao inicializar templates:", error);
                alert("Erro ao inicializar templates. Verifique o console.");
            }
        }
    });
}

// Renderiza o pipeline quando a página carregar
document.addEventListener('DOMContentLoaded', renderPipeline);
