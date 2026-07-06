// ==UserScript==
// @name         MyMANAGER Repair Phone Display (module)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Prominent phone button on repair edit page — loaded via @require
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// ==/UserScript==

(function () {
    'use strict';

    function formatPhoneDisplay(raw) {
        const trimmed = String(raw || '').trim();
        if (!trimmed) return '';

        const digits = trimmed.replace(/\D/g, '');
        if (!digits) return trimmed;

        let local = digits;
        if (local.startsWith('0030')) local = local.slice(4);
        else if (local.startsWith('30') && local.length >= 12) local = local.slice(2);

        if (local.length === 10) {
            return `${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 8)} ${local.slice(8)}`;
        }
        if (local.length === 9 && local.startsWith('6')) {
            return `${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
        }
        return trimmed;
    }

    function productsListSearchUrl(raw) {
        const q = String(raw || '').trim();
        if (!q) return '';
        return `https://thefixers.mymanager.gr/mymanagerservice/products_list.php?qs=${encodeURIComponent(q)}`;
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

    function transformPhoneField(input) {
        if (!input || input.dataset.tmPhoneButton === '1') return false;

        const raw = (input.value || input.getAttribute('value') || '').trim();
        const display = formatPhoneDisplay(raw) || raw;
        const fieldName = input.getAttribute('name') || '';
        const parent = input.parentNode;
        if (!parent) return false;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = input.id || 'value_strPhoneMobile_1';
        btn.dataset.tmPhoneButton = '1';
        btn.dataset.phoneRaw = raw;
        btn.title = raw
            ? `📞 ${display}\nΚλικ: αντιγραφή · Διπλό κλικ: αναζήτηση`
            : 'Δεν υπάρχει κινητό τηλέφωνο';

        btn.style.cssText = [
            'display:block',
            'width:100%',
            'max-width:100%',
            'box-sizing:border-box',
            'padding:14px 16px',
            'margin:2px 0',
            'border-radius:12px',
            'border:2px solid rgba(14,165,233,0.45)',
            'background:linear-gradient(135deg,rgba(14,165,233,0.14),rgba(6,182,212,0.1))',
            'color:#0369a1',
            'font-size:clamp(1.25rem,4vw,1.65rem)',
            'font-weight:800',
            'letter-spacing:0.06em',
            'text-align:center',
            'cursor:pointer',
            'font-family:inherit',
            'line-height:1.25',
            'box-shadow:0 4px 14px rgba(14,165,233,0.12)',
            'transition:transform 0.12s ease, box-shadow 0.12s ease',
        ].join(';');

        if (!raw) {
            btn.disabled = true;
            btn.style.opacity = '0.55';
            btn.style.cursor = 'default';
            btn.textContent = '— Χωρίς κινητό —';
        } else {
            btn.innerHTML = `<span style="font-size:0.95em;margin-right:8px;opacity:0.85;">📞</span>${display}`;
        }

        btn.addEventListener('mouseenter', () => {
            if (btn.disabled) return;
            btn.style.transform = 'translateY(-1px)';
            btn.style.boxShadow = '0 6px 18px rgba(14,165,233,0.22)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.boxShadow = '0 4px 14px rgba(14,165,233,0.12)';
        });

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
                                window.showPositiveMessage(`📋 Αντιγράφηκε: ${display}`);
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
