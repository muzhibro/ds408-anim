/* 全部帧的 sha256 指纹，用来发现哪些用例的帧变了。
 *   node scripts/frame-digest.mjs [--write]
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadData, digestAll } from '../tests/support/harness.mjs';

const GOLDEN = path.join(ROOT, 'tests', 'fixtures', 'frames.golden.json');
const current = digestAll(loadData());

if (process.argv.includes('--write')) {
  fs.mkdirSync(path.dirname(GOLDEN), { recursive: true });
  fs.writeFileSync(GOLDEN, JSON.stringify(current, null, 2) + '\n', 'utf8');
  console.log('已写入 tests/fixtures/frames.golden.json：' + current.framesTotal + ' 帧 / ' + current.cases + ' 用例');
  process.exit(0);
}

console.log('帧总数 ' + current.framesTotal + '，用例 ' + current.cases + '，指纹 ' + current.digest);

if (fs.existsSync(GOLDEN)) {
  const golden = JSON.parse(fs.readFileSync(GOLDEN, 'utf8'));
  const changed = Object.keys(golden.perCase).filter(
    (k) => !current.perCase[k] || current.perCase[k].sha !== golden.perCase[k].sha
  );
  const added = Object.keys(current.perCase).filter((k) => !golden.perCase[k]);
  if (!changed.length && !added.length) {
    console.log('与 tests/fixtures/frames.golden.json 一致。');
  } else {
    console.log('与基准不同：' + changed.length + ' 个用例变了，' + added.length + ' 个新增。');
    for (const k of changed.slice(0, 20)) console.log('  变 ' + k);
    for (const k of added.slice(0, 20)) console.log('  新 ' + k);
    console.log('如果不是有意的改动，检查最近的编辑；确认无误后用 --write 更新基准。');
    process.exit(1);
  }
}
