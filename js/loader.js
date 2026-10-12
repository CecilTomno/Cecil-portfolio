/* Typeset loader. Runs at the top of <body>, once per visit. */
/* Typeset loader: shows once per visit, skipped for reduced motion */
(function () {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (sessionStorage.getItem("cecil-booted")) return;
    sessionStorage.setItem("cecil-booted", "1");
  } catch (e) { return; }
  var b = document.createElement("div");
  b.id = "boot";
  b.setAttribute("aria-hidden", "true");
  b.innerHTML = '<div class="boot-in"><span class="boot-mark">Cecil.</span><span class="boot-line">Setting the type<b class="caret">_</b></span><span class="boot-bar"><i></i></span></div>';
  document.body.appendChild(b);
  setTimeout(function () { b.className = "out"; }, 1300);
  setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 2300);
})();
