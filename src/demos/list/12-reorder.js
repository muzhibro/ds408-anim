/* 2.11 链表重排 a1,an,a2,an-1…（三步法） */
(function (NS) {
  'use strict';

  var CH = NS.CH, mkHead = NS.mkHead, build = NS.build, F = NS.F;

CH('list').demos.push({
    id: 'reorder', name: '2.11 链表重排 a1,an,a2,an-1…（三步法）', doubly: false,
    note: '<b>三步串联</b>：① 找前半段最后一个结点 → ② 逆置后半段 → ③ 两段交替合并。①②③ 各是一个得分点，注释必须写清。',
    expect: ['L', 'a1', 'a6', 'a2', 'a5', 'a3', 'a4'],
    code: [
      'void Reorder(LinkList L) {',
      '    if (!L->next || !L->next->next) return;',
      '    LNode *slow = L->next, *fast = L->next;',
      '    while (fast->next && fast->next->next) {',
      '        slow = slow->next;',
      '        fast = fast->next->next;',
      '    }',
      '    LNode *p = slow->next, *q;',
      '    slow->next = NULL;',
      '    while (p) {',
      '        q = p->next;',
      '        p->next = slow->next;',
      '        slow->next = p;',
      '        p = q;',
      '    }',
      '    LNode *h = L->next;',
      '    LNode *b = slow->next;',
      '    slow->next = NULL;',
      '    while (b) {',
      '        q = h->next;',
      '        h->next = b;',
      '        b = b->next;',
      '        h->next->next = q;',
      '        h = q;',
      '    }',
      '}'
    ],
    run: function* () {
      var vals = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'];
      var ns = build(vals);
      var L = mkHead('L'); L.next = ns[0];
      var slow = ns[0], fast = ns[0], p = null, q = null, h = null, b = null;
      var ptr = function (extra) {
        var a = [];
        if (slow) a.push({ name: 'slow', node: slow });
        if (fast) a.push({ name: 'fast', node: fast });
        if (p) a.push({ name: 'p', node: p });
        if (b) a.push({ name: 'b', node: b });
        if (h) a.push({ name: 'h', node: h });
        if (q) a.push({ name: 'q', node: q });
        return a;
      };
      /* 一阶段：整表 + slow/fast */
      var rowAll = function () { return [{ label: 'L（整条）', head: L }]; };
      /* 二阶段：前半段 + 还没逆置的剩余（从 q） */
      var rowRev = function () {
        var out = [{ label: 'L（前半段 + 已逆置）', head: L }];
        if (q) out.push({ label: '还没逆置的（从 q）', head: q });
        if (p) out.push({ label: 'p（正在摘的）', head: p, cut: p, cutNote: '' });
        return out;
      };
      /* 三阶段：接好的前缀（到 h）+ 前半段（从 q）+ 后半段（从 b） */
      var rowZip = function () {
        return [
          { label: '已接好（画到 h）', head: L, cut: h, cutNote: h ? 'h 之后还没接' : '还没开始' },
          { label: '前半段剩余（从 q）', head: q },
          { label: '后半段剩余（从 b）', head: b }
        ];
      };
      yield F(0, '准备：a1→a2→a3→a4→a5→a6。目标 a1→a6→a2→a5→a3→a4。先看清楚：后半段要<b>倒着</b>插。</b>', rowAll(), [{ name: 'L', node: L }], L);
      yield F(1, '① 边界：结点数 < 2 直接返回（不用重排）。', rowAll(), [{ name: 'L', node: L }], L);
      yield F(2, '② slow = fast = L->next：两人同时出发，slow 一步、fast 两步。', rowAll(), ptr(), slow);
      var round = 0;
      while (fast.next && fast.next.next) {
        round++;
        yield F(3, '第 ' + round + ' 轮判定：fast 在 ' + fast.val + '，fast->next->next = ' + fast.next.next.val + ' 还有结点 → 继续走。', rowAll(), ptr(), fast);
        slow = slow.next;
        yield F(4, 'slow 走一步 → ' + slow.val + '。', rowAll(), ptr(), slow);
        fast = fast.next.next;
        yield F(5, 'fast 走两步 → ' + fast.val + '。', rowAll(), ptr(), fast);
      }
      yield F(3, '第 ' + (round + 1) + ' 轮判定：fast 在 ' + fast.val + '，前面不足两个结点了 → 循环结束。slow 停在 ' + slow.val + '，它就是<b>前半段的最后一个</b>。', rowAll(), ptr(), slow);
      p = slow.next;
      yield F(7, '③ p = slow->next：p 指向后半段第一个结点 ' + p.val + '。拆分位置：' + slow.val + ' | ' + p.val + '。', rowAll(), ptr(), p);
      q = p;
      slow.next = null;
      yield F(8, '④ slow->next = NULL：先把两段<b>断开</b>，之后的头插才不会把前半段带乱。此刻 L 只剩 ' + slow.val + ' 及以前。', rowAll(), ptr(), slow);
      /* ---- ⑤ 头插逆置后半段 ---- */
      while (p) {
        var nxt = p.next;
        yield F(9, 'while (p)：后半段还有结点没搬完，就继续头插逆置。', rowRev(), ptr(), p);
        yield F(10, '⑤ 逆置：q = p->next，先把 ' + p.val + ' 的后继 ' + (nxt ? nxt.val : 'NULL') + ' 存下来，不然改完 p->next 就找不回来了。', rowRev(), ptr(), p);
        q = nxt;
        yield F(11, p.val + '->next = slow->next：把 ' + p.val + ' 的 next 改指到当前逆置段的最前面（' + (slow.next ? slow.next.val : 'NULL') + '）。',
          rowRev(), ptr(), p, { link: { from: p, to: slow.next, text: p.val + '->next = ' + (slow.next ? slow.next.val : 'NULL') } });
        p.next = slow.next;
        yield F(12, 'slow->next = ' + p.val + '：' + p.val + ' 成为逆置段的第一个 —— 这就是"头插"那一下。', rowRev(), ptr(), p);
        slow.next = p;
        p = nxt;
        q = p;
        yield F(13, 'p = q：p 前进到 ' + (p ? p.val : 'NULL') + '，接着摘下一个。', rowRev(), ptr(), p);
      }
      yield F(13, '后半段逆置完成：' + slow.val + ' 之后是 ' + slow.next.val + ' → …，原来是 a4→a5→a6，现在成 a6→a5→a4。', rowAll(), [{ name: 'slow', node: slow }], slow);
      /* ---- ⑥ 交替合并 ---- */
      h = L.next; b = slow.next;
      yield F(15, '⑥ h = L->next：前半段游标，从头开始（a1）。', rowAll(), ptr(), h);
      yield F(16, 'LNode *b = slow->next：后半段游标，指向逆置后的第一颗（a6）。两个游标各走一段，交替往里插。', rowAll(), ptr(), b);
      yield F(17, 'slow->next = NULL：再断一次，让前半段末尾变成干净的结尾。', rowAll(), ptr(), h);
      slow.next = null;
      q = h.next;
      var k = 0;
      while (b && k++ < 12) {
        yield F(18, '第 ' + k + ' 轮：把 b（' + b.val + '）插到 h（' + h.val + '）后面。', rowZip(), ptr(), b,
          { link: { from: h, to: b, text: 'h->next = b' } });
        yield F(19, 'q = h->next：先保住 h 原来的后继 ' + (q ? q.val : 'NULL') + '（不保就丢了）。', rowZip(), ptr(), q);
        h.next = b;
        yield F(20, 'h->next = b：' + h.val + ' 后面接上 ' + b.val + '。', rowZip(), ptr(), b);
        b = b.next;
        yield F(21, 'b = b->next：后半段前进到 ' + (b ? b.val : 'NULL') + '。', rowZip(), ptr(), b);
        h.next.next = q;
        yield F(22, 'h->next->next = q：让刚插上的 ' + h.next.val + ' 再接回 ' + (q ? q.val : 'NULL') + ' —— 这才是"交替"。', rowZip(), ptr(), q);
        h = q;
        q = h ? h.next : null;
        yield F(23, 'h = q：前半段前进到 ' + (h ? h.val : 'NULL') + '，准备下一轮。', rowZip(), ptr(), h);
      }
      yield F(24, '完成：a1 → a6 → a2 → a5 → a3 → a4。三步各 O(n)，总共 O(n)；只用了 slow、fast、p、q、h、b 六个指针，空间 O(1)。',
        [{ label: 'L（重排后）', head: L }], [{ name: 'L', node: L }], null);
    }
  });
})(window.DSANIM = window.DSANIM || {});
