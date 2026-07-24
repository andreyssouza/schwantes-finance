const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('./authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Todas as rotas abaixo exigem usuário autenticado
router.use(authMiddleware);

// Listar metas do usuário logado
router.get('/', async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(goals);
  } catch (error) {
    console.error('Erro ao listar metas:', error);
    return res.status(500).json({ error: 'Erro ao listar metas.' });
  }
});

// Criar nova meta
router.post('/', async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, deadline, category } = req.body;

    if (!name || !targetAmount || !deadline) {
      return res.status(400).json({ error: 'Preencha os campos obrigatórios.' });
    }

    const goal = await prisma.goal.create({
      data: {
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount || 0),
        deadline: new Date(deadline),
        category: category || 'Outros',
        userId: req.userId,
      },
    });

    return res.status(201).json(goal);
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    return res.status(500).json({ error: 'Erro ao criar meta.' });
  }
});

// Atualizar meta
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, targetAmount, currentAmount, deadline, category, completed } = req.body;

    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existingGoal) {
      return res.status(404).json({ error: 'Meta não encontrada.' });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(targetAmount !== undefined ? { targetAmount: parseFloat(targetAmount) } : {}),
        ...(currentAmount !== undefined ? { currentAmount: parseFloat(currentAmount) } : {}),
        ...(deadline !== undefined ? { deadline: new Date(deadline) } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(completed !== undefined ? { completed } : {}),
      },
    });

    return res.json(updatedGoal);
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    return res.status(500).json({ error: 'Erro ao atualizar meta.' });
  }
});

// Excluir meta
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existingGoal) {
      return res.status(404).json({ error: 'Meta não encontrada.' });
    }

    await prisma.goal.delete({
      where: { id },
    });

    return res.json({ message: 'Meta excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir meta:', error);
    return res.status(500).json({ error: 'Erro ao excluir meta.' });
  }
});

module.exports = router;