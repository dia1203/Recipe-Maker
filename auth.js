const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'recipes.db');

// Initialize users table
function initializeUsersTable() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);

    db.serialize(() => {
      // Create users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }

        // Users table created successfully
        db.close();
        resolve();
      });
    });
  });
}



// Authenticate user
function authenticateUser(username, password) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    
    db.get(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, username],
      async (err, user) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }
        
        if (!user) {
          db.close();
          resolve(null); // User not found
          return;
        }
        
        try {
          const isValid = await bcrypt.compare(password, user.password_hash);
          db.close();
          
          if (isValid) {
            // Return user without password hash
            const { password_hash, ...userWithoutPassword } = user;
            resolve(userWithoutPassword);
          } else {
            resolve(null); // Invalid password
          }
        } catch (error) {
          db.close();
          reject(error);
        }
      }
    );
  });
}

// Create new user
function createUser(username, email, password) {
  return new Promise(async (resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      db.run(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
        function(err) {
          db.close();
          
          if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
              reject(new Error('Username or email already exists'));
            } else {
              reject(err);
            }
          } else {
            resolve({ id: this.lastID, username, email });
          }
        }
      );
    } catch (error) {
      db.close();
      reject(error);
    }
  });
}

module.exports = {
  initializeUsersTable,
  authenticateUser,
  createUser
};
