/* Tutorials player. Reads its lessons from js/config.js. */
(function () {
  /* Lessons, the channel link and the embed switch live in js/config.js. */
  var cfg = window.SITE_CONFIG || {};
  var EMBED = !!cfg.embed;
  var CHANNEL_URL = cfg.channelUrl || "";
  var VIDEOS = cfg.videos || [];

  var TOPIC_CLASS = { "Websites": "p1", "Mobile apps": "p2", "Web systems": "p3" };
  var stage = document.getElementById("stage");
  var info = document.getElementById("info");
  var list = document.getElementById("lessons");
  var filters = document.getElementById("tut-filters");
  if (!stage || !info || !list || !filters || !VIDEOS.length) return;
  var topic = "All";
  var current = 0;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function topics() {
    var t = ["All"];
    VIDEOS.forEach(function (v) { if (t.indexOf(v.topic) < 0) t.push(v.topic); });
    return t;
  }
  function shown() {
    var out = [];
    VIDEOS.forEach(function (v, i) { if (topic === "All" || v.topic === topic) out.push(i); });
    return out;
  }
  function ytUrl(v) { return "https://www.youtube.com/watch?v=" + encodeURIComponent(v.id); }

  function renderFilters() {
    filters.innerHTML = topics().map(function (t) {
      return '<button class="chip" type="button" data-topic="' + esc(t) + '" aria-pressed="' + (t === topic) + '">' + esc(t) + "</button>";
    }).join("");
  }
  function renderList() {
    list.innerHTML = shown().map(function (i) {
      var v = VIDEOS[i];
      return '<li><button class="lesson" type="button" data-i="' + i + '"' + (i === current ? ' aria-current="true"' : "") + '>' +
        '<span class="ln">No. ' + (i + 1) + '</span><span class="lt">' + esc(v.title) + '</span>' +
        '<span class="lm">' + esc(v.topic) + " &middot; " + esc(v.level) + "</span></button></li>";
    }).join("");
  }
  function stageHTML(v, i) {
    var hint = !v.id ? "Video link not added yet" : (EMBED ? "Play here" : "Opens on YouTube");
    var inner = '<span class="label tag">Lesson No. ' + (i + 1) + " &middot; " + esc(v.topic) + "</span>" +
      '<span class="play"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg></span>' +
      '<span class="pbot"><span class="ptitle">' + esc(v.title) + '</span><span class="label tag">' + hint + "</span></span>";
    if (!v.id) return '<div class="poster">' + inner + "</div>";
    if (EMBED) return '<button class="poster" type="button" data-play aria-label="Play ' + esc(v.title) + '">' + inner + "</button>";
    return '<a class="poster" href="' + ytUrl(v) + '" target="_blank" rel="noopener" aria-label="Watch ' + esc(v.title) + ' on YouTube">' + inner + "</a>";
  }
  function infoHTML(v) {
    var meta = [v.topic, v.level, v.length].filter(Boolean).join(" · ");
    var pts = (v.points || []).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
    var acts = '<button class="btn" type="button" data-next>Next lesson</button>';
    if (v.id) acts += '<a class="btn" href="' + ytUrl(v) + '" target="_blank" rel="noopener">Open on YouTube</a>';
    if (CHANNEL_URL) acts += '<a class="btn" href="' + esc(CHANNEL_URL) + '" target="_blank" rel="noopener">Visit the channel</a>';
    return '<p class="label meta">' + esc(meta) + "</p><h3>" + esc(v.title) + "</h3><p>" + esc(v.summary) + "</p>" +
      (pts ? '<ul class="points">' + pts + "</ul>" : "") + '<div class="actions">' + acts + "</div>";
  }
  function select(i) {
    current = i;
    var v = VIDEOS[i];
    stage.className = "stage " + (TOPIC_CLASS[v.topic] || "p4");
    stage.innerHTML = stageHTML(v, i);
    info.innerHTML = infoHTML(v);
    renderList();
  }

  filters.addEventListener("click", function (e) {
    var b = e.target.closest("[data-topic]");
    if (!b) return;
    topic = b.getAttribute("data-topic");
    renderFilters();
    var s = shown();
    if (s.indexOf(current) < 0) select(s[0]); else renderList();
  });
  list.addEventListener("click", function (e) {
    var b = e.target.closest("[data-i]");
    if (b) select(parseInt(b.getAttribute("data-i"), 10));
  });
  info.addEventListener("click", function (e) {
    if (!e.target.closest("[data-next]")) return;
    var s = shown();
    select(s[(s.indexOf(current) + 1) % s.length]);
  });
  stage.addEventListener("click", function (e) {
    if (!e.target.closest("[data-play]")) return;
    var v = VIDEOS[current];
    stage.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.id) +
      '?autoplay=1&rel=0" title="' + esc(v.title) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
  });

  renderFilters();
  select(0);
})();
