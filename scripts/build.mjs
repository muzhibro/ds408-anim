/* 按 manifest 顺序把 src/ 的模块拼成单文件 index.html。
 * 输出放根目录，拿到项目双击就能看。零依赖，file:// 可用。
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, 'src', 'manifest.json');
const OUT = path.join(ROOT, 'index.html');

const fail = (msg) => {
  console.error('构建失败：' + msg);
  process.exit(1);
};

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const read = (rel) => {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) fail('缺少文件 ' + rel + '（manifest 里列了但磁盘上没有）');
  return fs.readFileSync(abs, 'utf8');
};

const template = read(manifest.template);
if (!template.includes('{{STYLES}}') || !template.includes('{{SCRIPTS}}')) {
  fail(manifest.template + ' 里需要 {{STYLES}} 和 {{SCRIPTS}} 两个占位符');
}

const styles = manifest.styles.map(read).join('\n');
const modules = manifest.data.concat(manifest.ui);
const parts = modules.map((rel) => {
  const code = read(rel);
  if (/<\/script/i.test(code)) fail(rel + ' 里出现了 </script，内联会截断页面');
  return '/* ---- ' + rel + ' ---- */\n' + code.replace(/\s+$/, '') + '\n';
});
const script = parts.join('\n');

/* 语法检查，拼坏了就别写文件 */
try {
  new vm.Script(script, { filename: 'dist/index.html <script>' });
} catch (e) {
  fail('拼接后的脚本语法错误：' + e.message);
}

const html = template.replace('{{STYLES}}', () => styles).replace('{{SCRIPTS}}', () => script);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html, 'utf8');

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(
  '已生成 index.html：' + kb(Buffer.byteLength(html)) +
  '（数据模块 ' + manifest.data.length + ' 个，界面模块 ' + manifest.ui.length + ' 个，' +
  '样式 ' + manifest.styles.length + ' 个）'
);
