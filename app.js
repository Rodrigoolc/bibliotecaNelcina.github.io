const IP = "http://192.168.1.17";
async function atualizar() {
  try {
    // --------------------------
    // STATUS DE CONEXÃO
    // --------------------------
    const st = await fetch(IP + "/api/status");
    const statusOK = st.ok;

    document.getElementById("statusDot").className =
      statusOK ? "conectado" : "desconectado";

    document.getElementById("statusTexto").innerText =
      statusOK ? "Conectado" : "Desconectado";

    document.getElementById("statusIP").innerText =
      statusOK ? "• IP: " + IP.replace("http://", "") : "";

    // --------------------------
    // LISTA DE LIVROS
    // --------------------------
    const res = await fetch(IP + "/api/livros");
    const data = await res.json();

    document.getElementById("statusQtde").innerText =
      `• Livros: ${data.livros.length}`;

    const grade = document.getElementById("gradeLivros");
    grade.innerHTML = "";

    // multi-grid 3x4
    let cursor = 0;
    let estado = "";
    let selecionado = -1;

    // pega estado/cursor separadamente
    try {
      const s2 = await fetch(IP + "/api/state");
      const d2 = await s2.json();
      cursor = d2.cursor;
      estado = d2.estado;
      selecionado = d2.livroSelecionado;
    } catch {}

    data.livros.forEach((livro, i) => {
      const div = document.createElement("div");
      div.className = "cardLivro";

      if (i === cursor && estado === "MENU_LIVROS")
        div.classList.add("cardSelecionado");

      div.innerText = livro.nome + (livro.lido ? " ✓" : "");

      grade.appendChild(div);
    });

  } catch (e) {
    document.getElementById("statusDot").className = "desconectado";
    document.getElementById("statusTexto").innerText = "Desconectado";
  }
}

async function enviar(n) {
  await fetch(IP + "/api/button?btn=" + n);
  atualizar();
}

setInterval(atualizar, 500);
atualizar();
