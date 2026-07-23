// ==UserScript==
// @name         MyManager WiFi QR
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Show a WiFi connection QR when clicking the footer logo on service_list
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
    'use strict';

    const WIFI_QR_MARK = 'tm-wifi-qr-integrated';

    function storageKeys() {
        return window.STORAGE_KEYS || {};
    }

    function isServiceListPage() {
        const path = window.location.pathname || '';
        if (path.includes('service_edit.php')) return false;
        return path.includes('/mymanagerservice/service_list.php');
    }

    function escapeWifiField(value) {
        return String(value ?? '').replace(/([\\";,])/g, '\\$1');
    }

    function escapeHtml(text) {
        return String(text ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function readWifiSettings() {
        const keys = storageKeys();
        return {
            ssid: String(GM_getValue(keys.WIFI_SSID || 'tm_wifi_ssid', '') || '').trim(),
            password: String(GM_getValue(keys.WIFI_PASSWORD || 'tm_wifi_password', '') || ''),
            security: String(GM_getValue(keys.WIFI_SECURITY || 'tm_wifi_security', 'WPA') || 'WPA').toUpperCase()
        };
    }

    function buildWifiPayload(ssid, password, security) {
        const type = security === 'NOPASS' || security === 'NONE' || !password
            ? 'nopass'
            : (security === 'WEP' ? 'WEP' : 'WPA');
        if (type === 'nopass') {
            return `WIFI:T:nopass;S:${escapeWifiField(ssid)};;`;
        }
        return `WIFI:T:${type};S:${escapeWifiField(ssid)};P:${escapeWifiField(password)};;`;
    }

    function buildQrSvg(text) {
        const factory = window.tmQrcode || (typeof qrcode === 'function' ? qrcode : null);
        if (typeof factory !== 'function') {
            throw new Error('QR library not loaded');
        }
        if (factory.stringToBytesFuncs && factory.stringToBytesFuncs['UTF-8']) {
            factory.stringToBytes = factory.stringToBytesFuncs['UTF-8'];
        }
        // typeNumber 0 = auto; M = medium error correction
        const qr = factory(0, 'M');
        qr.addData(text, 'Byte');
        qr.make();
        return qr.createSvgTag({ cellSize: 6, margin: 12, scalable: true, alt: 'WiFi QR' });
    }

    function ensureWifiQrStyles() {
        if (document.getElementById('tm-wifi-qr-styles')) return;
        const style = document.createElement('style');
        style.id = 'tm-wifi-qr-styles';
        style.textContent = `
            #tm-wifi-qr-overlay {
                position: fixed; inset: 0; z-index: 100050;
                display: flex; align-items: center; justify-content: center;
                padding: 16px;
                background: rgba(0, 0, 0, 0.55);
                backdrop-filter: blur(4px);
            }
            .tm-wifi-qr-card {
                width: min(360px, 92vw);
                background: #fff;
                color: #111;
                border: 2px solid #111;
                box-shadow: 8px 8px 0 #111;
                padding: 18px 18px 14px;
                font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;
                text-align: center;
            }
            .tm-wifi-qr-title {
                margin: 0 0 4px;
                font-size: 16px;
                font-weight: 800;
                letter-spacing: -0.01em;
            }
            .tm-wifi-qr-ssid {
                margin: 0 0 12px;
                font-size: 13px;
                font-weight: 600;
                word-break: break-word;
            }
            .tm-wifi-qr-svg-wrap {
                display: flex; justify-content: center; align-items: center;
                margin: 0 auto 12px;
                padding: 8px;
                background: #fff;
                border: 1px solid #111;
            }
            .tm-wifi-qr-svg-wrap svg {
                width: min(240px, 70vw);
                height: auto;
                display: block;
            }
            .tm-wifi-qr-hint {
                margin: 0 0 12px;
                font-size: 11px;
                color: #444;
                line-height: 1.4;
            }
            .tm-wifi-qr-actions {
                display: flex; justify-content: center; gap: 8px;
            }
            .tm-wifi-qr-actions button {
                border: 1.5px solid #111;
                background: #111;
                color: #fff;
                font-weight: 700;
                font-size: 12px;
                letter-spacing: 0.04em;
                text-transform: uppercase;
                padding: 9px 14px;
                cursor: pointer;
                font-family: inherit;
            }
            .tm-wifi-qr-actions button:hover { background: #222; }
        `;
        document.head.appendChild(style);
    }

    function closeWifiQrModal() {
        document.getElementById('tm-wifi-qr-overlay')?.remove();
    }

    function showWifiQrModal() {
        const { ssid, password, security } = readWifiSettings();
        if (!ssid) {
            alert('Ορίστε το όνομα WiFi στις Ρυθμίσεις → Εργαλεία → WiFi QR.');
            return;
        }

        ensureWifiQrStyles();
        closeWifiQrModal();

        let svgHtml = '';
        try {
            svgHtml = buildQrSvg(buildWifiPayload(ssid, password, security));
        } catch (err) {
            console.error('[MMS WiFi QR] Failed to generate QR:', err);
            alert('Αποτυχία δημιουργίας QR. Ανανεώστε τη σελίδα και δοκιμάστε ξανά.');
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'tm-wifi-qr-overlay';
        overlay.innerHTML = `
            <div class="tm-wifi-qr-card" role="dialog" aria-modal="true" aria-labelledby="tm-wifi-qr-title">
                <h2 class="tm-wifi-qr-title" id="tm-wifi-qr-title">Σύνδεση WiFi</h2>
                <p class="tm-wifi-qr-ssid">${escapeHtml(ssid)}</p>
                <div class="tm-wifi-qr-svg-wrap">${svgHtml}</div>
                <p class="tm-wifi-qr-hint">Σαρώστε με την κάμερα του τηλεφώνου για σύνδεση στο δίκτυο.</p>
                <div class="tm-wifi-qr-actions">
                    <button type="button" id="tm-wifi-qr-close">Κλείσιμο</button>
                </div>
            </div>
        `;

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeWifiQrModal();
        });
        overlay.querySelector('#tm-wifi-qr-close')?.addEventListener('click', closeWifiQrModal);
        document.addEventListener('keydown', function onKey(e) {
            if (e.key === 'Escape') {
                closeWifiQrModal();
                document.removeEventListener('keydown', onKey);
            }
        });

        document.body.appendChild(overlay);
    }

    function bindFooterLogo(retries) {
        if (document.getElementById(WIFI_QR_MARK)) return;

        const footerLogo = document.querySelector('h1.logo img.footer-logo, .logo img.footer-logo, img.footer-logo, h1.logo, .footer-logo');
        if (!footerLogo) {
            if (retries > 0) setTimeout(() => bindFooterLogo(retries - 1), 300);
            return;
        }

        const logoContainer = footerLogo.closest('h1.logo') || footerLogo.parentElement || footerLogo;
        if (!logoContainer) {
            if (retries > 0) setTimeout(() => bindFooterLogo(retries - 1), 300);
            return;
        }

        // Don't steal Status 40's logo handler on repair pages (already gated, but be safe)
        if (logoContainer.id === 'tm-status40-integrated') return;

        logoContainer.id = WIFI_QR_MARK;
        logoContainer.style.cursor = 'pointer';
        logoContainer.style.position = logoContainer.style.position || 'relative';
        logoContainer.style.zIndex = '99999';
        logoContainer.style.pointerEvents = 'auto';
        logoContainer.title = 'WiFi QR — σύνδεση δικτύου';

        logoContainer.addEventListener('mouseenter', () => {
            logoContainer.style.opacity = '0.75';
        });
        logoContainer.addEventListener('mouseleave', () => {
            logoContainer.style.opacity = '1';
        });

        logoContainer.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showWifiQrModal();
        }, { passive: false });

        console.log('[MMS WiFi QR] Footer logo bound on service_list');
    }

    function initWifiQrFeature() {
        if (!isServiceListPage()) return;
        bindFooterLogo(12);
        setTimeout(() => bindFooterLogo(0), 1200);
    }

    window.initWifiQrFeature = initWifiQrFeature;
    window.showWifiQrModal = showWifiQrModal;
})();
