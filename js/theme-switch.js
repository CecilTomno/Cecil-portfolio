/* Theme switch: direct, predictable toggle with a remembered preference. */
(function () {
  var root = document.documentElement;
  var btn = document.getElementById("mode");
  if (!btn) return;

  function isDark() { return root.getAttribute("data-mode") === "dark"; }
  function sync() { btn.setAttribute("aria-pressed", isDark() ? "true" : "false"); }
  function apply(next) {
    root.setAttribute("data-mode", next);
    try { localStorage.setItem("cecil-mode", next); } catch (e) {}
    sync();
  }

  btn.addEventListener("click", function () {
    apply(isDark() ? "light" : "dark");
  });

  sync();
})();
