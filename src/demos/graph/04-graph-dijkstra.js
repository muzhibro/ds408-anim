/* 图 · 4.6 Dijkstra 单源最短路 */
(function (NS) {
  'use strict';

  var CH = NS.CH, FG = NS.FG;

CH('graph').demos.push({
    id: 'graph-dijkstra', name: '4.6 Dijkstra 单源最短路',
    note: '贪心：<b>每次取出 dist 最小且未确定的点</b>，把它"定死"，再用它去松弛邻居。边上不能有负权。O(V²)（邻接矩阵）或 O((V+E)logV)（堆优化）。',
    code: [
      'void Dijkstra(MGraph G, int s, int dist[], int path[]) {',
      '    int done[MAXV] = {0};',
      '    for (int i = 0; i < G.vexnum; i++) { dist[i] = G.edge[s][i]; path[i] = s; }',
      '    done[s] = 1; dist[s] = 0;',
      '    for (int k = 1; k < G.vexnum; k++) {',
      '        int u = -1, best = INF;',
      '        for (int i = 0; i < G.vexnum; i++)          /* ① 找最小 */',
      '            if (!done[i] && dist[i] < best) { best = dist[i]; u = i; }',
      '        if (u == -1) break;',
      '        done[u] = 1;                                /* ② 定死 u */',
      '        for (int v = 0; v < G.vexnum; v++)          /* ③ 松弛 */',
      '            if (!done[v] && dist[u] + G.edge[u][v] < dist[v]) {',
      '                dist[v] = dist[u] + G.edge[u][v];',
      '                path[v] = u;',
      '            }',
      '    }',
      '}'
    ],
    run: function* () {
      var INF = Infinity, N = 6, s = 0;
      var E = { '0-1': 7, '0-2': 9, '0-5': 14, '1-2': 10, '1-3': 15, '2-3': 11, '2-5': 2, '3-4': 6, '4-5': 9 };
      var G = {
        directed: false,
        verts: [{ id: 0, x: 110, y: 120 }, { id: 1, x: 270, y: 55 }, { id: 2, x: 270, y: 195 },
                { id: 3, x: 430, y: 55 }, { id: 4, x: 430, y: 195 }, { id: 5, x: 585, y: 120 }],
        edges: Object.keys(E).map(function (k) { var a = k.split('-').map(Number); return [a[0], a[1], E[k]]; })
      };
      var w = function (a, b) { return E[a + '-' + b] != null ? E[a + '-' + b] : (E[b + '-' + a] != null ? E[b + '-' + a] : INF); };
      var dist = [], done = {}, path = [];
      for (var i = 0; i < N; i++) { dist[i] = w(s, i); path[i] = dist[i] < INF ? s : -1; }
      dist[s] = 0; done[s] = 1;
      var lab = function () { var o = {}; for (var i = 0; i < N; i++) o[i] = dist[i] === INF ? '∞' : dist[i]; return o; };
      var state = function (cur) { var o = {}; Object.keys(done).forEach(function (k) { o[k] = 'done'; }); if (cur != null) o[cur] = 'cur'; return o; };
      yield FG(0, '准备：源点 0。dist 初始就是 0 到各点的直接边权（无边则 ∞）。边上数字是权重。', G,
        { state: state(0), labels: lab(), side: ['dist <b>[' + [0, 1, 2, 3, 4, 5].map(function (i2) { return dist[i2] === INF ? '∞' : dist[i2]; }).join(', ') + ']</b>'] });
      yield FG(3, '起点 0 定死：done[0]=1，dist[0]=0。', G, { state: state(0), labels: lab(), side: ['已确定 <b>0</b>'] });
      for (var k = 1; k < N; k++) {
        var u = -1, best = INF;
        for (var j = 0; j < N; j++) if (!done[j] && dist[j] < best) { best = dist[j]; u = j; }
        if (u === -1) break;
        yield FG(6, '第 ' + k + ' 轮：未确定的点里 dist 最小的是 ' + u + '（' + best + '）→ 把它定死。', G,
          { state: state(u), scan: { v: u, w: null }, labels: lab(), side: ['dist[' + u + '] = <b>' + best + '</b>'] });
        done[u] = 1;
        yield FG(8, 'done[' + u + '] = 1。现在用它去松弛所有邻居。', G, { state: state(u), scan: { v: u, w: null }, labels: lab() });
        for (var v = 0; v < N; v++) {
          var ww = w(u, v);
          if (done[v] || ww === INF) continue;
          if (dist[u] + ww < dist[v]) {
            dist[v] = dist[u] + ww; path[v] = u;
            yield FG(11, '松弛成功：dist[' + v + '] ← ' + dist[u] + ' + ' + ww + ' = ' + dist[v] + '（经过 ' + u + '）。', G,
              { state: state(u), scan: { v: u, w: v }, labels: lab(), edgeOn: (function (o) { o[u + '-' + v] = 1; return o; })({}), side: ['dist[' + v + '] = <b>' + dist[v] + '</b>', 'path[' + v + '] = ' + u] });
          } else {
            yield FG(11, '不算更短：' + dist[u] + '+' + ww + ' ≥ dist[' + v + ']=' + dist[v] + '，不改。', G,
              { state: state(u), scan: { v: u, w: v }, labels: lab(), side: ['dist[' + v + '] 保持 <b>' + dist[v] + '</b>'] });
          }
        }
      }
      yield FG(15, '全部定死。dist = [' + [0, 1, 2, 3, 4, 5].map(function (i2) { return dist[i2]; }).join(', ') + ']。',
        G, { state: (function () { var o = {}; for (var i2 = 0; i2 < N; i2++) o[i2] = 'done'; return o; })(), labels: lab(), side: ['答案 <b>' + dist.join(', ') + '</b>'] });
    }
  });
})(window.DSANIM = window.DSANIM || {});
