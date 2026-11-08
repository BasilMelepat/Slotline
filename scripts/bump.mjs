#!/usr/bin/env node
/*
  Bump the Slotline version.

    node scripts/bump.mjs patch      1.0.0 -> 1.0.1   bug fixes
    node scripts/bump.mjs minor      1.0.1 -> 1.1.0   new features that keep old data working
    node scripts/bump.mjs major      1.1.0 -> 2.0.0   breaking changes
    node scripts/bump.mjs 1.4.2      set an exact version
    node scripts/bump.mjs show       print the current version

  Updates package.json (root, client, server), the service worker cache name
  (so installed apps pick up the new files) and adds a section to CHANGELOG.md.
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = (...p) => path.join(root, ...p);
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const rootPkg = readJson(file('package.json'));
const current = rootPkg.version;
const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

const arg = (process.argv[2] || '').trim();
if (arg === 'show') {
  console.log(current);
  process.exit(0);
}

const m = SEMVER.exec(current);
if (!m) {
  console.error(`The current version "${current}" is not in major.minor.patch form.`);
  process.exit(1);
}
let [major, minor, patch] = m.slice(1).map(Number);

let next;
if (arg === 'major') next = `${major + 1}.0.0`;
else if (arg === 'minor') next = `${major}.${minor + 1}.0`;
else if (arg === 'patch') next = `${major}.${minor}.${patch + 1}`;
else if (SEMVER.test(arg)) next = arg;
else {
  console.error('Usage: node scripts/bump.mjs <major|minor|patch|x.y.z|show>');
  process.exit(1);
}

if (next === current) {
  console.error(`Already at ${current}.`);
  process.exit(1);
}

// package.json files
for (const p of [file('package.json'), file('client', 'package.json'), file('server', 'package.json')]) {
  const pkg = readJson(p);
  pkg.version = next;
  fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
}

// service worker cache name
const sw = file('client', 'public', 'sw.js');
if (fs.existsSync(sw)) {
  const src = fs.readFileSync(sw, 'utf8');
  const out = src.replace(/const CACHE = '[^']*';/, `const CACHE = 'slotline-v${next}';`);
  if (out === src && !src.includes(`'slotline-v${next}'`)) console.warn('Could not find the CACHE line in sw.js. Update it by hand.');
  fs.writeFileSync(sw, out);
}

// changelog
const log = file('CHANGELOG.md');
const date = new Date().toISOString().slice(0, 10);
const entry = `## ${next} - ${date}\n\n- \n`;
if (fs.existsSync(log)) {
  const src = fs.readFileSync(log, 'utf8');
  const i = src.indexOf('\n## ');
  fs.writeFileSync(log, i < 0 ? `${src.trimEnd()}\n\n${entry}` : `${src.slice(0, i + 1)}${entry}\n${src.slice(i + 1)}`);
} else {
  fs.writeFileSync(log, `# Changelog\n\n${entry}`);
}

console.log(`${current} -> ${next}`);
console.log('Next: describe the change in CHANGELOG.md, then commit and tag:');
console.log(`  git commit -am "Release ${next}" && git tag v${next}`);
