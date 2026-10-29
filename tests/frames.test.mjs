/* 帧数据本身的体检：行号、说明、用例、末态断言。
 *
 * 这一层不需要 DOM——帧是纯数据，先在这里把"说到的那行代码"和"最后长什么样"钉死，
 * 界面上看到的动画才值得相信。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadData, digestAll, framesOf } from './support/harness.mjs';

const NS = loadData();
const golden = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'frames.golden.json'), 'utf8'));
const allDemos = () => NS.CHAPTERS.flatMap((ch) => ch.demos.map((demo) => ({ ch, demo })));

test('帧指纹与基准一致（改了帧就更新 tests/fixtures/frames.golden.json）', () => {
  const now = digestAll(NS);
  assert.equal(now.framesTotal, golden.framesTotal, '帧总数变了');
  assert.equal(now.cases, golden.cases, '用例数变了');
  const changed = Object.keys(golden.perCase).filter((k) => now.perCase[k].sha !== golden.perCase[k].sha);
  assert.deepEqual(changed, [], '这些用例的帧内容和基准不同');
});

test('每个模板都有 id / 名称 / 说明 / 代码 / 生成器', () => {
  for (const { ch, demo } of allDemos()) {
    const where = ch.id + '/' + demo.id;
    assert.ok(demo.id, where + ' 缺 id');
    assert.ok(demo.name, where + ' 缺 name');
    assert.ok(demo.note && demo.note.length > 10, where + ' 的说明太短');
    assert.ok(Array.isArray(demo.code) && demo.code.length > 0, where + ' 没有展示代码');
    assert.equal(typeof demo.run, 'function', where + ' 没有 run()');
  }
});

test('每个用例都产生帧，且帧的行号落在展示代码里、说明不为空', () => {
  let frames = 0;
  for (const { ch, demo } of allDemos()) {
    const cases = demo.cases && demo.cases.length ? demo.cases : [null];
    cases.forEach((c, ci) => {
      const where = ch.id + '/' + demo.id + '#' + ci;
      const list = framesOf(demo, c);
      assert.ok(list.length > 0, where + ' 一帧都没有');
      for (const f of list) {
        frames++;
        assert.ok(f.desc && f.desc.trim(), where + ' 第 ' + list.indexOf(f) + ' 帧没有说明');
        assert.ok(
          Number.isInteger(f.line) && f.line >= 0 && f.line < demo.code.length,
          where + ' 的高亮行 ' + f.line + ' 超出 code 范围 0..' + (demo.code.length - 1)
        );
        assert.ok(['list', 'tree', 'array', 'graph'].includes(f.mode), where + ' 的帧 mode 不认识：' + f.mode);
      }
    });
  }
  assert.equal(frames, golden.framesTotal);
});

test('链表模板的 expect 与最后一帧的实际结构一致', () => {
  let checked = 0;
  for (const { demo } of allDemos()) {
    if (!demo.expect) continue;
    const list = framesOf(demo, (demo.cases || [null])[0]);
    const last = list[list.length - 1];
    const row = last.rows[0];
    assert.ok(row.label.startsWith(demo.expect[0]), demo.id + ' 的行标签对不上：' + row.label);
    const vals = [];
    const seen = new Set();
    for (let n = row.head.next; n && !seen.has(n.id); n = n.next) {
      seen.add(n.id);
      vals.push(String(n.val));
    }
    /* 成环的模板（06-loop）只看前 expected 个，环本身不是断言目标 */
    assert.equal(vals.slice(0, demo.expect.length - 1).join(' '), demo.expect.slice(1).join(' '), demo.id + ' 的末态不对');
    checked++;
  }
  assert.ok(checked >= 14, '只检查到 ' + checked + ' 个末态断言，expect 字段是不是被删了？');
});

test('章节与用例清单没有意外增删', () => {
  /* vm 里造出来的对象属于另一个 realm，deepEqual 前先过一遍 JSON */
  const shape = JSON.parse(JSON.stringify(NS.CHAPTERS)).map((c) => c.id + ':' + c.demos.map((d) => d.id).join(','));
  assert.deepEqual(shape, [
    'list:head,tail,reverse,kth,mid,loop,common,absdup,delnode,merge,split,reorder,doubly,sorted',
    'tree:tree-pre,tree-in-nr,tree-level,tree-height,tree-complete,tree-balanced,tree-bst,tree-lca,tree-swap',
    'graph:graph-dfs,graph-bfs,graph-topo,graph-dijkstra,graph-prim,graph-kruskal',
    'search:srch-binary,srch-bst,srch-hash',
    'sort:sort-insert,sort-bubble,sort-select,sort-quick,sort-heap,sort-merge'
  ]);
});
