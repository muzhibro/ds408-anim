/* 链表 · 2.8 只给结点指针 *p 的删除（偷梁换柱） */
(function (NS) {
  'use strict';

  var CH = NS.CH, mkHead = NS.mkHead, build = NS.build, F = NS.F;

CH('list').demos.push({
    id: 'delnode', name: '2.8 只给结点指针 *p 的删除（偷梁换柱）', doubly: false,
    note: '没给前驱，删不掉 p？那就<b>把后继的数据抄给 p，然后删掉后继</b>。唯一限制：<b>p 不能是尾结点</b>（尾结点没有后继可抄）。',
    expect: ['L', '1', '2', '4', '5'],
    code: [
      'int DelNode(LNode *p) {',
      '    if (p == NULL || p->next == NULL) return 0;',
      '    LNode *q = p->next;',
      '    p->data = q->data;        /* 后继数据抄过来 */',
      '    p->next = q->next;        /* 再把后继摘掉 */',
      '    free(q);',
      '    return 1;',
      '}'
    ],
    run: function* () {
      var ns = build([1, 2, 3, 4, 5]);
      var L = mkHead('L'); L.next = ns[0];
      var p = ns[2], q = null;
      var rows = [{ label: 'L', head: L }];
      var ptr = function () { return [{ name: 'p', node: p }].concat(q ? [{ name: 'q', node: q }] : []); };
      yield F(0, '准备：1 → 2 → 3 → 4 → 5，现在只给你 p 指向结点 3，要求删掉它。', rows, [{ name: 'p', node: p }], p);
      yield F(1, '① p != NULL 且 p->next != NULL，通过（若是尾结点就只能返回 0）。', rows, ptr(), p);
      q = p.next;
      yield F(2, '② q = p->next：q 指向 4。', rows, ptr(), q);
      p.val = q.val;
      yield F(3, '③ p->data = q->data：把 4 抄到 p 的位置上。现在"3 号结点"里装的是 4 —— 数据搬了家。', rows, ptr(), p);
      p.next = q.next;
      yield F(4, '④ p->next = q->next：把 q 从链上摘掉。链变成 1→2→4→5（其中第一个 4 是原来的 3 号结点）。', rows, ptr(), p);
      yield F(5, '⑤ free(q)：真正被释放的是原来装着 4 的那个结点。', [{ label: 'L', head: L }], [{ name: 'p', node: p }], p);
      yield F(6, '返回 1。从"值"的角度看，3 被删掉了；从"结点"的角度看，被 free 的是 4 那个结点。O(1)。', rows, [{ name: 'p', node: p }], null);
    }
  });
})(window.DSANIM = window.DSANIM || {});
