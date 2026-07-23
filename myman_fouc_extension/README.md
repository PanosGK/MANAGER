# MyManager FOUC Guard (Chrome extension)

Blanks **MyManager** before first paint, then remounts **suite UI chrome + CSS** until the Tampermonkey suite hydrates live values.

## Install / update

1. `chrome://extensions` → Developer mode  
2. **Load unpacked** → `myman_fouc_extension` (or **Reload**)  
3. Confirm version **1.10.0** + **storage** permission  
4. Hard-refresh MyManager

## What is cached (v1.10.1)

**HTML shells** remounted at the **exact parent + sibling index** (and inline `style`) they had when the suite painted them — not guessed into a generic slot.

**CSS:** all suite styles (`#tm-*` / `.tm-*` / `--tm-*`) via `tm_mms_suite_css`.

## Console checks

**Seed:**
```
[FOUC] guard v1.10.1 ready (thefixers.mymanager.gr) — exact-placement UI shells
[FOUC] cached suite CSS (~NKB) from live-dom
[FOUC] cached N UI shell(s) … from live-dom
```

**Next visit:**
```
[FOUC] suite CSS applied early (~NKB)
[FOUC] mounted N UI shell(s)
```
