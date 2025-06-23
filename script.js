// Replace with your Supabase project details
const supabaseUrl = 'https://vjgohvzjqylkhiiujmbu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZ29odnpqcXlsa2hpaXVqbWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTAwODQsImV4cCI6MjA2NjIyNjA4NH0.5cBO8eqTMlV1KA9fpzvFEFb0zWoFp6Q-zu6wIJ21dFQ';
const supabase = Supabase.createClient(supabaseUrl, supabaseKey);

// DOM elements
const sections = {
    signup: document.getElementById('signup'),
    login: document.getElementById('login'),
    mainInterface: document.getElementById('main-interface')
};

const contentSections = {
    home: document.getElementById('home-content'),
    account: document.getElementById('account-content')
};

const messages = {
    signup: document.getElementById('signup-message'),
    login: document.getElementById('login-message')
};

let currentUser = null;

// Utility functions
function showSection(section) {
    Object.values(sections).forEach(s => s.classList.remove('active'));
    sections[section].classList.add('active');
}

function showContentSection(section) {
    Object.values(contentSections).forEach(s => s.classList.remove('active'));
    contentSections[section].classList.addинг('active');
}

async function checkUsernameExists(username) {
    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username);
    if (error) throw error;
    return data.length > 0;
}

// Authentication functions
async function signUp(email, username, password) {
    try {
        const exists = await checkUsernameExists(username);
        if (exists) {
            messages.signup.textContent = 'Username already taken';
            return;
        }
        const { user, error } = await supabase.auth.signUp({
            email,
            password,
            data: { username }
        });
        if (error) throw error;
        currentUser = user;
        showSection('mainInterface');
        showContentSection('home');
        fetchProfile();
    } catch (error) {
        messages.signup.textContent = error.message;
    }
}

async function login(username, password) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();
        if (error || !data) {
            messages.login.textContent = 'Username not found';
            return;
        }
        // Note: This assumes email is retrievable; adjust if needed
        const { user, signInError } = await supabase.auth.signIn({
            email: `${username}@example.com`, // Placeholder; ideally email should be stored
            password
        });
        if (signInError) throw signInError;
        currentUser = user;
        showSection('mainInterface');
        showContentSection('home');
        fetchProfile();
    } catch (error) {
        messages.login.textContent = error.message || 'Invalid login credentials';
    }
}

// Profile management
async function fetchProfile() {
    if (!currentUser) return;
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
    if (error) {
        console.error('Error fetching profile:', error);
        return;
    }
    document.getElementById('display-username').textContent = data.username;
    document.getElementById('display-fullname').textContent = `${data.first_name || ''} ${data.last_name || ''}`.trim();
    document.getElementById('display-coins').textContent = data.coins;
    document.getElementById('first-name').value = data.first_name || '';
    document.getElementById('last-name').value = data.last_name || '';
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    genderRadios.forEach(radio => radio.checked = radio.value === data.gender);
}

async function updateProfile(firstName, lastName, gender) {
    if (!currentUser) return;
    const { error } = await supabase
        .from('profiles')
        .update({ first_name: firstName, last_name: lastName, gender })
        .eq('id', currentUser.id);
    if (error) console.error('Error updating profile:', error);
}

function setupRealTimeSubscription() {
    supabase
        .from('profiles')
        .on('UPDATE', payload => {
            if (payload.new.id === currentUser.id) fetchProfile();
        })
        .subscribe();
}

// Event listeners
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    await signUp(email, username, password);
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    await login(username, password);
});

document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    await updateProfile(firstName, lastName, gender);
});

document.getElementById('logout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    currentUser = null;
    showSection('login');
});

document.getElementById('nav-home').addEventListener('click', () => showContentSection('home'));
document.getElementById('nav-account').addEventListener('click', () => showContentSection('account'));

document.getElementById('show-login').addEventListener('click', () => showSection('login'));
document.getElementById('show-signup').addEventListener('click', () => showSection('signup'));

// Auth state management
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        currentUser = session.user;
        showSection('mainInterface');
        showContentSection('home');
        fetchProfile();
        setupRealTimeSubscription();
    } else {
        currentUser = null;
        showSection('login');
    }
});

// Initial check
const { data: authData } = supabase.auth.getSession();
if (authData?.session) {
    currentUser = authData.session.user;
    showSection('mainInterface');
    showContentSection('home');
    fetchProfile();
    setupRealTimeSubscription();
} else {
    showSection('login');
}
