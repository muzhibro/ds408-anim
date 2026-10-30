/* 链表 · 2.1 尾插法建表（保持顺序） */
(function (NS) {
  'use strict';

  var CH = NS.CH, mk = NS.mk, mkHead = NS.mkHead, F = NS.F;

CH('list').demos.push({
    id: 'tail', name: '2.1 尾插法建表（保持顺序）', doubly: false,
    note: '<b>尾插法</b>：多一个尾指针 r，每次都挂到表尾。结果与输入顺序一致。r 必须一路跟着走，最后 r->next = NULL 不能漏。',
    expect: ['L', '3', '1', '4', '1', '5'],
    code: [
      'void CreateListTail(LinkList *L, ElemType a[], int n) {',
      '    *L = (LNode *)malloc(sizeof(LNode));',
      '    (*L)->next = NULL;',
      '    LNode *r = *L;                    /* r 始终指向尾结点 */',
      '    for (int i = 0; i < n; i++) {',
      '        LNode *s = (LNode *)malloc(sizeof(LNode));',
      '        s->data = a[i];',
      '        r->next = s;',
      '        r = s;',
      '    }',
      '    r->next = NULL;                   /* 收尾，绝不能漏 */',
      '}'
    ],
    run: function* () {
      var a = [3, 1, 4, 1, 5];
      var L = mkHead('L'), r = L;
      var rows = function (extra) { return [{ label: 'L', head: L }].concat(extra || []); };
      yield F(0, '准备：a = [3, 1, 4, 1, 5]。尾插法需要一个尾指针 r。', rows(), [{ name: 'L', node: L }], L);
      yield F(1, '① 申请头结点 L。', rows(), [{ name: 'L', node: L }], L);
      yield F(2, '② (*L)->next = NULL。', rows(), [{ name: 'L', node: L }], L);
      yield F(3, '③ r = L：一开始尾结点就是头结点（表是空的）。', rows(), [{ name: 'L', node: L }, { name: 'r', node: r }], r);
      for (var i = 0; i < a.length; i++) {
        var s = mk(a[i]);
        var pending = [{ label: 's（新）', head: s }];
        yield F(4, 'for (int i = 0; i < ' + a.length + '; i++)：第 ' + (i + 1) + ' 个元素 a[' + i + '] = ' + a[i] + '，为它造结点并挂到表尾。',
          rows(), [{ name: 'r', node: r }], r);
        yield F(5, 'i = ' + i + '：④ 申请新结点 s。', rows(pending), [{ name: 'r', node: r }, { name: 's', node: s }], s);
        yield F(6, '⑤ s->data = a[' + i + '] = ' + a[i] + '。', rows(pending), [{ name: 'r', node: r }, { name: 's', node: s }], s);
        r.next = s;
        yield F(7, '⑥ r->next = s：把 s 挂到当前表尾之后。', rows(), [{ name: 'r', node: r }, { name: 's', node: s }], s);
        r = s;
        yield F(8, '⑦ r = s：尾指针后移，r 永远指着最后一个结点。', rows(), [{ name: 'r', node: r }], s);
      }
      yield F(10, '⑧ r->next = NULL：收尾。（漏掉这行，链尾就是野指针）', rows(), [{ name: 'L', node: L }, { name: 'r', node: r }], r);
      yield F(11, '建表完成：3 → 1 → 4 → 1 → 5，顺序与输入一致。', rows(), [{ name: 'L', node: L }], null);
    }
  });
})(window.DSANIM = window.DSANIM || {});
