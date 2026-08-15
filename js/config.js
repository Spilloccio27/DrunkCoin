/* ==========================================================================
   SITE CONFIG — the only file you need to touch at launch.
   Loaded before every other script on every page.
   ========================================================================== */

window.DRUNK_CONFIG = {

  /* The SPL mint address. Nothing on the site prints it yet — this is a
     pre-launch site and there is no address to print — but the plumbing in
     js/site.js is still live, so any element you give a `data-contract`
     attribute fills itself in from here the moment you paste one in. */
  contract: "",
  contractPlaceholder: "TBA — sober up, it's coming 🔜",

  /* --- Launch countdown --------------------------------------------------
     Date and time the doors open, as an ISO 8601 string. The trailing "Z"
     means UTC — keep it. The site prints the launch moment in UTC for
     everybody, so "16:20Z" reads as 4:20 PM wherever the visitor is, which
     is rather the point.

     Empty or invalid -> every countdown block hides itself.
     In the past      -> the blocks switch to the "we're live" message.

     See js/countdown.js. */
  launchDate: "2026-08-29T16:20:00Z",

  /* Official channels. Empty links stay disabled and show a "coming soon"
     toast instead of navigating anywhere. */
  socials: {
    x:        "https://x.com/_DrunkCoin_",
    telegram: "https://t.me/+Gq7VfXcdVPEwMTUy"
  }
};
