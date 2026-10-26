#!/usr/bin/env node
// Agent-side CLI for the bridge.
//   node bridge.mjs status
//   node bridge.mjs run <script.js> [--file <fileKey>] [--read-only] [--allow-library] [--timeout <ms>]
// --file addresses the job to the plugin running in that file; required when several files are connected.
// --allow-library lets a write job touch the slide library itself (maintenance only).
//   echo 'return figma.root.name' | node bridge.mjs run - --read-only
//   node bridge.mjs run shots.js --read-only --out ./shots --args '{"from":0,"to":20}'
// --args (inline JSON) or --args-file (path to JSON) is exposed to the script as the constant ARGS.
// With --out, a result shaped { files: [{ name, base64 }], ... } is written to disk
// and each file entry is replaced by { name, path, bytes }.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const BASE = `http://localhost:${process.env.BRIDGE_PORT || 3917}`;
const [cmd, file, ...rest] = process.argv.slice(2);

async function main() {
  if (cmd === 'status') {
    const res = await fetch(`${BASE}/status`);
    return print(await res.json(), res.ok);
  }
  if (cmd === 'run' && file) {
    const a = rest.indexOf('--args');
    const af = rest.indexOf('--args-file');
    const args = af >= 0 ? JSON.parse(readFileSync(rest[af + 1], 'utf8')) : a >= 0 ? JSON.parse(rest[a + 1]) : {};
    const code = `const ARGS = ${JSON.stringify(args)};\n` + readFileSync(file === '-' ? 0 : file, 'utf8');
    const readOnly = rest.includes('--read-only');
    const allowLibrary = rest.includes('--allow-library');
    const fk = rest.indexOf('--file');
    const fileKey = fk >= 0 ? rest[fk + 1] : undefined;
    const t = rest.indexOf('--timeout');
    const timeoutMs = t >= 0 ? Number(rest[t + 1]) : 120_000;
    const res = await fetch(`${BASE}/run`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, fileKey, readOnly, allowLibrary, timeoutMs }) });
    const body = await res.json();
    const o = rest.indexOf('--out');
    if (o >= 0 && body.ok && Array.isArray(body.result?.files)) body.result.files = saveFiles(body.result.files, rest[o + 1]);
    return print(body, res.ok);
  }
  console.error('usage: bridge.mjs status | run <script.js|-> [--file key] [--read-only] [--allow-library] [--timeout ms] [--out dir] [--args json | --args-file path]');
  process.exit(2);
}

function saveFiles(files, dir) {
  mkdirSync(dir, { recursive: true });
  return files.map(({ name, base64, ...meta }) => {
    const path = resolve(join(dir, name.replace(/[^\w.\-]+/g, '_')));
    const data = Buffer.from(base64, 'base64');
    writeFileSync(path, data);
    return { name, path, bytes: data.length, ...meta };
  });
}

function print(body, ok) {
  console.log(JSON.stringify(body, null, 2));
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  const unreachable = e instanceof TypeError && e.message === 'fetch failed';
  console.error(unreachable ? `bridge server unreachable at ${BASE}` : `bridge error: ${e.message}`);
  process.exit(1);
});
