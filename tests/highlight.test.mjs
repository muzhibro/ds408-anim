import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { ROOT, loadData } from './support/harness.mjs';

/* highlight.js 是界面模块，只用到一个 window 全局；单独装进来即可，不需要 DOM */
function loadHighlight() {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'ui', 'highlight.js'), 'utf8');
  const ctx = vm.createContext({});
  ctx.window = ctx;
  vm.runInContext(src, ctx, { filename: 'highlight.js' });
  return ctx.DSANIM.highlight;
}

const highlight = loadHighlight();
const cls = (line, i) => highlight([line])[0][i].cls;
const text = (line) => highlight([line])[0];

test('拼回去必须与原文逐字相同（上色不能吞字、不能多字）', () => {
  const NS = loadData();
  let lines = 0;
  for (const ch of NS.CHAPTERS) {
    for (const demo of ch.demos) {
      const out = highlight(demo.code);
      demo.code.forEach((src, i) => {
        lines++;
        assert.equal(out[i].map((t) => t.text).join(''), src, `${ch.id}/${demo.id} 第 ${i + 1} 行`);
      });
    }
  }
  assert.ok(lines > 300, '应该覆盖全部模板的代码行，实际 ' + lines);
});

test('关键字、类型、数字、运算符', () => {
  const toks = text('if (!T) return 1;');
  const by = (w) => toks.find((t) => t.text === w).cls;
  assert.equal(by('if'), 't-kw');
  assert.equal(by('return'), 't-kw');
  assert.equal(by('!'), 't-op');
  assert.equal(by('1'), 't-num');
  assert.equal(by('T'), null, '普通变量保持正文色');
});

test('自定义结构体名当类型，宏常量单独一色', () => {
  const toks = text('BiTree Q[MAXSIZE], p = T;');
  assert.equal(toks.find((t) => t.text === 'BiTree').cls, 't-ty');
  assert.equal(toks.find((t) => t.text === 'MAXSIZE').cls, 't-cn');
});

test('-> 与 . 后面的字段单独上色', () => {
  const plain = (arr) => JSON.parse(JSON.stringify(arr));   /* vm 里造出来的数组跨 realm */
  assert.deepEqual(plain(text('p = p->lchild;').map((t) => [t.text, t.cls])),
    [['p', null], [' ', null], ['=', 't-op'], [' ', null],
      ['p', null], ['->', 't-op'], ['lchild', 't-fd'], [';', 't-op']]);
  assert.deepEqual(plain(text('G.edge[u][v]').map((t) => t.text)), ['G', '.', 'edge', '[', 'u', ']', '[', 'v', ']']);
  assert.equal(text('G.edge[u][v]')[2].cls, 't-fd');
});

test('函数名：后面紧跟括号的标识符', () => {
  const toks = text('  Visit(w);');
  assert.equal(toks.find((t) => t.text === 'Visit').cls, 't-fn');
});

test('注释、字符串、预处理行', () => {
  assert.ok(text('  /* 头插法 */').every((t) => t.cls === 't-com' || t.text.trim() === ''));
  assert.equal(text('s->data = "abc";').find((t) => t.text === '"abc"').cls, 't-str');
  const pre = text('#include <stdio.h>');
  assert.equal(pre.length, 1);
  assert.equal(pre[0].cls, 't-pre');
});

test('跨行块注释：下一行继承注释状态，结束后恢复上色', () => {
  const out = highlight(['/* 第一行', ' 第二行 */ int x;']);
  assert.ok(out[0].every((t) => t.cls === 't-com'));
  assert.equal(out[1][0].text, ' 第二行 */');
  assert.equal(out[1][0].cls, 't-com');
  assert.equal(out[1].find((t) => t.text === 'int').cls, 't-ty');
  assert.equal(out[1].find((t) => t.text === 'x').cls, null);
});

test('未闭合的 /* 之后整行都是注释，且不抛异常', () => {
  const out = highlight(['p = q; /* 没有收尾']);
  assert.equal(out[0].find((t) => t.text === 'p').cls, null);
  assert.ok(out[0][out[0].length - 1].cls === 't-com');
});
