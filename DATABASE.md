# ClassManager - Estrutura do Banco de Dados

## Visão Geral

O banco de dados do ClassManager foi projetado para ser **simples e eficiente**, focando nas funcionalidades essenciais do sistema de gestão de aulas.

## Entidades Principais

### 1. **usuarios**
Tabela central que armazena todos os usuários do sistema (administradores, professores e alunos).

### 2. **turmas**
Armazena as turmas/classes da escola.

### 3. **matriculas**
Relaciona alunos com suas turmas.

### 4. **chamadas**
Registra as presenças/faltas dos alunos.

### 5. **notas**
Armazena as notas dos alunos.

## Estrutura das Tabelas

### Tabela: usuarios
```sql
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
```

**Campos:**
- `id`: Identificador único (chave primária)
- `nome`: Nome completo do usuário
- `email`: Email único para login
- `senha`: Senha criptografada
- `perfil`: Tipo de usuário (admin, professor, aluno)
- `ativo`: Se o usuário está ativo no sistema
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

### Tabela: turmas
```sql
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
```

**Campos:**
- `id`: Identificador único (chave primária)
- `nome`: Nome da turma (ex: "2º Ano A")
- `ano`: Ano letivo (ex: "2024")
- `periodo`: Período da turma
- `professor_id`: ID do professor responsável (chave estrangeira)
- `ativa`: Se a turma está ativa
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

### Tabela: matriculas
```sql
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
```

**Campos:**
- `id`: Identificador único (chave primária)
- `aluno_id`: ID do aluno (chave estrangeira)
- `turma_id`: ID da turma (chave estrangeira)
- `data_matricula`: Data da matrícula
- `ativa`: Se a matrícula está ativa
- `created_at`: Data de criação

### Tabela: chamadas
```sql
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
```

**Campos:**
- `id`: Identificador único (chave primária)
- `turma_id`: ID da turma (chave estrangeira)
- `data_chamada`: Data da chamada
- `professor_id`: ID do professor que fez a chamada
- `created_at`: Data de criação

### Tabela: presencas
```sql
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
```

**Campos:**
- `id`: Identificador único (chave primária)
- `chamada_id`: ID da chamada (chave estrangeira)
- `aluno_id`: ID do aluno (chave estrangeira)
- `presente`: Se o aluno estava presente (TRUE) ou faltou (FALSE)
- `created_at`: Data de criação

### Tabela: notas
```sql
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
```

**Campos:**
- `id`: Identificador único (chave primária)
- `aluno_id`: ID do aluno (chave estrangeira)
- `turma_id`: ID da turma (chave estrangeira)
- `nota1`: Primeira nota (0.00 a 10.00)
- `nota2`: Segunda nota (0.00 a 10.00)
- `media`: Média calculada automaticamente
- `professor_id`: ID do professor que lançou as notas
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

## Diagrama de Entidade-Relacionamento

```
┌─────────────────┐
│     usuarios    │
├─────────────────┤
│ id (PK)         │
│ nome            │
│ email           │
│ senha           │
│ perfil          │
│ ativo           │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│     turmas      │
├─────────────────┤
│ id (PK)         │
│ nome            │
│ ano             │
│ periodo         │
│ professor_id(FK)│
│ ativa           │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│    matriculas   │
├─────────────────┤
│ id (PK)         │
│ aluno_id (FK)   │
│ turma_id (FK)   │
│ data_matricula  │
│ ativa           │
│ created_at      │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│     chamadas    │
├─────────────────┤
│ id (PK)         │
│ turma_id (FK)   │
│ data_chamada    │
│ professor_id(FK)│
│ created_at      │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│    presencas    │
├─────────────────┤
│ id (PK)         │
│ chamada_id (FK) │
│ aluno_id (FK)   │
│ presente        │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│      notas      │
├─────────────────┤
│ id (PK)         │
│ aluno_id (FK)   │
│ turma_id (FK)   │
│ nota1           │
│ nota2           │
│ media           │
│ professor_id(FK)│
│ created_at      │
│ updated_at      │
└─────────────────┘
```

## Relacionamentos

### 1. **usuarios → turmas** (1:N)
- Um professor pode ter várias turmas
- Uma turma tem apenas um professor responsável

### 2. **usuarios → matriculas** (1:N)
- Um aluno pode estar matriculado em várias turmas
- Uma matrícula pertence a apenas um aluno

### 3. **turmas → matriculas** (1:N)
- Uma turma pode ter vários alunos matriculados
- Uma matrícula pertence a apenas uma turma

### 4. **turmas → chamadas** (1:N)
- Uma turma pode ter várias chamadas
- Uma chamada pertence a apenas uma turma

### 5. **chamadas → presencas** (1:N)
- Uma chamada pode ter várias presenças
- Uma presença pertence a apenas uma chamada

### 6. **usuarios → presencas** (1:N)
- Um aluno pode ter várias presenças
- Uma presença pertence a apenas um aluno

### 7. **usuarios → notas** (1:N)
- Um aluno pode ter várias notas (em diferentes turmas)
- Uma nota pertence a apenas um aluno

### 8. **turmas → notas** (1:N)
- Uma turma pode ter várias notas
- Uma nota pertence a apenas uma turma