/* 帧指纹：把全部模板 / 用例 / 帧序列化成 sha256。
 *
 * 用途：改动 demo 或帧工厂之后跑一次，一眼看出"哪几个用例的帧变了"。
 *   node scripts/frame-digest.mjs            # 打印当前指纹
 *   node scripts/frame-digest.mjs --write    # 更新 tests/fixtures/frames.golden.json
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
