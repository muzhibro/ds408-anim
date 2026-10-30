/* 通用小工具 */
(function (NS) {
  'use strict';

  /* 浅拷贝。帧里会被后面继续改的对象先拷一份 */
  function cp(o) { var r = {}; for (var k in (o || {})) r[k] = o[k]; return r; }

  NS.cp = cp;
})(window.DSANIM = window.DSANIM || {});
