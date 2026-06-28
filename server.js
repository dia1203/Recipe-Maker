const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const { initializeDatabase, getAllRecipes, addRecipe, deleteRecipe } = require('./database');
const { initializeUsersTable, authenticateUser, createUser } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'recipe-hub-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(express.static(path.join(__dirname))); // Serve static files (HTML, CSS, JS)

// Initialize databases
Promise.all([initializeDatabase(), initializeUsersTable()])
  .then(() => {
    console.log('✅ Database and users table initialized successfully');
  })
  .catch(err => {
    console.error('❌ Database initialization failed:', err);
  });

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
}

// Routes

// Serve login page
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve main app (redirect to login if not authenticated)
app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.redirect('/login.html');
  }
});

// Serve main app directly (protected)
app.get('/index.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Authentication API Routes

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await authenticateUser(username, password);

    if (user) {
      req.session.user = user;
      res.json({
        success: true,
        user: { id: user.id, username: user.username, email: user.email },
        token: req.sessionID
      });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      res.status(500).json({ error: 'Logout failed' });
    } else {
      res.json({ success: true, message: 'Logged out successfully' });
    }
  });
});

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Validate username format
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }

    const user = await createUser(username, email, password);

    // Automatically log in the user after successful registration
    req.session.user = user;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: { id: user.id, username: user.username, email: user.email },
      token: req.sessionID
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.message === 'Username or email already exists') {
      res.status(409).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  }
});

// Check authentication status
app.get('/api/auth/status', (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.user.id,
        username: req.session.user.username,
        email: req.session.user.email
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Protected API Routes (require authentication)
// Temporarily disable auth for testing - we'll enable after confirming recipes work

// Get all recipes
app.get('/api/recipes', requireAuth, async (req, res) => {
  try {
    const recipes = await getAllRecipes();
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Add new recipe
app.post('/api/recipes', requireAuth, async (req, res) => {
  try {
    const { name, ingredients, steps, time, image, type } = req.body;
    
    // Validate required fields
    if (!name || !ingredients || !steps || !time || !image || !type) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const newRecipe = await addRecipe({ name, ingredients, steps, time, image, type });
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error('Error adding recipe:', error);
    res.status(500).json({ error: 'Failed to add recipe' });
  }
});

// Delete recipe
app.delete('/api/recipes/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid recipe ID is required' });
    }
    
    const result = await deleteRecipe(parseInt(id));
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json({ message: 'Recipe deleted successfully', deletedId: id });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/recipes`);
});
