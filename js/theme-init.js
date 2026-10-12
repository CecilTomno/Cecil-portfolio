/* Runs before first paint so the page never flashes the wrong theme. */
/* Choose light or dark before first paint: saved choice, then the viewer's theme, then the device setting */
(function () {
  var mode = "light", saved = null, host = null;
  try { saved = localStorage.getItem("cecil-mode"); } catch (e) {}
  try { host = document.documentElement.getAttribute("data-theme"); } catch (e) {}
  if (saved === "dark" || saved === "light") mode = saved;
  else if (host === "dark" || host === "light") mode = host;
  else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) mode = "dark";
  document.documentElement.setAttribute("data-mode", mode);
})();
