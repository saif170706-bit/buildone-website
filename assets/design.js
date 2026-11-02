/* Headeren skifter fra gennemsigtig til massiv, så snart siden
   forlader toppen. Tilstanden læses af position frem for af en
   IntersectionObserver, fordi undersiderne ikke har nogen hero at
   observere — og fordi en 1px-markør i toppen også tæller som
   "ude af billedet", når man ruller forbi den.

   rAF-spærren gør, at vi højst rører klasselisten én gang pr.
   optegning, uanset hvor mange scroll-hændelser der kommer. */
(function () {
  var head = document.querySelector("header.site");
  if (!head) return;

  var venter = false;

  function opdater() {
    venter = false;
    head.classList.toggle("solid", window.scrollY > 10);
  }

  function paaScroll() {
    if (venter) return;
    venter = true;
    requestAnimationFrame(opdater);
  }

  opdater();
  window.addEventListener("scroll", paaScroll, { passive: true });
})();
