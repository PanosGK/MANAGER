# MyManager office chat — TrueNAS / PocketBase setup

**TrueNAS data path:** `/mnt/NEW_APPS/APPS_MAIN/Mngr_Chat_DB`  
**Public URL:** `https://mngerchat.littlejol.mywire.org`  
**Admin UI:** `https://mngerchat.littlejol.mywire.org/_/` (root `/` returns PocketBase JSON 404 — that is normal)

## 1. Deploy on TrueNAS

Put `docker-compose.yml` from this folder on the NAS (any apps folder is fine), then:

```bash
# Ensure the dataset exists and is writable by Docker
ls -la /mnt/NEW_APPS/APPS_MAIN/Mngr_Chat_DB

# From the folder that contains docker-compose.yml:
docker compose up -d
docker compose logs -f
# Expect: Server started at http://0.0.0.0:8090
```

The compose file mounts:

`/mnt/NEW_APPS/APPS_MAIN/Mngr_Chat_DB` → container `/pb_data`

So all PocketBase databases and uploads live on that dataset.

If your reverse proxy is another Docker container on the same Compose network, remove the `ports:` block and point the proxy at `myman-chat:8090`.

**LAN smoke test (direct to Docker):** open `http://192.168.1.200:8090/_/`  
If you get `ERR_CONNECTION_REFUSED`, recreate with `ports: ["8090:8090"]`:

```bash
docker compose down
docker compose up -d
docker compose ps
docker compose logs --tail=50
```

## 2. Reverse proxy

Point `https://mngerchat.littlejol.mywire.org` → `http://192.168.1.200:8090` (or `http://myman-chat:8090` on the Docker network).

Required:

- HTTPS (you have this)
- WebSocket / HTTP upgrade support (for PocketBase realtime)
- Forward `Host`, `X-Forwarded-For`, `X-Forwarded-Proto`
- Do **not** cache `/api/`

Smoke test: open `https://mngerchat.littlejol.mywire.org/_/` — PocketBase admin UI.  
Note: `https://mngerchat.littlejol.mywire.org/` (no `/_/`) returns `{"message":"File not found.","status":404}` — expected.

## 3. Create admin

1. Open `https://mngerchat.littlejol.mywire.org/_/`
2. Create a strong **admin** account (password manager). Do not give this to techs.

## 4. Create `messages` collection

Admin → Collections → New collection → name: `messages`

| Field          | Type | Options |
| -------------- | ---- | ------- |
| `text`         | Text | **optional**, max 500 |
| `displayName`  | Text | required, max 64 |
| `store`        | Text | optional, max 64 |
| `profileId`    | Text | optional, max 64 |
| `room`         | Text | required, max 32, default `office` (`office` = all stores; `store_<slug>` = store channel) |
| `attachment`   | File | single file, max **5 MB** (see below) |
| `pbUserId`     | Text | optional, max 32 (PocketBase user id for avatar) |
| `avatar`       | Text | optional, max 255 (avatar filename on `users`) |
| `replyTo`      | Text | optional, max 32 (parent message id) |
| `replyPreview` | Text | optional, max 120 (short quote text) |
| `pinned`       | Bool | optional, default false |
| `deleted`      | Bool | optional, default false (soft-delete; hard Delete rule stays deny) |
| `deletedBy`    | Text | optional, max 64 (display name of who deleted the message) |
| `edited`       | Bool | optional, default false |
| `reactions`    | Text | optional, max 2000 (JSON: `{"👍":["Name"],"❤️":["Name"]}`) |

If `messages` already exists, add any missing fields from the table above.

**Attachment File field** (if missing):

- Max select: **1**
- Max size: **5 MB**
- MIME allow-list: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`, Word/Excel MIME types as before

**API rules:**

Important: each rule has a **lock**. Unlock Create / List / View / Update.

- List / Search: `@request.auth.id != ""`
- View: `@request.auth.id != ""`
- Create: `@request.auth.id != ""`
- Update: `@request.auth.id != ""` *(attach files, reactions, edit, soft-delete)*
- Delete: *(empty — deny; use soft `deleted` from the suite)*

Do **not** add `text:length` or `room = "office"` in Create (store rooms must be allowed).

Enable **Realtime** for `messages`.

## 5. Users collection (accounts + profile photo)

1. **API Rules → Create**: `@request.auth.id = ""`
2. **API Rules → Update**: `@request.auth.id = id`
3. **API Rules → View / List**: `@request.auth.id != ""`
4. Turn **off** email verification.
5. File field **`avatar`**: 1 file, **1 MB**, images only.

## 6. Create `presence` collection (online + read receipts)

Admin → New collection → name: `presence`

| Field         | Type | Options |
| ------------- | ---- | ------- |
| `userId`      | Text | required, max 32 (PocketBase users id) |
| `displayName` | Text | required, max 64 |
| `profileId`   | Text | optional, max 64 |
| `store`       | Text | optional, max 64 |
| `lastSeen`    | Date | required |
| `lastReadAt`  | Date | optional (panel open → mark messages seen) |
| `avatar`      | Text | optional, max 255 (filename on `users` — so everyone sees the same photo online) |

API rules (all unlocked for auth users):

- List / View / Create / Update: `@request.auth.id != ""`
- Delete: empty (deny)

Enable **Realtime** for `presence` if available.

The suite heartbeats every ~25s while chat is connected and updates `lastReadAt` when the panel is open. It also refreshes the users avatar directory so profile photos stay in sync for everyone.

## 7. Backups

Include `/mnt/NEW_APPS/APPS_MAIN/Mngr_Chat_DB` in TrueNAS periodic snapshots.

## 8. Server checklist

- [ ] Admin UI loads
- [ ] `messages` + attachment + avatar/pbUserId + reply/deleted/edited + **reactions** fields
- [ ] `users.avatar` + Update/List/View rules
- [ ] `presence` collection + rules (+ optional `avatar`)
- [ ] Realtime enabled for messages (and presence)
- [ ] Snapshot covers chat DB dataset

## 9. Suite (each tech)

1. Update Tampermonkey loader if needed (`@connect` includes chat host).
2. Chat is **on by default** — footer **💬 Chat**.
3. Features in the panel: search, reply, reactions (👍/❤️), copy, @mentions, edit/delete own, presence, draft autosave, quiet hours, optional sound (Settings → Chat).
4. Profile photo: **Settings → Chat** (synced via `users.avatar` + message `pbUserId`/`avatar` + presence).

Display names come from the MyManager login name.
