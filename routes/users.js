const express = require('express');
const router = express.Router();
const { 
    getAllUsers, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser,
    getProfessores,
    getAlunos
} = require('../controllers/userController');
const { authenticateToken, requireRole, requireOwnershipOrAdmin } = require('../middleware/auth');

// GET /api/users - Listar todos os usuários (apenas admin)
router.get('/', authenticateToken, requireRole(['admin']), getAllUsers);

// GET /api/users/professores - Listar professores (para dropdowns)
router.get('/professores', authenticateToken, getProfessores);

// GET /api/users/alunos - Listar alunos (para dropdowns)
router.get('/alunos', authenticateToken, getAlunos);

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', authenticateToken, requireOwnershipOrAdmin, getUserById);

// POST /api/users - Criar novo usuário (apenas admin)
router.post('/', authenticateToken, requireRole(['admin']), createUser);

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', authenticateToken, requireOwnershipOrAdmin, updateUser);

// DELETE /api/users/:id - Deletar usuário (apenas admin)
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteUser);

module.exports = router;
