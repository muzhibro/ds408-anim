/* 图 · 4.1 深度优先遍历 DFS */
(function (NS) {
  'use strict';

  var CH = NS.CH, FG = NS.FG, G_DFS = NS.G_DFS, ADJ = NS.ADJ, setStack = NS.setStack;

CH('graph').demos.push({
    id: 'graph-dfs', name: '4.1 深度优先遍历 DFS',
    note: '<b>一条路走到黑</b>：访问 v → 标记 → 依次看它的邻居，没访问过就立刻钻进去。递归栈里存的是一条从起点到当前的路径，所以空间是 O(h)。',
    code: [
      'void DFS(ALGraph G, int v) {',
      '    visited[v] = 1;                    /* ① 进来先标记 */',
      '    Visit(v);                          /* ② 访问 */',
      '    for (ArcNode *p = G.vertices[v].firstarc; p; p = p->nextarc) {',
      '        int w = p->adjvex;             /* ③ 念邻居名单 */',
      '        if (!visited[w]) DFS(G, w);    /* ④ 没去过就立刻钻进去 */',
      '    }',
      '}'
    ],
    run: function* () {
      var visited = {}, order = [], st = [], cs = [];
      setStack(cs);                       /* 递归调用栈：DFS(0) → DFS(1) → … */
      function* dfs(v) {
        visited[v] = 1;
        order.push(v);
        st.push(v);
        cs.push('DFS(' + v + ')');
        var state = {}; st.forEach(function (x) { state[x] = 'cur'; }); order.forEach(function (x) { state[x] = 'done'; }); state[v] = 'cur';
        yield FG(1, '① 标记 visited[' + v + '] = 1，② 访问它（第 ' + order.length + ' 个）。', G_DFS,
          { state: state, cur: v, scan: { v: v, w: null }, side: ['DFS 序 <b>' + order.join(' ') + '</b>'] });
        var nb = ADJ[v];
        for (var i = 0; i < nb.length; i++) {
          var w = nb[i];
          yield FG(4, '看邻居 ' + w + '：' + (visited[w] ? '已访问过，跳过。' : '没访问过 → 立刻递归进去。'), G_DFS,
            { state: state, cur: v, scan: { v: v, w: w }, edgeOn: (function (o) { o[v + '-' + w] = 1; return o; })({}), side: ['邻居 ' + w + ' <b>' + (visited[w] ? '去过' : '没去过') + '</b>'] });
          if (!visited[w]) yield* dfs(w);
        }
        st.pop();
        cs.pop();
      }
      yield FG(0, '准备：无向图（右边就是它的邻接表）。从 0 号顶点出发。', G_DFS, {});
      yield* dfs(0);
      setStack(null);
      var state = {}; order.forEach(function (x) { state[x] = 'done'; });
      yield FG(5, 'DFS 序列：<b>' + order.join(' ') + '</b>。时间 O(V+E)，空间 O(V)（visited）+ O(h)（递归栈）。', G_DFS,
        { state: state, side: ['DFS 序 <b>' + order.join(' ') + '</b>'] });
    }
  });
})(window.DSANIM = window.DSANIM || {});
