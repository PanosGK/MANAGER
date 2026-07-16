// End of Day Checklist module — loaded via @require in myman_allinone.js

(function () {
    'use strict';

    const FEATURE_ID = 'eod_checklist';

    // ── Helpers ──────────────────────────────────────────────────────────────

    function isUnlocked(STORAGE_KEYS, config) {
        if (config && config.eodChecklistEnabled === false) return false;
        if (config?.debugEnabled) return true;
        // Work tool — controlled only via Settings, never via shop purchase.
        return config?.eodChecklistEnabled !== false;
    }

    function getTodayKey() {
        return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    }

    function getDismissed(STORAGE_KEYS) {
        try {
            const all = JSON.parse(GM_getValue(STORAGE_KEYS.EOD_CHECKLIST_DISMISSED, '{}'));
            return all[getTodayKey()] || [];
        } catch { return []; }
    }

    function setDismissed(STORAGE_KEYS, ids) {
        // Only keep today's key to avoid storage bloat
        GM_setValue(STORAGE_KEYS.EOD_CHECKLIST_DISMISSED,
            JSON.stringify({ [getTodayKey()]: ids }));
    }

    function getTodaysRepairs(STORAGE_KEYS) {
        const repairs = JSON.parse(GM_getValue(STORAGE_KEYS.RECENT_REPAIRS, '[]'));
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        return repairs.filter(r => r.timestamp >= todayStart.getTime());
    }

    function fmtFull(ts) {
        const d = new Date(ts);
        return d.toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit' })
            + ' ' + d.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
    }

    const STATUS_COLORS = {
        '10': '#6b7280', '20': '#6b7280', '30': '#f59e0b', '40': '#ef4444',
        '50': '#3b82f6', '60': '#8b5cf6', '65': '#f97316', '75': '#06b6d4',
        '90': '#10b981', '100': '#10b981', '105': '#10b981'
    };

    function statusBadgeHTML(status) {
        if (!status) return '';
        const color = STATUS_COLORS[status] || '#6b7280';
        return `<span class="tm-eod-status-badge" style="
            --eod-status-color:${color};
            display:inline-flex;align-items:center;justify-content:center;
            background:color-mix(in srgb, ${color} 13%, transparent);
            border:1px solid color-mix(in srgb, ${color} 33%, transparent);
            color:${color};border-radius:6px;
            padding:1px 7px;font-size:11px;font-weight:700;
            flex-shrink:0;white-space:nowrap;
        ">${status}</span>`;
    }

    // ── Badge on footer button ────────────────────────────────────────────────

    /** Delivered / completed repairs (status 100, 105) count as already verified — not pending. */
    function isStatusAutoDone(r) {
        const s = String(r?.status ?? '');
        return s === '100' || s === '105';
    }

    function isEODDoneRepair(r, dismissed) {
        return dismissed.includes(r.id) || isStatusAutoDone(r);
    }

    function updateFooterBadge(STORAGE_KEYS) {
        const btn = document.getElementById('tm-eod-btn');
        if (!btn) return;
        const dismissed = getDismissed(STORAGE_KEYS);
        const pending = getTodaysRepairs(STORAGE_KEYS)
            .filter(r => !isEODDoneRepair(r, dismissed)).length;
        let badge = btn.querySelector('.tm-eod-badge');
        if (pending > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'tm-eod-badge';
                btn.appendChild(badge);
            }
            badge.textContent = pending > 9 ? '9+' : pending;
        } else {
            badge?.remove();
        }
    }

    // ── Status refresh ───────────────────────────────────────────────────────

    /** Fetch a single repair page and return the live status number string, or null. */
    function fetchRepairStatus(url) {
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                timeout: 10000,
                onload(resp) {
                    try {
                        const html = resp.responseText || '';

                        const jsVar = html.match(/var\s+iStatusID\s*=\s*(\d+)\s*;/);
                        if (jsVar) { resolve(jsVar[1]); return; }

                        const largeBadge = html.match(
                            /<span[^>]*class="[^"]*statusbadge-large[^"]*"[^>]*>\s*(\d+)\s*<\/span>/i
                        );
                        if (largeBadge) { resolve(largeBadge[1]); return; }

                        const selectBlock = html.match(
                            /name="value_ccc_iStatusID_1"[\s\S]{0,4000}?<\/select>/i
                        );
                        if (selectBlock) {
                            const opt = selectBlock[0].match(
                                /<option[^>]+value="(\d+)"[^>]*selected/i
                            ) || selectBlock[0].match(
                                /<option[^>]+selected[^>]*value="(\d+)"/i
                            );
                            if (opt) { resolve(opt[1]); return; }
                        }
                    } catch (_) {}
                    resolve(null);
                },
                onerror()  { resolve(null); },
                ontimeout(){ resolve(null); },
            });
        });
    }

    function refreshAllStatuses(STORAGE_KEYS, onProgress, onComplete) {
        const today = getTodaysRepairs(STORAGE_KEYS);
        if (today.length === 0) { onComplete(); return; }

        let done = 0;
        const CONCURRENCY = 3;
        let idx = 0;

        function next() {
            if (idx >= today.length) return;
            const repair = today[idx++];
            fetchRepairStatus(repair.url).then(status => {
                if (status !== null) {
                    try {
                        const all = JSON.parse(GM_getValue(STORAGE_KEYS.RECENT_REPAIRS, '[]'));
                        const entry = all.find(r => r.id === repair.id);
                        if (entry) { entry.status = status; }
                        GM_setValue(STORAGE_KEYS.RECENT_REPAIRS, JSON.stringify(all));
                    } catch (_) {}
                }
                done++;
                onProgress(done, today.length);
                if (done === today.length) onComplete();
                else next();
            });
        }

        for (let i = 0; i < Math.min(CONCURRENCY, today.length); i++) next();
    }

    // ── Modal ─────────────────────────────────────────────────────────────────

    function buildItemRow(r, isDone) {
        const lockCheck = isStatusAutoDone(r);
        const device = [r.deviceInfo, r.modelInfo].filter(Boolean);
        const deviceLine = device.length ? device.join(' · ') : '—';
        const doneClass = isDone ? ' is-done' : '';

        return `
            <div class="tm-eod-item${doneClass}" data-id="${r.id}">
                <input type="checkbox" class="tm-eod-check" data-id="${r.id}"
                    ${isDone ? 'checked' : ''}
                    ${lockCheck ? 'disabled' : ''}>
                <div class="tm-eod-item-body">
                    <div class="tm-eod-item-row1">
                        <span class="tm-eod-item-id">#${r.id}</span>
                        <span class="tm-eod-item-customer">${r.customerName || 'Άγνωστος'}</span>
                        ${statusBadgeHTML(r.status)}
                    </div>
                    <div class="tm-eod-item-device">📱 ${deviceLine}</div>
                    <div class="tm-eod-item-time">🕐 ${fmtFull(r.timestamp)}</div>
                </div>
                <a href="${r.url}" class="tm-eod-open-link" title="Άνοιγμα επισκευής">→</a>
            </div>`;
    }

    function trackEodStat(statName, value = 1) {
        if (typeof window.trackDailyStat === 'function' && window.config && window.STORAGE_KEYS) {
            window.trackDailyStat(window.config, window.STORAGE_KEYS, statName, value);
        }
    }

    function notifyEodProgress(STORAGE_KEYS, today, dismissedIds) {
        const pending = today.filter(r => !isEODDoneRepair(r, dismissedIds));
        if (today.length > 0 && pending.length === 0) {
            trackEodStat('eodChecklistComplete');
        }
    }

    function showEODModal(STORAGE_KEYS) {
        document.getElementById('tm-eod-modal')?.remove();

        if (typeof window.notifyMascotWorkEvent === 'function') {
            window.notifyMascotWorkEvent('eod', window.config);
        }

        const today      = getTodaysRepairs(STORAGE_KEYS);
        const dismissed  = getDismissed(STORAGE_KEYS);
        const pending    = today.filter(r => !isEODDoneRepair(r, dismissed));

        const doneIds = new Set();
        const done    = [];
        for (const id of dismissed) {
            const r = today.find(x => x.id === id);
            if (r && isEODDoneRepair(r, dismissed) && !doneIds.has(r.id)) {
                done.push(r);
                doneIds.add(r.id);
            }
        }
        for (const r of today) {
            if (isStatusAutoDone(r) && !doneIds.has(r.id)) {
                done.push(r);
                doneIds.add(r.id);
            }
        }

        const pendingHTML = pending.map(r => buildItemRow(r, false)).join('');
        const doneHTML    = done.map(r => buildItemRow(r, true)).join('');

        const emptyState = `
            <div class="tm-eod-empty">
                <div class="tm-eod-empty-icon">✅</div>
                <div>Δεν υπάρχουν επισκευές για σήμερα.</div>
            </div>`;

        const doneSeparator = done.length > 0
            ? `<div class="tm-eod-done-separator">── ΕΛΕΓΜΕΝΑ ──</div>`
            : '';

        const overlay = document.createElement('div');
        overlay.className = 'tm-modal-overlay tm-eod-overlay';
        overlay.id = 'tm-eod-modal';

        const doneBadgeHTML = done.length > 0
            ? `<span class="tm-eod-done-badge">✓ ${done.length}</span>`
            : '';

        let subtitleHTML;
        if (today.length === 0) {
            subtitleHTML = 'Δεν ανοίξατε καμία επισκευή σήμερα.';
        } else {
            const suffix = pending.length > 0
                ? `<span class="tm-eod-pending">${pending.length} χωρίς επαλήθευση.</span>`
                : '<span class="tm-eod-complete">Όλα ελεγμένα! 🎉</span>';
            subtitleHTML = `Επισκεφθήκατε <b>${today.length}</b> επισκευ${today.length === 1 ? 'ή' : 'ές'} σήμερα. ${suffix}`;
        }

        overlay.innerHTML = `
            <div class="tm-eod-panel">
                <div class="tm-eod-header">
                    <h2 class="tm-eod-title">🌙 Checklist Τέλους Ημέρας${doneBadgeHTML}</h2>
                    <div class="tm-eod-header-actions">
                        <button type="button" id="tm-eod-refresh" title="Ανανέωση κατάστασης επισκευών">
                            🔄 <span id="tm-eod-refresh-label">Ανανέωση</span>
                        </button>
                        <button type="button" id="tm-eod-close" aria-label="Κλείσιμο">&times;</button>
                    </div>
                </div>
                <p class="tm-eod-subtitle">${subtitleHTML}</p>
                <div id="tm-eod-list">
                    ${today.length === 0 ? emptyState : pendingHTML + doneSeparator + doneHTML}
                </div>
                ${pending.length > 0 ? `
                <button type="button" id="tm-eod-mark-all">✓ Σήμανση όλων ως ελεγμένα</button>` : ''}
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector('#tm-eod-close').addEventListener('click', () => overlay.remove());
        setTimeout(() => {
            overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
        }, 0);

        const refreshBtn   = overlay.querySelector('#tm-eod-refresh');
        const refreshLabel = overlay.querySelector('#tm-eod-refresh-label');
        refreshBtn.addEventListener('click', () => {
            if (refreshBtn.disabled) return;
            refreshBtn.disabled = true;
            refreshLabel.textContent = '0 / ' + today.length;

            refreshAllStatuses(
                STORAGE_KEYS,
                (doneCount, total) => {
                    refreshLabel.textContent = doneCount + ' / ' + total;
                },
                () => {
                    overlay.remove();
                    showEODModal(STORAGE_KEYS);
                }
            );
        });

        overlay.querySelectorAll('.tm-eod-check').forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.disabled) return;
                let current = getDismissed(STORAGE_KEYS);
                const id = cb.dataset.id;
                if (cb.checked) {
                    if (!current.includes(id)) current.push(id);
                    trackEodStat('eodCheckItem');
                } else {
                    current = current.filter(x => x !== id);
                }
                setDismissed(STORAGE_KEYS, current);
                updateFooterBadge(STORAGE_KEYS);
                notifyEodProgress(STORAGE_KEYS, today, current);
                showEODModal(STORAGE_KEYS);
            });
        });

        overlay.querySelector('#tm-eod-mark-all')?.addEventListener('click', () => {
            const pendingCount = pending.length;
            if (pendingCount > 0) {
                trackEodStat('eodCheckItem', pendingCount);
            }
            setDismissed(STORAGE_KEYS, today.map(r => r.id));
            updateFooterBadge(STORAGE_KEYS);
            notifyEodProgress(STORAGE_KEYS, today, today.map(r => r.id));
            showEODModal(STORAGE_KEYS);
        });
    }

    // ── Init ─────────────────────────────────────────────────────────────────

    function initEODChecklist(config, STORAGE_KEYS) {
        if (!isUnlocked(STORAGE_KEYS, config)) {
            document.getElementById('tm-eod-btn')?.remove();
            return;
        }

        function tryInject() {
            const footerRight = document.getElementById('tm-footer-controls-right');
            if (!footerRight) {
                setTimeout(tryInject, 400);
                return;
            }
            if (document.getElementById('tm-eod-btn')) return;

            const btn = document.createElement('button');
            btn.id = 'tm-eod-btn';
            btn.type = 'button';
            btn.className = 'tm-footer-widget tm-footer-icon-btn';
            btn.title = 'Checklist Τέλους Ημέρας';
            btn.textContent = '🌙';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showEODModal(STORAGE_KEYS);
            });

            footerRight.prepend(btn);
            updateFooterBadge(STORAGE_KEYS);

            setInterval(() => updateFooterBadge(STORAGE_KEYS), 5 * 60 * 1000);
        }

        tryInject();
    }

    // ── Public API ────────────────────────────────────────────────────────────
    window.initEODChecklist = initEODChecklist;
    window.showEODModal     = showEODModal;

    window.activate_eod_checklist = function (config, STORAGE_KEYS) {
        initEODChecklist(config, STORAGE_KEYS);
    };

})();
