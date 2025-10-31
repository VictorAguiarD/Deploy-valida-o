// ====== js/orders.js ======
import { uid, read, write, openModal, closeModal, fmtDate, todayStr } from "./core.js";

// Controle de sequência OS
function peekNextOSCode() {
  const seq = Number(localStorage.getItem("mms_seq_os") || "1000");
  return "OS-" + (seq + 1);
}
function commitNextOSCode() {
  let seq = Number(localStorage.getItem("mms_seq_os") || "1000");
  seq += 1;
  localStorage.setItem("mms_seq_os", String(seq));
  return "OS-" + seq;
}

export function render(view) {
  const clients = read("mms_clients");
  const equips = read("mms_equips");
  const orders = read("mms_orders");

  view.innerHTML = `
    <div class="row" style="gap:8px;margin-bottom:12px;flex-wrap:wrap">
      <input id="oSearch" class="input" placeholder="🔍 Buscar OS..." style="width:220px">
      <select id="fStatus" class="input" style="width:160px">
        <option value="">Status</option>
        <option>Aberta</option><option>Em Execução</option><option>Pausada</option>
        <option>Concluída</option><option>Cancelada</option>
      </select>
      <select id="fPriority" class="input" style="width:160px">
        <option value="">Prioridade</option>
        <option>Baixa</option><option>Média</option><option>Alta</option><option>Crítica</option>
      </select>
      <select id="fClient" class="input" style="width:220px">
        <option value="">Cliente</option>
        ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join("")}
      </select>
      <button class="btn right" id="newOS">+ Nova OS</button>
    </div>

    <div class="table-wrap">
      <table class="table" id="osTable">
        <thead>
          <tr>
            <th>#OS</th><th>Título</th><th>Cliente</th><th>Equipamento</th>
            <th>Tipo</th><th>Prioridade</th><th>Status</th><th>Abertura</th>
            <th class="right">Ações</th>
          </tr>
        </thead>
        <tbody>${rows(orders)}</tbody>
      </table>
    </div>
  `;

  function rows(list) {
    return (list.length ? list.map(o => {
      const cl = clients.find(c => c.id === o.clientId)?.name || "-";
      const eq = equips.find(e => e.id === o.equipId)?.name || "-";
      return `
      <tr data-id="${o.id}">
        <td>${o.code || "-"}</td>
        <td>
          <strong>${o.title}</strong>
          ${o.defect ? `<br><small style="color:#6b7280;">Defeito: ${o.defect}</small>` : ""}
        </td>
        <td>${cl}</td>
        <td>${eq}</td>
        <td>${o.type}</td>
        <td>${chipPriority(o.priority)}</td>
        <td>${chipStatus(o.status)}</td>
        <td>${fmtDate(o.openedAt)}</td>
        <td class="right">
          <button class="icon-btn act-next" title="Avançar Status">⇄</button>
          <button class="icon-btn act-edit" title="Editar">✎</button>
          <button class="icon-btn act-del" title="Excluir">🗑</button>
        </td>
      </tr>`;
    }).join("") : `<tr><td colspan="9">Nenhuma OS cadastrada.</td></tr>`);
  }

  // Filtros
  const applyFilters = () => {
    const v = document.getElementById("oSearch").value.toLowerCase();
    const st = document.getElementById("fStatus").value;
    const pr = document.getElementById("fPriority").value;
    const cl = document.getElementById("fClient").value;
    document.querySelectorAll("#osTable tbody tr").forEach(r => {
      const okText = r.textContent.toLowerCase().includes(v);
      const okSt = !st || r.textContent.includes(st);
      const okPr = !pr || r.textContent.includes(pr);
      const okCl = !cl || r.children[2]?.textContent === (clients.find(x => x.id === cl)?.name || "");
      r.style.display = (okText && okSt && okPr && okCl) ? "" : "none";
    });
  };
  ["oSearch", "fStatus", "fPriority", "fClient"].forEach(id => {
    document.getElementById(id).oninput = applyFilters;
  });

  // Botão Nova OS
  document.getElementById("newOS").onclick = () => openOrderForm();

  // Delegação
  document.getElementById("osTable").addEventListener("click", (e) => {
    const btn = e.target.closest("button"); if (!btn) return;
    const id = e.target.closest("tr")?.dataset.id;
    if (btn.classList.contains("act-edit")) return openOrderForm(id);
    if (btn.classList.contains("act-del")) return delOS(id);
    if (btn.classList.contains("act-next")) return changeStatus(id);
  });

  // Excluir
  function delOS(id) {
    if (!confirm("Excluir OS?")) return;
    write("mms_orders", read("mms_orders").filter(o => o.id !== id));
    render(view);
  }

  // Trocar status
  function changeStatus(id) {
    const list = read("mms_orders");
    const order = list.find(o => o.id === id);
    const flow = ["Aberta", "Em Execução", "Pausada", "Concluída", "Cancelada"];
    let idx = flow.indexOf(order.status);
    idx = (idx + 1 >= flow.length) ? idx : idx + 1;
    order.status = flow[idx];
    if (order.status === "Em Execução" && !order.startedAt) order.startedAt = todayStr();
    if (order.status === "Concluída") order.completedAt = todayStr();
    write("mms_orders", list.map(o => o.id === id ? order : o));
    render(view);
  }

  // ===== Novo Formulário de OS com campo "Defeito" =====
  function openOrderForm(editId, preset = {}) {
    const list = read("mms_orders");
    const isNew = !editId;
    const o = list.find(x => x.id === editId) || {
      id: uid(),
      code: peekNextOSCode(),
      title: "",
      defect: "",
      obs: "",
      type: "Chamado",
      priority: "Média",
      status: "Aberta",
      clientId: preset.clientId || "",
      equipId: preset.equipId || "",
      address: preset.address || "",
      route: preset.route || "",
      openedAt: todayStr(),
      scheduledAt: todayStr()
    };

    const types = ["Chamado", "Preventiva", "Corretiva", "Reparo", "Acompanhamento", "Revisão", "Instalação"];
    const prios = ["Baixa", "Média", "Alta", "Crítica"];
    const statuses = ["Aberta", "Em Execução", "Pausada", "Concluída", "Cancelada"];

    openModal(editId ? "Editar OS" : "Nova OS", `
      <button id="modalClose" class="modal-close">✕</button>
      <div class="form-grid form-2">
        <div><div class="label">Código</div><input id="o_code" class="input" value="${o.code}"></div>
        <div><div class="label">Status</div>
          <select id="o_status" class="input">${statuses.map(s => `<option ${o.status === s ? "selected" : ""}>${s}</option>`).join("")}</select>
        </div>
        <div><div class="label">Cliente</div>
          <select id="o_client" class="input">
            <option value="">Selecione...</option>
            ${clients.map(c => `<option value="${c.id}" ${o.clientId === c.id ? "selected" : ""}>${c.name}</option>`).join("")}
          </select>
        </div>
        <div><div class="label">Equipamento</div>
          <select id="o_equip" class="input">
            <option value="">Selecione...</option>
            ${equips.filter(e => !o.clientId || e.clientId === o.clientId).map(e => `<option value="${e.id}" ${o.equipId === e.id ? "selected" : ""}>${e.name}</option>`).join("")}
          </select>
        </div>
        <div><div class="label">Tipo</div><select id="o_type" class="input">${types.map(t => `<option ${o.type === t ? "selected" : ""}>${t}</option>`).join("")}</select></div>
        <div><div class="label">Prioridade</div><select id="o_priority" class="input">${prios.map(p => `<option ${o.priority === p ? "selected" : ""}>${p}</option>`).join("")}</select></div>
        <div style="grid-column:1 / -1"><div class="label">Título</div><input id="o_title" class="input" value="${o.title}"></div>

        <div style="grid-column:1 / -1"><div class="label">Defeito Relatado</div>
          <textarea id="o_defect" class="input" rows="2" placeholder="Ex: Porta cabine travando...">${o.defect || ""}</textarea>
        </div>

        <div style="grid-column:1 / -1"><div class="label">Observação Complementar</div>
          <textarea id="o_obs" class="input" rows="2" placeholder="Ex: Cliente relatou ruído ao abrir porta">${o.obs || ""}</textarea>
        </div>

        <div style="grid-column:1 / -1"><div class="label">Endereço</div><input id="o_addr" class="input" value="${o.address || ""}"></div>
        <div><div class="label">Rota</div><input id="o_route" class="input" value="${o.route || ""}"></div>
        <div><div class="label">Abertura</div><input id="o_opened" type="date" class="input" value="${(o.openedAt || todayStr()).slice(0, 10)}"></div>
        <div><div class="label">Agendada</div><input id="o_sched" type="date" class="input" value="${(o.scheduledAt || todayStr()).slice(0, 10)}"></div>
      </div>
    `, [
      { label: "Cancelar", variant: "secondary", onClick: closeModal },
      {
        label: "Salvar", onClick: () => {
          let inputCode = gv("o_code").trim();
          const expected = peekNextOSCode();
          if (isNew) {
            if (!inputCode) inputCode = commitNextOSCode();
            else if (inputCode === expected) inputCode = commitNextOSCode();
          }

          const obj = {
            ...o,
            code: inputCode,
            status: gv("o_status"),
            clientId: gv("o_client"),
            equipId: gv("o_equip"),
            type: gv("o_type"),
            priority: gv("o_priority"),
            title: gv("o_title"),
            defect: gv("o_defect"),
            obs: gv("o_obs"),
            address: gv("o_addr"),
            route: gv("o_route"),
            openedAt: gv("o_opened"),
            scheduledAt: gv("o_sched")
          };

          if (!obj.clientId || !obj.title) return alert("Cliente e Título são obrigatórios.");
          if (!obj.defect) return alert("Descreva o defeito relatado.");

          const cl = clients.find(c => c.id === obj.clientId);
          if (cl) {
            obj.address = obj.address || cl.address || "";
            obj.route = obj.route || cl.route || "";
          }

          const updated = listUpsert(read("mms_orders"), obj);
          write("mms_orders", updated);
          closeModal();
          render(view);
        }
      }
    ]);

    // Cliente → Equipamento dependente
    document.getElementById("o_client").onchange = (e) => {
      const cid = e.target.value;
      const sel = document.getElementById("o_equip");
      const items = equips.filter(eq => eq.clientId === cid);
      sel.innerHTML = `<option value="">Selecione...</option>` + items.map(eq => `<option value="${eq.id}">${eq.name}</option>`).join("");
      const cl = clients.find(c => c.id === cid);
      if (cl) {
        document.getElementById("o_addr").value = cl.address || "";
        document.getElementById("o_route").value = cl.route || "";
      }
    };
  }

  function gv(id) { return document.getElementById(id)?.value || ""; }
  function listUpsert(list, obj) { const i = list.findIndex(x => x.id === obj.id); if (i >= 0) { list[i] = obj; return [...list]; } return [obj, ...list]; }

  function chipStatus(s) { const map = { Aberta: "info", "Em Execução": "warn", Pausada: "gray", Concluída: "ok", Cancelada: "crit" }; return `<span class="chip ${map[s] || ""}">${s}</span>`; }
  function chipPriority(p) { const map = { Crítica: "crit", Alta: "info", Média: "warn", Baixa: "" }; return `<span class="chip ${map[p] || ""}">${p}</span>`; }
}
