/* 图章固定图例：顶点坐标 + 邻接表 */
(function (NS) {
  'use strict';

  /* ========== 第 4 章 图 ========== */
  var G_DFS = {
    directed: false,
    verts: [{ id: 0, x: 110, y: 130 }, { id: 1, x: 250, y: 70 }, { id: 2, x: 250, y: 190 },
            { id: 3, x: 390, y: 70 }, { id: 4, x: 390, y: 190 }, { id: 5, x: 540, y: 130 }],
    edges: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5]]
  };

  var ADJ = [[1, 2], [0, 3], [0, 4], [1, 5], [2, 5], [3, 4]];

  NS.G_DFS = G_DFS;
  NS.ADJ = ADJ;
})(window.DSANIM = window.DSANIM || {});
