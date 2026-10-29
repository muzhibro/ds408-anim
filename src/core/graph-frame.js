/* core · 图帧（遍历 / 最小生成树 / 拓扑排序用） */
(function (NS) {
  'use strict';

  var cp = NS.cp, stackOf = NS.stackOf;

  /* ---------------------------------------------------------------- 帧：图 */
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
      /* 正在扫谁的邻接表、看到哪个邻居 —— 右边的邻接表面板靠它高亮 */
      scan: st.scan ? { v: st.scan.v, w: st.scan.w } : null,
      /* 不用邻接表扫的算法（Kruskal 走边表）：直接指定高亮哪些行 + 底部说明 */
      dsMark: st.dsMark ? st.dsMark.slice() : null,
      dsFoot: st.dsFoot || null,
      /* 拓扑排序的 indegree[]：逐帧快照 + 游标（正在看谁）+ 底部说明 */
      ind: st.ind ? { vals: st.ind.vals.slice(), at: st.ind.at == null ? null : st.ind.at, note: st.ind.note || '' } : null
    };
  }

  NS.FG = FG;
})(window.DSANIM = window.DSANIM || {});
