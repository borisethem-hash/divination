# 電話占い 月あかり — Phone Fortune-Telling Platform (Next.js)

A complete phone fortune-telling site: a public website, an app-free browser calling system, request-based reservations, fixed-time and metered sessions, fortune-teller status and schedules, affiliate tracking, automatic review requests, a WordPress-style admin CMS, and an inquiry chatbot.

## Quick start

```bash
npm install
npm run build && npm start      # or: npm run dev
# open http://localhost:3000
```

The database (`data/db.json`) is created with demo data on the first request. To start over, run `npm run reset-db`; this also deletes uploaded images.

### Demo accounts

| Role | Email | Password | Lands on |
|---|---|---|---|
| User | `user@example.com` | `user1234` | `/mypage` |
| Fortune teller (月詠 紫苑) | `teller@example.com` | `teller1234` | `/teller` |
| Admin | `admin@example.com` | `admin1234` | `/admin` |

Other seeded logins all use `user1234` (users) or `teller1234` (tellers): `sato@`, `suzuki@` and `takahashi@example.com` are users, and `teller2@` … `teller8@example.com` are tellers. The login page has one-click buttons for the three main accounts.

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
| **Teller availability:** pre-entered schedule plus live status changes | Teller enters bulk schedules (date range × weekdays × time) at `/teller/schedule`. Status follows the schedule automatically (slot start → 待機中, slot end → 受付終了). The teller can switch to 離席中 or other statuses at any time, and manual changes win. It becomes 鑑定中 automatically during a call and the previous status is restored afterwards. |
| **Reviews:** auto-prompt users with N+ repeats | When a session completes and the user has reached the threshold with that teller (default 3, set in `/admin/settings`), a notification and an email ask them for a review. My Page shows a banner. Only users who actually had a session can post. Reviews are moderated, with optional auto-publish. The admin can resend requests. |
| **Website:** easy updates like WordPress | The admin CMS (`/admin`) covers: news and events with a toolbar editor and inline image upload; adding and editing tellers (profile, photo, price, login); hero copy and announcement bar; chatbot name and photo; review and affiliate settings. |
| Chatbot leading to inquiries | Guided FAQ flow plus keyword answers. Every path ends at an in-chat inquiry (saved and auto-replied) or the contact form. |

Abandoned calls are settled automatically, and unanswered or expired requests are cleaned up with a notification to the user (`housekeeping()` in `lib/logic.ts`).

## Billing rules

- 1pt = ¥1. Calls themselves are free; only the per-minute session fee is charged.
- **Fixed:** duration × rate. If the user ends early, the full booked duration is charged. If the teller ends early or the line drops, only the minutes actually used are charged.
- **Metered:** charged per started minute, with a 5-second grace period, capped at the user's balance.

## Before going live

| Area | Demo behavior | Production |
|---|---|---|
| Database | JSON file (`data/db.json`) | PostgreSQL or MySQL (all access goes through `readDb`/`updateDb` in `lib/db.ts`) |
| Call reliability | Public STUN only | **A TURN server is required** for users behind strict NATs or mobile carriers. Set `NEXT_PUBLIC_TURN_*` (coturn, Twilio NTS, Cloudflare TURN), or use a managed SDK such as SkyWay, Agora or Twilio |
| Payments | Points are added instantly | Stripe, PAY.JP or GMO-PG |
| Email | Logged at `/admin/mails` | SendGrid or Amazon SES |
| Uploads | `data/uploads` on local disk | S3 or Cloud Storage |
| HTTPS | — | Required, because browsers only allow the microphone on HTTPS |
| Legal pages | Templates | Terms, privacy policy and 特商法 page reviewed by counsel |

## Images and copy

All artwork is original SVG: illustrated tellers in kimono, a moonlit torii scene, seigaiha and asanoha patterns, and the yukata-wearing chatbot guide. All copy is original. No text or images were taken from third-party fortune-telling sites. Replace the artwork with **licensed photos** (the client's own teller photos, or stock or commissioned model photos) from the admin panel. Teller photos are under 占い師管理. The chatbot guide's photo is under サイト設定.
