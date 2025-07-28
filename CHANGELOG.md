# Changelog

## release/v2.1.7
* patch: next pice frame layout refinements on mobile (primo)
* patch: fix vercel deploy (primo)

## release/v2.1.6
* No unique changes

## release/v2.1.5
* No unique changes

## release/v2.1.4
* No unique changes

## release/v2.1.3
* patch: next pice frame layout on mobile (primo)

## release/v2.1.2
* patch: vercel deploy (primo)

## release/v2.1.1
* minor: make up next piece renovation (primo)

## release/v2.1.0
* patch: controls (primo)

## release/v2.0.4
* patch: third patch attempt to fix deploy error to vercel (primo)

## release/v2.0.3
* patch: second patch attempt to fix deploy error to vercel (primo)

## release/v2.0.2
* patch: patch attempt to fix deploy error to vercel (primo)

## release/v2.0.1
* major: fix(srs,rotation): bulletproof SRS rotation with type-safe I-piece center - Refactored I-piece rotation logic for true SRS-compliant center-of-gravity pivot (always 4 blocks, never lost). - All rotations now respect backend-provided pivot/origin (including T/J/L/S/Z). - TS2532-safe: all array accesses fully guarded for type-safety. - Updated backend to send correct I/O piece origins. - Cleaned up matrix manipulation for clarity and SRS compliance. - Minor UI/TS tweaks and settings sync. (primo)

## release/v2.0.0
* minor: added liquid glass tetromino style (primo)

## release/v1.2.0
* patch: refinements delay after hold Press-and-Hold tap on mobile (primo)

## release/v1.1.10
* No unique changes

## release/v1.1.9
* No unique changes

## release/v1.1.8
* patch: refinements Press-and-Hold tap on mobile (primo)

## release/v1.1.7
* patch: try to enable Press-and-Hold tap on mobile (primo)

## release/v1.1.6
* patch: test new button layout another one (primo)

## release/v1.1.5
* patch: test new button layout (primo)

## release/v1.1.4
* patch: remove pauseReason from main.ts in order to fix vercel deployment (primo)

## release/v1.1.3
* patch: refactor (primo)

## release/v1.1.2
* patch: refactor for deploy to production attempt (primo)

## release/v1.1.1
* chore: version bump (primo)

## release/v1.1.0
* patch: fix 'Position' is declared but its value is never read. (primo)

## release/v1.0.1
* major: fix(gameplay): preserve tetromino color in arena and render correctly - Refactored arena to store per-cell color values (string | 0) - Updated merge() to write tetromino color into arena - Improved drawMatrix() to render color-aware blocks - Ensured player tetromino and arena both display accurate colors - Fixed pause/resume logic to prevent unintended game resets (primo)

## release/v1.0.0
* minor: feat: update hamburger menu, fix pause/settings UI, clean up styles - Replace hamburger icon with semantic HTML/CSS - Improve pause overlay and settings drawer - Remove src/style.css, centralize styles - Add new settings drawer script and types - Minor fixes in engine and main logic (primo)

## release/v0.4.0
* Remove .DS_Store files (primo)
* patch: fix vercel (primo)

## release/v0.3.5
* patch: - update main.ts with the canvas right border \ fix bumb version  and some refactor (primo)
* patch: - update main.ts with the canvas right border \and some refactor (primo)

## release/v0.3.3
* patch: fix bump version (primo)

## release/v0.3.1
* patch: improved code editor settings Fix makefile (primo)
* feat: modularize frontend logic and enable Docker/Sonar support - Refactor: Split main.ts into game.ts, input.ts, and render.ts for modularity - Chore: Add SonarQube config and zip helper script for project packaging - Fix: Correct Dockerfile and docker-compose frontend exposure issues - Misc: Update .vscode settings and vite config (primo)

## release/v0.3.0
* No unique changes

## release/v0.24.0
* No unique changes

## release/v0.9.0
* No unique changes

## release/v0.12.0
* No unique changes

## release/v0.11.0
* No unique changes

## release/v0.10.0
* patch: suppress the warning that level is unused in function applyGravity (primo)

## release/v0.2.1
* - Added Gravity Mode toggle (classic vs cascading) - Fixed player drop overflow issue - Restored mobile/touch control buttons - Removed legacy main.js and updated TypeScript entrypoint (primo)
* patch: fix undefined matrix (primo)

## release/v0.1.44
* patch: added types/node to package,json (primo)

## release/v0.1.41
* patch: fix vercel config (primo)

## release/v0.1.40
* patch: fix generate changelog and readme, sixteenth try (primo)

## release/v0.1.39
* patch: fix generate changelog and readme, fiveteenth try (primo)

## release/v0.1.38
* patch: fix generate changelog and readme, fourteenth try (primo)

## release/v0.1.37
* patch: fix generate changelog and readme, thirteenth try (primo)

## release/v0.1.36
* patch: fix generate changelog and readme, twelfth try (primo)

## release/v0.1.35
* patch: fix generate changelog and readme, eleventh try (primo)

## release/v0.1.34
* patch: fix generate changelog and readme, tenth try (primo)

## release/v0.1.33
* patch: fix generate changelog and readme, ninth try (primo)

## release/v0.1.32
* No unique changes

## release/v0.1.31
* patch: fix generate changelog and readme, eigth try (primo)
* patch: fix generate changelog and readme, seventh try (primo)

## release/v0.1.30
* patch: fix generate changelog and readme, sixth try (primo)

## release/v0.1.29
* patch: fix generate changelog and readme, fifth try (primo)

## release/v0.1.28
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
