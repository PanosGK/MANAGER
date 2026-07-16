// ==UserScript==
// @name         MyManager Settings
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Settings panel module for MyManager All-in-One Suite.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// ==/UserScript==

(function() {
    'use strict';

    /** Help text for settings toggles — shown in the info drawer. */
    const SETTINGS_HELP = {
        script: {
            title: 'Κύριος διακόπτης',
            what: 'Ενεργοποιεί ή απενεργοποιεί ολόκληρο το MyManager Suite (όλα τα εργαλεία, widgets, mascot, gamification).',
            where: 'Ισχύει σε όλες τις σελίδες του MyManager όπου φορτώνει το script.',
            when: 'Όταν είναι off, το suite δεν τρέχει. Εναλλαγή και με Ctrl+Alt+M χωρίς να ανοίξετε ρυθμίσεις.',
        },
        notifications: {
            title: 'Ειδοποιήσεις',
            what: 'Εμφανίζει το κουμπί ειδοποιήσεων και όλα τα popups (επιτεύγματα, υπενθυμίσεις, μηνύματα συστήματος).',
            where: 'Footer / γωνία οθόνης σε όλες τις σελίδες του suite.',
            when: 'Όποτε το suite θέλει να σας ειδοποιήσει. Απενεργοποιήστε για ήσυχη λειτουργία.',
        },
        dashboard: {
            title: 'Widget «Σήμερα»',
            what: 'Μικρό widget με στατιστικά της ημέρας (επισκευές, αλλαγές status κ.λπ.).',
            where: 'Footer της εφαρμογής.',
            when: 'Καθ’ όλη τη διάρκεια της εργασίας· ενημερώνεται καθώς κάνετε ενέργειες.',
        },
        scroll_top: {
            title: 'Επιστροφή στην κορυφή',
            what: 'Κουμπί που κυλάει τη σελίδα στην κορυφή με ένα κλικ.',
            where: 'Σταθερό στην οθόνη σε μεγάλες λίστες / μακριές σελίδες.',
            when: 'Όταν κάνετε scroll προς τα κάτω — εμφανίζεται για γρήγορη επιστροφή.',
        },
        hidden_menu: {
            title: 'Απόκρυψη αριστερού μενού',
            what: 'Επιτρέπει να κρύβετε στοιχεία του αριστερού μενού του MyManager. Από «Κρυφά στοιχεία» επιλέγετε τι θα εμφανίζεται.',
            where: 'Αριστερό πλαϊνό μενού (όλες οι σελίδες με το native menu).',
            when: 'Μετά την αποθήκευση ρυθμίσεων / εφαρμογή — το μενού φιλτράρεται όπως τα themes.',
        },
        debug: {
            title: 'Λειτουργία ανάπτυξης',
            what: 'Ξεκλειδώνει την καρτέλα «Ανάπτυξη», δοκιμές mascot και δωρεάν αντικείμενα στο κατάστημα.',
            where: 'Ρυθμίσεις → Ανάπτυξη · επίσης επηρεάζει το κατάστημα.',
            when: 'Μόνο για δοκιμές. Απαιτεί κωδικό πρόσβασης. Μην το αφήνετε on σε κανονική εργασία.',
        },
        search: {
            title: 'Προηγμένη αναζήτηση',
            what: 'Ισχυρή αναζήτηση με φίλτρα και γρήγορα αποτελέσματα για επισκευές, πελάτες και προϊόντα.',
            where: 'Modal αναζήτησης (κουμπί / συντόμευση suite) σε σελίδες εργασίας.',
            when: 'Όταν χρειάζεστε να βρείτε επισκευή, πελάτη ή προϊόν γρήγορα.',
        },
        search_history: {
            title: 'Μέγεθος ιστορικού αναζήτησης',
            what: 'Πόσες πρόσφατες αναζητήσεις αποθηκεύονται για επανάληψη (0–50).',
            where: 'Μέσα στο παράθυρο προηγμένης αναζήτησης.',
            when: 'Κάθε φορά που κάνετε αναζήτηση — εμφανίζονται οι πρόσφατες εγγραφές.',
        },
        quick_search: {
            title: 'Κουμπιά γρήγορης αναζήτησης',
            what: 'Κουμπιά με προκαθορισμένους όρους (π.χ. Οθόνη, Μπαταρία) για άμεση αναζήτηση ανταλλακτικών.',
            where: 'Σελίδες επεξεργασίας παραγγελιών / επισκευών όπου εμφανίζεται η μπάρα γρήγορης αναζήτησης.',
            when: 'Όταν παραγγέλνετε ή ψάχνετε ανταλλακτικά — ένα κλικ αντί για πληκτρολόγηση.',
        },
        footer_quick_search: {
            title: 'Γρήγορη αναζήτηση header',
            what: 'Πεδίο γρήγορης αναζήτησης στο header (ή δίπλα στον τίτλο στο service_edit). Μπορεί να κρύψει το native search.',
            where: 'Header (rnr-hfiller) σε πολλές σελίδες · service_edit δίπλα στον τίτλο επισκευής.',
            when: 'Συνεχώς ορατό όσο είστε σε σελίδες με header — για γρήγορη αναζήτηση χωρίς modal.',
        },
        tech_stats: {
            title: 'Στατιστικά τεχνικών',
            what: 'Εμφανίζει στατιστικά απόδοσης ανά τεχνικό (επισκευές, χρόνοι κ.λπ.).',
            where: 'Σχετικές οθόνες / widgets στατιστικών τεχνικών στο suite.',
            when: 'Όταν θέλετε επισκόπηση απόδοσης ομάδας ή ατόμου.',
        },
        recent_repairs: {
            title: 'Πρόσφατες επισκευές',
            what: 'Κουμπί / λίστα για γρήγορη πρόσβαση στις τελευταίες επισκευές που ανοίξατε ή δουλέψατε.',
            where: 'UI suite (κουμπί πρόσφατων) σε σελίδες εργασίας.',
            when: 'Όταν θέλετε να επιστρέψετε γρήγορα σε πρόσφατη επισκευή.',
        },
        repair_quickview: {
            title: 'Γρήγορη προβολή λίστας',
            what: 'Κουμπί προεπισκόπησης σε κάθε γραμμή λίστας επισκευών χωρίς να αλλάξετε σελίδα.',
            where: 'Λίστα επισκευών (service list).',
            when: 'Όταν σκανάρετε τη λίστα και θέλετε γρήγορη ματιά σε λεπτομέρειες.',
        },
        recent_repairs_max: {
            title: 'Αριθμός πρόσφατων επισκευών',
            what: 'Πόσες επισκευές κρατάει η λίστα «Πρόσφατες» (1–20).',
            where: 'Ίδιο UI με τις πρόσφατες επισκευές.',
            when: 'Επηρεάζει το μήκος της λίστας κάθε φορά που ανοίγετε πρόσφατες.',
        },
        customer_history: {
            title: 'Ιστορικό πελάτη',
            what: 'Γρήγορη προβολή προηγούμενων επισκευών / ιστορικού του πελάτη.',
            where: 'Λίστα επισκευών και σχετικά σημεία πελάτη.',
            when: 'Όταν ανοίγετε ή κοιτάτε επισκευή και θέλετε προηγούμενο ιστορικό πελάτη.',
        },
        weather: {
            title: 'Widget καιρού',
            what: 'Τοπική πρόγνωση καιρού στο footer.',
            where: 'Κέντρο footer.',
            when: 'Συνεχώς (όσο είναι ενεργό) — ενημερώνεται περιοδικά.',
        },
        phone_catalog: {
            title: 'Κατάλογος συσκευών',
            what: 'Κατάλογος μεταχειρισμένων συσκευών (μοντέλο, βαθμίδα, IMEI, χωρητικότητα, χρώμα) με αναζήτηση, φίλτρα και CSV.',
            where: 'Ξεχωριστό UI καταλόγου από το suite.',
            when: 'Όταν ψάχνετε ή εξάγετε διαθέσιμες μεταχειρισμένες συσκευές του καταστήματος.',
        },
        order_history: {
            title: 'Ιστορικό παραγγελιών',
            what: 'Εμφάνιση ιστορικού παραγγελιών ανταλλακτικών.',
            where: 'Σχετικές οθόνες παραγγελιών / επισκευών με σύνδεση παραγγελίας.',
            when: 'Όταν ελέγχετε τι έχει παραγγελθεί για μια επισκευή ή γενικά.',
        },
        order_link: {
            title: 'Σύνδεση status 65 → παραγγελίες',
            what: 'Σε επισκευές status 65, το badge γίνεται κλικ για αναζήτηση παραγγελιών. Στη σελίδα παραγγελίας εμφανίζει σύνδεσμο προς την επισκευή.',
            where: 'service_edit (status 65) και σελίδες παραγγελιών.',
            when: 'Όταν η επισκευή περιμένει ανταλλακτικά ή ανοίγετε σχετική παραγγελία.',
        },
        return_to_40: {
            title: 'Κουμπί «40» (65/100)',
            what: 'Κόκκινο κουμπί που κάνει logout → login ως admin και εφαρμόζει status 40 (όπως το logo flow).',
            where: 'service_edit σε επισκευές με status 65 ή 100.',
            when: 'Όταν χρειάζεται επιστροφή σε status 40 με δικαιώματα admin.',
        },
        status40_admin: {
            title: 'Admin (Status 40)',
            what: 'Username/κωδικός admin για το flow logo / κουμπί 40 (logout → login ως admin → επιστροφή στην επισκευή).',
            where: 'Αποθηκεύονται τοπικά στο Tampermonkey (όχι ανά προφίλ χρήστη).',
            when: 'Χρησιμοποιούνται όταν κάνετε κλικ στο logo ή στο κουμπί «40».',
        },
        autorefresh: {
            title: 'Αυτόματη ανανέωση',
            what: 'Ανανεώνει αυτόματα τις σελίδες λίστας ώστε να βλέπετε νέες εγγραφές χωρίς F5.',
            where: 'Σελίδες λίστας (π.χ. λίστα επισκευών).',
            when: 'Μόνο μέσα στο ορισμένο ωράριο και τις επιλεγμένες ημέρες.',
        },
        refresh_interval: {
            title: 'Διάστημα ανανέωσης',
            what: 'Πόσα λεπτά περιμένει μεταξύ αυτόματων ανανεώσεων.',
            where: 'Ίδιες σελίδες λίστας με την αυτόματη ανανέωση.',
            when: 'Κάθε N λεπτά όσο η αυτόματη ανανέωση είναι ενεργή και είστε σε εργάσιμο χρόνο.',
        },
        working_hours: {
            title: 'Ώρες & ημέρες εργασίας',
            what: 'Περιορίζει την αυτόματη ανανέωση σε συγκεκριμένες ώρες και ημέρες.',
            where: 'Εφαρμόζεται στη συμπεριφορά auto-refresh (όχι ορατό UI στη λίστα).',
            when: 'Η ανανέωση τρέχει μόνο μέσα στο παράθυρο που ορίζετε εδώ.',
        },
        scratchpad: {
            title: 'Σημειωματάριο',
            what: 'Γρήγορο σημειωματάριο για checklists και προσωρινές σημειώσεις κατά τη δουλειά.',
            where: 'Panel σημειωματαρίου του suite (κουμπί / overlay).',
            when: 'Όποτε θέλετε να κρατήσετε σημειώσεις χωρίς να φύγετε από τη σελίδα.',
        },
        scratchpad_templates: {
            title: 'Πρότυπα σημειωματαρίου',
            what: 'Έτοιμα πρότυπα κειμένου για γρήγορη εισαγωγή στο σημειωματάριο.',
            where: 'Μέσα στο σημειωματάριο.',
            when: 'Όταν επιλέγετε πρότυπο αντί να γράφετε από την αρχή.',
        },
        quick_search_editor: {
            title: 'Επεξεργαστής γρήγορης αναζήτησης',
            what: 'Ορίζετε ετικέτα κουμπιού και όρο αναζήτησης για τα κουμπιά γρήγορης αναζήτησης.',
            where: 'Ρυθμίσεις → Εργαλεία · τα κουμπιά εμφανίζονται στις σελίδες παραγγελιών/επισκευών.',
            when: 'Αφού αποθηκεύσετε, τα νέα κουμπιά είναι διαθέσιμα στην επόμενη χρήση.',
        },
        price_options: {
            title: 'Επιλογές τιμών επισκευής',
            what: 'Προσαρμόζει τις επιλογές στο dropdown τιμών (extra χρεώσεις, ειδικές τιμές).',
            where: 'Σελίδα επεξεργασίας επισκευής (πεδίο τιμής).',
            when: 'Όταν συμπληρώνετε ή αλλάζετε τιμή επισκευής.',
        },
        work_profiles: {
            title: 'Γρήγορα profiles',
            what: 'Professional απενεργοποιεί παιχνίδι/mascot/shop και αφήνει εργαλεία δουλειάς. Gamification ενεργοποιεί XP, mascot, κατάστημα κ.λπ.',
            where: 'Επηρεάζει όλο το suite μετά την αποθήκευση.',
            when: 'Πατήστε το κουμπί για να εφαρμοστεί το αντίστοιχο σετ ρυθμίσεων αμέσως (και αποθηκεύστε αν χρειάζεται).',
        },
        eod_checklist: {
            title: 'Checklist τέλους ημέρας',
            what: 'Checklist με τις επισκευές της ημέρας πριν φύγετε — δωρεάν εργαλείο δουλειάς.',
            where: 'Κουμπί στο footer · ανοίγει modal EOD.',
            when: 'Στο τέλος της βάρδιας ή όποτε θέλετε έλεγχο εκκρεμοτήτων της ημέρας.',
        },
        levelup: {
            title: 'Σύστημα επιπέδων',
            what: 'Κερδίζετε XP και ανεβαίνετε επίπεδο από επισκευές, status changes, παραγγελίες κ.λπ.',
            where: 'UI επιπέδου / XP στο suite (footer ή σχετικά panels).',
            when: 'Μετά από επιτυχημένες εργασίες όσο είναι ενεργό.',
        },
        confetti: {
            title: 'Εφέ κομφετί',
            what: 'Οπτικά εφέ κομφετί σε επιτυχίες και milestones.',
            where: 'Πάνω από την τρέχουσα σελίδα (overlay).',
            when: 'Π.χ. ολοκλήρωση επισκευής / σημαντικά events — αν είναι ενεργό και το confetti setting.',
        },
        achievements: {
            title: 'Επιτεύγματα',
            what: 'Ξεκλειδώνει επιτεύγματα για ειδικούς στόχους και ενέργειες.',
            where: 'Ειδοποιήσεις / σχετικά panels επιτευγμάτων.',
            when: 'Όταν πιάσετε στόχο όσο το σύστημα είναι ενεργό.',
        },
        random_events: {
            title: 'Τυχαία γεγονότα',
            what: 'Περιοδικά events με μπόνους (π.χ. 2× νομίσματα, 2× XP).',
            where: 'Popup / banner πάνω στην εργασία.',
            when: 'Τυχαία κατά τη διάρκεια της ημέρας όσο είστε ενεργοί στο MyManager.',
        },
        personal_dashboard: {
            title: 'Προσωπικός πίνακας',
            what: 'Αναλυτικά γραφήματα και στατιστικά απόδοσης.',
            where: 'Modal / σελίδα προσωπικού dashboard του suite.',
            when: 'Όταν ανοίγετε τον πίνακα για ανασκόπηση προόδου.',
        },
        shop: {
            title: 'Κατάστημα (cosmetics)',
            what: 'Κατάστημα για θέματα, αξεσουάρ mascot και προαιρετικά game extras — όχι εργαλεία δουλειάς.',
            where: 'Κουμπί καταστήματος / modal shop.',
            when: 'Όταν θέλετε να αγοράσετε ή να εξοπλίσετε cosmetics με Fixer-Coins.',
        },
        mascot: {
            title: 'Mascot',
            what: 'Διαδραστικός βοηθός στην οθόνη (Tamagotchi): φροντίδα, αντιδράσεις στη δουλειά, bubbles.',
            where: 'Πλωτό mascot σε όλες τις σελίδες όσο είναι ενεργό.',
            when: 'Συνεχώς (idle / αντιδράσεις σε επισκευές, παραγγελίες, EOD κ.λπ.).',
        },
        mascot_speed: {
            title: 'Ταχύτητα περιπλάνησης',
            what: 'Πόσο γρήγορα κινείται το mascot στην οθόνη (pixels/δευτ.).',
            where: 'Οπουδήποτε εμφανίζεται το mascot.',
            when: 'Κατά την περιπλάνηση (roaming) σε idle.',
        },
        auto_update: {
            title: 'Αυτόματος έλεγχος ενημερώσεων',
            what: 'Κάθε ~5 λεπτά ελέγχει αν χρειάζεται νέο Tampermonkey loader.',
            where: 'Ισχύει στο παρασκήνιο · εικονίδιο ↻ στο footer αν χρειάζεται update.',
            when: 'Συνεχώς στο παρασκήνιο όσο είστε στο MyManager.',
        },
        updates_version: {
            title: 'Έκδοση / έλεγχος τώρα',
            what: 'Δείχνει την τρέχουσα Custom Ver. και επιτρέπει χειροκίνητο έλεγχο ενημέρωσης.',
            where: 'Ρυθμίσεις → Ενημερώσεις.',
            when: 'Πατήστε «Έλεγχος τώρα» όποτε θέλετε άμεσο έλεγχο.',
        },
        updates_loader: {
            title: 'Loader',
            what: 'Το Tampermonkey loader εγκαθίσταται μία φορά από GitHub. Το bundle ενημερώνεται αυτόματα· μόνο αλλαγές loader χρειάζονται update από το Dashboard.',
            where: 'Tampermonkey Dashboard / URL loader.',
            when: 'Μόνο όταν αλλάζει το ίδιο το loader (σπάνια).',
        },
        data_backup: {
            title: 'Δεδομένα & backup',
            what: 'Εξαγωγή / εισαγωγή ρυθμίσεων και προόδου του ενεργού προφίλ. Η επαναφορά σβήνει τα πάντα.',
            where: 'Ρυθμίσεις → Δεδομένα · τα αρχεία είναι τοπικά στο PC σας.',
            when: 'Πριν αλλαγή PC, πριν μεγάλο reset, ή για μεταφορά προφίλ.',
        },
    };

    function tmSettingsInfoBtn(key) {
        if (!SETTINGS_HELP[key]) return '';
        return `<button type="button" class="tm-setting-info-btn" data-tm-help="${key}" title="Περισσότερες πληροφορίες" aria-label="Περισσότερες πληροφορίες για αυτή τη ρύθμιση"><span aria-hidden="true">i</span></button>`;
    }

    function openSettingsHelpPanel(modalRoot, key) {
        const info = SETTINGS_HELP[key];
        const panel = modalRoot?.querySelector('#tm-settings-help-panel');
        if (!info || !panel) return;
        panel.querySelector('[data-help-title]').textContent = info.title;
        panel.querySelector('[data-help-what]').textContent = info.what;
        panel.querySelector('[data-help-where]').textContent = info.where;
        panel.querySelector('[data-help-when]').textContent = info.when;
        panel.removeAttribute('hidden');
        panel.setAttribute('aria-hidden', 'false');
        // Next frame so the slide-in transition runs after display becomes flex
        requestAnimationFrame(() => {
            modalRoot.classList.add('tm-settings-help-open');
        });
    }

    function closeSettingsHelpPanel(modalRoot) {
        const panel = modalRoot?.querySelector('#tm-settings-help-panel');
        if (!panel) return;
        modalRoot.classList.remove('tm-settings-help-open');
        panel.setAttribute('aria-hidden', 'true');
        const finish = () => {
            if (modalRoot.classList.contains('tm-settings-help-open')) return;
            panel.setAttribute('hidden', '');
        };
        panel.addEventListener('transitionend', finish, { once: true });
        setTimeout(finish, 280);
    }

    window.SETTINGS_HELP = SETTINGS_HELP;
    window.tmSettingsInfoBtn = tmSettingsInfoBtn;

    // This function will be attached to the window object to be called from the main script.
    function initSettingsPanel(parentContainer, config, STORAGE_KEYS) {

        function resetSettings() {
            if (!confirm('Είστε σίγουροι; Όλες οι ρυθμίσεις θα επανέλθουν στις αρχικές τους τιμές και η σελίδα θα ανανεωθεί.')) {
                 return;
            }

            // Reset mascot to egg state with default values
            const defaultTamagotchiData = {
                age: 0,
                lifeMinutes: 0,
                eggGeneration: Date.now(),
                stage: 'egg',
                health: 100,
                hunger: 50,
                happiness: 50,
                discipline: 0,
                weight: 0, // Eggs have no weight
                lastFed: Date.now(),
                lastPlayed: Date.now(),
                isSleeping: false,
                lightsOn: true,
                birthdate: Date.now(),
                evolutionHistory: [],
                poopCount: 0,
                lastPoopTime: Date.now(),
                characterType: 'none',
                deathCount: 0,
                careHistory: {
                    fedCount: 0,
                    playedCount: 0,
                    cleanedCount: 0,
                    disciplinedCount: 0
                }
            };
            GM_setValue(STORAGE_KEYS.TAMAGOTCHI_DATA, JSON.stringify(defaultTamagotchiData));
            
            // Reset mascot appearance to egg
            const mascotContainer = document.getElementById('tm-mascot-container');
            if (mascotContainer) {
                if (typeof window.applyEquippedMascotAccessories === 'function') {
                    window.applyEquippedMascotAccessories(STORAGE_KEYS);
                } else {
                    const equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
                    equippedItems.forEach(itemId => {
                        const accessory = typeof window.getAccessoryElement === 'function' ? window.getAccessoryElement(itemId) : null;
                        if (accessory) accessory.style.display = 'none';
                    });
                }
                
                // Reset mascot to egg appearance
                if (typeof window.updateMascotAppearanceByStage === 'function') {
                    window.updateMascotAppearanceByStage('egg');
                }
            }
            
            // Clear any active buff UI elements
            const buffTimersContainer = document.getElementById('tm-buff-timers-container');
            if (buffTimersContainer) {
                buffTimersContainer.innerHTML = '';
            }

            // Comprehensive list of ALL storage keys to reset
            const ALL_STORAGE_KEYS = [
                // Core gamification
                STORAGE_KEYS.USER_XP,
                STORAGE_KEYS.USER_LEVEL,
                STORAGE_KEYS.ACHIEVEMENTS,
                STORAGE_KEYS.USER_COINS,
                STORAGE_KEYS.USER_TITLE,
                STORAGE_KEYS.PURCHASED_ITEMS,
                STORAGE_KEYS.EQUIPPED_ITEMS,
                STORAGE_KEYS.EQUIPPED_THEME,
                STORAGE_KEYS.PET_STATS,
                STORAGE_KEYS.TAMAGOTCHI_DATA,
                STORAGE_KEYS.DAILY_STATS,
                STORAGE_KEYS.DAILY_QUESTS,
                STORAGE_KEYS.USER_REROLL_TOKENS,
                
                // Scratchpad
                STORAGE_KEYS.SCRATCHPAD_NOTES,
                STORAGE_KEYS.SCRATCHPAD_ACTIVE_NOTE_ID,
                STORAGE_KEYS.SCRATCHPAD_TEMPLATES,
                'tm_user_scratchpad_text', 'tm_user_scratchpad_geometry', 'tm_user_scratchpad_is_open', 
                'tm_user_scratchpad_font_size', 'tm_user_scratchpad_last_edited', 'tm_user_scratchpad_is_maximized',
                
                // Talent System
                STORAGE_KEYS.USER_TALENT_POINTS,
                STORAGE_KEYS.UNLOCKED_TALENTS,
                
                // Notifications
                STORAGE_KEYS.USER_NOTIFICATIONS,
                
                // Buffs/Consumables
                STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES,
                STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES,
                STORAGE_KEYS.ENERGIZED_BUFF_COUNT,
                STORAGE_KEYS.DOUBLE_COINS_BUFF_COUNT,
                
                // Search
                STORAGE_KEYS.SEARCH_HISTORY_KEY,
                STORAGE_KEYS.FAVORITE_SEARCHES_KEY,
                'tm_search_history', 'tm_favorite_searches',
                
                // Printing
                STORAGE_KEYS.PRINT_TEMPLATE,
                
                // Random Events
                STORAGE_KEYS.ACTIVE_EVENT,
                STORAGE_KEYS.LAST_EVENT_CHECK,
                STORAGE_KEYS.LAST_EVENT_END_TIME,
                STORAGE_KEYS.EVENT_HISTORY,
                STORAGE_KEYS.EVENT_NOTIFICATION_MINIMIZED,
                
                // Smart Templates
                STORAGE_KEYS.REPAIR_TEMPLATES,
                
                // Legacy faction data (cleanup on reset)
                'tm_user_faction',
                'tm_faction_contribution',
                'tm_faction_challenges',
                'tm_faction_quests_data', // Faction quests
                'tm_faction_wars_data', // Faction wars (legacy)
                'tm_current_faction_war', // Current active faction war
                'tm_faction_war_history', // Faction war history
                'tm_last_war_end', // Last war end timestamp
                'tm_territories_data', // Territory control (legacy)
                'tm_faction_territories', // Territory control (current)
                'tm_faction_research', // Faction research
                'tm_stats_history_7days', // 7-day stats history for performance tracking
                
                // Dashboard
                STORAGE_KEYS.DASHBOARD_STATS_HISTORY,
                STORAGE_KEYS.REPAIR_TIME_HISTORY,
                
                // Boss Battles
                STORAGE_KEYS.ACTIVE_BOSS,
                STORAGE_KEYS.LAST_BOSS_END_TIME,
                STORAGE_KEYS.BOSS_HISTORY,
                STORAGE_KEYS.BOSS_DEFEATS,
                STORAGE_KEYS.BOSS_NOTIFICATION_MINIMIZED,
                STORAGE_KEYS.BOSS_NOTIFICATION_DISMISSED,
                
                // Menu
                STORAGE_KEYS.HIDDEN_MENU_ITEMS,
                
                // Status Transfer Tracking (all tracked statuses)
                STORAGE_KEYS.STATUS_40_TRANSFERS,
                STORAGE_KEYS.STATUS_65_TRANSFERS,
                STORAGE_KEYS.STATUS_100_TRANSFERS,
                STORAGE_KEYS.STATUS_TRANSFER_HISTORY,
                'tm_status_30_transfers',
                'tm_status_55_transfers',
                'tm_status_70_transfers',
                'tm_status_75_transfers',
                'tm_status_90_transfers',
                'tm_status_105_transfers',
                'tm_daily_stats_history', // Historical daily stats for performance tracking
                
                // Recent Repairs
                STORAGE_KEYS.RECENT_REPAIRS,
                
                // Coin History
                STORAGE_KEYS.COIN_HISTORY,
                
                // Level Rewards
                STORAGE_KEYS.PERMANENT_XP_BOOST,
                STORAGE_KEYS.COIN_MULTIPLIER,
                STORAGE_KEYS.SHOP_DISCOUNT,
                STORAGE_KEYS.MASCOT_FOOD_ITEMS,
                STORAGE_KEYS.MASCOT_TREAT_ITEMS,
                STORAGE_KEYS.ASCENDED_STATUS,
                STORAGE_KEYS.DIGITAL_ARCHON_STATUS,
                
                // Settings (DEFAULTS keys)
                ...Object.keys(window.DEFAULTS || {}),
            ];
            
            // Clear all buff duration keys
            GM_deleteValue(`${STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES}_duration`);
            GM_deleteValue(`${STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES}_duration`);
            
            // Delete all storage keys
            ALL_STORAGE_KEYS.forEach(key => {
                try {
                    GM_deleteValue(key);
                } catch (e) {
                    console.warn(`[MMS Reset] Could not delete key: ${key}`, e);
                }
            });
            
            // Also clear any shop item tokens
            if (window.SHOP_ITEMS) {
                Object.values(window.SHOP_ITEMS).forEach(itemKey => {
                    try {
                        GM_deleteValue(itemKey);
                    } catch (e) {
                        console.warn(`[MMS Reset] Could not delete shop item: ${itemKey}`, e);
                    }
                });
            }
            
            console.log('[MMS] All data reset complete');
            alert('Όλα τα δεδομένα επαναφέρθηκαν πλήρως! Το mascot είναι τώρα αυγό και όλα τα στατιστικά έχουν μηδενιστεί. Η σελίδα θα ανανεωθεί τώρα.');
            window.location.reload();
        }

        function saveSettings() {
            const feedback = document.getElementById('tm-settings-feedback');
            feedback.textContent = ''; // Clear previous feedback

            // --- Helper to save a checkbox setting ---
            const saveCheckbox = (id, key) => {
                const checkbox = document.getElementById(id);
                if (checkbox) {
                    const value = checkbox.checked;
                    GM_setValue(key, value);
                    config[key] = value;
                }
            };

            // --- Helper to save a number setting ---
            const saveNumber = (id, key) => {
                const input = document.getElementById(id);
                if (input) {
                    const value = parseInt(input.value, 10);
                    if (!isNaN(value) && value >= (input.min || 0)) {
                        GM_setValue(key, value);
                        config[key] = value;
                    }
                }
            };

            // --- Save General UI Settings ---
            // Save script enabled (master toggle)
            const scriptEnabledCheckbox = document.getElementById('tm-setting-script-enabled');
            if (scriptEnabledCheckbox) {
                GM_setValue(STORAGE_KEYS.SCRIPT_ENABLED, scriptEnabledCheckbox.checked);
                config.scriptEnabled = scriptEnabledCheckbox.checked;
            }
            
            // Debug mode is handled separately with passcode protection
            saveCheckbox('tm-setting-dashboard-enabled', 'dashboardWidgetEnabled');
            saveCheckbox('tm-setting-scroll-top-enabled', 'scrollToTopEnabled');
            saveCheckbox('tm-setting-hidden-menu-enabled', 'hiddenMenuItemsEnabled');
            saveCheckbox('tm-setting-notifications-enabled', 'notificationsEnabled');
            saveCheckbox('tm-setting-tech-stats-enabled', 'technicianStatsEnabled');
            saveCheckbox('tm-setting-customer-history-enabled', 'customerHistoryEnabled');
            saveCheckbox('tm-setting-recent-repairs-enabled', 'recentRepairsEnabled');
            saveCheckbox('tm-setting-repair-list-quickview-enabled', 'repairListQuickViewEnabled');
            saveNumber('tm-setting-recent-repairs-max', 'recentRepairsMaxItems');
            saveCheckbox('tm-setting-weather-widget-enabled', 'weatherWidgetEnabled');
            saveCheckbox('tm-setting-footer-quick-search-enabled', 'footerQuickSearchEnabled');
            saveCheckbox('tm-setting-phone-catalog-enabled', 'phoneCatalogEnabled');
            saveCheckbox('tm-setting-order-history-enabled', 'orderHistoryEnabled');
            saveCheckbox('tm-setting-order-link-enabled', 'orderLinkEnabled');
            saveCheckbox('tm-setting-return-to-40-enabled', 'returnTo40ButtonEnabled');
            saveCheckbox('tm-setting-auto-update-check-enabled', 'autoUpdateCheckEnabled');

            // --- Save Auto-Refresh settings ---
            saveCheckbox('tm-setting-autorefresh-enabled', 'autoRefreshEnabled');
            const startHourInput = document.getElementById('tm-setting-wh-start');
            const endHourInput = document.getElementById('tm-setting-wh-end');

            const newStartHour = parseInt(startHourInput.value, 10);
            const newEndHour = parseInt(endHourInput.value, 10);
            if (!isNaN(newStartHour) && newStartHour >= 0 && newStartHour < 24) {
                GM_setValue('workingHoursStart', newStartHour);
                config.workingHoursStart = newStartHour;
            }
            if (!isNaN(newEndHour) && newEndHour > 0 && newEndHour <= 24) {
                GM_setValue('workingHoursEnd', newEndHour);
                config.workingHoursEnd = newEndHour;
            }

            // Save Working Days
            const newWorkingDays = [];
            document.querySelectorAll('.tm-working-day-checkbox:checked').forEach(cb => {
                newWorkingDays.push(parseInt(cb.value, 10));
            });
            GM_setValue('workingDays', JSON.stringify(newWorkingDays));
            config.workingDays = newWorkingDays;

            // Save Refresh Interval
            saveNumber('tm-setting-refresh-interval', 'refreshIntervalMinutes');

            // --- Save Search Settings ---
            saveCheckbox('tm-setting-search-enabled', 'searchFeatureEnabled');
            saveNumber('tm-setting-search-history-max', 'searchMaxHistory');
            saveCheckbox('tm-setting-quick-search-enabled', 'quickSearchEnabled');

            // --- Save Scratchpad Settings ---
            saveCheckbox('tm-setting-scratchpad-enabled', 'scratchpadEnabled');

            // --- Save Gamification/Fun Settings ---
            saveCheckbox('tm-setting-levelup-enabled', 'levelUpSystemEnabled');
            saveCheckbox('tm-setting-mascot-enabled', 'interactiveMascotEnabled');
            saveCheckbox('tm-setting-confetti-enabled', 'confettiEnabled');
            saveCheckbox('tm-setting-achievements-enabled', 'achievementsEnabled');

            saveNumber('tm-setting-mascot-speed', 'mascotRoamingSpeed');

            // --- Save New Feature Settings ---
            saveCheckbox('tm-setting-random-events-enabled', 'randomEventsEnabled');
            saveCheckbox('tm-setting-smart-templates-enabled', 'smartTemplatesEnabled');
            saveCheckbox('tm-setting-personal-dashboard-enabled', 'personalDashboardEnabled');
            saveCheckbox('tm-setting-shop-enabled', 'shopEnabled');
            saveCheckbox('tm-setting-eod-checklist-enabled', 'eodChecklistEnabled');

            // Apply EOD checklist visibility immediately (no reload needed)
            const eodBtn = document.getElementById('tm-eod-btn');
            if (config.eodChecklistEnabled === false) {
                eodBtn?.remove();
            } else if (!eodBtn && typeof window.initEODChecklist === 'function') {
                window.initEODChecklist(config, STORAGE_KEYS);
            }

            // Weather location is now hardcoded to Athens (removed from settings)

            // --- Save Quick Search Buttons ---
            const newButtons = [];
            document.querySelectorAll('#tm-quick-search-editor .tm-quick-search-row').forEach(row => {
                const labelInput = row.querySelector('input[data-type="label"]');
                const termInput = row.querySelector('input[data-type="term"]');
                if (labelInput.value.trim() && termInput.value.trim()) {
                    newButtons.push({
                        label: labelInput.value.trim(),
                        term: termInput.value.trim()
                    });
                }
            });
            GM_setValue('quickSearchButtons', JSON.stringify(newButtons));
            config.quickSearchButtons = newButtons;

            // --- Save Price Options ---
            const newPriceOptions = [];
            document.querySelectorAll('#tm-price-options-editor .tm-price-option-row').forEach(row => {
                const labelInput = row.querySelector('input[data-type="label"]');
                const valueInput = row.querySelector('input[data-type="value"]');
                const actionSelect = row.querySelector('select[data-type="action"]');
                const conditionSelect = row.querySelector('select[data-type="condition"]');
                if (labelInput.value.trim() && valueInput.value.trim()) {
                    newPriceOptions.push({
                        label: labelInput.value.trim(),
                        value: parseFloat(valueInput.value),
                        action: actionSelect.value,
                        condition: conditionSelect.value
                    });
                }
            });
            GM_setValue('priceOptions', JSON.stringify(newPriceOptions));
            config.priceOptions = newPriceOptions;

            // --- Save Scratchpad Templates ---
            const newTemplates = [];
            document.querySelectorAll('#tm-scratchpad-templates-editor .tm-template-row').forEach(row => {
                const titleInput = row.querySelector('input[data-type="title"]');
                const contentInput = row.querySelector('textarea[data-type="content"]');
                if (titleInput.value.trim() && contentInput.value.trim()) {
                    newTemplates.push({
                        id: row.dataset.id || `template_${Date.now()}`,
                        title: titleInput.value.trim(),
                        content: contentInput.value.trim()
                    });
                }
            });
            GM_setValue(STORAGE_KEYS.SCRATCHPAD_TEMPLATES, JSON.stringify(newTemplates));

            // --- Save Scratchpad Settings ---
            saveCheckbox('tm-setting-scratchpad-enabled', 'scratchpadEnabled');

            // --- Save Gamification/Fun Settings ---
            saveCheckbox('tm-setting-levelup-enabled', 'levelUpSystemEnabled');
            saveCheckbox('tm-setting-mascot-enabled', 'interactiveMascotEnabled');
            saveCheckbox('tm-setting-confetti-enabled', 'confettiEnabled');
            saveCheckbox('tm-setting-achievements-enabled', 'achievementsEnabled');

            // --- Save Status 40 admin account (global) ---
            const status40UserEl = document.getElementById('tm-setting-status40-admin-username');
            const status40PassEl = document.getElementById('tm-setting-status40-admin-password');
            if (status40UserEl) {
                GM_setValue(STORAGE_KEYS.STATUS40_ADMIN_USERNAME, status40UserEl.value.trim());
            }
            if (status40PassEl) {
                GM_setValue(STORAGE_KEYS.STATUS40_ADMIN_PASSWORD, status40PassEl.value);
            }

            console.log('[MMS] Settings saved:', config);
            // Reload the page so settings apply immediately
            showPositiveMessage('Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς!');
            if (typeof window.initScriptUpdateChecker === 'function') {
                window.initScriptUpdateChecker();
            }
            try { window.location.reload(); } catch (_) {}
        }

        // --- Settings Modal HTML Generators (for better readability) ---
        function getGeneralUISettingsHTML() {
            const info = tmSettingsInfoBtn;
            // Merged General and Login settings
            return `
                <div class="tm-settings-section">
                    <header class="tm-settings-section-head">
                        <h3>Γενικές</h3>
                        <p class="tm-settings-section-desc">Βασικές επιλογές εμφάνισης και λειτουργίας.</p>
                    </header>
                    <div class="tm-setting-row tm-setting-row--danger">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-script-enabled">Κύριος διακόπτης</label>
                                ${info('script')}
                            </div>
                            <p class="tm-setting-description">Απενεργοποιεί όλες τις λειτουργίες. Ctrl+Alt+M για γρήγορη εναλλαγή.</p>
                        </div>
                        <div class="tm-setting-control">
                            <input type="checkbox" id="tm-setting-script-enabled">
                        </div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-notifications-enabled">Ειδοποιήσεις</label>
                                ${info('notifications')}
                            </div>
                            <p class="tm-setting-description">Popups, achievements και υπενθυμίσεις.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-notifications-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-dashboard-enabled">Widget «Σήμερα»</label>
                                ${info('dashboard')}
                            </div>
                            <p class="tm-setting-description">Στατιστικά της τρέχουσας ημέρας στο footer.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-dashboard-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-scroll-top-enabled">Επιστροφή στην κορυφή</label>
                                ${info('scroll_top')}
                            </div>
                            <p class="tm-setting-description">Κουμπί γρήγορης κύλισης πάνω.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-scroll-top-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-hidden-menu-enabled">Απόκρυψη αριστερού μενού</label>
                                ${info('hidden_menu')}
                            </div>
                            <p class="tm-setting-description">Επιλέξτε ποια στοιχεία εμφανίζονται.</p>
                        </div>
                        <div class="tm-setting-control">
                            <input type="checkbox" id="tm-setting-hidden-menu-enabled">
                            <button type="button" id="tm-manage-hidden-menu-btn" class="tm-settings-ghost-btn">Κρυφά στοιχεία</button>
                        </div>
                    </div>
                    <div class="tm-setting-row tm-setting-row--warn">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-debug-enabled">Λειτουργία ανάπτυξης</label>
                                ${info('debug')}
                            </div>
                            <p class="tm-setting-description">Δοκιμές και δωρεάν αντικείμενα. Απαιτεί κωδικό.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-debug-enabled"></div>
                    </div>
                </div>
            `;
        }

        function getDebugSettingsHTML() {
            return `
                <div class="tm-settings-section">
                    <header class="tm-settings-section-head">
                        <h3>Εργαλεία debug</h3>
                        <p class="tm-settings-section-desc">Μόνο για δοκιμές — μην χρησιμοποιείτε σε κανονική εργασία.</p>
                    </header>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-debug-level-input">Ορισμός Level</label></div>
                        <div class="tm-setting-control"><input type="number" id="tm-debug-level-input" min="1" value="${GM_getValue(STORAGE_KEYS.USER_LEVEL, 1)}"><button type="button" id="tm-debug-set-level-btn" class="tm-settings-ghost-btn">Set</button></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-debug-xp-input">Προσθήκη XP</label></div>
                        <div class="tm-setting-control"><input type="number" id="tm-debug-xp-input" value="100"><button type="button" id="tm-debug-add-xp-btn" class="tm-settings-ghost-btn">Add</button></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-debug-coins-input">Προσθήκη Coins</label></div>
                        <div class="tm-setting-control"><input type="number" id="tm-debug-coins-input" value="1000"><button type="button" id="tm-debug-add-coins-btn" class="tm-settings-ghost-btn">Add</button></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label>Trigger Random Event</label></div>
                        <div class="tm-setting-control"><button type="button" id="tm-debug-trigger-event-btn" class="tm-settings-ghost-btn">Trigger Event</button></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label>Stop Random Event</label></div>
                        <div class="tm-setting-control"><button type="button" id="tm-debug-stop-event-btn" class="tm-settings-ghost-btn">Stop Event</button></div>
                    </div>
                    <div class="tm-setting-row tm-setting-row--divider">
                        <div class="tm-setting-label">
                            <label>Mascot evolution</label>
                            <p class="tm-setting-description">Force hatch ή reset σε αυγό. Ο χαρακτήρας είναι τυχαίος στο επόμενο hatch.</p>
                        </div>
                        <div class="tm-setting-control tm-setting-control--wrap">
                            <button type="button" id="tm-debug-hatch-egg-btn" class="tm-settings-ghost-btn">Force Hatch</button>
                            <button type="button" id="tm-debug-reset-egg-btn" class="tm-settings-ghost-btn">Reset to Egg</button>
                            <button type="button" id="tm-debug-age-up-btn" class="tm-settings-ghost-btn">Age +10</button>
                        </div>
                    </div>
                </div>

                <div class="tm-settings-section">
                    <header class="tm-settings-section-head">
                        <h3>Mascot tester</h3>
                        <p class="tm-settings-section-desc">Προεπισκόπηση — επιστρέφει στο κανονικό μετά από ~5 δευτ.</p>
                    </header>

                    <div class="tm-setting-row tm-setting-row--stack">
                        <div class="tm-setting-label"><label>States</label></div>
                        <div class="tm-setting-control tm-setting-control--grid">
                            <button type="button" class="tm-mascot-state-btn" data-state="idle">Idle</button>
                            <button type="button" class="tm-mascot-state-btn" data-state="happy">Happy</button>
                            <button type="button" class="tm-mascot-state-btn" data-state="sad">Sad</button>
                            <button type="button" class="tm-mascot-state-btn" data-state="eating">Eating</button>
                            <button type="button" class="tm-mascot-state-btn" data-state="thinking">Thinking</button>
                            <button type="button" class="tm-mascot-state-btn" data-state="dodging">Dodging</button>
                            <button type="button" class="tm-mascot-state-btn" data-state="searching">Searching</button>
                            <button type="button" class="tm-mascot-state-btn" data-state="reading">Reading</button>
                            <button type="button" class="tm-mascot-state-btn" data-state="biking">Biking</button>
                            <button type="button" class="tm-mascot-state-btn" data-state="juggling">Juggling</button>
                            <button type="button" class="tm-mascot-state-btn" data-state="energized">Energized</button>
                            <button type="button" class="tm-mascot-state-btn" data-state="glitching">Glitching</button>
                            <button type="button" class="tm-mascot-state-btn" data-state="eureka">Eureka</button>
                            <button type="button" class="tm-mascot-state-btn" data-state="sunny">Sunny</button>
                            <button type="button" class="tm-mascot-state-btn" data-state="rainy">Rainy</button>
                            <button type="button" class="tm-mascot-state-btn" data-state="powersave">Sleep</button>
                        </div>
                    </div>

                    <div class="tm-setting-row tm-setting-row--stack">
                        <div class="tm-setting-label">
                            <label>Character</label>
                            <p class="tm-setting-description">Αποθηκεύεται. Αν είναι αυγό, προχωρά σε baby για προβολή.</p>
                        </div>
                        <div class="tm-setting-control tm-setting-control--grid">
                            <button type="button" class="tm-mascot-char-btn" data-character="dragon">Dragon</button>
                            <button type="button" class="tm-mascot-char-btn" data-character="robot">Robot</button>
                            <button type="button" class="tm-mascot-char-btn" data-character="slime">Slime</button>
                            <button type="button" class="tm-mascot-char-btn" data-character="plant">Plant</button>
                            <button type="button" class="tm-mascot-char-btn" data-character="ghost">Ghost</button>
                            <button type="button" class="tm-mascot-char-btn" data-character="cat">Cat</button>
                            <button type="button" class="tm-mascot-char-btn" data-character="phoenix">Phoenix</button>
                            <button type="button" class="tm-mascot-char-btn" data-character="crystal">Crystal</button>
                        </div>
                    </div>

                    <div class="tm-setting-row tm-setting-row--stack">
                        <div class="tm-setting-label"><label>Stages</label></div>
                        <div class="tm-setting-control tm-setting-control--grid">
                            <button type="button" class="tm-mascot-stage-btn" data-stage="egg">Egg</button>
                            <button type="button" class="tm-mascot-stage-btn" data-stage="baby">Baby</button>
                            <button type="button" class="tm-mascot-stage-btn" data-stage="kid">Kid</button>
                            <button type="button" class="tm-mascot-stage-btn" data-stage="teen">Teen</button>
                            <button type="button" class="tm-mascot-stage-btn" data-stage="adult">Adult</button>
                            <button type="button" class="tm-mascot-stage-btn" data-stage="middleage">Middle Age</button>
                            <button type="button" class="tm-mascot-stage-btn" data-stage="old">Old</button>
                        </div>
                    </div>

                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label>Quick tests</label></div>
                        <div class="tm-setting-control tm-setting-control--wrap">
                            <button type="button" id="tm-mascot-test-bubble" class="tm-settings-ghost-btn">Bubble</button>
                            <button type="button" id="tm-mascot-test-dodge" class="tm-settings-ghost-btn">Dodge</button>
                            <button type="button" id="tm-mascot-test-confetti" class="tm-settings-ghost-btn">Confetti</button>
                            <button type="button" id="tm-mascot-reset" class="tm-settings-ghost-btn">Reset</button>
                        </div>
                    </div>
                </div>

                <div class="tm-settings-section">
                    <div class="tm-setting-row tm-setting-row--danger">
                        <div class="tm-setting-label">
                            <label>Clear dashboard stats</label>
                            <p class="tm-setting-description">Διαγράφει ιστορικό status, counters και στατιστικά. Δεν αναιρείται.</p>
                        </div>
                        <div class="tm-setting-control"><button type="button" id="tm-debug-clear-dashboard-btn" class="tm-settings-danger-btn">Clear stats</button></div>
                    </div>
                </div>
            `;
        }

        function getSearchSettingsHTML() {
            const info = tmSettingsInfoBtn;
            const status40AdminUser = GM_getValue(STORAGE_KEYS.STATUS40_ADMIN_USERNAME, '');
            const status40AdminPass = GM_getValue(STORAGE_KEYS.STATUS40_ADMIN_PASSWORD, '');
            return `
                <div class="tm-settings-section">
                    <header class="tm-settings-section-head">
                        <h3>Αναζήτηση &amp; εργαλεία</h3>
                        <p class="tm-settings-section-desc">Εργαλεία δουλειάς — δωρεάν από τις ρυθμίσεις.</p>
                    </header>
                    <h4 class="tm-settings-subgroup">Αναζήτηση</h4>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-search-enabled">Προηγμένη αναζήτηση</label>
                                ${info('search')}
                            </div>
                            <p class="tm-setting-description">Φίλτρα και ταχεία αποτελέσματα για επισκευές, πελάτες, προϊόντα.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-search-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-search-history-max">Μέγεθος ιστορικού</label>
                                ${info('search_history')}
                            </div>
                            <p class="tm-setting-description">Πρόσφατες αναζητήσεις (0–50).</p>
                        </div>
                        <div class="tm-setting-control"><input type="number" id="tm-setting-search-history-max" min="0" max="50"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-quick-search-enabled">Κουμπιά γρήγορης αναζήτησης</label>
                                ${info('quick_search')}
                            </div>
                            <p class="tm-setting-description">Π.χ. «Οθόνη», «Μπαταρία» στις σελίδες επισκευών.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-quick-search-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-footer-quick-search-enabled">Γρήγορη αναζήτηση header</label>
                                ${info('footer_quick_search')}
                            </div>
                            <p class="tm-setting-description">Στο header ή δίπλα στον τίτλο επισκευής.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-footer-quick-search-enabled"></div>
                    </div>

                    <h4 class="tm-settings-subgroup">Λίστα &amp; προβολή</h4>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-tech-stats-enabled">Στατιστικά τεχνικών</label>
                                ${info('tech_stats')}
                            </div>
                            <p class="tm-setting-description">Απόδοση ανά τεχνικό.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-tech-stats-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-recent-repairs-enabled">Πρόσφατες επισκευές</label>
                                ${info('recent_repairs')}
                            </div>
                            <p class="tm-setting-description">Γρήγορη πρόσβαση στις τελευταίες επισκευές.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-recent-repairs-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-repair-list-quickview-enabled">Γρήγορη προβολή λίστας</label>
                                ${info('repair_quickview')}
                            </div>
                            <p class="tm-setting-description">Προεπισκόπηση χωρίς αλλαγή σελίδας.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-repair-list-quickview-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-recent-repairs-max">Αριθμός πρόσφατων</label>
                                ${info('recent_repairs_max')}
                            </div>
                            <p class="tm-setting-description">Πόσες να εμφανίζονται (1–20).</p>
                        </div>
                        <div class="tm-setting-control">
                            <input type="number" id="tm-setting-recent-repairs-max" min="1" max="20">
                        </div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-customer-history-enabled">Ιστορικό πελάτη</label>
                                ${info('customer_history')}
                            </div>
                            <p class="tm-setting-description">Γρήγορη προβολή στη λίστα επισκευών.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-customer-history-enabled"></div>
                    </div>

                    <h4 class="tm-settings-subgroup">Άλλα εργαλεία</h4>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-weather-widget-enabled">Widget καιρού</label>
                                ${info('weather')}
                            </div>
                            <p class="tm-setting-description">Πρόγνωση στο κέντρο του footer.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-weather-widget-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-phone-catalog-enabled">Κατάλογος συσκευών</label>
                                ${info('phone_catalog')}
                            </div>
                            <p class="tm-setting-description">Μεταχειρισμένες συσκευές με αναζήτηση και CSV.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-phone-catalog-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-order-history-enabled">Ιστορικό παραγγελιών</label>
                                ${info('order_history')}
                            </div>
                            <p class="tm-setting-description">Παραγγελίες ανταλλακτικών.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-order-history-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-order-link-enabled">Σύνδεση status 65 → παραγγελίες</label>
                                ${info('order_link')}
                            </div>
                            <p class="tm-setting-description">Κλικ στο badge για αναζήτηση παραγγελιών.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-order-link-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-return-to-40-enabled">Κουμπί «40» (65/100)</label>
                                ${info('return_to_40')}
                            </div>
                            <p class="tm-setting-description">Επιστροφή σε status 40 μέσω admin login.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-return-to-40-enabled"></div>
                    </div>
                </div>
                <div class="tm-settings-section">
                    <header class="tm-settings-section-head">
                        <div class="tm-setting-label-row">
                            <h3>Admin (Status 40)</h3>
                            ${info('status40_admin')}
                        </div>
                        <p class="tm-settings-section-desc">Διαπιστευτήρια για logo → admin login. Αποθηκεύονται τοπικά.</p>
                    </header>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-status40-admin-username">Username</label>
                        </div>
                        <div class="tm-setting-control">
                            <input type="text" id="tm-setting-status40-admin-username" class="tm-settings-input" value="${String(status40AdminUser).replace(/"/g, '&quot;')}" autocomplete="off" spellcheck="false">
                        </div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-status40-admin-password">Κωδικός</label>
                        </div>
                        <div class="tm-setting-control">
                            <input type="password" id="tm-setting-status40-admin-password" class="tm-settings-input" value="${String(status40AdminPass).replace(/"/g, '&quot;')}" autocomplete="new-password">
                        </div>
                    </div>
                </div>`;
        }

        function getAutoRefreshSettingsHTML() {
            const info = tmSettingsInfoBtn;
            return `
                <div class="tm-settings-section">
                    <header class="tm-settings-section-head">
                        <h3>Αυτόματη ανανέωση</h3>
                        <p class="tm-settings-section-desc">Ανανέωση λιστών σε εργάσιμο ωράριο.</p>
                    </header>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-autorefresh-enabled">Ενεργοποίηση</label>
                                ${info('autorefresh')}
                            </div>
                            <p class="tm-setting-description">Ανανεώνει αυτόματα τις σελίδες λίστας.</p>
                        </div>
                        <div class="tm-setting-control">
                            <input type="checkbox" id="tm-setting-autorefresh-enabled" ${config.autoRefreshEnabled ? 'checked' : ''}>
                        </div>
                    </div>
                    <div id="tm-autorefresh-options">
                        <div class="tm-setting-row">
                            <div class="tm-setting-label">
                                <div class="tm-setting-label-row">
                                    <label for="tm-setting-refresh-interval">Διάστημα</label>
                                    ${info('refresh_interval')}
                                </div>
                                <p class="tm-setting-description">Λεπτά μεταξύ ανανεώσεων.</p>
                            </div>
                            <div class="tm-setting-control">
                                <input type="number" id="tm-setting-refresh-interval" value="${config.refreshIntervalMinutes}" min="1" max="120">
                                <span class="tm-settings-unit">λεπτά</span>
                            </div>
                        </div>
                        <div id="tm-working-hours-editor" class="tm-settings-panel">
                            <div class="tm-setting-label-row tm-settings-panel-title-row">
                                <p class="tm-setting-description tm-settings-panel-title">Ενεργό μόνο στις παρακάτω ώρες και ημέρες</p>
                                ${info('working_hours')}
                            </div>
                            <div id="tm-working-hours-time-inputs">
                                <label for="tm-setting-wh-start">Από</label>
                                <input type="number" id="tm-setting-wh-start" value="${config.workingHoursStart}" min="0" max="23">
                                <label for="tm-setting-wh-end">Έως</label>
                                <input type="number" id="tm-setting-wh-end" value="${config.workingHoursEnd}" min="1" max="24">
                            </div>
                            <div id="tm-working-days-editor"></div>
                        </div>
                    </div>
                </div>
            `;
        }

        function getQuickSearchEditorHTML() {
            const info = tmSettingsInfoBtn;
            return `
                <div class="tm-settings-section">
                    <header class="tm-settings-section-head">
                        <div class="tm-setting-label-row">
                            <h3>Γρήγορη αναζήτηση</h3>
                            ${info('quick_search_editor')}
                        </div>
                        <p class="tm-settings-section-desc">Ετικέτα = κουμπί · Όρος = λέξη-κλειδί αναζήτησης.</p>
                    </header>
                    <div id="tm-quick-search-editor" class="tm-settings-editor"></div>
                    <button type="button" id="tm-quick-search-add-btn" class="tm-settings-ghost-btn">Προσθήκη κουμπιού</button>
                </div>
            `;
        }

        function getPriceOptionsEditorHTML() {
            const info = tmSettingsInfoBtn;
            return `
                <div class="tm-settings-section">
                    <header class="tm-settings-section-head">
                        <div class="tm-setting-label-row">
                            <h3>Επιλογές τιμών</h3>
                            ${info('price_options')}
                        </div>
                        <p class="tm-settings-section-desc">Extra χρεώσεις ή ειδικές τιμές στο dropdown επισκευής.</p>
                    </header>
                    <div id="tm-price-options-editor" class="tm-settings-editor"></div>
                    <button type="button" id="tm-price-options-add-btn" class="tm-settings-ghost-btn">Προσθήκη επιλογής</button>
                </div>
            `;
        }

        function getScratchpadTemplatesEditorHTML() {
            const info = tmSettingsInfoBtn;
            return `
                <div class="tm-settings-section">
                    <header class="tm-settings-section-head">
                        <div class="tm-setting-label-row">
                            <h3>Πρότυπα</h3>
                            ${info('scratchpad_templates')}
                        </div>
                        <p class="tm-settings-section-desc">Γρήγορη εισαγωγή checklists ή επαναλαμβανόμενων σημειώσεων.</p>
                    </header>
                    <div id="tm-scratchpad-templates-editor" class="tm-settings-editor"></div>
                    <button type="button" id="tm-scratchpad-template-add-btn" class="tm-settings-ghost-btn">Προσθήκη προτύπου</button>
                </div>
            `;
        }

        function getScratchpadSettingsHTML() {
            const info = tmSettingsInfoBtn;
            return `
                <div class="tm-settings-section">
                    <header class="tm-settings-section-head">
                        <h3>Σημειωματάριο</h3>
                        <p class="tm-settings-section-desc">Γρήγορες σημειώσεις κατά την εργασία.</p>
                    </header>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-scratchpad-enabled">Ενεργοποίηση</label>
                                ${info('scratchpad')}
                            </div>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-scratchpad-enabled"></div>
                    </div>
                </div>
                ${getScratchpadTemplatesEditorHTML()}
            `;
        }

        function getDataManagementHTML() {
            const info = tmSettingsInfoBtn;
            return `
                <div class="tm-settings-section">
                    <header class="tm-settings-section-head">
                        <div class="tm-setting-label-row">
                            <h3>Δεδομένα &amp; backup</h3>
                            ${info('data_backup')}
                        </div>
                        <p class="tm-settings-section-desc">Αντίγραφα ασφαλείας ρυθμίσεων και προόδου.</p>
                    </header>
                    <p class="tm-setting-description tm-settings-profile-line">Ενεργό προφίλ: <strong id="tm-settings-active-profile">—</strong> <span class="tm-settings-muted">(ανά χρήστη σύνδεσης στο ίδιο PC)</span></p>
                    <div class="tm-data-actions">
                        <button type="button" id="tm-export-data-btn" class="tm-data-btn export">Εξαγωγή</button>
                        <button type="button" id="tm-import-data-btn" class="tm-data-btn import">Εισαγωγή</button>
                    </div>
                    <div class="tm-settings-danger-zone">
                        <p class="tm-setting-description">Επαναφορά όλων των ρυθμίσεων και της προόδου. <strong>Δεν αναιρείται.</strong></p>
                        <div class="tm-data-actions"><button type="button" id="tm-settings-reset" class="tm-data-btn reset">Επαναφορά όλων</button></div>
                    </div>
                </div>`;
        }

        function getUpdatesSettingsHTML() {
            const info = tmSettingsInfoBtn;
            const loaderUrl = window.SCRIPT_META?.loaderUrl || 'myman_loader.user.js';
            const displayVer = window.getSuiteDisplayVersion?.() || window.SCRIPT_META?.displayVersion || '—';
            return `
                <div class="tm-settings-section">
                    <header class="tm-settings-section-head">
                        <h3>Ενημερώσεις</h3>
                        <p class="tm-settings-section-desc">Μικρές αλλαγές φορτώνονται αυτόματα. Ειδοποίηση μόνο για νέο loader.</p>
                    </header>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label for="tm-setting-auto-update-check-enabled">Αυτόματος έλεγχος</label>
                                ${info('auto_update')}
                            </div>
                            <p class="tm-setting-description">Κάθε 5 λεπτά · εικονίδιο ↻ στο footer αν χρειάζεται.</p>
                        </div>
                        <div class="tm-setting-control">
                            <input type="checkbox" id="tm-setting-auto-update-check-enabled">
                        </div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label>Έκδοση</label>
                                ${info('updates_version')}
                            </div>
                            <p class="tm-setting-description"><strong id="tm-settings-current-version">Custom Ver. ${displayVer}</strong></p>
                            <p class="tm-setting-description" id="tm-settings-update-status">—</p>
                            <p class="tm-setting-description" id="tm-settings-skipped-version" style="display: none;"></p>
                        </div>
                        <div class="tm-setting-control tm-setting-control--stack">
                            <button id="tm-settings-check-update-btn" class="tm-data-btn export" type="button">Έλεγχος τώρα</button>
                            <button id="tm-settings-clear-skip-update-btn" class="tm-data-btn import" type="button" style="display: none;">Ξεχάστε παράλειψη</button>
                        </div>
                    </div>
                    <div class="tm-setting-row tm-setting-row--divider">
                        <div class="tm-setting-label">
                            <div class="tm-setting-label-row">
                                <label>Loader</label>
                                ${info('updates_loader')}
                            </div>
                            <p class="tm-setting-description">Εγκατάσταση μία φορά από GitHub. Μόνο αλλαγές loader χρειάζονται update από το Tampermonkey.</p>
                            <p class="tm-setting-description tm-settings-code-line"><code>${loaderUrl}</code></p>
                        </div>
                    </div>
                </div>`;
        }

        function refreshUpdatesSettingsUI(result) {
            const versionEl = document.getElementById('tm-settings-current-version');
            const statusEl = document.getElementById('tm-settings-update-status');
            const skippedEl = document.getElementById('tm-settings-skipped-version');
            const clearSkipBtn = document.getElementById('tm-settings-clear-skip-update-btn');
            const displayVer = result?.displayVersion
                || window.getSuiteDisplayVersion?.()
                || window.SCRIPT_META?.displayVersion
                || '—';

            if (versionEl) {
                versionEl.textContent = `Custom Ver. ${displayVer}`;
            }
            if (statusEl && result) {
                statusEl.innerHTML = typeof window.formatUpdateStatusMessage === 'function'
                    ? window.formatUpdateStatusMessage(result)
                    : '—';
            }
            const skipped = typeof window.getSkippedUpdateVersion === 'function'
                ? window.getSkippedUpdateVersion()
                : '';
            if (skippedEl && clearSkipBtn) {
                if (skipped) {
                    skippedEl.style.display = 'block';
                    skippedEl.textContent = `Παραλείφθηκε η ειδοποίηση για loader v${skipped}.`;
                    clearSkipBtn.style.display = 'inline-block';
                } else {
                    skippedEl.style.display = 'none';
                    skippedEl.textContent = '';
                    clearSkipBtn.style.display = 'none';
                }
            }
        }

        function initUpdatesSettingsPage() {
            const checkBtn = document.getElementById('tm-settings-check-update-btn');
            const clearSkipBtn = document.getElementById('tm-settings-clear-skip-update-btn');
            const autoCheck = document.getElementById('tm-setting-auto-update-check-enabled');
            const statusEl = document.getElementById('tm-settings-update-status');

            if (autoCheck) {
                autoCheck.checked = GM_getValue('autoUpdateCheckEnabled', true) !== false;
            }

            refreshUpdatesSettingsUI(window.getLastScriptUpdateResult?.() || null);
            if (statusEl && !window.getLastScriptUpdateResult?.()) {
                statusEl.textContent = 'Πατήστε «Έλεγχος τώρα» ή περιμένετε τον αυτόματο έλεγχο (κάθε 5 λεπτά).';
            }

            checkBtn?.addEventListener('click', () => {
                if (typeof window.runScriptUpdateCheck !== 'function') {
                    if (statusEl) statusEl.textContent = '❌ Η λειτουργία ελέγχου ενημερώσεων δεν είναι διαθέσιμη.';
                    return;
                }
                checkBtn.disabled = true;
                if (statusEl) statusEl.textContent = '⏳ Έλεγχος για νέα έκδοση...';

                window.runScriptUpdateCheck({ silent: false }).then((result) => {
                    checkBtn.disabled = false;
                    refreshUpdatesSettingsUI(result);
                });
            });

            clearSkipBtn?.addEventListener('click', () => {
                if (typeof window.clearSkippedUpdateVersion === 'function') {
                    window.clearSkippedUpdateVersion();
                }
                refreshUpdatesSettingsUI(window.getLastScriptUpdateResult?.() || null);
                if (typeof showPositiveMessage === 'function') {
                    showPositiveMessage('Η παράλειψη έκδοσης ακυρώθηκε.');
                }
            });

            window.addEventListener('mms-update-check', (e) => {
                if (document.getElementById('sec-updates')?.classList.contains('active')) {
                    refreshUpdatesSettingsUI(e.detail);
                }
            });
        }

        function initDataManagementControls() {
            const profileEl = document.getElementById('tm-settings-active-profile');
            if (profileEl) {
                const label = window.MMS_PROFILES?.getActiveProfileLabel?.()
                    || window.tmCurrentUser
                    || '—';
                profileEl.textContent = label;
            }
        }

        function handleExportData() {
            try {
                let backupData = window.MMS_PROFILES?.exportCurrentProfileData
                    ? window.MMS_PROFILES.exportCurrentProfileData()
                    : null;

                if (!backupData) {
                    backupData = {};
                    const keysToBackup = [
                        ...Object.keys(window.DEFAULTS || {}).filter((k) => k !== 'defaultThemeColors'),
                        ...Object.values(STORAGE_KEYS)
                    ];
                    keysToBackup.forEach((key) => {
                        const value = GM_getValue(key, undefined);
                        if (value !== undefined) {
                            backupData[key] = window.MMS_PROFILES?.exportStorageValue
                                ? window.MMS_PROFILES.exportStorageValue(value)
                                : value;
                        }
                    });
                    backupData._mms_export = {
                        version: 1,
                        profileId: window.MMS_PROFILES?.getActiveProfileId?.() || null,
                        profileLabel: window.MMS_PROFILES?.getActiveProfileLabel?.() || null,
                        exportedAt: new Date().toISOString()
                    };
                }

                const jsonString = window.MMS_PROFILES?.safeBackupStringify
                    ? window.MMS_PROFILES.safeBackupStringify(backupData)
                    : JSON.stringify(backupData, null, 2);

                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                const today = new Date().toISOString().slice(0, 10);
                const profileSlug = window.MMS_PROFILES?.getActiveProfileId?.() || 'user';
                a.download = `MyManagerSuite_${profileSlug}_${today}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                if (typeof window.showPositiveMessage === 'function') {
                    window.showPositiveMessage('Τα δεδομένα εξήχθησαν με επιτυχία!');
                }
            } catch (error) {
                console.error('[MMS] Export failed:', error);
                alert(`Σφάλμα κατά την εξαγωγή δεδομένων: ${error.message}`);
            }
        }

        function handleImportData() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';

            input.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = readerEvent => {
                    try {
                        let raw = readerEvent.target.result;
                        if (typeof raw !== 'string') {
                            throw new Error('Το αρχείο δεν είναι έγκυρο κείμενο JSON.');
                        }
                        raw = raw.replace(/^\uFEFF/, '').trim();
                        const importedData = JSON.parse(raw);

                        if (!importedData || typeof importedData !== 'object' || Array.isArray(importedData)) {
                            throw new Error('Μη έγκυρη μορφή αρχείου backup.');
                        }

                        if (!window.MMS_PROFILES?.importProfileData) {
                            throw new Error('Το σύστημα προφίλ δεν είναι διαθέσιμο. Κάντε επαναφόρτωση της σελίδας.');
                        }

                        if (!confirm('Είστε σίγουροι ότι θέλετε να εισάγετε αυτά τα δεδομένα; Όλη η τρέχουσα πρόοδος και οι ρυθμίσεις του ενεργού προφίλ θα αντικατασταθούν.')) {
                            return;
                        }

                        window.MMS_PROFILES.importProfileData(importedData);

                        alert('Τα δεδομένα εισήχθησαν με επιτυχία! Η σελίδα θα ανανεωθεί για να εφαρμοστούν οι αλλαγές.');
                        window.location.reload();

                    } catch (error) {
                        alert(`Σφάλμα κατά την εισαγωγή δεδομένων: ${error.message}`);
                        console.error('[MMS] Import failed:', error);
                    }
                };

                reader.readAsText(file);
            };

            input.click();
        }

        function createSettingsModal() {
            const overlay = document.createElement('div');
            overlay.className = 'tm-modal-overlay';
            overlay.innerHTML = `
                <div class="tm-modal-content tm-settings-modal">
                    <div class="tm-modal-header tm-settings-header">
                        <div class="tm-settings-header-text">
                            <h2 class="tm-modal-title">Ρυθμίσεις</h2>
                            <p class="tm-settings-subtitle">MyManager Suite</p>
                        </div>
                        <button type="button" class="tm-modal-close" aria-label="Κλείσιμο">&times;</button>
                    </div>
                    <div class="tm-settings-layout">
                        <aside class="tm-settings-sidebar">
                            <ul class="tm-nav">
                                <li><a href="#sec-general"><span class="tm-nav-icon" aria-hidden="true">⚙️</span><span class="tm-nav-label">Γενικές</span></a></li>
                                <li><a href="#sec-search"><span class="tm-nav-icon" aria-hidden="true">🔍</span><span class="tm-nav-label">Εργαλεία</span></a></li>
                                <li><a href="#sec-autorefresh"><span class="tm-nav-icon" aria-hidden="true">🔄</span><span class="tm-nav-label">Ανανέωση</span></a></li>
                                <li><a href="#sec-scratchpad"><span class="tm-nav-icon" aria-hidden="true">📝</span><span class="tm-nav-label">Σημειωματάριο</span></a></li>
                                <li><a href="#sec-gamification"><span class="tm-nav-icon" aria-hidden="true">🎮</span><span class="tm-nav-label">Παιχνίδι</span></a></li>
                                <li><a href="#sec-updates"><span class="tm-nav-icon" aria-hidden="true">↻</span><span class="tm-nav-label">Ενημερώσεις</span></a></li>
                                <li><a href="#sec-data"><span class="tm-nav-icon" aria-hidden="true">💾</span><span class="tm-nav-label">Δεδομένα</span></a></li>
                                <li class="tm-nav-debug" style="display: none;" data-debug-only="true"><a href="#sec-debug"><span class="tm-nav-icon" aria-hidden="true">🔧</span><span class="tm-nav-label">Ανάπτυξη</span></a></li>
                            </ul>
                        </aside>
                        <main class="tm-settings-main" id="tm-settings-content">
                            <section id="sec-general">${getGeneralUISettingsHTML()}</section>
                            <section id="sec-search">${getSearchSettingsHTML()}${getQuickSearchEditorHTML()}${getPriceOptionsEditorHTML()}</section>
                            <section id="sec-autorefresh">${getAutoRefreshSettingsHTML()}</section>
                            <section id="sec-scratchpad">${getScratchpadSettingsHTML()}</section>
                            <section id="sec-gamification">${window.getGamificationSettingsHTML(STORAGE_KEYS)}</section>
                            <section id="sec-debug">${getDebugSettingsHTML()}</section>
                            <section id="sec-updates">${getUpdatesSettingsHTML()}</section>
                            <section id="sec-data">${getDataManagementHTML()}</section>
                        </main>
                    </div>
                    <div class="tm-modal-footer tm-settings-footer">
                        <span id="tm-settings-feedback"></span>
                        <button type="button" id="tm-settings-save" class="tm-settings-save-btn">Αποθήκευση &amp; Επαναφόρτωση</button>
                    </div>
                    <aside id="tm-settings-help-panel" class="tm-settings-help-panel" hidden aria-hidden="true" role="dialog" aria-labelledby="tm-settings-help-title">
                        <div class="tm-settings-help-header">
                            <h3 id="tm-settings-help-title" data-help-title>Πληροφορίες</h3>
                            <button type="button" class="tm-settings-help-close" aria-label="Κλείσιμο πληροφοριών">&times;</button>
                        </div>
                        <div class="tm-settings-help-body">
                            <section class="tm-settings-help-block">
                                <h4>Τι κάνει</h4>
                                <p data-help-what></p>
                            </section>
                            <section class="tm-settings-help-block">
                                <h4>Πού εμφανίζεται</h4>
                                <p data-help-where></p>
                            </section>
                            <section class="tm-settings-help-block">
                                <h4>Πότε χρησιμοποιείται</h4>
                                <p data-help-when></p>
                            </section>
                        </div>
                    </aside>
                </div>
            `;
            document.body.appendChild(overlay);

            // Event Listeners
            const modalRoot = overlay.querySelector('.tm-settings-modal');
            overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
            overlay.querySelector('#tm-settings-save').addEventListener('click', saveSettings);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
            overlay.querySelector('.tm-settings-help-close')?.addEventListener('click', () => closeSettingsHelpPanel(modalRoot));
            overlay.addEventListener('click', (e) => {
                const btn = e.target.closest?.('.tm-setting-info-btn');
                if (!btn) return;
                e.preventDefault();
                e.stopPropagation();
                openSettingsHelpPanel(modalRoot, btn.getAttribute('data-tm-help'));
            });
            document.addEventListener('keydown', function onHelpEsc(ev) {
                if (ev.key !== 'Escape') return;
                if (!modalRoot.isConnected) {
                    document.removeEventListener('keydown', onHelpEsc);
                    return;
                }
                if (!modalRoot.classList.contains('tm-settings-help-open')) return;
                closeSettingsHelpPanel(modalRoot);
                ev.stopPropagation();
            });
            try {
                const links = overlay.querySelectorAll('.tm-settings-sidebar .tm-nav a');
                const sections = overlay.querySelectorAll('.tm-settings-main section');
                const debugTab = overlay.querySelector('[data-debug-only="true"]');

                function activate(id) {
                    sections.forEach(sec => sec.classList.toggle('active', '#' + sec.id === id));
                    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
                }
                links.forEach(a => {
                    a.addEventListener('click', (ev) => {
                        ev.preventDefault();
                        const id = a.getAttribute('href');
                        activate(id);
                    });
                });
                // Special handling for debug tab
                if (debugTab) {
                    debugTab.style.display = config.debugEnabled ? 'block' : 'none';
                }
                // default active first
                if (links.length) activate(links[0].getAttribute('href'));
            } catch(_) {}

            // Talent unlock logic - Attach listener to the main content area for delegation
            const settingsContent = overlay.querySelector('#tm-settings-content');
            if (settingsContent) {
                settingsContent.addEventListener('click', (e) => handleTalentUnlock(e, STORAGE_KEYS));
                initDebugControls(config); // Initialize debug button listeners
            }

            // Attach listeners for Data Management buttons now that they exist in the DOM
            overlay.querySelector('#tm-settings-reset')?.addEventListener('click', resetSettings);
            overlay.querySelector('#tm-export-data-btn')?.addEventListener('click', handleExportData);
            overlay.querySelector('#tm-import-data-btn')?.addEventListener('click', handleImportData);
            initUpdatesSettingsPage();
            initDataManagementControls();

            // --- Populate Checkboxes ---
            const populateCheckbox = (id, key) => {
                const checkbox = document.getElementById(id);
                if (checkbox) checkbox.checked = config[key];
            };
            populateCheckbox('tm-setting-script-enabled', 'scriptEnabled');
            populateCheckbox('tm-setting-debug-enabled', 'debugEnabled');
            
            // Add passcode protection for debug mode
            const debugCheckbox = document.getElementById('tm-setting-debug-enabled');
            if (debugCheckbox) {
                debugCheckbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        // Trying to enable debug mode - require passcode
                        const passcode = prompt('🔐 Enter Debug Mode Passcode:');
                        const correctPasscode = '1337'; // You can change this
                        
                        if (passcode !== correctPasscode) {
                            e.target.checked = false;
                            if (window.showPositiveMessage) {
                                window.showPositiveMessage('❌ Incorrect passcode!');
                            } else {
                                alert('❌ Incorrect passcode!');
                            }
                            return;
                        } else {
                            if (window.showPositiveMessage) {
                                window.showPositiveMessage('✓ Debug mode unlocked!');
                            }
                        }
                    }
                    // Save the value
                    GM_setValue('debugEnabled', e.target.checked);
                    config.debugEnabled = e.target.checked;
                });
            }
            
            populateCheckbox('tm-setting-dashboard-enabled', 'dashboardWidgetEnabled');
            populateCheckbox('tm-setting-scroll-top-enabled', 'scrollToTopEnabled');
            populateCheckbox('tm-setting-hidden-menu-enabled', 'hiddenMenuItemsEnabled');
            populateCheckbox('tm-setting-notifications-enabled', 'notificationsEnabled');
            overlay.querySelector('#tm-manage-hidden-menu-btn')?.addEventListener('click', () => {
                if (typeof window.showHiddenMenuItemsModal === 'function') {
                    window.showHiddenMenuItemsModal(STORAGE_KEYS);
                }
            });
            populateCheckbox('tm-setting-tech-stats-enabled', 'technicianStatsEnabled');
            populateCheckbox('tm-setting-search-enabled', 'searchFeatureEnabled');
            populateCheckbox('tm-setting-quick-search-enabled', 'quickSearchEnabled');
            populateCheckbox('tm-setting-scratchpad-enabled', 'scratchpadEnabled');
            populateCheckbox('tm-setting-recent-repairs-enabled', 'recentRepairsEnabled');
            populateCheckbox('tm-setting-repair-list-quickview-enabled', 'repairListQuickViewEnabled');
            populateCheckbox('tm-setting-weather-widget-enabled', 'weatherWidgetEnabled');
            populateCheckbox('tm-setting-footer-quick-search-enabled', 'footerQuickSearchEnabled');
            populateCheckbox('tm-setting-phone-catalog-enabled', 'phoneCatalogEnabled');
            populateCheckbox('tm-setting-order-history-enabled', 'orderHistoryEnabled');
            populateCheckbox('tm-setting-order-link-enabled', 'orderLinkEnabled');
            populateCheckbox('tm-setting-return-to-40-enabled', 'returnTo40ButtonEnabled');
            populateCheckbox('tm-setting-levelup-enabled', 'levelUpSystemEnabled');
            populateCheckbox('tm-setting-mascot-enabled', 'interactiveMascotEnabled');
            populateCheckbox('tm-setting-confetti-enabled', 'confettiEnabled');
            populateCheckbox('tm-setting-achievements-enabled', 'achievementsEnabled');
            populateCheckbox('tm-setting-customer-history-enabled', 'customerHistoryEnabled');
            
            // Populate new feature checkboxes
            populateCheckbox('tm-setting-random-events-enabled', 'randomEventsEnabled');
            populateCheckbox('tm-setting-smart-templates-enabled', 'smartTemplatesEnabled');
            populateCheckbox('tm-setting-personal-dashboard-enabled', 'personalDashboardEnabled');
            
            document.getElementById('tm-setting-search-history-max').value = config.searchMaxHistory;
            document.getElementById('tm-setting-recent-repairs-max').value = config.recentRepairsMaxItems || 5;
            window.initGamificationSettings(config, STORAGE_KEYS);
            
            // Add event listener to recent repairs checkbox to update UI immediately
            const notificationsCheckbox = document.getElementById('tm-setting-notifications-enabled');
            if (notificationsCheckbox) {
                notificationsCheckbox.addEventListener('change', () => {
                    const value = notificationsCheckbox.checked;
                    GM_setValue('notificationsEnabled', value);
                    config.notificationsEnabled = value;
                    if (typeof window.updateNotificationUIVisibility === 'function') {
                        window.updateNotificationUIVisibility(config);
                    }
                });
            }

            const quickViewCheckbox = document.getElementById('tm-setting-repair-list-quickview-enabled');
            if (quickViewCheckbox) {
                quickViewCheckbox.addEventListener('change', () => {
                    const value = quickViewCheckbox.checked;
                    GM_setValue('repairListQuickViewEnabled', value);
                    config.repairListQuickViewEnabled = value;
                    if (typeof window.updateRepairListQuickViewVisibility === 'function') {
                        window.updateRepairListQuickViewVisibility(config);
                    }
                });
            }

            const recentRepairsCheckbox = document.getElementById('tm-setting-recent-repairs-enabled');
            if (recentRepairsCheckbox) {
                recentRepairsCheckbox.addEventListener('change', () => {
                    // Save immediately
                    const value = recentRepairsCheckbox.checked;
                    GM_setValue('recentRepairsEnabled', value);
                    config.recentRepairsEnabled = value;
                    
                    // Update recent repairs button visibility
                    if (typeof window.updateRecentRepairsButtonVisibility === 'function') {
                        window.updateRecentRepairsButtonVisibility(config);
                    }
                });
            }
            
            // Add event listener to weather widget checkbox to update UI immediately
            const weatherWidgetCheckbox = document.getElementById('tm-setting-weather-widget-enabled');
            if (weatherWidgetCheckbox) {
                weatherWidgetCheckbox.addEventListener('change', () => {
                    const value = weatherWidgetCheckbox.checked;
                    GM_setValue('weatherWidgetEnabled', value);
                    config.weatherWidgetEnabled = value;

                    if (typeof window.updateWeatherWidgetVisibility === 'function') {
                        window.updateWeatherWidgetVisibility(config);
                    }
                });
            }

            const footerQuickSearchCheckbox = document.getElementById('tm-setting-footer-quick-search-enabled');
            if (footerQuickSearchCheckbox) {
                footerQuickSearchCheckbox.addEventListener('change', () => {
                    const value = footerQuickSearchCheckbox.checked;
                    GM_setValue('footerQuickSearchEnabled', value);
                    config.footerQuickSearchEnabled = value;

                    const mountTarget = document.getElementById('tm-repair-edit-quick-search-host')
                        || document.getElementById('tm-header-quick-search-host')
                        || document.querySelector('.rnr-hfiller');
                    if (value && !document.getElementById('tm-footer-quick-search')
                        && typeof window.initFooterQuickSearch === 'function') {
                        window.initFooterQuickSearch(config);
                    } else if (typeof window.updateFooterQuickSearchVisibility === 'function') {
                        window.updateFooterQuickSearchVisibility(config);
                    }
                });
            }
            
            const phoneCatalogCheckbox = document.getElementById('tm-setting-phone-catalog-enabled');
            if (phoneCatalogCheckbox) {
                phoneCatalogCheckbox.addEventListener('change', () => {
                    // Save immediately
                    const value = phoneCatalogCheckbox.checked;
                    GM_setValue('phoneCatalogEnabled', value);
                    config.phoneCatalogEnabled = value;
                    
                    // Update phone catalog button visibility
                    if (typeof window.updatePhoneCatalogButtonVisibility === 'function') {
                        window.updatePhoneCatalogButtonVisibility(config);
                    }
                });
            }

            const searchFeatureCheckbox = document.getElementById('tm-setting-search-enabled');
            if (searchFeatureCheckbox) {
                searchFeatureCheckbox.addEventListener('change', () => {
                    const value = searchFeatureCheckbox.checked;
                    GM_setValue('searchFeatureEnabled', value);
                    config.searchFeatureEnabled = value;

                    if (typeof window.updateSearchMenuItemVisibility === 'function') {
                        window.updateSearchMenuItemVisibility(config);
                    }
                });
            }
            
            const orderHistoryCheckbox = document.getElementById('tm-setting-order-history-enabled');
            if (orderHistoryCheckbox) {
                orderHistoryCheckbox.addEventListener('change', () => {
                    // Save immediately
                    const value = orderHistoryCheckbox.checked;
                    GM_setValue('orderHistoryEnabled', value);
                    config.orderHistoryEnabled = value;
                    
                    // Update order history button visibility
                    if (typeof window.updateOrderHistoryButtonVisibility === 'function') {
                        window.updateOrderHistoryButtonVisibility(config);
                    }
                });
            }

            // Logic for the new checkbox
            const checkbox = overlay.querySelector('#tm-setting-autorefresh-enabled');
            const optionsDiv = overlay.querySelector('#tm-autorefresh-options');

            checkbox.checked = config.autoRefreshEnabled;
            optionsDiv.style.display = config.autoRefreshEnabled ? 'block' : 'none';

            checkbox.addEventListener('change', () => {
                optionsDiv.style.display = checkbox.checked ? 'block' : 'none';
            });

            // --- Populate Working Hours Editor ---
            const whDaysEditor = overlay.querySelector('#tm-working-days-editor');
            const daysOfWeek = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
            daysOfWeek.forEach((day, index) => {
                const isChecked = config.workingDays.includes(index);
                whDaysEditor.innerHTML += `
                    <span>
                        <input type="checkbox" class="tm-working-day-checkbox" id="day-${index}" value="${index}" ${isChecked ? 'checked' : ''}>
                        <label for="day-${index}" style="display: inline; font-weight: normal;">${day}</label>
                    </span>
                `;
            });

            // --- Populate and manage Quick Search Editor ---
            const editorContainer = overlay.querySelector('#tm-quick-search-editor');

            function renderQuickSearchRows() {
                editorContainer.innerHTML = ''; // Clear existing rows
                config.quickSearchButtons.forEach((button) => {
                    addNewQuickSearchRow(button.label, button.term);
                });
            }

            function addNewQuickSearchRow(label = '', term = '') {
                const row = document.createElement('div');
                row.className = 'tm-quick-search-row';
                row.innerHTML = `
                    <input type="text" placeholder="Ετικέτα (π.χ., Οθόνη)" data-type="label" value="${label}">
                    <input type="text" placeholder="Όρος Αναζήτησης (π.χ., LCD)" data-type="term" value="${term}">
                    <button class="tm-quick-search-remove-btn" title="Αφαίρεση Κουμπιού">&times;</button>
                `;
                editorContainer.appendChild(row);
                row.querySelector('.tm-quick-search-remove-btn').addEventListener('click', (e) => {
                    e.target.closest('.tm-quick-search-row').remove();
                });
            }

            // --- Populate and manage Scratchpad Templates Editor ---
            const templatesEditorContainer = overlay.querySelector('#tm-scratchpad-templates-editor');
            const savedTemplates = JSON.parse(GM_getValue(STORAGE_KEYS.SCRATCHPAD_TEMPLATES, '[]'));

            function renderScratchpadTemplateRows() {
                templatesEditorContainer.innerHTML = ''; // Clear existing rows
                savedTemplates.forEach(template => {
                    addNewScratchpadTemplateRow(template);
                });
            }

            function addNewScratchpadTemplateRow(template = { id: '', title: '', content: '' }) {
                const row = document.createElement('div');
                row.className = 'tm-template-row';
                row.dataset.id = template.id;
                row.style.marginBottom = '15px';
                row.innerHTML = `
                    <input type="text" placeholder="Τίτλος Προτύπου" data-type="title" value="${template.title}" style="width: 100%; padding: 8px; box-sizing: border-box; margin-bottom: 5px;">
                    <textarea placeholder="Περιεχόμενο Προτύπου..." data-type="content" style="width: 100%; min-height: 80px; padding: 8px; box-sizing: border-box; font-family: monospace;">${template.content}</textarea>
                    <button class="tm-template-remove-btn" title="Αφαίρεση Προτύπου" style="background: var(--tm-danger-color); color: white; border: none; border-radius: 4px; cursor: pointer; float: right; margin-top: 5px;">&times;</button>
                `;
                templatesEditorContainer.appendChild(row);
                row.querySelector('.tm-template-remove-btn').addEventListener('click', (e) => {
                    e.target.closest('.tm-template-row').remove();
                });
            }

            overlay.querySelector('#tm-scratchpad-template-add-btn').addEventListener('click', (e) => {
                e.preventDefault();
                addNewScratchpadTemplateRow();
            });

            // Attach listener for the Quick Search "Add" button now that it's in the DOM
            overlay.querySelector('#tm-quick-search-add-btn')?.addEventListener('click', (e) => {
                e.preventDefault();
                addNewQuickSearchRow();
            });

            // --- Populate and manage Price Options Editor ---
            const priceOptionsContainer = overlay.querySelector('#tm-price-options-editor');

            function renderPriceOptionsRows() {
                priceOptionsContainer.innerHTML = ''; // Clear existing rows
                const priceOptions = config.priceOptions || [];
                priceOptions.forEach((option) => {
                    addNewPriceOptionRow(option.label, option.value, option.action, option.condition);
                });
            }

            function addNewPriceOptionRow(label = '', value = '', action = 'add', condition = 'default') {
                const row = document.createElement('div');
                row.className = 'tm-price-option-row';
                row.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center;';
                row.innerHTML = `
                    <input type="text" placeholder="Ετικέτα (π.χ., Καθαρισμός)" data-type="label" value="${label}" style="flex: 2; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    <input type="number" placeholder="Τιμή" data-type="value" value="${value}" step="0.01" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    <select data-type="action" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        <option value="add" ${action === 'add' ? 'selected' : ''}>Πρόσθεση</option>
                        <option value="replace" ${action === 'replace' ? 'selected' : ''}>Αντικατάσταση</option>
                    </select>
                    <select data-type="condition" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        <option value="default" ${condition === 'default' ? 'selected' : ''}>Πάντα</option>
                        <option value="ps5" ${condition === 'ps5' ? 'selected' : ''}>Μόνο PS5</option>
                    </select>
                    <button class="tm-price-option-remove-btn" title="Αφαίρεση" style="background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">&times;</button>
                `;
                priceOptionsContainer.appendChild(row);
                row.querySelector('.tm-price-option-remove-btn').addEventListener('click', (e) => {
                    e.target.closest('.tm-price-option-row').remove();
                });
            }

            // Attach listener for the Price Options "Add" button
            overlay.querySelector('#tm-price-options-add-btn')?.addEventListener('click', (e) => {
                e.preventDefault();
                addNewPriceOptionRow();
            });

            renderScratchpadTemplateRows();
            renderQuickSearchRows(); // Initial render
            renderPriceOptionsRows(); // Initial render for price options

        }

        function initDebugControls(config) {
            if (!config.debugEnabled) return;

            document.getElementById('tm-debug-set-level-btn')?.addEventListener('click', () => {
                const newLevel = parseInt(document.getElementById('tm-debug-level-input').value, 10);
                if (newLevel > 0) {
                    GM_setValue(STORAGE_KEYS.USER_LEVEL, newLevel);
                    GM_setValue(STORAGE_KEYS.USER_XP, 0);
                    
                    // Update the title based on the new level
                    const newRank = window.RANKS.slice().reverse().find(r => newLevel >= r.level) || window.RANKS[0];
                    GM_setValue(STORAGE_KEYS.USER_TITLE, newRank.title);
                    
                    // Update mascot appearance
                    if (typeof updateMascotAppearanceByLevel === 'function') {
                        updateMascotAppearanceByLevel(newLevel);
                    }
                    
                    // Update UI
                    window.updateXpBarUI(STORAGE_KEYS, newLevel, 0, window.getXpForLevel(newLevel));
                    showPositiveMessage(`Level set to ${newLevel}. Title: ${newRank.title}`);
                }
            });
            document.getElementById('tm-debug-add-xp-btn')?.addEventListener('click', () => {
                const xpToAdd = parseInt(document.getElementById('tm-debug-xp-input').value, 10); if (xpToAdd) window.grantXp(config, STORAGE_KEYS, xpToAdd);
            });
            document.getElementById('tm-debug-add-coins-btn')?.addEventListener('click', () => {
                const coinsToAdd = parseInt(document.getElementById('tm-debug-coins-input').value, 10); if (coinsToAdd) window.grantCoins(config, STORAGE_KEYS, coinsToAdd);
            });
            
            // Trigger Random Event button
            document.getElementById('tm-debug-trigger-event-btn')?.addEventListener('click', () => {
                if (typeof window.forceRandomEvent === 'function') {
                    window.forceRandomEvent(config, STORAGE_KEYS);
                    showPositiveMessage('🎲 Random event triggered!');
                } else {
                    showPositiveMessage('❌ Random events not available');
                }
            });
            
            // Stop Random Event button
            document.getElementById('tm-debug-stop-event-btn')?.addEventListener('click', () => {
                if (typeof window.stopRandomEvent === 'function') {
                    window.stopRandomEvent(STORAGE_KEYS);
                    showPositiveMessage('🛑 Random event stopped!');
                } else {
                    showPositiveMessage('❌ Random events not available');
                }
            });
            
            // Mascot Evolution Controls
            document.getElementById('tm-debug-hatch-egg-btn')?.addEventListener('click', () => {
                const tamaData = JSON.parse(GM_getValue(STORAGE_KEYS.TAMAGOTCHI_DATA, 'null'));
                if (tamaData) {
                    // Randomly select a character
                    const characterTypes = ['dragon', 'robot', 'slime', 'plant', 'ghost', 'cat', 'phoenix', 'crystal'];
                    const selectedCharacter = characterTypes[Math.floor(Math.random() * characterTypes.length)];
                    
                    tamaData.age = 0;
                    tamaData.lifeMinutes = 1; // baby hatch threshold (1 office-min)
                    tamaData.stage = 'baby';
                    tamaData.characterType = selectedCharacter;
                    tamaData.lastUpdate = Date.now();
                    GM_setValue(STORAGE_KEYS.TAMAGOTCHI_DATA, JSON.stringify(tamaData));
                    
                    // Show EPIC reveal!
                    if (typeof window.showEpicCharacterReveal === 'function') {
                        window.showEpicCharacterReveal(selectedCharacter);
                    }
                    
                    // Update appearance
                    setTimeout(() => {
                        if (typeof window.updateMascotAppearanceByStage === 'function') {
                            window.updateMascotAppearanceByStage('baby');
                        }
                    }, 4000); // After reveal animation
                    
                    showPositiveMessage('🎉 Hatching with EPIC reveal!');
                } else {
                    showPositiveMessage('❌ Mascot data not found. Enable mascot first.');
                }
            });
            
            document.getElementById('tm-debug-reset-egg-btn')?.addEventListener('click', () => {
                const tamaData = JSON.parse(GM_getValue(STORAGE_KEYS.TAMAGOTCHI_DATA, 'null'));
                if (tamaData) {
                    tamaData.age = 0;
                    tamaData.lifeMinutes = 0;
                    tamaData.eggGeneration = (Number(tamaData.eggGeneration) || 0) + 1;
                    tamaData.stage = 'egg';
                    tamaData.characterType = 'none';
                    tamaData.lastUpdate = Date.now();
                    GM_setValue(STORAGE_KEYS.TAMAGOTCHI_DATA, JSON.stringify(tamaData));
                    
                    if (typeof window.updateMascotAppearanceByStage === 'function') {
                        window.updateMascotAppearanceByStage('egg');
                    }
                    
                    showPositiveMessage('🥚 Reset to egg! Hatch again to get random character.');
                } else {
                    showPositiveMessage('❌ Mascot data not found. Enable mascot first.');
                }
            });
            
            document.getElementById('tm-debug-age-up-btn')?.addEventListener('click', () => {
                const tamaData = JSON.parse(GM_getValue(STORAGE_KEYS.TAMAGOTCHI_DATA, 'null'));
                if (tamaData) {
                    const minutesPerYear = 450;
                    const currentLife = Number(tamaData.lifeMinutes);
                    const life = Number.isFinite(currentLife) ? currentLife : 0;
                    tamaData.lifeMinutes = life + (10 * minutesPerYear);
                    tamaData.age = Math.floor(tamaData.lifeMinutes / minutesPerYear);
                    tamaData.lastUpdate = Date.now();
                    GM_setValue(STORAGE_KEYS.TAMAGOTCHI_DATA, JSON.stringify(tamaData));
                    
                    showPositiveMessage(`⏭️ Aged up! Now ${Math.floor(tamaData.age)} years old. Refresh to see changes.`);
                } else {
                    showPositiveMessage('❌ Mascot data not found. Enable mascot first.');
                }
            });
            
            // Mascot appearance tester (delegated — avoids duplicate listeners on each settings open)
            const settingsContent = document.getElementById('tm-settings-content');
            if (settingsContent && !settingsContent.dataset.tmMascotTesterBound) {
                settingsContent.dataset.tmMascotTesterBound = '1';
                settingsContent.addEventListener('click', (e) => {
                    const charBtn = e.target.closest('.tm-mascot-char-btn');
                    if (charBtn?.dataset.character) {
                        const character = charBtn.dataset.character;
                        if (typeof window.debugSetMascotCharacter === 'function') {
                            const ok = window.debugSetMascotCharacter(character, STORAGE_KEYS);
                            if (ok) {
                                settingsContent.querySelectorAll('.tm-mascot-char-btn').forEach((btn) => {
                                    btn.style.outline = btn.dataset.character === character
                                        ? '2px solid var(--tm-primary-color, #4facfe)'
                                        : '';
                                });
                                const meta = window.MASCOT_CHARACTERS?.[character];
                                const label = meta?.nameGr || meta?.name || character;
                                showPositiveMessage(`🎭 Χαρακτήρας: ${label}`);
                            } else {
                                showPositiveMessage('❌ Αποτυχία αλλαγής χαρακτήρα');
                            }
                        } else {
                            showPositiveMessage('❌ Mascot character function not available');
                        }
                        return;
                    }

                    const stageBtn = e.target.closest('.tm-mascot-stage-btn');
                    if (stageBtn?.dataset.stage) {
                        if (typeof window.previewMascotStage === 'function') {
                            window.previewMascotStage(stageBtn.dataset.stage, 5000);
                            showPositiveMessage(`🤖 Προεπισκόπηση σταδίου: ${stageBtn.dataset.stage} (5 δευτ.)`);
                        } else {
                            showPositiveMessage('❌ Mascot stage functions not available');
                        }
                        return;
                    }

                    const stateBtn = e.target.closest('.tm-mascot-state-btn');
                    if (stateBtn?.dataset.state) {
                        if (typeof window.setMascotState === 'function') {
                            window.setMascotState(config, stateBtn.dataset.state, 5000);
                            showPositiveMessage(`🤖 Mascot state: ${stateBtn.dataset.state}`);
                        } else {
                            showPositiveMessage('❌ Mascot functions not available');
                        }
                    }
                });
            }

            // Highlight current character whenever settings open (HTML is rebuilt)
            {
                const currentChar = typeof window.getMascotCharacterType === 'function'
                    ? window.getMascotCharacterType()
                    : null;
                const content = document.getElementById('tm-settings-content');
                content?.querySelectorAll('.tm-mascot-char-btn').forEach((btn) => {
                    btn.style.outline = (currentChar && btn.dataset.character === currentChar)
                        ? '2px solid var(--tm-primary-color, #4facfe)'
                        : '';
                });
            }

            // Mascot Test Bubble
            document.getElementById('tm-mascot-test-bubble')?.addEventListener('click', () => {
                if (typeof window.showMascotBubble === 'function') {
                    const randomMsg = window.mascotMsg?.('testDebug') || 'Δοκιμή!';
                    window.showMascotBubble(randomMsg, 3000);
                    showPositiveMessage('💬 Εμφανίστηκε η φούσκα!');
                } else {
                    showPositiveMessage('❌ Mascot bubble function not available');
                }
            });
            
            // Mascot Test Dodge
            document.getElementById('tm-mascot-test-dodge')?.addEventListener('click', () => {
                if (typeof window.triggerDodgeAnimation === 'function' && typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'dodging', 1000);
                    showPositiveMessage('💨 Dodge animation triggered!');
                } else {
                    showPositiveMessage('❌ Mascot dodge function not available');
                }
            });
            
            // Mascot Test Confetti
            document.getElementById('tm-mascot-test-confetti')?.addEventListener('click', () => {
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(100);
                    showPositiveMessage('🎉 Confetti triggered!');
                } else {
                    showPositiveMessage('❌ Confetti function not available');
                }
            });
            
            // Mascot Reset to Normal
            document.getElementById('tm-mascot-reset')?.addEventListener('click', () => {
                if (typeof window.clearMascotStagePreview === 'function') {
                    window.clearMascotStagePreview(true);
                }
                if (typeof window.setMascotState === 'function' && typeof window.updatePetStateByStats === 'function') {
                    window.updatePetStateByStats(config, STORAGE_KEYS, true);
                    showPositiveMessage('🔄 Mascot reset to normal state!');
                } else {
                    showPositiveMessage('❌ Mascot functions not available');
                }
            });
            
            // Clear Dashboard Stats button
            document.getElementById('tm-debug-clear-dashboard-btn')?.addEventListener('click', () => {
                const confirmation = confirm(
                    '⚠️ WARNING: This will permanently delete:\n\n' +
                    '• All status transfer history\n' +
                    '• All status counters (30, 40, 55, 65, 70, 75, 90, 100, 105)\n' +
                    '• All dashboard statistics\n\n' +
                    'This action CANNOT be undone!\n\n' +
                    'Are you absolutely sure you want to continue?'
                );
                
                if (!confirmation) return;
                
                const doubleConfirmation = confirm(
                    '⚠️ FINAL WARNING!\n\n' +
                    'This will erase ALL your status transfer data and counters.\n\n' +
                    'Click OK to proceed with deletion.'
                );
                
                if (!doubleConfirmation) return;
                
                try {
                    // Clear status transfer history
                    GM_deleteValue(STORAGE_KEYS.STATUS_TRANSFER_HISTORY);
                    console.log('[MMS Debug] Cleared status transfer history');
                    
                    // Clear all status counters
                    const trackedStatuses = ['30', '40', '55', '65', '70', '75', '90', '100', '105'];
                    trackedStatuses.forEach(status => {
                        const statusKey = `tm_status_${status}_transfers`;
                        GM_deleteValue(statusKey);
                        console.log(`[MMS Debug] Cleared status ${status} counter`);
                    });
                    
                    // Clear old counter keys for backward compatibility
                    GM_deleteValue(STORAGE_KEYS.STATUS_40_TRANSFERS);
                    GM_deleteValue(STORAGE_KEYS.STATUS_100_TRANSFERS);
                    console.log('[MMS Debug] Cleared legacy status counters');
                    
                    // Clear daily stats
                    GM_deleteValue(STORAGE_KEYS.DAILY_STATS);
                    console.log('[MMS Debug] Cleared daily stats');
                    
                    showPositiveMessage('✅ All dashboard stats have been cleared!');
                    
                    // Refresh the page after a short delay
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } catch (e) {
                    console.error('[MMS Debug] Error clearing dashboard stats:', e);
                    showPositiveMessage('❌ Error clearing dashboard stats. Check console.');
                }
            });

        }
        function handleTalentUnlock(e, STORAGE_KEYS) {
            if (!e.target.matches('.tm-talent-btn.unlockable')) return;

            const button = e.target;
            const talentId = button.dataset.talentId;
            const talent = window.TALENT_TREE.find(t => t.id === talentId);

            if (talent) {
                let talentPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
                if (talentPoints >= talent.cost) {
                    talentPoints -= talent.cost;
                    GM_setValue(STORAGE_KEYS.USER_TALENT_POINTS, talentPoints);

                    let unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
                    unlockedTalents.push(talentId);
                    GM_setValue(STORAGE_KEYS.UNLOCKED_TALENTS, JSON.stringify(unlockedTalents));

                    // Re-render the talents section
                    document.getElementById('tm-talents-grid').parentElement.innerHTML = window.getTalentsHTML(STORAGE_KEYS);
                }
            }
        }
        function addSettingsButton() {
            // --- Notification Bell (always: repair reminders, scratchpad, achievements, etc.) ---
            const bellWrapper = document.createElement('div');
            bellWrapper.id = 'tm-notification-bell-wrapper';
            bellWrapper.innerHTML = `
                <button id="tm-notification-bell-btn" class="tm-footer-widget tm-footer-icon-btn" type="button" title="Κέντρο ειδοποιήσεων">🔔</button>
                <span id="tm-notification-unread-count">0</span>
            `;
            parentContainer.appendChild(bellWrapper);
            bellWrapper.querySelector('#tm-notification-bell-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                window.toggleNotificationPanel();
            });
            window.updateNotificationBadge();
            if (typeof window.updateNotificationUIVisibility === 'function') {
                window.updateNotificationUIVisibility(config);
            }

            const button = document.createElement('button');
            button.id = 'tm-settings-btn';
            button.type = 'button';
            button.className = 'tm-footer-widget tm-footer-icon-btn';
            button.innerHTML = '⚙️'; // Settings gear icon
            button.title = 'Ρυθμίσεις MyManager Suite';
            button.addEventListener('click', createSettingsModal);
            parentContainer.appendChild(button);

            const coinBalance = document.createElement('div');
            coinBalance.id = 'tm-coin-balance';
            coinBalance.className = 'tm-footer-widget';
            coinBalance.title = 'Fixer-Coins (Click to open Shop)';
            coinBalance.style.cursor = 'pointer';
            coinBalance.style.position = 'relative';
            coinBalance.addEventListener('click', () => {
                if (typeof window.showShopModal === 'function') {
                    window.showShopModal(config, STORAGE_KEYS);
                }
            });
            
            // Create coin history tooltip
            let tooltip = null;
            
            coinBalance.addEventListener('mouseenter', () => {
                if (tooltip) {
                    tooltip.remove();
                }
                
                try {
                    const coinHistory = JSON.parse(GM_getValue(STORAGE_KEYS.COIN_HISTORY, '[]'));
                    
                    tooltip = document.createElement('div');
                    tooltip.id = 'tm-coin-history-tooltip';
                    
                    // Get position of coin balance element
                    const rect = coinBalance.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const viewportWidth = window.innerWidth;
                    
                    // Calculate position - show above the coin balance
                    const tooltipTop = rect.top - 10;
                    const tooltipRight = viewportWidth - rect.right;
                    
                    tooltip.style.cssText = `
                        position: fixed;
                        top: ${tooltipTop}px;
                        right: ${tooltipRight}px;
                        transform: translateY(-100%);
                        background: rgba(20, 20, 20, 0.98);
                        backdrop-filter: blur(10px);
                        -webkit-backdrop-filter: blur(10px);
                        border: 1px solid rgba(0, 255, 255, 0.3);
                        border-radius: 8px;
                        padding: 12px;
                        min-width: 250px;
                        max-width: 350px;
                        max-height: 400px;
                        overflow-y: auto;
                        z-index: 99999;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                        color: #00ffff;
                        font-size: 12px;
                        line-height: 1.6;
                        pointer-events: auto;
                    `;
                    
                    const formatTime = (timestamp) => {
                        const date = new Date(timestamp);
                        const now = new Date();
                        const diff = now - date;
                        const minutes = Math.floor(diff / 60000);
                        const hours = Math.floor(diff / 3600000);
                        const days = Math.floor(diff / 86400000);
                        
                        if (minutes < 1) return 'Just now';
                        if (minutes < 60) return `${minutes}m ago`;
                        if (hours < 24) return `${hours}h ago`;
                        if (days < 7) return `${days}d ago`;
                        return date.toLocaleDateString();
                    };
                    
                    if (coinHistory.length === 0) {
                        tooltip.innerHTML = `
                            <div style="
                                font-weight: bold;
                                margin-bottom: 8px;
                                padding-bottom: 8px;
                                border-bottom: 1px solid rgba(0, 255, 255, 0.3);
                                color: #00ffff;
                            ">Coin History</div>
                            <div style="color: #888; text-align: center; padding: 20px;">No coin history yet</div>
                        `;
                    } else {
                        const historyHTML = coinHistory.slice(0, 20).map(entry => {
                            const bonus = entry.amount > entry.baseAmount ? ` (+${entry.amount - entry.baseAmount} bonus)` : '';
                            return `
                                <div style="
                                    padding: 6px 0;
                                    border-bottom: 1px solid rgba(0, 255, 255, 0.1);
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                ">
                                    <span style="color: #00ffff;">🪙 +${entry.amount}${bonus}</span>
                                    <span style="color: #888; font-size: 11px;">${formatTime(entry.timestamp)}</span>
                                </div>
                            `;
                        }).join('');
                        
                        tooltip.innerHTML = `
                            <div style="
                                font-weight: bold;
                                margin-bottom: 8px;
                                padding-bottom: 8px;
                                border-bottom: 1px solid rgba(0, 255, 255, 0.3);
                                color: #00ffff;
                            ">Coin History</div>
                            <div>${historyHTML}</div>
                        `;
                    }
                    
                    document.body.appendChild(tooltip);
                    
                    // Keep tooltip visible when hovering over it
                    tooltip.addEventListener('mouseenter', () => {
                        // Keep visible
                    });
                    tooltip.addEventListener('mouseleave', () => {
                        if (tooltip) {
                            tooltip.remove();
                            tooltip = null;
                        }
                    });
                } catch (error) {
                    console.error('[MMS] Error showing coin history tooltip:', error);
                }
            });
            
            coinBalance.addEventListener('mouseleave', (e) => {
                // Only hide if not moving to tooltip
                if (tooltip && (!e.relatedTarget || !tooltip.contains(e.relatedTarget))) {
                    setTimeout(() => {
                        if (tooltip && document.body.contains(tooltip)) {
                            const isHoveringTooltip = tooltip.matches(':hover') || tooltip.contains(document.elementFromPoint(e.clientX, e.clientY));
                            const isHoveringCoin = coinBalance.matches(':hover') || coinBalance.contains(document.elementFromPoint(e.clientX, e.clientY));
                            if (!isHoveringTooltip && !isHoveringCoin) {
                                tooltip.remove();
                                tooltip = null;
                            }
                        }
                    }, 100);
                }
            });
            
            parentContainer.appendChild(coinBalance);
            window.updateCoinBalanceUI(STORAGE_KEYS, GM_getValue(STORAGE_KEYS.USER_COINS, 0));
        }

        // Initializer for settings
        addSettingsButton();
    }

    // Make the main initializer function globally accessible
    window.initSettingsPanel = initSettingsPanel;

})();