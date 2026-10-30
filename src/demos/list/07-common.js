/* 2.6 两个链表的第一个公共结点（长度对齐） */
(function (NS) {
  'use strict';

  var CH = NS.CH, mkHead = NS.mkHead, build = NS.build, F = NS.F;

CH('list').demos.push({
    id: 'common', name: '2.6 两个链表的第一个公共结点（长度对齐）', doubly: false,
    note: 'Y 形结构：公共结点之后两表<b>完全重合</b>。先求长度，长表先走差值步，再同步走，第一个 p == q 即答案。<b>比的是结点地址，不是 data</b>。',
    expect: ['A', '1', '2', '7', '8', '9'],
    code: [
      'int ListLen(LinkList L) {',
      '    int n = 0;',
      '    for (LNode *p = L->next; p; p = p->next) n++;',
      '    return n;',
      '}',
      'LNode *CommonNode(LinkList A, LinkList B) {',
      '    int la = ListLen(A), lb = ListLen(B);',
      '    LNode *p = A->next, *q = B->next;',
      '    while (la > lb) { p = p->next; la--; }',
      '    while (lb > la) { q = q->next; lb--; }',
      '    while (p && q && p != q) { p = p->next; q = q->next; }',
      '    return p;',
      '}'
    ],
    run: function* () {
      var shared = build([7, 8, 9]);
      var a1 = build([1, 2]), b1 = build([4, 5, 6]);
      var A = mkHead('A'), B = mkHead('B');
      A.next = a1[0]; a1[1].next = shared[0];
      B.next = b1[0]; b1[2].next = shared[0];
      var p = A.next, q = B.next, la = 5, lb = 6;
      var rows = [{ label: 'A', head: A }, { label: 'B', head: B }];
      var ptr = function () { return [{ name: 'p', node: p }, { name: 'q', node: q }]; };
      yield F(0, '准备：A = 1→2→7→8→9（长 5），B = 4→5→6→7→8→9（长 6）。7、8、9 是两个表共用的同一批结点（Y 形）。', rows, [{ name: 'p', node: p }, { name: 'q', node: q }], null);
      yield F(1, '① int n = 0：长度计数器从 0 开始。', rows, ptr(), null);
      yield F(2, '① 求 A 的长度：沿 A 走一遍，la = 5。', rows, ptr(), null);
      yield F(2, '① 求 B 的长度：沿 B 走一遍，lb = 6。', rows, ptr(), null);
      yield F(3, 'return n：ListLen 把数出来的长度交回去（A 得 5、B 得 6）。', rows, ptr(), null);
      yield F(5, 'LNode *CommonNode(A, B)：有了两个长度，就可以开始"对齐后同步走"。', rows, ptr(), null);
      yield F(6, '② la = 5，lb = 6。长表比短表长 1 步。', rows, ptr(), null);
      yield F(7, '③ p = A->next（1），q = B->next（4）。', rows, ptr(), p);
      while (lb > la) {
        q = q.next; lb--;
        yield F(9, '④ B 更长，q 先走一步 → ' + q.val + '（lb = ' + lb + '）。现在两指针到表尾的剩余长度相同。', rows, ptr(), q);
      }
      yield F(8, 'la == lb，不需要再对齐 A 了。', rows, ptr(), null);
      while (p && q && p !== q) {
        yield F(10, 'while (p && q && p != q)：两个指针都没到头、也还没撞在一起，就一起往前走。', rows, ptr(), null);
        p = p.next; q = q.next;
        yield F(10, '⑤ 同步走：p → ' + (p ? p.val : 'NULL') + '，q → ' + (q ? q.val : 'NULL') + '，地址不同，继续。', rows, ptr(), null);
      }
      yield F(11, '⑥ p == q == ' + (p ? p.val : 'NULL') + '：两个指针指向<b>同一个结点</b>，这就是第一个公共结点。', rows, ptr(), p);
      yield F(12, '返回 ' + (p ? p.val : 'NULL') + '。时间 O(m+n)，空间 O(1)。', rows, ptr(), p);
    }
  });
})(window.DSANIM = window.DSANIM || {});
