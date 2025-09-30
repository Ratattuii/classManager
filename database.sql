CREATE DATABASE IF NOT EXISTS classmanager;
USE classmanager;


CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('admin', 'professor', 'aluno') NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE turmas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    ano VARCHAR(10) NOT NULL,
    periodo ENUM('Matutino', 'Vespertino', 'Noturno') NOT NULL,
    professor_id INT,
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (professor_id) REFERENCES usuarios(id)
);


CREATE TABLE matriculas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aluno_id INT NOT NULL,
    turma_id INT NOT NULL,
    data_matricula DATE DEFAULT (CURRENT_DATE),
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id),
    FOREIGN KEY (turma_id) REFERENCES turmas(id),
    UNIQUE KEY unique_matricula (aluno_id, turma_id)
);

CREATE TABLE chamadas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    turma_id INT NOT NULL,
    data_chamada DATE NOT NULL,
    professor_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (turma_id) REFERENCES turmas(id),
    FOREIGN KEY (professor_id) REFERENCES usuarios(id),
    UNIQUE KEY unique_chamada (turma_id, data_chamada)
);

CREATE TABLE presencas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    chamada_id INT NOT NULL,
    aluno_id INT NOT NULL,
    presente BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chamada_id) REFERENCES chamadas(id),
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id),
    UNIQUE KEY unique_presenca (chamada_id, aluno_id)
);

CREATE TABLE notas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aluno_id INT NOT NULL,
    turma_id INT NOT NULL,
    nota1 DECIMAL(4,2) NULL,
    nota2 DECIMAL(4,2) NULL,
    media DECIMAL(4,2) NULL,
    professor_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id),
    FOREIGN KEY (turma_id) REFERENCES turmas(id),
    FOREIGN KEY (professor_id) REFERENCES usuarios(id),
    UNIQUE KEY unique_nota (aluno_id, turma_id)
);

-- =============================================
-- Dados de Exemplo
-- =============================================

-- Inserir usuários de exemplo
-- Senha: 123456 (hash bcrypt: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)
INSERT INTO usuarios (nome, email, senha, perfil) VALUES
-- Administradores
('Cláudia Silva', 'admin@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Roberto Alves', 'roberto@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),

-- Professores
('Marcos Oliveira', 'marcos@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor'),
('Maria Santos', 'maria@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor'),
('João Silva', 'joao@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor'),
('Ana Costa', 'ana.prof@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor'),
('Carlos Mendes', 'carlos@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor'),
('Fernanda Lima', 'fernanda@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor'),

-- Alunos
('Ana Souza', 'ana@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'aluno'),
('Lucas Ferreira', 'lucas@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'aluno'),
('Pedro Costa', 'pedro@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'aluno'),
('Julia Lima', 'julia@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'aluno'),
('Gabriel Santos', 'gabriel@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'aluno'),
('Mariana Oliveira', 'mariana@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'aluno'),
('Rafael Silva', 'rafael@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'aluno'),
('Camila Rodrigues', 'camila@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'aluno'),
('Bruno Almeida', 'bruno@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'aluno'),
('Larissa Pereira', 'larissa@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'aluno'),
('Diego Martins', 'diego@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'aluno'),
('Beatriz Nunes', 'beatriz@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'aluno'),
('Thiago Rocha', 'thiago@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'aluno'),
('Isabela Cardoso', 'isabela@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'aluno'),
('Vitor Hugo', 'vitor@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'aluno'),
('Natália Freitas', 'natalia@escola.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'aluno');

-- Inserir turmas de exemplo
INSERT INTO turmas (nome, ano, periodo, professor_id) VALUES
-- 1º Ano
('1º Ano A', '2024', 'Matutino', 3),
('1º Ano B', '2024', 'Vespertino', 4),
('1º Ano C', '2024', 'Noturno', 5),

-- 2º Ano
('2º Ano A', '2024', 'Matutino', 3),
('2º Ano B', '2024', 'Vespertino', 4),
('2º Ano C', '2024', 'Noturno', 6),

-- 3º Ano
('3º Ano A', '2024', 'Matutino', 3),
('3º Ano B', '2024', 'Vespertino', 7),
('3º Ano C', '2024', 'Noturno', 8);

-- Inserir matrículas de exemplo
INSERT INTO matriculas (aluno_id, turma_id) VALUES
-- 1º Ano A (turma_id: 1)
(9, 1),  -- Gabriel
(10, 1), -- Mariana
(11, 1), -- Rafael
(12, 1), -- Camila

-- 1º Ano B (turma_id: 2)
(13, 2), -- Bruno
(14, 2), -- Larissa
(15, 2), -- Diego
(16, 2), -- Beatriz

-- 1º Ano C (turma_id: 3)
(17, 3), -- Thiago
(18, 3), -- Isabela
(19, 3), -- Vitor
(20, 3), -- Natália

-- 2º Ano A (turma_id: 4)
(9, 4),  -- Ana
(10, 4), -- Lucas
(11, 4), -- Pedro
(12, 4), -- Julia

-- 2º Ano B (turma_id: 5)
(13, 5), -- Gabriel
(14, 5), -- Mariana
(15, 5), -- Rafael
(16, 5), -- Camila

-- 2º Ano C (turma_id: 6)
(17, 6), -- Bruno
(18, 6), -- Larissa
(19, 6), -- Diego
(20, 6), -- Beatriz

-- 3º Ano A (turma_id: 7)
(9, 7),  -- Ana (também no 3º ano)
(10, 7), -- Lucas
(11, 7), -- Pedro
(12, 7), -- Julia

-- 3º Ano B (turma_id: 8)
(13, 8), -- Gabriel
(14, 8), -- Mariana
(15, 8), -- Rafael
(16, 8), -- Camila

-- 3º Ano C (turma_id: 9)
(17, 9), -- Bruno
(18, 9), -- Larissa
(19, 9), -- Diego
(20, 9); -- Beatriz

-- Inserir chamadas de exemplo
INSERT INTO chamadas (turma_id, data_chamada, professor_id) VALUES
-- Chamadas para 1º Ano A
(1, '2024-01-15', 3),
(1, '2024-01-16', 3),
(1, '2024-01-17', 3),
(1, '2024-01-18', 3),
(1, '2024-01-19', 3),

-- Chamadas para 1º Ano B
(2, '2024-01-15', 4),
(2, '2024-01-16', 4),
(2, '2024-01-17', 4),
(2, '2024-01-18', 4),
(2, '2024-01-19', 4),

-- Chamadas para 2º Ano A
(4, '2024-01-15', 3),
(4, '2024-01-16', 3),
(4, '2024-01-17', 3),
(4, '2024-01-18', 3),
(4, '2024-01-19', 3),

-- Chamadas para 2º Ano B
(5, '2024-01-15', 4),
(5, '2024-01-16', 4),
(5, '2024-01-17', 4),
(5, '2024-01-18', 4),
(5, '2024-01-19', 4),

-- Chamadas para 3º Ano A
(7, '2024-01-15', 3),
(7, '2024-01-16', 3),
(7, '2024-01-17', 3),
(7, '2024-01-18', 3),
(7, '2024-01-19', 3);

-- Inserir presenças de exemplo
INSERT INTO presencas (chamada_id, aluno_id, presente) VALUES
-- Chamadas 1º Ano A (chamada_id: 1-5)
(1, 9, TRUE),  -- Gabriel presente
(1, 10, TRUE), -- Mariana presente
(1, 11, FALSE), -- Rafael faltou
(1, 12, TRUE), -- Camila presente

(2, 9, TRUE),  -- Gabriel presente
(2, 10, FALSE), -- Mariana faltou
(2, 11, TRUE), -- Rafael presente
(2, 12, TRUE), -- Camila presente

(3, 9, TRUE),  -- Gabriel presente
(3, 10, TRUE), -- Mariana presente
(3, 11, TRUE), -- Rafael presente
(3, 12, FALSE), -- Camila faltou

(4, 9, FALSE), -- Gabriel faltou
(4, 10, TRUE), -- Mariana presente
(4, 11, TRUE), -- Rafael presente
(4, 12, TRUE), -- Camila presente

(5, 9, TRUE),  -- Gabriel presente
(5, 10, TRUE), -- Mariana presente
(5, 11, TRUE), -- Rafael presente
(5, 12, TRUE), -- Camila presente

-- Chamadas 1º Ano B (chamada_id: 6-10)
(6, 13, TRUE), -- Bruno presente
(6, 14, TRUE), -- Larissa presente
(6, 15, FALSE), -- Diego faltou
(6, 16, TRUE), -- Beatriz presente

(7, 13, TRUE), -- Bruno presente
(7, 14, FALSE), -- Larissa faltou
(7, 15, TRUE), -- Diego presente
(7, 16, TRUE), -- Beatriz presente

(8, 13, TRUE), -- Bruno presente
(8, 14, TRUE), -- Larissa presente
(8, 15, TRUE), -- Diego presente
(8, 16, FALSE), -- Beatriz faltou

(9, 13, FALSE), -- Bruno faltou
(9, 14, TRUE), -- Larissa presente
(9, 15, TRUE), -- Diego presente
(9, 16, TRUE), -- Beatriz presente

(10, 13, TRUE), -- Bruno presente
(10, 14, TRUE), -- Larissa presente
(10, 15, TRUE), -- Diego presente
(10, 16, TRUE), -- Beatriz presente

-- Chamadas 2º Ano A (chamada_id: 11-15)
(11, 9, TRUE),  -- Ana presente
(11, 10, TRUE), -- Lucas presente
(11, 11, FALSE), -- Pedro faltou
(11, 12, TRUE), -- Julia presente

(12, 9, TRUE),  -- Ana presente
(12, 10, FALSE), -- Lucas faltou
(12, 11, TRUE), -- Pedro presente
(12, 12, TRUE), -- Julia presente

(13, 9, TRUE),  -- Ana presente
(13, 10, TRUE), -- Lucas presente
(13, 11, TRUE), -- Pedro presente
(13, 12, FALSE), -- Julia faltou

(14, 9, FALSE), -- Ana faltou
(14, 10, TRUE), -- Lucas presente
(14, 11, TRUE), -- Pedro presente
(14, 12, TRUE), -- Julia presente

(15, 9, TRUE),  -- Ana presente
(15, 10, TRUE), -- Lucas presente
(15, 11, TRUE), -- Pedro presente
(15, 12, TRUE), -- Julia presente

-- Chamadas 2º Ano B (chamada_id: 16-20)
(16, 13, TRUE), -- Gabriel presente
(16, 14, TRUE), -- Mariana presente
(16, 15, FALSE), -- Rafael faltou
(16, 16, TRUE), -- Camila presente

(17, 13, TRUE), -- Gabriel presente
(17, 14, FALSE), -- Mariana faltou
(17, 15, TRUE), -- Rafael presente
(17, 16, TRUE), -- Camila presente

(18, 13, TRUE), -- Gabriel presente
(18, 14, TRUE), -- Mariana presente
(18, 15, TRUE), -- Rafael presente
(18, 16, FALSE), -- Camila faltou

(19, 13, FALSE), -- Gabriel faltou
(19, 14, TRUE), -- Mariana presente
(19, 15, TRUE), -- Rafael presente
(19, 16, TRUE), -- Camila presente

(20, 13, TRUE), -- Gabriel presente
(20, 14, TRUE), -- Mariana presente
(20, 15, TRUE), -- Rafael presente
(20, 16, TRUE), -- Camila presente

-- Chamadas 3º Ano A (chamada_id: 21-25)
(21, 9, TRUE),  -- Ana presente
(21, 10, TRUE), -- Lucas presente
(21, 11, FALSE), -- Pedro faltou
(21, 12, TRUE), -- Julia presente

(22, 9, TRUE),  -- Ana presente
(22, 10, FALSE), -- Lucas faltou
(22, 11, TRUE), -- Pedro presente
(22, 12, TRUE), -- Julia presente

(23, 9, TRUE),  -- Ana presente
(23, 10, TRUE), -- Lucas presente
(23, 11, TRUE), -- Pedro presente
(23, 12, FALSE), -- Julia faltou

(24, 9, FALSE), -- Ana faltou
(24, 10, TRUE), -- Lucas presente
(24, 11, TRUE), -- Pedro presente
(24, 12, TRUE), -- Julia presente

(25, 9, TRUE),  -- Ana presente
(25, 10, TRUE), -- Lucas presente
(25, 11, TRUE), -- Pedro presente
(25, 12, TRUE); -- Julia presente

-- Inserir notas de exemplo
INSERT INTO notas (aluno_id, turma_id, nota1, nota2, media, professor_id) VALUES
-- 1º Ano A
(9, 1, 8.5, 9.0, 8.75, 3),  -- Gabriel
(10, 1, 7.0, 8.5, 7.75, 3), -- Mariana
(11, 1, 6.5, 7.0, 6.75, 3), -- Rafael
(12, 1, 9.0, 8.5, 8.75, 3), -- Camila

-- 1º Ano B
(13, 2, 8.0, 8.5, 8.25, 4), -- Bruno
(14, 2, 7.5, 8.0, 7.75, 4), -- Larissa
(15, 2, 6.0, 7.5, 6.75, 4), -- Diego
(16, 2, 9.5, 9.0, 9.25, 4), -- Beatriz

-- 2º Ano A
(9, 4, 8.5, 9.0, 8.75, 3),  -- Ana
(10, 4, 6.0, 7.5, 6.75, 3), -- Lucas
(11, 4, 9.0, 8.5, 8.75, 3), -- Pedro
(12, 4, 7.0, 8.0, 7.5, 3),  -- Julia

-- 2º Ano B
(13, 5, 8.0, 8.5, 8.25, 4), -- Gabriel
(14, 5, 7.5, 8.0, 7.75, 4), -- Mariana
(15, 5, 6.5, 7.0, 6.75, 4), -- Rafael
(16, 5, 9.0, 8.5, 8.75, 4), -- Camila

-- 3º Ano A
(9, 7, 9.5, 9.0, 9.25, 3),  -- Ana
(10, 7, 8.0, 8.5, 8.25, 3), -- Lucas
(11, 7, 7.5, 8.0, 7.75, 3), -- Pedro
(12, 7, 8.5, 9.0, 8.75, 3); -- Julia