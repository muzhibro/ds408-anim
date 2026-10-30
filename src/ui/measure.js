/* 按 mode 分派绘制，返回 { g, w, h } */
(function (NS) {
  'use strict';

  var el = NS.el, drawList = NS.drawList, drawTree = NS.drawTree, drawArray = NS.drawArray, drawGraph = NS.drawGraph;

  function measure(f) {
    if (f.mode === 'list') return drawList(f);
    if (f.mode === 'tree') return drawTree(f);
    if (f.mode === 'array') return drawArray(f);
    if (f.mode === 'graph') return drawGraph(f);
    return { g: el('g'), w: 400, h: 200 };
  }

  NS.measure = measure;
})(window.DSANIM = window.DSANIM || {});
