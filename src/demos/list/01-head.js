/* 2.1 头插法建表（结果逆序） */
(function (NS) {
  'use strict';

  var CH = NS.CH, mk = NS.mk, mkHead = NS.mkHead, F = NS.F;

CH('list').demos.push({
    id: 'head', name: '2.1 头插法建表（结果逆序）', doubly: false,
    note: '<b>头插法</b>：每个新结点都插在头结点之后，所以结果与输入顺序相反。它是 2.2 逆置、2.11 逆置后半段的地基。',
    expect: ['L', '5', '1', '4', '1', '3'],
    code: [
      'void CreateListHead(LinkList *L, ElemType a[], int n) {',
      '    *L = (LNode *)malloc(sizeof(LNode));      /* 头结点 */',
      '    (*L)->next = NULL;',
      '    for (int i = 0; i < n; i++) {',
      '        LNode *s = (LNode *)malloc(sizeof(LNode));',
      '        s->data = a[i];',
      '        s->next = (*L)->next;                 /* 先连后头 */',
      '        (*L)->next = s;                       /* 再改头结点 */',
      '    }',
      '}'
    ],
    run: function* () {
      var a = [3, 1, 4, 1, 5];
      var L = mkHead('L');
      var rows = function (extra) { return [{ label: 'L', head: L }].concat(extra || []); };
      yield F(0, '准备：a = [3, 1, 4, 1, 5]，n = 5。带头结点 L（头结点不存数据，只负责"指路"）。', rows(), [{ name: 'L', node: L }], L);
      yield F(1, '① 申请头结点 L。', rows(), [{ name: 'L', node: L }], L);
      yield F(2, '② (*L)->next = NULL：此刻是空表。', rows(), [{ name: 'L', node: L }], L);
      for (var i = 0; i < a.length; i++) {
        var s = mk(a[i]);
        var pending = [{ label: 's（新）', head: s }];
        yield F(3, 'for (int i = 0; i < ' + a.length + '; i++)：第 ' + (i + 1) + ' 个元素 a[' + i + '] = ' + a[i] + '，为它造一个结点。',
          rows(), [{ name: 'L', node: L }], L);
        yield F(4, 'i = ' + i + '：③ 申请新结点 s。', rows(pending), [{ name: 'L', node: L }, { name: 's', node: s }], s);
        yield F(5, '④ s->data = a[' + i + '] = ' + a[i] + '。', rows(pending), [{ name: 'L', node: L }, { name: 's', node: s }], s);
        var old = L.next;
        s.next = old;
        yield F(6, '⑤ s->next = L->next：先让 s 接上原首元 ' + (old ? old.val : 'NULL') + '（先连后头，链不丢）。', rows(pending), [{ name: 'L', node: L }, { name: 's', node: s }], s);
        L.next = s;
        yield F(7, '⑥ L->next = s：头结点改指向 s，s 成为新的首元。', rows(), [{ name: 'L', node: L }], s);
      }
      yield F(9, '建表完成：5 → 1 → 4 → 1 → 3。最后插的 5 跑到了最前面 —— 这就是"头插逆序"。', rows(), [{ name: 'L', node: L }], null);
    }
  });
})(window.DSANIM = window.DSANIM || {});
