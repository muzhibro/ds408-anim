/* 二叉树 · 3.11 最近公共祖先（LCA） */
(function (NS) {
  'use strict';

  var CH = NS.CH, T = NS.T, FT = NS.FT, setStack = NS.setStack;

CH('tree').demos.push({
    id: 'tree-lca', name: '3.11 最近公共祖先（LCA）',
    note: '后序递归，返回值只有三种含义：<b>NULL = 没找到</b>，<b>p/q = 找到了一个</b>，<b>祖先 = 已确定的答案</b>。左右都非空的那个结点就是 LCA。',
    code: [
      'BiTree LCA(BiTree T, BiTree p, BiTree q) {',
      '    if (!T || T == p || T == q) return T;   /* 三种出口合成一句 */',
      '    BiTree L = LCA(T->lchild, p, q);',
      '    BiTree R = LCA(T->rchild, p, q);',
      '    if (L && R) return T;                   /* 两边都有货 → 本结点是答案 */',
      '    return L ? L : R;                       /* 只有一边有货 → 原样上报 */',
      '}'
    ],
    run: function* () {
      var n4 = T(4), n5 = T(5), n2 = T(2, n4, n5);
      var n6 = T(6), n7 = T(7), n3 = T(3, n6, n7);
      var root = T(1, n2, n3);
      var p = n4, q = n7;
      var res = {}, cs = [];
      setStack(cs);
      yield FT(0, '准备：求结点 4 与 7 的最近公共祖先。', root, { ptrs: [{ name: 'p', node: p }, { name: 'q', node: q }] });
      function* lca(n, depth) {
        if (!n) { yield FT(1, '空结点 → 返回 NULL（这条分支没货）。', root, { ptrs: [{ name: 'p', node: p }, { name: 'q', node: q }] }); return null; }
        if (n === p || n === q) {
          yield FT(1, '命中 ' + n.val + '（就是 p 或 q）→ 立刻返回它，不再往下搜它的子树。', root, { mark: n, ptrs: [{ name: 'p', node: p }, { name: 'q', node: q }] });
          return n;
        }
        yield FT(2, '在 ' + n.val + '：先问左子树有没有。', root, { mark: n, ptrs: [{ name: 'p', node: p }, { name: 'q', node: q }] });
        cs.push('LCA(' + n.val + ')');
        var L = yield* lca(n.l, depth + 1);
        yield FT(3, 'BiTree R = LCA(T->rchild, p, q)：左边搜完了，再问右子树（左边拿到的 L 先攥在手里）。', root,
          { mark: n, ptrs: [{ name: 'p', node: p }, { name: 'q', node: q }],
            side: ['L = <b>' + (L ? L.val : 'NULL') + '</b>', 'R 待求'] });
        var R = yield* lca(n.r, depth + 1);
        if (L && R) {
          res.v = n;
          yield FT(4, n.val + '：左回来 ' + (L ? L.val : 'NULL') + '，右回来 ' + (R ? R.val : 'NULL') + ' → <b>两边都有货</b>，' + n.val + ' 就是 LCA。',
            root, { mark: n, ptrs: [{ name: 'p', node: p }, { name: 'q', node: q }], side: ['L = <b>' + (L ? L.val : 'NULL') + '</b>', 'R = <b>' + (R ? R.val : 'NULL') + '</b>'] });
          cs.pop();
          return n;
        }
        var one = L || R;
        yield FT(5, n.val + '：只有一边有货（' + (one ? one.val : 'NULL') + '）→ 原样上报。', root,
          { mark: n, ptrs: [{ name: 'p', node: p }, { name: 'q', node: q }], side: ['上报 <b>' + (one ? one.val : 'NULL') + '</b>'] });
        cs.pop();
        return one;
      }
      var ans = yield* lca(root, 0);
      setStack(null);
      yield FT(5, '结果：LCA(4, 7) = <b>' + (ans ? ans.val : 'NULL') + '</b>。时间 O(n)，空间 O(h)。', root,
        { mark: ans, ptrs: [{ name: 'p', node: p }, { name: 'q', node: q }], side: ['答案 <b>' + (ans ? ans.val : 'NULL') + '</b>'] });
    }
  });
})(window.DSANIM = window.DSANIM || {});
