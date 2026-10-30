/* 找出哪些有实质动作的代码行从来没被高亮过。
 *   node scripts/coverage.mjs [--all] [章节]
 * 只出报告，永远退出 0。
 */
import { loadData } from '../tests/support/harness.mjs';

const args = process.argv.slice(2);
const showAll = args.includes('--all');
const only = args.find((a) => !a.startsWith('-'));

/* ---------- 行分类 ---------- */
const DECL_WORDS = /^\s*(int|char|void|float|double|ElemType|Status|BiTree|BiTNode|LNode|LinkList|DNode|DLinkList|SqList|ArcNode|VNode|ALGraph|MGraph|Queue|Stack)\b/;

function classify(raw) {
  const t = raw.trim();
  if (!t || t === '{' || t === '}' || t === '};' || t === '} else {') return 'brace';
  if (/^\/\*/.test(t) || /^\*/.test(t) || /^\*\//.test(t)) return 'comment';
  const body = t.replace(/\/\*.*?\*\/\s*$/, '').replace(/\/\/.*$/, '').trim();  // 先摘掉行尾注释
  if (/\b(if|while|for|switch)\b/.test(body) || /\?.*:/.test(body)) return 'branch';
  if (DECL_WORDS.test(body) && !/\(/.test(body.replace(/\[[^\]]*\]/g, ''))) return 'decl';
  if (DECL_WORDS.test(body) && /\)\s*\{?$/.test(body) && /\(\s*(void|int|char|const|[A-Z]\w*|ElemType)/.test(body)) return 'signature';
  if (/[A-Za-z_]\w*\s*\(/.test(body)) return 'call';
  if (/->|(^|[^=!<>])=([^=]|$)/.test(body)) return 'assign';
  return 'other';
}

/* 严重度：调用 > 赋值 > 分支 > 其它 > 声明/签名 */
const SEVERITY = { call: 3, assign: 2, other: 2, branch: 1, decl: 0, signature: 0, brace: 0, comment: 0 };
const LABEL = {
  call: '调用', assign: '赋值', branch: '分支', other: '其它', decl: '声明', signature: '签名',
};

const IGNORABLE = new Set(['brace', 'comment', 'decl', 'signature']);

/* ---------- 宽度对齐（中文按两格算） ---------- */
const wide = /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/;
function width(s) {
  let n = 0;
  for (const ch of String(s)) n += wide.test(ch) ? 2 : 1;
  return n;
}
function pad(s, n) {
  const d = n - width(s);
  return s + ' '.repeat(Math.max(0, d));
}
function padLeft(s, n) {
  const d = n - width(s);
  return ' '.repeat(Math.max(0, d)) + s;
}

/* ---------- 统计 ---------- */
const NS = loadData();
const chapters = only ? NS.CHAPTERS.filter((c) => c.id === only) : NS.CHAPTERS;
if (!chapters.length) {
  console.log('没有这一章：' + only + '（可选：' + NS.CHAPTERS.map((c) => c.id).join(' / ') + '）');
  process.exit(0);
}

const rows = [];
const bucket = {};
let linesTotal = 0, linesCovered = 0;

for (const ch of NS.CHAPTERS) {
  if (!chapters.includes(ch)) continue;
  for (const demo of ch.demos) {
    const cases = demo.cases && demo.cases.length ? demo.cases : [null];
    const lit = new Set();
    for (const c of cases) for (const f of demo.run(c)) lit.add(f.line);

    const missed = [];
    let total = 0;
    demo.code.forEach((src, i) => {
      const kind = classify(src);
      if (kind === 'brace' || kind === 'comment') return;
      total++;
      if (lit.has(i)) { linesCovered++; return; }
      bucket[kind] = (bucket[kind] || 0) + 1;
      missed.push({ line: i, kind, text: src.trim() });
    });
    linesTotal += total;

    const hard = missed.filter((m) => !IGNORABLE.has(m.kind));
    if (hard.length || (showAll && missed.length)) {
      rows.push({ name: ch.id + '/' + demo.id, total, missed, hard });
    }
  }
}

/* ---------- 输出 ---------- */
console.log('覆盖率报告：' + NS.CHAPTERS.reduce((n, c) => n + c.demos.length, 0) + ' 个模板，'
  + rows.length + ' 个存在缺口' + (only ? '（只看 ' + only + '）' : ''));

const pct = linesTotal ? Math.round((linesCovered / linesTotal) * 100) : 100;
console.log('实质行覆盖：' + linesCovered + ' / ' + linesTotal + ' 行（' + pct + '%）');

console.log('\n缺口按类型：');
for (const k of ['call', 'assign', 'branch', 'other', 'decl', 'signature']) {
  if (!bucket[k]) continue;
  const note = k === 'call' ? '  ← 递归、visit、算法核心调用从没亮过，优先补'
    : k === 'assign' ? '  ← 更新 / 松弛 / 搬运这类关键动作'
      : k === 'branch' ? '  ← 循环条件与判定'
        : '  ← 样板行，可忽略';
  console.log('  ' + pad(LABEL[k], 4) + padLeft(String(bucket[k]), 4) + ' 行' + (IGNORABLE.has(k) ? '' : note));
}

rows.sort((a, b) => b.hard.length - a.hard.length || a.name.localeCompare(b.name));

let shown = 0;
for (const r of rows) {
  const list = showAll ? r.missed : r.hard;
  if (!list.length) continue;
  shown++;
  const lit = r.total - r.missed.length;
  console.log('\n' + r.name + '   覆盖 ' + lit + '/' + r.total);
  for (const m of list) {
    console.log('  ' + padLeft(String(m.line), 2) + ' [' + pad(LABEL[m.kind], 4) + '] ' + m.text);
  }
}

if (!shown) console.log('\n没有需要补的实质缺口。');
else console.log('\n共 ' + shown + ' 个模板有待补的行。不亮不代表错，但值得逐条确认"这一行该不该讲"。');
