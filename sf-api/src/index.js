const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');
const transactionRoutes = require('./transactions');

const app = express();

app.use(express.json());
app.use(cors());

// Rotas públicas
app.use('/auth', authRoutes);

// Rotas privadas de transações
app.use('/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API do Schwantes Finance rodando perfeitamente!' });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor Schwantes Finance rodando na porta ${PORT}`);
});