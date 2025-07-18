const API_URL = 'http://localhost:3000/api';

const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const btnLogout = document.getElementById('btn-logout');
const leadsList = document.getElementById('leads-list');

// Registrar usuário
registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  const nome = document.getElementById('reg-nome').value;
  const email = document.getElementById('reg-email').value;
  const senha = document.getElementById('reg-senha').value;

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ nome, email, senha }),
    });
    const data = await res.json();
    if (res.ok) {
      alert('Usuário registrado com sucesso! Faça login.');
      registerForm.reset();
    } else {
      alert(data.error || 'Erro no registro');
    }
  } catch (err) {
    alert('Erro ao conectar com servidor');
  }
});

// Login
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const senha = document.getElementById('login-senha').value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, senha }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      alert('Login feito com sucesso!');
      loginForm.reset();
      showLeads();
      toggleUI(true);
    } else {
      alert(data.error || 'Erro no login');
    }
  } catch (err) {
    alert('Erro ao conectar com servidor');
  }
});

// Logout
btnLogout.addEventListener('click', () => {
  localStorage.removeItem('token');
  leadsList.innerHTML = '';
  toggleUI(false);
});

// Mostrar leads (requisição protegida)
async function showLeads() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/leads`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const leads = await res.json();

    if (res.ok) {
      leadsList.innerHTML = '';
      leads.forEach(lead => {
        const li = document.createElement('li');
        li.textContent = `${lead.nome} — ${lead.email} — ${lead.telefone} — ${lead.etapa} — ${lead.responsavel}`;
        leadsList.appendChild(li);
      });
    } else {
      alert(leads.error || 'Erro ao buscar leads');
    }
  } catch (err) {
    alert('Erro ao conectar com servidor');
  }
}

// Alternar UI entre logado e deslogado
function toggleUI(loggedIn) {
  registerForm.style.display = loggedIn ? 'none' : 'block';
  loginForm.style.display = loggedIn ? 'none' : 'block';
  btnLogout.style.display = loggedIn ? 'block' : 'none';
}

// No carregamento da página, verifica se já está logado
window.onload = () => {
  const token = localStorage.getItem('token');
  if (token) {
    toggleUI(true);
    showLeads();
  } else {
    toggleUI(false);
  }
};
