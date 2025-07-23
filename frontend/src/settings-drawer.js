import { GAME_SETTINGS } from "./settings";

document.addEventListener("DOMContentLoaded", () => {
  // ---- Drawer logic ----
  const hamburger = document.getElementById("settings-hamburger");
  const drawer = document.getElementById("settings-drawer");
  const closeBtn = document.getElementById("settings-close");

  // Null check — if any key element is missing, exit early.
  if (!hamburger || !drawer || !closeBtn) {
    console.warn("[drawer] bindings missing:", {
      hamburger,
      drawer,
      closeBtn,
    });
    return;
  }

  // Helper: always use reason 'menu'
  function setPauseState(paused) {
    if (typeof window.setPaused === "function") {
      window.setPaused(paused, "menu");
    } else {
      setTimeout(() => setPauseState(paused), 30);
    }
  }

  function trapFocus(element) {
    const focusable = element.querySelectorAll(
      "button, [tabindex]:not([tabindex='-1'])"
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    element.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        // shift + tab
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        // tab
        // Handle tab navigation when on last focusable element
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    });
  }

  function openDrawer() {
    drawer.classList.add("open");
    document.body.classList.add("drawer-open"); // Add this line!
    hamburger.setAttribute("aria-expanded", "true");
    drawer.focus();
    setPauseState(true);
    trapFocus(drawer);
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    document.body.classList.remove("drawer-open"); // And this line!
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

  if (
    gravityToggle &&
    lockToggle &&
    gravityInput &&
    cascadeInput &&
    gravityLabel &&
    cascadeLabel
  ) {
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
    const styleToggle = document.getElementById("traditional-style-toggle");
    if (styleToggle) {
      styleToggle.checked = GAME_SETTINGS.tetrominoStyle === "traditional";
      styleToggle.addEventListener("change", () => {
        GAME_SETTINGS.tetrominoStyle = styleToggle.checked
          ? "traditional"
          : "glass";
        // Optional: Redraw board if needed
      });
    }
  }

  const versionFooter = document.getElementById("version-footer");
  if (versionFooter) {
    // Try to get from Vite env (fallback to "?")
    versionFooter.textContent = `v${import.meta.env.VITE_APP_VERSION || "?"}`;
  }
});
