# Tetris Game (Frontend + Backend)

This is a modern browser-based Tetris game built with **TypeScript**, **Vite**, **FastAPI**, and **Docker**. It includes a responsive UI for desktop and mobile, and a containerized environment for both development and production.

---
## Changelog
## release/v0.1.29
* patch: fix generate changelog and readme, sixth try (primo)
* patch: fix generate changelog and readme, fifth try (primo)
* patch: fix generate changelog and readme, fifth try (primo)
* patch: fix generate changelog, fourth try (primo)
* patch: fix generate changelog, fourth try (primo)
* patch: fix generate changelog, third try (primo)
* patch: fix generate changelog, third try (primo)
* patch: fix generate changelog, second try (primo)
* patch: fix generate changelog, second try (primo)
* patch: fix generate changelog (primo)
* patch: fix generate changelog (primo)
* patch: preserve README content (primo)
* patch: preserve README content (primo)
* patch: preserve README content (primo)
* patch: preserve README content (primo)
* patch: preserve README content (primo)
* patch: preserve README content (primo)
* patch: preserve README content (primo)
* patch: preserve README content (primo)
* patch: preserve README content (primo)
* patch: preserve README content (primo)
* patch: preserve README content (primo)
* patch: preserve README content (primo)
* patch: preserve README content (primo)
* patch: preserve README content (primo)
* patch: preserve README content (primo)
* patch: preserve README content (primo)
* patch: preserve README content (primo)
* patch: preserve README content (primo)
* patch: preserve README content, except those between < changelog --> and the next ## (primo)
* patch: preserve README content, except those between < changelog --> and the next ## (primo)
* patch: fixed readme.md (primo)
* patch: fixed readme.md (primo)
* patch: fixed readme.md (primo)
* patch: fixed readme.md (primo)
* patch: removed full changelog from the readme.md (primo)
* patch: removed full changelog from the readme.md (primo)
* patch: fix safe abort on release failure (primo)
* patch: fix safe abort on release failure (primo)
* patch: modularized makefile and added release targets (primo)
* patch: modularized makefile and added release targets (primo)
* patch: modularized makefile and added targets (primo)
* patch: modularized makefile and added targets (primo)
* release: modularize Makefile with .mk includes and cleanup (primo)
* release: modularize Makefile with .mk includes and cleanup (primo)
* release: add bump_version.py sonar cleanups (primo)
* release: add bump_version.py sonar cleanups (primo)
* release: refactor versioning + improve changelog injection (primo)
* chore(release): version 0.1.2 (primo)
* chore(release): version 0.1.1 (primo)
* chore(backend): bump version to v0.0.4 (primo)
---
## Changelog
<!-- changelog -->

---
## Versioning
APP_VERSION: 0.1.30
FRONTEND_VERSION: 0.0.5
BACKEND_VERSION: 0.0.5

---
## 🚀 Features

* 🎮 Tetris rendering with canvas
* ⌨️ Keyboard + mobile UI controls
* 🔁 Tetromino rotation (clockwise / counterclockwise)
* 🐍 Python FastAPI backend (optional leaderboard integration)
* 🐳 Dockerized frontend/backend with Compose support
* 🛠️ Vite + TypeScript dev tooling
* 📦 Kubernetes-ready layout (`k8s/`)

---

## 📁 Project Structure

```
.
├── backend/             # Python FastAPI API
│   ├── app/main.py      # Entry point
│   └── static/          # Assets (favicon etc.)
├── frontend/            # Vite + TypeScript frontend
│   ├── src/             # Main logic (main.ts, engine.ts, etc.)
│   └── public/          # Static files for production
├── docker-compose.yml   # Dev orchestrator
├── k8s/                 # Kubernetes manifests (optional)
└── Makefile             # Optional commands
```

---

## 🧑‍💻 Getting Started

### 1. Clone and Setup

```bash
git clone https://github.com/parmianig/tetris-game.git
cd tetris-game
```

### 2. Local Development (Docker)

Run backend and frontend together:

```bash
docker compose down -v && docker compose build --no-cache && docker compose up
```

> 🔁 Use this command after any change to `Dockerfile`, `requirements.txt`, or `package.json`.

Alternatively:

```bash
docker compose up --build
```

### 3. Access the Game

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:8000/scores](http://localhost:8000/scores) (test endpoint)

---

## 📦 Scripts

You can also define and use helper scripts in the root `package.json`:

```json
"scripts": {
  "docker:restart": "docker compose down -v && docker compose build --no-cache && docker compose up"
}
```

Then run:

```bash
npm run docker:restart
```

---

## ⚙️ Frontend Tech

* [x] TypeScript + Vite
* [x] Keyboard and touch control support
* [x] Canvas-based rendering logic in `engine.ts`
* [x] Rotations with `rotate(matrix, dir)`

## 🐍 Backend Tech

* [x] Python 3.12
* [x] FastAPI with `/scores` endpoint
* [x] Static serving support
* [x] Dockerized using `uvicorn`

---

## 🧪 Development Tips

### Change Controls

Controls are handled in `main.ts`:

* Arrow keys or buttons move/rotate
* `Shift + Rotate` = counterclockwise
* `Rotate` alone = clockwise

### Communication with Backend

Handled via `fetch(__API_BASE__ + '/scores')` in `main.ts`

### Edit Canvas Logic

Modify drawing in:

* `engine.ts`
* `main.ts`

---

## 🐳 Deployment (Basic)

Production-ready build for frontend:

```bash
cd frontend
npm run build
```

Build + serve with Nginx (already handled in Dockerfile):

```Dockerfile
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

---

## ✅ TODO

* [ ] Implement score persistence via backend
* [ ] Add multiplayer mode (WebSocket?)
* [ ] Save high scores to database

---

## 📄 License

MIT License. See `LICENSE` file.

---

## 👨‍💻 Author

Made with ❤️ by \[parmianig]. Contributions welcome!
## release/v0.1.28
* patch: fix generate changelog and readme, fifth try (primo)
* patch: fix generate changelog, fourth try (primo)

## release/v0.1.27
* patch: fix generate changelog, third try (primo)

## release/v0.1.26
* patch: fix generate changelog, second try (primo)

## release/v0.1.25
* patch: fix generate changelog (primo)

## release/v0.1.24
* patch: preserve README content (primo)

## release/v0.1.23
* No unique changes

## release/v0.1.22
* No unique changes

## release/v0.1.21
* No unique changes

## release/v0.1.20
* No unique changes

## release/v0.1.19
* No unique changes

## release/v0.1.18
* No unique changes

## release/v0.1.17
* No unique changes

## release/v0.1.16
* No unique changes

## release/v0.1.15
* patch: preserve README content, except those between < changelog --> and the next ## (primo)

## release/v0.1.14
* patch: fixed readme.md (primo)

## release/v0.1.13
* No unique changes

## release/v0.1.12
* patch: removed full changelog from the readme.md (primo)

## release/v0.1.11
* patch: fix safe abort on release failure (primo)

## release/v0.1.10
* patch: modularized makefile and added release targets (primo)

## release/v0.1.9
* patch: modularized makefile and added targets (primo)
* release: modularize Makefile with .mk includes and cleanup (primo)

## release/v0.1.7
* No unique changes

## release/v0.1.6
* release: add bump_version.py sonar cleanups (primo)
* release: refactor versioning + improve changelog injection (primo)

## release/v0.1.2
* chore(release): version 0.1.2 (primo)

## release/v0.1.1
* chore(release): version 0.1.1 (primo)

## v0.0.4
* No unique changes

## release/v0.0.6
* No unique changes

## release/v0.0.5
* No unique changes

## release/v0.0.4
* No unique changes

## release/v0.0.3
* chore(backend): bump version to v0.0.4 (primo)

## v0.0.3
* chore(app): bump version to v0.0.3 (primo)

## v0.0.2
* chore(frontend): bump version to v0.0.2 (primo)
* Remove .venv from Git tracking (primo)
* Setup env-based config, ignore dev artifacts, Vite proxy to Render (primo)
* Cleanup: update .gitignore and remove local files from repo (primo)
* Set up Vercel deployment (primo)
* Initial commit (primo)
---
## Changelog
<!-- changelog -->

---
## Versioning
APP_VERSION: 0.1.30
FRONTEND_VERSION: 0.0.5
BACKEND_VERSION: 0.0.5

---
## 🚀 Features

* 🎮 Tetris rendering with canvas
* ⌨️ Keyboard + mobile UI controls
* 🔁 Tetromino rotation (clockwise / counterclockwise)
* 🐍 Python FastAPI backend (optional leaderboard integration)
* 🐳 Dockerized frontend/backend with Compose support
* 🛠️ Vite + TypeScript dev tooling
* 📦 Kubernetes-ready layout (`k8s/`)

---

## 📁 Project Structure

```
.
├── backend/             # Python FastAPI API
│   ├── app/main.py      # Entry point
│   └── static/          # Assets (favicon etc.)
├── frontend/            # Vite + TypeScript frontend
│   ├── src/             # Main logic (main.ts, engine.ts, etc.)
│   └── public/          # Static files for production
├── docker-compose.yml   # Dev orchestrator
├── k8s/                 # Kubernetes manifests (optional)
└── Makefile             # Optional commands
```

---

## 🧑‍💻 Getting Started

### 1. Clone and Setup

```bash
git clone https://github.com/parmianig/tetris-game.git
cd tetris-game
```

### 2. Local Development (Docker)

Run backend and frontend together:

```bash
docker compose down -v && docker compose build --no-cache && docker compose up
```

> 🔁 Use this command after any change to `Dockerfile`, `requirements.txt`, or `package.json`.

Alternatively:

```bash
docker compose up --build
```

### 3. Access the Game

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:8000/scores](http://localhost:8000/scores) (test endpoint)

---

## 📦 Scripts

You can also define and use helper scripts in the root `package.json`:

```json
"scripts": {
  "docker:restart": "docker compose down -v && docker compose build --no-cache && docker compose up"
}
```

Then run:

```bash
npm run docker:restart
```

---

## ⚙️ Frontend Tech

* [x] TypeScript + Vite
* [x] Keyboard and touch control support
* [x] Canvas-based rendering logic in `engine.ts`
* [x] Rotations with `rotate(matrix, dir)`

## 🐍 Backend Tech

* [x] Python 3.12
* [x] FastAPI with `/scores` endpoint
* [x] Static serving support
* [x] Dockerized using `uvicorn`

---

## 🧪 Development Tips

### Change Controls

Controls are handled in `main.ts`:

* Arrow keys or buttons move/rotate
* `Shift + Rotate` = counterclockwise
* `Rotate` alone = clockwise

### Communication with Backend

Handled via `fetch(__API_BASE__ + '/scores')` in `main.ts`

### Edit Canvas Logic

Modify drawing in:

* `engine.ts`
* `main.ts`

---

## 🐳 Deployment (Basic)

Production-ready build for frontend:

```bash
cd frontend
npm run build
```

Build + serve with Nginx (already handled in Dockerfile):

```Dockerfile
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

---

## ✅ TODO

* [ ] Implement score persistence via backend
* [ ] Add multiplayer mode (WebSocket?)
* [ ] Save high scores to database

---

## 📄 License

MIT License. See `LICENSE` file.

---

## 👨‍💻 Author

Made with ❤️ by \[parmianig]. Contributions welcome!
