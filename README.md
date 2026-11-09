# 電話占い 月あかり — Phone Fortune-Telling Platform (Next.js)

A complete phone fortune-telling site. It includes:

- A public website.
- An app-free browser calling system.
- Request-based reservations, with fixed-time and metered sessions.
- Fortune-teller status and schedules.
- Affiliate tracking and automatic review requests.
- A WordPress-style admin CMS with campaign banners and a column blog.
- A daily horoscope with moon phases.
- An inquiry chatbot.

## Quick start

```bash
npm install
npm run build && npm start      # or: npm run dev
# open http://localhost:3000
```

Locally, data is stored in `data/db.json`, which is created with demo data on the first request. To start over, run `npm run reset-db`. This also deletes uploaded images, and clears Redis too if Redis variables are set in `.env.local`.

## Deploying to Vercel

Vercel's servers have a **read-only filesystem**, so the local `data/db.json` file cannot be used there. The app picks its storage automatically (`lib/storage.ts`):

| Environment | Storage | Data kept? |
|---|---|---|
| Vercel **with** Upstash Redis connected | Upstash Redis (REST API) | Yes. Shared by all server instances |
| Vercel **without** Redis | The server's temporary folder (`/tmp`) | No. The site works, but data returns to the demo state when the server restarts. The admin panel shows a warning |
| Local (`npm run dev` / `npm start`) | `data/db.json` | Yes |

**Setup (once, free plan is enough):**
1. In the Vercel dashboard, open the project → **Storage** → **Create Database** → **Upstash for Redis** (Marketplace) → Free plan. Choose the region nearest your functions; for Japanese users, Tokyo (`ap-northeast-1`) with the function region set to `hnd1`.
2. **Connect** it to this project for all environments. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically. If you created the database on upstash.com instead, add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` yourself.
3. **Redeploy** (Deployments → ⋯ → Redeploy), or push a new commit.
4. Open `https://<your-domain>/api/health`. It should show `"storage":"redis"` and `"persistent":true`. Demo data is created on the first request.

**Notes:**
- **Concurrent writes:** in Redis mode, the whole dataset is stored as one versioned document. Concurrent writes use compare-and-set and are retried, so no update is lost. Each server instance caches the document and only downloads it again when the version changes. This suits a demo or a small site; move to PostgreSQL as traffic grows (all access goes through `readDb`/`updateDb`).
- **Uploads:** images are stored in Redis and served from `/api/uploads/…` with long-term CDN caching. The browser shrinks large photos to at most 1600px before upload, because Vercel rejects request bodies over 4.5MB.
- **Resetting a deployment:** run `npm run reset-db` locally with the same Redis variables in `.env.local`, or delete the `tsukiakari:*` keys in the Upstash console.

### Demo accounts

| Role | Email | Password | Lands on |
|---|---|---|---|
| User | `user@example.com` | `user1234` | `/mypage` |
| Fortune teller (月詠 紫苑) | `teller@example.com` | `teller1234` | `/teller` |
| Admin | `admin@example.com` | `admin1234` | `/admin` |

Other seeded logins all use `user1234` (users) or `teller1234` (tellers). The users are `sato@`, `suzuki@` and `takahashi@example.com`. The tellers are `teller2@` … `teller12@example.com`. The login page has one-click buttons for the three main accounts.

**To try a call:** log in as the user and the teller in **two different browsers** (or one normal window and one private window), because the session cookie is shared within a browser.
1. As the user, open 月詠 紫苑 → 鑑定リクエスト → 今すぐ鑑定.
2. As the teller, go to `/teller` → 承認する.
3. Both press 入室する.

The microphone needs `localhost` or HTTPS. If no microphone is available, the call room continues with a silent track so the flow can still be tested.

## How each client requirement is implemented

| Requirement | Implementation |
|---|---|
| **Call costs:** stable calls with no app install | WebRTC browser-to-browser audio (`components/CallRoom.tsx`, `app/api/calls/[id]`). Echo cancellation and noise suppression are on. It reconnects automatically and supports rejoining within 45 seconds. There are no phone-line charges. |
| **Customer acquisition:** affiliate revenue from teller SNS/blogs | Each teller gets a link `/r/{code}` (with `?to=register` for the sign-up page) and a banner HTML snippet. Clicks are counted, and a 30-day cookie attributes sign-ups. Rewards are a sign-up bonus plus X% of every session the referred user ever pays for. The teller sees stats at `/teller/affiliate`; the admin marks payouts at `/admin/affiliate`. |
| **Reservations:** fixed 20/30/45/60 min **and** metered, confirmed only on teller approval | The user sends a *request*, either 今すぐ or a date and time inside the teller's schedule. The teller approves or declines, and the user is notified and emailed. Fixed sessions auto-end at the limit. Metered sessions bill per minute and auto-end when points run out. Points are checked at request, approval and join. Double-booking is blocked. |
| **Teller availability:** pre-entered schedule plus live status changes | Teller enters bulk schedules (date range × weekdays × time) at `/teller/schedule`. Status follows the schedule automatically (slot start → 待機中, slot end → 受付終了). The teller can switch to 離席中 or other statuses at any time, and manual changes win. It becomes 鑑定中 automatically during a call and the previous status is restored afterwards. The home page shows today's schedule as a timeline. |
| **Reviews:** auto-prompt users with N+ repeats | When a session completes and the user has reached the threshold with that teller (default 3, set in `/admin/settings`), a notification and an email ask them for a review. My Page shows a banner. Only users who actually had a session can post. Reviews are moderated, with optional auto-publish. The admin can resend requests. |
| **Website:** easy updates like WordPress | The admin CMS (`/admin`) covers: news, events and **columns** (category, cover image, toolbar editor with inline image upload); **top-page campaign banners** (`/admin/banners`); adding and editing tellers (profile, photo or silhouette portrait, price, login); hero copy and announcement bar; chatbot name and photo; review and affiliate settings. |
| Chatbot leading to inquiries | Guided FAQ flow ("how to choose a teller", prices, booking, connection trouble, recruiting) plus keyword answers. Every path ends at an in-chat inquiry (saved and auto-replied) or the contact form. |

Abandoned calls are settled automatically, and unanswered or expired requests are cleaned up with a notification to the user (`housekeeping()` in `lib/logic.ts`).

## Public pages

| Page | Contents |
|---|---|
| `/` | Photo hero with a live "waiting now" panel; trust bar; campaign banners (admin-editable); waiting tellers; search by topic and by divination method; monthly ranking (by sessions in the last 30 days); today's schedule timeline (auto-scrolls to the current time on phones); features; the two session types; the flow; horoscope top 3 and moon phase; reviews; columns; news; brand story; CTA |
| `/tellers` | One-tap topic/method chips, keyword search, sort (recommended, popular, rating, price), waiting-only toggle |
| `/tellers/[id]` | Profile, quick stats, 7-day schedule, request form, reviews, similar tellers |
| `/horoscope` | 12-sign daily ranking with love/work/money stars and lucky color and item, plus the moon phase with the next new and full moon |
| `/column`, `/column/[slug]` | Column blog with categories, plus a sidebar showing related posts and waiting tellers |
| `/news`, `/news/[slug]` | News and events (column URLs under `/news` redirect to `/column`) |
| `/about` | Brand story built on the client's ~10 years running a reading house, the service's three promises, teller screening, and Hiroshige moon prints |
| `/guide`, `/faq`, `/recruit`, `/contact` | Price simulation table, point bonus table, a categorized FAQ, recruiting and the affiliate scheme, and the contact form |

The daily horoscope (`lib/horoscope.ts`) is **template content**: the ranking and messages are generated from the date, so everyone sees the same result that day. Replace it with copy supervised by a teller if needed. Moon phases (`lib/moon.ts`) use Meeus's lunar phase formulas; the computed 2026 new and full moons match published times to the minute.

## Billing rules

- 1pt = ¥1. Calls themselves are free; only the per-minute session fee is charged.
- **Fixed:** duration × rate. If the user ends early, the full booked duration is charged. If the teller ends early or the line drops, only the minutes actually used are charged.
- **Metered:** charged per started minute, with a 5-second grace period, capped at the user's balance.

## Images and copy

See **[IMAGE_CREDITS.md](IMAGE_CREDITS.md)** for every file, its source, its creator and its license.

- **Photos (34 files, `public/images/photos`)** are CC0: free for commercial use, no attribution required. They come from StockSnap.io and the WordPress Photo Directory. Only scenery and objects were used, with no identifiable faces. The three ukiyo-e moon prints by Utagawa Hiroshige are public domain, via The Met Open Access (CC0).
- **Teller portraits** are original SVG silhouettes against the moon (12 variants, chosen per teller in the admin). **The chatbot guide** is an original illustration of a woman in her 20s in a yukata.
- All copy is original. Nothing was taken from the reference sites in the brief.

### Images that should be bought or shot before launch

Free stock photos cannot cover these two needs. They need either the client's own photos, or paid stock images with a model release.

| Need | Recommendation | Where it goes |
|---|---|---|
| **Teller profile photos** | Photos of the actual tellers (a short session per teller), or an illustration each teller approves. **Do not use stock models as teller photos**: that presents a stranger as the person giving the readings, which misleads customers. | Admin → 占い師管理 → 画像 (portrait 5:6, ≥ 800×960px) |
| **Chatbot guide photo** (Japanese woman in her 20s) | A model-released stock photo, e.g. from PIXTA (strong Japanese model catalogue), Adobe Stock, Shutterstock or iStock. Search terms like 「20代 女性 着物 笑顔」 or 「浴衣 女性 案内」. | Admin → サイト設定 → 案内係の画像 (square, ≥ 400×400px) |
| Optional: seasonal campaign photos | Any licensed or CC0 photo | Admin → トップバナー (4:3, ≈ 1200×900px) |

Before buying a photo of a person, check the stock site's **"sensitive use" rules** for people images. Some licenses restrict using a model's face for certain services, or require a note that the person is a model. A standard web license is enough for site use. Keep the license receipt.

## Before going live

| Area | Demo behavior | Production |
|---|---|---|
| Database | Local: JSON file. Vercel: Upstash Redis (see "Deploying to Vercel") | Upstash Redis is fine for launch-scale traffic. Move to PostgreSQL or MySQL as data grows (all access goes through `readDb`/`updateDb` in `lib/db.ts`) |
| Call reliability | Public STUN only | **A TURN server is required** for users behind strict NATs or mobile carriers. Set `NEXT_PUBLIC_TURN_*` (coturn, Twilio NTS, Cloudflare TURN), or use a managed SDK such as SkyWay, Agora or Twilio |
| Payments | Points are added instantly | Stripe, PAY.JP or GMO-PG |
| Email | Logged at `/admin/mails` | SendGrid or Amazon SES |
| Uploads | Local disk, or Redis on Vercel | Vercel Blob, S3 or Cloud Storage for large volumes |
| HTTPS | — | Required, because browsers only allow the microphone on HTTPS |
| Legal pages | Templates | Terms, privacy policy and 特商法 page reviewed by counsel. The 180-day point expiry in the terms is not enforced automatically |
| Template content | Demo tellers, reviews, columns, banners and the About page | Replace with the client's real tellers and photos. Confirm the About/Recruit process descriptions (screening, interviews) match actual practice |
