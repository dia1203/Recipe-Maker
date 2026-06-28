# Recipe Hub - Full Stack Application

A full-stack recipe management application with persistent storage and CRUD operations.

## Features

- ✅ **User Authentication**: Secure login system with session management
- ✅ **Protected Access**: All recipe operations require authentication
- ✅ **View Recipes**: Browse all stored recipes with images and details
- ✅ **Add Recipes**: Add new recipes with name, ingredients, steps, time, image, and type
- ✅ **Delete Recipes**: Remove recipes with confirmation dialog
- ✅ **Search Recipes**: Search recipes by name
- ✅ **Filter Recipes**: Filter by Vegetarian, Non-Vegetarian, or All recipes
- ✅ **Recipe Counter**: Shows count of currently displayed recipes
- ✅ **Light/Dark Theme**: Toggle between light and dark modes for better user experience
- ✅ **Theme Persistence**: Remembers your theme preference across sessions
- ✅ **Logout Functionality**: Secure logout with session cleanup
- ✅ **Persistent Storage**: All recipes and users stored in SQLite database
- ✅ **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Database for persistent storage
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling
- **Vanilla JavaScript** - Functionality and API calls

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Access the Application**
   - Open your browser and go to: `http://localhost:3000`
   - **Important**: Always use the server URL, don't open HTML files directly!

4. **Login to the Application**
   - **Default Credentials**:
     - Username: `admin`
     - Password: `admin123`
   - After successful login, you'll be redirected to the recipe collection

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/status` - Check authentication status

### Protected Recipe Endpoints (Require Authentication)
- `GET /api/recipes` - Fetch all recipes
- `POST /api/recipes` - Add a new recipe
- `DELETE /api/recipes/:id` - Delete a recipe by ID

## Database

The application uses SQLite database (`recipes.db`) which is automatically created when you first run the server. Currently contains **8 Indian recipes**:

### 🥬 Vegetarian Recipes (4):
- Paneer Butter Masala
- Chole Bhature
- Masala Dosa
- Palak Paneer

### 🍖 Non-Vegetarian Recipes (4):
- Chicken Curry
- Butter Chicken
- Biryani
- Tandoori Chicken

## 🔐 Security Features

- **Password Hashing**: User passwords are securely hashed using bcrypt
- **Session Management**: Server-side sessions with secure cookies
- **Protected Routes**: All recipe operations require authentication
- **Session Timeout**: Sessions expire after 24 hours for security
- **Input Validation**: All user inputs are validated and sanitized

## Usage

1. **Login**: Use the default credentials (admin/admin123) to access the application
2. **View Recipes**: All recipes are displayed on the main page after login
3. **Search**: Use the search bar to find recipes by name
4. **Filter**: Use the filter buttons to show All, Vegetarian (🥬), or Non-Vegetarian (🍖) recipes
5. **Theme Toggle**: Click the theme button (🌙/☀️) in the top-right to switch between light and dark modes
6. **Add Recipe**: Fill out the form at the bottom and click "Add Recipe"
7. **Delete Recipe**: Click the red "🗑️ Delete" button on any recipe card
8. **Logout**: Click the "🚪 Logout" button in the top-right to end your session

## Development

For development with auto-restart:
```bash
npm run dev
```

## File Structure

```
├── server.js          # Express server and API routes
├── database.js        # SQLite database operations
├── index.html         # Frontend HTML
├── script.js          # Frontend JavaScript
├── style.css          # Frontend styling
├── package.json       # Dependencies and scripts
├── recipes.db         # SQLite database (auto-generated)
└── README.md          # This file
```

## 🔧 Troubleshooting

### If you see "404 Not Found" or "Failed to load recipes":
- ❌ **Don't**: Open `index.html` file directly
- ✅ **Do**: Use `http://localhost:3000/` in browser
- ✅ **Check**: Server is running with `npm start`

### If recipes don't display:
- Refresh page with `Ctrl+F5` (hard refresh)
- Check browser console for errors (press F12)
- Click the 🔄 Refresh button in the app

### Server Status Check:
When running correctly, you should see:
```
Server is running on http://localhost:3000
API endpoints available at http://localhost:3000/api/recipes
Database initialized successfully
```

## Contributing

Feel free to fork this project and submit pull requests for any improvements!
