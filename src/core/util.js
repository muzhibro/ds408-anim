/* core · 通用小工具 */
(function (NS) {
  'use strict';

  /* 浅拷贝：帧里凡是"会被后续步骤继续修改"的普通对象/数组，都要拷一份 */
  function cp(o) { var r = {}; for (var k in (o || {})) r[k] = o[k]; return r; }

  NS.cp = cp;
})(window.DSANIM = window.DSANIM || {});
