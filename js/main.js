/**
 * main.js
 * -------
 * Todo el JavaScript del sitio. Son cuatro mejoras pequeñas y aisladas:
 *
 *  1. Preloader: se oculta cuando la foto principal ya cargó.
 *  2. Menú móvil: botón accesible que abre y cierra el menú.
 *  3. Header: sombra sutil al hacer scroll.
 *  4. Aparición suave de secciones e imágenes al entrar en pantalla.
 *
 * El sitio funciona completo aunque este archivo no cargue: el CSS muestra
 * todo por defecto y JS solo añade comportamiento (progressive enhancement).
 */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ---------------------------------------------------------------------
   * 1. Preloader
   * ------------------------------------------------------------------ */
  function initPreloader() {
    const preloader = document.getElementById("preloader");
    const heroImg = document.getElementById("hero-img");
    if (!preloader) return;

    let done = false;

    function hide() {
      if (done) return;
      done = true;
      preloader.classList.add("is-done");
      document.documentElement.classList.add("is-ready");
      // Se quita del DOM al terminar la transición para no estorbar.
      preloader.addEventListener("transitionend", () => preloader.remove(), {
        once: true,
      });
      // Respaldo por si el navegador no dispara transitionend.
      setTimeout(() => preloader.remove(), 1200);
    }

    // Un mínimo de tiempo visible evita un parpadeo feo en conexiones rápidas.
    const MIN_VISIBLE_MS = reduceMotion ? 0 : 600;
    const MAX_WAIT_MS = 4000;
    const start = performance.now();

    function hideWhenReady() {
      const elapsed = performance.now() - start;
      setTimeout(hide, Math.max(0, MIN_VISIBLE_MS - elapsed));
    }

    if (heroImg && !heroImg.complete) {
      heroImg.addEventListener("load", hideWhenReady, { once: true });
      heroImg.addEventListener("error", hideWhenReady, { once: true });
    } else {
      hideWhenReady();
    }

    // Nunca dejes al visitante esperando más de lo razonable.
    setTimeout(hide, MAX_WAIT_MS);
  }

  /* ---------------------------------------------------------------------
   * 2. Menú móvil
   * ------------------------------------------------------------------ */
  function initMenu() {
    const toggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("nav-principal");
    if (!toggle || !nav) return;

    const desktop = window.matchMedia("(min-width: 860px)");

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      document.body.classList.toggle("menu-open", open);
    }

    const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

    toggle.addEventListener("click", () => setOpen(!isOpen()));

    // Al elegir una sección, el menú se cierra solo.
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    // Tecla Escape cierra y devuelve el foco al botón.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Tocar fuera del header también cierra.
    document.addEventListener("click", (event) => {
      if (isOpen() && !event.target.closest(".site-header")) setOpen(false);
    });

    // Si la pantalla crece a escritorio, se limpia el estado móvil.
    desktop.addEventListener("change", (event) => {
      if (event.matches) setOpen(false);
    });
  }

  /* ---------------------------------------------------------------------
   * 3. Sombra del header al hacer scroll
   * ------------------------------------------------------------------ */
  function initHeaderShadow() {
    const header = document.getElementById("site-header");
    if (!header) return;

    let ticking = false;

    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true },
    );

    update();
  }

  /* ---------------------------------------------------------------------
   * 4. Aparición suave al hacer scroll
   * ------------------------------------------------------------------ */
  function initReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    // Sin soporte o con "reducir movimiento" activado: se muestra todo ya.
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------------------
   * Imágenes: aparecen con un fundido en cuanto terminan de cargar
   * ------------------------------------------------------------------ */
  function initImageFade() {
    document.querySelectorAll("img[loading='lazy']").forEach((img) => {
      const markLoaded = () => img.classList.add("is-loaded");
      if (img.complete) {
        markLoaded();
      } else {
        img.addEventListener("load", markLoaded, { once: true });
        img.addEventListener("error", markLoaded, { once: true });
      }
    });
  }

  initPreloader();
  initMenu();
  initHeaderShadow();
  initReveal();
  initImageFade();
})();
