/* 排序 · 6.3 冒泡排序 */
(function (NS) {
  'use strict';

  var CH = NS.CH, FA = NS.FA, SORT_CASES = NS.SORT_CASES, sortedSet = NS.sortedSet;

CH('sort').demos.push({
    id: 'sort-bubble', cases: SORT_CASES, name: '6.3 冒泡排序',
    note: '每趟把<b>最大值冒到末尾</b>；若某趟一次交换都没有 → 已经有序，提前结束。最好 O(n)（有序 + flag），最坏 O(n²)，<b>稳定</b>。',
    code: [
      'void BubbleSort(int A[], int n) {',
      '    for (int i = 0; i < n - 1; i++) {',
      '        int swapped = 0;',
      '        for (int j = 0; j < n - 1 - i; j++) {',
      '            if (A[j] > A[j + 1]) {',
      '                swap(A[j], A[j + 1]);',
      '                swapped = 1;',
      '            }',
      '        }',
      '        if (!swapped) return;    /* 提前结束 */',
      '    }',
      '}'
    ],
    run: function* (c) {
      var A = (c && c.arr ? c.arr.slice() : [49, 38, 65, 97, 76, 13, 27, 49]), n = A.length, i, j, sw;
      yield FA(0, '准备：' + A.join(' ') + '。每一趟结束，末尾就多一个"定死的最大值"。',
        A, { spans: [{ from: 0, to: n - 1 }] });
      for (i = 0; i < n - 1; i++) {
        sw = 0;
        yield FA(2, '第 ' + (i + 1) + ' 趟开始，只需比到第 ' + (n - 1 - i) + ' 个位置。',
          A, { marks: [{ name: '趟', at: i, color: '#f59e0b' }], sorted: sortedSet(n, n - i) });
        for (j = 0; j < n - 1 - i; j++) {
          if (A[j] > A[j + 1]) {
            yield FA(4, 'A[' + j + ']=' + A[j] + ' > A[' + (j + 1) + ']=' + A[j + 1] + ' → 交换。',
              A, { marks: [{ name: 'j', at: j }, { name: 'j+1', at: j + 1, color: '#f472b6' }], sorted: sortedSet(n, n - i), swap: [j, j + 1],
                cmp: { a: j, b: j + 1, left: 'A[' + j + ']=' + A[j], right: 'A[' + (j + 1) + ']=' + A[j + 1], op: '>', ok: true, res: '交换' } });
            var t = A[j]; A[j] = A[j + 1]; A[j + 1] = t; sw = 1;
            yield FA(5, '交换后 A[' + j + ']=' + A[j] + '、A[' + (j + 1) + ']=' + A[j + 1] + '。',
              A, { marks: [{ name: 'j', at: j }, { name: 'j+1', at: j + 1, color: '#f472b6' }], sorted: sortedSet(n, n - i), swap: [j, j + 1] });
          } else {
            yield FA(4, 'A[' + j + ']=' + A[j] + ' ≤ ' + A[j + 1] + ' → 不动（相等也不换 → 稳定）。',
              A, { marks: [{ name: 'j', at: j }, { name: 'j+1', at: j + 1, color: '#f472b6' }], sorted: sortedSet(n, n - i),
                cmp: { a: j, b: j + 1, left: 'A[' + j + ']=' + A[j], right: 'A[' + (j + 1) + ']=' + A[j + 1], op: '≤', ok: false, res: '不动' } });
          }
        }
        yield FA(9, '第 ' + (i + 1) + ' 趟结束，A[' + (n - 1 - i) + ']=' + A[n - 1 - i] + ' 已定死。',
          A, { sorted: sortedSet(n, n - 1 - i) });
        if (!sw) {
          yield FA(9, '本趟一次交换都没有 → 整表已有序，直接 return。', A, { sorted: sortedSet(n) });
          break;
        }
      }
      yield FA(10, '完成：' + A.join(' ') + '。', A, { sorted: sortedSet(n) });
    }
  });
})(window.DSANIM = window.DSANIM || {});
