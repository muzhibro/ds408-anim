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

  NS.mkTree1 = mkTree1;
  NS.mkTree2 = mkTree2;
})(window.DSANIM = window.DSANIM || {});
