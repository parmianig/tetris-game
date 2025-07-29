# Tetris Game (Frontend + Backend)

This is a modern browser-based Tetris game built with **TypeScript**, **Vite**, **FastAPI**, and **Docker**. It includes a responsive UI for desktop and mobile, and a containerized environment for both development and production.

---
## Changelog
<!-- changelog -->
## release/v2.3.1
* patch: attempt to fix the scroll lock on mobile (primo)
* minor: fix(ui,next-preview): remove double frame in Next piece, restore proper arena layout, mobile lock, and game draw resets - Removed extra border around Next piece preview; only a single frame is rendered now - Fixed Tetris arena layout issues and ensured proper aspect ratio/scaling across devices - Improved mobile experience: disables page scrolling and magnifier during gameplay - Refactored canvas draw/reset logic for robust redraws and transforms - Cleaned up types, engine, spinner, and render modules for stricter TS and clarity - Misc small UI/UX and code improvements (primo)

---

## Versioning
APP_VERSION: 2.3.2
FRONTEND_VERSION: 2.3.2
BACKEND_VERSION: 2.0.0

## 🚀 Features

* 🎮 Tetris rendering with canvas
* ⌨️ Keyboard + mobile UI controls
* 🔁 Tetromino rotation (clockwise / counterclockwise)
* 🐍 Python FastAPI backend (optional leaderboard integration)
* 🐳 Dockerized frontend/backend with Compose support
* 🛠️ Vite + TypeScript dev tooling
* 📦 Kubernetes-ready layout (`k8s/`)


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


## ✅ TODO

* [ ] Implement score persistence via backend
* [ ] Add multiplayer mode (WebSocket?)
* [ ] Save high scores to database


## 📄 License

MIT License. See `LICENSE` file.


## 👨‍💻 Author

Made with ❤️ by \[parmianig]. Contributions welcome!
