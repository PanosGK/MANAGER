// ==UserScript==
// @name         MyMANAGER Repair Phone Display (module)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Clickable phone field on repair edit page — loaded via @require
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// ==/UserScript==

(function () {
    'use strict';

    GM_addStyle(`
        .tm-repair-phone-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-sizing: border-box;
            max-width: 100%;
            margin: 0;
            padding: 5px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            background: #fff;
            color: inherit;
            font: inherit;
            font-weight: normal;
            letter-spacing: normal;
            text-align: left;
            line-height: normal;
            white-space: nowrap;
            cursor: pointer;
            box-shadow: none;
            vertical-align: middle;
        }
        .tm-repair-phone-btn:hover:not(:disabled) {
            border-color: #adb5bd;
            background: #f8f9fa;
        }
        .tm-repair-phone-btn:focus-visible {
            outline: 1px dotted #333;
            outline-offset: 1px;
        }
        .tm-repair-phone-btn:disabled {
            color: #6c757d;
            background: #f5f5f5;
            cursor: default;
        }
        .tm-repair-phone-icon {
            flex-shrink: 0;
            opacity: 0.75;
            font-size: 0.95em;
            line-height: 1;
        }
        .tm-repair-phone-number {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `);

    function formatPhoneDisplay(raw) {
        const trimmed = String(raw || '').trim();
        if (!trimmed) return '';

        const digits = trimmed.replace(/\D/g, '');
        if (!digits) return trimmed;

        let local = digits;
        if (local.startsWith('0030')) local = local.slice(4);
        else if (local.startsWith('30') && local.length >= 12) local = local.slice(2);

        if (local.length === 10) {
            return `${local.slice(0, 3)} ${local.slice(3, 7)} ${local.slice(7)}`;
        }
        if (local.length === 9 && local.startsWith('6')) {
            const padded = `0${local}`;
            return `${padded.slice(0, 3)} ${padded.slice(3, 7)} ${padded.slice(7)}`;
        }
        return trimmed;
    }

    function productsListSearchUrl(raw) {
        const q = String(raw || '').trim();
        if (!q) return '';
        return `https://thefixers.mymanager.gr/mymanagerservice/service_list.php?qs=${encodeURIComponent(q)}`;
    }

    function copyPhoneNumber(raw) {
        const text = String(raw || '').trim();
        if (!text) return Promise.reject(new Error('empty'));

        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }

        return new Promise((resolve, reject) => {
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
                document.body.appendChild(ta);
                ta.select();
                const ok = document.execCommand('copy');
                ta.remove();
                ok ? resolve() : reject(new Error('copy failed'));
            } catch (err) {
                reject(err);
            }
        });
    }

    function getFieldWidth(input) {
        if (input.style.width) return input.style.width;
        const computed = window.getComputedStyle(input).width;
        if (computed && computed !== 'auto' && computed !== '0px') return computed;
        return '';
    }

    function transformPhoneField(input) {
        if (!input || input.dataset.tmPhoneButton === '1') return false;

        const raw = (input.value || input.getAttribute('value') || '').trim();
        const display = formatPhoneDisplay(raw) || raw;
        const fieldName = input.getAttribute('name') || '';
        const fieldWidth = getFieldWidth(input);
        const parent = input.parentNode;
        if (!parent) return false;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = input.id || 'value_strPhoneMobile_1';
        btn.className = 'tm-repair-phone-btn';
        btn.dataset.tmPhoneButton = '1';
        btn.dataset.phoneRaw = raw;
        btn.title = raw
            ? `${display} — κλικ: αντιγραφή · διπλό κλικ: αναζήτηση`
            : 'Δεν υπάρχει κινητό τηλέφωνο';

        if (fieldWidth) btn.style.width = fieldWidth;

        if (!raw) {
            btn.disabled = true;
            btn.textContent = '—';
        } else {
            btn.innerHTML = `<span class="tm-repair-phone-icon" aria-hidden="true">📞</span><span class="tm-repair-phone-number">${display}</span>`;
        }

        if (raw) {
            let clickTimer = null;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (clickTimer) {
                    clearTimeout(clickTimer);
                    clickTimer = null;
                    const href = productsListSearchUrl(raw);
                    if (href) window.open(href, '_blank', 'noopener');
                    return;
                }
                clickTimer = setTimeout(() => {
                    clickTimer = null;
                    copyPhoneNumber(raw)
                        .then(() => {
                            if (typeof window.showPositiveMessage === 'function') {
                                window.showPositiveMessage(`Αντιγράφηκε: ${display}`);
                            } else if (typeof window.createNotification === 'function') {
                                window.createNotification(`Αντιγράφηκε: ${display}`, '📋');
                            }
                        })
                        .catch(() => {
                            if (typeof window.createNotification === 'function') {
                                window.createNotification('Αποτυχία αντιγραφής', '⚠️');
                            }
                        });
                }, 280);
            });
        }

        if (fieldName) {
            const hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.name = fieldName;
            hidden.value = raw;
            hidden.id = `${btn.id}_hidden`;
            hidden.dataset.tmPhoneHidden = '1';
            parent.insertBefore(hidden, input);
        }

        parent.replaceChild(btn, input);
        return true;
    }

    function tryTransform(attempt) {
        const input = document.getElementById('value_strPhoneMobile_1');
        if (input && input.tagName === 'INPUT' && transformPhoneField(input)) {
            return;
        }
        if (attempt < 30) {
            setTimeout(() => tryTransform(attempt + 1), 400);
        }
    }

    function initRepairPhoneButton() {
        if (!window.location.pathname.includes('service_edit.php')) return;
        tryTransform(0);
    }

    window.initRepairPhoneButton = initRepairPhoneButton;
})();
