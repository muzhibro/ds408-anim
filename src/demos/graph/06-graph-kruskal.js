/* 图 · 4.8 Kruskal 最小生成树 */
(function (NS) {
  'use strict';

  var CH = NS.CH, FG = NS.FG;

CH('graph').demos.push({
    id: 'graph-kruskal', name: '4.8 Kruskal 最小生成树',
    note: '<b>把边从小到大排序，能加就加，成环就跳过</b>，直到选够 V−1 条。判环靠并查集；路径压缩 + 按秩合并都能把单次操作降到 O(α)。适合稀疏图。',
    code: [
      'int Find(int x) {                       /* 并查集：找根 + 路径压缩 */',
      '    int r = x;',
      '    while (parent[r] >= 0) r = parent[r];',
      '    while (x != r) { int t = parent[x]; parent[x] = r; x = t; }',
      '    return r;',
      '}',
      'void Union(int a, int b) {              /* 按规模合并 */',
      '    if (parent[a] > parent[b]) { int t = a; a = b; b = t; }',
      '    parent[a] += parent[b]; parent[b] = a;',
      '}',
      'void Kruskal(Edge E[], int m, int V) {',
      '    sort(E, m);                          /* 按权升序 */',
      '    int cnt = 0;',
      '    for (int i = 0; i < m && cnt < V - 1; i++) {',
      '        int a = Find(E[i].u), b = Find(E[i].v);',
      '        if (a == b) continue;            /* 同一个集合 → 加进去就成环 */',
      '        Union(a, b); cnt++;              /* 收下这条边 */',
      '    }',
      '}'
    ],
    run: function* () {
      var N = 6;
      var edges = [[0, 2, 1], [3, 5, 2], [1, 4, 3], [2, 5, 4], [0, 3, 5], [1, 2, 5], [2, 3, 5], [0, 1, 6], [2, 4, 6], [4, 5, 6]];
      var G = {
        directed: false,
        verts: [{ id: 0, x: 120, y: 120 }, { id: 1, x: 260, y: 50 }, { id: 2, x: 360, y: 120 },
                { id: 3, x: 260, y: 200 }, { id: 4, x: 500, y: 70 }, { id: 5, x: 500, y: 175 }],
        edges: edges
      };
      var parent = {}, cnt = 0, total = 0;
      for (var i = 0; i < N; i++) parent[i] = -1;
      function find(x) { while (parent[x] >= 0) x = parent[x]; return x; }
      var lab = function () { var o = {}; for (var i = 0; i < N; i++) o[i] = String(find(i)); return o; };
      var state = function () { var o = {}; for (var i = 0; i < N; i++) if (find(i) === i && parent[i] < -1) { } return o; };
      yield FG(0, '准备：10 条边，先按权值升序排好：' + edges.map(function (e) { return e[0] + '-' + e[1] + '(' + e[2] + ')'; }).join('  '), G,
        { side: ['已排序 <b>' + edges.map(function (e) { return e[2]; }).join(' ') + '</b>'] });
      for (var k = 0; k < edges.length && cnt < N - 1; k++) {
        var e = edges[k], a = find(e[0]), b = find(e[1]);
        yield FG(12, '看边 ' + e[0] + '—' + e[1] + '（权 ' + e[2] + '）：find(' + e[0] + ')=' + a + '，find(' + e[1] + ')=' + b + '。', G,
          { labels: lab(), dsMark: [e[0], e[1]], dsFoot: 'Kruskal 不扫邻接表，走的是<b>边表</b>：正在检查边 (' + e[0] + ',' + e[1] + ')，权 ' + e[2],
            edgeOn: (function (o) { o[e[0] + '-' + e[1]] = 1; return o; })({}),
            side: ['已选 <b>' + cnt + '</b> 条，累计 <b>' + total + '</b>', '并查集根 <b>' + lab() + '</b>'] });
        if (a === b) {
          yield FG(14, 'a == b → 这两个点已经连通，加这条边就成环 → <b>丢弃</b>。', G,
            { labels: lab(), dsMark: [e[0], e[1]], dsFoot: '边 (' + e[0] + ',' + e[1] + ') 两端已在同一集合 → 丢掉', side: ['跳过（成环）'] });
          continue;
        }
        if (parent[a] > parent[b]) { var t = a; a = b; b = t; }
        parent[a] += parent[b]; parent[b] = a;
        cnt++; total += e[2];
        yield FG(15, '合并两个集合 → 收下这条边。已选 ' + cnt + ' 条，累计 ' + total + '。', G,
          { labels: lab(), dsMark: [e[0], e[1]], dsFoot: '收下边 (' + e[0] + ',' + e[1] + ')：两端集合合并',
            edgeOn: (function (o) { o[e[0] + '-' + e[1]] = 1; return o; })({}),
            side: ['已选 <b>' + cnt + '</b> 条', '累计 <b>' + total + '</b>'] });
      }
      yield FG(15, '选够 ' + (N - 1) + ' 条边 → MST，总权 <b>' + total + '</b>。', G, { labels: lab(), side: ['MST 总权 <b>' + total + '</b>'] });
    }
  });
})(window.DSANIM = window.DSANIM || {});
