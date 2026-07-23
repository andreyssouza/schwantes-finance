const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');
const transactionRoutes = require('./transactions');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API do Schwantes Finance rodando perfeitamente!' });
});

module.exports = app;