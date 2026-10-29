/* 打印某个模板的 code 行号与每帧 (line, desc)，用来人工核对"高亮行和说明对不对得上"。
 *
 *   node scripts/dump-frames.mjs tree tree-bst 0
 *   node scripts/dump-frames.mjs sort sort-insert      # 用例下标默认 0
 */
import { loadData } from '../tests/support/harness.mjs';

const [chId, demoId, caseIdx] = process.argv.slice(2);
if (!chId || !demoId) {
  console.error('用法：node scripts/dump-frames.mjs <章节> <模板> [用例下标]');
  console.error('章节可选：list / tree / graph / search / sort');
  process.exit(2);
}

const chapters = loadData().CHAPTERS;
const ch = chapters.find((c) => c.id === chId);
if (!ch) {
  console.error('没有这一章：' + chId);
  process.exit(2);
}
const demo = ch.demos.find((d) => d.id === demoId);
if (!demo) {
  console.error('这一章里没有模板：' + demoId);
  console.error('可选：' + ch.demos.map((d) => d.id).join(' / '));
  process.exit(2);
}

const cases = demo.cases && demo.cases.length ? demo.cases : [null];
const k = Math.min(Math.max(Number(caseIdx) || 0, 0), cases.length - 1);

console.log('=== ' + ch.name + ' / ' + demo.name + '（用例 ' + k + (cases.length > 1 ? '/' + (cases.length - 1) : '') + '）===');
console.log('--- code ---');
demo.code.forEach((s, i) => console.log(String(i).padStart(2) + ' | ' + s));

console.log('\n--- frames ---');
let n = 0;
for (const f of demo.run(cases[k])) {
  console.log(String(n++).padStart(2) + '  L' + String(f.line).padStart(2) + '  ' + String(f.desc).replace(/\s+/g, ' ').slice(0, 90));
}
