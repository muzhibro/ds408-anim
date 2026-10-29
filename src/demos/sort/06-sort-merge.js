/* 排序 · 6.7 归并排序（二路） */
(function (NS) {
  'use strict';

  var CH = NS.CH, T = NS.T, FA = NS.FA, SORT_CASES = NS.SORT_CASES, sortedSet = NS.sortedSet, setStack = NS.setStack;

CH('sort').demos.push({
    id: 'sort-merge', cases: SORT_CASES, name: '6.7 归并排序（二路）',
    note: '<b>先分到单个元素，再两两合并</b>。合并时用双指针比大小，谁小先搬。时间恒 O(n log n)，<b>空间 O(n)</b>（要辅助数组），<b>稳定</b>。',
    code: [
      'void Merge(int A[], int lo, int mid, int hi, int *T) {',
      '    int i = lo, j = mid + 1, k = lo;',
      '    while (i <= mid && j <= hi) {              /* 两段都有货 */',
      '        if (A[i] <= A[j]) T[k++] = A[i++];     /* 相等取左 → 稳定 */',
      '        else              T[k++] = A[j++];',
      '    }',
      '    while (i <= mid) T[k++] = A[i++];          /* 左段剩余整段搬 */',
      '    while (j <= hi)  T[k++] = A[j++];',
      '    for (k = lo; k <= hi; k++) A[k] = T[k];    /* 拷回 */',
      '}',
      'void MergeSort(int A[], int lo, int hi, int *T) {',
      '    if (lo >= hi) return;',
      '    int mid = (lo + hi) / 2;',
      '    MergeSort(A, lo, mid, T);',
      '    MergeSort(A, mid + 1, hi, T);',
      '    Merge(A, lo, mid, hi, T);',
      '}'
    ],
    run: function* (c) {
      var A = (c && c.arr ? c.arr.slice() : [49, 38, 65, 97, 76, 13, 27, 49]), n = A.length;
      var T = A.slice();
      var st = []; setStack(st);          /* 递归调用栈 */
      yield FA(0, '准备：' + A.join(' ') + '。归并排序是"分治"：递归对半分，回来时合并两个有序段。', A, {});
      function* ms(lo, hi, depth) {
        if (lo >= hi) {
          yield FA(11, '区间 [' + lo + ',' + hi + '] 只有一个元素，天然有序，直接返回。', A, { marks: [{ name: 'lo=hi', at: lo }], side: ['递归深度 <b>' + depth + '</b>'] });
          return;
        }
        st.push('MergeSort(' + lo + ',' + hi + ')');
        var mid = (lo + hi) >> 1;
        yield FA(12, '对半劈：[' + lo + ',' + mid + '] 和 [' + (mid + 1) + ',' + hi + ']。',
          A, { spans: [{ from: lo, to: mid, label: '左' }, { from: mid + 1, to: hi, label: '右', color: 'rgba(56,189,248,.12)' }], side: ['递归深度 <b>' + depth + '</b>'] });
        yield* ms(lo, mid, depth + 1);
        yield* ms(mid + 1, hi, depth + 1);
        var i = lo, j = mid + 1, k = lo;
        yield FA(2, '合并 [' + lo + ',' + mid + '] 与 [' + (mid + 1) + ',' + hi + ']：i=' + i + '，j=' + j + '，先比 A[i] 与 A[j]。',
          A, { marks: [{ name: 'i', at: i, color: '#38bdf8' }, { name: 'j', at: j, color: '#f472b6' }], spans: [{ from: lo, to: mid }, { from: mid + 1, to: hi, color: 'rgba(56,189,248,.12)' }] });
        while (i <= mid && j <= hi) {
          if (A[i] <= A[j]) {
            T[k] = A[i];
            yield FA(3, 'A[' + i + ']=' + A[i] + ' ≤ A[' + j + ']=' + A[j] + ' → 搬左边那个。', A, { marks: [{ name: 'i', at: i }, { name: 'j', at: j, color: '#f472b6' }, { name: 'k', at: k, color: '#22c55e' }], spans: [{ from: lo, to: mid }, { from: mid + 1, to: hi, color: 'rgba(56,189,248,.12)' }],
              cmp: { a: i, b: j, left: 'A[' + i + ']=' + A[i], right: 'A[' + j + ']=' + A[j], op: '≤', ok: true, res: '搬左' } });
            i++; k++;
          } else {
            T[k] = A[j];
            yield FA(4, 'A[' + i + ']=' + A[i] + ' > A[' + j + ']=' + A[j] + ' → 搬右边那个。', A, { marks: [{ name: 'i', at: i }, { name: 'j', at: j, color: '#f472b6' }, { name: 'k', at: k, color: '#22c55e' }], spans: [{ from: lo, to: mid }, { from: mid + 1, to: hi, color: 'rgba(56,189,248,.12)' }],
              cmp: { a: i, b: j, left: 'A[' + i + ']=' + A[i], right: 'A[' + j + ']=' + A[j], op: '>', ok: true, res: '搬右' } });
            j++; k++;
          }
        }
        while (i <= mid) { T[k++] = A[i++]; }
        while (j <= hi) { T[k++] = A[j++]; }
        for (k = lo; k <= hi; k++) A[k] = T[k];
        yield FA(8, '两段并完，拷回原数组：[' + lo + '..' + hi + '] = ' + A.slice(lo, hi + 1).join(' ') + '。',
          A, { spans: [{ from: lo, to: hi, label: '已有序' }] });
        st.pop();
      }
      yield* ms(0, n - 1, 1);
      setStack(null);
      yield FA(16, '完成：' + A.join(' ') + '。合并 O(n)、层数 O(log n) → O(n log n)；辅助数组 O(n)。', A, { sorted: sortedSet(n) });
    }
  });
})(window.DSANIM = window.DSANIM || {});
