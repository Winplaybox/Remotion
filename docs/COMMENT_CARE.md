# Comment care (all channels)

`scripts/publish/engage.ts` runs hourly (publish-channels.yml, `answers` job) for **every** channel, quiz or not.

| step | when | where it works |
|---|---|---|
| Like the comment | ≥ 30 min after the comment | **Facebook only** (Graph `/{comment}/likes`; needs `pages_manage_engagement`) |
| Reply | ≥ 60 min after the comment (30 min after the like) | YouTube, Instagram, Facebook |
| Hide abuse/spam | immediately | YouTube (held for review), Instagram, Facebook |

- **YouTube**: the Data API has no comment-like and no creator "heart". **Instagram**: Graph API has no comment-like. Both get the reply only. Doing it through a browser bot breaks platform rules and risks the channel, so it is not built.
- Quiz channels (config has `quiz`): answer-aware ✅/❌ reply. Other channels (e.g. Jasoos Bhai): friendly thank-you; negative/empty comments get nothing.
- Dashboard switches per channel: `auto_reply`, `auto_like`, `moderate`. Delays: env `ENGAGE_LIKE_AFTER_MIN` (30), `ENGAGE_REPLY_AFTER_MIN` (60).
- Real delay = minimum + up to one hourly tick. Never replies twice (`videobot.comment_replies`).
