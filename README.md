# 408 数据结构 · 可交互动画

[![test](https://github.com/muzhibro/ds408-anim/actions/workflows/test.yml/badge.svg)](https://github.com/muzhibro/ds408-anim/actions/workflows/test.yml)

在线：<https://muzhibro.github.io/ds408-anim/>

左边 C 代码逐行高亮，右边同一时刻的数据结构状态（链表 / 二叉树 / 数组 / 图，外带递归栈、邻接表、入度表）。一步步点着看，每帧一句说明。

5 章 38 个模板 70 个用例 2932 帧。零依赖，双击 `index.html` 就能看。

## 跑起来

```bash
# 只想看：双击 index.html

npm run build     # src/ -> index.html，改完源码必跑
npm test          # 50 个测试，1 秒
npm run dump list reverse        # 打印某模板每帧的高亮行，人工核对用
npm run coverage                 # 哪些代码行从来没被高亮过
```

Node ≥ 22。没有 `npm install`，也没有 `node_modules`。

## 目录

```
index.html            构建产物，单文件（这个是要提交的，别手改）
legacy/index.html     重构前的单文件版本，只作对照
src/
  index.html          页面骨架，{{STYLES}} / {{SCRIPTS}} 两个占位符
  manifest.json       模块清单，数组顺序就是加载顺序
  core/               帧工厂，不认 DOM
    registry.js       CHAPTERS / CH(id)
    stack.js          递归栈的当前状态（帧工厂从这儿读）
    list.js           mk / mkHead / build / walk / F
    tree.js           T / cloneTree / FT
    array-frame.js    FA
    graph-frame.js    FG
  demos/<章>/<NN>-<id>.js   一个模板一个文件
  ui/                 渲染层，只认帧不认算法
    svg.js            SVG 图元
    draw-list|tree|array|graph.js  四种布局
    measure.js        量包围盒，算 viewBox
    types.js          结构体定义文本
    highlight.js      C 代码上色
    app.js            切章 / 播放器 / 深链接 / 搜索 / 测试钩子
  ui/styles.css
scripts/
  build.mjs           拼装 + 语法检查
  frame-digest.mjs    帧指纹
  dump-frames.mjs     逐帧打印
  coverage.mjs        覆盖率报告
tests/                node:test，自带一个 DOM 替身
```

## 加一个模板

以"链表求和"为例。

1. 新建 `src/demos/list/15-sum.js`：

```js
/* demo · 链表：求和 */
(function (NS) {
  'use strict';
  var CH = NS.CH, F = NS.F, mkHead = NS.mkHead, build = NS.build;

  CH('list').demos.push({
    id: 'sum',
    name: '链表求和',
    note: '把链表从头走到尾，<b>sum</b> 一路累加。',
    code: [
      'int Sum(LinkList L) {',
      '    int sum = 0;',
      '    for (LNode *p = L->next; p; p = p->next)',
      '        sum += p->data;',
      '    return sum;',
      '}'
    ],
    run: function* () {
      var head = mkHead('L');
      var nodes = build([3, 1, 4, 1, 5]);
      head.next = nodes[0];
      var row = { label: 'L', head: head };
      var sum = 0;

      yield F(1, 'sum = 0，准备遍历。', [row], [], null);
      for (var i = 0; i < nodes.length; i++) {
        var p = nodes[i];
        yield F(2, 'p 指向 ' + p.val + '，还没走到头。', [row], [{ name: 'p', node: p }], p);
        sum += Number(p.val);
        yield F(3, 'sum += ' + p.val + '，sum = ' + sum + '。', [row], [{ name: 'p', node: p }], null);
      }
      yield F(4, 'p 变成空指针，循环结束，返回 sum = ' + sum + '。', [row], [], null);
    }
  });
})(window.DSANIM = window.DSANIM || {});
```

2. 在 `src/manifest.json` 的 `data` 里加上 `"src/demos/list/15-sum.js"`（位置就是显示顺序）。
3. `npm run build && npm test`，再 `npm run dump list sum` 逐帧看一眼。

漏登记、编号重复、顺序不对，测试都会报出来。

## 一帧是什么

`run(case)` 是生成器，`yield` 一次就是一帧：

```js
{ mode: 'list',   // list / tree / array / graph，决定用哪个 draw-* 画
  line: 3,        // 高亮 code[] 的第几行（0 起）
  desc: '…',      // 右侧说明
  rows: [ … ] }   // 该模式的载荷
```

帧里的数据结构是**深拷贝的快照**：`F()` 把可达结点复制一遍再把 `next` 指回副本，所以后面继续改链表不会污染已经产出的帧，帧里也能有环（循环链表、双向链表）。

四种模式的载荷字段见 `docs/ARCHITECTURE.md`。

## 测试

| 文件 | 管什么 |
| --- | --- |
| `frames.test.mjs` | 帧指纹、`line` 越界、空说明、链表末态、章节清单 |
| `ui-smoke.test.mjs` | 2932 帧逐帧渲染：不白屏、说明非空、高亮行对得上 |
| `structure.test.mjs` | manifest ↔ 文件、demo 文件名 ↔ id ↔ 注册顺序 |
| `build.test.mjs` | 构建能跑、产物无占位符无外链、产物帧指纹 = 源码帧指纹 |
| `resume.test.mjs` | 刷新后回到上次那一帧；存储不可用时不白屏 |
| `player.test.mjs` | 播放/暂停/播完复位 |
| `speed.test.mjs` | 速度档位与记忆 |
| `shell.test.mjs` | 搜索、拖宽、地址栏、深链接 |
| `highlight.test.mjs` | 词元拼回去必须逐字等于原文 |
| `coverage.test.mjs` | 报告脚本本身能跑（不断言覆盖率数字） |

帧不写成逐帧断言，是因为 38 个模板全写出来会是几千行的 fixture，没人看。指纹（sha256）平时只显示"一致"，变动时直接告诉你是 `tree/tree-bst#2`。确认无误后 `npm run digest:write` 更新基准。

DOM 替身是自己写的（200 行），不是 jsdom，因为要能离线跑。代价是它只管"会不会炸"，不管"好不好看"——好看得靠 `npm run dump` 和人眼。

## 覆盖率

```bash
npm run coverage            # 只列调用/赋值/分支这类要补的
npm run coverage -- --all   # 连声明行、函数签名一起列
npm run coverage tree       # 只看一章
```

遍历所有帧收集 `frame.line`，和 `code[]` 里"有实质动作"的行做差集。永远退出 0——某行不亮未必是错，有些分支这个用例根本走不到，要人判断。

现在是 359/359。补到 100% 之前它报的缺口都是真漏讲：Dijkstra 的松弛、`tree-complete` 的入队、`tree-level` 的 `visit(p)`、`tree-swap` 的递归调用。补的时候顺手又发现了几处行号错位（Kruskal 的 `a == b`、Dijkstra 的 `done[u] = 1`、BFS 的起点入队、拓扑的出栈删边）。

## 踩过的坑

**行号错位。** 帧的 `line` 是手写下标，审计时揪出 6 处，补覆盖率时又揪出十几处：

| 位置 | 原来 | 改为 |
| --- | --- | --- |
| `tree/05-tree-complete` 首次遇空孩子 / 空后又出现结点 / 出队入队 | `FT(6,7,8)` | `FT(7,8,6)` |
| `tree/04-tree-height` 进入结点先问左子树 | `FT(1)` | `FT(2)` |
| `tree/07-tree-bst` 反例判定 | `FT(4)` | `FT(3)` |
| `sort/01-sort-insert` 两次比较 | `FA(4)` | `FA(3)` |
| `sort/04-sort-quick` 比较/填坑/相遇落位 | `FA(4,5,6,7,9)` | `FA(3,4,5,6,8)` |
| `sort/06-sort-merge` 单元素返回、对半劈 | `FA(12,13)` | `FA(11,12)` |

共 21 个用例的帧内容变了，帧数一个没变。这类错误光看代码看不出来——`line` 只是个数字，只有拿说明去对代码那行才知道对不对，`npm run dump` 就是干这个的。

**推送。** 这台机器直连 GitHub 会超时，靠本地代理。代理关了 `git push` 会卡死，先 `Test-NetConnection 127.0.0.1 -Port 10808` 看一眼；代理关掉时用 `git -c http.proxy= -c https.proxy= push`。

**改文本编码。** 用 PowerShell 的 `Set-Content` 改 `index.html` 会把 UTF-8 当 GBK 存，页面立刻乱码。改文件用编辑器或 Node。

## 几个决定

不用 React / Vite / TS：交付方式是"发个文件，双击就能看"。带 runtime 或依赖 CDN，在学校机房、没网的电脑上就翻车。命名空间模块 + 顺序拼接够了，构建脚本 60 行。

产物是单文件：发微信、拷 U 盘、`file://` 双击都行；`src/` 是给人看和改的，两边由 manifest 和测试保证一致。

帧里存快照不存操作序列：渲染层无状态，能跳帧、能回放、能离线全量跑测试。代价是内存，三千帧几 MB，无所谓。

C 代码是展示文本，动画是另一份手写的 JS：这是最实在的短板，行号错位就是从这儿来的。真解法是写个 C 子集解释器，让帧从源码执行里出来。

## 还没做的

1. 代码与动画两份实现（上面那条）。写个 C 子集解释器能让 `line` 由 AST 节点决定，再也不会指错。
2. 只做了第 2–6 章。第 1 章（顺序表、复杂度）和第 7 章（B 树、散列、KMP）没有。
3. `app.js` 快 900 行了，切章、播放器、深链接、搜索、分隔条都塞在里面，该拆成几个文件。
4. 浏览器层没进 CI。`npm test` 用的是 DOM 替身，焦点框、拖拽、localStorage 落盘这些测不到，现在靠手跑 headless Chrome。
5. 没有体积预算。现在 252 KB（gzip 68.6 KB），加一条 `< 300 KB` 的断言省得以后悄悄膨胀。
