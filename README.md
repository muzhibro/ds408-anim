# 408 数据结构 · 可交互动画

[![test](https://github.com/muzhibro/ds408-anim/actions/workflows/test.yml/badge.svg)](https://github.com/muzhibro/ds408-anim/actions/workflows/test.yml)

**在线看**：<https://muzhibro.github.io/ds408-anim/>

把 408 里最常考的算法过程做成**可以一步一步看**的动画：左边是 C 代码逐行高亮（当前执行的判定条件单独标出来），右边是同一时刻真实的数据结构状态（链表 / 二叉树 / 数组 / 图，外加递归栈、邻接表、入度表）。

- **5 章 38 个模板 69 个用例 1949 帧**，每帧都带一句人话说明
- 零依赖、纯静态：**双击 `index.html` 就能看**，不需要装环境、不需要联网
- 帧序列可自动化校验：`npm test` 0.5 秒跑完 1949 帧

## 快速开始

```bash
# 只想看动画：直接双击 index.html

npm run build   # 从 src/ 生成 index.html（改了源码之后跑这个）
npm test        # 27 个测试：帧指纹 / 全帧渲染 / 行号自洽 / 构建一致性 / 进度记忆 / 覆盖率报告
npm run dump list reverse      # 打印某个模板的代码行号与每帧的高亮行，人工核对用
npm run coverage               # 报告：哪些代码行从来没被任何一帧高亮过
```

需要 Node.js ≥ 22（只用到内置模块，**没有 `npm install`**）。

## 目录结构

```
index.html              构建产物：单文件页面（双击即开）
legacy/index.html       重构前的原始单文件版本，仅作对照，不再维护
src/
  index.html            页面骨架，留 {{STYLES}} / {{SCRIPTS}} 两个占位符
  manifest.json         模块清单：数组顺序 = 脚本加载顺序
  core/                 帧工厂与基础设施（不认识 DOM）
    registry.js         章节注册表 CHAPTERS / CH(id)
    stack.js            递归栈的“当前活跃栈”（帧工厂读它）
    list.js             mk/mkHead/build/walk/F —— 链表帧
    tree.js             T/cloneTree/FT —— 二叉树帧
    array-frame.js      FA —— 数组帧
    graph-frame.js      FG —— 图帧
  demos/<章>/<NN>-<id>.js  每个模板一个文件，文件名 = 序号 + 模板 id
  ui/                   渲染层（只认帧，不认算法）
    svg.js              SVG 图元（el/txt/line/quad/...）
    draw-list|tree|array|graph.js   四种布局与绘制
    measure.js          量一帧的包围盒，用来算 viewBox
    types.js            结构体定义文本
    app.js              标签页 / 模板切换 / 播放器 / URL 深链接 / 测试钩子
  ui/styles.css
scripts/
  build.mjs             拼装 + 语法检查 → index.html
  frame-digest.mjs      帧指纹：改动后一眼看出哪个用例变了
  dump-frames.mjs       打印某模板的帧，人工核对高亮行
tests/                  node:test，含一个零依赖 DOM 替身
docs/ARCHITECTURE.md    设计说明：为什么这么分层、帧模型、扩展方式
```

## 加一个模板

以"链表求和"为例，三步。

**1. 新建 `src/demos/list/15-sum.js`**

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

**2. 在 `src/manifest.json` 的 `data` 数组里登记**（位置就是显示顺序）

```json
"src/demos/list/15-sum.js"
```

**3. 构建 + 验证**

```bash
npm run build && npm test
npm run dump list sum        # 逐帧看一眼高亮行对不对
```

测试里的"demo 文件名与模板 id 一一对应""38 个模板"这些断言会拦下漏登记、编号重复、顺序错乱。

## 帧模型

每个模板的 `run(case)` 是个**生成器**，`yield` 出来的东西就是一帧：

```js
{ mode: 'list' | 'tree' | 'array' | 'graph',   // 用哪种布局画
  line: 3,                                     // 高亮第几行（0 起）
  desc: '…',                                   // 这一帧在干什么
  rows / ptrs / mark / …                       // 该时刻的数据结构快照
}
```

关键在于**快照是深拷贝的**：`F()` 把当时的结点图拷一份存进帧里，所以后面再怎么改链表也不会篡改历史帧。渲染层（`src/ui/`）只读帧、不认识算法；数据层（`src/demos/`）只产帧、不碰 DOM。这条分界线就是它能被自动测试的原因——1949 帧可以在 Node 里全部跑一遍，不需要浏览器。

细节见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

## 测试都测什么

| 测试 | 拦什么问题 |
| --- | --- |
| 帧指纹（`tests/fixtures/frames.golden.json`） | 改了某个模板后，精确指出**哪个用例的帧变了**；确认无误后 `npm run digest:write` 更新基准 |
| 1949 帧全渲染（`tests/ui-smoke.test.mjs`，DOM 替身） | 白屏、抛异常、说明为空、高亮行和 `frame.line` 对不上 |
| 行号自洽 | 帧的 `line` 落在 `code[]` 范围内、说明不为空 |
| `expect` 末态断言 | 链表模板最后一帧的结构必须和预期一致（14 个模板） |
| 结构自检 | manifest 与 `src/` 文件互相对得上、demo 文件名与 id 一一对应 |
| 构建一致性 | `index.html` 里的帧指纹必须等于源码的帧指纹；无未替换占位符、无外链 |
| 进度记忆（`tests/resume.test.mjs`） | 刷新后能不能回到上次那一帧；存储被禁用/写满时**不能**因此白屏；旧数据越界要夹回合法范围 |
| 覆盖率报告（`tests/coverage.test.mjs`） | 报告脚本本身能不能跑、参数对不对；**不断言覆盖率数字**——补内容是常态，用数字卡人只会让人去改测试 |

## 覆盖率报告：哪些行从来没讲过

```bash
npm run coverage          # 只列"调用 / 赋值 / 分支"这类需要补的缺口
npm run coverage -- --all # 连声明行、函数签名行一起列
npm run coverage tree     # 只看某一章
```

它遍历每个模板的每一帧，收集 `frame.line`，再和 `code[]` 里"有实质动作"的行做差集。**这是报告不是闸门**：永远退出 0，因为"这一行不亮"未必是错（有些分支这个用例根本走不到），要人来判断。

当前数字：**实质行 245 / 359 覆盖（68%），38 个模板里 31 个有缺口**，其中 17 行是函数调用、14 行是赋值、47 行是判定。几个典型的：

| 模板 | 从没亮过 | 说明 |
| --- | --- | --- |
| `graph/graph-dijkstra` | `dist[v] = dist[u] + G.edge[u][v];` | **松弛操作**整段没讲 |
| `tree/tree-complete` | `Q[rear++] = p->lchild;` | 入队动作没讲（只讲了出队，这也是之前错行的根源） |
| `tree/tree-level` | `while (front < rear) {`、`visit(p);` | 循环条件和访问没讲 |
| `tree/tree-bst` | `return IsBST(T->rchild, pre);` | 右子树递归没发生 |
| `tree/tree-swap` | `SwapLR(T->lchild);`、`T->rchild = t;` | 递归和指针交换都没讲 |

这份清单就是"还差哪些讲解"的待办。

## 这次重构顺带修掉的错行

审计时发现 6 处"说明和高亮行对不上"，都是生成器里手写的行号下标错位（原文件里是硬编码的 `FT(8)` 这类调用）：

| 位置 | 原来 | 改为 | 原因 |
| --- | --- | --- | --- |
| `tree/05-tree-complete` 首次遇到空孩子 | `FT(6)` | `FT(7)` | 指到了出队语句 |
| `tree/05-tree-complete` 空之后又出现结点 | `FT(7)` | `FT(8)` | 指到了 `if (!p)` |
| `tree/05-tree-complete` 出队并入队两个孩子 | `FT(8)` | `FT(6)` | 指到了 `if (seenNull)`，连续 7 帧全错 |
| `tree/04-tree-height` 进入结点先问左子树 | `FT(1)` | `FT(2)` | 指到了判空行 |
| `tree/07-tree-bst` 反例判定不是 BST | `FT(4)` | `FT(3)` | 指到了 `*pre = T->data`，应为比较行 |
| `sort/01-sort-insert` 两次比较 | `FA(4)` | `FA(3)` | 指到了赋值行，判定框不出现 |
| `sort/04-sort-quick` 比较 / 填坑 / 坑位转移 / low 右移 / 相遇落位 | `FA(4,5,6,7,9)` | `FA(3,4,5,6,8)` | 整体错位一行，11 帧里连续错 |
| `sort/06-sort-merge` 单元素直接返回、对半劈 | `FA(12,13)` | `FA(11,12)` | 指到了 `int mid = …` 和递归调用行 |

另修了一处审计没列出的：`tree/07-tree-bst` 里"pre 更新为"指到了右子树递归行，应为 `*pre = T->data`。

改完一共只有 21 个用例的帧内容变化，**每个用例的帧数一帧没变**，总帧数仍是 1949。

## 设计取舍（也是可以追问的点）

- **为什么不用 React / Vite / TypeScript**：交付场景是"发给同学、老师，双击就能看"。一旦引入构建工具，产物就要带 runtime 或者依赖 CDN，离线/学校机房电脑上容易翻车。所以选择"命名空间模块 + 顺序拼接"，构建脚本 60 行，零依赖。
- **为什么产物是单文件**：`index.html` 一个文件即可分发；`src/` 里是给人看的、可维护的源码，两边由 manifest 和测试保证一致。
- **为什么 C 代码只是展示文本**：当前 `code[]` 是手写的字符串，动画由 JS 生成器另外编排，两者靠人工保持一致——这是最实在的短板。下一步可以做"C 子集解释器"，让动画直接从源码推导出来（见下）。
- **帧里存的是快照而不是操作序列**：好处是渲染无状态、可跳帧、可回放、可离线全量测试；代价是内存（1949 帧就几 MB，可接受）。

## 已知限制 / 下一步

1. **代码与动画是两份实现**——最值得做的升级：写一个 C 子集解释器（指针、结构体、数组、递归），让 `run` 从源码执行中自动产生帧。这一步做完，"高亮行对不上"这类问题从根上消失。
2. 只覆盖第 2–6 章（线性表、树、图、查找、排序），第 1 章绪论和第 7 章文件没做。
3. 窄屏（≤900px）改成单列：**先图后码**——说明、动画、递归栈在上，代码在下；图的 svg 等比缩放到容器宽度，代码区自己滚。已用 headless Chrome 在 500×900 下逐屏截图验收，真正的 390px 宽（iPhone）没在真机上试过。
4. **git 历史只有一次提交**：项目最初是单文件手写（版本演进都在这一个文件里），重构后才建的仓库。`legacy/index.html` 保留了重构前的原版，可以用 `git diff --no-index legacy/index.html index.html` 对照重构前后的差别。

## 附

- `使用说明.md`：给"只想看动画"的人的操作说明（快捷键、面板含义）
- `docs/ARCHITECTURE.md`：分层、帧模型、构建与测试的实现细节
