/* Light and dark switch with the lamp button. */
/* Theme switch: circular reveal from the lamp, plus a lantern glow in dark mode */
(function () {
  var root = document.documentElement;
  var btn = document.getElementById("mode");
  var lantern = document.getElementById("lantern");
  if (!btn || !lantern) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DUR = 750, EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
  var busy = false, raf = 0;
  var tx = window.innerWidth / 2, ty = window.innerHeight * 0.35, cx = tx, cy = ty;

  function isDark() { return root.getAttribute("data-mode") === "dark"; }
  function sync() { btn.setAttribute("aria-pressed", isDark() ? "true" : "false"); }
  function paint() { lantern.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)"; }
  function loop() {
    cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14; paint();
    raf = (Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4) ? window.requestAnimationFrame(loop) : 0;
  }
  function aim(x, y) {
    tx = x; ty = y;
    if (reduce) { cx = x; cy = y; paint(); return; }
    if (!raf) raf = window.requestAnimationFrame(loop);
  }
  function onPointer(e) { if (isDark()) aim(e.clientX, e.clientY); }
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("pointerdown", onPointer, { passive: true });

  function apply(next, x, y) {
    root.setAttribute("data-mode", next);
    try { localStorage.setItem("cecil-mode", next); } catch (e) {}
    sync();
    if (next === "dark") { cx = x; cy = y; paint(); aim(tx, ty); }
  }

  function burst(x, y, rad, next) {
    var d = document.createElement("div");
    d.className = "burst";
    d.style.left = (x - 128) + "px";
    d.style.top = (y - 128) + "px";
    d.style.setProperty("--ring", next === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.28)");
    document.body.appendChild(d);
    var a = d.animate(
      [{ transform: "scale(0)", opacity: 1 }, { transform: "scale(" + (rad / 128).toFixed(3) + ")", opacity: 0 }],
      { duration: DUR, easing: EASE }
    );
    a.onfinish = function () { if (d.parentNode) d.parentNode.removeChild(d); };
  }

  function veil(next, done) {
    var o = document.createElement("div");
    o.className = "veil";
    o.style.background = next === "dark" ? "#0a0a0a" : "#ffffff";
    document.body.appendChild(o);
    var a = o.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, fill: "forwards" });
    a.onfinish = function () {
      done();
      var b = o.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 360, fill: "forwards" });
      b.onfinish = function () { if (o.parentNode) o.parentNode.removeChild(o); };
    };
  }

  btn.addEventListener("click", function () {
    if (busy) return;
    var next = isDark() ? "light" : "dark";
    var r = btn.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (reduce) { apply(next, x, y); return; }
    busy = true;
    setTimeout(function () { busy = false; }, DUR + 150);
    var rad = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    burst(x, y, rad, next);
    var started = false;
    if (document.startViewTransition) {
      try {
        var vt = document.startViewTransition(function () { apply(next, x, y); });
        started = true;
        vt.ready.then(function () {
          root.animate(
            { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + rad + "px at " + x + "px " + y + "px)"] },
            { duration: DUR, easing: EASE, pseudoElement: "::view-transition-new(root)" }
          );
        }).catch(function () {});
      } catch (e) { started = false; }
    }
    if (!started) veil(next, function () { apply(next, x, y); });
  });

  sync();
  paint();
})();
