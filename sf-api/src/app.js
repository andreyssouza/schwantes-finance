const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');
const transactionRoutes = require('./transactions');
const goalRoutes = require('./goals');
const investmentRoutes = require('./investments');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/transactions', transactionRoutes);
app.use('/goals', goalRoutes);
app.use('/investments', investmentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API do Schwantes Finance rodando perfeitamente!' });
});

module.exports = app;