# Social fan-out: YouTube first, then Instagram, Facebook, Pinterest

Every slot (Chakra Puzzle, Kaali Peeli Chase, EpicBharatSaga) goes out in this order. Each platform sends viewers
back to YouTube to watch and subscribe.

| When | Platform | What | Call to action |
|---|---|---|---|
| T (slot time) | YouTube Short | full video (scheduled upload, goes public at T) | — |
| T + 5 min | Instagram Reel | same video | "Roz naya video pehle YouTube pe — search @Handle · subscribe · link in bio" |
| T + 10 min | Facebook Reel | **teaser**: first ~60 % (max 12 s, before the answer), last 2.5 s banner "Pura video + jawab YouTube pe" | YouTube Short link + channel link |
| T + 15 min | Pinterest Pin | **thumbnail** (frame from the video + "YouTube pe pura dekho" banner) | pin link = the YouTube Short |

- Gap: `SOCIAL_GAP_MIN` repo variable (default 5).
- Code: `scripts/publish/social.ts` (called by `scripts/post.ts --meta`), workflow `publish-channels.yml`.
- A platform without its secrets is skipped (logged), the others still run.
- Results per platform are stored in the ledger (`videobot.channel_posts.social`). A platform that succeeded **or failed**
  for a slot is never posted again automatically, so there are no duplicate Reels. A failure needs a manual check.

## Recommended: connect from the dashboard (no token copy-paste)

Dashboard → **Social** tab → per channel **Connect Instagram + Facebook** / **Connect Pinterest** → log in → Allow.
Tokens are stored AES-256-GCM encrypted in `videobot.social_accounts` (key derived from the service-role key) and the
publish job reads them from there. One Facebook login brings all Pages; a Page whose name matches a channel is mapped
automatically, otherwise pick it from the list. Pinterest: one account per channel, so log in to pinterest.com with that
channel's account before pressing Connect; then pick or create the board.

One-time app setup (Render env, never GitHub):
| Render env | Where |
|---|---|
| `META_APP_ID`, `META_APP_SECRET` | developers.facebook.com → app (Business) → Settings → Basic. Add product *Facebook Login for Business*; **Valid OAuth Redirect URI** = `https://<bot>/admin/connect/meta/callback`. In Development mode it works for app admins/testers without App Review. |
| `PINTEREST_APP_ID`, `PINTEREST_APP_SECRET` | developers.pinterest.com → app → redirect URI `https://<bot>/admin/connect/pinterest/callback`; request **Standard access** |

Pinterest access tokens (~30 days) are refreshed by the bot server when a publish job needs one (`/internal/pinterest-refresh`,
HMAC-signed with the service-role key). The GitHub secrets below still work and take precedence (manual override).

## Alternative: secrets per channel (each channel has its own accounts)

| Channel | Instagram + Facebook (Meta) | Pinterest |
|---|---|---|
| Chakra Puzzle | `META_CHAKRA_PAGE_ID`, `META_CHAKRA_IG_USER_ID`, `META_CHAKRA_PAGE_TOKEN` | `PINTEREST_CHAKRA_REFRESH_TOKEN`, `PINTEREST_CHAKRA_BOARD_ID` |
| Kaali Peeli Chase | `META_KPC_PAGE_ID`, `META_KPC_IG_USER_ID`, `META_KPC_PAGE_TOKEN` | `PINTEREST_KPC_REFRESH_TOKEN`, `PINTEREST_KPC_BOARD_ID` |
| EpicBharatSaga | `META_EBS_PAGE_ID`, `META_EBS_IG_USER_ID`, `META_EBS_PAGE_TOKEN` | `PINTEREST_EBS_REFRESH_TOKEN`, `PINTEREST_EBS_BOARD_ID` |
| shared | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (hosts the MP4 for Meta; ledger) | `PINTEREST_APP_ID`, `PINTEREST_APP_SECRET` (one developer app) |

### Meta (per channel)
1. The Instagram account must be **Professional (Business or Creator)** and **linked to that channel's Facebook Page**
   (Instagram → Settings → Account type and tools; Page → Settings → Linked accounts).
2. One Meta developer app (type Business) with *Instagram Graph API* + *Facebook Login for Business*. Permissions:
   `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `business_management`.
3. Graph API Explorer → user token with those permissions → exchange for a **long-lived user token** →
   `GET /me/accounts` → the Page's `access_token` (long-lived page token, does not expire) = `META_<X>_PAGE_TOKEN`, its `id` = `META_<X>_PAGE_ID`.
4. `GET /<PAGE_ID>?fields=instagram_business_account` → `id` = `META_<X>_IG_USER_ID`.
5. Supabase Storage bucket `meta-publishing` must be **public** (Meta downloads the MP4 from it).

### Pinterest (per channel)
1. Each channel's Pinterest account → **Business account**. Create a board (e.g. "Chakra Puzzle — daily puzzles");
   its id (from `GET /v5/boards`) = `PINTEREST_<X>_BOARD_ID`.
2. One app at developers.pinterest.com → `PINTEREST_APP_ID` / `PINTEREST_APP_SECRET`. Scopes: `boards:read`, `pins:read`, `pins:write`.
3. Per account, OAuth once → keep the **refresh token** (valid ~1 year) = `PINTEREST_<X>_REFRESH_TOKEN`. Each run refreshes it into a fresh access token.
4. **Standard access**: a new app has *Trial* access, and Pins created through it are visible only to you. Request Standard access
   in the developer portal (attach a short screen recording of the OAuth flow, creating a pin, and the pin on the board). Review takes about 1–2 weeks.

## Bio links (one time, by hand): every profile points to YouTube
- Instagram bio: `▶️ Roz naya puzzle YouTube pe 👇` + website link `https://youtube.com/@ChakraPuzzle` (and the same for the other channels).
- Facebook Page: *Add button* → "Watch video" / "Learn more" → `https://youtube.com/@…`; also in the About website field.
- Pinterest profile: website = `https://youtube.com/@…` (claim it under Settings → Claimed accounts → YouTube).
- YouTube channel → Customise → Links: add the Instagram, Facebook and Pinterest profiles, so traffic flows both ways.
