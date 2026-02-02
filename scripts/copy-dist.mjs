import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const from = path.join(root, 'frontend', 'dist');
const to = path.join(root, 'dist');

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(from))) {
  console.error(`Expected build output not found: ${from}`);
  process.exit(1);
}

await fs.rm(to, { recursive: true, force: true });
await fs.mkdir(to, { recursive: true });

// Node 18+ supports fs.cp
await fs.cp(from, to, { recursive: true });

console.log(`Copied ${from} -> ${to}`);
