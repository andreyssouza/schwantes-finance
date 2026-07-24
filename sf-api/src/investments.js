const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('./authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Listar investimentos do usuário logado
router.get('/', async (req, res) => {
  try {
    const investments = await prisma.investment.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(investments);
  } catch (error) {
    console.error('Erro ao listar investimentos:', error);
    return res.status(500).json({ error: 'Erro ao listar investimentos.' });
  }
});

// Criar investimento
router.post('/', async (req, res) => {
  try {
    const { name, type, investedAmount, currentValue, monthlyRate } = req.body;

    if (!name || !type || investedAmount === undefined) {
      return res.status(400).json({ error: 'Preencha os campos obrigatórios.' });
    }

    const investment = await prisma.investment.create({
      data: {
        name,
        type,
        investedAmount: parseFloat(investedAmount),
        currentValue: parseFloat(currentValue || investedAmount),
        monthlyRate: parseFloat(monthlyRate || 0),
        userId: req.userId,
      },
    });

    return res.status(201).json(investment);
  } catch (error) {
    console.error('Erro ao criar investimento:', error);
    return res.status(500).json({ error: 'Erro ao criar investimento.' });
  }
});

// Atualizar investimento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, investedAmount, currentValue, monthlyRate } = req.body;

    const existingInvestment = await prisma.investment.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existingInvestment) {
      return res.status(404).json({ error: 'Investimento não encontrado.' });
    }

    const updatedInvestment = await prisma.investment.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(investedAmount !== undefined ? { investedAmount: parseFloat(investedAmount) } : {}),
        ...(currentValue !== undefined ? { currentValue: parseFloat(currentValue) } : {}),
        ...(monthlyRate !== undefined ? { monthlyRate: parseFloat(monthlyRate) } : {}),
      },
    });

    return res.json(updatedInvestment);
  } catch (error) {
    console.error('Erro ao atualizar investimento:', error);
    return res.status(500).json({ error: 'Erro ao atualizar investimento.' });
  }
});

// Excluir investimento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingInvestment = await prisma.investment.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existingInvestment) {
      return res.status(404).json({ error: 'Investimento não encontrado.' });
    }

    await prisma.investment.delete({
      where: { id },
    });

    return res.json({ message: 'Investimento excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir investimento:', error);
    return res.status(500).json({ error: 'Erro ao excluir investimento.' });
  }
});

module.exports = router;