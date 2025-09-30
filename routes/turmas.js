const express = require('express');
const router = express.Router();
const { 
    getAllTurmas, 
    getTurmaById, 
    createTurma, 
    updateTurma, 
    deleteTurma,
    getAlunosByTurma,
    getTurmasByAluno,
    matricularAluno,
    desmatricularAluno
} = require('../controllers/turmaController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/turmas - Listar todas as turmas
router.get('/', authenticateToken, getAllTurmas);

// GET /api/turmas/:id - Buscar turma por ID
router.get('/:id', authenticateToken, getTurmaById);

// GET /api/turmas/:id/alunos - Listar alunos de uma turma
router.get('/:id/alunos', authenticateToken, getAlunosByTurma);

// GET /api/turmas/aluno/:aluno_id - Listar turmas de um aluno
router.get('/aluno/:aluno_id', authenticateToken, getTurmasByAluno);

// POST /api/turmas - Criar nova turma (apenas admin)
router.post('/', authenticateToken, requireRole(['admin']), createTurma);

// POST /api/turmas/matricular - Matricular aluno em turma (apenas admin)
router.post('/matricular', authenticateToken, requireRole(['admin']), matricularAluno);

// POST /api/turmas/desmatricular - Desmatricular aluno de turma (apenas admin)
router.post('/desmatricular', authenticateToken, requireRole(['admin']), desmatricularAluno);

// PUT /api/turmas/:id - Atualizar turma (apenas admin)
router.put('/:id', authenticateToken, requireRole(['admin']), updateTurma);

// DELETE /api/turmas/:id - Deletar turma (apenas admin)
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteTurma);

module.exports = router;
