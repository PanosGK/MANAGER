// ==UserScript==
// @name         MyMANAGER Repair Reminders (module)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Scheduled notifications for repairs — loaded via @require from myman_allinone
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
    'use strict';

    /**
     * Read iInvoiceLinesID / iInvoiceNumber / iStatusID from Runner globals, inline scripts, URL, or page title.
     */
    function getServiceIdsFromPage() {
        try {
            const w = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
            if (w.iInvoiceLinesID != null && w.iInvoiceNumber != null) {
                return {
                    invoiceLinesId: String(w.iInvoiceLinesID),
                    invoiceNumber: String(w.iInvoiceNumber),
                    statusId: w.iStatusID != null ? String(w.iStatusID) : '',
                };
            }
        } catch (_) { /* ignore */ }

        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            const t = scripts[i].textContent || '';
            const m1 = t.match(/var\s+iInvoiceLinesID\s*=\s*(\d+)\s*;/);
            const m2 =
                t.match(/var\s+iInvoiceNumber\s*=\s*'([^']*)'\s*;/) ||
                t.match(/var\s+iInvoiceNumber\s*=\s*"([^"]*)"\s*;/);
            if (m1 && m2) {
                const st = t.match(/var\s+iStatusID\s*=\s*(\d+)\s*;/);
                return {
                    invoiceLinesId: m1[1],
                    invoiceNumber: m2[1],
                    statusId: st ? st[1] : '',
                };
            }
        }

        // URL: service_edit.php?editid1=7189042 or ?id=...
        try {
            const params = new URLSearchParams(window.location.search);
            const editId = params.get('editid1') || params.get('id');
            if (editId && /^\d+$/.test(editId)) {
                const fromTitle = parseInvoiceNumberFromTitle();
                return {
                    invoiceLinesId: editId,
                    invoiceNumber: fromTitle || editId,
                    statusId: '',
                };
            }
        } catch (_) { /* ignore */ }

        return null;
    }

    function parseInvoiceNumberFromTitle() {
        const h1 = document.querySelector('.rnr-b-editheader h1, h1');
        const text = (h1 && h1.textContent) || document.title || '';
        const m = text.match(/#\s*([^\s#\[\]]+)/);
        return m ? m[1].trim() : '';
    }

    function loadReminders(STORAGE_KEYS) {
        try {
            return JSON.parse(GM_getValue(remindersStorageKey(STORAGE_KEYS), '[]'));
        } catch (_) {
            return [];
        }
    }

    function saveReminders(STORAGE_KEYS, arr) {
        GM_setValue(remindersStorageKey(STORAGE_KEYS), JSON.stringify(arr));
    }

    /**
     * Fire due reminders; reschedule recurring ones.
     */
    function checkRepairReminders(STORAGE_KEYS) {
        const now = Date.now();
        const list = loadReminders(STORAGE_KEYS);
        const next = [];
        let changed = false;

        for (const r of list) {
            if (!r || !r.dueTime) {
                changed = true;
                continue;
            }
            if (r.dueTime > now) {
                next.push(r);
                continue;
            }

            const title = `🔧 Επισκευή #${r.invoiceNumber || r.invoiceLinesId}`;
            const body =
                (r.message && String(r.message).trim()) ||
                `Υπενθύμιση για την επισκευή #${r.invoiceNumber || r.invoiceLinesId}.`;

            if (typeof window.showNotification === 'function') {
                window.showNotification(title, body);
            }
            if (typeof window.createNotification === 'function') {
                window.createNotification(`${escapeHtml(title)} — ${escapeHtml(body)}`, '🔧');
            }

            const rec = r.recurrence || 'none';
            changed = true;
            if (rec === 'none' || !rec) {
                continue;
            }
            let t = new Date(r.dueTime);
            if (rec === 'daily') t.setDate(t.getDate() + 1);
            else if (rec === 'weekly') t.setDate(t.getDate() + 7);
            while (t.getTime() < now) {
                if (rec === 'daily') t.setDate(t.getDate() + 1);
                else if (rec === 'weekly') t.setDate(t.getDate() + 7);
                else break;
            }
            r.dueTime = t.getTime();
            next.push(r);
        }

        if (changed || next.length !== list.length) {
            saveReminders(STORAGE_KEYS, next);
        }
        if (typeof window.updateNotificationBadge === 'function') {
            window.updateNotificationBadge();
        }
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function remindersStorageKey(STORAGE_KEYS) {
        return (STORAGE_KEYS && STORAGE_KEYS.REPAIR_REMINDERS) || 'tm_repair_reminders_v1';
    }

    function remindersForRepair(STORAGE_KEYS, invoiceLinesId) {
        return loadReminders(STORAGE_KEYS).filter((r) => r.invoiceLinesId === invoiceLinesId);
    }

    function injectRepairReminderUI(config, STORAGE_KEYS) {
        if (!window.location.pathname.includes('service_edit.php')) return;
        if (document.getElementById('tm-repair-reminder-btn')) return;

        const ids = getServiceIdsFromPage();
        if (!ids) return;

        const customer = (document.querySelector('#value_strCustomer_1') || {}).value || '';

        const anchor =
            document.querySelector('.rnr-b-editbuttons .rnr-buttons-right') ||
            document.querySelector('.rnr-b-editbuttons .rnr-buttons-left') ||
            document.querySelector('.rnr-brickcontents.rnr-b-editbuttons') ||
            document.querySelector('.rnr-b-editbuttons');

        if (!anchor) return;

        const wrap = document.createElement('div');
        wrap.id = 'tm-repair-reminder-wrap';
        // Match PHPRunner edit row: same wrapper rhythm as native .rnr-buttons-* links
        wrap.style.cssText =
            'display:inline-flex;align-items:stretch;position:relative;margin-left:4px;vertical-align:middle;';

        wrap.innerHTML = `
            <a href="#" id="tm-repair-reminder-btn" class="rnr-button" role="button"
                title="Υπενθύμιση για αυτή την επισκευή">🔔&nbsp;Υπενθύμιση</a>
        `;

        const backdrop = document.createElement('div');
        backdrop.id = 'tm-repair-reminder-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        backdrop.style.cssText = [
            'display:none',
            'position:fixed',
            'inset:0',
            'background:rgba(0,0,0,0.5)',
            'z-index:2147482999',
            'backdrop-filter:blur(2px)',
            '-webkit-backdrop-filter:blur(2px)',
        ].join(';');

        const pop = document.createElement('div');
        pop.id = 'tm-repair-reminder-popover';
        pop.setAttribute('role', 'dialog');
        pop.style.cssText = [
            'display:none',
            'position:fixed',
            'left:50%',
            'top:50%',
            'transform:translate(-50%,-50%)',
            'width:calc(100vw - 32px)',
            'max-width:360px',
            'max-height:calc(100vh - 32px)',
            'overflow-y:auto',
            'box-sizing:border-box',
            'background:var(--tm-bg-color,#1a1a2e)',
            'border:1px solid rgba(255,255,255,0.15)',
            'border-radius:14px',
            'padding:14px',
            'box-shadow:0 12px 40px rgba(0,0,0,0.55)',
            'z-index:2147483000',
        ].join(';');

        pop.innerHTML = `
            <div style="position:relative;">
                <div style="font-weight:700;color:#fff;margin-bottom:8px;font-size:13px;padding-right:22px;">
                    Υπενθύμιση · #${escapeHtml(ids.invoiceNumber)}
                </div>
                <button type="button" id="tm-repair-reminder-close" style="position:absolute;top:0;right:0;background:none;border:none;color:rgba(255,255,255,0.45);cursor:pointer;font-size:18px;line-height:1;">&times;</button>
                <label style="display:block;font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:4px;">Μήνυμα (προαιρετικό)</label>
                <input type="text" id="tm-repair-reminder-msg" placeholder="π.χ. Κάλεσε πελάτη για έγκριση"
                    style="width:100%;box-sizing:border-box;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);
                    background:rgba(0,0,0,0.25);color:#fff;font-size:13px;margin-bottom:10px;">
                <label style="display:block;font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:4px;">Ημερομηνία & ώρα</label>
                <input type="datetime-local" id="tm-repair-reminder-when"
                    style="width:100%;box-sizing:border-box;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);
                    background:rgba(0,0,0,0.25);color:#fff;font-size:13px;margin-bottom:8px;">
                <label style="display:block;font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:4px;">Επανάληψη</label>
                <select id="tm-repair-reminder-recur" style="width:100%;padding:8px;border-radius:8px;margin-bottom:10px;background:#2a2a3e;color:#fff;border:1px solid rgba(255,255,255,0.12);">
                    <option value="none">Μία φορά</option>
                    <option value="daily">Καθημερινά</option>
                    <option value="weekly">Εβδομαδιαία</option>
                </select>
                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">
                    <button type="button" class="tm-rr-quick" data-min="15" style="flex:1;min-width:72px;padding:6px;font-size:11px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#ccc;cursor:pointer;">+15 λεπτά</button>
                    <button type="button" class="tm-rr-quick" data-min="60" style="flex:1;min-width:72px;padding:6px;font-size:11px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#ccc;cursor:pointer;">+1 ώρα</button>
                    <button type="button" class="tm-rr-quick" data-min="180" style="flex:1;min-width:72px;padding:6px;font-size:11px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#ccc;cursor:pointer;">+3 ώρες</button>
                    <button type="button" id="tm-rr-tomorrow" style="flex:1;min-width:100%;padding:6px;font-size:11px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#ccc;cursor:pointer;">Αύριο 09:00</button>
                </div>
                <button type="button" id="tm-repair-reminder-save" style="width:100%;padding:10px;border-radius:10px;border:none;
                    background:linear-gradient(135deg,#4facfe,#00f2fe);color:#0a0a12;font-weight:700;cursor:pointer;font-size:13px;">
                    Αποθήκευση υπενθύμισης
                </button>
                <div id="tm-repair-reminder-list" style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;color:rgba(255,255,255,0.55);max-height:120px;overflow-y:auto;"></div>
            </div>
        `;

        anchor.appendChild(wrap);
        document.body.appendChild(backdrop);
        document.body.appendChild(pop);

        const btn = wrap.querySelector('#tm-repair-reminder-btn');
        const msgInput = pop.querySelector('#tm-repair-reminder-msg');
        const whenInput = pop.querySelector('#tm-repair-reminder-when');
        const recurSel = pop.querySelector('#tm-repair-reminder-recur');
        const listEl = pop.querySelector('#tm-repair-reminder-list');

        function showReminderModal() {
            backdrop.style.display = 'block';
            pop.style.display = 'block';
        }

        function hideReminderModal() {
            backdrop.style.display = 'none';
            pop.style.display = 'none';
        }

        function fmtLocal(dt) {
            const y = dt.getFullYear();
            const m = String(dt.getMonth() + 1).padStart(2, '0');
            const d = String(dt.getDate()).padStart(2, '0');
            const h = String(dt.getHours()).padStart(2, '0');
            const min = String(dt.getMinutes()).padStart(2, '0');
            return `${y}-${m}-${d}T${h}:${min}`;
        }

        function setDefaultWhen() {
            const d = new Date(Date.now() + 60 * 60 * 1000);
            whenInput.value = fmtLocal(d);
        }

        function renderList() {
            const mine = remindersForRepair(STORAGE_KEYS, ids.invoiceLinesId)
                .sort((a, b) => (a.dueTime || 0) - (b.dueTime || 0));
            if (mine.length === 0) {
                listEl.innerHTML = '<span style="opacity:0.7;">Δεν υπάρχουν ενεργές υπενθυμίσεις για αυτή το δελτίο.</span>';
                return;
            }
            listEl.innerHTML = mine
                .map((r) => {
                    const when = new Date(r.dueTime).toLocaleString('el-GR');
                    const short = (r.message || '').slice(0, 40) + ((r.message || '').length > 40 ? '…' : '');
                    return `<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;color:rgba(255,255,255,0.75);">
                        <span>${escapeHtml(when)}${short ? ` — ${escapeHtml(short)}` : ''}</span>
                        <button type="button" class="tm-rr-del" data-id="${escapeHtml(r.id)}" style="flex-shrink:0;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);color:#f87171;border-radius:6px;padding:2px 8px;cursor:pointer;font-size:10px;">Διαγραφή</button>
                    </div>`;
                })
                .join('');
            listEl.querySelectorAll('.tm-rr-del').forEach((b) => {
                b.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = b.getAttribute('data-id');
                    const all = loadReminders(STORAGE_KEYS).filter((x) => x.id !== id);
                    saveReminders(STORAGE_KEYS, all);
                    renderList();
                });
            });
        }

        function isPopoverHidden() {
            const d = (pop.style.display || '').trim().toLowerCase();
            if (d === 'none') return true;
            if (d === 'block' || d === 'flex') return false;
            return window.getComputedStyle(pop).display === 'none';
        }

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const hidden = isPopoverHidden();
            if (hidden) {
                showReminderModal();
                setDefaultWhen();
                msgInput.value = customer ? `Σχετικά με: ${customer.split(',')[0]}` : '';
                renderList();
            } else {
                hideReminderModal();
            }
        });

        backdrop.addEventListener('click', () => hideReminderModal());

        pop.addEventListener('click', (e) => e.stopPropagation());

        pop.querySelector('#tm-repair-reminder-close').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            hideReminderModal();
        });

        pop.querySelectorAll('.tm-rr-quick').forEach((b) => {
            b.addEventListener('click', (e) => {
                e.stopPropagation();
                const min = parseInt(b.getAttribute('data-min'), 10) || 60;
                const d = new Date(Date.now() + min * 60 * 1000);
                whenInput.value = fmtLocal(d);
            });
        });

        pop.querySelector('#tm-rr-tomorrow').addEventListener('click', (e) => {
            e.stopPropagation();
            const d = new Date();
            d.setDate(d.getDate() + 1);
            d.setHours(9, 0, 0, 0);
            whenInput.value = fmtLocal(d);
        });

        pop.querySelector('#tm-repair-reminder-save').addEventListener('click', (e) => {
            e.stopPropagation();
            const due = new Date(whenInput.value).getTime();
            if (!whenInput.value || Number.isNaN(due) || due <= Date.now()) {
                alert('Ορίστε μελλοντική ημερομηνία και ώρα.');
                return;
            }
            const entry = {
                id: `rr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                invoiceLinesId: ids.invoiceLinesId,
                invoiceNumber: ids.invoiceNumber,
                statusId: ids.statusId || '',
                message: msgInput.value.trim(),
                dueTime: due,
                recurrence: recurSel.value || 'none',
                createdAt: Date.now(),
            };
            const all = loadReminders(STORAGE_KEYS);
            all.push(entry);
            saveReminders(STORAGE_KEYS, all);
            renderList();
            hideReminderModal();
            if (typeof window.createNotification === 'function') {
                window.createNotification(`Υπενθύμιση ορίστηκε για #${ids.invoiceNumber}`, '✅');
            }
        });

        function onDocClick(e) {
            if (wrap.contains(e.target) || pop.contains(e.target)) return;
            hideReminderModal();
        }
        document.addEventListener('click', onDocClick);

        setDefaultWhen();
        renderList();
    }

    function tryInject(config, STORAGE_KEYS, attempt) {
        if (document.getElementById('tm-repair-reminder-btn')) return;
        injectRepairReminderUI(config, STORAGE_KEYS);
        if (!document.getElementById('tm-repair-reminder-btn') && attempt < 25) {
            setTimeout(() => tryInject(config, STORAGE_KEYS, attempt + 1), 400);
        }
    }

    /**
     * @param {object} config
     * @param {object} STORAGE_KEYS — from myman_config
     */
    window.initRepairReminderFeature = function (config, STORAGE_KEYS) {
        if (!config) return;

        setInterval(() => checkRepairReminders(STORAGE_KEYS), 30 * 1000);
        checkRepairReminders(STORAGE_KEYS);

        if (window.location.pathname.includes('service_edit.php')) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => setTimeout(() => tryInject(config, STORAGE_KEYS, 0), 300));
            } else {
                setTimeout(() => tryInject(config, STORAGE_KEYS, 0), 300);
            }
        }
    };

    window.checkRepairReminders = checkRepairReminders;
})();
