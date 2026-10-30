/* 链表：布局（按行排结点）+ 绘制 */
(function (NS) {
  'use strict';

  var el = NS.el, txt = NS.txt, rrect = NS.rrect, arrowHead = NS.arrowHead, line = NS.line, quad = NS.quad, textW = NS.textW;

  /* ---------- 布局：链表行 ---------- */
  var NODE_W = 74, NODE_H = 44, STEP = 100, X0 = 158, ROW0 = 104, ROWGAP = 126;

  function layoutList(f) {
    var rows = [], placed = {}, maxLen = 0, i;
    for (i = 0; i < f.rows.length; i++) {
      var row = f.rows[i];
      var y = ROW0 + i * ROWGAP;
      var info = { label: row.label, y: y, nodes: [], head: row.head, hideCross: !!row.cut };
      var p = row.head, x = X0, len = 0, seen = {};
      if (p && placed[p.id]) { rows.push({ label: row.label, y: y, nodes: [], skip: true }); continue; }
      while (p && !seen[p.id] && len < 24) {
        seen[p.id] = 1;
        if (placed[p.id]) { info.tailAt = placed[p.id]; break; }
        placed[p.id] = { x: x, y: y, row: i };
        info.nodes.push({ node: p, x: x, y: y });
        if (row.cut && p.id === row.cut.id) { info.cutHere = true; info.cutNote = row.cutNote; break; }
        p = p.next; x += STEP; len++;
      }
      info.len = len;
      if (len > maxLen) maxLen = len;
      rows.push(info);
    }
    var ptrs = (f.ptrs || []).map(function (q) {
      var at = q.node && placed[q.node.id];
      return { name: q.name, at: at, val: q.node ? (q.node.isHead ? (q.node.val || '头') : q.node.val) : null };
    });
    return { rows: rows, placed: placed, ptrs: ptrs, maxLen: maxLen, mark: f.mark && placed[f.mark.id] ? placed[f.mark.id] : null };
  }

  function drawList(f) {
    var L = layoutList(f), i, k;
    var W = Math.max(560, X0 + Math.max(0, L.maxLen - 1) * STEP + 90);
    var H = ROW0 + Math.max(1, f.rows.length) * ROWGAP - 40;
    var g = el('g');

    for (i = 0; i < L.rows.length; i++) {
      var r = L.rows[i];
      if (r.skip) continue;
      g.appendChild(txt(10, r.y + 5, r.label, 'rowlab', 'start'));
      for (k = 0; k < r.nodes.length; k++) {
        var nd = r.nodes[k], n = nd.node;
        /* next 边 */
        if (n.next) {
          var np = L.placed[n.next.id];
          if (np) {
            if (np.row === i && np.x > nd.x) {
              g.appendChild(line(nd.x + NODE_W / 2, nd.y, np.x - NODE_W / 2, np.y, 'edge'));
              g.appendChild(arrowHead(np.x - NODE_W / 2 - 1, np.y, 0));
            } else if (!r.hideCross) {
              /* 跨行 next：cut 行不画，免得把旧值当真链接 */
              g.appendChild(quad(nd.x + NODE_W / 2 - 6, nd.y + NODE_H / 2 - 6, np.x + 8, np.y + NODE_H / 2 - 6, 34));
              g.appendChild(arrowHead(np.x + 8, np.y + NODE_H / 2 - 5, -Math.PI / 2, '#6f5bb5'));
            }
          }
        }
        /* prior 边（双链表） */
        if (n.prior) {
          var pp = L.placed[n.prior.id];
          if (pp && pp.row === i && pp.x < nd.x) {
            g.appendChild(quad(nd.x - NODE_W / 2 + 10, nd.y + NODE_H / 2, pp.x + NODE_W / 2 - 6, pp.y + NODE_H / 2, 22, 'edge dash'));
            g.appendChild(arrowHead(pp.x + NODE_W / 2 - 6, pp.y + NODE_H / 2 + 1, Math.PI / 2, '#6f5bb5'));
          }
        }
        var isMark = L.mark && L.mark.x === nd.x && L.mark.y === nd.y;
        var rect = rrect(nd.x, nd.y, NODE_W, NODE_H, n.isHead ? 10 : 7);
        rect.setAttribute('fill', n.isHead ? '#241d3d' : '#17223b');
        rect.setAttribute('stroke', isMark ? '#38bdf8' : (n.isHead ? '#5b4b96' : '#2f4066'));
        rect.setAttribute('stroke-width', isMark ? 2.2 : 1.4);
        if (n.isHead) rect.setAttribute('stroke-dasharray', '4 3');
        g.appendChild(rect);
        g.appendChild(txt(nd.x, nd.y + 5, n.isHead ? '头' : n.val, 'lbl'));
      }
      /* 结尾 NULL */
      var last = r.nodes[r.nodes.length - 1];
      if (last && !last.node.next) {
        g.appendChild(line(last.x + NODE_W / 2, last.y, last.x + NODE_W / 2 + 22, last.y, 'edge'));
        g.appendChild(txt(last.x + NODE_W / 2 + 30, last.y + 4, 'NULL', 'lbl sm', 'start'));
      }
      if (r.cutHere && last) {
        g.appendChild(txt(last.x + NODE_W / 2 + 16, last.y + 4, '…', 'lbl sm', 'start'));
        if (r.cutNote) g.appendChild(txt(last.x + NODE_W / 2 + 34, last.y + 4, r.cutNote, 'lbl sm', 'start'));
      }
      if (r.nodes.length === 0 && r.head && !L.placed[r.head.id]) {
        g.appendChild(txt(X0, r.y + 4, '（空）', 'lbl sm'));
      }
    }

    /* 即将接上的边：from 右下角到 to 的紫虚线，旁边写 r->next = p */
    /* 目标是 NULL 时只画一小截虚线和标签 */
    if (f.link && f.link.from && !f.link.to) {
      var ln0 = L.placed[f.link.from.id];
      if (ln0) {
        var c0 = f.link.color || '#a78bfa';
        var sx = ln0.x + NODE_W / 2 + 8, sy = ln0.y;
        g.appendChild(line(sx, sy, sx + 26, sy, 'edge dash', c0));
        g.appendChild(txt(sx + 62, sy + 4, 'NULL', 'lbl sm', 'start'));
        if (f.link.text) {
          var tw0 = textW(f.link.text) + 14;
          var bx0 = rrect(sx + 26 + 12 + tw0 / 2, sy - 20, tw0, 19, 5);
          bx0.setAttribute('fill', '#211a3d'); bx0.setAttribute('stroke', c0); bx0.setAttribute('stroke-width', 1.1);
          g.appendChild(bx0);
          g.appendChild(txt(sx + 26 + 12 + tw0 / 2, sy - 16, f.link.text, 'ptr')).setAttribute('fill', c0);
        }
      }
    }
    if (f.link && f.link.from && f.link.to) {
      var la = L.placed[f.link.from.id], lb = L.placed[f.link.to.id];
      if (la && lb) {
        var col = f.link.color || '#a78bfa';
        var x1 = la.x + NODE_W / 2 - 6, y1 = la.y + NODE_H / 2 - 5;
        var x2 = lb.x, y2 = lb.y + NODE_H / 2 + 3;
        var bend = Math.min(58, 20 + Math.abs(x2 - x1) * 0.10);
        g.appendChild(quad(x1, y1, x2, y2, bend, 'edge dash', col));
        g.appendChild(arrowHead(x2, y2 - 2, -Math.PI / 2, col));
        if (f.link.text) {
          var tw = textW(f.link.text) + 14;
          var lt = (x1 + x2) / 2 + bend + 12, ly = (y1 + y2) / 2;
          /* 两结点上下对齐时标签摆到弧线右侧 */
          if (Math.abs(x2 - x1) < 70) { lt = Math.max(x1, x2) + tw / 2 + 16; ly = (y1 + y2) / 2 + 2; }
          else { lt = (x1 + x2) / 2; ly = (y1 + y2) / 2 + bend + 12; }
          var bx = rrect(lt, ly, tw, 19, 5);
          bx.setAttribute('fill', '#211a3d'); bx.setAttribute('stroke', col); bx.setAttribute('stroke-width', 1.1);
          g.appendChild(bx);
          g.appendChild(txt(lt, ly + 4, f.link.text, 'ptr')).setAttribute('fill', col);
        }
      }
    }
    /* 指针标签：按名字长度定宽，重叠时分层放 */
    var lab = [], placedRects = [];
    for (i = 0; i < L.ptrs.length; i++) {
      var q = L.ptrs[i];
      if (!q.at) {
        var t0 = txt(14, 22 + lab.length * 16, q.name + (q.val == null ? ' → NULL' : ' → （未挂链）'), 'ptr', 'start');
        t0.setAttribute('fill', '#64748b');
        g.appendChild(t0);
        continue;
      }
      lab.push({ name: q.name, x: q.at.x, y: q.at.y, w: Math.max(22, q.name.length * 7.4 + 13) });
    }
    lab.forEach(function (p) {
      var w = p.w, h = 20, s = 0, py, ok;
      do {
        py = p.y - NODE_H / 2 - 10 - s * 15;
        ok = true;
        for (var j = 0; j < placedRects.length; j++) {
          var r2 = placedRects[j];
          if (Math.abs(r2.y - py) < h - 1 && !(p.x + w / 2 + 5 < r2.x0 || p.x - w / 2 - 5 > r2.x1)) { ok = false; break; }
        }
        s++;
      } while (!ok && s < 4);
      placedRects.push({ x0: p.x - w / 2, x1: p.x + w / 2, y: py });
      var stem = line(p.x, py + h / 2, p.x, p.y - NODE_H / 2 - 1);
      stem.setAttribute('stroke', '#f472b6');
      stem.setAttribute('stroke-width', 1.1);
      g.appendChild(stem);
      var box = rrect(p.x, py, w, h, 5);
      box.setAttribute('fill', '#3b1030');
      box.setAttribute('stroke', '#f472b6');
      box.setAttribute('stroke-width', 1.2);
      g.appendChild(box);
      g.appendChild(txt(p.x, py + 5, p.name, 'ptr')).setAttribute('fill', '#f9a8d4');
    });
    return { g: g, w: W, h: H };
  }

  NS.layoutList = layoutList;
  NS.drawList = drawList;
})(window.DSANIM = window.DSANIM || {});
