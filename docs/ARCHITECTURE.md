# 结构说明

自己回头改代码时看的东西。三件事：怎么分层、一帧长什么样、改哪块。

## 分层

```
src/demos/<章>/<NN>-<id>.js   只产帧，不碰 DOM
src/core/*.js                 帧工厂 + 注册表 + 递归栈，Node 里能直接跑
src/ui/*.js                   渲染 + 播放器，只认帧不认算法
```

界线只有一条：**数据层在没有 `document` 的环境里必须能跑完**。`tests/support/harness.mjs` 的 `loadData()` 只加载 `manifest.data`，一个 DOM 对象都不给，照样拿到全部 2932 帧。

## 模块怎么拼

没有 `import`：`file://` 下 ES module 会被 CORS 拦。模块靠 `window.DSANIM` 传值，每个文件外壳一样：

```js
/* 这文件是干什么的 */
(function (NS) {
  'use strict';
  var CH = NS.CH, F = NS.F, mk = NS.mk;
  /* 实现 */
  NS.F = F;
})(window.DSANIM = window.DSANIM || {});
```

开头那行 `var F = NS.F` 不是装饰。别名在 IIFE 执行时就求值，等于"依赖必须在我之前加载"；省掉它，顺序错了要等调用时才炸，而且报的是函数里的 `ReferenceError`，不好找。

加载顺序看 `src/manifest.json`：

- `data`：`util → registry → stack → 四个帧工厂 → _cases → 各章 _fixtures → 38 个 demo`
- `ui`：`svg → draw-list → draw-tree → draw-array → draw-graph → measure → types → highlight → app`

依赖单向。`tests/structure.test.mjs` 检查 `src/` 下每个文件都登记且只登记一次——漏一个，构建产物就少一块，页面白屏。

章内共享数据（`_cases.js` 的 `SORT_CASES` / `BIN_CASES`、`tree/_fixtures.js` 的 `mkTree1/2`、`graph/_fixtures.js` 的 `ADJ` / `G_DFS`）必须排在用它的 demo 前面，因为 `cases:` 是 `push` 那一刻求值的。

## 一帧

```js
{
  mode: 'list',        // 用哪个 draw-* 画
  line: 3,             // code[] 下标，0 起
  desc: 'A[j] > key',  // 右侧说明
  rows: [...],         // 各模式自己的载荷
  ptrs: [{ name: 'p', node: … }],
  mark: 结点,
  stack: ['n=5', …]    // 递归栈，可选
}
```

四个帧工厂：

| mode | 工厂 | 主要字段 |
| --- | --- | --- |
| list | `F(line, desc, rows, ptrs, mark, extra)` | `rows[].head/cut/cutNote`、`link{from,to,text,color}` |
| tree | `FT(line, desc, root, opt)` | `opt.tags/stack/swapPair/cmpTag/side` |
| array | `FA(line, desc, arr, opt)` | `opt.marks/sorted/spans/labels/swap/jump/cmp/side` |
| graph | `FG(line, desc, g, st)` | `st.state/labels/cur/edgeOn/scan/dsMark/dsFoot/ind` |

`F()` 会把可达结点（沿 `next` / `prior`）复制一份，再把副本的指针指回副本。所以历史帧不会被后续修改污染，帧里也能有环。指纹计算里的 `canon()` 就是为环准备的。

`stack` 是例外，它来自 `src/core/stack.js` 的模块级变量：demo 里 `var st = []; setStack(st);`，之后每次 `FT/FA/FG` 自动把 `st.slice()` 塞进帧，结尾 `setStack(null)`。省得每帧手写栈参数。

## 构建

`scripts/build.mjs` 四步：读 manifest 按序读文件 → 每个文件前加一行 `/* ---- src/… ---- */`（测试靠它从产物里切数据段）→ `new vm.Script()` 语法检查，拼坏了不写文件 → 替换 `{{STYLES}}` / `{{SCRIPTS}}`，输出根目录 `index.html`。

产物 252 KB（gzip 68.6 KB）。`file://`、U 盘、微信都能直接用。

## 上色

`src/ui/highlight.js`，手写词法扫描，约 110 行。

返回**词元数组**不是 HTML 字符串：`highlight(code) → [{text, cls}, …][]`，渲染时走 `textContent`。这样代码里的 `<` `>` `"` 不用转义，测试能做往返断言（拼回去必须等于原文），`markCond()` 也能按字符偏移把判定条件切成 `.cond` 而不是把整行退化成纯文本。

两个坑都写进测试了：跨行块注释（`/*` 开了没收，下一行接着算注释），以及单字母变量（`T`、`Q`、`L` 是变量，宏的规则因此要求至少 3 个字符）。`->` / `.` 后面的字段名单独一色，靠"上一个非空词元是不是 `->`"判断。

结构体面板用的是同一个函数，所以两边配色天然一致。

## 改哪里

| 想做的事 | 动哪 | 注意 |
| --- | --- | --- |
| 加模板 | `src/demos/<章>/<NN>-<id>.js` | manifest 登记；编号/顺序由测试验 |
| 改动画步骤 | 对应 demo 的 `run` | `npm run digest` 看哪些用例变了 |
| 改样式 | `draw-*.js` 或 `styles.css` | `npm run build`；`ui-smoke` 抓崩溃 |
| 加帧类型 | `core/*-frame.js` + `draw-*.js` + `measure.js` | `frames.test.mjs` 里有个 mode 白名单 |
| 查哪段没讲 | `npm run coverage` | 报告，不拦构建 |

## 还没解决的

1. `code[]` 是字符串，`run` 是另一份手写实现，`line` 靠手写下标对齐。补覆盖率时一共揪出二十来处错位，都是这么来的。真解法是 C 子集解释器：解析 `code[]`，执行时按 AST 节点出帧，`line` 由节点位置决定。
2. `nextId()` 是模块级自增，帧指纹因此依赖生成顺序。现在所有模板在同一个进程里按固定顺序生成，没问题；将来要并发就得改成按模板重置。
3. 窄屏只是"能用"：≤900px 单列、先图后码，递归栈改成横排卡片，触屏手势没打磨过。
4. 折行靠宽度调：默认 560px + 可拖分隔条，449 行里还剩 24 行折行。给 `.cline` 加 `white-space: pre` + 横向滚动能根治，但手机上代码区会左右晃，所以没做。
5. `app.js` 850 行，切章、播放器、深链接、搜索、分隔条、代码绘制全在一起，该按职责拆开。
