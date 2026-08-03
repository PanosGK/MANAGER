# Office chat — tech rollout

After PocketBase is running (see [SETUP.md](SETUP.md)):

## 1. Update Tampermonkey loader (once)

Custom Ver. **37.1+** allows the chat host.

1. Tampermonkey → Dashboard → **MyManager All-in-One Suite**
2. Settings → **Check for userscript updates**  
   Or open the raw loader URL and click Override/Update.
3. Accept any new permission prompt for network access.

## 2. Get credentials from admin

Ask the person who runs PocketBase for:

- Chat URL: `https://mngerchat.littlejol.mywire.org`
- Your **user** username/email (not admin)
- Your password

## 3. Configure in MyManager

1. Open suite **Settings → Chat**
2. Enable chat
3. Paste URL: `https://mngerchat.littlejol.mywire.org`
4. Enter user + password
5. Click **Έλεγχος σύνδεσης** — should say OK
6. **Αποθήκευση & Επαναφόρτωση**

## 4. Use it

- Click **💬 Chat** in the right slide-out button area
- Messages use your MyManager login name as display name
- Mute with the bell icon in the chat header

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Auth failed | Wrong user/pass; confirm account in PocketBase Admin → users |
| Network / connect denied | Update loader; allow `@connect` for `mngerchat.littlejol.mywire.org` |
| Empty chat but OK auth | Confirm `messages` collection rules allow list+create for authenticated users |
| Domain won’t open | Check reverse proxy → `192.168.1.200:8090`; try LAN URL `http://192.168.1.200:8090/_/` |
| Data / wipe concerns | PocketBase files live on `/mnt/NEW_APPS/APPS_MAIN/Mngr_Chat_DB` — snapshot that dataset |
