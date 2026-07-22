const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('./authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Aplica o middleware em TODAS as rotas deste arquivo
router.use(authMiddleware);

// 1. Criar nova transação (Entrada ou Saída)
router.post('/', async (req, res) => {
  try {
    const { description, amount, type } = req.body;

    if (!description || !amount || !type) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount: parseFloat(amount),
        type, // 'INCOME' ou 'EXPENSE'
        userId: req.userId, // Veio do token JWT no middleware
      },
    });

    return res.status(201).json(transaction);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar transação.' });
  }
});

// 2. Listar todas as transações do usuário logado + Resumo de Totais
router.get('/', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    });

    // Calcula os totais automaticamente no backend
    const summary = transactions.reduce(
      (acc, item) => {
        if (item.type === 'INCOME') {
          acc.income += item.amount;
          acc.total += item.amount;
        } else if (item.type === 'EXPENSE') {
          acc.expense += item.amount;
          acc.total -= item.amount;
        }
        return acc;
      },
      { income: 0, expense: 0, total: 0 }
    );

    return res.json({ transactions, summary });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar transações.' });
  }
});

// 3. Deletar uma transação
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Garante que a transação pertence ao usuário logado antes de deletar
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: req.userId },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada.' });
    }

    await prisma.transaction.delete({ where: { id } });

    return res.json({ message: 'Transação removida com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao deletar transação.' });
  }
});

module.exports = router;