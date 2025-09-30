const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar configuração do banco
const { testConnection } = require('./config/database');

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const turmaRoutes = require('./routes/turmas');
const chamadaRoutes = require('./routes/chamadas');
const notaRoutes = require('./routes/notas');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname)));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/turmas', turmaRoutes);
app.use('/api/chamadas', chamadaRoutes);
app.use('/api/notas', notaRoutes);

// Rota para servir o frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
    });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
    });
});

// Inicializar servidor
async function startServer() {
    try {
        // Testar conexão com banco
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.log('Servidor iniciado sem conexão com banco de dados');
            console.log('   Certifique-se de que o MySQL está rodando e as configurações estão corretas');
        }

        app.listen(PORT, () => {
            console.log('Servidor ClassManager rodando!');
            console.log(`Porta: ${PORT}`);
            console.log(`URL: http://localhost:${PORT}`);
            console.log(`API: http://localhost:${PORT}/api`);
            console.log('');
            console.log('Endpoints disponíveis:');
            console.log('   POST /api/auth/login - Login');
            console.log('   GET  /api/auth/verify - Verificar token');
            console.log('   GET  /api/users - Listar usuários (admin)');
            console.log('   GET  /api/turmas - Listar turmas');
            console.log('   GET  /api/chamadas/turma/:id - Chamadas da turma');
            console.log('   GET  /api/notas/turma/:id - Notas da turma');
            console.log('');
            console.log('Para testar, acesse: http://localhost:' + PORT);
        });

    } catch (error) {
        console.error('Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Inicializar
startServer();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando servidor...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Encerrando servidor...');
    process.exit(0);
});
