// ====== js/settings.js ======
import { uid, read, write, openModal, closeModal } from "./core.js";

export function render(view){
  const users = read("mms_users");

  view.innerHTML = `
    <section class="card">
      <div class="row">
        <div class="card-head"><h3>Controle de Acesso</h3><span class="muted">Gerencie quem pode entrar no sistema</span></div>
        <button class="btn" id="newUser">+ Novo Usuário</button>
      </div>
      <div class="table-wrap mt8">
        <table class="table" id="uTable">
          <thead><tr><th>Nome</th><th>Email</th><th>Role</th><th>Status</th><th class="right">Ações</th></tr></thead>
          <tbody>
            ${users.length ? users.map(u=>`
              <tr data-id="${u.id}">
                <td>${u.name}</td><td>${u.email||""}</td><td>${u.role||"usuario"}</td>
                <td>${u.ativo ? "<span class='chip ok'>Ativo</span>" : "<span class='chip crit'>Inativo</span>"}</td>
                <td class="right">
                  <button class="icon-btn act-edit">✎</button>
                  <button class="icon-btn act-toggle">${u.ativo?"🚫":"✅"}</button>
                  <button class="icon-btn act-del">🗑</button>
                </td>
              </tr>`).join("") : `<tr><td colspan="5">Nenhum usuário cadastrado.</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;

  document.getElementById("newUser").onclick = ()=> openUserForm();

  document.getElementById("uTable").addEventListener("click",(e)=>{
    const tr = e.target.closest("tr"); if(!tr) return;
    const id = tr.dataset.id;
    const users = read("mms_users");
    const u = users.find(x=>x.id===id);
    if(e.target.closest(".act-edit")) return openUserForm(id);
    if(e.target.closest(".act-toggle")) {
      u.ativo = !u.ativo;
      write("mms_users", users);
      render(view);
    }
    if(e.target.closest(".act-del")) {
      if(!confirm("Excluir usuário permanentemente?")) return;
      write("mms_users", users.filter(x=>x.id!==id));
      render(view);
    }
  });

  function openUserForm(editId){
    const u = read("mms_users").find(x=>x.id===editId) || {
      name:"", email:"", senha:"", role:"usuario", ativo:true
    };

    openModal(editId?"Editar Usuário":"Novo Usuário", `
      <div class="form-grid form-2">
        <div><div class="label">Nome</div><input id="u_name" class="input" value="${u.name}"></div>
        <div><div class="label">Email</div><input id="u_email" class="input" type="email" value="${u.email||""}"></div>
        <div><div class="label">Senha</div><input id="u_senha" class="input" type="password" value="${u.senha||""}"></div>
        <div><div class="label">Permissão</div>
          <select id="u_role" class="input">
            ${["admin","tecnico","usuario"].map(r=>`<option ${u.role===r?"selected":""}>${r}</option>`).join("")}
          </select>
        </div>
        <div style="grid-column:1 / -1">
          <label><input type="checkbox" id="u_ativo" ${u.ativo?"checked":""}> Usuário ativo</label>
        </div>
      </div>
    `,[
      {label:"Cancelar", variant:"secondary", onClick: closeModal},
      {label:"Salvar", onClick: ()=>{
        const obj = {
          id: editId || uid(),
          name: gv("u_name"),
          email: gv("u_email"),
          senha: gv("u_senha"),
          role: gv("u_role"),
          ativo: document.getElementById("u_ativo").checked,
          criadoEm: u.criadoEm || new Date().toISOString()
        };
        if(!obj.name || !obj.senha) return alert("Nome e senha são obrigatórios.");
        const list = read("mms_users");
        if(editId) write("mms_users", list.map(x=>x.id===editId?obj:x));
        else write("mms_users", [...list,obj]);
        closeModal(); render(view);
      }}
    ]);
  }

  function gv(id){ return document.getElementById(id)?.value || ""; }
}
