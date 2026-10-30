/* 链表：结点构造 + 链表帧 */
(function (NS) {
  'use strict';

  var nextId = NS.nextId;

  /* ---------- 通用：链表结点 ---------- */
  function mk(val, extra) {
    var n = { id: nextId(), val: String(val), isHead: false, next: null, prior: null };
    if (extra) for (var k in extra) n[k] = extra[k];
    return n;
  }

  function mkHead(label) { var n = mk(label, { isHead: true }); return n; }

  function build(vals) {
    var a = [], i;
    for (i = 0; i < vals.length; i++) a.push(mk(vals[i]));
    for (i = 0; i + 1 < a.length; i++) a[i].next = a[i + 1];
    return a;
  }

  function linkPrev(head) {
    var p = head, q = null;
    while (p) { p.prior = q; q = p; p = p.next; }
  }

  function walk(head) {
    var out = [], seen = {}, p = head, g = 0;
    while (p && !seen[p.id] && g++ < 60) { seen[p.id] = 1; out.push(p.isHead ? (p.val || 'H') : p.val); p = p.next; }
    return out;
  }

  /* ---------- 帧：链表 ---------- */
  function F(line, desc, rows, ptrs, mark, extra) {
    rows = rows || []; ptrs = ptrs || [];
    var map = {}, pairs = [];
    function visit(n) {
      if (!n || map[n.id]) return;
      var c = { id: n.id, val: n.val, isHead: !!n.isHead, next: null, prior: null };
      map[n.id] = c; pairs.push([n, c]);
      visit(n.next); visit(n.prior);
    }
    rows.forEach(function (r) { if (r && r.head) visit(r.head); if (r && r.cut) visit(r.cut); });
    ptrs.forEach(function (p) { if (p && p.node) visit(p.node); });
    if (mark) visit(mark);
    pairs.forEach(function (t) {
      t[1].next = t[0].next ? map[t[0].next.id] : null;
      t[1].prior = t[0].prior ? map[t[0].prior.id] : null;
    });
    var f = {
      mode: 'list', line: line, desc: desc,
      rows: rows.map(function (r) {
        if (!(r && r.head)) return r;
        var o = { label: r.label, head: map[r.head.id] };
        if (r.cut) o.cut = map[r.cut.id] || null;
        if (r.cutNote) o.cutNote = r.cutNote;
        return o;
      }),
      ptrs: ptrs.map(function (p) { return (p && p.node) ? { name: p.name, node: map[p.node.id] } : p; }),
      mark: mark ? (map[mark.id] || null) : null
    };
    if (extra) for (var k in extra) f[k] = extra[k];
    if (f.link) {
      f.link = {
        from: f.link.from && map[f.link.from.id] ? map[f.link.from.id] : null,
        to: f.link.to && map[f.link.to.id] ? map[f.link.to.id] : null,
        text: f.link.text, color: f.link.color
      };
    }
    return f;
  }

  NS.mk = mk;
  NS.mkHead = mkHead;
  NS.build = build;
  NS.linkPrev = linkPrev;
  NS.walk = walk;
  NS.F = F;
})(window.DSANIM = window.DSANIM || {});
