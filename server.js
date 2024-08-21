const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

app.use(express.json());

// Configuração do pool de conexões
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'login_bipbus'
});

// Rota de login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM login WHERE User = ?', [email]);
    if (rows.length > 0) {
      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.Senha);
      if (isMatch) {
        return res.json({ success: true });
      } else {
        return res.json({ success: false, message: 'Senha incorreta.' });
      }
    } else {
      return res.json({ success: false, message: 'Usuário não encontrado.' });
    }
  } catch (err) {
    console.error('Erro ao executar a consulta:', err);
    res.status(500).json({ success: false, message: 'Erro ao conectar ao servidor.' });
  }
});

// Rota de cadastro
app.post('/cadastro', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await pool.query('INSERT INTO login (User, Senha, Type) VALUES (?, ?, ?)', [email, hashedPassword, 0]);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao executar a consulta:', err);
    res.status(500).json({ success: false, message: 'Erro ao conectar ao servidor.' });
  }
});

// Rota para verificar e-mail
app.post('/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM login WHERE User = ?', [email]);
    if (rows.length > 0) {
      return res.json({ available: false });
    }
    res.json({ available: true });
  } catch (err) {
    console.error('Erro ao verificar e-mail:', err);
    res.status(500).json({ error: 'Erro ao verificar e-mail' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


