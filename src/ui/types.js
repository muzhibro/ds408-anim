/* ui · 结构体定义（右侧「结构体」卡片用的静态文本） */
(function (NS) {
  'use strict';

  /* 图这一章用到的结构体：邻接表三件套 + 邻接矩阵 */
  var GRAPH_TYPES = [
    '#define MaxVertexNum 100',
    '',
    'typedef struct <b>ArcNode</b> {      /* 边表结点＝一条边 */',
    '    int  adjvex;         /* 指向哪个顶点 */',
    '    struct ArcNode *nextarc;   /* 下一条边 */',
    '    int  weight;         /* 权值 */',
    '} ArcNode;',
    '',
    'typedef struct <b>VNode</b> {        /* 顶点表结点＝一个顶点 */',
    '    ElemType data;       /* 顶点信息 */',
    '    ArcNode *firstarc;   /* 第一条边 */',
    '} VNode, <b>AdjList</b>[MaxVertexNum];',
    '',
    'typedef struct {            /* 邻接表＝顶点数组＋边链表 */',
    '    AdjList vertices;    /* vertices[i] 是第 i 个顶点 */',
    '    int vexnum, arcnum;  /* 顶点数、边数 */',
    '} <b>ALGraph</b>;',
    '',
    'typedef struct {            /* 邻接矩阵版：稠密图 */',
    '    ElemType edge[MaxVertexNum][MaxVertexNum];',
    '    int vexnum, arcnum;',
    '} <b>MGraph</b>;'
  ].join('\n');

  var LIST_TYPES = [
    'typedef struct <b>LNode</b> {        /* 单链表结点 */',
    '    ElemType data;       /* 数据域 */',
    '    struct LNode *next;  /* 指针域：下一个结点 */',
    '} LNode, <b>*LinkList</b>;',
    '',
    '/* 头结点：不放数据，只负责"指路"，处理边界更省事 */',
    '',
    'typedef struct <b>DNode</b> {        /* 双链表结点 */',
    '    ElemType data;',
    '    struct DNode *prior;  /* 前驱 */',
    '    struct DNode *next;   /* 后继 */',
    '} DNode, *DLinkList;'
  ].join('\n');

  var TREE_TYPES = [
    'typedef struct <b>BiTNode</b> {     /* 二叉树结点 */',
    '    ElemType data;',
    '    struct BiTNode *lchild;  /* 左孩子 */',
    '    struct BiTNode *rchild;  /* 右孩子 */',
    '} BiTNode, <b>*BiTree</b>;',
    '',
    '/* 线索二叉树：空的指针拿来指"前驱/后继" */',
    'typedef struct <b>ThreadNode</b> {',
    '    ElemType data;',
    '    struct ThreadNode *lchild, *rchild;',
    '    int ltag, rtag;  /* 0=孩子 1=线索 */',
    '} ThreadNode, *ThreadTree;'
  ].join('\n');

  var TYPE_MAP = { graph: GRAPH_TYPES, list: LIST_TYPES, tree: TREE_TYPES };
  var TYPE_NAME = { graph: '图', list: '链表', tree: '二叉树' };

  NS.TYPE_MAP = TYPE_MAP;
  NS.TYPE_NAME = TYPE_NAME;
})(window.DSANIM = window.DSANIM || {});
