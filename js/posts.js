/* ==========================================================================
   LATEST ON X — the feed block on party.html.
   Requires: js/config.js. party.html only.

   Two ways to fill it, picked by DRUNK_CONFIG.postsMode:

     "live"    X's own timeline widget. It updates itself — post something and
               the site shows it, with nothing to edit here. The markup and
               the styling inside that frame belong to X, not to this site.
     "manual"  The hand-kept DRUNK_CONFIG.posts list, rendered as our own
               cards. Nothing external loads.
     "auto"    Live, with the manual list (or the plain feed card) taking over
               if the widget never renders — blocked script, no network, a
               protected or renamed account. This is what ships.

   The widget is the only free way to pull the posts in automatically: X's API
   needs a paid tier and a secret, and a secret can't live in a static site.
   What it costs is one third-party script and X's own look inside the frame.
   It is loaded with dnt=true, and only once the block is near the viewport.

   Hooks: [data-posts-root] wraps the block, [data-posts-embed] receives the
   widget, [data-posts-grid] the manual cards, [data-posts-empty] the "nothing
   posted yet" card, [data-posts-loading] the line shown while X answers.
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

  var embed   = root.querySelector("[data-posts-embed]");
  var grid    = root.querySelector("[data-posts-grid]");
  var empty   = root.querySelector("[data-posts-empty]");
  var loading = root.querySelector("[data-posts-loading]");

  var mode = String(CONFIG.postsMode || "auto").toLowerCase();

  /* X serves the widget script from here and nowhere else */
  var WIDGET_SRC = "https://platform.twitter.com/widgets.js";

  /* How long to wait for the timeline before falling back — long enough for a
     phone on a bad connection, short enough that nobody stares at a blank box */
  var WIDGET_TIMEOUT = 8000;

  /* ----------------------------------------------------------- handle --- */
  /* "https://x.com/_DrunkCoin_?s=11" -> "_DrunkCoin_". The query string and a
     trailing slash both come along whenever a link is copied out of the app. */
  function handle() {
    var name = feed.split("?")[0].split("#")[0].replace(/\/+$/, "").split("/").pop();
    return /^[A-Za-z0-9_]{1,15}$/.test(name) ? name : "";
  }

  var user   = handle();
  var author = user ? "@" + user : "$DRUNK";

  /* ========================================================================
     Manual cards — also the fallback under the live mode
     ======================================================================== */
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

  function showFallback() {
    if (loading) loading.hidden = true;
    if (embed)   embed.hidden = true;

    if (!posts.length || !grid) {
      if (empty) empty.hidden = false;
      return;
    }

    posts.forEach(function (post, index) {
      grid.appendChild(card(post, index));
    });

    grid.hidden = false;

    /* js/site.js collected its .reveal elements before these cards existed,
       so it will never show them — run the same reveal for our own. */
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
  }

  /* ========================================================================
     Live timeline
     ======================================================================== */
  function mountWidget() {
    var settled = false;

    function fail() {
      if (settled) return;
      settled = true;
      showFallback();
    }

    function done() {
      if (settled) return;
      settled = true;
      if (loading) loading.hidden = true;
      embed.classList.add("is-visible");
    }

    /* The anchor is what widgets.js looks for: it swaps itself for an iframe.
       Until then — and forever, if the script never arrives — it stays a plain
       link to the feed, which is the honest thing to leave behind. */
    var anchor = document.createElement("a");
    anchor.className = "twitter-timeline";
    anchor.href = "https://twitter.com/" + user;
    anchor.setAttribute("data-theme", "dark");
    anchor.setAttribute("data-chrome", "noheader nofooter noborders transparent");
    anchor.setAttribute("data-tweet-limit", "3");
    anchor.setAttribute("data-dnt", "true");
    anchor.textContent = "Posts by " + author;

    embed.appendChild(anchor);
    embed.hidden = false;
    if (loading) loading.hidden = false;

    /* An iframe in the box is the one signal that means the timeline actually
       rendered — the script loading is not the same thing as X answering. The
       timer catches everything else: blocked script, protected account, a
       handle that no longer exists. */
    var poll = setInterval(function () {
      if (!embed.querySelector("iframe")) return;
      clearInterval(poll);
      done();
    }, 250);

    setTimeout(function () {
      clearInterval(poll);
      if (!embed.querySelector("iframe")) fail();
    }, WIDGET_TIMEOUT);

    var script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;
    script.charset = "utf-8";
    script.onerror = function () {
      clearInterval(poll);
      fail();
    };
    document.head.appendChild(script);
  }

  /* Only reach for X's script once the block is coming up — it sits well below
     the fold, and a visitor who never scrolls there shouldn't pay for it. */
  function whenNear(el, run) {
    if (!("IntersectionObserver" in window)) return run();

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        run();
      });
    }, { rootMargin: "600px 0px" });

    observer.observe(el);
  }

  /* ========================================================================
     Go
     ======================================================================== */
  var wantsLive = (mode === "live" || mode === "auto") && user && embed;

  if (!wantsLive) {
    showFallback();
    return;
  }

  /* "live" means live: if the widget doesn't render, fall back to the feed
     card rather than quietly serving a list somebody wrote weeks ago. */
  if (mode === "live") {
    posts = [];
  }

  whenNear(root, mountWidget);
})();
