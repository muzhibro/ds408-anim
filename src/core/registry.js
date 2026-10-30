/* 章节表和 id 生成器 */
(function (NS) {
  'use strict';

  /* 全局自增 id。帧里靠它认结点，不靠对象引用 */
  var uid = 0;
  function nextId() { return ++uid; }

  /* ---------- 章节与 demo 容器 ---------- */
  var CHAPTERS = [
    { id: 'list', name: '链表', demos: [] },
    { id: 'tree', name: '二叉树', demos: [] },
    { id: 'graph', name: '图', demos: [] },
    { id: 'search', name: '查找', demos: [] },
    { id: 'sort', name: '排序', demos: [] }
  ];

  function CH(id) {
    for (var i = 0; i < CHAPTERS.length; i++) if (CHAPTERS[i].id === id) return CHAPTERS[i];
    throw new Error('no chapter ' + id);
  }

  NS.nextId = nextId;
  NS.CHAPTERS = CHAPTERS;
  NS.CH = CH;
})(window.DSANIM = window.DSANIM || {});
