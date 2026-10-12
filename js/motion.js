/* Typed hero line, scroll rule, count-up numbers and process steps. */
/* Motion: typed line, scroll rule, count-up numbers, process steps */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* Typed line in the hero */
  var out = document.getElementById("typed");
  if (out && !reduce) {
    var words = ["Websites", "Mobile apps", "Web systems", "Tutorials"];
    var w = 0, i = words[0].length, deleting = false;
    var tick = function () {
      var word = words[w];
      if (!deleting) {
        if (i < word.length) { i++; out.textContent = word.slice(0, i); return setTimeout(tick, 75); }
        deleting = true; return setTimeout(tick, 1600);
      }
      if (i > 0) { i--; out.textContent = word.slice(0, i); return setTimeout(tick, 40); }
      deleting = false; w = (w + 1) % words.length; return setTimeout(tick, 300);
    };
    setTimeout(tick, 2200);
  }

  /* Scroll progress rule */
  var bar = document.getElementById("progress-bar");
  if (bar) {
    var pending = false;
    var paint = function () {
      pending = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(Math.max(window.pageYOffset / max, 0), 1) : 0;
      bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
    };
    window.addEventListener("scroll", function () { if (!pending) { pending = true; window.requestAnimationFrame(paint); } }, { passive: true });
    window.addEventListener("resize", paint);
    paint();
  }

  /* Count-up numbers */
  var nums = [].slice.call(document.querySelectorAll(".stat-n"));
  function target(el) {
    var sel = el.getAttribute("data-count-of");
    return sel ? document.querySelectorAll(sel).length : (parseInt(el.textContent, 10) || 0);
  }
  function count(el) {
    var to = target(el);
    if (!to || reduce) { el.textContent = to; return; }
    var start = null;
    el.textContent = "0";
    var step = function (t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / 1100, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }
  if (hasIO && !reduce) {
    var numIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { numIO.unobserve(e.target); count(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { numIO.observe(n); });
  } else {
    nums.forEach(function (n) { n.textContent = target(n); });
  }

  /* Process steps draw in */
  var steps = document.getElementById("steps");
  if (steps) {
    if (hasIO && !reduce) {
      steps.classList.add("arm");
      var stepIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { steps.classList.add("in"); stepIO.disconnect(); } });
      }, { threshold: 0.25 });
      stepIO.observe(steps);
    }
  }
})();
