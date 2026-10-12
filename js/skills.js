/* Skills: tap a tool to pin its brand color on touch screens. */
(function () {
  var chips = document.querySelectorAll(".skill");
  for (var i = 0; i < chips.length; i++) {
    chips[i].addEventListener("click", function () {
      var on = this.classList.toggle("on");
      this.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
})();
