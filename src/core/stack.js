/* 递归栈：每帧带一份栈快照 */
(function (NS) {
  'use strict';

  /* 当前演示的递归栈。FT / FA / FG 三个工厂都要读，demo 又直接调它们，只能放模块级。 */
  var live = null;

  function setStack(s) { live = s || null; }

  function stackOf(opt) {
    if (opt && opt.stack) return opt.stack.slice();
    return live ? live.slice() : null;
  }

  NS.setStack = setStack;
  NS.stackOf = stackOf;
})(window.DSANIM = window.DSANIM || {});
