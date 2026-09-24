One job per user
User	The one thing the app must make easy
Farmer / FPO	"Am I getting a fair price, and who should I sell to?"
Buyer	"Find enough good produce from trusted sellers, and pay without friction."
Commission agent	"Run my day: my farmers, my lots, my commission."
Service provider	"Get jobs, do them, get paid."
Admin	"Keep the market honest and moving: approve, resolve, release, measure."
TASK 0: Design system and app shell
TASK: Create the KisanConnect design system and an empty app shell. Do not design product screens yet.

CONTEXT: KisanConnect is a mobile-first marketplace that helps Indian farmers and FPOs see fair prices, choose a buyer, and track their money. Users: farmers (often low literacy, low-end Android phones, patchy network), buyers, commission agents, service providers, admins. Farmers use Hindi first, English second.

STYLE: Warm, calm, trustworthy. NOT a government portal: no dense tables (except the admin app), no dark-green-and-mint look, no copy of any existing portal's layout or logo.
- Colors: background #FFFBF5; card #FFFFFF; text #1F2937; muted #6B7280; primary buttons Turmeric #F5A524 with dark text; trust/links/verified Indigo #3730A3; good and "Sell now" Green #15803D; "Wait" Amber #B45309; "Store and wait" Blue #1D4ED8; error/dispute Red #B91C1C. Never use color alone: pair it with an icon and a word.
- Type: Noto Sans + Noto Sans Devanagari (line height 1.5 so Devanagari is not clipped). Farmer app: body 18px, titles 24px bold, money 32px bold tabular. Minimum 16px anywhere (admin 14px).
- Shape: 16px corners, 8pt grid, soft shadow, buttons 56px tall, touch targets at least 48px.
- Icons: filled, simple, semi-abstract (sack of grain, weighing scale, truck, rupee coin, shield for verified, warehouse). Every icon has a visible label.
- Money: Indian grouping (₹1,25,000). Quantity in quintal (qtl) with a "bags" toggle.

COMPONENTS: primary / secondary / quiet button; big choice tile (icon + label + speaker); stat card; price chip (₹, arrow up/down, %); status pill; verified badge; trust meter (5 segments + label); vertical timeline; bottom tab bar (5 items; farmer labels: आज, भाव, बेचें (centre, raised), सौदे, मेरा); top bar (language chip, help "?", bell); big number stepper with quick-pick chips; searchable picker sheet with pictures; toast; empty state; error state with Retry; offline banner ("Showing prices from 6:00 am"); match score card (score %, distance, one-line "why it matched" reasons); Balveer chat button (closed, floating, bottom-right) and Balveer chat panel (open: message bubbles, mic + text input, typing indicator) -- see TASK 12.
Every text field has a mic button. Every screen has a read-aloud speaker and a help "?" in the same spot.

RULES: one main action per screen; sticky bottom button; never hide a critical action below the fold; peek the next card so people know there is more; prefer tapping tiles over typing or dropdowns; plain words ("Money you will receive", never "net settlement"); every label in Hindi and English with an always-visible language switch.

OUTPUT: a colors+type page, a components page, and an empty 390x844 phone frame with the tab bar and top bar. Also a 1440x900 admin frame with a left nav and top bar. Mark all sample content "sample".

Backend status: none needed.

TASK 1: Onboarding, login, language (all users)
TASK: Design onboarding and login for every user type, mobile 390x844.

DESIGN SYSTEM: Use the KisanConnect design system from TASK 0 above: background #FFFBF5, white cards, text #1F2937, primary buttons Turmeric #F5A524 with dark text, trust/links Indigo #3730A3, Sell-now/good Green #15803D, Wait Amber #B45309, Store/hold Blue #1D4ED8, error/dispute Red #B91C1C. Noto Sans + Noto Sans Devanagari, body 18px, buttons 56px tall, 16px corners, filled icons always with labels, ₹ in Indian grouping (₹1,25,000), quantity in quintal. Every screen has a sticky bottom action, a help "?" and a read-aloud speaker in the same place, and a language chip. Every text input has a mic. Farmer app shows Hindi first, English second. All data is sample data, labelled "sample".

CONTEXT: One account can hold several roles. Registration requires a home mandi (APMC). Admins are invited by staff and never appear as a public choice.

SCREENS
X1 Language: two big tiles (हिन्दी, English), speaker reads the question aloud.
X2 "I am a...": four large tiles, each with icon and one plain line: Farmer or FPO ("I want to sell my produce"), Buyer ("I want to buy produce"), Commission agent ("I sell for farmers at a mandi"), Service provider ("I offer storage, transport, testing or weighing"). Farmer/Buyer show a small switch "Just me / My FPO or company". A tiny "Staff login" link at the bottom.
X3 Phone: one large numeric field (10 digits), "Send OTP".
X4 OTP: six big boxes, auto-fill, 30 s resend timer, "Change number".
X5 About you: name and a password with a 3-dot strength meter and plain rules (8+ characters, one capital, one small letter, one digit). If FPO/company: organisation name. If commission agent: firm name and licence number. If service provider: business name.
X6 Home mandi: "Use my location" first, then state, then mandi (searchable with mic). Required.
X7 Welcome: three first steps for that role, each a tappable card.
X8 Login: phone + password; a link "Login with OTP instead". After repeated wrong passwords show a calm lockout message with minutes remaining.

BEHAVIOR: one concern per screen; errors in plain words under the field with an icon; the Next button stays enabled and, when tapped, says exactly what is missing; the language chip works everywhere.

CONSTRAINTS: no more than 8 screens; never ask for anything not listed; the role tiles must be understandable without reading (icon + voice).

Backend status: ✅ POST /auth/register/request-otp, POST /auth/register, POST /auth/login, POST /auth/login/request-otp. ✅ GET /lookups/apmcs, GET /lookups/states — verified public, no login required, so X6 can query them before or after auth. 🟡 language choice is not saved on the server yet. 🟡 "use my location" nearby-mandi search needs POST /mandis/nearby, which still requires a captcha even when the caller is logged in — fine for X6 during onboarding, but adds friction if reused for F2's mandi picker.

TASK 2: Farmer home and Price Radar
TASK: Design the Farmer app's Today screen and the Price Radar (the product's headline feature).

DESIGN SYSTEM: Use the KisanConnect design system from TASK 0 above: background #FFFBF5, white cards, text #1F2937, primary buttons Turmeric #F5A524 with dark text, trust/links Indigo #3730A3, Sell-now/good Green #15803D, Wait Amber #B45309, Store/hold Blue #1D4ED8, error/dispute Red #B91C1C. Noto Sans + Noto Sans Devanagari, body 18px, buttons 56px tall, 16px corners, filled icons always with labels, ₹ in Indian grouping (₹1,25,000), quantity in quintal. Every screen has a sticky bottom action, a help "?" and a read-aloud speaker in the same place, and a language chip. Every text input has a mic. Farmer app shows Hindi first, English second. All data is sample data, labelled "sample".

CONTEXT: Farmers often sell right after harvest with little idea of nearby prices. Show them where the best price is *after transport*, how prices have moved, and whether to sell now, wait, or store. Advice must be honest: ranges, confidence, reasons, never a guarantee.

SCREENS
F1 Today: greeting and my-crop chips (wheat, potato, ...). Cards, top to bottom: (1) "Best price for you today": crop, ₹/qtl after transport, mandi name and km; (2) "Should I sell?" traffic-light card with one plain sentence; (3) "My lots" horizontal cards peeking at the edge; (4) "Offers waiting" count; (5) "Money you will receive" with the next payout date; (6) quick actions: Sell, Prices, Store, Help. Bottom tab bar.
F2 Price Radar: crop picker with pictures; distance chips 25 / 50 / 100 km; a ranked list of nearby mandis. Each row: mandi name, km, today's most-common price, a min-to-max range bar, arrival trend arrow (only if data exists), "as of" date. A switch: "Market price | After transport" (default After transport).
F3 Price detail + advice: 30-day line of the most-common price with a shaded min-max band; tap a day for its value; a dotted "same time last year" line. Below: the advice panel with exactly three possible states: SELL NOW (green), WAIT A FEW DAYS (amber), STORE AND WAIT (blue). Each shows: one-line reason ("Prices in your 3 nearest mandis rose 4% this week and fewer trucks are arriving"), expected price range for the next 7-14 days, confidence as 3 dots + word, and the line "A guide, not a promise". Buttons: "Set price alert" (target price, notify by SMS or app) and, on STORE, "See storage near me".
F3b Empty/edge states: "Not enough data for this crop yet", "Prices are 2 days old", offline.

BEHAVIOR: switching crop or distance updates the list without a page change; tapping a mandi row opens F3 for that mandi; the alert sheet confirms in plain words.

CONSTRAINTS: never show a single guaranteed future price; never show advice without its reason and confidence; no more than 3 advice states; keep the chart readable at 390px width; no table anywhere.

Backend status: 🟡 NEW: GET /market/price-trend?commodity_id=&apmc_id=&window_days=&recent_days= is live -- returns recent_avg_price, prior_avg_price, pct_change, signal (SELL / HOLD / WATCH / NO_DATA), a plain-language reason, confidence (low/medium/high), trade_count, and a daily series for the chart. It is computed from the platform's own settled trades, not a government feed, so a new or low-volume mandi will often show NO_DATA -- design F3b for that, not as a rare edge case. Call it once per nearby mandi (from POST /mandis/nearby) to build F2's ranked list; there is no single "compare mandis" endpoint yet. Map SELL to green, HOLD or WATCH to amber "wait"; the blue STORE AND WAIT state has no backing data yet (no storage-cost input) so treat it as a frontend-only variant for now. Net-of-transport ranking is still 🔴. ✅ POST /lots etc. feed "My lots" (GET /lots). ✅ money card from GET /settlements. 🔴 alerts and notifications.

TASK 3: Farmer sells: lot, offers, bidding
TASK: Design the Farmer's Sell flow, from "what are you selling" to choosing a buyer.

DESIGN SYSTEM: Use the KisanConnect design system from TASK 0 above: background #FFFBF5, white cards, text #1F2937, primary buttons Turmeric #F5A524 with dark text, trust/links Indigo #3730A3, Sell-now/good Green #15803D, Wait Amber #B45309, Store/hold Blue #1D4ED8, error/dispute Red #B91C1C. Noto Sans + Noto Sans Devanagari, body 18px, buttons 56px tall, 16px corners, filled icons always with labels, ₹ in Indian grouping (₹1,25,000), quantity in quintal. Every screen has a sticky bottom action, a help "?" and a read-aloud speaker in the same place, and a language chip. Every text input has a mic. Farmer app shows Hindi first, English second. All data is sample data, labelled "sample".

CONTEXT: This replaces a long form with one question per screen. The farmer chooses between asking buyers for offers (recommended) or open bidding. The app always shows "money you will receive" so the farmer sees the true result.

SCREENS
F4 What are you selling: picture tiles for crops + search with mic; then variety chips.
F5 How much: big stepper in quintal with quick chips (5, 10, 25, 50) and a bags toggle with bag-type chips; shows "about 42 bags".
F6 Quality Passport: three grade tiles with example photos (A best, B good, C average); add up to 3 photos with the camera; moisture % quick input; badge "Self-declared" that becomes "Lab verified" if tested; button "Get it tested" (opens the Test service).
F7 Where is it: use my location or village + pincode; optional "Sell through an agent?" with a searchable list of agents at my mandi showing each agent's commission %.
F8 My minimum price: today's nearby common price as a reference; a slider for my minimum ₹/qtl; below, "You will receive about ₹X per qtl" with an expandable "Why less?" list (agent commission, loading, weighing).
F9 How to sell: two big options. "Ask buyers for offers" (recommended; choose how many days to keep it open) and "Open bidding" (choose start and end time).
F10 Review and publish: one summary card, sticky "Publish lot".
F11 My lots: cards with photo, crop, qty, status pill (Draft, Live, Offers 3, Sold) and best offer.
F12 Compare offers: offer cards showing buyer name, verified badge, trust meter, price/qtl, payment terms (on pickup / within 3 days / within 7 days), pickup or delivery, valid-till, and a highlighted "You will receive ₹X". Sort by "Most money in hand". Select up to 3 for a side-by-side compare. Actions: Accept, Counter, Decline. Accept opens a plain-words confirm sheet: what happens next.
F13 Live bidding: current highest bid (huge), countdown, number of bids, and after it closes "Accept top bid" or "Reject and list again".

BEHAVIOR: Back keeps entries; publish shows a success state with "Share on WhatsApp"; the net-in-hand number updates as the minimum price moves.

CONSTRAINTS: max one question per screen (F4-F9); no dropdowns; the two sell modes must look equally clear, with offers pre-selected.

Backend status: ✅ POST /lots (needs commodity, quantity, min_price for bidding), POST /lots/{lot_id}/activate, GET /lots, POST /uploads/presign, GET /lookups/commodities, GET /lookups/commission-agents. ✅ Bidding: POST /auctions/bulk, GET /auctions/{auction_id}, POST /trade/trades/{trade_id}/accept-bid, POST /trade/trades/{trade_id}/reject-bid. ✅ fee rules readable via GET /charge-rules (client can estimate; a proper preview endpoint is better). 🔴 NEW: offers (F12), quality grade and moisture fields (F6). Stopgap for grade: the lot's speciality text.

TASK 4: Deal Room, Money, Grievance (Farmer)
TASK: Design what happens after a buyer is chosen: the Deal Room, the Money screen, and problem reporting.

DESIGN SYSTEM: Use the KisanConnect design system from TASK 0 above: background #FFFBF5, white cards, text #1F2937, primary buttons Turmeric #F5A524 with dark text, trust/links Indigo #3730A3, Sell-now/good Green #15803D, Wait Amber #B45309, Store/hold Blue #1D4ED8, error/dispute Red #B91C1C. Noto Sans + Noto Sans Devanagari, body 18px, buttons 56px tall, 16px corners, filled icons always with labels, ₹ in Indian grouping (₹1,25,000), quantity in quintal. Every screen has a sticky bottom action, a help "?" and a read-aloud speaker in the same place, and a language chip. Every text input has a mic. Farmer app shows Hindi first, English second. All data is sample data, labelled "sample".

CONTEXT: The old process is many separate lists (agreement, bill, weighment, gate exit). Farmers need ONE place per deal that says what happened and what to do next, and one place that says when money arrives.

SCREENS
F14 Deals: tabs "In progress / Done / Problems"; card = crop, qty, buyer, agreed price, current step.
F15 Deal Room: header (crop, qty, buyer with verified badge, agreed ₹/qtl). Vertical timeline: Agreed, Pickup arranged, Weighed (show final weight; highlight if different from my estimate), Paper ready (both sides approve), Buyer paid, Money sent to my bank, Delivered. Only the CURRENT step shows a button ("Arrange pickup", "Approve paperwork", "Report a problem"). Older steps show time stamps.
F16 Money: big "To receive" total; payouts list with pills (Waiting for buyer, Ready, Paid) and the masked bank account ••••7893. Tapping a payout shows a receipt: sale value, minus agent commission, minus loading, equals "You receive" with a stacked bar, headed "Why is it less than ₹9,000?".
F17 Report a problem: pick the deal, then tiles (Weight is wrong, Quality dispute, Payment is late, Buyer did not come, Something else); add photos and a 30-second voice note; Submit.
F18 Case status: timeline (Received, Being looked at, Resolved), expected time, helpline number, and at the end a 3-face rating of how it was handled.
X9 Notifications: grouped by deal; each item states the event and the next step in one sentence.

BEHAVIOR: a step turning done animates once; the receipt expands inline; Submit on F17 confirms with a case number.

CONSTRAINTS: no jargon ("settlement", "H1", "UOM" never appear); no more than one button per timeline step; money is always in ₹ with the bank account masked.

Backend status: ✅ GET /trade/sell/trades, POST /trade/trades/{trade_id}/approve, GET /trade/bills/{bill_id}/breakdown, GET /settlements, GET /weighment/records, POST /gate-exits, GET /bank-accounts. 🟡 there is no single-deal read (GET one trade); Deal Room must filter the list until one is added. 🔴 NEW: grievances (F17, F18), notifications (X9).

TASK 5: Services, find buyers, my profile (Farmer)
TASK: Design the Farmer's Services hub, buyer demand board, harvest announcements, and profile.

DESIGN SYSTEM: Use the KisanConnect design system from TASK 0 above: background #FFFBF5, white cards, text #1F2937, primary buttons Turmeric #F5A524 with dark text, trust/links Indigo #3730A3, Sell-now/good Green #15803D, Wait Amber #B45309, Store/hold Blue #1D4ED8, error/dispute Red #B91C1C. Noto Sans + Noto Sans Devanagari, body 18px, buttons 56px tall, 16px corners, filled icons always with labels, ₹ in Indian grouping (₹1,25,000), quantity in quintal. Every screen has a sticky bottom action, a help "?" and a read-aloud speaker in the same place, and a language chip. Every text input has a mic. Farmer app shows Hindi first, English second. All data is sample data, labelled "sample".

CONTEXT: Farmers often need storage, transport, testing or weighing but do not know whom to trust. This hub turns those needs into four plain choices, and shows what buyers are asking for so the farmer can sell on purpose.

SCREENS
F19 "Help me with...": four big tiles: Store it, Move it, Test it, Weigh it.
F20 Provider list, detail and booking: cards with provider name, verified badge, price range, distance, response time. Detail: what is included, price, working hours, "Book" (date, quantity) and, if negotiable, "Offer my price". After booking a status card (Requested, Accepted, In progress, Done). On "Store it" show monthly cost per bag next to the advice range from F3 ("Storing may cost ₹X and could earn ₹Y to ₹Z").
F21 Find buyers: pick one of "My lots", then a ranked list of matching buyer demand cards (crop, quantity wanted, price range, deliver-by date, location, verified buyer, match score %, one-line "why it matched", distance) with "Offer my lot".
F22 Announce my harvest: crop, expected quantity, expected price, dates, location; shows "Buyers near you: 14".
F23 Me: profile (name, home mandi, language), bank accounts (add with account + IFSC, masked, "verified", "primary"), my crops, helpline, logout.

BEHAVIOR: booking asks for at most 3 inputs; bank add confirms with a small verification step; language change applies instantly.

CONSTRAINTS: bank numbers always masked; no more than 3 fields per sheet; no tables.

Backend status: ✅ GET /services, GET /services/{cid}, POST /bookings, GET /bookings/mine, POST /bookings/{bid}/negotiation, GET /demands, POST /advance-supplies, GET /advance-supplies, GET /profile, PATCH /profile, GET /bank-accounts, POST /bank-accounts, POST /bank-accounts/{bank_id}/verify, PUT /preferences/seller. ✅ NEW: GET /lots/{lot_id}/matches (ranked demand matches with score + why-it-matched, powers F21). 🟡 "could earn ₹Y to ₹Z" can now lean on GET /market/price-trend's recent range instead of a dedicated forecast. 🔴 provider ratings; 🔴 buyer counts ("14 near you").

TASK 6: FPO mode
TASK: Design the FPO manager's tools inside the Farmer app (shown when the account is an FPO or company).

DESIGN SYSTEM: Use the KisanConnect design system from TASK 0 above: background #FFFBF5, white cards, text #1F2937, primary buttons Turmeric #F5A524 with dark text, trust/links Indigo #3730A3, Sell-now/good Green #15803D, Wait Amber #B45309, Store/hold Blue #1D4ED8, error/dispute Red #B91C1C. Noto Sans + Noto Sans Devanagari, body 18px, buttons 56px tall, 16px corners, filled icons always with labels, ₹ in Indian grouping (₹1,25,000), quantity in quintal. Every screen has a sticky bottom action, a help "?" and a read-aloud speaker in the same place, and a language chip. Every text input has a mic. Farmer app shows Hindi first, English second. All data is sample data, labelled "sample".

CONTEXT: Buyers struggle to find enough produce of consistent quality. An FPO can pool its members' produce into one bigger lot and share the money fairly.

SCREENS
P1 FPO dashboard: members count, pooled volume this season, open buyer demands I can meet, money to pay members.
P2 Members: list (name, village, crops) with search; "Invite by SMS" (phone); each member card shows recent lots.
P3 Pooled lot builder: pick crop and grade; check members' lots; a running total bar against a target quantity; an automatic share % per member (editable); a preview of each member's money; "Publish pooled lot".
P4 Demand match: card "Green Mills needs 50 qtl wheat grade A by 30 Sep. You have 32 qtl. 3 members can add 18 qtl." with a "Ask them" button that sends each a request.
P5 Member payouts: after a sale, a list of members with their share, status pill and amount; export.

BEHAVIOR: progress bars fill as lots are checked; unequal quality gets a warning "Mixing grade A and B lowers the price. Continue?".

CONSTRAINTS: members are shown by first name and village only; never show one member another's earnings.

Backend status: 🔴 NEW: members, invites, pooled lots, split payouts, demand matching. Only the "institutional user" flag and organisation name exist today.

TASK 7: Buyer app (mobile + 1280px desktop)
TASK: Design the Buyer app. Buyers use both phone (390px) and desktop (1280px), so provide both layouts for the key screens B2 and B8.

DESIGN SYSTEM: Use the KisanConnect design system from TASK 0 above: background #FFFBF5, white cards, text #1F2937, primary buttons Turmeric #F5A524 with dark text, trust/links Indigo #3730A3, Sell-now/good Green #15803D, Wait Amber #B45309, Store/hold Blue #1D4ED8, error/dispute Red #B91C1C. Noto Sans + Noto Sans Devanagari, body 18px, buttons 56px tall, 16px corners, filled icons always with labels, ₹ in Indian grouping (₹1,25,000), quantity in quintal. Every screen has a sticky bottom action, a help "?" and a read-aloud speaker in the same place, and a language chip. Every text input has a mic. Farmer app shows Hindi first, English second. All data is sample data, labelled "sample".

CONTEXT: Buyers want enough volume of the right quality from trusted sellers, and a clear way to pay. Tabs: Find, My demands, Offers and bids, Deals, Me.

SCREENS
B1 Home: "Volume you still need" cards with progress bars per demand; new supply near me; payments due; licence-expiry warning.
B2 Find supply: filters (crop, quantity, grade, radius, date); result cards with seller name (farmer/FPO) and trust badge, crop, quantity, grade, ask price, distance; map toggle.
B3 Volume finder: enter a need (for example 50 qtl wheat, grade A, within 100 km); the app suggests a combination of listings that adds up to it with a running total and a button "Send offers to all 3".
B3b Matched supply for my demand: from "My demands", pick one posted demand and see a ranked list of matching lots (crop, quantity offered, grade/speciality, asking price, seller name + trust badge, distance, match score %, one-line "why it matched"); "Make an offer" opens B5 pre-filled.
B4 Post a demand: crop, variety, quantity range, price range, quality spec (grade, maximum moisture), deliver-by date, location, payment terms; a preview "Farmers within 100 km who can supply: 14".
B5 Make an offer: price/qtl, quantity, payment terms tiles, pickup or delivery, valid-till; shows "Farmer will receive about ₹X".
B6 Live bidding: current highest bid (huge), the minimum next bid, a big stepper, "Place bid", countdown, my status pill (Highest / Outbid).
B7 Deals: same card style as the Farmer.
B8 Deal Room and pay: the same timeline in buyer wording; the invoice summary (produce value plus market fee); "Pay now" (UPI or bank; enter the reference); partial payment allowed; receipts.
B9 My trust profile: verified badge, trade licences (add, upload photo, expiry warnings), pays-on-time score, reviews received.

BEHAVIOR: bidding shows instant outbid feedback; the pay screen confirms amount and account before submit; licence expiry shows a red banner 15 days before.

CONSTRAINTS: tables only on the desktop B2/B8 layouts; a seller's phone number is never shown before a deal is agreed.

Backend status: ✅ GET /advance-supplies/market, POST /demands, GET /demands/mine, POST /auctions/{auction_id}/bids, GET /auctions/{auction_id}/bids/mine, GET /trade/buy/trades, GET /trade/buy/bills, POST /trade/bills/{bill_id}/payments, GET /trade-licenses, POST /trade-licenses, PUT /preferences/buyer. ✅ NEW: GET /demands/{demand_id}/matches (ranked lot matches with score + reasons, powers B3b). 🟡 a buyer cannot list live lots or auctions today (only fetch one auction by id), so B2's lot results and the bidding entry point need a new endpoint. 🔴 NEW: offers (B5), the multi-seller combination logic in B3, trust score and reviews (B9).

TASK 8: Commission agent app
TASK: Design the Commission Agent app. Tabs: Today, Farmers, Lots, Money, Me.

DESIGN SYSTEM: Use the KisanConnect design system from TASK 0 above: background #FFFBF5, white cards, text #1F2937, primary buttons Turmeric #F5A524 with dark text, trust/links Indigo #3730A3, Sell-now/good Green #15803D, Wait Amber #B45309, Store/hold Blue #1D4ED8, error/dispute Red #B91C1C. Noto Sans + Noto Sans Devanagari, body 18px, buttons 56px tall, 16px corners, filled icons always with labels, ₹ in Indian grouping (₹1,25,000), quantity in quintal. Every screen has a sticky bottom action, a help "?" and a read-aloud speaker in the same place, and a language chip. Every text input has a mic. Farmer app shows Hindi first, English second. All data is sample data, labelled "sample".

CONTEXT: An agent sells produce at a mandi on behalf of farmers for a commission, and keeps a running account with each farmer. The app should feel like a clean digital khata, not accounting software.

SCREENS
A1 Today: lots arriving today, auctions ending soon, commission earned this week (big), payouts pending.
A2 Farmers: list with name, village, lots count and running balance; "Add farmer" by phone (SMS invite); tap for the farmer's history.
A3 Lots I handle: cards with farmer name, crop, quantity, status pill, best offer or highest bid; filters by status.
A4 Add a lot for a farmer: a fast form (farmer, crop, quantity, minimum price); on save the farmer gets an SMS to confirm.
A5 Money: "Pending" vs "Paid" totals; a per-deal receipt showing the commission; export a statement.
A6 Me: licence card (number, expiry, mandi), my commission rate (with a note that the mandi may cap it), bank accounts, language.

BEHAVIOR: adding a farmer is 2 fields; the balance is colored green (they owe me) or blue (I owe them) with words, not just color.

CONSTRAINTS: an agent never sees the farmer's bank details or a buyer's contact before the deal is agreed; commission is always displayed as coming out of the farmer's sale value, never added on top.

Backend status: ✅ GET /agents/me, PATCH /agents/me, GET /agents/me/lots, GET /agents/me/earnings, GET /settlements, GET /trade/bills/{bill_id}/breakdown, GET /lookups/commission-agents. 🟡 agents cannot list trades (GET /trade/sell/trades is for sellers and buyers only). 🔴 NEW: farmer directory and running balances (A2), creating a lot on a farmer's behalf with farmer confirmation (A4).

TASK 9: Service provider app
TASK: Design the Service Provider app for weighing, testing, storage, and transport. Tabs: Jobs, Calendar, My services, Earnings, Me.

DESIGN SYSTEM: Use the KisanConnect design system from TASK 0 above: background #FFFBF5, white cards, text #1F2937, primary buttons Turmeric #F5A524 with dark text, trust/links Indigo #3730A3, Sell-now/good Green #15803D, Wait Amber #B45309, Store/hold Blue #1D4ED8, error/dispute Red #B91C1C. Noto Sans + Noto Sans Devanagari, body 18px, buttons 56px tall, 16px corners, filled icons always with labels, ₹ in Indian grouping (₹1,25,000), quantity in quintal. Every screen has a sticky bottom action, a help "?" and a read-aloud speaker in the same place, and a language chip. Every text input has a mic. Farmer app shows Hindi first, English second. All data is sample data, labelled "sample".

CONTEXT: Providers are small businesses (weighbridge owners, labs, warehouse and cold-store owners, transporters) who get jobs from farmers and buyers and are paid per job. They are busy and often on their feet, so speed and big buttons matter.

SCREENS
S1 Jobs: request cards with service icon, customer first name, quantity, date, offered price; actions Accept, Counter, Decline.
S2 Job progress: a step bar (Accepted, Started, Completed) and a capture form that changes by service. Weighing: gross, tare, bags -> shows final weight in quintal. Testing: values (moisture and so on) and upload the report. Transport: vehicle number, driver, pickup and drop. Storage: in-date, out-date, quantity.
S3 My services: register or edit a service in 4 short steps (type, place, price range and negotiable switch, working hours); active/paused switch; a list of my price cards.
S4 Calendar: week view of booked jobs, colored by service.
S5 Earnings: completed jobs, paid vs waiting.
S6 Equipment: scales and instruments with calibration expiry and a red warning when expired; expired equipment cannot be chosen for a job.

BEHAVIOR: the final weight recalculates as numbers are typed; Counter opens a price stepper limited to my own price range.

CONSTRAINTS: capture forms at most 5 fields; large numeric keypad for weights.

Backend status: ✅ GET /bookings/received, POST /bookings/{bid}/accept, POST /bookings/{bid}/reject, POST /bookings/{bid}/start, POST /bookings/{bid}/complete, POST /bookings/{bid}/negotiation, PUT /service-profiles, GET /service-profiles/me, POST /catalogs, GET /catalogs/mine, PATCH /catalogs/{cid}, POST /weighment/records. 🔴 NEW: equipment endpoints (S6), earnings summary and a way to record payment for a service booking (S5).

TASK 10: Admin console (desktop 1440x900)
TASK: Design the Admin console for platform staff. Desktop only. Left nav with 8 items: Overview, Approvals, Live ops, Money, Disputes, Market data, Rules and masters, People.

DESIGN SYSTEM: Use the KisanConnect design system from TASK 0 above: background #FFFBF5, white cards, text #1F2937, primary buttons Turmeric #F5A524 with dark text, trust/links Indigo #3730A3, Sell-now/good Green #15803D, Wait Amber #B45309, Store/hold Blue #1D4ED8, error/dispute Red #B91C1C. Noto Sans + Noto Sans Devanagari, body 18px, buttons 56px tall, 16px corners, filled icons always with labels, ₹ in Indian grouping (₹1,25,000), quantity in quintal. Every screen has a sticky bottom action, a help "?" and a read-aloud speaker in the same place, and a language chip. Every text input has a mic. Farmer app shows Hindi first, English second. All data is sample data, labelled "sample".

CONTEXT: The admin keeps the market honest and moving. Tables are allowed here, but every table has search, filters, a saved view, and a right-hand detail drawer instead of new pages. Use the same colors; body 14px.

SCREENS
D1 Overview: outcome KPIs first: price realisation vs mandi average (%), average days to payment, active lots, live auctions, open disputes, users waiting for approval, price-data freshness. Charts: realisation trend, volume by state, funnel Lot -> Offer -> Deal -> Paid.
D2 Approvals: tabs Farmers/FPOs, Buyers, Agents, Providers; drawer with documents, licence expiry, Approve / Reject with reason chips / Ask for more.
D3 Live ops: three lanes: Auctions to declare (Declare, with an override that asks for a reason), Gate exits to approve, Payouts to release (button disabled until the buyer has paid, with the reason shown).
D4 Money: bills with payment status, overdue highlighted, payout history, export.
D5 Disputes: queue with SLA timers and filters; case drawer with evidence, timeline, both parties, internal notes; Resolve with outcome chips and a message to both.
D6 Market data: feed health per state (last sync, records today, missing mandis, anomaly flags such as a price jump above 30%); commodity and mandi masters; a manual price correction that requires a note.
D7 Rules and masters: fee rules table (kind, who pays: buyer or seller shown in different colors, basis, rate, mandi, crop) with a live preview "On a ₹100 sale the buyer pays ₹X and the farmer gets ₹Y"; commodities, varieties, bag types, mandis.
D8 People: users with role filter, suspend, reset; an audit log tab (who did what, when).

BEHAVIOR: destructive actions need a typed reason; every change appears in the audit log; commission can never be set as a buyer-side fee (show why).

CONSTRAINTS: at most 8 nav items; no page reloads for drawers; no more than 2 primary buttons per screen.

Backend status: ✅ POST /charge-rules, GET /charge-rules, DELETE /charge-rules/{rule_id} (no edit: deactivate and re-create), GET /auctions/pending, POST /auctions/{auction_id}/declare, GET /gate-exits, POST /gate-exits/{gx_id}/approve, POST /gate-exits/{gx_id}/reject, POST /settlements/{settlement_id}/release. 🟡 GET /settlements returns only the caller's own payouts, so an admin cannot list all payouts yet; same for bills. 🔴 NEW: approvals and user management, disputes, market-data health, KPIs, master-data editing, audit log.

TASK 11: Cross-cutting states and clickable prototype
TASK: Add the shared states and wire every app into clickable prototypes. Do not redesign screens.

DESIGN SYSTEM: Use the KisanConnect design system from TASK 0 above: background #FFFBF5, white cards, text #1F2937, primary buttons Turmeric #F5A524 with dark text, trust/links Indigo #3730A3, Sell-now/good Green #15803D, Wait Amber #B45309, Store/hold Blue #1D4ED8, error/dispute Red #B91C1C. Noto Sans + Noto Sans Devanagari, body 18px, buttons 56px tall, 16px corners, filled icons always with labels, ₹ in Indian grouping (₹1,25,000), quantity in quintal. Every screen has a sticky bottom action, a help "?" and a read-aloud speaker in the same place, and a language chip. Every text input has a mic. Farmer app shows Hindi first, English second. All data is sample data, labelled "sample".

CONTEXT: The five apps are already designed. This task only adds what makes them feel finished (help, empty/error/offline states, notification wording) and connects the screens so each flow can be clicked through.

SCREENS
X10 Help: a big "Call helpline" button, "Explain this screen" (reads it aloud), and the 5 most common questions per role.
States for every app: empty (with a friendly icon and one action), loading (skeleton cards), error (plain sentence + Retry), offline (banner with the age of the data), permission denied (why, and who to call).
Notification examples in plain words: "Green Mills offered ₹2,410/qtl for your wheat. Offer valid till Friday." / "The buyer has paid. Your ₹8,510 is on the way to your bank ••••7893." / "Your case #482 is being looked at. We will reply by tomorrow evening."

PROTOTYPE FLOWS (link every screen so each is clickable end to end)
Farmer: X1 -> X2 -> X3 -> X4 -> X5 -> X6 -> X7 -> F1 -> F2 -> F3 -> F4 ... F10 -> F11 -> F12 -> F15 -> F16 -> F17 -> F18.
Buyer: X2 -> ... -> B1 -> B2 -> B5 -> B6 -> B8 -> B9.
Agent: A1 -> A2 -> A4 -> A3 -> A5.
Provider: S1 -> S2 -> S3 -> S4 -> S5.
Admin: D1 -> D2 -> D3 -> D5 -> D6 -> D7.

CONSTRAINTS: keep all screens as they are; only add states, help, and links; the tab bar highlights the current tab everywhere.

Backend status: 🔴 notifications; help content is static.

TASK 12: Balveer -- AI chat assistant (Farmer + Buyer, mobile + desktop)
TASK: Design the Balveer chat button and chat window, available on every Farmer and Buyer screen after login.

DESIGN SYSTEM: Use the KisanConnect design system from TASK 0 above: background #FFFBF5, white cards, text #1F2937, primary buttons Turmeric #F5A524 with dark text, trust/links Indigo #3730A3, Sell-now/good Green #15803D, Wait Amber #B45309, Store/hold Blue #1D4ED8, error/dispute Red #B91C1C. Noto Sans + Noto Sans Devanagari, body 18px, buttons 56px tall, 16px corners, filled icons always with labels, ₹ in Indian grouping (₹1,25,000), quantity in quintal. Farmer app shows Hindi first, English second. All data is sample data, labelled "sample".

CONTEXT: Farmers and buyers can ask a plain-language question ("what's the wheat price today", "when will I get paid") without leaving whatever screen they're on. Balveer is a temporary chat: it is not saved as a permanent record and is not a substitute for the Help screen's helpline number.

SCREENS
G1 Balveer closed: a 56px round floating button, bottom-right, indigo, with a small chat-bubble icon and Balveer's mascot mark; on mobile it sits 16px above the tab bar (or above the screen's sticky bottom action, whichever is higher) so it never overlaps either; first-time use shows a small "Ask Balveer" label chip beside it once, then it collapses to the icon alone.
G2 Balveer open, mobile: a bottom sheet rising to about 80% height. Header: "Balveer" + one-line "AI assistant, not a person" + read-aloud speaker + close (X). Body: message list, farmer/buyer messages right-aligned in turmeric, Balveer's replies left-aligned in white with a small mascot avatar; a typing indicator (three dots) while waiting for a reply. First open shows one greeting bubble from Balveer and 2-3 quick-question chips ("आज गेहूं का भाव?", "पैसा कब मिलेगा?"). Footer: sticky text field with mic button and send button.
G3 Balveer open, desktop (1280px frames): the same header/body/footer as G2 inside a floating panel, 380x560px, anchored bottom-right, sitting above the page content without covering the top nav.
G4 States: greeting (first open), typing, error ("Balveer isn't reachable right now" + Retry, for a timed-out or failed reply), and a quiet "End chat" action that clears the thread.

BEHAVIOR: opening Balveer overlays the current screen, it never navigates away; closing it returns to exactly where the person was; the chat respects the app's current language.

CONSTRAINTS: never covers the tab bar or a screen's sticky bottom action button; no autoplay sound; this is not a permanent record, so do not design a chat-history list screen for it.

Backend status: ✅ POST /chat (send a message; returns thread_id, reply, history -- omit thread_id on the first call, then reuse the one returned), GET /chat/{thread_id} (reopen a thread, e.g. after the app was backgrounded), DELETE /chat/{thread_id} ("End chat"). Restricted to farmer and buyer accounts (backend returns 403 for other roles), so it does not appear in the Agent, Provider or Admin apps. Threads live in memory and expire about 30 minutes after the last message -- there is no server-side chat history beyond that, matching the "temporary chat" framing above.

Acceptance checklist (for the finished Figma file)
 Text contrast at least 4.5:1; never colour-only meaning.
 No critical action below the fold at 390x844 and at 360 wide.
 Touch targets at least 48px; primary buttons 56px.
 Every screen has language chip, help "?", read-aloud speaker; every input has a mic.
 Hindi text is not clipped or truncated (line height 1.5).
 Farmer app: no table, no dropdown, no jargon word.
 Advice screens show reason, range and confidence, and the line "A guide, not a promise".
 Every money screen shows what the person receives, and why it is less than the sale value.
 Commission is shown as deducted from the farmer's sale value, never added to the buyer's bill.
 Balveer's button sits bottom-right on every Farmer and Buyer screen, never covering the tab bar or a sticky bottom action.
Backend readiness (read before you promise features)

✅ endpoint exists and matches the screen. 🟡 exists but needs a named change. 🔴 does not exist.

Screens	Status	What is needed
X1-X8 onboarding, login	✅ / 🟡	state/APMC lookups are public and filters now optional (improves X6); language saved server-side; POST /mandis/nearby still needs a captcha even when logged in
F1 Today	🟡	price and advice cards need Price Radar data; lots and money cards work today
F2, F3 Price Radar and advice	🟡	trend + SELL/HOLD/WATCH advice live via GET /market/price-trend (call per nearby mandi); still needs net-of-transport ranking and an external feed so low-volume mandis aren't stuck on NO_DATA
F4-F10 create lot, choose mode	✅ / 🔴	grade and moisture fields on a lot; "offers" mode
F11 my lots	✅	none
F12 offers and compare	🔴	offers, counter-offers, accept
F13 live bidding (farmer side)	✅	none
F14-F16 deals and money	✅ / 🟡	a single-deal read; everything else exists
F17, F18, X9 grievance, notifications	🔴	both are new modules
F19-F23 services, buyers board, profile	✅ / 🔴	F21 matching ✅ via GET /lots/{lot_id}/matches; still needs provider ratings, buyer counts
P1-P5 FPO	🔴	members, pooled lots, split payouts, demand matching
B1, B4, B7, B8	✅	none
B2, B6 buyer discovery and bidding entry	🟡	an endpoint listing live lots and auctions for buyers
B3, B5, B9 volume finder, offers, trust	✅ / 🔴	B3b matching ✅ via GET /demands/{demand_id}/matches; still needs offers (B5), the multi-seller combination logic (B3), trust score and reviews (B9)
A1, A3, A5, A6 agent	✅	none
A2, A4 farmers and on-behalf lots	🔴	farmer directory, balances, lot creation by an agent with farmer confirmation
agent's own trades	🟡	let agents list trades for their lots
S1-S4 provider jobs, services, calendar	✅	none
S5, S6 earnings, equipment	🔴	earnings summary, service payment record, equipment CRUD
D3 live ops	✅ / 🟡	admin list of all payouts
D7 fee rules	✅	an edit endpoint (today: deactivate and re-create)
D2, D4, D5, D6, D8 and KPIs in D1	🔴	approvals, users, all-bills view, disputes, data health, KPIs, masters, audit log
TASK 12 Balveer chat	✅	none -- restricted to farmer/buyer roles, temporary (in-memory) threads only
<!-- PROPOSED -->
Suggested backend order (proposed order for what's left; Price data and Balveer chat below are already done)
Price data: ✅ done for now -- GET /market/price-trend gives an explainable SELL/HOLD/WATCH signal from internal trade history. Ingesting an external feed (e.g. Agmarknet) so new/low-volume mandis get a trend too is the next step, not a blocker.
Offers (create, counter, accept) and the buyer live-lot listing.
Notifications (SMS or WhatsApp adapters) and grievances.
Verification and admin users, then buyer trust score (paid-on-time rate from existing bills).
Quality grade fields; FPO pooling; agent on-behalf actions; provider equipment, earnings, service payments.
Admin list-all settlements and bills, KPIs, audit log, language preference, single-deal read.
Price data

The Government of India publishes daily wholesale minimum, maximum and most-common (modal) prices by state, district, market, commodity, variety and grade, sourced from the Agmarknet portal, on the Open Government Data platform (data.gov.in, released under the National Data Sharing and Accessibility Policy). A third-party repo confirms the resource carries state, district, market, commodity, variety, grade, arrival_date, min_price, max_price, modal_price, and that a public sample key worked in July 2026. I did not confirm an arrival-quantity column in that open resource, although the Agmarknet portal and CEDA's viewer both mention arrivals. Register for your own data.gov.in key and check the fields before promising "arrival volumes". Note: GET /market/price-trend as it exists today reads only the platform's own settled trades, not this feed -- that's why new or low-volume mandis can come back NO_DATA (see TASK 2).

Sources and how far to trust them
Source	Used for	Trust
data.gov.in / Agmarknet dataset page	Existence, fields, licence of mandi price data	Official
Medhi, Gautama, Toyama, Thies et al., ACM TOCHI 2011 (90 low-literacy users; scrollbar finding)	Interface rules	Peer-reviewed, but 2011 and not India-farmer-only
Summaries of Avaaj Otalo and VideoKheti studies	Graphics + voice, consistent help	Secondary (read via abstracts)
Figma blog and UX articles on Figma Make prompting	Prompt structure: small prompts, front-loaded context and constraints	Figma's own blog is primary; the rest are opinion