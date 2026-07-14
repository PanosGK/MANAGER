// ==UserScript==
// @name         MyManager Phone Catalog Settings
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Manage colors, tags, stores, and export for the phone catalog.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';

    function t(key) {
        const T = window.PHONE_CATALOG_TRANSLATIONS || {};
        return typeof window.phoneCatalogT === 'function' ? window.phoneCatalogT(key) : (T[key] || key);
    }

    function clearCaches() {
        if (typeof window.clearPhoneCatalogCaches === 'function') {
            window.clearPhoneCatalogCaches();
        }
    }

    function showColorManagerModal(ctx = {}) {
        const { allPhones = [], onChange = () => {} } = ctx;
        const existing = document.getElementById('tm-phone-colors-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'tm-phone-colors-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:100010;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;padding:16px;';

        const panel = document.createElement('div');
        panel.style.cssText = 'width:min(520px,100%);max-height:85vh;overflow:auto;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);border:1px solid var(--tm-shop-item-border);border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,0.35);padding:16px;';

        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h3 style="margin:0;font-size:16px;font-weight:600;">${t('Manage Colors')}</h3>
                <button id="tm-colors-close" type="button" style="border:none;background:transparent;font-size:22px;cursor:pointer;color:var(--tm-shop-item-text);line-height:1;">&times;</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;padding:12px;border:1px solid var(--tm-shop-item-border);border-radius:8px;background:rgba(128,128,128,0.06);">
                <input id="tm-new-color-name" type="text" placeholder="${t('Color Name')} (${t('e.g. MINT GREEN')})" style="width:100%;padding:8px 10px;border:1px solid var(--tm-shop-item-border);border-radius:6px;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);font-size:13px;box-sizing:border-box;">
                <div id="tm-color-suggest-hint" style="font-size:11px;opacity:0.8;min-height:14px;"></div>
                <div style="font-size:11px;opacity:0.7;margin-bottom:2px;">${t('Catalog title color')}</div>
                <div style="display:flex;gap:8px;align-items:center;">
                    <input type="color" id="tm-new-color-picker" value="#808080" title="${t('Catalog title color')}" style="width:42px;height:34px;padding:2px;border:1px solid var(--tm-shop-item-border);border-radius:6px;cursor:pointer;background:var(--tm-shop-item-bg);">
                    <input id="tm-new-color-hex" type="text" placeholder="#RRGGBB" style="flex:1;padding:8px 10px;border:1px solid var(--tm-shop-item-border);border-radius:6px;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);font-size:13px;font-family:monospace;box-sizing:border-box;">
                    <button id="tm-add-color-btn" type="button" style="padding:8px 12px;border:none;border-radius:6px;background:var(--tm-primary-color);color:#fff;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">${t('Add Color')}</button>
                </div>
            </div>
            <div style="font-size:12px;font-weight:600;margin-bottom:8px;opacity:0.75;">${t('Custom Colors')}</div>
            <div id="tm-phone-colors-list"></div>
        `;

        modal.appendChild(panel);
        document.body.appendChild(modal);

        const nameInput = panel.querySelector('#tm-new-color-name');
        const picker = panel.querySelector('#tm-new-color-picker');
        const hexInput = panel.querySelector('#tm-new-color-hex');
        const hintEl = panel.querySelector('#tm-color-suggest-hint');
        const listEl = panel.querySelector('#tm-phone-colors-list');
        let hexFieldDirty = false;

        const applySuggestedHex = (suggestion) => {
            if (!suggestion?.hex) return;
            hexInput.value = suggestion.hex;
            picker.value = suggestion.hex;
        };

        const updateColorSuggestion = () => {
            const suggestion = window.suggestPhoneColorHex?.(nameInput.value);
            if (!suggestion) {
                hintEl.textContent = '';
                return;
            }
            hintEl.innerHTML = `${t('Suggested hex')}: <button type="button" class="tm-apply-suggest-hex" style="border:none;background:transparent;color:var(--tm-primary-color);font-family:monospace;font-size:11px;font-weight:700;cursor:pointer;padding:0;text-decoration:underline;">${suggestion.hex}</button> <span style="opacity:0.65;">(${suggestion.source})</span>`;
            hintEl.querySelector('.tm-apply-suggest-hex').addEventListener('click', () => {
                applySuggestedHex(suggestion);
                hexFieldDirty = true;
            });
            if (!hexFieldDirty) applySuggestedHex(suggestion);
        };

        const syncHexFromPicker = () => {
            hexInput.value = picker.value.toUpperCase();
        };
        picker.addEventListener('input', () => {
            hexFieldDirty = true;
            syncHexFromPicker();
        });
        hexInput.addEventListener('input', () => {
            hexFieldDirty = true;
            const hex = window.normalizePhoneColorHex?.(hexInput.value);
            if (hex) picker.value = hex;
        });
        nameInput.addEventListener('input', updateColorSuggestion);
        syncHexFromPicker();

        const refreshAfterChange = () => {
            clearCaches();
            if (typeof window.syncPhoneColorCatalog === 'function') {
                window.syncPhoneColorCatalog(allPhones);
            }
            onChange();
            renderPhoneColorList();
        };

        const renderPhoneColorList = () => {
            const colors = window.loadPhoneColors?.() || {};
            const names = Object.keys(colors).sort((a, b) => {
                const aMulti = a.includes(' ') ? 0 : 1;
                const bMulti = b.includes(' ') ? 0 : 1;
                if (aMulti !== bMulti) return aMulti - bMulti;
                return b.length - a.length || a.localeCompare(b);
            });
            if (!names.length) {
                listEl.innerHTML = `<div style="font-size:12px;opacity:0.6;padding:8px 0;">${t('No custom colors yet')}</div>`;
                return;
            }
            listEl.innerHTML = names.map((name) => {
                const entry = window.normalizeColorEntry?.(colors[name], name) || { hex: '#808080', listHex: '#808080' };
                const listHex = entry.listHex || entry.hex || '#808080';
                const aliases = (window.getAliasesForColor?.(name) || []).join(', ');
                const titleOutline = window.getPhoneCatalogOutlineStyle?.(name, listHex) || '';
                const nameInputStyle = `flex:1;padding:6px 8px;border:1px solid var(--tm-shop-item-border);border-radius:5px;background:var(--tm-shop-item-bg);font-size:13px;font-weight:700;min-width:0;box-sizing:border-box;color:${listHex};${titleOutline}`;
                return `
                <div class="tm-phone-color-row" data-color="${name}" style="padding:10px 0;border-bottom:1px solid var(--tm-shop-item-border);">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                        <span style="font-size:11px;opacity:0.75;width:88px;flex-shrink:0;">${t('Color Name')}</span>
                        <input type="text" class="tm-phone-color-name-input" data-color="${name}" value="${name}" style="${nameInputStyle}">
                        <button type="button" data-color="${name}" class="tm-delete-phone-color" style="padding:4px 8px;border:1px solid var(--tm-shop-item-border);border-radius:5px;background:transparent;color:var(--tm-shop-item-text);font-size:11px;cursor:pointer;flex-shrink:0;">${t('Delete')}</button>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                        <span style="font-size:11px;opacity:0.75;width:88px;flex-shrink:0;">${t('Catalog title color')}</span>
                        <input type="color" class="tm-phone-list-color-picker" data-color="${name}" value="${listHex}" style="width:32px;height:28px;padding:1px;border:1px solid var(--tm-shop-item-border);border-radius:5px;cursor:pointer;background:var(--tm-shop-item-bg);flex-shrink:0;">
                        <span class="tm-phone-list-color-label" style="font-size:11px;opacity:0.65;font-family:monospace;">${listHex}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:11px;opacity:0.75;width:88px;flex-shrink:0;">${t('Also for labels')}</span>
                        <input type="text" class="tm-phone-color-alias-input" data-color="${name}" value="${aliases}" placeholder="${t('Aliases hint')}" style="flex:1;padding:6px 8px;border:1px solid var(--tm-shop-item-border);border-radius:5px;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);font-size:11px;box-sizing:border-box;">
                    </div>
                </div>`;
            }).join('');

            const applyNameInputStyle = (input, colorName, hex) => {
                const outline = window.getPhoneCatalogOutlineStyle?.(colorName, hex) || '';
                input.setAttribute('style', `flex:1;padding:6px 8px;border:1px solid var(--tm-shop-item-border);border-radius:5px;background:var(--tm-shop-item-bg);font-size:13px;font-weight:700;min-width:0;box-sizing:border-box;color:${hex};${outline}`);
            };

            listEl.querySelectorAll('.tm-phone-list-color-picker').forEach((input) => {
                input.addEventListener('change', () => {
                    const hex = window.normalizePhoneColorHex?.(input.value);
                    if (!hex || !window.updatePhoneListColor?.(input.dataset.color, hex)) return;
                    const row = input.closest('.tm-phone-color-row');
                    const label = row?.querySelector('.tm-phone-list-color-label');
                    const nameInputEl = row?.querySelector('.tm-phone-color-name-input');
                    if (label) label.textContent = hex;
                    if (nameInputEl) applyNameInputStyle(nameInputEl, input.dataset.color, hex);
                    clearCaches();
                    onChange();
                    if (window.showPositiveMessage) window.showPositiveMessage(t('Color updated'));
                });
            });

            listEl.querySelectorAll('.tm-phone-color-name-input').forEach((input) => {
                const commitRename = () => {
                    const oldName = input.dataset.color;
                    const newName = window.normalizePhoneColorName?.(input.value);
                    if (!newName) {
                        input.value = oldName;
                        if (window.showNegativeMessage) window.showNegativeMessage(t('Invalid color name or hex'));
                        return;
                    }
                    if (newName === oldName) return;
                    const result = window.renamePhoneColor?.(oldName, newName);
                    if (!result?.ok) {
                        input.value = oldName;
                        const msg = result?.error === 'exists' ? t('Color already exists') : t('Invalid color name or hex');
                        if (window.showNegativeMessage) window.showNegativeMessage(msg);
                        else if (window.showPositiveMessage) window.showPositiveMessage(msg);
                        return;
                    }
                    clearCaches();
                    if (window.showPositiveMessage) window.showPositiveMessage(t('Color updated'));
                    refreshAfterChange();
                };
                input.addEventListener('change', commitRename);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        input.blur();
                    }
                });
            });

            listEl.querySelectorAll('.tm-phone-color-alias-input').forEach((input) => {
                input.addEventListener('change', () => {
                    window.setColorDisplayAliasesForColor?.(input.dataset.color, input.value);
                    clearCaches();
                    onChange();
                    if (window.showPositiveMessage) window.showPositiveMessage(t('Color updated'));
                });
            });

            listEl.querySelectorAll('.tm-delete-phone-color').forEach((btn) => {
                btn.addEventListener('click', () => {
                    window.removePhoneColor?.(btn.dataset.color);
                    if (window.showPositiveMessage) window.showPositiveMessage(t('Color removed'));
                    refreshAfterChange();
                });
            });
        };

        panel.querySelector('#tm-add-color-btn').addEventListener('click', () => {
            const result = window.addPhoneColor?.(nameInput.value, hexInput.value || picker.value, hexInput.value || picker.value);
            if (!result?.ok) {
                const msg = result?.error === 'exists' ? t('Color already exists') : t('Invalid color name or hex');
                if (window.showNegativeMessage) window.showNegativeMessage(msg);
                else if (window.showPositiveMessage) window.showPositiveMessage(msg);
                return;
            }
            nameInput.value = '';
            hexInput.value = '';
            picker.value = '#808080';
            hexFieldDirty = false;
            hintEl.textContent = '';
            if (window.showPositiveMessage) window.showPositiveMessage(t('Color added'));
            refreshAfterChange();
        });

        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') panel.querySelector('#tm-add-color-btn').click();
        });

        panel.querySelector('#tm-colors-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        if (typeof window.syncPhoneColorCatalog === 'function') {
            window.syncPhoneColorCatalog(allPhones);
        }
        renderPhoneColorList();
    }

    function showTagManagerModal(ctx = {}) {
        const { onChange = () => {} } = ctx;
        const existing = document.getElementById('tm-phone-tags-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'tm-phone-tags-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:100010;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;padding:16px;';

        const panel = document.createElement('div');
        panel.style.cssText = 'width:min(480px,100%);max-height:85vh;overflow:auto;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);border:1px solid var(--tm-shop-item-border);border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,0.35);padding:16px;';

        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h3 style="margin:0;font-size:16px;font-weight:600;">${t('Manage Tags')}</h3>
                <button id="tm-tags-close" type="button" style="border:none;background:transparent;font-size:22px;cursor:pointer;color:var(--tm-shop-item-text);line-height:1;">&times;</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;padding:12px;border:1px solid var(--tm-shop-item-border);border-radius:8px;background:rgba(128,128,128,0.06);">
                <input id="tm-new-tag-name" type="text" placeholder="${t('Tag Name')} (${t('e.g. Reserved')})" style="width:100%;padding:8px 10px;border:1px solid var(--tm-shop-item-border);border-radius:6px;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);font-size:13px;box-sizing:border-box;">
                <div style="font-size:11px;opacity:0.7;margin-bottom:2px;">${t('Tag Color')}</div>
                <div style="display:flex;gap:8px;align-items:center;">
                    <input type="color" id="tm-new-tag-picker" value="#2196f3" title="${t('Tag Color')}" style="width:42px;height:34px;padding:2px;border:1px solid var(--tm-shop-item-border);border-radius:6px;cursor:pointer;background:var(--tm-shop-item-bg);">
                    <input id="tm-new-tag-hex" type="text" placeholder="#RRGGBB" style="flex:1;padding:8px 10px;border:1px solid var(--tm-shop-item-border);border-radius:6px;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);font-size:13px;font-family:monospace;box-sizing:border-box;">
                    <button id="tm-add-tag-btn" type="button" style="padding:8px 12px;border:none;border-radius:6px;background:var(--tm-primary-color);color:#fff;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">${t('Add Tag')}</button>
                </div>
            </div>
            <div style="font-size:12px;font-weight:600;margin-bottom:8px;opacity:0.75;">${t('Custom Tags')}</div>
            <div id="tm-phone-tags-list"></div>
        `;

        modal.appendChild(panel);
        document.body.appendChild(modal);

        const nameInput = panel.querySelector('#tm-new-tag-name');
        const picker = panel.querySelector('#tm-new-tag-picker');
        const hexInput = panel.querySelector('#tm-new-tag-hex');
        const listEl = panel.querySelector('#tm-phone-tags-list');

        const syncHexFromPicker = () => {
            hexInput.value = picker.value.toUpperCase();
        };
        picker.addEventListener('input', syncHexFromPicker);
        hexInput.addEventListener('input', () => {
            const hex = window.normalizePhoneColorHex?.(hexInput.value);
            if (hex) picker.value = hex;
        });
        syncHexFromPicker();

        const refreshAfterChange = () => {
            onChange();
            renderTagList();
        };

        const renderTagList = () => {
            const keys = window.getDefinedTagKeys?.() || [];
            if (!keys.length) {
                listEl.innerHTML = `<div style="font-size:12px;opacity:0.6;padding:8px 0;">${t('No custom tags yet')}</div>`;
                return;
            }
            listEl.innerHTML = keys.map((key) => {
                const def = window.getTagDefinition?.(key) || { name: key, color: '#9e9e9e' };
                return `
                <div class="tm-phone-tag-row" data-tag="${key}" style="padding:10px 0;border-bottom:1px solid var(--tm-shop-item-border);">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                        <span style="font-size:11px;opacity:0.75;width:88px;flex-shrink:0;">${t('Tag Name')}</span>
                        <input type="text" class="tm-phone-tag-name-input" data-tag="${key}" value="${def.name.replace(/"/g, '&quot;')}" style="flex:1;padding:6px 8px;border:1px solid var(--tm-shop-item-border);border-radius:5px;background:var(--tm-shop-item-bg);font-size:13px;font-weight:600;min-width:0;box-sizing:border-box;color:${def.color};">
                        <button type="button" data-tag="${key}" class="tm-delete-phone-tag" style="padding:4px 8px;border:1px solid var(--tm-shop-item-border);border-radius:5px;background:transparent;color:var(--tm-shop-item-text);font-size:11px;cursor:pointer;flex-shrink:0;">${t('Delete')}</button>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:11px;opacity:0.75;width:88px;flex-shrink:0;">${t('Tag Color')}</span>
                        <input type="color" class="tm-phone-tag-color-picker" data-tag="${key}" value="${def.color}" style="width:32px;height:28px;padding:1px;border:1px solid var(--tm-shop-item-border);border-radius:5px;cursor:pointer;background:var(--tm-shop-item-bg);flex-shrink:0;">
                        <span class="tm-phone-tag-color-label" style="font-size:11px;opacity:0.65;font-family:monospace;">${def.color}</span>
                    </div>
                </div>`;
            }).join('');

            listEl.querySelectorAll('.tm-phone-tag-color-picker').forEach((input) => {
                input.addEventListener('change', () => {
                    const hex = window.normalizePhoneColorHex?.(input.value);
                    const key = input.dataset.tag;
                    const def = window.getTagDefinition?.(key) || { name: key, color: '#9e9e9e' };
                    if (!hex || !window.updateTagDefinition?.(key, def.name, hex)?.ok) return;
                    const row = input.closest('.tm-phone-tag-row');
                    const label = row?.querySelector('.tm-phone-tag-color-label');
                    const nameInputEl = row?.querySelector('.tm-phone-tag-name-input');
                    if (label) label.textContent = hex;
                    if (nameInputEl) nameInputEl.style.color = hex;
                    refreshAfterChange();
                });
            });

            listEl.querySelectorAll('.tm-phone-tag-name-input').forEach((input) => {
                const commitRename = () => {
                    const oldKey = input.dataset.tag;
                    const newName = input.value.trim();
                    if (!newName) {
                        input.value = window.getTagDisplayName?.(oldKey) || oldKey;
                        if (window.showNegativeMessage) window.showNegativeMessage(t('Invalid tag name'));
                        return;
                    }
                    if (window.normalizeTagKey?.(newName) === oldKey && newName === window.getTagDefinition?.(oldKey)?.name) return;
                    const def = window.getTagDefinition?.(oldKey) || { name: oldKey, color: '#9e9e9e' };
                    const result = window.updateTagDefinition?.(oldKey, newName, def.color);
                    if (!result?.ok) {
                        input.value = window.getTagDisplayName?.(oldKey) || oldKey;
                        const msg = result?.error === 'exists' ? t('Tag already exists') : t('Invalid tag name');
                        if (window.showNegativeMessage) window.showNegativeMessage(msg);
                        return;
                    }
                    if (result.renamed) window.renamePhoneTagKeyOnAllPhones?.(result.oldKey, result.key);
                    refreshAfterChange();
                };
                input.addEventListener('change', commitRename);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        input.blur();
                    }
                });
            });

            listEl.querySelectorAll('.tm-delete-phone-tag').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const key = btn.dataset.tag;
                    window.deleteTagDefinition?.(key);
                    window.removePhoneTagFromAllPhones?.(key);
                    if (window.showPositiveMessage) window.showPositiveMessage(t('Tag removed'));
                    refreshAfterChange();
                });
            });
        };

        panel.querySelector('#tm-add-tag-btn').addEventListener('click', () => {
            const result = window.addTagDefinition?.(nameInput.value, hexInput.value || picker.value);
            if (!result?.ok) {
                const msg = result?.error === 'exists' ? t('Tag already exists') : t('Invalid tag name');
                if (window.showNegativeMessage) window.showNegativeMessage(msg);
                return;
            }
            nameInput.value = '';
            hexInput.value = '';
            picker.value = '#2196F3';
            syncHexFromPicker();
            if (window.showPositiveMessage) window.showPositiveMessage(t('Tag added'));
            refreshAfterChange();
        });

        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') panel.querySelector('#tm-add-tag-btn').click();
        });

        panel.querySelector('#tm-tags-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        renderTagList();
    }

    function showMyStoreLocationModal(ctx = {}) {
        const { allPhones = [], otherStorePhones = [], onChange = () => {} } = ctx;
        const existing = document.getElementById('tm-phone-mystore-modal');
        if (existing) existing.remove();

        const options = window.getStorePickerOptions?.(allPhones, otherStorePhones) || [];
        const currentPick = window.getUserStorePick?.() || '';
        const detected = window.getAutoDetectedStoreName?.() || '';
        const modal = document.createElement('div');
        modal.id = 'tm-phone-mystore-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:100010;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;padding:16px;';

        const panel = document.createElement('div');
        panel.style.cssText = 'width:min(480px,100%);max-height:85vh;overflow:auto;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);border:1px solid var(--tm-shop-item-border);border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,0.35);padding:16px;';

        const optionHtml = options.map((name) => {
            const selected = currentPick === name ? ' selected' : '';
            return `<option value="${name.replace(/"/g, '&quot;')}"${selected}>${name}</option>`;
        }).join('');

        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h3 style="margin:0;font-size:16px;font-weight:600;">${t('My store location')}</h3>
                <button id="tm-mystore-close" type="button" style="border:none;background:transparent;font-size:22px;cursor:pointer;color:var(--tm-shop-item-text);line-height:1;">&times;</button>
            </div>
            <div style="font-size:11px;opacity:0.75;margin-bottom:12px;line-height:1.45;">${t('My store location hint')}</div>
            <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;">${t('Select store')}</label>
            <select id="tm-my-store-pick" style="width:100%;padding:10px 12px;border:1px solid var(--tm-shop-item-border);border-radius:8px;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);font-size:13px;box-sizing:border-box;margin-bottom:10px;">
                <option value="">${t('Auto-detect store')}${detected ? ` (${detected})` : ''}</option>
                ${optionHtml}
            </select>
            <div id="tm-my-store-detected" style="font-size:11px;opacity:0.7;margin-bottom:14px;">
                ${detected ? `${t('Auto-detected store')}: <strong>${detected}</strong>` : t('No store detected')}
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button id="tm-save-my-store" type="button" style="padding:8px 14px;border:none;border-radius:6px;background:var(--tm-primary-color);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">${t('Save')}</button>
            </div>
        `;

        modal.appendChild(panel);
        document.body.appendChild(modal);

        const pickSelect = panel.querySelector('#tm-my-store-pick');
        const save = () => {
            const value = pickSelect.value || '';
            window.setUserStorePick?.(value);
            if (window.showPositiveMessage) window.showPositiveMessage(t('My store saved'));
            onChange();
            modal.remove();
        };

        panel.querySelector('#tm-save-my-store').addEventListener('click', save);
        panel.querySelector('#tm-mystore-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    function showStoreRulesModal(ctx = {}) {
        const { allPhones = [], otherStorePhones = [], onChange = () => {} } = ctx;
        const existing = document.getElementById('tm-phone-stores-modal');
        if (existing) existing.remove();

        const rules = window.loadPhoneStoreRules?.() || window.getDefaultPhoneStoreRules?.() || { buybackPatterns: [], regularPatterns: [], overrides: {} };
        const storeOptions = window.getStorePickerOptions?.(allPhones, otherStorePhones) || [];
        const currentPick = window.getUserStorePick?.() || '';
        const detected = window.getAutoDetectedStoreName?.() || '';
        const modal = document.createElement('div');
        modal.id = 'tm-phone-stores-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:100010;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;padding:16px;';

        const panel = document.createElement('div');
        panel.style.cssText = 'width:min(680px,100%);max-height:85vh;overflow:auto;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);border:1px solid var(--tm-shop-item-border);border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,0.35);padding:16px;';

        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h3 style="margin:0;font-size:16px;font-weight:600;">${t('Manage Stores')}</h3>
                <button id="tm-stores-close" type="button" style="border:none;background:transparent;font-size:22px;cursor:pointer;color:var(--tm-shop-item-text);line-height:1;">&times;</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px;padding:12px;border:1px solid var(--tm-shop-item-border);border-radius:8px;background:rgba(128,128,128,0.06);">
                <label style="font-size:12px;font-weight:600;">${t('My store location')}</label>
                <select id="tm-my-store-pick-inline" style="width:100%;padding:8px 10px;border:1px solid var(--tm-shop-item-border);border-radius:6px;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);font-size:12px;box-sizing:border-box;">
                    <option value="">${t('Auto-detect store')}${detected ? ` (${detected})` : ''}</option>
                    ${storeOptions.map((name) => `<option value="${name.replace(/"/g, '&quot;')}"${currentPick === name ? ' selected' : ''}>${name}</option>`).join('')}
                </select>
                <div style="font-size:11px;opacity:0.7;line-height:1.4;">${t('My store location hint')}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px;padding:12px;border:1px solid var(--tm-shop-item-border);border-radius:8px;background:rgba(128,128,128,0.06);">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
                    <label style="font-size:12px;font-weight:600;">${t('Store addresses')}</label>
                    <button id="tm-geocode-store-addresses" type="button" style="padding:6px 10px;border:1px solid var(--tm-shop-item-border);border-radius:6px;background:transparent;color:var(--tm-shop-item-text);font-size:11px;font-weight:600;cursor:pointer;">${t('Geocode addresses')}</button>
                </div>
                <div style="font-size:11px;opacity:0.7;line-height:1.4;">${t('Store addresses hint')}</div>
                <div id="tm-store-address-list"></div>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px;padding:12px;border:1px solid var(--tm-shop-item-border);border-radius:8px;background:rgba(128,128,128,0.06);">
                <label style="font-size:12px;font-weight:600;">${t('Buyback store patterns')}</label>
                <input id="tm-buyback-store-patterns" type="text" value="${rules.buybackPatterns.join(', ')}" placeholder="${t('Buyback patterns hint')}" style="width:100%;padding:8px 10px;border:1px solid var(--tm-shop-item-border);border-radius:6px;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);font-size:12px;box-sizing:border-box;">
                <div style="font-size:11px;opacity:0.7;">${t('Buyback patterns hint')}</div>
                <label style="font-size:12px;font-weight:600;">${t('Regular store patterns')}</label>
                <input id="tm-regular-store-patterns" type="text" value="${rules.regularPatterns.join(', ')}" placeholder="${t('Regular patterns hint')}" style="width:100%;padding:8px 10px;border:1px solid var(--tm-shop-item-border);border-radius:6px;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);font-size:12px;box-sizing:border-box;">
                <div style="font-size:11px;opacity:0.7;">${t('Regular patterns hint')}</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button id="tm-save-store-rules" type="button" style="padding:8px 12px;border:none;border-radius:6px;background:var(--tm-primary-color);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">${t('Save')}</button>
                    <button id="tm-reset-store-overrides" type="button" style="padding:8px 12px;border:1px solid var(--tm-shop-item-border);border-radius:6px;background:transparent;color:var(--tm-shop-item-text);font-size:12px;cursor:pointer;">${t('Reset store overrides')}</button>
                </div>
            </div>
            <div style="font-size:12px;font-weight:600;margin-bottom:8px;opacity:0.75;">${t('Known stores')}</div>
            <div id="tm-phone-stores-list"></div>
        `;

        modal.appendChild(panel);
        document.body.appendChild(modal);

        const buybackPatternsInput = panel.querySelector('#tm-buyback-store-patterns');
        const regularPatternsInput = panel.querySelector('#tm-regular-store-patterns');
        const myStorePickInput = panel.querySelector('#tm-my-store-pick-inline');
        const addressListEl = panel.querySelector('#tm-store-address-list');
        const geocodeBtn = panel.querySelector('#tm-geocode-store-addresses');
        const listEl = panel.querySelector('#tm-phone-stores-list');
        let draftOverrides = { ...rules.overrides };

        const persistAddressesFromForm = () => {
            panel.querySelectorAll('.tm-store-address-input').forEach((input) => {
                const storeName = input.dataset.store;
                const address = input.value.trim();
                const prev = window.getStoreAddressEntry?.(storeName);
                if (!address) {
                    window.setStoreAddressEntry?.(storeName, { address: '' });
                    return;
                }
                if (prev?.address === address && prev?.lat != null && prev?.lng != null) {
                    return;
                }
                window.setStoreAddressEntry?.(storeName, {
                    address,
                    lat: prev?.address === address ? prev?.lat : undefined,
                    lng: prev?.address === address ? prev?.lng : undefined,
                    geocodedAt: prev?.address === address ? prev?.geocodedAt : undefined,
                });
            });
        };

        const renderStoreAddressList = () => {
            const stores = window.getStorePickerOptions?.(allPhones, otherStorePhones) || [];
            const myStore = window.getCurrentStoreName?.() || '';
            if (!stores.length) {
                addressListEl.innerHTML = `<div style="font-size:12px;opacity:0.6;padding:8px 0;">${t('No known stores yet')}</div>`;
                return;
            }
            addressListEl.innerHTML = stores.map((storeName) => {
                const entry = window.getStoreAddressEntry?.(storeName) || {};
                const address = entry.address || '';
                const distFromMe = myStore && myStore !== storeName
                    ? window.getStoreDistanceLabel?.(myStore, storeName)
                    : '';
                let status = t('No address set');
                if (entry.lat != null && entry.lng != null) {
                    status = distFromMe ? `${t('Address geocoded')} · ${distFromMe}` : t('Address geocoded');
                } else if (address) {
                    status = t('Geocoding stores');
                }
                return `
                <div class="tm-store-address-row" style="padding:8px 0;border-bottom:1px solid var(--tm-shop-item-border);">
                    <div style="font-size:12px;font-weight:700;margin-bottom:6px;word-break:break-word;">${storeName}</div>
                    <input type="text" class="tm-store-address-input" data-store="${storeName.replace(/"/g, '&quot;')}" value="${address.replace(/"/g, '&quot;')}" placeholder="${t('Store address placeholder')}" style="width:100%;padding:8px 10px;border:1px solid var(--tm-shop-item-border);border-radius:6px;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);font-size:12px;box-sizing:border-box;">
                    <div class="tm-store-address-status" style="font-size:10px;opacity:0.65;margin-top:4px;">${status}</div>
                </div>`;
            }).join('');
        };

        const geocodeAddresses = async () => {
            persistAddressesFromForm();
            const stores = window.getStorePickerOptions?.(allPhones, otherStorePhones) || [];
            const pending = stores.filter((name) => {
                const entry = window.getStoreAddressEntry?.(name);
                return entry?.address?.trim();
            });
            if (!pending.length) {
                if (window.showNegativeMessage) window.showNegativeMessage(t('No address set'));
                return;
            }
            geocodeBtn.disabled = true;
            geocodeBtn.textContent = t('Geocoding stores');
            let geocoded = 0;
            let failed = 0;
            for (let i = 0; i < pending.length; i += 1) {
                const name = pending[i];
                const entry = window.getStoreAddressEntry?.(name);
                const result = await window.geocodeStoreAddress?.(name, entry.address);
                if (result?.ok) geocoded += 1;
                else failed += 1;
                renderStoreAddressList();
                if (i < pending.length - 1) await new Promise((r) => setTimeout(r, 1100));
            }
            geocodeBtn.disabled = false;
            geocodeBtn.textContent = t('Geocode addresses');
            if (geocoded > 0 && window.showPositiveMessage) {
                window.showPositiveMessage(t('Geocode done'));
            } else if (!geocoded && window.showNegativeMessage) {
                window.showNegativeMessage(t('Geocode failed'));
            }
            onChange();
        };

        const getDraftRules = () => ({
            buybackPatterns: window.parseStorePatternCsv?.(buybackPatternsInput.value) || [],
            regularPatterns: window.parseStorePatternCsv?.(regularPatternsInput.value) || [],
            overrides: { ...draftOverrides },
        });

        const renderStoreRulesList = () => {
            const draft = getDraftRules();
            const knownStores = window.collectKnownStoreNames?.(allPhones, otherStorePhones) || [];
            if (!knownStores.length) {
                listEl.innerHTML = `<div style="font-size:12px;opacity:0.6;padding:8px 0;">${t('No known stores yet')}</div>`;
                return;
            }
            listEl.innerHTML = knownStores.map((storeName) => {
                const override = draft.overrides[storeName] || {};
                const bbAllowed = typeof override.buyback === 'boolean'
                    ? override.buyback
                    : window.storeNameMatchesPatterns?.(storeName, draft.buybackPatterns);
                const regularAllowed = typeof override.regular === 'boolean'
                    ? override.regular
                    : window.storeNameMatchesPatterns?.(storeName, draft.regularPatterns);
                const bbChecked = bbAllowed ? 'checked' : '';
                const regularChecked = regularAllowed ? 'checked' : '';
                return `
                <div class="tm-store-rule-row" data-store="${storeName.replace(/"/g, '&quot;')}" style="padding:10px 0;border-bottom:1px solid var(--tm-shop-item-border);">
                    <div style="font-size:13px;font-weight:700;margin-bottom:8px;word-break:break-word;">${storeName}</div>
                    <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px;">
                        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                            <input type="checkbox" class="tm-store-bb-allowed" data-store="${storeName.replace(/"/g, '&quot;')}" ${bbChecked}>
                            <span>${t('Allow buyback')}</span>
                        </label>
                        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                            <input type="checkbox" class="tm-store-regular-allowed" data-store="${storeName.replace(/"/g, '&quot;')}" ${regularChecked}>
                            <span>${t('Allow regular')}</span>
                        </label>
                    </div>
                </div>`;
            }).join('');

            listEl.querySelectorAll('.tm-store-bb-allowed, .tm-store-regular-allowed').forEach((input) => {
                input.addEventListener('change', () => {
                    const storeName = input.dataset.store;
                    if (!draftOverrides[storeName]) draftOverrides[storeName] = {};
                    if (input.classList.contains('tm-store-bb-allowed')) {
                        draftOverrides[storeName].buyback = input.checked;
                    } else {
                        draftOverrides[storeName].regular = input.checked;
                    }
                });
            });
        };

        const persistStoreRules = async () => {
            const next = getDraftRules();
            if (!next.buybackPatterns.length) {
                next.buybackPatterns = window.getDefaultPhoneStoreRules?.().buybackPatterns || [];
                buybackPatternsInput.value = next.buybackPatterns.join(', ');
            }
            window.savePhoneStoreRules?.(next);
            window.setUserStorePick?.(myStorePickInput?.value || '');
            persistAddressesFromForm();
            draftOverrides = { ...next.overrides };
            if (window.showPositiveMessage) window.showPositiveMessage(t('Store rules saved'));
            renderStoreAddressList();
            renderStoreRulesList();
            onChange();
        };

        panel.querySelector('#tm-save-store-rules').addEventListener('click', () => {
            persistStoreRules();
        });
        geocodeBtn?.addEventListener('click', geocodeAddresses);
        panel.querySelector('#tm-reset-store-overrides').addEventListener('click', () => {
            draftOverrides = {};
            renderStoreRulesList();
        });
        buybackPatternsInput.addEventListener('change', renderStoreRulesList);
        regularPatternsInput.addEventListener('change', renderStoreRulesList);
        panel.querySelector('#tm-stores-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        renderStoreAddressList();
        renderStoreRulesList();
    }

    function showModelsManagerModal(ctx = {}) {
        const { allPhones = [], otherStorePhones = [], onChange = () => {} } = ctx;
        const existing = document.getElementById('tm-phone-models-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'tm-phone-models-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:100010;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;padding:16px;';

        const panel = document.createElement('div');
        panel.style.cssText = 'width:min(620px,100%);max-height:85vh;overflow:auto;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);border:1px solid var(--tm-shop-item-border);border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,0.35);padding:16px;';

        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h3 style="margin:0;font-size:16px;font-weight:600;">${t('Manage Models')}</h3>
                <button id="tm-models-close" type="button" style="border:none;background:transparent;font-size:22px;cursor:pointer;color:var(--tm-shop-item-text);line-height:1;">&times;</button>
            </div>
            <div style="font-size:11px;opacity:0.75;margin-bottom:12px;line-height:1.45;">${t('Models list hint')}</div>
            <div style="display:flex;gap:8px;margin-bottom:12px;">
                <input id="tm-new-model-name" type="text" placeholder="${t('Model Name')} (${t('e.g. iPhone 13 Pro Max')})" style="flex:1;padding:8px 10px;border:1px solid var(--tm-shop-item-border);border-radius:6px;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);font-size:13px;box-sizing:border-box;">
                <button id="tm-add-model-btn" type="button" style="padding:8px 12px;border:none;border-radius:6px;background:var(--tm-primary-color);color:#fff;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">${t('Add Model')}</button>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
                <button id="tm-reset-models-btn" type="button" style="padding:7px 12px;border:1px solid var(--tm-shop-item-border);border-radius:6px;background:transparent;color:var(--tm-shop-item-text);font-size:12px;cursor:pointer;">${t('Reset models list')}</button>
            </div>
            <div style="font-size:12px;font-weight:600;margin-bottom:8px;opacity:0.75;">${t('Canonical Models')}</div>
            <div id="tm-phone-models-list"></div>
            <div style="font-size:12px;font-weight:600;margin:16px 0 8px;opacity:0.75;">${t('Suggested models')}</div>
            <div id="tm-phone-models-suggestions"></div>
        `;

        modal.appendChild(panel);
        document.body.appendChild(modal);

        const nameInput = panel.querySelector('#tm-new-model-name');
        const listEl = panel.querySelector('#tm-phone-models-list');
        const suggestionsEl = panel.querySelector('#tm-phone-models-suggestions');

        const refreshAfterChange = () => {
            onChange();
            renderModelList();
            renderSuggestions();
        };

        const renderModelList = () => {
            const models = window.loadPhoneCanonicalModels?.() || [];
            if (!models.length) {
                listEl.innerHTML = `<div style="font-size:12px;opacity:0.6;padding:8px 0;">${t('No models in list')}</div>`;
                return;
            }
            listEl.innerHTML = models.map((name, index) => `
                <div class="tm-phone-model-row" data-model="${name.replace(/"/g, '&quot;')}" style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--tm-shop-item-border);">
                    <span style="font-size:10px;opacity:0.45;width:22px;text-align:right;flex-shrink:0;">${index + 1}</span>
                    <input type="text" class="tm-phone-model-name-input" data-model="${name.replace(/"/g, '&quot;')}" value="${name.replace(/"/g, '&quot;')}" style="flex:1;padding:6px 8px;border:1px solid var(--tm-shop-item-border);border-radius:5px;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);font-size:13px;font-weight:600;min-width:0;box-sizing:border-box;">
                    <button type="button" class="tm-phone-model-up" data-model="${name.replace(/"/g, '&quot;')}" title="Up" style="padding:4px 7px;border:1px solid var(--tm-shop-item-border);border-radius:5px;background:transparent;color:var(--tm-shop-item-text);font-size:11px;cursor:pointer;">↑</button>
                    <button type="button" class="tm-phone-model-down" data-model="${name.replace(/"/g, '&quot;')}" title="Down" style="padding:4px 7px;border:1px solid var(--tm-shop-item-border);border-radius:5px;background:transparent;color:var(--tm-shop-item-text);font-size:11px;cursor:pointer;">↓</button>
                    <button type="button" class="tm-delete-phone-model" data-model="${name.replace(/"/g, '&quot;')}" style="padding:4px 8px;border:1px solid var(--tm-shop-item-border);border-radius:5px;background:transparent;color:var(--tm-shop-item-text);font-size:11px;cursor:pointer;flex-shrink:0;">${t('Delete')}</button>
                </div>
            `).join('');

            listEl.querySelectorAll('.tm-phone-model-name-input').forEach((input) => {
                const commitRename = () => {
                    const oldName = input.dataset.model;
                    const newName = input.value.trim();
                    if (!newName) {
                        input.value = oldName;
                        if (window.showNegativeMessage) window.showNegativeMessage(t('Invalid model name'));
                        return;
                    }
                    if (newName === oldName) return;
                    const result = window.renamePhoneCanonicalModel?.(oldName, newName);
                    if (!result?.ok) {
                        input.value = oldName;
                        const msg = result?.error === 'exists' ? t('Model already exists') : t('Invalid model name');
                        if (window.showNegativeMessage) window.showNegativeMessage(msg);
                        return;
                    }
                    if (window.showPositiveMessage) window.showPositiveMessage(t('Model updated'));
                    refreshAfterChange();
                };
                input.addEventListener('change', commitRename);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        input.blur();
                    }
                });
            });

            listEl.querySelectorAll('.tm-phone-model-up').forEach((btn) => {
                btn.addEventListener('click', () => {
                    window.movePhoneCanonicalModel?.(btn.dataset.model, 'up');
                    refreshAfterChange();
                });
            });
            listEl.querySelectorAll('.tm-phone-model-down').forEach((btn) => {
                btn.addEventListener('click', () => {
                    window.movePhoneCanonicalModel?.(btn.dataset.model, 'down');
                    refreshAfterChange();
                });
            });
            listEl.querySelectorAll('.tm-delete-phone-model').forEach((btn) => {
                btn.addEventListener('click', () => {
                    window.removePhoneCanonicalModel?.(btn.dataset.model);
                    if (window.showPositiveMessage) window.showPositiveMessage(t('Model removed'));
                    refreshAfterChange();
                });
            });
        };

        const renderSuggestions = () => {
            const suggestions = window.collectSuggestedCanonicalModels?.(allPhones, otherStorePhones) || [];
            if (!suggestions.length) {
                suggestionsEl.innerHTML = `<div style="font-size:12px;opacity:0.6;padding:4px 0;">${t('No suggestions')}</div>`;
                return;
            }
            suggestionsEl.innerHTML = suggestions.map((name) => `
                <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--tm-shop-item-border);">
                    <span style="flex:1;font-size:12px;">${name}</span>
                    <button type="button" class="tm-add-suggested-model" data-model="${name.replace(/"/g, '&quot;')}" style="padding:4px 10px;border:none;border-radius:5px;background:var(--tm-primary-color);color:#fff;font-size:11px;font-weight:600;cursor:pointer;">${t('Add Model')}</button>
                </div>
            `).join('');
            suggestionsEl.querySelectorAll('.tm-add-suggested-model').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const result = window.addPhoneCanonicalModel?.(btn.dataset.model, 0);
                    if (!result?.ok) {
                        const msg = result?.error === 'exists' ? t('Model already exists') : t('Invalid model name');
                        if (window.showNegativeMessage) window.showNegativeMessage(msg);
                        return;
                    }
                    if (window.showPositiveMessage) window.showPositiveMessage(t('Model added'));
                    refreshAfterChange();
                });
            });
        };

        panel.querySelector('#tm-add-model-btn').addEventListener('click', () => {
            const result = window.addPhoneCanonicalModel?.(nameInput.value, 0);
            if (!result?.ok) {
                const msg = result?.error === 'exists' ? t('Model already exists') : t('Invalid model name');
                if (window.showNegativeMessage) window.showNegativeMessage(msg);
                return;
            }
            nameInput.value = '';
            if (window.showPositiveMessage) window.showPositiveMessage(t('Model added'));
            refreshAfterChange();
        });

        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') panel.querySelector('#tm-add-model-btn').click();
        });

        panel.querySelector('#tm-reset-models-btn').addEventListener('click', () => {
            window.resetPhoneCanonicalModels?.();
            if (window.showPositiveMessage) window.showPositiveMessage(t('Models list saved'));
            refreshAfterChange();
        });

        panel.querySelector('#tm-models-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        renderModelList();
        renderSuggestions();
    }

    function exportToClipboard(phones) {
        const extractBaseModel = window.extractBaseModel || ((m) => m || '');
        const extractGB = window.extractGB || (() => '');
        const extractColor = window.extractColor || (() => '');
        const lines = phones.map((p) => {
            const modelWithoutColor = extractBaseModel(p.model) || p.model || p.name;
            return `${p.barcode}\t${modelWithoutColor}\t${p.grade || ''}\t${p.imei || ''}\t${extractGB(p.model) || ''}\t${extractColor(p.model) || ''}`;
        });
        const text = lines.join('\n');
        if (typeof GM_setClipboard === 'function') {
            GM_setClipboard(text);
        } else if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text);
        }
        if (window.showPositiveMessage) window.showPositiveMessage(t('Copy to Clipboard'));
    }

    function exportToCSV(phones, includeOriginalTitle) {
        const T = window.PHONE_CATALOG_TRANSLATIONS || {};
        const extractBaseModel = window.extractBaseModel || ((m) => m || '');
        const extractGB = window.extractGB || (() => '');
        const extractColor = window.extractColor || (() => '');
        const headers = includeOriginalTitle
            ? [T.Barcode || 'Barcode', T.Model || 'Model', T['Original Title'] || 'Original Title', T.Grade || 'Grade', T.IMEI || 'IMEI', T.Storage || 'Storage', T.Color || 'Color']
            : [T.Barcode || 'Barcode', T.Model || 'Model', T.Grade || 'Grade', T.IMEI || 'IMEI', T.Storage || 'Storage', T.Color || 'Color'];
        const rows = phones.map((p) => {
            const model = extractBaseModel(p.model) || p.model || p.name || '';
            const base = [p.barcode || '', model, p.grade || '', p.imei || '', extractGB(p.model) || '', extractColor(p.model) || ''];
            if (includeOriginalTitle) base.splice(2, 0, p.model || p.name || '');
            return base.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',');
        });
        const csv = [headers.map((h) => `"${h}"`).join(','), ...rows].join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `phone-catalog-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        if (window.showPositiveMessage) window.showPositiveMessage('✓ CSV exported successfully');
    }

    function wireSettingsMenu(overlay, getCtx) {
        const settingsBtn = overlay.querySelector('#tm-sl-settings');
        const settingsMenu = overlay.querySelector('#tm-sl-settings-menu');
        const exportBtn = overlay.querySelector('#tm-sl-export-btn');
        const exportMenu = overlay.querySelector('#tm-sl-export-menu');
        if (!settingsBtn || !settingsMenu) return;

        const hideMenus = () => {
            settingsMenu.hidden = true;
            if (exportMenu) exportMenu.hidden = true;
        };

        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (exportMenu) exportMenu.hidden = true;
            settingsMenu.hidden = !settingsMenu.hidden;
        });

        exportBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsMenu.hidden = true;
            if (!exportMenu) return;
            exportMenu.hidden = !exportMenu.hidden;
        });

        document.addEventListener('click', function onDocClick(e) {
            if (!overlay.isConnected) {
                document.removeEventListener('click', onDocClick);
                return;
            }
            if (settingsMenu.contains(e.target) || settingsBtn.contains(e.target)) return;
            if (exportMenu && (exportMenu.contains(e.target) || exportBtn?.contains(e.target))) return;
            hideMenus();
        });

        overlay.querySelector('#tm-sl-mystore-btn')?.addEventListener('click', () => {
            hideMenus();
            showMyStoreLocationModal(getCtx());
        });
        overlay.querySelector('#tm-sl-models-btn')?.addEventListener('click', () => {
            hideMenus();
            showModelsManagerModal(getCtx());
        });
        overlay.querySelector('#tm-sl-colors-btn')?.addEventListener('click', () => {
            hideMenus();
            showColorManagerModal(getCtx());
        });
        overlay.querySelector('#tm-sl-tags-btn')?.addEventListener('click', () => {
            hideMenus();
            showTagManagerModal(getCtx());
        });
        overlay.querySelector('#tm-sl-stores-btn')?.addEventListener('click', () => {
            hideMenus();
            showStoreRulesModal(getCtx());
        });

        overlay.querySelector('#tm-sl-export-clipboard')?.addEventListener('click', (e) => {
            e.stopPropagation();
            hideMenus();
            const ctx = getCtx();
            const phones = typeof ctx.getExportPhones === 'function' ? ctx.getExportPhones() : [...(ctx.allPhones || []), ...(ctx.otherStorePhones || [])];
            exportToClipboard(phones);
        });

        overlay.querySelector('#tm-sl-export-csv')?.addEventListener('click', (e) => {
            e.stopPropagation();
            hideMenus();
            const ctx = getCtx();
            const phones = typeof ctx.getExportPhones === 'function' ? ctx.getExportPhones() : [...(ctx.allPhones || []), ...(ctx.otherStorePhones || [])];
            const includeOriginalTitle = overlay.querySelector('#tm-sl-export-original-title')?.checked || false;
            exportToCSV(phones, includeOriginalTitle);
        });
    }

    window.PhoneCatalogSettings = {
        showColorManagerModal,
        showTagManagerModal,
        showStoreRulesModal,
        showMyStoreLocationModal,
        showModelsManagerModal,
        wireSettingsMenu,
        exportToClipboard,
        exportToCSV,
    };
})();
