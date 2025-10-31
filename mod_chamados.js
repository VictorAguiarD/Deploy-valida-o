// ===== js/mod_chamados.js =====
import { read } from "./core.js";

export function renderChamados(session) {
  const orders = read("me_orders") || [];
  const users = read("me_users") || [];
  const clients = read("me_clients") || [];

  const chamados = session.role === "tecnico"
    ? orders.filter(o => o.technicianAssignedId === session.id)
    : orders;

  if (!chamados.length)
    return `<div class="card"><p>Nenhum chamado encontrado.</p></div>`;

  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3>Chamados e Ordens de Serviço</h3>
        <span class="muted">Total: ${chamados.length}</span>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Título</th>
              <th>Cliente</th>
              <th>Técnico Responsável</th>
              <th>Status</th>
              <th>Prioridade</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${chamados.map(o => {
              const tecnico = users.find(u => u.id === o.technicianAssignedId);
              const cliente = clients.find(c => c.id === o.clientId);
              return `
                <tr>
                  <td>${o.code || "-"}</td>
                  <td>${o.title}</td>
                  <td>${cliente ? cliente.name : "-"}</td>
                  <td>${tecnico ? tecnico.name : "<span class='muted'>Não atribuído</span>"}</td>
                  <td><span class="chip ${formatStatus(o.status)}">${o.status}</span></td>
                  <td>${formatPriority(o.priority)}</td>
                  <td>${o.type}</td>
                  <td>
                    <button class="btn-small" data-action="view" data-id="${o.id}">👁️</button>
                    ${session.role === "admin"
                      ? `<button class="btn-small" data-action="edit" data-id="${o.id}">✏️</button>`
                      : `<button class="btn-small" data-action="exec" data-id="${o.id}">▶️</button>`}
                  </td>
                </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>`;
}

function formatStatus(status) {
  switch (status) {
    case "Aberta": return "aberta";
    case "Em Execução": return "execucao";
    case "Concluída": return "concluida";
    case "Pausada": return "pausada";
    default: return "";
  }
}

function formatPriority(priority) {
  const color = {
    "Crítica": "red",
    "Alta": "orange",
    "Média": "blue",
    "Baixa": "gray"
  }[priority] || "gray";
  return `<span style="color:${color};font-weight:600;">${priority}</span>`;
}
