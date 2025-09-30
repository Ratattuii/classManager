const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

// Listar todos os usuários (apenas admin)
const getAllUsers = async (req, res) => {
    try {
        const { perfil, ativo } = req.query;
        
        let sql = 'SELECT id, nome, email, perfil, ativo, created_at, updated_at FROM usuarios WHERE 1=1';
        const params = [];

        if (perfil) {
            sql += ' AND perfil = ?';
            params.push(perfil);
        }

        if (ativo !== undefined) {
            sql += ' AND ativo = ?';
            params.push(ativo === 'true');
        }

        sql += ' ORDER BY nome';

        const users = await query(sql, params);

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Buscar usuário por ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const users = await query(
            'SELECT id, nome, email, perfil, ativo, created_at, updated_at FROM usuarios WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Criar novo usuário (apenas admin)
const createUser = async (req, res) => {
    try {
        const { nome, email, senha, perfil } = req.body;

        if (!nome || !email || !senha || !perfil) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios'
            });
        }

        // Verificar se email já existe
        const existingUsers = await query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email já cadastrado'
            });
        }

        // Criptografar senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Inserir usuário
        const result = await query(
            'INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)',
            [nome, email, senhaHash, perfil]
        );

        // Buscar usuário criado
        const newUser = await query(
            'SELECT id, nome, email, perfil, ativo, created_at FROM usuarios WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            data: newUser[0]
        });

    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Atualizar usuário
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, perfil, ativo } = req.body;

        // Verificar se usuário existe
        const existingUsers = await query(
            'SELECT id FROM usuarios WHERE id = ?',
            [id]
        );

        if (existingUsers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Verificar se email já existe em outro usuário
        if (email) {
            const emailUsers = await query(
                'SELECT id FROM usuarios WHERE email = ? AND id != ?',
                [email, id]
            );

            if (emailUsers.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email já cadastrado'
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

        if (email) {
            updates.push('email = ?');
            params.push(email);
        }

        if (perfil) {
            updates.push('perfil = ?');
            params.push(perfil);
        }

        if (ativo !== undefined) {
            updates.push('ativo = ?');
            params.push(ativo);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum campo para atualizar'
            });
        }

        params.push(id);

        await query(
            `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // Buscar usuário atualizado
        const updatedUser = await query(
            'SELECT id, nome, email, perfil, ativo, created_at, updated_at FROM usuarios WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Usuário atualizado com sucesso',
            data: updatedUser[0]
        });

    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Deletar usuário (apenas admin)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se usuário existe
        const existingUsers = await query(
            'SELECT id FROM usuarios WHERE id = ?',
            [id]
        );

        if (existingUsers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Soft delete - marcar como inativo
        await query(
            'UPDATE usuarios SET ativo = FALSE WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Usuário removido com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Listar professores (para dropdowns)
const getProfessores = async (req, res) => {
    try {
        const professores = await query(
            'SELECT id, nome FROM usuarios WHERE perfil = "professor" AND ativo = TRUE ORDER BY nome'
        );

        res.json({
            success: true,
            data: professores
        });

    } catch (error) {
        console.error('Erro ao buscar professores:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Listar alunos (para dropdowns)
const getAlunos = async (req, res) => {
    try {
        const alunos = await query(
            'SELECT id, nome FROM usuarios WHERE perfil = "aluno" AND ativo = TRUE ORDER BY nome'
        );

        res.json({
            success: true,
            data: alunos
        });

    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getProfessores,
    getAlunos
};
