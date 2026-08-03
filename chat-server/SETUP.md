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

| Field         | Type | Options                          |
| ------------- | ---- | -------------------------------- |
| `text`        | Text | required, max 500                |
| `displayName` | Text | required, max 64                 |
| `profileId`   | Text | optional, max 64                 |
| `room`        | Text | required, max 32, default `office` |

**API rules (v1 — one shared room):**

- List / Search: `@request.auth.id != ""`
- View: `@request.auth.id != ""`
- Create: `@request.auth.id != ""`
- Update: *(empty — deny)*
- Delete: *(empty — deny; delete only in Admin UI)*

Use exactly those. Do **not** add `text:length` or `room = "office"` in Create (those often cause “Failed to create record”). The script always sends `room: "office"`. Max length stays on the Text field (max 500).

If Create still fails, open Admin → **Logs** (or the request response) for the field error.

Enable **Realtime** for the `messages` collection if your PocketBase UI shows that toggle (SSE still works when subscribed via API).

## 5. Create tech users (optional manual)

Techs can self-register from suite **Settings → Chat → Δημιουργία λογαριασμού** (auto email + their password).

For that to work, set the **users** collection **Create** API rule to:

```
@request.auth.id = ""
```

Also turn **off** “Require email verification” / similar options on the `users` auth collection (fake `@myman.chat` addresses won’t verify).

You can still create users manually in Admin if you prefer.

## 6. Backups

Include `/mnt/NEW_APPS/APPS_MAIN/Mngr_Chat_DB` in TrueNAS periodic snapshots. Snapshot once after first successful setup before inviting everyone.

## 7. Server checklist

- [ ] `https://mngerchat.littlejol.mywire.org/_/` loads
- [ ] Admin login works
- [ ] `messages` collection + rules exist
- [ ] At least one non-admin test user exists
- [ ] Page loads from off-LAN (proxy + DNS OK)
- [ ] Snapshot covers `/mnt/NEW_APPS/APPS_MAIN/Mngr_Chat_DB`

## 8. Suite (each tech)

1. Tampermonkey → update the **loader** once if needed (`@connect` includes this host).
2. MyManager → Suite **Settings → Chat**.
3. Enable chat, paste:

   `https://mngerchat.littlejol.mywire.org`

4. Enter PocketBase username + password.
5. **Έλεγχος σύνδεσης** → Save & reload.
6. Use the **Chat** button (right slide-out area).

Display names in chat come from the MyManager login (`tmCurrentUser`), not from the PocketBase username.
