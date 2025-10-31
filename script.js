// ====== script.js ======

// Protege o acesso
const sessionRaw = localStorage.getItem("mms_session");
const logged = localStorage.getItem("mms_logged") === "true";

if (!sessionRaw || !logged) {
  window.location.href = "index.html";
}

// Recupera sessão
const session = JSON.parse(sessionRaw || "{}");

document.addEventListener("DOMContentLoaded", () => {
  // ====== USER INFO E LOGOUT ======
  const userBox = document.getElementById("userBox");
  const logoutBtn = document.getElementById("logoutBtn");

  if (userBox && session.name) {
    userBox.innerHTML = `
      <strong>${session.name}</strong><br>
      <small style="color:#cbd5e1;">${(session.role || "").toUpperCase()}</small>
    `;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Deseja realmente sair?")) {
        localStorage.removeItem("mms_logged");
        localStorage.removeItem("mms_session");
        window.location.href = "index.html";
      }
    });
  }

  // ====== MÓDULOS DO SISTEMA ======
  const modules = {
    dashboard: "dashboard.js",
    clients: "clients.js",
    equipments: "equipments.js",
    os: "orders.js",
    calendar: "calendar.js",
    reports: "reports.js",
    settings: "settings.js"
  };

  const view = document.getElementById("view");
  const pageTitle = document.getElementById("pageTitle");
  const pageSub = document.getElementById("pageSub");

  // ====== FUNÇÕES DE NAVEGAÇÃO ======
  function setActive(page) {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add("active");
  }

  async function loadPage(page) {
    setActive(page);
    const mapTitle = {
      dashboard: "Dashboard",
      clients: "Clientes",
      equipments: "Equipamentos",
      os: "Ordens de Serviço",
      calendar: "Calendário",
      reports: "Relatórios",
      settings: "Configurações"
    };
    pageTitle.textContent = mapTitle[page] || page;
    pageSub.textContent = "";
    view.innerHTML = `<p class="muted">Carregando ${mapTitle[page]}...</p>`;

    const module = modules[page];
    if (module) {
      try {
        const mod = await import(`./${module}`);
        if (mod.render) mod.render(view);
      } catch (err) {
        console.error(`Erro ao carregar módulo ${page}:`, err);
        view.innerHTML = `<p class="error">Erro ao carregar ${mapTitle[page]}.</p>`;
      }
    }
  }

  // ====== NAVEGAÇÃO ======
  document.querySelectorAll(".nav-item[data-page]").forEach(btn => {
    btn.addEventListener("click", () => loadPage(btn.dataset.page));
  });

  // ====== PÁGINA INICIAL ======
  loadPage("dashboard");
});
