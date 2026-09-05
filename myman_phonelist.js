// ===================================================================
// === PHONE LIST FEATURE: SEARCHABLE PHONE CATALOG
// ===================================================================

// Cache constants
const PHONE_LIST_CACHE_KEY = 'tm_phone_list_cache';
const PHONE_LIST_CACHE_TIMESTAMP_KEY = 'tm_phone_list_cache_timestamp';
/** Who last refreshed the scraped catalog + when ({ at, by }). */
const PHONE_LIST_REFRESH_META_KEY = 'tm_phone_list_refresh_meta_v1';
/** Hard-expire local list cache after this many days (discard + force fetch). */
const CACHE_EXPIRATION_DAYS = 3;
/** Soft-stale: quiet background refresh when older than this (ms). */
const PHONE_LIST_SOFT_REFRESH_MS = 4 * 60 * 60 * 1000; // 4 hours
// v2: price parsing (div/input IDs) + UI shows retailPrice on other-store cards
const OTHER_STORE_CACHE_KEY = 'tm_phone_other_store_cache_v3';
const OTHER_STORE_CACHE_TIMESTAMP_KEY = 'tm_phone_other_store_cache_timestamp';
const OTHER_STORE_CACHE_EXPIRATION_DAYS = 3;
const PRODUCT_LIST_BASE = 'https://thefixers.mymanager.gr/mymanagerservice/products_list.php';
const PRODUCT_LIST_SCRAPE_TIMEOUT_MS = 90000;

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
    'Also for labels': '\u0398\u03B5\u03C9\u03C1\u03B5\u03AF\u03C4\u03B1\u03B9 \u03B5\u03C0\u03AF\u03C3\u03B7\u03C2',
    'Aliases hint': '\u03C0.\u03C7. ORANGE (\u03AF\u03B4\u03B9\u03BF \u03C6\u03AF\u03BB\u03C4\u03C1\u03BF \u03BC\u03B5 COSMIC ORANGE)',
    'Aliases help': '\u0386\u03BB\u03BB\u03B1 \u03BF\u03BD\u03CC\u03BC\u03B1\u03C4\u03B1 \u03C0\u03BF\u03C5 \u03B8\u03B5\u03C9\u03C1\u03BF\u03CD\u03BD\u03C4\u03B1\u03B9 \u03C4\u03BF \u03AF\u03B4\u03B9\u03BF \u03C7\u03C1\u03CE\u03BC\u03B1 \u03C3\u03C4\u03B1 \u03C6\u03AF\u03BB\u03C4\u03C1\u03B1 \u03BA\u03B1\u03B9 \u03C4\u03B7\u03BD \u03B5\u03BC\u03C6\u03AC\u03BD\u03B9\u03C3\u03B7.',
    'Manage Stores': '\u0394\u03B9\u03B1\u03C7\u03B5\u03AF\u03C1\u03B9\u03C3\u03B7 \u039A\u03B1\u03C4\u03B1\u03C3\u03C4\u03B7\u03BC\u03AC\u03C4\u03C9\u03BD',
    'Buyback store patterns': '\u03A0\u03C1\u03CC\u03C4\u03C5\u03C0\u03B1 \u03BF\u03BD\u03CC\u03BC\u03B1\u03C4\u03BF\u03C2 \u03B3\u03B9\u03B1 BB',
    'Buyback patterns hint': '\u03C0.\u03C7. IKE, \u0399\u039A\u0395 (\u03B1\u03BD \u03C4\u03BF \u03CC\u03BD\u03BF\u03BC\u03B1 \u03C0\u03B5\u03C1\u03B9\u03AD\u03C7\u03B5\u03B9 \u03B1\u03C5\u03C4\u03CC)',
    'Regular store patterns': '\u03A0\u03C1\u03CC\u03C4\u03C5\u03C0\u03B1 \u03BF\u03BD\u03CC\u03BC\u03B1\u03C4\u03BF\u03C2 \u03B3\u03B9\u03B1 \u03BA\u03B1\u03BD\u03BF\u03BD\u03B9\u03BA\u03AC',
    'Regular patterns hint': '\u039A\u03B5\u03BD\u03CC = \u03CC\u03BB\u03B1 \u03C4\u03B1 \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03AE\u03BC\u03B1\u03C4\u03B1',
    'Known stores': '\u0393\u03BD\u03C9\u03C3\u03C4\u03AC \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03AE\u03BC\u03B1\u03C4\u03B1',
    'My store location': '\u03A4\u03BF \u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B7\u03BC\u03AC \u03BC\u03BF\u03C5',
    'My store location hint': '\u0395\u03C0\u03B9\u03BB\u03AD\u03BE\u03C4\u03B5 \u03C4\u03BF \u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B7\u03BC\u03AC \u03C3\u03B1\u03C2 \u03BA\u03B1\u03B9 \u03C3\u03C5\u03BC\u03C0\u03BB\u03B7\u03C1\u03CE\u03C3\u03C4\u03B5 \u03C4\u03B9\u03C2 \u03B4\u03B9\u03B5\u03C5\u03B8\u03CD\u03BD\u03C3\u03B5\u03B9\u03C2 \u03C0\u03B1\u03C1\u03B1\u03BA\u03AC\u03C4\u03C9 \u03B3\u03B9\u03B1 \u03B1\u03BA\u03C1\u03B9\u03B2\u03AD\u03C3\u03C4\u03B5\u03C1\u03B7 \u03C4\u03B1\u03BE\u03B9\u03BD\u03CC\u03BC\u03B7\u03C3\u03B7 \u03B1\u03C0\u03CC\u03C3\u03C4\u03B1\u03C3\u03B7\u03C2.',
    'Auto-detect store': '\u0391\u03C5\u03C4\u03CC\u03BC\u03B1\u03C4\u03B7 \u03B1\u03BD\u03AF\u03C7\u03BD\u03B5\u03C5\u03C3\u03B7',
    'Auto-detected store': '\u0391\u03BD\u03B9\u03C7\u03BD\u03B5\u03CD\u03B8\u03B7\u03BA\u03B5 \u03B1\u03C5\u03C4\u03CC\u03BC\u03B1\u03C4\u03B1',
    'No store detected': '\u0394\u03B5\u03BD \u03B1\u03BD\u03B9\u03C7\u03BD\u03B5\u03CD\u03B8\u03B7\u03BA\u03B5 \u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B7\u03BC\u03B1',
    'My store saved': '\u0391\u03C0\u03BF\u03B8\u03B7\u03BA\u03B5\u03C8\u03B5 \u03C4\u03BF \u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B7\u03BC\u03AC \u03C3\u03B1\u03C2',
    'Select store': '\u0395\u03C0\u03B9\u03BB\u03AD\u03BE\u03C4\u03B5 \u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B7\u03BC\u03B1',
    'Store addresses': '\u0394\u03B9\u03B5\u03C5\u03B8\u03CD\u03BD\u03C3\u03B5\u03B9\u03C2 \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03B7\u03BC\u03AC\u03C4\u03C9\u03BD',
    'Store addresses hint': '\u0392\u03AC\u03BB\u03C4\u03B5 \u03C4\u03B7 \u03C4\u03B1\u03C7\u03C5\u03B4\u03C1\u03BF\u03BC\u03B7\u03C3\u03AF\u03B1 \u03BA\u03B1\u03B9 \u03C4\u03BF \u03C4\u03B7\u03BB\u03AD\u03C6\u03C9\u03BD\u03BF \u03BA\u03AC\u03B8\u03B5 \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03AE\u03BC\u03B1\u03C4\u03BF\u03C2. \u0397 \u03B4\u03B9\u03B5\u03CD\u03B8\u03C5\u03BD\u03C3\u03B7 \u03C7\u03C1\u03B7\u03C3\u03B9\u03BC\u03B5\u03CD\u03B5\u03B9 \u03B3\u03B9\u03B1 \u03C4\u03B1\u03BE\u03B9\u03BD\u03CC\u03BC\u03B7\u03C3\u03B7 \u03B1\u03C0\u03CC\u03C3\u03C4\u03B1\u03C3\u03B7\u03C2\u00B7 \u03C4\u03BF \u03C4\u03B7\u03BB\u03AD\u03C6\u03C9\u03BD\u03BF \u03B5\u03BC\u03C6\u03B1\u03BD\u03AF\u03B6\u03B5\u03B9 \u03BA\u03BF\u03C5\u03BC\u03C0\u03AF \u03BA\u03BB\u03AE\u03C3\u03B7\u03C2 \u03C3\u03C4\u03BF\u03BD \u03BA\u03B1\u03C4\u03AC\u03BB\u03BF\u03B3\u03BF.',
    'Store address placeholder': '\u03A0.\u03C7. \u039A\u03B1\u03C3\u03C3\u03B1\u03BD\u03B4\u03C1\u03BF\u03CD 45, \u0392\u03C1\u03B9\u03BB\u03AE\u03C3\u03C3\u03B9\u03B1',
    'Store phone': '\u03A4\u03B7\u03BB\u03AD\u03C6\u03C9\u03BD\u03BF \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03AE\u03BC\u03B1\u03C4\u03BF\u03C2',
    'Store phone placeholder': '\u03C0.\u03C7. 2101234567',
    'Call store': '\u039A\u03BB\u03AE\u03C3\u03B7 \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03AE\u03BC\u03B1\u03C4\u03BF\u03C2',
    'No store phone set': '\u0394\u03B5\u03BD \u03AD\u03C7\u03B5\u03B9 \u03BF\u03C1\u03B9\u03C3\u03C4\u03B5\u03AF \u03C4\u03B7\u03BB\u03AD\u03C6\u03C9\u03BD\u03BF',
    'Geocode addresses': '\u0395\u03C5\u03B8\u03B5\u03C4\u03B7\u03C3\u03AF\u03B1 \u03C3\u03C5\u03BD\u03C4\u03B5\u03C4\u03B1\u03B3\u03BC\u03AD\u03BD\u03C9\u03BD',
    'Geocoding stores': '\u0395\u03C5\u03B8\u03B5\u03C4\u03B7\u03C3\u03AF\u03B1 \u03C4\u03C9\u03BD \u03B4\u03B9\u03B5\u03C5\u03B8\u03CD\u03BD\u03C3\u03B5\u03C9\u03BD\u2026',
    'Geocode done': '\u039F\u03B9 \u03B4\u03B9\u03B5\u03C5\u03B8\u03CD\u03BD\u03C3\u03B5\u03B9\u03C2 \u03B5\u03BD\u03B7\u03BC\u03B5\u03C1\u03CE\u03B8\u03B7\u03BA\u03B1\u03BD',
    'Geocode failed': '\u0394\u03B5\u03BD \u03B2\u03C1\u03AD\u03B8\u03B7\u03BA\u03B1\u03BD \u03CC\u03BB\u03B5\u03C2 \u03BF\u03B9 \u03B4\u03B9\u03B5\u03C5\u03B8\u03CD\u03BD\u03C3\u03B5\u03B9\u03C2',
    'Address geocoded': '\u0395\u03C5\u03C1\u03AD\u03B8\u03B7\u03BA\u03B5 \u03C3\u03C4\u03B7 \u03C7\u03AC\u03C1\u03C4\u03B7',
    'Address not found': '\u0394\u03B5\u03BD \u03B2\u03C1\u03AD\u03B8\u03B7\u03BA\u03B5 \u03C3\u03C4\u03B7 \u03C7\u03AC\u03C1\u03C4\u03B7',
    'No address set': '\u0394\u03B5\u03BD \u03AD\u03C7\u03B5\u03B9 \u03BF\u03C1\u03B9\u03C3\u03C3\u03C4\u03B5\u03AF',
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
    'e.g. Reserved': '\u03C0.\u03C7. Reserved',
    'Manage Models': '\u0394\u03B9\u03B1\u03C7\u03B5\u03AF\u03C1\u03B9\u03C3\u03B7 \u039C\u03BF\u03BD\u03C4\u03AD\u03BB\u03C9\u03BD',
    'Canonical Models': '\u039A\u03B1\u03BD\u03BF\u03BD\u03B9\u03BA\u03AC \u039C\u03BF\u03BD\u03C4\u03AD\u03BB\u03B1',
    'Models list hint': '\u0397 \u03C3\u03B5\u03B9\u03C1\u03AC \u03C4\u03B1\u03BE\u03B9\u03BD\u03BF\u03BC\u03AE\u03C3\u03B7\u03C2 \u03B5\u03AF\u03BD\u03B1\u03B9 \u03C3\u03B7\u03BC\u03B1\u03BD\u03C4\u03B9\u03BA\u03AE \u2014 \u03C4\u03B1 \u03C0\u03B9\u03BF \u03B1\u03BD\u03B1\u03BB\u03C5\u03C4\u03B9\u03BA\u03AC \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03B1 \u03C0\u03B1\u03BD\u03C9 \u03C0\u03C1\u03CE\u03C4\u03B1 (\u03C0.\u03C7. iPhone 13 Pro Max \u03C0\u03C1\u03B9\u03BD \u03C4\u03BF iPhone 13 Pro).',
    'Add Model': '\u03A0\u03C1\u03BF\u03C3\u03B8\u03AE\u03BA\u03B7 \u039C\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF\u03C5',
    'Model Name': '\u038C\u03BD\u03BF\u03BC\u03B1 \u039C\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF\u03C5',
    'No models in list': '\u0394\u03B5\u03BD \u03C5\u03C0\u03AC\u03C1\u03C7\u03BF\u03C5\u03BD \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03B1 \u03C3\u03C4\u03B7 \u03BB\u03AF\u03C3\u03C4\u03B1',
    'Model added': '\u03A4\u03BF \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF \u03C0\u03C1\u03BF\u03C3\u03C4\u03AD\u03B8\u03B7\u03BA\u03B5',
    'Model removed': '\u03A4\u03BF \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF \u03B1\u03C6\u03B1\u03B9\u03C1\u03AD\u03B8\u03B7\u03BA\u03B5',
    'Model updated': '\u03A4\u03BF \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF \u03B5\u03BD\u03B7\u03BC\u03B5\u03C1\u03CE\u03B8\u03B7\u03BA\u03B5',
    'Model already exists': '\u0397 \u03B5\u03B3\u03B3\u03C1\u03B1\u03C6\u03AE \u03C5\u03C0\u03AC\u03C1\u03C7\u03B5\u03B9 \u03AE\u03B4\u03B7 \u03C3\u03C4\u03B7 \u03BB\u03AF\u03C3\u03C4\u03B1',
    'Invalid model name': '\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03BF \u03CC\u03BD\u03BF\u03BC\u03B1 \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF\u03C5',
    'Reset models list': '\u0395\u03C0\u03B1\u03BD\u03B1\u03C6\u03BF\u03C1\u03AC \u03C0\u03C1\u03BF\u03B5\u03C0\u03B9\u03BB\u03BF\u03B3\u03AE\u03C2 \u03BB\u03AF\u03C3\u03C4\u03B1\u03C2',
    'Models list saved': '\u0397 \u03BB\u03AF\u03C3\u03C4\u03B1 \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03C9\u03BD \u03B1\u03C0\u03BF\u03B8\u03B7\u03BA\u03B5\u03C5\u03C3\u03B5',
    'Suggested models': '\u03A0\u03C1\u03BF\u03C4\u03B5\u03B9\u03BD\u03CC\u03BC\u03B5\u03BD\u03B1 \u03B1\u03C0\u03CC \u03BA\u03B1\u03C4\u03AC\u03BB\u03BF\u03B3\u03BF',
    'No suggestions': '\u0394\u03B5\u03BD \u03B2\u03C1\u03AD\u03B8\u03B7\u03BA\u03B1\u03BD \u03B1\u03B3\u03BD\u03CE\u03C1\u03B9\u03C3\u03C4\u03B1 \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03B1',
    'e.g. iPhone 13 Pro Max': '\u03C0.\u03C7. iPhone 13 Pro Max'
};

const PHONE_COLORS_STORAGE_KEY = 'tm_phone_colors_v2';
const PHONE_COLOR_ALIASES_KEY = 'tm_phone_color_display_aliases';
const PHONE_COLORS_REMOVED_KEY = 'tm_phone_colors_removed_v1';
const LEGACY_CUSTOM_COLORS_STORAGE_KEY = 'tm_phone_custom_colors';

function loadRemovedPhoneColors() {
    try {
        const stored = GM_getValue(PHONE_COLORS_REMOVED_KEY, '[]');
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return new Set();
        return new Set(parsed.map((name) => normalizePhoneColorName(name)).filter(Boolean));
    } catch (e) {
        return new Set();
    }
}

function saveRemovedPhoneColors(removed) {
    const list = [...(removed || [])]
        .map((name) => normalizePhoneColorName(name))
        .filter(Boolean)
        .sort();
    GM_setValue(PHONE_COLORS_REMOVED_KEY, JSON.stringify(list));
    if (typeof pcNotifyConfigChanged === 'function') pcNotifyConfigChanged('colors_removed');
}

function isPhoneColorRemoved(name) {
    const key = normalizePhoneColorName(name);
    if (!key) return false;
    return loadRemovedPhoneColors().has(key);
}

function markPhoneColorRemoved(name) {
    const key = normalizePhoneColorName(name);
    if (!key) return;
    const removed = loadRemovedPhoneColors();
    if (removed.has(key)) return;
    removed.add(key);
    saveRemovedPhoneColors(removed);
}

function unmarkPhoneColorRemoved(name) {
    const key = normalizePhoneColorName(name);
    if (!key) return;
    const removed = loadRemovedPhoneColors();
    if (!removed.delete(key)) return;
    saveRemovedPhoneColors(removed);
}
const PHONE_STORE_RULES_KEY = 'tm_phone_store_rules_v1';
const PHONE_TAG_DEFINITIONS_KEY = 'tm_phone_tag_definitions';
const PHONE_CANONICAL_MODELS_KEY = 'tm_phone_canonical_models_v1';

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
    if (typeof pcNotifyConfigChanged === 'function') pcNotifyConfigChanged('tag_definitions');
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

const PHONE_TAGS_STORAGE_KEY = 'tm_phone_tags';

function loadPhoneTags() {
    try {
        const stored = GM_getValue(PHONE_TAGS_STORAGE_KEY, '{}');
        const parsed = JSON.parse(stored);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
        return {};
    }
}

function savePhoneTags(tags) {
    GM_setValue(PHONE_TAGS_STORAGE_KEY, JSON.stringify(tags));
    if (typeof pcNotifyTagsChanged === 'function') pcNotifyTagsChanged(tags);
}

function getPhoneTags(barcode) {
    if (!barcode) return [];
    const allTags = loadPhoneTags();
    const list = allTags[barcode];
    return Array.isArray(list) ? list.map(normalizeTagKey).filter(Boolean) : [];
}

function addPhoneTag(barcode, tag) {
    const code = String(barcode || '').trim();
    const tagKey = normalizeTagKey(tag);
    if (!code || !tagKey) return false;
    const allTags = loadPhoneTags();
    if (!allTags[code]) allTags[code] = [];
    if (allTags[code].includes(tagKey)) return false;
    allTags[code].push(tagKey);
    savePhoneTags(allTags);
    // Ensure a definition exists so chips have a color/name.
    const defs = loadTagDefinitions();
    if (!defs[tagKey]) {
        defs[tagKey] = { name: formatTagNameFromKey(tagKey), color: '#9e9e9e' };
        saveTagDefinitions(defs);
    }
    return true;
}

function removePhoneTag(barcode, tag) {
    const code = String(barcode || '').trim();
    const tagKey = normalizeTagKey(tag);
    if (!code || !tagKey) return false;
    const allTags = loadPhoneTags();
    if (!allTags[code]) return false;
    const next = allTags[code].filter((t) => t !== tagKey);
    if (next.length === allTags[code].length) return false;
    if (next.length) allTags[code] = next;
    else delete allTags[code];
    savePhoneTags(allTags);
    return true;
}

function togglePhoneTag(barcode, tag) {
    const tagKey = normalizeTagKey(tag);
    if (!tagKey) return { ok: false, active: false };
    const has = getPhoneTags(barcode).includes(tagKey);
    if (has) {
        removePhoneTag(barcode, tagKey);
        return { ok: true, active: false, key: tagKey };
    }
    addPhoneTag(barcode, tagKey);
    return { ok: true, active: true, key: tagKey };
}

function getAllUsedTags() {
    const used = new Set();
    Object.values(loadPhoneTags()).forEach((tags) => {
        if (!Array.isArray(tags)) return;
        tags.forEach((tag) => {
            const key = normalizeTagKey(tag);
            if (key) used.add(key);
        });
    });
    return [...used].sort((a, b) =>
        getTagDisplayName(a).localeCompare(getTagDisplayName(b), undefined, { sensitivity: 'base' })
    );
}

function getSelectableTagKeys() {
    const keys = new Set(getDefinedTagKeys());
    getAllUsedTags().forEach((k) => keys.add(k));
    return [...keys].sort((a, b) =>
        getTagDisplayName(a).localeCompare(getTagDisplayName(b), undefined, { sensitivity: 'base' })
    );
}

function renamePhoneTagKeyOnAllPhones(oldKey, newKey) {
    const oldK = normalizeTagKey(oldKey);
    const newK = normalizeTagKey(newKey);
    if (!oldK || !newK || oldK === newK) return;
    const allTags = loadPhoneTags();
    let changed = false;
    Object.keys(allTags).forEach((barcode) => {
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
    Object.keys(allTags).forEach((barcode) => {
        const before = allTags[barcode].length;
        allTags[barcode] = allTags[barcode].filter((t) => t !== key);
        if (allTags[barcode].length === 0) delete allTags[barcode];
        if (before !== (allTags[barcode]?.length || 0)) changed = true;
    });
    if (changed) savePhoneTags(allTags);
}

const PHONE_UNIT_NOTES_STORAGE_KEY = 'tm_phone_unit_notes';
const PHONE_UNIT_NOTE_MAX = 280;

function loadPhoneUnitNotes() {
    try {
        const stored = GM_getValue(PHONE_UNIT_NOTES_STORAGE_KEY, '{}');
        const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
        return {};
    }
}

function savePhoneUnitNotes(notes) {
    GM_setValue(PHONE_UNIT_NOTES_STORAGE_KEY, JSON.stringify(notes && typeof notes === 'object' ? notes : {}));
}

function normalizeUnitNoteText(text) {
    return String(text || '').replace(/\s+/g, ' ').trim().slice(0, PHONE_UNIT_NOTE_MAX);
}

function getPhoneUnitNote(barcode) {
    const code = String(barcode || '').trim();
    if (!code) return null;
    const rec = loadPhoneUnitNotes()[code];
    if (rec == null) return null;
    const text = normalizeUnitNoteText(typeof rec === 'string' ? rec : rec.text);
    if (!text) return null;
    return {
        text,
        by: String(rec?.by || '').trim().slice(0, 64),
        at: Number(rec?.at) || 0,
    };
}

function setPhoneUnitNote(barcode, text) {
    const code = String(barcode || '').trim();
    if (!code) return false;
    const all = loadPhoneUnitNotes();
    const nextText = normalizeUnitNoteText(text);
    if (!nextText) delete all[code];
    else {
        all[code] = {
            text: nextText,
            by: (typeof getPhoneCatalogActorName === 'function' ? getPhoneCatalogActorName() : pcDisplayName()),
            at: Date.now(),
        };
    }
    savePhoneUnitNotes(all);
    if (typeof pcNotifyNoteChanged === 'function') pcNotifyNoteChanged(code);
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
    if (typeof pcNotifyConfigChanged === 'function') pcNotifyConfigChanged('color_aliases');
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
        const removed = loadRemovedPhoneColors();
        const stored = GM_getValue(PHONE_COLORS_STORAGE_KEY, null);
        if (stored) {
            let parsed = normalizeStoredPhoneColors(JSON.parse(stored));
            if (parsed && Object.keys(parsed).length > 0) {
                const defaults = getDefaultPhoneColors();
                let needsSave = false;
                // Drop colors the user explicitly deleted (prevents defaults/sync resurrecting them).
                Object.keys(parsed).forEach((name) => {
                    if (removed.has(name)) {
                        delete parsed[name];
                        needsSave = true;
                    }
                });
                Object.entries(defaults).forEach(([name, entry]) => {
                    if (removed.has(name)) return;
                    if (!parsed[name]) {
                        parsed[name] = { ...normalizeColorEntry(entry, name) };
                        needsSave = true;
                    } else {
                        const normalized = normalizeColorEntry(parsed[name], name);
                        // Keep user-edited listHex/hex as stored — do not reset from defaults.
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
        let merged = {};
        Object.entries(defaults).forEach(([name, entry]) => {
            if (!removed.has(name)) merged[name] = { ...normalizeColorEntry(entry, name) };
        });

        const legacyCustom = GM_getValue(LEGACY_CUSTOM_COLORS_STORAGE_KEY, null);
        if (legacyCustom) {
            try {
                const custom = normalizeStoredPhoneColors(JSON.parse(legacyCustom));
                Object.entries(custom).forEach(([name, entry]) => {
                    if (removed.has(name)) return;
                    merged[name] = entry;
                });
            } catch (e) { /* ignore */ }
        }

        savePhoneColors(merged);
        return { ...merged };
    } catch (e) {
        const removed = loadRemovedPhoneColors();
        const fallback = {};
        Object.entries(getDefaultPhoneColors()).forEach(([name, entry]) => {
            if (!removed.has(name)) fallback[name] = { ...normalizeColorEntry(entry, name) };
        });
        return fallback;
    }
}

function savePhoneColors(colors) {
    GM_setValue(PHONE_COLORS_STORAGE_KEY, JSON.stringify(colors));
    if (typeof pcNotifyConfigChanged === 'function') pcNotifyConfigChanged('colors');
}

function normalizeTextForColorMatch(text) {
    let modelUpper = String(text || '').toUpperCase();
    modelUpper = modelUpper.replace(/DESSERT TITANIUM/g, 'DESERT TITANIUM');
    modelUpper = modelUpper.replace(/\bDESERT\b(?!\s+TITANIUM)/g, 'DESERT TITANIUM');
    modelUpper = modelUpper.replace(/SPACE GREY/g, 'SPACE GRAY');
    return modelUpper;
}

function getAllPhoneColorNamesForMatching() {
    const removed = loadRemovedPhoneColors();
    const defaults = getDefaultPhoneColors();
    let saved = {};
    try {
        const raw = GM_getValue(PHONE_COLORS_STORAGE_KEY, null);
        if (raw) saved = normalizeStoredPhoneColors(JSON.parse(raw));
    } catch (e) { /* ignore */ }
    let aliasKeys = [];
    try {
        aliasKeys = Object.keys(loadColorDisplayAliases() || {});
    } catch (e) { /* ignore */ }
    return [...new Set([...Object.keys(defaults), ...Object.keys(saved), ...aliasKeys])]
        .filter((name) => !removed.has(normalizePhoneColorName(name)));
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
    const removed = loadRemovedPhoneColors();
    const colors = loadPhoneColors();
    let changed = false;

    Object.entries(defaults).forEach(([name, entry]) => {
        if (removed.has(name) || colors[name]) return;
        colors[name] = { ...normalizeColorEntry(entry, name) };
        changed = true;
    });

    const aliases = loadColorDisplayAliases();
    Object.entries(aliases).forEach(([alias, target]) => {
        if (removed.has(alias) || colors[alias]) return;
        if (removed.has(normalizePhoneColorName(target))) return;
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
            const key = normalizePhoneColorName(name);
            if (!key || removed.has(key) || colors[key]) return;
            const def = defaults[key];
            const suggestion = suggestPhoneColorHex(key);
            const hex = def?.hex || suggestion?.hex || '#808080';
            const listHex = def?.listHex || suggestion?.hex || hex;
            colors[key] = normalizeColorEntry({ hex, listHex }, key);
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
    const wasRemoved = isPhoneColorRemoved(normalizedName);
    unmarkPhoneColorRemoved(normalizedName);
    const colors = loadPhoneColors();
    // Re-adding a previously deleted color should overwrite, not fail as "exists".
    if (colors[normalizedName] && !wasRemoved) return { ok: false, error: 'exists' };
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
    if (!normalizedName) return false;
    const colors = loadPhoneColors();
    const existed = !!colors[normalizedName];
    if (existed) {
        delete colors[normalizedName];
        savePhoneColors(colors);
    }
    // Persist deletion so defaults / title discovery cannot bring it back.
    markPhoneColorRemoved(normalizedName);
    const aliases = loadColorDisplayAliases();
    let aliasesChanged = false;
    Object.keys(aliases).forEach(alias => {
        if (alias === normalizedName || aliases[alias] === normalizedName) {
            delete aliases[alias];
            aliasesChanged = true;
        }
    });
    if (aliasesChanged) saveColorDisplayAliases(aliases);
    return true;
}

function renamePhoneColor(oldName, newName) {
    const oldKey = normalizePhoneColorName(oldName);
    const newKey = normalizePhoneColorName(newName);
    if (!oldKey || !newKey) return { ok: false, error: 'invalid' };
    if (oldKey === newKey) return { ok: true, name: oldKey };
    const colors = loadPhoneColors();
    if (!colors[oldKey]) return { ok: false, error: 'missing' };
    if (colors[newKey] && !isPhoneColorRemoved(newKey)) return { ok: false, error: 'exists' };

    colors[newKey] = { ...normalizeColorEntry(colors[oldKey], oldKey) };
    delete colors[oldKey];
    savePhoneColors(colors);

    // Old default name must stay removed or sync/load will recreate it.
    markPhoneColorRemoved(oldKey);
    unmarkPhoneColorRemoved(newKey);

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
    const raw = String(name || '').trim();
    if (!raw) return false;
    const upper = raw.toUpperCase();
    if (/(?:^|[\s(])(?:BB|ΒΒ)(?:[\-:)\s]|$)/.test(upper)) return true;
    if (/\(\s*(?:BB|ΒΒ)[\-:]/.test(upper)) return true;
    if (/\b(?:BB|ΒΒ)\s*\(/.test(upper)) return true;
    return false;
}

function resolvePhoneIsBuyback(phone) {
    if (!phone) return false;
    if (phone.isBuyback === true) return true;
    const sources = [
        phone.name,
        phone.rawName,
        phone.originalName,
        phone.title,
        phone.phone?.name,
        phone.phone?.rawName,
    ];
    return sources.some((s) => isBuybackTitle(s));
}

function hydratePhoneBuybackFlags(phones) {
    if (!Array.isArray(phones)) return phones;
    return phones.map((phone) => {
        const isBuyback = resolvePhoneIsBuyback(phone);
        if (isBuyback === !!phone.isBuyback) return phone;
        return { ...phone, isBuyback };
    });
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
    if (typeof pcNotifyConfigChanged === 'function') pcNotifyConfigChanged('store_rules');
}

function normalizeStoreDisplayName(name) {
    return String(name || '').replace(/\s*ΕΜΠΟΡΕΥΣΙΜΩΝ/gi, '').trim();
}

const MY_STORE_NAME_KEY = 'tm_phone_my_store_name_v1';
const MY_STORE_PICK_KEY = 'tm_phone_my_store_pick_v1';
const LOGIN_STORE_KEY = 'tm_login_store_v1';
/** Connected store from page footer button (primary). Global — not profile-scoped. */
const CONNECTED_STORE_KEY = 'tm_connected_store_v1';
const STORE_ADDRESSES_KEY = 'tm_phone_store_addresses_v1';

const DEFAULT_PROFILE_STORES = [
    'ΕΡΥΘΡΑΙΑ (ΕΕ)',
    'ΣΥΝΤΑΓΜΑ SERVICE (ΕΕ)',
    'ΣΥΝΤΑΓΜΑ (ΕΕ)',
    'ΧΟΛΑΡΓΟΣ (ΙΚΕ)',
    'ATHENS MALL (ΙΚΕ)',
    'ΚΕΝΤΡΙΚΗ ΑΠΟΘΗΚΗ (ΙΚΕ)',
    'ΚΟΛΩΝΑΚΙ (ΕΕ)',
    'ΓΛΥΦΑΔΑ (ΙΚΕ)',
    'ΠΕΙΡΑΙΑΣ (ΙΚΕ)',
    'ΒΡΙΛΗΣΣΙΑ (IKE)',
    'ΚΟΡΥΔΑΛΛΟΣ (ΕΕ)',
    'ΚΗΦΙΣΙΑ (ΕΕ)',
    'ΕΛΛΗΝΙΚΟ (ΙΚΕ)',
    'ΑΓ.ΠΑΡΑΣΚΕΥΗ (ΕΕ)',
    'ΧΑΛΑΝΔΡΙ (IKE)',
];
const STORE_LOCALITY_CLUSTERS = [
    { id: 'central', patterns: [/ΣΥΝΤΑΓΜΑ|ΚΟΛΩΝΑΚΙ/i], region: 'Αττική' },
    { id: 'north', patterns: [/ΧΟΛΑΡΓΟΣ|ATHENS\s*MALL|ΒΡΙΛΗΣΣΙ|ΚΗΦΙΣΙ|ΧΑΛΑΝΔΡ/i], region: 'Αττική' },
    { id: 'south', patterns: [/ΕΛΛΗΝΙΚ|ΓΛΥΦΑΔ/i], region: 'Αττική' },
    { id: 'east', patterns: [/ΑΓ\.?\s*ΠΑΡΑΣΚΕΥ/i], region: 'Αττική' },
    { id: 'west', patterns: [/ΕΡΥΘΡΑΙ|ΚΟΡΥΔΑΛΛ|ΠΕΡΙΣΤΕΡ/i], region: 'Αττική' },
    { id: 'piraeus', patterns: [/ΠΕΙΡΑ/i], region: 'Αττική' },
    { id: 'warehouse', patterns: [/ΚΕΝΤΡΙΚΗ\s*ΑΠΟΘΗΚΗ/i], region: 'Αττική' },
    { id: 'thessaloniki', patterns: [/ΘΕΣΣΑΛΟΝΙΚ|THESS|SALON/i], region: 'Θεσσαλονίκη' },
    { id: 'crete', patterns: [/ΗΡΑΚΛΕΙΟ|ΚΡΗΤ|ΧΑΝΙΑ|ΡΕΘΥΜ/i], region: 'Κρήτη' },
    { id: 'west-greece', patterns: [/ΠΑΤΡ|ΑΧΑΙ|ΠΥΡΓ/i], region: 'Δυτ. Ελλάδα' },
    { id: 'thessaly', patterns: [/ΛΑΡΙΣ|ΒΟΛΟ|ΘΕΣΣΑΛΙ/i], region: 'Θεσσαλία' },
    { id: 'epirus', patterns: [/ΙΩΑΝΝΙΝ|ΗΠΕΙΡ/i], region: 'Ήπειρος' },
    { id: 'north-greece', patterns: [/ΚΑΒΑΛ|ΚΟΜΟΤΗΝ|ΞΑΝΘ|ΑΛΕΞΑΝΔΡΟΥΠΟΛ/i], region: 'Βόρεια Ελλάδα' },
];

const STORE_LOCALITY_ADJACENCY = {
    central: ['north', 'south', 'east', 'west', 'piraeus', 'warehouse'],
    north: ['central', 'east', 'warehouse'],
    south: ['central', 'east', 'piraeus'],
    east: ['central', 'north', 'south'],
    west: ['central', 'piraeus', 'north'],
    piraeus: ['central', 'south', 'west'],
    warehouse: ['central', 'north'],
};

function isDeprecatedStoreName(name) {
    return /^\(OLD\)/i.test(String(name || '').trim());
}

/** Reject product titles mistaken for storehouse names during grid scrape. */
function isPlausibleStorehouseName(name) {
    const clean = normalizeStoreDisplayName(name);
    if (!clean || clean.length < 2 || clean.length > 72) return false;
    const upper = clean.toUpperCase();
    if (/ΜΕΤΑΧΕΙΡΙΣΜΕΝΟ|METAXEI/i.test(upper)) return false;
    if (/ΚΙΝΗΤΟ\s*ΤΗΛΕΦΩΝΟ|ΦΟΡΗΤΟΣ\s*ΥΠΟΛΟΓΙΣΤ/i.test(upper)) return false;
    if (/\bIPHONE\b|\bSAMSUNG\b|\bXIAOMI\b|\bREDMI\b|\bPOCO\b|\bHUAWEI\b|\bOPPO\b/i.test(upper)) return false;
    if (/\d+\s*GB\b/i.test(clean)) return false;
    if (/\bBB\s*:/i.test(clean)) return false;
    if (/\([ABC][+-]?\s*[-–]?\d/i.test(clean) || /\([ABC][+-]?\s*$/i.test(clean)) return false;
    if (/\((?:IKE|ΙΚΕ|ΕΕ|EE)\)/i.test(clean)) return true;
    if (matchStoreNameInText(clean, DEFAULT_PROFILE_STORES)) return true;
    if (/\d+\s*GB\b/i.test(clean) || /\bMINI\b|\bPRO\b|\bMAX\b|\bPLUS\b/i.test(upper)) return false;
    return clean.length <= 48;
}

function sanitizeStorehouseList(stores) {
    const seen = new Map();
    (stores || []).forEach((store) => {
        const name = normalizeStoreDisplayName(store?.name);
        if (!isPlausibleStorehouseName(name)) return;
        const qty = String(store?.qty != null ? store.qty : '1');
        seen.set(name, { name, qty });
    });
    return [...seen.values()];
}

function normalizeStoreLookupKey(name) {
    return normalizeStoreDisplayName(name)
        .toUpperCase()
        .replace(/\s*\([^)]*\)\s*$/, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function getProfileStoreNamesFromDocument(doc = document) {
    const sel = doc.querySelector('#iProfileID, select[name="iProfileID"]');
    if (!sel) return [];
    return [...sel.options]
        .map((opt) => normalizeStoreDisplayName(opt.text))
        .filter((name) => name && !isDeprecatedStoreName(name));
}

function matchStoreNameInText(text, candidates) {
    const upper = String(text || '').toUpperCase();
    let best = null;
    let bestLen = 0;
    (candidates || []).forEach((name) => {
        const clean = normalizeStoreDisplayName(name);
        if (!clean || isDeprecatedStoreName(clean)) return;
        const key = normalizeStoreLookupKey(clean);
        if (key.length >= 4 && upper.includes(key) && key.length > bestLen) {
            best = clean;
            bestLen = key.length;
        }
    });
    return best;
}

function parseCurrentStoreFromDocument(doc = document) {
    if (!doc) return '';

    // Primary: footer / page store label button (e.g. "ΒΡΙΛΗΣΣΙΑ (IKE)")
    const fromBtn = parseConnectedStoreButton(doc);
    if (fromBtn) return fromBtn;

    const sel = doc.querySelector('#iProfileID, select[name="iProfileID"]');
    if (sel && sel.selectedIndex >= 0) {
        const name = normalizeStoreDisplayName(sel.options[sel.selectedIndex].text);
        if (name && !isDeprecatedStoreName(name) && !/^(select|επιλέξ|επιλεξ|choose|—|-)/i.test(name)) {
            return name;
        }
    }

    let profileNames = getProfileStoreNamesFromDocument(doc);
    // After login #iProfileID is gone — still try matching known store names in the page
    if (!profileNames.length) {
        profileNames = DEFAULT_PROFILE_STORES.slice();
    }
    const searchRoots = [
        doc.querySelector('#login_block1'),
        doc.querySelector('.rnr-b-loggedas'),
        doc.querySelector('.rnr-top'),
        doc.querySelector('#head-outter'),
        doc.body,
    ].filter(Boolean);

    for (const root of searchRoots) {
        const matched = matchStoreNameInText(root.textContent, profileNames);
        if (matched) return matched;
    }

    return '';
}

/**
 * MyManager shows the connected store as a non-interactive footer button, e.g.
 * <button type="button" class="btn" style="cursors:default">ΒΡΙΛΗΣΣΙΑ (IKE)</button>
 * The suite deletes footer center children when building its footer — capture first.
 */
function parseConnectedStoreButton(doc = document) {
    if (!doc) return '';
    const footerCell = doc.querySelector('#footer-outterwrap table td[width="60%"]')
        || doc.querySelector('#footer-outterwrap table td:nth-child(2)')
        || doc.querySelector('#footer-outterwrap td');
    const buttons = [];
    if (footerCell) {
        footerCell.querySelectorAll('button.btn, button').forEach((btn) => buttons.push(btn));
    }
    doc.querySelectorAll('button.btn').forEach((btn) => {
        if (!buttons.includes(btn)) buttons.push(btn);
    });

    const scoreButton = (btn) => {
        const text = normalizeStoreDisplayName(btn.textContent);
        if (!text || text.length < 3 || text.length > 80) return null;
        if (isDeprecatedStoreName(text)) return null;
        if (/^(ok|cancel|αποθήκ|save|login|είσοδος|search|αναζήτ)/i.test(text)) return null;
        const style = String(btn.getAttribute('style') || '');
        const looksDefaultCursor = /cursors?\s*:\s*default/i.test(style);
        const inFooter = !!(footerCell && footerCell.contains(btn));
        const looksLikeStore = /\((?:IKE|ΙΚΕ|ΕΕ|EE)\)/i.test(text)
            || !!matchStoreNameInText(text, DEFAULT_PROFILE_STORES);
        if (!looksLikeStore && !(inFooter && looksDefaultCursor && /[Α-ΩA-Z]/u.test(text))) {
            return null;
        }
        let score = 0;
        if (inFooter) score += 5;
        if (looksDefaultCursor) score += 3;
        if (/\((?:IKE|ΙΚΕ|ΕΕ|EE)\)/i.test(text)) score += 4;
        if (btn.classList.contains('btn')) score += 1;
        return { text, score };
    };

    let best = null;
    buttons.forEach((btn) => {
        const hit = scoreButton(btn);
        if (!hit) return;
        if (!best || hit.score > best.score) best = hit;
    });
    return best?.text || '';
}

function getConnectedStoreCached() {
    try {
        const name = normalizeStoreDisplayName(GM_getValue(CONNECTED_STORE_KEY, '') || '');
        if (name && !isDeprecatedStoreName(name)) return name;
    } catch (_) { /* ignore */ }
    return '';
}

/** Capture + persist connected store from the page button. Safe to call before footer wipe. */
function captureConnectedStoreFromPage(doc = document) {
    const name = parseConnectedStoreButton(doc);
    if (!name) return getConnectedStoreCached();
    try {
        GM_setValue(CONNECTED_STORE_KEY, name);
        GM_setValue(MY_STORE_NAME_KEY, name);
        const pick = normalizeStoreDisplayName(GM_getValue(MY_STORE_PICK_KEY, '') || '');
        if (!pick || normalizeStoreLookupKey(pick) !== normalizeStoreLookupKey(name)) {
            GM_setValue(MY_STORE_PICK_KEY, name);
        }
    } catch (_) { /* ignore */ }
    return name;
}

function detectAndCacheCurrentStoreName(doc = document) {
    // Prefer live connected-store button whenever present
    const connected = captureConnectedStoreFromPage(doc);
    if (connected) return connected;

    const parsed = parseCurrentStoreFromDocument(doc);
    if (parsed) {
        GM_setValue(MY_STORE_NAME_KEY, parsed);
        return parsed;
    }
    return GM_getValue(MY_STORE_NAME_KEY, '') || getConnectedStoreCached() || '';
}

function getLoginCapturedStore() {
    try {
        const login = normalizeStoreDisplayName(GM_getValue(LOGIN_STORE_KEY, '') || '');
        if (login && !isDeprecatedStoreName(login)) return login;
    } catch (_) { /* ignore */ }
    return '';
}

/** Prefer connected-page store, then login capture, for "my store". */
function syncMyStoreFromLoginCapture() {
    const connected = getConnectedStoreCached() || captureConnectedStoreFromPage(document);
    if (connected) {
        try { GM_setValue(MY_STORE_NAME_KEY, connected); } catch (_) { /* ignore */ }
        try {
            const pick = normalizeStoreDisplayName(GM_getValue(MY_STORE_PICK_KEY, '') || '');
            if (!pick || normalizeStoreLookupKey(pick) !== normalizeStoreLookupKey(connected)) {
                GM_setValue(MY_STORE_PICK_KEY, connected);
            }
        } catch (_) { /* ignore */ }
        return connected;
    }
    const login = getLoginCapturedStore();
    if (!login) return '';
    try {
        GM_setValue(MY_STORE_NAME_KEY, login);
    } catch (_) { /* ignore */ }
    try {
        const pick = normalizeStoreDisplayName(GM_getValue(MY_STORE_PICK_KEY, '') || '');
        if (!pick || normalizeStoreLookupKey(pick) !== normalizeStoreLookupKey(login)) {
            GM_setValue(MY_STORE_PICK_KEY, login);
        }
    } catch (_) { /* ignore */ }
    return login;
}

function getAutoDetectedStoreName(doc = document) {
    return detectAndCacheCurrentStoreName(doc);
}

function getUserStorePick() {
    const connected = getConnectedStoreCached() || captureConnectedStoreFromPage(document);
    if (connected) return connected;
    const login = getLoginCapturedStore();
    if (login) {
        syncMyStoreFromLoginCapture();
        return login;
    }
    return GM_getValue(MY_STORE_PICK_KEY, '') || '';
}

function setUserStorePick(name) {
    // Connected page store or login auto-store locks "my store" (same as chat)
    const locked = getConnectedStoreCached() || getLoginCapturedStore();
    if (locked) {
        try { GM_setValue(MY_STORE_PICK_KEY, locked); } catch (_) { /* ignore */ }
        return locked;
    }
    const clean = normalizeStoreDisplayName(name);
    if (clean) {
        GM_setValue(MY_STORE_PICK_KEY, clean);
        return clean;
    }
    GM_deleteValue(MY_STORE_PICK_KEY);
    return '';
}

function getStorePickerOptions(...phoneLists) {
    const seen = new Map();
    const add = (name) => {
        const clean = normalizeStoreDisplayName(name);
        if (!clean || isDeprecatedStoreName(clean)) return;
        const key = normalizeStoreLookupKey(clean);
        if (!seen.has(key)) seen.set(key, clean);
    };

    DEFAULT_PROFILE_STORES.forEach(add);
    getProfileStoreNamesFromDocument().forEach(add);
    (collectKnownStoreNames(...phoneLists) || []).forEach(add);
    const detected = GM_getValue(MY_STORE_NAME_KEY, '');
    if (detected) add(detected);
    const connected = getConnectedStoreCached();
    if (connected) add(connected);
    const login = getLoginCapturedStore();
    if (login) add(login);
    const pick = GM_getValue(MY_STORE_PICK_KEY, '') || '';
    if (pick) add(pick);

    return [...seen.values()].sort((a, b) => a.localeCompare(b, 'el'));
}

function getCurrentStoreName() {
    // 1) Connected store button on the page (primary)
    const connected = captureConnectedStoreFromPage(document) || getConnectedStoreCached();
    if (connected) return connected;
    // 2) Login-page capture (fallback)
    const login = getLoginCapturedStore();
    if (login) {
        try { GM_setValue(MY_STORE_NAME_KEY, login); } catch (_) { /* ignore */ }
        return login;
    }
    // 3) Manual pick / auto text match
    const pick = GM_getValue(MY_STORE_PICK_KEY, '') || '';
    if (pick) return pick;
    return getAutoDetectedStoreName(document);
}

function loadStoreAddresses() {
    try {
        const parsed = JSON.parse(GM_getValue(STORE_ADDRESSES_KEY, '{}'));
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
        return {};
    }
}

function saveStoreAddresses(map) {
    GM_setValue(STORE_ADDRESSES_KEY, JSON.stringify(map || {}));
    if (typeof pcNotifyConfigChanged === 'function') pcNotifyConfigChanged('store_addresses');
}

function resolveStoreAddressKey(storeName, map) {
    const mapObj = map || loadStoreAddresses();
    const target = normalizeStoreLookupKey(storeName);
    const exact = normalizeStoreDisplayName(storeName);
    if (mapObj[exact]) return exact;
    for (const key of Object.keys(mapObj)) {
        if (normalizeStoreLookupKey(key) === target) return key;
    }
    return exact;
}

function getStoreAddressEntry(storeName) {
    const map = loadStoreAddresses();
    const key = resolveStoreAddressKey(storeName, map);
    return map[key] || null;
}

function setStoreAddressEntry(storeName, data) {
    const map = loadStoreAddresses();
    const key = resolveStoreAddressKey(storeName, map) || normalizeStoreDisplayName(storeName);
    const prev = map[key] && typeof map[key] === 'object' ? { ...map[key] } : {};
    const next = { ...prev };

    if (data && Object.prototype.hasOwnProperty.call(data, 'address')) {
        next.address = String(data.address || '').trim();
        if (Object.prototype.hasOwnProperty.call(data, 'lat')) next.lat = data.lat;
        if (Object.prototype.hasOwnProperty.call(data, 'lng')) next.lng = data.lng;
        if (Object.prototype.hasOwnProperty.call(data, 'geocodedAt')) next.geocodedAt = data.geocodedAt;
        if (!next.address) {
            delete next.lat;
            delete next.lng;
            delete next.geocodedAt;
            delete next.address;
        }
    }
    if (data && Object.prototype.hasOwnProperty.call(data, 'phone')) {
        const phone = String(data.phone || '').trim();
        if (phone) next.phone = phone.slice(0, 40);
        else delete next.phone;
    }

    if (!next.address && !next.phone) {
        delete map[key];
        saveStoreAddresses(map);
        return null;
    }
    map[key] = next;
    saveStoreAddresses(map);
    return map[key];
}

function getStorePhone(storeName) {
    const entry = getStoreAddressEntry(storeName);
    return String(entry?.phone || '').trim();
}

function normalizeStorePhoneForTel(phone) {
    const raw = String(phone || '').trim();
    if (!raw) return '';
    const hasPlus = raw.startsWith('+');
    const digits = raw.replace(/[^\d]/g, '');
    if (!digits) return '';
    return hasPlus ? `+${digits}` : digits;
}

function getStoreCoordinates(storeName) {
    const entry = getStoreAddressEntry(storeName);
    const lat = parseFloat(entry?.lat);
    const lng = parseFloat(entry?.lng);
    if (!entry || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
}

function haversineDistanceKm(lat1, lng1, lat2, lng2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistanceKm(km) {
    if (km == null || !Number.isFinite(km)) return '';
    if (km < 1) return `${Math.round(km * 1000)} m`;
    if (km < 10) return `${km.toFixed(1)} km`;
    return `${Math.round(km)} km`;
}

function getStoreDistanceKm(fromStore, toStore) {
    const a = getStoreCoordinates(fromStore);
    const b = getStoreCoordinates(toStore);
    if (!a || !b) return null;
    return haversineDistanceKm(a.lat, a.lng, b.lat, b.lng);
}

function getStoreDistanceLabel(fromStore, toStore) {
    return formatDistanceKm(getStoreDistanceKm(fromStore, toStore));
}

function geocodeAddressQuery(query) {
    return new Promise((resolve) => {
        const q = String(query || '').trim();
        if (!q) {
            resolve(null);
            return;
        }
        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(`${q}, Greece`)}`,
            headers: {
                Accept: 'application/json',
                'User-Agent': 'MyManagerPhoneCatalog/1.0 (store proximity)',
            },
            onload(response) {
                try {
                    const data = JSON.parse(response.responseText || '[]');
                    const hit = data?.[0];
                    if (!hit) {
                        resolve(null);
                        return;
                    }
                    const lat = parseFloat(hit.lat);
                    const lng = parseFloat(hit.lon);
                    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                        resolve(null);
                        return;
                    }
                    resolve({ lat, lng });
                } catch (e) {
                    resolve(null);
                }
            },
            onerror() {
                resolve(null);
            },
        });
    });
}

function sleepMs(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeStoreAddress(storeName, address) {
    const cleanAddress = String(address || '').trim();
    if (!cleanAddress) return { ok: false, reason: 'empty' };
    const coords = await geocodeAddressQuery(cleanAddress);
    if (!coords) {
        setStoreAddressEntry(storeName, { address: cleanAddress });
        return { ok: false, reason: 'not_found' };
    }
    setStoreAddressEntry(storeName, {
        address: cleanAddress,
        lat: coords.lat,
        lng: coords.lng,
        geocodedAt: Date.now(),
    });
    return { ok: true, ...coords };
}

async function geocodeAllStoreAddresses(storeNames, options = {}) {
    const onProgress = options.onProgress || (() => {});
    let geocoded = 0;
    let failed = 0;
    for (let i = 0; i < storeNames.length; i += 1) {
        const name = storeNames[i];
        const entry = getStoreAddressEntry(name);
        const address = entry?.address?.trim();
        if (!address) continue;
        onProgress(i + 1, storeNames.length, name);
        const result = await geocodeStoreAddress(name, address);
        if (result.ok) geocoded += 1;
        else failed += 1;
        if (i < storeNames.length - 1) await sleepMs(1100);
    }
    return { geocoded, failed };
}

function guessStoreLocality(name) {
    const n = String(name || '').toUpperCase();
    for (const cluster of STORE_LOCALITY_CLUSTERS) {
        if (cluster.patterns.some((re) => re.test(n))) return cluster.id;
    }
    return 'other';
}

function guessStoreRegion(name) {
    const n = String(name || '').toUpperCase();
    for (const cluster of STORE_LOCALITY_CLUSTERS) {
        if (cluster.patterns.some((re) => re.test(n))) return cluster.region;
    }
    if (/ΑΘΗΝ|ΑΤΤΙΚ|ΜΑΡΟΥΣΙ|ΚΑΛΛΙΘΕΑ|ΝΕΑ\s*ΣΜΥΡΝ/i.test(n)) return 'Αττική';
    return 'Άλλες περιοχές';
}

function getStoreProximityTier(storeName, myStoreName) {
    if (!myStoreName) return 99;
    const myKey = normalizeStoreLookupKey(myStoreName);
    const storeKey = normalizeStoreLookupKey(storeName);
    if (myKey && storeKey && myKey === storeKey) return 0;

    const myLocality = guessStoreLocality(myStoreName);
    const storeLocality = guessStoreLocality(storeName);
    if (myLocality !== 'other' && storeLocality === myLocality) return 0;
    if (myLocality !== 'other' && (STORE_LOCALITY_ADJACENCY[myLocality] || []).includes(storeLocality)) return 1;

    const myRegion = guessStoreRegion(myStoreName);
    const storeRegion = guessStoreRegion(storeName);
    if (myRegion === storeRegion && myRegion !== 'Άλλες περιοχές') return 2;
    return 3;
}

function compareStoresByProximity(aName, bName, myStoreName) {
    const mine = myStoreName || getCurrentStoreName();
    const distA = getStoreDistanceKm(mine, aName);
    const distB = getStoreDistanceKm(mine, bName);
    if (distA != null && distB != null && distA !== distB) return distA - distB;
    if (distA != null && distB == null) return -1;
    if (distA == null && distB != null) return 1;

    const tierA = getStoreProximityTier(aName, mine);
    const tierB = getStoreProximityTier(bName, mine);
    if (tierA !== tierB) return tierA - tierB;
    if (isDeprecatedStoreName(aName) !== isDeprecatedStoreName(bName)) {
        return isDeprecatedStoreName(aName) ? 1 : -1;
    }
    return String(aName || '').localeCompare(String(bName || ''), 'el');
}

function sortStoresByProximity(stores, myStoreName) {
    const mine = myStoreName || getCurrentStoreName();
    return [...(stores || [])].sort((a, b) => {
        const aName = typeof a === 'string' ? a : a?.name;
        const bName = typeof b === 'string' ? b : b?.name;
        return compareStoresByProximity(aName, bName, mine);
    });
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
function getPhoneCatalogActorName() {
    try {
        if (typeof window.MMS_PROFILES?.getLoggedInDisplayName === 'function') {
            const n = String(window.MMS_PROFILES.getLoggedInDisplayName({ fallback: null }) || '').trim();
            if (n) return n.slice(0, 64);
        }
    } catch (_) { /* ignore */ }
    try {
        if (typeof window.MMS_PROFILES?.parseLoginBlockDisplayName === 'function') {
            const n = String(window.MMS_PROFILES.parseLoginBlockDisplayName() || '').trim();
            if (n) return n.slice(0, 64);
        }
    } catch (_) { /* ignore */ }
    const el = document.querySelector('#login_block1 b, .rnr-b-loggedas b');
    if (el) {
        const n = String(el.textContent || '').replace(/^.*ως\s+/i, '').trim();
        if (n) return n.slice(0, 64);
    }
    try {
        const fallback = String(
            window.tmCurrentUser
            || window.config?.currentUser
            || window.config?.profileLabel
            || window.MMS_PROFILES?.getActiveProfileLabel?.()
            || ''
        ).trim();
        if (fallback && fallback !== '_unknown') return fallback.slice(0, 64);
    } catch (_) { /* ignore */ }
    return 'Τεχνικός';
}

function loadPhoneListRefreshMeta() {
    try {
        const raw = GM_getValue(PHONE_LIST_REFRESH_META_KEY, null);
        if (!raw) return null;
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!parsed || typeof parsed !== 'object') return null;
        const at = Number(parsed.at) || 0;
        const by = String(parsed.by || '').trim().slice(0, 64);
        if (!at && !by) return null;
        return { at, by };
    } catch (_) {
        return null;
    }
}

function savePhoneListRefreshMeta(meta) {
    const at = Number(meta?.at) || Date.now();
    const by = meta && Object.prototype.hasOwnProperty.call(meta, 'by')
        ? String(meta.by || '').trim().slice(0, 64)
        : String(getPhoneCatalogActorName() || '').trim().slice(0, 64);
    const next = { at, by };
    GM_setValue(PHONE_LIST_REFRESH_META_KEY, JSON.stringify(next));
    if (typeof pcNotifyConfigChanged === 'function') pcNotifyConfigChanged('list_refresh');
    return next;
}

function buildPhoneListSnapshot(phones) {
    const meta = loadPhoneListRefreshMeta();
    return {
        v: 1,
        phones,
        refreshedAt: Number(meta?.at) || getPhoneListCacheTimestamp() || Date.now(),
        refreshedBy: String(meta?.by || '').trim().slice(0, 64),
    };
}

function compactStoreEntry(store) {
    if (!store) return null;
    if (typeof store === 'string') {
        const name = normalizeStoreDisplayName(store);
        return isPlausibleStorehouseName(name) ? { name, qty: '1' } : null;
    }
    const name = normalizeStoreDisplayName(store.name);
    if (!isPlausibleStorehouseName(name)) return null;
    return { name, qty: String(store.qty != null ? store.qty : '1') };
}

function compactPhoneForSnapshot(phone) {
    if (!phone || typeof phone !== 'object') return null;
    const barcode = String(phone.barcode || '').trim();
    if (!barcode) return null;
    const row = {
        barcode,
        name: String(phone.name || '').trim(),
        model: String(phone.model || '').trim(),
        grade: String(phone.grade || '').trim(),
        imei: String(phone.imei || '').trim(),
        unitsRemaining: Number(phone.unitsRemaining) || 0,
        isBuyback: !!phone.isBuyback,
        retailPrice: String(phone.retailPrice || '').trim(),
        otherStoreCount: Number(phone.otherStoreCount) || 0,
    };
    const otherStores = (phone.otherStores || []).map(compactStoreEntry).filter(Boolean);
    if (otherStores.length) row.otherStores = otherStores;
    const stores = (phone.stores || []).map(compactStoreEntry).filter(Boolean);
    if (stores.length) row.stores = stores;
    return row;
}

function parsePhoneListSnapshot(payload, recordHint) {
    // Prefer scrape fields on the payload. PocketBase record updatedAt/By is the
    // last DB write (often a pull/flush), not the MyManager scrape.
    if (Array.isArray(payload)) {
        return {
            phones: payload,
            refreshedAt: 0,
            refreshedBy: '',
        };
    }
    if (payload && typeof payload === 'object' && Array.isArray(payload.phones)) {
        return {
            phones: payload.phones,
            refreshedAt: Number(payload.refreshedAt) || 0,
            refreshedBy: String(payload.refreshedBy || '').trim(),
        };
    }
    void recordHint;
    return null;
}

function applyPhoneListSnapshot(snapshot, opts = {}) {
    if (!snapshot?.phones?.length) return;
    hydratePhonesFromStoreDetailsCache(snapshot.phones);
    const prevMeta = loadPhoneListRefreshMeta();
    const prevTs = getPhoneListCacheTimestamp();
    const snapTs = Number(snapshot.refreshedAt) || 0;
    const snapBy = String(snapshot.refreshedBy || '').trim().slice(0, 64);
    // Stock rows may carry scrape fields, but PocketBase kind `list_refresh` is
    // the network source of truth for who scraped / when. Don't clobber it on
    // every phone_list pull unless meta is missing or this is an explicit scrape save.
    const updateRefreshMeta = opts.updateRefreshMeta === true
        || ((!prevMeta?.at && !prevMeta?.by) && (snapTs || snapBy));
    const ts = snapTs || Number(prevMeta?.at) || prevTs || 0;
    GM_setValue(PHONE_LIST_CACHE_KEY, JSON.stringify(snapshot.phones));
    if (ts > 0) GM_setValue(PHONE_LIST_CACHE_TIMESTAMP_KEY, ts);
    if (updateRefreshMeta && (snapTs || snapBy || prevMeta)) {
        GM_setValue(PHONE_LIST_REFRESH_META_KEY, JSON.stringify({
            at: snapTs || Number(prevMeta?.at) || prevTs || 0,
            by: snapBy || String(prevMeta?.by || '').trim().slice(0, 64),
        }));
    }
}

function readStoredPhoneListCount() {
    try {
        const cached = GM_getValue(PHONE_LIST_CACHE_KEY, null);
        if (!cached) return 0;
        const parsed = JSON.parse(cached);
        return Array.isArray(parsed) ? parsed.length : 0;
    } catch (_) {
        return 0;
    }
}

function finalizePhoneListFetch(phones, onProgress, resolve) {
    const result = Array.isArray(phones) ? phones : [];
    if (!result.length) {
        const cached = loadPhoneListCache();
        if (cached?.length) {
            console.warn('[MMS Phone List] Scrape returned no phones — keeping cached snapshot');
            onProgress({ phase: 'done', ratio: 1, fromCache: true });
            resolve(cached);
            return;
        }
    } else {
        savePhoneListCache(result);
    }
    onProgress({ phase: 'done', ratio: 1 });
    resolve(result);
}

function savePhoneListCache(phones) {
    if (!Array.isArray(phones) || !phones.length) {
        console.warn('[MMS Phone List] Skipping cache save — empty list (keeping previous snapshot)');
        return;
    }
    const prevCount = readStoredPhoneListCount();
    if (prevCount > 0) {
        const minKeep = Math.max(5, Math.floor(prevCount * 0.5));
        if (phones.length < minKeep) {
            console.warn(
                `[MMS Phone List] Skipping cache save — scraped ${phones.length} phones vs ${prevCount} cached (likely bad/filtered scrape)`
            );
            return;
        }
    }
    const at = Date.now();
    GM_setValue(PHONE_LIST_CACHE_KEY, JSON.stringify(phones));
    GM_setValue(PHONE_LIST_CACHE_TIMESTAMP_KEY, at);
    savePhoneListRefreshMeta({ at, by: getPhoneCatalogActorName() });
    if (typeof pcNotifyConfigChanged === 'function') pcNotifyConfigChanged('phone_list');
    console.log('[MMS Phone List] Cache saved');
}

function saveOtherStoreCache(phones) {
    if (!Array.isArray(phones) || !phones.length) {
        console.warn('[MMS Phone List] Skipping other-store cache save — empty list');
        return;
    }
    GM_setValue(OTHER_STORE_CACHE_KEY, JSON.stringify(phones));
    GM_setValue(OTHER_STORE_CACHE_TIMESTAMP_KEY, Date.now());
    if (typeof pcNotifyConfigChanged === 'function') pcNotifyConfigChanged('other_store_phones');
    console.log('[MMS Phone List] Other-store cache saved');
}

function getPhoneListCacheTimestamp() {
    const ts = Number(GM_getValue(PHONE_LIST_CACHE_TIMESTAMP_KEY, 0)) || 0;
    return ts > 0 ? ts : 0;
}

function getPhoneListCacheAgeMs() {
    const timestamp = getPhoneListCacheTimestamp();
    if (!timestamp) return null;
    return Math.max(0, Date.now() - timestamp);
}

/**
 * Loads phone list from cache
 * @returns {Array|null} Cached phone list or null if not found/expired
 */
function loadPhoneListCache() {
    const cached = GM_getValue(PHONE_LIST_CACHE_KEY, null);
    const timestamp = getPhoneListCacheTimestamp();

    if (!cached || !timestamp) {
        return null;
    }

    const ageMs = Date.now() - timestamp;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays > CACHE_EXPIRATION_DAYS) {
        console.warn(`[MMS Phone List] Local cache expired (${ageDays.toFixed(1)}d > ${CACHE_EXPIRATION_DAYS}d) — discarding`);
        try {
            GM_setValue(PHONE_LIST_CACHE_KEY, null);
            GM_setValue(PHONE_LIST_CACHE_TIMESTAMP_KEY, 0);
        } catch (_) { /* ignore */ }
        return null;
    }

    try {
        const phones = JSON.parse(cached);
        if (!Array.isArray(phones) || !phones.length) return null;
        return hydratePhoneBuybackFlags(phones);
    } catch (e) {
        console.error('[MMS Phone List] Error parsing cache:', e);
        return null;
    }
}

/**
 * True when cache exists but is old enough that we should re-fetch in the background.
 */
function isPhoneListCacheStale() {
    const ageMs = getPhoneListCacheAgeMs();
    if (ageMs == null) return true;
    return ageMs >= PHONE_LIST_SOFT_REFRESH_MS;
}

/**
 * Gets cache age in days
 * @returns {number|null} Age in days, or null if no cache
 */
function getCacheAgeDays() {
    const ageMs = getPhoneListCacheAgeMs();
    if (ageMs == null) return null;
    return Math.floor(ageMs / (1000 * 60 * 60 * 24));
}

function getOtherStoreCache(options = {}) {
    try {
        const cached = GM_getValue(OTHER_STORE_CACHE_KEY, null);
        const ts = GM_getValue(OTHER_STORE_CACHE_TIMESTAMP_KEY, 0);
        if (!cached || !ts) return null;
        const ageDays = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
        if (!options.ignoreExpiry && ageDays > OTHER_STORE_CACHE_EXPIRATION_DAYS) return null;
        const parsed = JSON.parse(cached);
        return Array.isArray(parsed) && parsed.length ? parsed : null;
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
            if (name && isPlausibleStorehouseName(name)) stores.push({ name, qty });
        }
    });

    if (stores.length) return;

    decoded.split('\n').map((l) => l.trim()).filter(Boolean).forEach((line) => {
        const match = line.match(/(.+?)\s+(\d+)\s*$/);
        if (match) {
            const name = match[1].trim();
            if (isPlausibleStorehouseName(name)) {
                stores.push({ name, qty: match[2].trim() });
            }
        }
    });
}

function parseOtherStorehousesFromRow(row) {
    if (!row) return [];
    const seen = new Map();

    function addList(list) {
        sanitizeStorehouseList(list).forEach((store) => {
            seen.set(store.name, store);
        });
    }

    const otherStoreEl = row.querySelector('[id*="iUnitsRemainingOtherStoreHouses"]');
    addList(parseOtherStorehouses(otherStoreEl));

    if (!seen.size && otherStoreEl) {
        const scope = otherStoreEl.closest('td') || otherStoreEl.parentElement || row;
        const snippets = new Set();
        [otherStoreEl, scope].forEach((el) => {
            if (!el) return;
            el.querySelectorAll('[data-content],[data-bs-content],[data-original-title],[title]').forEach((node) => {
                ['data-content', 'data-bs-content', 'data-original-title', 'title'].forEach((attr) => {
                    const val = node.getAttribute(attr);
                    if (val) snippets.add(val);
                });
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

    for (const rawSnippet of snippets) {
        parseStorehouseSnippets(rawSnippet, stores);
        if (stores.length > 0) break;
    }

    return sanitizeStorehouseList(stores);
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
    return sanitizeStorehouseList(response.map((r) => ({
        name: String(r.storehouse || r.name || r.store || '').trim(),
        qty: String(r.units != null ? r.units : (r.qty != null ? r.qty : '1')),
    })));
}

// The page helper answers with a small JSON payload, so it stays the preferred
// source. Repeated silence only pauses it for a while; nothing disables it for
// the rest of the session, otherwise one slow patch pushes every remaining
// barcode onto the much heavier HTML fallback.
const PAGE_API_TIMEOUT_MS = 6000;
const PAGE_API_MAX_STRIKES = 4;
const PAGE_API_PAUSE_MS = 20000;
// Only rows the grid says have other-store stock get here, so a long run of
// empty answers means the helper is not reporting for them and the HTML page
// has to take over.
const PAGE_API_MAX_EMPTY_STREAK = 8;
let pageApiStrikes = 0;
let pageApiPausedUntil = 0;
let pageApiEmptyStreak = 0;
let pageApiTrusted = true;
let pageApiBridgeState = 'unknown'; // unknown | ok | missing

function getStorehousePageApiFn() {
    const fn = (typeof unsafeWindow !== 'undefined' ? unsafeWindow.getCheckOtherInventories : null)
        || (typeof window !== 'undefined' ? window.getCheckOtherInventories : null);
    return typeof fn === 'function' ? fn : null;
}

function isStorehousePageApiUsable() {
    if (!pageApiTrusted) return false;
    if (!getStorehousePageApiFn() && pageApiBridgeState === 'missing') return false;
    if (pageApiStrikes < PAGE_API_MAX_STRIKES) return true;
    if (Date.now() < pageApiPausedUntil) return false;
    pageApiStrikes = PAGE_API_MAX_STRIKES - 1;
    return true;
}

function notePageApiAnswer(ok) {
    if (ok) {
        pageApiStrikes = 0;
        pageApiPausedUntil = 0;
        return;
    }
    pageApiStrikes += 1;
    if (pageApiStrikes >= PAGE_API_MAX_STRIKES) {
        pageApiPausedUntil = Date.now() + PAGE_API_PAUSE_MS;
    }
}

function fetchStorehousesViaUnsafeWindow(productCode) {
    return new Promise((resolve) => {
        const fn = getStorehousePageApiFn();
        if (!fn) {
            resolve({ stores: [], ok: false });
            return;
        }
        let settled = false;
        const finish = (result) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve(result);
        };
        const timer = setTimeout(() => finish({ stores: [], ok: false }), PAGE_API_TIMEOUT_MS);
        try {
            fn(productCode, false, {
                content_type: 'json',
                onFinish: (response) => finish({ stores: normalizeStorehouseResponse(response), ok: true }),
            });
        } catch (e) {
            finish({ stores: [], ok: false });
        }
    });
}

// Used when the page helper lives outside the script sandbox and is therefore
// unreachable through unsafeWindow.
function fetchStorehousesViaPageScript(productCode) {
    return new Promise((resolve) => {
        if (pageApiBridgeState === 'missing') {
            resolve({ stores: [], ok: false });
            return;
        }
        const requestId = `tmStores${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
        let settled = false;
        const finish = (result) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            window.removeEventListener('message', onMessage);
            resolve(result);
        };
        const timeout = setTimeout(() => finish({ stores: [], ok: false }), PAGE_API_TIMEOUT_MS);

        function onMessage(event) {
            if (event.source !== window || !event.data || event.data.type !== 'tm-mms-storehouses') return;
            if (event.data.id !== requestId) return;
            if (event.data.missing) {
                pageApiBridgeState = 'missing';
                finish({ stores: [], ok: false });
                return;
            }
            pageApiBridgeState = 'ok';
            finish({ stores: event.data.stores || [], ok: true });
        }
        window.addEventListener('message', onMessage);

        const script = document.createElement('script');
        const safeCode = JSON.stringify(String(productCode));
        script.textContent = `(function(){
            var id=${JSON.stringify(requestId)};
            var productCode=${safeCode};
            function finish(stores,missing){window.postMessage({type:'tm-mms-storehouses',id:id,stores:stores,missing:!!missing},'*');}
            try{
                var fn=window.getCheckOtherInventories;
                if(typeof fn!=='function'){finish([],true);return;}
                fn(productCode,false,{content_type:'json',onFinish:function(r){
                    finish((r||[]).map(function(x){return{name:String(x.storehouse||x.name||'').trim(),qty:String(x.units!=null?x.units:(x.qty!=null?x.qty:'1'))}}).filter(function(x){return x.name;}));
                }});
            }catch(e){finish([]);}
        })();`;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    });
}

function fetchStorehousesViaPageApi(productCode) {
    // Only reach for the injected bridge when the helper is not visible from
    // the sandbox; retrying both paths per barcode would double the wait.
    if (getStorehousePageApiFn()) return fetchStorehousesViaUnsafeWindow(productCode);
    if (pageApiBridgeState !== 'missing') return fetchStorehousesViaPageScript(productCode);
    return Promise.resolve({ stores: [], ok: false });
}

/**
 * @returns {Promise<{stores: Array, answered: boolean}>} `answered` means a
 * source really reported on this barcode, so an empty list is a genuine "no
 * other-store stock" and does not deserve another pass.
 */
async function fetchStorehouseDetails(productCode, options = {}) {
    const code = String(productCode || '').trim();
    if (!code) return { stores: [], answered: true };

    const skipCache = !!(options.force || options.skipCache);
    if (!skipCache) {
        const cached = getCachedPhoneStoreDetails(code);
        if (cached?.length) return { stores: cached, answered: true };
    }

    if (!isStorehousePageApiUsable()) {
        // Without a live API, keep any trusted cache rather than inventing "empty".
        if (!skipCache) {
            const cached = getCachedPhoneStoreDetails(code);
            if (cached?.length) return { stores: cached, answered: true };
        }
        return { stores: [], answered: false };
    }

    const viaPage = await fetchStorehousesViaPageApi(code);
    notePageApiAnswer(viaPage.ok);
    if (viaPage.ok && viaPage.stores.length) {
        pageApiEmptyStreak = 0;
        savePhoneStoreDetailsCache(code, viaPage.stores);
        return { stores: viaPage.stores, answered: true };
    }
    if (viaPage.ok) {
        pageApiEmptyStreak += 1;
        clearPhoneStoreDetailsCacheEntry(code);
        return { stores: [], answered: true };
    }

    return { stores: [], answered: false };
}

async function fetchStorehousesFromPage(productCode, options = {}) {
    const result = await fetchStorehouseDetails(productCode, options);
    return result.stores;
}

const PHONE_STORE_DETAILS_CACHE_KEY = 'tm_phone_store_details_cache_v2';
const PHONE_STORE_DETAILS_CACHE_DAYS = 14;
let phoneStoreDetailsCacheMemo = null;
let phoneStoreDetailsSaveTimer = null;

function loadPhoneStoreDetailsCache() {
    if (phoneStoreDetailsCacheMemo && typeof phoneStoreDetailsCacheMemo === 'object') {
        return phoneStoreDetailsCacheMemo;
    }
    try {
        phoneStoreDetailsCacheMemo = JSON.parse(GM_getValue(PHONE_STORE_DETAILS_CACHE_KEY, '{}')) || {};
    } catch (e) {
        phoneStoreDetailsCacheMemo = {};
    }
    return phoneStoreDetailsCacheMemo;
}

function persistPhoneStoreDetailsCache() {
    if (phoneStoreDetailsSaveTimer) {
        clearTimeout(phoneStoreDetailsSaveTimer);
        phoneStoreDetailsSaveTimer = null;
    }
    try {
        GM_setValue(PHONE_STORE_DETAILS_CACHE_KEY, JSON.stringify(loadPhoneStoreDetailsCache()));
    } catch (_) { /* ignore */ }
}

function savePhoneStoreDetailsCache(barcode, stores) {
    const clean = sanitizeStorehouseList(stores);
    if (!barcode || !clean.length) return;
    const cache = loadPhoneStoreDetailsCache();
    cache[barcode] = { stores: clean, ts: Date.now() };
    phoneStoreDetailsCacheMemo = cache;
    if (phoneStoreDetailsSaveTimer) clearTimeout(phoneStoreDetailsSaveTimer);
    phoneStoreDetailsSaveTimer = setTimeout(persistPhoneStoreDetailsCache, 250);
}

function clearPhoneStoreDetailsCacheEntry(barcode) {
    const code = String(barcode || '').trim();
    if (!code) return;
    const cache = loadPhoneStoreDetailsCache();
    if (!Object.prototype.hasOwnProperty.call(cache, code)) return;
    delete cache[code];
    phoneStoreDetailsCacheMemo = cache;
    if (phoneStoreDetailsSaveTimer) clearTimeout(phoneStoreDetailsSaveTimer);
    phoneStoreDetailsSaveTimer = setTimeout(persistPhoneStoreDetailsCache, 250);
}

function clearPhoneStoreDetailsCache() {
    if (phoneStoreDetailsSaveTimer) {
        clearTimeout(phoneStoreDetailsSaveTimer);
        phoneStoreDetailsSaveTimer = null;
    }
    phoneStoreDetailsCacheMemo = {};
    try {
        GM_setValue(PHONE_STORE_DETAILS_CACHE_KEY, '{}');
    } catch (_) { /* ignore */ }
}

function getCachedPhoneStoreDetails(barcode) {
    const entry = loadPhoneStoreDetailsCache()[barcode];
    if (!entry || !entry.stores?.length) return null;
    const ageDays = (Date.now() - (entry.ts || 0)) / (1000 * 60 * 60 * 24);
    if (ageDays > PHONE_STORE_DETAILS_CACHE_DAYS) return null;
    const stores = sanitizeStorehouseList(entry.stores);
    return stores.length ? stores : null;
}

function hydratePhonesFromStoreDetailsCache(phones) {
    (phones || []).forEach((phone) => {
        if (!phone || getEffectivePhoneStores(phone).length) return;
        const cached = getCachedPhoneStoreDetails(phone.barcode);
        if (!cached?.length) return;
        phone.stores = cached;
        phone.otherStores = cached;
    });
}

/** Drop network units that live-check confirmed have no store stock (ghosts). */
function pruneNetworkPhonesWithoutStores(phones) {
    return (phones || []).filter((phone) => {
        if (!phone) return false;
        if (getEffectivePhoneStores(phone).length) return true;
        const code = String(phone.barcode || '').trim();
        if (code && storeResolveAnsweredEmpty.has(code)) return false;
        // Still unresolved — keep until a live check answers.
        return (parseInt(phone.otherStoreCount, 10) || 0) > 0;
    });
}

function getLoosePhoneStores(phone) {
    return sanitizeStorehouseList(getLoosePhoneStoresRaw(phone));
}

function getLoosePhoneStoresRaw(phone) {
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
    const withStock = (stores) => sanitizeStorehouseList(stores).filter((s) => (parseInt(s.qty, 10) || 0) > 0);
    const local = withStock(phone?.stores || []);
    if (local.length) return local;
    const other = withStock(phone?.otherStores || []);
    if (other.length) return other;
    return withStock(getLoosePhoneStores(phone));
}

// Barcodes a source already reported on with an empty result: asking again in
// the same session only burns passes. The catalog still lists these units, just
// without a store name.
const storeResolveAnsweredEmpty = new Set();

function phoneNeedsStoreResolve(phone) {
    if (getEffectivePhoneStores(phone).length) return false;
    if (storeResolveAnsweredEmpty.has(phone?.barcode)) return false;
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
    const maxPasses = Math.max(1, Math.min(Number(options.maxPasses) || 3, 4));
    const force = !!options.force;
    if (force) {
        storeResolveAnsweredEmpty.clear();
        // Strip scraped/cached store hints so every network unit is live-checked.
        (phones || []).forEach((phone) => {
            if (!phone) return;
            if (filter && !filter(phone)) return;
            const count = parseInt(phone.otherStoreCount, 10) || 0;
            const hadStores = getEffectivePhoneStores(phone).length > 0;
            if (!hadStores && count <= 0) return;
            phone.stores = [];
            phone.otherStores = [];
            if (count <= 0) phone.otherStoreCount = 1;
        });
    } else {
        hydratePhonesFromStoreDetailsCache(phones);
    }
    const list = (phones || []).filter((p) => (!filter || filter(p)) && phoneNeedsStoreResolve(p));
    const unique = [...new Map(list.map((p) => [p.barcode, p])).values()];
    if (!unique.length) {
        onProgress?.(1, 1);
        persistPhoneStoreDetailsCache();
        if (options.persistOtherStoreCache) {
            saveOtherStoreCache(
                options.pruneMissing ? pruneNetworkPhonesWithoutStores(phones) : phones
            );
        }
        return phones;
    }

    let remaining = unique.slice();
    let done = 0;
    for (let pass = 1; remaining.length && pass <= maxPasses; pass += 1) {
        const retry = [];
        for (let i = 0; i < remaining.length; i += concurrency) {
            const batch = remaining.slice(i, i + concurrency);
            await Promise.all(batch.map(async (phone) => {
                if (!force && getEffectivePhoneStores(phone).length) {
                    done += 1;
                    onProgress?.(done, unique.length, { pass, pending: retry.length });
                    return;
                }
                try {
                    const result = await fetchStorehouseDetails(phone.barcode, {
                        attempt: pass,
                        force,
                    });
                    if (result.stores.length) {
                        phone.stores = result.stores;
                        phone.otherStores = result.stores;
                    } else if (result.answered) {
                        phone.stores = [];
                        phone.otherStores = [];
                        phone.otherStoreCount = 0;
                        clearPhoneStoreDetailsCacheEntry(phone.barcode);
                        storeResolveAnsweredEmpty.add(phone.barcode);
                    } else {
                        retry.push(phone);
                        return;
                    }
                    done += 1;
                    onProgress?.(done, unique.length, { pass, pending: retry.length });
                } catch (e) {
                    console.warn('[MMS Phone List] Could not resolve stores for', phone.barcode, e);
                    retry.push(phone);
                }
            }));
        }
        remaining = retry.filter((p) => phoneNeedsStoreResolve(p));
        if (remaining.length && pass < maxPasses) {
            await new Promise((r) => setTimeout(r, 300));
        }
    }

    persistPhoneStoreDetailsCache();
    if (options.persistOtherStoreCache) {
        const toSave = options.pruneMissing ? pruneNetworkPhonesWithoutStores(phones) : phones;
        saveOtherStoreCache(toSave);
    }
    return phones;
}

/**
 * Fetches and parses the phone list from the products page
 * First loads the initial page, then loads with pagesize parameter, then parses
 * @returns {Promise<Array<{barcode: string, name: string, model: string, grade: string, imei: string, unitsRemaining: number}>>}
 */
async function fetchPhoneList(options = {}) {
    const onProgress = typeof options?.onProgress === 'function' ? options.onProgress : () => {};
    if (!options.force) {
        const cached = loadPhoneListCache();
        if (cached?.length) {
            onProgress({ phase: 'done', ratio: 1, fromCache: true });
            return cached;
        }
    }
    return new Promise((resolve, reject) => {
        onProgress({ phase: 'init', ratio: 0.04 });
        // Step 1: Load initial page with qs=55.&recordspp=-1
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://thefixers.mymanager.gr/mymanagerservice/products_list.php?qs=55.&recordspp=-1',
            onload: function(firstResponse) {
                console.log('[MMS Phone List] First page loaded, now loading with pagesize=500');
                onProgress({ phase: 'download', ratio: 0.08, loaded: 0, total: 0 });

                // Step 2: keep qs=55. on this request. pagesize without qs reuses
                // whatever search is already in the PHPRunner session (often empty).
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: 'https://thefixers.mymanager.gr/mymanagerservice/products_list.php?qs=55.&pagesize=1000000|',
                    onprogress: function(e) {
                        if (e.lengthComputable && e.total > 0) {
                            onProgress({
                                phase: 'download',
                                ratio: e.loaded / e.total,
                                loaded: e.loaded,
                                total: e.total,
                            });
                        } else if (e.loaded > 0) {
                            onProgress({
                                phase: 'download',
                                indeterminate: true,
                                loaded: e.loaded,
                            });
                        }
                    },
                    onload: function(response) {
                try {
                    onProgress({ phase: 'parse', ratio: 0.9 });
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    detectAndCacheCurrentStoreName(doc);
                    
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
                        savePhoneListCache(phones);
                        onProgress({ phase: 'done', ratio: 1 });
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

const USED_LAPTOP_PREFIX = 'ΜΕΤΑΧΕΙΡΙΣΜΕΝΟΣ ΦΟΡΗΤΟΣ ΥΠΟΛΟΓΙΣΤΗΣ';
const USED_LAPTOP_PREFIX_ALT = 'ΜΕΤΑΧΕΙΡΙΣΜΕΝΟΣ ΦΟΡΗΤΟΣ ΗΛΕΚΤΡΟΝΙΚΟΣ ΥΠΟΛΟΓΙΣΤΗΣ';
const LAPTOP_LIST_CACHE_KEY = 'tm_laptop_list_cache_v1';
const LAPTOP_LIST_CACHE_TIMESTAMP_KEY = 'tm_laptop_list_cache_timestamp_v1';
const OTHER_STORE_LAPTOP_CACHE_KEY = 'tm_laptop_other_store_cache_v1';
const OTHER_STORE_LAPTOP_CACHE_TIMESTAMP_KEY = 'tm_laptop_other_store_cache_timestamp_v1';
const LAPTOP_CACHE_EXPIRATION_DAYS = 3;

function stripUsedLaptopPrefix(text) {
    let out = String(text || '').replace(/\s+/g, ' ').trim();
    const upper = out.toUpperCase();
    for (const prefix of [USED_LAPTOP_PREFIX_ALT, USED_LAPTOP_PREFIX]) {
        const idx = upper.indexOf(prefix);
        if (idx >= 0) {
            out = out.slice(idx + prefix.length).trim();
            break;
        }
    }
    // Truncated / variant markers
    out = out.replace(/^ΗΛΕΚΤΡΟΝΙΚΟΣ\s+ΥΠΟΛΟΓΙΣΤΗΣ\s*/i, '');
    out = out.replace(/^ΥΠΟΛΟΓΙΣΤΗΣ\s*/i, '');
    return out.trim();
}

function isUsedLaptopTitle(name) {
    const upper = String(name || '').toUpperCase();
    return upper.includes(USED_LAPTOP_PREFIX)
        || upper.includes(USED_LAPTOP_PREFIX_ALT)
        || upper.includes('ΦΟΡΗΤΟΣ ΥΠΟΛΟΓΙΣΤΗΣ')
        || upper.includes('ΦΟΡΗΤΟΣ ΗΛΕΚΤΡΟΝΙΚΟΣ ΥΠΟΛΟΓΙΣΤΗΣ')
        || upper.includes('ΜΕΤΑΧΕΙΡΙΣΜΕΝΟΣ ΦΟΡΗΤΟΣ');
}

function isUsedPhoneProductTitle(name) {
    const upper = String(name || '').toUpperCase();
    if (isUsedLaptopTitle(upper)) return false;
    return upper.includes('ΚΙΝΗΤΟ') || upper.includes('ΤΗΛΕΦΩΝΟ');
}

function isLaptopBarcode(barcode) {
    return /^(55|56)\./.test(String(barcode || '').trim());
}

const LAPTOP_BRAND_RULES = [
    { name: 'Apple', re: /\bMACBOOK\b|\bAPPLE\b|\bIMAC\b/i },
    { name: 'HP', re: /\b(?:NB\s+)?HP\b|\bHEWLETT\b|\bELITEBOOK\b|\bPROBOOK\b|\bPAVILION\b|\bZBOOK\b|\bCHROMEBOOK\b/i },
    { name: 'Dell', re: /\bDELL\b|\bLATITUDE\b|\bXPS\b|\bINSPIRON\b|\bPRECISION\b/i },
    { name: 'Lenovo', re: /\bLENOVO\b|\bTHINKPAD\b|\bTHINKBOOK\b|\bIDEAPAD\b|\bYOGA\b|\bLEGION\b/i },
    { name: 'Asus', re: /\bASUS\b|\bVIVOBOOK\b|\bZEPHYRUS\b|\bTUF\b|\bZENBOOK\b|\bROG\b/i },
    { name: 'Acer', re: /\bACER\b|\bPREDATOR\b|\bSWIFT\b|\bASPIRE\b|\bTRAVELMATE\b/i },
    { name: 'MSI', re: /\bMSI\b/i },
    { name: 'Microsoft', re: /\bSURFACE\b|\bMICROSOFT\b/i },
    { name: 'Samsung', re: /\bSAMSUNG\b|\bGALAXY\s*BOOK\b/i },
    { name: 'Huawei', re: /\bHUAWEI\b|\bMATEBOOK\b/i },
    { name: 'Xiaomi', re: /\bXIAOMI\b|\bREDMI\s*BOOK\b|\bMIPAD\b/i },
    { name: 'LG', re: /\bLG\b|\bGRAM\b/i },
    { name: 'Toshiba', re: /\bTOSHIBA\b|\bDYNABOOK\b/i },
    { name: 'Fujitsu', re: /\bFUJITSU\b|\bLIFEBOOK\b/i },
    { name: 'Gigabyte', re: /\bGIGABYTE\b|\bAORUS\b/i },
    { name: 'Razer', re: /\bRAZER\b/i },
    { name: 'Chuwi', re: /\bCHUWI\b/i },
];

function normalizeLaptopCapacity(num, unit) {
    const n = parseInt(String(num || ''), 10);
    if (!Number.isFinite(n) || n <= 0) return '';
    const u = String(unit || 'GB').toUpperCase().includes('TB') ? 'TB' : 'GB';
    return `${n}${u}`;
}

function normalizeLaptopCpuToken(raw) {
    let cpu = String(raw || '').replace(/\s+/g, ' ').trim().toUpperCase();
    if (!cpu) return '';
    // i58365U → I5-8365U
    cpu = cpu.replace(/^([IΙ][3579])(\d{3,5}[A-Z0-9]{0,4})$/i, '$1-$2');
    // Greek Ι → I
    cpu = cpu.replace(/Ι/g, 'I');
    // RYZEN3-7320U → RYZEN 3-7320U
    cpu = cpu.replace(/^RYZEN\s*([3579])\s*-?/i, 'RYZEN $1-');
    cpu = cpu.replace(/^RYZEN\s*([3579])-$/i, 'RYZEN $1');
    // R3-4450U keep as R3-4450U
    cpu = cpu.replace(/^R\s*([3579])\s*-/i, 'R$1-');
    // I5 10TH / I5 8TH / I5 6TH
    cpu = cpu.replace(/^([I][3579])\s*-?\s*(\d{1,2})\s*(?:TH|ST|ND|RD)?(?:\s*GEN)?$/i, '$1 $2TH');
    // Bare I5/I7
    cpu = cpu.replace(/^([I][3579])$/, '$1');
    // Collapse leftover double spaces/dashes
    cpu = cpu.replace(/\s*-\s*/g, '-').replace(/\s+/g, ' ').trim();
    return cpu;
}

function extractLaptopCpu(text) {
    const raw = String(text || '');
    const patterns = [
        /\b(M[1-4](?:\s*(?:PRO|MAX|ULTRA))?)\b/i,
        /\b((?:INTEL\s+)?CORE\s+ULTRA\s+[3579]\s*[- ]?\d{3,4}[A-Z]?)\b/i,
        // i5-8265U / I7-1185G7 / i5 8265U / I5-1135G7
        /\b([IiΙι][3579]\s*[- ]?\d{3,5}[A-Za-z0-9]{0,4})\b/,
        // i58365U (missing hyphen)
        /\b([IiΙι][3579]\d{3,5}[A-Za-z0-9]{0,4})\b/,
        // missing leading i: 5-10310u
        /(?:^|[^A-Za-z0-9])([3579]-\d{4,5}[A-Za-z0-9]{0,4})\b/,
        // AMD Ryzen 3-7320U / RYZEN3-7320U / R3-4450U
        /\b(RYZEN\s*(?:AI\s*)?[3579]\s*-?\s*\d{3,5}[A-Z0-9]{0,4})\b/i,
        /\b(R[3579]\s*-\s*\d{3,5}[A-Z0-9]{0,4})\b/i,
        /\b(AMD\s*R[3579]\s*-\s*\d{3,5}[A-Z0-9]{0,4})\b/i,
        // generation-only: i5 10th / i5 8th / i5-6th gen
        /\b([IiΙι][3579]\s*-?\s*\d{1,2}(?:th|st|nd|rd)?(?:\s*gen)?)\b/i,
        // bare family before specs: i5,8GB / I7/8GB / (i5,8GB
        /\b([IiΙι][3579])(?=\s*[,\/\)]|\s+\d+\s*(?:GB|TB|SSD))/i,
        /\b((?:INTEL\s+)?(?:CELERON|PENTIUM)[-\s]?[A-Z0-9]+)\b/i,
        /\b(SNAPDRAGON\s*X\s*(?:ELITE|PLUS)?[-\s]?\w*)\b/i,
    ];
    for (const re of patterns) {
        const m = raw.match(re);
        if (!m) continue;
        let token = String(m[1] || '').trim();
        // Normalize missing-i SKUs to I#
        if (/^[3579]-/.test(token)) token = `I${token}`;
        if (/^AMD\s+/i.test(token)) token = token.replace(/^AMD\s+/i, '');
        const normalized = normalizeLaptopCpuToken(token);
        if (normalized) return normalized;
    }
    return '';
}

function extractLaptopBrand(text) {
    const raw = String(text || '');
    for (const rule of LAPTOP_BRAND_RULES) {
        if (rule.re.test(raw)) return rule.name;
    }
    return '';
}

function extractLaptopRamStorage(text) {
    const raw = String(text || '');
    let ram = '';
    let storage = '';

    // 16GB/512GB | 16/256GB | 8GB/1TB | I7/8GB/1TB
    const combo = raw.match(/\b(\d{1,2})\s*(?:GB|TB)?\s*[\/,]\s*(\d{1,4})\s*(GB|TB|SSD|NVME|NVM|HDD)?\b/i);
    if (combo) {
        const left = parseInt(combo[1], 10);
        const right = parseInt(combo[2], 10);
        const rightUnit = String(combo[3] || '').toUpperCase();
        if ([4, 8, 12, 16, 24, 32, 36, 48, 64].includes(left)) {
            ram = normalizeLaptopCapacity(left, 'GB');
        }
        if (rightUnit === 'TB' || right === 1 && /TB/i.test(raw)) {
            storage = normalizeLaptopCapacity(right === 1 ? 1 : right, rightUnit === 'TB' || right <= 4 ? 'TB' : 'GB');
        } else if ([64, 128, 256, 512, 1024, 2048].includes(right) || /SSD|NVM|HDD/i.test(rightUnit)) {
            storage = normalizeLaptopCapacity(right, rightUnit === 'TB' ? 'TB' : 'GB');
        }
    }

    // Slash path: .../8GB/256SSD or .../16GB/512S or .../14.0/8GB DDR (no storage yet)
    if (!ram || !storage) {
        const path = raw.match(/(?:\/|,)\s*(\d{1,2})\s*GB\s*(?:\/|,)\s*(\d{2,4})\s*(?:GB|SSD|NVM|NVME|HDD|S)?\b/i);
        if (path) {
            if (!ram) ram = normalizeLaptopCapacity(path[1], 'GB');
            if (!storage) storage = normalizeLaptopCapacity(path[2], 'GB');
        }
    }
    // .../8GB DDR with no storage token
    if (!ram) {
        const ramOnlyPath = raw.match(/\/\s*(\d{1,2})\s*GB\b/i);
        if (ramOnlyPath) {
            const n = parseInt(ramOnlyPath[1], 10);
            if ([4, 8, 12, 16, 24, 32, 64].includes(n)) ram = normalizeLaptopCapacity(n, 'GB');
        }
    }

    // 8GB,512SSD | 8GB,256GB | 8 GB 256 GB | 8GB DDR4 256GB
    if (!ram) {
        const ramMatch = raw.match(/\b(\d{1,2})\s*(GB|TB|G)\b(?!\s*SSD)/i)
            || raw.match(/\b(\d{1,2})\s*GB\s*(?:RAM|DDR\d|ΜΝΗΜΗ)?\b/i);
        if (ramMatch) {
            const n = parseInt(ramMatch[1], 10);
            if ([4, 8, 12, 16, 24, 32, 36, 48, 64].includes(n)) {
                ram = normalizeLaptopCapacity(n, /TB/i.test(ramMatch[2] || '') ? 'TB' : 'GB');
            }
        }
    }

    // Truncated "8G" at end of title
    if (!ram) {
        const truncRam = raw.match(/\b(\d{1,2})\s*G(?:B)?\s*$/i) || raw.match(/\(\s*[^)]*?(\d{1,2})\s*G(?:B)?\s*$/i);
        if (truncRam) {
            const n = parseInt(truncRam[1], 10);
            if ([4, 8, 12, 16, 24, 32, 64].includes(n)) ram = normalizeLaptopCapacity(n, 'GB');
        }
    }

    if (!storage) {
        const storageMatch = raw.match(/\b(\d{1,4})\s*(TB)\b/i)
            || raw.match(/\b(\d{2,4})\s*(GB|G)?\s*(SSD|NVME|NVM|HDD|M\.?2)\b/i)
            || raw.match(/\b(\d{2,4})\s*SSD\b/i)
            || raw.match(/\b(\d{2,4})\s*GB\b/i);
        if (storageMatch) {
            const n = parseInt(storageMatch[1], 10);
            const unitTok = `${storageMatch[2] || ''} ${storageMatch[3] || ''}`.toUpperCase();
            if (/TB/.test(unitTok) || n === 1) {
                storage = normalizeLaptopCapacity(n <= 4 ? n : n, n <= 4 ? 'TB' : 'GB');
                if (n === 1) storage = '1TB';
            } else if ([64, 128, 256, 512, 1024, 2048].includes(n)) {
                storage = normalizeLaptopCapacity(n, 'GB');
            }
        }
    }

    // Truncated storage leftovers: "512" / "256" / "256G" after RAM mention
    if (!storage) {
        const truncStor = raw.match(/\b(?:GB|RAM|DDR\d)\s+(\d{2,4})\s*G?(?:\s|$)/i)
            || raw.match(/,\s*(\d{2,4})\s*(?:SSD|S|G)?\s*(?:,|\(|$)/i)
            || raw.match(/\b(\d{2,4})\s*(?:SSD|S)\b/i)
            || raw.match(/\b(\d{2,4})\s*G(?:B)?\s*$/i);
        if (truncStor) {
            const n = parseInt(truncStor[1], 10);
            if ([64, 128, 256, 512, 1024].includes(n)) storage = normalizeLaptopCapacity(n, 'GB');
        }
    }

    // Chromebook eMMC 64GB
    if (!storage) {
        const e = raw.match(/\b(64)\s*(?:GB|G)?\b/i);
        if (e && /CHROMEBOOK/i.test(raw)) storage = '64GB';
    }

    if (ram && storage && ram === storage) {
        const ramN = parseInt(ram, 10);
        if (ramN >= 128) {
            storage = ram;
            ram = '';
        }
    }

    // Prefer storage when left combo captured screen size etc.
    if (ram && !([4, 8, 12, 16, 24, 32, 36, 48, 64].includes(parseInt(ram, 10)))) {
        ram = '';
    }

    return { ram, storage };
}

function buildLaptopModelLine(modelText, specs) {
    let line = String(modelText || '').replace(/\s+/g, ' ').trim();
    // Normalize Greek lookalikes in model codes (Τ470 → T470)
    line = line.replace(/[Ττ]/g, 'T');
    line = line.replace(/\(?\s*(?:BB|ΒΒ)\s*[:\-]?[^)]*\)?\s*$/i, '').trim();
    line = line.replace(/\bBB\s*:\s*\(?[^)]*\)?\s*$/i, '').trim();
    line = line.replace(/\([^)]*(?:i[3579]|ryzen|celeron|pentium|ssd|gb|tb|ddr\d)[^)]*$/ig, ' ');
    line = line.replace(/\([^)]*(?:i[3579]|ryzen|celeron|pentium|ssd|gb|tb|ddr\d)[^)]*\)/ig, ' ');
    line = line.replace(/\b\d{1,2}\s*(?:GB|TB)?\s*[\/,]\s*\d{1,4}\s*(?:GB|TB|SSD|NVME|NVM|HDD)?\b/ig, ' ');
    line = line.replace(/\/\s*\d{1,2}\s*(?:GB|TB)?\s*\/\s*\d{2,4}\s*(?:GB|SSD|NVM|S)?\b/ig, ' ');
    line = line.replace(/\/\d{1,2}(?:[.,]\d+)?(?:-FHD|-HD)?/ig, ' ');
    line = line.replace(/\b\d{1,2}(?:[.,]\d+)?-FHD\b/ig, ' ');
    line = line.replace(/\bGEN\s*(\d)\b/ig, 'G$1'); // keep gen marker compact
    // Drop trailing orphan punctuation / DDR leftovers
    line = line.replace(/\bDDR\d?\b/ig, ' ');
    line = line.replace(/\s+[./-]+\s*$/g, ' ');
    line = line.replace(/^\s*[./-]+|\s*[./-]+\s*$/g, ' ');
    const keepCpuInModel = specs?.cpu && /^M[1-4]\b/i.test(specs.cpu);
    if (specs?.cpu && !keepCpuInModel) {
        const cpuRe = specs.cpu
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\s+/g, '\\s*')
            .replace(/-/g, '[-\\s]*');
        line = line.replace(new RegExp(`\\b${cpuRe}\\b`, 'ig'), ' ');
        // Also strip bare family left behind
        line = line.replace(/\b[Ii][3579]\b(?=\s*[,\/\)]|\s*$)/g, ' ');
    }
    if (specs?.ram) {
        const n = parseInt(specs.ram, 10);
        line = line.replace(new RegExp(`\\b${n}\\s*(?:GB|TB|G)\\b`, 'ig'), ' ');
    }
    if (specs?.storage) {
        const n = parseInt(specs.storage, 10);
        line = line.replace(new RegExp(`\\b${n}\\s*(?:GB|TB|G)?\\s*(?:SSD|NVME|NVM|HDD|S)?\\b`, 'ig'), ' ');
    }
    line = line.replace(/\b(?:SSD|NVME|NVM|HDD|DDR\d|FHD|TOUCH)\b/ig, ' ');
    line = line.replace(/\b\d+\s*CORE(?:\s*CPU|\s*GPU)?\b/ig, ' ');
    line = line.replace(/\bNB\b/ig, ' ');
    line = line.replace(/\bAMD\b/ig, ' ');
    line = line.replace(/\bA\d{4}\b/ig, ' '); // Apple board ids A2337
    line = line.replace(/\b20[12]\d\b/g, ' '); // year
    line = line.replace(/\b(SPACE\s*GREY|SPACE\s*GRAY|MIDNIGHT|STARLIGHT|SILVER|GOLD|BLACK|WHITE|GREY|GRAY|BLUE|RED|ROSE\s*GOLD|SPA|GOL|SIL)\b/ig, ' ');
    // Screen size only when inch marks present
    line = line.replace(/\b\d{1,2}(?:[.,]\d+)?\s*(?:''|"|′|’)\b/g, ' ');
    line = line.replace(/[\/|,]+/g, ' ').replace(/[()]+/g, ' ').replace(/\s+/g, ' ').trim();
    line = line.replace(/^APPLE\s+/i, '');
    return line || String(modelText || '').trim();
}

function parseLaptopSpecs(fullName) {
    let text = stripUsedLaptopPrefix(fullName);
    text = text.replace(/\s*Περισσότερα\s*\.?\s*\.?\s*\.?\s*$/i, '').trim();
    text = text.replace(/\(?\s*(?:BB|ΒΒ)\s*[:\-]?[^)]*\)?\s*$/i, '').trim();

    const brand = extractLaptopBrand(text);
    const cpu = extractLaptopCpu(text);
    const { ram, storage } = extractLaptopRamStorage(text);
    const modelLine = buildLaptopModelLine(text, { cpu, ram, storage });
    return { brand, cpu, ram, storage, modelLine };
}

function hydrateLaptopItem(item) {
    if (!item || typeof item !== 'object') return item;
    const source = item.name || item.model || '';
    const specs = parseLaptopSpecs(source);
    const parsed = parseLaptopName(source);
    return {
        ...item,
        name: parsed.fullName || item.name,
        model: specs.modelLine || parsed.model || item.model,
        grade: item.grade || parsed.grade || '',
        imei: item.imei || parsed.imei || '',
        brand: specs.brand || item.brand || '',
        cpu: specs.cpu || item.cpu || '',
        ram: specs.ram || item.ram || '',
        storage: specs.storage || item.storage || '',
        productKind: 'laptop',
    };
}

function parseLaptopName(fullName) {
    let model = stripUsedLaptopPrefix(fullName);
    let grade = '';
    let imei = '';
    // BB:A+ SERIAL or (BB:A+ SERIAL) or BB:(A-SERIAL
    let m = model.match(/\(?\s*(?:BB|ΒΒ)\s*[:\-]?\s*\(?\s*([A-Z+]+\+?)\s*[-\s:]+([A-Z0-9\-]+)\s*\)?\s*$/i);
    if (m) {
        grade = String(m[1] || '').toUpperCase();
        imei = String(m[2] || '').trim();
        model = model.slice(0, m.index).trim();
    } else {
        m = model.match(/\(?\s*(?:BB|ΒΒ)\s*[:\-]\s*([A-Z+]+\+?)\s*$/i);
        if (m) {
            grade = String(m[1] || '').toUpperCase();
            model = model.slice(0, m.index).trim();
        }
    }
    const specs = parseLaptopSpecs(String(fullName || ''));
    return {
        fullName: String(fullName || '').replace(/\s+/g, ' ').trim(),
        model: specs.modelLine || model || String(fullName || '').trim(),
        modelLine: specs.modelLine || model,
        brand: specs.brand,
        cpu: specs.cpu,
        ram: specs.ram,
        storage: specs.storage,
        grade,
        imei,
    };
}

function saveLaptopListCache(laptops) {
    if (!Array.isArray(laptops) || !laptops.length) return;
    GM_setValue(LAPTOP_LIST_CACHE_KEY, JSON.stringify(laptops));
    GM_setValue(LAPTOP_LIST_CACHE_TIMESTAMP_KEY, Date.now());
}

function loadLaptopListCache() {
    try {
        const ts = Number(GM_getValue(LAPTOP_LIST_CACHE_TIMESTAMP_KEY, 0)) || 0;
        if (!ts) return null;
        const ageDays = (Date.now() - ts) / (24 * 60 * 60 * 1000);
        if (ageDays > LAPTOP_CACHE_EXPIRATION_DAYS) return null;
        const parsed = JSON.parse(GM_getValue(LAPTOP_LIST_CACHE_KEY, '[]'));
        if (!Array.isArray(parsed) || !parsed.length) return null;
        const onlyLaptops = parsed
            .filter((item) => isUsedLaptopTitle(item?.name) && !isUsedPhoneProductTitle(item?.name))
            .map((item) => hydrateLaptopItem(item));
        return onlyLaptops.length ? onlyLaptops : null;
    } catch (_) {
        return null;
    }
}

function saveOtherStoreLaptopCache(laptops) {
    if (!Array.isArray(laptops) || !laptops.length) return;
    GM_setValue(OTHER_STORE_LAPTOP_CACHE_KEY, JSON.stringify(laptops));
    GM_setValue(OTHER_STORE_LAPTOP_CACHE_TIMESTAMP_KEY, Date.now());
}

function getOtherStoreLaptopCache() {
    try {
        const ts = Number(GM_getValue(OTHER_STORE_LAPTOP_CACHE_TIMESTAMP_KEY, 0)) || 0;
        if (!ts) return null;
        const ageDays = (Date.now() - ts) / (24 * 60 * 60 * 1000);
        if (ageDays > 1) return null;
        const parsed = JSON.parse(GM_getValue(OTHER_STORE_LAPTOP_CACHE_KEY, '[]'));
        if (!Array.isArray(parsed) || !parsed.length) return null;
        const onlyLaptops = parsed
            .filter((item) => isUsedLaptopTitle(item?.name) && !isUsedPhoneProductTitle(item?.name))
            .map((item) => hydrateLaptopItem(item));
        return onlyLaptops.length ? onlyLaptops : null;
    } catch (_) {
        return null;
    }
}

function pcRequestHtml(url, timeoutMs) {
    const ms = Number(timeoutMs) > 0 ? Number(timeoutMs) : 8000;
    return new Promise((resolve) => {
        const xhr = typeof GM_xmlhttpRequest === 'function' ? GM_xmlhttpRequest : null;
        if (!xhr) {
            resolve({ ok: false, text: '' });
            return;
        }
        let settled = false;
        const finish = (value) => {
            if (settled) return;
            settled = true;
            resolve(value);
        };
        let handle = null;
        const timer = setTimeout(() => {
            try { handle?.abort?.(); } catch (_) { /* ignore */ }
            finish({ ok: false, text: '' });
        }, ms + 400);
        handle = xhr({
            method: 'GET',
            url,
            timeout: ms,
            onload(res) {
                clearTimeout(timer);
                finish({
                    ok: res.status >= 200 && res.status < 300,
                    text: String(res.responseText || ''),
                    status: res.status,
                });
            },
            onerror() {
                clearTimeout(timer);
                finish({ ok: false, text: '' });
            },
            ontimeout() {
                clearTimeout(timer);
                finish({ ok: false, text: '' });
            },
        });
    });
}

function parseLaptopRowsFromDoc(doc, { requireLocalStock = true, requireOtherStock = false } = {}) {
    let table = doc.querySelector('table.rnr-c.rnr-cont.rnr-c-grid.rnr-b-grid.rnr-gridtable.hoverable')
        || doc.querySelector('table.rnr-b-grid.rnr-gridtable')
        || doc.querySelector('table.rnr-b-grid')
        || doc.querySelector('.rnr-c-grid table, table.rnr-gridtable');
    if (!table) return [];
    let rows = table.querySelectorAll('tbody tr');
    if (!rows.length) rows = table.querySelectorAll('tr');
    if (!rows.length) rows = table.querySelectorAll('tr[id^="gridRow"]');
    const laptops = [];
    rows.forEach((row, rowIndex) => {
        if (rowIndex === 0 && row.querySelector('th')) return;
        let barcodeEl = row.querySelector('span[id*="strProductID"]');
        let nameEl = row.querySelector('span[id*="strProductName"]');
        let unitsRemainingEl = row.querySelector('span[id*="iUnitsRemaining"]');
        let otherStoreEl = row.querySelector('span[id*="iUnitsRemainingOtherStoreHouses"]');
        if (!barcodeEl || !nameEl || !unitsRemainingEl || !otherStoreEl) {
            row.querySelectorAll('[id]').forEach((node) => {
                const id = (node.id || '').toLowerCase();
                if (!barcodeEl && id.includes('strproductid')) barcodeEl = node;
                if (!nameEl && id.includes('strproductname')) nameEl = node;
                if (!otherStoreEl && id.includes('iunitsremainingotherstorehouses')) otherStoreEl = node;
                if (!unitsRemainingEl && id.includes('iunitsremaining') && !id.includes('otherstorehouses')) {
                    unitsRemainingEl = node;
                }
            });
        }
        const unitsRemaining = parseInt((unitsRemainingEl?.textContent || '').trim(), 10) || 0;
        let otherStoreCount = 0;
        let otherStores = [];
        if (otherStoreEl) {
            otherStoreCount = parseInt((otherStoreEl.textContent || '').trim(), 10) || 0;
            if (otherStoreCount > 0) {
                otherStores = parseOtherStorehouses(otherStoreEl);
                if (!otherStores.length) otherStores = parseOtherStorehousesFromRow(row);
            }
        }
        if (requireLocalStock && unitsRemaining <= 0) return;
        if (requireOtherStock && otherStoreCount <= 0) return;
        if (!barcodeEl || !nameEl) return;

        let barcode = (barcodeEl.textContent || '').replace(/\s+/g, ' ').trim();
        let name = (nameEl.textContent || '').replace(/\s+/g, ' ').trim();
        name = name.replace(/\s*Περισσότερα\s*\.\.\.\s*/i, '').trim();
        if (!barcode || !name) return;
        // 55./56. also cover phones — never keep clear phone titles.
        if (isUsedPhoneProductTitle(name)) return;
        if (!isLaptopBarcode(barcode) && !isUsedLaptopTitle(name)) return;
        // Require laptop markers in the visible name (even when truncated).
        if (!isUsedLaptopTitle(name)) return;

        const parsed = parseLaptopName(name);
        const retailPrice = extractProductRetailPrice(row);
        laptops.push({
            barcode,
            name: parsed.fullName,
            model: parsed.model,
            grade: parsed.grade,
            imei: parsed.imei,
            brand: parsed.brand,
            cpu: parsed.cpu,
            ram: parsed.ram,
            storage: parsed.storage,
            unitsRemaining,
            isBuyback: isBuybackTitle(name),
            retailPrice,
            otherStoreCount,
            otherStores,
            productKind: 'laptop',
        });
    });
    return laptops;
}

// Own-store and network laptops are parsed from the same two prefix pages, so
// the parsed documents are shared for a short window.
const laptopDocCache = new Map();
const laptopDocInflight = new Map();

function invalidateLaptopDocs() {
    laptopDocCache.clear();
}

async function fetchProductListHtml(qsPrefix, onProgress) {
    const key = String(qsPrefix);
    const cached = laptopDocCache.get(key);
    if (cached && Date.now() - cached.at < PRODUCT_LIST_HTML_TTL_MS) {
        if (typeof onProgress === 'function') onProgress({ phase: 'parse', ratio: 1, qs: qsPrefix, fromCache: true });
        return cached.doc;
    }
    if (laptopDocInflight.has(key)) return laptopDocInflight.get(key);

    const job = (async () => {
        const seedUrl = `${PRODUCT_LIST_BASE}?qs=${encodeURIComponent(qsPrefix)}&recordspp=-1`;
        const pageUrl = `${PRODUCT_LIST_BASE}?pagesize=1000000|`;
        const first = await pcRequestHtml(seedUrl, 30000);
        if (!first.ok) throw new Error(`Laptop list seed failed (${qsPrefix})`);
        if (typeof onProgress === 'function') onProgress({ phase: 'download', ratio: 0.15, qs: qsPrefix });
        const second = await pcRequestHtml(pageUrl, PRODUCT_LIST_SCRAPE_TIMEOUT_MS);
        if (!second.ok) throw new Error(`Laptop list page failed (${qsPrefix})`);
        if (typeof onProgress === 'function') onProgress({ phase: 'parse', ratio: 0.55, qs: qsPrefix });
        const parser = new DOMParser();
        const doc = parser.parseFromString(second.text, 'text/html');
        try { detectAndCacheCurrentStoreName(doc); } catch (_) { /* ignore */ }
        laptopDocCache.set(key, { at: Date.now(), doc });
        return doc;
    })().finally(() => laptopDocInflight.delete(key));

    laptopDocInflight.set(key, job);
    return job;
}

async function fetchLaptopList(options = {}) {
    const onProgress = typeof options?.onProgress === 'function' ? options.onProgress : () => {};
    if (!options.force) {
        const cached = loadLaptopListCache();
        if (cached) {
            onProgress({ phase: 'done', ratio: 1, fromCache: true });
            return cached;
        }
    }
    onProgress({ phase: 'init', ratio: 0.04 });
    if (options.force) invalidateLaptopDocs();
    const prefixes = ['55.', '56.'];
    const byBarcode = new Map();
    for (let i = 0; i < prefixes.length; i += 1) {
        const qs = prefixes[i];
        const doc = await fetchProductListHtml(qs, (info) => {
            onProgress({
                ...info,
                ratio: 0.08 + ((i + (info.ratio || 0.5)) / prefixes.length) * 0.55,
            });
        });
        parseLaptopRowsFromDoc(doc, { requireLocalStock: true }).forEach((item) => {
            if (!byBarcode.has(item.barcode)) byBarcode.set(item.barcode, item);
        });
    }
    let laptops = [...byBarcode.values()];
    // Title is authoritative — 55./56. barcodes include phones too.
    laptops = laptops
        .filter((item) => isUsedLaptopTitle(item.name) && !isUsedPhoneProductTitle(item.name))
        .map((item) => hydrateLaptopItem(item));
    saveLaptopListCache(laptops);
    onProgress({ phase: 'done', ratio: 1 });
    console.log(`[MMS Phone List] Parsed ${laptops.length} used laptops`);
    try { window.restoreRunnerSessionSearch?.(`${PRODUCT_LIST_BASE}?qs=${encodeURIComponent('56.')}`); } catch (_) { /* ignore */ }
    return laptops;
}

async function fetchOtherStoreLaptops(options = {}) {
    const onProgress = typeof options?.onProgress === 'function' ? options.onProgress : () => {};
    if (!options.force) {
        const cached = getOtherStoreLaptopCache();
        if (cached) {
            onProgress({ phase: 'done', ratio: 1, fromCache: true });
            return cached;
        }
    }
    onProgress({ phase: 'init', ratio: 0.04 });
    const prefixes = ['55.', '56.'];
    const byBarcode = new Map();
    for (let i = 0; i < prefixes.length; i += 1) {
        const qs = prefixes[i];
        const doc = await fetchProductListHtml(qs, (info) => {
            onProgress({
                ...info,
                ratio: 0.08 + ((i + (info.ratio || 0.5)) / prefixes.length) * 0.55,
            });
        });
        parseLaptopRowsFromDoc(doc, { requireLocalStock: false, requireOtherStock: true }).forEach((item) => {
            if (!byBarcode.has(item.barcode)) byBarcode.set(item.barcode, item);
        });
    }
    let laptops = [...byBarcode.values()];
    laptops = laptops
        .filter((item) => isUsedLaptopTitle(item.name) && !isUsedPhoneProductTitle(item.name))
        .map((item) => hydrateLaptopItem(item));
    saveOtherStoreLaptopCache(laptops);
    onProgress({ phase: 'done', ratio: 1 });
    try { window.restoreRunnerSessionSearch?.(`${PRODUCT_LIST_BASE}?qs=${encodeURIComponent('56.')}`); } catch (_) { /* ignore */ }
    return laptops;
}

/**
 * Fetch and parse phones that are available in other storehouses (iUnitsRemainingOtherStoreHouses > 0)
 */
async function fetchOtherStorePhones(options = {}) {
    const onProgress = typeof options?.onProgress === 'function' ? options.onProgress : () => {};
    if (!options.force) {
        const cached = getOtherStoreCache();
        if (cached?.length) {
            onProgress({ phase: 'done', ratio: 1, fromCache: true });
            return cached;
        }
    }

    return new Promise((resolve, reject) => {
        const fetchWithUrl = (url, fallbackUrl) => {
            onProgress({ phase: 'init', ratio: 0.05 });
            GM_xmlhttpRequest({
                method: 'GET',
                url,
                onprogress: function(e) {
                    if (e.lengthComputable && e.total > 0) {
                        onProgress({
                            phase: 'download',
                            ratio: e.loaded / e.total,
                            loaded: e.loaded,
                            total: e.total,
                        });
                    } else if (e.loaded > 0) {
                        onProgress({
                            phase: 'download',
                            indeterminate: true,
                            loaded: e.loaded,
                        });
                    }
                },
                onload: function(response) {
                    try {
                        onProgress({ phase: 'parse', ratio: 0.9 });
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(response.responseText, 'text/html');
                        detectAndCacheCurrentStoreName(doc);

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

                            const nameUpper = name.toUpperCase();
                            const greekPhonePrefix = 'ΜΕΤΑΧΕΙΡΙΣΜΕΝΟ ΚΙΝΗΤΟ ΤΗΛΕΦΩΝΟ';
                            if (!nameUpper.includes(greekPhonePrefix)) {
                                return;
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
                        onProgress({ phase: 'done', ratio: 1 });
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

        const primaryUrl = 'https://thefixers.mymanager.gr/mymanagerservice/products_list.php?qs=55.&pagesize=1000000|';
        const fallbackUrl = 'https://thefixers.mymanager.gr/mymanagerservice/products_list.php?qs=55.&recordspp=-1&pagesize=1000000|';
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
    // Resolve display aliases so ORANGE (alias) and COSMIC ORANGE share one filter chip.
    const matched = matchPhoneColorInText(model);
    const color = resolveDisplayColorName(matched);
    if (isPhoneColorRemoved(color) || isPhoneColorRemoved(matched)) {
        phoneCatalogColorCache.set(model, '');
        return '';
    }
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
        getPhoneTags: modalHelpers.getPhoneTags || getPhoneTags,
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

const DEFAULT_PHONE_CANONICAL_MODELS = [
        'iPhone SE 2022', 'iPhone SE 2020',
        'iPhone SE (3rd gen)', 'iPhone SE (2nd gen)', 'iPhone SE',
        'iPhone 6s Plus', 'iPhone 6s', 'iPhone 6 Plus', 'iPhone 6',
        'iPhone 7 Plus', 'iPhone 7',
        'iPhone 8 Plus', 'iPhone 8',
        'iPhone XS Max', 'iPhone XS', 'iPhone XR', 'iPhone X',
        'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
        'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12 Mini', 'iPhone 12',
        'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13 Mini', 'iPhone 13',
        'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
        'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
        'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
        'iPhone 17 Pro Max', 'iPhone 17 Pro', 'iPhone 17 Plus', 'iPhone 17',
        'iPhone Air',
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
        'Samsung Galaxy Note 20 Ultra', 'Samsung Galaxy Note 20',
        'Samsung Galaxy Note 10 Plus', 'Samsung Galaxy Note 10',
        'Samsung Galaxy Note 9', 'Samsung Galaxy Note 8',
        'Samsung Galaxy Z Fold 6', 'Samsung Galaxy Z Fold 5', 'Samsung Galaxy Z Fold 4',
        'Samsung Galaxy Z Fold 3', 'Samsung Galaxy Z Fold 2',
        'Samsung Galaxy Z Flip 6', 'Samsung Galaxy Z Flip 5', 'Samsung Galaxy Z Flip 4',
        'Samsung Galaxy Z Flip 3',
        'Samsung Galaxy A73', 'Samsung Galaxy A72', 'Samsung Galaxy A71',
        'Samsung Galaxy A55', 'Samsung Galaxy A54', 'Samsung Galaxy A53', 'Samsung Galaxy A52s', 'Samsung Galaxy A52', 'Samsung Galaxy A51',
        'Samsung Galaxy A35', 'Samsung Galaxy A34', 'Samsung Galaxy A33',
        'Samsung Galaxy A25', 'Samsung Galaxy A24', 'Samsung Galaxy A23',
        'Samsung Galaxy A16', 'Samsung Galaxy A15', 'Samsung Galaxy A14', 'Samsung Galaxy A13',
        'Samsung Galaxy A06', 'Samsung Galaxy A05', 'Samsung Galaxy A04', 'Samsung Galaxy A03',
    ];

function normalizeCanonicalModelName(name) {
    return String(name || '').replace(/\s+/g, ' ').trim();
}

function getDefaultPhoneCanonicalModels() {
    return [...DEFAULT_PHONE_CANONICAL_MODELS];
}

function loadPhoneCanonicalModels() {
    try {
        const stored = GM_getValue(PHONE_CANONICAL_MODELS_KEY, null);
        if (!stored) return getDefaultPhoneCanonicalModels();
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return getDefaultPhoneCanonicalModels();
        const models = parsed.map(normalizeCanonicalModelName).filter(Boolean);
        return models.length ? models : getDefaultPhoneCanonicalModels();
    } catch (e) {
        return getDefaultPhoneCanonicalModels();
    }
}

function savePhoneCanonicalModels(models) {
    const cleaned = (models || []).map(normalizeCanonicalModelName).filter(Boolean);
    GM_setValue(PHONE_CANONICAL_MODELS_KEY, JSON.stringify(cleaned));
    rebuildCanonModelTokens(cleaned);
    extractBaseModelCacheGlobal.clear();
    if (typeof pcNotifyConfigChanged === 'function') pcNotifyConfigChanged('canonical_models');
    return cleaned;
}

function setPhoneCanonicalModels(models) {
    return savePhoneCanonicalModels(models);
}

function resetPhoneCanonicalModels() {
    GM_setValue(PHONE_CANONICAL_MODELS_KEY, null);
    rebuildCanonModelTokens(getDefaultPhoneCanonicalModels());
    extractBaseModelCacheGlobal.clear();
    if (typeof pcNotifyConfigChanged === 'function') pcNotifyConfigChanged('canonical_models');
    return getDefaultPhoneCanonicalModels();
}

function addPhoneCanonicalModel(name, index = 0) {
    const model = normalizeCanonicalModelName(name);
    if (!model) return { ok: false, error: 'invalid' };
    const models = loadPhoneCanonicalModels();
    const key = model.toLowerCase();
    if (models.some((m) => m.toLowerCase() === key)) return { ok: false, error: 'exists' };
    const at = Math.max(0, Math.min(index, models.length));
    models.splice(at, 0, model);
    savePhoneCanonicalModels(models);
    return { ok: true, models };
}

function removePhoneCanonicalModel(name) {
    const target = normalizeCanonicalModelName(name).toLowerCase();
    const models = loadPhoneCanonicalModels().filter((m) => m.toLowerCase() !== target);
    savePhoneCanonicalModels(models);
    return models;
}

function renamePhoneCanonicalModel(oldName, newName) {
    const oldKey = normalizeCanonicalModelName(oldName).toLowerCase();
    const next = normalizeCanonicalModelName(newName);
    if (!next) return { ok: false, error: 'invalid' };
    const models = loadPhoneCanonicalModels();
    const idx = models.findIndex((m) => m.toLowerCase() === oldKey);
    if (idx === -1) return { ok: false, error: 'missing' };
    if (models.some((m, i) => i !== idx && m.toLowerCase() === next.toLowerCase())) {
        return { ok: false, error: 'exists' };
    }
    models[idx] = next;
    savePhoneCanonicalModels(models);
    return { ok: true, models };
}

function movePhoneCanonicalModel(name, direction) {
    const target = normalizeCanonicalModelName(name).toLowerCase();
    const models = loadPhoneCanonicalModels();
    const idx = models.findIndex((m) => m.toLowerCase() === target);
    if (idx === -1) return models;
    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= models.length) return models;
    [models[idx], models[nextIdx]] = [models[nextIdx], models[idx]];
    savePhoneCanonicalModels(models);
    return models;
}

function normForCanonical(str) {
    return String(str || '').toUpperCase()
            .replace(/\bPROMAX\b/g, 'PRO MAX')
        .replace(/\bXSMAX\b/g, 'XS MAX')
            .replace(/\+/g, ' PLUS ')
            .replace(/[^A-Z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ').trim();
    }

let canonModelTokens = [];

function rebuildCanonModelTokens(models = loadPhoneCanonicalModels()) {
    canonModelTokens = (models || []).map((name) => ({
        name,
        tokens: normForCanonical(name).split(' ').filter(Boolean),
    }));
}

rebuildCanonModelTokens();

    function normalizeIphoneSeGeneration(base) {
    const norm = normForCanonical(base);
        if (!/\bIPHONE\b/.test(norm) || !/\bSE\b/.test(norm)) return base;
    if (/\b2022\b/.test(norm) || /\b3RD\b/.test(norm)) return 'iPhone SE 2022';
    if (/\b2020\b/.test(norm) || /\b2ND\b/.test(norm)) return 'iPhone SE 2020';
    if (/\b2016\b/.test(norm) || /\b1ST\b/.test(norm)) return 'iPhone SE';
        return base;
    }

function matchCanonicalModel(base) {
        if (!base) return base;
    const norm = normForCanonical(base);
    for (const { name, tokens } of canonModelTokens) {
        const allMatch = tokens.every((token) =>
            new RegExp('(?:^|\\s)' + token + '(?:\\s|$)').test(norm)
            );
            if (allMatch) {
                if (name === 'iPhone SE' && /\b(2020|2022|2016|2ND|3RD|1ST)\b/.test(norm)) {
                    continue;
                }
                return name;
            }
        }
        return base;
    }

const extractBaseModelCacheGlobal = new Map();

function stripModelToBaseRaw(model) {
        if (!model) return '';
        let base = model;
        
        base = base.replace(/ΜΕΤΑΧΕΙΡΙΣΜΕΝΟ\s+ΚΙΝΗΤΟ\s+ΤΗΛΕΦΩΝΟ\s*/gi, '');
        base = base.replace(/ΜΕΤΑΧΕΙΡΙΣΜΕΝΟΣ\s+ΦΟΡΗΤΟΣ\s+ΗΛΕΚΤΡΟΝΙΚΟΣ\s+ΥΠΟΛΟΓΙΣΤΗΣ\s*/gi, '');
        base = base.replace(/ΜΕΤΑΧΕΙΡΙΣΜΕΝΟΣ\s+ΦΟΡΗΤΟΣ\s+ΥΠΟΛΟΓΙΣΤΗΣ\s*/gi, '');
        base = base.replace(/\s*(BB|ΒΒ):\s*\([^)]*\)?\s*/gi, ' ');
        base = base.replace(/\s*\(BB[^)]*\)?\s*/gi, ' ');
        base = base.replace(/\s+(BB|ΒΒ):\s*$/gi, ' ');
    base = base.replace(/\b(BB|ΒΒ)\b/gi, ' ');
        base = base.replace(/\s*[–\-]?\s*[\u0045\u0395][\s\-]?SIM(\s+ONLY)?\s*/gi, ' ');
        base = base.replace(/\s*\d+\s*TB\s*/gi, ' ');
        base = base.replace(/\s*\d+\s*GB\s*/gi, ' ');
        base = base.replace(/\s*\d+\s*G(?!\w)/gi, ' ');
        
        const commonSizes = [64, 128, 256, 512, 1024, 2048];
        const allColors = getAllKnownColorsForModelFix();
        for (const size of commonSizes) {
            for (const color of allColors) {
            const regex = new RegExp('\\b' + size + '\\s+' + color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
                base = base.replace(regex, color);
            }
        base = base.replace(new RegExp('\\b' + size + '\\s+(BB|ΒΒ)\\b', 'gi'), '$1');
    }

    for (const color of getMultiWordPhoneColors()) {
        base = base.replace(new RegExp(color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ' ');
    }
    for (const color of getSingleWordPhoneColors()) {
        base = base.replace(new RegExp('\\b' + color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi'), ' ');
    }

    base = base.replace(/\b(64|128|256|512|1024|2048)\s*$/i, '');
    return base.replace(/\s+/g, ' ').trim();
}

function collectSuggestedCanonicalModels(...phoneLists) {
    const suggestions = new Set();
    const known = new Set(loadPhoneCanonicalModels().map((m) => m.toLowerCase()));
    phoneLists.flat().forEach((phone) => {
        const raw = phone?.model || phone?.name || '';
        if (!raw) return;
        const stripped = stripModelToBaseRaw(raw);
        const normalized = normalizeIphoneSeGeneration(stripped);
        const matched = matchCanonicalModel(normalized);
        const candidate = normalizeCanonicalModelName(matched);
        if (!candidate || candidate.length < 4) return;
        if (known.has(candidate.toLowerCase())) return;
        if (matched === normalized && /iphone|samsung|galaxy|pixel|xiaomi|huawei|oneplus|oppo|redmi|poco/i.test(candidate)) {
            suggestions.add(candidate);
        }
    });
    return [...suggestions].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

function extractBaseModel(model) {
    if (!model) return '';
    if (extractBaseModelCacheGlobal.has(model)) return extractBaseModelCacheGlobal.get(model);

    let base = stripModelToBaseRaw(model);
    base = normalizeIphoneSeGeneration(base);
    base = matchCanonicalModel(base);

    extractBaseModelCacheGlobal.set(model, base);
        return base;
    }

/**
 * Opens the store locator (model → store availability).
 */
async function showPhoneListModal(options = {}) {
    if (document.querySelector('.tm-modal-overlay, .tm-sl-overlay')) return;
    if (typeof window.showStoreLocatorModal === 'function') {
        return window.showStoreLocatorModal(options);
    }
    console.error('[MMS Phone List] Store locator module not loaded');
}

async function showLaptopCatalogModal() {
    if (window.config?.laptopCatalogEnabled === false) return;
    return showPhoneListModal({ category: 'laptops' });
}

// ===================================================================
// === PHONE CATALOG SERVER SYNC (annotations + shared stock snapshots)
// Collections: phone_catalog_config, phone_tags (PocketBase)
// Stock snapshots share phone_list / other_store_phones (chunked). Notes use kind unit_note.
// ===================================================================
const PC_PB_BASE = 'https://mngerchat.littlejol.mywire.org';
const PC_CONFIG_COLL = 'phone_catalog_config';
const PC_TAGS_COLL = 'phone_tags';
const PC_MIGRATED_KEY = 'tm_pc_migrated_v1';
const PC_PENDING_CONFIG_KEY = 'tm_pc_pending_config_v1';
const PC_PENDING_TAGS_KEY = 'tm_pc_pending_tags_v1';
const PC_PENDING_NOTES_KEY = 'tm_pc_pending_notes_v1';
/** Shared network-wide catalog annotations + stock snapshots. */
const PC_NETWORK_STORE_KEY = '*';
const PC_FLUSH_MS = 1800;
const PC_STOCK_CHUNK_CHARS = 320000;
const PC_STOCK_KINDS = new Set(['phone_list', 'other_store_phones']);

let pcApplyingServer = false;
let pcServerUnsupported = false;
let pcHintShown = false;
let pcFlushTimer = null;
let pcBusy = false;
let pcPendingKinds = new Set();
let pcPendingBarcodes = new Set();
let pcPendingNotes = new Set();
let pcInitPromise = null;

function pcUseDatabase() {
    try {
        if (typeof window.suiteUseDatabase === 'function') return !!window.suiteUseDatabase();
    } catch (_) { /* ignore */ }
    try {
        const v = GM_getValue('suiteUseDatabase', null);
        if (v === null || typeof v === 'undefined') {
            return GM_getValue('orderHistoryUseDatabase', true) !== false;
        }
        return v !== false;
    } catch (_) {
        return true;
    }
}

function pcHint(msg) {
    if (pcHintShown) return;
    pcHintShown = true;
    console.warn('[MMS Phone Catalog]', msg);
    try {
        if (typeof window.showNegativeMessage === 'function') window.showNegativeMessage(msg);
    } catch (_) { /* ignore */ }
}

function pcDisplayName() {
    try {
        if (typeof window.MMS_PROFILES?.getLoggedInDisplayName === 'function') {
            const n = String(window.MMS_PROFILES.getLoggedInDisplayName({ fallback: null }) || '').trim();
            if (n) return n.slice(0, 64);
        }
    } catch (_) { /* ignore */ }
    const el = document.querySelector('#login_block1 b, .rnr-b-loggedas b');
    if (el) {
        const n = String(el.textContent || '').replace(/^.*ως\s+/i, '').trim();
        if (n) return n.slice(0, 64);
    }
    return 'Τεχνικός';
}

function pcRequestJson({ method, url, headers, data, timeout }) {
    return new Promise((resolve) => {
        const xhr = (typeof GM_xmlhttpRequest === 'function')
            ? GM_xmlhttpRequest
            : (typeof GM !== 'undefined' && GM.xmlHttpRequest ? GM.xmlHttpRequest : null);
        if (!xhr) {
            resolve({ status: 0, body: null, raw: 'no xhr' });
            return;
        }
        xhr({
            method: method || 'GET',
            url,
            headers: headers || {},
            data: data || undefined,
            timeout: timeout || 20000,
            onload(res) {
                let body = null;
                const raw = String(res.responseText || '');
                try { body = raw ? JSON.parse(raw) : null; } catch (_) { body = null; }
                resolve({ status: res.status, body, raw });
            },
            onerror() { resolve({ status: 0, body: null, raw: 'network' }); },
            ontimeout() { resolve({ status: 0, body: null, raw: 'timeout' }); },
        });
    });
}

async function pcEnsureAuthToken() {
    if (typeof window.ensureMymanPocketBaseAuth === 'function') {
        return window.ensureMymanPocketBaseAuth(window.STORAGE_KEYS);
    }
    if (typeof window.ensureOfficeChatAuthToken === 'function') {
        return window.ensureOfficeChatAuthToken(window.STORAGE_KEYS);
    }
    throw new Error('PocketBase auth helper missing');
}

function pcLoadPendingSet(key) {
    try {
        const raw = GM_getValue(key, '[]');
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
    } catch (_) {
        return new Set();
    }
}

function pcSavePendingSet(key, set) {
    try {
        GM_setValue(key, JSON.stringify([...set]));
    } catch (_) { /* ignore */ }
}

function pcRestorePendingQueues() {
    pcLoadPendingSet(PC_PENDING_CONFIG_KEY).forEach((k) => pcPendingKinds.add(k));
    pcLoadPendingSet(PC_PENDING_TAGS_KEY).forEach((b) => pcPendingBarcodes.add(b));
    pcLoadPendingSet(PC_PENDING_NOTES_KEY).forEach((b) => pcPendingNotes.add(b));
}

function pcPersistPendingQueues() {
    pcSavePendingSet(PC_PENDING_CONFIG_KEY, pcPendingKinds);
    pcSavePendingSet(PC_PENDING_TAGS_KEY, pcPendingBarcodes);
    pcSavePendingSet(PC_PENDING_NOTES_KEY, pcPendingNotes);
}

function pcScheduleFlush(delayMs) {
    if (!pcUseDatabase() || pcServerUnsupported || pcApplyingServer) return;
    if (pcFlushTimer) clearTimeout(pcFlushTimer);
    pcFlushTimer = setTimeout(() => {
        pcFlushTimer = null;
        pcFlushPending().catch((err) => console.warn('[MMS Phone Catalog] flush failed', err));
    }, delayMs == null ? PC_FLUSH_MS : delayMs);
}

function pcNotifyConfigChanged(kind) {
    if (pcApplyingServer || !pcUseDatabase() || pcServerUnsupported) return;
    if (!kind) return;
    pcPendingKinds.add(String(kind));
    pcPersistPendingQueues();
    const urgent = PC_STOCK_KINDS.has(String(kind)) || kind === 'list_refresh';
    pcScheduleFlush(urgent ? 0 : undefined);
}

function pcNotifyTagsChanged(tagsMap) {
    if (pcApplyingServer || !pcUseDatabase() || pcServerUnsupported) return;
    const map = tagsMap && typeof tagsMap === 'object' ? tagsMap : loadPhoneTags();
    Object.keys(map).forEach((barcode) => {
        const code = String(barcode || '').trim();
        if (code) pcPendingBarcodes.add(code);
    });
    // Always flush full map barcodes that exist; also re-queue known pending ones
    pcPersistPendingQueues();
    pcScheduleFlush();
}

function pcNotifyNoteChanged(barcode) {
    if (pcApplyingServer || !pcUseDatabase() || pcServerUnsupported) return;
    const code = String(barcode || '').trim();
    if (!code) return;
    pcPendingNotes.add(code);
    pcPersistPendingQueues();
    pcScheduleFlush(0);
}

function pcReadLocalConfigPayload(kind) {
    switch (kind) {
        case 'colors':
            try {
                const raw = GM_getValue(PHONE_COLORS_STORAGE_KEY, null);
                return raw ? JSON.parse(raw) : {};
            } catch (_) { return {}; }
        case 'color_aliases':
            return loadColorDisplayAliases();
        case 'colors_removed':
            return [...loadRemovedPhoneColors()];
        case 'tag_definitions':
            return loadTagDefinitions();
        case 'store_rules':
            return loadPhoneStoreRules();
        case 'canonical_models':
            return loadPhoneCanonicalModels();
        case 'store_addresses':
            return loadStoreAddresses();
        case 'list_refresh':
            return loadPhoneListRefreshMeta() || { at: getPhoneListCacheTimestamp() || 0, by: '' };
        case 'phone_list': {
            const list = loadPhoneListCache();
            return Array.isArray(list) && list.length ? buildPhoneListSnapshot(list) : null;
        }
        case 'other_store_phones': {
            const list = getOtherStoreCache({ ignoreExpiry: true });
            if (!Array.isArray(list) || !list.length) return null;
            const meta = loadPhoneListRefreshMeta();
            // Keep phone-list scrape time/actor for shared stock — not the other-store
            // cache write time (that updates on every network warm).
            return {
                v: 2,
                phones: list,
                refreshedAt: Number(meta?.at) || Number(GM_getValue(OTHER_STORE_CACHE_TIMESTAMP_KEY, 0)) || Date.now(),
                refreshedBy: String(meta?.by || '').trim().slice(0, 64),
            };
        }
        default:
            return null;
    }
}

function pcApplyConfigPayload(kind, payload, recordHint) {
    pcApplyingServer = true;
    try {
        if (kind === 'colors' && payload && typeof payload === 'object') {
            GM_setValue(PHONE_COLORS_STORAGE_KEY, JSON.stringify(payload));
        } else if (kind === 'color_aliases' && payload && typeof payload === 'object') {
            GM_setValue(PHONE_COLOR_ALIASES_KEY, JSON.stringify(payload));
        } else if (kind === 'colors_removed' && Array.isArray(payload)) {
            GM_setValue(PHONE_COLORS_REMOVED_KEY, JSON.stringify(payload));
        } else if (kind === 'tag_definitions' && payload && typeof payload === 'object') {
            GM_setValue(PHONE_TAG_DEFINITIONS_KEY, JSON.stringify(payload));
        } else if (kind === 'store_rules' && payload && typeof payload === 'object') {
            GM_setValue(PHONE_STORE_RULES_KEY, JSON.stringify(payload));
        } else if (kind === 'canonical_models' && Array.isArray(payload)) {
            GM_setValue(PHONE_CANONICAL_MODELS_KEY, JSON.stringify(payload));
            try {
                rebuildCanonModelTokens(payload);
                extractBaseModelCacheGlobal.clear();
            } catch (_) { /* ignore */ }
        } else if (kind === 'store_addresses' && payload && typeof payload === 'object') {
            GM_setValue(STORE_ADDRESSES_KEY, JSON.stringify(payload));
        } else if (kind === 'list_refresh' && payload && typeof payload === 'object') {
            const at = Number(payload.at) || 0;
            const by = String(payload.by || '').trim().slice(0, 64);
            if (at || by) {
                GM_setValue(PHONE_LIST_REFRESH_META_KEY, JSON.stringify({ at, by }));
            }
        } else if (kind === 'phone_list') {
            const snapshot = parsePhoneListSnapshot(payload, recordHint);
            // Keep DB `list_refresh` as scrape actor/time; stock pull only updates phones.
            if (snapshot) applyPhoneListSnapshot(snapshot, { updateRefreshMeta: false });
        } else if (kind === 'other_store_phones') {
            const snapshot = parsePhoneListSnapshot(payload, recordHint);
            if (snapshot?.phones?.length) {
                GM_setValue(OTHER_STORE_CACHE_KEY, JSON.stringify(snapshot.phones));
                const otherTs = Number(snapshot.refreshedAt)
                    || Number(loadPhoneListRefreshMeta()?.at)
                    || Number(GM_getValue(OTHER_STORE_CACHE_TIMESTAMP_KEY, 0))
                    || 0;
                if (otherTs > 0) {
                    GM_setValue(OTHER_STORE_CACHE_TIMESTAMP_KEY, otherTs);
                }
            }
        }
    } finally {
        pcApplyingServer = false;
    }
}

function pcParsePayload(raw) {
    if (raw == null) return null;
    if (typeof raw === 'object') return raw;
    try { return JSON.parse(String(raw)); } catch (_) { return null; }
}

async function pcUpsertConfig(token, kind, payload, extraKey) {
    const base = PC_PB_BASE.replace(/\/$/, '');
    const storeKey = PC_NETWORK_STORE_KEY;
    const extra = String(extraKey || '').trim();
    const dedupeKey = (extra
        ? `${storeKey}|${kind}|${extra}`
        : `${storeKey}|${kind}`).slice(0, 128);
    const headers = { Authorization: token, 'Content-Type': 'application/json' };
    const filter = encodeURIComponent(`dedupeKey="${dedupeKey}"`);
    const listed = await pcRequestJson({
        method: 'GET',
        url: `${base}/api/collections/${PC_CONFIG_COLL}/records?page=1&perPage=1&filter=${filter}`,
        headers: { Authorization: token },
        timeout: 15000,
    });
    const blob = `${JSON.stringify(listed.body || {})}\n${listed.raw || ''}`;
    if (listed.status === 404 || /missing collection|unknown collection|didn't find the collection/i.test(blob)) {
        pcServerUnsupported = true;
        pcHint('Phone catalog: δημιούργησε collection phone_catalog_config στο PocketBase');
        return { ok: false, unsupported: true };
    }
    if (listed.status === 403 || listed.status === 401) {
        pcHint('Phone catalog: ξεκλείδωσε List/Create/Update στο phone_catalog_config');
        return { ok: false, status: listed.status };
    }
    const record = {
        kind: String(kind).slice(0, 64),
        storeKey,
        dedupeKey,
        payload: typeof payload === 'string' ? payload : JSON.stringify(payload ?? null),
        updatedAt: new Date().toISOString(),
        updatedBy: pcDisplayName(),
    };
    const existingId = listed.body?.items?.[0]?.id;
    if (existingId) {
        const updated = await pcRequestJson({
            method: 'PATCH',
            url: `${base}/api/collections/${PC_CONFIG_COLL}/records/${encodeURIComponent(existingId)}`,
            headers,
            data: JSON.stringify(record),
            timeout: 30000,
        });
        return { ok: updated.status >= 200 && updated.status < 300, id: existingId, status: updated.status };
    }
    const created = await pcRequestJson({
        method: 'POST',
        url: `${base}/api/collections/${PC_CONFIG_COLL}/records`,
        headers,
        data: JSON.stringify(record),
        timeout: 30000,
    });
    if (created.status >= 200 && created.status < 300) return { ok: true, id: created.body?.id };
    if (/unique|duplicate/i.test(JSON.stringify(created.body || {}))) {
        return pcUpsertConfig(token, kind, payload, extraKey);
    }
    return { ok: false, status: created.status, body: created.body };
}

function pcStockKindBase(kind) {
    const k = String(kind || '').trim();
    if (k === 'phone_list' || k.startsWith('phone_list_')) return 'phone_list';
    if (k === 'other_store_phones' || k.startsWith('other_store_phones_')) return 'other_store_phones';
    return '';
}

function pcStockChunkIndex(kind, base) {
    if (kind === base) return 0;
    if (!kind.startsWith(`${base}_`)) return -1;
    const n = Number(kind.slice(base.length + 1));
    return Number.isFinite(n) ? n : -1;
}

function pcAssembleStockRecords(recs) {
    if (!Array.isArray(recs) || !recs.length) return null;
    const chunks = [];
    let totalHint = 0;
    let refreshedAt = 0;
    let refreshedBy = '';
    recs.forEach((rec) => {
        const kind = String(rec.kind || '').trim();
        const base = pcStockKindBase(kind);
        if (!base) return;
        const payload = pcParsePayload(rec.payload);
        if (payload == null) return;
        if (kind === base && Array.isArray(payload)) {
            chunks[0] = payload;
            totalHint = 1;
            return;
        }
        const phones = Array.isArray(payload.phones) ? payload.phones : [];
        const isLegacyBlob = kind === base && payload.chunk == null && payload.v !== 2;
        const idx = isLegacyBlob
            ? 0
            : (payload.chunk != null ? Number(payload.chunk) : pcStockChunkIndex(kind, base));
        if (!Number.isFinite(idx) || idx < 0) return;
        chunks[idx] = phones;
        if (payload.total != null) totalHint = Number(payload.total) || totalHint;
        if (isLegacyBlob) totalHint = 1;
        // Only scrape fields from the payload — ignore PocketBase record updatedAt/By
        // (those are write times, not MyManager scrape times).
        if (Number(payload.refreshedAt) > 0) {
            refreshedAt = Number(payload.refreshedAt);
        }
        if (payload.refreshedBy) {
            refreshedBy = String(payload.refreshedBy).trim();
        }
    });
    const total = totalHint || chunks.filter(Boolean).length;
    const phones = [];
    for (let i = 0; i < total; i += 1) {
        if (Array.isArray(chunks[i])) phones.push(...chunks[i]);
    }
    if (!phones.length) return null;
    return { v: 2, phones, refreshedAt, refreshedBy };
}

async function pcUpsertChunkedStock(token, kind, payload) {
    const rawPhones = Array.isArray(payload) ? payload : (payload?.phones || []);
    const phones = rawPhones.map(compactPhoneForSnapshot).filter(Boolean);
    const refreshedAt = Number(payload?.refreshedAt) || Date.now();
    const refreshedBy = String(payload?.refreshedBy || '').trim().slice(0, 64);
    const buckets = [];
    let bucket = [];
    let bucketChars = 0;
    phones.forEach((phone) => {
        const chars = JSON.stringify(phone).length + 1;
        if (bucket.length && bucketChars + chars >= PC_STOCK_CHUNK_CHARS) {
            buckets.push(bucket);
            bucket = [];
            bucketChars = 0;
        }
        bucket.push(phone);
        bucketChars += chars;
    });
    if (bucket.length) buckets.push(bucket);
    if (!buckets.length) buckets.push([]);
    const total = buckets.length;
    let last = { ok: true };
    for (let i = 0; i < total; i += 1) {
        const chunkKind = i === 0 ? kind : `${kind}_${i}`;
        last = await pcUpsertConfig(token, chunkKind, {
            v: 2,
            chunk: i,
            total,
            refreshedAt,
            refreshedBy,
            phones: buckets[i],
        });
        if (!last.ok) return last;
    }
    return { ok: true, chunks: total };
}

async function pcUpsertTag(token, barcode, tags) {
    const base = PC_PB_BASE.replace(/\/$/, '');
    const storeKey = PC_NETWORK_STORE_KEY;
    const code = String(barcode || '').trim().slice(0, 64);
    if (!code) return { ok: false };
    const dedupeKey = `${storeKey}|${code}`.slice(0, 128);
    const headers = { Authorization: token, 'Content-Type': 'application/json' };
    const filter = encodeURIComponent(`dedupeKey="${dedupeKey}"`);
    const listed = await pcRequestJson({
        method: 'GET',
        url: `${base}/api/collections/${PC_TAGS_COLL}/records?page=1&perPage=1&filter=${filter}`,
        headers: { Authorization: token },
        timeout: 15000,
    });
    const blob = `${JSON.stringify(listed.body || {})}\n${listed.raw || ''}`;
    if (listed.status === 404 || /missing collection|unknown collection|didn't find the collection/i.test(blob)) {
        pcServerUnsupported = true;
        pcHint('Phone catalog: δημιούργησε collection phone_tags στο PocketBase');
        return { ok: false, unsupported: true };
    }
    if (listed.status === 403 || listed.status === 401) {
        pcHint('Phone catalog: ξεκλείδωσε List/Create/Update στο phone_tags');
        return { ok: false, status: listed.status };
    }
    const tagList = Array.isArray(tags) ? tags.map(normalizeTagKey).filter(Boolean) : [];
    const record = {
        barcode: code,
        storeKey,
        dedupeKey,
        tags: JSON.stringify(tagList),
        updatedAt: new Date().toISOString(),
        updatedBy: pcDisplayName(),
    };
    const existingId = listed.body?.items?.[0]?.id;
    if (existingId) {
        const updated = await pcRequestJson({
            method: 'PATCH',
            url: `${base}/api/collections/${PC_TAGS_COLL}/records/${encodeURIComponent(existingId)}`,
            headers,
            data: JSON.stringify(record),
            timeout: 15000,
        });
        return { ok: updated.status >= 200 && updated.status < 300, id: existingId };
    }
    const created = await pcRequestJson({
        method: 'POST',
        url: `${base}/api/collections/${PC_TAGS_COLL}/records`,
        headers,
        data: JSON.stringify(record),
        timeout: 15000,
    });
    if (created.status >= 200 && created.status < 300) return { ok: true, id: created.body?.id };
    if (/unique|duplicate/i.test(JSON.stringify(created.body || {}))) {
        return pcUpsertTag(token, barcode, tags);
    }
    return { ok: false, status: created.status };
}

async function pcFlushPending() {
    if (!pcUseDatabase() || pcServerUnsupported || pcBusy) return { ok: false, busy: true };
    pcRestorePendingQueues();
    if (!pcPendingKinds.size && !pcPendingBarcodes.size && !pcPendingNotes.size) {
        return { ok: true, empty: true };
    }
    pcBusy = true;
    try {
        const token = await pcEnsureAuthToken();
        const kinds = [...pcPendingKinds];
        for (const kind of kinds) {
            if (String(kind).startsWith('phone_list_') || String(kind).startsWith('other_store_phones_')) {
                pcPendingKinds.delete(kind);
                continue;
            }
            const payload = pcReadLocalConfigPayload(kind);
            if (payload == null) {
                pcPendingKinds.delete(kind);
                continue;
            }
            const res = PC_STOCK_KINDS.has(kind)
                ? await pcUpsertChunkedStock(token, kind, payload)
                : await pcUpsertConfig(token, kind, payload);
            if (res.unsupported) break;
            if (res.ok) pcPendingKinds.delete(kind);
        }
        if (!pcServerUnsupported) {
            const allTags = loadPhoneTags();
            const barcodes = [...pcPendingBarcodes];
            for (const barcode of barcodes) {
                const tags = Array.isArray(allTags[barcode]) ? allTags[barcode] : [];
                const res = await pcUpsertTag(token, barcode, tags);
                if (res.unsupported) break;
                if (res.ok) pcPendingBarcodes.delete(barcode);
            }
        }
        if (!pcServerUnsupported) {
            const allNotes = loadPhoneUnitNotes();
            const barcodes = [...pcPendingNotes];
            for (const barcode of barcodes) {
                const rec = allNotes[barcode];
                const payload = {
                    barcode,
                    text: normalizeUnitNoteText(rec?.text || ''),
                    by: String(rec?.by || '').trim().slice(0, 64),
                    at: Number(rec?.at) || Date.now(),
                };
                const res = await pcUpsertConfig(token, 'unit_note', payload, barcode);
                if (res.unsupported) break;
                if (res.ok) pcPendingNotes.delete(barcode);
            }
        }
        pcPersistPendingQueues();
        return { ok: true };
    } catch (err) {
        console.warn('[MMS Phone Catalog] flush error', err);
        return { ok: false, error: err };
    } finally {
        pcBusy = false;
    }
}

async function pcPullConfigs(token) {
    const base = PC_PB_BASE.replace(/\/$/, '');
    const filter = encodeURIComponent(`storeKey="${PC_NETWORK_STORE_KEY}"`);
    const items = [];
    let page = 1;
    for (;;) {
        const listed = await pcRequestJson({
            method: 'GET',
            url: `${base}/api/collections/${PC_CONFIG_COLL}/records?page=${page}&perPage=200&filter=${filter}`,
            headers: { Authorization: token },
            timeout: 20000,
        });
        const blob = `${JSON.stringify(listed.body || {})}\n${listed.raw || ''}`;
        if (listed.status === 404 || /missing collection|unknown collection|didn't find the collection/i.test(blob)) {
            pcServerUnsupported = true;
            pcHint('Phone catalog: δημιούργησε collection phone_catalog_config στο PocketBase');
            return { ok: false, unsupported: true };
        }
        if (listed.status < 200 || listed.status >= 300) {
            return { ok: false, status: listed.status };
        }
        const pageItems = Array.isArray(listed.body?.items) ? listed.body.items : [];
        items.push(...pageItems);
        const totalPages = Number(listed.body?.totalPages || 1);
        if (page >= totalPages || !pageItems.length) break;
        page += 1;
        if (page > 80) break;
    }

    const stockByBase = { phone_list: [], other_store_phones: [] };
    const noteMap = {};
    let notesFound = false;
    const refreshRecs = [];
    items.forEach((rec) => {
        const kind = String(rec.kind || '').trim();
        const payload = pcParsePayload(rec.payload);
        if (kind === 'unit_note') {
            notesFound = true;
            const code = String(payload?.barcode || rec.dedupeKey || '').replace(/^\*\|unit_note\|/, '').trim();
            if (!code) return;
            const text = normalizeUnitNoteText(payload?.text || '');
            if (!text) return;
            noteMap[code] = {
                text,
                by: String(payload?.by || rec.updatedBy || '').trim().slice(0, 64),
                at: Number(payload?.at) || (rec.updatedAt ? Date.parse(rec.updatedAt) : 0) || 0,
            };
            return;
        }
        if (kind === 'list_refresh') {
            refreshRecs.push(rec);
            return;
        }
        const stockBase = pcStockKindBase(kind);
        if (stockBase) {
            stockByBase[stockBase].push(rec);
            return;
        }
        if (kind && payload != null) pcApplyConfigPayload(kind, payload, rec);
    });
    // Apply stock first, then authoritative scrape meta from DB `list_refresh`
    // so phone_list payload fields cannot overwrite who scraped / when.
    Object.keys(stockByBase).forEach((baseKind) => {
        const snapshot = pcAssembleStockRecords(stockByBase[baseKind]);
        if (snapshot) pcApplyConfigPayload(baseKind, snapshot, stockByBase[baseKind][0]);
    });
    refreshRecs.forEach((rec) => {
        const payload = pcParsePayload(rec.payload);
        if (payload != null) pcApplyConfigPayload('list_refresh', payload, rec);
    });
    if (notesFound) {
        const next = { ...noteMap };
        const local = loadPhoneUnitNotes();
        pcPendingNotes.forEach((code) => {
            if (local[code] && normalizeUnitNoteText(local[code].text)) next[code] = local[code];
            else delete next[code];
        });
        pcApplyingServer = true;
        try {
            savePhoneUnitNotes(next);
        } finally {
            pcApplyingServer = false;
        }
    }
    return { ok: true, count: items.length };
}

async function pcPullTags(token) {
    const base = PC_PB_BASE.replace(/\/$/, '');
    const filter = encodeURIComponent(`storeKey="${PC_NETWORK_STORE_KEY}"`);
    let page = 1;
    const merged = {};
    for (;;) {
        const listed = await pcRequestJson({
            method: 'GET',
            url: `${base}/api/collections/${PC_TAGS_COLL}/records?page=${page}&perPage=200&filter=${filter}`,
            headers: { Authorization: token },
            timeout: 20000,
        });
        const blob = `${JSON.stringify(listed.body || {})}\n${listed.raw || ''}`;
        if (listed.status === 404 || /missing collection|unknown collection|didn't find the collection/i.test(blob)) {
            pcServerUnsupported = true;
            pcHint('Phone catalog: δημιούργησε collection phone_tags στο PocketBase');
            return { ok: false, unsupported: true };
        }
        if (listed.status < 200 || listed.status >= 300) {
            return { ok: false, status: listed.status };
        }
        const items = Array.isArray(listed.body?.items) ? listed.body.items : [];
        items.forEach((rec) => {
            const code = String(rec.barcode || '').trim();
            if (!code) return;
            let tags = pcParsePayload(rec.tags);
            if (!Array.isArray(tags)) {
                try { tags = JSON.parse(String(rec.tags || '[]')); } catch (_) { tags = []; }
            }
            merged[code] = (Array.isArray(tags) ? tags : []).map(normalizeTagKey).filter(Boolean);
        });
        const totalPages = Number(listed.body?.totalPages || 1);
        if (page >= totalPages || !items.length) break;
        page += 1;
        if (page > 50) break;
    }
    pcApplyingServer = true;
    try {
        GM_setValue(PHONE_TAGS_STORAGE_KEY, JSON.stringify(merged));
    } finally {
        pcApplyingServer = false;
    }
    return { ok: true, count: Object.keys(merged).length };
}

async function migratePhoneCatalogToServerOnce({ force = false } = {}) {
    if (!pcUseDatabase()) return { ok: true, skipped: true, reason: 'local-mode' };
    if (pcServerUnsupported) return { ok: false, reason: 'unsupported' };
    let migrated = false;
    try {
        migrated = !!GM_getValue(PC_MIGRATED_KEY, false);
    } catch (_) { migrated = false; }
    if (migrated && !force) return { ok: true, skipped: true };

    try {
        const token = await pcEnsureAuthToken();
        // If server already has shared catalog config, adopt it — do not clobber with local defaults.
        const pulled = await pcPullConfigs(token);
        if (pulled.unsupported) return { ok: false, unsupported: true };
        if (pulled.ok && Number(pulled.count || 0) > 0) {
            await pcPullTags(token);
            GM_setValue(PC_MIGRATED_KEY, Date.now());
            console.log(`[MMS Phone Catalog] adopted server annotations (${pulled.count} configs)`);
            return { ok: true, adopted: true, count: pulled.count };
        }

        const kinds = [
            'colors', 'color_aliases', 'colors_removed',
            'tag_definitions', 'store_rules', 'canonical_models', 'store_addresses',
            'list_refresh', 'phone_list', 'other_store_phones',
        ];
        let uploaded = 0;
        for (const kind of kinds) {
            const payload = pcReadLocalConfigPayload(kind);
            if (payload == null) continue;
            const res = PC_STOCK_KINDS.has(kind)
                ? await pcUpsertChunkedStock(token, kind, payload)
                : await pcUpsertConfig(token, kind, payload);
            if (res.unsupported) return { ok: false, unsupported: true };
            if (res.ok) uploaded += 1;
        }
        const allTags = loadPhoneTags();
        const barcodes = Object.keys(allTags);
        for (const barcode of barcodes) {
            const res = await pcUpsertTag(token, barcode, allTags[barcode]);
            if (res.unsupported) return { ok: false, unsupported: true };
            if (res.ok) uploaded += 1;
        }
        const allNotes = loadPhoneUnitNotes();
        for (const barcode of Object.keys(allNotes)) {
            const rec = allNotes[barcode];
            const text = normalizeUnitNoteText(rec?.text || '');
            if (!text) continue;
            const res = await pcUpsertConfig(token, 'unit_note', {
                barcode,
                text,
                by: String(rec?.by || '').trim().slice(0, 64),
                at: Number(rec?.at) || Date.now(),
            }, barcode);
            if (res.unsupported) return { ok: false, unsupported: true };
            if (res.ok) uploaded += 1;
        }
        GM_setValue(PC_MIGRATED_KEY, Date.now());
        console.log(`[MMS Phone Catalog] migrated local annotations → server (${uploaded} upserts)`);
        return { ok: true, uploaded };
    } catch (err) {
        console.warn('[MMS Phone Catalog] migration failed', err);
        return { ok: false, error: err };
    }
}

async function initPhoneCatalogServerSync() {
    if (pcInitPromise) return pcInitPromise;
    pcInitPromise = (async () => {
        if (!pcUseDatabase()) {
            console.log('[MMS Phone Catalog] server sync off (local mode)');
            return;
        }
        pcRestorePendingQueues();
        try {
            await migratePhoneCatalogToServerOnce();
            if (pcServerUnsupported) return;
            const token = await pcEnsureAuthToken();
            await pcPullConfigs(token);
            await pcPullTags(token);
            if (pcPendingKinds.size || pcPendingBarcodes.size || pcPendingNotes.size) {
                pcScheduleFlush(600);
            }
            console.log('[MMS Phone Catalog] server sync ready');
        } catch (err) {
            console.warn('[MMS Phone Catalog] init sync failed — staying local cache', err);
        }
    })();
    return pcInitPromise;
}

/**
 * Open the phone catalog from stored data (PocketBase when enabled, else local cache).
 * Does not scrape MyManager — use refresh in the panel for a live fetch.
 */
async function loadPhoneCatalogFromDatabase() {
    if (pcUseDatabase() && !pcServerUnsupported) {
        try {
            await initPhoneCatalogServerSync();
            const token = await pcEnsureAuthToken();
            await pcPullConfigs(token);
            await pcPullTags(token);
        } catch (err) {
            console.warn('[MMS Phone Catalog] database pull failed — using local cache', err);
        }
    }

    const meta = loadPhoneListRefreshMeta();
    const ts = Number(meta?.at) || getPhoneListCacheTimestamp() || 0;
    const phones = loadPhoneListCache();
    let otherStorePhones = getOtherStoreCache();
    if (!otherStorePhones?.length) {
        otherStorePhones = getOtherStoreCache({ ignoreExpiry: true });
    }
    hydratePhonesFromStoreDetailsCache(phones);
    hydratePhonesFromStoreDetailsCache(otherStorePhones);
    return {
        phones: Array.isArray(phones) && phones.length ? phones : [],
        otherStorePhones: Array.isArray(otherStorePhones) && otherStorePhones.length ? otherStorePhones : [],
        lastUpdated: ts > 0 ? new Date(ts) : null,
        refreshedBy: String(meta?.by || '').trim(),
    };
}

window.initPhoneCatalogServerSync = initPhoneCatalogServerSync;
window.loadPhoneCatalogFromDatabase = loadPhoneCatalogFromDatabase;
window.migratePhoneCatalogToServer = (opts) => migratePhoneCatalogToServerOnce({ force: true, ...(opts || {}) });
window.pcNotifyConfigChanged = pcNotifyConfigChanged;
window.pcNotifyTagsChanged = pcNotifyTagsChanged;
window.pcNotifyNoteChanged = pcNotifyNoteChanged;

window.showPhoneListModal = showPhoneListModal;
window.showLaptopCatalogModal = showLaptopCatalogModal;
window.showPhoneListModalLegacy = null;
window.fetchPhoneList = fetchPhoneList;
window.fetchLaptopList = fetchLaptopList;
window.fetchOtherStoreLaptops = fetchOtherStoreLaptops;
window.loadLaptopListCache = loadLaptopListCache;
window.getOtherStoreLaptopCache = getOtherStoreLaptopCache;
window.parseLaptopName = parseLaptopName;
window.parseLaptopSpecs = parseLaptopSpecs;
window.hydrateLaptopItem = hydrateLaptopItem;
window.isUsedLaptopTitle = isUsedLaptopTitle;
window.isLaptopBarcode = isLaptopBarcode;
window.fetchOtherStorePhones = fetchOtherStorePhones;
window.loadPhoneListCache = loadPhoneListCache;
window.loadPhoneListRefreshMeta = loadPhoneListRefreshMeta;
window.getPhoneCatalogActorName = getPhoneCatalogActorName;
window.isPhoneListCacheStale = isPhoneListCacheStale;
window.getPhoneListCacheAgeMs = getPhoneListCacheAgeMs;
window.getOtherStoreCache = getOtherStoreCache;
window.syncPhoneColorCatalog = syncPhoneColorCatalog;
window.extractBaseModel = extractBaseModel;
window.extractGB = extractGB;
window.extractColor = extractColor;
window.filterIphoneTitlePhones = filterIphoneTitlePhones;
window.filterOneUnitStores = filterOneUnitStores;
window.normalizePhoneGrade = normalizePhoneGrade;
window.comparePhoneGrades = comparePhoneGrades;
window.getPhoneGradeCircleStyle = getPhoneGradeCircleStyle;
window.getPhoneGradeColor = getPhoneGradeColor;
window.getAllColorHexMap = getAllColorHexMap;
window.fetchStorehousesFromPage = fetchStorehousesFromPage;
window.getEffectivePhoneStores = getEffectivePhoneStores;
window.isPlausibleStorehouseName = isPlausibleStorehouseName;
window.phoneNeedsStoreResolve = phoneNeedsStoreResolve;
window.resolvePhonesStoreDetails = resolvePhonesStoreDetails;
window.hydratePhonesFromStoreDetailsCache = hydratePhonesFromStoreDetailsCache;
window.clearPhoneStoreDetailsCache = clearPhoneStoreDetailsCache;
window.pruneNetworkPhonesWithoutStores = pruneNetworkPhonesWithoutStores;
window.mergeOtherStoresFromAllPhones = mergeOtherStoresFromAllPhones;
window.PHONE_LIST_CACHE_TIMESTAMP_KEY = PHONE_LIST_CACHE_TIMESTAMP_KEY;
window.phoneCatalogT = t;
window.PHONE_CATALOG_TRANSLATIONS = PHONE_CATALOG_TRANSLATIONS;

/** Clear in-memory extract caches only (colors/GB/models). Keeps stored phone lists. */
window.clearPhoneCatalogParseCaches = function clearPhoneCatalogParseCaches() {
    phoneCatalogColorCache.clear();
    phoneCatalogGbCache.clear();
    extractBaseModelCacheGlobal.clear();
};

/**
 * Clear phone catalog caches.
 * @param {{ includeLists?: boolean }} [opts]
 *   includeLists (default true for backward compat): also wipe GM phone/network list caches.
 *   Pass includeLists:false after color/tag/settings edits so lists stay warm across reloads.
 */
window.clearPhoneCatalogCaches = function clearPhoneCatalogCaches(opts = {}) {
    window.clearPhoneCatalogParseCaches();
    const includeLists = opts?.includeLists !== false;
    if (!includeLists) return;
    try {
        GM_setValue(PHONE_LIST_CACHE_KEY, null);
        GM_setValue(PHONE_LIST_CACHE_TIMESTAMP_KEY, 0);
        GM_setValue(OTHER_STORE_CACHE_KEY, null);
        GM_setValue(OTHER_STORE_CACHE_TIMESTAMP_KEY, 0);
        GM_setValue(PHONE_STORE_DETAILS_CACHE_KEY, '{}');
        phoneStoreDetailsCacheMemo = null;
        GM_setValue('tm_phone_other_store_cache_v2', null);
    } catch (e) {
        console.warn('[MMS Phone List] Failed to clear GM phone caches:', e);
    }
};
window.loadPhoneColors = loadPhoneColors;
window.addPhoneColor = addPhoneColor;
window.removePhoneColor = removePhoneColor;
window.renamePhoneColor = renamePhoneColor;
window.updatePhoneListColor = updatePhoneListColor;
window.isPhoneColorRemoved = isPhoneColorRemoved;
window.getAliasesForColor = getAliasesForColor;
window.setColorDisplayAliasesForColor = setColorDisplayAliasesForColor;
window.loadColorDisplayAliases = loadColorDisplayAliases;
window.resolveDisplayColorName = resolveDisplayColorName;
window.suggestPhoneColorHex = suggestPhoneColorHex;
window.normalizePhoneColorHex = normalizePhoneColorHex;
window.normalizePhoneColorName = normalizePhoneColorName;
window.normalizeColorEntry = normalizeColorEntry;
window.getPhoneCatalogOutlineStyle = getPhoneCatalogOutlineStyle;
window.getDefinedTagKeys = getDefinedTagKeys;
window.getTagDefinition = getTagDefinition;
window.getTagDisplayName = getTagDisplayName;
window.getTagColor = getTagColor;
window.addTagDefinition = addTagDefinition;
window.updateTagDefinition = updateTagDefinition;
window.deleteTagDefinition = deleteTagDefinition;
window.normalizeTagKey = normalizeTagKey;
window.getPhoneTags = getPhoneTags;
window.addPhoneTag = addPhoneTag;
window.removePhoneTag = removePhoneTag;
window.togglePhoneTag = togglePhoneTag;
window.getPhoneUnitNote = getPhoneUnitNote;
window.setPhoneUnitNote = setPhoneUnitNote;
window.getAllUsedTags = getAllUsedTags;
window.getSelectableTagKeys = getSelectableTagKeys;
window.renamePhoneTagKeyOnAllPhones = renamePhoneTagKeyOnAllPhones;
window.removePhoneTagFromAllPhones = removePhoneTagFromAllPhones;
window.loadPhoneStoreRules = loadPhoneStoreRules;
window.savePhoneStoreRules = savePhoneStoreRules;
window.getDefaultPhoneStoreRules = getDefaultPhoneStoreRules;
window.parseStorePatternCsv = parseStorePatternCsv;
window.storeNameMatchesPatterns = storeNameMatchesPatterns;
window.collectKnownStoreNames = collectKnownStoreNames;
window.getCurrentStoreName = getCurrentStoreName;
window.captureConnectedStoreFromPage = captureConnectedStoreFromPage;
window.parseConnectedStoreButton = parseConnectedStoreButton;
window.getConnectedStoreCached = getConnectedStoreCached;
window.getAutoDetectedStoreName = getAutoDetectedStoreName;
window.getUserStorePick = getUserStorePick;
window.setUserStorePick = setUserStorePick;
window.getLoginCapturedStore = getLoginCapturedStore;
window.syncMyStoreFromLoginCapture = syncMyStoreFromLoginCapture;
window.getStorePickerOptions = getStorePickerOptions;
window.loadStoreAddresses = loadStoreAddresses;
window.saveStoreAddresses = saveStoreAddresses;
window.getStoreAddressEntry = getStoreAddressEntry;
window.setStoreAddressEntry = setStoreAddressEntry;
window.getStorePhone = getStorePhone;
window.normalizeStorePhoneForTel = normalizeStorePhoneForTel;
window.getStoreCoordinates = getStoreCoordinates;
window.getStoreDistanceKm = getStoreDistanceKm;
window.getStoreDistanceLabel = getStoreDistanceLabel;
window.formatDistanceKm = formatDistanceKm;
window.geocodeStoreAddress = geocodeStoreAddress;
window.geocodeAllStoreAddresses = geocodeAllStoreAddresses;
window.detectAndCacheCurrentStoreName = detectAndCacheCurrentStoreName;
window.guessStoreRegion = guessStoreRegion;
window.guessStoreLocality = guessStoreLocality;
window.getStoreProximityTier = getStoreProximityTier;
window.compareStoresByProximity = compareStoresByProximity;
window.sortStoresByProximity = sortStoresByProximity;
window.isBuybackTitle = isBuybackTitle;
window.resolvePhoneIsBuyback = resolvePhoneIsBuyback;
window.hydratePhoneBuybackFlags = hydratePhoneBuybackFlags;
window.isStoreAllowedForPhone = isStoreAllowedForPhone;
window.isStoreAllowedForBuybackPhone = isStoreAllowedForBuybackPhone;
window.isStoreAllowedForRegularPhone = isStoreAllowedForRegularPhone;
window.phoneHasAllowedBuybackStore = phoneHasAllowedBuybackStore;
window.getDefaultPhoneCanonicalModels = getDefaultPhoneCanonicalModels;
window.loadPhoneCanonicalModels = loadPhoneCanonicalModels;
window.savePhoneCanonicalModels = savePhoneCanonicalModels;
window.setPhoneCanonicalModels = setPhoneCanonicalModels;
window.resetPhoneCanonicalModels = resetPhoneCanonicalModels;
window.addPhoneCanonicalModel = addPhoneCanonicalModel;
window.removePhoneCanonicalModel = removePhoneCanonicalModel;
window.renamePhoneCanonicalModel = renamePhoneCanonicalModel;
window.movePhoneCanonicalModel = movePhoneCanonicalModel;
window.collectSuggestedCanonicalModels = collectSuggestedCanonicalModels;
window.rebuildCanonModelTokens = rebuildCanonModelTokens;

if (document.body) {
    captureConnectedStoreFromPage(document);
    syncMyStoreFromLoginCapture();
    detectAndCacheCurrentStoreName(document);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        captureConnectedStoreFromPage(document);
        syncMyStoreFromLoginCapture();
        detectAndCacheCurrentStoreName(document);
    }, { once: true });
}

try {
    if (typeof window.initPhoneCatalogServerSync === 'function') {
        setTimeout(() => {
            window.initPhoneCatalogServerSync().catch(() => {});
        }, 1200);
    }
} catch (_) { /* ignore */ }

