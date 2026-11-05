/* 3.13 沿线索中序遍历 */
(function (NS) {
  'use strict';

  var CH = NS.CH, T = NS.T, FT = NS.FT, setStack = NS.setStack, mkTree2 = NS.mkTree2, threadOf = NS.threadOf;

  CH('tree').demos.push({
    id: 'tree-thread-walk', name: '3.13 沿线索中序遍历',
    cases: [
      { label: '完全二叉树 A(B(D,E),C(F,G))', tip: '中序 D B E A F C G，每次跳线索都不超过一步',
        tree: function () { return mkTree2(); } },
      { label: '一般树 A(B(D,E(G)),C(∅,F))', tip: '中序 D B G E A C F，G→E→A 连跳两次',
        tree: function () { return T('A', T('B', T('D'), T('E', T('G'))), T('C', null, T('F'))); } },
      { label: '退化单链 A(B(C(D)))', tip: '一条线索串到底，遍历就是顺着往前走',
        tree: function () { return NS.mkChain(); } }
    ],
    note: '线索化之后遍历<b>不用栈也不用递归</b>：找中序第一个结点就是一路向左；之后每个结点的后继，<b>rtag = 1 就是 rchild</b>，rtag = 0 就去右子树里找最左的那个。整趟 O(n)，空间 O(1)。',
    code: [
      'ThreadNode *FirstNode(ThreadNode *p) {',
      '    while (p->ltag == 0) p = p->lchild;   /* 一路往左，直到左指针是线索 */',
      '    return p;',
      '}',
      'ThreadNode *NextNode(ThreadNode *p) {',
      '    if (p->rtag == 0) return FirstNode(p->rchild);  /* 有右孩子：去右边最左 */',
      '    return p->rchild;                     /* rtag = 1：rchild 存的就是后继 */',
      '}',
      'void InOrder(ThreadNode *T) {',
      '    ThreadNode *p = FirstNode(T);         /* 中序第一个：最左下 */',
      '    while (p) { visit(p); p = NextNode(p); }',
      '}'
    ],
    run: function* (c) {
      var root = (c && c.tree) ? c.tree() : mkTree2();
      var built = threadOf(root);
      var th = built.threads, seen = [];

      function opt(n) {
        return {
          mark: n, threads: th,
          ptrs: [{ name: 'p', node: n }],
          side: ['已访问：<b>' + (seen.length ? seen.join(' ') : '—') + '</b>', '实线 = 孩子，<b>虚线 = 线索</b>']
        };
      }
      function byId(id) {
        var i, out = null;
        (function rec(n) { if (!n || out) return; if (n.id === id) { out = n; return; } rec(n.l); rec(n.r); })(root);
        return out;
      }

      setStack(null);
      yield FT(8, 'InOrder(T)：线索已经建好，下面不用栈、不用递归，顺着线索走。', root, opt(root));
      yield FT(9, 'ThreadNode *p = FirstNode(T)：先找到中序第一个结点。', root, opt(root));

      function* firstNode(from) {
        var cur = from;
        yield FT(0, 'FirstNode(' + cur.val + ')：从这里出发，一直往左。', root, opt(cur));
        while (cur.l) {
          yield FT(1, cur.val + ' 的 ltag = 0（有左孩子）→ 继续往左下走。', root, opt(cur));
          cur = cur.l;
        }
        yield FT(2, cur.val + ' 的 ltag = 1：左指针是线索，没有左孩子，它就是这一段的第一个。', root, opt(cur));
        return cur;
      }

      function* nextNode(p) {
        yield FT(4, 'NextNode(' + p.val + ')：问它"你的后继是谁"。', root, opt(p));
        if (p.r) {
          yield FT(5, p.val + ' 的 rtag = 0（有右孩子）→ 后继是右子树里最左的那个，回 FirstNode 找。', root, opt(p));
          return yield* firstNode(p.r);
        }
        var nx = byId(th[p.id] ? th[p.id].pr : null);
        yield FT(6, p.val + ' 的 rtag = 1 → rchild 里存的就是后继：' + (nx ? nx.val : '空（已是最后一个）') + '。', root, opt(p));
        return nx;
      }

      var p = yield* firstNode(root);
      while (p) {
        seen.push(p.val);
        yield FT(10, 'visit(' + p.val + ') → 已访问：<b>' + seen.join(' ') + '</b>。', root, opt(p));
        p = yield* nextNode(p);
      }
      yield FT(11, '遍历结束：' + seen.join(' ') + '。整趟 O(n)，空间 O(1)。', root, opt(null));
    }
  });
})(window.DSANIM = window.DSANIM || {});
