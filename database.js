const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'recipes.db');
const db = new sqlite3.Database(dbPath);

// Initialize database with recipes table
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create recipes table
      db.run(`CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        ingredients TEXT NOT NULL,
        steps TEXT NOT NULL,
        time TEXT NOT NULL,
        image TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Check if table is empty and insert sample data
        db.get("SELECT COUNT(*) as count FROM recipes", (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (row.count === 0) {
            insertSampleData().then(resolve).catch(reject);
          } else {
            resolve();
          }
        });
      });
    });
  });
}

// Insert sample recipes data
function insertSampleData() {
  return new Promise((resolve, reject) => {
    const sampleRecipes = [
      {
        name: "Paneer Butter Masala",
        ingredients: "Paneer, Tomato, Butter, Spices",
        steps: "1. Fry onions\n2. Add tomato puree\n3. Add paneer\n4. Cook for 10 mins",
        time: "30 mins",
        image: "https://myfoodstory.com/wp-content/uploads/2021/10/Paneer-Butter-Masala-1-2.jpg",
        type: "Veg"
      },
      {
        name: "Chicken Curry",
        ingredients: "Chicken, Onion, Spices",
        steps: "1. Marinate chicken\n2. Fry onions\n3. Add spices\n4. Cook chicken",
        time: "45 mins",
        image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2021/07/chicken-curry-recipe.jpg",
        type: "Non-Veg"
      },
      {
        name: "Chole Bhature",
        ingredients: "Chickpeas, Onion, Tomato, Spices, Flour, Yogurt",
        steps: "1. Soak and boil chickpeas\n2. Make chole curry\n3. Prepare bhature dough\n4. Deep fry bhature",
        time: "60 mins",
        image: "https://media.vogue.in/wp-content/uploads/2020/08/chole-bhature-recipe.jpg",
        type: "Veg"
      }
    ];

    const stmt = db.prepare("INSERT INTO recipes (name, ingredients, steps, time, image, type) VALUES (?, ?, ?, ?, ?, ?)");
    
    let completed = 0;
    sampleRecipes.forEach(recipe => {
      stmt.run([recipe.name, recipe.ingredients, recipe.steps, recipe.time, recipe.image, recipe.type], (err) => {
        if (err) {
          reject(err);
          return;
        }
        completed++;
        if (completed === sampleRecipes.length) {
          stmt.finalize();
          resolve();
        }
      });
    });
  });
}

// Get all recipes
function getAllRecipes() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM recipes ORDER BY created_at DESC", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Add new recipe
function addRecipe(recipe) {
  return new Promise((resolve, reject) => {
    const { name, ingredients, steps, time, image, type } = recipe;
    db.run(
      "INSERT INTO recipes (name, ingredients, steps, time, image, type) VALUES (?, ?, ?, ?, ?, ?)",
      [name, ingredients, steps, time, image, type],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...recipe });
        }
      }
    );
  });
}

// Delete recipe
function deleteRecipe(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM recipes WHERE id = ?", [id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ deletedId: id, changes: this.changes });
      }
    });
  });
}

module.exports = {
  initializeDatabase,
  getAllRecipes,
  addRecipe,
  deleteRecipe
};
