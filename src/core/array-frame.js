/* 数组帧：排序和查找共用 */
(function (NS) {
  'use strict';

  var cp = NS.cp, stackOf = NS.stackOf;

  /* ---------- 帧：数组 ---------- */
  function FA(line, desc, arr, opt) {
    opt = opt || {};
    return {
      mode: 'array', line: line, desc: desc,
      arr: arr.slice(),
      marks: (opt.marks || []).map(function (m) { return { name: m.name, at: m.at, color: m.color }; }),
      sorted: cp(opt.sorted),
      spans: (opt.spans || []).map(function (s) { return { from: s.from, to: s.to, label: s.label, color: s.color }; }),
      labels: cp(opt.labels),
      swap: opt.swap ? opt.swap.slice() : null,     /* [i,j]：两个格子互换，画双向弧 */
      jump: opt.jump ? { from: opt.jump.from, to: opt.jump.to, label: opt.jump.label } : null, /* 单向搬动 */
      cmp: opt.cmp ? {
        a: opt.cmp.a, b: opt.cmp.b == null ? -1 : opt.cmp.b,
        left: opt.cmp.left, right: opt.cmp.right,
        op: opt.cmp.op || '?', ok: opt.cmp.ok == null ? null : opt.cmp.ok,
        res: opt.cmp.res || '',
        side: opt.cmp.side || 'right',          /* 和变量比时，变量画在数组哪一侧 */
        vtext: opt.cmp.vtext || ''              /* 变量的字样，如 pivot=49、t=97、key=43 */
      } : null,                                 /* 比较：a、b 两个格子；b=-1 表示和"变量"比 */
      stack: stackOf(opt),
      side: opt.side ? opt.side.slice() : null
    };
  }

  NS.FA = FA;
})(window.DSANIM = window.DSANIM || {});
