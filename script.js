const supabase = supabase.createClient('https://your-project-url.supabase.co', 'public-anon-key');

const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const logoutButton = document.getElementById('logout-button');
const profileForm = document.getElementById('profile-form');

loginButton.onclick = async () => {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const { error, data } = await supabase.auth.signInWithPassword({ email: username, password });
  if (error) return alert(error.message);
  loadDashboard();
};

signupButton.onclick = async () => {
  const username = document.getElementById('signup-username').value;
  const password = document.getElementById('signup-password').value;
  const { data, error } = await supabase.auth.signUp({ email: username, password });
  if (error) return alert(error.message);
  await supabase.from('profiles').insert([{ id: data.user.id, username }]);
  alert('Sign up successful. You may now log in.');
};

logoutButton.onclick = async () => {
  await supabase.auth.signOut();
  document.getElementById('auth').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
};

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
}

profileForm.onsubmit = async (e) => {
  e.preventDefault();
  const user = (await supabase.auth.getUser()).data.user;
  const first_name = document.getElementById('first_name').value;
  const last_name = document.getElementById('last_name').value;
  const gender = document.querySelector('input[name="gender"]:checked')?.value;

  const { error } = await supabase.from('profiles').update({ first_name, last_name, gender }).eq('id', user.id);
  if (error) return alert(error.message);
  alert('Profile updated');
  loadProfile();
};

async function loadDashboard() {
  document.getElementById('auth').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  showView('home');
  await loadProfile();
}

async function loadProfile() {
  const user = (await supabase.auth.getUser()).data.user;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!error) {
    document.getElementById('profile-username').textContent = data.username;
    document.getElementById('profile-fullname').textContent = `${data.first_name || ''} ${data.last_name || ''}`;
    document.getElementById('profile-coins').textContent = data.coins ?? 0;
    if (data.avatar_url) document.getElementById('avatar').src = data.avatar_url;
    document.getElementById('first_name').value = data.first_name || '';
    document.getElementById('last_name').value = data.last_name || '';
    if (data.gender) {
      document.querySelector(`input[name="gender"][value="${data.gender}"]`)?.click();
    }
  }
}

supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) loadDashboard();
});
