/* 排序 · 6.5 快速排序（挖坑法 Partition） */
(function (NS) {
  'use strict';

  var CH = NS.CH, FA = NS.FA, SORT_CASES = NS.SORT_CASES, sortedSet = NS.sortedSet, setStack = NS.setStack;

CH('sort').demos.push({
    id: 'sort-quick', cases: SORT_CASES, name: '6.5 快速排序（挖坑法 Partition）',
    note: '<b>Partition 一过，枢轴就落在最终位置</b>，左边全 ≤ 它、右边全 ≥ 它，再递归两边。平均 O(n log n)，最坏 O(n²)（已有序且取端点为枢轴），空间 O(log n)（递归栈），<b>不稳定</b>。',
    code: [
      'int Partition(int A[], int low, int high) {',
      '    int pivot = A[low];                  /* 挖坑：A[low] 空了 */',
      '    while (low < high) {',
      '        while (low < high && A[high] >= pivot) high--;',
      '        A[low] = A[high];                /* 右边的坑填到左边 */',
      '        while (low < high && A[low] <= pivot) low++;',
      '        A[high] = A[low];                /* 左边的坑填到右边 */',
      '    }',
      '    A[low] = pivot;                      /* 枢轴落位 */',
      '    return low;',
      '}',
      'void QuickSort(int A[], int low, int high) {',
      '    if (low < high) {',
      '        int p = Partition(A, low, high);',
      '        QuickSort(A, low, p - 1);',
      '        QuickSort(A, p + 1, high);',
      '    }',
      '}'
    ],
    run: function* (c) {
      var A = (c && c.arr ? c.arr.slice() : [49, 38, 65, 97, 76, 13, 27, 49]), n = A.length;
      var st = []; setStack(st);          /* 递归调用栈 */
      yield FA(0, '准备：' + A.join(' ') + '。快排 = "划分 + 递归"，划分是灵魂。', A, {});
      yield FA(11, 'void QuickSort(int A[], int low, int high)：递归函数只干三件事 —— 划分、排左段、排右段。', A, {});
      function* qs(low, high, depth) {
        if (low >= high) {
          if (low === high) yield FA(12, '区间 [' + low + ',' + high + '] 只剩一个元素，天然有序。', A, { marks: [{ name: 'low=high', at: low }] });
          return;
        }
        st.push('QuickSort(' + low + ',' + high + ')');
        yield FA(13, 'int p = Partition(A, ' + low + ', ' + high + ')：先划分——把 pivot 放到最终位置上，并返回它的下标。', A,
          { marks: [{ name: 'low', at: low }, { name: 'high', at: high }], side: ['递归深度 <b>' + depth + '</b>'] });
        var pivot = A[low], lo = low, hi = high;
        yield FA(1, '划分 [' + low + ',' + high + ']：pivot = A[' + low + '] = ' + pivot + '，low 位成了"坑"。',
          A, { marks: [{ name: 'low', at: lo }, { name: 'high', at: hi }], side: ['递归深度 <b>' + depth + '</b>'] });
        yield FA(2, 'while (low < high)：两个指针没相遇，就一左一右来回填坑。', A,
          { marks: [{ name: 'low', at: lo }, { name: 'high', at: hi }] });
        while (lo < hi) {
          while (lo < hi && A[hi] >= pivot) {
            yield FA(3, 'A[' + hi + ']=' + A[hi] + ' ≥ pivot(' + pivot + ') → high 左移。', A, { marks: [{ name: 'low', at: lo }, { name: 'high', at: hi }],
              cmp: { a: hi, b: -1, side: 'left', vtext: 'pivot=' + pivot, left: 'A[' + hi + ']=' + A[hi], right: 'pivot', op: '≥', ok: true, res: 'high 左移' } });
            hi--;
          }
          if (lo < hi) {
            yield FA(4, 'A[' + hi + ']=' + A[hi] + ' < pivot → 填进左边的坑 A[' + lo + ']。', A, { marks: [{ name: 'low', at: lo }, { name: 'high', at: hi }], jump: { from: hi, to: lo, label: A[hi] + ' 填到左边坑' },
              cmp: { a: hi, b: -1, side: 'left', vtext: 'pivot=' + pivot, left: 'A[' + hi + ']=' + A[hi], right: 'pivot', op: '<', ok: true, res: '填坑' } });
            A[lo] = A[hi];
            yield FA(4, '坑位转移：现在 A[' + hi + '] 成了新坑（值还是旧的 ' + A[hi] + '）。', A, { marks: [{ name: 'low', at: lo }, { name: 'high', at: hi }] });
          }
          while (lo < hi && A[lo] <= pivot) {
            yield FA(5, 'A[' + lo + ']=' + A[lo] + ' ≤ pivot(' + pivot + ') → low 右移。', A, { marks: [{ name: 'low', at: lo }, { name: 'high', at: hi }],
              cmp: { a: lo, b: -1, side: 'left', vtext: 'pivot=' + pivot, left: 'A[' + lo + ']=' + A[lo], right: 'pivot', op: '≤', ok: true, res: 'low 右移' } });
            lo++;
          }
          if (lo < hi) {
            yield FA(6, 'A[' + lo + ']=' + A[lo] + ' > pivot → 填进右边的坑 A[' + hi + ']。', A, { marks: [{ name: 'low', at: lo }, { name: 'high', at: hi }], jump: { from: lo, to: hi, label: A[lo] + ' 填到右边坑' },
              cmp: { a: lo, b: -1, side: 'left', vtext: 'pivot=' + pivot, left: 'A[' + lo + ']=' + A[lo], right: 'pivot', op: '>', ok: true, res: '填坑' } });
            A[hi] = A[lo];
            yield FA(6, '坑位转移：现在 A[' + lo + '] 成了新坑。', A, { marks: [{ name: 'low', at: lo }, { name: 'high', at: hi }] });
          }
        }
        A[lo] = pivot;
        yield FA(8, '两指针相遇于 ' + lo + '，pivot(' + pivot + ') 落位。左边 ≤ 它，右边 ≥ 它。', A, { marks: [{ name: 'pivot', at: lo, color: '#22c55e' }] });
        yield FA(9, 'return low：把枢轴的位置 ' + lo + ' 交回去 —— 它左边全 ≤ 它，右边全 ≥ 它，可以分别递归了。', A,
          { marks: [{ name: 'pivot', at: lo, color: '#22c55e' }] });
        yield FA(14, 'QuickSort(A, ' + low + ', ' + (lo - 1) + ')：先递归<b>左段</b>' + (low > lo - 1 ? '（空区间，直接返回）' : '') + '。', A,
          { spans: [{ from: low, to: Math.max(low, lo - 1), label: '左段' }], marks: [{ name: 'pivot', at: lo, color: '#22c55e' }] });
        yield* qs(low, lo - 1, depth + 1);
        yield FA(15, 'QuickSort(A, ' + (lo + 1) + ', ' + high + ')：再递归<b>右段</b>' + (lo + 1 > high ? '（空区间，直接返回）' : '') + '。', A,
          { spans: [{ from: Math.min(lo + 1, high), to: high, label: '右段' }], marks: [{ name: 'pivot', at: lo, color: '#22c55e' }] });
        yield* qs(lo + 1, high, depth + 1);
        st.pop();
      }
      yield* qs(0, n - 1, 1);
      setStack(null);
      yield FA(17, '完成：' + A.join(' ') + '。每层划分 O(n)，共 O(log n) 层 → 平均 O(n log n)。', A, { sorted: sortedSet(n) });
    }
  });
})(window.DSANIM = window.DSANIM || {});
