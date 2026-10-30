/* C 代码上色。
 *
 * 切词结果给 app 渲染成带 class 的 span。
 * 返回词元数组而不是 HTML 字符串：测试能断言"拼回去等于原文"，渲染走 textContent 不用转义。
 *
 * 只覆盖项目里用到的 C 子集：关键字、类型、自定义结构体名、宏、函数名、
 * -> 和 . 后面的字段、数字、字符串、字符、注释、# 预处理行。
 */
(function (NS) {
  'use strict';

  function set(s) { var m = {}; s.split(' ').forEach(function (w) { m[w] = 1; }); return m; }

  var KW = set('if else while for do return break continue switch case default goto false true');
  var TYPE = set('void int char short long float double unsigned signed const static typedef struct union enum sizeof');
  var CONST = set('NULL MAXSIZE MAXV INF');
  var CUSTOM = set('LNode LinkList DNode DLinkList BiTree BiTNode ThreadNode ThreadTree SqList '
    + 'ArcNode VNode ALGraph MGraph Edge Stack Queue Visited ElemType Status WeightType VertexType');

  /* 顺序有讲究：注释和字符串要在运算符前，-> 要在单个 - 前 */
  var RE = /(\s+)|(\/\*[\s\S]*?\*\/)|(\/\/[^\n]*)|(L?"(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(->|\.\.\.)|(==|!=|<=|>=|&&|\|\||\+\+|--|[=+\-*\/%<>!&|^~?:;,.()\[\]{}])|([0-9][0-9A-Za-z_.]*)|([A-Za-z_][A-Za-z0-9_]*)/g;

  function tokens(line) {
    var out = [];
    var lastSig = '';          /* 上一个非空白词元，用来判断 -> 后面的字段名 */
    RE.lastIndex = 0;
    var m;
    while ((m = RE.exec(line))) {
      if (m[1]) { out.push({ text: m[0], cls: null }); continue; }
      if (m[2] || m[3]) { out.push({ text: m[0], cls: 't-com' }); lastSig = '/*'; continue; }
      if (m[4] || m[5]) { out.push({ text: m[0], cls: 't-str' }); lastSig = 'str'; continue; }
      if (m[6] || m[7]) { out.push({ text: m[0], cls: 't-op' }); lastSig = m[0]; continue; }
      if (m[8]) { out.push({ text: m[0], cls: 't-num' }); lastSig = 'num'; continue; }

      var w = m[0];
      var cls = null;
      if (lastSig === '->' || lastSig === '.') cls = 't-fd';
      else if (KW[w]) cls = 't-kw';
      else if (TYPE[w] || CUSTOM[w]) cls = 't-ty';
      else if (CONST[w] || /^[A-Z][A-Z0-9_]{2,}$/.test(w)) cls = 't-cn';   /* T / Q 这类单字母变量不算宏 */
      else if (/^\s*\(/.test(line.slice(RE.lastIndex))) cls = 't-fn';
      out.push({ text: w, cls: cls });
      lastSig = w;
    }
    return out;
  }

  /* 这一行没闭合的块注释从哪开始；没有返回 -1 */
  function openComment(s) {
    var i = 0;
    for (;;) {
      var a = s.indexOf('/*', i);
      if (a < 0) return -1;
      var b = s.indexOf('*/', a + 2);
      if (b < 0) return a;
      i = b + 2;
    }
  }

  /* 块注释会跨行，得按顺序走，不能单行独立着色 */
  function highlight(code) {
    var inBlock = false;
    return code.map(function (line) {
      var src = String(line == null ? '' : line);

      if (inBlock) {
        var end = src.indexOf('*/');
        if (end < 0) return [{ text: src, cls: 't-com' }];
        inBlock = false;
        return [{ text: src.slice(0, end + 2), cls: 't-com' }].concat(tokens(src.slice(end + 2)));
      }

      if (/^\s*#/.test(src)) return [{ text: src, cls: 't-pre' }];

      var open = openComment(src);
      if (open >= 0) {
        inBlock = true;
        return tokens(src.slice(0, open)).concat([{ text: src.slice(open), cls: 't-com' }]);
      }
      return tokens(src);
    });
  }

  NS.highlight = highlight;
})(window.DSANIM = window.DSANIM || {});
