/* 构建：把 src/ 下的模块按 manifest 的顺序拼成一个双击即开的单文件页面 index.html。
 *
 * 为什么不用打包器：整个项目零依赖、离线可用，file:// 双击直接打开。
 * 命名空间模块之间只通过 window.DSANIM 传值，拼接顺序就是加载顺序，
 * 所以“构建”本质上就是一次带校验的字符串拼接。
 *
 * 输出放在根目录而不是 dist/：用户拿到项目双击 index.html 就能看，
 * 不需要先跑命令。
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

/* 语法检查：拼出来的脚本必须能被解析，否则直接报错，不留下一份坏页面 */
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
