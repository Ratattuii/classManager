// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

// Estado global da aplicação
let currentUser = null;
let currentScreen = 'login';
let authToken = null;
let currentModalForm = null; // Para controlar qual formulário está ativo no modal

// Função para fazer requisições à API
/**
 * Makes authenticated API requests to the backend
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Request options (method, body, etc.)
 * @returns {Promise<Object>} API response data
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
    }

    return data;
}

// Função para mostrar mensagens
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}

// Função para mostrar loading
function showLoading(show = true) {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = show ? 'block' : 'none';
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeApp();
    }, 100);
});

function initializeApp() {
    setupEventListeners();
    checkAuthStatus();
}

function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout buttons
    document.querySelectorAll('#logout-btn, #logout-btn-teacher, #logout-btn-student').forEach(btn => {
        btn.addEventListener('click', handleLogout);
    });

    // Admin panel buttons
    const createTurmaBtn = document.getElementById('add-turma-btn');
    if (createTurmaBtn) {
        createTurmaBtn.addEventListener('click', () => showCreateTurmaModal());
    }

    const createProfessorBtn = document.getElementById('add-professor-btn');
    if (createProfessorBtn) {
        createProfessorBtn.addEventListener('click', () => showCreateProfessorModal());
    }

    const createAlunoBtn = document.getElementById('add-aluno-btn');
    if (createAlunoBtn) {
        createAlunoBtn.addEventListener('click', () => showCreateAlunoModal());
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Modal cancel button
    const modalCancel = document.getElementById('modal-cancel');
    if (modalCancel) {
        modalCancel.addEventListener('click', closeModal);
    }

    // Modal save button - será configurado dinamicamente
    const modalSave = document.getElementById('modal-save');
    if (modalSave) {
        modalSave.addEventListener('click', handleModalSave);
    }

    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.getAttribute('data-section');
            if (section) {
                showSection(section);
            }
        });
    });

    // Botões específicos do professor
    const salvarChamadaBtn = document.getElementById('salvar-chamada-btn');
    if (salvarChamadaBtn) {
        salvarChamadaBtn.addEventListener('click', handleChamadaFromSection);
    }

    const salvarNotasBtn = document.getElementById('salvar-notas-btn');
    if (salvarNotasBtn) {
        salvarNotasBtn.addEventListener('click', handleNotasFromSection);
    }

    // Select de turma para chamada
    const turmaChamadaSelect = document.getElementById('turma-chamada-select');
    if (turmaChamadaSelect) {
        turmaChamadaSelect.addEventListener('change', loadAlunosForChamada);
    }

    // Select de turma para notas
    const turmaNotasSelect = document.getElementById('turma-notas-select');
    if (turmaNotasSelect) {
        turmaNotasSelect.addEventListener('change', loadAlunosForNotas);
    }
}

/**
 * Checks if user is authenticated and loads user data if valid token exists
 */
async function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showScreen('login');
        return;
    }

    authToken = token;
    try {
        const response = await apiRequest('/auth/verify');
        currentUser = response.data.user;
        showScreen(currentUser.perfil);
    } catch (error) {
        localStorage.removeItem('authToken');
        authToken = null;
        showScreen('login');
    }
}

/**
 * Handles user login authentication
 * @param {Event} e - Form submit event
 */
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('username').value;
    const senha = document.getElementById('password').value;

    if (!email || !senha) {
        showMessage('Por favor, preencha todos os campos', 'error');
        return;
    }

    showLoading(true);
    try {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });

        currentUser = response.data.user;
        authToken = response.data.token;
        localStorage.setItem('authToken', authToken);
        showMessage('Login realizado com sucesso!', 'success');
        showScreen(currentUser.perfil);
        await loadUserData();
    } catch (error) {
        showMessage(error.message || 'Erro no login', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Handles user logout and clears authentication data
 */
function handleLogout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('authToken');
    showScreen('login');
    showMessage('Logout realizado com sucesso!', 'success');
}

/**
 * Shows the specified screen and hides all others
 * @param {string} screenName - Name of the screen to show
 */
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const screenMap = {
        'admin': 'admin-screen',
        'professor': 'teacher-screen',
        'aluno': 'student-screen'
    };

    const targetScreen = screenMap[screenName] || 'login-screen';
    const screenElement = document.getElementById(targetScreen);
    if (screenElement) {
        screenElement.classList.add('active');
    }
}

/**
 * Shows the specified section within the current screen
 * @param {string} sectionName - Name of the section to show
 */
function showSection(sectionName) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

/**
 * Loads user-specific data based on user profile
 */
async function loadUserData() {
    if (!currentUser) {
        return;
    }

    const dataLoaders = {
        'admin': loadAdminData,
        'professor': loadProfessorData,
        'aluno': loadAlunoData
    };

    const loader = dataLoaders[currentUser.perfil];
    if (loader) {
        try {
            await loader();
        } catch (error) {
            showMessage('Erro ao carregar dados', 'error');
        }
    }
}

// Carregar dados do admin
async function loadAdminData() {
    try {
        // Carregar turmas
        const turmasResponse = await apiRequest('/turmas');
        displayTurmas(turmasResponse.data);

        // Carregar professores
        const professoresResponse = await apiRequest('/users/professores');
        displayProfessores(professoresResponse.data);

        // Carregar alunos
        const alunosResponse = await apiRequest('/users/alunos');
        displayAlunos(alunosResponse.data);

    } catch (error) {
        showMessage('Erro ao carregar dados: ' + error.message, 'error');
    }
}

// Carregar dados do professor
async function loadProfessorData() {
    try {
        
        // Carregar turmas do professor
        const turmasResponse = await apiRequest(`/turmas?professor_id=${currentUser.id}`);
        
        displayProfessorTurmas(turmasResponse.data);
        
        // Carregar turmas nos selects de chamada e notas
        loadTurmasInSelects(turmasResponse.data);

    } catch (error) {
        showMessage('Erro ao carregar dados do professor: ' + error.message, 'error');
    }
}

// Carregar dados do aluno
async function loadAlunoData() {
    try {
        
        // Carregar turmas do aluno - buscar matrículas primeiro
        const matriculasResponse = await apiRequest(`/turmas/aluno/${currentUser.id}`);
        
        displayAlunoTurmas(matriculasResponse.data);

        // Carregar presenças
        const presencasResponse = await apiRequest(`/chamadas/aluno/${currentUser.id}/historico`);
        displayAlunoPresencas(presencasResponse.data);

        // Carregar notas
        const notasResponse = await apiRequest(`/notas/aluno/${currentUser.id}`);
        displayAlunoNotas(notasResponse.data);

    } catch (error) {
        showMessage('Erro ao carregar dados do aluno: ' + error.message, 'error');
    }
}

// Exibir turmas (admin)
function displayTurmas(turmas) {
    const container = document.getElementById('turmas-table-body');
    if (!container) return;

    container.innerHTML = '';
    turmas.forEach(turma => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${turma.id}</td>
            <td>${turma.nome}</td>
            <td>${turma.ano}</td>
            <td>${turma.periodo}</td>
            <td>${turma.professor_nome || 'Não atribuído'}</td>
            <td>0</td>
            <td>
                <button onclick="editTurma(${turma.id})" class="btn btn-secondary">Editar</button>
                <button onclick="deleteTurma(${turma.id})" class="btn btn-danger">Excluir</button>
            </td>
        `;
        container.appendChild(row);
    });
}

// Exibir professores (admin)
function displayProfessores(professores) {
    const container = document.getElementById('professores-table-body');
    if (!container) return;

    container.innerHTML = '';
    professores.forEach(professor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${professor.id}</td>
            <td>${professor.nome}</td>
            <td>${professor.email || ''}</td>
            <td>-</td>
            <td>-</td>
            <td>
                <button onclick="editProfessor(${professor.id})" class="btn btn-secondary">Editar</button>
                <button onclick="deleteProfessor(${professor.id})" class="btn btn-danger">Excluir</button>
            </td>
        `;
        container.appendChild(row);
    });
}

// Exibir alunos (admin)
function displayAlunos(alunos) {
    const container = document.getElementById('alunos-table-body');
    if (!container) return;

    container.innerHTML = '';
    alunos.forEach(aluno => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${aluno.id}</td>
            <td>${aluno.nome}</td>
            <td>${aluno.email || ''}</td>
            <td>-</td>
            <td>Ativo</td>
            <td>
                <button onclick="editAluno(${aluno.id})" class="btn btn-secondary">Editar</button>
                <button onclick="deleteAluno(${aluno.id})" class="btn btn-danger">Excluir</button>
            </td>
        `;
        container.appendChild(row);
    });
}

// Exibir turmas do professor
function displayProfessorTurmas(turmas) {
    const container = document.getElementById('teacher-turmas-grid');
    if (!container) {
        return;
    }

    container.innerHTML = '';
    turmas.forEach(turma => {
        const turmaDiv = document.createElement('div');
        turmaDiv.className = 'turma-card';
        turmaDiv.innerHTML = `
            <h3>${turma.nome}</h3>
            <p><strong>Ano:</strong> ${turma.ano}</p>
            <p><strong>Período:</strong> ${turma.periodo}</p>
            <div class="turma-actions">
                <button onclick="viewTurmaAlunos(${turma.id})" class="btn btn-primary">Ver Alunos</button>
                <button onclick="lancarChamada(${turma.id})" class="btn btn-success">Lançar Chamada</button>
                <button onclick="lancarNotas(${turma.id})" class="btn btn-info">Lançar Notas</button>
            </div>
        `;
        container.appendChild(turmaDiv);
    });
}

// Carregar turmas nos selects de chamada e notas
function loadTurmasInSelects(turmas) {
    // Select de chamada
    const chamadaSelect = document.getElementById('turma-chamada-select');
    if (chamadaSelect) {
        chamadaSelect.innerHTML = '<option value="">Selecione uma turma</option>';
        turmas.forEach(turma => {
            const option = document.createElement('option');
            option.value = turma.id;
            option.textContent = `${turma.nome} - ${turma.periodo}`;
            chamadaSelect.appendChild(option);
        });
    }
    
    // Select de notas
    const notasSelect = document.getElementById('turma-notas-select');
    if (notasSelect) {
        notasSelect.innerHTML = '<option value="">Selecione uma turma</option>';
        turmas.forEach(turma => {
            const option = document.createElement('option');
            option.value = turma.id;
            option.textContent = `${turma.nome} - ${turma.periodo}`;
            notasSelect.appendChild(option);
        });
    }
}

// Exibir turmas do aluno
function displayAlunoTurmas(turmas) {
    const container = document.getElementById('student-turma-info');
    if (!container) {
        return;
    }

    container.innerHTML = '';
    turmas.forEach(turma => {
        const turmaDiv = document.createElement('div');
        turmaDiv.className = 'turma-card';
        turmaDiv.innerHTML = `
            <h3>${turma.nome}</h3>
            <p><strong>Ano:</strong> ${turma.ano}</p>
            <p><strong>Período:</strong> ${turma.periodo}</p>
            <p><strong>Professor:</strong> ${turma.professor_nome}</p>
        `;
        container.appendChild(turmaDiv);
    });
}

// Exibir presenças do aluno
function displayAlunoPresencas(presencas) {
    const container = document.getElementById('presencas-container');
    if (!container) {
        return;
    }

    container.innerHTML = '';
    presencas.forEach(presenca => {
        const presencaDiv = document.createElement('div');
        presencaDiv.className = `presenca-card ${presenca.presente ? 'presente' : 'falta'}`;
        presencaDiv.innerHTML = `
            <h4>${presenca.turma_nome}</h4>
            <p><strong>Data:</strong> ${new Date(presenca.data_chamada).toLocaleDateString('pt-BR')}</p>
            <p><strong>Status:</strong> ${presenca.presente ? 'Presente' : 'Faltou'}</p>
        `;
        container.appendChild(presencaDiv);
    });
}

// Exibir notas do aluno
function displayAlunoNotas(notas) {
    const container = document.getElementById('notas-aluno-container');
    if (!container) {
        return;
    }

    container.innerHTML = '';
    if (notas.length === 0) {
        container.innerHTML = '<p>Nenhuma nota encontrada.</p>';
        return;
    }

    notas.forEach(nota => {
        const notaDiv = document.createElement('div');
        notaDiv.className = 'nota-card';
        notaDiv.innerHTML = `
            <h4>${nota.turma_nome}</h4>
            <p><strong>Nota 1:</strong> ${nota.nota1 || 'N/A'}</p>
            <p><strong>Nota 2:</strong> ${nota.nota2 || 'N/A'}</p>
            <p><strong>Média:</strong> ${nota.media || 'N/A'}</p>
        `;
        container.appendChild(notaDiv);
    });
}

// Modal functions
function showCreateTurmaModal() {
    currentModalForm = 'turma';
    const modal = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = 'Nova Turma';
    body.innerHTML = `
        <form id="turma-form">
            <div class="form-group">
                <label for="turma-nome">Nome da Turma</label>
                <input type="text" id="turma-nome" name="nome" required>
            </div>
            <div class="form-group">
                <label for="turma-ano">Ano</label>
                <input type="text" id="turma-ano" name="ano" required>
            </div>
            <div class="form-group">
                <label for="turma-periodo">Período</label>
                <select id="turma-periodo" name="periodo" required>
                    <option value="">Selecione o período</option>
                    <option value="Matutino">Matutino</option>
                    <option value="Vespertino">Vespertino</option>
                    <option value="Noturno">Noturno</option>
                </select>
            </div>
            <div class="form-group">
                <label for="turma-professor">Professor</label>
                <select id="turma-professor" name="professor_id">
                    <option value="">Selecione um professor</option>
                </select>
            </div>
        </form>
    `;
    
    modal.style.display = 'block';
    
    // Carregar professores para o select
    loadProfessoresForSelect();
}

function showCreateProfessorModal() {
    currentModalForm = 'professor';
    const modal = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = 'Novo Professor';
    body.innerHTML = `
        <form id="professor-form">
            <div class="form-group">
                <label for="professor-nome">Nome</label>
                <input type="text" id="professor-nome" name="nome" required>
            </div>
            <div class="form-group">
                <label for="professor-email">Email</label>
                <input type="email" id="professor-email" name="email" required>
            </div>
            <div class="form-group">
                <label for="professor-senha">Senha</label>
                <input type="password" id="professor-senha" name="senha" required>
            </div>
        </form>
    `;
    
    modal.style.display = 'block';
}

function showCreateAlunoModal() {
    currentModalForm = 'aluno';
    const modal = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = 'Novo Aluno';
    body.innerHTML = `
        <form id="aluno-form">
            <div class="form-group">
                <label for="aluno-nome">Nome</label>
                <input type="text" id="aluno-nome" name="nome" required>
            </div>
            <div class="form-group">
                <label for="aluno-email">Email</label>
                <input type="email" id="aluno-email" name="email" required>
            </div>
            <div class="form-group">
                <label for="aluno-senha">Senha</label>
                <input type="password" id="aluno-senha" name="senha" required>
            </div>
        </form>
    `;
    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('modal-overlay');
    modal.style.display = 'none';
    currentModalForm = null;
}

// Função para lidar com o botão salvar do modal
async function handleModalSave() {
    if (!currentModalForm) return;
    
    switch (currentModalForm) {
        case 'turma':
            await handleTurmaSubmit();
            break;
        case 'professor':
            await handleProfessorSubmit();
            break;
        case 'aluno':
            await handleAlunoSubmit();
            break;
        case 'edit-turma':
            await handleEditTurmaSubmit();
            break;
        case 'edit-professor':
            await handleEditProfessorSubmit();
            break;
        case 'edit-aluno':
            await handleEditAlunoSubmit();
            break;
    }
}

// Função para carregar professores no select
async function loadProfessoresForSelect() {
    try {
        const response = await apiRequest('/users/professores');
        const professores = response.data;
        
        // Armazenar dados globalmente para uso em outros modais
        window.professoresData = professores;
        
        const select = document.getElementById('turma-professor');
        if (select) {
            select.innerHTML = '<option value="">Selecione um professor</option>';
            professores.forEach(professor => {
                const option = document.createElement('option');
                option.value = professor.id;
                option.textContent = professor.nome;
                select.appendChild(option);
            });
        }
    } catch (error) {
    }
}

// Form handlers
async function handleTurmaSubmit() {
    const form = document.getElementById('turma-form');
    if (!form) return;
    
    const formData = new FormData(form);
    const turmaData = {
        nome: formData.get('nome'),
        ano: formData.get('ano'),
        periodo: formData.get('periodo'),
        professor_id: formData.get('professor_id') || null
    };

    try {
        showLoading(true);
        await apiRequest('/turmas', {
            method: 'POST',
            body: JSON.stringify(turmaData)
        });

        showMessage('Turma criada com sucesso!', 'success');
        closeModal();
        form.reset();
        await loadAdminData();

    } catch (error) {
        showMessage(error.message || 'Erro ao criar turma', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleProfessorSubmit() {
    const form = document.getElementById('professor-form');
    if (!form) return;
    
    const formData = new FormData(form);
    const professorData = {
        nome: formData.get('nome'),
        email: formData.get('email'),
        senha: formData.get('senha'),
        perfil: 'professor'
    };

    try {
        showLoading(true);
        await apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify(professorData)
        });

        showMessage('Professor criado com sucesso!', 'success');
        closeModal();
        form.reset();
        await loadAdminData();

    } catch (error) {
        showMessage(error.message || 'Erro ao criar professor', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleAlunoSubmit() {
    const form = document.getElementById('aluno-form');
    if (!form) return;
    
    const formData = new FormData(form);
    const alunoData = {
        nome: formData.get('nome'),
        email: formData.get('email'),
        senha: formData.get('senha'),
        perfil: 'aluno'
    };

    try {
        showLoading(true);
        await apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify(alunoData)
        });

        showMessage('Aluno criado com sucesso!', 'success');
        closeModal();
        form.reset();
        await loadAdminData();

    } catch (error) {
        showMessage(error.message || 'Erro ao criar aluno', 'error');
    } finally {
        showLoading(false);
    }
}

// Placeholder functions para funcionalidades futuras
// Editar turma
async function editTurma(id) {
    try {
        // Buscar dados da turma
        const response = await apiRequest(`/turmas/${id}`);
        const turma = response.data;
        
        // Carregar professores para o select
        await loadProfessoresForSelect();
        
        // Mostrar modal de edição
        showEditTurmaModal(turma);
    } catch (error) {
        showMessage('Erro ao carregar turma: ' + error.message, 'error');
    }
}

// Mostrar modal de edição de turma
function showEditTurmaModal(turma) {
    currentModalForm = 'edit-turma';
    const modal = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = 'Editar Turma';
    body.innerHTML = `
        <form id="edit-turma-form">
            <input type="hidden" id="turma-id" value="${turma.id}">
            <div class="form-group">
                <label for="edit-turma-nome">Nome da Turma:</label>
                <input type="text" id="edit-turma-nome" class="form-control" value="${turma.nome}" required>
            </div>
            <div class="form-group">
                <label for="edit-turma-ano">Ano:</label>
                <input type="text" id="edit-turma-ano" class="form-control" value="${turma.ano}" required>
            </div>
            <div class="form-group">
                <label for="edit-turma-periodo">Período:</label>
                <select id="edit-turma-periodo" class="form-control" required>
                    <option value="Matutino" ${turma.periodo === 'Matutino' ? 'selected' : ''}>Matutino</option>
                    <option value="Vespertino" ${turma.periodo === 'Vespertino' ? 'selected' : ''}>Vespertino</option>
                    <option value="Noturno" ${turma.periodo === 'Noturno' ? 'selected' : ''}>Noturno</option>
                </select>
            </div>
            <div class="form-group">
                <label for="edit-turma-professor">Professor:</label>
                <select id="edit-turma-professor" class="form-control" required>
                    <option value="">Selecione um professor</option>
                </select>
            </div>
        </form>
    `;
    
    modal.style.display = 'flex';
    
    // Configurar botão salvar
    const modalSave = document.getElementById('modal-save');
    modalSave.textContent = 'Salvar Alterações';
    modalSave.onclick = () => handleEditTurmaSubmit();
    
    // Preencher select de professores
    setTimeout(() => {
        const professorSelect = document.getElementById('edit-turma-professor');
        if (professorSelect && window.professoresData) {
            window.professoresData.forEach(prof => {
                const option = document.createElement('option');
                option.value = prof.id;
                option.textContent = prof.nome;
                if (prof.id === turma.professor_id) {
                    option.selected = true;
                }
                professorSelect.appendChild(option);
            });
        }
    }, 100);
}

// Salvar edição de turma
async function handleEditTurmaSubmit() {
    try {
        const id = document.getElementById('turma-id').value;
        const nome = document.getElementById('edit-turma-nome').value;
        const ano = document.getElementById('edit-turma-ano').value;
        const periodo = document.getElementById('edit-turma-periodo').value;
        const professor_id = document.getElementById('edit-turma-professor').value;
        
        if (!nome || !ano || !periodo || !professor_id) {
            showMessage('Por favor, preencha todos os campos', 'error');
            return;
        }
        
        await apiRequest(`/turmas/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ nome, ano, periodo, professor_id })
        });
        
        showMessage('Turma atualizada com sucesso!', 'success');
        closeModal();
        await loadAdminData();
        
    } catch (error) {
        showMessage('Erro ao atualizar turma: ' + error.message, 'error');
    }
}

// Deletar turma
async function deleteTurma(id) {
    if (!confirm('Tem certeza que deseja deletar esta turma?')) {
        return;
    }
    
    try {
        await apiRequest(`/turmas/${id}`, { method: 'DELETE' });
        showMessage('Turma deletada com sucesso!', 'success');
        await loadAdminData();
    } catch (error) {
        showMessage('Erro ao deletar turma: ' + error.message, 'error');
    }
}

// Editar professor
async function editProfessor(id) {
    try {
        // Buscar dados do professor
        const response = await apiRequest(`/users/${id}`);
        const professor = response.data;
        
        // Mostrar modal de edição
        showEditProfessorModal(professor);
    } catch (error) {
        showMessage('Erro ao carregar professor: ' + error.message, 'error');
    }
}

// Mostrar modal de edição de professor
function showEditProfessorModal(professor) {
    currentModalForm = 'edit-professor';
    const modal = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = 'Editar Professor';
    body.innerHTML = `
        <form id="edit-professor-form">
            <input type="hidden" id="professor-id" value="${professor.id}">
            <div class="form-group">
                <label for="edit-professor-nome">Nome:</label>
                <input type="text" id="edit-professor-nome" class="form-control" value="${professor.nome}" required>
            </div>
            <div class="form-group">
                <label for="edit-professor-email">Email:</label>
                <input type="email" id="edit-professor-email" class="form-control" value="${professor.email}" required>
            </div>
        </form>
    `;
    
    modal.style.display = 'flex';
    
    // Configurar botão salvar
    const modalSave = document.getElementById('modal-save');
    modalSave.textContent = 'Salvar Alterações';
    modalSave.onclick = () => handleEditProfessorSubmit();
}

// Salvar edição de professor
async function handleEditProfessorSubmit() {
    try {
        const id = document.getElementById('professor-id').value;
        const nome = document.getElementById('edit-professor-nome').value;
        const email = document.getElementById('edit-professor-email').value;
        
        if (!nome || !email) {
            showMessage('Por favor, preencha todos os campos', 'error');
            return;
        }
        
        await apiRequest(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ nome, email, perfil: 'professor' })
        });
        
        showMessage('Professor atualizado com sucesso!', 'success');
        closeModal();
        await loadAdminData();
        
    } catch (error) {
        showMessage('Erro ao atualizar professor: ' + error.message, 'error');
    }
}

// Deletar professor
async function deleteProfessor(id) {
    if (!confirm('Tem certeza que deseja deletar este professor?')) {
        return;
    }
    
    try {
        await apiRequest(`/users/${id}`, { method: 'DELETE' });
        showMessage('Professor deletado com sucesso!', 'success');
        await loadAdminData();
    } catch (error) {
        showMessage('Erro ao deletar professor: ' + error.message, 'error');
    }
}

// Editar aluno
async function editAluno(id) {
    try {
        // Buscar dados do aluno
        const response = await apiRequest(`/users/${id}`);
        const aluno = response.data;
        
        // Mostrar modal de edição
        showEditAlunoModal(aluno);
    } catch (error) {
        showMessage('Erro ao carregar aluno: ' + error.message, 'error');
    }
}

// Mostrar modal de edição de aluno
function showEditAlunoModal(aluno) {
    currentModalForm = 'edit-aluno';
    const modal = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = 'Editar Aluno';
    body.innerHTML = `
        <form id="edit-aluno-form">
            <input type="hidden" id="aluno-id" value="${aluno.id}">
            <div class="form-group">
                <label for="edit-aluno-nome">Nome:</label>
                <input type="text" id="edit-aluno-nome" class="form-control" value="${aluno.nome}" required>
            </div>
            <div class="form-group">
                <label for="edit-aluno-email">Email:</label>
                <input type="email" id="edit-aluno-email" class="form-control" value="${aluno.email}" required>
            </div>
        </form>
    `;
    
    modal.style.display = 'flex';
    
    // Configurar botão salvar
    const modalSave = document.getElementById('modal-save');
    modalSave.textContent = 'Salvar Alterações';
    modalSave.onclick = () => handleEditAlunoSubmit();
}

// Salvar edição de aluno
async function handleEditAlunoSubmit() {
    try {
        const id = document.getElementById('aluno-id').value;
        const nome = document.getElementById('edit-aluno-nome').value;
        const email = document.getElementById('edit-aluno-email').value;
        
        if (!nome || !email) {
            showMessage('Por favor, preencha todos os campos', 'error');
            return;
        }
        
        await apiRequest(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ nome, email, perfil: 'aluno' })
        });
        
        showMessage('Aluno atualizado com sucesso!', 'success');
        closeModal();
        await loadAdminData();
        
    } catch (error) {
        showMessage('Erro ao atualizar aluno: ' + error.message, 'error');
    }
}

// ===== FUNCIONALIDADES DO ADMIN =====

// Deletar aluno
async function deleteAluno(id) {
    if (!confirm('Tem certeza que deseja deletar este aluno?')) {
        return;
    }
    
    try {
        await apiRequest(`/users/${id}`, { method: 'DELETE' });
        showMessage('Aluno deletado com sucesso!', 'success');
        await loadAdminData();
    } catch (error) {
        showMessage('Erro ao deletar aluno: ' + error.message, 'error');
    }
}

// ===== FUNCIONALIDADES DO PROFESSOR =====

// Visualizar alunos de uma turma
async function viewTurmaAlunos(turmaId) {
    try {
        const response = await apiRequest(`/turmas/${turmaId}/alunos`);
        
        // Criar modal para mostrar alunos
        showAlunosModal(response.data, turmaId);
    } catch (error) {
        showMessage('Erro ao carregar alunos: ' + error.message, 'error');
    }
}

// Mostrar modal com alunos
function showAlunosModal(alunos, turmaId) {
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = 'Alunos da Turma';
    modalBody.innerHTML = `
        <div class="alunos-list">
            ${alunos.map(aluno => `
                <div class="aluno-item">
                    <span class="aluno-nome">${aluno.nome}</span>
                    <span class="aluno-email">${aluno.email}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.style.display = 'flex';
    
    // Configurar botão salvar para fechar
    const modalSave = document.getElementById('modal-save');
    modalSave.textContent = 'Fechar';
    modalSave.onclick = closeModal;
}

// Lançar chamada
async function lancarChamada(turmaId) {
    try {
        
        // Carregar alunos da turma
        const alunosResponse = await apiRequest(`/turmas/${turmaId}/alunos`);
        const alunos = alunosResponse.data;
        
        // Criar modal para chamada
        showChamadaModal(alunos, turmaId);
    } catch (error) {
        showMessage('Erro ao lançar chamada: ' + error.message, 'error');
    }
}

// Mostrar modal de chamada
function showChamadaModal(alunos, turmaId) {
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = 'Lançar Chamada';
    modalBody.innerHTML = `
        <div class="chamada-form">
            <div class="form-group">
                <label for="data-chamada-modal">Data:</label>
                <input type="date" id="data-chamada-modal" class="form-control" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="alunos-chamada">
                <h4>Alunos:</h4>
                ${alunos.map(aluno => `
                    <div class="aluno-chamada-item">
                        <span class="aluno-nome">${aluno.nome}</span>
                        <label class="checkbox-container">
                            <input type="checkbox" id="aluno-${aluno.id}" checked>
                            <span class="checkmark"></span>
                            Presente
                        </label>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    
    // Configurar botão salvar
    const modalSave = document.getElementById('modal-save');
    modalSave.textContent = 'Salvar Chamada';
    modalSave.onclick = () => salvarChamada(turmaId, alunos);
}

// Salvar chamada
async function salvarChamada(turmaId, alunos) {
    try {
        const data = document.getElementById('data-chamada-modal').value;
        if (!data) {
            showMessage('Por favor, selecione uma data', 'error');
            return;
        }
        
        // Criar chamada
        const chamadaResponse = await apiRequest('/chamadas', {
            method: 'POST',
            body: JSON.stringify({
                turma_id: turmaId,
                data_chamada: data,
                professor_id: currentUser.id
            })
        });
        
        const chamadaId = chamadaResponse.data.id;
        
        // Salvar presenças
        const presencas = alunos.map(aluno => ({
            aluno_id: aluno.id,
            presente: document.getElementById(`aluno-${aluno.id}`).checked
        }));
        
        await apiRequest(`/chamadas/${chamadaId}/presencas`, {
            method: 'POST',
            body: JSON.stringify({ 
                chamada_id: chamadaId,
                presencas: presencas 
            })
        });
        
        showMessage('Chamada lançada com sucesso!', 'success');
        closeModal();
        
    } catch (error) {
        showMessage('Erro ao salvar chamada: ' + error.message, 'error');
    }
}

// Lançar notas
async function lancarNotas(turmaId) {
    try {
        
        // Carregar alunos da turma
        const alunosResponse = await apiRequest(`/turmas/${turmaId}/alunos`);
        const alunos = alunosResponse.data;
        
        // Carregar notas existentes
        const notasResponse = await apiRequest(`/notas/turma/${turmaId}`);
        const notasExistentes = notasResponse.data;
        
        // Criar modal para notas
        showNotasModal(alunos, turmaId, notasExistentes);
    } catch (error) {
        showMessage('Erro ao lançar notas: ' + error.message, 'error');
    }
}

// Mostrar modal de notas
function showNotasModal(alunos, turmaId, notasExistentes) {
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = 'Lançar Notas';
    modalBody.innerHTML = `
        <div class="notas-form">
            <div class="alunos-notas">
                ${alunos.map(aluno => {
                    const notaExistente = notasExistentes.find(n => n.aluno_id === aluno.id);
                    return `
                        <div class="aluno-nota-item">
                            <h4>${aluno.nome}</h4>
                            <div class="nota-inputs">
                                <div class="form-group">
                                    <label>Nota 1:</label>
                                    <input type="number" id="nota1-${aluno.id}" class="form-control" 
                                           value="${notaExistente ? notaExistente.nota1 : ''}" 
                                           min="0" max="10" step="0.1">
                                </div>
                                <div class="form-group">
                                    <label>Nota 2:</label>
                                    <input type="number" id="nota2-${aluno.id}" class="form-control" 
                                           value="${notaExistente ? notaExistente.nota2 : ''}" 
                                           min="0" max="10" step="0.1">
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    
    // Configurar botão salvar
    const modalSave = document.getElementById('modal-save');
    modalSave.textContent = 'Salvar Notas';
    modalSave.onclick = () => salvarNotas(turmaId, alunos, notasExistentes);
}

// Salvar notas
async function salvarNotas(turmaId, alunos, notasExistentes) {
    try {
        const notas = alunos.map(aluno => {
            const nota1 = parseFloat(document.getElementById(`nota1-${aluno.id}`).value) || 0;
            const nota2 = parseFloat(document.getElementById(`nota2-${aluno.id}`).value) || 0;
            const media = (nota1 + nota2) / 2;
            
            return {
                aluno_id: aluno.id,
                turma_id: turmaId,
                nota1: nota1,
                nota2: nota2,
                media: media,
                professor_id: currentUser.id
            };
        });
        
        await apiRequest('/notas/multiple', {
            method: 'POST',
            body: JSON.stringify({ notas })
        });
        
        showMessage('Notas salvas com sucesso!', 'success');
        closeModal();
        
    } catch (error) {
        showMessage('Erro ao salvar notas: ' + error.message, 'error');
    }
}

// ===== FUNCIONALIDADES DAS SEÇÕES DO PROFESSOR =====

// Lidar com chamada da seção específica
async function handleChamadaFromSection() {
    const turmaSelect = document.getElementById('turma-chamada-select');
    const dataInput = document.getElementById('data-chamada');
    
    if (!turmaSelect.value) {
        showMessage('Por favor, selecione uma turma', 'error');
        return;
    }
    
    if (!dataInput.value) {
        showMessage('Por favor, selecione uma data', 'error');
        return;
    }
    
    try {
        const turmaId = turmaSelect.value;
        
        // Carregar alunos da turma
        const alunosResponse = await apiRequest(`/turmas/${turmaId}/alunos`);
        const alunos = alunosResponse.data;
        
        // Criar chamada
        const chamadaResponse = await apiRequest('/chamadas', {
            method: 'POST',
            body: JSON.stringify({
                turma_id: turmaId,
                data_chamada: dataInput.value,
                professor_id: currentUser.id
            })
        });
        
        const chamadaId = chamadaResponse.data.id;
        
        // Salvar presenças baseado nos checkboxes
        const presencas = alunos.map(aluno => {
            const checkbox = document.getElementById(`chamada-aluno-${aluno.id}`);
            return {
                aluno_id: aluno.id,
                presente: checkbox ? checkbox.checked : true
            };
        });
        
        await apiRequest(`/chamadas/${chamadaId}/presencas`, {
            method: 'POST',
            body: JSON.stringify({ 
                chamada_id: chamadaId,
                presencas: presencas 
            })
        });
        
        showMessage('Chamada lançada com sucesso!', 'success');
        
        // Limpar campos
        turmaSelect.value = '';
        dataInput.value = '';
        document.getElementById('chamada-container').innerHTML = '<p>Selecione uma turma e data para lançar a chamada</p>';
        
    } catch (error) {
        showMessage('Erro ao salvar chamada: ' + error.message, 'error');
    }
}

// Lidar com notas da seção específica
async function handleNotasFromSection() {
    const turmaSelect = document.getElementById('turma-notas-select');
    
    if (!turmaSelect.value) {
        showMessage('Por favor, selecione uma turma', 'error');
        return;
    }
    
    try {
        const turmaId = turmaSelect.value;
        
        // Carregar alunos da turma
        const alunosResponse = await apiRequest(`/turmas/${turmaId}/alunos`);
        const alunos = alunosResponse.data;
        
        // Coletar notas da tabela
        const notas = alunos.map(aluno => {
            const nota1 = parseFloat(document.getElementById(`nota1-${aluno.id}`).value) || 0;
            const nota2 = parseFloat(document.getElementById(`nota2-${aluno.id}`).value) || 0;
            const media = (nota1 + nota2) / 2;
            
            return {
                aluno_id: aluno.id,
                turma_id: turmaId,
                nota1: nota1,
                nota2: nota2,
                media: media,
                professor_id: currentUser.id
            };
        });
        
        // Salvar notas
        await apiRequest('/notas/multiple', {
            method: 'POST',
            body: JSON.stringify({ notas })
        });
        
        showMessage('Notas salvas com sucesso!', 'success');
        
        // Recarregar a tabela para mostrar as notas salvas
        await loadAlunosForNotas();
        
    } catch (error) {
        showMessage('Erro ao salvar notas: ' + error.message, 'error');
    }
}

// Calcular média automaticamente
function calcularMedia(alunoId) {
    const nota1 = parseFloat(document.getElementById(`nota1-${alunoId}`).value) || 0;
    const nota2 = parseFloat(document.getElementById(`nota2-${alunoId}`).value) || 0;
    const media = (nota1 + nota2) / 2;
    
    const mediaElement = document.getElementById(`media-${alunoId}`);
    if (mediaElement) {
        mediaElement.textContent = media.toFixed(1);
        
        // Adicionar cor baseada na média
        mediaElement.className = 'media-display';
        if (media >= 7) {
            mediaElement.classList.add('aprovado');
        } else if (media >= 5) {
            mediaElement.classList.add('recuperacao');
        } else {
            mediaElement.classList.add('reprovado');
        }
    }
}

// Carregar alunos para chamada quando selecionar turma
async function loadAlunosForChamada() {
    const turmaSelect = document.getElementById('turma-chamada-select');
    const container = document.getElementById('chamada-container');
    
    if (!turmaSelect.value) {
        container.innerHTML = '<p>Selecione uma turma e data para lançar a chamada</p>';
        return;
    }
    
    try {
        const turmaId = turmaSelect.value;
        
        // Carregar alunos da turma
        const alunosResponse = await apiRequest(`/turmas/${turmaId}/alunos`);
        const alunos = alunosResponse.data;
        
        // Mostrar lista de alunos com checkboxes
        container.innerHTML = `
            <div class="chamada-alunos">
                <h4>Alunos da Turma:</h4>
                <div class="alunos-chamada-list">
                    ${alunos.map(aluno => `
                        <div class="aluno-chamada-item">
                            <span class="aluno-nome">${aluno.nome}</span>
                            <label class="checkbox-container">
                                <input type="checkbox" id="chamada-aluno-${aluno.id}" checked>
                                <span class="checkmark"></span>
                                Presente
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
    } catch (error) {
        container.innerHTML = '<p>Erro ao carregar alunos da turma</p>';
    }
}

// Carregar alunos para notas quando selecionar turma
async function loadAlunosForNotas() {
    const turmaSelect = document.getElementById('turma-notas-select');
    const container = document.getElementById('notas-container');
    
    if (!turmaSelect.value) {
        container.innerHTML = '<p>Selecione uma turma para lançar notas</p>';
        return;
    }
    
    try {
        const turmaId = turmaSelect.value;
        
        // Carregar alunos da turma
        const alunosResponse = await apiRequest(`/turmas/${turmaId}/alunos`);
        const alunos = alunosResponse.data;
        
        // Carregar notas existentes
        const notasResponse = await apiRequest(`/notas/turma/${turmaId}`);
        const notasExistentes = notasResponse.data;
        
        // Mostrar tabela de notas
        container.innerHTML = `
            <div class="notas-alunos">
                <h4>Lançar Notas - Alunos da Turma:</h4>
                <div class="notas-table-container">
                    <table class="notas-table">
                        <thead>
                            <tr>
                                <th>Aluno</th>
                                <th>Nota 1</th>
                                <th>Nota 2</th>
                                <th>Média</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${alunos.map(aluno => {
                                const notaExistente = notasExistentes.find(n => n.aluno_id === aluno.id);
                                const nota1 = notaExistente ? notaExistente.nota1 : '';
                                const nota2 = notaExistente ? notaExistente.nota2 : '';
                                const media = notaExistente ? notaExistente.media : '';
                                
                                return `
                                    <tr>
                                        <td class="aluno-nome">${aluno.nome}</td>
                                        <td>
                                            <input type="number" 
                                                   id="nota1-${aluno.id}" 
                                                   class="nota-input" 
                                                   value="${nota1}" 
                                                   min="0" max="10" step="0.1"
                                                   onchange="calcularMedia(${aluno.id})">
                                        </td>
                                        <td>
                                            <input type="number" 
                                                   id="nota2-${aluno.id}" 
                                                   class="nota-input" 
                                                   value="${nota2}" 
                                                   min="0" max="10" step="0.1"
                                                   onchange="calcularMedia(${aluno.id})">
                                        </td>
                                        <td>
                                            <span id="media-${aluno.id}" class="media-display ${media >= 7 ? 'aprovado' : media >= 5 ? 'recuperacao' : 'reprovado'}">${media}</span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
    } catch (error) {
        container.innerHTML = '<p>Erro ao carregar alunos da turma</p>';
    }
}
