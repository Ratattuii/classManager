const { query } = require('../config/database');

// Listar todas as turmas
const getAllTurmas = async (req, res) => {
    try {
        const { ativa, professor_id } = req.query;
        
        let sql = `
            SELECT t.id, t.nome, t.ano, t.periodo, t.ativa, t.created_at, t.updated_at,
                   u.nome as professor_nome, u.id as professor_id
            FROM turmas t
            LEFT JOIN usuarios u ON t.professor_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (ativa !== undefined) {
            sql += ' AND t.ativa = ?';
            params.push(ativa === 'true');
        }

        if (professor_id) {
            sql += ' AND t.professor_id = ?';
            params.push(professor_id);
        }

        sql += ' ORDER BY t.nome';

        const turmas = await query(sql, params);

        res.json({
            success: true,
            data: turmas
        });

    } catch (error) {
        console.error('Erro ao buscar turmas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Buscar turma por ID
const getTurmaById = async (req, res) => {
    try {
        const { id } = req.params;

        const turmas = await query(`
            SELECT t.id, t.nome, t.ano, t.periodo, t.ativa, t.created_at, t.updated_at,
                   u.nome as professor_nome, u.id as professor_id
            FROM turmas t
            LEFT JOIN usuarios u ON t.professor_id = u.id
            WHERE t.id = ?
        `, [id]);

        if (turmas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Turma não encontrada'
            });
        }

        res.json({
            success: true,
            data: turmas[0]
        });

    } catch (error) {
        console.error('Erro ao buscar turma:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Criar nova turma (apenas admin)
const createTurma = async (req, res) => {
    try {
        const { nome, ano, periodo, professor_id } = req.body;

        if (!nome || !ano || !periodo) {
            return res.status(400).json({
                success: false,
                message: 'Nome, ano e período são obrigatórios'
            });
        }

        // Verificar se professor existe (se fornecido)
        if (professor_id) {
            const professores = await query(
                'SELECT id FROM usuarios WHERE id = ? AND perfil = "professor" AND ativo = TRUE',
                [professor_id]
            );

            if (professores.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Professor não encontrado'
                });
            }
        }

        // Inserir turma
        const result = await query(
            'INSERT INTO turmas (nome, ano, periodo, professor_id) VALUES (?, ?, ?, ?)',
            [nome, ano, periodo, professor_id || null]
        );

        // Buscar turma criada
        const newTurma = await query(`
            SELECT t.id, t.nome, t.ano, t.periodo, t.ativa, t.created_at,
                   u.nome as professor_nome, u.id as professor_id
            FROM turmas t
            LEFT JOIN usuarios u ON t.professor_id = u.id
            WHERE t.id = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Turma criada com sucesso',
            data: newTurma[0]
        });

    } catch (error) {
        console.error('Erro ao criar turma:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Atualizar turma
const updateTurma = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, ano, periodo, professor_id, ativa } = req.body;

        // Verificar se turma existe
        const existingTurmas = await query(
            'SELECT id FROM turmas WHERE id = ?',
            [id]
        );

        if (existingTurmas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Turma não encontrada'
            });
        }

        // Verificar se professor existe (se fornecido)
        if (professor_id) {
            const professores = await query(
                'SELECT id FROM usuarios WHERE id = ? AND perfil = "professor" AND ativo = TRUE',
                [professor_id]
            );

            if (professores.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Professor não encontrado'
                });
            }
        }

        // Construir query de atualização
        const updates = [];
        const params = [];

        if (nome) {
            updates.push('nome = ?');
            params.push(nome);
        }

        if (ano) {
            updates.push('ano = ?');
            params.push(ano);
        }

        if (periodo) {
            updates.push('periodo = ?');
            params.push(periodo);
        }

        if (professor_id !== undefined) {
            updates.push('professor_id = ?');
            params.push(professor_id || null);
        }

        if (ativa !== undefined) {
            updates.push('ativa = ?');
            params.push(ativa);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum campo para atualizar'
            });
        }

        params.push(id);

        await query(
            `UPDATE turmas SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // Buscar turma atualizada
        const updatedTurma = await query(`
            SELECT t.id, t.nome, t.ano, t.periodo, t.ativa, t.created_at, t.updated_at,
                   u.nome as professor_nome, u.id as professor_id
            FROM turmas t
            LEFT JOIN usuarios u ON t.professor_id = u.id
            WHERE t.id = ?
        `, [id]);

        res.json({
            success: true,
            message: 'Turma atualizada com sucesso',
            data: updatedTurma[0]
        });

    } catch (error) {
        console.error('Erro ao atualizar turma:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Deletar turma (apenas admin)
const deleteTurma = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se turma existe
        const existingTurmas = await query(
            'SELECT id FROM turmas WHERE id = ?',
            [id]
        );

        if (existingTurmas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Turma não encontrada'
            });
        }

        // Soft delete - marcar como inativa
        await query(
            'UPDATE turmas SET ativa = FALSE WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Turma removida com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar turma:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Listar alunos de uma turma
const getAlunosByTurma = async (req, res) => {
    try {
        const { id } = req.params;

        const alunos = await query(`
            SELECT u.id, u.nome, u.email, m.data_matricula, m.ativa as matricula_ativa
            FROM matriculas m
            JOIN usuarios u ON m.aluno_id = u.id
            WHERE m.turma_id = ? AND m.ativa = TRUE
            ORDER BY u.nome
        `, [id]);

        res.json({
            success: true,
            data: alunos
        });

    } catch (error) {
        console.error('Erro ao buscar alunos da turma:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Matricular aluno em turma
const matricularAluno = async (req, res) => {
    try {
        const { turma_id, aluno_id } = req.body;

        if (!turma_id || !aluno_id) {
            return res.status(400).json({
                success: false,
                message: 'ID da turma e ID do aluno são obrigatórios'
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

        // Verificar se aluno existe
        const alunos = await query(
            'SELECT id FROM usuarios WHERE id = ? AND perfil = "aluno" AND ativo = TRUE',
            [aluno_id]
        );

        if (alunos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aluno não encontrado'
            });
        }

        // Verificar se já está matriculado
        const matriculas = await query(
            'SELECT id FROM matriculas WHERE turma_id = ? AND aluno_id = ?',
            [turma_id, aluno_id]
        );

        if (matriculas.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Aluno já está matriculado nesta turma'
            });
        }

        // Inserir matrícula
        await query(
            'INSERT INTO matriculas (turma_id, aluno_id) VALUES (?, ?)',
            [turma_id, aluno_id]
        );

        res.status(201).json({
            success: true,
            message: 'Aluno matriculado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao matricular aluno:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Desmatricular aluno de turma
const desmatricularAluno = async (req, res) => {
    try {
        const { turma_id, aluno_id } = req.body;

        if (!turma_id || !aluno_id) {
            return res.status(400).json({
                success: false,
                message: 'ID da turma e ID do aluno são obrigatórios'
            });
        }

        // Verificar se matrícula existe
        const matriculas = await query(
            'SELECT id FROM matriculas WHERE turma_id = ? AND aluno_id = ? AND ativa = TRUE',
            [turma_id, aluno_id]
        );

        if (matriculas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Matrícula não encontrada'
            });
        }

        // Soft delete - marcar como inativa
        await query(
            'UPDATE matriculas SET ativa = FALSE WHERE turma_id = ? AND aluno_id = ?',
            [turma_id, aluno_id]
        );

        res.json({
            success: true,
            message: 'Aluno desmatriculado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao desmatricular aluno:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Listar turmas de um aluno
const getTurmasByAluno = async (req, res) => {
    try {
        const { aluno_id } = req.params;
        
        const sql = `
            SELECT t.id, t.nome, t.ano, t.periodo, t.ativa, t.created_at, t.updated_at,
                   u.nome as professor_nome, u.id as professor_id
            FROM turmas t
            JOIN matriculas m ON t.id = m.turma_id
            LEFT JOIN usuarios u ON t.professor_id = u.id
            WHERE m.aluno_id = ? AND t.ativa = 1
            ORDER BY t.nome
        `;
        
        const turmas = await query(sql, [aluno_id]);
        
        res.json({
            success: true,
            data: turmas
        });
        
    } catch (error) {
        console.error('Erro ao buscar turmas do aluno:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    getAllTurmas,
    getTurmaById,
    createTurma,
    updateTurma,
    deleteTurma,
    getAlunosByTurma,
    getTurmasByAluno,
    matricularAluno,
    desmatricularAluno
};
