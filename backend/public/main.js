const apiUrl = "https://SEU_BACKEND_NO_RAILWAY.up.railway.app/leads";

// Carrega e exibe os leads na página
async function carregarLeads() {
  try {
    const res = await fetch(apiUrl);
    const leads = await res.json();

    const container = document.getElementById("leads-container");
    container.innerHTML = "";

    leads.forEach((lead) => {
      const div = document.createElement("div");
      div.classList.add("card");
      div.innerHTML = `
        <p><strong>${lead.nome}</strong></p>
        <small>Etapa: ${lead.etapa}</small>
        <small>Responsável: ${lead.responsavel}</small>
        <small>Email: ${lead.email || "-"}</small>
      `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error("Erro ao carregar leads:", error);
  }
}

// Chama a função ao carregar a página
window.onload = carregarLeads;
