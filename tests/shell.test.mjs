/* 外壳行为的三条约定：
 *  1. 筛选框只过滤当前章节的模板，按 id / 名字都能匹配；筛没了要给出提示；
 *  2. 地址栏跟着当前帧走（history.replaceState），这样"把第 12 帧发出去"只是复制地址；
 *  3. 代码区宽度可以拖，夹在合法范围内，并且记得住。
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { loadPage } from './support/harness.mjs';

function fakeStorage(seed) {
  const map = new Map(Object.entries(seed || {}));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
    get length() { return map.size; },
    key: (i) => [...map.keys()][i]
  };
}

test('筛选框按名字过滤模板，并把当前模板自动切到第一个命中的', () => {
  const { NS } = loadPage();
  NS.app.select(2, 0, 0);                 /* 图 · 第一个模板 */
  const all = NS.app.options().length;
  assert.ok(all >= 6, '图这一章应该有 6 个模板，实际 ' + all);

  const n = NS.app.setFilter('dijkstra');
  assert.equal(n, 1);
  assert.equal(NS.app.options().map((o) => o.value).join(','), '3');
  assert.equal(NS.app.state().demo, 3, '应该自动切到 Dijkstra');

  NS.app.setFilter('');
  assert.equal(NS.app.options().length, all, '清空筛选要恢复全部');
});

test('筛不到东西时给出提示，并且不崩', () => {
  const { NS, document } = loadPage();
  NS.app.select(0, 0, 0);
  assert.equal(NS.app.setFilter('不存在的模板'), 0);
  assert.equal(document.getElementById('demoSel').disabled, true);
  assert.match(document.getElementById('filterHint').textContent, /没有匹配/);
});

test('地址栏跟着当前章节 / 模板 / 帧 / 用例走', () => {
  const { NS } = loadPage();
  NS.app.select(1, 6, 2);                /* 二叉树 · IsBST · 第 3 个用例 */
  NS.app.stepTo(10);
  assert.equal(NS.app.hash(), '#tree@tree-bst@10@2');

  const link = NS.app.link();
  assert.ok(link.endsWith('#tree@tree-bst@10@2'), '链接应该以当前 hash 结尾：' + link);
});

test('代码区宽度可拖动、有上下限、下次打开还记得', () => {
  const store = fakeStorage();
  const a = loadPage({ localStorage: store });
  assert.equal(a.NS.app.codeWidth(), 560, '默认 560（65 字符以内不用折行）');

  assert.equal(a.NS.app.setCodeWidth(640), 640);
  assert.equal(store.getItem('ds408-anim:split'), '640');

  const b = loadPage({ localStorage: store });
  assert.equal(b.NS.app.codeWidth(), 640, '重新打开应该恢复上次拖的宽度');

  assert.equal(a.NS.app.setCodeWidth(10), 300, '再窄也不小于 300');
  const max = a.NS.app.setCodeWidth(99999);
  assert.ok(max < 1000, '上限应该跟着窗口宽度走，实际 ' + max);
  assert.equal(a.NS.app.codeWidth(), max, '越界的值夹到上限');
});

test('带深链接打开时，直接定位到链接里的模板与帧', () => {
  const { NS } = loadPage({ location: { hash: '#list@reverse@5@0', href: 'https://x/#list@reverse@5@0' } });
  const st = NS.app.state();
  assert.equal(st.chapter, 0);
  assert.equal(NS.app.chapters()[0].demos[st.demo], 'reverse');
  assert.equal(st.step, 5);
});
