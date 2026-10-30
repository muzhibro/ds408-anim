/* 6.6 堆排序（大根堆） */
(function (NS) {
  'use strict';

  var CH = NS.CH, FA = NS.FA, SORT_CASES = NS.SORT_CASES;

CH('sort').demos.push({
    id: 'sort-heap', cases: SORT_CASES, name: '6.6 堆排序（大根堆）',
    note: '两步：<b>建堆</b>（从 n/2 号往前逐个 sift-down，O(n)）+ <b>排序</b>（堆顶与末尾交换后下滤，O(n log n)）。空间 O(1)，<b>不稳定</b>。下标从 1 开始：孩子是 2i、2i+1。',
    code: [
      'void SiftDown(int A[], int k, int n) {   /* A[1..n] 大根堆 */',
      '    int t = A[k];',
      '    for (int i = 2 * k; i <= n; i = 2 * k) {',
      '        if (i < n && A[i + 1] > A[i]) i++;   /* 选较大的孩子 */',
      '        if (t >= A[i]) break;                /* 已经比孩子大，停 */',
      '        A[k] = A[i]; k = i;',
      '    }',
      '    A[k] = t;',
      '}',
      'void HeapSort(int A[], int n) {',
      '    for (int k = n / 2; k >= 1; k--) SiftDown(A, k, n);   /* 建堆 O(n) */',
      '    for (int i = n; i > 1; i--) {',
      '        swap(A[1], A[i]);                                  /* 堆顶最大值归位 */',
      '        SiftDown(A, 1, i - 1);                             /* 堆变小，重新下滤 */',
      '    }',
      '}'
    ],
    run: function* (c) {
      var H = (c && c.arr ? [0].concat(c.arr) : [0, 49, 38, 65, 97, 76, 13, 27, 49]);
      var n = H.length - 1, i, k, t, kk, tv, c;
      var view = function () { return H.slice(); };   /* 连 A[0] 哨兵一起显示，下标与代码一致 */
      var mkK = function (k, size) { return { marks: [{ name: 'k', at: k, color: '#38bdf8' }], spans: [{ from: 1, to: size, label: '堆 1..' + size }] }; };
      yield FA(0, '准备：' + view().join(' ') + '（下标 1..' + n + '）。注意 A[0] 是哨兵位，不参与排序。', view(), {});
      yield FA(9, '建堆：从最后一个非叶结点 k = n/2 = ' + Math.floor(n / 2) + ' 开始，往前逐个下滤。', view(),
        { marks: [{ name: 'k', at: Math.floor(n / 2) }], side: ['n/2 = <b>' + Math.floor(n / 2) + '</b>（最后一个非叶结点）'] });

      for (k = Math.floor(n / 2); k >= 1; k--) {
        yield FA(10, '处理结点 ' + k + '（值 ' + H[k] + '）：让它往下沉到合适位置。', view(), mkK(k, n));
        kk = k; tv = H[k];
        yield FA(1, 'int t = A[' + kk + '] = ' + tv + '：先把待下沉的值存到 t，它的位置马上就空出来了。', view(), mkK(kk, n));
        yield FA(2, 'for (int i = 2 * k; i <= n; i = 2 * k)：从它的左孩子 k=' + kk + ' → i=' + (2 * kk) + ' 开始往下比。', view(), mkK(kk, n));
        for (i = 2 * kk; i <= n; i = 2 * kk) {
          if (i < n && H[i + 1] > H[i]) {
            i++;
            yield FA(3, '左孩子 A[' + (i - 1) + ']=' + H[i - 1] + '，右孩子 A[' + i + ']=' + H[i] + ' → 选大的右孩子。', view(),
              Object.assign(mkK(kk, n), { cmp: { a: i - 1, b: i, left: 'A[' + (i - 1) + ']=' + H[i - 1], right: 'A[' + i + ']=' + H[i], op: '<', ok: true, res: '选右孩子' } }));
          } else {
            yield FA(3, '孩子里最大的是 A[' + i + ']=' + H[i] + '。', view(),
              Object.assign(mkK(kk, n), (i < n)
                ? { cmp: { a: i, b: i + 1, left: 'A[' + i + ']=' + H[i], right: 'A[' + (i + 1) + ']=' + H[i + 1], op: '≥', ok: true, res: '选左孩子' } }
                : { cmp: null }));
          }
          if (tv >= H[i]) {
            yield FA(4, '待下沉值 ' + tv + ' ≥ ' + H[i] + ' → 停止，位置合适。', view(),
              Object.assign(mkK(kk, n), { cmp: { a: i, b: -1, side: 'left', vtext: 't=' + tv, left: 't=' + tv, right: 'A[' + i + ']=' + H[i], op: '≥', ok: false, res: '停' } }));
            break;
          }
          yield FA(4, '待下沉值 ' + tv + ' < ' + H[i] + ' → 孩子更大，继续往下沉。', view(),
            Object.assign(mkK(kk, n), { cmp: { a: i, b: -1, side: 'left', vtext: 't=' + tv, left: 't=' + tv, right: 'A[' + i + ']=' + H[i], op: '<', ok: true, res: '下沉' } }));
          H[kk] = H[i];
          yield FA(5, 'A[' + kk + '] ← ' + H[i] + '，' + tv + ' 继续往下沉。', view(), mkK(kk, n));
          kk = i;
        }
        H[kk] = tv;
        yield FA(7, '落位：A[' + kk + '] = ' + tv + '。', view(), mkK(kk, n));
      }
      yield FA(10, '建堆完成：' + view().join(' ') + '，堆顶 A[1]=' + H[1] + ' 是全局最大值。', view(),
        { marks: [{ name: '堆顶', at: 1, color: '#22c55e' }], spans: [{ from: 1, to: n }] });

      var sorted = {};
      for (i = n; i > 1; i--) {
        yield FA(11, 'for (int i = n; i > 1; i--)：堆还剩 ' + i + ' 个元素，取堆顶、放末尾、再缩小堆。', view(),
          { marks: [{ name: 'i', at: i }], sorted: sorted, spans: [{ from: 1, to: i, label: '堆' }] });
        yield FA(12, '堆顶 A[1]=' + H[1] + ' 与末尾 A[' + i + ']=' + H[i] + ' 交换 → 最大值归位。', view(),
          { marks: [{ name: 'i', at: i }, { name: '堆顶', at: 1, color: '#22c55e' }], sorted: sorted, spans: [{ from: 1, to: i - 1, label: '堆' }], swap: [1, i] });
        t = H[1]; H[1] = H[i]; H[i] = t;
        sorted[i] = 1;
        yield FA(12, '交换完成：A[' + i + ']=' + H[i] + ' 定死，堆缩到 1..' + (i - 1) + '。', view(),
          { marks: [{ name: 'i', at: i }], sorted: sorted, spans: [{ from: 1, to: i - 1, label: '堆' }], swap: [1, i] });
        kk = 1; tv = H[1];
        for (c = 2; c <= i - 1; c = 2 * kk) {
          if (c < i - 1 && H[c + 1] > H[c]) c++;
          if (tv >= H[c]) break;
          H[kk] = H[c]; kk = c;
        }
        H[kk] = tv;
        yield FA(13, '堆缩到 1..' + (i - 1) + '，新堆顶下滤一遍恢复大根堆。', view(),
          { marks: [{ name: '堆顶', at: 1 }], sorted: sorted, spans: [{ from: 1, to: i - 1, label: '堆' }] });
      }
      sorted[1] = 1;
      yield FA(15, '完成：' + view().join(' ') + '（排序结果在 A[1..' + n + ']，A[0] 仍是哨兵）。时间复杂度 O(n log n)，空间 O(1)，不稳定。', view(), { sorted: sorted });
    }
  });
})(window.DSANIM = window.DSANIM || {});
