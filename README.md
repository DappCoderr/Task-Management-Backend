# Task Management — Backend

REST API for a task management application. Handles user authentication, personal task CRUD, and admin user/task management. Authentication uses HTTP-only cookies with JWT access and refresh tokens. The first registered user is assigned the **ADMIN** role; all subsequent registrations receive **USER**. Users can only access their own tasks; admins can view platform-wide statistics, search and paginate users, inspect user profiles and tasks, and delete non-admin users (with cascade task cleanup).

**Key capabilities**

- Cookie-based JWT auth (access token: 15 minutes, refresh token: 7 days)
- Role-based access control (`USER` / `ADMIN`)
- Task ownership enforcement on all user task endpoints
- Admin dashboard, user search/sort/pagination, and user deletion with cascade task cleanup

---

## Tech Stack

| Layer       | Technology                          |
| ----------- | ----------------------------------- |
| Runtime     | Node.js (ES modules)                |
| Framework   | Express 5                           |
| ORM         | Sequelize 6 + PostgreSQL            |
| Auth        | jsonwebtoken, bcrypt, cookie-parser |
| Validation  | Zod (auth routes only)              |
| Dev tooling | nodemon, ESLint, Prettier           |

---

## Architecture

The API follows a layered **Controller → Service → Repository** pattern. HTTP handlers live in controllers, business logic in services, and database access in repositories.

```mermaid
flowchart TB
  Client[Client_Frontend]
  Server[Express_server.js]
  Routes[routes/v1]
  Controllers[controllers]
  Services[services]
  Repos[repositories]
  DB[(PostgreSQL)]

  Client -->|cookies_credentials| Server
  Server --> Routes
  Routes --> Controllers
  Controllers --> Services
  Services --> Repos
  Repos --> DB
```

### Folder Structure

```
src/
├── config/          # env + DB connection
├── controller/      # HTTP handlers
├── middlewares/     # auth
├── models/          # Sequelize User & Task
├── repositories/    # DB access layer
├── routes/v1/       # versioned API routes
├── service/         # business logic
├── utils/           # JWT, cookies, errors, response helpers
├── validation/      # Zod schemas + middleware
└── server.js        # app entry point
```

### Response Format

All controller responses use helpers from `src/utils/common/responseObject.js`:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {},
  "err": {}
}
```

On error, `success` is `false` and `err` contains error details. The `authenticate` middleware returns a simpler shape (`{ "message": "..." }`).

---

## Getting Started

### Prerequisites

- **Node.js 18+**
- **PostgreSQL** database (SSL is required — see `src/config/database.js`)

### Installation

1. Install dependencies:

```bash
 cd backend && npm install
```

2. Create a `.env` file from the template:

```bash
 cp .env.settings .env
```

3. Fill in the required environment variables (see below).
4. Start the development server:

```bash
 npm start
```

This runs `nodemon` on `src/server.js`. 5. Verify the server is running:

```bash
 curl http://localhost:8000/health
```

Expected response:

> **Note:** On startup the server runs `sequelize.sync({ alter: true })`, which auto-alters tables to match models. This is convenient for development but is **not** a production migration strategy.

### Environment Variables

| Variable               | Required | Default       | Description                                      |
| ---------------------- | -------- | ------------- | ------------------------------------------------ |
| `PORT`                 | No       | `8000`        | Server port                                      |
| `DATABASE_URL`         | Yes      | —             | PostgreSQL connection string                     |
| `NODE_ENV`             | No       | `development` | Affects cookie `secure` flag (`production` only) |
| `ACCESS_TOKEN_SECRET`  | Yes      | —             | JWT access token signing secret                  |
| `REFRESH_TOKEN_SECRET` | Yes      | —             | JWT refresh token signing secret                 |
| `CORS_ORIGIN`          | Yes      | —             | Allowed CORS origin (frontend URL)               |

With cros clients must send requests with `**credentials: true`\*\* so HTTP-only auth cookies are included.

Example `.env`:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/dbname
NODE_ENV=development
ACCESS_TOKEN_SECRET=your-access-secret
REFRESH_TOKEN_SECRET=your-refresh-secret
CROS_PATH=http://localhost:5173
```

### npm Scripts

| Script                 | Description                    |
| ---------------------- | ------------------------------ |
| `npm start`            | Dev server via nodemon         |
| `npm run lint`         | Run ESLint                     |
| `npm run lint:fix`     | Run ESLint with auto-fix       |
| `npm run format`       | Format code with Prettier      |
| `npm run format:check` | Check formatting with Prettier |

---

## Authentication and Authorization

```mermaid
sequenceDiagram
  participant C as Client
  participant A as API
  participant DB as Database

  C->>A: POST /auth/login
  A->>DB: verify user, store hashed refresh token
  A-->>C: Set accessToken + refreshToken cookies

  C->>A: Protected route (cookie accessToken)
  A->>A: authenticate middleware

  C->>A: POST /auth/refresh
  A->>DB: validate refresh token hash
  A-->>C: Rotate cookies

  C->>A: POST /auth/logout
  A->>DB: clear refreshToken
  A-->>C: Clear cookies
```

### Roles

| Role    | Description                                 |
| ------- | ------------------------------------------- |
| `USER`  | Default role; manage own profile and tasks  |
| `ADMIN` | Platform admin; access `/admin/*` endpoints |

The first user to register becomes `ADMIN`. All later registrations are `USER`.

### Middleware

- `**authenticate**` — reads `accessToken` from cookies, verifies JWT, attaches `req.user = { id, role }`
- `**authorize("ADMIN")**` — used on admin routes; returns 403 if role does not match

### Token Lifetimes

| Token   | Expiry | Storage                                         |
| ------- | ------ | ----------------------------------------------- |
| Access  | 15 min | HTTP-only cookie (`accessToken`)                |
| Refresh | 7 days | HTTP-only cookie (`refreshToken`); hashed in DB |

---

## Data Models

### User

| Field          | Type   | Notes                                          |
| -------------- | ------ | ---------------------------------------------- | ------- |
| `id`           | UUID   | Primary key                                    |
| `username`     | STRING | 3–30 chars, alphanumeric + underscore          |
| `email`        | STRING | Unique, validated as email                     |
| `password`     | STRING | Hashed via bcrypt (excluded from responses)    |
| `role`         | ENUM   | `USER`                                         | `ADMIN` |
| `refreshToken` | TEXT   | Hashed refresh token (excluded from responses) |
| `createdAt`    | DATE   | Auto-managed                                   |
| `updatedAt`    | DATE   | Auto-managed                                   |

### Task

| Field           | Type   | Notes                                     |
| --------------- | ------ | ----------------------------------------- | ------------- | ----------------------------- |
| `id`            | UUID   | Primary key                               |
| `title`         | STRING | 3–255 characters                          |
| `description`   | TEXT   | Required                                  |
| `status`        | ENUM   | `TODO`                                    | `IN PROGRESS` | `COMPLETED` (default: `TODO`) |
| `priority`      | ENUM   | `LOW`                                     | `MEDIUM`      | `HIGH` (default: `LOW`)       |
| `dueDate`       | DATE   | Optional                                  |
| `attachmentUrl` | TEXT   | Optional URL (no upload flow implemented) |
| `userId`        | UUID   | Foreign key → `users.id`                  |
| `createdAt`     | DATE   | Auto-managed                              |
| `updatedAt`     | DATE   | Auto-managed                              |

**Relationship:** `User.hasMany(Task)` / `Task.belongsTo(User)`

---

## API Reference

**Base path:** `/api/v1`

All authenticated endpoints require cookies set by login. Use `credentials: "include"` (fetch) or `withCredentials: true` (axios).

### Auth — `/auth`

| Method | Path        | Auth | Description                    |
| ------ | ----------- | ---- | ------------------------------ |
| POST   | `/register` | No   | Register a new user            |
| POST   | `/login`    | No   | Log in; sets auth cookies      |
| POST   | `/refresh`  | No\* | Rotate access + refresh tokens |
| POST   | `/logout`   | No\* | Clear session and cookies      |

Uses `refreshToken` cookie; no access token required.

#### POST `/auth/register`

**Body:**

```json
{
  "email": "alice@example.com",
  "username": "alice",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "username": "alice",
    "email": "alice@example.com",
    "role": "ADMIN",
    "updatedAt": "...",
    "createdAt": "..."
  },
  "err": {}
}
```

#### POST `/auth/login`

**Body:**

```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Response (200):** Sets `accessToken` and `refreshToken` cookies.

```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "id": "uuid",
    "username": "alice",
    "email": "alice@example.com",
    "role": "ADMIN"
  },
  "err": {}
}
```

#### POST `/auth/refresh`

No body. Reads `refreshToken` cookie.

**Response (200):** Rotates both cookies.

```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {},
  "err": {}
}
```

#### POST `/auth/logout`

Clears cookies and nullifies stored refresh token.

---

### Users — `/users`

All routes require `authenticate`.

| Method | Path       | Description              |
| ------ | ---------- | ------------------------ |
| GET    | `/profile` | Get current user profile |
| PUT    | `/profile` | Update profile fields    |
| DELETE | `/profile` | Delete own account       |

#### GET `/users/profile`

**Response (200):**

```json
{
  "success": true,
  "message": "User Profile",
  "data": {
    "id": "uuid",
    "username": "alice",
    "email": "alice@example.com",
    "role": "ADMIN",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "err": {}
}
```

---

### Tasks — `/tasks`

All routes require `authenticate`. Users can only access their own tasks.

| Method | Path   | Description       |
| ------ | ------ | ----------------- |
| POST   | `/`    | Create a task     |
| GET    | `/`    | List own tasks    |
| GET    | `/:id` | Get a single task |
| PATCH  | `/:id` | Partial update    |
| DELETE | `/:id` | Delete a task     |

**Query params for `GET /`:**

| Param    | Values                             |
| -------- | ---------------------------------- |
| `status` | `TODO`, `IN PROGRESS`, `COMPLETED` |

#### POST `/tasks`

**Body:**

```json
{
  "title": "Write README",
  "description": "Document the backend API",
  "dueDate": "2026-06-20",
  "priority": "HIGH"
}
```

`dueDate` and `priority` are optional. `priority` defaults to `LOW`.

**Response (201):**

```json
{
  "success": true,
  "message": "Task created",
  "data": {
    "id": "uuid",
    "title": "Write README",
    "description": "Document the backend API",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2026-06-20T00:00:00.000Z",
    "attachmentUrl": null,
    "userId": "uuid",
    "updatedAt": "...",
    "createdAt": "..."
  },
  "err": {}
}
```

---

### Admin — `/admin`

All routes require `authenticate` + `authorize("ADMIN")`.

| Method | Path               | Description                         |
| ------ | ------------------ | ----------------------------------- |
| GET    | `/dashboard`       | Platform statistics + all users     |
| GET    | `/users`           | Paginated, searchable user list     |
| GET    | `/users/:id`       | User profile + task statistics      |
| GET    | `/users/:id/tasks` | Paginated tasks for a specific user |
| DELETE | `/users/:id`       | Delete user and all their tasks     |

**Query params for `GET /users`:**

| Param       | Default     | Description                                   |
| ----------- | ----------- | --------------------------------------------- |
| `limit`     | `20`        | Page size (1–100)                             |
| `offset`    | `0`         | Pagination offset                             |
| `search`    | `""`        | Search username or email (ILIKE)              |
| `sortBy`    | `createdAt` | `username`, `email`, `createdAt`, `updatedAt` |
| `sortOrder` | `DESC`      | `ASC` or `DESC`                               |

**Query params for `GET /users/:id/tasks`:**

| Param      | Default | Description           |
| ---------- | ------- | --------------------- |
| `limit`    | `20`    | Page size             |
| `offset`   | `0`     | Pagination offset     |
| `status`   | —       | Filter by task status |
| `priority` | —       | Filter by priority    |

#### GET `/admin/dashboard`

**Response (200):**

```json
{
  "success": true,
  "message": "Dashboard data fetched successfully",
  "data": {
    "statistics": {
      "totalUsers": 10,
      "totalTasks": 42
    },
    "allUser": [
      /* array of user objects */
    ]
  },
  "err": {}
}
```

#### GET `/admin/users`

**Response (200):**

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "id": "uuid",
        "username": "bob",
        "email": "bob@example.com",
        "role": "USER",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "pagination": {
      "total": 10,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  },
  "err": {}
}
```

#### DELETE `/admin/users/:id`

Deletes the user and all associated tasks. Cannot delete self or other admin accounts.

---

### Health

| Method | Path      | Auth | Description          |
| ------ | --------- | ---- | -------------------- |
| GET    | `/health` | No   | Process uptime check |

---

## Error Handling

Controllers use custom error classes:

| Class             | Use case                         |
| ----------------- | -------------------------------- |
| `ClientError`     | Bad input, auth failures         |
| `ValidationError` | Validation failures              |
| `NotFoundError`   | Resource not found               |
| `ForbiddenError`  | Authorization / ownership denied |

Each controller wraps service calls in try/catch and returns `customErrorResponse` or `internalErrorResponse`.

---

## Future Improvements

### Production Readiness

- Replace `sequelize.sync({ alter: true })` with Sequelize migrations (`sequelize-cli` is already a devDependency)
- Add a production start script (`node src/server.js`) separate from nodemon
- Add structured logging (replace debug `console.log` in auth controllers/services)
- Health check should verify DB connectivity, not just process uptime
- Add rate limiting on auth endpoints

### API and Validation

- Enable dedicated `PUT /tasks/:id/status` endpoint (commented in routes/controller/service)
- File upload for `attachmentUrl` (field exists on model, no upload flow)
- OpenAPI/Swagger documentation

### Admin and Features

- Complete dashboard stats (`tasksByStatus`, recent users/tasks — partially implemented in repository, commented in `adminService`)
- Pagination on `GET /tasks` for regular users
- Token refresh rotation hardening (refresh token reuse detection)

### Testing and CI

- Add unit tests (services) and integration tests (API routes)
- CI pipeline for lint + test on PRs

### Security
- Consider refresh token storage in Redis instead of hashed DB column
