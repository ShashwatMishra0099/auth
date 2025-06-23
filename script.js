import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Initialize Supabase Client
const supabaseUrl = 'https://xdyzijzaidzmwpvmdvzd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkeXppanphaWR6bXdwdm1kdnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDQ3NTAsImV4cCI6MjA2NjE4MDc1MH0.h65kJfjWFlwaf924pIgH7Sypeef5ITEMeDjcQRAy1qI'
const supabase = createClient(supabaseUrl, supabaseKey)

// DOM Elements
const authContainer = document.getElementById('auth-container')
const signupView = document.getElementById('signup-view')
const loginView = document.getElementById('login-view')
const mainInterface = document.getElementById('main-interface')

// Toggle between SignUp/Login
document.getElementById('show-login').addEventListener('click', () => {
  signupView.classList.add('hidden')
  loginView.classList.remove('hidden')
})

document.getElementById('show-signup').addEventListener('click', () => {
  loginView.classList.add('hidden')
  signupView.classList.remove('hidden')
})

// On page load check session
window.addEventListener('load', async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) loadMainInterface(session.user)
})

// Sign Up
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  clearError('signup-error')
  const email = suUsername.value
  const password = suPassword.value
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return showError('signup-error', error.message)
  // Auto sign in
  const { data: signin, error: signinErr } = await supabase.auth.signInWithPassword({ email, password })
  if (signinErr) return showError('signup-error', signinErr.message)
  // Ensure profile exists
  await supabase.from('profiles').upsert([{ id: signin.user.id, username: email }])
})

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  clearError('login-error')
  const email = liUsername.value
  const password = liPassword.value
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return showError('login-error', error.message)
})

// Auth state change listener
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) loadMainInterface(session.user)
})

// Load Main Interfacesync function loadMainInterface(user) {
  authContainer.classList.add('hidden')
  mainInterface.classList.remove('hidden')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  if (error) return console.error('Profile fetch error', error)

  displayUsername.textContent = profile.username
  profileUsername.textContent = profile.username
  profileFullname.textContent = `${profile.first_name || ''} ${profile.last_name || ''}`
  profileCoins.textContent = profile.coins
  if (profile.avatar_url) avatar.src = profile.avatar_url
}

// Update Profile
updateForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  clearError('update-error')
  const { data: { user } } = await supabase.auth.getUser()
  const updates = {
    id: user.id,
    first_name: firstName.value,
    last_name: lastName.value,
    gender: document.querySelector('input[name="gender"]:checked')?.value
  }
  const { error } = await supabase.from('profiles').upsert(updates)
  if (error) return showError('update-error', error.message)
  loadMainInterface(user)
})

// Logout
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut()
  window.location.reload()
})

// Helpers
function showError(id, msg) { document.getElementById(id).textContent = msg }
function clearError(id) { document.getElementById(id).textContent = '' }
