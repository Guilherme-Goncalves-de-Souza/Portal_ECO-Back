const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const db = require("./database");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para interpretar JSON e formular dados
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar CORS para permitir o front-end na porta 5173
app.use(
  cors({
    origin: "http://localhost:5173", // Permitir somente o front-end
    credentials: true, // Permitir envio de cookies e cabeçalhos de autenticação
  })
);

// Configuração de sessão
app.use(
  session({
    secret: "chave-secreta", // Substitua por uma chave segura em produção
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Use secure: true para HTTPS
  })
);

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, "public")));

// Rota para servir a página de login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login", "login.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM admin WHERE username = ?`, [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Erro no servidor." });
    }
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Usuário ou senha inválidos." });
    }

    // Salvar o login na sessão
    req.session.user = { id: user.id, username: user.username };

    // Redirecionar para o dashboard
    res.redirect("/dashboard");
  });
});
// Middleware para verificar autenticação
function verificarAutenticacao(req, res, next) {
  if (req.session.user) {
    return next(); // O usuário está autenticado
  }
  res.redirect("/login"); // Redireciona para login caso não esteja autenticado
}

// Dashboard: só acessível para usuários autenticados
app.get("/dashboard", verificarAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard", "dashboard.html"));
});

// Rota para adicionar notícias (protegida)
app.post("/noticias", verificarAutenticacao, (req, res) => {
  const { titulo, conteudo } = req.body;

  console.log("Dados recebidos:", { titulo, conteudo });

  if (!titulo || !conteudo) {
    console.error("Erro: Título ou conteúdo ausente.");
    return res
      .status(400)
      .json({ error: "Título e conteúdo são obrigatórios." });
  }

  const data = new Date().toLocaleDateString();

  db.run(
    `INSERT INTO noticias (titulo, conteudo, data) VALUES (?, ?, ?)`,
    [titulo, conteudo, data],
    (err) => {
      if (err) {
        console.error("Erro ao adicionar notícia:", err.message);
        res.status(500).json({ error: "Erro ao adicionar notícia." });
      } else {
        console.log("Notícia adicionada com sucesso.");
        res.status(201).json({ message: "Notícia adicionada com sucesso!" });
      }
    }
  );
});

// Rota para listar todas as notícias
app.get("/noticias", (req, res) => {
  db.all(`SELECT * FROM noticias ORDER BY id DESC`, [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar notícias:", err.message);
      res.status(500).json({ error: "Erro ao buscar notícias." });
    } else {
      res.status(200).json(rows);
    }
  });
});

// Logout: encerra a sessão e redireciona para login
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao encerrar a sessão." });
    }
    res.redirect("/login"); // Redireciona para a página de login após o logout
  });
});

// Página inicial redireciona para login
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
