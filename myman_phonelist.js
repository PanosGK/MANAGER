// ===================================================================
// === PHONE LIST FEATURE: SEARCHABLE PHONE CATALOG
// ===================================================================

// Cache constants
const PHONE_LIST_CACHE_KEY = 'tm_phone_list_cache';
const PHONE_LIST_CACHE_TIMESTAMP_KEY = 'tm_phone_list_cache_timestamp';
const CACHE_EXPIRATION_DAYS = 3; // Notify user if cache is older than 3 days
// v2: price parsing (div/input IDs) + UI shows retailPrice on other-store cards
const OTHER_STORE_CACHE_KEY = 'tm_phone_other_store_cache_v2';
const OTHER_STORE_CACHE_TIMESTAMP_KEY = 'tm_phone_other_store_cache_timestamp';
const OTHER_STORE_CACHE_EXPIRATION_DAYS = 1;

// Greek translations (using Unicode escape sequences to avoid encoding issues)
const PHONE_CATALOG_TRANSLATIONS = {
    'Phone Catalog': '\u039A\u03B1\u03C4\u03AC\u03BB\u03BF\u03B3\u03BF\u03C2 \u03A4\u03B7\u03BB\u03B5\u03C6\u03CE\u03BD\u03C9\u03BD',
    'Refresh (Ctrl+R)': '\u0391\u03BD\u03B1\u03BD\u03AD\u03C9\u03C3\u03B7 (Ctrl+R)',
    'Toggle View': '\u0391\u03BB\u03BB\u03B1\u03B3\u03AE \u03A0\u03C1\u03BF\u03B2\u03BF\u03BB\u03AE\u03C2',
    'Search...': '\u0391\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7...',
    'Regex': 'Regex',
    'Show Favorites': '\u0395\u03BC\u03C6\u03AC\u03BD\u03B9\u03C3\u03B7 \u0391\u03B3\u03B1\u03C0\u03B7\u03BC\u03AD\u03BD\u03C9\u03BD',
    'Fav': '\u0391\u03B3\u03B1\u03C0',
    'All Grades': '\u0392\u03B1\u03B8\u03BC\u03AF\u03B4\u03B5\u03C2',
    'All Models': '\u039C\u03BF\u03BD\u03C4\u03AD\u03BB\u03B1',
    'All Storage': '\u03A7\u03C9\u03C1\u03B7\u03C4\u03B9\u03BA\u03CC\u03C4\u03B7\u03C4\u03B1',
    'All Colors': '\u03A7\u03C1\u03CE\u03BC\u03B1\u03C4\u03B1',
    'All Tags': '\u0395\u03C4\u03B9\u03BA\u03AD\u03C4\u03B5\u03C2',
    'Sort by Model': '\u03A4\u03B1\u03BE\u03B9\u03BD\u03CC\u03BC\u03B7\u03C3\u03B7 \u03BA\u03B1\u03C4\u03AC \u039C\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF',
    'Sort by Grade': '\u03A4\u03B1\u03BE\u03B9\u03BD\u03CC\u03BC\u03B7\u03C3\u03B7 \u03BA\u03B1\u03C4\u03AC \u0392\u03B1\u03B8\u03BC\u03AF\u03B4\u03B1',
    'Sort by Storage': '\u03A4\u03B1\u03BE\u03B9\u03BD\u03CC\u03BC\u03B7\u03C3\u03B7 \u03BA\u03B1\u03C4\u03AC \u03A7\u03C9\u03C1\u03B7\u03C4\u03B9\u03BA\u03CC\u03C4\u03B7\u03C4\u03B1',
    'Sort by Color': '\u03A4\u03B1\u03BE\u03B9\u03BD\u03CC\u03BC\u03B7\u03C3\u03B7 \u03BA\u03B1\u03C4\u03AC \u03A7\u03C1\u03CE\u03BC\u03B1',
    'Sort by IMEI': '\u03A4\u03B1\u03BE\u03B9\u03BD\u03CC\u03BC\u03B7\u03C3\u03B7 \u03BA\u03B1\u03C4\u03AC IMEI',
    'Clear All Filters': '\u039A\u03B1\u03B8\u03B1\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 \u03A6\u03AF\u03BB\u03C4\u03C1\u03C9\u03BD',
    'Clear': '\u039A\u03B1\u03B8\u03B1\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2',
    'Toggle Sort Direction': '\u0391\u03BB\u03BB\u03B1\u03B3\u03AE \u039A\u03B1\u03C4\u03B5\u03CD\u03B8\u03C5\u03BD\u03C3\u03B7\u03C2 \u03A4\u03B1\u03BE\u03B9\u03BD\u03CC\u03BC\u03B7\u03C3\u03B7\u03C2',
    'Copy to Clipboard': '\u0391\u03BD\u03C4\u03B9\u03B3\u03C1\u03B1\u03C6\u03AE \u03C3\u03C4\u03BF \u03A0\u03C1\u03CC\u03C7\u03B5\u03B9\u03C1\u03BF',
    'Export to CSV': '\u0395\u03BE\u03B1\u03B3\u03C9\u03B3\u03AE \u03C3\u03B5 CSV',
    'Include Original Title': '\u03A3\u03C5\u03BC\u03C0\u03B5\u03C1\u03AF\u03BB\u03B7\u03C8\u03B7 \u0391\u03C1\u03C7\u03B9\u03BA\u03BF\u03CD \u03A4\u03AF\u03C4\u03BB\u03BF\u03C5',
    'Export Selected': '\u0395\u03BE\u03B1\u03B3\u03C9\u03B3\u03AE \u0395\u03C0\u03B9\u03BB\u03B5\u03B3\u03BC\u03AD\u03BD\u03C9\u03BD',
    'Selected': '\u0395\u03C0\u03B9\u03BB\u03B5\u03B3\u03BC\u03AD\u03BD\u03B1',
    'Select All': '\u0395\u03C0\u03B9\u03BB\u03BF\u03B3\u03AE \u038F\u03BB\u03C9\u03BD',
    'Deselect All': '\u0391\u03C0\u03BF\u03B5\u03C0\u03B9\u03BB\u03BF\u03B3\u03AE \u038F\u03BB\u03C9\u03BD',
    'Search barcode in system': '\u0391\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7 barcode \u03C3\u03C4\u03BF \u03C3\u03CD\u03C3\u03C4\u03B7\u03BC\u03B1',
    'Copy IMEI': '\u0391\u03BD\u03C4\u03B9\u03B3\u03C1\u03B1\u03C6\u03AE IMEI',
    'Add to favorites': '\u03A0\u03C1\u03BF\u03C3\u03B8\u03AE\u03BA\u03B7 \u03C3\u03C4\u03B1 \u03B1\u03B3\u03B1\u03C0\u03B7\u03BC\u03AD\u03BD\u03B1',
    'Remove from favorites': '\u0391\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03B1\u03C0\u03CC \u03C4\u03B1 \u03B1\u03B3\u03B1\u03C0\u03B7\u03BC\u03AD\u03BD\u03B1',
    'Copy Barcode': '\u0391\u03BD\u03C4\u03B9\u03B3\u03C1\u03B1\u03C6\u03AE Barcode',
    'Toggle Favorite': '\u0395\u03BD\u03B1\u03BB\u03BB\u03B1\u03B3\u03AE \u0391\u03B3\u03B1\u03C0\u03B7\u03BC\u03AD\u03BD\u03BF\u03C5',
    'Select': '\u0395\u03C0\u03B9\u03BB\u03BF\u03B3\u03AE',
    'Barcode': 'Barcode',
    'Model': '\u039C\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF',
    'Original Title': '\u0391\u03C1\u03C7\u03B9\u03BA\u03CC\u03C2 \u03A4\u03AF\u03C4\u03BB\u03BF\u03C2',
    'Grade': '\u0392\u03B1\u03B8\u03BC\u03AF\u03B4\u03B1',
    'IMEI': 'IMEI',
    'Storage': '\u03A7\u03C9\u03C1\u03B7\u03C4\u03B9\u03BA\u03CC\u03C4\u03B7\u03C4\u03B1',
    'Color': '\u03A7\u03C1\u03CE\u03BC\u03B1',
    'Export Options': '\u0395\u03C0\u03B9\u03BB\u03BF\u03B3\u03AD\u03C2 \u0395\u03BE\u03B1\u03B3\u03C9\u03B3\u03AE\u03C2',
    'Export': '\u0395\u03BE\u03B1\u03B3\u03C9\u03B3\u03AE',
    'Tags': '\u0395\u03C4\u03B9\u03BA\u03AD\u03C4\u03B5\u03C2',
    'Add Tag': '\u03A0\u03C1\u03BF\u03C3\u03B8\u03AE\u03BA\u03B7 \u0395\u03C4\u03B9\u03BA\u03AD\u03C4\u03B1\u03C2',
    'Remove Tag': '\u0391\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u0395\u03C4\u03B9\u03BA\u03AD\u03C4\u03B1\u03C2',
    'Filter by Tag': '\u03A6\u03AF\u03BB\u03C4\u03C1\u03BF \u03BA\u03B1\u03C4\u03AC \u0395\u03C4\u03B9\u03BA\u03AD\u03C4\u03B1',
    'All Tags': '\u038C\u03BB\u03B5\u03C2 \u03BF\u03B9 \u0395\u03C4\u03B9\u03BA\u03AD\u03C4\u03B5\u03C2',
    'Statistics': '\u03A3\u03C4\u03B1\u03C4\u03B9\u03C3\u03C4\u03B9\u03BA\u03AC',
    'Total': '\u03A3\u03CD\u03BD\u03BF\u03BB\u03BF',
    'By Grade': '\u0391\u03BD\u03AC \u0392\u03B1\u03B8\u03BC\u03AF\u03B4\u03B1',
    'By Model': '\u0391\u03BD\u03AC \u039C\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF',
    'Manage Colors': '\u0394\u03B9\u03B1\u03C7\u03B5\u03AF\u03C1\u03B9\u03C3\u03B7 \u03A7\u03C1\u03C9\u03BC\u03AC\u03C4\u03C9\u03BD',
    'Color Name': '\u038C\u03BD\u03BF\u03BC\u03B1 \u03A7\u03C1\u03CE\u03BC\u03B1\u03C4\u03BF\u03C2',
    'Add Color': '\u03A0\u03C1\u03BF\u03C3\u03B8\u03AE\u03BA\u03B7 \u03A7\u03C1\u03CE\u03BC\u03B1\u03C4\u03BF\u03C2',
    'Custom Colors': '\u03A7\u03C1\u03CE\u03BC\u03B1\u03C4\u03B1',
    'No custom colors yet': '\u0394\u03B5\u03BD \u03C5\u03C0\u03AC\u03C1\u03C7\u03BF\u03C5\u03BD \u03C7\u03C1\u03CE\u03BC\u03B1\u03C4\u03B1',
    'Color updated': '\u03A4\u03BF \u03C7\u03C1\u03CE\u03BC\u03B1 \u03B5\u03BD\u03B7\u03BC\u03B5\u03C1\u03CE\u03B8\u03B7\u03BA\u03B5',
    'Delete': '\u0394\u03B9\u03B1\u03B3\u03C1\u03B1\u03C6\u03AE',
    'Close': '\u039A\u03BB\u03B5\u03AF\u03C3\u03B9\u03BC\u03BF',
    'e.g. MINT GREEN': '\u03C0.\u03C7. MINT GREEN',
    'Color added': '\u03A4\u03BF \u03C7\u03C1\u03CE\u03BC\u03B1 \u03C0\u03C1\u03BF\u03C3\u03C4\u03AD\u03B8\u03B7\u03BA\u03B5',
    'Color removed': '\u03A4\u03BF \u03C7\u03C1\u03CE\u03BC\u03B1 \u03B1\u03C6\u03B1\u03B9\u03C1\u03AD\u03B8\u03B7\u03BA\u03B5',
    'Color already exists': '\u03A4\u03BF \u03C7\u03C1\u03CE\u03BC\u03B1 \u03C5\u03C0\u03AC\u03C1\u03C7\u03B5\u03B9 \u03AE\u03B4\u03B7',
    'Invalid color name or hex': '\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03BF \u03CC\u03BD\u03BF\u03BC\u03B1 \u03AE hex',
    'Suggested hex': '\u03A0\u03C1\u03BF\u03C4\u03B5\u03B9\u03BD\u03CC\u03BC\u03B5\u03BD\u03BF hex',
    'Catalog title color': '\u03A7\u03C1\u03CE\u03BC\u03B1 \u03C4\u03AF\u03C4\u03BB\u03BF\u03C5 \u03C3\u03C4\u03BF\u03BD \u03BA\u03B1\u03C4\u03AC\u03BB\u03BF\u03B3\u03BF',
    'Also for labels': '\u0395\u03C0\u03AF\u03C3\u03B7\u03C2 \u03B3\u03B9\u03B1 \u03BF\u03BD\u03BF\u03BC\u03B1\u03C3\u03AF\u03B5\u03C2',
    'Aliases hint': '\u03C0.\u03C7. SILVER, TITANIUM',
    'Manage Stores': '\u0394\u03B9\u03B1\u03C7\u03B5\u03AF\u03C1\u03B9\u03C3\u03B7 \u039A\u03B1\u03C4\u03B1\u03C3\u03C4\u03B7\u03BC\u03AC\u03C4\u03C9\u03BD',
    'Buyback store patterns': '\u03A0\u03C1\u03CC\u03C4\u03C5\u03C0\u03B1 \u03BF\u03BD\u03CC\u03BC\u03B1\u03C4\u03BF\u03C2 \u03B3\u03B9\u03B1 BB',
    'Buyback patterns hint': '\u03C0.\u03C7. IKE, \u0399\u039A\u0395 (\u03B1\u03BD \u03C4\u03BF \u03CC\u03BD\u03BF\u03BC\u03B1 \u03C0\u03B5\u03C1\u03B9\u03AD\u03C7\u03B5\u03B9 \u03B1\u03C5\u03C4\u03CC)',
    'Regular store patterns': '\u03A0\u03C1\u03CC\u03C4\u03C5\u03C0\u03B1 \u03BF\u03BD\u03CC\u03BC\u03B1\u03C4\u03BF\u03C2 \u03B3\u03B9\u03B1 \u03BA\u03B1\u03BD\u03BF\u03BD\u03B9\u03BA\u03AC',
    'Regular patterns hint': '\u039A\u03B5\u03BD\u03CC = \u03CC\u03BB\u03B1 \u03C4\u03B1 \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03AE\u03BC\u03B1\u03C4\u03B1',
    'Known stores': '\u0393\u03BD\u03C9\u03C3\u03C4\u03AC \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03AE\u03BC\u03B1\u03C4\u03B1',
    'Allow buyback': '\u0395\u03C0\u03B9\u03C4\u03C1\u03AD\u03C0\u03B5\u03C4\u03B1\u03B9 BB',
    'Allow regular': '\u0395\u03C0\u03B9\u03C4\u03C1\u03AD\u03C0\u03B5\u03C4\u03B1\u03B9 \u03BA\u03B1\u03BD\u03BF\u03BD\u03B9\u03BA\u03CC',
    'No known stores yet': '\u0394\u03B5\u03BD \u03B2\u03C1\u03AD\u03B8\u03B7\u03BA\u03B1\u03BD \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03AE\u03BC\u03B1\u03C4\u03B1 \u03B1\u03BA\u03CC\u03BC\u03B1',
    'Store rules saved': '\u039F\u03B9 \u03BA\u03B1\u03BD\u03CC\u03BD\u03B5\u03C2 \u03B1\u03C0\u03BF\u03B8\u03B7\u03BA\u03B5\u03BA\u03B5\u03C5\u03C3\u03B1\u03BD',
    'No buyback store': '\u0394\u03B5\u03BD \u03C5\u03C0\u03AC\u03C1\u03C7\u03B5\u03B9 \u03B5\u03C0\u03B9\u03C4\u03C1\u03B5\u03C0\u03CC\u03BC\u03B5\u03BD\u03BF \u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B7\u03BC\u03B1 \u03B3\u03B9\u03B1 BB',
    'Reset store overrides': '\u0395\u03C0\u03B1\u03BD\u03B1\u03C6\u03BF\u03C1\u03AC \u03B5\u03BE\u03B1\u03B9\u03C1\u03AD\u03C3\u03B5\u03C9\u03BD \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03B7\u03BC\u03AC\u03C4\u03C9\u03BD',
    'Save': '\u0391\u03C0\u03BF\u03B8\u03AE\u03BA\u03B5\u03C5\u03C3\u03B7',
    'Manage Tags': '\u0394\u03B9\u03B1\u03C7\u03B5\u03AF\u03C1\u03B9\u03C3\u03B7 \u0395\u03C4\u03B9\u03BA\u03B5\u03C4\u03CE\u03BD',
    'Tag Name': '\u038C\u03BD\u03BF\u03BC\u03B1 \u0395\u03C4\u03B9\u03BA\u03AD\u03C4\u03B1\u03C2',
    'Tag Color': '\u03A7\u03C1\u03CE\u03BC\u03B1 \u0395\u03C4\u03B9\u03BA\u03AD\u03C4\u03B1\u03C2',
    'Custom Tags': '\u0395\u03C4\u03B9\u03BA\u03AD\u03C4\u03B5\u03C2',
    'No custom tags yet': '\u0394\u03B5\u03BD \u03C5\u03C0\u03AC\u03C1\u03C7\u03BF\u03C5\u03BD \u03B5\u03C4\u03B9\u03BA\u03AD\u03C4\u03B5\u03C2',
    'Tag added': '\u0397 \u03B5\u03C4\u03B9\u03BA\u03AD\u03C4\u03B1 \u03C0\u03C1\u03BF\u03C3\u03C4\u03AD\u03B8\u03B7\u03BA\u03B5',
    'Tag removed': '\u0397 \u03B5\u03C4\u03B9\u03BA\u03AD\u03C4\u03B1 \u03B1\u03C6\u03B1\u03B9\u03C1\u03AD\u03B8\u03B7\u03BA\u03B5',
    'Tag already exists': '\u0397 \u03B5\u03C4\u03B9\u03BA\u03AD\u03C4\u03B1 \u03C5\u03C0\u03AC\u03C1\u03C7\u03B5\u03B9 \u03AE\u03B4\u03B7',
    'Invalid tag name': '\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03BF \u03CC\u03BD\u03BF\u03BC\u03B1 \u03B5\u03C4\u03B9\u03BA\u03AD\u03C4\u03B1\u03C2',
    'Create tags first': '\u0394\u03B7\u03BC\u03B9\u03BF\u03C5\u03C1\u03B3\u03AE\u03C3\u03C4\u03B5 \u03B5\u03C4\u03B9\u03BA\u03AD\u03C4\u03B5\u03C2 \u03B1\u03C0\u03CC \u0394\u03B9\u03B1\u03C7\u03B5\u03AF\u03C1\u03B9\u03C3\u03B7 \u0395\u03C4\u03B9\u03BA\u03B5\u03C4\u03CE\u03BD',
    'e.g. Reserved': '\u03C0.\u03C7. Reserved'
};

const PHONE_COLORS_STORAGE_KEY = 'tm_phone_colors_v2';
const PHONE_COLOR_ALIASES_KEY = 'tm_phone_color_display_aliases';
const LEGACY_CUSTOM_COLORS_STORAGE_KEY = 'tm_phone_custom_colors';
const PHONE_STORE_RULES_KEY = 'tm_phone_store_rules_v1';
const PHONE_TAG_DEFINITIONS_KEY = 'tm_phone_tag_definitions';

function normalizeTagKey(name) {
    return String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function formatTagNameFromKey(key) {
    return String(key || '').replace(/\b\w/g, c => c.toUpperCase());
}

function loadTagDefinitions() {
    try {
        const stored = GM_getValue(PHONE_TAG_DEFINITIONS_KEY, '{}');
        const parsed = JSON.parse(stored);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
        return {};
    }
}

function saveTagDefinitions(defs) {
    GM_setValue(PHONE_TAG_DEFINITIONS_KEY, JSON.stringify(defs));
}

function normalizeTagDefinitionEntry(value, key) {
    if (!value || typeof value !== 'object') {
        return { name: formatTagNameFromKey(key), color: '#9e9e9e' };
    }
    return {
        name: String(value.name || formatTagNameFromKey(key)).trim(),
        color: normalizePhoneColorHex(value.color) || '#9e9e9e'
    };
}

function getTagDefinition(key) {
    const defs = loadTagDefinitions();
    const nk = normalizeTagKey(key);
    return normalizeTagDefinitionEntry(defs[nk], nk);
}

function getTagColor(key) {
    return getTagDefinition(key).color;
}

function getTagDisplayName(key) {
    return getTagDefinition(key).name;
}

function getDefinedTagKeys() {
    return Object.keys(loadTagDefinitions()).sort((a, b) =>
        getTagDisplayName(a).localeCompare(getTagDisplayName(b), undefined, { sensitivity: 'base' })
    );
}

function addTagDefinition(name, color) {
    const key = normalizeTagKey(name);
    if (!key) return { ok: false, error: 'invalid' };
    const defs = loadTagDefinitions();
    if (defs[key]) return { ok: false, error: 'exists' };
    defs[key] = {
        name: String(name).trim(),
        color: normalizePhoneColorHex(color) || '#9e9e9e'
    };
    saveTagDefinitions(defs);
    return { ok: true, key };
}

function updateTagDefinition(key, name, color) {
    const oldKey = normalizeTagKey(key);
    const newKey = normalizeTagKey(name);
    if (!oldKey || !newKey) return { ok: false, error: 'invalid' };
    const defs = loadTagDefinitions();
    if (!defs[oldKey]) return { ok: false, error: 'missing' };
    if (newKey !== oldKey && defs[newKey]) return { ok: false, error: 'exists' };
    const entry = {
        name: String(name).trim(),
        color: normalizePhoneColorHex(color) || '#9e9e9e'
    };
    if (newKey !== oldKey) delete defs[oldKey];
    defs[newKey] = entry;
    saveTagDefinitions(defs);
    return { ok: true, key: newKey, renamed: newKey !== oldKey, oldKey };
}

function deleteTagDefinition(key) {
    const nk = normalizeTagKey(key);
    const defs = loadTagDefinitions();
    if (!defs[nk]) return false;
    delete defs[nk];
    saveTagDefinitions(defs);
    return true;
}

const DEFAULT_TITANIUM_LIST_HEX = '#8E8E93';

function normalizeColorEntry(value, colorName = '') {
    if (!value) return { hex: null, listHex: null };
    const defaults = colorName ? getDefaultPhoneColors()[normalizePhoneColorName(colorName)] : null;
    if (typeof value === 'string') {
        const hex = normalizePhoneColorHex(value);
        const listHex = defaults?.listHex || hex;
        return { hex, listHex };
    }
    if (typeof value === 'object') {
        const hex = normalizePhoneColorHex(value.hex || value.listHex);
        const listHex = normalizePhoneColorHex(value.listHex || value.hex || defaults?.listHex) || hex;
        return { hex, listHex };
    }
    return { hex: null, listHex: null };
}

function normalizeStoredPhoneColors(parsed) {
    const result = {};
    if (!parsed || typeof parsed !== 'object') return result;
    Object.entries(parsed).forEach(([name, val]) => {
        const key = normalizePhoneColorName(name) || name;
        result[key] = normalizeColorEntry(val, key);
    });
    return result;
}

function getDefaultPhoneColors() {
    const ti = DEFAULT_TITANIUM_LIST_HEX;
    return {
        'BLACK': { hex: '#000000', listHex: '#000000' },
        'BLUE': { hex: '#007AFF', listHex: '#007AFF' },
        'DESERT': { hex: '#EDC9AF', listHex: '#EDC9AF' },
        'DESSERT': { hex: '#EDC9AF', listHex: '#EDC9AF' },
        'GOLD': { hex: '#FFD700', listHex: '#FFD700' },
        'NATURAL': { hex: '#D2B48C', listHex: '#D2B48C' },
        'TITANIUM': { hex: ti, listHex: ti },
        'NATURAL TITANIUM': { hex: '#D2B48C', listHex: ti },
        'BLACK TITANIUM': { hex: '#2C2C2C', listHex: '#3A3A3C' },
        'DESERT TITANIUM': { hex: '#E3C9A8', listHex: '#C9B89A' },
        'DESSERT TITANIUM': { hex: '#E3C9A8', listHex: '#C9B89A' },
        'WHITE TITANIUM': { hex: '#F5F5F0', listHex: '#E8E8E3' },
        'BLUE TITANIUM': { hex: '#4A90E2', listHex: '#5B9BD5' },
        'MIDNIGHT GREEN': { hex: '#4E5851', listHex: '#4E5851' },
        'JET BLACK': { hex: '#0A0A0A', listHex: '#0A0A0A' },
        'DEEP BLUE': { hex: '#003D5B', listHex: '#003D5B' },
        'STEEL GRAY': { hex: '#8B8D8F', listHex: '#8B8D8F' },
        'COSMIC ORANGE': { hex: '#FF6B35', listHex: '#FF6B35' },
        'PURPLE': { hex: '#AF52DE', listHex: '#AF52DE' },
        'RED': { hex: '#FF0000', listHex: '#FF0000' },
        'SILVER': { hex: '#C0C0C0', listHex: '#C0C0C0' },
        'WHITE': { hex: '#FFFFFF', listHex: '#FFFFFF' },
        'YELLOW': { hex: '#FFD700', listHex: '#FFD700' },
        'PACIFIC BLUE': { hex: '#1E90FF', listHex: '#1E90FF' },
        'SIERRA BLUE': { hex: '#5AC8FA', listHex: '#5AC8FA' },
        'DEEP PURPLE': { hex: '#9370DB', listHex: '#9370DB' },
        'GREEN': { hex: '#34C759', listHex: '#34C759' },
        'GRAPHITE': { hex: '#3A3A3A', listHex: '#3A3A3A' },
        'SPACE GRAY': { hex: '#4A4A4A', listHex: '#4A4A4A' },
        'SPACE GREY': { hex: '#4A4A4A', listHex: '#4A4A4A' },
        'SPACE BLACK': { hex: '#000000', listHex: '#000000' },
        'ROSE GOLD': { hex: '#B76E79', listHex: '#B76E79' },
        'MIDNIGHT': { hex: '#1D1D1F', listHex: '#1D1D1F' },
        'ULTRAMARINE': { hex: '#4169E1', listHex: '#4169E1' },
        'TEAL': { hex: '#008080', listHex: '#008080' },
        'CORAL': { hex: '#FF7F50', listHex: '#FF7F50' },
        'SLATE': { hex: '#708090', listHex: '#708090' },
        'PINK': { hex: '#FF69B4', listHex: '#FF69B4' },
        'STARLIGHT': { hex: '#FAF0E6', listHex: '#FAF0E6' },
        'LAVENDER': { hex: '#E6E6FA', listHex: '#E6E6FA' }
    };
}

function getDefaultColorDisplayAliases() {
    return {
        'TITANIUM': 'NATURAL TITANIUM'
    };
}

function loadColorDisplayAliases() {
    try {
        const stored = GM_getValue(PHONE_COLOR_ALIASES_KEY, null);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === 'object') return parsed;
        }
        const defaults = getDefaultColorDisplayAliases();
        saveColorDisplayAliases(defaults);
        return { ...defaults };
    } catch (e) {
        return { ...getDefaultColorDisplayAliases() };
    }
}

function saveColorDisplayAliases(aliases) {
    GM_setValue(PHONE_COLOR_ALIASES_KEY, JSON.stringify(aliases));
}

function resolveDisplayColorName(colorName) {
    if (!colorName) return '';
    const normalized = normalizePhoneColorName(colorName);
    const aliases = loadColorDisplayAliases();
    return aliases[normalized] || normalized;
}

function getColorEntry(colorName) {
    if (!colorName) return { hex: null, listHex: null };
    const colors = loadPhoneColors();
    const resolved = resolveDisplayColorName(colorName);
    return normalizeColorEntry(colors[resolved] || colors[normalizePhoneColorName(colorName)]);
}

function getListColorHex(colorName) {
    const entry = getColorEntry(colorName);
    return entry.listHex || entry.hex || null;
}

function parseCssColorRgb(color) {
    const s = String(color || '').trim();
    const rgba = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgba) return { r: +rgba[1], g: +rgba[2], b: +rgba[3] };
    const hex = s.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (hex) {
        return {
            r: parseInt(hex[1], 16),
            g: parseInt(hex[2], 16),
            b: parseInt(hex[3], 16),
        };
    }
    return null;
}

function colorRgbLuminance(rgb) {
    return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

function isCatalogDarkTheme() {
    if (typeof window.tmIsLightEquippedTheme === 'function') {
        return !window.tmIsLightEquippedTheme();
    }
    const themeId = typeof window.tmReadEquippedThemeId === 'function'
        ? window.tmReadEquippedThemeId()
        : String(window.__tmEarlyThemeId || 'default');
    return themeId !== 'default' && themeId !== 'solarized_light' && themeId !== 'liquid_glass'
        && themeId !== 'paper_white' && themeId !== 'blush_cream' && themeId !== 'daylight_sky';
}

function isDarkPhoneColorHex(hex) {
    const rgb = parseCssColorRgb(hex);
    if (!rgb) return false;
    return colorRgbLuminance(rgb) < 0.45;
}

function isWhitePhoneColor(colorName) {
    if (!colorName) return false;
    return colorName.toUpperCase().includes('WHITE');
}

function getWhitePhoneTitleOutlineStyle() {
    return '-webkit-text-stroke:0.65px rgba(0,0,0,0.7);text-shadow:0 0 1px rgba(0,0,0,0.85),0 1px 3px rgba(0,0,0,0.4);paint-order:stroke fill;';
}

function getDarkPhoneTitleOutlineStyle() {
    return '-webkit-text-stroke:0.65px rgba(255,255,255,0.88);text-shadow:0 0 1px rgba(255,255,255,0.95),0 1px 3px rgba(0,0,0,0.5);paint-order:stroke fill;';
}

function getPhoneCatalogOutlineStyle(colorName, colorHex) {
    if (isWhitePhoneColor(colorName)) {
        return getWhitePhoneTitleOutlineStyle();
    }
    if (isCatalogDarkTheme() && colorHex && isDarkPhoneColorHex(colorHex)) {
        return getDarkPhoneTitleOutlineStyle();
    }
    return '';
}

function getPhoneCatalogMetaTextStyle(extra = '') {
    return `color:var(--tm-shop-item-text);font-weight:500;${extra}`;
}

function getPhoneStorageChipStyle() {
    return 'border-radius:20px;padding:1px 7px;font-size:10px;font-weight:600;flex-shrink:0;';
}

function getPhonePricePillStyle() {
    return 'margin-left:auto;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;white-space:nowrap;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;font-variant-numeric:tabular-nums;';
}

function getPhoneBarcodeStyle() {
    return "font-family:'Courier New',Consolas,monospace;font-size:11px;font-weight:600;font-variant-numeric:tabular-nums;letter-spacing:0.04em;border-radius:5px;padding:1px 7px;line-height:1.35;";
}

function getPhoneGradeDisplayStyle(grade) {
    const gradeColor = getPhoneGradeColor(grade);
    const outline = (isCatalogDarkTheme() && isDarkPhoneColorHex(gradeColor))
        ? getDarkPhoneTitleOutlineStyle()
        : '';
    return `color:${gradeColor};font-weight:600;font-size:11px;${outline}`;
}

function getPhoneGradeCircleStyle(grade) {
    const gradeColor = getPhoneGradeColor(grade);
    const outline = (isCatalogDarkTheme() && isDarkPhoneColorHex(gradeColor))
        ? getDarkPhoneTitleOutlineStyle()
        : '';
    return `background:${gradeColor}20;color:${gradeColor};border:2px solid ${gradeColor}50;${outline}`;
}

function getPhoneModelTitleStyle(colorName, colorHex) {
    const titleColor = colorHex || 'var(--tm-shop-item-text)';
    const outline = getPhoneCatalogOutlineStyle(colorName, colorHex);
    const glow = (!isCatalogDarkTheme() && !isWhitePhoneColor(colorName) && colorHex)
        ? `text-shadow:0 0 12px ${colorHex}55;`
        : '';
    return `font-weight:800;font-size:13px;color:${titleColor};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;${outline}${glow}`;
}

function getPhoneColorLabelStyle(colorName, colorHex) {
    const outline = getPhoneCatalogOutlineStyle(colorName, colorHex);
    const color = colorHex || 'var(--tm-shop-item-text)';
    return `display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:500;opacity:0.85;color:${color};${outline}`;
}

function applyPhoneCatalogTextOutline(el, colorName, colorHex) {
    if (!el) return;
    el.style.webkitTextStroke = '';
    el.style.textShadow = '';
    el.style.paintOrder = '';
    if (isWhitePhoneColor(colorName)) {
        el.style.webkitTextStroke = '0.65px rgba(0,0,0,0.7)';
        el.style.textShadow = '0 0 1px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.4)';
        el.style.paintOrder = 'stroke fill';
    } else if (isCatalogDarkTheme() && colorHex && isDarkPhoneColorHex(colorHex)) {
        el.style.webkitTextStroke = '0.65px rgba(255,255,255,0.88)';
        el.style.textShadow = '0 0 1px rgba(255,255,255,0.95), 0 1px 3px rgba(0,0,0,0.5)';
        el.style.paintOrder = 'stroke fill';
    }
}

function getPhoneColorDropdownStyle(colorName) {
    if (!colorName) {
        return 'background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);padding:10px;';
    }
    const hex = getListColorHex(colorName) || '#808080';
    const outline = getPhoneCatalogOutlineStyle(colorName, hex);
    return `background:var(--tm-shop-item-bg);color:${hex};font-weight:700;padding:10px;${outline}`;
}

function stylePhoneColorSelectOption(option, colorName) {
    if (!option) return;
    option.style.cssText = getPhoneColorDropdownStyle(colorName);
}

function syncPhoneColorSelectDisplay(selectEl) {
    if (!selectEl) return;
    if (!selectEl.value) {
        selectEl.style.color = 'var(--tm-shop-item-text, var(--tm-primary-color))';
        selectEl.style.fontWeight = '';
        selectEl.style.webkitTextStroke = '';
        selectEl.style.textShadow = '';
        return;
    }
    const hex = getListColorHex(selectEl.value);
    if (!hex) return;
    selectEl.style.color = hex;
    selectEl.style.fontWeight = '700';
    applyPhoneCatalogTextOutline(selectEl, selectEl.value, hex);
}

function getSwatchColorHex(colorName) {
    const entry = getColorEntry(colorName);
    return entry.hex || entry.listHex || null;
}

function getAliasesForColor(colorName) {
    const target = normalizePhoneColorName(colorName);
    return Object.entries(loadColorDisplayAliases())
        .filter(([, mapped]) => mapped === target)
        .map(([alias]) => alias)
        .sort();
}

function setColorDisplayAliasesForColor(colorName, aliasCsv) {
    const target = normalizePhoneColorName(colorName);
    if (!target) return false;
    const aliases = loadColorDisplayAliases();
    Object.keys(aliases).forEach(alias => {
        if (aliases[alias] === target) delete aliases[alias];
    });
    String(aliasCsv || '')
        .split(',')
        .map(part => normalizePhoneColorName(part))
        .filter(alias => alias && alias !== target)
        .forEach(alias => {
            aliases[alias] = target;
        });
    saveColorDisplayAliases(aliases);
    syncPhoneColorCatalog();
    return true;
}

function normalizePhoneColorName(name) {
    return String(name || '').trim().replace(/\s+/g, ' ').toUpperCase();
}

function normalizePhoneColorHex(hex) {
    const value = String(hex || '').trim();
    if (/^#[0-9A-Fa-f]{3}$/.test(value)) {
        const r = value[1], g = value[2], b = value[3];
        return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        return value.toUpperCase();
    }
    return null;
}

function loadPhoneColors() {
    try {
        const stored = GM_getValue(PHONE_COLORS_STORAGE_KEY, null);
        if (stored) {
            let parsed = normalizeStoredPhoneColors(JSON.parse(stored));
            if (parsed && Object.keys(parsed).length > 0) {
                const defaults = getDefaultPhoneColors();
                let needsSave = false;
                Object.entries(defaults).forEach(([name, entry]) => {
                    if (!parsed[name]) {
                        parsed[name] = { ...normalizeColorEntry(entry, name) };
                        needsSave = true;
                    } else {
                        const normalized = normalizeColorEntry(parsed[name], name);
                        const defaultEntry = normalizeColorEntry(entry, name);
                        if (defaultEntry.listHex && normalized.listHex === normalized.hex && defaultEntry.listHex !== normalized.listHex) {
                            normalized.listHex = defaultEntry.listHex;
                            needsSave = true;
                        }
                        if (JSON.stringify(parsed[name]) !== JSON.stringify(normalized)) {
                            parsed[name] = normalized;
                            needsSave = true;
                        }
                    }
                });
                if (needsSave) savePhoneColors(parsed);
                return parsed;
            }
        }

        const defaults = getDefaultPhoneColors();
        let merged = { ...defaults };

        const legacyCustom = GM_getValue(LEGACY_CUSTOM_COLORS_STORAGE_KEY, null);
        if (legacyCustom) {
            try {
                const custom = normalizeStoredPhoneColors(JSON.parse(legacyCustom));
                merged = { ...defaults, ...custom };
            } catch (e) { /* ignore */ }
        }

        savePhoneColors(merged);
        return { ...merged };
    } catch (e) {
        return { ...getDefaultPhoneColors() };
    }
}

function savePhoneColors(colors) {
    GM_setValue(PHONE_COLORS_STORAGE_KEY, JSON.stringify(colors));
}

function normalizeTextForColorMatch(text) {
    let modelUpper = String(text || '').toUpperCase();
    modelUpper = modelUpper.replace(/DESSERT TITANIUM/g, 'DESERT TITANIUM');
    modelUpper = modelUpper.replace(/\bDESERT\b(?!\s+TITANIUM)/g, 'DESERT TITANIUM');
    modelUpper = modelUpper.replace(/SPACE GREY/g, 'SPACE GRAY');
    return modelUpper;
}

function getAllPhoneColorNamesForMatching() {
    const defaults = getDefaultPhoneColors();
    let saved = {};
    try {
        const raw = GM_getValue(PHONE_COLORS_STORAGE_KEY, null);
        if (raw) saved = normalizeStoredPhoneColors(JSON.parse(raw));
    } catch (e) { /* ignore */ }
    return [...new Set([...Object.keys(defaults), ...Object.keys(saved)])];
}

function matchPhoneColorInText(text) {
    const modelUpper = normalizeTextForColorMatch(text);
    const multiWordColors = getAllPhoneColorNamesForMatching()
        .filter(name => name.includes(' '))
        .sort((a, b) => b.length - a.length);
    for (const color of multiWordColors) {
        if (modelUpper.includes(color)) {
            return color === 'SPACE GREY' ? 'SPACE GRAY' : color;
        }
    }
    const singleColors = getAllPhoneColorNamesForMatching().filter(name => !name.includes(' '));
    for (const color of singleColors) {
        if (modelUpper.includes(' ' + color) || modelUpper.endsWith(color) || modelUpper.includes(color + ' ')) {
            return color;
        }
    }
    return '';
}

function syncPhoneColorCatalog(phones) {
    const defaults = getDefaultPhoneColors();
    const colors = loadPhoneColors();
    let changed = false;

    Object.entries(defaults).forEach(([name, entry]) => {
        if (!colors[name]) {
            colors[name] = { ...normalizeColorEntry(entry, name) };
            changed = true;
        }
    });

    const aliases = loadColorDisplayAliases();
    Object.entries(aliases).forEach(([alias, target]) => {
        if (colors[alias]) return;
        const targetEntry = normalizeColorEntry(colors[target] || defaults[target], target);
        if (targetEntry.hex || targetEntry.listHex) {
            colors[alias] = { hex: targetEntry.hex, listHex: targetEntry.listHex };
            changed = true;
        }
    });

    if (phones && phones.length) {
        const discovered = new Set();
        phones.forEach(phone => {
            const title = phone.name || phone.model || '';
            const found = matchPhoneColorInText(title);
            if (found) discovered.add(found);
        });
        discovered.forEach(name => {
            if (colors[name]) return;
            const def = defaults[name];
            const suggestion = suggestPhoneColorHex(name);
            const hex = def?.hex || suggestion?.hex || '#808080';
            const listHex = def?.listHex || suggestion?.hex || hex;
            colors[name] = normalizeColorEntry({ hex, listHex }, name);
            changed = true;
        });
    }

    if (changed) savePhoneColors(colors);
    return changed;
}

function getPhoneColorNames() {
    return Object.keys(loadPhoneColors());
}

function getMultiWordPhoneColors() {
    return getPhoneColorNames()
        .filter(name => name.includes(' '))
        .sort((a, b) => b.length - a.length);
}

function getSingleWordPhoneColors() {
    return getPhoneColorNames().filter(name => !name.includes(' '));
}

function getAllKnownColorsForModelFix() {
    return getPhoneColorNames();
}

function getAllColorHexMap() {
    const map = {};
    Object.entries(loadPhoneColors()).forEach(([name, entry]) => {
        const normalized = normalizeColorEntry(entry);
        const hex = normalized.listHex || normalized.hex;
        if (hex) map[name.toUpperCase()] = hex;
    });
    return map;
}

function addPhoneColor(name, hex, listHex = null) {
    const normalizedName = normalizePhoneColorName(name);
    const normalizedHex = normalizePhoneColorHex(hex);
    const normalizedListHex = normalizePhoneColorHex(listHex) || normalizedHex;
    if (!normalizedName || !normalizedHex) return { ok: false, error: 'invalid' };
    const colors = loadPhoneColors();
    if (colors[normalizedName]) return { ok: false, error: 'exists' };
    colors[normalizedName] = { hex: normalizedHex, listHex: normalizedListHex };
    savePhoneColors(colors);
    return { ok: true, name: normalizedName, hex: normalizedHex, listHex: normalizedListHex };
}

function updatePhoneColor(name, hex) {
    const normalizedName = normalizePhoneColorName(name);
    const normalizedHex = normalizePhoneColorHex(hex);
    if (!normalizedName || !normalizedHex) return false;
    const colors = loadPhoneColors();
    if (!colors[normalizedName]) return false;
    const entry = normalizeColorEntry(colors[normalizedName]);
    entry.hex = normalizedHex;
    colors[normalizedName] = entry;
    savePhoneColors(colors);
    return true;
}

function updatePhoneListColor(name, listHex) {
    const normalizedName = normalizePhoneColorName(name);
    const normalizedListHex = normalizePhoneColorHex(listHex);
    if (!normalizedName || !normalizedListHex) return false;
    const colors = loadPhoneColors();
    if (!colors[normalizedName]) return false;
    const entry = normalizeColorEntry(colors[normalizedName]);
    entry.listHex = normalizedListHex;
    colors[normalizedName] = entry;
    savePhoneColors(colors);
    return true;
}

function removePhoneColor(name) {
    const normalizedName = normalizePhoneColorName(name);
    const colors = loadPhoneColors();
    if (!colors[normalizedName]) return false;
    delete colors[normalizedName];
    savePhoneColors(colors);
    const aliases = loadColorDisplayAliases();
    Object.keys(aliases).forEach(alias => {
        if (aliases[alias] === normalizedName) delete aliases[alias];
    });
    saveColorDisplayAliases(aliases);
    return true;
}

function renamePhoneColor(oldName, newName) {
    const oldKey = normalizePhoneColorName(oldName);
    const newKey = normalizePhoneColorName(newName);
    if (!oldKey || !newKey) return { ok: false, error: 'invalid' };
    if (oldKey === newKey) return { ok: true, name: oldKey };
    const colors = loadPhoneColors();
    if (!colors[oldKey]) return { ok: false, error: 'missing' };
    if (colors[newKey]) return { ok: false, error: 'exists' };

    colors[newKey] = { ...normalizeColorEntry(colors[oldKey], oldKey) };
    delete colors[oldKey];
    savePhoneColors(colors);

    const aliases = loadColorDisplayAliases();
    Object.keys(aliases).forEach(alias => {
        if (aliases[alias] === oldKey) aliases[alias] = newKey;
    });
    if (aliases[oldKey]) {
        if (!aliases[newKey]) aliases[newKey] = aliases[oldKey];
        delete aliases[oldKey];
    }
    saveColorDisplayAliases(aliases);
    syncPhoneColorCatalog();
    return { ok: true, name: newKey };
}

const PHONE_COLOR_WORD_HINTS = {
    BLACK: '#000000', WHITE: '#FFFFFF', SILVER: '#C0C0C0', GOLD: '#FFD700',
    BLUE: '#007AFF', RED: '#FF0000', GREEN: '#34C759', PURPLE: '#AF52DE',
    PINK: '#FF69B4', ORANGE: '#FF6B35', YELLOW: '#FFD700', GRAY: '#8B8D8F',
    GREY: '#8B8D8F', TITANIUM: '#D2B48C', MIDNIGHT: '#1D1D1F', STARLIGHT: '#FAF0E6',
    GRAPHITE: '#3A3A3A', ULTRAMARINE: '#4169E1', TEAL: '#008080', CORAL: '#FF7F50',
    SLATE: '#708090', LAVENDER: '#E6E6FA', NATURAL: '#D2B48C', DESERT: '#EDC9AF',
    DESSERT: '#EDC9AF', COSMIC: '#FF6B35', PACIFIC: '#1E90FF', SIERRA: '#5AC8FA',
    JET: '#0A0A0A', STEEL: '#8B8D8F', ROSE: '#B76E79', MINT: '#98FF98',
    SKY: '#87CEEB', SAGE: '#9DC183', NAVY: '#000080', BRONZE: '#CD7F32',
    COPPER: '#B87333', CREAM: '#FFFDD0', SAND: '#C2B280', LIME: '#32CD32'
};

let _cssColorProbeEl = null;

function cssColorNameToHex(colorName) {
    if (!colorName || typeof document === 'undefined') return null;
    if (!_cssColorProbeEl) {
        _cssColorProbeEl = document.createElement('div');
        _cssColorProbeEl.style.display = 'none';
        document.documentElement.appendChild(_cssColorProbeEl);
    }
    _cssColorProbeEl.style.color = 'rgb(1, 2, 3)';
    _cssColorProbeEl.style.color = colorName;
    const computed = getComputedStyle(_cssColorProbeEl).color;
    if (!computed || computed === 'rgb(1, 2, 3)') return null;
    const match = computed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (!match) return null;
    const hex = '#' + [match[1], match[2], match[3]]
        .map(n => parseInt(n, 10).toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
    return normalizePhoneColorHex(hex);
}

function findBestMatchingSavedColor(name, saved) {
    const keys = Object.keys(saved);
    const words = name.split(' ').filter(Boolean);
    let bestKey = null;
    let bestScore = 0;
    keys.forEach(key => {
        if (key.includes(name) || name.includes(key)) {
            const score = key.length + 1000;
            if (score > bestScore) {
                bestScore = score;
                bestKey = key;
            }
            return;
        }
        const matchedWords = words.filter(word => key.includes(word)).length;
        if (matchedWords > bestScore) {
            bestScore = matchedWords;
            bestKey = key;
        }
    });
    return bestScore > 0 ? bestKey : null;
}

function guessHexFromPhoneColorKeywords(name) {
    const words = name.split(' ').filter(Boolean);
    for (let i = words.length - 1; i >= 0; i--) {
        const hint = PHONE_COLOR_WORD_HINTS[words[i]];
        if (hint) return hint;
    }
    return null;
}

function suggestPhoneColorHex(colorName) {
    const normalized = normalizePhoneColorName(colorName);
    if (!normalized) return null;

    const saved = loadPhoneColors();
    const savedEntry = normalizeColorEntry(saved[normalized]);
    if (savedEntry.hex || savedEntry.listHex) {
        return { hex: savedEntry.listHex || savedEntry.hex, source: normalized };
    }

    const fuzzyKey = findBestMatchingSavedColor(normalized, saved);
    if (fuzzyKey) {
        const fuzzyEntry = normalizeColorEntry(saved[fuzzyKey]);
        return { hex: fuzzyEntry.listHex || fuzzyEntry.hex, source: fuzzyKey };
    }

    const words = normalized.toLowerCase().split(' ');
    const cssCandidates = [
        normalized.toLowerCase().replace(/\s+/g, ''),
        ...words.slice().reverse()
    ];
    for (const candidate of cssCandidates) {
        const hex = cssColorNameToHex(candidate);
        if (hex) return { hex, source: candidate };
    }

    const hintHex = guessHexFromPhoneColorKeywords(normalized);
    if (hintHex) {
        return { hex: hintHex, source: words[words.length - 1].toUpperCase() };
    }

    return null;
}

// Backward-compatible aliases used elsewhere in this file
function getAllMultiWordColors() { return getMultiWordPhoneColors(); }
function getAllSingleColors() { return getSingleWordPhoneColors(); }
function normalizeCustomColorName(name) { return normalizePhoneColorName(name); }
function normalizeCustomColorHex(hex) { return normalizePhoneColorHex(hex); }
function addCustomPhoneColor(name, hex) { return addPhoneColor(name, hex); }
function removeCustomPhoneColor(name) { return removePhoneColor(name); }
function getCustomColorNames() { return getPhoneColorNames(); }
function loadCustomColors() { return loadPhoneColors(); }

// Grade token in product titles: A+ (premium), A (standard); legacy B/C still parsed when present
const PHONE_GRADE_ALT = 'A\\+|Α\\+|A|Α|B|Β|C|Γ';
const PHONE_GRADE_CAPTURE = `(${PHONE_GRADE_ALT})`;
const PHONE_GRADE_MATCH = `(?:${PHONE_GRADE_ALT})`;
const PHONE_GRADE_OPTIONAL = `(?:${PHONE_GRADE_ALT})?`;
const PHONE_GRADE_OPTIONAL_CAPTURE = `(${PHONE_GRADE_ALT})?`;

function normalizePhoneGrade(raw) {
    if (!raw) return '';
    const g = String(raw).toUpperCase();
    if (g === 'Α+') return 'A+';
    if (g === 'Α') return 'A';
    if (g === 'Β') return 'B';
    if (g === 'Γ') return 'C';
    return g;
}

function getPhoneGradeColor(grade) {
    switch (normalizePhoneGrade(grade)) {
        case 'A+': return '#2e7d32';
        case 'A': return '#4caf50';
        case 'B': return '#ff9800';
        case 'C': return '#f44336';
        default: return '#607d8b';
    }
}

function comparePhoneGrades(a, b) {
    const order = { 'A+': 0, 'A': 1, 'B': 2, 'C': 3 };
    return (order[normalizePhoneGrade(a)] ?? 99) - (order[normalizePhoneGrade(b)] ?? 99);
}

// Helper function to safely get translations
function t(key) {
    return PHONE_CATALOG_TRANSLATIONS[key] || key;
}

function isIphoneTitlePhone(phone) {
    return String(phone?.name || '').toUpperCase().includes('IPHONE');
}

function filterIphoneTitlePhones(phones) {
    if (!Array.isArray(phones)) return [];
    return phones.filter(isIphoneTitlePhone);
}

function isBuybackTitle(name) {
    const upper = String(name || '').toUpperCase();
    return /(?:BB|ΒΒ)[\-:]/.test(upper) || /\(BB[-:]/i.test(upper) || /\(ΒΒ[-:]/i.test(upper);
}

function getDefaultPhoneStoreRules() {
    return {
        buybackPatterns: ['IKE', 'ΙΚΕ'],
        regularPatterns: [],
        overrides: {}
    };
}

function parseStorePatternCsv(csv) {
    return String(csv || '')
        .split(',')
        .map(part => part.trim())
        .filter(Boolean);
}

function loadPhoneStoreRules() {
    try {
        const raw = GM_getValue(PHONE_STORE_RULES_KEY, null);
        if (raw) {
            const parsed = JSON.parse(raw);
            const defaults = getDefaultPhoneStoreRules();
            return {
                buybackPatterns: Array.isArray(parsed.buybackPatterns) ? parsed.buybackPatterns : defaults.buybackPatterns,
                regularPatterns: Array.isArray(parsed.regularPatterns) ? parsed.regularPatterns : defaults.regularPatterns,
                overrides: parsed.overrides && typeof parsed.overrides === 'object' ? parsed.overrides : {}
            };
        }
    } catch (e) { /* ignore */ }
    const defaults = getDefaultPhoneStoreRules();
    savePhoneStoreRules(defaults);
    return { ...defaults, overrides: { ...defaults.overrides } };
}

function savePhoneStoreRules(rules) {
    GM_setValue(PHONE_STORE_RULES_KEY, JSON.stringify(rules));
}

function normalizeStoreDisplayName(name) {
    return String(name || '').replace(/\s*ΕΜΠΟΡΕΥΣΙΜΩΝ/gi, '').trim();
}

function storeNameMatchesPatterns(storeName, patterns) {
    if (!patterns || patterns.length === 0) return true;
    const clean = normalizeStoreDisplayName(storeName).toUpperCase();
    return patterns.some(pattern => {
        const token = String(pattern || '').trim().toUpperCase();
        return token && clean.includes(token);
    });
}

function isStoreAllowedForBuybackPhone(storeName) {
    const rules = loadPhoneStoreRules();
    const key = normalizeStoreDisplayName(storeName);
    if (rules.overrides[key] && typeof rules.overrides[key].buyback === 'boolean') {
        return rules.overrides[key].buyback;
    }
    return storeNameMatchesPatterns(storeName, rules.buybackPatterns);
}

function isStoreAllowedForRegularPhone(storeName) {
    const rules = loadPhoneStoreRules();
    const key = normalizeStoreDisplayName(storeName);
    if (rules.overrides[key] && typeof rules.overrides[key].regular === 'boolean') {
        return rules.overrides[key].regular;
    }
    return storeNameMatchesPatterns(storeName, rules.regularPatterns);
}

function isStoreAllowedForPhone(storeName, isBuyback) {
    return isBuyback ? isStoreAllowedForBuybackPhone(storeName) : isStoreAllowedForRegularPhone(storeName);
}

function filterOneUnitStores(stores) {
    return (stores || []).filter(s => parseInt(s.qty, 10) === 1);
}

function phoneHasAllowedBuybackStore(stores) {
    return filterOneUnitStores(stores).some(s => isStoreAllowedForBuybackPhone(s.name));
}

function collectKnownStoreNames(...phoneLists) {
    const names = new Set();
    phoneLists.flat().forEach(phone => {
        [phone.stores, phone.otherStores].forEach(storeList => {
            (storeList || []).forEach(store => {
                const name = normalizeStoreDisplayName(store.name);
                if (name) names.add(name);
            });
        });
    });
    return [...names].sort((a, b) => a.localeCompare(b, 'el'));
}

function renderPhoneStoreChipHtml(storeName, isBuyback) {
    const cleanName = normalizeStoreDisplayName(storeName);
    const allowed = isStoreAllowedForPhone(storeName, isBuyback);
    if (window.PhoneCatalogUI) {
        return PhoneCatalogUI.buildStoreChipHtml(cleanName, isBuyback, allowed);
    }
    if (isBuyback) {
        return allowed
            ? `<span class="tm-pc-store-chip tm-pc-store-chip--ok">✓ ${cleanName}</span>`
            : `<span class="tm-pc-store-chip tm-pc-store-chip--bad">✕ ${cleanName}</span>`;
    }
    if (!allowed) {
        return `<span class="tm-pc-store-chip tm-pc-store-chip--bad">✕ ${cleanName}</span>`;
    }
    return `<span class="tm-pc-store-chip tm-pc-store-chip--neutral">${cleanName}</span>`;
}

function renderPhoneStoreChipsHtml(stores, isBuyback) {
    const filtered = filterOneUnitStores(stores);
    if (!filtered.length) return '';
    return filtered.map(store => renderPhoneStoreChipHtml(store.name, isBuyback)).join('');
}

/**
 * Parses product name to extract model, grade, and IMEI
 * Format: "ΜΕΤΑΧΕΙΡΙΣΜΕΝΟ ΚΙΝΗΤΟ ΤΗΛΕΦΩΝΟ [MODEL] ([GRADE]-[IMEI])"
 * Grades: A+ (premium), A (standard); legacy B/C still supported when present
 * Also handles truncated names like "IPHONE 11 PRO 256GB GOLD (A+-353235105991942" (missing closing paren)
 * Note: This function is called during initial parsing, so memoization is handled at the caller level
 * @param {string} fullName - The full product name
 * @returns {{model: string, grade: string, imei: string, fullName: string}}
 */
function parsePhoneName(fullName) {
    const greekPrefix = 'ΜΕΤΑΧΕΙΡΙΣΜΕΝΟ ΚΙΝΗΤΟ ΤΗΛΕΦΩΝΟ';
    const englishPrefix = 'USED';
    let model = fullName;
    let grade = '';
    let imei = '';
    
    // Remove prefix if present (Greek or English)
    // Handle both pure Greek and mixed Greek/Latin variants (e.g., "METAXEIΡΙΣΜΕΝΟ")
    const modelUpper = model.toUpperCase();
    if (modelUpper.startsWith(greekPrefix)) {
        model = model.substring(greekPrefix.length).trim();
    } else if (modelUpper.startsWith(englishPrefix + ' ')) {
        model = model.substring(englishPrefix.length).trim();
    } else if (modelUpper.includes('ΜΕΤΑΧΕΙΡΙΣΜΕΝΟ') || modelUpper.includes('METAXEI')) {
        // Handle mixed variants like "METAXEIΡΙΣΜΕΝΟ"
        const match = model.match(/^[A-ZΑ-Ω]+\s+[A-ZΑ-Ω]+\s+[A-ZΑ-Ω]+\s+(.+)$/i);
        if (match) {
            model = match[1].trim();
        }
    }
    
    // Normalize vendor prefix and BB markers
    model = model.replace(/^APPLE\s+/i, '').trim();
    
    // Try to extract grade and IMEI - handle multiple BB format variations:
    // 1. Standard: (A-123), (BB:A-123), (BB:A - 123)
    // 2. No parens: BB:A-123, BB:A-123 at end
    // 3. BB before paren: BB(A-123), BB:(A-123)
    // 4. No space: BLUE(BB:A-123)
    // 5. Text after: (BB:A+ 123) NO FACE ID
    
    let gradeImeiMatch = null;
    let matchType = '';
    
    // Pattern 0b: BB-A+ 359... with space before IMEI (no colon), no parentheses
    // Examples: "WHITE BB-A+ 359367300161635"
    if (!gradeImeiMatch) {
        gradeImeiMatch = model.match(new RegExp(`\\s+(BB|ΒΒ)-${PHONE_GRADE_CAPTURE}\\s+(\\d+)\\s*$`, 'i'));
        if (gradeImeiMatch) matchType = 'bb-dash-space';
    }
    
    // Pattern 0: BB-A: with dash after BB and colon after grade
    // Examples: "SILVER BB-A+: 358034164395441"
    if (!gradeImeiMatch) {
        gradeImeiMatch = model.match(new RegExp(`\\s+(BB|ΒΒ)-${PHONE_GRADE_CAPTURE}:\\s*(\\d+)\\s*$`, 'i'));
        if (gradeImeiMatch) matchType = 'bb-dash-colon';
    }
    
    // Pattern 0a: BB-A+-123456 with dash after BB and dash after grade (no colon)
    // Examples: "DESERT TITANIUM BB-A+-351817727087944"
    if (!gradeImeiMatch) {
        gradeImeiMatch = model.match(new RegExp(`\\s+(BB|ΒΒ)-${PHONE_GRADE_CAPTURE}-(\\d+)\\s*$`, 'i'));
        if (gradeImeiMatch) matchType = 'bb-dash-dash';
    }
    
    // Pattern 1: BB: or ΒΒ: WITHOUT parentheses at the end
    // Examples: "BLACK BB:A+-355772536000685", "BLACK BB:A-350347647768036"
    if (!gradeImeiMatch) {
        gradeImeiMatch = model.match(new RegExp(`\\s+(BB|ΒΒ):${PHONE_GRADE_CAPTURE}\\s*-\\s*(\\d+)\\s*$`, 'i'));
        if (gradeImeiMatch) matchType = 'no-parens-end';
    }
    
    // Pattern 2: BB or ΒΒ followed directly by parentheses (no colon between)
    // Examples: "PURPLE BB(A+-350056590140263)"
        if (!gradeImeiMatch) {
        gradeImeiMatch = model.match(new RegExp(`\\s+(BB|ΒΒ)\\s*\\(${PHONE_GRADE_CAPTURE}\\s*-\\s*(\\d+)\\)?`, 'i'));
        if (gradeImeiMatch) matchType = 'bb-paren-no-colon';
        }
    
    // Pattern 2a: BB followed by parentheses with grade:IMEI (no dash)
    // Examples: "GOLD BB(A+:356703859876616)"
        if (!gradeImeiMatch) {
        gradeImeiMatch = model.match(new RegExp(`\\s+(BB|ΒΒ)\\s*\\(${PHONE_GRADE_CAPTURE}:\\s*(\\d+)\\)?`, 'i'));
        if (gradeImeiMatch) matchType = 'bb-paren-colon-no-dash';
        }
    
    // Pattern 2b: BB followed by parentheses with grade+IMEI or just IMEI (no dash, no colon)
    // Examples: "PACIFIC BLUE BB(A+353324654996823)" - A+ is grade, rest is IMEI
    //           "PACIFIC BLUE BB(353324654996823)" - no grade, all is IMEI
    // Note: Must NOT have colon (that's pattern 2a)
        if (!gradeImeiMatch) {
        // Match BB(grade?digits) but NOT BB(grade:digits)
        const testMatch = model.match(new RegExp(`\\s+(BB|ΒΒ)\\s*\\(${PHONE_GRADE_OPTIONAL_CAPTURE}(\\d+)\\)`, 'i'));
        if (testMatch && !model.match(new RegExp(`\\s+(BB|ΒΒ)\\s*\\(${PHONE_GRADE_CAPTURE}:`, 'i'))) {
            // Group 2 is optional grade letter, group 3 is IMEI digits
            const gradeChar = testMatch[2] || '';
            const imeiStr = testMatch[3] || '';
            // Verify group 3 is all digits and no colon in the match
            if (/^\d+$/.test(imeiStr)) {
                gradeImeiMatch = testMatch;
                matchType = 'bb-paren-imei-only';
            }
        }
        }
    
    // Pattern 3: BB: followed by parentheses (dash before IMEI)
    // Examples: "BLACK BB:(A+-353235100802433)"
        if (!gradeImeiMatch) {
        gradeImeiMatch = model.match(new RegExp(`\\s+(BB|ΒΒ):\\s*\\(${PHONE_GRADE_CAPTURE}\\s*-\\s*(\\d+)\\)?`, 'i'));
        if (gradeImeiMatch) matchType = 'bb-colon-paren';
        }

    // Pattern 3a: BB: followed by parentheses (space before IMEI, no dash)
    // Examples: "BLUE BB: (Α+ 356523762057108)", "BLUE BB:(Α+ 358883228005606)"
        if (!gradeImeiMatch) {
        gradeImeiMatch = model.match(new RegExp(`\\s+(BB|ΒΒ):\\s*\\(\\s*${PHONE_GRADE_CAPTURE}\\s+(\\d+)\\s*\\)?`, 'i'));
        if (gradeImeiMatch) matchType = 'bb-colon-paren-space';
        }

    // Pattern 3b: BB(grade IMEI) with space, no colon
    // Examples: "BLUE BB(Α+ 358883228005606)"
        if (!gradeImeiMatch) {
        gradeImeiMatch = model.match(new RegExp(`\\s+(BB|ΒΒ)\\s*\\(\\s*${PHONE_GRADE_CAPTURE}\\s+(\\d+)\\s*\\)?`, 'i'));
        if (gradeImeiMatch) matchType = 'bb-paren-space';
        }

    // Pattern 3c: (BB: A+ 357...) — BB: inside parentheses, space before grade and IMEI
    // Examples: "BLACK (BB: A+ 357220650397022)"
        if (!gradeImeiMatch) {
        gradeImeiMatch = model.match(new RegExp(`\\(\\s*(BB|ΒΒ):\\s*${PHONE_GRADE_CAPTURE}\\s*-?\\s*(\\d+)\\s*\\)?`, 'i'));
        if (gradeImeiMatch) matchType = 'paren-bb-colon-space';
        }

    // Pattern 3d: (BB-A+ 359...) — BB- inside parentheses, space before IMEI
    // Examples: "WHITE (BB-A+ 359367300161635)", "WHITE (BB-A+ 359367300161635"
        if (!gradeImeiMatch) {
        gradeImeiMatch = model.match(new RegExp(`\\(\\s*(BB|ΒΒ)-${PHONE_GRADE_CAPTURE}\\s+(\\d+)\\s*\\)?`, 'i'));
        if (gradeImeiMatch) matchType = 'paren-bb-dash-space';
        }
        
    // Pattern 4: Standard with parentheses (with or without BB:)
    // Examples: "(BB:A+-123)", "(BB:A - 123)", "BLUE(BB:A+-354408279194226)"
    // Handle both space-dash-space and no-space patterns
        if (!gradeImeiMatch) {
        gradeImeiMatch = model.match(new RegExp(`\\s*\\(?\\s*(BB|ΒΒ):${PHONE_GRADE_CAPTURE}\\s*-?\\s*(\\d+)\\)?`, 'i'));
        if (gradeImeiMatch) matchType = 'standard-bb';
        }
        
    // Pattern 5: Simple pattern without BB prefix
    // Examples: "(A+-123)", "(A-353235105991942", "(Α+ 358883228005606)"
        if (!gradeImeiMatch) {
        gradeImeiMatch = model.match(new RegExp(`\\(${PHONE_GRADE_CAPTURE}\\s*-\\s*(\\d+)\\)?`, 'i'));
        if (gradeImeiMatch) matchType = 'simple';
        }
        if (!gradeImeiMatch) {
        gradeImeiMatch = model.match(new RegExp(`\\(\\s*${PHONE_GRADE_CAPTURE}\\s+(\\d+)\\s*\\)?`, 'i'));
        if (gradeImeiMatch) matchType = 'simple-space';
        }
    
    // Pattern 6: Incomplete/truncated patterns
    if (!gradeImeiMatch) {
        gradeImeiMatch = model.match(new RegExp(`[\\(]?\\s*(BB|ΒΒ)?:?${PHONE_GRADE_CAPTURE}\\s*-?\\s*(\\d+)`, 'i'));
        if (gradeImeiMatch) matchType = 'fallback';
    }
    
    if (gradeImeiMatch) {
        // Extract grade and IMEI based on match type
        if (matchType === 'simple' || matchType === 'simple-space') {
            // Simple pattern: (A+-123) or (Α+ 358883228005606)
            grade = normalizePhoneGrade(gradeImeiMatch[1]);
            imei = gradeImeiMatch[2];
        } else if (matchType === 'bb-paren-imei-only') {
            // Pattern: BB(A+123456) or BB(123456) - optional grade in group 2, IMEI in group 3
            const gradeChar = gradeImeiMatch[2] || '';
            const imeiStr = gradeImeiMatch[3] || '';
            if (gradeChar && new RegExp(`^${PHONE_GRADE_CAPTURE}$`, 'i').test(gradeChar)) {
                grade = normalizePhoneGrade(gradeChar);
                imei = imeiStr;
            } else {
                // No grade, just IMEI
                grade = '';
                imei = gradeChar + imeiStr; // Combine in case gradeChar was part of IMEI
            }
        } else {
            // All other patterns have: [full, BB/ΒΒ, grade, imei]
            grade = normalizePhoneGrade(gradeImeiMatch[2] || '');
            imei = gradeImeiMatch[3] || '';
        }
        
        // First, extract any text that appears AFTER the grade/IMEI pattern (like "NO FACE ID")
        let suffixText = '';
        const fullMatch = gradeImeiMatch[0];
        const matchIndex = model.indexOf(fullMatch);
        if (matchIndex !== -1) {
            const afterMatch = model.substring(matchIndex + fullMatch.length);
            // Extract text after closing paren if present
            const afterParenMatch = afterMatch.match(/\)\s*(.+)$/);
            if (afterParenMatch) {
                suffixText = ' ' + afterParenMatch[1].trim();
            }
        }
        
        // Remove the grade/IMEI part from model
        const endAnchoredTypes = new Set([
            'bb-dash-space', 'bb-dash-colon', 'bb-dash-dash', 'no-parens-end',
            'bb-paren-no-colon', 'bb-paren-colon-no-dash', 'bb-paren-imei-only',
            'bb-colon-paren', 'bb-colon-paren-space', 'bb-paren-space',
            'paren-bb-colon-space', 'paren-bb-dash-space',
            'simple', 'simple-space'
        ]);

        if (endAnchoredTypes.has(matchType) && matchIndex !== -1) {
            model = model.substring(0, matchIndex).trim();
        } else if (matchType === 'fallback') {
            if (matchIndex !== -1) {
                model = model.substring(0, matchIndex).trim();
            }
            model = model.replace(/\s+(BB|ΒΒ):\s*$/i, '').trim();
        } else if (matchType === 'standard-bb') {
            // Remove "(BB:A+-123)" or "BLUE(BB:A+-123)" but keep text after closing paren
            model = model.replace(new RegExp(`\\(?\\s*(BB|ΒΒ):${PHONE_GRADE_MATCH}\\s*-?\\s*\\d+\\)?`, 'i'), '').trim();
        } else {
            // Generic fallback: remove parenthesized content and trailing patterns
            model = model.replace(/\s*\([^)]*$/, '').trim(); // incomplete
            model = model.replace(/\s*\([^)]+\)\s*/, '').trim(); // complete with content after
            model = model.replace(new RegExp(`\\s+(BB|ΒΒ):?${PHONE_GRADE_OPTIONAL}\\s*-?\\s*\\d+\\s*$`, 'i'), '').trim(); // trailing
        }

        // Safety net: strip any leftover buyback marker at end of model
        model = model.replace(/\s+(BB|ΒΒ):\s*$/i, '').trim();
        model = model.replace(/\s*\(BB[^)]*\)?\s*$/i, '').trim();
        
        // Add back any suffix text (like "NO FACE ID")
        model = (model + suffixText).trim();
        
        // Normalize multiple spaces to single space
        model = model.replace(/\s+/g, ' ').trim();
        
        // Fix colors with text attached (like "SILVERNO" → "SILVER")
        // Check all known colors and remove any trailing text attached to them
        const allKnownColors = getAllKnownColorsForModelFix();
        for (const color of allKnownColors) {
            // Match color followed by any letters at the end (e.g., "SILVERNO", "BLACKYES")
            const regex = new RegExp('\\b' + color + '[A-ZΑ-Ω]+$', 'i');
            if (regex.test(model)) {
                model = model.replace(regex, color).trim();
                break; // Only fix one color per model
            }
        }
        
        // Remove trailing single letters or short meaningless text (like "N", "A", etc.)
        // Keep meaningful suffixes like "NO FACE ID" but remove single letter notes
        model = model.replace(/\s+[A-ZΑ-Ω]$/i, '').trim();
    } else {
        // If no grade/IMEI pattern found, try to extract model by finding text before any opening parenthesis
        const beforeParen = model.split('(')[0].trim();
        if (beforeParen && beforeParen !== model) {
            model = beforeParen;
        }
    }
    
    // Final fallback: if model is still empty or same as fullName, use the original name
    // but try to clean it up
    if (!model || model === fullName) {
        // Try one more time: split by opening parenthesis and take first part
        const parts = fullName.split('(');
        if (parts.length > 1) {
            model = parts[0].trim();
            // Remove prefix if still present
            if (model.toUpperCase().startsWith(greekPrefix)) {
                model = model.substring(greekPrefix.length).trim();
            } else if (model.toUpperCase().startsWith(englishPrefix + ' ')) {
                model = model.substring(englishPrefix.length).trim();
            }
        } else {
            model = fullName;
        }
    }
    
    // Normalize iPhone model names - add "IPHONE" prefix if missing
    // Handle cases like "14 PRO" -> "IPHONE 14 PRO"
    if (model && /^\d+\s+(PRO|MINI|PLUS|MAX)?/i.test(model)) {
        const modelUpper = model.toUpperCase();
        // Only add IPHONE if it's not already there
        if (!modelUpper.includes('IPHONE') && !modelUpper.includes('SAMSUNG') && !modelUpper.includes('GALAXY')) {
            model = 'IPHONE ' + model;
        }
    }
    
    return {
        model: model || fullName,
        grade: grade,
        imei: imei,
        fullName: fullName
    };
}

/**
 * Saves phone list to cache
 * @param {Array} phones - The phone list to cache
 */
function savePhoneListCache(phones) {
    GM_setValue(PHONE_LIST_CACHE_KEY, JSON.stringify(phones));
    GM_setValue(PHONE_LIST_CACHE_TIMESTAMP_KEY, Date.now());
    console.log('[MMS Phone List] Cache saved');
}

function saveOtherStoreCache(phones) {
    GM_setValue(OTHER_STORE_CACHE_KEY, JSON.stringify(phones));
    GM_setValue(OTHER_STORE_CACHE_TIMESTAMP_KEY, Date.now());
    console.log('[MMS Phone List] Other-store cache saved');
}

/**
 * Loads phone list from cache
 * @returns {Array|null} Cached phone list or null if not found/expired
 */
function loadPhoneListCache() {
    const cached = GM_getValue(PHONE_LIST_CACHE_KEY, null);
    const timestamp = GM_getValue(PHONE_LIST_CACHE_TIMESTAMP_KEY, 0);
    
    if (!cached || !timestamp) {
        return null;
    }
    
    try {
        return JSON.parse(cached);
    } catch (e) {
        console.error('[MMS Phone List] Error parsing cache:', e);
        return null;
    }
}

/**
 * Gets cache age in days
 * @returns {number|null} Age in days, or null if no cache
 */
function getCacheAgeDays() {
    const timestamp = GM_getValue(PHONE_LIST_CACHE_TIMESTAMP_KEY, 0);
    if (!timestamp) return null;
    const ageMs = Date.now() - timestamp;
    return Math.floor(ageMs / (1000 * 60 * 60 * 24));
}

function getOtherStoreCache() {
    try {
        const cached = GM_getValue(OTHER_STORE_CACHE_KEY, null);
        const ts = GM_getValue(OTHER_STORE_CACHE_TIMESTAMP_KEY, 0);
        if (!cached || !ts) return null;
        const ageDays = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
        if (ageDays > OTHER_STORE_CACHE_EXPIRATION_DAYS) return null;
        return JSON.parse(cached);
    } catch (e) {
        return null;
    }
}

function parseOtherStorehouses(cell) {
    if (!cell) return [];
    const stores = [];
    
    // Collect candidate HTML snippets from the element and its descendants
    const candidateAttrs = [
        'data-content',
        'data-storehouses',
        'data-stores',
        'data-html',
        'data-jc',
        'data-original-title',
        'data-bs-content',
        'data-bs-original-title',
        'title'
    ];
    
    const snippets = new Set();
    
    const collect = (el) => {
        if (!el || !el.getAttribute) return;
        candidateAttrs.forEach(attr => {
            const val = el.getAttribute(attr);
            if (val) snippets.add(val);
        });
    };
    
    collect(cell);
    // Check descendants as the popover data is often on a child <a> or <span>
    cell.querySelectorAll('*').forEach(collect);
    
    // Fallback to raw innerHTML/text
    if (snippets.size === 0) {
        if (cell.innerHTML) snippets.add(cell.innerHTML);
        else if (cell.textContent) snippets.add(cell.textContent);
    }
    
    // Try to parse each snippet until we find store rows
    for (const rawSnippet of snippets) {
        if (!rawSnippet) continue;
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${rawSnippet}</div>`, 'text/html');
        
        // Parse table rows if present
        const rows = doc.querySelectorAll('tr');
        rows.forEach(r => {
            const cols = r.querySelectorAll('td,th');
            if (cols.length >= 2) {
                const name = (cols[0].textContent || '').trim();
                const qty = (cols[1].textContent || '').trim();
                if (name) stores.push({ name, qty });
            }
        });
        
        // If we already extracted stores, no need to parse further
        if (stores.length > 0) break;
        
        // Fallback: parse plain text lines like "STORE 1"
        const lines = rawSnippet.split('\n').map(l => l.trim()).filter(Boolean);
        lines.forEach(line => {
            const match = line.match(/(.+?)\s+(\d+)$/);
            if (match) {
                stores.push({ name: match[1].trim(), qty: match[2].trim() });
            }
        });
        
        if (stores.length > 0) break;
    }
    
    return stores;
}

/** Read retail price text from a grid cell (Runner redesign may use div or input). */
function readProductPriceFromElement(el) {
    if (!el) return '';
    const tag = (el.tagName || '').toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
        return (el.value || '').trim();
    }
    return (el.textContent || '').trim();
}

/**
 * Locate retail / cur price cell in a grid row (tag names and IDs vary by MyManager theme).
 */
function findProductPriceElement(row) {
    if (!row) return null;
    const selectors = [
        'span[id*="curPrice"]', 'span[id*="CurPrice"]',
        'div[id*="curPrice"]', 'div[id*="CurPrice"]',
        'td[id*="curPrice"]', 'td[id*="CurPrice"]',
        'span[id*="RetailPrice"]', 'div[id*="RetailPrice"]',
        'input[id*="curPrice"]', 'input[id*="CurPrice"]',
        'span[id*="fPrice"]', 'div[id*="fPrice"]'
    ];
    for (let i = 0; i < selectors.length; i++) {
        const el = row.querySelector(selectors[i]);
        if (el) return el;
    }
    const nodes = row.querySelectorAll('[id]');
    for (let i = 0; i < nodes.length; i++) {
        const id = (nodes[i].id || '').toLowerCase();
        if (id.includes('curprice') || id.includes('retailprice') || id.includes('sellprice') || id.includes('sellingprice')) {
            return nodes[i];
        }
    }
    return null;
}

function extractProductRetailPrice(row) {
    return readProductPriceFromElement(findProductPriceElement(row));
}

// Try to fetch storehouse availability using the page's own helper (getCheckOtherInventories)
function fetchStorehousesFromPage(productCode) {
    return new Promise((resolve, reject) => {
        const fn = (typeof unsafeWindow !== 'undefined' ? unsafeWindow.getCheckOtherInventories : window.getCheckOtherInventories);
        if (typeof fn !== 'function') {
            reject(new Error('getCheckOtherInventories not available'));
            return;
        }
        try {
            fn(productCode, false, {
                content_type: 'json',
                onFinish: (response) => {
                    if (!response) {
                        resolve([]);
                        return;
                    }
                    const stores = response.map(r => ({ name: r.storehouse, qty: String(r.units) }));
                    resolve(stores);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Fetches and parses the phone list from the products page
 * First loads the initial page, then loads with pagesize parameter, then parses
 * @returns {Promise<Array<{barcode: string, name: string, model: string, grade: string, imei: string, unitsRemaining: number}>>}
 */
async function fetchPhoneList() {
    return new Promise((resolve, reject) => {
        // Step 1: Load initial page with qs=55.&recordspp=-1
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://thefixers.mymanager.gr/mymanagerservice/products_list.php?qs=55.&recordspp=-1',
            onload: function(firstResponse) {
                console.log('[MMS Phone List] First page loaded, now loading with pagesize=500');
                
                // Step 2: Load with pagesize=500
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: 'https://thefixers.mymanager.gr/mymanagerservice/products_list.php?pagesize=1000000|',
                    onload: function(response) {
                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    
                    // Try multiple table selectors - be more flexible
                    let table = doc.querySelector('table.rnr-c.rnr-cont.rnr-c-grid.rnr-b-grid.rnr-gridtable.hoverable');
                    if (!table) {
                        // Try with fewer classes
                        table = doc.querySelector('table.rnr-b-grid.rnr-gridtable');
                    }
                    if (!table) {
                        // Try even more flexible
                        table = doc.querySelector('table.rnr-b-grid');
                    }
                    if (!table) {
                        // Last resort - any table with grid classes
                        table = doc.querySelector('.rnr-c-grid table, table.rnr-gridtable');
                    }
                    
                    if (!table) {
                        console.error('[MMS Phone List] Table not found. Available tables:', doc.querySelectorAll('table').length);
                        // Log available table classes for debugging
                        const allTables = doc.querySelectorAll('table');
                        allTables.forEach((t, i) => {
                            console.log(`[MMS Phone List] Table ${i}: classes =`, t.className);
                        });
                        resolve([]);
                        return;
                    }
                    
                    console.log('[MMS Phone List] Table found with classes:', table.className);
                    
                    const phones = [];
                    // Try both tbody tr and direct tr
                    let rows = table.querySelectorAll('tbody tr');
                    if (rows.length === 0) {
                        rows = table.querySelectorAll('tr');
                    }
                    // Also try rows with gridRow ID pattern
                    if (rows.length === 0) {
                        rows = table.querySelectorAll('tr[id^="gridRow"]');
                    }
                    
                    console.log(`[MMS Phone List] Found ${rows.length} rows`);
                    
                    rows.forEach((row, rowIndex) => {
                        // Skip header row
                        if (rowIndex === 0 && row.querySelector('th')) {
                            return;
                        }
                        
                        // The barcode and name are in <span> elements, not <input> elements!
                        // IDs follow pattern: edit5_strProductID, edit6_strProductID, etc.
                        // Strategy 1: Try to find span elements with ID pattern
                    let barcodeEl = row.querySelector('span[id*="strProductID"]');
                    let nameEl = row.querySelector('span[id*="strProductName"]');
                    let unitsRemainingEl = row.querySelector('span[id*="iUnitsRemaining"]');
                    let otherStoreEl = row.querySelector('span[id*="iUnitsRemainingOtherStoreHouses"]');
                    let priceEl = findProductPriceElement(row);
                        
                        // Strategy 2: If not found, search all elements with id (new grid may use div, not span)
                    if (!barcodeEl || !nameEl || !unitsRemainingEl || !priceEl || !otherStoreEl) {
                            row.querySelectorAll('[id]').forEach(node => {
                                const id = (node.id || '').toLowerCase();
                                
                                if (!barcodeEl && id.includes('strproductid')) {
                                    barcodeEl = node;
                                }
                                if (!nameEl && id.includes('strproductname')) {
                                    nameEl = node;
                                }
                                if (!otherStoreEl && id.includes('iunitsremainingotherstorehouses')) {
                                    otherStoreEl = node;
                                }
                                if (!unitsRemainingEl && id.includes('iunitsremaining') && !id.includes('otherstorehouses')) {
                                    unitsRemainingEl = node;
                                }
                                if (!priceEl && (id.includes('curprice') || id.includes('retailprice') || id.includes('sellprice') || id.includes('sellingprice'))) {
                                    priceEl = node;
                                }
                            });
                        }
                        
                        // Check if product has units remaining (must be > 0)
                        let unitsRemaining = 0;
                        if (unitsRemainingEl) {
                            const unitsText = (unitsRemainingEl.textContent || '').trim();
                            unitsRemaining = parseInt(unitsText, 10) || 0;
                        }
                    
                    let otherStoreCount = 0;
                    let otherStores = [];
                    if (otherStoreEl) {
                        otherStoreCount = parseInt((otherStoreEl.textContent || '').trim(), 10) || 0;
                        if (otherStoreCount > 0) {
                            otherStores = parseOtherStorehouses(otherStoreEl);
                        }
                    }
                        
                        // Extract retail price (re-scan row so div/input themes still work)
                        const retailPrice = extractProductRetailPrice(row);
                        
                    // Only include products with units remaining > 0
                    if (unitsRemaining <= 0) {
                        return; // Skip this product for the main list (other-store items handled separately)
                        }
                        
                        if (barcodeEl && nameEl) {
                            // Get text content from span (may contain nested spans, so use textContent)
                            let barcode = (barcodeEl.textContent || '').trim();
                            let name = (nameEl.textContent || '').trim();
                            
                            // Clean up barcode - remove any HTML entities or extra whitespace
                            barcode = barcode.replace(/\s+/g, ' ').trim();
                            name = name.replace(/\s+/g, ' ').trim();
                            
                            // Remove "Περισσότερα..." link text if present
                            name = name.replace(/\s*Περισσότερα\s*\.\.\.\s*/i, '').trim();
                            
                            // Skip laptops - don't display them
                            if (name.toUpperCase().includes('ΜΕΤΑΧΕΙΡΙΣΜΕΝΟΣ ΦΟΡΗΤΟΣ ΥΠΟΛΟΓΙΣΤΗΣ')) {
                                return; // Skip this product
                            }
                            
                            if (barcode && name) {
                                // Parse the phone name to extract model, grade, and IMEI
                                const parsed = parsePhoneName(name);
                                
                                // Debug: Log phones with BB: pattern that might have IMEI issues
                                if (isBuybackTitle(name) && !parsed.imei) {
                                    console.log('[MMS Phone List] Phone with BB: but no IMEI:', {
                                        barcode: barcode,
                                        name: name,
                                        parsed: parsed
                                    });
                                }
                                
                                const isBuyback = isBuybackTitle(name);
                                
                                // Only include items with "ΜΕΤΑΧΕΙΡΙΣΜΕΝΟ ΚΙΝΗΤΟ ΤΗΛΕΦΩΝΟ" in the title
                                const nameUpper = name.toUpperCase();
                                const greekPhonePrefix = 'ΜΕΤΑΧΕΙΡΙΣΜΕΝΟ ΚΙΝΗΤΟ ΤΗΛΕΦΩΝΟ';
                                if (!nameUpper.includes(greekPhonePrefix)) {
                                    return; // Skip this item
                                }
                                
                                phones.push({
                                    barcode: barcode,
                                    name: parsed.fullName,
                                    model: parsed.model,
                                    grade: parsed.grade,
                                    imei: parsed.imei,
                                    unitsRemaining: unitsRemaining,
                                    isBuyback: isBuyback,
                                    retailPrice: retailPrice,
                                    otherStoreCount: otherStoreCount,
                                    otherStores: otherStores
                                });
                            } else {
                                // Debug: log when elements found but values empty
                                if (rowIndex < 3) { // Only log first few for debugging
                                    console.log(`[MMS Phone List] Row ${rowIndex}: Found elements but empty values. Barcode: "${barcode}", Name: "${name}"`);
                                }
                            }
                        } else {
                            // Debug: log when elements not found
                            if (rowIndex < 3) { // Only log first few for debugging
                                const spans = row.querySelectorAll('span[id]');
                                console.log(`[MMS Phone List] Row ${rowIndex}: Elements not found. Spans with IDs in row:`, spans.length);
                                spans.forEach((span, i) => {
                                    if (i < 5) { // Only log first 5
                                        console.log(`  Span ${i}: id="${span.id}", text="${(span.textContent || '').substring(0, 50)}"`);
                                    }
                                });
                            }
                        }
                    });
                    
                        console.log(`[MMS Phone List] Successfully parsed ${phones.length} phones`);
                        // Save to cache
                        savePhoneListCache(phones);
                        resolve(phones);
                    } catch (error) {
                        console.error('[MMS Phone List] Error parsing phone list:', error);
                        reject(error);
                    }
                },
                onerror: function(error) {
                    console.error('[MMS Phone List] Failed to fetch phone list (second request):', error);
                    reject(error);
                }
            });
            },
            onerror: function(error) {
                console.error('[MMS Phone List] Failed to fetch phone list (first request):', error);
                reject(error);
            }
        });
    });
}

/**
 * Fetch and parse phones that are available in other storehouses (iUnitsRemainingOtherStoreHouses > 0)
 */
async function fetchOtherStorePhones() {
    const cached = getOtherStoreCache();
    if (cached) {
        return cached;
    }
    
    return new Promise((resolve, reject) => {
        const fetchWithUrl = (url, fallbackUrl) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url,
                onload: function(response) {
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(response.responseText, 'text/html');
                        
                        let table = doc.querySelector('table.rnr-c.rnr-cont.rnr-b-grid.rnr-gridtable.hoverable');
                        if (!table) table = doc.querySelector('table.rnr-b-grid.rnr-gridtable');
                        if (!table) table = doc.querySelector('table.rnr-b-grid');
                        if (!table) table = doc.querySelector('.rnr-c-grid table, table.rnr-gridtable');
                        
                        if (!table) {
                            if (fallbackUrl) {
                                fetchWithUrl(fallbackUrl, null);
                            } else {
                                console.error('[MMS Other Stores] Table not found');
                                resolve([]);
                            }
                            return;
                        }
                        
                        let rows = table.querySelectorAll('tbody tr');
                        if (rows.length === 0) rows = table.querySelectorAll('tr');
                        if (rows.length === 0) rows = table.querySelectorAll('tr[id^="gridRow"]');
                        
                        const result = [];
                        
                        rows.forEach((row, idx) => {
                            if (idx === 0 && row.querySelector('th')) return;
                            
                            let barcodeEl = row.querySelector('span[id*="strProductID"]');
                            let nameEl = row.querySelector('span[id*="strProductName"]');
                            let otherStoreEl = row.querySelector('span[id*="iUnitsRemainingOtherStoreHouses"]');
                            let unitsRemainingEl = row.querySelector('span[id*="iUnitsRemaining"]');
                            let priceEl = findProductPriceElement(row);
                            
                            if (!barcodeEl || !nameEl || !otherStoreEl || !unitsRemainingEl || !priceEl) {
                                row.querySelectorAll('[id]').forEach(node => {
                                    const id = (node.id || '').toLowerCase();
                                    if (!barcodeEl && id.includes('strproductid')) barcodeEl = node;
                                    if (!nameEl && id.includes('strproductname')) nameEl = node;
                                    if (!otherStoreEl && id.includes('iunitsremainingotherstorehouses')) otherStoreEl = node;
                                    if (!unitsRemainingEl && id.includes('iunitsremaining') && !id.includes('otherstorehouses')) {
                                        unitsRemainingEl = node;
                                    }
                                    if (!priceEl && (id.includes('curprice') || id.includes('retailprice') || id.includes('sellprice') || id.includes('sellingprice'))) {
                                        priceEl = node;
                                    }
                                });
                            }
                            
                            if (!otherStoreEl) return;
                            const otherCount = parseInt((otherStoreEl.textContent || '').trim(), 10) || 0;
                            if (otherCount <= 0) return;
                            let localUnits = 0;
                            if (unitsRemainingEl) {
                                localUnits = parseInt((unitsRemainingEl.textContent || '').trim(), 10) || 0;
                            }
                            const retailPrice = extractProductRetailPrice(row);
                            
                            const barcode = (barcodeEl?.textContent || '').trim();
                            let name = (nameEl?.textContent || '').trim();
                            if (!barcode || !name) return;
                            name = name.replace(/\s+Περισσότερα\s*\.\.\.\s*/i, '').trim();
                            
                            const parsed = parsePhoneName(name);
                            const stores = parseOtherStorehouses(otherStoreEl);
                            const isBuyback = isBuybackTitle(name);
                            
                            // Only include items with "ΜΕΤΑΧΕΙΡΙΣΜΕΝΟ ΚΙΝΗΤΟ ΤΗΛΕΦΩΝΟ" in the title
                            const nameUpper = name.toUpperCase();
                            const greekPhonePrefix = 'ΜΕΤΑΧΕΙΡΙΣΜΕΝΟ ΚΙΝΗΤΟ ΤΗΛΕΦΩΝΟ';
                            if (!nameUpper.includes(greekPhonePrefix)) {
                                return; // Skip this item
                            }
                            
                            result.push({
                                barcode,
                                name: parsed.fullName,
                                model: parsed.model,
                                grade: parsed.grade,
                                imei: parsed.imei,
                                otherStoreCount: otherCount,
                                stores,
                                localUnits,
                                retailPrice,
                                isBuyback
                            });
                        });
                        
                        saveOtherStoreCache(result);
                        resolve(result);
                    } catch (err) {
                        if (fallbackUrl) {
                            fetchWithUrl(fallbackUrl, null);
                        } else {
                            console.error('[MMS Other Stores] Parse error:', err);
                            reject(err);
                        }
                    }
                },
                onerror: function(error) {
                    if (fallbackUrl) {
                        fetchWithUrl(fallbackUrl, null);
                    } else {
                        console.error('[MMS Other Stores] Request failed:', error);
                        reject(error);
                    }
                }
            });
        };
        
        // First try with the query string that surfaces other-store availability (qs=55.)
        const primaryUrl = 'https://thefixers.mymanager.gr/mymanagerservice/products_list.php?qs=55.&pagesize=1000000|';
        const fallbackUrl = 'https://thefixers.mymanager.gr/mymanagerservice/products_list.php?pagesize=1000000|';
        fetchWithUrl(primaryUrl, fallbackUrl);
    });
}

const phoneCatalogGbCache = new Map();
const phoneCatalogColorCache = new Map();

function extractGB(model) {
    if (!model) return '';
    if (phoneCatalogGbCache.has(model)) {
        return phoneCatalogGbCache.get(model);
    }
    const tbMatch = model.match(/(\d+)\s*TB/i);
    if (tbMatch) {
        const result = tbMatch[1] + 'TB';
        phoneCatalogGbCache.set(model, result);
        return result;
    }
    const gbMatch = model.match(/(\d+)\s*GB/i);
    if (gbMatch) {
        const result = gbMatch[1] + 'GB';
        phoneCatalogGbCache.set(model, result);
        return result;
    }
    const gMatch = model.match(/(\d+)\s*G(?!\w)/i);
    if (gMatch) {
        const result = gMatch[1] + 'GB';
        phoneCatalogGbCache.set(model, result);
        return result;
    }
    const commonSizes = [64, 128, 256, 512, 1024, 2048];
    for (const size of commonSizes) {
        const regex = new RegExp('\\b' + size + '\\b', 'i');
        if (regex.test(model)) {
            const result = size >= 1024 ? (size / 1024) + 'TB' : size + 'GB';
            phoneCatalogGbCache.set(model, result);
            return result;
        }
    }
    phoneCatalogGbCache.set(model, '');
    return '';
}

function extractColor(model) {
    if (!model) return '';
    if (phoneCatalogColorCache.has(model)) {
        return phoneCatalogColorCache.get(model);
    }
    const color = matchPhoneColorInText(model);
    phoneCatalogColorCache.set(model, color);
    return color;
}

function getColorHex(colorName) {
    return getListColorHex(colorName);
}

function getPhoneCatalogUICtx(modalHelpers = {}) {
    return {
        T: PHONE_CATALOG_TRANSLATIONS,
        extractColor,
        getColorHex,
        extractGB,
        getPhoneGradeColor,
        getPhoneCatalogOutlineStyle,
        getPhoneModelTitleStyle,
        getTagColor,
        getTagDisplayName,
        getPhoneGradeCircleStyle,
        getPhoneGradeDisplayStyle,
        t,
        extractBaseModel: modalHelpers.extractBaseModel || ((m) => m || ''),
        getPhoneTags: modalHelpers.getPhoneTags || (() => []),
    };
}

function buildModelGroupsFromPhones(phones, baseModelFn) {
    const map = new Map();
    phones.forEach((phone) => {
        const model = baseModelFn(phone.model) || phone.model || 'Unknown';
        if (!map.has(model)) {
            map.set(model, { count: 0, buybackCount: 0, grades: {} });
        }
        const entry = map.get(model);
        entry.count += 1;
        if (phone.isBuyback) entry.buybackCount += 1;
        const grade = normalizePhoneGrade(phone.grade);
        if (grade) entry.grades[grade] = (entry.grades[grade] || 0) + 1;
    });
    return [...map.entries()].sort((a, b) =>
        a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' })
    );
}

function phoneHasStoreWithStock(phone, storeName) {
    if (!storeName) return true;
    const phoneStores = phone.stores || [];
    if (phoneStores.length === 0) return true;
    return phoneStores.some((store) => {
        if (!store.name) return false;
        const cleanName = store.name.replace(/\s*ΕΜΠΟΡΕΥΣΙΜΩΝ/gi, '').trim();
        const qty = parseInt(store.qty, 10) || 0;
        return cleanName === storeName && qty === 1;
    });
}

function formatStoreSummaryText(item, loadedStoreCount = null) {
    if (loadedStoreCount != null && loadedStoreCount >= 0) {
        const n = loadedStoreCount;
        if (n === 0) return 'Κανένα κατ.';
        return n === 1 ? '1 κατάστημα' : `${n} καταστήματα`;
    }
    const n = parseInt(item.otherStoreCount, 10) || 0;
    if (n <= 0) return '';
    return n === 1 ? 'Σε 1 κατ.' : `Σε ${n} κατ.`;
}

/**
 * Shows a modal with a searchable list of phones
 */
async function showPhoneListModal() {
    // Prevent multiple modals
    if (document.querySelector('.tm-modal-overlay')) return;

    syncPhoneColorCatalog();
    
    // Load favorites from storage
    const FAVORITES_KEY = 'tm_phone_favorites';
    let favorites = JSON.parse(GM_getValue(FAVORITES_KEY, '[]'));
    
    const overlay = document.createElement('div');
    overlay.className = 'tm-modal-overlay tm-phone-catalog-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--tm-overlay-dim, rgba(0,0,0,0.72));
        opacity: 1;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    overlay.innerHTML = window.PhoneCatalogUI.buildModalHTML(PHONE_CATALOG_TRANSLATIONS);
    
    document.body.appendChild(overlay);
    
    // State variables
    let allPhones = [];
    let filteredPhones = [];
    let selectedPhones = new Set();
    let sortBy = 'model';
    let sortAscending = true;
    let isGridView = true;
    let showFavoritesOnly = false;
    let lastUpdated = null;
    let contextMenu = overlay.querySelector('.tm-phone-context-menu');
    let contextMenuPhone = null;
    let showingOtherStores = false;
    let otherStorePhones = [];
    let otherStoreLoaded = false;
    let mineCatalogStep = 'models';
    let mineSelectedModel = null;
    let networkCatalogStep = 'models';
    let networkSelectedModel = null;
    
    // Tag system — phone assignments + user-defined tag catalog
    const TAGS_STORAGE_KEY = 'tm_phone_tags';
    
    function loadPhoneTags() {
        try {
            const stored = GM_getValue(TAGS_STORAGE_KEY, '{}');
            return JSON.parse(stored);
        } catch (e) {
            return {};
        }
    }
    
    function savePhoneTags(tags) {
        GM_setValue(TAGS_STORAGE_KEY, JSON.stringify(tags));
    }
    
    function getPhoneTags(barcode) {
        const allTags = loadPhoneTags();
        return allTags[barcode] || [];
    }
    
    function addPhoneTag(barcode, tag) {
        const tagKey = normalizeTagKey(tag);
        if (!tagKey) return false;
        const allTags = loadPhoneTags();
        if (!allTags[barcode]) {
            allTags[barcode] = [];
        }
        if (!allTags[barcode].includes(tagKey)) {
            allTags[barcode].push(tagKey);
            savePhoneTags(allTags);
            return true;
        }
        return false;
    }
    
    function removePhoneTag(barcode, tag) {
        const tagKey = normalizeTagKey(tag);
        const allTags = loadPhoneTags();
        if (allTags[barcode]) {
            allTags[barcode] = allTags[barcode].filter(t => t !== tagKey);
            if (allTags[barcode].length === 0) {
                delete allTags[barcode];
            }
            savePhoneTags(allTags);
            return true;
        }
        return false;
    }

    function renamePhoneTagKeyOnAllPhones(oldKey, newKey) {
        const oldK = normalizeTagKey(oldKey);
        const newK = normalizeTagKey(newKey);
        if (!oldK || !newK || oldK === newK) return;
        const allTags = loadPhoneTags();
        let changed = false;
        Object.keys(allTags).forEach(barcode => {
            const idx = allTags[barcode].indexOf(oldK);
            if (idx === -1) return;
            allTags[barcode].splice(idx, 1);
            if (!allTags[barcode].includes(newK)) {
                allTags[barcode].push(newK);
            }
            if (allTags[barcode].length === 0) delete allTags[barcode];
            changed = true;
        });
        if (changed) savePhoneTags(allTags);
    }

    function removePhoneTagFromAllPhones(tagKey) {
        const key = normalizeTagKey(tagKey);
        const allTags = loadPhoneTags();
        let changed = false;
        Object.keys(allTags).forEach(barcode => {
            const before = allTags[barcode].length;
            allTags[barcode] = allTags[barcode].filter(t => t !== key);
            if (allTags[barcode].length === 0) delete allTags[barcode];
            if (before !== (allTags[barcode]?.length || 0)) changed = true;
        });
        if (changed) savePhoneTags(allTags);
    }
    
    function getAllUsedTags() {
        const allTags = loadPhoneTags();
        const usedTags = new Set();
        Object.values(allTags).forEach(tags => {
            tags.forEach(tag => usedTags.add(normalizeTagKey(tag)));
        });
        return Array.from(usedTags).filter(Boolean).sort((a, b) =>
            getTagDisplayName(a).localeCompare(getTagDisplayName(b), undefined, { sensitivity: 'base' })
        );
    }

    function getSelectableTagKeys() {
        const keys = new Set(getDefinedTagKeys());
        getAllUsedTags().forEach(k => keys.add(k));
        return Array.from(keys).sort((a, b) =>
            getTagDisplayName(a).localeCompare(getTagDisplayName(b), undefined, { sensitivity: 'base' })
        );
    }

    function ensureTagDefinitionsForUsedTags() {
        const defs = loadTagDefinitions();
        let changed = false;
        getAllUsedTags().forEach(key => {
            if (!defs[key]) {
                defs[key] = { name: formatTagNameFromKey(key), color: '#9e9e9e' };
                changed = true;
            }
        });
        if (changed) saveTagDefinitions(defs);
    }

    function normalizeStoredPhoneTagKeys() {
        const allTags = loadPhoneTags();
        let changed = false;
        Object.keys(allTags).forEach(barcode => {
            const normalized = [...new Set(allTags[barcode].map(normalizeTagKey).filter(Boolean))];
            if (JSON.stringify(normalized) !== JSON.stringify(allTags[barcode])) {
                if (normalized.length) allTags[barcode] = normalized;
                else delete allTags[barcode];
                changed = true;
            }
        });
        if (changed) savePhoneTags(allTags);
    }

    normalizeStoredPhoneTagKeys();
    ensureTagDefinitionsForUsedTags();
    
    function showTagSelectionMenu(barcode, mode, existingTags = []) {
        const existingMenu = document.querySelector('.tm-phone-tag-submenu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        const tagMenu = document.createElement('div');
        tagMenu.className = 'tm-phone-tag-submenu';
        
        const normalizedExisting = existingTags.map(normalizeTagKey);
        const tagsToShow = mode === 'add'
            ? getDefinedTagKeys().filter(tag => !normalizedExisting.includes(tag))
            : normalizedExisting;

        if (tagsToShow.length === 0) {
            tagMenu.innerHTML = `<div style="padding: 12px; text-align: center; color: var(--tm-shop-item-text); opacity: 0.7; font-size: 12px; max-width: 220px;">
                ${mode === 'add' ? t('Create tags first') : 'No tags to remove'}
            </div>`;
        } else {
            tagsToShow.forEach(tag => {
                const menuItem = document.createElement('div');
                menuItem.className = 'tm-phone-tag-submenu-item';
                const color = getTagColor(tag);
                menuItem.innerHTML = `
                    <span class="tag-color" style="background: ${color};"></span>
                    <span>${getTagDisplayName(tag)}</span>
                `;
                menuItem.addEventListener('click', () => {
                    if (mode === 'add') {
                        if (addPhoneTag(barcode, tag)) {
                            applyFilters();
                            if (window.showPositiveMessage) {
                                window.showPositiveMessage(`${t('Tag added')}: ${getTagDisplayName(tag)}`);
                            }
                        }
                    } else {
                        if (removePhoneTag(barcode, tag)) {
                            applyFilters();
                            if (window.showPositiveMessage) {
                                window.showPositiveMessage(`${t('Tag removed')}: ${getTagDisplayName(tag)}`);
                            }
                        }
                    }
                    tagMenu.remove();
                    contextMenu.style.display = 'none';
                });
                tagMenu.appendChild(menuItem);
            });
        }

        if (mode === 'add') {
            const manageItem = document.createElement('div');
            manageItem.className = 'tm-phone-tag-submenu-item';
            manageItem.style.borderTop = '1px solid var(--tm-shop-item-border)';
            manageItem.style.marginTop = '4px';
            manageItem.style.paddingTop = '10px';
            manageItem.innerHTML = `<span style="opacity:0.85;">⚙️ ${t('Manage Tags')}</span>`;
            manageItem.addEventListener('click', () => {
                tagMenu.remove();
                contextMenu.style.display = 'none';
                showTagManagerModal();
            });
            tagMenu.appendChild(manageItem);
        }
        // Position the menu next to the context menu
        const addTagItem = contextMenu.querySelector('[data-action="add-tag"]') || contextMenu.querySelector('[data-action="remove-tag"]');
        if (addTagItem) {
            const rect = addTagItem.getBoundingClientRect();
            tagMenu.style.position = 'fixed';
            
            // Temporarily append to measure dimensions
            tagMenu.style.visibility = 'hidden';
            tagMenu.style.display = 'block';
            document.body.appendChild(tagMenu);
            
            const menuWidth = tagMenu.offsetWidth;
            const menuHeight = tagMenu.offsetHeight;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Calculate horizontal position
            let left = rect.right + 4;
            // If menu would go off right edge, position it to the left instead
            if (left + menuWidth > viewportWidth) {
                left = rect.left - menuWidth - 4;
                // If that would go off left edge, just position from right edge
                if (left < 0) {
                    left = viewportWidth - menuWidth - 10;
                }
            }
            
            // Calculate vertical position
            let top = rect.top;
            // If menu would go off bottom edge, adjust upward
            if (top + menuHeight > viewportHeight) {
                top = viewportHeight - menuHeight - 10;
                // If that would go off top edge, just position from top
                if (top < 10) {
                    top = 10;
                }
            }
            
            tagMenu.style.left = `${left}px`;
            tagMenu.style.top = `${top}px`;
            tagMenu.style.visibility = 'visible';
        } else {
            // Make submenu visible
            tagMenu.style.display = 'block';
            document.body.appendChild(tagMenu);
        }
        
        // Close menu when clicking outside
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!tagMenu.contains(e.target) && !contextMenu.contains(e.target)) {
                    tagMenu.remove();
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 100);
    }
    
    // Performance optimization: Caches for expensive operations
    const extractBaseModelCache = new Map();
    const parsePhoneNameCache = new Map();
    
    function clearCaches() {
        phoneCatalogGbCache.clear();
        phoneCatalogColorCache.clear();
        extractBaseModelCache.clear();
        parsePhoneNameCache.clear();
    }
    
    setInterval(() => {
        if (phoneCatalogGbCache.size > 10000 || phoneCatalogColorCache.size > 10000 || extractBaseModelCache.size > 10000) {
            clearCaches();
            console.log('[MMS Phone List] Caches cleared to free memory');
        }
    }, 600000); // 10 minutes
    
    // Debounce function for search input
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    function showColorManagerModal() {
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
            const suggestion = suggestPhoneColorHex(nameInput.value);
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
            const hex = normalizePhoneColorHex(hexInput.value);
            if (hex) picker.value = hex;
        });
        nameInput.addEventListener('input', updateColorSuggestion);
        syncHexFromPicker();

        const refreshAfterChange = () => {
            phoneCatalogColorCache.clear();
            extractBaseModelCache.clear();
            populateFilters(allPhones, ['color']);
            applyFilters();
            renderPhoneColorList();
        };

        const renderPhoneColorList = () => {
            const colors = loadPhoneColors();
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
            listEl.innerHTML = names.map(name => {
                const entry = normalizeColorEntry(colors[name], name);
                const listHex = entry.listHex || entry.hex || '#808080';
                const aliases = getAliasesForColor(name).join(', ');
                const titleOutline = getPhoneCatalogOutlineStyle(name, listHex);
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
                const outline = getPhoneCatalogOutlineStyle(colorName, hex);
                input.setAttribute('style', `flex:1;padding:6px 8px;border:1px solid var(--tm-shop-item-border);border-radius:5px;background:var(--tm-shop-item-bg);font-size:13px;font-weight:700;min-width:0;box-sizing:border-box;color:${hex};${outline}`);
            };

            listEl.querySelectorAll('.tm-phone-list-color-picker').forEach(input => {
                input.addEventListener('change', () => {
                    const hex = normalizePhoneColorHex(input.value);
                    if (!hex || !updatePhoneListColor(input.dataset.color, hex)) return;
                    const row = input.closest('.tm-phone-color-row');
                    const label = row?.querySelector('.tm-phone-list-color-label');
                    const nameInput = row?.querySelector('.tm-phone-color-name-input');
                    if (label) label.textContent = hex;
                    if (nameInput) applyNameInputStyle(nameInput, input.dataset.color, hex);
                    phoneCatalogColorCache.clear();
                    extractBaseModelCache.clear();
                    applyFilters();
                    if (window.showPositiveMessage) window.showPositiveMessage(t('Color updated'));
                });
            });

            listEl.querySelectorAll('.tm-phone-color-name-input').forEach(input => {
                const commitRename = () => {
                    const oldName = input.dataset.color;
                    const newName = normalizePhoneColorName(input.value);
                    if (!newName) {
                        input.value = oldName;
                        if (window.showNegativeMessage) window.showNegativeMessage(t('Invalid color name or hex'));
                        return;
                    }
                    if (newName === oldName) return;
                    const result = renamePhoneColor(oldName, newName);
                    if (!result.ok) {
                        input.value = oldName;
                        const msg = result.error === 'exists' ? t('Color already exists') : t('Invalid color name or hex');
                        if (window.showNegativeMessage) window.showNegativeMessage(msg);
                        else if (window.showPositiveMessage) window.showPositiveMessage(msg);
                        return;
                    }
                    phoneCatalogColorCache.clear();
                    extractBaseModelCache.clear();
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

            listEl.querySelectorAll('.tm-phone-color-alias-input').forEach(input => {
                input.addEventListener('change', () => {
                    setColorDisplayAliasesForColor(input.dataset.color, input.value);
                    phoneCatalogColorCache.clear();
                    applyFilters();
                    if (window.showPositiveMessage) window.showPositiveMessage(t('Color updated'));
                });
            });

            listEl.querySelectorAll('.tm-delete-phone-color').forEach(btn => {
                btn.addEventListener('click', () => {
                    removePhoneColor(btn.dataset.color);
                    if (window.showPositiveMessage) window.showPositiveMessage(t('Color removed'));
                    refreshAfterChange();
                });
            });
        };

        panel.querySelector('#tm-add-color-btn').addEventListener('click', () => {
            const result = addPhoneColor(nameInput.value, hexInput.value || picker.value, hexInput.value || picker.value);
            if (!result.ok) {
                const msg = result.error === 'exists' ? t('Color already exists') : t('Invalid color name or hex');
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

        syncPhoneColorCatalog(allPhones);
        renderPhoneColorList();
    }

    function showTagManagerModal() {
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
            const hex = normalizePhoneColorHex(hexInput.value);
            if (hex) picker.value = hex;
        });
        syncHexFromPicker();

        const refreshAfterChange = () => {
            populateFilters(allPhones, ['tag']);
            applyFilters();
            renderTagList();
        };

        const renderTagList = () => {
            const keys = getDefinedTagKeys();
            if (!keys.length) {
                listEl.innerHTML = `<div style="font-size:12px;opacity:0.6;padding:8px 0;">${t('No custom tags yet')}</div>`;
                return;
            }
            listEl.innerHTML = keys.map(key => {
                const def = getTagDefinition(key);
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

            listEl.querySelectorAll('.tm-phone-tag-color-picker').forEach(input => {
                input.addEventListener('change', () => {
                    const hex = normalizePhoneColorHex(input.value);
                    const key = input.dataset.tag;
                    const def = getTagDefinition(key);
                    if (!hex || !updateTagDefinition(key, def.name, hex).ok) return;
                    const row = input.closest('.tm-phone-tag-row');
                    const label = row?.querySelector('.tm-phone-tag-color-label');
                    const nameInputEl = row?.querySelector('.tm-phone-tag-name-input');
                    if (label) label.textContent = hex;
                    if (nameInputEl) nameInputEl.style.color = hex;
                    refreshAfterChange();
                });
            });

            listEl.querySelectorAll('.tm-phone-tag-name-input').forEach(input => {
                const commitRename = () => {
                    const oldKey = input.dataset.tag;
                    const newName = input.value.trim();
                    if (!newName) {
                        input.value = getTagDisplayName(oldKey);
                        if (window.showNegativeMessage) window.showNegativeMessage(t('Invalid tag name'));
                        return;
                    }
                    if (normalizeTagKey(newName) === oldKey && newName === getTagDefinition(oldKey).name) return;
                    const def = getTagDefinition(oldKey);
                    const result = updateTagDefinition(oldKey, newName, def.color);
                    if (!result.ok) {
                        input.value = getTagDisplayName(oldKey);
                        const msg = result.error === 'exists' ? t('Tag already exists') : t('Invalid tag name');
                        if (window.showNegativeMessage) window.showNegativeMessage(msg);
                        return;
                    }
                    if (result.renamed) renamePhoneTagKeyOnAllPhones(result.oldKey, result.key);
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

            listEl.querySelectorAll('.tm-delete-phone-tag').forEach(btn => {
                btn.addEventListener('click', () => {
                    const key = btn.dataset.tag;
                    deleteTagDefinition(key);
                    removePhoneTagFromAllPhones(key);
                    if (window.showPositiveMessage) window.showPositiveMessage(t('Tag removed'));
                    refreshAfterChange();
                });
            });
        };

        panel.querySelector('#tm-add-tag-btn').addEventListener('click', () => {
            const result = addTagDefinition(nameInput.value, hexInput.value || picker.value);
            if (!result.ok) {
                const msg = result.error === 'exists' ? t('Tag already exists') : t('Invalid tag name');
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

    function showStoreRulesModal() {
        const existing = document.getElementById('tm-phone-stores-modal');
        if (existing) existing.remove();

        const rules = loadPhoneStoreRules();
        const modal = document.createElement('div');
        modal.id = 'tm-phone-stores-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:100010;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;padding:16px;';

        const panel = document.createElement('div');
        panel.style.cssText = 'width:min(560px,100%);max-height:85vh;overflow:auto;background:var(--tm-shop-item-bg);color:var(--tm-shop-item-text);border:1px solid var(--tm-shop-item-border);border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,0.35);padding:16px;';

        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h3 style="margin:0;font-size:16px;font-weight:600;">${t('Manage Stores')}</h3>
                <button id="tm-stores-close" type="button" style="border:none;background:transparent;font-size:22px;cursor:pointer;color:var(--tm-shop-item-text);line-height:1;">&times;</button>
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
        const listEl = panel.querySelector('#tm-phone-stores-list');
        let draftOverrides = { ...rules.overrides };

        const getDraftRules = () => ({
            buybackPatterns: parseStorePatternCsv(buybackPatternsInput.value),
            regularPatterns: parseStorePatternCsv(regularPatternsInput.value),
            overrides: { ...draftOverrides }
        });

        const renderStoreRulesList = () => {
            const draft = getDraftRules();
            const knownStores = collectKnownStoreNames(allPhones, otherStorePhones);
            if (!knownStores.length) {
                listEl.innerHTML = `<div style="font-size:12px;opacity:0.6;padding:8px 0;">${t('No known stores yet')}</div>`;
                return;
            }
            listEl.innerHTML = knownStores.map(storeName => {
                const override = draft.overrides[storeName] || {};
                const bbAllowed = typeof override.buyback === 'boolean'
                    ? override.buyback
                    : storeNameMatchesPatterns(storeName, draft.buybackPatterns);
                const regularAllowed = typeof override.regular === 'boolean'
                    ? override.regular
                    : storeNameMatchesPatterns(storeName, draft.regularPatterns);
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

            listEl.querySelectorAll('.tm-store-bb-allowed, .tm-store-regular-allowed').forEach(input => {
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

        const persistStoreRules = () => {
            const next = getDraftRules();
            if (!next.buybackPatterns.length) {
                next.buybackPatterns = getDefaultPhoneStoreRules().buybackPatterns;
                buybackPatternsInput.value = next.buybackPatterns.join(', ');
            }
            savePhoneStoreRules(next);
            draftOverrides = { ...next.overrides };
            if (window.showPositiveMessage) window.showPositiveMessage(t('Store rules saved'));
            applyFilters();
            renderStoreRulesList();
        };

        panel.querySelector('#tm-save-store-rules').addEventListener('click', persistStoreRules);
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

        renderStoreRulesList();
    }
    
    // ── Canonical model list ───────────────────────────────────────────────────
    // Ordered most-specific → least-specific within each family.
    // Used to normalise typo variants (e.g. "PROMAX", "PRO  MAX", Greek chars)
    // back to a single display name.
    const CANONICAL_MODELS = [
        // iPhone SE — year/generation variants before generic SE
        'iPhone SE 2022', 'iPhone SE 2020',
        'iPhone SE (3rd gen)', 'iPhone SE (2nd gen)', 'iPhone SE',
        // iPhone 6
        'iPhone 6s Plus', 'iPhone 6s', 'iPhone 6 Plus', 'iPhone 6',
        // iPhone 7
        'iPhone 7 Plus', 'iPhone 7',
        // iPhone 8
        'iPhone 8 Plus', 'iPhone 8',
        // iPhone X
        'iPhone XS Max', 'iPhone XS', 'iPhone XR', 'iPhone X',
        // iPhone 11
        'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
        // iPhone 12
        'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12 Mini', 'iPhone 12',
        // iPhone 13
        'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13 Mini', 'iPhone 13',
        // iPhone 14
        'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
        // iPhone 15
        'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
        // iPhone 16
        'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
        // iPhone 17 / Air
        'iPhone 17 Pro Max', 'iPhone 17 Pro', 'iPhone 17 Plus', 'iPhone 17',
        'iPhone Air',
        // Samsung Galaxy S (newest first so more-specific entries match first)
        'Samsung Galaxy S25 Ultra', 'Samsung Galaxy S25 Plus', 'Samsung Galaxy S25',
        'Samsung Galaxy S24 Ultra', 'Samsung Galaxy S24 Plus', 'Samsung Galaxy S24 FE', 'Samsung Galaxy S24',
        'Samsung Galaxy S23 Ultra', 'Samsung Galaxy S23 Plus', 'Samsung Galaxy S23 FE', 'Samsung Galaxy S23',
        'Samsung Galaxy S22 Ultra', 'Samsung Galaxy S22 Plus', 'Samsung Galaxy S22',
        'Samsung Galaxy S21 Ultra', 'Samsung Galaxy S21 Plus', 'Samsung Galaxy S21 FE', 'Samsung Galaxy S21',
        'Samsung Galaxy S20 Ultra', 'Samsung Galaxy S20 Plus', 'Samsung Galaxy S20 FE', 'Samsung Galaxy S20',
        'Samsung Galaxy S10 Plus', 'Samsung Galaxy S10e', 'Samsung Galaxy S10',
        'Samsung Galaxy S9 Plus', 'Samsung Galaxy S9',
        'Samsung Galaxy S8 Plus', 'Samsung Galaxy S8',
        'Samsung Galaxy S7 Edge', 'Samsung Galaxy S7',
        'Samsung Galaxy S6 Edge Plus', 'Samsung Galaxy S6 Edge', 'Samsung Galaxy S6',
        // Samsung Galaxy Note
        'Samsung Galaxy Note 20 Ultra', 'Samsung Galaxy Note 20',
        'Samsung Galaxy Note 10 Plus', 'Samsung Galaxy Note 10',
        'Samsung Galaxy Note 9', 'Samsung Galaxy Note 8',
        // Samsung Galaxy Z
        'Samsung Galaxy Z Fold 6', 'Samsung Galaxy Z Fold 5', 'Samsung Galaxy Z Fold 4',
        'Samsung Galaxy Z Fold 3', 'Samsung Galaxy Z Fold 2',
        'Samsung Galaxy Z Flip 6', 'Samsung Galaxy Z Flip 5', 'Samsung Galaxy Z Flip 4',
        'Samsung Galaxy Z Flip 3',
        // Samsung Galaxy A (most popular first within each number tier)
        'Samsung Galaxy A73', 'Samsung Galaxy A72', 'Samsung Galaxy A71',
        'Samsung Galaxy A55', 'Samsung Galaxy A54', 'Samsung Galaxy A53', 'Samsung Galaxy A52s', 'Samsung Galaxy A52', 'Samsung Galaxy A51',
        'Samsung Galaxy A35', 'Samsung Galaxy A34', 'Samsung Galaxy A33',
        'Samsung Galaxy A25', 'Samsung Galaxy A24', 'Samsung Galaxy A23',
        'Samsung Galaxy A16', 'Samsung Galaxy A15', 'Samsung Galaxy A14', 'Samsung Galaxy A13',
        'Samsung Galaxy A06', 'Samsung Galaxy A05', 'Samsung Galaxy A04', 'Samsung Galaxy A03',
    ];

    // Normalise a string for canonical matching:
    // collapse typos, convert + to PLUS, strip non-alphanumeric
    function _normForCanonical(str) {
        return str.toUpperCase()
            .replace(/\bPROMAX\b/g, 'PRO MAX')
            .replace(/\bXSMAX\b/g,  'XS MAX')
            .replace(/\+/g, ' PLUS ')
            .replace(/[^A-Z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ').trim();
    }

    // Pre-compute normalised token arrays once
    const _canonTokens = CANONICAL_MODELS.map(name => ({
        name,
        tokens: _normForCanonical(name).split(' '),
    }));

    // Return the canonical display name if base matches one, otherwise return base as-is
    function normalizeIphoneSeGeneration(base) {
        const norm = _normForCanonical(base);
        if (!/\bIPHONE\b/.test(norm) || !/\bSE\b/.test(norm)) return base;

        if (/\b2022\b/.test(norm) || /\b3RD\b/.test(norm)) {
            return 'iPhone SE 2022';
        }
        if (/\b2020\b/.test(norm) || /\b2ND\b/.test(norm)) {
            return 'iPhone SE 2020';
        }
        if (/\b2016\b/.test(norm) || /\b1ST\b/.test(norm)) {
            return 'iPhone SE';
        }
        return base;
    }

    function matchCanonical(base) {
        if (!base) return base;
        const norm = _normForCanonical(base);
        for (const { name, tokens } of _canonTokens) {
            // All tokens of the canonical must appear as whole words in norm
            const allMatch = tokens.every(t =>
                new RegExp('(?:^|\\s)' + t + '(?:\\s|$)').test(norm)
            );
            if (allMatch) {
                // Year/generation SE models must not collapse to generic "iPhone SE"
                if (name === 'iPhone SE' && /\b(2020|2022|2016|2ND|3RD|1ST)\b/.test(norm)) {
                    continue;
                }
                return name;
            }
        }
        return base;
    }

    // Helper function to extract base model (without GB/TB and color)
    function extractBaseModel(model) {
        if (!model) return '';
        if (extractBaseModelCache.has(model)) {
            return extractBaseModelCache.get(model);
        }
        // Remove GB/TB and color info, keep main model name
        // e.g., "IPHONE 11 PRO MAX 64GB SILVER" -> "IPHONE 11 PRO MAX"
        let base = model;
        
        // Strip Greek "used phone" prefix e.g. "ΜΕΤΑΧΕΙΡΙΣΜΕΝΟ ΚΙΝΗΤΟ ΤΗΛΕΦΩΝΟ"
        base = base.replace(/ΜΕΤΑΧΕΙΡΙΣΜΕΝΟ\s+ΚΙΝΗΤΟ\s+ΤΗΛΕΦΩΝΟ\s*/gi, '');

        // Strip BB buyback codes in parentheses e.g. (BB-B:…), (BB: A+ …), (BB-A+ …)
        base = base.replace(/\s*(BB|ΒΒ):\s*\([^)]*\)?\s*/gi, ' ');
        base = base.replace(/\s*\(BB[^)]*\)?\s*/gi, ' ');

        // Strip trailing buyback marker if parsing left it behind
        base = base.replace(/\s+(BB|ΒΒ):\s*$/gi, ' ');

        // Normalise eSIM variants — handles Latin E, Greek Ε (U+0395), with or without dash/space/hyphen
        // Matches: eSIM, E-SIM, Ε-SIM (Greek), e sim only, E SIM ONLY, etc.
        base = base.replace(/\s*[–\-]?\s*[\u0045\u0395][\s\-]?SIM(\s+ONLY)?\s*/gi, ' ');

        // Remove storage (GB/TB) - handle various formats
        base = base.replace(/\s*\d+\s*TB\s*/gi, ' ');
        base = base.replace(/\s*\d+\s*GB\s*/gi, ' ');
        
        // Remove storage with just "G" (e.g., "128G", "256G")
        base = base.replace(/\s*\d+\s*G(?!\w)/gi, ' ');
        
        // Remove common storage sizes WITHOUT suffix (64GB and up only), but ONLY if they appear after a color or at the end
        // This prevents removing model numbers like "16" in "IPHONE 16"
        // Only remove if: number is followed by a space and then a color, or is at the end of the string
        const commonSizes = [64, 128, 256, 512, 1024, 2048];
        const allColors = getAllKnownColorsForModelFix();
        
        for (const size of commonSizes) {
            // Only remove storage number if it's followed by a color or BB pattern
            for (const color of allColors) {
                const regex = new RegExp('\\b' + size + '\\s+' + color + '\\b', 'gi');
                base = base.replace(regex, color);
            }
            // Also remove if followed by BB pattern
            const bbRegex = new RegExp('\\b' + size + '\\s+(BB|ΒΒ)', 'gi');
            base = base.replace(bbRegex, '$1');
        }
        
        const multiWordColors = getMultiWordPhoneColors();
        for (const color of multiWordColors) {
            const colorRegex = new RegExp(color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            base = base.replace(colorRegex, ' ');
        }
        
        const singleColors = getSingleWordPhoneColors();
        for (const color of singleColors) {
            const colorRegex = new RegExp('\\b' + color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
            base = base.replace(colorRegex, ' ');
        }
        
        // Clean up multiple spaces and trim
        base = base.replace(/\s+/g, ' ').trim();

        base = normalizeIphoneSeGeneration(base);

        // Map to canonical display name (fixes typos, joins variants like eSIM / non-eSIM)
        base = matchCanonical(base);

        extractBaseModelCache.set(model, base);
        return base;
    }

    // Function to copy text to clipboard
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                if (window.showPositiveMessage) {
                    window.showPositiveMessage(`✓ Copied to clipboard`);
                }
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            if (window.showPositiveMessage) {
                window.showPositiveMessage(`✓ Copied to clipboard`);
            }
        }
    }
    
    
    // Function to sort phones
    function sortPhones(phones) {
        return [...phones].sort((a, b) => {
            let aVal, bVal;
            
            switch(sortBy) {
                case 'model':
                    aVal = extractBaseModel(a.model || '');
                    bVal = extractBaseModel(b.model || '');
                    break;
                case 'grade':
                    return sortAscending
                        ? comparePhoneGrades(a.grade, b.grade)
                        : comparePhoneGrades(b.grade, a.grade);
                case 'gb':
                    aVal = extractGB(a.model || '');
                    bVal = extractGB(b.model || '');
                    // Convert to numeric for proper sorting
                    const aIsTB = aVal.toUpperCase().includes('TB');
                    const bIsTB = bVal.toUpperCase().includes('TB');
                    const aNum = parseInt(aVal) * (aIsTB ? 1024 : 1);
                    const bNum = parseInt(bVal) * (bIsTB ? 1024 : 1);
                    return sortAscending ? aNum - bNum : bNum - aNum;
                case 'color':
                    aVal = extractColor(a.model || '');
                    bVal = extractColor(b.model || '');
                    break;
                case 'imei':
                    aVal = a.imei || '';
                    bVal = b.imei || '';
                    break;
                default:
                    aVal = a.model || '';
                    bVal = b.model || '';
            }
            
            if (sortBy === 'gb') return 0; // Already handled above
            
            const comparison = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
            return sortAscending ? comparison : -comparison;
        });
    }
    
    // Function to populate filter dropdowns
    function populateFilters(phones, updateFilters = ['grade', 'model', 'gb', 'color', 'tag']) {
        // Save current selections
        const currentGrade = gradeFilter.value;
        const currentModel = modelFilter.value;
        const currentGB = gbFilter.value;
        const currentColor = colorFilter.value;
        const currentTag = (tagFilter && tagFilter.value) || '';
        
        // Extract unique values
        const grades = new Set();
        const models = new Set();
        const gbs = new Set();
        const colors = new Set();
        
        phones.forEach(phone => {
            if (phone.grade) grades.add(phone.grade);
            const baseModel = extractBaseModel(phone.model);
            if (baseModel) models.add(baseModel);
            // Extract GB and color from the full name (phone.name) not the parsed model
            const gb = extractGB(phone.name || phone.model);
            if (gb) gbs.add(gb);
            const color = extractColor(phone.name || phone.model);
            if (color) colors.add(color);
        });
        
        // Populate grade filter
        if (updateFilters.includes('grade')) {
            // Clear existing options except "All"
            while (gradeFilter.children.length > 1) {
                gradeFilter.removeChild(gradeFilter.lastChild);
            }
            const sortedGrades = Array.from(grades).sort(comparePhoneGrades);
            sortedGrades.forEach(grade => {
                const option = document.createElement('option');
                option.value = grade;
                option.textContent = `Grade ${grade}`;
                option.style.cssText = 'background: var(--tm-shop-item-bg); color: var(--tm-shop-item-text); padding: 10px;';
                gradeFilter.appendChild(option);
            });
            // Restore selection if still valid
            if (currentGrade && Array.from(grades).includes(currentGrade)) {
                gradeFilter.value = currentGrade;
            } else if (currentGrade) {
                gradeFilter.value = '';
            }
        }
        
        // Populate model filter
        if (updateFilters.includes('model')) {
            // Clear existing options except "All"
            while (modelFilter.children.length > 1) {
                modelFilter.removeChild(modelFilter.lastChild);
            }
            const sortedModels = Array.from(models).sort((a, b) => {
                // Sort iPhone models naturally (iPhone SE before iPhone 11, etc.)
                return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
            });
            sortedModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                option.style.cssText = 'background: var(--tm-shop-item-bg); color: var(--tm-shop-item-text); padding: 10px;';
                modelFilter.appendChild(option);
            });
            // Restore selection if still valid
            if (currentModel && Array.from(models).includes(currentModel)) {
                modelFilter.value = currentModel;
            } else if (currentModel) {
                modelFilter.value = '';
            }
        }
        
        // Populate GB filter - handle both GB and TB
        if (updateFilters.includes('gb')) {
            // Clear existing options except "All"
            while (gbFilter.children.length > 1) {
                gbFilter.removeChild(gbFilter.lastChild);
            }
            const sortedGBs = Array.from(gbs).sort((a, b) => {
                // Convert to GB equivalent for comparison (1TB = 1024GB)
                const aIsTB = a.toUpperCase().includes('TB');
                const bIsTB = b.toUpperCase().includes('TB');
                const aNum = parseInt(a) * (aIsTB ? 1024 : 1);
                const bNum = parseInt(b) * (bIsTB ? 1024 : 1);
                return aNum - bNum;
            });
            sortedGBs.forEach(gb => {
                const option = document.createElement('option');
                option.value = gb;
                option.textContent = gb;
                option.style.cssText = 'background: var(--tm-shop-item-bg); color: var(--tm-shop-item-text); padding: 10px;';
                gbFilter.appendChild(option);
            });
            // Restore selection if still valid
            if (currentGB && Array.from(gbs).includes(currentGB)) {
                gbFilter.value = currentGB;
            } else if (currentGB) {
                gbFilter.value = '';
            }
        }
        
        // Populate color filter
        if (updateFilters.includes('color')) {
            // Clear existing options except "All"
            while (colorFilter.children.length > 1) {
                colorFilter.removeChild(colorFilter.lastChild);
            }
            const sortedColors = Array.from(colors).sort();
            sortedColors.forEach(color => {
                const option = document.createElement('option');
                option.value = color;
                option.textContent = color;
                stylePhoneColorSelectOption(option, color);
                colorFilter.appendChild(option);
            });
            // Restore selection if still valid
            if (currentColor && Array.from(colors).includes(currentColor)) {
                colorFilter.value = currentColor;
            } else if (currentColor) {
                colorFilter.value = '';
            }
            syncPhoneColorSelectDisplay(colorFilter);
        }
        
        // Populate tag filter
        if (updateFilters.includes('tag') && tagFilter) {
            // Clear existing options except "All"
            while (tagFilter.children.length > 1) {
                tagFilter.removeChild(tagFilter.lastChild);
            }
            const usedTags = getSelectableTagKeys();
            usedTags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag;
                option.textContent = getTagDisplayName(tag);
                option.style.cssText = `background: var(--tm-shop-item-bg); color: ${getTagColor(tag)}; padding: 10px; font-weight: 600;`;
                tagFilter.appendChild(option);
            });
            // Restore selection if still valid
            if (currentTag && usedTags.includes(currentTag)) {
                tagFilter.value = currentTag;
            } else if (currentTag) {
                tagFilter.value = '';
            }
        }
    }
    
    // Function to update statistics display
    function updateStatistics(phones) {
        if (!statisticsDisplay) return;
        
        const stats = {
            total: phones.length,
            byGrade: {},
            byModel: {}
        };
        
        phones.forEach(phone => {
            if (phone.grade) {
                const g = normalizePhoneGrade(phone.grade);
                stats.byGrade[g] = (stats.byGrade[g] || 0) + 1;
            }
            const baseModel = extractBaseModel(phone.model);
            if (baseModel) {
                stats.byModel[baseModel] = (stats.byModel[baseModel] || 0) + 1;
            }
        });
        
        if (stats.total === 0) {
            statisticsDisplay.innerHTML = '';
            return;
        }
        
        // Build statistics with better formatting
        const statsParts = [];
        
        // Total count
        statsParts.push(`<span style="font-weight: 600; color: var(--tm-primary-color);">${stats.total}</span>`);
        
        // Grade breakdown
        const gradeEntries = Object.entries(stats.byGrade).sort((a, b) => comparePhoneGrades(a[0], b[0]));
        if (gradeEntries.length > 0) {
            const gradeParts = gradeEntries.map(([g, count]) => {
                const color = getPhoneGradeColor(g);
                return `<span style="color: ${color};">${g}:${count}</span>`;
            });
            statsParts.push(gradeParts.join(' '));
        }
        
        // Top models (max 3)
        const topModels = Object.entries(stats.byModel)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        if (topModels.length > 0) {
            const modelParts = topModels.map(([model, count]) => {
                // Shorten model names if too long
                const shortModel = model.length > 20 ? model.substring(0, 17) + '...' : model;
                return `<span style="opacity: 0.9;">${shortModel}:<strong style="color: var(--tm-primary-color);">${count}</strong></span>`;
            });
            statsParts.push(modelParts.join(' '));
        }
        
        statisticsDisplay.innerHTML = statsParts.join(' <span style="opacity: 0.3; margin: 0 8px;">|</span> ');
    }
    
    // Helper function to get filtered phones based on current filters, excluding one filter
    function getFilteredPhonesForFilterUpdate(excludeFilter = null) {
        const query = searchInput.value.trim();
        const selectedGrade = excludeFilter !== 'grade' ? gradeFilter.value : '';
        const selectedModel = excludeFilter !== 'model' ? modelFilter.value : '';
        const selectedGB = excludeFilter !== 'gb' ? gbFilter.value : '';
        const selectedColor = excludeFilter !== 'color' ? colorFilter.value : '';
        const selectedTag = (excludeFilter !== 'tag' && tagFilter) ? tagFilter.value : '';
        const useRegex = overlay.querySelector('#tm-phone-regex-toggle').checked;
        
        const baseDataset = showingOtherStores
            ? otherStorePhones.filter(p => (p.otherStoreCount > 0) && ((p.localUnits || 0) <= 0))
            : (showFavoritesOnly ? allPhones.filter(p => favorites.includes(p.barcode)) : allPhones);
        
        let phonesToFilter = baseDataset;
        phonesToFilter = filterIphoneTitlePhones(phonesToFilter);
        
        return phonesToFilter.filter(phone => {
            // Text search filter
            if (query) {
                let matchesSearch = false;
                if (useRegex) {
                    try {
                        const regex = new RegExp(query, 'i');
                        matchesSearch = 
                            regex.test(phone.name) ||
                            regex.test(phone.barcode) ||
                            regex.test(phone.model || '') ||
                            regex.test(phone.grade || '') ||
                            regex.test(phone.imei || '');
                    } catch (e) {
                        // Invalid regex, fall back to simple search
                        matchesSearch = 
                            phone.name.toLowerCase().includes(query.toLowerCase()) ||
                            phone.barcode.toLowerCase().includes(query.toLowerCase()) ||
                            (phone.model && phone.model.toLowerCase().includes(query.toLowerCase())) ||
                            (phone.grade && phone.grade.toLowerCase().includes(query.toLowerCase())) ||
                            (phone.imei && phone.imei.toLowerCase().includes(query.toLowerCase()));
                    }
                } else {
                    const queryLower = query.toLowerCase();
                    matchesSearch = 
                        phone.name.toLowerCase().includes(queryLower) ||
                        phone.barcode.toLowerCase().includes(queryLower) ||
                        (phone.model && phone.model.toLowerCase().includes(queryLower)) ||
                        (phone.grade && phone.grade.toLowerCase().includes(queryLower)) ||
                        (phone.imei && phone.imei.toLowerCase().includes(queryLower));
                }
                if (!matchesSearch) return false;
            }
            
            // Grade filter
            if (selectedGrade && phone.grade !== selectedGrade) {
                return false;
            }
            
            // Model filter
            if (selectedModel) {
                const baseModel = extractBaseModel(phone.model);
                if (baseModel !== selectedModel) {
                    return false;
                }
            }
            
            // GB filter
            if (selectedGB) {
                const gb = extractGB(phone.name || phone.model);
                if (gb !== selectedGB) {
                    return false;
                }
            }
            
            // Color filter
            if (selectedColor) {
                const color = extractColor(phone.name || phone.model);
                if (color !== selectedColor) {
                    return false;
                }
            }
            
            // Tag filter
            if (selectedTag) {
                const phoneTags = getPhoneTags(phone.barcode);
                if (!phoneTags.includes(selectedTag)) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    function getNetworkBasePhones() {
        return otherStorePhones.filter(p => (p.otherStoreCount > 0) && ((p.localUnits || 0) <= 0));
    }

    function syncMineModelFilter() {
        if (modelFilter) modelFilter.value = mineSelectedModel || '';
    }

    function syncNetworkModelFilter() {
        if (networkModelFilter) networkModelFilter.value = networkSelectedModel || '';
    }

    function updateCatalogBackButtons() {
        mineBackBtn?.classList.toggle('is-visible', mineCatalogStep === 'phones' && !searchInput?.value.trim());
        networkBackBtn?.classList.toggle('is-visible', networkCatalogStep === 'phones');
    }

    function syncFilterPanels() {
        const minePanel = overlay.querySelector('#tm-phone-filters-mine');
        const networkPanel = overlay.querySelector('#tm-phone-filters-network');
        if (showingOtherStores) {
            minePanel?.classList.add('is-hidden');
            networkPanel?.classList.add('is-active');
        } else {
            minePanel?.classList.remove('is-hidden');
            networkPanel?.classList.remove('is-active');
        }
        updateCatalogBackButtons();
    }

    function selectMineModel(model) {
        mineSelectedModel = model;
        mineCatalogStep = 'phones';
        syncMineModelFilter();
        updateCatalogBackButtons();
        applyFilters();
    }

    function selectNetworkModel(model) {
        if (!model) return;
        networkSelectedModel = model;
        networkCatalogStep = 'phones';
        if (modelFilter) modelFilter.value = model;
        syncNetworkModelFilter();
        updateCatalogBackButtons();
        applyFilters();
    }

    function renderMineModelPicker() {
        const contentEl = overlay.querySelector('#tm-phone-list-container');
        const phones = filterIphoneTitlePhones(allPhones);
        const models = buildModelGroupsFromPhones(phones, extractBaseModel);
        if (!contentEl) return;
        contentEl.className = 'tm-pc-list tm-cat-table-body';
        contentEl.style.display = '';
        contentEl.innerHTML = PhoneCatalogUI.buildModelGroupList(models);
        if (countDisplay) {
            countDisplay.textContent = `${models.length} μοντέλα · ${phones.length} συσκευές`;
        }
        if (statisticsDisplay) statisticsDisplay.innerHTML = '';
    }

    function renderNetworkModelPicker() {
        const contentEl = overlay.querySelector('#tm-other-store-content');
        const phones = getNetworkBasePhones();
        const models = buildModelGroupsFromPhones(phones, extractBaseModel);
        if (!contentEl) return;
        contentEl.className = 'tm-pc-list tm-cat-table-body';
        contentEl.style.display = '';
        contentEl.innerHTML = PhoneCatalogUI.buildModelGroupList(models);
        if (countDisplay) {
            countDisplay.textContent = `${models.length} μοντέλα · ${phones.length} συσκευές στο δίκτυο`;
        }
        if (statisticsDisplay) statisticsDisplay.innerHTML = '';
    }

    function populateNetworkFilters(dataset = null) {
        const base = dataset || getFilteredPhonesForNetworkFilters();
        const grades = [...new Set(base.map(p => p.grade).filter(Boolean))].sort(comparePhoneGrades);
        const models = [...new Set(base.map(p => extractBaseModel(p.model)).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        if (networkGradeFilter) {
            const cur = networkGradeFilter.value;
            networkGradeFilter.innerHTML = `<option value="">${PHONE_CATALOG_TRANSLATIONS['All Grades']}</option>` +
                grades.map(g => `<option value="${g}">${g}</option>`).join('');
            if (grades.includes(cur)) networkGradeFilter.value = cur;
        }
        if (networkModelFilter) {
            const cur = networkModelFilter.value || networkSelectedModel || '';
            networkModelFilter.innerHTML = '<option value="">— Επιλέξτε μοντέλο —</option>' +
                models.map(m => `<option value="${PhoneCatalogUI.esc(m)}">${PhoneCatalogUI.esc(m)}</option>`).join('');
            if (cur && models.includes(cur)) networkModelFilter.value = cur;
            else if (networkSelectedModel && models.includes(networkSelectedModel)) {
                networkModelFilter.value = networkSelectedModel;
            } else if (networkSelectedModel && !models.includes(networkSelectedModel)) {
                const opt = document.createElement('option');
                opt.value = networkSelectedModel;
                opt.textContent = networkSelectedModel;
                networkModelFilter.appendChild(opt);
                networkModelFilter.value = networkSelectedModel;
            }
        }

        const storeSet = new Set();
        base.forEach((phone) => {
            (phone.stores || []).forEach((store) => {
                if (!store.name) return;
                const clean = store.name.replace(/\s*ΕΜΠΟΡΕΥΣΙΜΩΝ/gi, '').trim();
                const qty = parseInt(store.qty, 10) || 0;
                if (qty === 1) storeSet.add(clean);
            });
        });
        if (networkStoreFilter) {
            const cur = networkStoreFilter.value;
            const stores = [...storeSet].sort();
            networkStoreFilter.innerHTML = '<option value="">Όλα τα καταστήματα</option>' +
                stores.map(s => `<option value="${s}">${s}</option>`).join('');
            if (stores.includes(cur)) networkStoreFilter.value = cur;
        }
    }

    function getFilteredPhonesForNetworkFilters() {
        let base = getNetworkBasePhones();
        if (networkSelectedModel) {
            base = base.filter(p => extractBaseModel(p.model) === networkSelectedModel);
        }
        return base;
    }

    function highlightSearchMatch(containerEl) {
        const query = searchInput?.value.trim();
        if (!query || !containerEl) return;
        const q = query.toLowerCase();
        const rows = containerEl.querySelectorAll('.tm-phone-item');
        let first = null;
        rows.forEach((row) => {
            row.classList.remove('tm-pc-row--highlight');
            const barcode = (row.dataset.barcode || '').toLowerCase();
            const name = (row.dataset.name || '').toLowerCase();
            const imei = (row.dataset.imei || '').toLowerCase();
            if (barcode === q || barcode.includes(q) || name.includes(q) || imei.includes(q)) {
                row.classList.add('tm-pc-row--highlight');
                if (!first) first = row;
            }
        });
        if (first) first.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // Function to apply all filters
    function applyFilters() {
        const query = searchInput.value.trim();
        const useRegex = overlay.querySelector('#tm-phone-regex-toggle')?.checked;

        if (showingOtherStores) {
            if (!query && networkCatalogStep === 'models' && !networkSelectedModel) {
                renderNetworkModelPicker();
                return;
            }
            if (networkSelectedModel) {
                networkCatalogStep = 'phones';
                if (networkModelFilter) networkModelFilter.value = networkSelectedModel;
                if (modelFilter) modelFilter.value = networkSelectedModel;
            }
            updateCatalogBackButtons();
        } else if (!query && mineCatalogStep === 'models' && !mineSelectedModel) {
            renderMineModelPicker();
            return;
        } else if (query) {
            mineCatalogStep = 'phones';
            updateCatalogBackButtons();
        }

        const selectedGrade = showingOtherStores
            ? (networkGradeFilter?.value || '')
            : gradeFilter.value;
        const selectedModel = showingOtherStores
            ? (networkSelectedModel || networkModelFilter?.value || modelFilter.value)
            : (mineSelectedModel || modelFilter.value);
        const selectedStore = showingOtherStores ? (networkStoreFilter?.value || '') : '';
        const selectedGB = gbFilter.value;
        const selectedColor = colorFilter.value;
        const selectedTag = tagFilter ? tagFilter.value : '';

        if (!showingOtherStores && selectedModel) {
            mineCatalogStep = 'phones';
            mineSelectedModel = selectedModel;
            syncMineModelFilter();
            updateCatalogBackButtons();
        }
        
        let phonesToFilter = showingOtherStores
            ? getNetworkBasePhones()
            : (showFavoritesOnly
                ? allPhones.filter(p => favorites.includes(p.barcode))
                : allPhones);
        phonesToFilter = filterIphoneTitlePhones(phonesToFilter);
        
        const queryLower = query ? query.toLowerCase() : null;
        let searchRegex = null;
        if (query && useRegex) {
            try {
                searchRegex = new RegExp(query, 'i');
            } catch (e) {
                searchRegex = null;
            }
        }
        
        filteredPhones = phonesToFilter.filter(phone => {
            if (query) {
                let matchesSearch = false;
                if (searchRegex) {
                    matchesSearch = 
                        searchRegex.test(phone.name) ||
                        searchRegex.test(phone.barcode) ||
                        searchRegex.test(phone.model || '') ||
                        searchRegex.test(phone.grade || '') ||
                        searchRegex.test(phone.imei || '');
                } else {
                    matchesSearch = 
                        phone.name.toLowerCase().includes(queryLower) ||
                        phone.barcode.toLowerCase().includes(queryLower) ||
                        (phone.model && phone.model.toLowerCase().includes(queryLower)) ||
                        (phone.grade && phone.grade.toLowerCase().includes(queryLower)) ||
                        (phone.imei && phone.imei.toLowerCase().includes(queryLower));
                }
                if (!matchesSearch) return false;
            }
            
            if (selectedGrade && phone.grade !== selectedGrade) {
                return false;
            }
            
            if (selectedModel) {
                const baseModel = extractBaseModel(phone.model);
                if (baseModel !== selectedModel) {
                    return false;
                }
            }

            if (selectedStore && !phoneHasStoreWithStock(phone, selectedStore)) {
                return false;
            }
            
            if (selectedGB) {
                const gb = extractGB(phone.name || phone.model);
                if (gb !== selectedGB) {
                    return false;
                }
            }
            
            if (selectedColor) {
                const color = extractColor(phone.name || phone.model);
                if (color !== selectedColor) {
                    return false;
                }
            }
            
            if (selectedTag) {
                const phoneTags = getPhoneTags(phone.barcode);
                if (!phoneTags.includes(selectedTag)) {
                    return false;
                }
            }
            
            return true;
        });
        
        filteredPhones = sortPhones(filteredPhones);
        
        if (showingOtherStores) {
            if (statisticsDisplay) statisticsDisplay.innerHTML = '';
            populateNetworkFilters(filteredPhones);
            renderOtherStorePhones(filteredPhones);
            return;
        }
        
        updateStatistics(filteredPhones);
        renderPhones(filteredPhones, true);
        highlightSearchMatch(container);
    }
    
    // Virtual scrolling state
    const ITEMS_PER_PAGE = 100; // Render 100 phones at a time
    let currentPage = 0;
    let renderedPhones = [];
    
    // Function to render phones (with virtual scrolling for performance)
    function renderPhones(phones, resetPagination = false) {
        const container = overlay.querySelector('#tm-phone-list-container');
        const countDisplay = overlay.querySelector('#tm-phone-count-text');
        
        if (phones.length === 0) {
            container.innerHTML = PhoneCatalogUI.buildEmptyState(
                '🔍',
                'Δεν βρέθηκαν συσκευές',
                'Δοκιμάστε άλλα φίλτρα ή αναζήτηση'
            );
            countDisplay.textContent = '0 συσκευές';
            return;
        }
        
        // Reset pagination if requested
        if (resetPagination) {
            currentPage = 0;
        }
        
        container.className = 'tm-pc-list tm-cat-table-body';
        container.classList.remove('tm-pc-grid', 'tm-pc-list-mode', 'grid-view');
        
        // Virtual scrolling: only render visible phones + buffer
        const startIndex = currentPage * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, phones.length);
        const phonesToRender = phones.slice(startIndex, endIndex);
        renderedPhones = phones;
        
        const catalogCtx = getPhoneCatalogUICtx({ extractBaseModel, getPhoneTags });
        const phonesHTML = phonesToRender.map((phone, idx) => PhoneCatalogUI.buildPhoneRow(phone, catalogCtx, {
            variant: 'mine',
            isSelected: selectedPhones.has(phone.barcode),
            isFavorite: favorites.includes(phone.barcode),
        })).join('');
        
        container.innerHTML = PhoneCatalogUI.buildListHeader('mine') + phonesHTML;
        
        // Show pagination info if there are more phones
        const totalPhones = phones.length;
        const showingPhones = phonesToRender.length;
        if (totalPhones > ITEMS_PER_PAGE) {
            const pageInfo = ` (Showing ${startIndex + 1}-${endIndex} of ${totalPhones})`;
            countDisplay.textContent = `${totalPhones} συσκευές${mineSelectedModel ? ` · ${mineSelectedModel}` : ''}${pageInfo}`;
            
            // Add "Load More" button if there are more phones
            let loadMoreBtn = container.parentElement.querySelector('.tm-phone-load-more');
            if (!loadMoreBtn) {
                loadMoreBtn = document.createElement('button');
                loadMoreBtn.className = 'tm-phone-load-more';
                loadMoreBtn.textContent = 'Load More';
                loadMoreBtn.style.cssText = `
                    width: 100%;
                    padding: 12px;
                    margin-top: 16px;
                    background: var(--tm-shop-item-bg);
                    border: 1px solid var(--tm-shop-item-border);
                    border-radius: 8px;
                    color: var(--tm-shop-item-text);
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.2s;
                `;
                loadMoreBtn.addEventListener('click', () => {
                    currentPage++;
                    renderPhones(renderedPhones, false);
                });
                loadMoreBtn.addEventListener('mouseenter', () => {
                    loadMoreBtn.style.background = 'var(--tm-shop-item-hover-bg)';
                });
                loadMoreBtn.addEventListener('mouseleave', () => {
                    loadMoreBtn.style.background = 'var(--tm-shop-item-bg)';
                });
                container.parentElement.appendChild(loadMoreBtn);
            }
            // Show/hide load more button
            if (endIndex >= totalPhones) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
                loadMoreBtn.textContent = `Load More (${totalPhones - endIndex} remaining)`;
            }
        } else {
            countDisplay.textContent = `${totalPhones} συσκευές${mineSelectedModel ? ` · ${mineSelectedModel}` : ''}`;
            // Remove load more button if it exists
            const loadMoreBtn = container.parentElement.querySelector('.tm-phone-load-more');
            if (loadMoreBtn) {
                loadMoreBtn.remove();
            }
        }
        
        // Use event delegation instead of individual listeners (much more efficient)
        // Remove old listeners if they exist
        if (container._phoneClickHandler) {
            container.removeEventListener('click', container._phoneClickHandler);
            container.removeEventListener('contextmenu', container._phoneContextMenuHandler);
        }
        
        // Click handler (event delegation)
        container._phoneClickHandler = (e) => {
            // Check for buttons first (regardless of whether inside item or not)
            const searchBtn = e.target.closest('.tm-phone-search-btn');
            if (searchBtn) {
                e.stopPropagation();
                const barcode = searchBtn.dataset.barcode;
                if (barcode) {
                    const searchUrl = `https://thefixers.mymanager.gr/mymanagerservice/products_list.php?qs=${encodeURIComponent(barcode)}`;
                    window.open(searchUrl, '_blank');
                }
                return;
            }
            
            const copyImeiBtn = e.target.closest('.tm-phone-copy-imei-btn');
            if (copyImeiBtn) {
                e.stopPropagation();
                const imei = copyImeiBtn.dataset.imei;
                if (imei) {
                    copyToClipboard(imei);
                }
                return;
            }
            
            const favoriteBtn = e.target.closest('.tm-phone-favorite-btn');
            if (favoriteBtn) {
                e.stopPropagation();
                const barcode = favoriteBtn.dataset.barcode;
                if (barcode) {
                    toggleFavorite(barcode);
                }
                return;
            }
            
            // If not a button, check if clicking on phone item
            const item = e.target.closest('.tm-phone-item');
            if (!item) return;
            
            // Don't trigger if clicking buttons (double check)
            if (e.target.closest('button')) return;
            
            const barcode = item.dataset.barcode;
            
            // Toggle selection if Ctrl/Cmd is held
            if (e.ctrlKey || e.metaKey) {
                if (selectedPhones.has(barcode)) {
                    selectedPhones.delete(barcode);
                } else {
                    selectedPhones.add(barcode);
                }
                item.classList.toggle('selected');
                updateSelectionUI();
            } else {
                copyToClipboard(barcode);
            }
        };

        container._phoneDblClickHandler = (e) => {
            const item = e.target.closest('.tm-phone-item');
            if (!item || e.target.closest('button')) return;
            const barcode = item.dataset.barcode;
            if (barcode) {
                const searchUrl = `https://thefixers.mymanager.gr/mymanagerservice/products_list.php?qs=${encodeURIComponent(barcode)}`;
                window.open(searchUrl, '_blank');
            }
        };
        
        // Right-click handler for context menu (event delegation)
        container._phoneContextMenuHandler = (e) => {
            const item = e.target.closest('.tm-phone-item');
            if (!item) return;
            e.preventDefault();
            contextMenuPhone = item;
            
            // Show menu temporarily to measure dimensions
            contextMenu.style.display = 'block';
            contextMenu.style.visibility = 'hidden';
            
            const menuWidth = contextMenu.offsetWidth;
            const menuHeight = contextMenu.offsetHeight;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Calculate horizontal position
            let left = e.pageX;
            // If menu would go off right edge, position to the left of cursor
            if (left + menuWidth > viewportWidth) {
                left = e.pageX - menuWidth;
                // If that would go off left edge, just position from right edge
                if (left < 0) {
                    left = viewportWidth - menuWidth - 10;
                }
            }
            
            // Calculate vertical position
            let top = e.pageY;
            // If menu would go off bottom edge, position above cursor
            if (top + menuHeight > viewportHeight) {
                top = e.pageY - menuHeight;
                // If that would go off top edge, just position from bottom edge
                if (top < 0) {
                    top = viewportHeight - menuHeight - 10;
                }
            }
            
            contextMenu.style.left = left + 'px';
            contextMenu.style.top = top + 'px';
            contextMenu.style.visibility = 'visible';
        };
        
        container.addEventListener('click', container._phoneClickHandler);
        container.addEventListener('dblclick', container._phoneDblClickHandler);
        container.addEventListener('contextmenu', container._phoneContextMenuHandler);
        
        // Favorite buttons
        container.querySelectorAll('.tm-phone-favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const barcode = btn.dataset.barcode;
                toggleFavorite(barcode);
            });
        });
    }
    
    // Function to toggle favorite
    function toggleFavorite(barcode) {
        const index = favorites.indexOf(barcode);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(barcode);
        }
        GM_setValue(FAVORITES_KEY, JSON.stringify(favorites));
        applyFilters();
    }
    
    // Function to update selection UI
    function updateSelectionUI() {
        const exportSelectedBtn = overlay.querySelector('#tm-phone-export-selected');
        const selectAllBtn = overlay.querySelector('#tm-phone-select-all');
        
        if (selectedPhones.size > 0) {
            exportSelectedBtn.style.display = 'block';
            selectAllBtn.style.display = 'inline-block';
            selectAllBtn.textContent = selectedPhones.size === filteredPhones.length 
                ? `☐ ${PHONE_CATALOG_TRANSLATIONS['Deselect All']}` 
                : `☑ ${PHONE_CATALOG_TRANSLATIONS['Select All']}`;
        } else {
            exportSelectedBtn.style.display = 'none';
            selectAllBtn.style.display = 'none';
        }
    }
    
    // Function to export to clipboard
    function exportToClipboard(phones) {
        const lines = phones.map(p => {
            const modelWithoutColor = extractBaseModel(p.model) || p.model || p.name;
            return `${p.barcode}\t${modelWithoutColor}\t${p.grade || ''}\t${p.imei || ''}\t${extractGB(p.model) || ''}\t${extractColor(p.model) || ''}`;
        });
        copyToClipboard(lines.join('\n'));
    }
    
    // Function to export to CSV
    function exportToCSV(phones) {
        // Check if "Include Original Title" checkbox is checked
        const includeOriginalTitle = document.getElementById('tm-phone-export-original-title')?.checked || false;
        
        // Build headers based on option (with Greek translations)
        const headers = includeOriginalTitle 
            ? [
                PHONE_CATALOG_TRANSLATIONS['Barcode'], 
                PHONE_CATALOG_TRANSLATIONS['Model'], 
                PHONE_CATALOG_TRANSLATIONS['Original Title'], 
                PHONE_CATALOG_TRANSLATIONS['Grade'], 
                PHONE_CATALOG_TRANSLATIONS['IMEI'], 
                PHONE_CATALOG_TRANSLATIONS['Storage'], 
                PHONE_CATALOG_TRANSLATIONS['Color']
              ]
            : [
                PHONE_CATALOG_TRANSLATIONS['Barcode'], 
                PHONE_CATALOG_TRANSLATIONS['Model'], 
                PHONE_CATALOG_TRANSLATIONS['Grade'], 
                PHONE_CATALOG_TRANSLATIONS['IMEI'], 
                PHONE_CATALOG_TRANSLATIONS['Storage'], 
                PHONE_CATALOG_TRANSLATIONS['Color']
              ];
        
        // Build rows based on option
        const rows = phones.map(p => {
            const modelWithoutColor = extractBaseModel(p.model) || p.model || p.name;
            const baseRow = [
                p.barcode,
                modelWithoutColor,
                p.grade || '',
                p.imei || '',
                extractGB(p.model) || '',
                extractColor(p.model) || ''
            ];
            
            // Insert original title after Model if option is enabled
            if (includeOriginalTitle) {
                baseRow.splice(2, 0, p.name || ''); // Insert at index 2 (after Model)
            }
            
            return baseRow;
        });
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        
        // Add UTF-8 BOM (Byte Order Mark) so Excel can properly read Greek characters
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;
        
        // Use UTF-8 encoding explicitly
        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `phone-catalog-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (window.showPositiveMessage) {
            window.showPositiveMessage('✓ CSV exported successfully');
        }
    }
    
    // Get DOM elements
    const searchInput = overlay.querySelector('#tm-phone-search-input');
    const gradeFilter = overlay.querySelector('#tm-phone-filter-grade');
    const modelFilter = overlay.querySelector('#tm-phone-filter-model');
    const gbFilter = overlay.querySelector('#tm-phone-filter-gb');
    const colorFilter = overlay.querySelector('#tm-phone-filter-color');
    const tagFilter = overlay.querySelector('#tm-phone-filter-tag');
    const sortBySelect = overlay.querySelector('#tm-phone-sort-by');
    const clearFiltersBtn = overlay.querySelector('#tm-phone-clear-filters');
    const sortDirBtn = overlay.querySelector('#tm-phone-sort-dir');
    const container = overlay.querySelector('#tm-phone-list-container');
    const listTableWrap = overlay.querySelector('#tm-mine-table-wrap') || container?.closest('.tm-pc-table-wrap');
    const otherStoreContainer = overlay.querySelector('#tm-other-store-container');
    const otherStoreContent = overlay.querySelector('#tm-other-store-content');
    const countDisplay = overlay.querySelector('#tm-phone-count-text');
    const statisticsDisplay = overlay.querySelector('#tm-phone-statistics');
    const lastUpdatedDisplay = overlay.querySelector('#tm-phone-last-updated');
    const cacheWarning = overlay.querySelector('#tm-phone-cache-warning');
    const refreshBtn = overlay.querySelector('#tm-phone-refresh-btn');
    const viewToggleBtn = overlay.querySelector('#tm-phone-view-toggle');
    const colorsBtn = overlay.querySelector('#tm-phone-colors-btn');
    const tagsBtn = overlay.querySelector('#tm-phone-tags-btn');
    const storesBtn = overlay.querySelector('#tm-phone-stores-btn');
    const otherStoreToggleBtn = overlay.querySelector('#tm-phone-other-store-toggle');
    const favoritesBtn = overlay.querySelector('#tm-phone-favorites-btn');
    const exportBtn = overlay.querySelector('#tm-phone-export-btn');
    const exportMenu = overlay.querySelector('#tm-phone-export-menu');
    const exportClipboardBtn = overlay.querySelector('#tm-phone-export-clipboard');
    const exportCSVBtn = overlay.querySelector('#tm-phone-export-csv');
    const exportSelectedBtn = overlay.querySelector('#tm-phone-export-selected');
    const selectAllBtn = overlay.querySelector('#tm-phone-select-all');
    const closeBtn = overlay.querySelector('.tm-modal-close');
    const viewTabMine = overlay.querySelector('#tm-pc-view-mine');
    const viewTabOther = overlay.querySelector('#tm-pc-view-other');
    const mineBackBtn = overlay.querySelector('#tm-mine-back-btn');
    const networkBackBtn = overlay.querySelector('#tm-network-back-btn');
    const networkModelFilter = overlay.querySelector('#tm-network-filter-model');
    const networkStoreFilter = overlay.querySelector('#tm-network-filter-store');
    const networkGradeFilter = overlay.querySelector('#tm-network-filter-grade');
    const networkClearBtn = overlay.querySelector('#tm-network-clear-filters');
    const settingsBtn = overlay.querySelector('#tm-phone-settings-btn');
    const settingsMenu = overlay.querySelector('#tm-phone-settings-menu');
    
    function setViewTabActive(view) {
        viewTabMine?.classList.toggle('active', view === 'mine');
        viewTabOther?.classList.toggle('active', view === 'other');
    }
    
    function showOtherStoreView() {
        showingOtherStores = true;
        if (listTableWrap) listTableWrap.style.display = 'none';
        if (container) container.style.display = 'none';
        if (otherStoreContainer) {
            otherStoreContainer.style.display = 'flex';
            otherStoreContainer.style.flexDirection = 'column';
            otherStoreContainer.style.flex = '1';
            otherStoreContainer.style.minHeight = '0';
        }
        if (otherStoreContent) otherStoreContent.style.display = '';
        setViewTabActive('other');
        syncFilterPanels();
        if (statisticsDisplay) statisticsDisplay.innerHTML = '';
        if (!networkSelectedModel && !searchInput.value.trim()) {
            networkCatalogStep = 'models';
        }
        applyFilters();
    }
    
    function showMainView() {
        showingOtherStores = false;
        if (listTableWrap) listTableWrap.style.display = '';
        if (container) container.style.display = '';
        if (otherStoreContainer) otherStoreContainer.style.display = 'none';
        setViewTabActive('mine');
        syncFilterPanels();
        updateSelectionUI();
        if (!searchInput.value.trim() && !mineSelectedModel) {
            mineCatalogStep = 'models';
        }
        applyFilters();
    }
    
    viewTabMine?.addEventListener('click', () => showMainView());
    viewTabOther?.addEventListener('click', async () => {
        try {
            const loadingEl = otherStoreContent;
            if (loadingEl && !otherStoreLoaded) {
                loadingEl.innerHTML = PhoneCatalogUI.buildEmptyState('⏳', 'Φόρτωση άλλων καταστημάτων…');
            }
            await ensureOtherStoreData();
            showOtherStoreView();
        } catch (err) {
            if (otherStoreContent) {
                otherStoreContent.innerHTML = PhoneCatalogUI.buildEmptyState('⚠️', 'Σφάλμα φόρτωσης', err.message || '');
            }
        }
    });
    viewTabOther?.addEventListener('dblclick', (e) => {
        e.preventDefault();
        showOtherStoresModal();
    });

    mineBackBtn?.addEventListener('click', () => {
        mineCatalogStep = 'models';
        mineSelectedModel = null;
        syncMineModelFilter();
        searchInput.value = '';
        gradeFilter.value = '';
        updateCatalogBackButtons();
        renderMineModelPicker();
    });

    networkBackBtn?.addEventListener('click', () => {
        networkCatalogStep = 'models';
        networkSelectedModel = null;
        syncNetworkModelFilter();
        if (modelFilter) modelFilter.value = '';
        if (networkGradeFilter) networkGradeFilter.value = '';
        if (networkStoreFilter) networkStoreFilter.value = '';
        updateCatalogBackButtons();
        renderNetworkModelPicker();
    });

    networkModelFilter?.addEventListener('change', () => {
        if (networkModelFilter.value) {
            selectNetworkModel(networkModelFilter.value);
        } else {
            networkCatalogStep = 'models';
            networkSelectedModel = null;
            if (modelFilter) modelFilter.value = '';
            updateCatalogBackButtons();
            renderNetworkModelPicker();
        }
    });
    networkStoreFilter?.addEventListener('change', applyFilters);
    networkGradeFilter?.addEventListener('change', applyFilters);
    networkClearBtn?.addEventListener('click', () => {
        networkCatalogStep = 'models';
        networkSelectedModel = null;
        if (networkModelFilter) networkModelFilter.value = '';
        if (networkStoreFilter) networkStoreFilter.value = '';
        if (networkGradeFilter) networkGradeFilter.value = '';
        if (modelFilter) modelFilter.value = '';
        updateCatalogBackButtons();
        renderNetworkModelPicker();
    });

    // Model card clicks — delegated so re-renders never lose handlers
    otherStoreContainer?.addEventListener('click', (e) => {
        const card = e.target.closest('.tm-pc-model-card[data-tm-pc-model]');
        if (!card || !showingOtherStores) return;
        if (card.closest('.tm-phone-item')) return;
        e.preventDefault();
        e.stopPropagation();
        selectNetworkModel(card.getAttribute('data-tm-pc-model'));
    });
    listTableWrap?.addEventListener('click', (e) => {
        const card = e.target.closest('.tm-pc-model-card[data-tm-pc-model]');
        if (!card || showingOtherStores) return;
        if (card.closest('.tm-phone-item')) return;
        e.preventDefault();
        e.stopPropagation();
        selectMineModel(card.getAttribute('data-tm-pc-model'));
    });
    otherStoreContainer?.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.tm-pc-model-card[data-tm-pc-model]');
        if (!card || !showingOtherStores) return;
        e.preventDefault();
        selectNetworkModel(card.getAttribute('data-tm-pc-model'));
    });
    listTableWrap?.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.tm-pc-model-card[data-tm-pc-model]');
        if (!card || showingOtherStores) return;
        e.preventDefault();
        selectMineModel(card.getAttribute('data-tm-pc-model'));
    });

    settingsBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!settingsMenu) return;
        settingsMenu.style.display = settingsMenu.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', (e) => {
        if (!settingsMenu || !settingsBtn) return;
        if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
            settingsMenu.style.display = 'none';
        }
    });
    
    function filterOtherStoresWithCurrentFilters(dataset) {
        const query = searchInput.value.trim();
        const selectedGrade = gradeFilter.value;
        const selectedModel = modelFilter.value;
        const selectedGB = gbFilter.value;
        const selectedColor = colorFilter.value;
        const selectedTag = tagFilter ? tagFilter.value : '';
        const useRegex = overlay.querySelector('#tm-phone-regex-toggle').checked;
        
        let searchRegex = null;
        const queryLower = query ? query.toLowerCase() : '';
        if (query && useRegex) {
            try {
                searchRegex = new RegExp(query, 'i');
            } catch (e) {
                searchRegex = null;
            }
        }
        
        const filtered = dataset.filter(phone => {
            if (query) {
                let matchesSearch = false;
                if (searchRegex) {
                    matchesSearch =
                        searchRegex.test(phone.name) ||
                        searchRegex.test(phone.barcode) ||
                        searchRegex.test(phone.model || '') ||
                        searchRegex.test(phone.grade || '') ||
                        searchRegex.test(phone.imei || '');
                } else {
                    matchesSearch =
                        phone.name.toLowerCase().includes(queryLower) ||
                        phone.barcode.toLowerCase().includes(queryLower) ||
                        (phone.model && phone.model.toLowerCase().includes(queryLower)) ||
                        (phone.grade && phone.grade.toLowerCase().includes(queryLower)) ||
                        (phone.imei && phone.imei.toLowerCase().includes(queryLower));
                }
                if (!matchesSearch) return false;
            }
            
            if (selectedGrade && phone.grade !== selectedGrade) return false;
            if (selectedModel) {
                const baseModel = extractBaseModel(phone.model);
                if (baseModel !== selectedModel) return false;
            }
            if (selectedGB) {
                const gb = extractGB(phone.model);
                if (gb !== selectedGB) return false;
            }
            if (selectedColor) {
                const color = extractColor(phone.model);
                if (color !== selectedColor) return false;
            }
            if (selectedTag) {
                const phoneTags = getPhoneTags(phone.barcode);
                if (!phoneTags.includes(selectedTag)) return false;
            }
            return true;
        });
        
        return sortPhones(filtered);
    }
    
    function renderOtherStorePhones(list, targetEl, countEl, statsEl) {
        targetEl = targetEl || overlay.querySelector('#tm-other-store-content');
        countEl = countEl || overlay.querySelector('#tm-phone-count-text');
        statsEl = statsEl !== undefined ? statsEl : overlay.querySelector('#tm-phone-statistics');
        if (!targetEl) return;
        if (!list || list.length === 0) {
            targetEl.className = 'tm-pc-list';
            targetEl.innerHTML = PhoneCatalogUI.buildEmptyState(
                'ℹ️',
                'Δεν υπάρχουν συσκευές σε άλλα καταστήματα',
                'Δοκιμάστε άλλα φίλτρα'
            );
            if (countEl) countEl.textContent = '0 phones available in other stores';
            return;
        }

        targetEl.className = 'tm-pc-list tm-cat-table-body';
        const catalogCtx = getPhoneCatalogUICtx({ extractBaseModel, getPhoneTags });
        const rows = list.map((item, idx) => {
            const hasStoresData = Array.isArray(item.stores);
            const oneUnitStores = hasStoresData && item.stores.length > 0
                ? filterOneUnitStores(item.stores)
                : [];
            const storesHtml = oneUnitStores.length > 0
                ? renderPhoneStoreChipsHtml(item.stores, item.isBuyback)
                : '';
            const noBuybackStore = item.isBuyback && hasStoresData && oneUnitStores.length > 0 && !phoneHasAllowedBuybackStore(item.stores);
            return PhoneCatalogUI.buildPhoneRow(item, catalogCtx, {
                variant: 'other',
                isFavorite: favorites.includes(item.barcode),
                storesHtml,
                storesPending: !storesHtml && (!hasStoresData || item.stores.length === 0),
                noBuybackStore,
                storeSummary: formatStoreSummaryText(
                    item,
                    storesPending ? null : (oneUnitStores.length > 0 ? oneUnitStores.length : 0)
                ),
            });
        }).join('');

        targetEl.innerHTML = PhoneCatalogUI.buildListHeader('other') + rows;
        if (countEl) {
            const modelLabel = networkSelectedModel ? ` · ${networkSelectedModel}` : '';
            countEl.textContent = `${list.length} συσκευές${modelLabel}`;
        }
        if (statsEl) statsEl.innerHTML = '';
        highlightSearchMatch(targetEl);
        
        // Add event listeners for buttons (event delegation)
        if (!targetEl._buttonHandlersAdded) {
            targetEl.addEventListener('click', (e) => {
                // Search button
                const searchBtn = e.target.closest('.tm-phone-search-btn');
                if (searchBtn) {
                    e.stopPropagation();
                    const barcode = searchBtn.dataset.barcode;
                    if (barcode) {
                        const searchUrl = `https://thefixers.mymanager.gr/mymanagerservice/products_list.php?qs=${encodeURIComponent(barcode)}`;
                        window.open(searchUrl, '_blank');
                    }
                    return;
                }
                
                // Copy IMEI button
                const copyImeiBtn = e.target.closest('.tm-phone-copy-imei-btn');
                if (copyImeiBtn) {
                    e.stopPropagation();
                    const imei = copyImeiBtn.dataset.imei;
                    if (imei) {
                        GM_setClipboard(imei);
                        const originalText = copyImeiBtn.innerHTML;
                        copyImeiBtn.innerHTML = '✓';
                        setTimeout(() => {
                            copyImeiBtn.innerHTML = originalText;
                        }, 1000);
                    }
                    return;
                }
                
                // Favorite button
                const favoriteBtn = e.target.closest('.tm-phone-favorite-btn');
                if (favoriteBtn) {
                    e.stopPropagation();
                    const barcode = favoriteBtn.dataset.barcode;
                    if (barcode) {
                        const index = favorites.indexOf(barcode);
                        if (index > -1) {
                            favorites.splice(index, 1);
                        } else {
                            favorites.push(barcode);
                        }
                        GM_setValue(FAVORITES_KEY, JSON.stringify(favorites));
                        // Re-render to update the favorite button state
                        renderOtherStorePhones(list, targetEl, countEl, statsEl);
                    }
                    return;
                }
            });
            targetEl._buttonHandlersAdded = true;
        }
        
        // Auto-load stores for cards that didn't have inline data.
        // Uses a concurrency-limited queue (max 4 parallel requests) + IntersectionObserver
        // so visible cards are prioritised and the page never lags from a flood of requests.
        const CONCURRENCY = 4;
        const storeContainers = Array.from(targetEl.querySelectorAll('.tm-other-store-stores'))
            .filter(sc => sc.querySelector('.tm-cat-store-loading, .tm-pc-store-loading'));

        if (storeContainers.length === 0) return;

        // Resolve a single store container, update the DOM, and cache the result
        function resolveStoreContainer(sc) {
            const productCode = sc.getAttribute('data-product');
            return fetchStorehousesFromPage(productCode)
                .then(stores => {
                    const phoneItem = list.find(p => p.barcode === productCode);
                    if (phoneItem && stores) {
                        phoneItem.stores = stores;
                        const globalItem = otherStorePhones.find(p => p.barcode === productCode);
                        if (globalItem) globalItem.stores = stores;
                    }
                    const filtered = filterOneUnitStores(stores);
                    if (filtered.length === 0) {
                        sc.innerHTML = `<span style="opacity:0.35;font-size:10px;font-style:italic;">Κανένα κατάστημα</span>`;
                        return;
                    }
                    const itemIsBuyback = phoneItem ? phoneItem.isBuyback : false;
                    const summary = formatStoreSummaryText(phoneItem || {}, filtered.length);
                    sc.innerHTML = (summary ? `<span class="tm-pc-store-summary">${summary}</span>` : '') +
                        renderPhoneStoreChipsHtml(stores, itemIsBuyback);
                    if (itemIsBuyback && !phoneHasAllowedBuybackStore(stores)) {
                        const row = sc.closest('.tm-cat-tr--other') || sc.closest('.tm-pc-row--other');
                        if (row) {
                            const modelRow = row.querySelector('.tm-cat-line-primary') || row.querySelector('.tm-pc-row-line1');
                            const noBuybackTitle = t('No buyback store');
                            if (modelRow && !modelRow.querySelector(`span[title="${noBuybackTitle}"]`)) {
                                const ind = document.createElement('span');
                                ind.style.cssText = 'font-size:12px;line-height:1;';
                                ind.title = noBuybackTitle;
                                ind.textContent = '🚫';
                                modelRow.insertBefore(ind, modelRow.firstChild);
                            }
                        }
                    }
                })
                .catch(() => {
                    sc.innerHTML = `<span style="opacity:0.6;font-size:10px;color:#f44336;font-style:italic;">⚠️ Error</span>`;
                });
        }

        // Concurrency queue
        let active = 0;
        const queue = [];
        const allPromises = [];

        function runNext() {
            while (active < CONCURRENCY && queue.length > 0) {
                const sc = queue.shift();
                active++;
                const p = resolveStoreContainer(sc).finally(() => {
                    active--;
                    runNext();
                });
                allPromises.push(p);
            }
        }

        // IntersectionObserver: visible cards go to the FRONT of the queue
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const sc = entry.target;
                observer.unobserve(sc);
                // Move to front so visible cards load first
                const idx = queue.indexOf(sc);
                if (idx > 0) { queue.splice(idx, 1); queue.unshift(sc); }
                runNext();
            });
        }, { root: targetEl.closest('.tm-other-store-overlay') || null, rootMargin: '200px' });

        storeContainers.forEach(sc => {
            queue.push(sc);
            observer.observe(sc);
        });

        // Kick off initial batch
        runNext();

        // After all stores are loaded, update the store filter
        const isInModal = targetEl.closest('.tm-other-store-overlay');
        if (isInModal) {
            Promise.all(allPromises).then(() => {
                const base = otherStorePhones.filter(p => (p.otherStoreCount > 0) && ((p.localUnits || 0) <= 0));
                const storeSet = new Set();
                base.forEach(p => {
                    (p.stores || []).forEach(store => {
                        if (store.name) storeSet.add(store.name.replace(/\s*ΕΜΠΟΡΕΥΣΙΜΩΝ/gi, '').trim());
                    });
                });
                const stores = [...storeSet].sort();
                const storeFilterOS = document.querySelector('#tm-other-store-filter-store');
                if (storeFilterOS && stores.length > 0) {
                    const currentStore = storeFilterOS.value;
                    storeFilterOS.innerHTML = `<option value="">All Stores</option>` +
                        stores.map(s => `<option value="${s}">${s}</option>`).join('');
                    if (stores.includes(currentStore)) storeFilterOS.value = currentStore;
                }
            });
        }
    }
    
    // Export menu — toggled from settings
    exportBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (settingsMenu) settingsMenu.style.display = 'none';
        if (!exportMenu) return;
        exportMenu.style.display = exportMenu.style.display === 'block' ? 'none' : 'block';
    });
    
    document.addEventListener('click', (e) => {
        if (exportMenu && exportBtn && !exportMenu.contains(e.target) && !exportBtn.contains(e.target)) {
            exportMenu.style.display = 'none';
        }
    });
    
    // Function to refresh phone list
    async function refreshPhoneList() {
        refreshBtn.style.opacity = '0.5';
        refreshBtn.style.transform = 'rotate(360deg)';
        container.innerHTML = PhoneCatalogUI.buildEmptyState('⏳', 'Ανανέωση συσκευών…');
        
        try {
            allPhones = filterIphoneTitlePhones(await fetchPhoneList());
            syncPhoneColorCatalog(allPhones);
            populateFilters(allPhones);
            lastUpdated = new Date();
            lastUpdatedDisplay.textContent = `Ενημέρωση: ${lastUpdated.toLocaleDateString()} ${lastUpdated.toLocaleTimeString()}`;
            mineCatalogStep = 'models';
            mineSelectedModel = null;
            syncMineModelFilter();
            // Hide cache warning after refresh
            if (cacheWarning) {
                cacheWarning.style.display = 'none';
            }
            applyFilters();
        } catch (error) {
            container.innerHTML = PhoneCatalogUI.buildEmptyState('❌', 'Αποτυχία ανανέωσης', error.message || 'Unknown error');
        } finally {
            refreshBtn.style.opacity = '1';
            refreshBtn.style.transform = 'rotate(0deg)';
        }
    }
    
    // Close handlers
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'var(--tm-shop-item-hover-bg)';
        closeBtn.style.color = 'var(--tm-shop-item-text)';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'transparent';
        closeBtn.style.color = 'var(--tm-shop-item-text)';
    });
    closeBtn.addEventListener('click', () => {
        overlay.style.animation = 'tm-cat-out 0.18s ease';
        setTimeout(() => overlay.remove(), 200);
    });
    overlay.addEventListener('click', (e) => { 
        if (e.target === overlay) {
            overlay.style.animation = 'tm-cat-out 0.18s ease';
            setTimeout(() => overlay.remove(), 200);
        }
    });
    
    // Close context menu when clicking outside
    document.addEventListener('click', () => {
        if (contextMenu) contextMenu.style.display = 'none';
    });
    
    // Context menu handlers
    contextMenu.querySelectorAll('.tm-phone-context-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            if (!contextMenuPhone) return;
            const action = item.dataset.action;
            const barcode = contextMenuPhone.dataset.barcode;
            const imei = contextMenuPhone.dataset.imei;
            
            switch(action) {
                case 'add-tag':
                    const currentTags = getPhoneTags(barcode);
                    showTagSelectionMenu(barcode, 'add', currentTags);
                    // Don't close context menu yet - let user select tag
                    return;
                case 'remove-tag':
                    const phoneTags = getPhoneTags(barcode);
                    if (phoneTags.length === 0) {
                        if (window.showNegativeMessage) {
                            window.showNegativeMessage('No tags to remove');
                        }
                    } else {
                        showTagSelectionMenu(barcode, 'remove', phoneTags);
                        // Don't close context menu yet - let user select tag
                        return;
                    }
                    break;
            }
            contextMenu.style.display = 'none';
        });
    });
    
    // Filter handlers - debounce search input for performance
    const debouncedApplyFilters = debounce(applyFilters, 300);
    searchInput.addEventListener('input', debouncedApplyFilters);
    
    gradeFilter.addEventListener('change', () => {
        // Get phones filtered by all other filters (excluding grade)
        const filteredPhonesForUpdate = getFilteredPhonesForFilterUpdate('grade');
        // Update other filters based on current filtered results
        populateFilters(filteredPhonesForUpdate, ['model', 'gb', 'color', 'tag']);
        applyFilters();
    });
    
    modelFilter.addEventListener('change', () => {
        // Get phones filtered by all other filters (excluding model)
        const filteredPhonesForUpdate = getFilteredPhonesForFilterUpdate('model');
        // Update other filters based on current filtered results
        populateFilters(filteredPhonesForUpdate, ['grade', 'gb', 'color', 'tag']);
        applyFilters();
    });
    
    gbFilter.addEventListener('change', () => {
        // Get phones filtered by all other filters (excluding gb)
        const filteredPhonesForUpdate = getFilteredPhonesForFilterUpdate('gb');
        // Update other filters based on current filtered results
        populateFilters(filteredPhonesForUpdate, ['grade', 'model', 'color', 'tag']);
        applyFilters();
    });
    
    colorFilter.addEventListener('change', () => {
        syncPhoneColorSelectDisplay(colorFilter);
        // Get phones filtered by all other filters (excluding color)
        const filteredPhonesForUpdate = getFilteredPhonesForFilterUpdate('color');
        // Update other filters based on current filtered results
        populateFilters(filteredPhonesForUpdate, ['grade', 'model', 'gb', 'tag']);
        applyFilters();
    });
    
    if (tagFilter) {
        tagFilter.addEventListener('change', () => {
            // Get phones filtered by all other filters (excluding tag)
            const filteredPhonesForUpdate = getFilteredPhonesForFilterUpdate('tag');
            // Update other filters based on current filtered results
            populateFilters(filteredPhonesForUpdate, ['grade', 'model', 'gb', 'color']);
            applyFilters();
        });
    }
    
    sortBySelect?.addEventListener('change', () => {
        sortBy = sortBySelect.value;
        applyFilters();
    });
    sortDirBtn?.addEventListener('click', () => {
        sortAscending = !sortAscending;
        sortDirBtn.textContent = sortAscending ? '↑' : '↓';
        applyFilters();
    });
    
    // Clear filters button
    clearFiltersBtn.addEventListener('click', () => {
        gradeFilter.value = '';
        modelFilter.value = '';
        mineCatalogStep = 'models';
        mineSelectedModel = null;
        gbFilter.value = '';
        colorFilter.value = '';
        syncPhoneColorSelectDisplay(colorFilter);
        if (tagFilter) tagFilter.value = '';
        searchInput.value = '';
        const regexEl = overlay.querySelector('#tm-phone-regex-toggle');
        if (regexEl) regexEl.checked = false;
        showFavoritesOnly = false;
        if (favoritesBtn) favoritesBtn.classList.remove('active');
        sortBy = 'model';
        sortAscending = true;
        if (sortBySelect) sortBySelect.value = 'model';
        if (sortDirBtn) sortDirBtn.textContent = '↑';
        populateFilters(allPhones, ['grade', 'model', 'gb', 'color', 'tag']);
        updateCatalogBackButtons();
        applyFilters();
    });
    
    // Button handlers
    colorsBtn?.addEventListener('click', () => { if (settingsMenu) settingsMenu.style.display = 'none'; showColorManagerModal(); });
    tagsBtn?.addEventListener('click', () => { if (settingsMenu) settingsMenu.style.display = 'none'; showTagManagerModal(); });
    storesBtn?.addEventListener('click', () => { if (settingsMenu) settingsMenu.style.display = 'none'; showStoreRulesModal(); });

    refreshBtn?.addEventListener('click', refreshPhoneList);
    
    async function ensureOtherStoreData() {
        if (otherStoreLoaded) return;
        otherStorePhones = filterIphoneTitlePhones(await fetchOtherStorePhones());
        otherStoreLoaded = true;
    }
    
    function showOtherStoresModal() {
        if (document.querySelector('.tm-other-store-overlay')) return;
        
        const overlayEl = document.createElement('div');
        overlayEl.className = 'tm-other-store-overlay';
        overlayEl.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            z-index: 100002;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        overlayEl.innerHTML = window.PhoneCatalogUI.buildOtherStoresModalHTML(PHONE_CATALOG_TRANSLATIONS);
        
        document.body.appendChild(overlayEl);
        
        const bodyEl = overlayEl.querySelector('#tm-other-store-modal-body');
        const countEl = overlayEl.querySelector('#tm-other-store-count');
        const closeBtn = overlayEl.querySelector('#tm-other-store-close');
        const refreshBtn = overlayEl.querySelector('#tm-other-store-refresh-btn');
        const gradeFilterOS = overlayEl.querySelector('#tm-other-store-filter-grade');
        const modelFilterOS = overlayEl.querySelector('#tm-other-store-filter-model');
        const gbFilterOS = overlayEl.querySelector('#tm-other-store-filter-gb');
        const colorFilterOS = overlayEl.querySelector('#tm-other-store-filter-color');
        const storeFilterOS = overlayEl.querySelector('#tm-other-store-filter-store');
        const sortOS = overlayEl.querySelector('#tm-other-store-sort');
        const clearFiltersOS = overlayEl.querySelector('#tm-other-store-clear-filters');
        const filterBarOS    = overlayEl.querySelector('#tm-os-filter-bar');
        const backBtnOS      = overlayEl.querySelector('#tm-os-back-btn');

        let osSelectedModel = null;

        // --- Model picker ---
        function selectOsModel(model) {
            if (!model) return;
            osSelectedModel = model;
            modelFilterOS.value = osSelectedModel;
            showPhoneList();
        }

        function renderModelPicker() {
            osSelectedModel = null;
            modelFilterOS.value = '';
            filterBarOS.style.display = 'none';
            backBtnOS.classList.remove('is-visible');

            const base = getNetworkBasePhones();
            const models = buildModelGroupsFromPhones(base, extractBaseModel);

            if (countEl) countEl.textContent = `${models.length} μοντέλα · ${base.length} συσκευές`;

            bodyEl.innerHTML = PhoneCatalogUI.buildModelGroupList(models);
        }

        function showPhoneList() {
            filterBarOS.style.display = 'block';
            backBtnOS.classList.add('is-visible');
            populateFilters();
            if (osSelectedModel) modelFilterOS.value = osSelectedModel;
            applyOtherStoreFilters();
        }

        backBtnOS.addEventListener('click', renderModelPicker);

        overlayEl.addEventListener('click', (e) => {
            const card = e.target.closest('.tm-pc-model-card[data-tm-pc-model]');
            if (!card || card.closest('.tm-phone-item')) return;
            if (filterBarOS.style.display !== 'none') return;
            e.preventDefault();
            e.stopPropagation();
            selectOsModel(card.getAttribute('data-tm-pc-model'));
        });

        closeBtn.addEventListener('click', () => overlayEl.remove());
        
        // Populate filters with unique values from the given dataset
        const populateFilters = (dataset = null, filtersToUpdate = ['grade', 'model', 'gb', 'color', 'store']) => {
            const base = dataset || otherStorePhones.filter(p => (p.otherStoreCount > 0) && ((p.localUnits || 0) <= 0));
            
            // Save current selections
            const currentGrade = gradeFilterOS.value;
            const currentModel = modelFilterOS.value;
            const currentGB = gbFilterOS.value;
            const currentColor = colorFilterOS.value;
            const currentStore = storeFilterOS.value;
            
            // Extract unique values
            if (filtersToUpdate.includes('grade')) {
                const grades = [...new Set(base.map(p => p.grade).filter(g => g))].sort(comparePhoneGrades);
                gradeFilterOS.innerHTML = `<option value="">${PHONE_CATALOG_TRANSLATIONS['All Grades']}</option>` +
                    grades.map(g => `<option value="${g}" style="${getPhoneGradeDisplayStyle(g)}">${g}</option>`).join('');
                if (grades.includes(currentGrade)) gradeFilterOS.value = currentGrade;
            }
            
            if (filtersToUpdate.includes('model')) {
                const models = [...new Set(base.map(p => {
                    return extractBaseModel(p.model);
                }).filter(m => m))].sort();
                modelFilterOS.innerHTML = `<option value="">${PHONE_CATALOG_TRANSLATIONS['All Models']}</option>` +
                    models.map(m => `<option value="${m}" style="${getPhoneCatalogMetaTextStyle()}">${m}</option>`).join('');
                if (models.includes(currentModel)) modelFilterOS.value = currentModel;
            }
            
            if (filtersToUpdate.includes('gb')) {
                const storages = [...new Set(base.map(p => {
                    const gb = extractGB(p.name || p.model);
                    return gb;
                }).filter(s => s))].sort((a, b) => {
                    const aNum = parseInt(a);
                    const bNum = parseInt(b);
                    return aNum - bNum;
                });
                gbFilterOS.innerHTML = `<option value="">${PHONE_CATALOG_TRANSLATIONS['All Storage']}</option>` +
                    storages.map(s => `<option value="${s}" style="${getPhoneCatalogMetaTextStyle()}">${s}</option>`).join('');
                if (storages.includes(currentGB)) gbFilterOS.value = currentGB;
            }
            
            if (filtersToUpdate.includes('color')) {
                const colors = [...new Set(base.map(p => {
                    const color = extractColor(p.name || p.model);
                    return color;
                }).filter(c => c))].sort();
                colorFilterOS.innerHTML = `<option value="">${PHONE_CATALOG_TRANSLATIONS['All Colors']}</option>` +
                    colors.map(c => `<option value="${c}" style="${getPhoneColorDropdownStyle(c)}">${c}</option>`).join('');
                if (colors.includes(currentColor)) colorFilterOS.value = currentColor;
                syncPhoneColorSelectDisplay(colorFilterOS);
            }
            
            if (filtersToUpdate.includes('store')) {
                const storeSet = new Set();
                base.forEach(p => {
                    if (p.stores && Array.isArray(p.stores)) {
                        p.stores.forEach(store => {
                            if (store.name) {
                                const cleanName = store.name.replace(/\s*ΕΜΠΟΡΕΥΣΙΜΩΝ/gi, '').trim();
                                storeSet.add(cleanName);
                            }
                        });
                    }
                });
                const stores = [...storeSet].sort();
                storeFilterOS.innerHTML = `<option value="">All Stores</option>` +
                    stores.map(s => `<option value="${s}">${s}</option>`).join('');
                if (stores.includes(currentStore)) storeFilterOS.value = currentStore;
            }
        };
        
        // Helper — uses shared stock check
        const phoneHasStore = phoneHasStoreWithStock;
        
        // Get filtered dataset excluding specific filters
        const getFilteredDataExcluding = (excludeFilters = []) => {
            const base = otherStorePhones.filter(p => (p.otherStoreCount > 0) && ((p.localUnits || 0) <= 0));
            
            return base.filter(phone => {
                if (!excludeFilters.includes('grade') && gradeFilterOS.value && phone.grade !== gradeFilterOS.value) {
                    return false;
                }
                if (!excludeFilters.includes('model') && modelFilterOS.value) {
                    const phoneModel = extractBaseModel(phone.model);
                    if (phoneModel !== modelFilterOS.value) {
                        return false;
                    }
                }
                if (!excludeFilters.includes('gb') && gbFilterOS.value) {
                    const phoneStorage = extractGB(phone.name || phone.model);
                    if (phoneStorage !== gbFilterOS.value) {
                        return false;
                    }
                }
                if (!excludeFilters.includes('color') && colorFilterOS.value) {
                    const phoneColor = extractColor(phone.name || phone.model);
                    if (phoneColor !== colorFilterOS.value) {
                        return false;
                    }
                }
                if (!excludeFilters.includes('store') && !phoneHasStore(phone, storeFilterOS.value)) {
                    return false;
                }
                return true;
            });
        };
        
        const applyOtherStoreFilters = () => {
            const base = otherStorePhones.filter(p => (p.otherStoreCount > 0) && ((p.localUnits || 0) <= 0));
            
            // Apply filters
            const filtered = base.filter(phone => {
                // Grade filter
                if (gradeFilterOS.value && phone.grade !== gradeFilterOS.value) {
                    return false;
                }
                
                // Model filter
                if (modelFilterOS.value) {
                    const phoneModel = extractBaseModel(phone.model);
                    if (phoneModel !== modelFilterOS.value) {
                        return false;
                    }
                }
                
                // Storage filter
                if (gbFilterOS.value) {
                    const phoneStorage = extractGB(phone.name || phone.model);
                    if (phoneStorage !== gbFilterOS.value) {
                        return false;
                    }
                }
                
                // Color filter
                if (colorFilterOS.value) {
                    const phoneColor = extractColor(phone.name || phone.model);
                    if (phoneColor !== colorFilterOS.value) {
                        return false;
                    }
                }
                
                // Store filter
                if (!phoneHasStore(phone, storeFilterOS.value)) {
                    return false;
                }
                
                return true;
            });
            
            // Apply sorting
            const sortValue = sortOS.value || 'model-asc';
            const [sortBy, sortDir] = sortValue.split('-');
            
            filtered.sort((a, b) => {
                let valA, valB;
                
                switch(sortBy) {
                    case 'model':
                        valA = extractBaseModel(a.model) || a.model || '';
                        valB = extractBaseModel(b.model) || b.model || '';
                        break;
                    case 'price':
                        valA = parseFloat((a.retailPrice || '0').replace(/[^0-9.]/g, '')) || 0;
                        valB = parseFloat((b.retailPrice || '0').replace(/[^0-9.]/g, '')) || 0;
                        break;
                    case 'grade':
                        return sortDir === 'desc'
                            ? comparePhoneGrades(b.grade, a.grade)
                            : comparePhoneGrades(a.grade, b.grade);
                    case 'storage':
                        const gbA = extractGB(a.name || a.model);
                        const gbB = extractGB(b.name || b.model);
                        valA = parseInt((gbA || '0').replace(/[^0-9]/g, '')) || 0;
                        valB = parseInt((gbB || '0').replace(/[^0-9]/g, '')) || 0;
                        break;
                    default:
                        valA = a.model || '';
                        valB = b.model || '';
                }
                
                let comparison = 0;
                if (sortBy === 'price' || sortBy === 'storage') {
                    comparison = valA - valB;
                } else {
                    comparison = String(valA).localeCompare(String(valB));
                }
                
                return sortDir === 'desc' ? -comparison : comparison;
            });
            
            renderOtherStorePhones(filtered, bodyEl, countEl, null);
        };
        
        const renderModal = () => {
            renderModelPicker();
        };
        
        // Reload all filters based on current selections
        const reloadAllFilters = () => {
            // Get the current filtered data based on ALL current filter selections
            const base = otherStorePhones.filter(p => (p.otherStoreCount > 0) && ((p.localUnits || 0) <= 0));
            
            // Apply current filters to get available options
            const currentlyFiltered = base.filter(phone => {
                if (gradeFilterOS.value && phone.grade !== gradeFilterOS.value) return false;
                if (modelFilterOS.value && extractBaseModel(phone.model) !== modelFilterOS.value) return false;
                if (gbFilterOS.value && extractGB(phone.name || phone.model) !== gbFilterOS.value) return false;
                if (colorFilterOS.value && extractColor(phone.name || phone.model) !== colorFilterOS.value) return false;
                if (!phoneHasStore(phone, storeFilterOS.value)) return false;
                return true;
            });
            
            // For each filter, show options available based on OTHER filters
            // Grade options (based on model, gb, color, store selections)
            const gradeData = base.filter(phone => {
                if (modelFilterOS.value && extractBaseModel(phone.model) !== modelFilterOS.value) return false;
                if (gbFilterOS.value && extractGB(phone.name || phone.model) !== gbFilterOS.value) return false;
                if (colorFilterOS.value && extractColor(phone.name || phone.model) !== colorFilterOS.value) return false;
                if (!phoneHasStore(phone, storeFilterOS.value)) return false;
                return true;
            });
            
            // Model options (based on grade, gb, color, store selections)
            const modelData = base.filter(phone => {
                if (gradeFilterOS.value && phone.grade !== gradeFilterOS.value) return false;
                if (gbFilterOS.value && extractGB(phone.name || phone.model) !== gbFilterOS.value) return false;
                if (colorFilterOS.value && extractColor(phone.name || phone.model) !== colorFilterOS.value) return false;
                if (!phoneHasStore(phone, storeFilterOS.value)) return false;
                return true;
            });
            
            // GB options (based on grade, model, color, store selections)
            const gbData = base.filter(phone => {
                if (gradeFilterOS.value && phone.grade !== gradeFilterOS.value) return false;
                if (modelFilterOS.value && extractBaseModel(phone.model) !== modelFilterOS.value) return false;
                if (colorFilterOS.value && extractColor(phone.name || phone.model) !== colorFilterOS.value) return false;
                if (!phoneHasStore(phone, storeFilterOS.value)) return false;
                return true;
            });
            
            // Color options (based on grade, model, gb, store selections)
            const colorData = base.filter(phone => {
                if (gradeFilterOS.value && phone.grade !== gradeFilterOS.value) return false;
                if (modelFilterOS.value && extractBaseModel(phone.model) !== modelFilterOS.value) return false;
                if (gbFilterOS.value && extractGB(phone.name || phone.model) !== gbFilterOS.value) return false;
                if (!phoneHasStore(phone, storeFilterOS.value)) return false;
                return true;
            });
            
            // Store options (based on grade, model, gb, color selections)
            const storeData = base.filter(phone => {
                if (gradeFilterOS.value && phone.grade !== gradeFilterOS.value) return false;
                if (modelFilterOS.value && extractBaseModel(phone.model) !== modelFilterOS.value) return false;
                if (gbFilterOS.value && extractGB(phone.name || phone.model) !== gbFilterOS.value) return false;
                if (colorFilterOS.value && extractColor(phone.name || phone.model) !== colorFilterOS.value) return false;
                return true;
            });
            
            // Update each filter with its specific dataset
            populateFilters(gradeData, ['grade']);
            populateFilters(modelData, ['model']);
            populateFilters(gbData, ['gb']);
            populateFilters(colorData, ['color']);
            populateFilters(storeData, ['store']);
            
            // Apply the filters to update the display
            applyOtherStoreFilters();
        };
        
        // Add filter event listeners - reload all filters on any change
        gradeFilterOS.addEventListener('change', reloadAllFilters);
        modelFilterOS.addEventListener('change', () => {
            if (modelFilterOS.value) {
                osSelectedModel = modelFilterOS.value;
                showPhoneList();
            } else {
                renderModelPicker();
            }
        });
        gbFilterOS.addEventListener('change', reloadAllFilters);
        colorFilterOS.addEventListener('change', () => {
            syncPhoneColorSelectDisplay(colorFilterOS);
            reloadAllFilters();
        });
        storeFilterOS.addEventListener('change', reloadAllFilters);
        
        // Also reload on focus (when user clicks on a filter)
        gradeFilterOS.addEventListener('focus', reloadAllFilters);
        modelFilterOS.addEventListener('focus', reloadAllFilters);
        gbFilterOS.addEventListener('focus', reloadAllFilters);
        colorFilterOS.addEventListener('focus', reloadAllFilters);
        storeFilterOS.addEventListener('focus', reloadAllFilters);
        
        sortOS.addEventListener('change', applyOtherStoreFilters);
        
        clearFiltersOS.addEventListener('click', () => {
            gradeFilterOS.value = '';
            modelFilterOS.value = '';
            gbFilterOS.value = '';
            colorFilterOS.value = '';
            storeFilterOS.value = '';
            if (sortOS) sortOS.value = 'model-asc';
            osSelectedModel = null;
            renderModelPicker();
        });
        
        clearFiltersOS.addEventListener('mouseenter', () => {
            clearFiltersOS.style.background = 'rgba(255,255,255,0.15)';
        });
        clearFiltersOS.addEventListener('mouseleave', () => {
            clearFiltersOS.style.background = 'var(--tm-shop-item-bg)';
        });
        
        // Refresh button handler
        refreshBtn.addEventListener('click', async () => {
            // Disable button and show loading state
            refreshBtn.style.opacity = '0.5';
            refreshBtn.style.transform = 'rotate(360deg)';
            refreshBtn.style.pointerEvents = 'none';
            
            bodyEl.innerHTML = `
                <div style="text-align:center; color: var(--tm-shop-item-text);">
                    <div style="font-size:36px; margin-bottom:10px; animation: pulse 2s ease-in-out infinite;">⏳</div>
                    <div>Refreshing other stores...</div>
                </div>
            `;
            
            try {
                // Clear cache and force reload
                otherStoreLoaded = false;
                GM_setValue(OTHER_STORE_CACHE_KEY, null);
                GM_setValue(OTHER_STORE_CACHE_TIMESTAMP_KEY, 0);
                
                // Fetch fresh data
                otherStorePhones = filterIphoneTitlePhones(await fetchOtherStorePhones());
                otherStoreLoaded = true;
                
                // Reset filters and render updated data
                gradeFilterOS.value = '';
                modelFilterOS.value = '';
                gbFilterOS.value = '';
                colorFilterOS.value = '';
                storeFilterOS.value = '';
                sortOS.value = 'model-asc';
                renderModal();
            } catch (error) {
                bodyEl.innerHTML = `
                    <div style="text-align:center; color: var(--tm-shop-item-text);">
                        <div style="font-size:32px; margin-bottom:8px;">⚠️</div>
                        <div>Failed to refresh. Please try again.</div>
                    </div>
                `;
            } finally {
                // Re-enable button
                refreshBtn.style.opacity = '1';
                refreshBtn.style.transform = 'rotate(0deg)';
                refreshBtn.style.pointerEvents = 'auto';
            }
        });
        
        // Hover effects for refresh button
        refreshBtn.addEventListener('mouseenter', () => {
            if (refreshBtn.style.pointerEvents !== 'none') {
                refreshBtn.style.background = 'rgba(255,255,255,0.15)';
            }
        });
        refreshBtn.addEventListener('mouseleave', () => {
            refreshBtn.style.background = 'rgba(255,255,255,0.1)';
        });
        
        ensureOtherStoreData()
            .then(renderModal)
            .catch(() => {
                bodyEl.innerHTML = `
                    <div style="text-align:center; color: var(--tm-shop-item-text);">
                        <div style="font-size:32px; margin-bottom:8px;">⚠️</div>
                        <div>Could not load other-store availability.</div>
                    </div>
                `;
            });
    }
    
    otherStoreToggleBtn?.addEventListener('click', () => viewTabOther?.click());
    
    favoritesBtn?.addEventListener('click', () => {
        showFavoritesOnly = !showFavoritesOnly;
        favoritesBtn.classList.toggle('active', showFavoritesOnly);
        applyFilters();
    });
    
    exportClipboardBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        exportMenu.style.display = 'none';
        exportToClipboard(filteredPhones);
    });
    
    exportCSVBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        exportMenu.style.display = 'none';
        exportToCSV(filteredPhones);
    });
    
    exportSelectedBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        exportMenu.style.display = 'none';
        const selected = filteredPhones.filter(p => selectedPhones.has(p.barcode));
        exportToCSV(selected);
    });
    
    selectAllBtn.addEventListener('click', () => {
        if (selectedPhones.size === filteredPhones.length) {
            selectedPhones.clear();
            container.querySelectorAll('.tm-phone-item').forEach(item => {
                item.classList.remove('selected');
            });
        } else {
            filteredPhones.forEach(p => selectedPhones.add(p.barcode));
            container.querySelectorAll('.tm-phone-item').forEach(item => {
                item.classList.add('selected');
            });
        }
        updateSelectionUI();
    });
    
    // Keyboard shortcuts
    overlay.addEventListener('keydown', (e) => {
        // ESC to close
        if (e.key === 'Escape') {
            overlay.style.animation = 'tm-cat-out 0.18s ease';
            setTimeout(() => overlay.remove(), 200);
        }
        // Ctrl+F or Cmd+F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
        // Ctrl+R to refresh
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            refreshPhoneList();
        }
    });
    
    // Try to load from cache first (only load from cache, don't auto-fetch)
    const cachedPhones = loadPhoneListCache();
    const cacheAgeDays = getCacheAgeDays();
    
    if (cachedPhones && cachedPhones.length > 0) {
        console.log('[MMS Phone List] Loading from cache');
        allPhones = filterIphoneTitlePhones(cachedPhones);
        syncPhoneColorCatalog(allPhones);
        populateFilters(allPhones);
        
        // Get cache timestamp
        const cacheTimestamp = GM_getValue(PHONE_LIST_CACHE_TIMESTAMP_KEY, Date.now());
        lastUpdated = new Date(cacheTimestamp);
        lastUpdatedDisplay.textContent = `Ενημέρωση: ${lastUpdated.toLocaleDateString()} ${lastUpdated.toLocaleTimeString()}`;
        
        // Show warning if cache is stale
        if (cacheAgeDays !== null && cacheAgeDays >= CACHE_EXPIRATION_DAYS) {
            cacheWarning.style.display = 'inline';
            cacheWarning.textContent = `⚠️ Cache is ${cacheAgeDays} day${cacheAgeDays !== 1 ? 's' : ''} old - click refresh to update`;
            cacheWarning.title = `Data was last refreshed ${cacheAgeDays} day${cacheAgeDays !== 1 ? 's' : ''} ago. Click refresh to update.`;
        }
        
        filteredPhones = allPhones;
        applyFilters();
    } else {
        // No cache, show message to user to click refresh
        console.log('[MMS Phone List] No cache found');
        container.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; min-height: 400px; color: var(--tm-shop-item-text);">
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📱</div>
                    <div style="margin-bottom: 16px; font-size: 16px; font-weight: 600;">No cached data found</div>
                    <div style="font-size: 13px; opacity: 0.7; margin-bottom: 20px;">Click the refresh button (🔄) to load phones</div>
                </div>
            </div>
        `;
        countDisplay.textContent = 'Χωρίς δεδομένα — πατήστε ανανέωση';
        lastUpdatedDisplay.textContent = 'Ποτέ';
    }

    syncFilterPanels();
    setTimeout(() => searchInput?.focus(), 80);
}

// Make function globally accessible
window.showPhoneListModal = showPhoneListModal;
