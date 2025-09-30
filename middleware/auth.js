const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token de acesso necessário' 
        });
    }

    try {
        const decoded = jwt.verify(token, 'classmanager_secret_key_2024');
        
        // Buscar usuário no banco para verificar se ainda está ativo
        const user = await query(
            'SELECT id, nome, email, perfil, ativo FROM usuarios WHERE id = ? AND ativo = TRUE',
            [decoded.userId]
        );

        if (user.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuário não encontrado ou inativo' 
            });
        }

        req.user = user[0];
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'Token inválido' 
        });
    }
};

// Middleware para verificar perfil específico
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuário não autenticado' 
            });
        }

        if (!roles.includes(req.user.perfil)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Acesso negado. Perfil insuficiente.' 
            });
        }

        next();
    };
};

// Middleware para verificar se é o próprio usuário ou admin
const requireOwnershipOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Usuário não autenticado' 
        });
    }

    const userId = parseInt(req.params.id || req.params.userId);
    
    if (req.user.perfil === 'admin' || req.user.id === userId) {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Acesso negado. Você só pode acessar seus próprios dados.' 
        });
    }
};

module.exports = {
    authenticateToken,
    requireRole,
    requireOwnershipOrAdmin
};
