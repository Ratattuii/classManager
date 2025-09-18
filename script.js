// Dados mocados para o sistema
const mockData = {
    users: {
        'admin': { username: 'admin', password: 'senha123', role: 'admin', name: 'Cláudia Silva' },
        'prof.marcos': { username: 'prof.marcos', password: 'senha123', role: 'teacher', name: 'Marcos Oliveira' },
        'ana.souza': { username: 'ana.souza', password: 'senha123', role: 'student', name: 'Ana Souza' }
    },
    
    turmas: [
        { id: 1, nome: '2º Ano A', ano: '2024', periodo: 'Matutino', professorId: 1, professorNome: 'Marcos Oliveira', alunos: 25 },
        { id: 2, nome: '2º Ano B', ano: '2024', periodo: 'Vespertino', professorId: 2, professorNome: 'Maria Santos', alunos: 23 },
        { id: 3, nome: '3º Ano A', ano: '2024', periodo: 'Matutino', professorId: 1, professorNome: 'Marcos Oliveira', alunos: 28 }
    ],
    
    professores: [
        { id: 1, nome: 'Marcos Oliveira', email: 'marcos@escola.com', disciplina: 'Matemática', turmas: ['2º Ano A', '3º Ano A'] },
        { id: 2, nome: 'Maria Santos', email: 'maria@escola.com', disciplina: 'Português', turmas: ['2º Ano B'] },
        { id: 3, nome: 'João Silva', email: 'joao@escola.com', disciplina: 'História', turmas: [] }
    ],
    
    alunos: [
        { id: 1, nome: 'Ana Souza', email: 'ana@escola.com', turmaId: 1, turmaNome: '2º Ano A', status: 'Ativo' },
        { id: 2, nome: 'Lucas Ferreira', email: 'lucas@escola.com', turmaId: 1, turmaNome: '2º Ano A', status: 'Ativo' },
        { id: 3, nome: 'Pedro Costa', email: 'pedro@escola.com', turmaId: 2, turmaNome: '2º Ano B', status: 'Ativo' },
        { id: 4, nome: 'Julia Lima', email: 'julia@escola.com', turmaId: 3, turmaNome: '3º Ano A', status: 'Ativo' }
    ],
    
    presencas: {
        '1': [ // Turma 1
            { data: '2024-01-15', alunoId: 1, presente: true },
            { data: '2024-01-15', alunoId: 2, presente: false },
            { data: '2024-01-16', alunoId: 1, presente: true },
            { data: '2024-01-16', alunoId: 2, presente: true }
        ]
    },
    
    notas: {
        '1': [ // Turma 1
            { alunoId: 1, nota1: 8.5, nota2: 9.0, media: 8.75 },
            { alunoId: 2, nota1: 6.0, nota2: 7.5, media: 6.75 }
        ]
    }
};

// Estado global da aplicação
let currentUser = null;
let currentScreen = 'login';

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco mais para garantir que todos os elementos estejam carregados
    setTimeout(() => {
        initializeApp();
    }, 100);
});

function initializeApp() {
    setupEventListeners();
    showScreen('login');
}

function setupEventListeners() {
    // Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    const logoutBtnTeacher = document.getElementById('logout-btn-teacher');
    if (logoutBtnTeacher) logoutBtnTeacher.addEventListener('click', logout);
    
    const logoutBtnStudent = document.getElementById('logout-btn-student');
    if (logoutBtnStudent) logoutBtnStudent.addEventListener('click', logout);
    
    // Navegação Admin
    document.querySelectorAll('.admin-nav .nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchAdminSection(e.target.dataset.section));
    });
    
    // Navegação Teacher
    document.querySelectorAll('.teacher-nav .nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchTeacherSection(e.target.dataset.section));
    });
    
    // Navegação Student
    document.querySelectorAll('.student-nav .nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchStudentSection(e.target.dataset.section));
    });
    
    // Botões de adicionar
    const addTurmaBtn = document.getElementById('add-turma-btn');
    if (addTurmaBtn) addTurmaBtn.addEventListener('click', () => showModal('Nova Turma', createTurmaForm()));
    
    const addProfessorBtn = document.getElementById('add-professor-btn');
    if (addProfessorBtn) addProfessorBtn.addEventListener('click', () => showModal('Novo Professor', createProfessorForm()));
    
    const addAlunoBtn = document.getElementById('add-aluno-btn');
    if (addAlunoBtn) addAlunoBtn.addEventListener('click', () => showModal('Novo Aluno', createAlunoForm()));
    
    // Controles de chamada e notas
    const turmaChamadaSelect = document.getElementById('turma-chamada-select');
    if (turmaChamadaSelect) turmaChamadaSelect.addEventListener('change', loadChamada);
    
    const turmaNotasSelect = document.getElementById('turma-notas-select');
    if (turmaNotasSelect) turmaNotasSelect.addEventListener('change', loadNotas);
    
    const salvarChamadaBtn = document.getElementById('salvar-chamada-btn');
    if (salvarChamadaBtn) salvarChamadaBtn.addEventListener('click', salvarChamada);
    
    const salvarNotasBtn = document.getElementById('salvar-notas-btn');
    if (salvarNotasBtn) salvarNotasBtn.addEventListener('click', salvarNotas);
    
    // Modal
    const modalCancel = document.getElementById('modal-cancel');
    if (modalCancel) modalCancel.addEventListener('click', hideModal);
    
    const modalClose = document.getElementById('modal-close');
    if (modalClose) modalClose.addEventListener('click', hideModal);
    
    const modalSave = document.getElementById('modal-save');
    if (modalSave) modalSave.addEventListener('click', saveModalData);
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = mockData.users[username];
    
    if (user && user.password === password) {
        currentUser = user;
        showScreen(user.role);
        loadUserData();
    } else {
        alert('Usuário ou senha incorretos!');
    }
}

function logout() {
    currentUser = null;
    showScreen('login');
    document.getElementById('login-form').reset();
}

function showScreen(screenName) {
    // Esconder todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar a tela correta
    const screenMap = {
        'login': 'login-screen',
        'admin': 'admin-screen',
        'teacher': 'teacher-screen',
        'student': 'student-screen'
    };
    
    const targetScreen = screenMap[screenName];
    const screenElement = document.getElementById(targetScreen);
    
    if (screenElement) {
        screenElement.classList.add('active');
    }
    
    currentScreen = screenName;
}

function loadUserData() {
    if (currentUser.role === 'admin') {
        loadAdminData();
    } else if (currentUser.role === 'teacher') {
        loadTeacherData();
    } else if (currentUser.role === 'student') {
        loadStudentData();
    }
}

// ===== FUNCIONALIDADES DO ADMIN =====

function loadAdminData() {
    loadTurmasTable();
    loadProfessoresTable();
    loadAlunosTable();
}

function switchAdminSection(section) {
    // Atualizar navegação
    document.querySelectorAll('.admin-nav .nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Mostrar seção
    document.querySelectorAll('#admin-screen .content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
}

function loadTurmasTable() {
    const tbody = document.getElementById('turmas-table-body');
    tbody.innerHTML = '';
    
    mockData.turmas.forEach(turma => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${turma.id}</td>
            <td>${turma.nome}</td>
            <td>${turma.ano}</td>
            <td>${turma.periodo}</td>
            <td>${turma.professorNome}</td>
            <td>${turma.alunos}</td>
            <td>
                <button class="btn btn-secondary" onclick="editTurma(${turma.id})">Editar</button>
                <button class="btn btn-error" onclick="deleteTurma(${turma.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadProfessoresTable() {
    const tbody = document.getElementById('professores-table-body');
    tbody.innerHTML = '';
    
    mockData.professores.forEach(professor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${professor.id}</td>
            <td>${professor.nome}</td>
            <td>${professor.email}</td>
            <td>${professor.disciplina}</td>
            <td>${professor.turmas.join(', ') || 'Nenhuma'}</td>
            <td>
                <button class="btn btn-secondary" onclick="editProfessor(${professor.id})">Editar</button>
                <button class="btn btn-error" onclick="deleteProfessor(${professor.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadAlunosTable() {
    const tbody = document.getElementById('alunos-table-body');
    tbody.innerHTML = '';
    
    mockData.alunos.forEach(aluno => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${aluno.id}</td>
            <td>${aluno.nome}</td>
            <td>${aluno.email}</td>
            <td>${aluno.turmaNome}</td>
            <td>${aluno.status}</td>
            <td>
                <button class="btn btn-secondary" onclick="editAluno(${aluno.id})">Editar</button>
                <button class="btn btn-error" onclick="deleteAluno(${aluno.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ===== FUNCIONALIDADES DO PROFESSOR =====

function loadTeacherData() {
    loadTeacherTurmas();
    loadTurmaSelects();
}

function switchTeacherSection(section) {
    // Atualizar navegação
    document.querySelectorAll('.teacher-nav .nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Mostrar seção
    document.querySelectorAll('#teacher-screen .content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
}

function loadTeacherTurmas() {
    const grid = document.getElementById('teacher-turmas-grid');
    grid.innerHTML = '';
    
    // Filtrar turmas do professor atual
    const teacherTurmas = mockData.turmas.filter(turma => turma.professorId === 1); // Marcos Oliveira
    
    teacherTurmas.forEach(turma => {
        const card = document.createElement('div');
        card.className = 'turma-card';
        card.innerHTML = `
            <h3>${turma.nome}</h3>
            <p><strong>Ano:</strong> ${turma.ano}</p>
            <p><strong>Período:</strong> ${turma.periodo}</p>
            <p><strong>Alunos:</strong> ${turma.alunos}</p>
            <button class="btn btn-primary" onclick="viewTurmaDetails(${turma.id})">Ver Detalhes</button>
        `;
        grid.appendChild(card);
    });
}

function loadTurmaSelects() {
    const selects = ['turma-chamada-select', 'turma-notas-select'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Selecione uma turma</option>';
        
        const teacherTurmas = mockData.turmas.filter(turma => turma.professorId === 1);
        teacherTurmas.forEach(turma => {
            const option = document.createElement('option');
            option.value = turma.id;
            option.textContent = turma.nome;
            select.appendChild(option);
        });
    });
}

function loadChamada() {
    const turmaId = document.getElementById('turma-chamada-select').value;
    const container = document.getElementById('chamada-container');
    
    if (!turmaId) {
        container.innerHTML = '<p>Selecione uma turma e data para lançar a chamada</p>';
        return;
    }
    
    const turma = mockData.turmas.find(t => t.id == turmaId);
    const alunos = mockData.alunos.filter(a => a.turmaId == turmaId);
    
    container.innerHTML = `
        <h3>Chamada - ${turma.nome}</h3>
        <div class="chamada-list">
            ${alunos.map(aluno => `
                <div class="aluno-chamada">
                    <span>${aluno.nome}</span>
                    <div class="presenca-buttons">
                        <button class="presenca-btn presente" onclick="setPresenca(${aluno.id}, true)">Presente</button>
                        <button class="presenca-btn falta" onclick="setPresenca(${aluno.id}, false)">Falta</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function setPresenca(alunoId, presente) {
    // Atualizar visual dos botões
    const alunoDiv = event.target.closest('.aluno-chamada');
    const buttons = alunoDiv.querySelectorAll('.presenca-btn');
    
    buttons.forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
    
    // Armazenar presença (em um sistema real, seria salvo no backend)
    if (!window.chamadaAtual) window.chamadaAtual = {};
    window.chamadaAtual[alunoId] = presente;
}

function salvarChamada() {
    const turmaId = document.getElementById('turma-chamada-select').value;
    const data = document.getElementById('data-chamada').value;
    
    if (!turmaId || !data) {
        alert('Selecione uma turma e data!');
        return;
    }
    
    if (!window.chamadaAtual) {
        alert('Nenhuma presença foi marcada!');
        return;
    }
    
    // Salvar presenças (simulação)
    if (!mockData.presencas[turmaId]) mockData.presencas[turmaId] = [];
    
    Object.keys(window.chamadaAtual).forEach(alunoId => {
        mockData.presencas[turmaId].push({
            data: data,
            alunoId: parseInt(alunoId),
            presente: window.chamadaAtual[alunoId]
        });
    });
    
    alert('Chamada salva com sucesso!');
    window.chamadaAtual = {};
    loadChamada();
}

function loadNotas() {
    const turmaId = document.getElementById('turma-notas-select').value;
    const container = document.getElementById('notas-container');
    
    if (!turmaId) {
        container.innerHTML = '<p>Selecione uma turma para lançar as notas</p>';
        return;
    }
    
    const turma = mockData.turmas.find(t => t.id == turmaId);
    const alunos = mockData.alunos.filter(a => a.turmaId == turmaId);
    const tipoNota = document.getElementById('tipo-nota-select').value;
    
    container.innerHTML = `
        <h3>Notas - ${turma.nome}</h3>
        <div class="notas-list">
            ${alunos.map(aluno => {
                const notaData = mockData.notas[turmaId]?.find(n => n.alunoId === aluno.id) || {};
                return `
                    <div class="aluno-chamada">
                        <span>${aluno.nome}</span>
                        <input type="number" class="nota-input" id="nota-${aluno.id}" 
                               value="${notaData[tipoNota] || ''}" 
                               min="0" max="10" step="0.1">
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function salvarNotas() {
    const turmaId = document.getElementById('turma-notas-select').value;
    const tipoNota = document.getElementById('tipo-nota-select').value;
    
    if (!turmaId) {
        alert('Selecione uma turma!');
        return;
    }
    
    const alunos = mockData.alunos.filter(a => a.turmaId == turmaId);
    let hasNotes = false;
    
    // Salvar notas (simulação)
    if (!mockData.notas[turmaId]) mockData.notas[turmaId] = [];
    
    alunos.forEach(aluno => {
        const notaInput = document.getElementById(`nota-${aluno.id}`);
        const nota = parseFloat(notaInput.value);
        
        if (!isNaN(nota)) {
            hasNotes = true;
            let notaData = mockData.notas[turmaId].find(n => n.alunoId === aluno.id);
            
            if (!notaData) {
                notaData = { alunoId: aluno.id };
                mockData.notas[turmaId].push(notaData);
            }
            
            notaData[tipoNota] = nota;
            
            // Calcular média se ambas as notas estiverem preenchidas
            if (notaData.nota1 && notaData.nota2) {
                notaData.media = ((notaData.nota1 + notaData.nota2) / 2).toFixed(2);
            }
        }
    });
    
    if (hasNotes) {
        alert('Notas salvas com sucesso!');
        loadNotas();
    } else {
        alert('Nenhuma nota foi preenchida!');
    }
}

// ===== FUNCIONALIDADES DO ALUNO =====

function loadStudentData() {
    loadStudentTurma();
    loadStudentPresencas();
    loadStudentNotas();
}

function switchStudentSection(section) {
    // Atualizar navegação
    document.querySelectorAll('.student-nav .nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Mostrar seção
    document.querySelectorAll('#student-screen .content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
}

function loadStudentTurma() {
    const container = document.getElementById('student-turma-info');
    const aluno = mockData.alunos.find(a => a.id === 1); // Ana Souza
    const turma = mockData.turmas.find(t => t.id === aluno.turmaId);
    
    container.innerHTML = `
        <div class="info-item">
            <span class="info-label">Nome:</span>
            <span class="info-value">${aluno.nome}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Turma:</span>
            <span class="info-value">${turma.nome}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Ano:</span>
            <span class="info-value">${turma.ano}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Período:</span>
            <span class="info-value">${turma.periodo}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Professor:</span>
            <span class="info-value">${turma.professorNome}</span>
        </div>
    `;
}

function loadStudentPresencas() {
    const container = document.getElementById('presencas-container');
    const alunoId = 1; // Ana Souza
    const turmaId = 1;
    
    const presencas = mockData.presencas[turmaId]?.filter(p => p.alunoId === alunoId) || [];
    
    if (presencas.length === 0) {
        container.innerHTML = '<p>Nenhuma presença registrada ainda.</p>';
        return;
    }
    
    container.innerHTML = `
        <h3>Histórico de Presenças</h3>
        ${presencas.map(presenca => `
            <div class="presenca-item">
                <span>${new Date(presenca.data).toLocaleDateString('pt-BR')}</span>
                <span class="status-presenca ${presenca.presente ? 'presente' : 'falta'}">
                    ${presenca.presente ? 'Presente' : 'Falta'}
                </span>
            </div>
        `).join('')}
    `;
}

function loadStudentNotas() {
    const container = document.getElementById('notas-aluno-container');
    const alunoId = 1; // Ana Souza
    const turmaId = 1;
    
    const notaData = mockData.notas[turmaId]?.find(n => n.alunoId === alunoId);
    
    if (!notaData) {
        container.innerHTML = '<p>Nenhuma nota lançada ainda.</p>';
        return;
    }
    
    container.innerHTML = `
        <h3>Minhas Notas</h3>
        <div class="nota-item">
            <span>Nota 1:</span>
            <span class="nota-value">${notaData.nota1 || 'N/A'}</span>
        </div>
        <div class="nota-item">
            <span>Nota 2:</span>
            <span class="nota-value">${notaData.nota2 || 'N/A'}</span>
        </div>
        <div class="nota-item">
            <span>Média Final:</span>
            <span class="nota-value">${notaData.media || 'N/A'}</span>
        </div>
    `;
}

// ===== FUNCIONALIDADES DOS MODAIS =====

function showModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal-overlay').classList.add('active');
}

function hideModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

function saveModalData() {
    // Implementar salvamento baseado no tipo de modal
    alert('Funcionalidade de salvamento será implementada na próxima versão!');
    hideModal();
}

function createTurmaForm() {
    return `
        <div class="form-group">
            <label for="modal-turma-nome">Nome da Turma</label>
            <input type="text" id="modal-turma-nome" required>
        </div>
        <div class="form-group">
            <label for="modal-turma-ano">Ano</label>
            <input type="text" id="modal-turma-ano" value="2024" required>
        </div>
        <div class="form-group">
            <label for="modal-turma-periodo">Período</label>
            <select id="modal-turma-periodo" required>
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Noturno">Noturno</option>
            </select>
        </div>
        <div class="form-group">
            <label for="modal-turma-professor">Professor</label>
            <select id="modal-turma-professor" required>
                <option value="">Selecione um professor</option>
                ${mockData.professores.map(p => `<option value="${p.id}">${p.nome}</option>`).join('')}
            </select>
        </div>
    `;
}

function createProfessorForm() {
    return `
        <div class="form-group">
            <label for="modal-prof-nome">Nome</label>
            <input type="text" id="modal-prof-nome" required>
        </div>
        <div class="form-group">
            <label for="modal-prof-email">Email</label>
            <input type="email" id="modal-prof-email" required>
        </div>
        <div class="form-group">
            <label for="modal-prof-disciplina">Disciplina</label>
            <input type="text" id="modal-prof-disciplina" required>
        </div>
    `;
}

function createAlunoForm() {
    return `
        <div class="form-group">
            <label for="modal-aluno-nome">Nome</label>
            <input type="text" id="modal-aluno-nome" required>
        </div>
        <div class="form-group">
            <label for="modal-aluno-email">Email</label>
            <input type="email" id="modal-aluno-email" required>
        </div>
        <div class="form-group">
            <label for="modal-aluno-turma">Turma</label>
            <select id="modal-aluno-turma" required>
                <option value="">Selecione uma turma</option>
                ${mockData.turmas.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
            </select>
        </div>
    `;
}

// ===== FUNÇÕES DE EDIÇÃO E EXCLUSÃO =====

function editTurma(id) {
    alert(`Editar turma ${id} - Funcionalidade será implementada na próxima versão!`);
}

function deleteTurma(id) {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
        alert(`Turma ${id} excluída!`);
        loadTurmasTable();
    }
}

function editProfessor(id) {
    alert(`Editar professor ${id} - Funcionalidade será implementada na próxima versão!`);
}

function deleteProfessor(id) {
    if (confirm('Tem certeza que deseja excluir este professor?')) {
        alert(`Professor ${id} excluído!`);
        loadProfessoresTable();
    }
}

function editAluno(id) {
    alert(`Editar aluno ${id} - Funcionalidade será implementada na próxima versão!`);
}

function deleteAluno(id) {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
        alert(`Aluno ${id} excluído!`);
        loadAlunosTable();
    }
}

function viewTurmaDetails(id) {
    alert(`Ver detalhes da turma ${id} - Funcionalidade será implementada na próxima versão!`);
}
