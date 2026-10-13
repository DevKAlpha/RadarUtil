import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const entries = JSON.parse(readFileSync(new URL('upstream.sha256.json', root), 'utf8'));
for (const entry of entries) {
  const bytes = readFileSync(new URL(entry.path, root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.path);
}
for (const file of ['Css.php', 'version.php']) {
  const original = readFileSync(new URL(`upstream/src/${file}`, root));
  const modified = readFileSync(new URL(`modified/src/${file}`, root));
  assert.ok(modified.subarray(0, original.length).equals(original), `Se alteró contenido original de ${file}`);
}
assert.ok(readFileSync(new URL('modified/src/private/conf.php', root)).equals(readFileSync(new URL('docker/conf.php', root))));
console.log(`${entries.length} archivos originales verificados; solo se agregaron los hooks de presentación.`);
