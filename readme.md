# ClassManager - Sistema de Gestão de Aulas

Sistema completo para gestão de aulas com Node.js, Express, MySQL e frontend responsivo.

## Funcionalidades

### Administrador
- Gerenciar turmas (criar, editar, excluir)
- Gerenciar professores (cadastrar, editar, associar a turmas)
- Gerenciar alunos (cadastrar, editar, matricular em turmas)

### Professor
- Visualizar turmas alocadas
- Lançar chamadas (presença/falta)
- Lançar e editar notas dos alunos
- Visualizar lista de alunos por turma

### Aluno
- Visualizar turmas matriculadas
- Consultar histórico de presenças
- Consultar notas e médias

## Tecnologias

### Backend
- Node.js + Express
- MySQL2
- JWT (autenticação)
- bcryptjs (criptografia)

### Frontend
- HTML5 + CSS3 + JavaScript
- Design responsivo
- Integração com API REST

## Instalação

1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd classManager
```

2. Instale as dependências
```bash
npm install
```

3. Configure o banco de dados
```bash
# Execute o script SQL para criar o banco e tabelas
mysql -u root -p < database.sql
```

4. Inicie o servidor
```bash
npm run dev
```

## Uso

Acesse: http://localhost:3000

### Credenciais de Teste

**Administrador:**
- Email: admin@escola.com
- Senha: 123456

**Professor:**
- Email: maria@escola.com
- Senha: 123456

**Aluno:**
- Email: ana@escola.com
- Senha: 123456

## Estrutura do Projeto

```
classManager/
├── index.html          # Interface principal
├── styles.css          # Estilos CSS
├── script-api.js       # Lógica frontend
├── server.js           # Servidor Express
├── database.sql        # Script do banco
├── config/
│   └── database.js     # Configuração MySQL
├── controllers/        # Controladores da API
├── routes/            # Rotas da API
└── middleware/        # Middlewares
```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token

### Usuários
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Turmas
- `GET /api/turmas` - Listar turmas
- `POST /api/turmas` - Criar turma
- `PUT /api/turmas/:id` - Atualizar turma
- `DELETE /api/turmas/:id` - Deletar turma

### Chamadas
- `POST /api/chamadas` - Criar chamada
- `POST /api/chamadas/:id/presencas` - Registrar presenças

### Notas
- `GET /api/notas/turma/:id` - Notas da turma
- `POST /api/notas/multiple` - Salvar múltiplas notas

## Scripts

- `npm start` - Inicia o servidor
- `npm run dev` - Modo desenvolvimento com nodemon

## Dificuldades e Aprendizados

### Principais Desafios Encontrados

#### 1. Integração Frontend-Backend
**Desafio:** Sincronizar dados entre interface e API REST
**Solução:** Implementação de funções assíncronas com fetch API e tratamento de estados de loading
**Aprendizado:** Importância de gerenciar estados de carregamento e feedback visual para o usuário

#### 2. Autenticação JWT
**Desafio:** Implementar sistema de autenticação seguro com tokens
**Solução:** Uso de JWT com middleware de verificação e armazenamento seguro no localStorage
**Aprendizado:** Necessidade de validar tokens em todas as requisições e gerenciar expiração

#### 3. Relacionamentos Complexos no Banco
**Desafio:** Modelar relacionamentos entre usuários, turmas, matrículas e notas
**Solução:** Criação de tabelas intermediárias (matriculas) e uso de JOINs para consultas
**Aprendizado:** Importância de planejar a estrutura do banco antes do desenvolvimento

#### 4. Interface Responsiva
**Desafio:** Criar interface que funcione em desktop e mobile
**Solução:** Uso de CSS Grid, Flexbox e media queries
**Aprendizado:** Design mobile-first é essencial para boa experiência do usuário

#### 5. Gerenciamento de Estado
**Desafio:** Manter dados sincronizados entre diferentes telas
**Solução:** Implementação de variáveis globais e recarregamento de dados após operações CRUD
**Aprendizado:** Estado global bem gerenciado é crucial para aplicações SPA

#### 6. Validação de Dados
**Desafio:** Garantir integridade dos dados tanto no frontend quanto backend
**Solução:** Validação dupla - client-side para UX e server-side para segurança
**Aprendizado:** Nunca confiar apenas na validação do frontend

#### 7. Tratamento de Erros
**Desafio:** Fornecer feedback claro sobre erros para o usuário
**Solução:** Sistema de mensagens padronizado e logs estruturados
**Aprendizado:** Tratamento de erro é parte fundamental da experiência do usuário

### Lições Aprendidas

1. **Planejamento é Fundamental:** Definir estrutura do banco e APIs antes de começar o desenvolvimento
2. **Testes Contínuos:** Testar funcionalidades incrementalmente evita problemas complexos
3. **Documentação:** Manter documentação atualizada facilita manutenção
4. **Código Limpo:** Seguir padrões de código melhora legibilidade e manutenibilidade
5. **Feedback do Usuário:** Implementar indicadores visuais melhora significativamente a UX

### Melhorias Futuras

- Implementar testes automatizados
- Adicionar validação mais robusta
- Melhorar tratamento de erros
- Implementar cache para melhor performance
- Adicionar funcionalidades de relatórios