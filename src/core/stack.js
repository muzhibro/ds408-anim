/* core · 递归栈：演示过程把栈顶快照塞进每一帧 */
(function (NS) {
  'use strict';

  /* 当前演示的递归栈：demo 里 push/pop 这一个数组，所有帧自动带上快照。
     用模块级的活变量是因为 FT / FA / FG 三个帧工厂都要读，而 demo 直接调它们。 */
  var live = null;

  function setStack(s) { live = s || null; }

  function stackOf(opt) {
    if (opt && opt.stack) return opt.stack.slice();
    return live ? live.slice() : null;
  }

  NS.setStack = setStack;
  NS.stackOf = stackOf;
})(window.DSANIM = window.DSANIM || {});
