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
      var raw = edges.map(function (e) { return e[0] + '-' + e[1] + '(' + e[2] + ')'; });
      var picked = [];
      function edgeMap() {
        var o = {};
        picked.forEach(function (k) { o[k[0] + '-' + k[1]] = 1; });
        return o;
      }
      yield FG(0, 'Kruskal 的底座是并查集：Find 沿 parent 数组一路往上找到根，顺手把路径上的结点全挂到根上（路径压缩）。', G,
        { side: ['Find(x)：找根 + 路径压缩'] });
      yield FG(10, 'Kruskal 进入：图有 ' + N + ' 个顶点，最小生成树要选 V−1 = ' + (N - 1) + ' 条边。', G,
        { side: ['边表共 <b>' + edges.length + '</b> 条', '目标：选 <b>' + (N - 1) + '</b> 条'] });
      yield FG(11, 'sort(E, m)：先把边表<b>按权值升序</b>排好。之后只看边表，不再扫邻接表。', G,
        { side: ['排序后：' + raw.join(' ')] });
      yield FG(12, 'cnt = 0：一条边都还没收。', G,
        { side: ['已选 <b>0</b> 条，累计 <b>0</b>'] });
      var firstFind = true, firstUnion = true, needMergeFrame = false;
      for (var k = 0; k < edges.length && cnt < N - 1; k++) {
        var e = edges[k], a = find(e[0]), b = find(e[1]);
        yield FG(13, '第 ' + (k + 1) + ' 条边：i=' + k + ' < ' + edges.length + '，且 cnt=' + cnt + ' < ' + (N - 1) + ' → 继续循环。', G,
          { labels: lab(), side: ['已选 <b>' + cnt + '</b> 条', '累计 <b>' + total + '</b>'] });
        if (firstFind) {
          firstFind = false;
          yield FG(14, '求这条边两端的根：Find(' + e[0] + ') 和 Find(' + e[1] + ')。', G,
            { labels: lab(), dsMark: [e[0], e[1]], dsFoot: '正在查边 (' + e[0] + ',' + e[1] + ') 两端的集合根' });
          yield FG(1, 'int r = x：让 r 从 x 出发，准备一路找根。', G,
            { labels: lab(), dsMark: [e[0], e[1]], dsFoot: 'Find(' + e[0] + ')：r 初始指向顶点 ' + e[0] });
          yield FG(2, 'while (parent[r] >= 0) r = parent[r]：parent 存负数表示"自己是根，绝对值是集合大小"，非负就继续往上爬。', G,
            { labels: lab(), dsMark: [e[0], e[1]], dsFoot: 'Find(' + e[0] + ') 爬到根 ' + a });
          yield FG(3, '路径压缩：把这条链上的结点全都直接挂到根上，以后再查一步到位。', G,
            { labels: lab(), dsMark: [e[0], e[1]], dsFoot: '压缩后 ' + e[0] + ' 直接指向根 ' + a });
          yield FG(4, 'return r：根找到了，返回 ' + a + '。', G,
            { labels: lab(), dsMark: [e[0], e[1]], dsFoot: 'Find(' + e[0] + ') = ' + a + '，Find(' + e[1] + ') = ' + b });
        } else {
          yield FG(14, 'find(' + e[0] + ')=' + a + '，find(' + e[1] + ')=' + b + '：两端是不是已经连通？', G,
            { labels: lab(), dsMark: [e[0], e[1]],
              dsFoot: '边 (' + e[0] + ',' + e[1] + ') 两端根：' + a + ' / ' + b,
              side: ['已选 <b>' + cnt + '</b> 条', '累计 <b>' + total + '</b>'] });
        }
        if (a === b) {
          yield FG(15, 'a == b → 两端本来就连通，再加这条边就成环 → <b>丢弃</b>。', G,
            { labels: lab(), dsMark: [e[0], e[1]], dsFoot: '边 (' + e[0] + ',' + e[1] + ') 两端在同一集合 → 丢掉',
              side: ['跳过（成环）'] });
          continue;
        }
        if (parent[a] > parent[b]) { var t = a; a = b; b = t; }
        if (firstUnion) {
          firstUnion = false;
          needMergeFrame = true;
          yield FG(6, 'Union(a, b)：把两个集合合并成一个（并查集的"并"）。', G,
            { labels: lab(), dsMark: [e[0], e[1]], dsFoot: 'Union：准备把两个集合合并' });
          yield FG(7, 'if (parent[a] > parent[b]) 交换：负数越小集合越大，交换后保证 a 是更大的那棵树，树高增长才慢。', G,
            { labels: lab(), dsMark: [e[0], e[1]], dsFoot: '按规模合并：让大集合当新根' });
        }
        if (parent[a] > parent[b]) { var t = a; a = b; b = t; }
        parent[a] += parent[b]; parent[b] = a;
        cnt++; total += e[2];
        picked.push([e[0], e[1]]);
        if (needMergeFrame) {
          needMergeFrame = false;
          yield FG(8, 'parent[a] += parent[b]; parent[b] = a：小集合并进大集合，根 b 挂到 a 下面，规模累加。', G,
            { labels: lab(), dsMark: [e[0], e[1]], edgeOn: edgeMap(), dsFoot: '合并完成：根 ' + a + ' 的规模变成 ' + (-parent[a]) });
        }
        yield FG(16, 'Union(a, b); cnt++ → 收下这条边。已选 ' + cnt + ' 条，累计 ' + total + '。', G,
          { labels: lab(), dsMark: [e[0], e[1]], dsFoot: '收下边 (' + e[0] + ',' + e[1] + ')：两端集合合并',
            edgeOn: edgeMap(),
            side: ['已选 <b>' + cnt + '</b> 条', '累计 <b>' + total + '</b>'] });
      }
      yield FG(13, 'cnt 已经到 ' + (N - 1) + ' → 循环条件不再成立，结束。', G,
        { labels: lab(), edgeOn: edgeMap(), side: ['MST 总权 <b>' + total + '</b>'] });
    }
  });
})(window.DSANIM = window.DSANIM || {});
