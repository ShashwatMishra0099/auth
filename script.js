// Initialize Supabase Client
const supabaseUrl = 'https://xdyzijzaidzmwpvmdvzd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkeXppanphaWR6bXdwdm1kdnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDQ3NTAsImV4cCI6MjA2NjE4MDc1MH0.h65kJfjWFlwaf924pIgH7Sypeef5ITEMeDjcQRAy1qI';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const signupView = document.getElementById('signup-view');
const loginView = document.getElementById('login-view');
const mainInterface = document.getElementById('main-interface');

// ... (Event listeners for toggling views) ...
document.getElementById('show-login').onclick = () => { signupView.classList.add('hidden'); loginView.classList.remove('hidden'); };
document.getElementById('show-signup').onclick = () => { loginView.classList.add('hidden'); signupView.classList.remove('hidden'); };

// Sign Up
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('su-username').value;
  const password = document.getElementById('su-password').value;
  const { user, error } = await supabase.auth.signUp({ email: username, password });
  if (error) return document.getElementById('signup-error').innerText = error.message;
  // Create profile record
  await supabase.from('profiles').insert([{ id: user.id, username }]);
  loadMainInterface();
});

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('li-username').value;
  const password = document.getElementById('li-password').value;
  const { session, error } = await supabase.auth.signInWithPassword({ email: username, password });
  if (error) return document.getElementById('login-error').innerText = error.message;
  loadMainInterface();
});

// Load Main
async function loadMainInterface() {
  const user = supabase.auth.getUser();
  if (!user) return;

  // Hide auth, show main
  document.getElementById('auth-container').classList.add('hidden');
  mainInterface.classList.remove('hidden');

  // Fetch profile
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  document.getElementById('display-username').innerText = data.username;
  document.getElementById('profile-username').innerText = data.username;
  document.getElementById('profile-fullname').innerText = `${data.first_name || ''} ${data.last_name || ''}`;
  document.getElementById('profile-coins').innerText = data.coins;
  if (data.avatar_url) document.getElementById('avatar').src = data.avatar_url;
}

// Update Profile
document.getElementById('update-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = supabase.auth.getUser();
  const updates = {
    id: user.id,
    first_name: document.getElementById('first-name').value,
    last_name: document.getElementById('last-name').value,
    gender: document.querySelector('input[name="gender"]:checked')?.value
  };
  const { error } = await supabase.from('profiles').upsert(updates);
  if (error) return document.getElementById('update-error').innerText = error.message;
  loadMainInterface();
});

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.reload();
});
