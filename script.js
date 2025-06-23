// script.js (load as module)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ── Initialize Supabase ─────────────────────────────
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co'
const SUPABASE_KEY = 'YOUR_ANON_KEY'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── DOM References ───────────────────────────────────
const signupForm     = document.getElementById('signup-form')
const loginForm      = document.getElementById('login-form')
const suUsername     = document.getElementById('su-username')
const suPassword     = document.getElementById('su-password')
const liUsername     = document.getElementById('li-username')
const liPassword     = document.getElementById('li-password')
const signupError    = document.getElementById('signup-error')
const loginError     = document.getElementById('login-error')
const authContainer  = document.getElementById('auth-container')
const signupView     = document.getElementById('signup-view')
const loginView      = document.getElementById('login-view')
const mainInterface  = document.getElementById('main-interface')
const displayUsername= document.getElementById('display-username')
const profileUsername= document.getElementById('profile-username')
const profileFullname= document.getElementById('profile-fullname')
const profileCoins   = document.getElementById('profile-coins')
const avatar         = document.getElementById('avatar')
const updateForm     = document.getElementById('update-form')
const firstName      = document.getElementById('first-name')
const lastName       = document.getElementById('last-name')
const logoutBtn      = document.getElementById('logout-btn')

// ── Helpers ─────────────────────────────────────────
function showError(el, msg) { el.textContent = msg }
function clearError(el)    { el.textContent = '' }
function toggleView(from, to) {
  from.classList.add('hidden')
  to.classList.remove('hidden')
}

// ── INITIAL SESSION CHECK ───────────────────────────
window.addEventListener('load', async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    loadMainInterface(session.user)
  }
})

// ── AUTH STATE LISTENER ─────────────────────────────
supabase.auth.onAuthStateChange((_evt, session) => {
  if (session?.user) loadMainInterface(session.user)
})

// ── TOGGLE LINKS ────────────────────────────────────
document.getElementById('show-login').onclick = () => toggleView(signupView, loginView)
document.getElementById('show-signup').onclick = () => toggleView(loginView, signupView)

// ── SIGN UP ─────────────────────────────────────────
signupForm.addEventListener('submit', async e => {
  e.preventDefault()
  clearError(signupError)

  const email = suUsername.value.trim()
  const pw    = suPassword.value
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email, password: pw })

  if (signUpErr) return showError(signupError, signUpErr.message)

  // Immediately log in
  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password: pw })
  if (signInErr) return showError(signupError, signInErr.message)

  // Ensure profile row exists
  await supabase
    .from('profiles')
    .upsert({ id: signInData.user.id, username: email })
})

// ── LOGIN ────────────────────────────────────────────
loginForm.addEventListener('submit', async e => {
  e.preventDefault()
  clearError(loginError)

  const email = liUsername.value.trim()
  const pw    = liPassword.value
  const { error } = await supabase.auth.signInWithPassword({ email, password: pw })

  if (error) showError(loginError, error.message)
})

// ── LOAD DASHBOARD ──────────────────────────────────
async function loadMainInterface(user) {
  authContainer.classList.add('hidden')
  mainInterface.classList.remove('hidden')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return console.error('Profile fetch error:', error)

  displayUsername.textContent = profile.username
  profileUsername.textContent = profile.username
  profileFullname.textContent = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
  profileCoins.textContent    = profile.coins
  if (profile.avatar_url) {
    avatar.src = profile.avatar_url
    avatar.classList.remove('hidden')
  }
}

// ── UPDATE PROFILE ──────────────────────────────────
updateForm.addEventListener('submit', async e => {
  e.preventDefault()
  clearError(document.getElementById('update-error'))

  const { data: { user } } = await supabase.auth.getUser()
  const updates = {
    id: user.id,
    first_name: firstName.value.trim(),
    last_name: lastName.value.trim(),
    gender: document.querySelector('input[name="gender"]:checked')?.value
  }

  const { error } = await supabase.from('profiles').upsert(updates)
  if (error) return showError(document.getElementById('update-error'), error.message)

  loadMainInterface(user)
})

// ── LOG OUT ─────────────────────────────────────────
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut()
  window.location.reload()
})
