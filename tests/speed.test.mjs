import assert from 'node:assert/strict';
import test from 'node:test';
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

/* 速度滑块的约定：5 档，1 档在左最慢、5 档在右最快。
   实现里 1 档 = 每帧 1600ms，5 档 = 每帧 280ms，所以延迟必须随档位严格递减。 */
test('速度是 5 档，且滑块越往右越快', () => {
  const { NS } = loadPage();
  const s = NS.app.speed();
  assert.equal(s.steps.length, 5, '应该是 5 档');
  assert.equal(s.names.length, 5, '每档都要有个名字');
  for (let i = 1; i < s.steps.length; i++) {
    assert.ok(s.steps[i] < s.steps[i - 1], '第 ' + i + ' 档延迟应小于第 ' + i + ' 档：' + s.steps.join(' > '));
  }
  assert.ok(s.steps[0] >= 1200, '最左一档要足够慢：' + s.steps[0]);
  assert.ok(s.steps[4] <= 400, '最右一档要足够快：' + s.steps[4]);
});

test('默认停在第 3 档（原来的 760ms 手速）', () => {
  const { NS } = loadPage();
  const s = NS.app.speed();
  assert.equal(s.level, 3);
  assert.equal(s.delay, 760);
});

test('setSpeed 会更新读数与无障碍文本，越界值被夹回 1..5', () => {
  const { NS, document } = loadPage();
  const el = document.getElementById('speed');
  assert.equal(NS.app.setSpeed(5), 280);
  assert.equal(el.getAttribute('aria-valuetext'), '第 5 档，很快，每帧 280 毫秒');
  assert.equal(document.getElementById('speedval').textContent, '5 档 · 很快');
  assert.equal(NS.app.setSpeed(0), 1600, '0 应该夹到 1 档');
  assert.equal(NS.app.speed().level, 1);
  assert.equal(NS.app.setSpeed(99), 280, '99 应该夹到 5 档');
  assert.equal(NS.app.speed().level, 5);
});

test('速度档位会跟着进度一起记住，下次打开还是那一档', () => {
  const store = fakeStorage();
  const a = loadPage({ localStorage: store });
  a.NS.app.setSpeed(4);
  a.NS.app.stepTo(2);            /* 翻一帧会触发 saveState */
  assert.equal(JSON.parse(store.getItem(KEY)).speed, 4);

  const b = loadPage({ localStorage: store });
  assert.equal(b.NS.app.speed().level, 4, '重新打开应该恢复第 4 档');
  assert.equal(b.NS.app.speed().delay, 480);
});

