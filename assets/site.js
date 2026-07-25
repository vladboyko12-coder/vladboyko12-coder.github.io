/* ==========================================================================
   In-CRM — общий скрипт сайта
   Скролл-сцена «хаос → воронка», анимации появления, счётчики, табы,
   бургер-меню, FAQ, фильтр кейсов, демо-обработка форм.
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* --- Бургер-меню --------------------------------------------------------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("navLinks");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* --- Появление блоков при скролле ---------------------------------------- */
  var rises = document.querySelectorAll("[data-rise]");
  if (reduce) {
    rises.forEach(function (el) { el.classList.add("in"); });
  } else if (rises.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sibs = [].slice.call(e.target.parentNode.children)
          .filter(function (c) { return c.hasAttribute("data-rise"); });
        e.target.style.transitionDelay = (Math.max(0, sibs.indexOf(e.target)) * 70) + "ms";
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    rises.forEach(function (el) { io.observe(el); });
  }

  /* --- Счётчики цифр -------------------------------------------------------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, to = +el.getAttribute("data-count");
        if (reduce) { el.textContent = to; return; }
        var t0 = null;
        function tick(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / 1100);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* --- Мини-сцена (графики на внутренних страницах) ------------------------- */
  var scenes = document.querySelectorAll(".mini-scene");
  if (scenes.length) {
    if (reduce) {
      scenes.forEach(function (s) { s.classList.add("in"); });
    } else {
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          sio.unobserve(e.target);
        });
      }, { threshold: 0.3 });
      scenes.forEach(function (s) { sio.observe(s); });
    }
  }

  /* --- Табы услуг ----------------------------------------------------------- */
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var tabs = group.querySelectorAll(".tab");
    var panels = group.querySelectorAll(".panel");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var i = +tab.getAttribute("data-tab");
        tabs.forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        panels.forEach(function (p) { p.classList.remove("active"); });
        if (panels[i]) panels[i].classList.add("active");
      });
    });
  });

  /* --- FAQ-аккордеон -------------------------------------------------------- */
  document.querySelectorAll(".faq__q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".faq__item");
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq__item.open").forEach(function (el) {
        el.classList.remove("open");
      });
      if (!isOpen) item.classList.add("open");
    });
  });

  /* --- Фильтр карточек (кейсы по отрасли) ----------------------------------- */
  document.querySelectorAll(".filter-bar").forEach(function (bar) {
    var buttons = bar.querySelectorAll("button");
    var items = document.querySelectorAll(bar.getAttribute("data-target"));
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var f = btn.getAttribute("data-filter");
        items.forEach(function (it) {
          var tags = (it.getAttribute("data-tags") || "").split(" ");
          it.style.display = (f === "all" || tags.indexOf(f) !== -1) ? "" : "none";
        });
      });
    });
  });

  /* --- Демо-обработка форм -------------------------------------------------- */
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = form.querySelector(".form-ok");
      if (ok) ok.textContent = "Заявка отправлена (демо). При внедрении форма уйдёт в CRM.";
      form.reset();
    });
  });

  /* ==========================================================================
     СЦЕНА ГЛАВНОЙ: хаос заявок → воронка amoCRM
     ========================================================================== */
  var story = document.getElementById("story");
  if (!story || reduce) return;
  story.classList.add("js-scene"); // включает анимационные состояния в CSS

  var field = document.getElementById("storyField");
  var cards = [].slice.call(field.querySelectorAll(".fcard"));
  var funnelSvg = document.getElementById("funnel");
  var funnelPath = document.getElementById("funnelPath");
  var hChaos = story.querySelector(".h-chaos");
  var hOrder = story.querySelector(".h-order");
  var sub = story.querySelector(".story-sub");
  var outcome = document.getElementById("storyOutcome");
  var hint = story.querySelector(".story-scroll-hint");

  // Стартовый разброс (хаос) и финальная колонка внутри воронки, в % от поля
  var starts = [
    { x: -38, y: -30, r: -14 }, { x: 34, y: -36, r: 10 }, { x: -42, y: 14, r: 8 },
    { x: 40, y: 8, r: -9 }, { x: -16, y: 38, r: 13 }, { x: 20, y: 40, r: -11 }
  ];
  var ends = [
    { x: 0, y: -30, r: 0 }, { x: 0, y: -23, r: 0 }, { x: 0, y: -16, r: 0 },
    { x: 0, y: -9, r: 0 }, { x: 0, y: -2, r: 0 }, { x: 0, y: 5, r: 0 }
  ];

  var pathLen;
  try { pathLen = funnelPath.getTotalLength(); } catch (e) { pathLen = 760; }
  funnelPath.style.strokeDasharray = pathLen;
  funnelPath.style.strokeDashoffset = pathLen;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  // Отрисовка кадра сцены по прогрессу p (0 — хаос, 1 — порядок)
  function render(p) {
    // 0–.62 — карточки съезжаются; .5–.72 — смена заголовка; >.66 — вывод и свечение
    var moveP = ease(clamp01(p / 0.62));
    var fw = field.getBoundingClientRect().width;
    var fh = field.getBoundingClientRect().height;

    cards.forEach(function (c, i) {
      var s = starts[i], en = ends[i];
      var x = lerp(s.x, en.x, moveP), y = lerp(s.y, en.y, moveP), r = lerp(s.r, en.r, moveP);
      var sc = lerp(1, 0.78, moveP);
      var px = x / 100 * fw, py = y / 100 * fh;
      c.style.transform = "translate(calc(-50% + " + px + "px), calc(-50% + " + py + "px)) rotate(" + r + "deg) scale(" + sc + ")";
      c.style.opacity = String(lerp(0.55, 1, moveP));
      c.style.zIndex = 10 - i;
    });

    funnelPath.style.strokeDashoffset = String(pathLen * (1 - clamp01(p / 0.68)));

    var textP = clamp01((p - 0.5) / 0.22);
    hChaos.style.opacity = String(1 - textP);
    hChaos.style.transform = "translateY(" + (-textP * 14) + "px)";
    hOrder.style.opacity = String(textP);
    hOrder.style.transform = "translateY(" + ((1 - textP) * 14) + "px)";
    if (sub) {
      sub.style.opacity = String(1 - textP);
      // схлопываем высоту, чтобы после исчезновения не оставалось пустоты
      sub.classList.toggle("is-collapsed", textP > 0.8);
    }

    if (p > 0.66) {
      outcome.classList.add("show");
      funnelSvg.classList.add("lit");
    } else {
      outcome.classList.remove("show");
      funnelSvg.classList.remove("lit");
    }
    if (hint) hint.style.opacity = p > 0.06 ? "0" : "1";
  }

  var MOBILE = window.matchMedia("(max-width:720px)");

  /* --- Мобильный: сцена проигрывается сама, без залипания на скролле ------- */
  var played = false;
  function playScene() {
    if (played) return;
    played = true;
    var t0 = null, dur = 2400;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      render(p);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* --- Десктоп: прогресс привязан к скроллу -------------------------------- */
  var raf = null;
  function update() {
    raf = null;
    var rect = story.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    render(clamp01(-rect.top / Math.max(1, total)));
  }
  function onScroll() { if (!raf) raf = requestAnimationFrame(update); }

  var sceneObserver = null;
  function setMode() {
    window.removeEventListener("scroll", onScroll);
    if (sceneObserver) { sceneObserver.disconnect(); sceneObserver = null; }

    if (MOBILE.matches) {
      render(0);
      sceneObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) playScene(); });
      }, { threshold: 0.3 });
      sceneObserver.observe(story);
    } else {
      played = false;
      window.addEventListener("scroll", onScroll, { passive: true });
      update();
    }
  }

  setMode();
  window.addEventListener("resize", function () {
    if (!MOBILE.matches && !raf) raf = requestAnimationFrame(update);
  });
  if (MOBILE.addEventListener) MOBILE.addEventListener("change", setMode);
  else if (MOBILE.addListener) MOBILE.addListener(setMode);
})();
