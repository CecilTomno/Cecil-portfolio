/* Contact: copy the email address. */
(function () {
  var btn = document.getElementById("copy");
  var addr = document.getElementById("addr");
  if (!btn || !addr) return;
  function select() {
    try {
      var r = document.createRange(); r.selectNodeContents(addr);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    } catch (e) {}
  }
  btn.addEventListener("click", function () {
    var done = function () { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = "Copy email address"; }, 1800); };
    try { navigator.clipboard.writeText(addr.textContent).then(done, select); } catch (e) { select(); }
  });
})();
