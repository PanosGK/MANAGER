// ==UserScript==
// @name         MyManager Price Transfer Module
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Quick transfer of suggested repair price to repair cost field
// @author       Gkorogias - Gemini AI - Chat GPT
// @match        *://thefixers.mymanager.gr/*
// ==/UserScript==

/**
 * SUGGESTED PRICE TRANSFER FEATURE
 * Adds a button to quickly transfer the suggested repair price
 * from value_ccc_iRepairCost_1 to iAmount on the repair edit page.
 */
function initSuggestedPriceTransfer() {
    // Only run on service edit pages
    if (!window.location.pathname.includes('/mymanagerservice/service_edit.php')) {
        console.log('[MMS Price Transfer] Not on service_edit.php page, skipping');
        return;
    }

    console.log('[MMS Price Transfer] Initializing on service_edit.php page');

    function createTransferButton(suggestedPriceField, repairCostField) {
        // Create the transfer button
        const transferBtn = document.createElement('button');
        transferBtn.id = 'tm-price-transfer-btn';
        transferBtn.type = 'button';
        transferBtn.innerHTML = '💡';
        transferBtn.title = 'Use suggested price';
        // Theme-aware styles are in myman_styles.js (#tm-price-transfer-btn)
        transferBtn.style.cssText = 'padding: 3px 8px; margin-left: 6px;';
        
        // Add click handler to transfer the value
        transferBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const suggestedPrice = suggestedPriceField.value;
            if (suggestedPrice && suggestedPrice.trim() !== '') {
                let calculatedValue = suggestedPrice.trim();
                
                // Check if the value contains mathematical expressions (e.g., "10 + 20" or "50+30")
                if (calculatedValue.includes('+')) {
                    try {
                        // Split by + and sum all numbers
                        const numbers = calculatedValue.split('+').map(num => parseFloat(num.trim())).filter(num => !isNaN(num));
                        if (numbers.length > 0) {
                            const total = numbers.reduce((sum, num) => sum + num, 0);
                            calculatedValue = total.toFixed(2);
                            console.log('[MMS Price Transfer] Calculated:', suggestedPrice, '=', calculatedValue);
                        }
                    } catch (error) {
                        console.log('[MMS Price Transfer] Calculation error, using original value:', error);
                    }
                } else {
                    // If it's just a plain number, ensure it has 2 decimal places
                    const num = parseFloat(calculatedValue);
                    if (!isNaN(num)) {
                        calculatedValue = num.toFixed(2);
                    }
                }
                
                repairCostField.value = calculatedValue;
                // Trigger change event in case there are listeners
                repairCostField.dispatchEvent(new Event('change', { bubbles: true }));
                repairCostField.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Visual feedback (theme-aware via class)
                transferBtn.innerHTML = '✓';
                transferBtn.classList.add('tm-price-transfer-success');
                transferBtn.classList.remove('tm-price-transfer-error');
                setTimeout(() => {
                    transferBtn.innerHTML = '💡';
                    transferBtn.classList.remove('tm-price-transfer-success');
                }, 1000);
                
                console.log('[MMS Price Transfer] Transferred calculated price:', calculatedValue);
            } else {
                // Show error feedback if no value to transfer (theme-aware via class)
                transferBtn.innerHTML = '✗';
                transferBtn.classList.add('tm-price-transfer-error');
                transferBtn.classList.remove('tm-price-transfer-success');
                setTimeout(() => {
                    transferBtn.innerHTML = '💡';
                    transferBtn.classList.remove('tm-price-transfer-error');
                }, 1000);
            }
        });
        
        return transferBtn;
    }

    function tryAddButton() {
        // Look for elements with various selectors
        let suggestedPriceField = document.getElementById('value_ccc_iRepairCost_1');
        let repairCostField = document.querySelector('input[data-fieldname="iAmount"]');

        // Try alternative selectors if IDs don't work
        if (!suggestedPriceField) {
            suggestedPriceField = document.querySelector('input[name="value_ccc_iRepairCost_1"]');
            console.log('[MMS Price Transfer] Trying alternative selector for suggested price field:', suggestedPriceField);
        }
        
        if (!repairCostField) {
            repairCostField = document.querySelector('input[name="iAmount"]');
            console.log('[MMS Price Transfer] Trying alternative selector for repair cost field:', repairCostField);
        }

        console.log('[MMS Price Transfer] Fields found:', {
            suggestedPrice: !!suggestedPriceField,
            repairCost: !!repairCostField,
            buttonExists: !!document.getElementById('tm-price-transfer-btn')
        });

            // Check if both fields exist and button hasn't been added yet
            if (suggestedPriceField && repairCostField && !document.getElementById('tm-price-transfer-btn')) {
                const transferBtn = createTransferButton(suggestedPriceField, repairCostField);
                
                // Create dropdown for additional charges
                const dropdown = document.createElement('select');
                dropdown.id = 'tm-price-addon-dropdown';
                dropdown.style.cssText = `
                    background: #f8f9fa;
                    color: #495057;
                    border: 1px solid #ced4da;
                    border-radius: 3px;
                    padding: 3px 8px;
                    margin-left: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.15s ease;
                    
                `;
                
                // Add default option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = '+ Add...';
                dropdown.appendChild(defaultOption);
                
                // Get price options from config
                const priceOptions = window.config?.priceOptions || [
                    { label: 'Καθαρισμός', value: 35, action: 'add', condition: 'default' },
                    { label: 'Μεταφορά', value: 10, action: 'add', condition: 'default' },
                    { label: 'Εγγύηση', value: 0.01, action: 'replace', condition: 'default' }
                ];
                
                // Check device model for conditional options
                let deviceModel = '';
                let isPS5 = false;
                if (typeof window.getPhoneModelFromPage === 'function') {
                    deviceModel = window.getPhoneModelFromPage() || '';
                    isPS5 = deviceModel.toLowerCase().includes('ps5');
                    if (isPS5) {
                        console.log('[MMS Price Transfer] PS5 detected');
                    }
                }
                
                // Add configured options
                priceOptions.forEach(option => {
                    // Skip PS5-specific options if not PS5
                    if (option.condition === 'ps5' && !isPS5) return;
                    // Skip default cleaning if PS5 (use PS5 version instead)
                    if (option.condition === 'default' && isPS5 && option.label.includes('Καθαρισμός') && !option.label.includes('PS5')) return;
                    
                    const optionElement = document.createElement('option');
                    // Store action type in data attribute
                    optionElement.dataset.action = option.action;
                    optionElement.value = option.value.toString();
                    
                    // Format label based on action
                    if (option.action === 'replace') {
                        optionElement.textContent = `${option.label} (${option.value})`;
                    } else {
                        optionElement.textContent = `${option.label} +${option.value}`;
                    }
                    
                    dropdown.appendChild(optionElement);
                });
                
                // Handle dropdown selection
                dropdown.addEventListener('change', (e) => {
                    const selectedOption = e.target.options[e.target.selectedIndex];
                    const selectedValue = parseFloat(e.target.value);
                    const action = selectedOption.dataset.action;
                    
                    if (isNaN(selectedValue)) {
                        dropdown.value = '';
                        return;
                    }
                    
                    if (action === 'replace') {
                        // Replace action: Set the exact value
                        repairCostField.value = selectedValue.toFixed(2);
                        repairCostField.dispatchEvent(new Event('change', { bubbles: true }));
                        repairCostField.dispatchEvent(new Event('input', { bubbles: true }));
                        console.log('[MMS Price Transfer] Set price to:', selectedValue);
                    } else {
                        // Add action: Add to current value
                        const currentValue = parseFloat(repairCostField.value) || 0;
                        const newValue = (currentValue + selectedValue).toFixed(2);
                        repairCostField.value = newValue;
                        repairCostField.dispatchEvent(new Event('change', { bubbles: true }));
                        repairCostField.dispatchEvent(new Event('input', { bubbles: true }));
                        console.log('[MMS Price Transfer] Added', selectedValue, 'to repair cost. New total:', newValue);
                    }
                    
                    // Reset dropdown to default
                    dropdown.value = '';
                });
                
                // Insert the button after the REPAIR COST field (iAmount) since fields are in different tabs
                if (repairCostField.nextSibling) {
                    repairCostField.parentNode.insertBefore(transferBtn, repairCostField.nextSibling);
                    repairCostField.parentNode.insertBefore(dropdown, transferBtn.nextSibling);
                } else {
                    repairCostField.parentNode.appendChild(transferBtn);
                    repairCostField.parentNode.appendChild(dropdown);
                }
                
                console.log('[MMS Price Transfer] ✓ Button and dropdown successfully added next to repair cost field!');
                return true;
        } else if (!suggestedPriceField || !repairCostField) {
            console.log('[MMS Price Transfer] Waiting for fields to appear...');
        }
        return false;
    }

    // Try immediately
    setTimeout(tryAddButton, 500);
    setTimeout(tryAddButton, 1000);
    setTimeout(tryAddButton, 2000);

    // Set up MutationObserver to watch for dynamic content
    const observer = new MutationObserver(() => {
        if (tryAddButton()) {
            observer.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Stop observing after 10 seconds
    setTimeout(() => {
        observer.disconnect();
        console.log('[MMS Price Transfer] Stopped observing after 10 seconds');
    }, 10000);
}

// Make the function globally available
if (typeof window !== 'undefined') {
    window.initSuggestedPriceTransfer = initSuggestedPriceTransfer;
}

