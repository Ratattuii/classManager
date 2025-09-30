const express = require('express');
const router = express.Router();
const { 
    getChamadasByTurma, 
    getChamadaById, 
    createChamada, 
    lancarPresencas,
    getPresencasByChamada,
    getHistoricoPresencas,
    deleteChamada
} = require('../controllers/chamadaController');
const { authenticateToken, requireRole, requireOwnershipOrAdmin } = require('../middleware/auth');

// GET /api/chamadas/turma/:turma_id - Listar chamadas de uma turma
router.get('/turma/:turma_id', authenticateToken, getChamadasByTurma);

// GET /api/chamadas/:id - Buscar chamada por ID
router.get('/:id', authenticateToken, getChamadaById);

// GET /api/chamadas/:chamada_id/presencas - Buscar presenças de uma chamada
router.get('/:chamada_id/presencas', authenticateToken, getPresencasByChamada);

// GET /api/chamadas/aluno/:aluno_id/historico - Buscar histórico de presenças de um aluno
router.get('/aluno/:aluno_id/historico', authenticateToken, getHistoricoPresencas);

// POST /api/chamadas - Criar nova chamada (professores e admin)
router.post('/', authenticateToken, requireRole(['professor', 'admin']), createChamada);

// POST /api/chamadas/:chamada_id/presencas - Lançar presenças para uma chamada (professores e admin)
router.post('/:chamada_id/presencas', authenticateToken, requireRole(['professor', 'admin']), lancarPresencas);

// DELETE /api/chamadas/:id - Deletar chamada (professor que criou ou admin)
router.delete('/:id', authenticateToken, deleteChamada);

module.exports = router;
