const IP = "http://SEU_IP_AQUI";

async function atualizar() {
  let res = await fetch(IP + "/api/estado");
  let data = await res.json();

  let html = "";

  if (data.estado === 0) { // MENU_LIVROS
    html += "Livros:\n\n";
    data.livrosVisiveis.forEach((l, i) => {
      html += (data.cursor === i ? "👉 " : "   ");
      html += l.nome + (l.lido ? " (lido)" : "") + "\n";
    });
  }

  else if (data.estado === 1) {
    html += "Opções:\n\n";
    html += (data.cursor === 0 ? "👉 Resumo\n" : "   Resumo\n");
    html += (data.cursor === 1 ? "👉 Teste\n" : "   Teste\n");
  }

  document.getElementById("conteudo").innerText = html;
}

async function enviar(botao) {
  await fetch(IP + "/api/comando?btn=" + botao);
  atualizar();
}

setInterval(atualizar, 400);
