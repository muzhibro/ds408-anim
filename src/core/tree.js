/* 二叉树：结点构造 + 树帧 */
(function (NS) {
  'use strict';

  var nextId = NS.nextId, cp = NS.cp, stackOf = NS.stackOf;

  /* ---------- 通用：二叉树 ---------- */
  function T(val, l, r) { return { id: nextId(), val: String(val), l: l || null, r: r || null }; }

  function cloneTree(n, map) {
    if (!n) return null;
    map = map || {};
    if (map[n.id]) return map[n.id];
    var c = { id: n.id, val: n.val, l: null, r: null, tag: null };
    map[n.id] = c;
    c.l = cloneTree(n.l, map); c.r = cloneTree(n.r, map);
    return c;
  }

  function FT(line, desc, root, opt) {
    opt = opt || {};
    var f = { mode: 'tree', line: line, desc: desc, root: cloneTree(root) };
    f.mark = opt.mark ? opt.mark.id : null;
    f.ptrs = (opt.ptrs || []).map(function (p) { return { name: p.name, id: p.node ? p.node.id : null }; });
    /* 必须拷：tags / stack / threads 是 generator 里反复改的活对象，存引用会让历史帧全变成最终状态。 */
    f.tags = cp(opt.tags);
    f.stack = stackOf(opt);
    f.swapPair = opt.swapPair ? opt.swapPair.slice() : null;   /* 树里"交换两个孩子"：[idA,idB] */
    f.cmpTag = opt.cmpTag ? { text: opt.cmpTag.text, ok: opt.cmpTag.ok == null ? null : opt.cmpTag.ok } : null; /* 结点与 key 的比较结论 */
    f.side = opt.side ? opt.side.slice() : null;
    /* 线索：{结点 id: {lt, rt, pl, pr}}，lt/rt 是标记位，pl/pr 是前驱/后继的 id */
    f.threads = null;
    if (opt.threads) {
      f.threads = {};
      for (var k in opt.threads) {
        var t = opt.threads[k];
        f.threads[k] = { lt: t.lt || 0, rt: t.rt || 0, pl: t.pl == null ? null : t.pl, pr: t.pr == null ? null : t.pr };
      }
    }
    return f;
  }

  NS.T = T;
  NS.cloneTree = cloneTree;
  NS.FT = FT;
})(window.DSANIM = window.DSANIM || {});
