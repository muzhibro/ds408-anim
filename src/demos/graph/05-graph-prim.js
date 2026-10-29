/* 图 · 4.7 Prim 最小生成树 */
(function (NS) {
  'use strict';

  var CH = NS.CH, FG = NS.FG;

CH('graph').demos.push({
    id: 'graph-prim', name: '4.7 Prim 最小生成树',
    note: '<b>从一个点开始"滚雪球"</b>：每次在"树内 ↔ 树外"的边里挑权最小的，把对面那个点拉进来。适合稠密图，O(V²)。注意"是否在树内"要用独立数组标记，别拿 0 权当哨兵。',
    code: [
      'void Prim(MGraph G, int v0) {',
      '    int lowcost[MAXV], inTree[MAXV] = {0};',
      '    for (int i = 0; i < G.vexnum; i++) { lowcost[i] = G.edge[v0][i]; }',
      '    inTree[v0] = 1;',
      '    for (int k = 1; k < G.vexnum; k++) {',
      '        int u = -1, best = INF;',
      '        for (int i = 0; i < G.vexnum; i++)          /* 树外最小 */',
      '            if (!inTree[i] && lowcost[i] < best) { best = lowcost[i]; u = i; }',
      '        if (u == -1) break;                         /* 不连通 */',
      '        inTree[u] = 1;                              /* 拉进树 */',
      '        for (int j = 0; j < G.vexnum; j++)',
      '            if (!inTree[j] && G.edge[u][j] < lowcost[j]) lowcost[j] = G.edge[u][j];',
      '    }',
      '}'
    ],
    run: function* () {
      var INF = Infinity, N = 6;
      var E = { '0-1': 6, '0-2': 1, '0-3': 5, '1-2': 5, '1-4': 3, '2-3': 5, '2-4': 6, '2-5': 4, '3-5': 2, '4-5': 6 };
      var G = {
        directed: false,
        verts: [{ id: 0, x: 120, y: 120 }, { id: 1, x: 260, y: 50 }, { id: 2, x: 360, y: 120 },
                { id: 3, x: 260, y: 200 }, { id: 4, x: 500, y: 70 }, { id: 5, x: 500, y: 175 }],
        edges: Object.keys(E).map(function (k) { var a = k.split('-').map(Number); return [a[0], a[1], E[k]]; })
      };
      var w = function (a, b) { return E[a + '-' + b] != null ? E[a + '-' + b] : (E[b + '-' + a] != null ? E[b + '-' + a] : INF); };
      var inTree = { 0: 1 }, low = [], chosen = {};
      for (var i = 0; i < N; i++) low[i] = w(0, i);
      low[0] = 0;
      var lab = function () { var o = {}; for (var i = 0; i < N; i++) o[i] = inTree[i] ? '✔' : (low[i] === INF ? '∞' : low[i]); return o; };
      var state = function (cur) { var o = {}; Object.keys(inTree).forEach(function (k) { o[k] = 'done'; }); if (cur != null) o[cur] = 'cur'; return o; };
      yield FG(0, '准备：从 0 号点开始。lowcost[i] = i 到"当前树"的最小距离，∞ 表示还没边相连。', G,
        { state: state(0), labels: lab(), side: ['已在树内 <b>0</b>'] });
      var total = 0;
      for (var k = 1; k < N; k++) {
        var u = -1, best = INF;
        for (var j = 0; j < N; j++) if (!inTree[j] && low[j] < best) { best = low[j]; u = j; }
        if (u === -1) break;
        var from = -1;
        for (var j2 = 0; j2 < N; j2++) if (inTree[j2] && w(j2, u) === best) { from = j2; break; }
        inTree[u] = 1; total += best;
        var ek = from + '-' + u;
        yield FG(9, '树外 lowcost 最小的是 ' + u + '（' + best + '，来自树内结点 ' + from + '）→ 拉进树。', G,
          { state: state(u), labels: lab(), edgeOn: (function (o) { o[ek] = 1; o[u + '-' + from] = 1; return o; })({}),
            side: ['选中边 <b>' + from + ' — ' + u + '（' + best + '）</b>', '累计权值 <b>' + total + '</b>'] });
        for (var v = 0; v < N; v++) {
          if (!inTree[v] && w(u, v) < low[v]) { low[v] = w(u, v); }
        }
        yield FG(11, '用 ' + u + ' 更新树外各点的 lowcost。', G, { state: state(u), labels: lab(), side: ['累计权值 <b>' + total + '</b>'] });
      }
      yield FG(11, 'MST 边权之和 = <b>' + total + '</b>。Prim 每轮都是"跨切边里最小的那条"→ 一定是最小生成树。', G,
        { state: (function () { var o = {}; for (var i2 = 0; i2 < N; i2++) o[i2] = 'done'; return o; })(), labels: lab(), side: ['MST 总权 <b>' + total + '</b>'] });
    }
  });
})(window.DSANIM = window.DSANIM || {});
