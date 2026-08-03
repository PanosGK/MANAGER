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
4. New messages remind you on the footer Chat button (badge + pulse) — not the notification center

Optional: **Settings → Chat** has enable/disable + connection test only.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Εγγραφή απέτυχε / create rule | Admin → users → Create rule = `@request.auth.id = ""` |
| Failed to create record (messages) | messages Create = `@request.auth.id != ""` (no `text:length`) |
| File attach fails / “attachment” | Admin → messages → add File field `attachment` (1 file, 5 MB), make `text` optional, and set **Update** rule to `@request.auth.id != ""` — see [SETUP.md](SETUP.md) |
| Chat shows only “(αρχείο)” / no preview | Same as above — Update rule was deny, so the file never saved; unlock Update and retry |
| Auth failed / old manual password | Open Chat once on a PC that still has the old password (auto-migrates), **or** delete that user in PocketBase Admin → users |
| Auth failed after create | Disable email verification on users collection |
| Network denied | Update loader / allow `@connect` |
| Chat button missing | Settings → Chat → enable (default is on) |
