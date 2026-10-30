/* 4.6 Dijkstra 单源最短路 */
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
      var showDist = function () { return [0, 1, 2, 3, 4, 5].map(function (i2) { return dist[i2] === INF ? '∞' : dist[i2]; }).join(', '); };
      yield FG(0, 'Dijkstra 从一个源点出发，逐步把"最短路已确定"的点收进 done 集合。', G,
        { state: state(0), labels: lab(), side: ['源点 <b>0</b>', 'dist <b>[' + showDist() + ']</b>'] });
      yield FG(1, 'int done[MAXV] = {0}：一开始谁都没定死。', G,
        { state: {}, labels: lab(), side: ['done 全 0'] });
      yield FG(2, '初始化：dist[i] ← 源点到 i 的<b>直接边权</b>（没边就是 ∞），dist[0] 置 0；path[i] ← 源点。', G,
        { state: {}, labels: lab(), side: ['dist <b>[' + showDist() + ']</b>'] });
      yield FG(3, '源点自己定死：done[0]=1，dist[0]=0。', G, { state: state(0), labels: lab(), side: ['已确定 <b>0</b>'] });
      for (var k = 1; k < N; k++) {
        var u = -1, best = INF;
        yield FG(4, '第 ' + k + ' 轮：k=' + k + ' < ' + N + '，还要再定死一个点。', G,
          { state: state(null), labels: lab(), side: ['dist <b>[' + showDist() + ']</b>'] });
        yield FG(5, 'int u = -1, best = INF：准备在未确定的点里找 dist 最小的那个。', G,
          { state: state(null), labels: lab() });
        yield FG(6, '扫一遍所有点（① 找最小）：ds[] 里 dist 还未定的点才有资格竞争。', G,
          { state: state(null), labels: lab() });
        for (var j = 0; j < N; j++) if (!done[j] && dist[j] < best) { best = dist[j]; u = j; }
        if (k === 1) {
          yield FG(7, 'if (!done[i] && dist[i] < best)：边扫边更新 best/u，扫完 best = ' + (best === INF ? '∞' : best) + '，u = ' + u + '。', G,
            { state: state(null), labels: lab(), side: ['当前最小 <b>' + (best === INF ? '∞' : best) + '</b> @ ' + u] });
        }
        if (u === -1) {
          yield FG(8, 'u == -1：剩下的点都不可达 → break，结束。', G, { state: state(null), labels: lab() });
          break;
        }
        if (k === 1) {
          yield FG(8, 'u = ' + u + ' ≠ -1 → 不退出，继续定死它。', G, { state: state(u), labels: lab() });
        }
        yield FG(9, '② 定死 u = ' + u + '：done[' + u + '] = 1。它的最短路从此不会再变。', G,
          { state: state(u), scan: { v: u, w: null }, labels: lab(), side: ['dist[' + u + '] = <b>' + best + '</b> 确定'] });
        done[u] = 1;
        yield FG(10, '③ 用 u = ' + u + ' 去松弛：看它的每个邻居 v，能不能让 dist[v] 变小。', G,
          { state: state(u), scan: { v: u, w: null }, labels: lab() });
        for (var v = 0; v < N; v++) {
          var ww = w(u, v);
          if (done[v] || ww === INF) continue;
          if (dist[u] + ww < dist[v]) {
            yield FG(11, dist[u] + ' + ' + ww + ' = ' + (dist[u] + ww) + ' < dist[' + v + ']=' + (dist[v] === INF ? '∞' : dist[v]) + ' → 松弛成功。', G,
              { state: state(u), scan: { v: u, w: v }, labels: lab(),
                edgeOn: (function (o) { o[u + '-' + v] = 1; return o; })({}),
                side: ['dist[' + v + '] 要从 <b>' + (dist[v] === INF ? '∞' : dist[v]) + '</b> 改小'] });
            dist[v] = dist[u] + ww;
            yield FG(12, 'dist[' + v + '] ← ' + dist[u] + ' + ' + ww + ' = ' + dist[v] + '：更短的路找到了。', G,
              { state: state(u), scan: { v: u, w: v }, labels: lab(),
                edgeOn: (function (o) { o[u + '-' + v] = 1; return o; })({}),
                side: ['dist[' + v + '] = <b>' + dist[v] + '</b>'] });
            path[v] = u;
            yield FG(13, 'path[' + v + '] ← ' + u + '：记住 v 是从 u 走过来的，最后靠它倒推出路径。', G,
              { state: state(u), scan: { v: u, w: v }, labels: lab(),
                side: ['path[' + v + '] = ' + u] });
          } else {
            yield FG(11, '不算更短：' + dist[u] + '+' + ww + ' ≥ dist[' + v + ']=' + (dist[v] === INF ? '∞' : dist[v]) + '，不改。', G,
              { state: state(u), scan: { v: u, w: v }, labels: lab(), side: ['dist[' + v + '] 保持 <b>' + (dist[v] === INF ? '∞' : dist[v]) + '</b>'] });
          }
        }
      }
      yield FG(15, '全部定死。dist = [' + showDist() + ']。', G,
        { state: (function () { var o = {}; for (var i2 = 0; i2 < N; i2++) o[i2] = 'done'; return o; })(), labels: lab(), side: ['答案 <b>[' + showDist() + ']</b>'] });
    }
  });
})(window.DSANIM = window.DSANIM || {});
