/* ui · 二叉树：中序布局 + 绘制 */
(function (NS) {
  'use strict';

  var el = NS.el, txt = NS.txt, rrect = NS.rrect, arrowHead = NS.arrowHead, line = NS.line;

  /* ---------------------------------------------------------------- 布局：二叉树 */
  var TREE_DX = 82, TREE_DY = 74, TREE_W = 54, TREE_H = 36;

  function layoutTree(root) {
    var pos = {}, order = [], idx = 0, maxD = 0;
    (function rec(n, d) {
      if (!n) return;
      rec(n.l, d + 1);
      pos[n.id] = { x: 90 + idx * TREE_DX, y: 96 + d * TREE_DY, d: d };
      order.push(n); idx++;
      if (d > maxD) maxD = d;
      rec(n.r, d + 1);
    })(root, 0);
    return { pos: pos, n: idx, depth: maxD };
  }
  function treeWalk(root, out) {
    out = out || [];
    (function rec(n) { if (!n) return; rec(n.l); out.push(n); rec(n.r); })(root);
    return out;
  }

  function drawTree(f) {
    var L = layoutTree(f.root), g = el('g');
    var nodes = treeWalk(f.root);
    var i;
    /* 边 */
    for (i = 0; i < nodes.length; i++) {
      var n = nodes[i], a = L.pos[n.id];
      [[n.l, -1], [n.r, 1]].forEach(function (pair) {
        var c = pair[0];
        if (!c) return;
        var b = L.pos[c.id];
        var col = pair[1] < 0 ? '#3f5a8a' : '#4a6a3f';
        g.appendChild(line(a.x, a.y + TREE_H / 2, b.x, b.y - TREE_H / 2, 'edge', col));
      });
    }
    /* 结点 */
    for (i = 0; i < nodes.length; i++) {
      var nd = nodes[i], p = L.pos[nd.id];
      var isMark = f.mark === nd.id;
      var rect = rrect(p.x, p.y, TREE_W, TREE_H, 8);
      rect.setAttribute('fill', '#17223b');
      rect.setAttribute('stroke', isMark ? '#38bdf8' : '#2f4066');
      rect.setAttribute('stroke-width', isMark ? 2.2 : 1.4);
      if (isMark) rect.setAttribute('class', 'pulse');
      g.appendChild(rect);
      g.appendChild(txt(p.x, p.y + 5, nd.val, 'lbl'));
      /* 访问序号 */
      var tag = f.tags[nd.id];
      if (tag != null) {
        g.appendChild(el('circle', { cx: p.x + TREE_W / 2 - 4, cy: p.y - TREE_H / 2 + 2, r: 9, fill: '#22c55e' }));
        g.appendChild(txt(p.x + TREE_W / 2 - 4, p.y - TREE_H / 2 + 6, String(tag), 'badge'));
      }
    }
    /* 指针 */
    (f.ptrs || []).forEach(function (q) {
      var p = q.id != null ? L.pos[q.id] : null;
      if (!p) return;
      g.appendChild(txt(p.x, p.y - TREE_H / 2 - 10, q.name, 'ptr', 'middle')).setAttribute('fill', '#f9a8d4');
    });
    /* 交换左右孩子：两个子结点之间画一条琥珀色双向弧 */
    if (f.swapPair && f.swapPair[0] != null && f.swapPair[1] != null) {
      var pa = L.pos[f.swapPair[0]], pb = L.pos[f.swapPair[1]];
      if (pa && pb) {
        var midY = Math.max(pa.y, pb.y) + TREE_H / 2 + 26;
        g.appendChild(el('path', {
          d: 'M' + pa.x + ',' + (pa.y + TREE_H / 2 + 4) + ' C' + pa.x + ',' + midY + ' ' + pb.x + ',' + midY + ' ' + pb.x + ',' + (pb.y + TREE_H / 2 + 4),
          fill: 'none', stroke: '#f59e0b', 'stroke-width': 2
        }));
        g.appendChild(arrowHead(pb.x, pb.y + TREE_H / 2 + 4, -Math.PI / 2, '#f59e0b'));
        g.appendChild(arrowHead(pa.x, pa.y + TREE_H / 2 + 4, Math.PI / 2, '#f59e0b'));
        g.appendChild(txt((pa.x + pb.x) / 2, midY + 14, '互换', 'ptr')).setAttribute('fill', '#fcd34d');
      }
    }
    /* 与 key 的比较结论：画一棵树顶上方的紫色药丸 */
    if (f.cmpTag) {
      var ctTxt = f.cmpTag.text;
      var ctW = ctTxt.length * 7.8 + 20;
      var ctX = 60 + Math.max(0, L.n - 1) * TREE_DX / 2;
      var ctY = 22;
      g.appendChild(el('rect', {
        x: ctX - ctW / 2, y: ctY - 13, width: ctW, height: 24, rx: 7,
        fill: '#241a3d', stroke: '#a78bfa', 'stroke-width': 1.4
      }));
      g.appendChild(txt(ctX, ctY + 4, ctTxt, 'ptr')).setAttribute('fill',
        f.cmpTag.ok === true ? '#bbf7d0' : (f.cmpTag.ok === false ? '#fecaca' : '#ddd6fe'));
    }
    /* 递归栈改为在上方 HTML 条里显示，这里不再画 */
    var W = 120 + Math.max(0, L.n - 1) * TREE_DX + 80;
    var H = 96 + Math.max(0, L.depth) * TREE_DY + 60;
    return { g: g, w: Math.max(W, 520), h: Math.max(H, 200) };
  }

  NS.layoutTree = layoutTree;
  NS.treeWalk = treeWalk;
  NS.drawTree = drawTree;
})(window.DSANIM = window.DSANIM || {});
