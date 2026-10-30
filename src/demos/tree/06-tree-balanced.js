/* 二叉树 · 3.7 判断平衡二叉树 */
(function (NS) {
  'use strict';

  var CH = NS.CH, F = NS.F, T = NS.T, FT = NS.FT, setStack = NS.setStack;

CH('tree').demos.push({
    id: 'tree-balanced', name: '3.7 判断平衡二叉树',
    note: '要求<b>每个结点</b> |左高 − 右高| ≤ 1。用"一个 int 携带两种信息"：≥0 是高度，<b>−1 是失衡信号</b>，一路往上短路。时间 O(n)，不是 O(n²)。',
    code: [
      'int CheckBalanced(BiTree T) {          /* 返回高度；失衡返回 -1 */',
      '    if (!T) return 0;',
      '    int hL = CheckBalanced(T->lchild);',
      '    if (hL == -1) return -1;           /* 左子树已经失衡，直接上报 */',
      '    int hR = CheckBalanced(T->rchild);',
      '    if (hR == -1) return -1;',
      '    if (hL - hR > 1 || hR - hL > 1) return -1;   /* 两个方向都要判 */',
      '    return (hL > hR ? hL : hR) + 1;',
      '}'
    ],
    run: function* () {
      var root = T('A', T('B', T('D', T('F'), null), T('E')), T('C'));
      var tags = {}, cs = [];
      setStack(cs);
      yield FT(0, '准备：注意 D 的左孩子 F 让 D 左高 1、右高 0 —— 平衡；但 B 的左高 2、右高 1 也还行。', root, {});
      function* chk(n) {
        if (!n) { yield FT(1, '空子树高度 0（平衡）。', root, { tags: tags }); return 0; }
        cs.push('CheckBalanced(' + n.val + ')');
        yield FT(2, '进入 ' + n.val + '：先算左子树，拿到它的高度（或 −1）。', root, { mark: n, tags: tags });
        var hl = yield* chk(n.l);
        yield FT(3, 'if (hL == -1)：左子树返回 ' + (hl === -1 ? '−1 → 失衡，直接上报，右子树不必再算' : hl + ' → 只表示高度，继续算右子树') + '。', root, { mark: n, tags: tags });
        if (hl === -1) { cs.pop(); return -1; }
        yield FT(4, 'int hR = CheckBalanced(T->rchild)：现在去算右子树。', root, { mark: n, tags: tags });
        var hr = yield* chk(n.r);
        yield FT(5, 'if (hR == -1)：右子树返回 ' + (hr === -1 ? '−1 → 失衡，直接上报' : hr + ' → 正常，继续判差值') + '。', root, { mark: n, tags: tags });
        if (hr === -1) { cs.pop(); return -1; }
        if (Math.abs(hl - hr) > 1) {
          yield FT(6, n.val + '：左 ' + hl + '、右 ' + hr + '，差 ' + Math.abs(hl - hr) + ' > 1 → <b>失衡</b>，上报 −1。', root, { mark: n, tags: tags });
          cs.pop();
          return -1;
        }
        var h = Math.max(hl, hr) + 1;
        tags[n.id] = h;
        yield FT(7, n.val + '：左 ' + hl + '、右 ' + hr + ' → 平衡，高度 ' + h + '。', root, { mark: n, tags: tags });
        cs.pop();
        return h;
      }
      var r = yield* chk(root);
      setStack(null);
      yield FT(7, r === -1 ? '最终返回 −1 → <b>不平衡</b>。注意：每个结点只被访问一次，所以是 O(n)。' : '最终返回 ' + r + ' → 平衡（每个结点只算一次，O(n)）。', root, { tags: tags, side: ['结果 <b>' + (r === -1 ? 0 : 1) + '</b>'] });
    }
  });
})(window.DSANIM = window.DSANIM || {});
