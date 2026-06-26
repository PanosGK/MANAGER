// ==UserScript==
// @name         MyManager Status 40 Feature
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Status 40 button feature for repair edit pages
// @author       You
// ==/UserScript==

/**
 * Status 40 Feature - Allows switching to a special account on repair edit pages
 * This feature adds a button to repair edit pages that logs out, logs in as a special account,
 * and returns to the same page.
 */

(function() {
    'use strict';

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
                // Clear any leftover sessionStorage if flag is not set
                if (returnUrl || username || password) {
                    sessionStorage.removeItem('tm_status40_return_url');
                    sessionStorage.removeItem('tm_status40_username');
                    sessionStorage.removeItem('tm_status40_password');
                    sessionStorage.removeItem('tm_status40_active');
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
                // Clear sessionStorage before redirect
                sessionStorage.removeItem('tm_status40_return_url');
                sessionStorage.removeItem('tm_status40_username');
                sessionStorage.removeItem('tm_status40_password');
                sessionStorage.removeItem('tm_status40_active');
                // Redirect to the return URL
                window.location.href = returnUrl;
            }
        }
    }

    // Check for auto-login on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            handleAutoLogin();
            // Also check for return URL after a delay
            setTimeout(checkForReturnUrl, 1000);
        });
    } else {
        handleAutoLogin();
        setTimeout(checkForReturnUrl, 1000);
    }
    
    // Also check on window load
    window.addEventListener('load', () => {
        setTimeout(checkForReturnUrl, 1500);
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
        
        const specialAccountUsername = 'aantoniou';
        const specialAccountPassword = '19931996Kka';
        
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
                
                // Confirm action
                if (!confirm('This will logout, login as admin, and return to this page. Continue?')) {
                    return;
                }
                
                // Show loading state (change logo opacity)
                logoContainer.style.opacity = '0.5';
                logoContainer.style.pointerEvents = 'none';
                
                try {
                    // Get current page URL to return to the same page after login
                    const currentPageUrl = window.location.href;
                    
                    console.log('[MMS] Starting logout/login sequence. Will return to:', currentPageUrl);
                    
                    // Store the current page URL in sessionStorage before logout
                    // Set a flag to indicate Status 40 button was clicked
                    sessionStorage.setItem('tm_status40_return_url', currentPageUrl);
                    sessionStorage.setItem('tm_status40_username', specialAccountUsername);
                    sessionStorage.setItem('tm_status40_password', specialAccountPassword);
                    sessionStorage.setItem('tm_status40_active', 'true');
                    
                    // Step 1: Try to find and use the logout button
                    const logoutButton = document.getElementById('logoutButton1');
                    if (logoutButton) {
                        // Check if button has an href attribute
                        const logoutHref = logoutButton.getAttribute('href');
                        if (logoutHref && logoutHref !== '#' && !logoutHref.startsWith('javascript:')) {
                            window.location.href = logoutHref;
                            return;
                        }
                        
                        // Check if button has onclick attribute
                        const logoutOnclick = logoutButton.getAttribute('onclick');
                        if (logoutOnclick) {
                            try {
                                eval(logoutOnclick);
                                return;
                            } catch (e) {
                                console.error('[MMS] Error executing onclick:', e);
                            }
                        }
                        
                        // Try clicking the button
                        logoutButton.click();
                    } else {
                        // Fallback: try to find any logout link
                        const logoutLink = document.querySelector('a[href*="logout"], a[id*="logout"], button[id*="logout"], a[onclick*="logout"]');
                        if (logoutLink) {
                            const href = logoutLink.getAttribute('href');
                            if (href && href !== '#' && !href.startsWith('javascript:')) {
                                window.location.href = href;
                            } else {
                                const onclick = logoutLink.getAttribute('onclick');
                                if (onclick) {
                                    try {
                                        eval(onclick);
                                    } catch (e) {
                                        logoutLink.click();
                                    }
                                } else {
                                    logoutLink.click();
                                }
                            }
                        } else {
                            // Last resort: navigate directly to login page
                            // The login page will handle the logout automatically
                            window.location.href = 'https://thefixers.mymanager.gr/mymanagerservice/login.php';
                        }
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
                // Minimal fallback flow: set session flags and navigate to login (logout handled there)
                sessionStorage.setItem('tm_status40_return_url', window.location.href);
                sessionStorage.setItem('tm_status40_username', specialAccountUsername);
                sessionStorage.setItem('tm_status40_password', specialAccountPassword);
                sessionStorage.setItem('tm_status40_active', 'true');
                window.location.href = 'https://thefixers.mymanager.gr/mymanagerservice/login.php';
            }, { passive: false });
            
            document.body.appendChild(btn);
        };
        
        // Wait a short time for logo; if not found, render fallback
        setTimeout(ensureFallbackButton, 1800);
    }

    // Make function globally accessible
    window.initStatus40Button = initStatus40Button;

})();

