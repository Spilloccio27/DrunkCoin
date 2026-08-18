/* ==========================================================================
   LATEST ON X — renders DRUNK_CONFIG.posts as links to the posts themselves.
   Requires: js/config.js. party.html only.

   How it works
     The block carries [data-posts-root] and holds a [data-posts-grid] for the
     cards and a [data-posts-empty] card for the "nothing posted yet" case.
     Every card is a plain <a> to the post on X — nothing is fetched, no
     widget script is loaded, and the site keeps working offline.

   States
     - No X link in config.socials and no posts -> the block hides itself
     - Posts listed  -> one card per post, plus the "read every post" link
     - List empty    -> the grid stays hidden and the single fallback card
                        points at the account's feed

   Entries without a url are dropped: a post card that goes nowhere is worse
   than one card fewer.
   ========================================================================== */

(function () {
  "use strict";

  var CONFIG = window.DRUNK_CONFIG || {};

  var root = document.querySelector("[data-posts-root]");
  if (!root) return;

  var feed  = String((CONFIG.socials || {}).x || "").trim();
  var posts = (CONFIG.posts || []).filter(function (post) {
    return post && String(post.url || "").trim();
  });

  /* Nowhere to send anybody — don't print a headline over an empty box */
  if (!feed && !posts.length) {
    root.hidden = true;
    return;
  }

  var grid  = root.querySelector("[data-posts-grid]");
  var empty = root.querySelector("[data-posts-empty]");

  /* ----------------------------------------------------------- handle --- */
  /* "https://x.com/_DrunkCoin_" -> "@_DrunkCoin_". Anything that isn't a
     plain profile URL falls back to the token name. */
  function handle() {
    var name = feed.split("?")[0].replace(/\/+$/, "").split("/").pop();
    return /^[A-Za-z0-9_]{1,15}$/.test(name) ? "@" + name : "$DRUNK";
  }

  var author = handle();

  /* --------------------------------------------------------- one card --- */
  function card(post, index) {
    var link = document.createElement("a");
    link.className = "card card--post reveal";
    link.style.setProperty("--delay", (index * 0.08).toFixed(2) + "s");
    link.href = String(post.url).trim();
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    var head = document.createElement("div");
    head.className = "post__head";

    var icon = document.createElement("span");
    icon.className = "post__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "🐦";

    var who = document.createElement("span");
    who.className = "post__author";
    who.textContent = author;

    head.appendChild(icon);
    head.appendChild(who);

    if (post.pinned) {
      var chip = document.createElement("span");
      chip.className = "chip chip--soon post__pin";
      chip.textContent = "📌 pinned";
      head.appendChild(chip);
    }

    var quote = document.createElement("blockquote");
    quote.className = "post__text";
    quote.textContent = String(post.text || "").trim() || "Read it on X ↗";

    var meta = document.createElement("div");
    meta.className = "post__meta";

    var date = document.createElement("span");
    date.className = "post__date";
    date.textContent = String(post.date || "").trim();

    var open = document.createElement("span");
    open.className = "post__open";
    open.textContent = "open on X ↗";

    meta.appendChild(date);
    meta.appendChild(open);

    link.appendChild(head);
    link.appendChild(quote);
    link.appendChild(meta);
    return link;
  }

  /* ---------------------------------------------------------- render --- */
  if (!posts.length) {
    if (empty) empty.hidden = false;
    return;
  }

  if (!grid) return;

  posts.forEach(function (post, index) {
    grid.appendChild(card(post, index));
  });

  grid.hidden = false;

  /* js/site.js collected its .reveal elements before these cards existed, so
     it will never show them — this block runs the same reveal for its own. */
  var cards = Array.prototype.slice.call(grid.children);

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    cards.forEach(function (el) { observer.observe(el); });
  } else {
    cards.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
