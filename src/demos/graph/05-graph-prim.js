/* 4.7 Prim 最小生成树 */
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
      yield FG(0, 'Prim 从一个点开始"滚雪球"：每次挑一条"树内 → 树外"里权最小的边，把对面那个点拉进来。', G,
        { state: state(0), labels: lab(), side: ['已在树内 <b>0</b>'] });
      yield FG(1, 'int lowcost[MAXV], inTree[MAXV] = {0}：lowcost 记"到当前树的最小距离"，inTree 标记是否已在树里（单独数组，不能拿 0 权当哨兵）。', G,
        { state: {}, labels: lab(), side: ['lowcost 全 ∞，inTree 全 0'] });
      yield FG(2, '初始化：lowcost[i] ← v0 到 i 的直接边权（没边就是 ∞）。', G,
        { state: {}, labels: lab(), side: ['lowcost <b>[' + [0, 1, 2, 3, 4, 5].map(function (i2) { return low[i2] === INF ? '∞' : low[i2]; }).join(', ') + ']</b>'] });
      yield FG(3, 'inTree[0] = 1：起点 0 进树。', G, { state: state(0), labels: lab(), side: ['已在树内 <b>0</b>'] });
      var total = 0;
      for (var k = 1; k < N; k++) {
        var u = -1, best = INF;
        yield FG(4, '第 ' + k + ' 轮：还要再拉 ' + (N - k) + ' 个点进树（k=' + k + ' < ' + N + '）。', G,
          { state: state(null), labels: lab(), side: ['已在树内 ' + Object.keys(inTree).length + ' 个点'] });
        yield FG(5, 'int u = -1, best = INF：准备在树外找 lowcost 最小的点。', G,
          { state: state(null), labels: lab() });
        yield FG(6, '扫一遍所有点（树外最小）：已进树的直接跳过。', G,
          { state: state(null), labels: lab() });
        for (var j = 0; j < N; j++) if (!inTree[j] && low[j] < best) { best = low[j]; u = j; }
        if (k === 1) {
          yield FG(7, 'if (!inTree[i] && lowcost[i] < best)：边扫边更新，扫完 best = ' + (best === INF ? '∞' : best) + '，u = ' + u + '。', G,
            { state: state(null), labels: lab(), side: ['跨切边最小 <b>' + (best === INF ? '∞' : best) + '</b> @ ' + u] });
        }
        if (u === -1) {
          yield FG(8, 'u == -1：树外的点都不可达 → 图不连通，break。', G, { state: state(null), labels: lab() });
          break;
        }
        if (k === 1) {
          yield FG(8, 'u = ' + u + ' ≠ -1 → 不退出，准备把它拉进树。', G, { state: state(u), labels: lab() });
        }
        var from = -1;
        for (var j2 = 0; j2 < N; j2++) if (inTree[j2] && w(j2, u) === best) { from = j2; break; }
        yield FG(9, '拉进树：inTree[' + u + '] = 1，同时选中跨切边 ' + from + ' — ' + u + '（权 ' + best + '）。', G,
          { state: state(u), labels: lab(), edgeOn: (function (o) { o[from + '-' + u] = 1; o[u + '-' + from] = 1; return o; })({}),
            side: ['选中边 <b>' + from + ' — ' + u + '（' + best + '）</b>', '累计权值 <b>' + (total + best) + '</b>'] });
        inTree[u] = 1; total += best;
        yield FG(10, '用新进树的 ' + u + ' 去看看：它到树外各点的边，能不能让 lowcost 更小。', G,
          { state: state(u), labels: lab(), side: ['累计权值 <b>' + total + '</b>'] });
        var improved = [];
        for (var v = 0; v < N; v++) {
          if (!inTree[v] && w(u, v) < low[v]) { low[v] = w(u, v); improved.push(v); }
        }
        yield FG(11, improved.length
            ? 'lowcost[' + improved.join('], lowcost[') + '] 被 ' + u + ' 改小了。'
            : u + ' 没能改进任何 lowcost，这一轮树外距离不变。', G,
          { state: state(u), labels: lab(), side: ['累计权值 <b>' + total + '</b>'] });
      }
      yield FG(11, 'MST 边权之和 = <b>' + total + '</b>。Prim 每轮都是"跨切边里最小的那条"→ 一定是最小生成树。', G,
        { state: (function () { var o = {}; for (var i2 = 0; i2 < N; i2++) o[i2] = 'done'; return o; })(), labels: lab(), side: ['MST 总权 <b>' + total + '</b>'] });
    }
  });
})(window.DSANIM = window.DSANIM || {});
