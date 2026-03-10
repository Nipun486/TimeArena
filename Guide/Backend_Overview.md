# Time Arena — Backend Overview
> Stack: Node.js · Express.js · MongoDB · Mongoose · JWT

---

## 📁 Project Structure

```
time-arena-api/
├── src/
│   ├── config/
│   │   └── db.js                    ← MongoDB connection
│   ├── models/
│   │   ├── User.js                  ← User schema
│   │   └── Task.js                  ← Task + subtask schema
│   ├── services/
│   │   └── scoringEngine.js         ← Core scoring formula
│   ├── middleware/
│   │   └── auth.js                  ← JWT protection
│   ├── controllers/
│   │   ├── authController.js        ← Register & Login
│   │   ├── taskController.js        ← Full task lifecycle
│   │   ├── userController.js        ← Profile & analytics
│   │   └── leaderboardController.js ← Top users by XP
│   ├── routes/
│   │   ├── auth.js                  ← Public auth routes
│   │   ├── tasks.js                 ← Protected task routes
│   │   ├── users.js                 ← Protected user routes
│   │   └── leaderboard.js           ← Leaderboard route
│   └── index.js                     ← Express entry point
├── .env
├── .gitignore
└── package.json
```

---

## ⚙️ Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/time-arena
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

---

## 📦 Data Models

### User
| Field | Type | Notes |
|-------|------|-------|
| `username` | String | Required, unique |
| `email` | String | Required, unique |
| `password` | String | Hashed, never returned |
| `totalXP` | Number | Default 0 |
| `currentStreak` | Number | Default 0 |
| `longestStreak` | Number | Default 0 |
| `lastActiveDate` | Date | UTC, used for streak logic |
| `badges` | Array | Earned badge names |
| `createdAt` | Date | Auto via timestamps |

### Task
| Field | Type | Notes |
|-------|------|-------|
| `title` | String | Required |
| `description` | String | Optional |
| `estimatedTime` | Number | Minutes, required |
| `actualTimeSpent` | Number | Calculated server-side |
| `difficulty` | Enum | easy · medium · hard |
| `basePoints` | Number | Auto-set from difficulty |
| `completionPercentage` | Number | Auto-calculated from subtasks |
| `status` | Enum | pending · in-progress · completed · failed |
| `userId` | ObjectId | Ref → User |
| `startedAt` | Date | Set server-side on start |
| `endedAt` | Date | Set server-side on complete |
| `finalScore` | Number | Set by scoring engine |
| `xpAwarded` | Number | Set by scoring engine |
| `subtasks` | Array | Embedded subtask objects |

### Subtask (Embedded in Task)
| Field | Type | Notes |
|-------|------|-------|
| `title` | String | Required |
| `isDone` | Boolean | Default false |
| `weight` | Number | Optional, for weighted % |

---

## 🧮 Scoring Engine

```
finalScore = basePoints × difficultyMultiplier × timeFactor × completionFactor
```

| Factor | Values |
|--------|--------|
| **difficultyMultiplier** | easy 1.0 · medium 1.5 · hard 2.0 |
| **timeFactor** | early 1.2 · on-time 1.0 · late 0.8 |
| **completionFactor** | 100% → 1.0 · 50–99% → 0.5 · 1–49% → 0.2 · 0% → −0.5 |

**basePoints auto-assigned from difficulty:**
| Difficulty | basePoints |
|------------|-----------|
| Easy | 50 |
| Medium | 100 |
| Hard | 200 |

**XP Rule:** `xpAwarded = finalScore` if positive, else `0`. Never negative.

---

## 🔀 API Endpoints

### Auth — Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account + return token |
| `POST` | `/api/auth/login` | Login + return token |

### Tasks — Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | Get all tasks for logged-in user |
| `POST` | `/api/tasks` | Create a new task |
| `GET` | `/api/tasks/:id` | Get single task |
| `PATCH` | `/api/tasks/:id/start` | Start task timer |
| `PATCH` | `/api/tasks/:id/subtask/:sid` | Toggle subtask done/undone |
| `POST` | `/api/tasks/:id/complete` | Complete task + trigger scoring |
| `DELETE` | `/api/tasks/:id` | Delete a task |

### Users — Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/me` | Get logged-in user profile |
| `GET` | `/api/users/me/analytics` | Get weekly analytics data |

### Leaderboard — Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/leaderboard` | Top users ranked by XP |
| `GET` | `/api/leaderboard?limit=10` | Limit results (default 50, max 100) |

### Health Check — Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Confirm server is running |

---

## 🔐 Authentication Flow

```
Register / Login
    → Server creates JWT token (payload: { id: userId })
    → Token expires in 7 days
    → Frontend stores token
    → Every protected request sends:
       Authorization: Bearer <token>
    → auth middleware verifies token
    → Attaches req.user.id
    → Controller runs
```

---

## 📊 Analytics Response Shape

```json
{
  "weeklyScores": [
    { "date": "2025-01-01", "score": 240 },
    { "date": "2025-01-02", "score": 0 },
    "...7 entries always"
  ],
  "completionRate": 75,
  "focusHours": 4.5,
  "consistencyScore": 85,
  "tasksByDifficulty": { "easy": 3, "medium": 5, "hard": 2 },
  "tasksByStatus": { "pending": 2, "inProgress": 1, "completed": 8, "failed": 1 },
  "totalTasksThisWeek": 12
}
```

---

## 🏗️ Dependency Map

```
index.js
├── config/db.js
├── routes/auth.js        → controllers/authController.js
│                              → models/User.js
├── routes/tasks.js       → middleware/auth.js
│                         → controllers/taskController.js
│                              → models/Task.js
│                              → models/User.js
│                              → services/scoringEngine.js
├── routes/users.js       → middleware/auth.js
│                         → controllers/userController.js
│                              → models/User.js
│                              → models/Task.js
└── routes/leaderboard.js → middleware/auth.js
                          → controllers/leaderboardController.js
                               → models/User.js
```

---

## 🚀 Running the Backend

```bash
# Install dependencies
npm install

# Development (with hot reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

---

## ✅ Build Order

```
1.  src/config/db.js
2.  src/models/User.js
3.  src/models/Task.js
4.  src/services/scoringEngine.js
5.  src/middleware/auth.js
6.  src/controllers/authController.js
7.  src/controllers/taskController.js
8.  src/controllers/userController.js
9.  src/controllers/leaderboardController.js
10. src/routes/auth.js
11. src/routes/tasks.js
12. src/routes/users.js
13. src/routes/leaderboard.js
14. src/index.js
```