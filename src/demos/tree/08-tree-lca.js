/* 3.11 最近公共祖先（LCA） */
(function (NS) {
  'use strict';

  var CH = NS.CH, T = NS.T, FT = NS.FT, setStack = NS.setStack;

  /* 用例里用值指定 p / q，建完树再按值找回结点引用 */
  function findByVal(n, val) {
    if (!n) return null;
    if (n.val === String(val)) return n;
    return findByVal(n.l, val) || findByVal(n.r, val);
  }

  CH('tree').demos.push({
    id: 'tree-lca', cases: [
      { label: '分居两侧：4 和 7', tip: '左右各回来一个非空，根 1 就是答案',
        tree: function () { return T(1, T(2, T(4), T(5)), T(3, T(6), T(7))); }, p: 4, q: 7 },
      { label: '同一侧：4 和 5（兄弟）', tip: '两个都在根的左边，答案在 2 上，根 1 只收到一个非空',
        tree: function () { return T(1, T(2, T(4), T(5)), T(3, T(6), T(7))); }, p: 4, q: 5 },
      { label: '祖孙：2 和 4', tip: 'p 本身就是 q 的祖先：搜到 2 就返回，不再往 2 的子树里找 4',
        tree: function () { return T(1, T(2, T(4), T(5)), T(3, T(6), T(7))); }, p: 2, q: 4 },
      { label: '右子树里分岔：6 和 7', tip: '整个左子树都空手而归，答案在右子树内部',
        tree: function () { return T(1, T(2, T(4), T(5)), T(3, T(6), T(7))); }, p: 6, q: 7 },
      { label: '退化单链：3 和 4', tip: '一条左链没有分岔，LCA 就是浅的那个',
        tree: function () { return T(1, T(2, T(3, T(4)))); }, p: 3, q: 4 }
    ],
    name: '3.11 最近公共祖先（LCA）',
    note: '后序递归，返回值只有三种含义：<b>NULL = 没找到</b>，<b>p/q = 找到了一个</b>，<b>祖先 = 已确定的答案</b>。左右都非空的那个结点就是 LCA；只有一边非空就把它原样上报。',
    code: [
      'BiTree LCA(BiTree T, BiTree p, BiTree q) {',
      '    if (!T || T == p || T == q) return T;   /* 三种出口合成一句 */',
      '    BiTree L = LCA(T->lchild, p, q);',
      '    BiTree R = LCA(T->rchild, p, q);',
      '    if (L && R) return T;                   /* 两边都有货 → 本结点是答案 */',
      '    return L ? L : R;                       /* 只有一边有货 → 原样上报 */',
      '}'
    ],
    run: function* (c) {
      var root = (c && c.tree) ? c.tree() : T(1, T(2, T(4), T(5)), T(3, T(6), T(7)));
      var pv = (c && c.p != null) ? c.p : 4;
      var qv = (c && c.q != null) ? c.q : 7;
      var p = findByVal(root, pv), q = findByVal(root, qv);
      var res = {}, cs = [];

      function ptrs() { return [{ name: 'p', node: p }, { name: 'q', node: q }]; }
      function show(v) { return v ? v.val : 'NULL'; }

      setStack(cs);
      yield FT(0, '准备：求结点 ' + pv + ' 与 ' + qv + ' 的最近公共祖先。', root, { ptrs: ptrs() });

      function* lca(n) {
        if (!n) { yield FT(1, '空结点 → 返回 NULL（这条分支没货）。', root, { ptrs: ptrs() }); return null; }
        if (n === p || n === q) {
          yield FT(1, '命中 ' + n.val + '（就是 p 或 q）→ 立刻返回它，不再往下搜它的子树。', root,
            { mark: n, ptrs: ptrs() });
          return n;
        }
        yield FT(2, '在 ' + n.val + '：先问左子树有没有。', root, { mark: n, ptrs: ptrs() });
        cs.push('LCA(' + n.val + ')');
        var L = yield* lca(n.l);
        yield FT(3, 'BiTree R = LCA(T->rchild, p, q)：左边搜完了，再问右子树（左边拿到的 L 先攥在手里）。', root,
          { mark: n, ptrs: ptrs(), side: ['L = <b>' + show(L) + '</b>', 'R 待求'] });
        var R = yield* lca(n.r);
        if (L && R) {
          res.v = n;
          yield FT(4, n.val + '：左回来 ' + show(L) + '，右回来 ' + show(R) + ' → <b>两边都有货</b>，' + n.val + ' 就是 LCA。',
            root, { mark: n, ptrs: ptrs(), side: ['L = <b>' + show(L) + '</b>', 'R = <b>' + show(R) + '</b>'] });
          cs.pop();
          return n;
        }
        var one = L || R;
        yield FT(5, n.val + '：只有一边有货（' + show(one) + '）→ 原样上报。', root,
          { mark: n, ptrs: ptrs(), side: ['上报 <b>' + show(one) + '</b>'] });
        cs.pop();
        return one;
      }

      var ans = yield* lca(root);
      setStack(null);
      yield FT(5, '结果：LCA(' + pv + ', ' + qv + ') = <b>' + show(ans) + '</b>。时间 O(n)，空间 O(h)。', root,
        { mark: ans, ptrs: ptrs(), side: ['答案 <b>' + show(ans) + '</b>'] });
    }
  });
})(window.DSANIM = window.DSANIM || {});
