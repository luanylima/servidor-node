const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

const hostname = '127.0.0.1';
const port = 3000;

const pastaPublica = __dirname;

const tiposDeConteudo = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const conexao = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petshopmorango'
});

conexao.connect((erro) => {
  if (erro) {
    console.error('Erro ao conectar ao MySQL:', erro.message);
    return;
  }

  console.log('Conectado ao MySQL com sucesso!');

  const criarTabelaAlunos = `
    CREATE TABLE IF NOT EXISTS alunos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL
    )
  `;

  conexao.query(criarTabelaAlunos, (erroTabela) => {
    if (erroTabela) {
      console.error('Erro ao criar a tabela alunos:', erroTabela.message);
      return;
    }

    console.log('Tabela alunos verificada com sucesso!');
  });
});

function responderJson(res, statusCode, dados) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8'
  });

  res.end(JSON.stringify(dados));
}

function enviarArquivo(res, caminhoDoArquivo) {
  fs.readFile(caminhoDoArquivo, (erro, conteudo) => {
    if (erro) {
      if (erro.code === 'ENOENT') {
        responderJson(res, 404, {
          erro: 'Arquivo não encontrado.'
        });

        return;
      }

      responderJson(res, 500, {
        erro: 'Erro ao carregar o arquivo.'
      });

      return;
    }

    const extensao = path.extname(caminhoDoArquivo).toLowerCase();
    const tipoDeConteudo = tiposDeConteudo[extensao] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': tipoDeConteudo
    });

    res.end(conteudo);
  });
}

function servirArquivoPublico(res, caminhoDaUrl) {
  let caminhoRelativo = caminhoDaUrl;

  if (caminhoRelativo === '/') {
    caminhoRelativo = '/index.html';
  }

  const caminhoDoArquivo = path.resolve(
    pastaPublica,
    `.${caminhoRelativo}`
  );

  const caminhoSeguro = `${pastaPublica}${path.sep}`;

  if (
    caminhoDoArquivo !== pastaPublica &&
    !caminhoDoArquivo.startsWith(caminhoSeguro)
  ) {
    responderJson(res, 403, {
      erro: 'Acesso negado.'
    });

    return;
  }

  enviarArquivo(res, caminhoDoArquivo);
}

function buscarAlunos(res) {
  const consulta = 'SELECT * FROM alunos ORDER BY id DESC';

  conexao.query(consulta, (erro, resultados) => {
    if (erro) {
      responderJson(res, 500, {
        erro: 'Erro ao buscar alunos.',
        detalhes: erro.message
      });

      return;
    }

    responderJson(res, 200, resultados);
  });
}

const servidor = http.createServer((req, res) => {
  const url = new URL(
    req.url,
    `http://${req.headers.host || `${hostname}:${port}`}`
  );

  const caminho = url.pathname;

  if (req.method === 'GET' && caminho === '/api/status') {
    responderJson(res, 200, {
      projeto: 'MultiLínguas',
      status: 'online',
      mensagem: 'Servidor funcionando corretamente.'
    });

    return;
  }

  if (req.method === 'GET' && caminho === '/api/idiomas') {
    responderJson(res, 200, [
      {
        id: 1,
        nome: 'Inglês',
        codigo: 'en',
        bandeira: '🇺🇸'
      },
      {
        id: 2,
        nome: 'Espanhol',
        codigo: 'es',
        bandeira: '🇪🇸'
      },
      {
        id: 3,
        nome: 'Francês',
        codigo: 'fr',
        bandeira: '🇫🇷'
      }
    ]);

    return;
  }

  if (req.method === 'GET' && caminho === '/alunos') {
    buscarAlunos(res);
    return;
  }

  if (req.method === 'GET') {
    servirArquivoPublico(res, caminho);
    return;
  }

  responderJson(res, 405, {
    erro: 'Método não permitido.'
  });
});

servidor.listen(port, hostname, () => {
  console.log(`Servidor rodando em http://${hostname}:${port}`);
});