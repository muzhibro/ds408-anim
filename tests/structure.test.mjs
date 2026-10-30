/* 目录和 manifest 必须对得上：漏登记会白屏，登记错会构建失败，文件名和 id 错位会乱序。 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readManifest, loadData } from './support/harness.mjs';

const manifest = readManifest();
const listed = manifest.data.concat(manifest.ui);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) walk(abs, out);
    else if (e.name.endsWith('.js')) out.push(abs);
  }
  return out;
}

const rel = (abs) => path.relative(ROOT, abs).split(path.sep).join('/');

test('manifest 里的文件都存在，且按依赖顺序排列', () => {
  for (const r of listed) {
    assert.ok(fs.existsSync(path.join(ROOT, r)), 'manifest 登记了不存在的文件：' + r);
  }
  // 数据层必须在界面层之前：界面层初始化时就要读 CHAPTERS
  assert.deepEqual(listed.slice(0, manifest.data.length), manifest.data);
  assert.ok(manifest.data.every((p) => p.startsWith('src/')), '路径统一用 src/ 开头');
});

test('src 下的每个模块都在 manifest 里登记且只登记一次', () => {
  const onDisk = walk(path.join(ROOT, 'src')).map(rel).filter((p) => !p.endsWith('manifest.json'));
  const seen = new Set();
  for (const r of listed) {
    assert.ok(!seen.has(r), 'manifest 里重复登记：' + r);
    seen.add(r);
  }
  const missing = onDisk.filter((p) => !seen.has(p));
  assert.deepEqual(missing, [], '这些文件没在 manifest 里登记，构建时会丢失');
});

test('manifest 的模板与样式真实存在且带占位符', () => {
  const tpl = fs.readFileSync(path.join(ROOT, manifest.template), 'utf8');
  assert.ok(tpl.includes('{{STYLES}}'), '模板缺 {{STYLES}}');
  assert.ok(tpl.includes('{{SCRIPTS}}'), '模板缺 {{SCRIPTS}}');
  for (const s of manifest.styles) {
    assert.ok(fs.existsSync(path.join(ROOT, s)), '缺样式文件 ' + s);
  }
});

test('demo 文件名与模板 id / 章节顺序一一对应', () => {
  const chapters = loadData().CHAPTERS;
  const files = walk(path.join(ROOT, 'src', 'demos')).map(rel).filter((p) => !p.includes('/_'));
  const byChapter = {};
  for (const f of files) {
    const m = f.match(/^src\/demos\/([a-z]+)\/(\d+)-([a-z0-9-]+)\.js$/);
    assert.ok(m, 'demo 文件名不符合 <两位序号>-<id>.js：' + f);
    (byChapter[m[1]] = byChapter[m[1]] || []).push({ idx: Number(m[2]), id: m[3], file: f });
  }

  assert.equal(
    Object.keys(byChapter).sort().join(','),
    chapters.map((c) => c.id).sort().join(','),
    'demo 目录和章节对不上'
  );

  for (const ch of chapters) {
    const list = (byChapter[ch.id] || []).sort((a, b) => a.idx - b.idx);
    assert.equal(
      list.map((x) => x.id).join(','),
      ch.demos.map((d) => d.id).join(','),
      ch.id + ' 章的 demo 文件名（按序号）和实际注册顺序不一致'
    );
    list.forEach((x, i) => assert.equal(x.idx, i + 1, x.file + ' 的序号应该从 1 连续编号'));
  }
});

test('章节与模板数量固定（38 个模板 / 5 章）', () => {
  const chapters = loadData().CHAPTERS;
  assert.equal(chapters.length, 5);
  assert.equal(chapters.reduce((n, c) => n + c.demos.length, 0), 38);
  assert.equal(chapters.map((c) => c.id).join(','), 'list,tree,graph,search,sort');
});
