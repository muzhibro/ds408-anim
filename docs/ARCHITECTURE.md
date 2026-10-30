# 架构说明

这份文档解释三件事：**为什么这么分层**、**一帧到底是什么**、**改动时该动哪一层**。

## 1. 分层

```
┌─────────────────────────────────────────────┐
│ src/demos/<章>/<NN>-<id>.js                  │  只产帧：不碰 DOM、不查样式
│   CH('list').demos.push({ id, name, note,    │
│                           code, run })       │
├─────────────────────────────────────────────┤
│ src/core/*.js       帧工厂 + 注册表 + 递归栈  │  不认识 DOM，Node 里可直接跑
│   F() 链表帧  FT() 树帧  FA() 数组帧  FG() 图帧 │
├─────────────────────────────────────────────┤
│ src/ui/*.js         渲染 + 播放器             │  只认帧，不认识算法
│   draw-*.js → measure.js → app.js            │
└─────────────────────────────────────────────┘
```

分界线的判据只有一句：**数据层能在没有 `document` 的环境里跑完**。`tests/support/harness.mjs` 的 `loadData()` 就是这么做的——加载 `manifest.data` 里所有模块，一个 DOM 对象都不给，照样能拿到全部 2932 帧。

这条线带来三个好处：

1. 帧序列可以在 Node 里全量跑，测试不需要浏览器；
2. 渲染层可以整个换掉（比如改成 Canvas 或 SVG 之外的东西）而不动算法；
3. 加模板的人只需要理解"帧"这一种数据结构。

## 2. 模块外壳

页面里没有 `import` / `export`（`file://` 下 ES module 会被 CORS 拦掉），模块之间通过 `window.DSANIM` 传值。每个文件的外壳都一样：

```js
/* 说明这文件是什么 */
(function (NS) {
  'use strict';
  var CH = NS.CH, F = NS.F, mk = NS.mk;   // 显式别名：加载后立即取值
  /* ……实现…… */
  NS.F = F;                                // 导出
})(window.DSANIM = window.DSANIM || {});
```

**为什么要写 `var F = NS.F` 这种别名**：别名在 IIFE 开头求值，等于"依赖必须在我之前加载"。少了它，函数体里的 `F` 会在调用时才解析，加载顺序错了要等到跑起来才炸。用了别名，顺序错了在加载阶段立刻 `ReferenceError`。

**加载顺序**由 `src/manifest.json` 决定，而 manifest 的顺序就是数组顺序：

- `data`：`util → registry → stack → 四个帧工厂 → _cases → 各章 _fixtures → 每章 38 个 demo`
- `ui`：`svg → draw-list → draw-tree → draw-array → draw-graph → measure → types → app`

依赖是严格单向的，`tests/structure.test.mjs` 会验证 `src/` 下每个文件都在 manifest 里且只登记一次（漏登记 = 构建产物少一块 = 白屏）。

章节内共享的测试数据（`src/demos/_cases.js` 的 `SORT_CASES` / `BIN_CASES`、`tree/_fixtures.js` 的 `mkTree1/2`、`graph/_fixtures.js` 的 `ADJ` / `G_DFS`）必须排在用到它的 demo 之前——因为 `cases:` 是在 `push` 的那一刻求值的。

## 3. 一帧是什么

```js
{
  mode: 'list',            // 决定用哪个 draw-* 画
  line: 3,                 // code[] 的下标（0 起）
  desc: 'A[j] > key，后移', // 右侧说明栏
  rows: [...],             // 该布局需要的数据（见下）
  ptrs: [{name:'p', node:…}],
  mark: 结点,              // 需要高亮的那个
  stack: ['n=5', …]        // 递归栈快照（可选）
}
```

四种 `mode` 的载荷：

| mode | 帧工厂 | 关键字段 |
| --- | --- | --- |
| `list` | `F(line, desc, rows, ptrs, mark, extra)` | `rows[].head/cut/cutNote`、`ptrs`、`mark`、`link{from,to,text,color}` |
| `tree` | `FT(line, desc, root, opt)` | `root`（树）、`opt.tags/stack/swapPair/cmpTag/side` |
| `array` | `FA(line, desc, arr, opt)` | `opt.marks/sorted/spans/labels/swap/jump/cmp/side` |
| `graph` | `FG(line, desc, g, st)` | `st.state/labels/cur/edgeOn/scan/dsMark/dsFoot/ind` |

**快照是深拷贝的**。`F()` 会把所有可达结点（沿 `next` / `prior` 走）复制成新对象，再把这些副本的 `next`/`prior` 重新指向副本。所以：

- 后面继续改原链表，不会篡改已经 yield 出去的帧；
- 帧内部可以存在环（循环链表、双向链表），指纹计算里用 `canon()` 处理了环；
- 渲染层拿到的是"死"的数据，天然无状态。

`stack` 例外：它由 `src/core/stack.js` 的模块级活变量提供。demo 里写 `var st = []; setStack(st);`，之后每次 `FT/FA/FG` 自动把 `st.slice()` 塞进帧；结尾 `setStack(null)`。这是为了让 demo 不用在每一帧里手写栈参数。

## 4. 构建

`scripts/build.mjs` 做四件事：

1. 读 `src/manifest.json`，按顺序读文件；
2. 每个文件前加一行 `/* ---- src/… ---- */` 标记（测试靠它从产物里切出数据段）；
3. `new vm.Script(拼接结果)` 做语法检查——**拼坏了就不写出文件**，避免留下一个白屏的 `index.html`；
4. 替换 `src/index.html` 里的 `{{STYLES}}` / `{{SCRIPTS}}`，输出到根目录 `index.html`。

产物 ≈ 200 KB，一个文件，无外链。`file://` 双击、U 盘拷走、发微信都能直接打开。

为什么不用打包器：项目自身零依赖，也不需要 tree-shaking 或转译（代码是 ES5 风格的普通脚本）。引入 Vite/Rollup 只会让"打开方式"变复杂。**命名空间 + 顺序拼接**在这里的语义完全够用，构建脚本 60 行，好读好改。

## 5. 代码上色

`src/ui/highlight.js` 是一个手写的 C 子集词法扫描器，约 110 行，没有依赖。

**它返回词元数组，不返回 HTML 字符串。** `highlight(code) → [{text, cls}, …][]`，渲染层再把每个词元变成 `<span>`（或纯文本节点），全程走 `textContent`。这样定了三件事：

- 不需要转义——代码里的 `<`、`>`、`"` 永远不会被当成标签解析；
- 测试可以做**往返断言**：把每个模板每一行的词元拼回去，必须逐字等于原文（`tests/highlight.test.mjs`），吞字/多字会立刻红；
- `markCond()` 需要把判定条件包进 `.cond` 时，可以按"字符偏移"切词元重绘，而不是把整行退化成纯文本。

要处理的两个难点都在测试里钉住了：**跨行块注释**（`/*` 开了没收，下一行继承注释状态）和**单字母变量**（`T`、`Q`、`L` 是变量，不能按"全大写即宏"上色，规则因此要求至少 3 个字符）。`->` / `.` 之后的字段名单独一色，靠"上一个非空白词元是不是 `->`"判断。

结构体定义面板（`tdbody`）用的是同一个函数：`types.js` 里的文本先去掉历史遗留的 `<b>`，再整段上色，所以两个面板的配色天然一致。

## 6. 测试策略

| 文件 | 依赖 | 覆盖 |
| --- | --- | --- |
| `tests/frames.test.mjs` | 无 DOM | 帧指纹、帧结构性约束（`line` 越界 / 空说明）、链表 `expect` 末态、章节清单快照 |
| `tests/ui-smoke.test.mjs` | `tests/support/dom.mjs` | 2932 帧逐帧渲染：画面非空、说明非空、进度文本、高亮行与 `frame.line` 一致 |
| `tests/structure.test.mjs` | 文件系统 | manifest ↔ 源文件、demo 文件名 ↔ 模板 id ↔ 注册顺序 |
| `tests/build.test.mjs` | 子进程 + 产物 | 构建可跑、无占位符/外链、产物帧指纹 = 源码帧指纹 |

两个关键决定：

**帧指纹而不是逐帧断言。** 38 个模板的全部帧写成断言会是一份没人看得懂的巨型 fixture。用 sha256 摘要：正常情况只有一句"一致"；改动时精确告诉你"`tree/tree-bst#2` 变了"。`scripts/frame-digest.mjs --write` 更新基准，diff 在 git 里是可读的。

**零依赖 DOM 替身而不是 jsdom/puppeteer。** 页面只用到十来个 DOM API（`createElement`、`appendChild`、`classList`、`dataset`、`querySelector`、`innerHTML`…），`tests/support/dom.mjs` 200 行就够，而且**能在 CI 里离线跑**。代价是它不验证"好不好看"，只验证"会不会白屏 / 抛异常 / 高亮错行"——视觉部分仍然需要人眼，`npm run dump <章> <模板>` 就是为此准备的。

两者的运行时都不需要 `npm install`。

## 6. 改动指南

| 想做的事 | 动哪里 | 别忘了 |
| --- | --- | --- |
| 加一个模板 | 新建 `src/demos/<章>/<NN>-<id>.js` | 在 manifest `data` 里登记；`npm test` 会验证编号/顺序 |
| 改某个动画的步骤 | 对应 demo 的 `run` 生成器 | `npm run digest` 看哪些用例变了；确认后 `--write` |
| 改绘制样式 | `src/ui/draw-*.js` 或 `styles.css` | `npm run build`；`ui-smoke` 会抓崩溃 |
| 加一种新的帧类型 | `src/core/*-frame.js` + `src/ui/draw-*.js` + `measure.js` 分派 | `frames.test.mjs` 里的 `mode` 白名单 |
| 换数据结构 | 新增 `src/core/xxx-frame.js` 并排在 manifest 里 | 别改已有帧的字段名，否则指纹全变 |
| 查"哪一段还没讲" | `npm run coverage`（只看调用/赋值/分支三个桶） | 这是报告不是闸门，数字不达标不拦构建 |

## 7. 已知的设计债

1. **展示代码与驱动逻辑分离**：`code[]` 是字符串，`run` 是另一份手写实现。这正是 6 处错行问题的根因（行号是硬编码的下标）。彻底解法是 C 子集解释器：解析 `code[]`，执行时按 AST 节点出帧，`line` 由节点位置决定。
2. **`nextId()` 是模块级自增**：帧指纹因此依赖"生成顺序"。目前所有模板都在同一进程里按固定顺序生成，稳定；但如果将来并发/乱序生成 demo，指纹会不可比。届时改成按模板重置种子。
3. **窄屏是"能用"级别**：≤900px 改成单列、先图后码，svg 等比缩到容器宽度；递归栈面板改成横向卡片，触屏手势还没有专门打磨。
