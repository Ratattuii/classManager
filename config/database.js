const mysql = require('mysql2/promise');

// Configuração do banco de dados
const dbConfig = {
    host: 'localhost',
    user: 'classManager',
    password: 'classManager',
    database: 'classmanager',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);

// Função para testar a conexão
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Conexão com banco de dados estabelecida!');
        connection.release();
        return true;
    } catch (error) {
        console.error('Erro ao conectar com banco de dados:', error.message);
        return false;
    }
}

// Função para executar queries
async function query(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Erro na query:', error.message);
        throw error;
    }
}

// Função para executar transações
async function transaction(callback) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    pool,
    query,
    transaction,
    testConnection
};
