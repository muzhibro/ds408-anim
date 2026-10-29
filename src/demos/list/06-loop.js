/* 链表 · 2.5 判断有环 + 找环入口 */
(function (NS) {
  'use strict';

  var CH = NS.CH, mkHead = NS.mkHead, build = NS.build, F = NS.F;

CH('list').demos.push({
    id: 'loop', name: '2.5 判断有环 + 找环入口', doubly: false,
    note: '<b>快慢相遇即有环</b>；相遇后让 p 回到起点，两指针同速走，再次相遇处就是<b>环入口</b>。数学依据：起点到入口 = 入口到相遇点（模环长）。',
    expect: ['L', '1', '2', '3', '4', '5', '6'],
    code: [
      'LNode *FindLoopEntry(LinkList L) {',
      '    LNode *slow = L->next, *fast = L->next;',
      '    while (fast && fast->next) {',
      '        slow = slow->next;',
      '        fast = fast->next->next;',
      '        if (slow == fast) break;',
      '    }',
      '    if (!fast || !fast->next) return NULL;',
      '    LNode *p = L->next;',
      '    while (p != slow) { p = p->next; slow = slow->next; }',
      '    return p;',
      '}'
    ],
    run: function* () {
      var ns = build([1, 2, 3, 4, 5, 6]);
      ns[5].next = ns[2];                 /* 6 -> 3，环：3→4→5→6 */
      var L = mkHead('L'); L.next = ns[0];
      var slow = ns[0], fast = ns[0], p = null;
      var rows = [{ label: 'L（6→3 成环）', head: L }];
      var ptr = function () { return [{ name: 'slow', node: slow }, { name: 'fast', node: fast }].concat(p ? [{ name: 'p', node: p }] : []); };
      yield F(0, '准备：1→2→3→4→5→6，且 6 的 next 指回 3，形成环 3→4→5→6→3。', rows, [{ name: 'L', node: L }], L);
      yield F(1, '① slow = fast = 1。', rows, ptr(), slow);
      var meet = null, round = 0;
      while (fast && fast.next) {
        round++;
        slow = slow.next;
        yield F(3, '第 ' + round + ' 轮：slow → ' + slow.val + '（1 步）。', rows, ptr(), slow);
        fast = fast.next.next;
        yield F(4, 'fast → ' + (fast ? fast.val : 'NULL') + '（2 步）。', rows, ptr(), fast);
        if (slow === fast) {
          meet = slow;
          yield F(5, '★ slow == fast == ' + slow.val + '，两者相遇 → 有环！', rows, ptr(), slow);
          break;
        }
        yield F(2, 'slow(' + slow.val + ') != fast(' + fast.val + ')，继续。', rows, ptr(), slow);
      }
      yield F(7, 'fast 非空，说明不是"无环"退出，确认有环。', rows, ptr(), slow);
      p = ns[0];
      yield F(8, '② p 回到起点 1。slow 留在相遇点 ' + slow.val + '。', rows, ptr(), p);
      var guard = 0;
      while (p !== slow && guard++ < 20) {
        p = p.next; slow = slow.next;
        yield F(9, '③ 两者同速前进：p → ' + p.val + '，slow → ' + slow.val + '。', rows, ptr(), p);
      }
      yield F(10, 'p == slow == ' + p.val + '，返回 ' + p.val + ' —— 这就是环入口。', rows, ptr(), p);
      yield F(10, '为什么对：起点到入口的距离 = 相遇点到入口的距离（模环长），所以同速走必在入口撞上。O(n)/O(1)。', rows, ptr(), p);
    }
  });
})(window.DSANIM = window.DSANIM || {});
