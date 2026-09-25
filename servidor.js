const mensagem = document.getElementById('mensagem');
const botaoComecar = document.getElementById('botaoComecar');
const botaoEntrar = document.getElementById('botaoEntrar');
const botaoAvaliacao = document.getElementById('botaoAvaliacao');
const botoesRecursos = document.querySelectorAll('[data-recurso]');

let tempoMensagem;

function mostrarMensagem(texto) {
  mensagem.textContent = texto;
  mensagem.classList.add('exibir');

  clearTimeout(tempoMensagem);

  tempoMensagem = setTimeout(() => {
    mensagem.classList.remove('exibir');
  }, 3500);
}

botaoComecar.addEventListener('click', () => {
  document
    .getElementById('como-funciona')
    .scrollIntoView({
      behavior: 'smooth'
    });

  mostrarMensagem(
    'Que bom ter você aqui! Vamos começar sua jornada.'
  );
});

botaoEntrar.addEventListener('click', () => {
  mostrarMensagem(
    'A área de login será implementada na próxima etapa.'
  );
});

botaoAvaliacao.addEventListener('click', () => {
  mostrarMensagem(
    'A pré-avaliação será adicionada na próxima etapa do projeto.'
  );
});

botoesRecursos.forEach((botao) => {
  botao.addEventListener('click', () => {
    const recurso = botao.dataset.recurso;

    const mensagens = {
      tradução: 'O tradutor será conectado à API em breve.',
      chat: 'O chat seguro será desenvolvido na próxima fase.',
      progresso: 'O painel de progresso será criado na próxima etapa.'
    };

    mostrarMensagem(mensagens[recurso]);
  });
});

fetch('/api/status')
  .then((resposta) => {
    if (!resposta.ok) {
      throw new Error('Erro ao consultar a API.');
    }

    return resposta.json();
  })
  .then((dados) => {
    console.log(`${dados.projeto}: ${dados.status}`);
  })
  .catch((erro) => {
    console.warn('Não foi possível conectar à API:', erro.message);
  });