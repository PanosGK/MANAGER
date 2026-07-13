/**
 * Installs a pre-push hook that bumps Custom Ver before each push (local workflow).
 *   node scripts/install-git-hooks.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const gitDir = path.join(root, '.git');
const hooksDir = path.join(gitDir, 'hooks');

if (!fs.existsSync(gitDir)) {
    console.error('Not a git repository — cannot install hooks.');
    process.exit(1);
}

fs.mkdirSync(hooksDir, { recursive: true });

const hookPath = path.join(hooksDir, 'pre-push');
const hookBody = `#!/bin/sh
# Auto-bump Custom Ver before push (MyManager Suite)
ROOT="$(git rev-parse --show-toplevel)"
MANIFEST="$ROOT/myman_manifest.json"

# Skip if manifest is already staged in this push batch
if git diff --cached --name-only | grep -q '^myman_manifest.json$'; then
  exit 0
fi

node "$ROOT/scripts/release.mjs" "pre-push release"
exit $?
`;

fs.writeFileSync(hookPath, hookBody, { mode: 0o755 });
console.log('Installed pre-push hook → bumps Custom Ver via scripts/release.mjs before each push.');
console.log('To remove: delete .git/hooks/pre-push');
