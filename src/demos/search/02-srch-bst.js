/* 查找 · 5.2 二叉排序树的查找 */
(function (NS) {
  'use strict';

  var CH = NS.CH, T = NS.T, FT = NS.FT;

CH('search').demos.push({
    id: 'srch-bst', name: '5.2 二叉排序树的查找',
    note: '从根开始：<b>比当前结点小往左，大往右</b>，一路只走一条路径，深度最大 O(h)。等值不重复插入。',
    code: [
      'BSTNode *BSTSearch(BSTNode *T, int key) {',
      '    while (T && T->data != key) {',
      '        if (key < T->data) T = T->lchild;   /* 小 → 左边 */',
      '        else               T = T->rchild;   /* 大 → 右边 */',
      '    }',
      '    return T;                               /* 找到返回结点，否则 NULL */',
      '}'
    ],
    run: function* () {
      var l20 = T(20), l40 = T(40), l30 = T(30, l20, l40);
      var r60 = T(60), r80 = T(80), r70 = T(70, r60, r80);
      var root = T(50, l30, r70);
      var key = 60, cur = root, depth = 0, path = [], pathNodes = [];
      yield FT(0, '准备：一棵 BST。性质：左子树全 &lt; 根 &lt; 右子树（对每个结点都成立）。查找 key = ' + key + '。', root, { mark: root });
      while (cur && +cur.val !== key) {
        depth++;
        var goLeft = key < +cur.val;
        path.push(cur.val); pathNodes.push(cur);
        yield FT(2, '当前结点 ' + cur.val + '：' + key + (goLeft ? ' &lt; ' : ' &gt; ') + cur.val + ' → 往' + (goLeft ? '左' : '右') + '走。',
          root, { mark: cur, ptrs: [{ name: 'p', node: cur }], side: ['比较次数 <b>' + depth + '</b>', '路径 <b>' + path.join(' → ') + '</b>'],
            cmpTag: { text: 'key=' + key + ' ' + (goLeft ? '<' : '>') + ' ' + cur.val + ' → 往' + (goLeft ? '左' : '右'), ok: goLeft } });
        cur = goLeft ? cur.l : cur.r;
      }
      if (cur) {
        var tags = {};
        pathNodes.forEach(function (nd, i) { tags[nd.id] = i + 1; });
        tags[cur.id] = depth + 1;
        yield FT(3, '命中：结点 ' + cur.val + '，查找成功。共比较 ' + (depth + 1) + ' 次。', root,
          { mark: cur, tags: tags, side: ['比较次数 <b>' + (depth + 1) + '</b>', '路径 <b>' + path.concat([cur.val]).join(' → ') + '</b>'],
            cmpTag: { text: 'key=' + key + ' == ' + cur.val + ' → 命中', ok: true } });
      } else {
        yield FT(3, '走到空指针 → 查找失败（说明该 key 不在树里）。', root,
          { side: ['比较次数 <b>' + depth + '</b>'], cmpTag: { text: 'key=' + key + ' 不在树里', ok: false } });
      }
    }
  });
})(window.DSANIM = window.DSANIM || {});
