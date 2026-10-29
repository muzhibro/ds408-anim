/* 链表 · 2.3 找倒数第 k 个结点（快慢指针） */
(function (NS) {
  'use strict';

  var CH = NS.CH, mkHead = NS.mkHead, build = NS.build, F = NS.F;

CH('list').demos.push({
    id: 'kth', name: '2.3 找倒数第 k 个结点（快慢指针）', doubly: false,
    note: '<b>一次遍历</b>：p 先走 k 步，然后 p、q 同步走；p 到 NULL 时 q 正好是倒数第 k 个。k &lt;= 0 必须先在入口挡掉。',
    expect: ['L', '1', '2', '3', '4', '5', '6'],
    code: [
      'int FindKthFromEnd(LinkList L, int k) {',
      '    if (k <= 0) return 0;',
      '    LNode *p = L->next, *q = L->next;',
      '    int i = 0;',
      '    while (p && i < k) { p = p->next; i++; }',
      '    if (i < k) return 0;',
      '    while (p) { p = p->next; q = q->next; }',
      '    printf("%d", q->data);',
      '    return 1;',
      '}'
    ],
    run: function* () {
      var ns = build([1, 2, 3, 4, 5, 6]);
      var L = mkHead('L'); L.next = ns[0];
      var k = 3, p = ns[0], q = ns[0], i = 0;
      var rows = [{ label: 'L', head: L }];
      var ptr = function () { return [{ name: 'p', node: p }, { name: 'q', node: q }]; };
      yield F(0, '准备：表长 6，k = 3，要输出倒数第 3 个（答案应为 4）。', rows, [{ name: 'L', node: L }], L);
      yield F(1, '① k = 3 > 0，通过检查（k<=0 时 q 会走成 NULL，所以必须先挡）。', rows, [{ name: 'L', node: L }], L);
      yield F(2, '② p、q 都先指向首元 1。', rows, ptr(), p);
      yield F(3, '③ i = 0，准备让 p 先跑 k 步。', rows, ptr(), p);
      while (p && i < k) {
        p = p.next; i++;
        yield F(4, '④ p 往前走一步，i = ' + i + (i < k ? '（还没走够 ' + k + ' 步）' : '（走够 k 步了，q 与 p 相距 k）'), rows, ptr(), p);
      }
      yield F(5, '⑤ i == k，说明表长 ≥ k，k 合法。', rows, ptr(), p);
      while (p) {
        p = p.next; q = q.next;
        yield F(6, '⑥ p、q 同步走：p → ' + (p ? p.val : 'NULL') + '，q → ' + q.val + '。两者始终保持 k 步距离。', rows, ptr(), q);
      }
      yield F(7, 'p 走到 NULL，q 停在 ' + q.val + ' —— 它后面正好有 k-1 = 2 个结点，所以是倒数第 3 个。', rows, ptr(), q);
      yield F(8, 'return 1，输出 ' + q.val + '。全程只遍历一次，O(n)。', rows, ptr(), q);
    }
  });
})(window.DSANIM = window.DSANIM || {});
