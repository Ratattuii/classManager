const express = require('express');
const router = express.Router();
const { 
    getNotasByTurma, 
    getNotasByAluno, 
    getNotaById, 
    saveNotas, 
    saveMultipleNotas,
    updateNotas, 
    deleteNotas
} = require('../controllers/notaController');
const { authenticateToken, requireRole, requireOwnershipOrAdmin } = require('../middleware/auth');

// GET /api/notas/turma/:turma_id - Listar notas de uma turma
router.get('/turma/:turma_id', authenticateToken, getNotasByTurma);

// GET /api/notas/aluno/:aluno_id - Buscar notas de um aluno
router.get('/aluno/:aluno_id', authenticateToken, getNotasByAluno);

// GET /api/notas/:id - Buscar nota por ID
router.get('/:id', authenticateToken, getNotaById);

// POST /api/notas - Criar ou atualizar notas (professores e admin)
router.post('/', authenticateToken, requireRole(['professor', 'admin']), saveNotas);

// POST /api/notas/multiple - Criar ou atualizar múltiplas notas (professores e admin)
router.post('/multiple', authenticateToken, requireRole(['professor', 'admin']), saveMultipleNotas);

// PUT /api/notas/:id - Atualizar notas (professores e admin)
router.put('/:id', authenticateToken, requireRole(['professor', 'admin']), updateNotas);

// DELETE /api/notas/:id - Deletar notas (professores e admin)
router.delete('/:id', authenticateToken, requireRole(['professor', 'admin']), deleteNotas);

module.exports = router;
