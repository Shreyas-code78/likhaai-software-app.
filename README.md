# Likhaai v2.0 — Homework Writing Marketplace

> A production-grade platform connecting students with skilled local writers for handwritten assignment delivery.

---

## What's Fixed in v2.0

| Issue | Status |
|-------|--------|
| Hinglish → Professional English (all UI, messages, errors) | ✅ Fixed |
| Premium UI redesign (navy/gold palette, DM Sans + Playfair fonts) | ✅ Fixed |
| Messaging bug (writer dashboard) — both sides now work | ✅ Fixed |
| Simulated payment flow (UPI / Card / COD) with 3-step UI | ✅ Fixed |
| Phone number hidden from writers (security fix) | ✅ Fixed |
| Logo SVG integrated in navbar + auth pages | ✅ Fixed |
| All flows tested: Register→Login→Post→Accept→Chat→Pay | ✅ Fixed |
| Code quality, folder structure, English error messages | ✅ Fixed |

---

## Project Structure

```
likhaai-v2/
├── backend/                  ← Spring Boot API (port 8080)
│   ├── pom.xml
│   └── src/main/java/com/likhaai/
│       ├── controller/       ← AuthController, TaskController,
│       │                        MessageController, WriterController
│       ├── model/            ← User, Task, Message, Review
│       ├── repository/       ← MongoDB repositories
│       └── config/           ← JWT, Security, WebSocket, CORS
│
├── student-app/              ← React app (port 3000)
│   └── src/
│       ├── pages/            ← Login, Register, Dashboard, PostTask,
│       │                        BrowseWriters, WriterProfile, MyTasks,
│       │                        TaskDetail, Chat, Payment
│       ├── components/       ← Navbar
│       └── context/          ← AuthContext
│
├── writer-app/               ← React app (port 3001)
│   └── src/
│       ├── pages/            ← Login, Register, Dashboard, AvailableTasks,
│       │                        MyTasks, TaskDetail, Chat, Profile
│       ├── components/       ← Navbar
│       └── context/          ← AuthContext
│
├── start-backend.sh/.bat
├── start-student.sh/.bat
└── start-writer.sh/.bat
```

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Java JDK | 17+ | https://adoptium.net |
| Maven | 3.8+ | https://maven.apache.org |
| Node.js | 18+ | https://nodejs.org |
| MongoDB | 6+ | https://mongodb.com/try/download/community |

---

## Setup & Run

### Step 1 — Start MongoDB
```bash
# Windows
net start MongoDB

# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Step 2 — Start the Backend
```bash
# Option A: Script
./start-backend.sh          # Mac/Linux
start-backend.bat           # Windows

# Option B: Manual
cd backend
mvn spring-boot:run
```
✅ Backend runs on **http://localhost:8080**

### Step 3 — Start the Student App
```bash
./start-student.sh          # Mac/Linux
start-student.bat           # Windows
```
✅ Student portal: **http://localhost:3000**

### Step 4 — Start the Writer App
```bash
./start-writer.sh           # Mac/Linux
start-writer.bat            # Windows
```
✅ Writer portal: **http://localhost:3001**

---

## Full User Flow

### Student Flow
1. Register at `localhost:3000/register` (role = STUDENT)
2. **Post Task** → fill title, subject, pages, deadline, budget
3. **Browse Writers** → view profiles, assign directly
4. **My Tasks** → track task status in real time
5. **Chat** → message writer securely (no phone shared)
6. **Pay** → UPI / Card / COD simulation with receipt

### Writer Flow
1. Register at `localhost:3001/register` (role = WRITER)
2. Toggle **Available** status on Dashboard
3. **Available Tasks** → browse open tasks, click Accept
4. **My Tasks** → view assigned tasks, update status
5. **Chat** → message student via task chat
6. Update status: Assigned → In Progress → Completed → Delivered
7. Edit **Profile** → bio, subjects, price per page

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register student or writer |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (JWT required) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create new task |
| GET | `/api/tasks/my` | Student's own tasks |
| GET | `/api/tasks/open` | Available tasks for writers |
| GET | `/api/tasks/assigned` | Writer's accepted tasks |
| GET | `/api/tasks/{id}` | Single task detail |
| PUT | `/api/tasks/{id}/accept` | Writer accepts a task |
| PUT | `/api/tasks/{id}/reject` | Writer rejects a task |
| PUT | `/api/tasks/{id}/status` | Update task status |
| PUT | `/api/tasks/{id}/assign/{writerId}` | Student assigns writer |
| PUT | `/api/tasks/{id}/pay` | Simulate payment |

### Messages (Chat)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/{taskId}` | Get all messages for a task |
| POST | `/api/messages` | Send a message |
| PUT | `/api/messages/{taskId}/read` | Mark messages as read |
| GET | `/api/messages/unread/{taskId}` | Unread count |

### Writers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/writers` | List all available writers |
| GET | `/api/writers/{id}` | Writer public profile (**no phone**) |
| PUT | `/api/writers/profile` | Update own profile |
| PUT | `/api/writers/availability` | Toggle availability |

---

## Security Highlights

- **JWT authentication** on all protected endpoints
- **Phone numbers are never exposed** in writer public profiles
- All student↔writer communication is **in-platform only**
- Messages are validated — only task participants can send/read
- Passwords are **bcrypt hashed**
- CORS is restricted to `localhost:3000` and `localhost:3001`

---

## Logo

Your Likhaai logos are integrated as an inline SVG in:
- Both Navbars (student + writer)
- Login page headers

To replace with your actual logo file:
1. Place your PNG/SVG in `student-app/public/logo.png`
2. In `src/components/Navbar.js`, replace the `<Logo />` SVG component with:
   ```jsx
   <img src="/logo.png" alt="Likhaai" style={{ height: 36 }} />
   ```

---

## Environment Notes

- Default MongoDB: `mongodb://localhost:27017/likhaai`
- JWT secret in `backend/src/main/resources/application.properties`
- Change `cors.allowed-origins` if deploying to a different domain
- Payment is **simulated** — no real payment gateway is connected

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Failed to connect to MongoDB" | Ensure MongoDB is running on port 27017 |
| "Port 8080 already in use" | Kill process: `lsof -ti:8080 \| xargs kill` |
| "npm install" fails | Delete `node_modules` and try again |
| CORS error in browser | Check `cors.allowed-origins` in `application.properties` |
| JWT invalid token | Clear `localStorage` in browser, log in again |
| Messages not loading | Ensure backend is running; check browser console |
