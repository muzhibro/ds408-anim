import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { ROOT } from './support/harness.mjs';

const script = path.join(ROOT, 'scripts', 'coverage.mjs');

function run(args = []) {
  return execFileSync(process.execPath, [script, ...args], { cwd: ROOT, encoding: 'utf8' });
}

test('覆盖率报告能跑通，并给出实质行覆盖总数', () => {
  const out = run();
  assert.match(out, /实质行覆盖：\d+ \/ \d+ 行（\d+%）/);
  assert.match(out, /缺口按类型：/);
});

test('覆盖率报告永远成功退出（是报告不是闸门）', () => {
  /* 即便存在缺口，也不应该让构建失败——否则补内容就成了"改测试" */
  const out = run(['--all']);
  assert.match(out, /\[(调用|赋值|分支|声明|签名|其它)\]/);
});

test('按章节筛选只列该章的模板', () => {
  const out = run(['tree']);
  const names = [...out.matchAll(/^(list|tree|graph|search|sort)\/([\w-]+)   覆盖/gm)].map((m) => m[1]);
  assert.ok(names.length > 0, '应该列出模板');
  assert.deepEqual([...new Set(names)], ['tree']);
});

test('章节名写错时提示可选值，且不报错', () => {
  const out = run(['nope']);
  assert.match(out, /没有这一章：nope/);
  assert.match(out, /list \/ tree \/ graph \/ search \/ sort/);
});
