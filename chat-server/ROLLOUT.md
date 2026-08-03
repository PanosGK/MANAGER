# Office chat — tech rollout

After PocketBase is running (see [SETUP.md](SETUP.md)) and **users Create** rule allows registration:

## 1. Update Tampermonkey loader

1. Tampermonkey → Dashboard → **MyManager All-in-One Suite**
2. Check for userscript updates / Override the loader
3. Accept network permission for `mngerchat.littlejol.mywire.org` if asked

## 2. Use chat (no Settings password)

1. Open MyManager as usual
2. Click **💬 Chat** in the footer
3. First open auto-creates the PocketBase user from the login name (e.g. `gkorogias@myman.chat`) with a silent password — nothing to type
4. New messages remind you on the footer Chat button (badge + pulse + optional sound) — not the notification center

Optional: **Settings → Chat** — enable/disable, profile photo, sound, connection test.

### Panel features

| Feature | How |
| --- | --- |
| Rooms | **Όλοι** (office) / **Κατάστημα** (store channel) |
| Search | Top search box |
| @mentions | Type `@` — autocomplete; stronger ping when mentioned |
| Reply / reactions / copy / edit / delete | Right-click message (👍 ❤️ lighter than pin) |
| Draft autosave | Composer text kept if you close the panel |
| Quiet hours | Auto-mute outside work hours (Settings → Chat) |
| Repair links | `#12345` or 5–8 digit numbers → service search |
| Presence | Online faces row + typing line (needs `presence` + optional `typingUntil`) |
| @mentions | `@` button filters / jumps to messages that tagged you |
| Repair cards | `#12345` in a message loads status / tech / store mini-card |
| Read receipts | ✓✓ on your messages when peers opened chat |
| Shared order history | PocketBase `order_history` per store; panel Server button (**works with Chat disabled**) |

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Εγγραφή απέτυχε / create rule | Admin → users → Create rule = `@request.auth.id = ""` |
| Failed to create record (messages) | messages Create = `@request.auth.id != ""` (no `text:length`) |
| File attach fails / “attachment” | Admin → messages → File `attachment` + Update `@request.auth.id != ""` |
| Chat shows only “(αρχείο)” / no preview | Unlock messages Update rule |
| Profile photo upload fails | users `avatar` File + Update `@request.auth.id = id`; View/List `@request.auth.id != ""` |
| Initials only (no photo) | users List/View unlocked; photo applies after upload |
| Reply / delete / edit / reactions ignored | Add `replyTo`, `replyPreview`, `deleted`, `edited`, `reactions` on messages (see SETUP) |
| No Online line / empty `presence` | Unlock List+Create+Update on `presence` with `@request.auth.id != ""` (empty rule = Admin only). Chat status shows the Presence hint. |
| Auth failed / old manual password | Open Chat once on a PC that still has the old password, or delete user in Admin |
| Auth failed after create | Disable email verification on users |
| Network denied | Update loader / allow `@connect` |
| Order history Server fails / no shared rows | Create `order_history` + unique `dedupeKey` + unlock List/Create/Update. Does **not** need Chat enabled. |
| Chat button missing | Settings → Chat → enable |
