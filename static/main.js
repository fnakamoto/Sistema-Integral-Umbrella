// main.js - Versão atualizada Umbrella Leads Manager

// Dados de exemplo (substituir pelo carregamento real)
let leads = [
  {
    id: 1,
    nome: "Cliente A",
    etapa: "Novo",
    responsavel: "Ana",
    email: "clientea@email.com",
  },
  {
    id: 2,
    nome: "Cliente B",
    etapa: "Contato",
    responsavel: "Bruno",
    email: "clienteb@email.com",
  },
  // ...
];

let etapas = ["Novo", "Contato", "Proposta", "Negociação", "Cliente"];

let usuarios = ["Todos", "Ana", "Bruno", "Carlos"];

let usuarioFiltrado = "Todos";

function carregarLeads() {
  // Filtra leads por usuário selecionado
  let leadsFiltrados =
    usuarioFiltrado === "Todos"
      ? leads
      : leads.filter((lead) => lead.responsavel === usuarioFiltrado);

  // Limpa área pipeline
  let pipeline = document.getElementById("pipeline");
  pipeline.innerHTML = "";

  // Cria colunas para cada etapa
  etapas.forEach((etapa) => {
    let coluna = document.createElement("div");
    coluna.className = "coluna";
    coluna.dataset.etapa = etapa;

    let titulo = document.createElement("h3");
    titulo.innerText = etapa;
    coluna.appendChild(titulo);

    // Container para cards nesta etapa
    let containerCards = document.createElement("div");
    containerCards.className = "cards-container";
    containerCards.dataset.etapa = etapa;

    // Permite receber cards (drag & drop)
    containerCards.addEventListener("dragover", (ev) => {
      ev.preventDefault();
      containerCards.classList.add("drag-over");
    });

    containerCards.addEventListener("dragleave", () => {
      containerCards.classList.remove("drag-over");
    });

    containerCards.addEventListener("drop", (ev) => {
      ev.preventDefault();
      containerCards.classList.remove("drag-over");
      let idCard = ev.dataTransfer.getData("text/plain");
      moverLead(idCard, etapa);
    });

    // Adiciona cards da etapa
    leadsFiltrados
      .filter((lead) => lead.etapa === etapa)
      .forEach((lead) => {
        let card = criarCardLead(lead);
        containerCards.appendChild(card);
      });

    coluna.appendChild(containerCards);
    pipeline.appendChild(coluna);
  });
}

function criarCardLead(lead) {
  let card = document.createElement("div");
  card.className = "card";
  card.draggable = true;
  card.id = "lead-" + lead.id;

  card.addEventListener("dragstart", (ev) => {
    ev.dataTransfer.setData("text/plain", lead.id);
  });

  // Nome cliente
  let nome = document.createElement("p");
  nome.innerText = lead.nome;
  card.appendChild(nome);

  // Responsável
  let resp = document.createElement("small");
  resp.innerText = "Responsável: " + lead.responsavel;
  card.appendChild(resp);

  // Lista suspensa para mudar etapa
  let selectEtapa = document.createElement("select");
  etapas.forEach((etapa) => {
    let option = document.createElement("option");
    option.value = etapa;
    option.innerText = etapa;
    if (etapa === lead.etapa) option.selected = true;
    selectEtapa.appendChild(option);
  });

  selectEtapa.addEventListener("change", () => {
    moverLead(lead.id, selectEtapa.value);
  });
  card.appendChild(selectEtapa);

  return card;
}

function moverLead(idLead, novaEtapa) {
  // Atualiza a etapa do lead
  let lead = leads.find((l) => l.id == idLead);
  if (!lead) return;

  // Validação exemplo para bloquear se dados incompletos para etapa final
  if (
    (novaEtapa === "Cliente" || novaEtapa === "Negociação") &&
    (!lead.nome || !lead.email)
  ) {
    alert(
      "Não é possível mover para '" +
        novaEtapa +
        "' porque os dados cadastrais estão incompletos."
    );
    carregarLeads();
    return;
  }

  lead.etapa = novaEtapa;
  carregarLeads();
}

function carregarUsuarios() {
  let filtroUsuario = document.getElementById("filtro-usuario");
  filtroUsuario.innerHTML = "";

  usuarios.forEach((usuario) => {
    let option = document.createElement("option");
    option.value = usuario;
    option.innerText = usuario;
    filtroUsuario.appendChild(option);
  });

  filtroUsuario.addEventListener("change", () => {
    usuarioFiltrado = filtroUsuario.value;
    carregarLeads();
  });
}

// Inicia o sistema
window.onload = () => {
  carregarUsuarios();
  carregarLeads();
};
