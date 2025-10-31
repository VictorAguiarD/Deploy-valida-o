// ====== js/clients.js ======
import { uid, read, write, openModal, closeModal } from "./core.js";

export function render(view) {
  const clients = read("mms_clients");
  view.innerHTML = `
    <div class="row" style="margin-bottom:12px">
      <input id="searchClient" class="input" placeholder="🔍 Buscar cliente..." style="width:280px">
      <button class="btn right" id="btnNewClient">+ Novo Cliente</button>
    </div>
    <div class="table-wrap">
      <table class="table" id="tblClients">
        <thead><tr>
          <th>Nome</th><th>Email</th><th>Telefone</th><th>Rota</th><th>Técnico</th><th class="right">Ações</th>
        </tr></thead>
        <tbody>
          ${clients.length ? clients.map(c => `
            <tr>
              <td>${c.name}</td><td>${c.email||""}</td><td>${c.phone||""}</td>
              <td>${c.route||""}</td><td>${c.technician||""}</td>
              <td class="right">
                <button class="icon-btn" title="Editar" onclick="editClient('${c.id}')">✎</button>
                <button class="icon-btn" title="Excluir" onclick="delClient('${c.id}')">🗑</button>
              </td>
            </tr>
          `).join("") : `<tr><td colspan="6">Nenhum cliente cadastrado.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById("searchClient").oninput = e => {
    const val = e.target.value.toLowerCase();
    document.querySelectorAll("#tblClients tbody tr").forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(val) ? "" : "none";
    });
  };
  document.getElementById("btnNewClient").onclick = () => openClientForm();

  window.editClient = id => openClientForm(id);
  window.delClient = id => {
    if (!confirm("Deseja excluir este cliente?")) return;
    write("mms_clients", read("mms_clients").filter(c => c.id !== id));
    render(view);
  };

  function openClientForm(editId) {
    const c = read("mms_clients").find(x => x.id === editId) || 
      { name:"", email:"", phone:"", cnpj:"", address:"", city:"", state:"", zip:"", route:"", technician:"" };

    openModal(editId ? "Editar Cliente" : "Novo Cliente", `
      <div class="form-grid form-2">
        <div><div class="label">Nome</div><input id="c_name" class="input" value="${c.name}"></div>
        <div><div class="label">CNPJ/CPF</div><input id="c_cnpj" class="input" value="${c.cnpj||""}"></div>
        <div><div class="label">Email</div><input id="c_email" class="input" value="${c.email||""}"></div>
        <div><div class="label">Telefone</div><input id="c_phone" class="input" value="${c.phone||""}"></div>
        <div><div class="label">Endereço</div><input id="c_address" class="input" value="${c.address||""}"></div>
        <div><div class="label">Cidade</div><input id="c_city" class="input" value="${c.city||""}"></div>
        <div><div class="label">Estado</div><input id="c_state" class="input" value="${c.state||""}"></div>
        <div><div class="label">CEP</div><input id="c_zip" class="input" value="${c.zip||""}"></div>
        <div><div class="label">Rota</div><input id="c_route" class="input" value="${c.route||""}"></div>
        <div><div class="label">Técnico Responsável</div><input id="c_tech" class="input" value="${c.technician||""}"></div>
      </div>
    `, [
      { label: "Cancelar", variant: "secondary", onClick: closeModal },
      {
        label: "Salvar", onClick: () => {
          const obj = {
            id: editId || uid(),
            name: val("c_name"),
            cnpj: val("c_cnpj"),
            email: val("c_email"),
            phone: val("c_phone"),
            address: val("c_address"),
            city: val("c_city"),
            state: val("c_state"),
            zip: val("c_zip"),
            route: val("c_route"),
            technician: val("c_tech")
          };
          if (!obj.name) return alert("Nome é obrigatório.");
          const list = read("mms_clients");
          if (editId)
            write("mms_clients", list.map(x => x.id === editId ? obj : x));
          else
            write("mms_clients", [...list, obj]);
          closeModal();
          render(view);
        }
      }
    ]);
  }

  function val(id) { return document.getElementById(id)?.value || ""; }
}
