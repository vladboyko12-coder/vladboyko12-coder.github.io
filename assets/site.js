/* ==========================================================================
   In-CRM — общий скрипт сайта
   Бургер-меню, FAQ-аккордеон, демо-обработка форм (без бэкенда).
   ========================================================================== */
(function () {
  "use strict";

  // --- Бургер-меню (мобильная навигация) ---
  var burger = document.getElementById("burger");
  var nav = document.getElementById("navLinks");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Закрываем меню после клика по пункту
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  // --- FAQ-аккордеон ---
  document.querySelectorAll(".faq__q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".faq__item");
      var isOpen = item.classList.contains("open");
      // Закрываем все, открываем выбранный (гармошка)
      document.querySelectorAll(".faq__item.open").forEach(function (el) {
        el.classList.remove("open");
      });
      if (!isOpen) item.classList.add("open");
    });
  });

  // --- Фильтр карточек (например, кейсы по отрасли) ---
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

  // --- Демо-обработка форм (реального сабмита нет) ---
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = form.querySelector(".form-ok");
      if (ok) ok.textContent = "Заявка отправлена (демо). При внедрении форма уйдёт в CRM.";
      form.reset();
    });
  });
})();
