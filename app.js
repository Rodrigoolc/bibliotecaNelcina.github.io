const IP = "http://SEU_IP_AQUI";
let conectado = false;
let intervaloAtualizacao;

async function verificarConexao() {
  try {
    const resposta = await fetch(IP + "/api/state", { timeout: 2000 });
    conectado = resposta.ok;
  } catch (erro) {
    conectado = false;
  }
  
  atualizarStatusConexao();
  return conectado;
}

function atualizarStatusConexao() {
  const icon = document.getElementById('status-icon');
  const text = document.getElementById('status-text');
  const ipText = document.getElementById('ip-text');
  
  if (conectado) {
    icon.className = 'status-icon conectado';
    text.textContent = 'Conectado';
    ipText.textContent = IP.replace('http://', '');
  } else {
    icon.className = 'status-icon desconectado';
    text.textContent = 'Desconectado';
    ipText.textContent = 'Não conectado';
  }
}

async function carregarLivros() {
  try {
    const res = await fetch(IP + "/api/livros");
    const data = await res.json();
    const livrosGrid = document.getElementById('livros-grid');
    const livrosCount = document.getElementById('livros-count');
    
    livrosCount.textContent = data.livros.length || 0;
    
    // Limpar grid
    livrosGrid.innerHTML = '';
    
    // Criar cards para cada livro
    data.livros.forEach((livro, index) => {
      const card = document.createElement('div');
      card.className = `livro-card ${livro.lido ? 'lido' : ''}`;
      card.dataset.id = livro.id;
      
      card.innerHTML = `
        <div class="livro-nome">${livro.nome}</div>
        <div class="livro-status">${livro.lido ? '✔ Lido' : 'Não lido'}</div>
      `;
      
      // Adicionar evento de clique para selecionar livro
      card.addEventListener('click', () => {
        selecionarLivro(livro.id);
      });
      
      livrosGrid.appendChild(card);
    });
    
    // Preencher espaços vazios na grade (3x4 = 12 posições)
    const totalCards = data.livros.length;
    for (let i = totalCards; i < 12; i++) {
      const cardVazio = document.createElement('div');
      cardVazio.className = 'livro-card';
      cardVazio.innerHTML = '<div class="livro-status">Vazio</div>';
      livrosGrid.appendChild(cardVazio);
    }
    
  } catch (erro) {
    console.error('Erro ao carregar livros:', erro);
    document.getElementById('livros-count').textContent = '0';
  }
}

async function atualizarEstado() {
  if (!conectado) {
    await verificarConexao();
    if (!conectado) return;
  }
  
  try {
    const res = await fetch(IP + "/api/state");
    const data = await res.json();
    
    const conteudo = document.getElementById('conteudo');
    const livrosGrid = document.getElementById('livros-grid');
    
    // Limpar seleção anterior
    document.querySelectorAll('.livro-card').forEach(card => {
      card.classList.remove('selecionado');
    });
    
    if (data.estado === "MENU_LIVROS") {
      livrosGrid.style.display = 'grid';
      conteudo.classList.remove('ativo');
      
      // Destacar livro selecionado
      if (data.visiveis && data.visiveis[data.cursor] !== undefined) {
        const livroId = data.visiveis[data.cursor];
        const card = document.querySelector(`.livro-card[data-id="${livroId}"]`);
        if (card) {
          card.classList.add('selecionado');
        }
      }
    } 
    else {
      livrosGrid.style.display = 'none';
      conteudo.classList.add('ativo');
      
      let html = "";
      
      if (data.estado === "MENU_OPCOES") {
        html += "Opções do Livro:\n\n";
        html += (data.cursor === 0 ? "👉 Ler Resumo\n" : "   Ler Resumo\n");
        html += (data.cursor === 1 ? "👉 Fazer Teste\n" : "   Fazer Teste\n");
      }
      else if (data.estado === "MENU_RESUMO") {
        html += "Resumo do Livro\n\n";
        html += "Aqui será exibido o resumo do livro selecionado...";
      }
      else if (data.estado === "MENU_TESTE") {
        html += "Teste do Livro\n\n";
        html += "Aqui será exibido o teste do livro selecionado...";
      }
      
      conteudo.innerText = html;
    }
    
    await carregarLivros();
    
  } catch (erro) {
    console.error('Erro ao atualizar estado:', erro);
    conectado = false;
    atualizarStatusConexao();
  }
}

function selecionarLivro(id) {
  // Simular navegação até o livro selecionado
  enviar(2); // Confirmar
}

async function enviar(botao) {
  if (!conectado) {
    alert('Não conectado ao ESP!');
    return;
  }
  
  try {
    await fetch(IP + "/api/button?btn=" + botao);
    // Pequeno delay para o ESP processar
    setTimeout(atualizarEstado, 100);
  } catch (erro) {
    console.error('Erro ao enviar comando:', erro);
    conectado = false;
    atualizarStatusConexao();
  }
}

// Inicialização
async function iniciar() {
  await verificarConexao();
  
  if (conectado) {
    await carregarLivros();
    await atualizarEstado();
    
    // Atualizar a cada 500ms
    intervaloAtualizacao = setInterval(atualizarEstado, 500);
  } else {
    // Tentar reconectar a cada 5 segundos
    setInterval(verificarConexao, 5000);
  }
}

// Adicionar eventos de teclado para navegação
document.addEventListener('keydown', (e) => {
  if (!conectado) return;
  
  switch(e.key) {
    case 'ArrowUp':
      e.preventDefault();
      enviar(0);
      break;
    case 'ArrowDown':
      e.preventDefault();
      enviar(1);
      break;
    case 'Enter':
      e.preventDefault();
      enviar(2);
      break;
    case 'Escape':
    case 'Backspace':
      e.preventDefault();
      enviar(3);
      break;
  }
});

// Iniciar quando a página carregar
document.addEventListener('DOMContentLoaded', iniciar);