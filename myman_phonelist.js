// ===================================================================
// === PHONE LIST FEATURE: SEARCHABLE PHONE CATALOG
// ===================================================================

// Cache constants
const PHONE_LIST_CACHE_KEY = 'tm_phone_list_cache';
const PHONE_LIST_CACHE_TIMESTAMP_KEY = 'tm_phone_list_cache_timestamp';
const CACHE_EXPIRATION_DAYS = 3; // Notify user if cache is older than 3 days
// v2: price parsing (div/input IDs) + UI shows retailPrice on other-store cards
const OTHER_STORE_CACHE_KEY = 'tm_phone_other_store_cache_v3';
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
    'Sort by Count': '\u03A4\u03B1\u03BE\u03B9\u03BD\u03CC\u03BC\u03B7\u03C3\u03B7 \u03BA\u03B1\u03C4\u03AC \u03A0\u03BB\u03AE\u03B8\u03BF\u03C2',
    'Sort by Price': '\u03A4\u03B1\u03BE\u03B9\u03BD\u03CC\u03BC\u03B7\u03C3\u03B7 \u03BA\u03B1\u03C4\u03AC \u03A4\u03B9\u03BC\u03AE',
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

function decodeHtmlEntities(text) {
    if (!text) return '';
    const el = document.createElement('textarea');
    el.innerHTML = text;
    return el.value;
}

function parseStorehouseSnippets(rawSnippet, stores) {
    if (!rawSnippet) return;
    const decoded = decodeHtmlEntities(rawSnippet);
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${decoded}</div>`, 'text/html');

    doc.querySelectorAll('tr').forEach((r) => {
        const cols = r.querySelectorAll('td,th');
        if (cols.length >= 2) {
            const name = (cols[0].textContent || '').trim();
            const qty = (cols[1].textContent || '').trim();
            if (name) stores.push({ name, qty });
        }
    });

    if (stores.length) return;

    decoded.split('\n').map((l) => l.trim()).filter(Boolean).forEach((line) => {
        const match = line.match(/(.+?)\s+(\d+)\s*$/);
        if (match) stores.push({ name: match[1].trim(), qty: match[2].trim() });
    });
}

function parseOtherStorehousesFromRow(row) {
    if (!row) return [];
    const seen = new Map();

    function addList(list) {
        (list || []).forEach((store) => {
            const name = String(store.name || '').trim();
            if (!name) return;
            seen.set(name, { name, qty: String(store.qty != null ? store.qty : '1') });
        });
    }

    addList(parseOtherStorehouses(row.querySelector('[id*="iUnitsRemainingOtherStoreHouses"]')));

    if (!seen.size) {
        row.querySelectorAll('a, span, div, td, button').forEach((el) => {
            addList(parseOtherStorehouses(el));
        });
    }

    if (!seen.size && row.innerHTML) {
        const snippets = new Set();
        row.querySelectorAll('[data-content],[data-bs-content],[data-original-title],[title]').forEach((el) => {
            ['data-content', 'data-bs-content', 'data-original-title', 'title'].forEach((attr) => {
                const val = el.getAttribute(attr);
                if (val) snippets.add(val);
            });
        });
        const stores = [];
        snippets.forEach((snippet) => parseStorehouseSnippets(snippet, stores));
        addList(stores);
    }

    return [...seen.values()];
}

function parseOtherStorehouses(cell) {
    if (!cell) return [];
    const stores = [];
    const candidateAttrs = [
        'data-content',
        'data-storehouses',
        'data-stores',
        'data-html',
        'data-jc',
        'data-original-title',
        'data-bs-content',
        'data-bs-original-title',
        'title',
    ];
    const snippets = new Set();

    const collect = (el) => {
        if (!el || !el.getAttribute) return;
        candidateAttrs.forEach((attr) => {
            const val = el.getAttribute(attr);
            if (val) snippets.add(val);
        });
    };

    collect(cell);
    cell.querySelectorAll('*').forEach(collect);

    if (snippets.size === 0) {
        if (cell.innerHTML) snippets.add(cell.innerHTML);
        else if (cell.textContent) snippets.add(cell.textContent);
    }

    for (const rawSnippet of snippets) {
        parseStorehouseSnippets(rawSnippet, stores);
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
function normalizeStorehouseResponse(response) {
    if (!response || !response.length) return [];
    return response
        .map((r) => ({
            name: String(r.storehouse || r.name || r.store || '').trim(),
            qty: String(r.units != null ? r.units : (r.qty != null ? r.qty : '1')),
        }))
        .filter((s) => s.name);
}

function fetchStorehousesViaUnsafeWindow(productCode) {
    return new Promise((resolve) => {
        const fn = (typeof unsafeWindow !== 'undefined' ? unsafeWindow.getCheckOtherInventories : null)
            || (typeof window !== 'undefined' ? window.getCheckOtherInventories : null);
        if (typeof fn !== 'function') {
            resolve([]);
            return;
        }
        let settled = false;
        const timer = setTimeout(() => {
            if (!settled) {
                settled = true;
                resolve([]);
            }
        }, 10000);
        try {
            fn(productCode, false, {
                content_type: 'json',
                onFinish: (response) => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    resolve(normalizeStorehouseResponse(response));
                },
            });
        } catch (e) {
            clearTimeout(timer);
            resolve([]);
        }
    });
}

function fetchStorehousesViaPageScript(productCode) {
    return new Promise((resolve) => {
        const requestId = `tmStores${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
        const timeout = setTimeout(() => {
            window.removeEventListener('message', onMessage);
            resolve([]);
        }, 12000);

        function onMessage(event) {
            if (event.source !== window || !event.data || event.data.type !== 'tm-mms-storehouses') return;
            if (event.data.id !== requestId) return;
            clearTimeout(timeout);
            window.removeEventListener('message', onMessage);
            resolve(event.data.stores || []);
        }
        window.addEventListener('message', onMessage);

        const script = document.createElement('script');
        const safeCode = JSON.stringify(String(productCode));
        script.textContent = `(function(){
            var id=${JSON.stringify(requestId)};
            var productCode=${safeCode};
            function finish(stores){window.postMessage({type:'tm-mms-storehouses',id:id,stores:stores},'*');}
            try{
                var fn=window.getCheckOtherInventories;
                if(typeof fn!=='function'){finish([]);return;}
                fn(productCode,false,{content_type:'json',onFinish:function(r){
                    finish((r||[]).map(function(x){return{name:String(x.storehouse||x.name||'').trim(),qty:String(x.units!=null?x.units:(x.qty!=null?x.qty:'1'))}}).filter(function(x){return x.name;}));
                }});
            }catch(e){finish([]);}
        })();`;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    });
}

function parseStorehousesFromProductHtml(html, barcode) {
    try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        let best = [];
        doc.querySelectorAll('tr').forEach((row) => {
            const rowBarcodeEl = row.querySelector('[id*="strProductID"]');
            const rowBarcode = (rowBarcodeEl?.textContent || '').trim();
            if (barcode && rowBarcode && rowBarcode !== barcode) return;

            const otherStoreEl = row.querySelector('[id*="iUnitsRemainingOtherStoreHouses"]');
            if (!otherStoreEl) return;
            const otherCount = parseInt((otherStoreEl.textContent || '').trim(), 10) || 0;
            if (otherCount <= 0) return;

            let stores = parseOtherStorehouses(otherStoreEl);
            if (!stores.length) stores = parseOtherStorehousesFromRow(row);
            if (stores.length > best.length) best = stores;
        });
        return best;
    } catch (e) {
        return [];
    }
}

function fetchStorehousesViaHttp(productCode) {
    return new Promise((resolve) => {
        const code = String(productCode || '').trim();
        if (!code) {
            resolve([]);
            return;
        }
        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://thefixers.mymanager.gr/mymanagerservice/products_list.php?qs=${encodeURIComponent(code)}`,
            onload(response) {
                resolve(parseStorehousesFromProductHtml(response.responseText || '', code));
            },
            onerror() {
                resolve([]);
            },
        });
    });
}

async function fetchStorehousesFromPage(productCode) {
    const code = String(productCode || '').trim();
    if (!code) return [];

    const cached = getCachedPhoneStoreDetails(code);
    if (cached?.length) return cached;

    const methods = [
        () => fetchStorehousesViaUnsafeWindow(code),
        () => fetchStorehousesViaPageScript(code),
        () => fetchStorehousesViaHttp(code),
    ];

    for (const method of methods) {
        const stores = await method();
        if (stores.length) {
            savePhoneStoreDetailsCache(code, stores);
            return stores;
        }
    }

    return [];
}

const PHONE_STORE_DETAILS_CACHE_KEY = 'tm_phone_store_details_cache_v2';
const PHONE_STORE_DETAILS_CACHE_DAYS = 14;

function loadPhoneStoreDetailsCache() {
    try {
        return JSON.parse(GM_getValue(PHONE_STORE_DETAILS_CACHE_KEY, '{}')) || {};
    } catch (e) {
        return {};
    }
}

function savePhoneStoreDetailsCache(barcode, stores) {
    if (!barcode || !stores?.length) return;
    const cache = loadPhoneStoreDetailsCache();
    cache[barcode] = { stores: stores || [], ts: Date.now() };
    GM_setValue(PHONE_STORE_DETAILS_CACHE_KEY, JSON.stringify(cache));
}

function getCachedPhoneStoreDetails(barcode) {
    const entry = loadPhoneStoreDetailsCache()[barcode];
    if (!entry || !entry.stores?.length) return null;
    const ageDays = (Date.now() - (entry.ts || 0)) / (1000 * 60 * 60 * 24);
    if (ageDays > PHONE_STORE_DETAILS_CACHE_DAYS) return null;
    return entry.stores;
}

function getLoosePhoneStores(phone) {
    const raw = [...(phone?.stores || []), ...(phone?.otherStores || [])];
    const seen = new Map();
    raw.forEach((store) => {
        const name = String(store?.name || '').trim();
        if (!name) return;
        const qty = parseInt(store.qty, 10) || 0;
        if (qty <= 0) return;
        seen.set(name, { name, qty: String(store.qty) });
    });
    return [...seen.values()];
}

function getEffectivePhoneStores(phone) {
    const strict = filterOneUnitStores(phone?.stores || []);
    if (strict.length) return strict;
    const strictOther = filterOneUnitStores(phone?.otherStores || []);
    if (strictOther.length) return strictOther;
    return filterOneUnitStores(getLoosePhoneStores(phone));
}

function phoneNeedsStoreResolve(phone) {
    if (getEffectivePhoneStores(phone).length) return false;
    const count = parseInt(phone?.otherStoreCount, 10) || 0;
    return count > 0;
}

function mergeOtherStoresFromAllPhones(allPhones, networkPhones) {
    const byBarcode = new Map((allPhones || []).map((p) => [p.barcode, p]));
    (networkPhones || []).forEach((phone) => {
        if (getEffectivePhoneStores(phone).length) return;
        const local = byBarcode.get(phone.barcode);
        if (local?.otherStores?.length) {
            phone.otherStores = local.otherStores;
        }
    });
}

async function resolvePhonesStoreDetails(phones, options = {}) {
    const { concurrency = 6, onProgress, filter } = options;
    const list = (phones || []).filter((p) => (!filter || filter(p)) && phoneNeedsStoreResolve(p));
    const unique = [...new Map(list.map((p) => [p.barcode, p])).values()];
    let done = 0;

    for (let i = 0; i < unique.length; i += concurrency) {
        const batch = unique.slice(i, i + concurrency);
        await Promise.all(batch.map(async (phone) => {
            if (getEffectivePhoneStores(phone).length) {
                done += 1;
                onProgress?.(done, unique.length);
                return;
            }
            try {
                const stores = await fetchStorehousesFromPage(phone.barcode);
                if (stores.length) {
                    phone.stores = stores;
                    phone.otherStores = stores;
                }
            } catch (e) {
                console.warn('[MMS Phone List] Could not resolve stores for', phone.barcode, e);
            }
            done += 1;
            onProgress?.(done, unique.length);
        }));
    }

    if (options.persistOtherStoreCache) {
        saveOtherStoreCache(phones);
    }
    return phones;
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
                            if (!otherStores.length) otherStores = parseOtherStorehousesFromRow(row);
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
                            let stores = parseOtherStorehouses(otherStoreEl);
                            if (!stores.length) stores = parseOtherStorehousesFromRow(row);
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
    return [...map.entries()];
}

function sortModelGroups(entries, sortKey, ascending) {
    return [...entries].sort((a, b) => {
        const [modelA, dataA] = a;
        const [modelB, dataB] = b;
        let cmp = 0;

        switch (sortKey) {
            case 'count':
                cmp = dataA.count - dataB.count;
                if (cmp === 0) {
                    cmp = modelA.localeCompare(modelB, undefined, { numeric: true, sensitivity: 'base' });
                }
                break;
            case 'grade': {
                const bestA = Object.keys(dataA.grades || {}).sort(comparePhoneGrades)[0] || '';
                const bestB = Object.keys(dataB.grades || {}).sort(comparePhoneGrades)[0] || '';
                cmp = comparePhoneGrades(bestA, bestB);
                if (cmp === 0) {
                    cmp = modelA.localeCompare(modelB, undefined, { numeric: true, sensitivity: 'base' });
                }
                break;
            }
            case 'model':
            default:
                cmp = modelA.localeCompare(modelB, undefined, { numeric: true, sensitivity: 'base' });
        }

        return ascending ? cmp : -cmp;
    });
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

const extractBaseModelCacheGlobal = new Map();

function extractBaseModel(model) {
    if (!model) return '';
    if (extractBaseModelCacheGlobal.has(model)) return extractBaseModelCacheGlobal.get(model);
    let base = model
        .replace(/ΜΕΤΑΧΕΙΡΙΣΜΕΝΟ\s+ΚΙΝΗΤΟ\s+ΤΗΛΕΦΩΝΟ\s*/gi, '')
        .replace(/\s*(BB|ΒΒ):\s*\([^)]*\)?\s*/gi, ' ')
        .replace(/\s*\(BB[^)]*\)?\s*/gi, ' ')
        .replace(/\s+(BB|ΒΒ):\s*$/gi, ' ')
        .replace(/\s*[–\-]?\s*[\u0045\u0395][\s\-]?SIM(\s+ONLY)?\s*/gi, ' ')
        .replace(/\s*\d+\s*TB\s*/gi, ' ')
        .replace(/\s*\d+\s*GB\s*/gi, ' ')
        .replace(/\s*\d+\s*G(?!\w)/gi, ' ');
    const color = extractColor(model);
    if (color) {
        base = base.replace(new RegExp(color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ' ');
    }
    const gb = extractGB(model);
    if (gb) {
        base = base.replace(new RegExp(gb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ' ');
    }
    base = base.replace(/\s+/g, ' ').trim();
    extractBaseModelCacheGlobal.set(model, base);
    return base;
}

/**
 * Opens the store locator (model → store availability).
 */
async function showPhoneListModal() {
    if (document.querySelector('.tm-modal-overlay, .tm-sl-overlay')) return;
    if (typeof window.showStoreLocatorModal === 'function') {
        return window.showStoreLocatorModal();
    }
    console.error('[MMS Phone List] Store locator module not loaded');
}

window.showPhoneListModal = showPhoneListModal;
window.showPhoneListModalLegacy = null;
window.fetchPhoneList = fetchPhoneList;
window.fetchOtherStorePhones = fetchOtherStorePhones;
window.loadPhoneListCache = loadPhoneListCache;
window.syncPhoneColorCatalog = syncPhoneColorCatalog;
window.extractBaseModel = extractBaseModel;
window.extractGB = extractGB;
window.extractColor = extractColor;
window.filterIphoneTitlePhones = filterIphoneTitlePhones;
window.filterOneUnitStores = filterOneUnitStores;
window.normalizePhoneGrade = normalizePhoneGrade;
window.comparePhoneGrades = comparePhoneGrades;
window.getPhoneGradeCircleStyle = getPhoneGradeCircleStyle;
window.getAllColorHexMap = getAllColorHexMap;
window.fetchStorehousesFromPage = fetchStorehousesFromPage;
window.getEffectivePhoneStores = getEffectivePhoneStores;
window.resolvePhonesStoreDetails = resolvePhonesStoreDetails;
window.mergeOtherStoresFromAllPhones = mergeOtherStoresFromAllPhones;
window.PHONE_LIST_CACHE_TIMESTAMP_KEY = PHONE_LIST_CACHE_TIMESTAMP_KEY;

