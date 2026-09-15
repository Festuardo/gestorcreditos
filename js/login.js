const form = document.getElementById('loginForm');
const button = document.getElementById('loginBtn');
const message = document.getElementById('loginMessage');
const db = supabase.createClient(APP_CONFIG.supabaseUrl, APP_CONFIG.supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
  const {data: {session}} = await db.auth.getSession();
  if (session) window.location.replace('gestor.html');
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const username = document.getElementById('username').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const accounts = {
    administrador: 'administrador@gestor.local',
    admin: 'administrador@gestor.local',
    'administrador@gestor.local': 'administrador@gestor.local',
    consulta: 'consulta@gestor.local',
    usuario: 'consulta@gestor.local',
    'consulta@gestor.local': 'consulta@gestor.local'
  };
  const email = accounts[username];
  if (!email) return showMessage('Usa el usuario administrador o consulta.', 'error');
  button.disabled = true;
  showMessage('Verificando acceso…', 'info');
  const {error} = await db.auth.signInWithPassword({email, password});
  if (error) {
    button.disabled = false;
    return showMessage('Usuario o contraseña incorrectos.', 'error');
  }
  window.location.replace('gestor.html');
});

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}
