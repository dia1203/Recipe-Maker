// Theme management (same as main app)
function initializeTheme() {
  const savedTheme = localStorage.getItem('recipe-hub-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButton(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('recipe-hub-theme', newTheme);
  updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
  const themeIcon = document.querySelector('.theme-icon');
  const themeText = document.querySelector('.theme-text');
  
  if (theme === 'dark') {
    themeIcon.textContent = '☀️';
    themeText.textContent = 'Light Mode';
  } else {
    themeIcon.textContent = '🌙';
    themeText.textContent = 'Dark Mode';
  }
}

// Form switching functionality
function showLogin() {
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('registerSection').style.display = 'none';
  hideError();
  hideSuccess();
}

function showRegister() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('registerSection').style.display = 'block';
  hideError();
  hideSuccess();
}

// Login functionality
async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const loginBtn = document.getElementById('loginBtn');
  const btnText = loginBtn.querySelector('.btn-text');
  const btnLoading = loginBtn.querySelector('.btn-loading');

  // Clear previous messages
  hideError();
  hideSuccess();

  // Validate inputs
  if (!username || !password) {
    showError('Please fill in all fields');
    return;
  }

  // Show loading state
  loginBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Login successful - server session is now active
      console.log('Login successful, redirecting to main app...');
      showSuccess('Login successful! Redirecting...');

      // Small delay to show success message
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1000);
    } else {
      // Login failed
      showError(data.error || 'Login failed. Please try again.');
    }
  } catch (error) {
    console.error('Login error:', error);
    showError('Network error. Please check your connection and try again.');
  } finally {
    // Reset button state
    loginBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

// Registration functionality
async function handleRegister(event) {
  event.preventDefault();

  const username = document.getElementById('registerUsername').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const registerBtn = document.getElementById('registerBtn');
  const btnText = registerBtn.querySelector('.btn-text');
  const btnLoading = registerBtn.querySelector('.btn-loading');

  // Clear previous messages
  hideError();
  hideSuccess();

  // Validate inputs
  if (!username || !email || !password || !confirmPassword) {
    showError('Please fill in all fields');
    return;
  }

  if (password !== confirmPassword) {
    showError('Passwords do not match');
    return;
  }

  if (password.length < 6) {
    showError('Password must be at least 6 characters long');
    return;
  }

  if (username.length < 3) {
    showError('Username must be at least 3 characters long');
    return;
  }

  // Show loading state
  registerBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline';

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password, confirmPassword })
    });

    const data = await response.json();

    if (response.ok) {
      // Registration successful
      console.log('Registration successful, redirecting to main app...');
      showSuccess('Account created successfully! Redirecting...');

      // Small delay to show success message
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1500);
    } else {
      // Registration failed
      showError(data.error || 'Registration failed. Please try again.');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showError('Network error. Please check your connection and try again.');
  } finally {
    // Reset button state
    registerBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

function showError(message) {
  const errorElement = document.getElementById('errorMessage');
  errorElement.textContent = message;
  errorElement.style.display = 'block';

  // Auto-hide after 5 seconds
  setTimeout(hideError, 5000);
}

function hideError() {
  const errorElement = document.getElementById('errorMessage');
  errorElement.style.display = 'none';
}

function showSuccess(message) {
  const successElement = document.getElementById('successMessage');
  successElement.textContent = message;
  successElement.style.display = 'block';

  // Auto-hide after 5 seconds
  setTimeout(hideSuccess, 5000);
}

function hideSuccess() {
  const successElement = document.getElementById('successMessage');
  successElement.style.display = 'none';
}

// Prevent multiple auth checks
let authCheckInProgress = false;

// Check if user is already logged in (check server session, not localStorage)
async function checkExistingAuth() {
  if (authCheckInProgress) {
    return; // Prevent multiple simultaneous checks
  }

  authCheckInProgress = true;

  try {
    const response = await fetch('/api/auth/status');
    const data = await response.json();

    if (data.authenticated) {
      // User is already logged in, redirect to main app
      console.log('User already authenticated, redirecting...');
      window.location.href = '/index.html';
      return;
    }

    // User is not authenticated, clear any old localStorage data
    localStorage.removeItem('recipe-hub-auth');
    console.log('User not authenticated, staying on login page');
  } catch (error) {
    // If auth check fails, just clear localStorage and stay on login page
    console.log('Auth check failed, staying on login page');
    localStorage.removeItem('recipe-hub-auth');
  } finally {
    authCheckInProgress = false;
  }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
  // Ctrl/Cmd + Enter to submit form
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');

    if (loginSection.style.display !== 'none') {
      document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    } else if (registerSection.style.display !== 'none') {
      document.getElementById('registerForm').dispatchEvent(new Event('submit'));
    }
  }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  initializeTheme();

  // Check auth status after a small delay to prevent reload loops
  setTimeout(() => {
    checkExistingAuth();
  }, 100);

  // Focus on username field in login form
  const loginUsernameField = document.getElementById('loginUsername');
  if (loginUsernameField) {
    loginUsernameField.focus();
  }
});
