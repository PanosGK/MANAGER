# Office chat — tech rollout

After PocketBase is running (see [SETUP.md](SETUP.md)) and **users Create** rule allows registration:

## 1. Update Tampermonkey loader

1. Tampermonkey → Dashboard → **MyManager All-in-One Suite**
2. Check for userscript updates / Override the loader
3. Accept network permission for `mngerchat.littlejol.mywire.org` if asked

## 2. Configure in MyManager (self-service)

1. Open suite **Settings → Chat**
2. Enable chat
3. Server URL: `https://mngerchat.littlejol.mywire.org` (prefilled)
4. **Email** is filled automatically from your MyManager name (e.g. `something@myman.chat`)
5. Choose a **chat password** (8+ chars) and confirm it — not your MyManager password
6. Click **Δημιουργία λογαριασμού**
7. Then **Αποθήκευση & Επαναφόρτωση**
8. Use **💬 Chat**

If the account already exists, use **Έλεγχος σύνδεσης** with the same email + password.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Εγγραφή απέτυχε / create rule | Admin → users → Create rule = `@request.auth.id = ""` |
| Failed to create record (messages) | messages Create = `@request.auth.id != "" && room = "office"` (no `text:length`) |
| Email already exists | Use Έλεγχος σύνδεσης with the password you set before |
| Auth failed after create | Disable email verification on users collection |
| Network denied | Update loader / allow `@connect` |
