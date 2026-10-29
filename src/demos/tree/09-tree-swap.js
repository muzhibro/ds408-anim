/* 二叉树 · 3.10 交换左右子树（镜像） */
(function (NS) {
  'use strict';

  var CH = NS.CH, T = NS.T, FT = NS.FT, mkTree2 = NS.mkTree2;

CH('tree').demos.push({
    id: 'tree-swap', name: '3.10 交换左右子树（镜像）',
    note: '后序：<b>先递归交换左右孩子，再交换自己的两个指针</b>。只动指针，不动数据。时间 O(n)，空间 O(h)。',
    code: [
      'void SwapLR(BiTree T) {',
      '    if (!T) return;',
      '    SwapLR(T->lchild);        /* 先把左边整棵处理干净 */',
      '    SwapLR(T->rchild);',
      '    BiTree t = T->lchild;     /* 再交换自己的两个孩子 */',
      '    T->lchild = T->rchild;',
      '    T->rchild = t;',
      '}'
    ],
    run: function* () {
      var root = mkTree2(), stack = [];
      yield FT(0, '准备：把这棵树变成它的镜像（左右完全对调）。', root, {});
      function* sw(n) {
        if (!n) return;
        stack.push('SwapLR(' + n.val + ')');
        yield FT(1, '进入 ' + n.val + '，先处理左子树。', root, { mark: n, stack: stack.slice() });
        yield* sw(n.l);
        yield* sw(n.r);
        var a = n.l, b = n.r;                        /* 交换前先记住两个孩子 */
        var t = n.l; n.l = n.r; n.r = t;
        stack.pop();
        if (!a && !b) {
          yield FT(5, n.val + ' 是叶子：两个指针都是空，交换等于没变（代码照样做了两次赋值）。', root, { mark: n, stack: stack.slice() });
        } else {
          yield FT(5, n.val + ' 的左右指针已对调：' + (a ? a.val : 'NULL') + ' 换到右边，' + (b ? b.val : 'NULL') + ' 换到左边。', root,
            { mark: n, stack: stack.slice(), swapPair: [a ? a.id : null, b ? b.id : null] });
        }
      }
      yield* sw(root);
      yield FT(7, '镜像完成：原来最左边的 D 现在跑到了最右边。', root, {});
    }
  });
})(window.DSANIM = window.DSANIM || {});
