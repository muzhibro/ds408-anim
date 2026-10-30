/* 链表 · 2.13 判断链表是否递增有序 */
(function (NS) {
  'use strict';

  var CH = NS.CH, mkHead = NS.mkHead, build = NS.build, F = NS.F;

CH('list').demos.push({
    id: 'sorted', name: '2.13 判断链表是否递增有序', doubly: false,
    note: '只比<b>相邻</b>两个结点：出现一次逆序就不是递增有序。空表和单结点表都算有序。',
    cases: [
      { label: '有逆序：2,5,7,6,9', list: [2, 5, 7, 6, 9] },
      { label: '全有序：2,5,7,9,11', list: [2, 5, 7, 9, 11] }
    ],
    expect: ['L', '2', '5', '7', '6', '9'],
    code: [
      'int IsSorted(LinkList L) {',
      '    for (LNode *p = L->next; p && p->next; p = p->next)',
      '        if (p->data > p->next->data) return 0;',
      '    return 1;',
      '}'
    ],
    run: function* (c) {
      var vals = (c && c.list) || [2, 5, 7, 6, 9];
      var ns = build(vals);
      var L = mkHead('L'); L.next = ns[0];
      var p = L.next;
      var rows = [{ label: 'L', head: L }];
      yield F(0, '准备：' + vals.join(' → ') + '。问它是不是递增有序。', rows, [{ name: 'L', node: L }], L);
      var round = 0;
      while (p && p.next) {
        round++;
        var ok = parseInt(p.val, 10) <= parseInt(p.next.val, 10);
        yield F(1, '第 ' + round + ' 次比较：p = ' + p.val + '，p->next = ' + p.next.val + '。', rows, [{ name: 'p', node: p }], p);
        if (!ok) {
          yield F(2, '★ ' + p.val + ' > ' + p.next.val + '：出现逆序 → 立即 return 0，后面的不用看了。', rows, [{ name: 'p', node: p }], p.next);
          yield F(2, '结论：不是递增有序。注意前面的 2,5,7 都是有序的，但 ' + p.val + ' > ' + p.next.val + ' 就足够了。', rows, [{ name: 'p', node: p }], null);
          return;
        }
        yield F(2, p.val + ' ≤ ' + p.next.val + '，这一对没问题，继续。', rows, [{ name: 'p', node: p }], null);
        p = p.next;
        if (p) yield F(1, 'p 前进到 ' + p.val + '。', rows, [{ name: 'p', node: p }], p);
      }
      yield F(3, '走完全程没发现逆序 → return 1，递增有序。时间是 O(n)，只用了 p 一个指针。', rows, [{ name: 'p', node: p }], null);
    }
  });
})(window.DSANIM = window.DSANIM || {});
