/* 3.6 判断完全二叉树 */
(function (NS) {
  'use strict';

  var CH = NS.CH, F = NS.F, T = NS.T, FT = NS.FT, mkTree2 = NS.mkTree2;

CH('tree').demos.push({
    id: 'tree-complete', name: '3.6 判断完全二叉树',
    note: '层序遍历<b>把所有孩子（含空）都入队</b>：一旦在队列里遇到了 NULL，后面就不能再出现非空结点。遇到第一个空即"开关打开"。',
    code: [
      'int IsComplete(BiTree T) {',
      '    if (!T) return 1;',
      '    BiTree Q[MAXSIZE];',
      '    int front = 0, rear = 0, seenNull = 0;',
      '    Q[rear++] = T;',
      '    while (front < rear) {',
      '        BiTree p = Q[front++];',
      '        if (!p) { seenNull = 1; continue; }   /* 见到空 → 开关打开 */',
      '        if (seenNull) return 0;               /* 空之后又有实体 → 不是完全树 */',
      '        Q[rear++] = p->lchild;                /* 空也要入队！ */',
      '        Q[rear++] = p->rchild;',
      '    }',
      '    return 1;',
      '}'
    ],
    run: function* () {
      var good = mkTree2(), bad = T('A', T('B', T('D'), T('E')), T('C', null, T('G')));
      function* walkOne(root, label) {
        var Q = [root], seenNull = 0, cnt = 0, tags = {};
        yield FT(0, label + '：IsComplete 进入，从根开始。', root, { side: ['队列 <b>' + root.val + '</b>'] });
        yield FT(1, 'if (!T) return 1：空树 / 空子树也算完全二叉树，先挡住这个边界。', root, {});
        yield FT(2, 'BiTree Q[MAXSIZE]：层序遍历需要一个队列，元素是<b>结点指针</b>（空指针也要放）。', root, {});
        yield FT(3, 'front = 0, rear = 0，seenNull = 0 —— seenNull 是"队列里已经出现过空孩子"的开关。', root, { side: ['seenNull = <b>0</b>'] });
        yield FT(4, 'Q[rear++] = T：根入队。', root, { side: ['队列 <b>' + root.val + '</b>'] });
        while (Q.length) {
          yield FT(5, 'while (front < rear)：队列里还有指针（含空指针）→ 继续。', root, { side: ['seenNull = <b>' + seenNull + '</b>'] });
          var p = Q.shift();
          if (!p) {
            if (!seenNull) yield FT(7, '第一次遇到空孩子 → 打开"见过空"开关。', root, { side: ['seenNull = <b>1</b>'] });
            seenNull = 1;
            continue;
          }
          if (seenNull) {
            yield FT(8, '空之后又出现了实体结点 ' + p.val + ' → <b>不是完全二叉树</b>。', root, { mark: p, side: ['结果 <b>0</b>'] });
            return false;
          }
          cnt++; tags[p.id] = cnt;
          yield FT(6, '出队 ' + p.val + '（编号 ' + cnt + '），把两个孩子都入队（空也入）。', root, { mark: p, tags: tags, side: ['编号 <b>' + cnt + '</b>'] });
          Q.push(p.l);
          yield FT(9, 'Q[rear++] = p->lchild：左孩子入队。' + (p.l ? '（' + p.l.val + '）' : '左孩子是空，<b>空指针也要入队</b>，否则后面的空位就看不出来了。'), root,
            { mark: p, tags: tags, side: ['队列长度 <b>' + Q.length + '</b>'] });
          Q.push(p.r);
          yield FT(10, 'Q[rear++] = p->rchild：右孩子入队' + (p.r ? '（' + p.r.val + '）。' : '（空指针）。'), root,
            { mark: p, tags: tags, side: ['队列长度 <b>' + Q.length + '</b>'] });
        }
        yield FT(12, '队列清空且没触发返回 0 → <b>是完全二叉树</b>。', root, { tags: tags, side: ['结果 <b>1</b>'] });
        return true;
      }
      yield* walkOne(good, '例 1：完全二叉树 A(B(D,E), C(F,G))');
      yield* walkOne(bad, '例 2：C 只有右孩子 —— 中间出现了"空"，后面又冒出一个 G');
    }
  });
})(window.DSANIM = window.DSANIM || {});
