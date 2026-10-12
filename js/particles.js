/* Floating particles behind the wording. */
/* Floating particles: ink dust in three depths. Each depth drifts at its own speed as you scroll. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hosts = [].slice.call(document.querySelectorAll("[data-fx]"));
  if (!hosts.length) return;
  var LAYERS = [
    { k: 0.06, size: [2, 4], op: [0.18, 0.3], share: 0.5 },
    { k: 0.16, size: [3, 7], op: [0.2, 0.34], share: 0.33 },
    { k: 0.3, size: [6, 14], op: [0.22, 0.38], share: 0.17 }
  ];
  var SHAPES = ["dot", "dot", "dot", "dia", "dia", "ring", "ring", "plus"];
  var fxs = [];
  var lastWidth = window.innerWidth;

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function build() {
    fxs.forEach(function (f) { if (f.node.parentNode) f.node.parentNode.removeChild(f.node); });
    fxs = [];
    var vh = window.innerHeight;
    var narrow = window.innerWidth < 768;
    hosts.forEach(function (host, hi) {
      var node = document.createElement("div");
      node.className = "fx";
      node.setAttribute("aria-hidden", "true");
      var area = host.offsetWidth * (host.offsetHeight + 2 * vh);
      var total = Math.max(14, Math.min(90, Math.round(area / (narrow ? 90000 : 80000))));
      var rand = rng(1000 + hi * 7919);
      var layers = LAYERS.map(function (L) {
        var el = document.createElement("div");
        el.className = "fx-layer";
        el.style.top = -vh + "px";
        el.style.height = "calc(100% + " + 2 * vh + "px)";
        var n = Math.round(total * L.share);
        var html = "";
        for (var i = 0; i < n; i++) {
          var shape = SHAPES[Math.floor(rand() * SHAPES.length)];
          var size = L.size[0] + rand() * (L.size[1] - L.size[0]);
          if (shape === "ring" || shape === "plus") size *= 1.8;
          var op = L.op[0] + rand() * (L.op[1] - L.op[0]);
          var style = "left:" + (rand() * 100).toFixed(2) + "%;top:" + (rand() * 100).toFixed(2) + "%;--s:" + size.toFixed(1) + "px;--o:" + op.toFixed(2);
          var cls = "pt " + shape;
          if (!reduce && rand() < 0.45) {
            var dur = 9 + rand() * 11;
            style += ";--dx:" + ((rand() * 2 - 1) * 30).toFixed(0) + "px;--dy:" + ((rand() * 2 - 1) * 44).toFixed(0) + "px;--dur:" + dur.toFixed(1) + "s;--dly:-" + (rand() * dur).toFixed(1) + "s";
            cls += " an";
          }
          html += '<span class="' + cls + '" style="' + style + '"></span>';
        }
        el.innerHTML = html;
        node.appendChild(el);
        return { el: el, k: L.k };
      });
      host.insertBefore(node, host.firstChild);
      fxs.push({ host: host, node: node, layers: layers });
    });
    update();
  }

  function update() {
    if (reduce) return;
    fxs.forEach(function (f) {
      if (f.host._fxVisible === false) return;
      var sc = -f.host.getBoundingClientRect().top;
      f.layers.forEach(function (l) {
        var x = Math.sin(sc / 340 + l.k * 9) * l.k * 110;
        l.el.style.transform = "translate3d(" + x.toFixed(1) + "px," + (sc * l.k).toFixed(1) + "px,0)";
      });
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { ticking = false; update(); });
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        e.target._fxVisible = e.isIntersecting;
        if (e.isIntersecting) e.target.removeAttribute("data-fx-off"); else e.target.setAttribute("data-fx-off", "");
      });
      update();
    }, { rootMargin: "200px 0px" });
    hosts.forEach(function (h) { io.observe(h); });
  }

  build();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("load", build);
  var t;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(function () {
      if (window.innerWidth !== lastWidth) { lastWidth = window.innerWidth; build(); } else { update(); }
    }, 250);
  });
})();
