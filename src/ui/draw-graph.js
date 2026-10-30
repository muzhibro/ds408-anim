/* 图：顶点 / 边 / 权值 / 状态配色 */
(function (NS) {
  'use strict';

  var el = NS.el, txt = NS.txt, line = NS.line, arrowHead = NS.arrowHead;

  /* ---------- 布局：图 ---------- */
  var VR = 21;

  function drawGraph(f) {
    var g = el('g'), G = f.g, i, k;
    var pos = {};
    for (i = 0; i < G.verts.length; i++) pos[G.verts[i].id] = G.verts[i];

    /* 边 */
    for (i = 0; i < G.edges.length; i++) {
      var e = G.edges[i], a = pos[e[0]], b = pos[e[1]];
      if (!a || !b) continue;
      var key = e[0] + '-' + e[1];
      var on = f.edgeOn[key] || f.edgeOn[e[1] + '-' + e[0]];
      var col = on ? '#38bdf8' : '#3b4d73';
      var dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / len, uy = dy / len;
      var x1 = a.x + ux * VR, y1 = a.y + uy * VR;
      var x2 = b.x - ux * (VR + 3), y2 = b.y - uy * (VR + 3);
      if (!G.directed) {
        if (e[0] > e[1]) continue;  /* 无向图只画一次 */
      }
      g.appendChild(line(x1, y1, x2, y2, 'edge', col)).setAttribute('stroke-width', on ? 2.6 : 1.6);
      if (G.directed) g.appendChild(arrowHead(x2, y2, Math.atan2(dy, dx), col));
      if (e[2] != null) {
        g.appendChild(txt((a.x + b.x) / 2 + uy * 12, (a.y + b.y) / 2 - ux * 12, String(e[2]), 'wt'));
      }
    }

    /* 顶点 */
    for (i = 0; i < G.verts.length; i++) {
      var v = G.verts[i];
      var st = f.state[v.id] || '';
      var fill = st === 'done' ? '#123524' : st === 'front' ? '#3a2a10' : st === 'cur' ? '#0e3350' : '#17223b';
      var stroke = st === 'done' ? '#22c55e' : st === 'front' ? '#f59e0b' : st === 'cur' ? '#38bdf8' : '#2f4066';
      var c = el('circle', { cx: v.x, cy: v.y, r: VR, fill: fill, stroke: stroke, 'stroke-width': st === 'cur' ? 2.6 : 1.6 });
      if (st === 'cur') c.setAttribute('class', 'pulse');
      g.appendChild(c);
      g.appendChild(txt(v.x, v.y + 5, v.label != null ? String(v.label) : v.id, 'lbl'));
      var lab = f.labels[v.id];
      if (lab != null) g.appendChild(txt(v.x, v.y - VR - 9, String(lab), 'lbl sm'));
    }

    var xs = G.verts.map(function (v) { return v.x; }), ys = G.verts.map(function (v) { return v.y; });
    var W = Math.max.apply(null, xs) + 90, H = Math.max.apply(null, ys) + 80;
    return { g: g, w: Math.max(W, 520), h: Math.max(H, 220) };
  }

  NS.drawGraph = drawGraph;
})(window.DSANIM = window.DSANIM || {});
