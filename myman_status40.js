// ==UserScript==
// @name         MyManager Status 40 Feature
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Status 40 button feature for repair edit pages
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// ==/UserScript==

/**
 * Status 40 Feature - Allows switching to a special account on repair edit pages
 * This feature adds a button to repair edit pages that logs out, logs in as a special account,
 * and returns to the same page.
 */

(function() {
    'use strict';

    function getStatus40AdminCredentials() {
        const SK = window.STORAGE_KEYS || {};
        return {
            username: String(GM_getValue(SK.STATUS40_ADMIN_USERNAME || 'tm_status40_admin_username', '') || '').trim(),
            password: String(GM_getValue(SK.STATUS40_ADMIN_PASSWORD || 'tm_status40_admin_password', '') || '')
        };
    }

    function beginStatus40LoginFlow(options = {}) {
        const { applyStatus40 = false } = options;
        const { username, password } = getStatus40AdminCredentials();
        if (!username || !password) {
            alert('Ορίστε username και κωδικό admin στις Ρυθμίσεις → Αναζήτηση & Εργαλεία → Λογαριασμός Admin (Status 40).');
            return false;
        }

        sessionStorage.setItem('tm_status40_return_url', window.location.href);
        sessionStorage.setItem('tm_status40_username', username);
        sessionStorage.setItem('tm_status40_password', password);
        sessionStorage.setItem('tm_status40_active', 'true');
        if (applyStatus40) {
            sessionStorage.setItem('tm_status40_apply_after_return', 'true');
        } else {
            sessionStorage.removeItem('tm_status40_apply_after_return');
        }
        return true;
    }

    function clearStatus40Session() {
        sessionStorage.removeItem('tm_status40_return_url');
        sessionStorage.removeItem('tm_status40_username');
        sessionStorage.removeItem('tm_status40_password');
        sessionStorage.removeItem('tm_status40_active');
        sessionStorage.removeItem('tm_status40_apply_after_return');
    }

    /**
     * Shared entry: logout → admin login → return to current page.
     * When applyStatus40 is true (red «40» button), status 40 is applied after return.
     */
    function triggerStatus40AdminLoginFlow(options = {}) {
        const { applyStatus40 = false, skipConfirm = false } = options;
        const confirmMessage = applyStatus40
            ? 'Θα γίνει logout, login ως admin και επιστροφή για μεταφορά σε status 40 (ΠΡΟΣ ΕΛΕΓΧΟ). Συνέχεια;'
            : 'Θα γίνει logout, login ως admin και επιστροφή στην ίδια σελίδα. Συνέχεια;';

        if (!skipConfirm && !confirm(confirmMessage)) {
            return false;
        }

        if (!beginStatus40LoginFlow({ applyStatus40 })) {
            return false;
        }

        console.log('[MMS] Starting Status 40 admin login flow. applyStatus40:', applyStatus40);
        performLogoutAndRedirectToLogin();
        return true;
    }

    function getStatusSelectOnPage() {
        const selectSelectors = [
            'select[name="value_ccc_iStatusID_1"]',
            'select[id="value_ccc_iStatusID_1"]',
            'select[name="iStatusID"]',
            'select[name*="StatusID"]',
            'select[id*="StatusID"]'
        ];
        for (const sel of selectSelectors) {
            const el = document.querySelector(sel);
            if (el) return el;
        }
        return null;
    }

    function applyStatus40OnCurrentPage() {
        let nativeBtn40 = null;
        document.querySelectorAll('.rnr-button, a[href="#"]').forEach(b => {
            const badge = b.querySelector('.statusbadge');
            if (badge && badge.textContent.trim() === '40') nativeBtn40 = b;
        });
        if (nativeBtn40) {
            nativeBtn40.click();
            return true;
        }

        const sel = getStatusSelectOnPage();
        if (sel) {
            sel.value = '40';
            sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const saveBtn = document.getElementById('saveButton1') ||
                        document.querySelector('a.rnr-button.main') ||
                        document.querySelector('a[id*="save"]');
        if (saveBtn) {
            saveBtn.style.removeProperty('display');
            saveBtn.click();
            return true;
        }
        return false;
    }

    function tryApplyStatus40AfterReturn(retries = 15) {
        if (sessionStorage.getItem('tm_status40_apply_after_return') !== 'true') return;
        if (!window.location.pathname.includes('service_edit.php')) return;

        const applied = applyStatus40OnCurrentPage();
        if (applied) {
            console.log('[MMS] ✅ Applied status 40 after admin login return');
            clearStatus40Session();
            return;
        }

        if (retries > 0) {
            setTimeout(() => tryApplyStatus40AfterReturn(retries - 1), 500);
            return;
        }

        console.warn('[MMS] Could not apply status 40 after admin login return');
        clearStatus40Session();
    }

    function performLogoutAndRedirectToLogin() {
        const logoutButton = document.getElementById('logoutButton1');
        if (logoutButton) {
            const logoutHref = logoutButton.getAttribute('href');
            if (logoutHref && logoutHref !== '#' && !logoutHref.startsWith('javascript:')) {
                window.location.href = logoutHref;
                return;
            }

            const logoutOnclick = logoutButton.getAttribute('onclick');
            if (logoutOnclick) {
                try {
                    eval(logoutOnclick);
                    return;
                } catch (e) {
                    console.error('[MMS] Error executing onclick:', e);
                }
            }

            logoutButton.click();
            return;
        }

        const logoutLink = document.querySelector('a[href*="logout"], a[id*="logout"], button[id*="logout"], a[onclick*="logout"]');
        if (logoutLink) {
            const href = logoutLink.getAttribute('href');
            if (href && href !== '#' && !href.startsWith('javascript:')) {
                window.location.href = href;
                return;
            }

            const onclick = logoutLink.getAttribute('onclick');
            if (onclick) {
                try {
                    eval(onclick);
                    return;
                } catch (e) {
                    logoutLink.click();
                    return;
                }
            }

            logoutLink.click();
            return;
        }

        window.location.href = 'https://thefixers.mymanager.gr/mymanagerservice/login.php';
    }

    window.getStatus40AdminCredentials = getStatus40AdminCredentials;
    window.triggerStatus40AdminLoginFlow = triggerStatus40AdminLoginFlow;

    /**
     * Handles auto-login on the login page if we're switching accounts
     * Only runs if the Status 40 button was clicked (indicated by sessionStorage flag)
     */
    function handleAutoLogin() {
        if (window.location.pathname.includes('login.php')) {
            const returnUrl = sessionStorage.getItem('tm_status40_return_url');
            const username = sessionStorage.getItem('tm_status40_username');
            const password = sessionStorage.getItem('tm_status40_password');
            const status40Flag = sessionStorage.getItem('tm_status40_active');
            
            // Only auto-login if the Status 40 button was clicked (flag is set)
            if (returnUrl && username && password && status40Flag === 'true') {
                console.log('[MMS] Auto-login detected, logging in as special account...');
                
                // Clear the flag immediately to prevent re-running
                sessionStorage.removeItem('tm_status40_active');
                
                // Wait for form to be ready
                const tryLogin = () => {
                    const loginForm = document.querySelector('form#form1') || document.querySelector('form');
                    if (loginForm) {
                        const usernameInput = loginForm.querySelector('input[name="username"]') || loginForm.querySelector('input[type="text"]');
                        const passwordInput = loginForm.querySelector('input[name="password"]') || loginForm.querySelector('input[type="password"]');
                        
                        if (usernameInput && passwordInput) {
                            usernameInput.value = username;
                            passwordInput.value = password;
                            
                            // Get return URL before submitting
                            const returnUrl = sessionStorage.getItem('tm_status40_return_url');
                            
                            // Try to add return URL as hidden input or modify form action
                            if (returnUrl) {
                                // Check if form has a return URL parameter
                                const returnInput = loginForm.querySelector('input[name="return"], input[name="redirect"], input[name="returnUrl"]');
                                if (returnInput) {
                                    returnInput.value = returnUrl;
                                } else {
                                    // Add hidden input for return URL
                                    const hiddenInput = document.createElement('input');
                                    hiddenInput.type = 'hidden';
                                    hiddenInput.name = 'return';
                                    hiddenInput.value = returnUrl;
                                    loginForm.appendChild(hiddenInput);
                                }
                                
                                // Also modify form action if it exists
                                if (loginForm.action) {
                                    const url = new URL(loginForm.action, window.location.origin);
                                    url.searchParams.set('return', returnUrl);
                                    loginForm.action = url.toString();
                                }
                            }
                            
                            // Submit the form
                            setTimeout(() => {
                                console.log('[MMS] Submitting login form, return URL:', returnUrl);
                                loginForm.submit();
                            }, 500);
                        } else {
                            // Retry if form not ready
                            setTimeout(tryLogin, 200);
                        }
                    } else {
                        // Retry if form not found
                        setTimeout(tryLogin, 200);
                    }
                };
                
                // Start trying to login
                setTimeout(tryLogin, 500);
            } else {
                // Clear leftover session data if flag is not set
                if (returnUrl || username || password) {
                    clearStatus40Session();
                }
            }
        }
    }

    /**
     * Checks if we need to redirect to return URL after login
     * This runs on every page to catch the redirect after successful login
     */
    function checkForReturnUrl() {
        // Only check if we're NOT on the login page (meaning login was successful)
        if (!window.location.pathname.includes('login.php')) {
            const returnUrl = sessionStorage.getItem('tm_status40_return_url');
            if (returnUrl && window.location.href !== returnUrl) {
                console.log('[MMS] Login successful, redirecting to return URL:', returnUrl);
                const applyAfterReturn = sessionStorage.getItem('tm_status40_apply_after_return');
                sessionStorage.removeItem('tm_status40_return_url');
                sessionStorage.removeItem('tm_status40_username');
                sessionStorage.removeItem('tm_status40_password');
                sessionStorage.removeItem('tm_status40_active');
                if (applyAfterReturn === 'true') {
                    sessionStorage.setItem('tm_status40_apply_after_return', 'true');
                }
                window.location.href = returnUrl;
            } else if (returnUrl && window.location.href === returnUrl) {
                sessionStorage.removeItem('tm_status40_return_url');
                sessionStorage.removeItem('tm_status40_username');
                sessionStorage.removeItem('tm_status40_password');
                sessionStorage.removeItem('tm_status40_active');
                setTimeout(() => tryApplyStatus40AfterReturn(), 800);
            }
        }
    }

    // Check for auto-login on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            handleAutoLogin();
            setTimeout(checkForReturnUrl, 1000);
            setTimeout(() => tryApplyStatus40AfterReturn(), 1200);
        });
    } else {
        handleAutoLogin();
        setTimeout(checkForReturnUrl, 1000);
        setTimeout(() => tryApplyStatus40AfterReturn(), 1200);
    }
    
    // Also check on window load
    window.addEventListener('load', () => {
        setTimeout(checkForReturnUrl, 1500);
        setTimeout(() => tryApplyStatus40AfterReturn(), 1800);
    });

    /**
     * Adds a button to the repair edit page that logs out, logs in as a special account,
     * and returns to the same page.
     */
    function initStatus40Button() {
        // Only render on repair edit page
        if (!window.location.pathname.includes('service_edit.php')) {
            return;
        }
        
        // Get repair ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const repairId = urlParams.get('id') || urlParams.get('editid1') || window.location.href.match(/[?&]id=(\d+)/)?.[1];
        
        if (!repairId) {
            console.log('[MMS] Could not find repair ID for Status 40 button');
            return;
        }

        const tryIntegrate = (retries = 10) => {
            // Avoid duplicate initialization
            if (document.getElementById('tm-status40-integrated')) {
                return;
            }
            
            // Find the existing footer logo
            const footerLogo = document.querySelector('h1.logo img.footer-logo, .logo img.footer-logo, h1.logo, .footer-logo');
            if (!footerLogo) {
                if (retries > 0) {
                    setTimeout(() => tryIntegrate(retries - 1), 300);
                } else {
                    console.log('[MMS] Footer logo not found after retries');
                }
                return;
            }
            
            // Get the logo container (h1.logo or the parent)
            const logoContainer = footerLogo.closest('h1.logo') || footerLogo.parentElement;
            if (!logoContainer) {
                if (retries > 0) {
                    setTimeout(() => tryIntegrate(retries - 1), 300);
                } else {
                    console.log('[MMS] Logo container not found after retries');
                }
                return;
            }
            
            // Mark as integrated
            logoContainer.id = 'tm-status40-integrated';
            
            // Ensure it’s clickable above overlays
            logoContainer.style.cursor = 'pointer';
            logoContainer.style.position = logoContainer.style.position || 'relative';
            logoContainer.style.zIndex = '99999';
            logoContainer.style.pointerEvents = 'auto';
            logoContainer.title = 'Login as Admin';
            
            // Add subtle hover effect
            logoContainer.addEventListener('mouseenter', () => {
                logoContainer.style.opacity = '0.7';
            });
            logoContainer.addEventListener('mouseleave', () => {
                logoContainer.style.opacity = '1';
            });
            
            // Add click handler to the logo
            logoContainer.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                logoContainer.style.opacity = '0.5';
                logoContainer.style.pointerEvents = 'none';

                try {
                    const started = triggerStatus40AdminLoginFlow({ applyStatus40: false });
                    if (!started) {
                        logoContainer.style.pointerEvents = 'auto';
                        logoContainer.style.opacity = '1';
                    }
                } catch (error) {
                    console.error('[MMS] Status 40 button error:', error);
                    alert('Error: ' + error.message);
                    logoContainer.style.pointerEvents = 'auto';
                    logoContainer.style.opacity = '1';
                }
            }, { passive: false });
            
            // Logo is now integrated and clickable
            console.log('[MMS] Login as Admin functionality integrated into footer logo');
        };
        
        // Try now and retry if DOM not ready
        tryIntegrate();
        
        // Fallback: add a subtle floating button if logo never found
        const ensureFallbackButton = () => {
            if (document.getElementById('tm-status40-integrated') || document.getElementById('tm-status40-fallback')) return;
            
            const btn = document.createElement('button');
            btn.id = 'tm-status40-fallback';
            btn.textContent = '🔑 Admin Login';
            btn.style.cssText = `
                position: fixed;
                bottom: 16px;
                right: 16px;
                z-index: 100000;
                padding: 8px 12px;
                border: 1px solid rgba(0,0,0,0.08);
                border-radius: 10px;
                background: linear-gradient(145deg, #f7f7f7 0%, #eaeaea 100%);
                color: #333;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                cursor: pointer;
                opacity: 0.9;
            `;
            btn.addEventListener('mouseenter', () => btn.style.opacity = '1');
            btn.addEventListener('mouseleave', () => btn.style.opacity = '0.9');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Delegate to logo integration handler if available, otherwise run the same flow
                const logoContainer = document.getElementById('tm-status40-integrated');
                if (logoContainer) {
                    logoContainer.click();
                    return;
                }
                triggerStatus40AdminLoginFlow({ applyStatus40: false });
            }, { passive: false });
            
            document.body.appendChild(btn);
        };
        
        // Wait a short time for logo; if not found, render fallback
        setTimeout(ensureFallbackButton, 1800);
    }

    // Make function globally accessible
    window.initStatus40Button = initStatus40Button;

})();

