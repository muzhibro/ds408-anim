/* 排序和查找共用的用例数据 */
(function (NS) {
  'use strict';

  /* 换输入看最好/最坏/重复元素 */
  var SORT_CASES = [
    { label: '随机 8 个（默认）', arr: [49, 38, 65, 97, 76, 13, 27, 49] },
    { label: '已经有序（最好情况）', arr: [13, 27, 38, 49, 49, 65, 76, 97] },
    { label: '完全逆序（最坏情况）', arr: [97, 76, 65, 49, 49, 38, 27, 13] },
    { label: '大量重复元素', arr: [49, 49, 13, 13, 76, 76, 49, 49] },
    { label: '只有 4 个（看边界）', arr: [38, 13, 76, 49] }
  ];

  var BIN_CASES = [
    { label: '命中 43（靠右半边）', arr: [7, 10, 13, 16, 19, 29, 32, 33, 37, 41, 43], key: 43 },
    { label: '命中 7（第一个就是）', arr: [7, 10, 13, 16, 19, 29, 32, 33, 37, 41, 43], key: 7 },
    { label: '未命中 35（夹在中间）', arr: [7, 10, 13, 16, 19, 29, 32, 33, 37, 41, 43], key: 35 },
    { label: '未命中 100（比所有都大）', arr: [7, 10, 13, 16, 19, 29, 32, 33, 37, 41, 43], key: 100 },
    { label: '只有 1 个元素', arr: [42], key: 42 }
  ];

  /* ========== 第 6 章 排序 ========== */
  function sortedSet(n, from) {
    var o = {}, i;
    for (i = from || 0; i < n; i++) o[i] = 1;
    return o;
  }

  NS.SORT_CASES = SORT_CASES;
  NS.BIN_CASES = BIN_CASES;
  NS.sortedSet = sortedSet;
})(window.DSANIM = window.DSANIM || {});
