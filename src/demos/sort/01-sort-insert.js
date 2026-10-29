/* 排序 · 6.1 直接插入排序 */
(function (NS) {
  'use strict';

  var CH = NS.CH, FA = NS.FA, SORT_CASES = NS.SORT_CASES, sortedSet = NS.sortedSet;

CH('sort').demos.push({
    id: 'sort-insert', cases: SORT_CASES, name: '6.1 直接插入排序',
    note: '<b>把 A[i] 插进左边已排好的有序区</b>：先存 key，比 key 大的整体后移，空出的位置放 key。最好 O(n)（原本有序），最坏/平均 O(n²)，空间 O(1)，<b>稳定</b>。',
    code: [
      'void InsertSort(int A[], int n) {',
      '    for (int i = 1; i < n; i++) {',
      '        int key = A[i], j = i - 1;      /* key 先存起来，否则会被后移覆盖 */',
      '        while (j >= 0 && A[j] > key) {  /* 严格大于才后移 → 相等停住 → 稳定 */',
      '            A[j + 1] = A[j];',
      '            j--;',
      '        }',
      '        A[j + 1] = key;                 /* 空位落 key */',
      '    }',
      '}'
    ],
    run: function* (c) {
      var A = (c && c.arr ? c.arr.slice() : [49, 38, 65, 97, 76, 13, 27, 49]), n = A.length, i, j, key, s;
      yield FA(0, '准备：' + A.join(' ') + '。前面一段是"有序区"，后面一段是"待插区"。', A, {});
      for (i = 1; i < n; i++) {
        key = A[i]; j = i - 1;
        s = sortedSet(i);
        yield FA(2, '第 ' + i + ' 轮：key = A[' + i + '] = ' + key + '，左边 0..' + (i - 1) + ' 已有序。',
          A, { marks: [{ name: 'i', at: i }], sorted: s, spans: [{ from: 0, to: i - 1 }] });
        while (j >= 0 && A[j] > key) {
          yield FA(3, 'A[' + j + '] = ' + A[j] + ' > key(' + key + ') → 把它往后挪一格，腾出前面的位置。',
            A, { marks: [{ name: 'j', at: j }, { name: 'i', at: i }], sorted: s, spans: [{ from: 0, to: i - 1 }], jump: { from: j, to: j + 1, label: A[j] + ' 后移一格' },
                 cmp: { a: j, b: -1, side: 'left', vtext: 'key=' + key, left: 'A[' + j + ']=' + A[j], right: 'key', op: '>', ok: true, res: '后移' } });
          A[j + 1] = A[j];
          yield FA(4, 'A[' + (j + 1) + '] ← ' + A[j] + '（key=' + key + ' 先寄存在变量里，不占数组位置）。',
            A, { marks: [{ name: 'j', at: j }, { name: 'i', at: i }], sorted: s, spans: [{ from: 0, to: i - 1 }] });
          j--;
        }
        if (j >= 0) {
          yield FA(3, 'A[' + j + '] = ' + A[j] + ' ≤ key(' + key + ') → 停在这里，前面已是有序区。',
            A, { marks: [{ name: 'j', at: j }, { name: 'i', at: i }], sorted: s, spans: [{ from: 0, to: i - 1 }],
                 cmp: { a: j, b: -1, side: 'left', vtext: 'key=' + key, left: 'A[' + j + ']=' + A[j], right: 'key', op: '≤', ok: false, res: '停' } });
        }
        A[j + 1] = key;
        yield FA(7, 'key(' + key + ') 落在 ' + (j + 1) + ' 号位 —— 前 ' + (i + 1) + ' 个元素已有序。',
          A, { marks: [{ name: 'i', at: j + 1 }], sorted: sortedSet(i + 1), spans: [{ from: 0, to: i }], jump: { from: i, to: j + 1, label: key + ' 落位' } });
      }
      yield FA(8, '完成：' + A.join(' ') + '。比较次数最坏 n(n−1)/2，时间 O(n²)，空间 O(1)。', A, { sorted: sortedSet(n) });
    }
  });
})(window.DSANIM = window.DSANIM || {});
