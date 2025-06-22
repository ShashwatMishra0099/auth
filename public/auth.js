// Initialize Supabase client
const SUPABASE_URL = 'https://xdyzijzaidzmwpvmdvzd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkeXppanphaWR6bXdwdm1kdnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDQ3NTAsImV4cCI6MjA2NjE4MDc1MH0.h65kJfjWFlwaf924pIgH7Sypeef5ITEMeDjcQRAy1qI';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Sign up
async function signUp(event) {
  event.preventDefault();
  const { username, email, password } = event.target.elements;
  // Auth sign up
  let { user, error: authErr } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  });
  if (authErr) return alert(authErr.message);
  // Insert profile
  const { error: dbErr } = await supabase.from('profiles').insert([{
    user_id: user.id,
    username: username.value
  }]);
  if (dbErr) return alert(dbErr.message);
  window.location = 'public/login.html';
}

// Log in
async function signIn(event) {
  event.preventDefault();
  const { email, password } = event.target.elements;
  const { error } = await supabase.auth.signIn({
    email: email.value,
    password: password.value
  });
  if (error) return alert(error.message);
  window.location = 'public/dashboard.html';
}

// Protect routes
async function requireAuth() {
  const session = supabase.auth.session();
  if (!session) window.location = 'public/login.html';
  return session.user;
}

// Fetch profile
async function loadProfile(user) {
  let { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  if (error) return alert(error.message);
  return data;
}

// Update profile
async function updateProfile(event) {
  event.preventDefault();
  let user = supabase.auth.user();
  const { first_name, last_name, gender } = event.target.elements;
  const { error } = await supabase.from('profiles').update({
    first_name: first_name.value,
    last_name: last_name.value,
    gender: gender.value
  }).eq('user_id', user.id);
  if (error) return alert(error.message);
  alert('Profile updated');
  loadAccount();
}

// Logout
function logout() {
  supabase.auth.signOut();
  window.location = 'public/login.html';
}
