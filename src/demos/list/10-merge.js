/* 链表 · 2.9 就地合并两个有序链表 */
(function (NS) {
  'use strict';

  var CH = NS.CH, mkHead = NS.mkHead, build = NS.build, F = NS.F;

CH('list').demos.push({
    id: 'merge', name: '2.9 就地合并两个有序链表', doubly: false,
    note: '<b>就地</b>：不 new 结点，把 A、B 的结点重新串起来，复用 A 的头结点。最后 <code>r->next = p ? p : q</code> 一次接完整段剩余。',
    expect: ['C', '1', '2', '3', '4', '5', '6', '7'],
    code: [
      'LinkList MergeList(LinkList A, LinkList B) {',
      '    LNode *p = A->next, *q = B->next, *r;',
      '    LinkList C = A;                   /* 复用 A 的头结点 */',
      '    r = C;',
      '    while (p && q) {',
      '        if (p->data <= q->data) { r->next = p; r = p; p = p->next; }',
      '        else                    { r->next = q; r = q; q = q->next; }',
      '    }',
      '    r->next = p ? p : q;              /* 接上剩余整段 */',
      '    free(B);',
      '    return C;',
      '}'
    ],
    run: function* () {
      var an = build([1, 3, 5, 7]), bn = build([2, 4, 6]);
      var A = mkHead('C'), B = mkHead('B');
      A.next = an[0]; B.next = bn[0];
      var p = A.next, q = B.next, r = A;
      /* 三条行同屏：C 只画到 r 为止（r 之后还没接上）；A、B 各从 p / q 往后画 */
      var rows = function (done) {
        return [
          { label: 'C（结果，r=尾）', head: A, cut: done ? null : r,
            cutNote: r === A ? 'r 还在头结点上' : 'r 之后还没接上' },
          { label: 'A（源表，从 p）', head: p },
          { label: 'B（源表，从 q）', head: q }
        ];
      };
      var ptr = function () {
        return [{ name: 'p', node: p }, { name: 'q', node: q }, { name: 'r', node: r }];
      };
      var two = [
        { label: 'A（源表）', head: A.next },
        { label: 'B（源表）', head: B.next }
      ];
      var pq = function () { return [{ name: 'p', node: p }, { name: 'q', node: q }]; };
      yield F(0, '准备：A = 1→3→5→7，B = 2→4→6，目标 1→2→3→4→5→6→7。p、q 各走一条源表，r 是结果表的尾巴。',
        two, pq(), null);
      yield F(1, '① p = A->next、q = B->next：两个"取指"指针分别停在两条表的第一颗上，接下来只动指针、不动数据。',
        two, pq(), null);
      yield F(2, '② C = A：结果表直接借用 A 的头结点（不 new 结点，所以最后 free 的是 B 的头）。',
        [{ label: 'C（用 A 的头结点）', head: A }, { label: 'B（源表）', head: B }], pq(), null);
      yield F(3, '③ r = C：尾指针先指着头结点 —— 此刻 C 还是空表，r->next 什么都还没接。',
        rows(), ptr(), r);
      var round = 0;
      while (p && q) {
        round++;
        yield F(4, '第 ' + round + ' 轮：比较 p(' + p.val + ') 与 q(' + q.val + ')。谁小谁先进 C；相等取 p（保证稳定）。',
          rows(), ptr(), null);
        var pickP = parseInt(p.val, 10) <= parseInt(q.val, 10);
        var src = pickP ? p : q, nm = pickP ? 'p' : 'q', ln = pickP ? 5 : 6;
        yield F(ln, '选 ' + nm + '（' + src.val + '）：把它挂到 r 的后面（源表里它原本的前驱就此和它断开）。',
          rows(), ptr(), src, { link: { from: r, to: src, text: 'r->next = ' + nm } });
        if (pickP) r.next = p; else r.next = q;
        yield F(ln, '接上了：' + src.val + ' 进入 C、成了 C 的新尾巴；' + nm + ' 仍然指着它。',
          rows(), ptr(), src);
        r = src;
        yield F(ln, 'r = ' + nm + '：尾指针前移一格，下一颗新结点就接在它的 next 上。',
          rows(), ptr(), r);
        if (pickP) p = p.next; else q = q.next;
        var nx = pickP ? p : q;
        yield F(ln, nm + ' = ' + nm + '->next：' + nm + ' 前进到 ' + (nx ? nx.val : 'NULL') + '，源表这一段就交出来了。',
          rows(), ptr(), r);
      }
      yield F(8, '④ 一方先空（p = ' + (p ? p.val : 'NULL') + '，q = ' + (q ? q.val : 'NULL') + '）：另一方剩下的是整段有序的，不用再比。',
        rows(), ptr(), null);
      r.next = p ? p : q;
      yield F(8, 'r->next = ' + (p ? 'p' : 'q') + '：一个赋值接完整段剩余（千万别写成 while 一颗颗接）。', rows(true), ptr(), r);
      yield F(9, 'free(B)：B 的头结点已经没用了；B 里的结点此刻全在 C 里，一个都不能 free。',
        [{ label: 'C（合并结果）', head: A }], [{ name: 'r', node: r }], null);
    }
  });
})(window.DSANIM = window.DSANIM || {});
