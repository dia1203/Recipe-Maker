let recipes = [];
let currentFilter = 'all';

// API base URL
const API_BASE_URL = '/api';

// Authentication check
function checkAuthentication() {
  return fetch('/api/auth/status')
    .then(response => response.json())
    .then(data => {
      if (!data.authenticated) {
        window.location.href = '/login.html';
        return false;
      }
      return true;
    })
    .catch(error => {
      console.error('Auth check failed:', error);
      window.location.href = '/login.html';
      return false;
    });
}

// Theme management
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

// Logout functionality
async function handleLogout() {
  if (!confirm('Are you sure you want to logout?')) {
    return;
  }

  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST'
    });

    if (response.ok) {
      // Clear local storage
      localStorage.removeItem('recipe-hub-auth');

      // Redirect to login page
      window.location.href = '/login.html';
    } else {
      alert('Logout failed. Please try again.');
    }
  } catch (error) {
    console.error('Logout error:', error);
    alert('Logout failed. Please try again.');
  }
}

// Fetch all recipes from backend
async function fetchRecipes() {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes`);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    recipes = await response.json();
    showRecipes();
  } catch (error) {
    console.error('Error fetching recipes:', error);

    // Show error in the UI
    const countElement = document.getElementById("recipeCount");
    if (countElement) {
      countElement.textContent = `❌ Failed to load recipes: ${error.message}`;
      countElement.style.color = 'red';
    }

    // Show helpful error message
    if (error.message.includes('404')) {
      alert('Error: Cannot find API endpoint.\n\nMake sure you access the page via:\nhttp://localhost:3000/\n\nNot by opening the HTML file directly!');
    } else {
      alert(`Failed to load recipes: ${error.message}\n\nMake sure the server is running on http://localhost:3000`);
    }
  }
}

// Delete recipe from backend
async function deleteRecipe(id) {
  if (!confirm('Are you sure you want to delete this recipe?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete recipe');
    }

    // Remove from local array and refresh display with current filter
    recipes = recipes.filter(recipe => recipe.id !== id);
    filterRecipes(currentFilter);
    alert('Recipe deleted successfully!');
  } catch (error) {
    console.error('Error deleting recipe:', error);
    alert('Failed to delete recipe. Please try again.');
  }
}

function showRecipes(filteredRecipes = recipes) {
  const list = document.getElementById("recipeList");
  const countElement = document.getElementById("recipeCount");

  list.innerHTML = "";

  // Update recipe count
  const count = filteredRecipes.length;
  const filterText = currentFilter === 'all' ? 'recipes' :
                    currentFilter === 'Veg' ? 'vegetarian recipes' : 'non-vegetarian recipes';
  countElement.textContent = `Showing ${count} ${filterText}`;
  countElement.style.color = '#666';

  filteredRecipes.forEach(recipe => {
    const div = document.createElement("div");
    div.className = `recipe-card ${recipe.type === 'Non-Veg' ? 'non-veg' : ''}`;

    div.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.name}"
           onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIiBzdHJva2U9IiNkZGQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+🍽️ ${recipe.name}</dGV4dD48L3N2Zz4='; this.onerror=null;">
      <div class="recipe-info">
        <h3>${recipe.name}</h3>
        <p><strong>Type:</strong> ${recipe.type}</p>
        <p><strong>Time:</strong> ${recipe.time}</p>
        <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
        <p><strong>Steps:</strong><br>${recipe.steps.replace(/\n/g, "<br>")}</p>
        <button class="delete-btn" onclick="deleteRecipe(${recipe.id})">🗑️ Delete</button>
      </div>
    `;

    list.appendChild(div);
  });
}

function searchRecipe() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  let filtered = recipes.filter(recipe => recipe.name.toLowerCase().includes(input));

  // Apply current filter as well
  if (currentFilter !== 'all') {
    filtered = filtered.filter(recipe => recipe.type === currentFilter);
  }

  showRecipes(filtered);
}

// Filter recipes by type
function filterRecipes(type, clickedButton) {
  currentFilter = type;

  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // If clickedButton is provided, use it; otherwise find the button by type
  if (clickedButton) {
    clickedButton.classList.add('active');
  } else {
    // Find button by onclick attribute content
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
      if (btn.onclick && btn.onclick.toString().includes(`'${type}'`)) {
        btn.classList.add('active');
      }
    });
  }

  // Apply filter
  let filtered = recipes;
  if (type !== 'all') {
    filtered = recipes.filter(recipe => recipe.type === type);
  }

  // Also apply search if there's text in search box
  const searchInput = document.getElementById("searchInput").value.toLowerCase();
  if (searchInput) {
    filtered = filtered.filter(recipe => recipe.name.toLowerCase().includes(searchInput));
  }

  showRecipes(filtered);
}

async function addRecipe(e) {
  e.preventDefault();

  const name = document.getElementById("recipeName").value;
  const ingredients = document.getElementById("ingredients").value;
  const steps = document.getElementById("steps").value;
  const time = document.getElementById("time").value;
  const image = document.getElementById("imageUrl").value;
  const type = document.querySelector('input[name="type"]:checked').value;

  const newRecipe = { name, ingredients, steps, time, image, type };

  try {
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newRecipe)
    });

    if (!response.ok) {
      throw new Error('Failed to add recipe');
    }

    const savedRecipe = await response.json();
    recipes.push(savedRecipe);

    document.getElementById("recipeForm").reset();

    // Apply current filter when showing recipes
    filterRecipes(currentFilter);
    alert('Recipe added successfully!');
  } catch (error) {
    console.error('Error adding recipe:', error);
    alert('Failed to add recipe. Please try again.');
  }
}

// Initialize app by fetching recipes
document.addEventListener('DOMContentLoaded', async function() {
  // Initialize theme first
  initializeTheme();

  // Check authentication before proceeding
  const isAuthenticated = await checkAuthentication();
  if (!isAuthenticated) {
    return; // Will redirect to login
  }

  const countElement = document.getElementById("recipeCount");
  if (countElement) {
    countElement.textContent = '⏳ Loading recipes...';
  }

  fetchRecipes();
});
