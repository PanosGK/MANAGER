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

            activateBannerForReminder(r, STORAGE_KEYS);

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
        renderActiveReminderBanners(STORAGE_KEYS);
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

    function bannersStorageKey(STORAGE_KEYS) {
        return (STORAGE_KEYS && STORAGE_KEYS.REPAIR_REMINDER_BANNERS) || 'tm_repair_reminder_active_banners_v1';
    }

    function loadActiveBanners(STORAGE_KEYS) {
        try {
            return JSON.parse(GM_getValue(bannersStorageKey(STORAGE_KEYS), '[]'));
        } catch (_) {
            return [];
        }
    }

    function saveActiveBanners(STORAGE_KEYS, arr) {
        GM_setValue(bannersStorageKey(STORAGE_KEYS), JSON.stringify(arr));
    }

    function repairEditUrl(invoiceLinesId) {
        return `https://thefixers.mymanager.gr/mymanagerservice/service_edit.php?editid1=${encodeURIComponent(invoiceLinesId)}`;
    }

    function logRepairReminderHistory(r, action, extra = {}) {
        if (!r || typeof window.appendReminderHistory !== 'function') return;
        window.appendReminderHistory({
            source: extra.source || 'repair',
            action,
            title: r.title || `Επισκευή #${r.invoiceNumber || r.invoiceLinesId}`,
            message: r.message || extra.message || '',
            dueTime: r.dueTime || extra.dueTime || null,
            invoiceLinesId: r.invoiceLinesId,
            invoiceNumber: r.invoiceNumber,
            recurrence: r.recurrence || 'none',
            reminderId: r.id || r.reminderId || null,
            closedAt: extra.closedAt,
        });
    }

    function activateBannerForReminder(r, STORAGE_KEYS) {
        if (typeof window.areNotificationsEnabled === 'function' && !window.areNotificationsEnabled()) {
            return;
        }
        const banners = loadActiveBanners(STORAGE_KEYS);
        if (banners.some((b) => b.reminderId === r.id)) return;

        logRepairReminderHistory(r, 'fired', { source: 'repair' });

        banners.push({
            id: `banner_${r.id}`,
            reminderId: r.id,
            invoiceLinesId: r.invoiceLinesId,
            invoiceNumber: r.invoiceNumber,
            title: r.title || `Επισκευή #${r.invoiceNumber || r.invoiceLinesId}`,
            message: r.message || '',
            recurrence: r.recurrence || 'none',
            firedAt: Date.now(),
        });
        saveActiveBanners(STORAGE_KEYS, banners);
    }

    function dismissReminderBanner(STORAGE_KEYS, bannerId) {
        const banner = loadActiveBanners(STORAGE_KEYS).find((b) => b.id === bannerId);
        if (banner) {
            logRepairReminderHistory(banner, 'dismissed', {
                source: 'repair_banner',
                dueTime: banner.firedAt,
            });
        }
        saveActiveBanners(
            STORAGE_KEYS,
            loadActiveBanners(STORAGE_KEYS).filter((b) => b.id !== bannerId)
        );
        renderActiveReminderBanners(STORAGE_KEYS);
        if (typeof window.refreshActiveAlertsPanelIfOpen === 'function') {
            window.refreshActiveAlertsPanelIfOpen();
        }
    }

    function cancelRepairReminder(STORAGE_KEYS, reminderId) {
        const reminder = loadReminders(STORAGE_KEYS).find((r) => r.id === reminderId);
        if (reminder) {
            logRepairReminderHistory(reminder, 'cancelled');
        }
        saveReminders(
            STORAGE_KEYS,
            loadReminders(STORAGE_KEYS).filter((r) => r.id !== reminderId)
        );
        saveActiveBanners(
            STORAGE_KEYS,
            loadActiveBanners(STORAGE_KEYS).filter((b) => b.reminderId !== reminderId)
        );
        renderActiveReminderBanners(STORAGE_KEYS);
        if (typeof window.updateNotificationBadge === 'function') {
            window.updateNotificationBadge();
        }
        if (typeof window.refreshActiveAlertsPanelIfOpen === 'function') {
            window.refreshActiveAlertsPanelIfOpen();
        }
    }

    function getScheduledRepairReminders(STORAGE_KEYS) {
        return loadReminders(STORAGE_KEYS).sort((a, b) => (a.dueTime || 0) - (b.dueTime || 0));
    }

    function getActiveRepairReminderBanners(STORAGE_KEYS) {
        return loadActiveBanners(STORAGE_KEYS);
    }

    function snoozeRepairReminderBanner(STORAGE_KEYS, bannerId, minutes) {
        const banner = loadActiveBanners(STORAGE_KEYS).find((b) => b.id === bannerId);
        if (!banner || !Number.isFinite(minutes) || minutes <= 0) return;

        const newDue = Date.now() + minutes * 60 * 1000;
        const reminders = loadReminders(STORAGE_KEYS);
        let reminder = reminders.find((r) => r.id === banner.reminderId);

        if (reminder) {
            reminder.dueTime = newDue;
        } else {
            reminders.push({
                id: banner.reminderId,
                invoiceLinesId: banner.invoiceLinesId,
                invoiceNumber: banner.invoiceNumber,
                title: banner.title,
                message: banner.message,
                dueTime: newDue,
                recurrence: banner.recurrence || 'none',
            });
        }
        saveReminders(STORAGE_KEYS, reminders);

        logRepairReminderHistory(banner, 'snoozed', {
            source: 'repair_banner',
            dueTime: newDue,
            reminderId: banner.reminderId,
        });

        saveActiveBanners(
            STORAGE_KEYS,
            loadActiveBanners(STORAGE_KEYS).filter((b) => b.id !== bannerId)
        );
        renderActiveReminderBanners(STORAGE_KEYS);
        if (typeof window.updateNotificationBadge === 'function') {
            window.updateNotificationBadge();
        }
        if (typeof window.refreshActiveAlertsPanelIfOpen === 'function') {
            window.refreshActiveAlertsPanelIfOpen();
        }
    }

    function renderActiveReminderBanners(STORAGE_KEYS) {
        if (typeof window.areNotificationsEnabled === 'function' && !window.areNotificationsEnabled()) {
            document.getElementById('tm-repair-reminder-banner-root')?.remove();
            return;
        }
        const banners = loadActiveBanners(STORAGE_KEYS);
        document.getElementById('tm-repair-reminder-banner-root')?.remove();

        if (!banners.length) return;

        const root = document.createElement('div');
        root.id = 'tm-repair-reminder-banner-root';
        root.setAttribute('role', 'alertdialog');
        root.setAttribute('aria-modal', 'true');
        root.style.cssText = [
            'position:fixed',
            'inset:0',
            'z-index:2147483646',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'padding:24px',
            'box-sizing:border-box',
            'background:linear-gradient(160deg,rgba(8,12,28,0.97),rgba(20,8,8,0.97))',
            'backdrop-filter:blur(8px)',
            '-webkit-backdrop-filter:blur(8px)',
        ].join(';');

        const panel = document.createElement('div');
        panel.style.cssText = [
            'width:min(560px,calc(100vw - 32px))',
            'max-height:calc(100vh - 48px)',
            'overflow-y:auto',
            'box-sizing:border-box',
            'border-radius:20px',
            'border:2px solid rgba(251,191,36,0.55)',
            'box-shadow:0 0 80px rgba(251,191,36,0.25),0 24px 60px rgba(0,0,0,0.55)',
            'padding:28px 24px',
            'background:var(--tm-bg-color,rgba(18,18,32,0.98))',
        ].join(';');

        panel.innerHTML = `
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:48px;line-height:1;margin-bottom:8px;">🔔</div>
                <h2 style="margin:0;color:#fbbf24;font-size:1.35rem;font-weight:800;letter-spacing:0.02em;">
                    ΥΠΕΝΘΥΜΙΣΗ ΕΠΙΣΚΕΥΗΣ
                </h2>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.55);font-size:13px;">
                    Η υπενθύμιση παραμένει μέχρι να την αποκρύψετε
                </p>
            </div>
            <div id="tm-repair-reminder-banner-list"></div>
        `;

        const list = panel.querySelector('#tm-repair-reminder-banner-list');
        banners.forEach((b) => {
            const card = document.createElement('div');
            card.style.cssText = [
                'margin-bottom:14px',
                'padding:16px',
                'border-radius:14px',
                'background:rgba(255,255,255,0.05)',
                'border:1px solid rgba(255,255,255,0.12)',
            ].join(';');

            const body = (b.message && String(b.message).trim())
                ? String(b.message).trim()
                : `Υπενθύμιση για την επισκευή #${b.invoiceNumber || b.invoiceLinesId}.`;
            const bannerTitle = b.title || `Επισκευή #${b.invoiceNumber || b.invoiceLinesId}`;
            const fired = b.firedAt
                ? new Date(b.firedAt).toLocaleString('el-GR')
                : '';

            card.innerHTML = `
                <div style="font-size:1.15rem;font-weight:800;color:#fff;margin-bottom:6px;">
                    🔧 ${escapeHtml(bannerTitle)}
                </div>
                <div style="font-size:12px;color:rgba(255,255,255,0.55);margin-bottom:8px;">
                    #${escapeHtml(b.invoiceNumber || b.invoiceLinesId)}
                </div>
                <div style="font-size:14px;color:rgba(255,255,255,0.88);line-height:1.45;margin-bottom:10px;">
                    ${escapeHtml(body)}
                </div>
                ${fired ? `<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:12px;">⏰ ${escapeHtml(fired)}</div>` : ''}
                <div style="margin-bottom:12px;">
                    <div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.5);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.04em;">
                        Αναβολή
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">
                        ${[1, 3, 5, 10].map((m) => `
                            <button type="button" class="tm-repair-reminder-banner-snooze" data-banner-id="${escapeHtml(b.id)}" data-snooze-minutes="${m}"
                                style="flex:1;min-width:56px;padding:8px 6px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);
                                background:rgba(255,255,255,0.08);color:#fff;font-weight:700;cursor:pointer;font-size:12px;">
                                ${m} λεπ
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    <a href="${escapeHtml(repairEditUrl(b.invoiceLinesId))}" target="_blank" rel="noopener"
                       style="flex:1;min-width:140px;text-align:center;padding:10px 14px;border-radius:10px;
                       background:linear-gradient(135deg,#4facfe,#00f2fe);color:#0a0a12;font-weight:700;
                       text-decoration:none;font-size:13px;">
                        Άνοιγμα επισκευής
                    </a>
                    <button type="button" class="tm-repair-reminder-banner-hide" data-banner-id="${escapeHtml(b.id)}"
                       style="flex:1;min-width:140px;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);
                       background:rgba(255,255,255,0.08);color:#fff;font-weight:700;cursor:pointer;font-size:13px;">
                        Απόκρυψη
                    </button>
                </div>
            `;
            list.appendChild(card);
        });

        root.appendChild(panel);
        document.body.appendChild(root);

        list.querySelectorAll('.tm-repair-reminder-banner-hide').forEach((btn) => {
            btn.addEventListener('click', () => {
                dismissReminderBanner(STORAGE_KEYS, btn.getAttribute('data-banner-id'));
            });
        });

        list.querySelectorAll('.tm-repair-reminder-banner-snooze').forEach((btn) => {
            btn.addEventListener('click', () => {
                const mins = parseInt(btn.getAttribute('data-snooze-minutes'), 10);
                snoozeRepairReminderBanner(STORAGE_KEYS, btn.getAttribute('data-banner-id'), mins);
            });
        });
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
        backdrop.className = 'tm-repair-reminder-backdrop tm-rr-hidden';
        backdrop.setAttribute('aria-hidden', 'true');

        const pop = document.createElement('div');
        pop.id = 'tm-repair-reminder-popover';
        pop.className = 'tm-repair-reminder-popover tm-rr-hidden';
        pop.setAttribute('role', 'dialog');

        pop.innerHTML = `
            <div class="tm-rr-inner">
                <div class="tm-rr-title">
                    Υπενθύμιση · #${escapeHtml(ids.invoiceNumber)}
                </div>
                <button type="button" id="tm-repair-reminder-close" class="tm-rr-close" aria-label="Κλείσιμο">&times;</button>
                <label class="tm-rr-label" for="tm-repair-reminder-title">Τίτλος</label>
                <input type="text" id="tm-repair-reminder-title" class="tm-rr-input" placeholder="π.χ. Κάλεσε πελάτη για έγκριση">
                <label class="tm-rr-label" for="tm-repair-reminder-notes">Σημειώσεις</label>
                <textarea id="tm-repair-reminder-notes" class="tm-rr-textarea" rows="3" placeholder="Λεπτομέρειες, σχόλια, context…"></textarea>
                <label class="tm-rr-label" for="tm-repair-reminder-when">Ημερομηνία & ώρα</label>
                <input type="datetime-local" id="tm-repair-reminder-when" class="tm-rr-input">
                <label class="tm-rr-label" for="tm-repair-reminder-recur">Επανάληψη</label>
                <select id="tm-repair-reminder-recur" class="tm-rr-select">
                    <option value="none">Μία φορά</option>
                    <option value="daily">Καθημερινά</option>
                    <option value="weekly">Εβδομαδιαία</option>
                </select>
                <div class="tm-rr-quick-row">
                    <button type="button" class="tm-rr-quick" data-min="15">+15 λεπτά</button>
                    <button type="button" class="tm-rr-quick" data-min="60">+1 ώρα</button>
                    <button type="button" class="tm-rr-quick" data-min="180">+3 ώρες</button>
                    <button type="button" id="tm-rr-tomorrow" class="tm-rr-quick tm-rr-quick--wide">Αύριο 09:00</button>
                </div>
                <button type="button" id="tm-repair-reminder-save" class="tm-rr-save">
                    Αποθήκευση υπενθύμισης
                </button>
                <div id="tm-repair-reminder-list" class="tm-rr-list"></div>
            </div>
        `;

        anchor.appendChild(wrap);
        document.body.appendChild(backdrop);
        document.body.appendChild(pop);

        const btn = wrap.querySelector('#tm-repair-reminder-btn');
        const titleInput = pop.querySelector('#tm-repair-reminder-title');
        const notesInput = pop.querySelector('#tm-repair-reminder-notes');
        const whenInput = pop.querySelector('#tm-repair-reminder-when');
        const recurSel = pop.querySelector('#tm-repair-reminder-recur');
        const listEl = pop.querySelector('#tm-repair-reminder-list');

        function showReminderModal() {
            backdrop.classList.remove('tm-rr-hidden');
            pop.classList.remove('tm-rr-hidden');
            backdrop.setAttribute('aria-hidden', 'false');
        }

        function hideReminderModal() {
            backdrop.classList.add('tm-rr-hidden');
            pop.classList.add('tm-rr-hidden');
            backdrop.setAttribute('aria-hidden', 'true');
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
                listEl.innerHTML = '<span class="tm-rr-list-empty">Δεν υπάρχουν ενεργές υπενθυμίσεις για αυτή το δελτίο.</span>';
                return;
            }
            listEl.innerHTML = mine
                .map((r) => {
                    const when = new Date(r.dueTime).toLocaleString('el-GR');
                    const title = (r.title || `Επισκευή #${r.invoiceNumber || r.invoiceLinesId}`).slice(0, 36);
                    const notes = (r.message || '').slice(0, 50) + ((r.message || '').length > 50 ? '…' : '');
                    return `<div class="tm-rr-list-row">
                        <span><strong>${escapeHtml(title)}</strong>${notes ? `<br><span style="opacity:0.85;">${escapeHtml(notes)}</span>` : ''}<br>${escapeHtml(when)}</span>
                        <button type="button" class="tm-rr-del" data-id="${escapeHtml(r.id)}">Διαγραφή</button>
                    </div>`;
                })
                .join('');
            listEl.querySelectorAll('.tm-rr-del').forEach((b) => {
                b.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = b.getAttribute('data-id');
                    const removed = loadReminders(STORAGE_KEYS).find((x) => x.id === id);
                    if (removed) {
                        logRepairReminderHistory(removed, 'cancelled');
                    }
                    const all = loadReminders(STORAGE_KEYS).filter((x) => x.id !== id);
                    saveReminders(STORAGE_KEYS, all);
                    saveActiveBanners(
                        STORAGE_KEYS,
                        loadActiveBanners(STORAGE_KEYS).filter((x) => x.reminderId !== id)
                    );
                    renderActiveReminderBanners(STORAGE_KEYS);
                    renderList();
                    if (typeof window.refreshActiveAlertsPanelIfOpen === 'function') {
                        window.refreshActiveAlertsPanelIfOpen();
                    }
                });
            });
        }

        function isPopoverHidden() {
            return pop.classList.contains('tm-rr-hidden');
        }

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const hidden = isPopoverHidden();
            if (hidden) {
                showReminderModal();
                setDefaultWhen();
                titleInput.value = customer ? `Σχετικά με: ${customer.split(',')[0]}` : `Επισκευή #${ids.invoiceNumber}`;
                notesInput.value = '';
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
            const title = titleInput.value.trim();
            if (!title) {
                alert('Ορίστε τίτλο για την υπενθύμιση.');
                return;
            }
            const entry = {
                id: `rr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                invoiceLinesId: ids.invoiceLinesId,
                invoiceNumber: ids.invoiceNumber,
                statusId: ids.statusId || '',
                title,
                message: notesInput.value.trim(),
                dueTime: due,
                recurrence: recurSel.value || 'none',
                createdAt: Date.now(),
            };
            const all = loadReminders(STORAGE_KEYS);
            all.push(entry);
            saveReminders(STORAGE_KEYS, all);
            renderList();
            hideReminderModal();
            if (typeof window.refreshActiveAlertsPanelIfOpen === 'function') {
                window.refreshActiveAlertsPanelIfOpen();
            }
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

        function bootBanners() {
            renderActiveReminderBanners(STORAGE_KEYS);
        }
        if (document.body) {
            bootBanners();
        } else {
            document.addEventListener('DOMContentLoaded', bootBanners, { once: true });
        }

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
    window.cancelRepairReminder = cancelRepairReminder;
    window.dismissRepairReminderBanner = dismissReminderBanner;
    window.getScheduledRepairReminders = getScheduledRepairReminders;
    window.getActiveRepairReminderBanners = getActiveRepairReminderBanners;
    window.renderActiveReminderBanners = renderActiveReminderBanners;
    window.isRepairReminderBannerActive = function () {
        return !!document.getElementById('tm-repair-reminder-banner-root');
    };
})();
