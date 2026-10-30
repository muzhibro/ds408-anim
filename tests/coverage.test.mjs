import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { ROOT } from './support/harness.mjs';

const script = path.join(ROOT, 'scripts', 'coverage.mjs');

function run(args = []) {
  /* execFileSync 在非 0 退出码时抛异常，所以"能拿到输出"本身就等于"退出码是 0" */
  return execFileSync(process.execPath, [script, ...args], { cwd: ROOT, encoding: 'utf8' });
}

test('覆盖率报告能跑通，并给出实质行覆盖总数', () => {
  const out = run();
  assert.match(out, /实质行覆盖：\d+ \/ \d+ 行（\d+%）/);
  assert.match(out, /缺口按类型：/);
});

test('覆盖率报告永远成功退出（是报告不是闸门）', () => {
  /* 有缺口也只出报告，别让构建失败 */
  const out = run(['--all']);
  assert.match(out, /实质行覆盖：\d+ \/ \d+ 行/);
});

test('按章节筛选只统计该章', () => {
  const out = run(['tree']);
  assert.match(out, /（只看 tree）/);
  const listed = [...out.matchAll(/^(list|tree|graph|search|sort)\/[\w-]+   覆盖/gm)].map((m) => m[1]);
  assert.deepEqual([...new Set(listed)], listed.length ? ['tree'] : [], '不该混进别章');
});

test('章节名写错时提示可选值，且不报错', () => {
  const out = run(['nope']);
  assert.match(out, /没有这一章：nope/);
  assert.match(out, /list \/ tree \/ graph \/ search \/ sort/);
});
