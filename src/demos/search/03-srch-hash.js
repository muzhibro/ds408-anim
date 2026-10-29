/* 查找 · 5.4 哈希表 · 线性探测 */
(function (NS) {
  'use strict';

  var CH = NS.CH, FA = NS.FA;

CH('search').demos.push({
    id: 'srch-hash', name: '5.4 哈希表 · 线性探测',
    note: '除留余数法 <b>H(key) = key % 13</b>；冲突了就往后找第一个空位（到表尾回头）。查找成功 ASL = 比较次数之和 / 元素个数。',
    code: [
      'int Insert(int H[], int key) {',
      '    int i = key % 13;                  /* 哈希函数 */',
      '    while (H[i] != EMPTY) i = (i + 1) % 13;   /* 线性探测 */',
      '    H[i] = key;',
      '    return i;',
      '}',
      'int Search(int H[], int key) {',
      '    int i = key % 13, cnt = 1;',
      '    while (H[i] != EMPTY) {',
      '        if (H[i] == key) return i;',
      '        i = (i + 1) % 13; cnt++;',
      '    }',
      '    return -1;                         /* 碰到空位即失败 */',
      '}'
    ],
    run: function* () {
      var M = 13, H = new Array(M).fill(null), keys = [22, 41, 53, 46, 30, 13, 1];
      var view = function () { return H.map(function (v) { return v == null ? '' : v; }); };
      var idxLabel = function () { var a = []; for (var i = 0; i < M; i++) a.push(String(i)); return a; };
      yield FA(0, '准备：表长 13，H(key) = key % 13。依次插入 ' + keys.join(', ') + '。', view(), { labels: idxLabel() });
      var total = 0;
      for (var t = 0; t < keys.length; t++) {
        var k = keys[t], h = k % M, i = h, probes = 1;
        yield FA(1, '插入 ' + k + '：h = ' + k + ' % 13 = ' + h + '。', view(), { labels: idxLabel(), marks: [{ name: 'h', at: h }] });
        while (H[i] != null) {
          yield FA(2, '位置 ' + i + ' 已被 ' + H[i] + ' 占据 → 冲突，探测下一格。', view(), { labels: idxLabel(), marks: [{ name: 'i', at: i, color: '#f472b6' }], side: ['本次探测 <b>' + (probes + 1) + '</b> 次'] });
          i = (i + 1) % M; probes++;
        }
        H[i] = k;
        total += probes;
        yield FA(3, '位置 ' + i + ' 空着 → 放进去。' + (i !== h ? '（相对 h=' + h + ' 偏移了 ' + ((i - h + M) % M) + ' 格）' : '（一次就命中，无冲突）'),
          view(), { labels: idxLabel(), marks: [{ name: 'i', at: i, color: '#22c55e' }], side: ['探测次数 <b>' + probes + '</b>', '累计 <b>' + total + '</b>'] });
      }
      yield FA(4, '插入完毕：' + view().join(' ') + '。查找成功 ASL = (' + total + ')/' + keys.length + ' ≈ ' + (total / keys.length).toFixed(2) + '。',
        view(), { labels: idxLabel(), side: ['ASL<sub>成功</sub> <b>' + (total / keys.length).toFixed(2) + '</b>'] });
      /* 查找 46 */
      var q = 46, j = q % M, c = 1;
      yield FA(6, '查找 46：h = 46 % 13 = ' + j + '。', view(), { labels: idxLabel(), marks: [{ name: 'j', at: j }] });
      while (H[j] != null) {
        if (H[j] === q) {
          yield FA(8, 'A[' + j + '] = 46 → 找到，比较 ' + c + ' 次。', view(), { labels: idxLabel(), marks: [{ name: 'j', at: j, color: '#22c55e' }], side: ['比较 <b>' + c + '</b> 次'],
            cmp: { a: j, b: -1, side: 'right', vtext: 'key=' + q, left: 'H[' + j + ']=' + H[j], right: 'key', op: '==', ok: true, res: '命中' } });
          break;
        }
        j = (j + 1) % M; c++;
      }
    }
  });
})(window.DSANIM = window.DSANIM || {});
