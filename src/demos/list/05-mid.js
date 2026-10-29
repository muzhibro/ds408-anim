/* 链表 · 2.4 找中间结点（快慢指针） */
(function (NS) {
  'use strict';

  var CH = NS.CH, mkHead = NS.mkHead, build = NS.build, F = NS.F;

CH('list').demos.push({
    id: 'mid', name: '2.4 找中间结点（快慢指针）', doubly: false,
    note: 'slow 走 1 步、fast 走 2 步：fast 走完全程时 slow 正好在中点。偶数个结点时 slow 停在<b>中间偏右</b>。',
    expect: ['L', '1', '2', '3', '4', '5', '6'],
    code: [
      'LNode *FindMid(LinkList L) {',
      '    LNode *slow = L->next, *fast = L->next;',
      '    while (fast && fast->next) {',
      '        slow = slow->next;',
      '        fast = fast->next->next;',
      '    }',
      '    return slow;',
      '}'
    ],
    run: function* () {
      var ns = build([1, 2, 3, 4, 5, 6]);
      var L = mkHead('L'); L.next = ns[0];
      var slow = ns[0], fast = ns[0];
      var rows = [{ label: 'L', head: L }];
      var ptr = function () { return [{ name: 'slow', node: slow }, { name: 'fast', node: fast }]; };
      yield F(0, '准备：6 个结点。slow 每次走 1 步，fast 每次走 2 步。', rows, [{ name: 'L', node: L }], L);
      yield F(1, '① slow = fast = 首元 1。', rows, ptr(), slow);
      var round = 0;
      while (fast && fast.next) {
        round++;
        yield F(2, '第 ' + round + ' 轮：fast = ' + fast.val + '，fast->next = ' + (fast.next ? fast.next.val : 'NULL') + '，条件成立，继续。', rows, ptr(), fast);
        slow = slow.next;
        yield F(3, '② slow 走一步 → ' + slow.val + '。', rows, ptr(), slow);
        fast = fast.next.next;
        yield F(4, '③ fast 走两步 → ' + (fast ? fast.val : 'NULL') + '。', rows, ptr(), fast);
      }
      yield F(2, '第 ' + (round + 1) + ' 轮：fast = ' + (fast ? fast.val : 'NULL') + '，条件不成立（fast 已到尾或尾的前一个），循环结束。', rows, ptr(), fast);
      yield F(6, '返回 slow = ' + slow.val + '。偶数个结点时它是"中间偏右"那个（第 n/2+1 = 4 个）。', rows, ptr(), slow);
    }
  });
})(window.DSANIM = window.DSANIM || {});
