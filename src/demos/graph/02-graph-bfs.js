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
      yield FG(0, 'BFS 从起点 0 出发，用队列一层一层往外扩。', G_DFS, { state: state(0), side: ['队列 <b>0</b>'] });
      yield FG(1, 'int Q[MAXSIZE], front = 0, rear = 0：队列用数组加头尾指针表示，front 出队、rear 入队。', G_DFS,
        { state: {}, side: ['队列空'] });
      yield FG(2, '起点 0：visited[0]=1、Visit(0)、Q[rear++]=0。注意<b>入队时就标记</b>，不等出队再标。', G_DFS,
        { state: state(0), cur: 0, side: ['队列 <b>' + qv() + '</b>'] });
      while (Q.length) {
        var u = Q.shift();
        yield FG(3, 'while (front < rear)：队列不空 → 继续。', G_DFS, { state: state(null), side: ['队列 <b>' + (qv() || '空') + '</b>'] });
        yield FG(4, 'Q[front++]：出队 ' + u + '，开始扫它的所有邻居。', G_DFS, { state: state(u), cur: u, scan: { v: u, w: null }, side: ['队列 <b>' + (qv() || '空') + '</b>', '距起点 <b>' + dist[u] + '</b> 条边'] });
        var nb = ADJ[u];
        if (nb.length) {
          yield FG(5, '沿 V' + u + ' 的邻接表往后走：p 依次指向 ' + nb.join('、') + ' 这些邻居。', G_DFS,
            { state: state(u), cur: u, scan: { v: u, w: null }, side: ['队列 <b>' + (qv() || '空') + '</b>'] });
        }
        for (var i = 0; i < nb.length; i++) {
          var w = nb[i];
          yield FG(6, 'int w = p->adjvex：这一条边的邻居是 ' + w + '。', G_DFS,
            { state: state(u), cur: u, scan: { v: u, w: w }, edgeOn: (function (o) { o[u + '-' + w] = 1; return o; })({}),
              side: ['队列 <b>' + (qv() || '空') + '</b>'] });
          if (!visited[w]) {
            yield FG(7, 'if (!visited[' + w + '])：没去过 → 进去（已去过就跳过）。', G_DFS,
              { state: state(u), cur: u, scan: { v: u, w: w }, side: ['队列 <b>' + (qv() || '空') + '</b>'] });
            visited[w] = 1; order.push(w); dist[w] = dist[u] + 1;
            yield FG(8, 'visited[' + w + '] = 1：<b>先标记</b>，这样别的邻居再来找它时就能直接跳过。', G_DFS,
              { state: state(u), cur: u, scan: { v: u, w: w }, edgeOn: (function (o) { o[u + '-' + w] = 1; return o; })({}),
                side: ['队列 <b>' + (qv() || '空') + '</b>', 'dist[' + w + '] = <b>' + dist[w] + '</b>'] });
            Q.push(w);
            yield FG(9, 'Visit(' + w + ') 打出来，Q[rear++] = ' + w + ' 入队 —— 标记、访问、入队三者一起做。', G_DFS,
              { state: state(u), cur: u, scan: { v: u, w: w }, edgeOn: (function (o) { o[u + '-' + w] = 1; return o; })({}),
                side: ['队列 <b>' + qv() + '</b>', 'dist[' + w + '] = <b>' + dist[w] + '</b>'] });
          } else {
            yield FG(7, '邻居 ' + w + ' 已访问 → 跳过（这就是"入队即标记"省下的重复劳动）。', G_DFS,
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
