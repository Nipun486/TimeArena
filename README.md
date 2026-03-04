# TimeArena
This is my personal use case project.

📁 Repo 1 — Backend (time-arena-api)

Step 1: Create & Initialize
```
mkdir time-arena-api && cd time-arena-api
npm init -y
```


Step 2: Install Dependencies
```
# Core
npm install express mongoose dotenv cors bcryptjs jsonwebtoken

# Dev
npm install -D nodemon
```


Step 3: Folder Structure
Run these commands to create every folder and file:
```
mkdir -p src/{models,routes,controllers,services,middleware,config}

# Create all files
touch src/config/db.js
touch src/models/User.js
touch src/models/Task.js
touch src/services/scoringEngine.js
touch src/middleware/auth.js
touch src/controllers/{taskController.js,userController.js,authController.js,leaderboardController.js}
touch src/routes/{tasks.js,users.js,auth.js,leaderboard.js}
touch src/index.js
touch .env
touch .gitignore

### Final Backend Structure
time-arena-api/
├── src/
│   ├── config/
│   │   └── db.js                  ← MongoDB connection
│   ├── models/
│   │   ├── User.js                ← User schema + XP/streak logic
│   │   └── Task.js                ← Task + embedded subtasks schema
│   ├── services/
│   │   └── scoringEngine.js       ← 🧠 Core scoring formula
│   ├── middleware/
│   │   └── auth.js                ← JWT verification
│   ├── controllers/
│   │   ├── authController.js      ← register, login
│   │   ├── taskController.js      ← CRUD + start + complete
│   │   ├── userController.js      ← profile, analytics
│   │   └── leaderboardController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── users.js
│   │   └── leaderboard.js
│   └── index.js                   ← Express app entry point
├── .env
├── .gitignore
└── package.json
```


Step 4: package.json scripts
Add this to your package.json:
```
"scripts": {
  "dev": "nodemon src/index.js",
  "start": "node src/index.js"
}
```


Step 5: .env file
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/time-arena
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```


Step 6: .gitignore
```
node_modules/
.env
```


