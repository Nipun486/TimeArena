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


📁 Repo 2 — Frontend (time-arena-web)

Step 1: Create Next.js App
```
npx create-next-app@latest time-arena-web

When prompted, answer:

✔ TypeScript?          → Yes  
✔ ESLint?              → Yes
✔ Tailwind CSS?        → Yes
✔ src/ directory?      → Yes
✔ App Router?          → Yes
✔ Customize aliases?   → No
```


Step 2: Install Dependencies
```
cd time-arena-web
npm install axios zustand recharts react-hook-form
npm install lucide-react
```


Step 3: Create Folder Structure
```
# Pages (App Router)
mkdir -p src/app/{dashboard,tasks,leaderboard,auth}
touch src/app/dashboard/page.jsx
touch src/app/tasks/page.jsx
touch src/app/tasks/\[id\]/page.jsx
touch src/app/leaderboard/page.jsx
touch src/app/auth/login/page.jsx
touch src/app/auth/register/page.jsx

# Components
mkdir -p src/components/{ui,tasks,timer,dashboard,layout}
touch src/components/tasks/{TaskCard.jsx,TaskForm.jsx,SubtaskList.jsx,ScoreDisplay.jsx}
touch src/components/timer/Timer.jsx
touch src/components/dashboard/{WeeklyChart.jsx,StatsGrid.jsx,StreakBadge.jsx,XPBar.jsx}
touch src/components/layout/{Navbar.jsx,Sidebar.jsx}

# Lib & Store
mkdir -p src/{lib,store,hooks}
touch src/lib/api.js           
touch src/store/authStore.js   
touch src/store/taskStore.js   
touch src/hooks/{useTimer.js,useTask.js}

# Config
touch .env.local

### Final Frontend Structure

time-arena-web/
├── src/
│   ├── app/                        ← Next.js App Router pages
│   │   ├── layout.jsx              ← Root layout + providers
│   │   ├── page.jsx                ← Landing/home
│   │   ├── dashboard/
│   │   │   └── page.jsx            ← Main dashboard
│   │   ├── tasks/
│   │   │   ├── page.jsx            ← Task list
│   │   │   └── [id]/page.jsx       ← Task detail + timer
│   │   ├── leaderboard/
│   │   │   └── page.jsx
│   │   └── auth/
│   │       ├── login/page.jsx
│   │       └── register/page.jsx
│   ├── components/
│   │   ├── tasks/
│   │   │   ├── TaskCard.jsx        ← Score + status display
│   │   │   ├── TaskForm.jsx        ← Create/edit with subtasks
│   │   │   ├── SubtaskList.jsx     ← Checkbox list → auto % calc
│   │   │   └── ScoreDisplay.jsx    ← Animated score reveal
│   │   ├── timer/
│   │   │   └── Timer.jsx           ← Countdown + elapsed dual display
│   │   ├── dashboard/
│   │   │   ├── WeeklyChart.jsx     ← Recharts bar chart
│   │   │   ├── StatsGrid.jsx       ← 4 stat cards
│   │   │   ├── StreakBadge.jsx     ← 🔥 streak + freeze
│   │   │   └── XPBar.jsx           ← Level progress bar
│   │   └── layout/
│   │       ├── Navbar.jsx
│   │       └── Sidebar.jsx
│   ├── lib/
│   │   └── api.js                  ← Axios instance + all API calls
│   ├── store/
│   │   ├── authStore.js            ← Zustand: user + JWT token
│   │   └── taskStore.js            ← Zustand: tasks + filters
│   └── hooks/
│       ├── useTimer.js             ← Timer logic (start/pause/stop)
│       └── useTask.js              ← Task actions (complete, subtask toggle)
├── .env.local
└── package.json
```


Step 4: .env.local
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```


🚀 Running Both Together
Open two terminals in Cursor:
```
# Terminal 1 – Backend (port 5000)
cd time-arena-api
npm run dev

# Terminal 2 – Frontend (port 3000)
cd time-arena-web
npm run dev
```

Then open `http://localhost:3000` in your browser.



## ✅ What to Build First (Recommended Order)
```
1. time-arena-api  →  src/config/db.js          (MongoDB connect)
2. time-arena-api  →  src/models/User.js         (User schema)
3. time-arena-api  →  src/models/Task.js         (Task + subtask schema)
4. time-arena-api  →  src/services/scoringEngine.js  ← most critical
5. time-arena-api  →  src/controllers/authController.js
6. time-arena-api  →  src/index.js               (Express app)
7. time-arena-web  →  src/lib/api.js             (Axios setup)
8. time-arena-web  →  src/store/authStore.js     (Zustand auth)
9. time-arena-web  →  src/app/auth/             (Login + Register pages)
10. time-arena-web →  src/components/timer/Timer.jsx
11. time-arena-web →  src/app/tasks/[id]/page.jsx
12. time-arena-web →  src/app/dashboard/page.jsx
```