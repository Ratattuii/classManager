const { query } = require('../config/database');

// Listar notas de uma turma
const getNotasByTurma = async (req, res) => {
    try {
        const { turma_id } = req.params;

        const notas = await query(`
            SELECT n.id, n.aluno_id, n.nota1, n.nota2, n.media, n.created_at, n.updated_at,
                   u.nome as aluno_nome, p.nome as professor_nome
            FROM notas n
            JOIN usuarios u ON n.aluno_id = u.id
            JOIN usuarios p ON n.professor_id = p.id
            WHERE n.turma_id = ?
            ORDER BY u.nome
        `, [turma_id]);

        res.json({
            success: true,
            data: notas
        });

    } catch (error) {
        console.error('Erro ao buscar notas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Buscar notas de um aluno
const getNotasByAluno = async (req, res) => {
    try {
        const { aluno_id } = req.params;
        const { turma_id } = req.query;

        let sql = `
            SELECT n.id, n.turma_id, n.nota1, n.nota2, n.media, n.created_at, n.updated_at,
                   t.nome as turma_nome, p.nome as professor_nome
            FROM notas n
            JOIN turmas t ON n.turma_id = t.id
            JOIN usuarios p ON n.professor_id = p.id
            WHERE n.aluno_id = ?
        `;
        const params = [aluno_id];

        if (turma_id) {
            sql += ' AND n.turma_id = ?';
            params.push(turma_id);
        }

        sql += ' ORDER BY t.nome';

        const notas = await query(sql, params);

        res.json({
            success: true,
            data: notas
        });

    } catch (error) {
        console.error('Erro ao buscar notas do aluno:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Buscar nota por ID
const getNotaById = async (req, res) => {
    try {
        const { id } = req.params;

        const notas = await query(`
            SELECT n.id, n.aluno_id, n.turma_id, n.nota1, n.nota2, n.media, n.created_at, n.updated_at,
                   u.nome as aluno_nome, t.nome as turma_nome, p.nome as professor_nome
            FROM notas n
            JOIN usuarios u ON n.aluno_id = u.id
            JOIN turmas t ON n.turma_id = t.id
            JOIN usuarios p ON n.professor_id = p.id
            WHERE n.id = ?
        `, [id]);

        if (notas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Nota não encontrada'
            });
        }

        res.json({
            success: true,
            data: notas[0]
        });

    } catch (error) {
        console.error('Erro ao buscar nota:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Criar ou atualizar notas
const saveNotas = async (req, res) => {
    try {
        const { aluno_id, turma_id, nota1, nota2 } = req.body;
        const professor_id = req.user.id;

        if (!aluno_id || !turma_id) {
            return res.status(400).json({
                success: false,
                message: 'ID do aluno e ID da turma são obrigatórios'
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

        // Verificar se aluno está matriculado na turma
        const matriculas = await query(
            'SELECT id FROM matriculas WHERE aluno_id = ? AND turma_id = ? AND ativa = TRUE',
            [aluno_id, turma_id]
        );

        if (matriculas.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Aluno não está matriculado nesta turma'
            });
        }

        // Validar notas (0 a 10)
        if (nota1 !== null && nota1 !== undefined && (nota1 < 0 || nota1 > 10)) {
            return res.status(400).json({
                success: false,
                message: 'Nota1 deve estar entre 0 e 10'
            });
        }

        if (nota2 !== null && nota2 !== undefined && (nota2 < 0 || nota2 > 10)) {
            return res.status(400).json({
                success: false,
                message: 'Nota2 deve estar entre 0 e 10'
            });
        }

        // Calcular média
        let media = null;
        if (nota1 !== null && nota1 !== undefined && nota2 !== null && nota2 !== undefined) {
            media = (parseFloat(nota1) + parseFloat(nota2)) / 2;
        }

        // Verificar se já existe nota para este aluno nesta turma
        const existingNotas = await query(
            'SELECT id FROM notas WHERE aluno_id = ? AND turma_id = ?',
            [aluno_id, turma_id]
        );

        let result;

        if (existingNotas.length > 0) {
            // Atualizar nota existente
            result = await query(
                'UPDATE notas SET nota1 = ?, nota2 = ?, media = ?, professor_id = ? WHERE aluno_id = ? AND turma_id = ?',
                [nota1, nota2, media, professor_id, aluno_id, turma_id]
            );
        } else {
            // Criar nova nota
            result = await query(
                'INSERT INTO notas (aluno_id, turma_id, nota1, nota2, media, professor_id) VALUES (?, ?, ?, ?, ?, ?)',
                [aluno_id, turma_id, nota1, nota2, media, professor_id]
            );
        }

        // Buscar nota salva
        const notaSalva = await query(`
            SELECT n.id, n.aluno_id, n.turma_id, n.nota1, n.nota2, n.media, n.created_at, n.updated_at,
                   u.nome as aluno_nome, t.nome as turma_nome, p.nome as professor_nome
            FROM notas n
            JOIN usuarios u ON n.aluno_id = u.id
            JOIN turmas t ON n.turma_id = t.id
            JOIN usuarios p ON n.professor_id = p.id
            WHERE n.aluno_id = ? AND n.turma_id = ?
        `, [aluno_id, turma_id]);

        res.json({
            success: true,
            message: 'Notas salvas com sucesso',
            data: notaSalva[0]
        });

    } catch (error) {
        console.error('Erro ao salvar notas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Atualizar notas
const updateNotas = async (req, res) => {
    try {
        const { id } = req.params;
        const { nota1, nota2 } = req.body;
        const professor_id = req.user.id;

        // Verificar se nota existe
        const existingNotas = await query(
            'SELECT id, aluno_id, turma_id FROM notas WHERE id = ?',
            [id]
        );

        if (existingNotas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Nota não encontrada'
            });
        }

        // Validar notas (0 a 10)
        if (nota1 !== null && nota1 !== undefined && (nota1 < 0 || nota1 > 10)) {
            return res.status(400).json({
                success: false,
                message: 'Nota1 deve estar entre 0 e 10'
            });
        }

        if (nota2 !== null && nota2 !== undefined && (nota2 < 0 || nota2 > 10)) {
            return res.status(400).json({
                success: false,
                message: 'Nota2 deve estar entre 0 e 10'
            });
        }

        // Calcular média
        let media = null;
        if (nota1 !== null && nota1 !== undefined && nota2 !== null && nota2 !== undefined) {
            media = (parseFloat(nota1) + parseFloat(nota2)) / 2;
        }

        // Atualizar nota
        await query(
            'UPDATE notas SET nota1 = ?, nota2 = ?, media = ?, professor_id = ? WHERE id = ?',
            [nota1, nota2, media, professor_id, id]
        );

        // Buscar nota atualizada
        const notaAtualizada = await query(`
            SELECT n.id, n.aluno_id, n.turma_id, n.nota1, n.nota2, n.media, n.created_at, n.updated_at,
                   u.nome as aluno_nome, t.nome as turma_nome, p.nome as professor_nome
            FROM notas n
            JOIN usuarios u ON n.aluno_id = u.id
            JOIN turmas t ON n.turma_id = t.id
            JOIN usuarios p ON n.professor_id = p.id
            WHERE n.id = ?
        `, [id]);

        res.json({
            success: true,
            message: 'Notas atualizadas com sucesso',
            data: notaAtualizada[0]
        });

    } catch (error) {
        console.error('Erro ao atualizar notas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Salvar múltiplas notas
const saveMultipleNotas = async (req, res) => {
    try {
        const { notas } = req.body;
        const professor_id = req.user.id;

        if (!notas || !Array.isArray(notas) || notas.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Lista de notas é obrigatória'
            });
        }

        const results = [];

        for (const notaData of notas) {
            const { aluno_id, turma_id, nota1, nota2 } = notaData;

            if (!aluno_id || !turma_id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do aluno e ID da turma são obrigatórios para cada nota'
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
                    message: `Aluno com ID ${aluno_id} não encontrado`
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
                    message: `Turma com ID ${turma_id} não encontrada`
                });
            }

            // Verificar se aluno está matriculado na turma
            const matriculas = await query(
                'SELECT id FROM matriculas WHERE aluno_id = ? AND turma_id = ? AND ativa = TRUE',
                [aluno_id, turma_id]
            );

            if (matriculas.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `Aluno com ID ${aluno_id} não está matriculado na turma ${turma_id}`
                });
            }

            // Validar notas (0 a 10)
            if (nota1 !== null && nota1 !== undefined && (nota1 < 0 || nota1 > 10)) {
                return res.status(400).json({
                    success: false,
                    message: 'Nota1 deve estar entre 0 e 10'
                });
            }

            if (nota2 !== null && nota2 !== undefined && (nota2 < 0 || nota2 > 10)) {
                return res.status(400).json({
                    success: false,
                    message: 'Nota2 deve estar entre 0 e 10'
                });
            }

            // Calcular média
            let media = null;
            if (nota1 !== null && nota1 !== undefined && nota2 !== null && nota2 !== undefined) {
                media = (parseFloat(nota1) + parseFloat(nota2)) / 2;
            }

            // Verificar se já existe nota para este aluno nesta turma
            const existingNotas = await query(
                'SELECT id FROM notas WHERE aluno_id = ? AND turma_id = ?',
                [aluno_id, turma_id]
            );

            let result;

            if (existingNotas.length > 0) {
                // Atualizar nota existente
                result = await query(
                    'UPDATE notas SET nota1 = ?, nota2 = ?, media = ?, professor_id = ? WHERE aluno_id = ? AND turma_id = ?',
                    [nota1, nota2, media, professor_id, aluno_id, turma_id]
                );
            } else {
                // Criar nova nota
                result = await query(
                    'INSERT INTO notas (aluno_id, turma_id, nota1, nota2, media, professor_id) VALUES (?, ?, ?, ?, ?, ?)',
                    [aluno_id, turma_id, nota1, nota2, media, professor_id]
                );
            }

            // Buscar nota salva
            const notaSalva = await query(`
                SELECT n.id, n.aluno_id, n.turma_id, n.nota1, n.nota2, n.media, n.created_at, n.updated_at,
                       u.nome as aluno_nome, t.nome as turma_nome, p.nome as professor_nome
                FROM notas n
                JOIN usuarios u ON n.aluno_id = u.id
                JOIN turmas t ON n.turma_id = t.id
                JOIN usuarios p ON n.professor_id = p.id
                WHERE n.aluno_id = ? AND n.turma_id = ?
            `, [aluno_id, turma_id]);

            results.push(notaSalva[0]);
        }

        res.json({
            success: true,
            message: 'Notas salvas com sucesso',
            data: results
        });

    } catch (error) {
        console.error('Erro ao salvar notas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Deletar notas
const deleteNotas = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se nota existe
        const existingNotas = await query(
            'SELECT id FROM notas WHERE id = ?',
            [id]
        );

        if (existingNotas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Nota não encontrada'
            });
        }

        // Deletar nota
        await query(
            'DELETE FROM notas WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Notas removidas com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar notas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    getNotasByTurma,
    getNotasByAluno,
    getNotaById,
    saveNotas,
    saveMultipleNotas,
    updateNotas,
    deleteNotas
};
