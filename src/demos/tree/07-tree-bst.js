/* 3.8 判断二叉排序树 */
(function (NS) {
  'use strict';

  var CH = NS.CH, T = NS.T, FT = NS.FT, setStack = NS.setStack;

CH('tree').demos.push({
    id: 'tree-bst', cases: [
      { label: '反例：10(5,15(6,20))', tip: '看着每处都对，但它不是 BST',
        tree: function () { return T(10, T(5), T(15, T(6), T(20))); } },
      { label: '合法 BST：50(30(20,40),70(60,80))', tip: '标准的一棵 BST，中序单调递增',
        tree: function () { return T(50, T(30, T(20), T(40)), T(70, T(60), T(80))); } },
      { label: '退化：一条左链', tip: '全是左孩子，中序仍然递增，所以是合法的',
        tree: function () { return T(50, T(30, T(20))); } },
      { label: '有重复值：10(5,10)', tip: 'BST 不能有重复值（相等也判错）',
        tree: function () { return T(10, T(5), T(10)); } }
    ], name: '3.8 判断二叉排序树',
    note: '只比"直接孩子"是错的：反例 10(5, 15(6, 20)) 处处局部合法，但 6 在 10 的右子树里却小于 10。<b>中序必须严格递增</b>，用一个 pre 游标记住"上一个访问的值"。',
    code: [
      'int IsBST(BiTree T, int *pre) {      /* pre 是"中序上一个值" */',
      '    if (!T) return 1;',
      '    if (!IsBST(T->lchild, pre)) return 0;',
      '    if (T->data <= *pre) return 0;   /* 必须严格递增 */',
      '    *pre = T->data;                  /* 记下当前值，供后继比较 */',
      '    return IsBST(T->rchild, pre);',
      '}'
    ],
    run: function* (c) {
      var root = (c && c.tree) ? c.tree() : T(10, T(5), T(15, T(6), T(20)));
      var pre = -Infinity, tags = {}, seq = [], cs = [];
      setStack(cs);
      yield FT(0, '准备：' + ((c && c.tip) ? c.tip : '反例树 10(5, 15(6, 20))，看着每处都对，但它不是 BST') + ' —— 下面用中序 + pre 游标来验。', root, {});
      function* isbst(n) {
        if (!n) { yield FT(1, '空树 → 返回 1。', root, { tags: tags, side: ['pre = <b>' + (pre === -Infinity ? '−∞' : pre) + '</b>'] }); return true; }
        cs.push('IsBST(' + n.val + ')');
        yield FT(2, '进入 ' + n.val + '，先查左子树。', root, { mark: n, tags: tags });
        if (!(yield* isbst(n.l))) { cs.pop(); return false; }
        if (+n.val <= pre) {
          yield FT(3, '中序访问 ' + n.val + '：可是上一个值是 ' + pre + '，' + n.val + ' ≤ ' + pre + ' → <b>不是 BST</b>，返回 0。',
            root, { mark: n, tags: tags, side: ['pre = <b>' + pre + '</b>', '中序已扫 <b>' + seq.join(' ') + '</b>'] });
          cs.pop();
          return false;
        }
        pre = +n.val; seq.push(pre); tags[n.id] = seq.length;
        yield FT(4, '中序访问 ' + n.val + '，比 ' + (seq.length > 1 ? '上一个值' : '−∞') + ' 大 → 合法，pre 更新为 ' + pre + '。',
          root, { mark: n, tags: tags, side: ['pre = <b>' + pre + '</b>', '中序已扫 <b>' + seq.join(' ') + '</b>'] });
        yield FT(5, 'return IsBST(T->rchild, pre)：本结点验完，把更新后的 pre 带进右子树继续验（中序的顺序：左 → 根 → 右）。', root,
          { mark: n, tags: tags, side: ['pre = <b>' + pre + '</b>', '中序已扫 <b>' + seq.join(' ') + '</b>'] });
        var r = yield* isbst(n.r);
        cs.pop();
        return r;
      }
      var ok = yield* isbst(root);
      setStack(null);
      yield FT(6, ok ? '全部中序递增 → 是 BST。' : '中序出现逆序 → <b>不是 BST</b>。这就是"只比父子"抓不到的错。', root, {
        tags: tags, side: ['中序 <b>' + seq.join(' ') + '</b>', '结果 <b>' + (ok ? 1 : 0) + '</b>']
      });
    }
  });
})(window.DSANIM = window.DSANIM || {});
