import { GAME_SETTINGS } from "./settings";

document.addEventListener("DOMContentLoaded", () => {
  // ---- Drawer logic ----
  const hamburger = document.getElementById("settings-hamburger");
  const drawer = document.getElementById("settings-drawer");
  const closeBtn = document.getElementById("settings-close");

  // Debug
  console.log("[drawer] bindings:", !!hamburger, !!drawer, !!closeBtn);

  // Helper: always use reason 'menu'
  function setPauseState(paused) {
    if (typeof window.setPaused === "function") {
      window.setPaused(paused, "menu");
    } else {
      setTimeout(() => setPauseState(paused), 30);
    }
  }

  function openDrawer() {
    drawer.classList.add("open");
    hamburger.setAttribute("aria-expanded", "true");
    drawer.focus();
    setPauseState(true);
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.focus();
    setPauseState(false);
  }

  hamburger.addEventListener("click", openDrawer);
  closeBtn.addEventListener("click", closeDrawer);

  drawer.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
  document.addEventListener("mousedown", (e) => {
    if (
      drawer.classList.contains("open") &&
      !drawer.contains(e.target) &&
      e.target !== hamburger
    ) {
      closeDrawer();
    }
  });

  // ---- Settings logic ----
  const gravityToggle = document.getElementById("gravity-toggle");
  const lockToggle = document.getElementById("lock-cascade-toggle");
  const gravityInput = document.getElementById("gravity-speed");
  const cascadeInput = document.getElementById("cascade-speed");
  const gravityLabel = document.getElementById("gravity-speed-label");
  const cascadeLabel = document.getElementById("cascade-speed-label");

  // Sync UI with current settings
  gravityToggle.checked = GAME_SETTINGS.gravityMode;
  lockToggle.checked = GAME_SETTINGS.lockDuringCascade;
  gravityInput.value = GAME_SETTINGS.customGravity.toString();
  cascadeInput.value = GAME_SETTINGS.gravityCascadeDelayMs.toString();
  gravityLabel.textContent = gravityInput.value;
  cascadeLabel.textContent = cascadeInput.value;

  // Listeners
  gravityToggle.addEventListener("change", () => {
    GAME_SETTINGS.gravityMode = gravityToggle.checked;
    console.log("[settings] gravityMode →", GAME_SETTINGS.gravityMode);
  });
  lockToggle.addEventListener("change", () => {
    GAME_SETTINGS.lockDuringCascade = lockToggle.checked;
    console.log(
      "[settings] lockDuringCascade →",
      GAME_SETTINGS.lockDuringCascade
    );
  });
  gravityInput.addEventListener("input", () => {
    const v = parseFloat(gravityInput.value);
    GAME_SETTINGS.customGravity = v;
    gravityLabel.textContent = v.toFixed(1);
    console.log("[settings] customGravity →", GAME_SETTINGS.customGravity);
  });
  cascadeInput.addEventListener("input", () => {
    const v = parseInt(cascadeInput.value, 10);
    GAME_SETTINGS.gravityCascadeDelayMs = v;
    cascadeLabel.textContent = v.toString();
    console.log(
      "[settings] gravityCascadeDelayMs →",
      GAME_SETTINGS.gravityCascadeDelayMs
    );
  });
});
