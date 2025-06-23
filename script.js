// Initialize Supabase
const SUPABASE_URL = 'https://xdyzijzaidzmwpvmdvzd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkeXppanphaWR6bXdwdm1kdnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDQ3NTAsImV4cCI6MjA2NjE4MDc1MH0.h65kJfjWFlwaf924pIgH7Sypeef5ITEMeDjcQRAy1qI';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elements
const authContainer = document.getElementById('auth-container');
const loginScreen = document.getElementById('login-screen');
const signupScreen = document.getElementById('signup-screen');
const appContainer = document.getElementById('app-container');

// Toggle links
document.getElementById('show-signup').addEventListener('click', () => {
  loginScreen.classList.add('hidden'); signupScreen.classList.remove('hidden');
});
document.getElementById('show-login').addEventListener('click', () => {
  signupScreen.classList.add('hidden'); loginScreen.classList.remove('hidden');
});

// Sign Up
document.getElementById('btn-signup').addEventListener('click', async () => {
  const username = document.getElementById('su-username').value;
  const email = document.getElementById('su-email').value;
  const password = document.getElementById('su-password').value;
  const { user, error } = await supabase.auth.signUp({ email, password });
  if (error) return document.getElementById('su-error').textContent = error.message;
  // Insert into profiles table
  await supabase.from('profiles').insert([{ id: user.id, username }]);
  // Auto-login
  showApp();
});

// Login
document.getElementById('btn-login').addEventListener('click', async () => {
  const email = document.getElementById('li-email').value;
  const password = document.getElementById('li-password').value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return document.getElementById('li-error').textContent = error.message;
  showApp();
});

// Show main app
async function showApp() {
  authContainer.classList.add('hidden');
  appContainer.classList.remove('hidden');
  await loadProfile();
}

// Load profile data
async function loadProfile() {
  const user = supabase.auth.getUser();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', (await user).data.user.id).single();
  if (error) return console.error(error);
  // Populate profile UI
  document.getElementById('disp-username').textContent = data.username;
  document.getElementById('disp-fullname').textContent = `${data.first_name || ''} ${data.last_name || ''}`;
  document.getElementById('disp-coins').textContent = data.coins;
  if (data.avatar_url) {
    const img = document.getElementById('avatar-img');
    img.src = data.avatar_url; img.classList.remove('hidden');
  }
  // Fill edit form
  document.getElementById('first_name').value = data.first_name;
  document.getElementById('last_name').value = data.last_name;
  document.querySelector(`input[name=gender][value="${data.gender}"]`).checked = true;
}

// Update profile
document.getElementById('btn-update').addEventListener('click', async (e) => {
  e.preventDefault();
  const user = await supabase.auth.getUser();
  const updates = {
    id: user.data.user.id,
    first_name: document.getElementById('first_name').value,
    last_name: document.getElementById('last_name').value,
    gender: document.querySelector('input[name=gender]:checked').value
  };
  const { error } = await supabase.from('profiles').update(updates).eq('id', updates.id);
  document.getElementById('profile-error').textContent = error ? error.message : 'Profile updated!';
});

// Logout
document.getElementById('btn-logout').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.reload();
});
