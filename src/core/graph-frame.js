/* 图帧：遍历、最小生成树、拓扑排序共用 */
(function (NS) {
  'use strict';

  var cp = NS.cp, stackOf = NS.stackOf;

  /* ---------- 帧：图 ---------- */
  function FG(line, desc, g, st) {
    return {
      mode: 'graph', line: line, desc: desc,
      g: g,
      state: cp(st.state),
      labels: cp(st.labels),
      side: st.side ? st.side.slice() : null,
      stack: stackOf(st),
      cur: st.cur == null ? null : st.cur,
      edgeOn: cp(st.edgeOn),
      /* 当前扫的顶点和邻居，邻接表面板按它高亮 */
      scan: st.scan ? { v: st.scan.v, w: st.scan.w } : null,
      /* Kruskal 不走邻接表：直接给要亮的行和底部说明 */
      dsMark: st.dsMark ? st.dsMark.slice() : null,
      dsFoot: st.dsFoot || null,
      /* 拓扑的 indegree 快照 + 游标 + 底部说明 */
      ind: st.ind ? { vals: st.ind.vals.slice(), at: st.ind.at == null ? null : st.ind.at, note: st.ind.note || '' } : null
    };
  }

  NS.FG = FG;
})(window.DSANIM = window.DSANIM || {});
