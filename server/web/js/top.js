const pageTopBtn = document.getElementById('pagetop');
pageTopBtn.addEventListener("click", function () {
  const me = arguments.callee;
  const nowY = window.pageYOffset;
  window.scrollTo(0, nowY - 100);
  if (nowY > 0) {
    window.setTimeout(me, 10);
  }
});