// ====== js/auth.js ======
import { read } from "./core.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const btnCreate = document.getElementById("createAdmin");

  // ========== LOGIN ==========
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Garante que o read ocorra no momento certo
    const users = Array.isArray(read("mms_users")) ? read("mms_users") : [];

    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    if (!user || !pass) {
      alert("Informe usuário e senha.");
      return;
    }

    // Verifica usuário cadastrado
    const found = users.find(
      x => (x.name === user || x.email === user) && x.senha === pass
    );

    if (!found) {
      alert("Usuário ou senha incorretos!");
      return;
    }

    if (!found.ativo) {
      alert("Acesso negado: usuário desativado!");
      return;
    }

    // Cria sessão
    const session = {
      id: found.id,
      name: found.name,
      role: found.role,
      email: found.email,
      time: new Date().toISOString(),
    };

    localStorage.setItem("mms_session", JSON.stringify(session));
    localStorage.setItem("mms_logged", "true");

    // Redireciona
    window.location.href = "dashboard.html";
  });

  // ========== CRIAR ADMIN ==========
  if (btnCreate) {
    btnCreate.onclick = () => {
      const users = Array.isArray(read("mms_users")) ? read("mms_users") : [];
      if (users.length > 0) {
        alert("Já existe um administrador cadastrado.");
        return;
      }

      const admin = {
        id: Date.now().toString(),
        name: "admin",
        email: "admin@me.local",
        senha: "admin123",
        role: "admin",
        ativo: true,
        criadoEm: new Date().toISOString(),
      };

      localStorage.setItem("mms_users", JSON.stringify([admin]));
      alert("Administrador criado com sucesso!\nLogin: admin / admin123");
    };
  }
});
