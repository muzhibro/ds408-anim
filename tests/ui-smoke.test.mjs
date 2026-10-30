/* 界面冒烟：每个模板、每个用例、每一帧都渲染一遍，查白屏、异常、高亮错行。 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPage } from './support/harness.mjs';

const { NS, document } = loadPage();
const chapters = NS.app.chapters();

test('页面初始化后停在第 1 章第 1 个模板', () => {
  const st = NS.app.state();
  assert.equal(st.chapter, 0);
  assert.equal(st.demo, 0);
  assert.ok(st.frames > 1, '只生成了一个帧？');
});

test('每个模板的每个用例都能加载并逐帧渲染', () => {
  const stage = document.getElementById('stage');
  const codeEl = document.getElementById('code');
  const descEl = document.getElementById('desc');
  const progEl = document.getElementById('prog');
  let rendered = 0;

  chapters.forEach((ch, ci) => {
    ch.demos.forEach((demoId, di) => {
      const where = ch.id + '/' + demoId;
      const cases = NS.CHAPTERS[ci].demos[di].cases || [];
      const caseCount = cases.length || 1;

      for (let k = 0; k < caseCount; k++) {
        const total = NS.app.select(ci, di, k);
        assert.ok(total > 0, where + ' 用例 ' + k + ' 加载后没有帧');
        const frames = NS.app.frames();

        for (let i = 0; i < total; i++) {
          NS.app.stepTo(i);
          rendered++;
          assert.ok(stage.children.length > 0, where + ' 第 ' + i + ' 帧没画出东西');
          assert.ok(descEl.innerHTML.length > 0, where + ' 第 ' + i + ' 帧没有说明');
          assert.match(progEl.textContent, /^\d+ \/ \d+$/, '进度文本格式不对：' + progEl.textContent);
          const hl = codeEl.querySelector('.cline.hl');
          assert.ok(hl, where + ' 第 ' + i + ' 帧没有高亮行');
          assert.equal(hl.getAttribute('data-i'), String(frames[i].line), where + ' 第 ' + i + ' 帧高亮行错位');
        }
      }
    });
  });

  /* 帧数从数据算，别写死 */
  const expected = NS.CHAPTERS.reduce((sum, ch) => sum + ch.demos.reduce((s, demo) => {
    const cs = demo.cases && demo.cases.length ? demo.cases : [null];
    return s + cs.reduce((n, c) => { let k = 0; for (const _ of demo.run(c)) k++; return n + k; }, 0);
  }, 0), 0);
  assert.ok(expected > 2000, '数据层帧数异常：' + expected);
  assert.equal(rendered, expected, '渲染的帧数和帧数据对不上（有模板没渲染全？）');
});

test('多用例模板的每个用例都能切换', () => {
  let switched = 0;
  chapters.forEach((ch, ci) => {
    ch.demos.forEach((demoId, di) => {
      const cases = NS.CHAPTERS[ci].demos[di].cases || [];
      for (let k = 0; k < cases.length; k++) {
        const n = NS.app.select(ci, di, k);
        assert.ok(n > 0, ch.id + '/' + demoId + ' 用例 ' + k + ' 没有帧');
        switched++;
      }
    });
  });
  const total = NS.CHAPTERS.reduce((s, ch) => s + ch.demos.reduce((n, d) => n + ((d.cases || []).length), 0), 0);
  assert.ok(total > 30, '带用例的用例总数异常：' + total);
  assert.equal(switched, total, '带用例的模板一共应有 ' + total + ' 个用例');
});
