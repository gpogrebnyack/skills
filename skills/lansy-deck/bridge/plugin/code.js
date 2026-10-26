// Main thread: receives jobs from ui.html and runs them against the open file.
// A job is a JS body with top-level await and return, same contract as use_figma.

// Old master: used by the old skill, never written. Library: master of this skill, the Design
// file every deck imports its slides from; written only by explicit maintenance jobs.
const MASTER_FILE_KEY = 'pmTMwjvBBi6UQdm9j48pAh';
const LIBRARY_FILE_KEY = '3m8vS0i2okRWSOD3KaPVUX';

figma.showUI(__html__, { width: 280, height: 140, title: 'Lansy Bridge' });

function fileInfo() {
  return {
    fileKey: figma.fileKey || null,
    fileName: figma.root.name,
    editorType: figma.editorType,
    isMaster: figma.fileKey === MASTER_FILE_KEY,
    isLibrary: figma.fileKey === LIBRARY_FILE_KEY,
  };
}

figma.ui.postMessage({ type: 'hello', info: fileInfo() });

figma.ui.onmessage = async (msg) => {
  if (msg.type !== 'job') return;
  const { id, code, readOnly, allowLibrary } = msg.job;
  const info = fileInfo();
  const started = Date.now();
  // The master is shared with the old skill: only read-only jobs may touch it.
  if (info.isMaster && !readOnly) {
    figma.ui.postMessage({ type: 'result', id, ok: false, info, error: 'Refused: write job on the old master file. Open a duplicate of the template.' });
    return;
  }
  if (info.isLibrary && !readOnly && !allowLibrary) {
    figma.ui.postMessage({ type: 'result', id, ok: false, info, error: 'Refused: write job on the slide library. Build decks in an empty Slides file; library maintenance needs --allow-library.' });
    return;
  }
  try {
    const fn = eval('(async () => {\n' + code + '\n})');
    const result = await fn();
    figma.ui.postMessage({ type: 'result', id, ok: true, info, ms: Date.now() - started, result: result === undefined ? null : result });
  } catch (e) {
    const error = String(e) + (e && e.stack ? '\n' + e.stack : '');
    figma.ui.postMessage({ type: 'result', id, ok: false, info, ms: Date.now() - started, error });
  }
};
