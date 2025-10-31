// ====== js/tecnico.js ======
import { read } from "./core.js";

document.addEventListener("DOMContentLoaded", () => {
  const session = JSON.parse(localStorage.getItem("me_session") || "{}");
  if (!session.user || session.role !== "tecnico") {
    alert("Acesso restrito ao perfil técnico.");
    window.location.href = "index.html";
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.onclick = () => {
    localStorage.removeItem("me_session");
    localStorage.removeItem("me_logged");
    window.location.href = "index.html";
  };

  const content = document.getElementById("content");
  const title = document.getElementById("pageTitle");
  const menuItems = document.querySelectorAll("nav li");

  const modules = {
    chamados: renderChamados,
    os: renderOS,
    relatorios: renderRelatorios,
    manuais: renderManuais,
    catalogo: renderCatalogo,
    pendencias: renderPendencias,
    calendario: renderCalendario
  };

  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      menuItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      const page = item.dataset.page;
      title.textContent = item.innerText.trim();
      content.innerHTML = modules[page] ? modules[page]() : "<p>Página em desenvolvimento...</p>";
    });
  });

  // Inicial
  content.innerHTML = modules["chamados"]();

  // ======= Módulos =======
  function renderChamados() {
    const orders = read("me_orders") || [];
    const atribuídas = orders.filter(o => o.technicianAssignedId === session.id && o.status !== "Concluída");

    if (!atribuídas.length) return `<div class="card"><p>Nenhum chamado atribuído.</p></div>`;

    return atribuídas.map(o => `
      <div class="card">
        <h3>${o.title}</h3>
        <p><b>Cliente:</b> ${o.clientName || "-"} | <b>Tipo:</b> ${o.type}</p>
        <p><b>Status:</b> ${o.status}</p>
        <p><b>Prioridade:</b> ${o.priority}</p>
        <button onclick="alert('Iniciar serviço #${o.id}')">Iniciar</button>
        <button onclick="alert('Concluir serviço #${o.id}')">Concluir</button>
      </div>
    `).join("");
  }

  function renderOS() {
    return `<div class="card"><p>Lista completa de ordens de serviço atribuídas (em breve com histórico e filtro).</p></div>`;
  }

  function renderRelatorios() {
    return `<div class="card"><h3>Relatórios Técnicos</h3><p>Resumo de serviços concluídos e tempo médio de execução.</p></div>`;
  }

  function renderManuais() {
    return `<div class="card"><h3>Manuais e Documentos</h3><p>Acesse PDFs e arquivos técnicos disponíveis.</p></div>`;
  }

  function renderCatalogo() {
    return `<div class="card"><h3>Catálogo de Equipamentos</h3><p>Equipamentos sob sua responsabilidade.</p></div>`;
  }

  function renderPendencias() {
    return `<div class="card"><h3>Pendências</h3><p>Serviços pausados ou aguardando aprovação.</p></div>`;
  }

  function renderCalendario() {
    return `<div class="card"><h3>Calendário</h3><p>Agenda de manutenções programadas (em breve).</p></div>`;
  }
});
