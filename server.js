const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

const hostname = '127.0.0.1';
const port = process.env.PORT || 3000;
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
  const caminhoRelativo = caminhoDaUrl === '/' ? '/multi-front/index.html' : caminhoDaUrl;
  const caminhoDoArquivo = path.resolve(pastaPublica, `.${caminhoRelativo}`);
  const caminhoSeguro = `${pastaPublica}${path.sep}`;
  if (caminhoDoArquivo !== pastaPublica && !caminhoDoArquivo.startsWith(caminhoSeguro)) return responderJson(res, 403, { erro: 'Acesso negado.' });
  enviarArquivo(res, caminhoDoArquivo);
}

function statusSistema(res) { responderJson(res, 200, { projeto: 'Multi Línguas', versao: '2.0', status: 'online', servidor: 'Node.js', banco: 'MySQL', database: 'multi_linguas', mensagem: 'Serviço operacional' }); }

function consultaApi(res, consulta, parametros = [], mensagem) {
  conexao.query(consulta, parametros, (erro, resultados) => {
    if (erro) { console.error(mensagem, erro.message); return responderJson(res, 500, { erro: mensagem, detalhes: erro.message }); }
    responderJson(res, 200, resultados);
  });
}
function buscarIdiomas(res) { consultaApi(res, 'SELECT id, codigo, nome, nome_nativo, ativo, suporte_traducao FROM idiomas WHERE ativo = TRUE ORDER BY nome ASC', [], 'Erro ao buscar idiomas.'); }
function buscarAlunos(res) { consultaApi(res, `SELECT u.id, u.nome, u.email, u.data_nascimento, u.status, u.email_verificado, p.nivel_atual, p.estilo_vocabulario, p.tempo_pratica_minutos FROM usuarios u LEFT JOIN perfis p ON p.usuario_id = u.id`, [], 'Erro ao buscar alunos.'); }
function buscarPlanos(res) { consultaApi(res, 'SELECT id, nome, descricao, preco_mensal, limite_traducoes_semana, limite_consultas_semana, recursos_ilimitados, ativo FROM planos WHERE ativo = TRUE', [], 'Erro ao buscar planos.'); }
function buscarVocabulario(res, url) { const id = url.searchParams.get('usuario_id'); if (!id) return responderJson(res, 400, { erro: 'Informe o usuario_id.' }); consultaApi(res, 'SELECT v.id, v.palavra, v.traducao, v.frequencia FROM vocabulario v WHERE v.usuario_id = ? ORDER BY v.frequencia DESC', [id], 'Erro ao buscar vocabulário.'); }
function buscarProgresso(res, url) { const id = url.searchParams.get('usuario_id'); if (!id) return responderJson(res, 400, { erro: 'Informe o usuario_id.' }); consultaApi(res, 'SELECT pa.id, pa.modulo_id, pa.completado_em FROM progresso_aluno pa WHERE pa.usuario_id = ? ORDER BY pa.completado_em DESC', [id], 'Erro ao buscar progresso.'); }

// --- Simple file-based storage for academic delivery (RF01, RF02) ---
const DATA_DIR = path.join(__dirname, 'data');
const PLANS_FILE = path.join(DATA_DIR, 'plans.json');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');

try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PLANS_FILE)) fs.writeFileSync(PLANS_FILE, JSON.stringify({}), 'utf8');
  if (!fs.existsSync(PROGRESS_FILE)) fs.writeFileSync(PROGRESS_FILE, JSON.stringify([]), 'utf8');
} catch (err) {
  console.error('Erro ao garantir arquivos de dados locais:', err);
}

function readJSONSync(file, fallback) {
  try { const s = fs.readFileSync(file, 'utf8'); return s ? JSON.parse(s) : fallback; } catch (e) { return fallback; }
}
function writeJSONSync(file, obj) { try { fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8'); } catch (e) { console.error('Erro ao escrever JSON:', e); } }

function coletarCorpo(req, callback) {
  let dados = '';
  req.on('data', chunk => { dados += chunk.toString(); if (dados.length > 1e6) req.socket.destroy(); });
  req.on('end', () => { callback(dados); });
}

const servidor = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `${hostname}:${port}`}`);
  const caminho = url.pathname;

  // POST - RF01: Definir/atualizar plano do usuário (simples, arquivo local)
  if (req.method === 'POST' && caminho === '/api/plan') {
    return coletarCorpo(req, body => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const { userId, plan } = parsed;
        if (!userId || !plan) return responderJson(res, 400, { error: 'userId e plan são obrigatórios' });
        const plans = readJSONSync(PLANS_FILE, {});
        plans[userId] = { plan, updatedAt: new Date().toISOString() };
        writeJSONSync(PLANS_FILE, plans);
        return responderJson(res, 200, { ok: true, plan: plans[userId] });
      } catch (err) {
        return responderJson(res, 400, { error: 'JSON inválido' });
      }
    });
  }

  // POST - RF02: Registrar progresso (módulo concluído)
  if (req.method === 'POST' && caminho === '/api/progress') {
    return coletarCorpo(req, body => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const { userId, moduleId } = parsed;
        if (!userId || !moduleId) return responderJson(res, 400, { error: 'userId e moduleId são obrigatórios' });
        const list = readJSONSync(PROGRESS_FILE, []);
        const entry = { userId, moduleId, completedAt: new Date().toISOString() };
        list.push(entry);
        writeJSONSync(PROGRESS_FILE, list);
        return responderJson(res, 200, { ok: true, entry });
      } catch (err) {
        return responderJson(res, 400, { error: 'JSON inválido' });
      }
    });
  }

  // GET - acesso simples aos dados locais (para verificação rápida)
  if (req.method === 'GET' && caminho === '/local/plan') {
    const q = url.searchParams.get('userId');
    if (!q) return responderJson(res, 400, { error: 'Informe userId via query string ?userId=...' });
    const plans = readJSONSync(PLANS_FILE, {});
    const p = plans[q];
    if (!p) return responderJson(res, 404, { error: 'Plano não encontrado' });
    return responderJson(res, 200, p);
  }

  if (req.method === 'GET' && caminho === '/local/progress') {
    const q = url.searchParams.get('userId');
    if (!q) return responderJson(res, 400, { error: 'Informe userId via query string ?userId=...' });
    const list = readJSONSync(PROGRESS_FILE, []);
    const userProgress = list.filter(e => e.userId === q);
    return responderJson(res, 200, { userId: q, totalCompleted: userProgress.length, lessons: userProgress });
  }

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
