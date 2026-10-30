/* 进度记忆：没存过从头开始、存过回到原位、存储不可用也不白屏。 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPage } from './support/harness.mjs';

const KEY = 'ds408-anim:progress';

function fakeStorage(seed) {
  const map = new Map(Object.entries(seed || {}));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
    get length() { return map.size; },
    key: (i) => [...map.keys()][i],
    dump: () => Object.fromEntries(map)
  };
}

test('没有存过进度时，从第 1 章第 1 个模板的第一帧开始', () => {
  const store = fakeStorage();
  const { NS } = loadPage({ localStorage: store });
  assert.deepEqual({ ...NS.app.state() }, { chapter: 0, demo: 0, step: 0, frames: NS.app.frames().length });
});

test('存过进度时，打开页面直接回到上次的章节 / 模板 / 用例 / 帧', () => {
  const store = fakeStorage({
    [KEY]: JSON.stringify({ chapter: 1, demo: 5, caseIdx: 1, step: 3 })
  });
  const { NS } = loadPage({ localStorage: store });
  const st = NS.app.state();
  assert.equal(st.chapter, 1);
  assert.equal(st.demo, 5);
  assert.equal(st.step, 3);
  assert.ok(st.frames > 3);
});

test('翻帧 / 换模板会把新位置写回存储', () => {
  const store = fakeStorage();
  const { NS } = loadPage({ localStorage: store });
  NS.app.select(2, 3, 0);
  NS.app.stepTo(4);
  const saved = JSON.parse(store.dump()[KEY]);
  assert.equal(saved.chapter, 2);
  assert.equal(saved.demo, 3);
  assert.equal(saved.step, 4);
});

test('存储不可用（读或写抛异常）时也能正常启动', () => {
  const broken = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('QuotaExceededError'); },
    removeItem() {}
  };
  const { NS } = loadPage({ localStorage: broken });
  assert.deepEqual({ ...NS.app.state() }, { chapter: 0, demo: 0, step: 0, frames: NS.app.frames().length });
  assert.ok(NS.app.select(0, 2, 0) > 0);   /* 换模板、渲染都不能受影响 */
});

test('存的是越界的旧数据时，夹到合法范围内而不是崩', () => {
  const store = fakeStorage({
    [KEY]: JSON.stringify({ chapter: 4, demo: 999, caseIdx: 99, step: 99999 })
  });
  const { NS } = loadPage({ localStorage: store });
  const st = NS.app.state();
  assert.equal(st.chapter, 4);
  assert.equal(st.demo, NS.app.chapters()[4].demos.length - 1);
  assert.equal(st.step, st.frames - 1);
});
