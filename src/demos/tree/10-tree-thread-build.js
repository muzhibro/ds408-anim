/* 3.12 中序线索二叉树（建线索） */
(function (NS) {
  'use strict';

  var CH = NS.CH, T = NS.T, FT = NS.FT, setStack = NS.setStack, mkTree2 = NS.mkTree2;

  CH('tree').demos.push({
    id: 'tree-thread-build', name: '3.12 中序线索化',
    cases: [
      { label: '完全二叉树 A(B(D,E),C(F,G))', tip: '中序 D B E A F C G，四个叶子正好都用上线索',
        tree: function () { return mkTree2(); } },
      { label: '一般树 A(B(D,E(G)),C(∅,F))', tip: 'C 有右孩子没左孩子，D、G 是叶子',
        tree: function () { return T('A', T('B', T('D'), T('E', T('G'))), T('C', null, T('F'))); } },
      { label: '退化单链 A(B(C(D)))', tip: '全挂在左孩子上，中序是 D C B A，线索一条接一条',
        tree: function () { return NS.mkChain(); } }
    ],
    note: '中序线索化就是把<b>空的左指针指向前驱、空的右指针指向后继</b>，再用 ltag/rtag 区分"这是孩子还是线索"。递归按中序走，<b>pre 记上一个访问的结点</b>：轮到 p 时，p 的左指针空就指向 pre；pre 的右指针空就指向 p。',
    code: [
      'void InThread(ThreadTree p, ThreadTree *pre) {',
      '    if (!p) return;',
      '    InThread(p->lchild, pre);          /* 左子树先线索化 */',
      '    if (!p->lchild) {                  /* 左指针空 → 拿来看前驱 */',
      '        p->lchild = *pre; p->ltag = 1;',
      '    }',
      '    if (*pre && !(*pre)->rchild) {     /* 前驱右指针空 → 拿来看后继 */',
      '        (*pre)->rchild = p; (*pre)->rtag = 1;',
      '    }',
      '    *pre = p;',
      '    InThread(p->rchild, pre);',
      '}',
      '',
      'void CreateInThread(ThreadTree T) {',
      '    ThreadTree pre = NULL;             /* 前驱游标，一开始是空 */',
      '    if (!T) return;',
      '    InThread(T, &pre);',
      '    pre->rchild = NULL; pre->rtag = 1; /* 中序最后一个：后继为空 */',
      '}'
    ],
    run: function* (c) {
      var root = (c && c.tree) ? c.tree() : mkTree2();
      var th = {}, pre = null, cs = [];

      function slot(id) { return th[id] || (th[id] = { lt: 0, rt: 0, pl: null, pr: null }); }
      function nm(n) { return n ? n.val : 'NULL'; }
      function opt(n) {
        return {
          mark: n, threads: th, stack: cs.slice(),
          ptrs: [{ name: 'p', node: n }, { name: 'pre', node: pre }],
          side: ['实线 = 孩子，<b>虚线 = 线索</b>', 'p / pre 是当前结点和前驱游标']
        };
      }

      setStack(cs);
      yield FT(13, 'CreateInThread：入口。线索化要一个"前驱游标"，先把它准备好。', root, opt(null));
      yield FT(14, 'ThreadTree pre = NULL：还没有访问过任何结点，前驱自然是空。', root, opt(null));
      yield FT(15, 'if (!T) return：空树没什么可线索化的。', root, opt(null));
      yield FT(16, 'InThread(T, &pre)：从根开始，按中序递归。', root, opt(root));

      function* inThread(p) {
        if (!p) {
          cs.push('InThread(NULL)');
          yield FT(1, 'InThread(NULL)：空子树，直接返回。', root, opt(null));
          cs.pop();
          return;
        }
        cs.push('InThread(' + p.val + ')');

        yield FT(2, p.val + '：先递归左子树——中序是"左、根、右"，左边的结点一定先被访问。', root, opt(p));
        yield* inThread(p.l);

        if (!p.l) {
          yield FT(3, p.val + ' 没有左孩子，lchild 是空的 → 正好拿来存前驱。', root, opt(p));
          slot(p.id).lt = 1;
          slot(p.id).pl = pre ? pre.id : null;
          yield FT(4, 'p->lchild = pre, p->ltag = 1：' + p.val + ' 的左指针挂到 ' + nm(pre) + '（虚线）。', root, opt(p));
        } else {
          yield FT(3, p.val + ' 有左孩子 ' + p.l.val + ' → ltag 保持 0，这个指针还是孩子指针，跳过。', root, opt(p));
        }

        if (pre && !pre.r) {
          yield FT(6, 'pre = ' + pre.val + '，它的右指针也是空的 → 该把后继记下来了。', root, opt(p));
          slot(pre.id).rt = 1;
          slot(pre.id).pr = p.id;
          yield FT(7, '(*pre)->rchild = p, (*pre)->rtag = 1：' + pre.val + ' 的右指针挂到后继 ' + p.val + '（虚线）。', root, opt(p));
        } else {
          yield FT(6, pre
            ? 'pre = ' + pre.val + ' 已经有右孩子，右指针不能动，跳过。'
            : 'pre 还是空：' + p.val + ' 是中序第一个结点，没有前驱，跳过。', root, opt(p));
        }

        pre = p;
        yield FT(9, '*pre = p：前驱游标推进到 ' + p.val + '，下一个结点拿它当前驱。', root, opt(p));
        yield FT(10, '再递归右子树。', root, opt(p));
        yield* inThread(p.r);
        cs.pop();
      }

      yield* inThread(root);
      yield FT(17, 'pre 停在中序最后一个结点 ' + nm(pre) + ' 上：右指针置空、rtag 置 1，线索化完成。', root, opt(pre));
      setStack(null);
    }
  });
})(window.DSANIM = window.DSANIM || {});
