/* ==========================================================================
   MEME VAULT — the image catalogue.
   Loaded before js/gallery.js on gallery.html only.

   To add a meme:
     1. Drop the web version in  assets/gallery/<slug>.jpg   (max 1200px)
        and the thumbnail in     assets/gallery/thumbs/<slug>.jpg (max 560px)
     2. Add an entry below. Nothing else to touch.

   Fields
     slug    file name without extension, in both folders
     title   shown under the thumbnail and in the lightbox
     alt     real image description — used by screen readers, keep it factual
     caption ready-to-paste social copy (the "Copy caption" button)
     tags    any of: party, chart, degen, brand   (drives the filter chips)
     wide    true for 16:9 art — spans two columns in the grid

   ORDER MATTERS. This is the "Everything" order, so it is deliberately
   shuffled rather than grouped: roughly every other item is a party scene,
   with the brand / chart / degen pieces rotating between them, and the six
   `wide` banners spaced about five apart. More than half the set is party
   shots, so grouping them — as this file used to — buries everything else
   below the fold. If you add memes, drop them into the rhythm rather than
   appending to the end.
   ========================================================================== */

window.DRUNK_MEMES = [

  {
    slug: "green-candles",
    title: "Green Candle Energy",
    alt: "The Drunk Coin mascot holding a beer in front of a wall of green candles.",
    caption: "Green candles hit different when you're already three deep. $DRUNK 🍻📈",
    tags: ["brand", "chart"]
  },
  {
    slug: "arena",
    title: "The Arena",
    alt: "A packed arena with $DRUNK tickers on every screen and lasers over the crowd.",
    caption: "Somewhere between a listing and a music festival. $DRUNK 🍻🪩",
    tags: ["party"]
  },
  {
    slug: "hodl-bar",
    title: "The HODL Bar",
    alt: "Nine people of different ages clinking Drunk Coin beer mugs under a 'The HODL Bar' sign.",
    caption: "Every round is a community round. Welcome to The HODL Bar. $DRUNK 🍻",
    tags: ["party"]
  },
  {
    slug: "pumping",
    title: "+420.69%",
    alt: "A man in a DEGEN shirt showing a phone with a $DRUNK chart up 420.69 percent.",
    caption: "+420.69%. I have no idea what I'm doing and it's working. $DRUNK 📈",
    tags: ["chart", "degen"]
  },
  {
    slug: "techno-riot",
    title: "Techno Riot",
    alt: "A wide shot of a graffiti-covered rave with $DRUNK screens and a dancing crowd.",
    caption: "Unity. Techno. Terrible decisions. In that order. $DRUNK 🔊",
    tags: ["party"],
    wide: true
  },
  {
    slug: "massive-bag",
    title: "Massive $DRUNK Bag",
    alt: "A cartoon strongman hoisting an enormous duffel bag stuffed with Drunk Coins.",
    caption: "Bag status: structurally concerning. $DRUNK 🍻",
    tags: ["brand", "degen"]
  },
  {
    slug: "laser-rave",
    title: "Laser Rave",
    alt: "Crowd in $DRUNK shirts holding glowing coins under green and pink lasers.",
    caption: "Holding $DRUNK in public is a personality trait now. 🪩",
    tags: ["party"]
  },
  {
    slug: "recovery-station",
    title: "Recovery Station",
    alt: "A club bathroom stall labelled 'post-party token recovery station' with a rough-looking degen.",
    caption: "Every good party needs a recovery station. $DRUNK 🚽",
    tags: ["degen"]
  },
  {
    slug: "beach-bonfire",
    title: "Beach Bonfire",
    alt: "A neon-lit beach party around a green bonfire with a Drunk Coin DJ booth.",
    caption: "Bear market? Never heard of her. Beach bar's open. $DRUNK 🏝️",
    tags: ["party"]
  },
  {
    slug: "group-chat",
    title: "The Group Chat",
    alt: "Four friends at a bar laughing at their phones with $DRUNK messages on screen.",
    caption: "The chart is temporary. The group chat is forever. $DRUNK 💬",
    tags: ["chart", "party"],
    wide: true
  },
  {
    slug: "dj-set",
    title: "The DJ Set",
    alt: "A DJ playing under giant Drunk Coin neon signs while the crowd raises beers.",
    caption: "The chart is the setlist. The community is the crowd. $DRUNK 🎧",
    tags: ["party"]
  },
  {
    slug: "wake-up-call",
    title: "4:20 Wake-Up Call",
    alt: "A hungover man in bed staring at a phone showing a $DRUNK notification at 4:20.",
    caption: "The notification that ruins and saves your morning. $DRUNK ⏰",
    tags: ["degen"]
  },
  {
    slug: "festival",
    title: "The Festival",
    alt: "A festival crowd under $DRUNK banners with a DJ booth at the centre.",
    caption: "Phase 3 of the Bar Map, probably. $DRUNK 🎉",
    tags: ["party"]
  },
  {
    slug: "high-voltage",
    title: "High Voltage",
    alt: "The Drunk Coin logo glowing over a warehouse crowd, flanked by 'danger, degen hazard' signs.",
    caption: "DANGER: MAXIMUM DEGEN. Approach the bar at your own risk. $DRUNK ⚡🍺",
    tags: ["brand", "party"]
  },
  {
    slug: "vip-warehouse",
    title: "VIP Warehouse",
    alt: "A luxury warehouse party with champagne towers and the Drunk Coin mascot on a plinth.",
    caption: "Luxury meets the street. Everyone drinks the same. $DRUNK 🥂",
    tags: ["party"]
  },
  {
    slug: "the-gospel",
    title: "The Gospel",
    alt: "An excited man preaching about $DRUNK to a very unconvinced warehouse worker.",
    caption: "Me explaining $DRUNK to someone who did not ask. 🍺",
    tags: ["degen"],
    wide: true
  },
  {
    slug: "warehouse-neon",
    title: "Warehouse Neon",
    alt: "Three neon Drunk Coin signs above a silhouetted dance floor in a graffiti warehouse.",
    caption: "No roadmap, no venue rental, just vibes. $DRUNK 🍻",
    tags: ["party"]
  },
  {
    slug: "dreaming-ath",
    title: "Dreaming of ATH",
    alt: "A man asleep on a pile of cash dreaming of a Drunk Coin chart at an all-time high.",
    caption: "Sleep schedule: destroyed. Dreams: bullish. $DRUNK 😴📈",
    tags: ["chart", "degen"]
  },
  {
    slug: "champagne-shower",
    title: "Champagne Shower",
    alt: "The Drunk Coin mascot getting sprayed with champagne by a cheering crowd.",
    caption: "We celebrate every candle. Even the red ones. $DRUNK 🍾",
    tags: ["party"]
  },
  {
    slug: "one-more",
    title: "One More, I Swear",
    alt: "A grinning man held up by a worried friend, waving a phone with the Drunk Coin logo.",
    caption: "Everyone needs that one friend who knows when to call it. $DRUNK 🤝",
    tags: ["degen"]
  },
  {
    slug: "hodlers-ball",
    title: "The HODLers' Ball",
    alt: "A black-tie mansion party with champagne, balloons and two Drunk Coin mascots.",
    caption: "Dress code: whatever you passed out in. $DRUNK 🥂",
    tags: ["party"]
  },
  {
    slug: "were-rich",
    title: "We're Rich",
    alt: "A man cheering at a desk of green charts surrounded by pizza boxes and empties.",
    caption: "Unemployed, unshowered, unbothered. $DRUNK 🍕📈",
    tags: ["chart", "degen"],
    wide: true
  },
  {
    slug: "pool-party",
    title: "Pool Party",
    alt: "A chaotic neon pool party with the Drunk Coin mascot floating on a ring.",
    caption: "The pool is technically still a pool. $DRUNK 🏊",
    tags: ["party", "degen"]
  },
  {
    slug: "last-call",
    title: "Time Is Running Out",
    alt: "An hourglass full of Drunk Coins draining away, with a 'last call' neon sign.",
    caption: "Last call is a myth but the hourglass says otherwise. $DRUNK ⏳",
    tags: ["brand", "degen"]
  },
  {
    slug: "open-mic",
    title: "Open Mic Night",
    alt: "A visibly wobbly man with spiral eyes leaning back holding a Drunk Coin bottle.",
    caption: "He said he'd 'just say a few words'. That was forty minutes ago. $DRUNK 🎤",
    tags: ["party", "degen"]
  },
  {
    slug: "couch-pump",
    title: "Couch Pump",
    alt: "A couple celebrating on a trashed couch while a big screen shows a rising chart.",
    caption: "Date night is just watching the chart together now. $DRUNK 💜",
    tags: ["chart", "party"]
  },
  {
    slug: "party-animals",
    title: "Not Only For Degens",
    alt: "A couple kissing on a neon dance floor under a 'not only for degens' arch.",
    caption: "Not only for degens — for anyone who's ever said \"one more.\" $DRUNK 💜",
    tags: ["party"]
  },
  {
    slug: "bottle-chase",
    title: "Bottle Chase",
    alt: "A man swigging from a Drunk Coin bottle while his friend runs away in horror.",
    caption: "\"Just one more and then we go home.\" He is lying. $DRUNK 🏃",
    tags: ["degen"],
    wide: true
  },
  {
    slug: "closing-time",
    title: "Closing Time",
    alt: "A club at the end of the night: some people dancing, others slumped over tables.",
    caption: "Closing time hits everyone differently. $DRUNK 🥴",
    tags: ["party", "degen"]
  },
  {
    slug: "before-after",
    title: "Before / After",
    alt: "Split panel: a sad man with broken grey coins, then the same man celebrating with $DRUNK.",
    caption: "Before $DRUNK / after $DRUNK. Not financial advice, just a mood. 🍻",
    tags: ["chart", "degen"]
  },
  {
    slug: "after-after-party",
    title: "The After-After Party",
    alt: "A trashed pool deck the morning after, with the mascot floating and looking rough.",
    caption: "The after-after party. Nobody remembers whose idea this was. $DRUNK 🫠",
    tags: ["party", "degen"]
  },
  {
    slug: "wojak-vs-wojak",
    title: "Other Coins vs $DRUNK",
    alt: "Split panel: a crying wojak buying generic coins, a grinning wojak buying $DRUNK.",
    caption: "Same wallet. Very different evening. $DRUNK 🍺",
    tags: ["chart", "degen"],
    wide: true
  },
  {
    slug: "faceplant",
    title: "The Faceplant",
    alt: "A man slipping on a spilled drink mid-air while friends reach out to catch him.",
    caption: "Gravity: undefeated. The bar: still open. $DRUNK 🤸",
    tags: ["degen"]
  }
];
