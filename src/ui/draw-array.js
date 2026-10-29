/* ui · 数组：格子 / 区间底色 / 交换弧 / 比较标签 */
(function (NS) {
  'use strict';

  var el = NS.el, txt = NS.txt, rrect = NS.rrect, arrowHead = NS.arrowHead, line = NS.line, textW = NS.textW;

  /* ---------------------------------------------------------------- 布局：数组 */
  var CELL_W = 44, CELL_H = 32, CELL_GAP = 7, ARR_X0 = 46, ARR_Y0 = 92;

  function cellX(k) { return ARR_X0 + k * (CELL_W + CELL_GAP); }

  function drawArray(f) {
    var g = el('g'), n = f.arr.length, i;
    var cw = CELL_W, gx = CELL_GAP;
    if (n > 16) { cw = Math.max(26, Math.floor(760 / n) - 4); gx = 4; }
    /* 和变量比且变量画在左边时，整排数组往右让位，别让药丸被画到画布外面 */
    var pillWL = 0, pillWR = 0;
    if (f.cmp && f.cmp.b < 0 && f.cmp.vtext) {
      var pw = Math.max(58, f.cmp.vtext.length * 8 + 16);
      if (f.cmp.side === 'left') pillWL = pw + 30; else pillWR = pw + 34;
    }
    var X0 = ARR_X0 + pillWL;
    var W = X0 + ARR_X0 + n * (cw + gx) + pillWR;
    /* 有比较标签时整排数组下移，给"值 关系 值"那一行留出空间 */
    var dz = 60;   /* 每帧都留出放标签的顶栏，翻页时数组不会上下跳 */
    var Y0 = ARR_Y0 + dz;
    var H = 250 + dz;

    /* 区间底色 */
    (f.spans || []).forEach(function (s) {
      var x1 = X0 + s.from * (cw + gx) - gx / 2;
      var x2 = X0 + s.to * (cw + gx) + cw + gx / 2;
      g.appendChild(el('rect', {
        x: x1, y: Y0 - CELL_H / 2 - 8, width: x2 - x1, height: CELL_H + 16, rx: 6,
        fill: s.color || 'rgba(34,197,94,.12)', stroke: s.color ? null : 'rgba(34,197,94,.35)'
      }));
      if (s.label) g.appendChild(txt((x1 + x2) / 2, Y0 - CELL_H / 2 - 18, s.label, 'lbl sm'));
    });

    /* 交换 / 搬动：两个格子加琥珀描边 + 上方双向弧 + 顶点标注 */
    var swapSet = {};
    if (f.swap) { swapSet[f.swap[0]] = 1; swapSet[f.swap[1]] = 1; }
    if (f.jump) { swapSet[f.jump.from] = 1; swapSet[f.jump.to] = 1; }

    var liftUsed = 0;
    if (f.swap || f.jump) {
      var yTop = Y0 - CELL_H / 2;
      var ax, bx, lift, d, apx;
      if (f.swap) {
        ax = X0 + f.swap[0] * (cw + gx) + cw / 2;
        bx = X0 + f.swap[1] * (cw + gx) + cw / 2;
      } else {
        ax = X0 + f.jump.from * (cw + gx) + cw / 2;
        bx = X0 + f.jump.to * (cw + gx) + cw / 2;
      }
      lift = Math.min(62, 30 + Math.abs(bx - ax) * 0.22);
      liftUsed = lift;
      d = 'M' + ax + ',' + (yTop - 5) + ' C' + ax + ',' + (yTop - 5 - lift) + ' ' + bx + ',' + (yTop - 5 - lift) + ' ' + bx + ',' + (yTop - 5);
      g.appendChild(el('path', { d: d, fill: 'none', stroke: '#f59e0b', 'stroke-width': 2 }));
      g.appendChild(arrowHead(bx, yTop - 5, Math.PI / 2, '#f59e0b'));
      if (f.swap) g.appendChild(arrowHead(ax, yTop - 5, -Math.PI / 2, '#f59e0b'));
      apx = (ax + bx) / 2;
      var labTxt = f.swap ? ('交换 ' + f.arr[f.swap[0]] + ' ⇄ ' + f.arr[f.swap[1]]) : (f.jump.label || '搬动');
      var labY = yTop - 5 - lift - 6;                 /* 放在弧顶上方，别压着弧线 */
      var tw = textW(labTxt) + 18;
      var lx0 = apx - tw / 2;
      if (lx0 < 4) lx0 = 4;                            /* 夹在画布内，两端的标签不会被裁 */
      if (lx0 + tw > W - 4) lx0 = W - tw - 4;
      g.appendChild(el('rect', {
        x: lx0, y: labY - 12, width: tw, height: 21, rx: 6,
        fill: '#3a2a08', stroke: '#f59e0b', 'stroke-width': 1.2
      }));
      g.appendChild(txt(lx0 + tw / 2, labY + 3, labTxt, 'ptr')).setAttribute('fill', '#fcd34d');
    }

    /* 比较：两个格子加紫色描边 + 上方弧线 + 结论标签；b = -1 表示和右侧的"关键字"比 */
    var cmpSet = {};
    if (f.cmp) {
      if (f.cmp.a >= 0) cmpSet[f.cmp.a] = 1;
      if (f.cmp.b >= 0) cmpSet[f.cmp.b] = 1;
    }

    if (f.cmp) {
      var C = f.cmp;
      var cxp = function (k) { return X0 + k * (cw + gx) + cw / 2; };
      var yT = Y0 - CELL_H / 2;
      var lx = C.a >= 0 ? cxp(C.a) : null;
      var rx = C.b >= 0 ? cxp(C.b) : null;
      var pillX = null, pillW = 0;

      /* 和"变量"比（key / pivot / t）：在数组一侧画一个药丸，虚线与被比较的格子相连 */
      if (C.b < 0 && lx != null && C.vtext) {
        pillW = Math.max(58, C.vtext.length * 8 + 16);
        var onLeft = C.side === 'left';
        pillX = onLeft ? (X0 - 30 - pillW / 2) : (X0 + n * (cw + gx) + 26 + pillW / 2);
        g.appendChild(el('rect', {
          x: pillX - pillW / 2, y: Y0 - 20, width: pillW, height: 40, rx: 8,
          fill: '#241a3d', stroke: '#a78bfa', 'stroke-width': 1.8
        }));
        g.appendChild(txt(pillX, Y0 + 5, C.vtext, 'ptr')).setAttribute('fill', '#ddd6fe');
        var fromX = onLeft ? pillX + pillW / 2 : pillX - pillW / 2;
        var toX = onLeft ? (lx - cw / 2 - 3) : (lx + cw / 2 + 3);
        var dd = 'M' + fromX + ',' + Y0 + ' C' + ((fromX + toX) / 2) + ',' + (Y0 - 26) + ' ' + ((fromX + toX) / 2) + ',' + (Y0 - 26) + ' ' + toX + ',' + Y0;
        g.appendChild(el('path', { d: dd, fill: 'none', stroke: '#a78bfa', 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }));
      }

      /* 两格之间的紫色弧（同一帧还有交换弧时，抬高一层免得两张标签叠在一起） */
      var cmpLift = Math.min(58, 26 + Math.abs((rx == null ? lx : rx) - lx) * 0.2);
      if (f.swap || f.jump) cmpLift += 40;
      if (lx != null && rx != null && lx !== rx && !(f.swap || f.jump)) {
        var liftC = cmpLift;
        var dc = 'M' + lx + ',' + (yT - 4) + ' C' + lx + ',' + (yT - 4 - liftC) + ' ' + rx + ',' + (yT - 4 - liftC) + ' ' + rx + ',' + (yT - 4);
        g.appendChild(el('path', { d: dc, fill: 'none', stroke: '#a78bfa', 'stroke-width': 1.8, 'stroke-dasharray': '6 4' }));
        g.appendChild(el('path', { d: 'M' + lx + ',' + (yT - 4) + ' l-5,4 l5,4 z', fill: '#a78bfa' }));
        g.appendChild(el('path', { d: 'M' + rx + ',' + (yT - 4) + ' l5,4 l-5,4 z', fill: '#a78bfa' }));
      }

      /* 结论标签：97 > 13 ✓ / A[3]=16 < 43 → 往右（格子已经高亮，前缀 A[k]= 省掉更短） */
      var strip = function (t) { return String(t == null ? '' : t).replace(/^[AH]\[\d+\]\s*=\s*/, ''); };
      var tTxt = strip(C.left) + ' ' + (C.op || '') + ' ' + strip(C.right);
      if (C.res) tTxt += '  ' + C.res;
      var cxMid = (lx != null && rx != null) ? (lx + rx) / 2 : (lx != null ? lx : (pillX || 0));
      var twoCells = (lx != null && rx != null);
      var cyMid = twoCells ? (yT - 4 - cmpLift - 2) : (yT - 18);
      /* 和变量比（key/pivot/t）且同一帧还有交换/搬动标签时，再抬一层，别两张标签叠在一起 */
      if (f.swap || f.jump) {
        /* 琥珀标签的顶边在 yT-11-lift-12，比较标签要整个落在它上面 */
        var amberTop = yT - 11 - liftUsed - 12;
        cyMid = Math.min(cyMid, amberTop - 12 - 8);
      }
      if (cyMid < 16) cyMid = 16;
      var tcw = textW(tTxt) + 18;
      if (cxMid - tcw / 2 < 4) cxMid = tcw / 2 + 4;
      if (cxMid + tcw / 2 > W - 4) cxMid = W - tcw / 2 - 4;
      var okCol = C.ok === true ? '#22c55e' : (C.ok === false ? '#f59e0b' : '#a78bfa');
      g.appendChild(el('rect', {
        x: cxMid - tcw / 2, y: cyMid - 13, width: tcw, height: 22, rx: 6,
        fill: '#241a3d', stroke: okCol, 'stroke-width': 1.3
      }));
      g.appendChild(txt(cxMid, cyMid + 4, tTxt, 'ptr')).setAttribute('fill', C.ok === true ? '#bbf7d0' : (C.ok === false ? '#fde68a' : '#ddd6fe'));
    }

    for (i = 0; i < n; i++) {
      var x = X0 + i * (cw + gx) + cw / 2;
      var v = f.arr[i];
      var isSorted = f.sorted[i];
      var rect = rrect(x, Y0, cw, CELL_H, 6);
      /* 比较/交换>已排序：正在参与比较的格子必须让出来，否则被绿色盖掉看不见 */
      rect.setAttribute('fill', cmpSet[i] ? '#2a1f45' : (swapSet[i] ? '#3a2a08' : (isSorted ? '#12301f' : '#17223b')));
      rect.setAttribute('stroke', cmpSet[i] ? '#a78bfa' : (swapSet[i] ? '#f59e0b' : (isSorted ? '#2f7f4f' : '#2f4066')));
      if (swapSet[i] || cmpSet[i]) rect.setAttribute('stroke-width', 2.2);
      g.appendChild(rect);
      g.appendChild(txt(x, Y0 + 5, v == null ? '' : String(v), 'lbl'));
      g.appendChild(txt(x, Y0 + CELL_H / 2 + 16, String(i), 'lbl sm'));
    }

    /* 指针 */
    var slots = {};
    (f.marks || []).forEach(function (m) {
      if (m.at == null || m.at < 0 || m.at >= n) return;
      var x = X0 + m.at * (cw + gx) + cw / 2;
      var row = slots[m.at] = (slots[m.at] == null) ? 0 : slots[m.at] + 1;
      var y = Y0 + CELL_H / 2 + 34 + row * 18;
      var col = m.color || '#38bdf8';
      g.appendChild(line(x, Y0 + CELL_H / 2 + 2, x, y - 12, 'edge', col));
      g.appendChild(el('path', {
        d: 'M' + (x - 7) + ',' + (y - 12) + ' l7,-9 l7,9 z', fill: col
      }));
      g.appendChild(txt(x, y + 4, m.name, 'ptr')).setAttribute('fill', col);
    });

    if (f.labels) {
      for (i = 0; i < n && i < f.labels.length; i++) {
        if (!f.labels[i]) continue;
        g.appendChild(txt(X0 + i * (cw + gx) + cw / 2, Y0 - CELL_H / 2 - 6, f.labels[i], 'lbl sm'));
      }
    }
    return { g: g, w: Math.max(W, 480), h: H };
  }

  NS.cellX = cellX;
  NS.drawArray = drawArray;
})(window.DSANIM = window.DSANIM || {});
