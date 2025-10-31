// ====== js/equipments.js ======
import { uid, read, write, openModal, closeModal, fmtDate, todayStr } from "./core.js";

export function render(view) {
  const eqs = read("mms_equips"), clients = read("mms_clients");
  view.innerHTML = `
    <div class="row" style="margin-bottom:12px">
      <input id="eqSearch" class="input" placeholder="🔍 Buscar equipamento..." style="width:280px">
      <button class="btn right" id="newEq">+ Novo Equipamento</button>
    </div>
    <div class="table-wrap">
      <table class="table" id="eqTable">
        <thead><tr><th>Nome</th><th>Cliente</th><th>Tipo</th><th>Status</th><th>Próx. Preventiva</th><th class="right">Ações</th></tr></thead>
        <tbody>
          ${eqs.length ? eqs.map(e => {
            const c = clients.find(x => x.id === e.clientId);
            return `<tr>
              <td>${e.name}</td><td>${c?.name || "-"}</td><td>${e.type}</td><td>${e.status}</td>
              <td>${fmtDate(e.nextPreventive)}</td>
              <td class="right">
                <button class="icon-btn" onclick="editEq('${e.id}')">✎</button>
                <button class="icon-btn" onclick="delEq('${e.id}')">🗑</button>
              </td>
            </tr>`;
          }).join("") : `<tr><td colspan="6">Nenhum equipamento cadastrado.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById("eqSearch").oninput = e => {
    const v = e.target.value.toLowerCase();
    document.querySelectorAll("#eqTable tbody tr").forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(v) ? "" : "none";
    });
  };

  document.getElementById("newEq").onclick = () => openEqForm();

  window.editEq = id => openEqForm(id);
  window.delEq = id => {
    if (!confirm("Excluir equipamento?")) return;
    write("mms_equips", read("mms_equips").filter(e => e.id !== id));
    render(view);
  };

  function openEqForm(editId) {
    const cs = read("mms_clients");
    const e = read("mms_equips").find(x => x.id === editId) || 
      { name:"", type:"", brand:"", model:"", serial:"", location:"", clientId:"", status:"Ativo", nextPreventive:"" };

    openModal(editId ? "Editar Equipamento" : "Novo Equipamento", `
      <div class="form-grid form-2">
        <div><div class="label">Cliente</div>
          <select id="e_client" class="input">
            <option value="">Selecione...</option>
            ${cs.map(c => `<option value="${c.id}" ${e.clientId === c.id ? "selected" : ""}>${c.name}</option>`).join("")}
          </select>
        </div>
        <div><div class="label">Nome</div><input id="e_name" class="input" value="${e.name}"></div>
        <div><div class="label">Tipo</div><input id="e_type" class="input" value="${e.type}"></div>
        <div><div class="label">Marca</div><input id="e_brand" class="input" value="${e.brand||""}"></div>
        <div><div class="label">Modelo</div><input id="e_model" class="input" value="${e.model||""}"></div>
        <div><div class="label">Nº Série</div><input id="e_serial" class="input" value="${e.serial||""}"></div>
        <div><div class="label">Localização</div><input id="e_loc" class="input" value="${e.location||""}"></div>
        <div><div class="label">Status</div>
          <select id="e_status" class="input">
            ${["Ativo","Inativo","Em Manutenção"].map(s=>`<option ${e.status===s?"selected":""}>${s}</option>`).join("")}
          </select>
        </div>
        <div><div class="label">Próx. Preventiva</div><input id="e_next" type="date" class="input" value="${(e.nextPreventive||todayStr()).slice(0,10)}"></div>
      </div>
    `, [
      { label: "Cancelar", variant: "secondary", onClick: closeModal },
      {
        label: "Salvar", onClick: () => {
          const obj = {
            id: editId || uid(),
            clientId: val("e_client"), name: val("e_name"), type: val("e_type"),
            brand: val("e_brand"), model: val("e_model"), serial: val("e_serial"),
            location: val("e_loc"), status: val("e_status"), nextPreventive: val("e_next")
          };
          if (!obj.clientId || !obj.name) return alert("Cliente e Nome obrigatórios.");
          const list = read("mms_equips");
          if (editId)
            write("mms_equips", list.map(x => x.id === editId ? obj : x));
          else
            write("mms_equips", [...list, obj]);
          closeModal();
          render(view);
        }
      }
    ]);
  }

  function val(id) { return document.getElementById(id)?.value || ""; }
}
