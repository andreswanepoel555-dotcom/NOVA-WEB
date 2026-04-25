/**
 * sync-static.mjs
 *
 * Watches artifacts/nova-web/ for changes to the core website files
 * and instantly copies them to nova-web-static/ so the static export
 * stays in sync with every edit you make in Replit.
 *
 * Run via the "Sync Static Site" workflow — no manual steps needed.
 */

import { watch, copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const SRC  = 'artifacts/nova-web';
const DEST = 'nova-web-static';

// Core files to sync (HTML + CSS + JS)
const CORE_FILES = [
  'index.html',
  'about.html',
  'services.html',
  'portfolio.html',
  'contact.html',
  'styles.css',
  'script.js',
];

// Public assets to sync from artifacts/nova-web/public/ → nova-web-static/
const PUBLIC_ASSETS = [
  'favicon.svg',
  'opengraph.jpg',
  'tracers-sa.png',
  'detectives-sa.png',
  'robots.txt',
  'sitemap.xml',
];

// Ensure destination exists
if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true });

// ── helpers ──────────────────────────────────────────────────────────────────

const timestamp = () => new Date().toLocaleTimeString('en-ZA', { hour12: false });

const syncFile = (srcPath, destPath, label) => {
  try {
    copyFileSync(srcPath, destPath);
    console.log(`[${timestamp()}] ✓ synced  ${label}`);
  } catch (err) {
    console.error(`[${timestamp()}] ✗ failed  ${label} — ${err.message}`);
  }
};

const syncCore = (filename) => {
  if (!CORE_FILES.includes(filename)) return;
  syncFile(join(SRC, filename), join(DEST, filename), filename);
};

const syncAsset = (filename) => {
  if (!PUBLIC_ASSETS.includes(filename)) return;
  syncFile(join(SRC, 'public', filename), join(DEST, filename), `public/${filename}`);
};

// ── initial full sync on startup ─────────────────────────────────────────────

console.log(`\n[${timestamp()}] ━━ Nova Web Solutions — Static Sync ━━`);
console.log(`[${timestamp()}] Syncing all files to ${DEST}/ …\n`);

CORE_FILES.forEach(f => syncFile(join(SRC, f), join(DEST, f), f));
PUBLIC_ASSETS.forEach(f => {
  const src = join(SRC, 'public', f);
  if (existsSync(src)) syncFile(src, join(DEST, f), `public/${f}`);
});

console.log(`\n[${timestamp()}] Watching for changes…`);
console.log(`[${timestamp()}] Edit any file in artifacts/nova-web/ and it will`);
console.log(`[${timestamp()}] update automatically in nova-web-static/.\n`);

// ── watchers ─────────────────────────────────────────────────────────────────

// Watch root files (HTML, CSS, JS)
watch(SRC, { persistent: true }, (_event, filename) => {
  if (filename) syncCore(filename);
});

// Watch public/ assets
const publicDir = join(SRC, 'public');
if (existsSync(publicDir)) {
  watch(publicDir, { persistent: true }, (_event, filename) => {
    if (filename) syncAsset(filename);
  });
}
