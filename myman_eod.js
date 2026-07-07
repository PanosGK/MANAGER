// End of Day Checklist module — loaded via @require in myman_allinone.js

(function () {
    'use strict';

    const FEATURE_ID = 'eod_checklist';

    // ── Helpers ──────────────────────────────────────────────────────────────

    function isUnlocked(STORAGE_KEYS, config) {
        if (config && config.eodChecklistEnabled === false) return false;
        if (config?.debugEnabled) return true;

        let purchased = JSON.parse(GM_getValue(STORAGE_KEYS.PURCHASED_ITEMS, '[]'));
        if (purchased.includes(FEATURE_ID)) return true;

        // Setting enabled (default): feature is available — keep purchase flag in sync for backup/export
        if (config?.eodChecklistEnabled !== false) {
            purchased.push(FEATURE_ID);
            GM_setValue(STORAGE_KEYS.PURCHASED_ITEMS, JSON.stringify(purchased));
            return true;
        }

        return false;
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

    function fmt(ts) {
        return new Date(ts).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
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
        return `<span style="
            display:inline-flex;align-items:center;justify-content:center;
            background:${color}22;border:1px solid ${color}55;
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
                badge.style.cssText = `
                    position:absolute;top:-5px;right:-5px;
                    background:#ef4444;color:#fff;
                    border-radius:50%;min-width:16px;height:16px;
                    font-size:10px;font-weight:700;
                    display:flex;align-items:center;justify-content:center;
                    pointer-events:none;padding:0 3px;box-sizing:border-box;
                    border:2px solid var(--tm-bg-color,#1a1a2e);
                `;
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

                        // Method 1 (most reliable): JS variable set by the server for every page
                        // e.g.  var iStatusID = 100;
                        const jsVar = html.match(/var\s+iStatusID\s*=\s*(\d+)\s*;/);
                        if (jsVar) { resolve(jsVar[1]); return; }

                        // Method 2: header status badge — has extra class "statusbadge-large"
                        // e.g.  <span class="statusbadge statusbadge-large" ...>100</span>
                        const largeBadge = html.match(
                            /<span[^>]*class="[^"]*statusbadge-large[^"]*"[^>]*>\s*(\d+)\s*<\/span>/i
                        );
                        if (largeBadge) { resolve(largeBadge[1]); return; }

                        // Method 3: status <select> with selected option (editable repairs)
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

    /**
     * Fetch live status for every repair visited today, update RECENT_REPAIRS,
     * call onProgress(done, total) after each fetch, then onComplete() when done.
     */
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
                    // Update this repair's status in RECENT_REPAIRS
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

        // Kick off up to CONCURRENCY requests in parallel
        for (let i = 0; i < Math.min(CONCURRENCY, today.length); i++) next();
    }

    // ── Modal ─────────────────────────────────────────────────────────────────

    function buildItemRow(r, isDone) {
        const lockCheck = isStatusAutoDone(r); // 100 / 105 = delivered-style; keep checked, no manual uncheck
        const dimText  = isDone ? 'rgba(255,255,255,0.35)' : '#fff';
        const dimMeta  = isDone ? 'rgba(255,255,255,0.2)'  : 'rgba(255,255,255,0.45)';
        const strike   = isDone ? 'text-decoration:line-through;' : '';

        // Build device line: show device + model if both available
        const device = [r.deviceInfo, r.modelInfo].filter(Boolean);
        const deviceLine = device.length
            ? device.join(' · ')
            : '—';

        return `
            <div class="tm-eod-item" data-id="${r.id}" style="
                display:flex;align-items:flex-start;gap:12px;
                padding:12px 14px;border-radius:12px;margin-bottom:8px;
                background:${isDone ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)'};
                border:1px solid ${isDone ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'};
                opacity:${isDone ? 0.45 : 1};transition:opacity 0.2s;
            ">
                <input type="checkbox" class="tm-eod-check" data-id="${r.id}"
                    ${isDone ? 'checked' : ''}
                    ${lockCheck ? 'disabled' : ''}
                    style="width:18px;height:18px;cursor:${lockCheck ? 'not-allowed' : 'pointer'};accent-color:#4facfe;flex-shrink:0;margin-top:2px;opacity:${lockCheck ? '0.85' : '1'};">

                <div style="flex:1;min-width:0;">
                    <!-- Row 1: ID + customer + status badge -->
                    <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:4px;">
                        <span style="font-weight:700;font-size:14px;color:${dimText};${strike}">
                            #${r.id}
                        </span>
                        <span style="font-size:13px;color:${dimText};font-weight:600;${strike}
                            overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px;">
                            ${r.customerName || 'Άγνωστος'}
                        </span>
                        ${statusBadgeHTML(r.status)}
                    </div>
                    <!-- Row 2: device info -->
                    <div style="font-size:11px;color:${dimMeta};
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px;">
                        📱 ${deviceLine}
                    </div>
                    <!-- Row 3: timestamp -->
                    <div style="font-size:11px;color:${dimMeta};">
                        🕐 ${fmtFull(r.timestamp)}
                    </div>
                </div>

                <a href="${r.url}" title="Άνοιγμα επισκευής" style="
                    padding:5px 10px;border-radius:8px;font-size:12px;font-weight:600;
                    background:rgba(79,172,254,0.12);border:1px solid rgba(79,172,254,0.25);
                    color:#4facfe;text-decoration:none;flex-shrink:0;margin-top:1px;
                    transition:background 0.15s;
                ">→</a>
            </div>`;
    }

    function showEODModal(STORAGE_KEYS) {
        document.getElementById('tm-eod-modal')?.remove();

        const today      = getTodaysRepairs(STORAGE_KEYS);
        const dismissed  = getDismissed(STORAGE_KEYS);
        const pending    = today.filter(r => !isEODDoneRepair(r, dismissed));

        // Done = manual dismiss order first, then status 100/105 repairs not in that list
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
            <div style="text-align:center;padding:44px 0;color:rgba(255,255,255,0.3);">
                <div style="font-size:44px;margin-bottom:12px">✅</div>
                <div style="font-size:14px">Δεν υπάρχουν επισκευές για σήμερα.</div>
            </div>`;

        const doneSeparator = done.length > 0 ? `
            <div style="font-size:11px;color:rgba(255,255,255,0.25);
                text-align:center;padding:8px 0 4px;margin-top:6px;letter-spacing:0.05em;">
                ── ΕΛΕΓΜΕΝΑ ──
            </div>` : '';

        const overlay = document.createElement('div');
        overlay.id = 'tm-eod-modal';
        overlay.style.cssText = `
            position:fixed;inset:0;
            background:rgba(0,0,0,0.65);
            display:flex;align-items:center;justify-content:center;
            z-index:99999;
            backdrop-filter:blur(6px);
            -webkit-backdrop-filter:blur(6px);
        `;

        const doneBadgeHTML = done.length > 0 ? `
            <span style="
                background:rgba(16,185,129,0.18);border:1px solid rgba(16,185,129,0.35);
                color:#10b981;border-radius:20px;padding:2px 9px;
                font-size:11px;font-weight:700;margin-left:8px;vertical-align:middle;
            ">✓ ${done.length}</span>` : '';

        overlay.innerHTML = `
            <div style="
                background:var(--tm-bg-color,#1a1a2e);
                border:1px solid rgba(255,255,255,0.12);
                border-radius:24px;padding:28px;
                width:90%;max-width:560px;max-height:82vh;
                display:flex;flex-direction:column;
                box-shadow:0 28px 70px rgba(0,0,0,0.65);
            ">
                <!-- Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                    <h2 style="margin:0;color:#fff;font-size:1.2rem;font-weight:700;">
                        🌙 Checklist Τέλους Ημέρας${doneBadgeHTML}
                    </h2>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <button id="tm-eod-refresh" title="Ανανέωση κατάστασης επισκευών" style="
                            background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);
                            color:rgba(255,255,255,0.6);border-radius:8px;
                            padding:5px 10px;font-size:13px;cursor:pointer;
                            display:flex;align-items:center;gap:5px;
                            transition:background 0.15s,color 0.15s;white-space:nowrap;
                        ">🔄 <span id="tm-eod-refresh-label">Ανανέωση</span></button>
                        <button id="tm-eod-close" style="
                            background:none;border:none;color:rgba(255,255,255,0.45);
                            font-size:22px;cursor:pointer;padding:0 4px;line-height:1;
                        ">&times;</button>
                    </div>
                </div>

                <!-- Subtitle -->
                <p style="margin:0 0 18px;color:rgba(255,255,255,0.4);font-size:13px;">
                    ${today.length === 0
                        ? 'Δεν ανοίξατε καμία επισκευή σήμερα.'
                        : `Επισκεφθήκατε <b style="color:rgba(255,255,255,0.7)">${today.length}</b>
                           επισκευ${today.length === 1 ? 'ή' : 'ές'} σήμερα.
                           ${pending.length > 0
                               ? `<span style="color:#fbbf24">${pending.length} χωρίς επαλήθευση.</span>`
                               : '<span style="color:#10b981">Όλα ελεγμένα! 🎉</span>'}`
                    }
                </p>

                <!-- List -->
                <div id="tm-eod-list" style="overflow-y:auto;flex:1;padding-right:4px;">
                    ${today.length === 0
                        ? emptyState
                        : pendingHTML + doneSeparator + doneHTML}
                </div>

                <!-- Mark all button -->
                ${pending.length > 0 ? `
                <button id="tm-eod-mark-all" style="
                    width:100%;margin-top:16px;padding:12px;
                    background:linear-gradient(135deg,rgba(79,172,254,0.18),rgba(0,242,254,0.12));
                    border:1px solid rgba(79,172,254,0.35);
                    color:#4facfe;border-radius:12px;
                    cursor:pointer;font-size:14px;font-weight:700;
                    transition:background 0.15s;
                ">✓ Σήμανση όλων ως ελεγμένα</button>` : ''}
            </div>
        `;

        document.body.appendChild(overlay);

        // Close handlers
        overlay.querySelector('#tm-eod-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

        // Refresh button — fetch live status for every repair then re-render
        const refreshBtn   = overlay.querySelector('#tm-eod-refresh');
        const refreshLabel = overlay.querySelector('#tm-eod-refresh-label');
        refreshBtn.addEventListener('click', () => {
            if (refreshBtn.disabled) return;
            refreshBtn.disabled = true;
            refreshBtn.style.opacity = '0.6';
            refreshLabel.textContent = '0 / ' + today.length;

            refreshAllStatuses(
                STORAGE_KEYS,
                (done, total) => {
                    refreshLabel.textContent = done + ' / ' + total;
                },
                () => {
                    // Re-open modal with updated statuses
                    overlay.remove();
                    showEODModal(STORAGE_KEYS);
                }
            );
        });
        refreshBtn.addEventListener('mouseenter', () => {
            if (!refreshBtn.disabled) refreshBtn.style.background = 'rgba(79,172,254,0.18)';
        });
        refreshBtn.addEventListener('mouseleave', () => {
            if (!refreshBtn.disabled) refreshBtn.style.background = 'rgba(255,255,255,0.07)';
        });

        // Individual checkbox toggle (status 100/105 rows use disabled checkboxes)
        overlay.querySelectorAll('.tm-eod-check').forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.disabled) return;
                let current = getDismissed(STORAGE_KEYS);
                const id = cb.dataset.id;
                if (cb.checked) {
                    if (!current.includes(id)) current.push(id);
                } else {
                    current = current.filter(x => x !== id);
                }
                setDismissed(STORAGE_KEYS, current);
                updateFooterBadge(STORAGE_KEYS);
                showEODModal(STORAGE_KEYS); // re-render with updated state
            });
        });

        // Mark all
        overlay.querySelector('#tm-eod-mark-all')?.addEventListener('click', () => {
            setDismissed(STORAGE_KEYS, today.map(r => r.id));
            updateFooterBadge(STORAGE_KEYS);
            showEODModal(STORAGE_KEYS);
        });
    }

    // ── Init ─────────────────────────────────────────────────────────────────

    function initEODChecklist(config, STORAGE_KEYS) {
        if (!isUnlocked(STORAGE_KEYS, config)) {
            document.getElementById('tm-eod-btn')?.remove();
            return;
        }

        // Retry until the footer right container is in the DOM
        function tryInject() {
            const footerRight = document.getElementById('tm-footer-controls-right');
            if (!footerRight) {
                setTimeout(tryInject, 400);
                return;
            }
            if (document.getElementById('tm-eod-btn')) return; // already injected

            const btn = document.createElement('button');
            btn.id = 'tm-eod-btn';
            btn.title = 'Checklist Τέλους Ημέρας';
            btn.style.cssText = `
                position:relative;
                background:rgba(255,255,255,0.08);
                border:1px solid rgba(255,255,255,0.15);
                color:rgba(255,255,255,0.85);
                border-radius:10px;
                padding:6px 10px;
                cursor:pointer;
                font-size:16px;
                line-height:1;
                transition:background 0.2s,transform 0.15s;
                display:flex;align-items:center;
            `;
            btn.textContent = '🌙';

            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(79,172,254,0.2)';
                btn.style.transform = 'scale(1.08)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(255,255,255,0.08)';
                btn.style.transform = '';
            });
            btn.addEventListener('click', () => showEODModal(STORAGE_KEYS));

            footerRight.prepend(btn);
            updateFooterBadge(STORAGE_KEYS);

            // Refresh badge every 5 minutes
            setInterval(() => updateFooterBadge(STORAGE_KEYS), 5 * 60 * 1000);
        }

        tryInject();
    }

    // ── Public API ────────────────────────────────────────────────────────────
    window.initEODChecklist = initEODChecklist;
    window.showEODModal     = showEODModal;

    // Called by activateFeature() in myman_gamification.js immediately after purchase/equip
    window.activate_eod_checklist = function (config, STORAGE_KEYS) {
        initEODChecklist(config, STORAGE_KEYS);
    };

})();
