/* 2.12 双链表插入与删除（指针顺序是考点） */
(function (NS) {
  'use strict';

  var CH = NS.CH, mk = NS.mk, mkHead = NS.mkHead, build = NS.build, linkPrev = NS.linkPrev, F = NS.F;

CH('list').demos.push({
    id: 'doubly', name: '2.12 双链表插入与删除（指针顺序是考点）', doubly: true,
    note: '双链表每个结点有 next 和 prior 两条链。<b>插入：先接后，再接前</b>；<b>删除：先改后继的 prior，最后才 free</b>。顺序颠倒必崩。',
    expect: ['D', '1', '2', '4'],
    code: [
      'void DInsertAfter(DNode *p, DNode *s) {',
      '    s->next = p->next;',
      '    if (p->next) p->next->prior = s;   /* 后继存在才改 prior */',
      '    s->prior = p;',
      '    p->next = s;',
      '}',
      'void DDeleteAfter(DNode *p) {',
      '    DNode *q = p->next;',
      '    if (!q) return;',
      '    p->next = q->next;',
      '    if (q->next) q->next->prior = p;   /* 必须先改 q->next 的 prior */',
      '    free(q);                           /* free 放最后 */',
      '}'
    ],
    run: function* () {
      var ns = build([1, 2, 4]);
      var D = mkHead('D');
      ns[0].prior = D; D.next = ns[0];
      linkPrev(ns);
      var p = ns[1], s = mk(3), q = null;
      var rows = [{ label: 'D（双链表）', head: D }];
      var ptr = function () { return [{ name: 'p', node: p }].concat(s ? [{ name: 's', node: s }] : []); };
      yield F(0, '准备：双链表 D ⇄ 1 ⇄ 2 ⇄ 4。现在要在 2 号结点之后插入 3。', rows, [{ name: 'p', node: p }], p);
      yield F(0, 'p 指向结点 2（插入位置的前驱）。', rows, ptr(), p);
      s.next = p.next;
      yield F(1, '① s->next = p->next：先让 s 的 next 接上 4。', [{ label: 'D', head: D }, { label: 's（待插）', head: s }], ptr(), s);
      if (p.next) p.next.prior = s;
      yield F(2, '② p->next->prior = s：让 4 的 prior 指回 s。（if 判空：p 是尾结点时没有后继）', [{ label: 'D', head: D }, { label: 's（待插）', head: s }], ptr(), s);
      s.prior = p;
      yield F(3, '③ s->prior = p：s 的 prior 指向 2。', [{ label: 'D', head: D }, { label: 's（待插）', head: s }], ptr(), s);
      p.next = s;
      yield F(4, '④ p->next = s：2 的 next 指向 s。四条链全部接好，插入完成。', rows, ptr(), s);
      yield F(4, '现在表是 1 ⇄ 2 ⇄ 3 ⇄ 4。下面演示删除 2 的后继（即 3）。', rows, [{ name: 'p', node: p }], p);
      q = p.next;
      yield F(6, 'void DDeleteAfter(DNode *p){…}：删除 p 的后继，要动 next 和 prior 两条链，顺序不能反。', rows, [{ name: 'p', node: p }], p);
      yield F(7, '⑤ q = p->next，q 指向待删结点 3。', rows, [{ name: 'p', node: p }, { name: 'q', node: q }], q);
      yield F(8, '⑥ q 非空，可以删。', rows, [{ name: 'p', node: p }, { name: 'q', node: q }], q);
      p.next = q.next;
      yield F(9, '⑦ p->next = q->next：2 的 next 越过 3，指向 4。', rows, [{ name: 'p', node: p }, { name: 'q', node: q }], p);
      if (q.next) q.next.prior = p;
      yield F(10, '⑧ q->next->prior = p：4 的 prior 指回 2。<b>必须在这步之后再 free</b>，否则 q->next 已经是野指针。', rows, [{ name: 'p', node: p }, { name: 'q', node: q }], p);
      s = null;
      var qq = q; q = null;
      yield F(11, '⑨ free(' + qq.val + ')：最后才释放。', [{ label: 'D', head: D }], [{ name: 'p', node: p }], p);
      yield F(12, '完成：1 ⇄ 2 ⇄ 4，next 与 prior 两条链都完整。', [{ label: 'D', head: D }], [{ name: 'p', node: p }], null);
    }
  });
})(window.DSANIM = window.DSANIM || {});
