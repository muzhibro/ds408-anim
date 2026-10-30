/* 2.7 删除绝对值重复的结点 */
(function (NS) {
  'use strict';

  var CH = NS.CH, mkHead = NS.mkHead, build = NS.build, F = NS.F;

CH('list').demos.push({
    id: 'absdup', name: '2.7 删除绝对值重复的结点', doubly: false,
    note: '辅助数组 seen 标记"这个绝对值来过没有"，重复的直接删。<b>时间 O(n)，空间 O(n)</b>；若强制 O(1) 空间，只能用双重循环 O(n²)。',
    expect: ['L', '21', '-15', '7'],
    code: [
      'void DelAbsDup(LinkList L, int n) {',
      '    int *seen = (int *)calloc(n + 1, sizeof(int));',
      '    LNode *p = L->next, *pre = L;',
      '    while (p) {',
      '        int v = (p->data > 0) ? p->data : -p->data;',
      '        if (seen[v]) {',
      '            pre->next = p->next;',
      '            free(p);',
      '            p = pre->next;',
      '        } else {',
      '            seen[v] = 1;',
      '            pre = p;',
      '            p = p->next;',
      '        }',
      '    }',
      '    free(seen);',
      '}'
    ],
    run: function* () {
      var vals = [21, -15, -15, 7, 15, 7];
      var ns = build(vals);
      var L = mkHead('L'); L.next = ns[0];
      var p = L.next, pre = L, seen = {};
      var rows = [{ label: 'L', head: L }];
      var ptr = function () { return [{ name: 'pre', node: pre }, { name: 'p', node: p }]; };
      var seenTxt = function () { var a = Object.keys(seen); return a.length ? 'seen = {' + a.join(', ') + '}' : 'seen = {}'; };
      yield F(0, '准备：21 → -15 → -15 → 7 → 15 → 7。绝对值重复的只保留第一次出现的。', rows, [{ name: 'L', node: L }], L);
      yield F(1, '① 申请标记数组 seen（下标是绝对值，n = 21）。', rows, ptr(), L, { seen: seenTxt() });
      yield F(2, '② p 指向首元，pre 指向头结点（pre 是 p 的前驱）。', rows, ptr(), p, { seen: seenTxt() });
      while (p) {
        var v = Math.abs(parseInt(p.val, 10));
        yield F(3, 'while (p)：p 还没走到表尾，就继续检查当前结点。', rows, ptr(), p, { seen: seenTxt() });
        yield F(4, '③ 取绝对值 v = |' + p.val + '| = ' + v + '。', rows, ptr(), p, { seen: seenTxt() });
        if (seen[v]) {
          yield F(5, 'if (seen[' + v + '])：' + v + ' 已经登记过 → 走"删掉"这一支。', rows, ptr(), p, { seen: seenTxt() });
          pre.next = p.next;
          yield F(6, '④ seen[' + v + '] 已经是 1 → 这个值出现过，让 pre 跨过 p：pre->next = p->next。', rows, ptr(), p, { seen: seenTxt() });
          var freed = p;
          yield F(7, '⑤ free(' + freed.val + ')。', rows, [{ name: 'pre', node: pre }, { name: 'p', node: p }], pre, { seen: seenTxt(), freed: freed.val });
          p = pre.next;
          yield F(8, '⑥ p = pre->next，pre 不动（因为它后面换了人）。', rows, ptr(), p, { seen: seenTxt() });
        } else {
          yield F(5, 'if (seen[' + v + '])：' + v + ' 从没登记过 → 走"保留"这一支。', rows, ptr(), p, { seen: seenTxt() });
          seen[v] = 1;
          yield F(10, '④ seen[' + v + '] = 1：把绝对值登记下来，下次再遇到就删。' + seenTxt(), rows, ptr(), p, { seen: seenTxt() });
          pre = p;
          yield F(11, '⑤ pre 前进到 ' + pre.val + '。', rows, ptr(), pre, { seen: seenTxt() });
          p = p.next;
          yield F(12, '⑥ p 前进到 ' + (p ? p.val : 'NULL') + '。', rows, ptr(), p, { seen: seenTxt() });
        }
      }
      yield F(15, '完成：21 → -15 → 7。重复的 -15 和 7 被删掉了；15 也没了 —— 因为 |−15| = 15 早就登记过。', rows, [{ name: 'L', node: L }], null, { seen: seenTxt() });
    }
  });
})(window.DSANIM = window.DSANIM || {});
