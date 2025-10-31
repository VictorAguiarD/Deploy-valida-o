export const uid = () => crypto.randomUUID();
export const todayStr = () => new Date().toISOString().slice(0, 10);
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString("pt-BR") : "";

export function read(key, def = []) {
  return JSON.parse(localStorage.getItem(key) || JSON.stringify(def));
}
export function write(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// MODAL GENÉRICO
export function openModal(title, bodyHTML, actions = []) {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalActions = document.getElementById("modalActions");

  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHTML;
  modalActions.innerHTML = "";
  actions.forEach(a => {
    const btn = document.createElement("button");
    btn.className = `btn ${a.variant || ""}`.trim();
    btn.textContent = a.label;
    btn.onclick = a.onClick;
    modalActions.appendChild(btn);
  });
  modal.classList.remove("hidden");
}

export function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}
