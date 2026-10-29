/* 图 · 4.1 广度优先遍历 BFS */
(function (NS) {
  'use strict';

  var CH = NS.CH, FG = NS.FG, G_DFS = NS.G_DFS, ADJ = NS.ADJ;

CH('graph').demos.push({
    id: 'graph-bfs', name: '4.1 广度优先遍历 BFS',
    note: '用<b>队列</b>。关键：<b>入队时就标记</b> visited —— 否则同一个点会被多个邻居重复入队。BFS 天然按"距离起点几条边"分层，可以求无权最短路径。',
    code: [
      'void BFS(ALGraph G, int v) {',
      '    int Q[MAXSIZE], front = 0, rear = 0;',
      '    visited[v] = 1; Visit(v); Q[rear++] = v;',
      '    while (front < rear) {',
      '        int u = Q[front++];                        /* 出队 */',
      '        for (ArcNode *p = G.vertices[u].firstarc; p; p = p->nextarc) {',
      '            int w = p->adjvex;',
      '            if (!visited[w]) {',
      '                visited[w] = 1;                    /* 入队即标记！ */',
      '                Visit(w); Q[rear++] = w;',
      '            }',
      '        }',
      '    }',
      '}'
    ],
    run: function* () {
      var visited = { 0: 1 }, order = [0], Q = [0], dist = { 0: 0 };
      var qv = function () { return Q.join(' '); };
      var state = function (cur) {
        var s = {}; order.forEach(function (x) { s[x] = 'done'; });
        Q.forEach(function (x) { s[x] = 'front'; });
        if (cur != null) s[cur] = 'cur';
        return s;
      };
      yield FG(0, '准备：从 0 出发。visited、队列都在下面实时显示。', G_DFS, { state: state(0), side: ['队列 <b>0</b>'] });
      yield FG(3, '起点 0：标记、访问、入队。', G_DFS, { state: state(0), cur: 0, side: ['队列 <b>' + qv() + '</b>'] });
      while (Q.length) {
        var u = Q.shift();
        yield FG(5, '出队 ' + u + '，开始扫描它的所有邻居。', G_DFS, { state: state(u), cur: u, scan: { v: u, w: null }, side: ['队列 <b>' + (qv() || '空') + '</b>', '距起点 <b>' + dist[u] + '</b> 条边'] });
        var nb = ADJ[u];
        for (var i = 0; i < nb.length; i++) {
          var w = nb[i];
          if (!visited[w]) {
            visited[w] = 1; order.push(w); Q.push(w); dist[w] = dist[u] + 1;
            yield FG(10, '邻居 ' + w + ' 没去过 → 标记 + 访问 + <b>入队</b>（三者一起做）。', G_DFS,
              { state: state(u), cur: u, scan: { v: u, w: w }, edgeOn: (function (o) { o[u + '-' + w] = 1; return o; })({}), side: ['队列 <b>' + qv() + '</b>', 'dist[' + w + '] = <b>' + dist[w] + '</b>'] });
          } else {
            yield FG(8, '邻居 ' + w + ' 已访问 → 跳过（这就是"入队即标记"省下的重复劳动）。', G_DFS,
              { state: state(u), cur: u, scan: { v: u, w: w }, side: ['队列 <b>' + (qv() || '空') + '</b>'] });
          }
        }
      }
      var s2 = {}; order.forEach(function (x) { s2[x] = 'done'; });
      yield FG(13, 'BFS 序：<b>' + order.join(' ') + '</b>。按层：0 | 1 2 | 3 4 | 5。时间 O(V+E)。', G_DFS,
        { state: s2, side: ['BFS 序 <b>' + order.join(' ') + '</b>'] });
    }
  });
})(window.DSANIM = window.DSANIM || {});
