const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('./authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Aplica o middleware de autenticação
router.use(authMiddleware);

// 1. Buscar perfil do usuário logado
router.get('/profile', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({ error: 'Erro ao buscar dados do perfil.' });
  }
});

// 2. Atualizar dados do perfil (Nome e E-mail)
router.put('/profile', async (req, res) => {
  try {
    const { name, email } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { name, email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return res.status(500).json({ error: 'Erro ao atualizar dados do perfil.' });
  }
});

// 3. Alterar Senha
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Informe a senha atual e a nova senha.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Erro ao alterar a senha. Verifique a senha atual.' });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.userId },
      data: { password: newHashedPassword },
    });

    return res.json({ message: 'Senha alterada com sucesso!' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return res.status(500).json({ error: 'Erro ao alterar a senha do usuário.' });
  }
});

module.exports = router;