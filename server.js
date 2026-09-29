const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

const hostname = '127.0.0.1';
const port = 3000;
const pastaPublica = __dirname;

const conexao = mysql.createPool({
  host: 'localhost', user: 'root', password: '', database: 'multi_linguas',
  waitForConnections: true, connectionLimit: 10, queueLimit: 0
});

conexao.getConnection((erro, connection) => {
  if (erro) { console.error('❌ Erro ao conectar ao MySQL:', erro.message); return; }
  console.log('✅ Conectado ao MySQL com sucesso!');
  connection.release();
});

const tiposDeConteudo = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
};

function responderJson(res, statusCode, dados) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(dados));
}

function enviarArquivo(res, caminhoDoArquivo) {
  fs.readFile(caminhoDoArquivo, (erro, conteudo) => {
    if (erro) return responderJson(res, erro.code === 'ENOENT' ? 404 : 500, { erro: erro.code === 'ENOENT' ? 'Arquivo não encontrado.' : 'Erro ao carregar o arquivo.' });
    res.writeHead(200, { 'Content-Type': tiposDeConteudo[path.extname(caminhoDoArquivo).toLowerCase()] || 'application/octet-stream' });
    res.end(conteudo);
  });
}

function servirArquivoPublico(res, caminhoDaUrl) {
  // O login é a porta de entrada; index.html continua disponível como terminal principal.
  const caminhoRelativo = caminhoDaUrl === '/' ? '/login.html' : caminhoDaUrl;
  const caminhoDoArquivo = path.resolve(pastaPublica, `.${caminhoRelativo}`);
  const caminhoSeguro = `${pastaPublica}${path.sep}`;
  if (caminhoDoArquivo !== pastaPublica && !caminhoDoArquivo.startsWith(caminhoSeguro)) return responderJson(res, 403, { erro: 'Acesso negado.' });
  enviarArquivo(res, caminhoDoArquivo);
}

function statusSistema(res) { responderJson(res, 200, { projeto: 'Multi Línguas', versao: '2.0', status: 'online', servidor: 'Node.js', banco: 'MySQL', database: 'multi_linguas', mensagem: 'Servidor funcionando corretamente.' }); }

function consultaApi(res, consulta, parametros = [], mensagem) {
  conexao.query(consulta, parametros, (erro, resultados) => {
    if (erro) { console.error(mensagem, erro.message); return responderJson(res, 500, { erro: mensagem, detalhes: erro.message }); }
    responderJson(res, 200, resultados);
  });
}
function buscarIdiomas(res) { consultaApi(res, 'SELECT id, codigo, nome, nome_nativo, ativo, suporte_traducao FROM idiomas WHERE ativo = TRUE ORDER BY nome ASC', [], 'Erro ao buscar idiomas.'); }
function buscarAlunos(res) { consultaApi(res, `SELECT u.id, u.nome, u.email, u.data_nascimento, u.status, u.email_verificado, p.nivel_atual, p.estilo_vocabulario, p.tempo_pratica_minutos FROM usuarios u LEFT JOIN perfis_alunos p ON p.usuario_id = u.id WHERE u.tipo_usuario = 'ALUNO' AND u.excluido_em IS NULL ORDER BY u.id DESC`, [], 'Erro ao buscar alunos.'); }
function buscarPlanos(res) { consultaApi(res, 'SELECT id, nome, descricao, preco_mensal, limite_traducoes_semana, limite_consultas_semana, recursos_ilimitados, ativo FROM planos WHERE ativo = TRUE ORDER BY preco_mensal ASC', [], 'Erro ao buscar planos.'); }
function buscarVocabulario(res, url) { const id = url.searchParams.get('usuario_id'); if (!id) return responderJson(res, 400, { erro: 'Informe o usuario_id.' }); consultaApi(res, 'SELECT v.id, v.palavra, v.traducao, v.definicao, v.exemplo, v.categoria, v.frequencia_uso, v.favorita, v.aprendida, i.codigo AS idioma_codigo, i.nome AS idioma FROM vocabulario v INNER JOIN idiomas i ON i.id = v.idioma_id WHERE v.usuario_id = ? ORDER BY v.frequencia_uso DESC', [id], 'Erro ao buscar vocabulário.'); }
function buscarProgresso(res, url) { const id = url.searchParams.get('usuario_id'); if (!id) return responderJson(res, 400, { erro: 'Informe o usuario_id.' }); consultaApi(res, 'SELECT pa.id, ma.id AS modulo_id, ma.titulo AS modulo, ma.nivel, i.nome AS idioma, pa.status, pa.percentual, pa.tempo_pratica_minutos, pa.vocabulario_assimilado, pa.iniciado_em, pa.concluido_em FROM progresso_aprendizado pa INNER JOIN modulos_aprendizado ma ON ma.id = pa.modulo_id INNER JOIN idiomas i ON i.id = ma.idioma_id WHERE pa.usuario_id = ? ORDER BY ma.ordem ASC', [id], 'Erro ao buscar progresso.'); }

const servidor = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `${hostname}:${port}`}`);
  const caminho = url.pathname;
  if (req.method === 'GET' && caminho === '/api/status') return statusSistema(res);
  if (req.method === 'GET' && caminho === '/api/idiomas') return buscarIdiomas(res);
  if (req.method === 'GET' && caminho === '/api/alunos') return buscarAlunos(res);
  if (req.method === 'GET' && caminho === '/api/planos') return buscarPlanos(res);
  if (req.method === 'GET' && caminho === '/api/vocabulario') return buscarVocabulario(res, url);
  if (req.method === 'GET' && caminho === '/api/progresso') return buscarProgresso(res, url);
  if (req.method === 'GET') return servirArquivoPublico(res, caminho);
  responderJson(res, 405, { erro: 'Método não permitido.' });
});

servidor.listen(port, hostname, () => {
  console.log('======================================');
  console.log('       MULTI LÍNGUAS - SERVIDOR');
  console.log('======================================');
  console.log(`Servidor: http://${hostname}:${port}`);
  console.log('Status:   ONLINE');
  console.log('======================================');
});
