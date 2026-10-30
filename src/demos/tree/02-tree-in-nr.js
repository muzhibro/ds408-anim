/* 二叉树 · 3.3 中序遍历（非递归·显式栈） */
(function (NS) {
  'use strict';

  var CH = NS.CH, T = NS.T, FT = NS.FT, mkTree1 = NS.mkTree1;

CH('tree').demos.push({
    id: 'tree-in-nr', name: '3.3 中序遍历（非递归·显式栈）',
    note: '<b>一路向左压栈，弹出即访问，然后转右</b>。循环条件是 <code>p || !栈空</code> —— 两者都空才是真的走完了。时间 O(n)，空间 O(h)。',
    code: [
      'void InOrderNR(BiTree T) {',
      '    BiTree stack[MAXSIZE], p = T;',
      '    int top = -1;',
      '    while (p || top >= 0) {          /* 两个条件缺一不可 */',
      '        while (p) { stack[++top] = p; p = p->lchild; }   /* 一路向左 */',
      '        p = stack[top--];            /* 弹栈 */',
      '        visit(p);                    /* 左娃空 → 访问它 */',
      '        p = p->rchild;               /* 转向右子树 */',
      '    }',
      '}'
    ],
    run: function* () {
      var root = mkTree1(), st = [], p = root, tags = {}, order = [];
      var sv = function () { return st.map(function (x) { return x.val; }); };
      yield FT(0, '准备：同一棵树。中序 = 左 → 根 → 右；递归版本由系统栈帮忙，这里自己拿数组当栈。', root, {});
      yield FT(1, 'BiTree stack[MAXSIZE], p = T：一个数组当栈，指针 p 从根出发。', root, { mark: root, ptrs: [{ name: 'p', node: root }], stack: [], tags: tags });
      yield FT(2, 'int top = -1：top 指向栈顶，−1 表示空栈。', root, { ptrs: [{ name: 'p', node: root }], stack: [], tags: tags });
      while (p || st.length) {
        yield FT(3, 'while (p || top >= 0)：<b>指针没走到空</b>或者<b>栈里还有货</b>，就得继续——两个条件缺一不可。', root,
          { ptrs: p ? [{ name: 'p', node: p }] : [], stack: sv(), tags: tags });
        while (p) {
          st.push(p);
          yield FT(4, 'p = ' + p.val + '：一路向左，压栈。', root, { mark: p, ptrs: [{ name: 'p', node: p }], stack: sv(), tags: tags });
          p = p.l;
        }
        p = st.pop();
        yield FT(5, '左娃为空 → 弹出栈顶 ' + p.val + '。', root, { mark: p, ptrs: [{ name: 'p', node: p }], stack: sv(), tags: tags });
        order.push(p.val); tags[p.id] = order.length;
        yield FT(6, '访问 ' + p.val + '（第 ' + order.length + ' 个）。', root, { mark: p, stack: sv(), tags: tags });
        p = p.r;
        yield FT(7, '转向右子树' + (p ? '：' + p.val : '（空，准备弹下一个）') + '。', root, { mark: p || root, stack: sv(), tags: tags });
      }
      yield FT(8, '中序序列：<b>' + order.join(' ') + '</b>。每个结点进栈一次、出栈一次 → O(n)。', root, { tags: tags, side: ['中序 <b>' + order.join(' ') + '</b>'] });
    }
  });
})(window.DSANIM = window.DSANIM || {});
