// ==UserScript==
// @name         MyManager Scratchpad
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Persistent Scratchpad module for MyManager All-in-One Suite.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    /**
     * Initializes the persistent scratchpad feature, which includes a draggable,
     * resizable text area whose content and geometry are saved.
     */
    function initScratchpadFeature(config, STORAGE_KEYS) {
        if (!config?.scratchpadEnabled) return;
        if (document.getElementById('tm-scratchpad-container')) return;

        function escapeHtml(str) {
            if (str == null) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        const SCRATCHPAD_STORAGE_KEY_IS_MAXIMIZED = 'tm_user_scratchpad_is_maximized';

        // --- UI Creation ---
        // 1. Create the Scratchpad Panel
        const container = document.createElement('div');
        container.id = 'tm-scratchpad-container';
        container.innerHTML = `
            <div id="tm-scratchpad-tabs-container">
                <div id="tm-scratchpad-tabs"></div>
                <button id="tm-scratchpad-new-tab-btn" title="Νέα Σημείωση">+</button>
            </div>
            <div id="tm-scratchpad-header">
                <span id="tm-scratchpad-title">Σημειωματάριο</span>
                <div id="tm-scratchpad-header-controls">
                    <input type="search" id="tm-scratchpad-search" placeholder="Αναζήτηση...">
                    <span id="tm-scratchpad-last-edited" style="display:none;"></span>
                    <button id="tm-scratchpad-template-btn" title="Εισαγωγή Προτύπου">📋</button>
                    <button id="tm-scratchpad-reminder-btn" title="Ορισμός Υπενθύμισης">🔔</button>
                    <button id="tm-scratchpad-clear-btn" title="Καθαρισμός τρέχουσας σημείωσης">&#128465;</button>
                    <button id="tm-scratchpad-font-size-down" title="Μείωση Μεγέθους Γραμματοσειράς">A-</button>
                    <button id="tm-scratchpad-font-size-up" title="Αύξηση Μεγέθους Γραμματοσειράς">A+</button>
                    <button id="tm-scratchpad-maximize-btn" title="Μεγιστοποίηση/Επαναφορά">&#x26F6;</button>
                    <button id="tm-scratchpad-close-btn" title="Κλείσιμο Σημειωματαρίου">&times;</button>
                </div>
            </div>
            <div id="tm-scratchpad-toolbar">
                <button data-command="insertUnorderedList" title="Bulleted List">●</button>
                <button data-command="insertOrderedList" title="Numbered List">1.</button>
                <div class="tm-toolbar-separator"></div>
                <button data-command="formatBlock" data-value="h1" title="Heading 1">H1</button>
                <button data-command="formatBlock" data-value="p" title="Paragraph">P</button>
                <div class="tm-toolbar-separator"></div>
                <button data-command="bold" title="Bold (Ctrl+B)"><b>B</b></button>
                <button data-command="italic" title="Italic (Ctrl+I)"><i>I</i></button>
                <button data-command="underline" title="Underline (Ctrl+U)"><u>U</u></button>
                <button data-command="strikeThrough" title="Strikethrough"><s>S</s></button>
                <div class="tm-toolbar-separator"></div>
                <button data-command="createLink" title="Insert Link">🔗</button>
                <button data-command="removeFormat" title="Clear Formatting">🧹</button>
            </div>
            <div id="tm-scratchpad-editor" contenteditable="true" spellcheck="false" placeholder="Προσωρινές σημειώσεις..."></div>
            <div id="tm-scratchpad-reminder-popover">
                <h5>Ορισμός Υπενθύμισης</h5>
                <label class="tm-sp-reminder-label" for="tm-scratchpad-reminder-title">Τίτλος</label>
                <input type="text" id="tm-scratchpad-reminder-title" placeholder="Σύντομος τίτλος">
                <label class="tm-sp-reminder-label" for="tm-scratchpad-reminder-notes">Σημειώσεις</label>
                <textarea id="tm-scratchpad-reminder-notes" rows="3" placeholder="Περισσότερες λεπτομέρειες…"></textarea>
                <input type="datetime-local" id="tm-scratchpad-reminder-datetime">
                <select id="tm-scratchpad-reminder-recurrence">
                    <option value="none">Χωρίς επανάληψη</option>
                    <option value="daily">Καθημερινά</option>
                    <option value="weekly">Εβδομαδιαία</option>
                </select>
                <div id="tm-scratchpad-reminder-controls">
                    <button id="tm-scratchpad-set-reminder-btn">Ορισμός</button>
                    <button id="tm-scratchpad-reminder-1hr-btn">Σε 1 Ώρα</button>
                </div>
                <button id="tm-scratchpad-reminder-cancel-btn">Ακύρωση</button>
                <div id="tm-scratchpad-active-reminder"></div>
            </div>
            <div id="tm-scratchpad-template-popover" class="tm-scratchpad-popover">
                <h5>Εισαγωγή Προτύπου</h5>
                <div id="tm-scratchpad-template-list"></div>
            </div>
        `;
        document.body.appendChild(container);

        // 2. Find or create the main search button container and add the toggle button there.
        let rightSideContainer = document.getElementById('tm-search-container');
        if (!rightSideContainer) {
            rightSideContainer = document.createElement('div');
            rightSideContainer.id = 'tm-search-container';
            document.body.appendChild(rightSideContainer);
        }

        let toggleButton = document.getElementById('tm-scratchpad-toggle-btn');
        if (!toggleButton) {
            toggleButton = document.createElement('button');
            toggleButton.id = 'tm-scratchpad-toggle-btn';
            toggleButton.className = 'tm-slide-out-btn';
            toggleButton.textContent = '🗒️ Σημειωματάριο';
            rightSideContainer.appendChild(toggleButton);
        }

        const editor = container.querySelector('#tm-scratchpad-editor');
        const header = container.querySelector('#tm-scratchpad-header');
        const searchInput = container.querySelector('#tm-scratchpad-search');
        const clearBtn = container.querySelector('#tm-scratchpad-clear-btn');
        const fontSizeDownBtn = container.querySelector('#tm-scratchpad-font-size-down');
        const fontSizeUpBtn = container.querySelector('#tm-scratchpad-font-size-up');
        const maximizeBtn = container.querySelector('#tm-scratchpad-maximize-btn');
        const closeBtn = container.querySelector('#tm-scratchpad-close-btn');
        const lastEditedSpan = container.querySelector('#tm-scratchpad-last-edited');
        const reminderBtn = container.querySelector('#tm-scratchpad-reminder-btn');
        const reminderTitleInput = container.querySelector('#tm-scratchpad-reminder-title');
        const reminderNotesInput = container.querySelector('#tm-scratchpad-reminder-notes');
        const reminderPopover = container.querySelector('#tm-scratchpad-reminder-popover');
        const reminderDateTimeInput = container.querySelector('#tm-scratchpad-reminder-datetime');
        const reminderRecurrenceSelect = container.querySelector('#tm-scratchpad-reminder-recurrence');
        const setReminderBtn = container.querySelector('#tm-scratchpad-set-reminder-btn');
        const setReminder1hrBtn = container.querySelector('#tm-scratchpad-reminder-1hr-btn');
        const cancelReminderBtn = container.querySelector('#tm-scratchpad-reminder-cancel-btn');
        const activeReminderDiv = container.querySelector('#tm-scratchpad-active-reminder');
        const newTabBtn = container.querySelector('#tm-scratchpad-new-tab-btn');
        const tabsContainer = container.querySelector('#tm-scratchpad-tabs');
        const templateBtn = container.querySelector('#tm-scratchpad-template-btn');
        const templatePopover = container.querySelector('#tm-scratchpad-template-popover');
        const templateList = container.querySelector('#tm-scratchpad-template-list');
        const toolbar = container.querySelector('#tm-scratchpad-toolbar');


        // --- Data Access Functions ---
        function getNotes() {
            const notes = JSON.parse(GM_getValue(STORAGE_KEYS.SCRATCHPAD_NOTES, '[]'));
            if (notes.length === 0) {
                const firstNote = { id: `note_${Date.now()}`, title: 'Σημείωση 1', content: '', reminder: null, isPinned: false, lastEdited: null, fontSize: 13 };
                return [firstNote];
            }
            return notes;
        }

        function saveNotes(notes) {
            GM_setValue(STORAGE_KEYS.SCRATCHPAD_NOTES, JSON.stringify(notes));
        }

        function getActiveNoteId() {
            const notes = getNotes();
            let activeId = GM_getValue(STORAGE_KEYS.SCRATCHPAD_ACTIVE_NOTE_ID);
            // Ensure the active ID is valid
            if (!activeId || !notes.some(n => n.id === activeId)) {
                activeId = notes[0]?.id;
                GM_setValue(STORAGE_KEYS.SCRATCHPAD_ACTIVE_NOTE_ID, activeId);
            }
            return activeId;
        }

        function getActiveNote() {
            const notes = getNotes();
            const activeId = getActiveNoteId();
            return notes.find(n => n.id === activeId) || notes[0];
        }

        function updateActiveNote(props) {
            let notes = getNotes();
            const activeId = getActiveNoteId();
            const noteIndex = notes.findIndex(n => n.id === activeId);
            if (noteIndex !== -1) {
                notes[noteIndex] = { ...notes[noteIndex], ...props };
                saveNotes(notes);
            }
        }

        // --- Load saved state ---
        function loadActiveNote(preserveCursor = false) {
            const note = getActiveNote();
            if (!note) return;

            const cursorPos = preserveCursor ? saveCursorPosition() : null;

            editor.innerHTML = note.content || '';
            renderCheckboxesInEditor();
            updateLastEditedDisplay(note.lastEdited);
            editor.style.fontSize = `${note.fontSize || 13}px`;
            highlightSearchTermsInEditor(); // Highlight after loading
            updateReminderDisplay();
            
            if (preserveCursor && cursorPos !== null) {
                restoreCursorPosition(cursorPos);
            } else if (!preserveCursor) {
                // When switching notes, focus at the end
                editor.focus();
                const range = document.createRange();
                const sel = window.getSelection();
                if (editor.childNodes.length > 0) {
                    range.selectNodeContents(editor);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }

        // --- Toolbar Logic ---
        toolbar.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const command = button.dataset.command;
            const value = button.dataset.value || null;

            e.preventDefault(); // Prevent button from taking focus away from the editor
            editor.focus();

            if (command === 'createLink') {
                const url = prompt('Εισάγετε τη διεύθυνση URL:');
                if (url) {
                    document.execCommand(command, false, url);
                }
            } else {
                document.execCommand(command, false, value);
            }
            debouncedSaveText(); // Save changes after formatting
        });

        // Load visibility state
        const wasOpen = GM_getValue('tm_user_scratchpad_is_open', false);
        if (wasOpen) {
            container.style.display = 'flex';
        }

        // Load saved position and size
        const savedGeometryJSON = GM_getValue('tm_user_scratchpad_geometry');
        if (savedGeometryJSON) {
            try {
                const geo = JSON.parse(savedGeometryJSON);
                if (geo.top && geo.left) {
                    container.style.top = geo.top;
                    container.style.left = geo.left;
                    container.style.bottom = 'auto';
                    container.style.right = 'auto';
                }
                if (geo.width && geo.height) {
                    container.style.width = geo.width;
                    container.style.height = geo.height;
                }
            } catch (e) { console.error('[MMS] Could not parse saved scratchpad geometry.', e); }
        }

        // Load maximized state
        let isMaximized = GM_getValue(SCRATCHPAD_STORAGE_KEY_IS_MAXIMIZED, false);
        let originalGeometry = null;
        if (isMaximized) {
            toggleMaximize(); // Apply maximized state
        }

        // --- Logic ---
        function updateLastEditedDisplay(timestamp) {
            if (timestamp) {
                const date = new Date(timestamp);
                lastEditedSpan.textContent = `Τελευταία επεξεργασία: ${date.toLocaleDateString('el-GR')} ${date.toLocaleTimeString('el-GR')}`;
                lastEditedSpan.style.display = 'inline';
            } else {
                lastEditedSpan.textContent = '';
                lastEditedSpan.style.display = 'none';
            }
        }

        clearBtn.addEventListener('click', () => {
            if (!confirm('Καθαρισμός τρέχουσας σημείωσης;')) return;
            editor.innerHTML = '';
            const now = new Date().toISOString();
            updateActiveNote({ content: '', lastEdited: now });
            updateLastEditedDisplay(now);
            renderCheckboxesInEditor();
        });

        // Show/Hide Logic
        toggleButton.addEventListener('click', () => {
            const willBeVisible = container.style.display === 'none';
            container.style.display = willBeVisible ? 'flex' : 'none';
            GM_setValue('tm_user_scratchpad_is_open', willBeVisible);
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            container.style.display = 'none';
            GM_setValue('tm_user_scratchpad_is_open', false);
        });

        // Save text on input
        const debouncedSaveText = window.debounce((e) => {
            // Skip saving if we just processed an Enter key to avoid cursor issues
            if (isProcessingEnter) {
                return;
            }
            const content = editor.innerHTML;
            const now = new Date().toISOString();
            updateActiveNote({ content: content, lastEdited: now });
            updateLastEditedDisplay(now);
        }, 500);
        editor.addEventListener('input', debouncedSaveText);
        
        // Make debouncedSaveText globally accessible for sendToScratchpad
        window.debouncedSaveText = debouncedSaveText;

        // Flag to prevent cursor jumping when Enter is pressed
        let isProcessingEnter = false;
        let enterProcessingTimeout = null;
        
        // Handle Enter key to prevent cursor jumping
        // Use keydown to set the flag immediately
        editor.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                // Clear any existing timeout
                if (enterProcessingTimeout) {
                    clearTimeout(enterProcessingTimeout);
                }
                isProcessingEnter = true;
            }
        });
        
        // Use keyup to clear the flag after input events have been processed
        editor.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                // Use requestAnimationFrame to wait for browser to fully process Enter and input events
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        // Wait additional time to ensure all debounced input handlers have had a chance to check the flag
                        // The longest debounce is 700ms, so we need to wait at least that long
                        enterProcessingTimeout = setTimeout(() => {
                            isProcessingEnter = false;
                            enterProcessingTimeout = null;
                        }, 800);
                    });
                });
            }
        });

        // --- Helper Functions for Cursor Position ---
        function saveCursorPosition() {
            const selection = window.getSelection();
            if (selection.rangeCount === 0) return null;
            
            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(editor);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            const caretOffset = preCaretRange.toString().length;
            
            return caretOffset;
        }
        
        function restoreCursorPosition(caretOffset) {
            if (caretOffset === null) return;
            
            const selection = window.getSelection();
            const range = document.createRange();
            
            let charCount = 0;
            let foundPosition = false;
            
            function traverseNodes(node) {
                if (foundPosition) return;
                
                if (node.nodeType === Node.TEXT_NODE) {
                    const nextCharCount = charCount + node.length;
                    if (caretOffset >= charCount && caretOffset <= nextCharCount) {
                        range.setStart(node, caretOffset - charCount);
                        range.collapse(true);
                        foundPosition = true;
                        return;
                    }
                    charCount = nextCharCount;
                } else {
                    for (let i = 0; i < node.childNodes.length; i++) {
                        traverseNodes(node.childNodes[i]);
                        if (foundPosition) return;
                    }
                }
            }
            
            try {
                traverseNodes(editor);
                if (foundPosition) {
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            } catch (e) {
                // If restoration fails, just log and continue
                console.log('[MMS] Could not restore cursor position:', e);
            }
        }

        // --- Markdown Formatting ---
        const applyMarkdownFormatting = window.debounce(() => {
            // Skip formatting if we just processed an Enter key to avoid cursor issues
            if (isProcessingEnter) {
                return;
            }
            
            // Save cursor position before modifying content
            const cursorPos = saveCursorPosition();
            
            // This is a simple implementation. More complex scenarios might need a proper parser.
            let content = editor.innerHTML;
            // Use more specific regex to avoid matching inside tags. The `>` ensures we are not inside a tag.
            content = content.replace(/&gt; \*\*([^\*]+)\*\*/g, '> <strong>$1</strong>'); // Bold
            content = content.replace(/&gt; \*([^\*]+)\*/g, '> <em>$1</em>');     // Italic
            content = content.replace(/&gt; ~([^~]+)~/g, '> <s>$1</s>');         // Strikethrough

            // For headings, it's safer to use formatBlock if possible, but this is a simple regex way.
            // This is fragile and for demonstration. A real implementation would be more complex.
            if (content.includes('<div># ')) {
                content = content.replace(/<div># (.+?)<\/div>/g, '<h1>$1</h1>');
            }
            if (content.includes('<div>## ')) {
                content = content.replace(/<div>## (.+?)<\/div>/g, '<h2>$1</h2>');
            }

            // Only update if content actually changed to avoid unnecessary cursor resets
            if (content !== editor.innerHTML) {
            editor.innerHTML = content;
                // Restore cursor position after updating content
                restoreCursorPosition(cursorPos);
            }
        }, 700);
        editor.addEventListener('input', applyMarkdownFormatting);

        // --- Tabs Logic ---
        function renderTabs() {
            const allNotes = getNotes();
            const activeId = getActiveNoteId();
            const query = searchInput.value.toLowerCase().trim();
            let notes = allNotes;

            if (query) {
                notes = allNotes.filter(note => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = note.content || '';
                    const textContent = tempDiv.innerText.toLowerCase();
                    const reminderBlob = [
                        note.reminder?.title,
                        note.reminder?.text,
                        note.reminder?.notes,
                    ].filter(Boolean).join(' ').toLowerCase();
                    return note.title.toLowerCase().includes(query)
                        || textContent.includes(query)
                        || reminderBlob.includes(query);
                });
                const activeNote = allNotes.find((n) => n.id === activeId);
                if (activeNote && !notes.some((n) => n.id === activeId)) {
                    notes = [activeNote, ...notes];
                }
            }

            // Sort notes so pinned ones are first
            notes.sort((a, b) => {
                if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned;
                return (a.order || 0) - (b.order || 0);
            });

            tabsContainer.innerHTML = '';
            if (notes.length === 0 && query) {
                tabsContainer.innerHTML = '<span class="tm-scratchpad-tabs-empty">Δεν βρέθηκαν σημειώσεις.</span>';
            }
            notes.forEach(note => {
                const tab = document.createElement('div');
                tab.className = 'tm-scratchpad-tab';
                tab.dataset.noteId = note.id;
                tab.draggable = true; // Make tabs draggable
                if (note.id === activeId) tab.classList.add('active');
                if (note.isPinned) tab.classList.add('pinned');

                const pinIcon = note.isPinned ? '📌' : '📍';
                tab.innerHTML = `<button class="tm-scratchpad-tab-pin" title="Καρφίτσωμα">${pinIcon}</button><span class="tm-scratchpad-tab-title" title="Διπλό κλικ για μετονομασία">${escapeHtml(note.title)}</span><button class="tm-scratchpad-tab-close" title="Διαγραφή">&times;</button>`;
                tabsContainer.appendChild(tab);
            });
        }

        newTabBtn.addEventListener('click', () => {
            let notes = getNotes();
            const newNote = { id: `note_${Date.now()}`, title: `Σημείωση ${notes.length + 1}`, content: '', reminder: null, isPinned: false, lastEdited: null, fontSize: 13 };
            notes.push(newNote);
            saveNotes(notes);
            GM_setValue(STORAGE_KEYS.SCRATCHPAD_ACTIVE_NOTE_ID, newNote.id);
            renderTabs();
            loadActiveNote();
        });

        // --- Drag and Drop Tab Reordering ---
        let draggedTab = null;

        tabsContainer.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('tm-scratchpad-tab')) {
                draggedTab = e.target;
                setTimeout(() => {
                    e.target.classList.add('dragging');
                }, 0);
            }
        });

        tabsContainer.addEventListener('dragend', (e) => {
            if (draggedTab) {
                draggedTab.classList.remove('dragging');
                draggedTab = null;

                // Save the new order
                const orderedIds = Array.from(tabsContainer.querySelectorAll('.tm-scratchpad-tab')).map(tab => tab.dataset.noteId);
                let notes = getNotes();
                notes.forEach(note => {
                    const newIndex = orderedIds.indexOf(note.id);
                    note.order = newIndex !== -1 ? newIndex : 999; // Assign order, put missing ones at the end
                });
                saveNotes(notes);
                renderTabs(); // Re-render to solidify the order
            }
        });

        tabsContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(tabsContainer, e.clientX);
            if (draggedTab) {
                if (afterElement == null) {
                    tabsContainer.appendChild(draggedTab);
                } else {
                    tabsContainer.insertBefore(draggedTab, afterElement);
                }
            }
        });

        function getDragAfterElement(container, x) {
            const draggableElements = [...container.querySelectorAll('.tm-scratchpad-tab:not(.dragging)')];
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = x - box.left - box.width / 2;
                return (offset < 0 && offset > closest.offset) ? { offset: offset, element: child } : closest;
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
        // --- New, more robust click handling to differentiate single vs. double clicks ---
        let clickTimer = null;
        tabsContainer.addEventListener('click', (e) => {
            const tab = e.target.closest('.tm-scratchpad-tab');
            if (!tab) return;

            // If a timer is already running, it means this is the second click (a double-click)
            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;

                // --- Double-click logic ---
                const titleSpan = e.target.closest('.tm-scratchpad-tab-title');
                if (titleSpan) {
                    const noteId = titleSpan.parentElement.dataset.noteId;
                    const currentNote = getNotes().find(n => n.id === noteId);
                    const newTitle = prompt('Νέος τίτλος σημείωσης:', currentNote.title);
                    if (newTitle && newTitle.trim()) {
                        let notes = getNotes();
                        const noteToUpdate = notes.find(n => n.id === noteId);
                        if (noteToUpdate) {
                            noteToUpdate.title = newTitle.trim();
                            saveNotes(notes);
                            renderTabs();
                        }
                    }
                }
            } else {
                // This is the first click. Start a timer.
                clickTimer = setTimeout(() => {
                    clickTimer = null; // Reset timer

                    // --- Single-click logic (runs after 250ms if no second click) ---
                    const noteId = tab.dataset.noteId;
                    if (e.target.classList.contains('tm-scratchpad-tab-pin')) {
                        let notes = getNotes();
                        const note = notes.find(n => n.id === noteId);
                        if (note) { note.isPinned = !note.isPinned; saveNotes(notes); renderTabs(); }
                    } else if (e.target.classList.contains('tm-scratchpad-tab-close')) {
                        if (getNotes().length <= 1) { window.showPositiveMessage('Δεν μπορείτε να διαγράψετε την τελευταία σημείωση.'); return; }
                        if (confirm(`Διαγραφή της σημείωσης "${tab.querySelector('.tm-scratchpad-tab-title').textContent}";`)) {
                            let notes = getNotes().filter(n => n.id !== noteId);
                            saveNotes(notes);
                            if (getActiveNoteId() === noteId) { GM_setValue(STORAGE_KEYS.SCRATCHPAD_ACTIVE_NOTE_ID, notes[0].id); }
                            renderTabs(); loadActiveNote();
                        }
                    } else { // Switch tab
                        GM_setValue(STORAGE_KEYS.SCRATCHPAD_ACTIVE_NOTE_ID, noteId);
                        renderTabs(); loadActiveNote();
                    }
                }, 250); // 250ms delay to wait for a potential second click
            }
        });

        // --- Search Logic ---
        searchInput.addEventListener('input', window.debounce(() => {
            renderTabs();
            // Also re-apply highlighting to the currently visible editor content
            highlightSearchTermsInEditor();
        }, 200));

        // --- Highlighting Logic for Search ---
        function highlightSearchTermsInEditor() {
            // Skip highlighting if we just processed an Enter key to avoid cursor issues
            if (isProcessingEnter) {
                return;
            }
            
            const query = searchInput.value.trim();
            
            // Save cursor position before modifications
            const cursorPos = saveCursorPosition();
            
            // First, remove any existing highlights
            editor.querySelectorAll('mark.tm-search-highlight').forEach(mark => {
                mark.outerHTML = mark.innerHTML; // Unwrap the text
            });
            // Normalize the editor's HTML to merge adjacent text nodes
            editor.normalize();

            if (!query) {
                // Restore cursor if we just removed highlights
                if (cursorPos !== null) restoreCursorPosition(cursorPos);
                return;
            }

            const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
            const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
            let node;
            const nodesToReplace = [];

            while (node = walker.nextNode()) {
                if (node.parentElement.tagName === 'MARK') continue; // Don't search within highlights
                if (regex.test(node.nodeValue)) {
                    nodesToReplace.push(node);
                }
            }

            nodesToReplace.forEach(textNode => {
                const newHTML = textNode.nodeValue.replace(regex, '<mark class="tm-search-highlight">$1</mark>');
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = newHTML;
                const fragment = document.createDocumentFragment();
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
                textNode.parentNode.replaceChild(fragment, textNode);
            });
            
            // Restore cursor position after highlighting
            if (cursorPos !== null) {
                restoreCursorPosition(cursorPos);
            }
        }

        // --- Interactive Checklists Logic ---
        function renderCheckboxesInEditor() {
            // Skip rendering if we just processed an Enter key to avoid cursor issues
            if (isProcessingEnter) {
                return;
            }
            
            // Save cursor position before modifications
            const cursorPos = saveCursorPosition();
            
            // Use a more robust method that doesn't rely on simple string replacement
            const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
            let node;
            const nodesToProcess = [];
            
            // First, collect all nodes that need processing
            while (node = walker.nextNode()) {
                const text = node.nodeValue;
                if (text.includes('[ ]') || text.includes('[x]')) {
                    nodesToProcess.push(node);
                }
            }
            
            // Then process them
            nodesToProcess.forEach(textNode => {
                const text = textNode.nodeValue;
                    const fragment = document.createDocumentFragment();
                const parts = text.split(/(\[ \]|\[x\])/g); // Split by checkbox syntax
                    parts.forEach(part => {
                        if (part === '[ ]') {
                            const cb = document.createElement('input');
                            cb.type = 'checkbox';
                            cb.className = 'tm-scratchpad-checkbox';
                            fragment.appendChild(cb);
                        } else if (part === '[x]') {
                            const cb = document.createElement('input');
                            cb.type = 'checkbox';
                            cb.className = 'tm-scratchpad-checkbox';
                            cb.checked = true;
                            fragment.appendChild(cb);
                    } else if (part) {
                            fragment.appendChild(document.createTextNode(part));
                        }
                    });
                textNode.parentNode.replaceChild(fragment, textNode);
            });
            
            // Restore cursor position after rendering checkboxes
            if (cursorPos !== null) {
                restoreCursorPosition(cursorPos);
            }
        }

        editor.addEventListener('input', window.debounce(renderCheckboxesInEditor, 300));

        editor.addEventListener('change', (e) => {
            if (e.target.matches('.tm-scratchpad-checkbox')) {
                // This is tricky because the innerHTML doesn't update on checkbox change.
                // We need to reconstruct the text representation and save it.
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = editor.innerHTML;
                tempDiv.querySelectorAll('.tm-scratchpad-checkbox').forEach(cb => {
                    // Replace the checkbox input with its text equivalent
                    const textNode = document.createTextNode(cb.checked ? '[x]' : '[ ]');
                    cb.parentNode.replaceChild(textNode, cb);
                });
                const newContent = tempDiv.innerHTML;
                updateActiveNote({ content: newContent });
                // The 'input' event listener will re-render the checkboxes visually.
            }
        });

        // --- Template Logic ---
        templateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const templates = JSON.parse(GM_getValue(STORAGE_KEYS.SCRATCHPAD_TEMPLATES, '[]'));
            if (templates.length === 0) {
                window.showPositiveMessage('Δεν υπάρχουν πρότυπα. Προσθέστε από τις ρυθμίσεις.');
                return;
            }
            templateList.innerHTML = templates.map((t) => {
                const safeTitle = escapeHtml(t.title);
                const safeContent = encodeURIComponent(t.content || '');
                return `<button type="button" data-content="${safeContent}">${safeTitle}</button>`;
            }).join('');
            templatePopover.style.display = 'block';
            reminderPopover.style.display = 'none';
        });

        templateList.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const content = decodeURIComponent(e.target.dataset.content);
                document.execCommand('insertHTML', false, `<br>${content}`);
                templatePopover.style.display = 'none';
                renderCheckboxesInEditor();
            }
        });

        // Hide popovers on outside click
        reminderPopover.addEventListener('click', (e) => e.stopPropagation());
        templatePopover.addEventListener('click', (e) => e.stopPropagation());

        document.addEventListener('click', (e) => {
            if (!templatePopover.contains(e.target) && e.target !== templateBtn) {
                templatePopover.style.display = 'none';
            }
            if (!reminderPopover.contains(e.target) && e.target !== reminderBtn) {
                reminderPopover.style.display = 'none';
            }
        });

        // Font Size Controls
        fontSizeDownBtn.addEventListener('click', () => {
            let note = getActiveNote();
            let newSize = (note.fontSize || 13) - 1;
            if (newSize >= 8) {
                editor.style.fontSize = `${newSize}px`;
                updateActiveNote({ fontSize: newSize });
            }
        });

        fontSizeUpBtn.addEventListener('click', () => {
            let note = getActiveNote();
            let newSize = (note.fontSize || 13) + 1;
            if (newSize <= 30) {
                editor.style.fontSize = `${newSize}px`;
                updateActiveNote({ fontSize: newSize });
            }
        });

        // Maximize/Restore Logic
        function toggleMaximize() {
            if (!isMaximized) {
                // Save current geometry before maximizing
                const rect = container.getBoundingClientRect();
                originalGeometry = {
                    top: container.style.top,
                    left: container.style.left,
                    width: `${rect.width}px`,
                    height: container.style.height
                };
                container.classList.add('maximized');
                container.style.top = '10px';
                container.style.left = '10px';
                container.style.width = 'calc(100vw - 20px)';
                container.style.height = 'calc(100vh - 20px)';
            } else {
                // Restore original geometry
                container.classList.remove('maximized');
                if (originalGeometry) {
                    container.style.top = originalGeometry.top;
                    container.style.left = originalGeometry.left;
                    container.style.width = originalGeometry.width;
                    container.style.height = originalGeometry.height;
                }
            }
            isMaximized = !isMaximized;
            GM_setValue(SCRATCHPAD_STORAGE_KEY_IS_MAXIMIZED, isMaximized);
        }
        maximizeBtn.addEventListener('click', toggleMaximize);

        function fmtReminderDateTime(dt) {
            const y = dt.getFullYear();
            const m = String(dt.getMonth() + 1).padStart(2, '0');
            const d = String(dt.getDate()).padStart(2, '0');
            const h = String(dt.getHours()).padStart(2, '0');
            const min = String(dt.getMinutes()).padStart(2, '0');
            return `${y}-${m}-${d}T${h}:${min}`;
        }

        function updateReminderDisplay() {
            const note = getActiveNote();
            const reminder = note?.reminder;
            if (reminder && reminder.dueTime) {
                const dueDate = new Date(reminder.dueTime);
                let recurrenceText = '';
                if (reminder.recurrence === 'daily') recurrenceText = ' (Καθημερινά)';
                if (reminder.recurrence === 'weekly') recurrenceText = ' (Εβδομαδιαία)';
                const title = reminder.title || reminder.text || note.title || 'Υπενθύμιση';
                const notes = reminder.notes || '';

                activeReminderDiv.innerHTML = `
                    <span style="font-weight:bold; display:block; margin-bottom: 3px;">${escapeHtml(title)}</span>
                    ${notes ? `<span style="font-weight:normal; display:block; margin-bottom: 3px; opacity:0.9;">${escapeHtml(notes)}</span>` : ''}
                    ${escapeHtml(dueDate.toLocaleString('el-GR'))}${escapeHtml(recurrenceText)}
                    <button type="button" id="tm-scratchpad-clear-reminder-btn">Καθαρισμός</button>
                `;
                activeReminderDiv.querySelector('#tm-scratchpad-clear-reminder-btn').addEventListener('click', clearReminder);
                reminderBtn.classList.add('active');
            } else {
                activeReminderDiv.innerHTML = '';
                reminderBtn.classList.remove('active');
            }
        }

        function saveReminder(dueTime, recurrence, title, notes) {
            if (!title) {
                alert('Παρακαλώ εισάγετε τίτλο για την υπενθύμιση.');
                return;
            }

            if (window.Notification && Notification.permission !== 'granted') {
                Notification.requestPermission();
            }

            const newReminder = {
                title,
                notes: notes || '',
                text: title,
                dueTime,
                recurrence,
                createdAt: Date.now()
            };
            updateActiveNote({ reminder: newReminder });
            updateReminderDisplay();
            reminderPopover.style.display = 'none';
            if (typeof window.refreshActiveAlertsPanelIfOpen === 'function') {
                window.refreshActiveAlertsPanelIfOpen();
            }
            if (typeof window.trackDailyStat === 'function') {
                window.trackDailyStat(config, STORAGE_KEYS, 'setScratchpadReminder');
            }
        }

        function clearReminder() {
            const note = getActiveNote();
            if (note?.reminder && typeof window.appendReminderHistory === 'function') {
                window.appendReminderHistory({
                    source: 'scratchpad',
                    action: 'cancelled',
                    title: note.reminder.title || note.reminder.text || note.title || 'Σημείωση',
                    message: note.reminder.notes || '',
                    dueTime: note.reminder.dueTime,
                    noteId: note.id,
                    recurrence: note.reminder.recurrence || 'none',
                });
            }
            updateActiveNote({ reminder: null });
            updateReminderDisplay();
            if (typeof window.refreshActiveAlertsPanelIfOpen === 'function') {
                window.refreshActiveAlertsPanelIfOpen();
            }
        }

        reminderBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const willShow = reminderPopover.style.display !== 'flex';
            reminderPopover.style.display = willShow ? 'flex' : 'none';
            templatePopover.style.display = 'none';
            if (willShow) {
                const note = getActiveNote();
                const reminder = note?.reminder;
                reminderTitleInput.value = reminder?.title || reminder?.text || note?.title || '';
                reminderNotesInput.value = reminder?.notes || '';
                reminderRecurrenceSelect.value = reminder?.recurrence || 'none';
                if (reminder?.dueTime) {
                    reminderDateTimeInput.value = fmtReminderDateTime(new Date(reminder.dueTime));
                } else {
                    reminderDateTimeInput.value = fmtReminderDateTime(new Date(Date.now() + 60 * 60 * 1000));
                }
            }
        });

        cancelReminderBtn.addEventListener('click', () => {
            reminderPopover.style.display = 'none';
        });

        setReminderBtn.addEventListener('click', () => {
            const dueTime = new Date(reminderDateTimeInput.value).getTime();
            if (!reminderDateTimeInput.value || Number.isNaN(dueTime) || dueTime <= Date.now()) {
                alert('Παρακαλώ επιλέξτε μια μελλοντική ημερομηνία και ώρα.');
                return;
            }
            saveReminder(
                dueTime,
                reminderRecurrenceSelect.value,
                reminderTitleInput.value.trim(),
                reminderNotesInput.value.trim()
            );
        });

        setReminder1hrBtn.addEventListener('click', () => {
            const dueTime = Date.now() + 60 * 60 * 1000;
            reminderDateTimeInput.value = fmtReminderDateTime(new Date(dueTime));
            saveReminder(
                dueTime,
                reminderRecurrenceSelect.value,
                reminderTitleInput.value.trim(),
                reminderNotesInput.value.trim()
            );
        });

        window.refreshScratchpadReminderUI = updateReminderDisplay;

        // --- Dragging and Sizing Logic ---
        let isDragging = false;
        let offsetX, offsetY;

        const saveGeometry = window.debounce(() => {
            const rect = container.getBoundingClientRect();
            const geometry = {
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`
            };
            GM_setValue('tm_user_scratchpad_geometry', JSON.stringify(geometry));
            console.log('[MMS] Saved scratchpad geometry:', geometry);
        }, 500);

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('button, input, select, textarea') || isMaximized) return;

            isDragging = true;
            offsetX = e.clientX - container.getBoundingClientRect().left;
            offsetY = e.clientY - container.getBoundingClientRect().top;
            container.style.transition = 'none'; // Disable transitions during drag
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (isMaximized) return; // No dragging when maximized
            if (!isDragging) return;
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;

            container.style.left = `${newX}px`;
            container.style.top = `${newY}px`;
            container.style.bottom = 'auto';
            container.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                container.style.transition = '';
                document.body.style.userSelect = '';
                if (!isMaximized) saveGeometry();
            }
        });

        // Use a ResizeObserver to save geometry when the user resizes the panel
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                if (container.style.display === 'flex' && !isMaximized) {
                    saveGeometry();
                }
            });
            resizeObserver.observe(container);
        }

        // --- "Send to Scratchpad" Integration ---
        window.sendToScratchpad = (text, sourceUrl = null) => {
            // Get DOM elements directly
            const scratchpadContainer = document.getElementById('tm-scratchpad-container');
            const toggleButton = document.getElementById('tm-scratchpad-toggle-btn');
            const editor = document.getElementById('tm-scratchpad-editor');
            
            // Check if elements exist
            if (!scratchpadContainer || !toggleButton || !editor) {
                console.error('[MMS] Scratchpad elements not found. Make sure scratchpad is initialized.');
                return;
            }
            
            // Ensure scratchpad is open
            if (scratchpadContainer.style.display !== 'flex') {
                toggleButton.click();
            }
            
            // Debug: Log what we're receiving
            console.log('[MMS] sendToScratchpad called with:', { text, sourceUrl });
            
            // Add source link if provided
            const sourceLinkHTML = sourceUrl
                ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener" class="tm-scratchpad-source-link">🔗 Πηγή</a>`
                : '';

            // Append text to the current note
            // Only add text if it's not empty
            const currentContent = editor.innerHTML;
            let newContent;
            
            if (text && text.trim()) {
                // Text is provided, add it with the link
                newContent = currentContent ? `${currentContent}<br><br>${text}${sourceLinkHTML}` : `${text}${sourceLinkHTML}`;
            } else if (sourceUrl) {
                // Only link provided, add just the link
                newContent = currentContent ? `${currentContent}<br><br>${sourceLinkHTML}` : sourceLinkHTML;
            } else {
                // Nothing to add
                console.warn('[MMS] sendToScratchpad called with no text or link');
                return;
            }
            
            editor.innerHTML = newContent;
            
            // Save the changes using the global debouncedSaveText function
            if (typeof window.debouncedSaveText === 'function') {
                window.debouncedSaveText();
            }
            
            window.showPositiveMessage('Προστέθηκε στο σημειωματάριο!');
        };

        // Add a click listener to the editor to handle links inside contenteditable
        editor.addEventListener('click', (e) => {
            // Check if the clicked element is an anchor tag with an href
            if (e.target.tagName === 'A' && e.target.href) {
                e.preventDefault(); // Prevent the default contenteditable behavior (like placing a cursor)
                window.open(e.target.href, '_blank'); // Manually open the link in a new tab
            }
        });

        // Initial Load
        renderTabs();
        loadActiveNote();
    }

    // Make the main initializer function globally accessible
    window.initScratchpadFeature = initScratchpadFeature;

})();