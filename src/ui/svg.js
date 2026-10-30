/* SVG 图元。绘制层只从这里出节点 */
(function (NS) {
  'use strict';

  var SVG = 'http://www.w3.org/2000/svg';
  function el(tag, attrs) {
    var n = document.createElementNS(SVG, tag);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    return n;
  }
  function txt(x, y, s, cls, anchor) {
    var t = el('text', { x: x, y: y, class: cls || 'lbl', 'text-anchor': anchor || 'middle' });
    t.textContent = s;
    return t;
  }
  function rrect(x, y, w, h, r) {
    return el('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: r == null ? 8 : r });
  }
  function arrowHead(x, y, ang, color) {
    var s = 7, p = el('path', {
      d: 'M0,0 L' + (-s) + ',' + (-s / 1.7) + ' L' + (-s) + ',' + (s / 1.7) + ' Z',
      transform: 'translate(' + x + ',' + y + ') rotate(' + (ang * 180 / Math.PI) + ')',
      fill: color || '#3b4d73'
    });
    return p;
  }
  function line(x1, y1, x2, y2, cls, color) {
    return el('line', { x1: x1, y1: y1, x2: x2, y2: y2, class: cls || 'edge', stroke: color || null });
  }
  function quad(x1, y1, x2, y2, bend, cls, color) {
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + bend;
    return el('path', {
      d: 'M' + x1 + ',' + y1 + ' Q' + mx + ',' + my + ' ' + x2 + ',' + y2,
      class: cls || 'edge dash', stroke: color || null
    });
  }


  function textW(str) {
    var w = 0, i, c;
    for (i = 0; i < str.length; i++) {
      c = str.charCodeAt(i);
      w += (c > 0x2e80) ? 11.6 : 6.8;      /* 中文/全角按 11.6，ASCII 按 6.8 */
    }
    return w;
  }

  NS.el = el;
  NS.txt = txt;
  NS.rrect = rrect;
  NS.arrowHead = arrowHead;
  NS.line = line;
  NS.quad = quad;
  NS.textW = textW;
})(window.DSANIM = window.DSANIM || {});
