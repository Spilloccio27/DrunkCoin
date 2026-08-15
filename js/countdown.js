/* ==========================================================================
   LAUNCH COUNTDOWN — ticks down to DRUNK_CONFIG.launchDate.
   Requires: js/config.js. Loaded on every page that has a countdown block.

   How it works
     Every block on the page carries [data-countdown-root] and holds four
     [data-countdown="days|hours|minutes|seconds"] slots. This drives all of
     them from a single timer, so two blocks on one page can never drift.

   States
     - No date, or an unparseable one -> every block hides itself
     - Date in the future             -> the clock ticks, once per second
     - Date reached                   -> the clock is replaced by the
                                         "doors are open" message inside
                                         [data-countdown-live], and the timer
                                         stops for good

   The clock is aria-hidden and mirrored into a polite live region that only
   announces whole hours — a screen reader reading four numbers every second
   is unusable.
   ========================================================================== */

(function () {
  "use strict";

  var CONFIG = window.DRUNK_CONFIG || {};

  var roots = Array.prototype.slice.call(
    document.querySelectorAll("[data-countdown-root]")
  );
  if (!roots.length) return;

  /* ------------------------------------------------------------- target --- */
  var target = Date.parse(String(CONFIG.launchDate || "").trim());

  if (isNaN(target)) {
    roots.forEach(function (root) { root.hidden = true; });
    return;
  }

  /* ---------------------------------------------------------- the blocks --- */
  var blocks = roots.map(function (root) {
    return {
      root:    root,
      clock:   root.querySelector("[data-countdown-clock]"),
      live:    root.querySelector("[data-countdown-live]"),
      status:  root.querySelector("[data-countdown-status]"),
      date:    root.querySelector("[data-countdown-date]"),
      slots:   {
        days:    root.querySelector('[data-countdown="days"]'),
        hours:   root.querySelector('[data-countdown="hours"]'),
        minutes: root.querySelector('[data-countdown="minutes"]'),
        seconds: root.querySelector('[data-countdown="seconds"]')
      }
    };
  });

  /* Print the launch moment in UTC, in English, for everyone.
     Two reasons not to use the visitor's locale here: the site is English-only
     and would otherwise render this one line in whatever language the browser
     is set to, and 16:20 UTC is only 4:20 in UTC — translate it into local
     time and the joke lands nowhere. */
  var stamp = new Date(target);
  var printed;
  try {
    printed = stamp.toLocaleString("en-GB", {
      timeZone: "UTC",
      weekday: "long", day: "numeric", month: "long", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true
    }) + " UTC";
  } catch (e) {
    printed = stamp.toUTCString();
  }

  blocks.forEach(function (block) {
    if (block.date) block.date.textContent = "Doors open " + printed;
  });

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  /* --------------------------------------------------------------- live --- */
  var launched = false;

  function goLive() {
    if (launched) return;
    launched = true;

    blocks.forEach(function (block) {
      if (block.clock) block.clock.hidden = true;
      if (block.live)  block.live.hidden = false;
      if (block.status) block.status.textContent = "$DRUNK is live. The bar is open.";
      if (block.date)  block.date.hidden = true;
    });
  }

  /* --------------------------------------------------------------- tick --- */
  var lastAnnouncedHour = null;

  function tick() {
    var remaining = target - Date.now();

    if (remaining <= 0) {
      goLive();
      return false;
    }

    var totalSeconds = Math.floor(remaining / 1000);
    var days    = Math.floor(totalSeconds / 86400);
    var hours   = Math.floor(totalSeconds % 86400 / 3600);
    var minutes = Math.floor(totalSeconds % 3600 / 60);
    var seconds = totalSeconds % 60;

    blocks.forEach(function (block) {
      if (block.slots.days)    block.slots.days.textContent    = pad(days);
      if (block.slots.hours)   block.slots.hours.textContent   = pad(hours);
      if (block.slots.minutes) block.slots.minutes.textContent = pad(minutes);
      if (block.slots.seconds) block.slots.seconds.textContent = pad(seconds);
    });

    /* Announce at most once an hour — see the note at the top */
    var totalHours = Math.floor(totalSeconds / 3600);
    if (totalHours !== lastAnnouncedHour) {
      lastAnnouncedHour = totalHours;
      blocks.forEach(function (block) {
        if (!block.status) return;
        block.status.textContent = days > 0
          ? days + " days and " + hours + " hours until $DRUNK launches"
          : hours + " hours and " + minutes + " minutes until $DRUNK launches";
      });
    }

    return true;
  }

  if (!tick()) return;                  /* already past the date — nothing to run */

  var timer = setInterval(function () {
    if (!tick()) clearInterval(timer);
  }, 1000);

  /* A background tab throttles the interval, so the clock can be minutes
     stale by the time you look at it again. Catch up on the way back in. */
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && !launched) tick();
  });
})();
