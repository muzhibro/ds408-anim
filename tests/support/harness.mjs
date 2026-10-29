/* 测试共用的小工具：在 node 里把 src/ 的模块按 manifest 顺序跑起来。
 *
 * 页面本身没有 import/export，模块之间只通过 window.DSANIM 传值，
 * 所以"加载源码"就等于在一个 vm 沙箱里依次执行文件。
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { createDocument } from './dom.mjs';

export const ROOT = path.resolve(import.meta.dirname, '..', '..');

export function readManifest() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'manifest.json'), 'utf8'));
}

export function readModule(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function makeContext(withDom) {
  const sandbox = { console };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  if (withDom) {
    sandbox.document = createDocument();
    sandbox.location = { hash: '' };
    sandbox.addEventListener = () => {};
    sandbox.setInterval = () => 0;
    sandbox.clearInterval = () => {};
  }
  return vm.createContext(sandbox);
}

/** 只加载数据层（章节 / 模板 / 用例 / 帧工厂），不需要 DOM */
export function loadData(options = {}) {
  const manifest = readManifest();
  const ctx = makeContext(false);
  for (const rel of manifest.data) {
    vm.runInContext(readModule(rel), ctx, { filename: rel, ...options });
  }
  return ctx.DSANIM;
}

/** 加载数据层 + 界面层，返回 { NS, document } */
export function loadPage(options = {}) {
  const manifest = readManifest();
  const ctx = makeContext(true);
  for (const rel of manifest.data.concat(manifest.ui)) {
    vm.runInContext(readModule(rel), ctx, { filename: rel, ...options });
  }
  return { NS: ctx.DSANIM, document: ctx.document, sandbox: ctx };
}

/**
 * 从构建产物 index.html 里只取数据层那段脚本执行。
 * 用来验证"构建出来的单文件页面里，帧序列跟源码逐字节一致"。
 */
export function loadBuiltData(htmlPath = 'index.html') {
  const html = fs.readFileSync(path.join(ROOT, htmlPath), 'utf8');
  const body = html.match(/<script>([\s\S]*)<\/script>/);
  if (!body) throw new Error(htmlPath + ' 里没有 <script>');
  const manifest = readManifest();
  const wanted = new Set(manifest.data.map((p) => '/* ---- ' + p + ' ---- */'));
  const blocks = body[1].split(/(?=\/\* ---- src\/)/).filter((s) => wanted.has(s.split('\n')[0]));
  if (blocks.length !== manifest.data.length) {
    throw new Error('dist 里的数据模块数不对：' + blocks.length + ' != ' + manifest.data.length);
  }
  const ctx = makeContext(false);
  for (const b of blocks) vm.runInContext(b, ctx, { filename: 'dist/index.html' });
  return ctx.DSANIM;
}

/* ---------------------------------------------------------------- 帧指纹 */
function canon(v, seen) {
  if (v === null || v === undefined) return 'null';
  const t = typeof v;
  if (t === 'string') return JSON.stringify(v);
  if (t === 'number') return Number.isFinite(v) ? String(v) : 'null';
  if (t === 'boolean') return String(v);
  if (t === 'function') return '"<fn>"';
  if (t === 'object') {
    if (seen.has(v)) return '"@' + seen.get(v) + '"';
    seen.set(v, seen.size);
    if (Array.isArray(v)) return '[' + v.map((x) => canon(x, seen)).join(',') + ']';
    return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canon(v[k], seen)).join(',') + '}';
  }
  return JSON.stringify(String(v));
}

export function framesOf(demo, caseObj) {
  return [...demo.run(caseObj)];
}

export function digestCase(demo, caseObj) {
  const frames = framesOf(demo, caseObj);
  const body = canon(frames, new Map());
  return {
    n: frames.length,
    sha: crypto.createHash('sha256').update(body).digest('hex').slice(0, 16)
  };
}

/** 整个数据层的指纹：{ framesTotal, cases, digest, perCase } */
export function digestAll(NS) {
  const perCase = {};
  let framesTotal = 0;
  for (const ch of NS.CHAPTERS) {
    for (const demo of ch.demos) {
      const cases = demo.cases && demo.cases.length ? demo.cases : [null];
      cases.forEach((c, ci) => {
        const r = digestCase(demo, c);
        framesTotal += r.n;
        perCase[`${ch.id}/${demo.id}#${ci}`] = r;
      });
    }
  }
  const digest = crypto.createHash('sha256').update(JSON.stringify(perCase)).digest('hex').slice(0, 16);
  return { framesTotal, cases: Object.keys(perCase).length, digest, perCase };
}
