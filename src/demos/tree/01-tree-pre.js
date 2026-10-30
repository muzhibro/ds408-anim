/* 3.1 前序遍历（递归） */
(function (NS) {
  'use strict';

  var CH = NS.CH, F = NS.F, T = NS.T, FT = NS.FT, mkTree1 = NS.mkTree1;

CH('tree').demos.push({
    id: 'tree-pre', name: '3.1 前序遍历（递归）',
    note: '<b>根 → 左 → 右</b>。三行代码的顺序就是访问顺序；递归调用栈的深度 = 树高 h。时间 O(n)，空间 O(h)。',
    code: [
      'void PreOrder(BiTree T) {',
      '    if (T == NULL) return;   /* 递归出口：空子树什么也不做 */',
      '    visit(T);                /* ① 根：进来的第一件事就是访问 */',
      '    PreOrder(T->lchild);     /* ② 左：一路往下 */',
      '    PreOrder(T->rchild);     /* ③ 右：左子树全部回来之后 */',
      '}'
    ],
    run: function* () {
      var root = mkTree1(), stack = [], tags = {}, order = [];
      yield FT(0, '准备：A(B(D, E(G)), C(∅, F))。前序 = 根 → 左 → 右。', root, {});
      function* pre(n) {
        if (!n) { yield FT(1, '碰到空指针，直接 return —— 这是递归出口。', root, { stack: stack.slice(), tags: tags }); return; }
        stack.push('PreOrder(' + n.val + ')');
        yield FT(1, '进入 ' + n.val + '：判空通过，往下走。', root, { mark: n, stack: stack.slice(), tags: tags });
        order.push(n.val); tags[n.id] = order.length;
        yield FT(2, '① 访问 ' + n.val + '（第 ' + order.length + ' 个）。', root, { mark: n, stack: stack.slice(), tags: tags });
        yield FT(3, '② 钻进左子树' + (n.l ? '：' + n.l.val : '（空）') + '。', root, { mark: n, stack: stack.slice(), tags: tags });
        yield* pre(n.l);
        yield FT(4, '左子树回来了，③ 钻进右子树' + (n.r ? '：' + n.r.val : '（空）') + '。', root, { mark: n, stack: stack.slice(), tags: tags });
        yield* pre(n.r);
        stack.pop();
        yield FT(5, n.val + ' 的左右都处理完，返回上层。', root, { stack: stack.slice(), tags: tags });
      }
      yield* pre(root);
      yield FT(5, '前序序列：<b>' + order.join(' ') + '</b>。栈深度最多 = 树高 4。', root, { tags: tags, side: ['前序 <b>' + order.join(' ') + '</b>'] });
    }
  });
})(window.DSANIM = window.DSANIM || {});
