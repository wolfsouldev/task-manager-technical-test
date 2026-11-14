// Before CSS/React paint: dark by default, even when the OS prefers light.
(() => {
  let theme = "dark";
  try {
    if (localStorage.getItem("task-manager:theme") === "light") theme = "light";
  } catch {
    /* Storage can be unavailable in private/restricted browsers. */
  }
  document.documentElement.classList.toggle("dark", theme === "dark");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#141517" : "#f7f8fa");
})();
