/* 链表 · 2.10 按位序奇偶拆分链表 */
(function (NS) {
  'use strict';

  var CH = NS.CH, mkHead = NS.mkHead, build = NS.build, F = NS.F;

CH('list').demos.push({
    id: 'split', name: '2.10 按位序奇偶拆分链表', doubly: false,
    note: '两个新头结点 A、B + 两个尾指针 ra、rb，边扫边尾插。<b>O(n) 时间，O(1) 额外空间</b>（只多了两个头结点）。',
    expect: ['A', '1', '3', '5'],
    code: [
      'void SplitOddEven(LinkList L, LinkList *A, LinkList *B) {',
      '    *A = (LNode *)malloc(sizeof(LNode)); (*A)->next = NULL;',
      '    *B = (LNode *)malloc(sizeof(LNode)); (*B)->next = NULL;',
      '    LNode *ra = *A, *rb = *B, *p = L->next;',
      '    int i = 1;',
      '    while (p) {',
      '        LNode *q = p->next;',
      '        if (i % 2 == 1) { ra->next = p; ra = p; }',
      '        else            { rb->next = p; rb = p; }',
      '        p = q;',
      '        i++;',
      '    }',
      '    ra->next = NULL;',
      '    rb->next = NULL;',
      '}'
    ],
    run: function* () {
      var ns = build([1, 2, 3, 4, 5, 6]);
      var L = mkHead('L'), A = null, B = null;
      L.next = ns[0];
      var ra = null, rb = null, p = L.next, i = 1;
      var rows = function () {
        var out = [{ label: 'L（还没搬的，从 p）', head: p }];
        if (A) out.push({ label: 'A（奇，画到 ra）', head: A, cut: ra, cutNote: ra === A ? 'A 还是空的' : 'ra 之后还没接' });
        if (B) out.push({ label: 'B（偶，画到 rb）', head: B, cut: rb, cutNote: rb === B ? 'B 还是空的' : 'rb 之后还没接' });
        return out;
      };
      var ptr = function () {
        var a = [{ name: 'p', node: p }];
        if (ra) a.push({ name: 'ra', node: ra });
        if (rb) a.push({ name: 'rb', node: rb });
        return a;
      };
      yield F(0, '准备：L = 1→2→3→4→5→6。要求拆成 A（第 1,3,5 个）和 B（第 2,4,6 个）。', rows(), [{ name: 'p', node: p }], null);
      A = mkHead('A'); B = mkHead('B');
      yield F(1, '① 为 A 申请头结点。', rows(), [{ name: 'p', node: p }], A);
      yield F(2, '② 为 B 申请头结点。', rows(), [{ name: 'p', node: p }], B);
      ra = A; rb = B;
      yield F(3, '③ ra = A，rb = B（两个尾指针都先指向自己的头结点），p = L->next。', rows(), ptr(), null);
      yield F(4, '④ i = 1，从第 1 个结点开始数。', rows(), ptr(), null);
      while (p) {
        var q = p.next;
        yield F(6, '⑤ q = p->next 先记路：p 马上要被挂到别的表上。', rows(), ptr(), q);
        if (i % 2 === 1) {
          yield F(7, 'i = ' + i + ' 是奇数：把 ' + p.val + ' 挂到 A 的尾部 —— 先改 ra->next，这是"从源表摘、往 A 接"的那一笔。',
            rows(), ptr(), p, { link: { from: ra, to: p, text: 'ra->next = p' } });
          ra.next = p;
          ra = p;
          yield F(7, '接好了：A 尾部变成 ' + p.val + '，ra 前移指向它；p 还要等下一步才前进。', rows(), ptr(), ra);
        } else {
          yield F(8, 'i = ' + i + ' 是偶数：把 ' + p.val + ' 挂到 B 的尾部 —— 先改 rb->next。',
            rows(), ptr(), p, { link: { from: rb, to: p, text: 'rb->next = p' } });
          rb.next = p;
          rb = p;
          yield F(8, '接好了：B 尾部变成 ' + p.val + '，rb 前移指向它。', rows(), ptr(), rb);
        }
        p = q;
        i++;
        yield F(9, 'p = q，i++ → 下一个是第 ' + i + ' 个。', rows(), ptr(), p);
      }
      ra.next = null; rb.next = null;
      yield F(13, '⑥ 两个新表都要收尾：ra->next = rb->next = NULL。漏一个就是野指针。',
        [{ label: 'A（奇）', head: A }, { label: 'B（偶）', head: B }], [{ name: 'ra', node: ra }, { name: 'rb', node: rb }], null);
      yield F(14, '完成：A = 1→3→5，B = 2→4→6。源表 L 的结点已被全部"搬"走，两个新表各自收尾。', [{ label: 'A（奇）', head: A }, { label: 'B（偶）', head: B }], [{ name: 'ra', node: ra }, { name: 'rb', node: rb }], null);
    }
  });
})(window.DSANIM = window.DSANIM || {});
