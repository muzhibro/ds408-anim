/* 3.10 交换左右子树（镜像） */
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
        yield FT(1, '进入 ' + n.val + '：先挡掉空结点（if (!T) return），然后从最深层往上收工。', root, { mark: n, stack: stack.slice() });
        yield FT(2, 'SwapLR(T->lchild)：先把<b>左边整棵</b>递归交换完。', root, { mark: n, stack: stack.slice() });
        yield* sw(n.l);
        yield FT(3, 'SwapLR(T->rchild)：左边处理干净了，再处理右边。', root, { mark: n, stack: stack.slice() });
        yield* sw(n.r);
        var a = n.l, b = n.r;                        /* 交换前先记住两个孩子 */
        yield FT(4, 'BiTree t = T->lchild：交换前先把左孩子存到 t，否则一改指针就找不回来了。', root,
          { mark: n, stack: stack.slice(), swapPair: [a ? a.id : null, b ? b.id : null] });
        var t = n.l; n.l = n.r;
        yield FT(5, 'T->lchild = T->rchild：左指针改指原来的右孩子' + (b ? ' ' + b.val : '（NULL）') + '。', root,
          { mark: n, stack: stack.slice(), swapPair: [a ? a.id : null, b ? b.id : null] });
        n.r = t;
        stack.pop();
        if (!a && !b) {
          yield FT(6, n.val + ' 是叶子：两个指针都是空，交换等于没变（代码照样做了两次赋值）。', root, { mark: n, stack: stack.slice() });
        } else {
          yield FT(6, 'T->rchild = t：右指针改指存下来的原左孩子' + (a ? ' ' + a.val : '（NULL）') + ' → 这一层的左右对调完成。', root,
            { mark: n, stack: stack.slice(), swapPair: [a ? a.id : null, b ? b.id : null] });
        }
      }
      yield* sw(root);
      yield FT(7, '镜像完成：原来最左边的 D 现在跑到了最右边。只动指针，没搬数据。', root, {});
    }
  });
})(window.DSANIM = window.DSANIM || {});
