# Changelog

## release/v1.0.1
* major: fix(gameplay): preserve tetromino color in arena and render correctly - Refactored arena to store per-cell color values (string | 0) - Updated merge() to write tetromino color into arena - Improved drawMatrix() to render color-aware blocks - Ensured player tetromino and arena both display accurate colors - Fixed pause/resume logic to prevent unintended game resets (primo)
* major: fix(gameplay): preserve tetromino color in arena and render correctly - Refactored arena to store per-cell color values (string | 0) - Updated merge() to write tetromino color into arena - Improved drawMatrix() to render color-aware blocks - Ensured player tetromino and arena both display accurate colors - Fixed pause/resume logic to prevent unintended game resets (primo)
* minor: feat: update hamburger menu, fix pause/settings UI, clean up styles - Replace hamburger icon with semantic HTML/CSS - Improve pause overlay and settings drawer - Remove src/style.css, centralize styles - Add new settings drawer script and types - Minor fixes in engine and main logic (primo)
