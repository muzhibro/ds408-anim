/* 二叉树章固定树例 */
(function (NS) {
  'use strict';

  var T = NS.T;

  /* ========== 第 3 章 二叉树 ========== */
  function mkTree1() {
    /* A(B(D, E(G)), C(∅, F)) */
    var D = T('D'), G = T('G'), E = T('E', G), B = T('B', D, E), F = T('F'), C = T('C', null, F);
    return T('A', B, C);
  }

  function mkTree2() {
    /* 完全二叉树：A(B(D,E), C(F,G)) */
    return T('A', T('B', T('D'), T('E')), T('C', T('F'), T('G')));
  }

  /* 照着线索化后的结果，直接算出每个结点的 ltag/rtag 和线索指向。
     遍历那个模板要现成的线索，不用再把建线索的过程演一遍。 */
  function threadOf(root) {
    var th = {}, order = [], pre = null;
    function slot(id) { return th[id] || (th[id] = { lt: 0, rt: 0, pl: null, pr: null }); }
    (function rec(p) {
      if (!p) return;
      rec(p.l);
      if (!p.l) { slot(p.id).lt = 1; slot(p.id).pl = pre ? pre.id : null; }
      if (pre && !pre.r) { slot(pre.id).rt = 1; slot(pre.id).pr = p.id; }
      order.push(p);
      pre = p;
      rec(p.r);
    })(root);
    if (pre) slot(pre.id).rt = 1;       /* 中序最后一个结点的后继为空 */
    return { threads: th, order: order };
  }

  /* 单链：全挂在左孩子上，线索化之后整棵树就是一条中序序列 */
  function mkChain() {
    return T('A', T('B', T('C', T('D'))));
  }

  NS.mkTree1 = mkTree1;
  NS.mkTree2 = mkTree2;
  NS.mkChain = mkChain;
  NS.threadOf = threadOf;
})(window.DSANIM = window.DSANIM || {});
