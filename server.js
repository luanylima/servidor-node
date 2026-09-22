const http = require('http');
const mysql = require('mysql2');
const { install } = require('undici-types');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'petshopmorango'
});

connection.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao MySQL: ', err.stack );
      return;
    }
    console.log('Conectado ao MySQL com sucesso!');

    // Cria a tabela 'alunos'  caso ela não exista
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS alunos(
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL
      )`;
      connection.query( createTableQuery, (err) => {
        if (err) {
          console.error('Erro ao criar tabela: ', err.stack );
          return;
        }
      } );
});

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
 
  if (req.url === '/' ) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Página Inicial</h1>'); // O return impede a execução das linhas de baixo
    return;
  }
 
  if (req.url === '/alunos' && req.method === 'GET') {
    connection.query('SELECT * FROM alunos;', (err, results) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/json; charset=utf-8' });
        res.end(JSON.stringify({ erro: err.message }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/json; charset=utf-8' });
      return res.end(JSON.stringify( results ));        

    });
  }

});

server.listen(port, hostname, () => {
  console.log(`Servidor rodando em http://${hostname}:${port}/`);
});

