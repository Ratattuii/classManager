const { query, transaction } = require('../config/database');

// Listar chamadas de uma turma
const getChamadasByTurma = async (req, res) => {
    try {
        const { turma_id } = req.params;
        const { data_inicio, data_fim } = req.query;

        let sql = `
            SELECT c.id, c.data_chamada, c.created_at,
                   u.nome as professor_nome
            FROM chamadas c
            JOIN usuarios u ON c.professor_id = u.id
            WHERE c.turma_id = ?
        `;
        const params = [turma_id];

        if (data_inicio) {
            sql += ' AND c.data_chamada >= ?';
            params.push(data_inicio);
        }

        if (data_fim) {
            sql += ' AND c.data_chamada <= ?';
            params.push(data_fim);
        }

        sql += ' ORDER BY c.data_chamada DESC';

        const chamadas = await query(sql, params);

        res.json({
            success: true,
            data: chamadas
        });

    } catch (error) {
        console.error('Erro ao buscar chamadas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Buscar chamada por ID
const getChamadaById = async (req, res) => {
    try {
        const { id } = req.params;

        const chamadas = await query(`
            SELECT c.id, c.turma_id, c.data_chamada, c.created_at,
                   u.nome as professor_nome, t.nome as turma_nome
            FROM chamadas c
            JOIN usuarios u ON c.professor_id = u.id
            JOIN turmas t ON c.turma_id = t.id
            WHERE c.id = ?
        `, [id]);

        if (chamadas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Chamada não encontrada'
            });
        }

        res.json({
            success: true,
            data: chamadas[0]
        });

    } catch (error) {
        console.error('Erro ao buscar chamada:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Criar nova chamada
const createChamada = async (req, res) => {
    try {
        const { turma_id, data_chamada } = req.body;
        const professor_id = req.user.id;

        if (!turma_id || !data_chamada) {
            return res.status(400).json({
                success: false,
                message: 'ID da turma e data da chamada são obrigatórios'
            });
        }

        // Verificar se turma existe
        const turmas = await query(
            'SELECT id FROM turmas WHERE id = ? AND ativa = TRUE',
            [turma_id]
        );

        if (turmas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Turma não encontrada'
            });
        }

        // Verificar se já existe chamada para esta turma nesta data
        const existingChamadas = await query(
            'SELECT id FROM chamadas WHERE turma_id = ? AND data_chamada = ?',
            [turma_id, data_chamada]
        );

        if (existingChamadas.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Já existe uma chamada para esta turma nesta data'
            });
        }

        // Criar chamada
        const result = await query(
            'INSERT INTO chamadas (turma_id, data_chamada, professor_id) VALUES (?, ?, ?)',
            [turma_id, data_chamada, professor_id]
        );

        // Buscar chamada criada
        const newChamada = await query(`
            SELECT c.id, c.turma_id, c.data_chamada, c.created_at,
                   u.nome as professor_nome, t.nome as turma_nome
            FROM chamadas c
            JOIN usuarios u ON c.professor_id = u.id
            JOIN turmas t ON c.turma_id = t.id
            WHERE c.id = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Chamada criada com sucesso',
            data: newChamada[0]
        });

    } catch (error) {
        console.error('Erro ao criar chamada:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Lançar presenças para uma chamada
const lancarPresencas = async (req, res) => {
    try {
        const { chamada_id, presencas } = req.body;

        if (!chamada_id || !presencas || !Array.isArray(presencas)) {
            return res.status(400).json({
                success: false,
                message: 'ID da chamada e lista de presenças são obrigatórios'
            });
        }

        // Verificar se chamada existe
        const chamadas = await query(
            'SELECT id FROM chamadas WHERE id = ?',
            [chamada_id]
        );

        if (chamadas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Chamada não encontrada'
            });
        }

        // Usar transação para garantir consistência
        await transaction(async (connection) => {
            // Limpar presenças existentes para esta chamada
            await connection.execute(
                'DELETE FROM presencas WHERE chamada_id = ?',
                [chamada_id]
            );

            // Inserir novas presenças
            for (const presenca of presencas) {
                const { aluno_id, presente } = presenca;

                if (aluno_id && typeof presente === 'boolean') {
                    await connection.execute(
                        'INSERT INTO presencas (chamada_id, aluno_id, presente) VALUES (?, ?, ?)',
                        [chamada_id, aluno_id, presente]
                    );
                }
            }
        });

        res.json({
            success: true,
            message: 'Presenças lançadas com sucesso'
        });

    } catch (error) {
        console.error('Erro ao lançar presenças:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Buscar presenças de uma chamada
const getPresencasByChamada = async (req, res) => {
    try {
        const { chamada_id } = req.params;

        const presencas = await query(`
            SELECT p.id, p.aluno_id, p.presente, p.created_at,
                   u.nome as aluno_nome
            FROM presencas p
            JOIN usuarios u ON p.aluno_id = u.id
            WHERE p.chamada_id = ?
            ORDER BY u.nome
        `, [chamada_id]);

        res.json({
            success: true,
            data: presencas
        });

    } catch (error) {
        console.error('Erro ao buscar presenças:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Buscar histórico de presenças de um aluno
const getHistoricoPresencas = async (req, res) => {
    try {
        const { aluno_id } = req.params;
        const { turma_id, data_inicio, data_fim } = req.query;

        let sql = `
            SELECT p.presente, c.data_chamada, c.created_at,
                   t.nome as turma_nome, u.nome as professor_nome
            FROM presencas p
            JOIN chamadas c ON p.chamada_id = c.id
            JOIN turmas t ON c.turma_id = t.id
            JOIN usuarios u ON c.professor_id = u.id
            WHERE p.aluno_id = ?
        `;
        const params = [aluno_id];

        if (turma_id) {
            sql += ' AND c.turma_id = ?';
            params.push(turma_id);
        }

        if (data_inicio) {
            sql += ' AND c.data_chamada >= ?';
            params.push(data_inicio);
        }

        if (data_fim) {
            sql += ' AND c.data_chamada <= ?';
            params.push(data_fim);
        }

        sql += ' ORDER BY c.data_chamada DESC';

        const historico = await query(sql, params);

        res.json({
            success: true,
            data: historico
        });

    } catch (error) {
        console.error('Erro ao buscar histórico de presenças:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Deletar chamada (apenas professor que criou ou admin)
const deleteChamada = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se chamada existe
        const chamadas = await query(
            'SELECT id, professor_id FROM chamadas WHERE id = ?',
            [id]
        );

        if (chamadas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Chamada não encontrada'
            });
        }

        // Verificar se é o professor que criou ou admin
        if (req.user.perfil !== 'admin' && req.user.id !== chamadas[0].professor_id) {
            return res.status(403).json({
                success: false,
                message: 'Você só pode deletar suas próprias chamadas'
            });
        }

        // Usar transação para deletar chamada e presenças
        await transaction(async (connection) => {
            // Deletar presenças
            await connection.execute(
                'DELETE FROM presencas WHERE chamada_id = ?',
                [id]
            );

            // Deletar chamada
            await connection.execute(
                'DELETE FROM chamadas WHERE id = ?',
                [id]
            );
        });

        res.json({
            success: true,
            message: 'Chamada removida com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar chamada:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    getChamadasByTurma,
    getChamadaById,
    createChamada,
    lancarPresencas,
    getPresencasByChamada,
    getHistoricoPresencas,
    deleteChamada
};
