/* 查找 · 5.1 折半查找（二分） */
(function (NS) {
  'use strict';

  var CH = NS.CH, FA = NS.FA, BIN_CASES = NS.BIN_CASES;

CH('search').demos.push({
    id: 'srch-binary', cases: BIN_CASES, name: '5.1 折半查找（二分）',
    note: '前提：<b>表必须有序</b>。每次砍掉一半，比较次数 ≤ ⌊log₂n⌋+1。用 <b>low ≤ high</b> 作循环条件，区间为空时低点会越过高点。',
    code: [
      'int BinarySearch(int A[], int n, int key) {',
      '    int low = 0, high = n - 1, mid;',
      '    while (low <= high) {              /* 注意是 <=，不是 < */',
      '        mid = (low + high) / 2;        /* 向下取整 */',
      '        if (A[mid] == key) return mid;',
      '        else if (A[mid] < key) low = mid + 1;   /* 去右半边 */',
      '        else high = mid - 1;                    /* 去左半边 */',
      '    }',
      '    return -1;                          /* 没找到 */',
      '}'
    ],
    run: function* (c) {
      var A = (c && c.arr ? c.arr.slice() : [7, 10, 13, 16, 19, 29, 32, 33, 37, 41, 43]), n = A.length, key = (c && c.key != null ? c.key : 43);
      var low = 0, high = n - 1, mid, cnt = 0;
      yield FA(0, '准备：有序表 ' + A.join(' ') + '，查找 key = ' + key + '。折半查找靠"下标"跳，不靠链。', A, { spans: [{ from: 0, to: n - 1 }] });
      yield FA(1, '① low = 0，high = ' + (n - 1) + '（闭区间）。', A, { marks: [{ name: 'low', at: low }, { name: 'high', at: high }] });
      while (low <= high) {
        mid = (low + high) >> 1;
        cnt++;
        yield FA(3, '第 ' + cnt + ' 次比较：mid = (' + low + '+' + high + ')/2 = ' + mid + '（向下取整）。',
          A, { marks: [{ name: 'low', at: low }, { name: 'mid', at: mid, color: '#f59e0b' }, { name: 'high', at: high }], spans: [{ from: low, to: high }], side: ['比较次数 <b>' + cnt + '</b>'] });
        if (A[mid] === key) {
          yield FA(4, 'A[' + mid + '] = ' + A[mid] + ' == key → 找到，返回下标 ' + mid + '。', A,
            { marks: [{ name: 'mid', at: mid, color: '#22c55e' }], spans: [{ from: low, to: high }], side: ['比较次数 <b>' + cnt + '</b>', '结果 <b>下标 ' + mid + '</b>'],
              cmp: { a: mid, b: -1, side: 'right', vtext: 'key=' + key, left: 'A[' + mid + ']=' + A[mid], right: 'key', op: '==', ok: true, res: '命中' } });
          return;
        } else if (A[mid] < key) {
          yield FA(5, 'A[' + mid + '] = ' + A[mid] + ' < ' + key + ' → 答案在右半边，low = mid+1 = ' + (mid + 1) + '。', A,
            { marks: [{ name: 'low', at: mid + 1 }, { name: 'high', at: high }], spans: [{ from: mid + 1, to: high }], side: ['比较次数 <b>' + cnt + '</b>'],
              cmp: { a: mid, b: -1, side: 'right', vtext: 'key=' + key, left: 'A[' + mid + ']=' + A[mid], right: 'key', op: '<', ok: true, res: '去右半' } });
          low = mid + 1;
        } else {
          yield FA(6, 'A[' + mid + '] = ' + A[mid] + ' > ' + key + ' → 答案在左半边，high = mid−1 = ' + (mid - 1) + '。', A,
            { marks: [{ name: 'low', at: low }, { name: 'high', at: mid - 1 }], spans: [{ from: low, to: mid - 1 }], side: ['比较次数 <b>' + cnt + '</b>'],
              cmp: { a: mid, b: -1, side: 'right', vtext: 'key=' + key, left: 'A[' + mid + ']=' + A[mid], right: 'key', op: '>', ok: true, res: '去左半' } });
          high = mid - 1;
        }
      }
      yield FA(8, 'low > high，区间为空 → 查找失败，返回 −1。', A, { side: ['比较次数 <b>' + cnt + '</b>'] });
    }
  });
})(window.DSANIM = window.DSANIM || {});
