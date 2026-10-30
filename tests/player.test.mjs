/* 播放器的两条约定：
 *  1. 播放中按钮是「暂停」，颜色也要跟「播放」不一样（靠 .playing 类）；
 *  2. 播到最后一帧后自己停下，并在一小段延时后回到第 1 帧，
 *     这样再点播放是从头再来，而不是卡在结尾。
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { loadPage } from './support/harness.mjs';

function fakeTimers() {
  let seq = 0;
  const timers = new Map();
  const api = {
    setInterval(fn, ms) { const id = ++seq; timers.set(id, { fn, ms, kind: 'interval' }); return id; },
    setTimeout(fn, ms) { const id = ++seq; timers.set(id, { fn, ms, kind: 'timeout' }); return id; },
    clearInterval(id) { timers.delete(id); },
    clearTimeout(id) { timers.delete(id); },
    tick(kind) {
      let ran = 0;
      for (const [id, t] of [...timers]) {
        if (kind && t.kind !== kind) continue;
        if (t.kind === 'timeout') timers.delete(id);
        t.fn();
        ran++;
      }
      return ran;
    },
    count(kind) { return [...timers.values()].filter((t) => !kind || t.kind === kind).length; }
  };
  return api;
}

test('播放时按钮变「暂停」并加 .playing，停下来恢复「播放」', () => {
  const timers = fakeTimers();
  const { NS } = loadPage(timers);
  assert.deepEqual({ ...NS.app.playState() }, { playing: false, label: '播放', cls: '' });

  NS.app.play();
  const on = NS.app.playState();
  assert.equal(on.playing, true);
  assert.equal(on.label, '暂停');
  assert.match(on.cls, /playing/);

  NS.app.stop();
  const off = NS.app.playState();
  assert.equal(off.playing, false);
  assert.equal(off.label, '播放');
  assert.doesNotMatch(off.cls, /playing/);
});

test('播到最后一帧会自己停，延时之后进度条回到第 1 帧', () => {
  const timers = fakeTimers();
  const { NS } = loadPage(timers);
  NS.app.select(0, 0, 0);
  const total = NS.app.frames().length;
  assert.ok(total > 3);

  NS.app.play();
  for (let i = 0; i < total + 2 && NS.app.playing(); i++) timers.tick('interval');
  assert.equal(NS.app.state().step, total - 1, '应该停在最后一帧');
  assert.equal(NS.app.playing(), false, '播完要停表');
  assert.equal(NS.app.playState().label, '播放');

  /* 除了复位定时器，showStep 还会排一个地址栏防抖，所以这里只断言"有排"，
     不数个数——具体行为留给下一行：放掉定时器，进度条必须回到第 1 帧 */
  assert.ok(timers.count('timeout') >= 1, '应该排了一个复位定时器');
  timers.tick('timeout');
  assert.equal(NS.app.state().step, 0, '复位到第 1 帧');
});

test('停在最后一帧再点播放，是从头开始而不是立刻结束', () => {
  const timers = fakeTimers();
  const { NS } = loadPage(timers);
  NS.app.select(0, 0, 0);
  const total = NS.app.frames().length;
  NS.app.stepTo(total - 1);

  NS.app.play();
  assert.equal(NS.app.state().step, 0, '先回到开头');
  assert.equal(NS.app.playing(), true);
  timers.tick('interval');
  assert.equal(NS.app.state().step, 1, '然后正常往下走');
});

test('播完的复位等待期间，手动拖进度条会取消复位', () => {
  const timers = fakeTimers();
  const { NS, document } = loadPage(timers);
  NS.app.select(0, 0, 0);
  const total = NS.app.frames().length;

  NS.app.play();
  for (let i = 0; i < total + 2 && NS.app.playing(); i++) timers.tick('interval');
  assert.ok(timers.count('timeout') >= 1, '播完应该排了复位');

  const range = document.getElementById('range');
  range.value = '1';
  range.oninput();
  assert.equal(NS.app.state().step, 1);
  /* 把排着的定时器全部放掉：复位被取消过，就不该再把人弹回开头 */
  timers.tick('timeout');
  assert.equal(NS.app.state().step, 1, '用户手动定位后不该再被弹回开头');
});
