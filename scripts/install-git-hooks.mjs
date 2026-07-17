/**
 * Installs a pre-push hook that bumps Custom Ver and commits before each push.
 *   node scripts/install-git-hooks.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
# Auto-bump Custom Ver before push (MyManager Suite — local-only, no CI follow-up commit)
set -e
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

read -r local_ref local_sha remote_ref remote_sha

manifest_changed() {
  git diff "$1" "$2" --name-only 2>/dev/null | grep -q '^myman_manifest.json$'
}

# Skip if manifest already updated in commits being pushed
if [ -n "$remote_sha" ] && [ "$remote_sha" != "0000000000000000000000000000000000000000" ]; then
  if manifest_changed "$remote_sha" "$local_sha"; then
    exit 0
  fi
elif git diff HEAD~1 HEAD --name-only 2>/dev/null | grep -q '^myman_manifest.json$'; then
  exit 0
fi

# Skip if manifest is staged for a pending commit
if git diff --cached --name-only | grep -q '^myman_manifest.json$'; then
  exit 0
fi

node "$ROOT/scripts/release.mjs" "pre-push release"

git add myman_manifest.json myman_config.js myman_suite.bundle.js myman_loader.user.js myman_loader.local.user.js

if git diff --staged --quiet; then
  exit 0
fi

git commit -m "chore: bump Custom Ver [skip version]"
exit 0
`;

fs.writeFileSync(hookPath, hookBody, { mode: 0o755 });
console.log('Installed pre-push hook → bumps Custom Ver and commits before each push.');
console.log('The GitHub Actions version bump is disabled; all version bumps happen locally.');
console.log('To remove: delete .git/hooks/pre-push');
