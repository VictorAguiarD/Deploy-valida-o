// ====== js/calendar.js ======
import { read, openModal, closeModal } from "./core.js";

export function render(view){
  const os = read("mms_orders");
  const now = new Date();
  let ym = { y: now.getFullYear(), m: now.getMonth() };

  view.innerHTML = `
    <div class="calendar">
      <div class="cal-head">
        <button class="icon-btn" id="prevM">◀</button>
        <div id="calTitle" style="font-weight:800"></div>
        <button class="icon-btn" id="nextM">▶</button>
      </div>
      <div class="table-wrap">
        <table class="table" style="border:none">
          <thead><tr>${["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d=>`<th>${d}</th>`).join("")}</tr></thead>
        </table>
      </div>
      <div class="cal-grid" id="calGrid"></div>
    </div>
  `;

  document.getElementById("prevM").onclick = ()=>{ ym.m--; if(ym.m<0){ym.m=11;ym.y--} draw(); };
  document.getElementById("nextM").onclick = ()=>{ ym.m++; if(ym.m>11){ym.m=0;ym.y++} draw(); };

  function draw(){
    document.getElementById("calTitle").textContent = `${monthName(ym.m)} de ${ym.y}`;
    const grid = document.getElementById("calGrid");
    grid.innerHTML = "";
    const first = new Date(ym.y, ym.m, 1);
    const offset = first.getDay();
    const days = new Date(ym.y, ym.m+1, 0).getDate();
    for(let i=0;i<offset;i++) grid.appendChild(cell("",[]));
    for(let d=1; d<=days; d++){
      const dateStr = new Date(ym.y, ym.m, d).toISOString().slice(0,10);
      const dayOS = os.filter(o=>o.scheduledAt && o.scheduledAt.slice(0,10)===dateStr);
      grid.appendChild(cell(d, dayOS));
    }
  }

  function cell(day, items){
    const div = document.createElement("div");
    div.className = "cal-cell";
    div.innerHTML = `<div class="d">${day||""}</div>` + (items.slice(0,3).map(i=>`<span class="dot">${i.code||""} ${shortStatus(i.status)}</span>`).join(""));
    if(items.length>3) div.innerHTML += `<span class="muted" style="font-size:11px">${items.length-3}+ mais</span>`;
    if(day){
      div.style.cursor = "pointer";
      div.onclick = ()=> openModal(
        `OS de ${String(day).padStart(2,"0")}/${String(ym.m+1).padStart(2,"0")}/${ym.y}`,
        items.length? items.map(r=>`
          <div class="row" style="gap:8px;align-items:center;border-bottom:1px solid var(--border);padding:8px 0">
            <span class="chip">${r.code||"-"}</span>
            <strong>${r.title}</strong>
            <span class="right">${chipStatus(r.status)}</span>
          </div>
        `).join("") : `<p class="muted">Nenhuma OS agendada.</p>`,
        [{label:"Fechar", variant:"secondary", onClick: closeModal}]
      );
    }
    return div;
  }

  function chipStatus(s){
    if(s==="Aberta") return `<span class="chip info">Aberta</span>`;
    if(s==="Em Execução") return `<span class="chip warn">Em Execução</span>`;
    if(s==="Pausada") return `<span class="chip gray">Pausada</span>`;
    if(s==="Concluída") return `<span class="chip ok">Concluída</span>`;
    if(s==="Cancelada") return `<span class="chip crit">Cancelada</span>`;
    return `<span class="chip">${s}</span>`;
  }
  function shortStatus(s){ return s==="Em Execução"?"Execução":s; }
  function monthName(m){ return ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][m]; }

  draw();
}
