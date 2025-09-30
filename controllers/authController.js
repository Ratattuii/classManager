const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Função para gerar token JWT
const generateToken = (userId, perfil) => {
    return jwt.sign(
        { userId, perfil },
        'classmanager_secret_key_2024',
        { expiresIn: '24h' }
    );
};

// Login
const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }

        // Buscar usuário no banco
        const users = await query(
            'SELECT id, nome, email, senha, perfil, ativo FROM usuarios WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }

        const user = users[0];

        if (!user.ativo) {
            return res.status(401).json({
                success: false,
                message: 'Usuário inativo'
            });
        }

        // Verificar senha
        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }

        // Gerar token
        const token = generateToken(user.id, user.perfil);

        // Retornar dados do usuário (sem senha)
        const { senha: _, ...userData } = user;

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                user: userData,
                token
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Verificar token (para validar se ainda está válido)
const verifyToken = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Token válido',
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error('Erro na verificação do token:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Logout (no JWT, o logout é feito no frontend removendo o token)
const logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logout realizado com sucesso'
    });
};

module.exports = {
    login,
    verifyToken,
    logout
};
