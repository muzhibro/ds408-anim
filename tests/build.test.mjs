/* 构建产物自检：能跑通、形状正确、帧数据和源码一致。 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, readManifest, loadData, loadBuiltData, digestAll } from './support/harness.mjs';

const manifest = readManifest();
const OUT = path.join(ROOT, 'index.html');

test('构建命令能跑通，并生成根目录的 index.html', () => {
  const before = fs.existsSync(OUT) ? fs.statSync(OUT).mtimeMs : 0;
  const log = execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: ROOT, encoding: 'utf8' });
  assert.match(log, /已生成 index\.html/);
  assert.ok(fs.existsSync(OUT), '构建后还是没有 index.html');
  assert.ok(fs.statSync(OUT).size > 150 * 1024, '产物太小，像是漏了模块');
  assert.ok(fs.statSync(OUT).mtimeMs >= before);
});

test('产物里没有未替换的占位符，也没有外链依赖', () => {
  const html = fs.readFileSync(OUT, 'utf8');
  assert.ok(!html.includes('{{'), '产物里还留着 {{ 占位符');
  assert.ok(!/(src|href)\s*=\s*["']https?:/i.test(html), '产物不应依赖外部资源（要能离线打开）');
  assert.ok(!html.includes('<link'), '产物不应有额外的样式外链');
  assert.ok(html.trimEnd().endsWith('</html>'));
});

test('产物里的内联脚本包含全部模块，且顺序与 manifest 一致', () => {
  const html = fs.readFileSync(OUT, 'utf8');
  const order = manifest.data.concat(manifest.ui).map((r) => html.indexOf('/* ---- ' + r + ' ---- */'));
  order.forEach((at, i) => assert.ok(at > 0, '产物里缺模块 ' + manifest.data.concat(manifest.ui)[i]));
  for (let i = 1; i < order.length; i++) {
    assert.ok(order[i] > order[i - 1], '模块顺序被改变了：' + manifest.data.concat(manifest.ui)[i]);
  }
});

test('产物里的帧序列和源码一致（构建没有走样）', () => {
  const src = digestAll(loadData());
  const built = digestAll(loadBuiltData());
  assert.equal(built.framesTotal, src.framesTotal, '帧总数不一致');
  assert.equal(built.cases, src.cases, '用例数不一致');
  assert.equal(built.digest, src.digest, '帧指纹不一致：构建产物和源码不是同一份数据');
});

test('样式全部内联进 <style>（含窄屏规则）', () => {
  const html = fs.readFileSync(OUT, 'utf8');
  const style = html.match(/<style>([\s\S]*?)<\/style>/);
  assert.ok(style, '产物里没有 <style>');
  const css = style[1];
  for (const s of manifest.styles) {
    const first = fs.readFileSync(path.join(ROOT, s), 'utf8').split('\n')[0];
    assert.ok(css.includes(first), '样式没有内联：' + s);
  }
});
