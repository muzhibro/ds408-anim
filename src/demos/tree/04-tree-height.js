/* 二叉树 · 3.4 求树高（后序） */
(function (NS) {
  'use strict';

  var CH = NS.CH, T = NS.T, FT = NS.FT, mkTree1 = NS.mkTree1;

CH('tree').demos.push({
    id: 'tree-height', name: '3.4 求树高（后序）',
    note: '<b>必须后序</b>：要知道左右子树的高度才能算自己的。<code>h = max(hL, hR) + 1</code>；空子树返回 0（按"结点层数"定义）。时间 O(n)，空间 O(h)。',
    code: [
      'int TreeHeight(BiTree T) {',
      '    if (T == NULL) return 0;                       /* 空树高度 0 */',
      '    int hL = TreeHeight(T->lchild);                /* 先问左 */',
      '    int hR = TreeHeight(T->rchild);                /* 再问右 */',
      '    return (hL > hR ? hL : hR) + 1;                /* 取大的 + 自己这一层 */',
      '}'
    ],
    run: function* () {
      var root = mkTree1(), tags = {}, stack = [];
      yield FT(0, '准备：对每个结点 h = max(左高, 右高) + 1，所以孩子必须先算完。', root, {});
      function* h(n) {
        if (!n) { yield FT(1, '空树 → 返回 0。', root, { stack: stack.slice(), tags: tags }); return 0; }
        stack.push('TreeHeight(' + n.val + ')');
        yield FT(2, '进入 ' + n.val + '，先去问左子树。', root, { mark: n, stack: stack.slice(), tags: tags });
        var hl = yield* h(n.l);
        yield FT(3, n.val + ' 的左子树高度 = ' + hl + '，再去问右子树。', root, { mark: n, stack: stack.slice(), tags: tags });
        var hr = yield* h(n.r);
        var m = Math.max(hl, hr) + 1;
        tags[n.id] = m;
        stack.pop();
        yield FT(4, n.val + '：左 ' + hl + '，右 ' + hr + ' → 高度 ' + m + '。', root, { mark: n, stack: stack.slice(), tags: tags });
        return m;
      }
      var ans = yield* h(root);
      yield FT(5, '整棵树高 = <b>' + ans + '</b>。空指针访问了 n+1 次，时间 O(n)。', root, { tags: tags, side: ['树高 <b>' + ans + '</b>'] });
    }
  });
})(window.DSANIM = window.DSANIM || {});
