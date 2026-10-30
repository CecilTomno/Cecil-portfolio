/* Keeps the supplied character video light, controllable and pointer-aware. */
(function () {
  var stage = document.getElementById("bear-stage");
  var video = document.getElementById("bear-video");
  var control = document.getElementById("bear-control");
  var source = video && video.querySelector("source[data-src]");
  if (!stage || !video || !control || !source) return;

  var motion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = !!(motion && motion.matches);
  var pointerAvailable = "PointerEvent" in window;
  var inView = false;
  var userPaused = false;
  var pointerFrame = 0;
  var pointerEvent = null;

  video.muted = true;

  function updateControl() {
    var paused = video.paused;
    stage.setAttribute("data-paused", paused ? "true" : "false");
    control.setAttribute("aria-label", paused ? "Play teddy-bear video" : "Pause teddy-bear video");
    control.title = paused ? "Play teddy-bear video" : "Pause teddy-bear video";
  }

  function loadVideo() {
    if (!source.getAttribute("src")) {
      source.setAttribute("src", source.getAttribute("data-src"));
      video.load();
    }
  }

  function playVideo(fromControl) {
    if (reduced || !pointerAvailable || document.hidden || (!inView && !fromControl)) return;
    if (fromControl) userPaused = false;
    if (userPaused) return;
    loadVideo();
    var request = video.play();
    if (request && typeof request.catch === "function") request.catch(updateControl);
  }

  function pauseVideo() {
    video.pause();
    updateControl();
  }

  function syncMotionPreference() {
    reduced = !!(motion && motion.matches);
    var staticFallback = reduced || !pointerAvailable;
    stage.setAttribute("data-static", staticFallback ? "true" : "false");
    control.hidden = staticFallback || !source.getAttribute("src");
    if (staticFallback) pauseVideo();
    else if (inView && !userPaused) playVideo(false);
  }

  control.addEventListener("click", function () {
    if (video.paused) playVideo(true);
    else {
      userPaused = true;
      pauseVideo();
    }
  });

  video.addEventListener("loadeddata", function () {
    stage.classList.add("has-frame");
    control.hidden = reduced;
    updateControl();
  });
  video.addEventListener("play", updateControl);
  video.addEventListener("pause", updateControl);
  video.addEventListener("error", function () {
    stage.classList.remove("has-frame");
    control.hidden = true;
  });

  function setPointerPosition(event) {
    if (reduced || !pointerAvailable) return;
    pointerEvent = event;
    if (pointerFrame) return;
    pointerFrame = window.requestAnimationFrame(function () {
      pointerFrame = 0;
      if (!pointerEvent || reduced) return;
      var bounds = stage.getBoundingClientRect();
      var x = Math.max(-1, Math.min(1, ((pointerEvent.clientX - bounds.left) / bounds.width - 0.5) * 2));
      var y = Math.max(-1, Math.min(1, ((pointerEvent.clientY - bounds.top) / bounds.height - 0.5) * 2));
      stage.style.setProperty("--bear-x", (x * 7).toFixed(1) + "px");
      stage.style.setProperty("--bear-y", (y * 6).toFixed(1) + "px");
      stage.style.setProperty("--bear-tilt", (x * 0.7).toFixed(2) + "deg");
    });
  }

  function resetPointer() {
    pointerEvent = null;
    stage.classList.remove("is-pointer");
    stage.style.setProperty("--bear-x", "0px");
    stage.style.setProperty("--bear-y", "0px");
    stage.style.setProperty("--bear-tilt", "0deg");
  }

  stage.addEventListener("pointerenter", function () {
    if (!reduced && pointerAvailable) stage.classList.add("is-pointer");
  });
  stage.addEventListener("pointermove", setPointerPosition, { passive: true });
  stage.addEventListener("pointerleave", resetPointer, { passive: true });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        inView = entry.isIntersecting;
        if (inView) playVideo(false);
        else pauseVideo();
      });
    }, { threshold: 0.15 });
    observer.observe(stage);
  } else {
    inView = true;
    playVideo(false);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) pauseVideo();
    else if (inView && !userPaused) playVideo(false);
  });

  if (motion) {
    if (motion.addEventListener) motion.addEventListener("change", syncMotionPreference);
    else if (motion.addListener) motion.addListener(syncMotionPreference);
  }

  syncMotionPreference();
  updateControl();
})();
