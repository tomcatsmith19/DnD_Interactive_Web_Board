const fs = require('node:fs');
const path = require('node:path');

const source = path.resolve(process.argv[2] || 'stickers');
const output = path.resolve(process.argv[3] || path.join('public', 'data', 'sticker-catalog.json'));
const supported = /\.(?:webp|png|jpe?g|gif|webm)$/i;

if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) {
  throw new Error(`Sticker directory not found: ${source}`);
}

const files = [];
const pending = [source];
while (pending.length) {
  const directory = pending.pop();
  const entries = fs.readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => b.name.localeCompare(a.name, undefined, { numeric: true }));
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) pending.push(fullPath);
    else if (entry.isFile() && supported.test(entry.name)) {
      files.push(path.relative(source, fullPath).split(path.sep).join('/'));
    }
  }
}

files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify({ version: 1, fileCount: files.length, files }));
console.log(`Wrote ${files.length.toLocaleString()} stickers to ${output}`);
