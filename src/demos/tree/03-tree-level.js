/* 二叉树 · 3.2 层序遍历（队列） */
(function (NS) {
  'use strict';

  var CH = NS.CH, T = NS.T, FT = NS.FT, mkTree1 = NS.mkTree1;

CH('tree').demos.push({
    id: 'tree-level', name: '3.2 层序遍历（队列）',
    note: '用<b>队列</b>：出队一个就访问，并把它的左右孩子依次入队。天然按层输出；求高度、求最大宽度都是它的变形（靠 levelSize）。',
    code: [
      'void LevelOrder(BiTree T) {',
      '    if (!T) return;',
      '    BiTree Q[MAXSIZE];',
      '    int front = 0, rear = 0;',
      '    Q[rear++] = T;                       /* 根入队 */',
      '    while (front < rear) {',
      '        BiTree p = Q[front++];           /* 出队 */',
      '        visit(p);',
      '        if (p->lchild) Q[rear++] = p->lchild;   /* 左娃入队 */',
      '        if (p->rchild) Q[rear++] = p->rchild;   /* 右娃入队 */',
      '    }',
      '}'
    ],
    run: function* () {
      var root = mkTree1(), Q = [root], tags = {}, order = [];
      var qv = function () { return Q.map(function (x) { return x.val; }); };
      yield FT(0, '准备：层序 = 一层一层、从左到右。', root, {});
      yield FT(4, '根 ' + root.val + ' 入队。', root, { mark: root, side: ['队列 <b>' + qv().join(' ') + '</b>'] });
      while (Q.length) {
        var p = Q.shift();
        order.push(p.val); tags[p.id] = order.length;
        yield FT(6, '出队 ' + p.val + '，访问（第 ' + order.length + ' 个）。', root, { mark: p, tags: tags, side: ['队列 <b>' + (qv().join(' ') || '空') + '</b>'] });
        if (p.l) { Q.push(p.l); yield FT(8, '左孩子 ' + p.l.val + ' 入队。', root, { mark: p, tags: tags, side: ['队列 <b>' + qv().join(' ') + '</b>'] }); }
        if (p.r) { Q.push(p.r); yield FT(9, '右孩子 ' + p.r.val + ' 入队。', root, { mark: p, tags: tags, side: ['队列 <b>' + qv().join(' ') + '</b>'] }); }
      }
      yield FT(9, '队列空 → 结束。层序：<b>' + order.join(' ') + '</b>。', root, { tags: tags, side: ['层序 <b>' + order.join(' ') + '</b>'] });
    }
  });
})(window.DSANIM = window.DSANIM || {});
