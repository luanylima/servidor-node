const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');


const hostname = '127.0.0.1';
const port = 3000;

const pastaPublica = __dirname;



const conexao = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'multi_linguas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


conexao.getConnection((erro, connection) => {
  if (erro) {
    console.error('❌ Erro ao conectar ao MySQL:');
    console.error(erro.message);
    return;
  }

  console.log('✅ Conectado ao MySQL com sucesso!');

  connection.release();
});

const tiposDeConteudo = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function responderJson(res, statusCode, dados) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
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

      console.error(erro);

      responderJson(res, 500, {
        erro: 'Erro ao carregar o arquivo.'
      });

      return;
    }

    const extensao = path.extname(caminhoDoArquivo).toLowerCase();

    const tipoDeConteudo =
      tiposDeConteudo[extensao] ||
      'application/octet-stream';

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

function statusSistema(res) {

  responderJson(res, 200, {
    projeto: 'Multi Línguas',
    versao: '2.0',
    status: 'online',
    servidor: 'Node.js',
    banco: 'MySQL',
    database: 'multi_linguas',
    mensagem: 'Servidor funcionando corretamente.'
  });
}

function buscarIdiomas(res) {

  const consulta = `
    SELECT
      id,
      codigo,
      nome,
      nome_nativo,
      ativo,
      suporte_traducao
    FROM idiomas
    WHERE ativo = TRUE
    ORDER BY nome ASC
  `;

  conexao.query(consulta, (erro, resultados) => {

    if (erro) {

      console.error('Erro ao buscar idiomas:', erro.message);

      responderJson(res, 500, {
        erro: 'Erro ao buscar idiomas.',
        detalhes: erro.message
      });

      return;
    }

    responderJson(res, 200, resultados);
  });
}

function buscarAlunos(res) {

  const consulta = `
    SELECT
      u.id,
      u.nome,
      u.email,
      u.data_nascimento,
      u.status,
      u.email_verificado,
      p.nivel_atual,
      p.estilo_vocabulario,
      p.tempo_pratica_minutos
    FROM usuarios u

    LEFT JOIN perfis_alunos p
      ON p.usuario_id = u.id

    WHERE u.tipo_usuario = 'ALUNO'
      AND u.excluido_em IS NULL

    ORDER BY u.id DESC
  `;

  conexao.query(consulta, (erro, resultados) => {

    if (erro) {

      console.error('Erro ao buscar alunos:', erro.message);

      responderJson(res, 500, {
        erro: 'Erro ao buscar alunos.',
        detalhes: erro.message
      });

      return;
    }

    responderJson(res, 200, resultados);
  });
}

function buscarPlanos(res) {

  const consulta = `
    SELECT
      id,
      nome,
      descricao,
      preco_mensal,
      limite_traducoes_semana,
      limite_consultas_semana,
      recursos_ilimitados,
      ativo
    FROM planos
    WHERE ativo = TRUE
    ORDER BY preco_mensal ASC
  `;

  conexao.query(consulta, (erro, resultados) => {

    if (erro) {

      console.error('Erro ao buscar planos:', erro.message);

      responderJson(res, 500, {
        erro: 'Erro ao buscar planos.',
        detalhes: erro.message
      });

      return;
    }

    responderJson(res, 200, resultados);
  });
}


function buscarVocabulario(res, url) {

  const usuarioId = url.searchParams.get('usuario_id');

  if (!usuarioId) {

    responderJson(res, 400, {
      erro: 'Informe o usuario_id.'
    });

    return;
  }

  const consulta = `
    SELECT
      v.id,
      v.palavra,
      v.traducao,
      v.definicao,
      v.exemplo,
      v.categoria,
      v.frequencia_uso,
      v.favorita,
      v.aprendida,
      i.codigo AS idioma_codigo,
      i.nome AS idioma
    FROM vocabulario v

    INNER JOIN idiomas i
      ON i.id = v.idioma_id

    WHERE v.usuario_id = ?

    ORDER BY v.frequencia_uso DESC
  `;

  conexao.query(
    consulta,
    [usuarioId],
    (erro, resultados) => {

      if (erro) {

        console.error(
          'Erro ao buscar vocabulário:',
          erro.message
        );

        responderJson(res, 500, {
          erro: 'Erro ao buscar vocabulário.',
          detalhes: erro.message
        });

        return;
      }

      responderJson(res, 200, resultados);
    }
  );
}

function buscarProgresso(res, url) {

  const usuarioId = url.searchParams.get('usuario_id');

  if (!usuarioId) {

    responderJson(res, 400, {
      erro: 'Informe o usuario_id.'
    });

    return;
  }

  const consulta = `
    SELECT
      pa.id,
      ma.id AS modulo_id,
      ma.titulo AS modulo,
      ma.nivel,
      i.nome AS idioma,
      pa.status,
      pa.percentual,
      pa.tempo_pratica_minutos,
      pa.vocabulario_assimilado,
      pa.iniciado_em,
      pa.concluido_em
    FROM progresso_aprendizado pa

    INNER JOIN modulos_aprendizado ma
      ON ma.id = pa.modulo_id

    INNER JOIN idiomas i
      ON i.id = ma.idioma_id

    WHERE pa.usuario_id = ?

    ORDER BY ma.ordem ASC
  `;

  conexao.query(
    consulta,
    [usuarioId],
    (erro, resultados) => {

      if (erro) {

        console.error(
          'Erro ao buscar progresso:',
          erro.message
        );

        responderJson(res, 500, {
          erro: 'Erro ao buscar progresso.',
          detalhes: erro.message
        });

        return;
      }

      responderJson(res, 200, resultados);
    }
  );
}

const servidor = http.createServer((req, res) => {

  const url = new URL(
    req.url,
    `http://${req.headers.host || `${hostname}:${port}`}`
  );

  const caminho = url.pathname;


  if (
    req.method === 'GET' &&
    caminho === '/api/status'
  ) {

    statusSistema(res);
    return;
  }

  if (
    req.method === 'GET' &&
    caminho === '/api/idiomas'
  ) {

    buscarIdiomas(res);
    return;
  }

  if (
    req.method === 'GET' &&
    caminho === '/api/alunos'
  ) {

    buscarAlunos(res);
    return;
  }


  if (
    req.method === 'GET' &&
    caminho === '/api/planos'
  ) {

    buscarPlanos(res);
    return;
  }

  if (
    req.method === 'GET' &&
    caminho === '/api/vocabulario'
  ) {

    buscarVocabulario(res, url);
    return;
  }

  if (
    req.method === 'GET' &&
    caminho === '/api/progresso'
  ) {

    buscarProgresso(res, url);
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

  console.log('');
  console.log('======================================');
  console.log('       MULTI LÍNGUAS - SERVIDOR');
  console.log('======================================');
  console.log(`Servidor: http://${hostname}:${port}`);
  console.log(`Banco:    multi_linguas`);
  console.log('Status:   ONLINE');
  console.log('======================================');
  console.log('');
});
