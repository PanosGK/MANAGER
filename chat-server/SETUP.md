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
| `text`        | Text | **optional**, max 500            |
| `displayName` | Text | required, max 64                 |
| `store`       | Text | optional, max 64                 |
| `profileId`   | Text | optional, max 64                 |
| `room`        | Text | required, max 32, default `office` |
| `attachment`  | File | single file, max **5 MB** (see below) |

If `messages` already exists:

1. Add field **`store`** (Text, optional, max 64) so each message can show the technician’s store.
2. Make **`text` optional** (uncheck Required) so file-only messages work.
3. Add field **`attachment`** (File):
   - Max select: **1**
   - Max size: **5 MB**
   - MIME / types allow-list:
     - `image/jpeg`, `image/png`, `image/webp`, `image/gif`
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
     - `application/vnd.ms-excel`
     - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

Uploads are stored on the TrueNAS dataset under `/pb_data` (same volume as the database).

**API rules (v1 — one shared room):**

Important: each rule has a **lock**. If Create is locked (“Admins / Superusers only”), regular tech accounts get `Failed to create record` even with a correct rule. **Unlock** Create / List / View.

Then set:

- List / Search: `@request.auth.id != ""`
- View: `@request.auth.id != ""`
- Create: `@request.auth.id != ""`
- Update: `@request.auth.id != ""` *(needed so the suite can attach files after creating the message)*
- Delete: *(empty — deny; delete only in Admin UI)*

Do **not** add `text:length` or `room = "office"` in Create. Save, then retry send in MyManager.

Enable **Realtime** for the `messages` collection if your PocketBase UI shows that toggle (SSE still works when subscribed via API).

## 5. Create tech users (self-register)

Techs use suite **Settings → Chat → Δημιουργία λογαριασμού**.

For that to work, **users** collection:

1. **API Rules → Create**: unlock (not Admins only) and set:

```
@request.auth.id = ""
```

2. Turn **off** email verification / confirm email requirements.
3. Optional: List/View can stay authenticated-only.

If Create stays locked, the suite cannot auto-create users — check Create rule and email verification.

## 6. Backups

Include `/mnt/NEW_APPS/APPS_MAIN/Mngr_Chat_DB` in TrueNAS periodic snapshots. Snapshot once after first successful setup before inviting everyone.

## 7. Server checklist

- [ ] `https://mngerchat.littlejol.mywire.org/_/` loads
- [ ] Admin login works
- [ ] `messages` collection + rules exist
- [ ] `messages.attachment` File field exists (5 MB, MIME allow-list) and `text` is optional
- [ ] At least one non-admin test user exists
- [ ] Page loads from off-LAN (proxy + DNS OK)
- [ ] Snapshot covers `/mnt/NEW_APPS/APPS_MAIN/Mngr_Chat_DB`

## 8. Suite (each tech)

1. Tampermonkey → update the **loader** once if needed (`@connect` includes this host).
2. Open MyManager — chat is **on by default**.
3. Click **💬 Chat** in the footer. First use auto-registers from the login name (no password in Settings).
4. New messages show a badge / pulse on the footer Chat button (not the suite notification center).
5. Optional: **Settings → Chat** → enable/disable or **Έλεγχος σύνδεσης**.

Display names in chat come from the MyManager login name, not from typing an account.
