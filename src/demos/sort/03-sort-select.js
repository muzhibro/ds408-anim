/* 6.4 简单选择排序 */
(function (NS) {
  'use strict';

  var CH = NS.CH, FA = NS.FA, SORT_CASES = NS.SORT_CASES, sortedSet = NS.sortedSet;

CH('sort').demos.push({
    id: 'sort-select', cases: SORT_CASES, name: '6.4 简单选择排序',
    note: '每趟在<b>无序区里找最小</b>，和无序区第一个交换。比较次数恒为 n(n−1)/2（与初始状态无关），交换最多 n−1 次，<b>不稳定</b>。',
    code: [
      'void SelectSort(int A[], int n) {',
      '    for (int i = 0; i < n - 1; i++) {',
      '        int min = i;',
      '        for (int j = i + 1; j < n; j++)',
      '            if (A[j] < A[min]) min = j;',
      '        if (min != i) swap(A[i], A[min]);',
      '    }',
      '}'
    ],
    run: function* (c) {
      var A = (c && c.arr ? c.arr.slice() : [49, 38, 65, 97, 76, 13, 27, 49]), n = A.length, i, j, mn;
      yield FA(0, '准备：' + A.join(' ') + '。', A, {});
      for (i = 0; i < n - 1; i++) {
        mn = i;
        yield FA(1, 'for (int i = 0; i < ' + (n - 1) + '; i++)：第 ' + (i + 1) + ' 趟，给位置 ' + i + ' 挑一个最小的。', A,
          { marks: [{ name: 'i', at: i }], sorted: sortedSet(i) });
        yield FA(2, 'int min = ' + i + '：先假设当前位置就是最小值（' + A[i] + '）。',
          A, { marks: [{ name: 'i/min', at: i }], sorted: sortedSet(i) });
        yield FA(3, 'for (int j = ' + (i + 1) + '; j < ' + n + '; j++)：从它后面一路扫到末尾，比出最小的。', A,
          { marks: [{ name: 'i', at: i }, { name: 'j', at: i + 1 }], sorted: sortedSet(i) });
        for (j = i + 1; j < n; j++) {
          if (A[j] < A[mn]) {
            var oldMin = mn;                       /* 先记住旧 min，不然标签会写成 A[min] 跟 A[j] 比 */
            mn = j;
            yield FA(4, 'A[' + j + ']=' + A[j] + ' < A[min]=' + A[oldMin] + ' → min 改指 ' + j + '。',
              A, { marks: [{ name: 'i', at: i }, { name: 'min', at: mn, color: '#f472b6' }, { name: 'j', at: j, color: '#f59e0b' }], sorted: sortedSet(i),
                   cmp: { a: j, b: oldMin, left: 'A[' + j + ']=' + A[j], right: 'A[min]=' + A[oldMin], op: '<', ok: true, res: 'min ← ' + j } });
          } else {
            yield FA(4, 'A[' + j + ']=' + A[j] + ' ≥ ' + A[mn] + ' → min 不动。',
              A, { marks: [{ name: 'i', at: i }, { name: 'min', at: mn, color: '#f472b6' }, { name: 'j', at: j, color: '#f59e0b' }], sorted: sortedSet(i),
                   cmp: { a: j, b: mn, left: 'A[' + j + ']=' + A[j], right: 'A[min]=' + A[mn], op: '≥', ok: false, res: 'min 不动' } });
          }
        }
        if (mn !== i) {
          yield FA(5, '最小值 A[' + mn + ']=' + A[mn] + ' 与 A[' + i + ']=' + A[i] + ' 交换 → ' + A[mn] + ' 归位。',
            A, { marks: [{ name: 'i', at: i }, { name: 'min', at: mn, color: '#f472b6' }], sorted: sortedSet(i), swap: [i, mn] });
          var t = A[i]; A[i] = A[mn]; A[mn] = t;
          yield FA(5, '交换完成：A[' + i + ']=' + A[i] + '、A[' + mn + ']=' + A[mn] + '。',
            A, { marks: [{ name: 'i', at: i }], sorted: sortedSet(i + 1), swap: [i, mn] });
        } else {
          yield FA(5, 'min 就是 i，不用交换。', A, { marks: [{ name: 'i', at: i }], sorted: sortedSet(i + 1) });
        }
      }
      yield FA(6, '完成：' + A.join(' ') + '。比较 n(n−1)/2 次，时间 O(n²)，空间 O(1)，不稳定。', A, { sorted: sortedSet(n) });
    }
  });
})(window.DSANIM = window.DSANIM || {});
