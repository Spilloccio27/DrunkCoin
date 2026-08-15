/* ==========================================================================
   MEME VAULT — grid rendering, filtering and lightbox.
   Requires: js/site.js (for DrunkSite.toast) and js/gallery-data.js.
   gallery.html only.

   Contents
     1. Setup            4. Lightbox
     2. Rendering        5. Clipboard
     3. Filtering        6. Wiring
   ========================================================================== */

(function () {
  "use strict";

  /* ========================================================================
     1. Setup
     ======================================================================== */
  var MEMES = window.DRUNK_MEMES || [];
  var site  = window.DrunkSite || {};
  var toast = site.toast || function () {};

  var grid       = document.getElementById("meme-grid");
  var filterBar  = document.getElementById("meme-filters");
  var emptyEl    = document.getElementById("meme-empty");
  var lightbox   = document.getElementById("lightbox");
  if (!grid || !lightbox) return;

  var lbImg      = document.getElementById("lightbox-img");
  var lbTitle    = document.getElementById("lightbox-title");
  var lbCaption  = document.getElementById("lightbox-caption");
  var lbCounter  = document.getElementById("lightbox-counter");
  var lbDownload = document.getElementById("lightbox-download");
  var lbCopy     = document.getElementById("lightbox-copy");

  var FILTERS = [
    { id: "all",   label: "Everything" },
    { id: "brand", label: "Brand"      },
    { id: "party", label: "The Party"  },
    { id: "chart", label: "Chart Life" },
    { id: "degen", label: "Pure Degen" }
  ];

  /* The list currently on screen — the lightbox pages through this, not the
     full catalogue, so prev/next respect the active filter. Because the order
     below is also the order the browser lays out, visual order and lightbox
     order always agree. */
  var visible = MEMES.slice();
  var current = 0;
  var lastFocused = null;
  var activeFilter = "all";

  function full(meme)  { return "assets/gallery/" + meme.slug + ".jpg"; }
  function thumb(meme) { return "assets/gallery/thumbs/" + meme.slug + ".jpg"; }

  /* ========================================================================
     2. Packing
     A 16:9 meme takes two columns. Left in catalogue order it eventually
     lands with only one column free, gets bumped to the next row, and leaves
     a hole behind it. So before rendering we walk the list and, whenever the
     next item is too wide for what's left of the row, pull forward the first
     one that does fit. Nothing is dropped — only the order shifts, and it
     shifts in the DOM, so the lightbox still pages in the order you see.
     ======================================================================== */
  function columns() {
    if (window.matchMedia("(max-width: 620px)").matches)  return 1;
    if (window.matchMedia("(max-width: 1000px)").matches) return 2;
    return 3;
  }

  function pack(list, cols) {
    if (cols < 2) return list.slice();      /* one per row — nothing to pack */

    var pool = list.slice();
    var out  = [];
    var used = 0;                           /* columns filled in this row */

    while (pool.length) {
      var pick = -1;

      for (var i = 0; i < pool.length; i++) {
        if (used + (pool[i].wide ? 2 : 1) <= cols) { pick = i; break; }
      }

      /* Nothing left fits the tail of this row — close it and carry on */
      if (pick === -1) { used = 0; continue; }

      var meme = pool.splice(pick, 1)[0];
      out.push(meme);
      used += meme.wide ? 2 : 1;
      if (used >= cols) used = 0;
    }

    return out;
  }

  /* Filter, pack, draw. Everything that changes the grid goes through here. */
  function apply() {
    var list = MEMES.filter(function (m) { return matches(m, activeFilter); });
    render(pack(list, columns()));
  }

  /* ========================================================================
     3. Rendering
     ======================================================================== */
  function render(list) {
    visible = list;
    grid.textContent = "";

    list.forEach(function (meme, index) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "meme" + (meme.wide ? " meme--wide" : "");
      card.setAttribute("aria-label", "Open " + meme.title);
      card.addEventListener("click", function () { open(index); });

      var frame = document.createElement("div");
      frame.className = "meme__frame";

      var img = document.createElement("img");
      img.className = "meme__img";
      img.src = thumb(meme);
      img.alt = meme.alt;
      img.loading = "lazy";
      img.decoding = "async";
      /* Declared so the browser reserves the right box before the file lands */
      img.width  = 560;
      img.height = meme.wide ? 315 : 560;
      frame.appendChild(img);

      var bar = document.createElement("div");
      bar.className = "meme__bar";

      var title = document.createElement("span");
      title.className = "meme__title";
      title.textContent = meme.title;

      var hint = document.createElement("span");
      hint.className = "meme__hint";
      hint.textContent = "open ↗";

      bar.appendChild(title);
      bar.appendChild(hint);

      card.appendChild(frame);
      card.appendChild(bar);
      grid.appendChild(card);
    });

    if (emptyEl) emptyEl.hidden = list.length > 0;
  }

  /* ========================================================================
     4. Filtering
     ======================================================================== */
  function matches(meme, id) {
    return id === "all" || (meme.tags || []).indexOf(id) !== -1;
  }

  function buildFilters() {
    if (!filterBar) return;

    FILTERS.forEach(function (filter, i) {
      var count = MEMES.filter(function (m) { return matches(m, filter.id); }).length;
      if (!count) return;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter" + (i === 0 ? " is-active" : "");
      btn.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      btn.innerHTML = filter.label + ' <span class="filter__count">' + count + "</span>";

      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(filterBar.children, function (other) {
          other.classList.remove("is-active");
          other.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        activeFilter = filter.id;
        apply();
      });

      filterBar.appendChild(btn);
    });
  }

  /* ========================================================================
     5. Lightbox
     ======================================================================== */
  function show(index) {
    var meme = visible[index];
    if (!meme) return;

    current = index;
    lbImg.src = full(meme);
    lbImg.alt = meme.alt;
    lbTitle.textContent = meme.title;
    lbCaption.textContent = meme.caption;
    lbCounter.textContent = (index + 1) + " / " + visible.length;
    lbDownload.href = full(meme);
    lbDownload.setAttribute("download", "drunkcoin-" + meme.slug + ".jpg");
  }

  function open(index) {
    lastFocused = document.activeElement;
    show(index);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var closeBtn = lightbox.querySelector(".lightbox__close");
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function step(delta) {
    if (!visible.length) return;
    show((current + delta + visible.length) % visible.length);
  }

  /* ========================================================================
     6. Clipboard
     ======================================================================== */
  function copyText(text) {
    function done() { toast("Caption copied 📋 go make it someone's problem"); }

    function fallback() {
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand("copy");
        done();
      } catch (err) {
        toast("Couldn't copy — select the text instead.");
      }
      document.body.removeChild(field);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }

  /* ========================================================================
     7. Wiring
     ======================================================================== */
  buildFilters();
  apply();

  /* The packing depends on the column count, so it has to be redone when the
     grid changes shape. If the lightbox happens to be open, re-find the meme
     being viewed by slug — its index will have moved. */
  ["(max-width: 620px)", "(max-width: 1000px)"].forEach(function (query) {
    var mql = window.matchMedia(query);
    var onChange = function () {
      var viewing = visible[current];
      apply();

      if (!viewing) return;
      for (var i = 0; i < visible.length; i++) {
        if (visible[i].slug === viewing.slug) { current = i; break; }
      }
      if (lightbox.classList.contains("is-open")) show(current);
    };

    /* Safari < 14 only has the deprecated listener API */
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else if (mql.addListener)  mql.addListener(onChange);
  });

  lightbox.querySelector(".lightbox__close").addEventListener("click", close);
  lightbox.querySelector(".lightbox__nav--prev").addEventListener("click", function () { step(-1); });
  lightbox.querySelector(".lightbox__nav--next").addEventListener("click", function () { step(1); });

  /* Click the backdrop — but not the panel — to dismiss */
  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) close();
  });

  lbCopy.addEventListener("click", function () {
    var meme = visible[current];
    if (meme) copyText(meme.caption);
  });

  lbDownload.addEventListener("click", function () {
    toast("Saving… post it, tag us, deny everything 🍻");
  });

  document.addEventListener("keydown", function (event) {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape")     { close(); }
    if (event.key === "ArrowLeft")  { step(-1); }
    if (event.key === "ArrowRight") { step(1); }
  });
})();
