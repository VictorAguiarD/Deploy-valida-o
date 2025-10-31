import { read, fmtDate } from "./core.js";

export function render(view) {
  const os = read("mms_orders");
  const clients = read("mms_clients");
  const equips = read("mms_equips");

  const abertas = os.filter(o => o.status === "Aberta").length;
  const exec = os.filter(o => o.status === "Em Execução").length;
  const concl = os.filter(o => o.status === "Concluída").length;

  view.innerHTML = `
    <section class="grid kpis">
      ${kpi("OS Abertas", abertas, "Pendentes de atendimento", "📅")}
      ${kpi("Em Execução", exec, "Em andamento", "⏱️")}
      ${kpi("Concluídas", concl, "Últimos 30 dias", "✅")}
      ${kpi("Clientes Ativos", clients.length, "Com contratos", "👥")}
    </section>

    <section class="card mt16">
      <div class="card-head row">
        <h3>Ordens de Serviço Recentes</h3>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>#</th><th>Título</th><th>Status</th><th>Abertura</th></tr></thead>
          <tbody>
            ${os.slice(-5).reverse().map(o => `
              <tr><td>${o.code}</td><td>${o.title}</td><td>${o.status}</td><td>${fmtDate(o.openedAt)}</td></tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function kpi(title, val, sub, icon) {
  return `<article class="card kpi"><div class="title">${icon} ${title}</div>
          <div class="value">${val}</div><div class="sub">${sub}</div></article>`;
}
