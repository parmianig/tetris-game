// Vanilla JS (no framework)
const hamburger = document.getElementById("settings-hamburger");
const drawer = document.getElementById("settings-drawer");
const closeBtn = document.getElementById("settings-close");

function openDrawer() {
  drawer.classList.add("open");
  hamburger.setAttribute("aria-expanded", "true");
  drawer.focus();
}
function closeDrawer() {
  drawer.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");
  hamburger.focus();
}

hamburger.addEventListener("click", openDrawer);
closeBtn.addEventListener("click", closeDrawer);

// Optional: ESC to close
drawer.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});

// Optional: click outside closes drawer (overlay solution)
document.addEventListener("click", (e) => {
  if (
    drawer.classList.contains("open") &&
    !drawer.contains(e.target) &&
    e.target !== hamburger
  ) {
    closeDrawer();
  }
});
