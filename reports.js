// ====== js/reports.js ======
import { read, fmtDate } from "./core.js";

export function render(view){
  const os = read("mms_orders");
  const clients = read("mms_clients");
  const equips  = read("mms_equips");

  const byStatus   = countBy(os,"status");
  const byPriority = countBy(os,"priority");
  const byType     = countBy(os,"type");

  view.innerHTML = `
    <section class="grid duo">
      <article class="card">
        <div class="card-head"><h3>OS por Status</h3></div>
        ${bars(byStatus)}
      </article>
      <article class="card">
        <div class="card-head"><h3>OS por Prioridade</h3></div>
        ${bars(byPriority)}
      </article>
    </section>

    <section class="card mt16">
      <div class="row">
        <div class="card-head"><h3>Tabela Geral de OS</h3><span class="muted">Exportação disponível</span></div>
        <div class="right">
          <button class="btn ghost" id="csvBtn">Exportar CSV</button>
          <button class="btn" id="printBtn">Imprimir / PDF</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="table" id="repTable">
          <thead><tr><th>#OS</th><th>Título</th><th>Cliente</th><th>Equipamento</th><th>Tipo</th><th>Prioridade</th><th>Status</th><th>Abertura</th></tr></thead>
          <tbody>
            ${os.map(o=>{
              const cl = clients.find(c=>c.id===o.clientId)?.name || "-";
              const eq = equips.find(e=>e.id===o.equipId)?.name || "-";
              return `<tr>
                <td>${o.code||"-"}</td><td>${o.title}</td><td>${cl}</td><td>${eq}</td>
                <td>${o.type}</td><td>${o.priority}</td><td>${o.status}</td><td>${fmtDate(o.openedAt)}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;

  document.getElementById("csvBtn").onclick = () => exportCSV(os, clients, equips);
  document.getElementById("printBtn").onclick = () => window.print();

  function countBy(arr, key){
    return Object.entries(arr.reduce((acc,o)=>{ acc[o[key]]=(acc[o[key]]||0)+1; return acc; },{}))
      .map(([k,v])=>({k,v}))
      .sort((a,b)=>b.v-a.v);
  }
  function bars(items){
    const total = items.reduce((s,i)=>s+i.v,0)||1;
    return `<div class="bars mt8">
      ${items.map(i=>{
        const w = Math.round(i.v/total*100);
        const cls = i.k==="Concluída"?"success": i.k==="Em Execução"?"warn": i.k==="Pausada"?"gray":"";
        return `<div class="bar-row">
          <div class="name">${i.k}</div>
          <div class="bar ${cls}"><span style="width:${w}%"></span></div>
          <div style="width:24px;text-align:right;font-weight:800">${i.v}</div>
        </div>`;
      }).join("")}
    </div>`;
  }
}

function exportCSV(os, clients, equips){
  const headers = ["code","title","client","equipment","type","priority","status","openedAt","scheduledAt","startedAt","completedAt"];
  const lines = [headers.join(",")];
  os.forEach(o=>{
    const cl = clients.find(c=>c.id===o.clientId)?.name || "";
    const eq = equips.find(e=>e.id===o.equipId)?.name || "";
    const row = [o.code,o.title,cl,eq,o.type,o.priority,o.status,o.openedAt||"",o.scheduledAt||"",o.startedAt||"",o.completedAt||""]
      .map(v=> `"${String(v??"").replace(/"/g,'""')}"`).join(",");
    lines.push(row);
  });
  const blob = new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "relatorio_os.csv"; a.click(); URL.revokeObjectURL(url);
}
