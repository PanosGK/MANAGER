// This script is intended to be used as a library via the @require directive
// in the main "MyManager All-in-One Suite" script. It does not do anything on its own.

/**
 * Initializes the custom minimal login experience.
 * @param {object} STORAGE_KEYS - An object containing storage keys from the main script.
 */
function initLoginPage(STORAGE_KEYS) {
    const LOGIN_USERS_KEY = 'tm_login_users_v2';

    // 1. Hide the original, cluttered login page content
    const originalPage = document.querySelector('.rnr-page');
    if (originalPage) {
        originalPage.style.display = 'none';
    }

    // The original form is still needed to submit the login
    const originalForm = document.getElementById('form1');
    if (!originalForm) {
        console.error("Original login form not found. Cannot proceed.");
        return;
    }

    // Load users from GM_storage
    let USER_CREDENTIALS = JSON.parse(GM_getValue(LOGIN_USERS_KEY, '{}'));

    // 2. Inject new, minimal HTML and styles
    GM_addStyle(`
        /* --- Google Fonts --- */
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

        /* --- Base Styles --- */
        body.custom-login {
            background: #0f0f23 !important;
            font-family: 'Roboto', sans-serif;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: #fff;
            overflow: hidden;
            position: relative;
        }
        
        /* Animated background gradient */
        body.custom-login::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
            background-size: 400% 400%;
            animation: gradient-shift 15s ease infinite;
            opacity: 0.4;
            z-index: 0;
        }
        
        @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* Floating particles */
        body.custom-login::after {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(240, 147, 251, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(79, 172, 254, 0.1) 0%, transparent 50%);
            z-index: 0;
        }
        
        .minimal-login-container {
            position: relative;
            z-index: 1;
        }

        /* --- Hide Original Header/Footer --- */
        .custom-login #head-outter, .custom-login #footer-outter {
            display: none !important;
        }

        /* --- Main Login Container --- */
        .minimal-login-container {
            background: rgba(0, 0, 0, 0.4) !important;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.3);
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 450px;
            width: 90%;
            animation: fadeIn 1s ease-out;
            text-align: center;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .minimal-login-container h1 {
            font-weight: 300;
            font-size: 2.5rem;
            margin-bottom: 2rem;
            letter-spacing: 1px;
            color: #fff !important;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 255, 255, 0.4);
        }

        /* --- Error Message --- */
        .minimal-login-error {
            background: #e53935; /* A slightly darker red for better contrast */
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            margin-bottom: 20px;
            width: 100%;
            box-sizing: border-box;
            text-align: center;
            font-weight: 500;
            display: none; /* Hidden by default */
            animation: fadeIn 0.5s;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        /* --- Input Fields --- */
        #minimal-username-input,
        #minimal-password-input {
            background: rgba(255, 255, 255, 0.25) !important;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            padding: 15px 30px;
            font-size: 1.2rem;
            color: #fff !important;
            text-align: center;
            width: 110%;
            max-width: 450px;
            margin-left: -5%;
            outline: none;
            transition: all 0.3s ease;
            box-sizing: border-box;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }
        #minimal-username-input::placeholder,
        #minimal-password-input::placeholder { 
            color: rgba(255, 255, 255, 0.8) !important; 
        }
        #minimal-username-input:focus,
        #minimal-password-input:focus {
            background: rgba(255, 255, 255, 0.35) !important;
            border-color: rgba(255, 255, 255, 0.5);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
        }

        /* --- Store Selector --- */
        #minimal-store-selector {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            justify-content: center;
            margin-top: 20px;
            width: 100%;
        }
        .minimal-store-btn {
            background: rgba(255, 255, 255, 0.25) !important;
            border: 2px solid rgba(255, 255, 255, 0.4);
            color: white !important;
            padding: 15px 30px;
            font-size: 1.1rem;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            flex-grow: 1;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }
        .minimal-store-btn:hover {
            background: rgba(255, 255, 255, 0.4) !important;
            border-color: rgba(255, 255, 255, 0.6);
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
            transform: translateY(-3px);
        }

        /* --- Settings Panel --- */
        #login-settings-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            font-size: 22px;
            cursor: pointer;
            transition: all 0.4s ease;
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #login-settings-btn:hover {
            background: rgba(255,255,255,0.4);
            transform: rotate(90deg);
        }
        #login-settings-panel {
            position: fixed;
            top: 0;
            right: -450px; /* Start off-screen */
            width: 420px;
            height: 100%;
            background: #f8f9fa;
            box-shadow: -5px 0 15px rgba(0,0,0,0.3);
            z-index: 10000;
            transition: right 0.5s cubic-bezier(0.23, 1, 0.32, 1);
            padding: 20px;
            color: #343a40;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
        }
        #login-settings-panel.visible { right: 0; }
        #login-settings-panel h2 { margin-top: 0; font-weight: 400; border-bottom: 1px solid #dee2e6; padding-bottom: 10px; }
        #login-users-list { flex-grow: 1; overflow-y: auto; margin-bottom: 20px; }
        .login-user-item { background: #ffffff; border: 1px solid #e9ecef; padding: 10px 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s ease-in-out; cursor: pointer; }
        .login-user-item:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.05); border-color: #ced4da; }
        .login-user-item span { font-weight: 500; font-size: 1.1rem; color: #495057; }
        .login-user-item button { background: #f1f3f5; border: none; color: #868e96; padding: 5px 10px; border-radius: 5px; cursor: pointer; transition: all 0.2s ease; }
        .login-user-item button:hover { background: #e63946; color: white; }
        #login-settings-panel input, #login-settings-panel textarea { width: 100%; padding: 12px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #ced4da; background: #ffffff; color: #495057; box-sizing: border-box; font-size: 1rem; font-family: 'Roboto', sans-serif; transition: border-color 0.2s, box-shadow 0.2s; }
        #login-settings-panel input:focus, #login-settings-panel textarea:focus { outline: none; border-color: #80bdff; box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25); }
        #save-login-user-btn { width: 100%; padding: 15px; background: #007bff; border: none; color: white; font-size: 1.1rem; border-radius: 8px; cursor: pointer; transition: background-color 0.2s; }
        #save-login-user-btn:hover { background: #0056b3; }
        #save-login-user-btn.update { background: #28a745; } /* Green for update */
        #save-login-user-btn.update:hover { background: #218838; }
        #clear-login-form-btn { background: none; border: none; color: #6c757d; cursor: pointer; text-decoration: underline; font-size: 12px; margin-top: 10px; }
        #login-settings-feedback {
            text-align: center; color: #28a745; font-weight: bold;
            padding: 10px; margin-top: 10px; border-radius: 8px;
            background: #e9f7ef; border: 1px solid #a6d9ba;
            opacity: 0; transition: opacity 0.3s ease-in-out;
        }

        /* --- New: Settings Modal Styles --- */
        .login-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.3s ease-out;
        }
        .login-modal-content {
            background: #f8f9fa; color: #343a40;
            padding: 25px; border-radius: 15px;
            width: 90%; max-width: 850px; /* MODIFIED: Increased width */
            box-shadow: 0 5px 25px rgba(0,0,0,0.3);
            display: flex; flex-direction: column;
            max-height: 90vh;
        }
        .login-modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #dee2e6; padding-bottom: 15px; margin-bottom: 20px; }
        .login-modal-header h2 { margin: 0; font-weight: 500; font-size: 1.5rem; }
        .login-modal-close { font-size: 28px; font-weight: bold; cursor: pointer; border: none; background: none; color: #6c757d; }
        /* MODIFIED: Replaced flex with grid for better layout */
        .login-modal-body {
            display: grid;
            grid-template-columns: 250px 1fr; /* Users list on left, form on right */
            gap: 25px;
            overflow: hidden;
            flex-grow: 1;
        }
        /* NEW: Section for the user list */
        .login-users-section {
            display: flex;
            flex-direction: column;
            border-right: 1px solid #dee2e6;
            padding-right: 25px;
            overflow-y: auto;
        }
        /* NEW: Section for the form */
        .login-form-section {
            display: flex;
            flex-direction: column;
            overflow-y: auto; /* Allow form to scroll if needed */
            min-width: 0;
        }
        .login-form-section h3 { margin: 0 0 20px 0; font-weight: 500; text-align: center; }
        .form-group { margin-bottom: 15px; display: flex; flex-direction: column; }
        .form-group label { font-weight: 500; margin-bottom: 5px; font-size: 14px; color: #495057; }
        /* --- New Drag and Drop Styles --- */
        .form-section { padding: 15px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px; background: #fff; }
        .form-section h4 { margin: -15px -15px 15px -15px; padding: 10px 15px; background: #f8f9fa; border-bottom: 1px solid #e9ecef; font-size: 1rem; font-weight: 500; border-radius: 8px 8px 0 0; }
        .dnd-container { display: flex; align-items: center; gap: 10px; flex-grow: 1; min-height: 150px; }
        .dnd-column { flex: 1; display: flex; flex-direction: column; }
        .dnd-column h5 { margin: 0 0 10px 0; font-size: 13px; text-align: center; color: #6c757d; font-weight: normal; }
        .dnd-arrow {
            font-size: 24px; color: #adb5bd;
            padding: 0 10px;
        }
        .dnd-list { flex-grow: 1; background: #f0f2f5; border: 2px dashed #ced4da; border-radius: 8px; padding: 10px; overflow-y: auto; transition: all 0.2s; }
        .dnd-list.drag-over { border-color: #007bff; background: #e7f1ff; }
        .dnd-store-item { background: #fff; padding: 8px 12px; border-radius: 5px; border: 1px solid #dee2e6; margin-bottom: 8px; cursor: grab; user-select: none; transition: all 0.2s; }
        .dnd-store-item:last-child { margin-bottom: 0; }
        .dnd-store-item:hover { border-color: #80bdff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .dnd-store-item.dragging { opacity: 0.5; background: #cce5ff; }

        #login-settings-feedback { margin-top: auto; } /* Push feedback to the bottom */
        .form-actions {
            margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6;
            display: flex; justify-content: flex-end; gap: 10px;
        }
        .form-actions #save-login-user-btn { width: auto; flex-grow: 1; }
        .form-actions #clear-login-form-btn {
            flex-grow: 0; background: #6c757d; color: white; border: none;
            padding: 0 20px; border-radius: 8px; text-decoration: none; font-size: 1rem;
            transition: background-color 0.2s;
        }
        .form-actions #clear-login-form-btn:hover { background: #5a6268; }

        /* NEW: Styles for modal header buttons */
        .modal-header-actions { display: flex; align-items: center; gap: 10px; }
        .modal-action-btn {
            background: #e9ecef;
            border: none;
            color: #495057;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }
        .modal-action-btn:hover { background: #ced4da; }
        .login-modal-close {
            position: relative;
            top: -2px; /* Minor adjustment for visual alignment */
        }
        #login-users-list { flex-grow: 1; overflow-y: auto; }
        .login-user-item.active {
            background-color: #e7f1ff;
            border-left: 4px solid #007bff;
            padding-left: 11px;
        }
    `);
    document.body.classList.add('custom-login');

    const minimalContainer = document.createElement('div');
    minimalContainer.className = 'minimal-login-container';
    minimalContainer.innerHTML = `
        <h1>Who are you?</h1>
        <div id="minimal-login-error" class="minimal-login-error"></div>
        <input type="text" id="minimal-username-input" placeholder="Enter your username" autocomplete="off">
        <input type="password" id="minimal-password-input" placeholder="Enter your password" autocomplete="off" style="display: none; margin-top: 15px;">
        <button id="minimal-login-btn" class="minimal-store-btn" style="display: none; margin-top: 15px;">Continue</button>
        <div id="minimal-store-selector" style="display: none;"></div>
    `;
    // Insert our new UI before the hidden original form
    originalPage.parentNode.insertBefore(minimalContainer, originalPage);

    // --- Event Handling ---
    const usernameInput = document.getElementById('minimal-username-input');
    const storeSelector = document.getElementById('minimal-store-selector');
    const titleHeader = minimalContainer.querySelector('h1');

    // Check for and display existing login errors from the original page
    const errorMessageElement = document.querySelector('.rnr-message');
    if (errorMessageElement && errorMessageElement.textContent.trim()) {
        const errorDiv = document.getElementById('minimal-login-error');
        errorDiv.textContent = errorMessageElement.textContent.trim();
        errorDiv.style.display = 'block';
        titleHeader.textContent = 'Login Failed';
    }

    // Create and append settings button and panel
    const settingsButton = document.createElement('button');
    settingsButton.id = 'login-settings-btn';
    settingsButton.title = 'Manage Users';
    settingsButton.innerHTML = '&#9881;'; // Gear icon
    document.body.appendChild(settingsButton);

    settingsButton.addEventListener('click', () => {
        showLoginSettingsModal(() => {
            // When the modal closes, reload the credentials in the main scope
            USER_CREDENTIALS = JSON.parse(GM_getValue(LOGIN_USERS_KEY, '{}'));
        });
    });

    const passwordInput = document.getElementById('minimal-password-input');
    const loginBtn = document.getElementById('minimal-login-btn');
    
    let typingTimer;
    let passwordShowTimer;
    
    // Function to show store selection
    const showStoreSelection = () => {
        const username = usernameInput.value.trim().toLowerCase();
        const credentials = USER_CREDENTIALS[username];

        if (credentials && credentials.stores && credentials.stores.length > 0) {
            // A known user is found!
            titleHeader.textContent = 'Select a Store';
            usernameInput.style.display = 'none';
            passwordInput.style.display = 'none';
            loginBtn.style.display = 'none';

            storeSelector.innerHTML = ''; // Clear previous buttons
            credentials.stores.forEach(store => {
                const storeBtn = document.createElement('button');
                storeBtn.className = 'minimal-store-btn';
                storeBtn.textContent = store.name;
                storeBtn.dataset.storeId = store.id;
                storeSelector.appendChild(storeBtn);

                storeBtn.addEventListener('click', () => {
                    // On store selection, fill the original hidden form and submit
                    document.getElementById('username').value = username;
                    document.getElementById('password').value = credentials.password;
                    document.getElementById('iProfileID').value = store.id;
                    originalForm.submit();
                });
            });

            storeSelector.style.display = 'flex';
        }
    };
    
    // Function to show store selection for non-saved users
    const showStoreSelectionForNewUser = () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (!username || !password) {
            return;
        }
        
        // Get all unique stores from saved users
        const allStores = new Map();
        Object.values(USER_CREDENTIALS).forEach(cred => {
            if (cred.stores) {
                cred.stores.forEach(store => {
                    allStores.set(store.id, store);
                });
            }
        });
        
        if (allStores.size > 0) {
            // Show store selection
            titleHeader.textContent = 'Select a Store';
            usernameInput.style.display = 'none';
            passwordInput.style.display = 'none';
            loginBtn.style.display = 'none';
            
            storeSelector.innerHTML = ''; // Clear previous buttons
            allStores.forEach(store => {
                const storeBtn = document.createElement('button');
                storeBtn.className = 'minimal-store-btn';
                storeBtn.textContent = store.name;
                storeBtn.dataset.storeId = store.id;
                storeSelector.appendChild(storeBtn);

                storeBtn.addEventListener('click', () => {
                    // Fill the form with manual credentials
                    document.getElementById('username').value = username;
                    document.getElementById('password').value = password;
                    document.getElementById('iProfileID').value = store.id;
                    originalForm.submit();
                });
            });

            storeSelector.style.display = 'flex';
        } else {
            // No stores available, submit without store selection
            document.getElementById('username').value = username;
            document.getElementById('password').value = password;
            originalForm.submit();
        }
    };
    
    // Wait for user to stop typing, then check for saved user
    usernameInput.addEventListener('input', () => {
        // Clear any existing timers
        clearTimeout(typingTimer);
        clearTimeout(passwordShowTimer);
        
        // Hide everything while typing
        passwordInput.style.display = 'none';
        loginBtn.style.display = 'none';
        storeSelector.style.display = 'none';
        
        const username = usernameInput.value.trim().toLowerCase();
        
        if (username.length === 0) {
            // Empty username - keep everything hidden
            return;
        }
        
        // Wait 500ms after user stops typing
        typingTimer = setTimeout(() => {
            const credentials = USER_CREDENTIALS[username];
            
            if (credentials && credentials.stores && credentials.stores.length > 0) {
                // Saved user - automatically show store selection
                showStoreSelection();
            } else {
                // Not a saved user - wait 3 seconds, then show password field
                passwordShowTimer = setTimeout(() => {
                    passwordInput.style.display = 'block';
                    loginBtn.style.display = 'block';
                }, 3000);
            }
        }, 500);
    });
    
    // Press Enter on username field
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            // Clear timers and immediately check
            clearTimeout(typingTimer);
            clearTimeout(passwordShowTimer);
            
            const username = usernameInput.value.trim().toLowerCase();
            const credentials = USER_CREDENTIALS[username];
            
            if (credentials && credentials.stores && credentials.stores.length > 0) {
                showStoreSelection();
            } else {
                // Show password field immediately and focus
                passwordInput.style.display = 'block';
                loginBtn.style.display = 'block';
                passwordInput.focus();
            }
        }
    });
    
    // Press Enter on password field
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            showStoreSelectionForNewUser();
        }
    });
    
    loginBtn.addEventListener('click', showStoreSelectionForNewUser);

    usernameInput.focus();
}

/**
 * Creates and displays a modal for managing user credentials.
 * @param {function} onModalClose - A callback function to execute when the modal is closed.
 */
function showLoginSettingsModal(onModalClose) {
    const LOGIN_USERS_KEY = 'tm_login_users_v2';
    // Prevent multiple modals
    if (document.querySelector('.login-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'login-modal-overlay';
    overlay.innerHTML = `
        <div class="login-modal-content">
            <div class="login-modal-header">
                <h2>Manage Users</h2>
                <div class="modal-header-actions">
                    <button id="add-new-user-btn" title="Add New User" class="modal-action-btn">+</button>
                    <button class="login-modal-close" title="Close">&times;</button>
                </div>
            </div>
            <div class="login-modal-body">
                <div class="login-users-section">
                    <div id="login-users-list"></div>
                </div>
                <div class="login-form-section" style="display: none;">
                    <h3 id="login-form-title">Add New User</h3>
                    <div class="form-section">
                        <h4>User Details</h4>
                        <div class="form-group">
                            <label for="login-username">Username</label>
                            <input type="text" id="login-username" placeholder="e.g., alex (must be unique)">
                        </div>
                        <div class="form-group">
                            <label for="login-password">Password</label>
                            <input type="password" id="login-password" placeholder="••••••••••">
                        </div>
                    </div>
                    <div class="form-section" style="flex-grow: 1; display: flex; flex-direction: column;">
                        <h4>Store Assignments</h4>
                        <div class="dnd-container">
                            <div class="dnd-column">
                                <h5>Available Stores</h5>
                                <div id="available-stores-list" class="dnd-list"></div>
                            </div>
                            <div class="dnd-arrow">⇄</div>
                            <div class="dnd-column">
                                <h5>User's Stores</h5>
                                <div id="selected-stores-list" class="dnd-list"></div>
                            </div>
                        </div>
                    </div>
                    <div id="login-settings-feedback" style="opacity: 0;"></div>
                    <div class="form-actions">
                        <button id="save-login-user-btn">Save User</button>
                        <button id="clear-login-form-btn">Clear Form</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // --- Get elements from the newly created modal ---
    const formSection = overlay.querySelector('.login-form-section');
    const usersList = document.getElementById('login-users-list');
    const saveBtn = document.getElementById('save-login-user-btn');
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const formTitle = document.getElementById('login-form-title');
    const clearFormBtn = document.getElementById('clear-login-form-btn');
    const feedbackDiv = document.getElementById('login-settings-feedback');
    const closeBtn = overlay.querySelector('.login-modal-close');
    const addNewUserBtn = document.getElementById('add-new-user-btn');
    const availableStoresList = document.getElementById('available-stores-list');
    const selectedStoresList = document.getElementById('selected-stores-list');
    let allStores = [];

    function showForm() { formSection.style.display = 'flex'; }
    function hideForm() { formSection.style.display = 'none'; }

    // --- Event Listeners for the modal ---
    const closeAndCallback = () => {
        overlay.remove();
        if (onModalClose) onModalClose();
    };
    closeBtn.addEventListener('click', closeAndCallback);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeAndCallback(); });

    let users = JSON.parse(GM_getValue(LOGIN_USERS_KEY, '{}'));
    let isEditing = false;
    let editingUsername = null;

    function clearForm() {
        usernameInput.value = '';
        passwordInput.value = '';
        usernameInput.disabled = false;
        isEditing = false;
        editingUsername = null;
        saveBtn.textContent = 'Save User';
        saveBtn.classList.remove('update');
        formTitle.textContent = 'Add New User';
        document.querySelectorAll('.login-user-item.active').forEach(el => el.classList.remove('active'));
        populateStoreLists([]); // Clear selected stores, show all in available
    }

    clearFormBtn.addEventListener('click', () => { clearForm(); hideForm(); });
    addNewUserBtn.addEventListener('click', () => { clearForm(); showForm(); });

    function renderUsers() {
        usersList.innerHTML = '';
        if (Object.keys(users).length === 0) {
            usersList.innerHTML = '<p style="text-align: center; color: #6c757d;">No users saved. Add one!</p>';
            return;
        }
        for (const username in users) {
            const userItem = document.createElement('div');
            userItem.className = 'login-user-item';
            userItem.innerHTML = `
                <span title="Click to edit">${username}</span>
                <button data-username="${username}" title="Remove User">&times;</button>
            `;
            if (isEditing && username === editingUsername) userItem.classList.add('active');
            usersList.appendChild(userItem);
        }
    }

    usersList.addEventListener('click', (e) => {
        const userToRemove = e.target.dataset.username;
        if (userToRemove) { // Remove user
            if (confirm(`Are you sure you want to remove the user '${userToRemove}'?`)) {
                delete users[userToRemove];
                GM_setValue(LOGIN_USERS_KEY, JSON.stringify(users));
                showFeedback(`User '${userToRemove}' removed.`, 'error');
                if (editingUsername === userToRemove) { clearForm(); hideForm(); }
                renderUsers();
            }
        } else if (e.target.tagName === 'SPAN') { // Edit user
            const userToEdit = e.target.textContent;
            const userData = users[userToEdit];
            usernameInput.value = userToEdit;
            passwordInput.value = userData.password;
            populateStoreLists(userData.stores);
            usernameInput.disabled = true;
            isEditing = true;
            editingUsername = userToEdit;
            saveBtn.textContent = 'Update User';
            saveBtn.classList.add('update');
            formTitle.textContent = `Editing '${userToEdit}'`;
            renderUsers();
            showForm();
        }
    });

    saveBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();
        const stores = Array.from(selectedStoresList.querySelectorAll('.dnd-store-item')).map(item => ({ name: item.textContent, id: item.dataset.storeId }));

        if (!username || !password || stores.length === 0) {
            showFeedback('Please fill all fields and add at least one store.', 'error');
            return;
        }

        users[username] = { password: password, stores: stores };
        GM_setValue(LOGIN_USERS_KEY, JSON.stringify(users));
        showFeedback(`User '${username}' ${isEditing ? 'updated' : 'saved'} successfully!`);
        renderUsers();
        clearForm();
        hideForm();
    });

    function showFeedback(message, type = 'success') {
        feedbackDiv.textContent = message;
        feedbackDiv.style.borderColor = type === 'success' ? '#a6d9ba' : '#f5c6cb';
        feedbackDiv.style.backgroundColor = type === 'success' ? '#e9f7ef' : '#f8d7da';
        feedbackDiv.style.color = type === 'success' ? '#155724' : '#721c24';
        feedbackDiv.style.opacity = '1';
        setTimeout(() => { feedbackDiv.style.opacity = '0'; }, 3000);
    };

    // --- Drag and Drop Logic ---
    function setupDragAndDrop() {
        const lists = [availableStoresList, selectedStoresList];
        let draggedItem = null;

        lists.forEach(list => {
            list.addEventListener('dragstart', e => { if (e.target.classList.contains('dnd-store-item')) { draggedItem = e.target; setTimeout(() => e.target.classList.add('dragging'), 0); } });
            list.addEventListener('dragend', () => { if (draggedItem) { draggedItem.classList.remove('dragging'); draggedItem = null; } });
            list.addEventListener('dragover', e => { e.preventDefault(); list.classList.add('drag-over'); });
            list.addEventListener('dragleave', () => list.classList.remove('drag-over'));
            list.addEventListener('drop', e => { e.preventDefault(); list.classList.remove('drag-over'); if (draggedItem && list !== draggedItem.parentElement) { list.appendChild(draggedItem); } });
        });
    }

    function createStoreItem(store) {
        const item = document.createElement('div');
        item.className = 'dnd-store-item';
        item.textContent = store.name;
        item.dataset.storeId = store.id;
        item.draggable = true;
        return item;
    }

    function populateStoreLists(selectedStores = []) {
        availableStoresList.innerHTML = '';
        selectedStoresList.innerHTML = '';
        const selectedIds = new Set(selectedStores.map(s => s.id));
        allStores.forEach(store => {
            if (selectedIds.has(store.id)) {
                selectedStoresList.appendChild(createStoreItem(store));
            } else {
                availableStoresList.appendChild(createStoreItem(store));
            }
        });
    }

    function fetchAllStores() {
        const storeSelect = document.getElementById('iProfileID');
        if (storeSelect) {
            allStores = Array.from(storeSelect.options).filter(opt => opt.value && opt.text.trim()).map(opt => ({ name: opt.text.trim(), id: opt.value }));
        }
    }

    renderUsers();
    fetchAllStores();
    setupDragAndDrop();
    clearForm();
    hideForm();
}

// Make initLoginPage globally accessible for external scripts
window.initLoginPage = initLoginPage;