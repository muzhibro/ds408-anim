/* 链表 · 2.2 单链表就地逆置（断头＋头插） */
(function (NS) {
  'use strict';

  var CH = NS.CH, mkHead = NS.mkHead, build = NS.build, F = NS.F;

CH('list').demos.push({
    id: 'reverse', name: '2.2 单链表就地逆置（断头＋头插）', doubly: false,
    note: '<b>就地逆置</b>：把原表结点一个个摘下、头插到 L 后面。全程只用 p、q 两个指针，<b>空间 O(1)</b>。q 是用来"防断链"的。',
    expect: ['L', '5', '4', '3', '2', '1'],
    code: [
      'void ReverseList(LinkList L) {',
      '    LNode *p = L->next, *q;',
      '    L->next = NULL;                   /* 断头：新表先清空 */',
      '    while (p) {',
      '        q = p->next;                  /* 保存后继，防断链 */',
      '        p->next = L->next;            /* 头插 */',
      '        L->next = p;',
      '        p = q;',
      '    }',
      '}'
    ],
    run: function* () {
      var ns = build([1, 2, 3, 4, 5]);
      var L = mkHead('L'); L.next = ns[0];
      var p = L.next, q = null;
      var rows = function (withQ) {
        var out = [{ label: 'L（新表）', head: L }];
        if (p) out.push({ label: 'p（旧链剩余）', head: p });
        /* q 被摘下来之后不再是 p 的后继，单独画一行，否则指针图例只能显示"未挂链" */
        if (withQ && q && q !== p) out.push({ label: 'q（刚摘下的那段）', head: q });
        return out;
      };
      yield F(0, '准备：L → 1 → 2 → 3 → 4 → 5。目标：原地逆置，不许开新结点。', [{ label: 'L', head: L }], [{ name: 'L', node: L }], L);
      yield F(1, '① p 指向首元，准备"摘一个、插一个"。', [{ label: 'L', head: L }], [{ name: 'L', node: L }, { name: 'p', node: p }], p);
      L.next = null;
      yield F(2, '② L->next = NULL：先把头结点摘干净，新表为空。原链还挂在 p 上，一点没丢。', rows(), [{ name: 'L', node: L }, { name: 'p', node: p }], L);
      while (p) {
        q = p.next;
        yield F(4, 'p = ' + p.val + '：③ q 保存后继 ' + (q ? q.val : 'NULL') + '（摘下来之前先记路，否则断链）。', rows(), [{ name: 'L', node: L }, { name: 'p', node: p }, { name: 'q', node: q }], q);
        var oldHead = L.next;
        yield F(5, '④ p->next = L->next：把 p 的 next 改指新表首元 ' + (oldHead ? oldHead.val : 'NULL') + '（这就是"头插"那一下）。',
          rows(true), [{ name: 'L', node: L }, { name: 'p', node: p }, { name: 'q', node: q }], p,
          oldHead ? { link: { from: p, to: oldHead, text: 'p->next = ' + oldHead.val } } : null);
        p.next = L.next;
        yield F(5, '改完：' + p.val + ' → ' + (p.next ? p.next.val : 'NULL') + '；新表的首元还没换成它，下一步才换。',
          rows(true), [{ name: 'L', node: L }, { name: 'p', node: p }, { name: 'q', node: q }], p);
        L.next = p;
        yield F(6, '⑤ L->next = p：p 正式成为新表首元；q 这一段还挂在一旁，下一轮接着摘。', rows(true), [{ name: 'L', node: L }, { name: 'p', node: p }, { name: 'q', node: q }], p);
        p = q;
        yield F(7, '⑥ p = q：处理下一个，继续摘。', rows(), [{ name: 'L', node: L }, { name: 'p', node: p }], p);
      }
      yield F(9, '完成：5 → 4 → 3 → 2 → 1。整个过程只动了指针，没有申请任何结点。', [{ label: 'L', head: L }], [{ name: 'L', node: L }], null);
    }
  });
})(window.DSANIM = window.DSANIM || {});
