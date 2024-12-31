const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./admin.db', (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
  } else {
    console.log('Banco de dados conectado.');

    // Criar a tabela de administradores se não existir
    db.run(`
      CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `, (err) => {
      if (err) {
        console.error('Erro ao criar a tabela admin:', err.message);
      } else {
        console.log('Tabela admin verificada/criada com sucesso.');

        // Inserir o administrador padrão
        const username = 'admin';
        const password = 'admin123'; // Senha em texto simples

        db.run(
          `INSERT OR IGNORE INTO admin (username, password) VALUES (?, ?)`,
          [username, password],
          (err) => {
            if (err) {
              console.error('Erro ao criar o administrador padrão:', err.message);
            } else {
              console.log('Administrador padrão criado com sucesso.');
            }
          }
        );
      }
    });

    // Criar a tabela de notícias se não existir
    db.run(`
      CREATE TABLE IF NOT EXISTS noticias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        conteudo TEXT NOT NULL,
        data TEXT NOT NULL
      )
    `, (err) => {
      if (err) {
        console.error('Erro ao criar a tabela noticias:', err.message);
      } else {
        console.log('Tabela noticias verificada/criada com sucesso.');
      }
    });
  }
});

module.exports = db;
