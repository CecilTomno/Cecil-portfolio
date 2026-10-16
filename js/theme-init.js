/* Runs before first paint so the page never flashes the wrong theme. */
/* Start with the white theme before first paint; respect a saved or host-selected theme. */
(function () {
  var mode = "light", saved = null, host = null;
  try { saved = localStorage.getItem("cecil-mode"); } catch (e) {}
  try { host = document.documentElement.getAttribute("data-theme"); } catch (e) {}
  if (saved === "dark" || saved === "light") mode = saved;
  else if (host === "dark" || host === "light") mode = host;
  document.documentElement.setAttribute("data-mode", mode);
})();
