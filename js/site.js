/* ==========================================================================
   SITE — shared behaviour, loaded on every page.
   Requires: js/config.js

   Contents
     1. Helpers                6. Contract address
     2. Toast                  7. Social links
     3. Ambient bubbles        8. FAQ accordion
     4. Navigation             9. Drunk mode
     5. Scroll reveals        10. Misc + public API
   ========================================================================== */

(function () {
  "use strict";

  var CONFIG = window.DRUNK_CONFIG || {};

  /* ========================================================================
     1. Helpers
     ======================================================================== */
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  /* localStorage is unavailable on some file:// origins — never let it throw */
  var store = {
    get: function (key) {
      try { return window.localStorage.getItem(key); } catch (e) { return null; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(key, value); } catch (e) { /* no-op */ }
    }
  };

  /* ========================================================================
     2. Toast
     ======================================================================== */
  var toastEl = $("#toast");
  var toastTimer = null;

  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2400);
  }

  /* ========================================================================
     3. Ambient bubbles
     ======================================================================== */
  (function initBubbles() {
    var wrap = $("#bubbles");
    if (!wrap) return;

    for (var i = 0; i < 26; i++) {
      var bubble = document.createElement("span");
      bubble.className = "bubble";
      bubble.style.setProperty("--bubble-left",     (Math.random() * 100).toFixed(1) + "%");
      bubble.style.setProperty("--bubble-size",     (6 + Math.random() * 16).toFixed(0) + "px");
      bubble.style.setProperty("--bubble-duration", (10 + Math.random() * 14).toFixed(1) + "s");
      bubble.style.setProperty("--bubble-delay",    (-Math.random() * 20).toFixed(1) + "s");
      bubble.style.setProperty("--bubble-drift",    ((Math.random() * 140) - 70).toFixed(0) + "px");
      wrap.appendChild(bubble);
    }
  })();

  /* ========================================================================
     4. Navigation
     ======================================================================== */
  var navEl = $("#site-nav");
  var menu = $("#mobile-menu");
  var menuOpenBtn = $("[data-menu-open]");

  function onScroll() {
    if (navEl) navEl.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function openMenu() {
    if (!menu) return;
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    if (menuOpenBtn) menuOpenBtn.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    if (menuOpenBtn) menuOpenBtn.setAttribute("aria-expanded", "false");
  }

  if (menuOpenBtn) menuOpenBtn.addEventListener("click", openMenu);
  $$("[data-menu-close]").forEach(function (btn) {
    btn.addEventListener("click", closeMenu);
  });

  /* Any link inside the overlay closes it before navigating */
  if (menu) {
    $$("a", menu).forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  /* Mark the current page for assistive tech (the visual state is pure CSS,
     driven by body[data-page] — see css/nav.css) */
  (function markCurrentPage() {
    var page = document.body.getAttribute("data-page");
    if (!page) return;
    $$('[data-nav="' + page + '"]').forEach(function (link) {
      link.setAttribute("aria-current", "page");
    });
  })();

  /* ========================================================================
     5. Scroll reveals, counters and pour bars
     ======================================================================== */
  var counted = [];

  function runCounter(el) {
    if (counted.indexOf(el) !== -1) return;
    counted.push(el);

    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1300;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function activate(el) {
    el.classList.add("is-visible");
    $$("[data-count]", el).forEach(runCounter);
    if (el.hasAttribute("data-count")) runCounter(el);
    $$("[data-width]", el).forEach(function (fill) {
      fill.style.width = fill.getAttribute("data-width") + "%";
    });
  }

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        activate(entry.target);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    $$(".reveal").forEach(function (el) { revealObserver.observe(el); });
  } else {
    $$(".reveal").forEach(activate);
  }

  /* ========================================================================
     6. Contract address
     ======================================================================== */
  var contractValue = (CONFIG.contract || "").trim();
  var contractLabel = contractValue || CONFIG.contractPlaceholder || "TBA";

  $$("[data-contract]").forEach(function (el) {
    el.textContent = contractLabel;
  });

  function copyContract() {
    if (!contractValue) {
      toast("Not live yet 🔜 watch the official channels");
      return;
    }

    function done() {
      toast("Copied! 🍻 See you at the bar.");
    }

    function fallback() {
      var field = document.createElement("textarea");
      field.value = contractValue;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand("copy");
        done();
      } catch (err) {
        toast("Couldn't copy — long-press the address instead.");
      }
      document.body.removeChild(field);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(contractValue).then(done, fallback);
    } else {
      fallback();
    }
  }

  $$("[data-copy-contract]").forEach(function (btn) {
    btn.addEventListener("click", copyContract);
  });

  /* ========================================================================
     7. Social links
     Filled in from config; anything still empty becomes a "coming soon" link.
     ======================================================================== */
  var socials = CONFIG.socials || {};

  $$("[data-social]").forEach(function (link) {
    var url = (socials[link.getAttribute("data-social")] || "").trim();
    if (!url) {
      link.setAttribute("data-soon", "");
      return;
    }
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.removeAttribute("data-soon");
  });

  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest("[data-soon]") : null;
    if (!link) return;
    event.preventDefault();
    toast("Link coming soon — we're still finding the keys 🔑");
  });

  /* ========================================================================
     8. FAQ accordion
     ======================================================================== */
  var faqItems = $$(".faq__item");

  faqItems.forEach(function (item) {
    var question = $(".faq__question", item);
    var answer = $(".faq__answer", item);
    if (!question || !answer) return;

    question.setAttribute("aria-expanded", "false");

    question.addEventListener("click", function () {
      var open = item.classList.toggle("is-open");
      question.setAttribute("aria-expanded", open ? "true" : "false");
      answer.style.maxHeight = open ? answer.scrollHeight + "px" : "0px";
    });
  });

  /* Keep open answers the right height when the text reflows */
  window.addEventListener("resize", function () {
    faqItems.forEach(function (item) {
      if (!item.classList.contains("is-open")) return;
      var answer = $(".faq__answer", item);
      if (answer) answer.style.maxHeight = answer.scrollHeight + "px";
    });
  });

  /* ========================================================================
     9. Drunk mode — remembered across pages
     ======================================================================== */
  var drunkToggles = $$("[data-drunk-toggle]");
  var isDrunk = store.get("drunk-mode") === "on";

  function renderDrunk() {
    document.body.classList.toggle("is-drunk", isDrunk);
    drunkToggles.forEach(function (btn) {
      btn.classList.toggle("is-on", isDrunk);
      btn.setAttribute("aria-pressed", isDrunk ? "true" : "false");
      btn.textContent = isDrunk ? "💧 Sober Up" : "🍺 Drunk Mode";
    });
  }

  drunkToggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      isDrunk = !isDrunk;
      store.set("drunk-mode", isDrunk ? "on" : "off");
      renderDrunk();
      toast(isDrunk
        ? "Beer goggles ON 🥴 everything's swaying"
        : "Sobering up… drink some water 💧");
    });
  });

  renderDrunk();

  /* ========================================================================
     10. Misc + public API
     ======================================================================== */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* gallery.js reuses the toast and the helpers */
  window.DrunkSite = {
    $: $,
    $$: $$,
    toast: toast
  };
})();
