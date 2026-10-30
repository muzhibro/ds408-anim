/* 图 · 4.4 拓扑排序（AOV 网） */
(function (NS) {
  'use strict';

  var CH = NS.CH, FG = NS.FG, setStack = NS.setStack;

CH('graph').demos.push({
    id: 'graph-topo', name: '4.4 拓扑排序（AOV 网）',
    stackTitle: '栈（入度为 0 的顶点）',
    note: '<b>每次挑一个入度为 0 的点输出</b>，然后把它删掉（邻居入度减 1）。输出个数 &lt; 顶点数 ⟹ 有环。容器用栈、队列、还是"每次重扫"，结果都合法但不唯一。',
    code: [
      'int TopologicalSort(ALGraph G, int topo[]) {',
      '    int indegree[MAXV] = {0}, stack[MAXV], top = -1, count = 0;',
      '    for (int i = 0; i < G.vexnum; i++)',
      '        for (ArcNode *p = G.vertices[i].firstarc; p; p = p->nextarc)',
      '            indegree[p->adjvex]++;',
      '    for (int i = 0; i < G.vexnum; i++)',
      '        if (indegree[i] == 0) stack[++top] = i;',
      '    while (top >= 0) {',
      '        int v = stack[top--];',
      '        topo[count++] = v;                       /* 落盘 */',
      '        for (ArcNode *p = G.vertices[v].firstarc; p; p = p->nextarc)',
      '            if (--indegree[p->adjvex] == 0) stack[++top] = p->adjvex;',
      '    }',
      '    return count == G.vexnum;                    /* 有环 → 0 */',
      '}'
    ],
    run: function* () {
      var N = 6;
      var G = {
        directed: true,
        verts: [{ id: 0, x: 110, y: 60 }, { id: 1, x: 260, y: 50 }, { id: 2, x: 260, y: 175 },
                { id: 3, x: 410, y: 115 }, { id: 4, x: 545, y: 115 }, { id: 5, x: 660, y: 115 }],
        edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 5]]
      };
      var indeg = [0, 0, 0, 0, 0, 0], st = [], topo = [], cs = [];
      setStack(cs);                       /* 屏幕右下角那个桶就是这个 stack[] */
      var syncSt = function () {             /* 每次 push/pop 后把桶同步成 "V0 V2 …" */
        cs.length = 0;
        st.forEach(function (v) { cs.push('V' + v); });
      };
      var state = function (cur) {
        var s = {}; topo.forEach(function (v) { s[v] = 'done'; });
        st.forEach(function (v) { s[v] = 'front'; });
        if (cur != null) s[cur] = 'cur';
        return s;
      };
      var lab = function () { var o = {}; indeg.forEach(function (d, i) { o[i] = '入' + d; }); return o; };
      var ind = function (at, note) { return { vals: indeg.slice(), at: at, note: note }; };
      var outs = {};
      G.edges.forEach(function (e) { (outs[e[0]] = outs[e[0]] || []).push(e[1]); });

      yield FG(0, 'TopologicalSort 进入：AOV 网里顶点是活动，边 i→j 表示 i 必须排在 j 前面。目标是给出一个合法先后顺序。', G,
        { state: state(null), labels: lab(), ind: ind(null, '还没开始数入度') });
      yield FG(1, '准备：indegree[0..5] 全部清零。它记录的是"每个顶点还有几个前驱没被删除"。', G,
        { state: state(null), labels: lab(), ind: ind(null, '6 个计数器，现在都是 0') });

      /* ① 数入度：扫每个顶点的出边表，把终点的入度 +1 */
      for (var u = 0; u < N; u++) {
        var list = outs[u] || [];
        yield FG(2, '① 外层循环 i = ' + u + '：准备数 V' + u + ' 的所有出边。', G,
          { state: state(null), scan: { v: u, w: null }, labels: lab(), ind: ind(u, '正在处理 V' + u) });
        yield FG(3, '内层 p 走 V' + u + ' 的邻接表（当前 indegree = [' + indeg.join(' ') + ']）。', G,
          { state: state(null), scan: { v: u, w: null }, labels: lab(), ind: ind(u, '正在扫 V' + u + ' 的出边') });
        for (var t = 0; t < list.length; t++) {
          var w = list[t];
          indeg[w]++;
          yield FG(4, '看到边 ' + u + ' → ' + w + '：indegree[' + w + '] 加 1，变成 ' + indeg[w] + '。', G,
            { state: state(null), scan: { v: u, w: w }, labels: lab(),
              ind: ind(w, 'V' + w + ' 的入度 = ' + indeg[w]),
              edgeOn: (function (e) { var o = {}; o[u + '-' + w] = 1; return o; })() });
        }
      }
      yield FG(4, '统计完毕：indegree = [' + indeg.join(' ') + ']。每条边只被扫一次，所以这一步是 O(V+E)。', G,
        { state: state(null), labels: lab(), ind: ind(null, '最终入度：' + indeg.join(' ')) });

      /* ② 从头扫一遍，把入度为 0 的压栈 */
      yield FG(5, '② 再从头扫一遍顶点，把入度为 0 的（没有前驱、现在就能做）压进栈。', G,
        { state: state(null), labels: lab(), ind: ind(null, '找入度为 0 的点') });
      for (var i = 0; i < N; i++) {
        var zero = (indeg[i] === 0);
        if (zero) { st.push(i); syncSt(); }
        yield FG(6, '② i = ' + i + '：indegree[' + i + '] = ' + indeg[i] +
          (zero ? ' → 等于 0，<b>入栈</b>' : ' ≠ 0 → 跳过（它还有 ' + indeg[i] + ' 个前驱）'), G,
          { state: state(null), labels: lab(),
            ind: ind(i, zero ? 'V' + i + ' 入度为 0 → 入栈' : 'V' + i + ' 入度 ' + indeg[i] + ' → 跳过'),
            side: ['栈 <b>' + (st.join(' ') || '空') + '</b>'] });
      }
      yield FG(7, '初始入度为 0 的点都已入栈：<b>' + st.join(' ') + '</b>。下面开始出栈输出。', G,
        { state: state(null), labels: lab(), ind: ind(null, '栈里：' + st.join(' ')),
          side: ['栈 <b>' + st.join(' ') + '</b>'] });

      while (st.length) {
        var v = st.pop();
        topo.push(v);
        syncSt();
        yield FG(8, '出栈 ' + v + '（stack[top--]）。', G,
          { state: state(v), cur: v, scan: { v: v, w: null }, labels: lab(),
            ind: ind(v, 'V' + v + ' 出栈'),
            side: ['栈 <b>' + (st.join(' ') || '空') + '</b>'] });
        yield FG(9, 'topo[count++] = ' + v + '：把它写进拓扑序列（第 ' + topo.length + ' 个），同样也是"输出/删掉"这一步。', G,
          { state: state(v), cur: v, scan: { v: v, w: null }, labels: lab(),
            ind: ind(v, 'V' + v + ' 已输出'),
            side: ['拓扑序 <b>' + topo.join(' ') + '</b>', '栈 <b>' + (st.join(' ') || '空') + '</b>'] });
        yield FG(10, '接着"删掉"它：沿着 V' + v + ' 的出边表，把每个终点的入度减 1。', G,
          { state: state(v), cur: v, scan: { v: v, w: null }, labels: lab(),
            ind: ind(v, '删 V' + v + ' 的出边'),
            side: ['拓扑序 <b>' + topo.join(' ') + '</b>', '栈 <b>' + (st.join(' ') || '空') + '</b>'] });
        var es = outs[v] || [];
        for (var k = 0; k < es.length; k++) {
          var to = es[k];
          indeg[to]--;
          var z2 = (indeg[to] === 0);
          if (z2) { st.push(to); }        /* 先真的入栈再出帧，画面和文字才对得上 */
          syncSt();
          yield FG(11, '删掉边 ' + v + ' → ' + to + '：indegree[' + to + '] 减 1 = ' + indeg[to] +
            (z2 ? ' → <b>归零，入栈！</b>' : '（还有前驱，先不进栈）'), G,
            { state: state(v), cur: v, scan: { v: v, w: to }, labels: lab(),
              ind: ind(to, z2 ? 'V' + to + ' 入度归零 → 入栈' : 'V' + to + ' 还差 ' + indeg[to] + ' 个前驱'),
              edgeOn: (function () { var o = {}; o[v + '-' + to] = 1; return o; })(),
              side: ['拓扑序 <b>' + topo.join(' ') + '</b>', '栈 <b>' + (st.join(' ') || '空') + '</b>'] });
        }
      }
      syncSt();
      yield FG(13, '输出 ' + topo.length + ' 个 = ' + N + ' 个顶点 → <b>是 DAG</b>。拓扑序：<b>' + topo.join(' ') + '</b>（栈是 LIFO，换队列得到的序列也合法，所以拓扑序不唯一）。', G,
        { state: (function () { var s = {}; topo.forEach(function (v2) { s[v2] = 'done'; }); return s; })(),
          labels: lab(), ind: ind(null, '全部顶点都输出完'), side: ['拓扑序 <b>' + topo.join(' ') + '</b>'] });
    }
  });
})(window.DSANIM = window.DSANIM || {});
