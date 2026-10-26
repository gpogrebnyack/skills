// Local relay between agents (CLI) and the Figma Desktop bridge plugin.
// No dependencies. Usage: node server.mjs  (port via BRIDGE_PORT, default 3917)
//
// Several plugin copies may be open at once (one per Figma file), so every job is addressed
// to a file key. Without one, the job goes to the only connected file or is refused.

import http from 'node:http';

const PORT = Number(process.env.BRIDGE_PORT || 3917);
const POLL_MS = 25_000;
const ONLINE_MS = POLL_MS + 5_000;

// fileKey -> { info, lastSeen, waiter: { res, timer } | null, queue: [job] }
const plugins = new Map();
const pending = new Map();   // job id -> { resolve, timer }
let nextId = 1;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function send(res, status, body) {
  res.writeHead(status, { ...cors, 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); }
    });
  });
}

const online = () => [...plugins.values()].filter((p) => Date.now() - p.lastSeen < ONLINE_MS);

function dispatch(p) {
  if (!p.waiter || p.queue.length === 0) return;
  const { res, timer } = p.waiter;
  clearTimeout(timer);
  p.waiter = null;
  send(res, 200, p.queue.shift());
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204);
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (req.method === 'GET' && pathname === '/status') {
      const list = online().map((p) => p.info);
      return send(res, 200, { online: list.length > 0, plugins: list, plugin: list.length === 1 ? list[0] : null, running: pending.size });
    }

    // Plugin long-poll: returns a job for its file or 204 after POLL_MS.
    if (req.method === 'POST' && pathname === '/next') {
      const info = await readBody(req);
      const key = info.fileKey || 'unknown';
      const p = plugins.get(key) || { queue: [], waiter: null };
      p.info = info; p.lastSeen = Date.now();
      plugins.set(key, p);
      if (p.waiter) { clearTimeout(p.waiter.timer); send(p.waiter.res, 204); }
      const timer = setTimeout(() => { if (p.waiter && p.waiter.res === res) { p.waiter = null; send(res, 204); } }, POLL_MS);
      p.waiter = { res, timer };
      req.on('close', () => { if (p.waiter && p.waiter.res === res) { clearTimeout(timer); p.waiter = null; } });
      return dispatch(p);
    }

    if (req.method === 'POST' && pathname === '/result') {
      const msg = await readBody(req);
      const p = msg.info && plugins.get(msg.info.fileKey);
      if (p) p.lastSeen = Date.now();
      const job = pending.get(msg.id);
      if (job) { clearTimeout(job.timer); pending.delete(msg.id); job.resolve(msg); }
      return send(res, 200, { ok: true });
    }

    // Agent side: submit a job for one file and wait for its result.
    if (req.method === 'POST' && pathname === '/run') {
      const { code, fileKey, readOnly = false, allowLibrary = false, timeoutMs = 120_000 } = await readBody(req);
      if (typeof code !== 'string' || !code.trim()) return send(res, 400, { ok: false, error: 'code is required' });
      const live = online();
      if (!live.length) return send(res, 503, { ok: false, error: 'Bridge plugin is not connected. Run it in Figma Desktop.' });
      let target;
      if (fileKey) {
        target = live.find((p) => p.info.fileKey === fileKey);
        if (!target) return send(res, 503, { ok: false, error: `Plugin is not running in file ${fileKey}. Connected: ${live.map((p) => `${p.info.fileKey} «${p.info.fileName}»`).join(', ')}` });
      } else if (live.length === 1) {
        target = live[0];
      } else {
        return send(res, 409, { ok: false, error: `Several files connected, pass --file: ${live.map((p) => `${p.info.fileKey} «${p.info.fileName}»`).join(', ')}` });
      }
      const id = String(nextId++);
      const result = await new Promise((resolve) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          const i = target.queue.findIndex((j) => j.id === id);
          if (i >= 0) target.queue.splice(i, 1);
          resolve({ id, ok: false, error: `Timed out after ${timeoutMs} ms` });
        }, timeoutMs);
        pending.set(id, { resolve, timer });
        target.queue.push({ id, code, readOnly, allowLibrary });
        dispatch(target);
      });
      return send(res, result.ok ? 200 : 500, result);
    }

    // deck stop: the relay was started in the background by build or wait.
    if (req.method === 'POST' && pathname === '/shutdown') {
      send(res, 200, { ok: true });
      setTimeout(() => process.exit(0), 100);
      return;
    }

    send(res, 404, { ok: false, error: 'not found' });
  } catch (e) {
    send(res, 400, { ok: false, error: String(e) });
  }
});

server.listen(PORT, '127.0.0.1', () => console.log(`bridge listening on http://localhost:${PORT}`));
