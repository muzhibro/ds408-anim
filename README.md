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
