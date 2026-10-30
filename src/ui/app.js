/* 界面装配：加载、播放控制、URL 同步 */
(function (NS) {
  'use strict';

  var measure = NS.measure, TYPE_MAP = NS.TYPE_MAP, TYPE_NAME = NS.TYPE_NAME;
  var highlight = NS.highlight;

  var DATA = window.DSANIM;
  var CHAP = DATA.CHAPTERS;

  var stage = document.getElementById('stage');
  var codeEl = document.getElementById('code');
  var caseEl = document.getElementById('caseSel');
  var descEl = document.getElementById('desc');
  var extraEl = document.getElementById('extra');
  var stackPanel = document.getElementById('stackpanel');
  var stackBody = document.getElementById('stackbody');
  var stackTag = document.getElementById('stacktag');
  var stackDepth = document.getElementById('stackdepth');
  var stackTitle = document.getElementById('stacktitle');
  var dsPanel = document.getElementById('dspanel');
  var dsRows = document.getElementById('dsrows');
  var dsKind = document.getElementById('dskind');
  var dsFoot = document.getElementById('dsfoot');
  var indPanel = document.getElementById('indpanel');
  var indBody = document.getElementById('indbody');
  var indKind = document.getElementById('indkind');
  var indFoot = document.getElementById('indfoot');
  var sideCol = document.getElementById('sidecol');
  var tdBox = document.getElementById('typedefs');
  var tdBody = document.getElementById('tdbody');
  var selEl = document.getElementById('demoSel');
  var tabsEl = document.getElementById('tabs');
  var noteEl = document.getElementById('note');
  var rangeEl = document.getElementById('range');
  var progEl = document.getElementById('prog');
  var playBtn = document.getElementById('play');
  var speedEl = document.getElementById('speed');
  var speedValEl = document.getElementById('speedval');
  var filterEl = document.getElementById('demoFilter');
  var hintEl = document.getElementById('filterHint');
  var splitEl = document.getElementById('splitter');
  var leftEl = document.getElementById('leftcol');
  var shareBtn = document.getElementById('share');
  var codeBoxEl = document.getElementById('codebox');

  var curChap = 0, curDemo = 0, frames = [], step = 0, timer = null, resetTimer = null;
  var maxDepth = 0, BLK = 33, BLK_H = 29;   /* 递归栈：本模板最大栈深（决定桶高）、单块占高（29 + gap 4） */

  /* 5 档速度。数组是每帧毫秒数，递减 = 滑块右移变快。 */
  var SPEED_STEPS = [1600, 1100, 760, 480, 280];
  var SPEED_NAMES = ['很慢', '慢', '正常', '快', '很快'];

  function speedLevel() {
    var v = parseInt(speedEl.value, 10);
    if (isNaN(v)) v = 3;
    return Math.min(SPEED_STEPS.length, Math.max(1, v));
  }
  function speedDelay() { return SPEED_STEPS[speedLevel() - 1]; }
  /* 档位改了：读数、aria、还在跑的定时器一起更新 */
  function syncSpeed() {
    var lv = speedLevel();
    if (+speedEl.value !== lv) speedEl.value = String(lv);
    var txt = SPEED_NAMES[lv - 1] + '（' + lv + '/' + SPEED_STEPS.length + '）';
    if (speedValEl) speedValEl.textContent = lv + ' 档 · ' + SPEED_NAMES[lv - 1];
    speedEl.setAttribute('aria-valuetext', '第 ' + lv + ' 档，' + SPEED_NAMES[lv - 1] + '，每帧 ' + speedDelay() + ' 毫秒');
    speedEl.setAttribute('title', '播放速度：' + txt);
  }

  /* ---------- 模板搜索 ----------
     全站搜：名字、id、章名都能命中，结果跨章。按章过滤没意义，一章最多 14 个。
     pickList 记着下拉每项对应的 (章, 模板)，搜索时下拉序号和模板下标不是一回事。 */
  var demoQuery = '';
  var filterTimer = null;
  var pickList = [];          /* [{c: 章下标, d: 模板下标}]，与下拉项一一对应 */

  function searchHits() {
    var q = demoQuery.toLowerCase();
    var out = [];
    CHAP.forEach(function (ch, ci) {
      var wholeChapter = ch.name.toLowerCase().indexOf(q) >= 0;
      ch.demos.forEach(function (d, di) {
        if (wholeChapter ||
            d.name.toLowerCase().indexOf(q) >= 0 ||
            d.id.toLowerCase().indexOf(q) >= 0) {
          out.push({ c: ci, d: di });
        }
      });
    });
    return out;
  }

  /* 重建下拉，返回第一项 {c,d}；没命中返回 null。 */
  function rebuildDemoOptions() {
    selEl.innerHTML = '';
    pickList = [];
    if (demoQuery) {
      var hits = searchHits();
      if (!hits.length) {
        selEl.disabled = true;
        hintEl.textContent = '全站都没有匹配的模板，按 Esc 清空';
        return null;
      }
      hits.forEach(function (h, i) {
        var o = document.createElement('option');
        o.value = String(i);
        /* 带章名，不然拓扑排序和直接插入排序分不清 */
        o.textContent = CHAP[h.c].name + ' · ' + CHAP[h.c].demos[h.d].name;
        selEl.appendChild(o);
        pickList.push(h);
      });
      selEl.disabled = false;
      hintEl.textContent = hits.length + ' 个结果（全站 38 个模板）';
      return hits[0];
    }
    var all = CHAP[curChap].demos;
    all.forEach(function (d, k) {
      var o = document.createElement('option');
      o.value = String(k);
      o.textContent = d.name;
      selEl.appendChild(o);
      pickList.push({ c: curChap, d: k });
    });
    selEl.disabled = false;
    hintEl.textContent = '';
    return all.length ? { c: curChap, d: 0 } : null;
  }

  /* 选中项跟当前模板走；搜索时序号按 pickList 算 */
  function syncSelValue() {
    if (!selEl.children.length) return;
    for (var i = 0; i < pickList.length; i++) {
      if (pickList[i].c === curChap && pickList[i].d === curDemo) { selEl.value = String(i); return; }
    }
  }

  function setFilter(v) {
    demoQuery = String(v || '').trim();
    if (filterEl.value !== demoQuery && document.activeElement !== filterEl) filterEl.value = demoQuery;
    var first = rebuildDemoOptions();
    if (!first) return;
    /* 边打字边跳到第一个结果，跨章就连章一起切 */
    goto(first.c, first.d);
  }

  /* --------------------------------------------------- 代码区宽度（可拖动）
     代码行太长会折行（实测 449 行里有 116 行折成两行），折行后行号与内容对不齐。
     给一根拖动条：宽度记在 localStorage，键盘也能调。
     默认 560px —— 449 行代码里 431 行（96%）在 65 字符以内，这个宽度刚好放得下，
     剩下几行特别长的（图的 Dijkstra / Prim）再靠拖。 */
  var SPLIT_KEY = 'ds408-anim:split';
  var splitW = 560;
  var SPLIT_MIN = 300;

  function viewportW() {
    return (typeof window !== 'undefined' && window.innerWidth) || 1440;
  }
  function splitMax() { return Math.max(SPLIT_MIN + 20, Math.round(viewportW() * 0.62)); }
  function applySplit(w) {
    splitW = Math.max(SPLIT_MIN, Math.min(splitMax(), Math.round(w)));
    if (leftEl && leftEl.style) leftEl.style.width = splitW + 'px';
    if (splitEl) {
      splitEl.setAttribute('aria-valuenow', String(splitW));
      splitEl.setAttribute('aria-valuemin', String(SPLIT_MIN));
      splitEl.setAttribute('aria-valuemax', String(splitMax()));
      splitEl.setAttribute('title', '拖动调整代码区宽度：' + splitW + 'px');
    }
    return splitW;
  }
  function saveSplit() {
    if (!canStore) return;
    try { localStorage.setItem(SPLIT_KEY, String(splitW)); } catch (e) { /* 存不下就算了 */ }
  }
  function restoreSplit() {
    var w = NaN;
    if (canStore) {
      try { w = parseInt(localStorage.getItem(SPLIT_KEY), 10); } catch (e) { w = NaN; }
    }
    applySplit(isFinite(w) ? w : splitW);
  }
  function bindSplitter() {
    var dragging = false, startX = 0, startW = 0;
    function down(e) {
      dragging = true;
      startX = e.clientX; startW = splitW;
      splitEl.classList.add('dragging');
      if (splitEl.setPointerCapture && e.pointerId != null) {
        try { splitEl.setPointerCapture(e.pointerId); } catch (err) { /* 无所谓 */ }
      }
      e.preventDefault();
    }
    function move(e) {
      if (!dragging) return;
      applySplit(startW + (e.clientX - startX));
    }
    function up() {
      if (!dragging) return;
      dragging = false;
      splitEl.classList.remove('dragging');
      saveSplit();
    }
    if (!splitEl) return;
    splitEl.addEventListener('pointerdown', down);
    splitEl.addEventListener('pointermove', move);
    splitEl.addEventListener('pointerup', up);
    splitEl.addEventListener('pointercancel', up);
    splitEl.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowLeft' ? -20 : e.key === 'ArrowRight' ? 20 : 0;
      if (d) { e.preventDefault(); applySplit(splitW + d); saveSplit(); }
      else if (e.key === 'Home') { e.preventDefault(); applySplit(SPLIT_MIN); saveSplit(); }
      else if (e.key === 'End') { e.preventDefault(); applySplit(splitMax()); saveSplit(); }
    });
  }

  /* ----------------------------------------------- 地址栏同步 + 复制链接
     深链接本来就能"读"（#章@模板@帧@用例），但页面从不往地址栏写，
     所以没法把"第 12 帧"发给别人。这里用 replaceState 静默更新，
     不产生历史记录，浏览器返回键的行为不变。 */
  var hashTimer = null;

  function hashOf() {
    var ch = CHAP[curChap];
    var demo = ch && ch.demos[curDemo];
    if (!demo) return '';
    var ci = caseEl.value === '' ? 0 : caseEl.value;
    return '#' + ch.id + '@' + demo.id + '@' + step + '@' + ci;
  }
  function syncHashNow() {
    if (typeof history === 'undefined' || !history.replaceState) return;
    var h = hashOf();
    if (!h || location.hash === h) return;
    try { history.replaceState(null, '', h); } catch (e) { /* 沙箱里可能不让改 */ }
  }
  function syncHash() {
    if (hashTimer) clearTimeout(hashTimer);
    hashTimer = setTimeout(function () { hashTimer = null; syncHashNow(); }, 160);
  }

  function fullLink() {
    var h = hashOf();
    if (typeof location === 'undefined') return h;
    var base = String(location.href || '').split('#')[0];
    return base + h;
  }
  function copyText(txt) {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(txt);
    }
    /* clipboard 不可用时走 execCommand，塞隐藏 textarea */
    try {
      var ta = document.createElement('textarea');
      ta.value = txt;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand && document.execCommand('copy');
      document.body.removeChild(ta);
      return ok ? Promise.resolve() : Promise.reject(new Error('execCommand 不支持'));
    } catch (e) {
      return Promise.reject(e);
    }
  }
  var shareTimer = null;
  function flashShare(text, ok) {
    if (!shareBtn) return;
    shareBtn.textContent = text;
    shareBtn.classList.toggle('done', !!ok);
    shareBtn.setAttribute('aria-label', text);
    if (shareTimer) clearTimeout(shareTimer);
    shareTimer = setTimeout(function () {
      shareTimer = null;
      shareBtn.textContent = '复制链接';
      shareBtn.classList.remove('done');
      shareBtn.setAttribute('aria-label', '复制当前帧的链接');
    }, 1600);
  }
  function doShare() {
    syncHashNow();
    copyText(fullLink()).then(function () { flashShare('已复制', true); },
      function () { flashShare('复制失败', false); });
  }

  function buildTabs() {
    tabsEl.setAttribute('role', 'tablist');
    tabsEl.setAttribute('aria-label', '章节');
    CHAP.forEach(function (c, i) {
      var b = document.createElement('button');
      b.className = 'tab' + (i === curChap ? ' on' : '');
      b.textContent = c.name + '（' + c.demos.length + '）';
      b.onclick = function () { switchChapter(i); };
      b.dataset.i = i;
      b.id = 'tab-' + i;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', i === curChap ? 'true' : 'false');
      b.setAttribute('aria-controls', 'stage');
      tabsEl.appendChild(b);
    });
  }

  function paintTabs() {
    Array.prototype.forEach.call(tabsEl.children, function (b, k) {
      b.classList.toggle('on', k === curChap);
      b.setAttribute('aria-selected', k === curChap ? 'true' : 'false');
    });
  }

  /* 跳到第 c 章第 d 个模板。跨章搜索下切章和载入得一起做 */
  function goto(c, d, ci) {
    if (c !== curChap) { curChap = c; paintTabs(); showTypes(CHAP[c].id); }
    load(d, ci);
  }

  function switchChapter(i) {
    curChap = i;
    paintTabs();
    /* 点章标签就是按章浏览，清掉搜索词 */
    if (demoQuery) {
      demoQuery = '';
      if (filterEl) filterEl.value = '';
    }
    var first = rebuildDemoOptions();
    if (first) load(first.d); else load(0);
  }

  /* 取该行第一对完整括号，包成 .cond */
  function condRange(s) {
    var m = /(?:^|[^\w])(if|while)\s*\(/.exec(s);
    if (!m) return null;
    var open = m.index + m[0].length - 1;
    if (s[open] !== '(') return null;
    var depth = 0;
    for (var i = open; i < s.length; i++) {
      if (s[i] === '(') depth++;
      else if (s[i] === ')') { depth--; if (depth === 0) return { start: open, end: i }; }
    }
    return null;
  }
  function markCond(row, soft) {
    var body = row.lastChild;
    if (!body || !body.dataset || body.dataset.cond) return;
    var r = condRange(body.textContent || '');
    if (!r) return;
    body.dataset.cond = '1';
    r.soft = !!soft;
    paintRow(row, +row.dataset.i, r);
  }
  function markSoftCond(row) { markCond(row, true); }
  function unmarkCond(row) {
    var body = row.lastChild;
    if (!body || !body.dataset || !body.dataset.cond) return;
    delete body.dataset.cond;
    paintRow(row, +row.dataset.i, null);      /* 重绘成没有 .cond 的样子 */
  }

  /* 结构体文本在 ui/types.js，这里不再存一份 */

  function showTypes(chapId) {
    var txt = TYPE_MAP[chapId] || null;
    tdBox.classList.toggle('on', !!txt);
    if (!txt) return;
    document.getElementById('tdhead').textContent =
      '结构体定义（' + TYPE_NAME[chapId] + '这一章用到的）· 可上下滚动';
    if (tdBody.dataset.chap !== chapId) {
      /* 结构体定义也上色，文本里的 <b> 先去掉 */
      var lines = txt.replace(/<\/?b>/g, '').split('\n');
      var rows = highlight(lines);
      tdBody.textContent = '';
      lines.forEach(function (_, i) {
        if (i) tdBody.appendChild(document.createTextNode('\n'));
        rows[i].forEach(function (t) { tdBody.appendChild(tokNode(t)); });
      });
      tdBody.dataset.chap = chapId;
    }
  }

  /* 当前模板每行的词元，重绘时复用 */
  var LINE_TOKENS = [];

  function tokNode(t) {
    if (!t.cls) return document.createTextNode(t.text);
    var sp = document.createElement('span');
    sp.className = t.cls;
    sp.textContent = t.text;
    return sp;
  }

  /* 重绘一行；cond 给区间时把那段包进 .cond */
  function paintRow(row, i, cond) {
    var body = row.lastChild;
    if (!body) return;
    body.textContent = '';
    var toks = LINE_TOKENS[i] || [];
    var pos = 0, condEl = null;
    toks.forEach(function (t) {
      var start = pos, end = pos + t.text.length;
      pos = end;
      if (!cond || end <= cond.start || start > cond.end) { body.appendChild(tokNode(t)); return; }

      var cutA = cond.start - start;
      var pre = cutA > 0 ? t.text.slice(0, cutA) : '';
      if (pre) body.appendChild(tokNode({ text: pre, cls: t.cls }));
      if (!condEl) {
        condEl = document.createElement('span');
        condEl.className = cond.soft ? 'cond soft' : 'cond';
        body.appendChild(condEl);
      }
      var from = Math.max(0, cutA), to = Math.min(t.text.length, cond.end + 1 - start);
      var mid = t.text.slice(from, to);
      if (mid) condEl.appendChild(tokNode({ text: mid, cls: t.cls }));
      var post = t.text.slice(to);
      if (post) body.appendChild(tokNode({ text: post, cls: t.cls }));
    });
  }

  function renderCode(demo) {
    codeEl.innerHTML = '';
    LINE_TOKENS = highlight(demo.code);
    demo.code.forEach(function (src, i) {
      var row = document.createElement('div');
      row.className = 'cline';
      row.dataset.i = i;
      var no = document.createElement('span');
      no.className = 'no';
      no.textContent = String(i + 1);
      var body = document.createElement('span');
      body.className = 'cl';
      row.appendChild(no); row.appendChild(body);
      codeEl.appendChild(row);
      paintRow(row, i, null);
    });
  }

  caseEl.addEventListener('change', function () { load(curDemo, caseEl.value); });

  function load(k, ci) {
    stop();
    cancelReset();
    curDemo = k;
    syncSelValue();
    var demo = CHAP[curChap].demos[k];
    noteEl.innerHTML = demo.note || '';
    showTypes(CHAP[curChap].id);   /* 链表/二叉树/图 三章各显示一份结构体定义 */
    renderCode(demo);
    frames = [];
    /* 用例：换一组输入，入口 #caseSel */
    var cs = demo.cases || null;
    if (cs) {
      caseEl.style.display = '';
      caseEl.innerHTML = '';
      cs.forEach(function (c, idx) {
        var o = document.createElement('option');
        o.value = String(idx); o.textContent = c.label; caseEl.appendChild(o);
      });
      caseEl.value = '0';
    } else {
      caseEl.style.display = 'none';
      caseEl.innerHTML = '';
    }
    var pick = cs ? cs[Math.min(ci == null ? 0 : parseInt(ci, 10), cs.length - 1)] : null;
    if (cs && ci != null) caseEl.value = String(ci);
    /* 生成器是手写的，抛异常会让画面停在上一帧，看着像卡死。接住，转成提示。 */
    var err = null;
    try {
      var it = demo.run(pick);
      var r;
      while (!(r = it.next()).done) frames.push(r.value);
    } catch (e) {
      err = e;
      if (window.console) console.error('模板 ' + demo.id + ' 的生成器抛异常：', e);
    }
    if (!frames.length) {
      descEl.innerHTML = err
        ? '<span class="badge">出错</span>这个模板的动画生成器抛了异常：' + String((err && err.message) || err)
        : '<span class="badge">空</span>这个模板没有产生任何帧。';
      rangeEl.max = '0';
      return;
    }
    var vbW = 560, vbH = 200;
    frames.forEach(function (f) {
      var m = measure(f);
      if (m.w > vbW) vbW = m.w;
      if (m.h > vbH) vbH = m.h;
    });
    stage.setAttribute('viewBox', '0 0 ' + vbW + ' ' + vbH);
    /* 桶高按整模板最大栈深定死，别逐帧跳 */
    maxDepth = 0;
    frames.forEach(function (f) { if (f.stack && f.stack.length > maxDepth) maxDepth = f.stack.length; });
    prevDepth = null;
    stackTitle.textContent = demo.stackTitle || '递归栈';
    /* 1 viewBox 单位 ≈ 1px，窄屏再等比缩 */
    var up = frames[0].mode === 'array' ? 1.0 : (frames[0].mode === 'graph' ? 1.65 : 1.3);
    stage.style.maxWidth = Math.round(vbW * up) + 'px';
    rangeEl.max = String(frames.length - 1);
    step = 0;
    showStep();
  }

  function showStep() {
    var f = frames[step];
    if (!f) return;
    var m = measure(f);
    stage.innerHTML = '';
    stage.appendChild(m.g);
    descEl.innerHTML = f.desc || '';
    /* 高亮行 + 行内判定条件 */
    var prev = codeEl.querySelector('.cline.hl');
    if (prev) { prev.classList.remove('hl'); unmarkCond(prev); }
    Array.prototype.forEach.call(codeEl.querySelectorAll('.cline'), function (r) { unmarkCond(r); });
    var row = codeEl.querySelector('.cline[data-i="' + f.line + '"]');
    if (row) {
      row.classList.add('hl');
      markCond(row);
      /* 语句体行：外层条件用淡色带一下 */
      if (!row.querySelector('.cond')) {
        for (var b = f.line - 1; b >= Math.max(0, f.line - 4); b--) {
          var up = codeEl.querySelector('.cline[data-i="' + b + '"]');
          if (up && /(?:^|[^\w])(if|while)\s*\(/.test(up.textContent)) { markSoftCond(up); break; }
        }
      }
      var top = row.offsetTop - codeEl.parentNode.offsetTop;
      var box = codeEl.parentNode;
      if (top < box.scrollTop || top > box.scrollTop + box.clientHeight - 40) {
        box.scrollTop = top - box.clientHeight / 2;
      }
    }
    /* 附加信息 */
    extraEl.innerHTML = '';
    (f.side || []).forEach(function (s) {
      var d = document.createElement('span');
      d.innerHTML = s;
      extraEl.appendChild(d);
    });
    /* 递归栈：竖桶，栈底在下 */
    renderStack(f.stack);
    /* 邻接表，和画面里的边对应 */
    renderAdj(f);
    /* 拓扑用的入度表 */
    renderInd(f);
    /* 卡片全空就收起 */
    sideCol.style.display = (stackPanel.classList.contains('on') || dsPanel.classList.contains('on') || indPanel.classList.contains('on')) ? 'flex' : 'none';
    rangeEl.value = String(step);
    progEl.textContent = (step + 1) + ' / ' + frames.length;
    /* 读屏拿不到 SVG，说明和进度另写文本 */
    rangeEl.setAttribute('aria-valuenow', String(step));
    rangeEl.setAttribute('aria-valuemax', String(frames.length - 1));
    rangeEl.setAttribute('aria-valuetext', '第 ' + (step + 1) + ' 帧，共 ' + frames.length + ' 帧');
    stage.setAttribute('aria-label', '第 ' + (step + 1) + ' 帧：' + (f.desc || '').replace(/<[^>]+>/g, ''));
    saveState();
    syncHash();   /* 地址栏跟着走：这样"把第 12 帧发给同学"就只是复制一下地址 */
  }

  /* 上一帧栈深，判断进栈还是出栈 */
  var prevDepth = null;

  /* 入度表：每格一个数 + 游标 */
  function renderInd(f) {
    if (!f.ind) { indPanel.classList.remove('on'); return; }
    indPanel.classList.add('on');
    var vals = f.ind.vals || [], at = f.ind.at;
    indKind.textContent = '共 ' + vals.length + ' 个顶点';
    indBody.innerHTML = '';
    vals.forEach(function (v, i) {
      var d = document.createElement('div');
      d.className = 'ind-cell' + (i === at ? ' on' : '') + (v === 0 ? ' zero' : '');
      var name = document.createElement('div');
      name.textContent = 'V' + i;
      var num = document.createElement('b');
      num.textContent = String(v);
      d.appendChild(name); d.appendChild(num);
      indBody.appendChild(d);
    });
    indFoot.innerHTML = f.ind.note || '入度为 0 的点才能进栈';
  }

  /* firstarc 单链表画成箭头行 */
  function renderAdj(f) {
    if (!f.g) { dsPanel.classList.remove('on'); return; }
    dsPanel.classList.add('on');
    var g = f.g, adj = {}, i;
    g.verts.forEach(function (x) { adj[x.id] = []; });
    g.edges.forEach(function (e) {
      adj[e[0]].push({ v: e[1], w: e[2] });
      if (!g.directed) adj[e[1]].push({ v: e[0], w: e[2] });
    });
    dsKind.textContent = (g.directed ? '有向图' : '无向图') + ' · V=' + g.verts.length + ' E=' + g.edges.length;

    var sv = f.scan ? f.scan.v : f.cur;
    var sw = f.scan ? f.scan.w : null;
    var mark = f.dsMark;

    dsRows.innerHTML = '';
    g.verts.forEach(function (x) {
      var on = mark ? mark.indexOf(x.id) >= 0 : (x.id === sv);
      var row = document.createElement('div');
      row.className = 'ds-row' + (on ? ' on' : '');

      var box = document.createElement('span');
      box.className = 'ds-v';
      box.textContent = x.id;
      row.appendChild(box);

      var list = adj[x.id] || [];
      if (!list.length) {
        var nl = document.createElement('span');
        nl.className = 'ds-null';
        nl.textContent = '∧';
        row.appendChild(nl);
      }
      list.forEach(function (a) {
        var to = document.createElement('span');
        to.className = 'ds-to';
        to.textContent = '→';
        row.appendChild(to);
        var arc = document.createElement('span');
        arc.className = 'ds-arc' + (x.id === sv && a.v === sw ? ' w' : '');
        arc.textContent = a.w == null ? a.v : (a.v + '·' + a.w);
        row.appendChild(arc);
      });
      if (list.length) {
        var tail = document.createElement('span');
        tail.className = 'ds-null';
        tail.textContent = '∧';
        row.appendChild(tail);
      }
      dsRows.appendChild(row);
    });

    if (f.dsFoot) {
      dsFoot.innerHTML = f.dsFoot;
    } else if (f.scan && f.scan.w != null) {
      dsFoot.innerHTML = '正在扫 <b>' + f.scan.v + '</b> 的邻接表：看到邻居 <b>' + f.scan.w + '</b>';
    } else if (sv != null) {
      dsFoot.innerHTML = '当前顶点 <b>' + sv + '</b> 的邻接表';
    } else {
      dsFoot.innerHTML = '图的存储：顶点表 + 边表';
    }
  }

  function renderStack(st) {
    if (!st) {                       /* 非递归模板：整块面板收起 */
      stackPanel.classList.remove('on');
      prevDepth = null;
      return;
    }
    stackPanel.classList.add('on');
    stackBody.innerHTML = '';
    var n = st.length, H = Math.max(124, maxDepth * BLK + (maxDepth > 0 ? 18 : 0));
    stackBody.style.height = H + 'px';

    if (!n) {
      var em = document.createElement('div');
      em.className = 'sp-empty';
      em.textContent = '空栈';
      stackBody.appendChild(em);
    }
    st.forEach(function (s, k) {
      var d = document.createElement('div');
      d.className = 'sp-b' + (k === n - 1 ? ' top' : '');
      d.textContent = s;
      d.title = s;
      /* 只有刚压进去的那个播动画，否则整页闪 */
      if (k === n - 1 && prevDepth != null && n > prevDepth) d.classList.add('pushed');
      stackBody.appendChild(d);
    });

    /* 栈顶/栈底标注跟着内容 */
    if (n) {
      var groupH = n * BLK_H + (n - 1) * 4;          /* 块总高 */
      var freeTop = (H - 15) - groupH;               /* 上方空出来的高度（padding 7+6 + 底边框 2 = 15） */
      var labTop = document.createElement('div');
      labTop.className = 'sp-lab top';
      labTop.textContent = n === 1 ? '◀ 栈顶 = 栈底' : '◀ 栈顶';
      labTop.style.top = (7 + freeTop - 1) + 'px';
      stackBody.appendChild(labTop);
      if (n > 1) {
        var labBot = document.createElement('div');
        labBot.className = 'sp-lab';
        labBot.textContent = '◀ 栈底';
        labBot.style.bottom = '8px';
        stackBody.appendChild(labBot);
      }
    }

    /* 进栈 / 出栈 提示 */
    stackTag.className = 'sp-tag';
    if (prevDepth != null && n !== prevDepth) {
      stackTag.textContent = n > prevDepth ? '↑ 进栈' : '↓ 出栈';
      stackTag.className = 'sp-tag on ' + (n > prevDepth ? 'push' : 'pop');
    } else {
      stackTag.textContent = '';
    }
    prevDepth = n;

    stackDepth.innerHTML = '栈深 <b>' + n + '</b> / 峰值 ' + maxDepth;
  }

  function go(d) {
    cancelReset();
    var t = step + d;
    if (t < 0) t = 0;
    if (t >= frames.length) t = frames.length - 1;
    if (t === step) return;
    step = t;
    showStep();
  }
  function play() {
    if (timer) { stop(); return; }
    cancelReset();
    /* 停在最后一帧时再点播放，从第 1 帧开始 */
    if (step >= frames.length - 1) { step = 0; showStep(); }
    playBtn.textContent = '暂停';
    playBtn.setAttribute('aria-label', '暂停');
    playBtn.classList.add('playing');
    timer = setInterval(function () {
      if (step >= frames.length - 1) { finish(); return; }
      step++; showStep();
    }, speedDelay());
  }
  /* 播完停在最后一帧，歇一会儿再回开头 */
  function finish() {
    stop();
    resetTimer = setTimeout(function () {
      resetTimer = null;
      step = 0;
      showStep();
    }, Math.max(700, speedDelay()));
  }
  function cancelReset() {
    if (resetTimer) { clearTimeout(resetTimer); resetTimer = null; }
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    playBtn.textContent = '播放';
    playBtn.setAttribute('aria-label', '播放');
    playBtn.classList.remove('playing');
  }

  /* ---------- 事件 ---------- */
  document.getElementById('prev').onclick = function () { stop(); go(-1); };
  document.getElementById('next').onclick = function () { stop(); go(1); };
  playBtn.onclick = play;
  rangeEl.oninput = function () { stop(); cancelReset(); step = +rangeEl.value; showStep(); };
  selEl.onchange = function () {
    var h = pickList[+selEl.value];
    if (h) goto(h.c, h.d);
  };
  speedEl.oninput = function () {
    syncSpeed();
    if (timer) { stop(); play(); }   /* 正在播就按新速度重开定时器 */
  };
  if (filterEl) {
    filterEl.addEventListener('input', function () {
      if (filterTimer) clearTimeout(filterTimer);
      filterTimer = setTimeout(function () { filterTimer = null; setFilter(filterEl.value); }, 120);
    });
  }
  if (shareBtn) shareBtn.onclick = doShare;
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    var typing = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
    /* / 跳搜索框 */
    if (e.key === '/' && !typing) { e.preventDefault(); if (filterEl) filterEl.focus(); return; }
    if (e.key === 'Escape' && filterEl && document.activeElement === filterEl) {
      e.preventDefault(); filterEl.value = ''; setFilter(''); return;
    }
    if (typing) return;   /* 在输入框里按方向键，应该是移动光标而不是翻帧 */
    if (e.key === 'ArrowRight') { e.preventDefault(); stop(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); go(-1); }
    else if (e.code === 'Space') { e.preventDefault(); play(); }
  });

  /* ---------- 进度记忆 ----------
     隐私模式、sandbox、禁用存储都会抛，先探一次能力，之后静默跳过。 */
  var STORE_KEY = 'ds408-anim:progress';
  var canStore = (function () {
    try { return typeof localStorage !== 'undefined' && !!localStorage; } catch (e) { return false; }
  })();
  /* 装配期间不写存储：先 switchChapter(0) 渲染的那一帧会把进度冲成第 1 章第 1 帧。 */
  var booting = true;

  function saveState() {
    if (booting || !canStore) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        chapter: curChap, demo: curDemo,
        caseIdx: caseEl.value === '' ? null : +caseEl.value,
        step: step, speed: speedLevel(), at: Date.now()
      }));
    } catch (e) { /* 写不进去就算了，不影响看动画 */ }
  }

  function readState() {
    if (!canStore) return null;
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { return null; }
  }

  /* 没带 hash 时接着上次的位置（章 → 模板 → 用例 → 帧） */
  function restoreLast() {
    var s = readState();
    if (!s || typeof s.chapter !== 'number' || !CHAP[s.chapter]) return false;
    if (s.speed) { speedEl.value = String(s.speed); syncSpeed(); }
    switchChapter(s.chapter);
    var di = Math.min(Math.max(0, s.demo | 0), CHAP[s.chapter].demos.length - 1);
    load(di, s.caseIdx == null ? null : s.caseIdx);
    if (s.step > 0) { step = Math.min(s.step, frames.length - 1); showStep(); }
    return true;
  }

  function fromHash() {
    var h = location.hash.replace('#', '');
    if (!h) return;
    var parts = h.split('@');
    var cid = parts[0], did = parts[1];
    var ci = -1, di = 0;
    CHAP.forEach(function (c, i) {
      if (c.id === cid) { ci = i; di = Math.max(0, c.demos.findIndex(function (d) { return d.id === did; })); }
    });
    if (ci < 0) return;
    /* hash 优先，残留的搜索词不能挡住跳转 */
    demoQuery = '';
    if (filterEl) filterEl.value = '';
    switchChapter(ci);
    load(di, parts[3] != null ? +parts[3] : null);   /* #章@模板@步@案例 */
    if (parts[2] != null) { step = Math.min(+parts[2], frames.length - 1); showStep(); }
  }
  window.addEventListener('hashchange', fromHash);

  buildTabs();
  syncSpeed();   /* 把档位读数、无障碍文本与初始值对齐 */
  restoreSplit();   /* 上次拖出来的代码区宽度 */
  bindSplitter();
  if (CHAP[0].demos.length) switchChapter(0);
  /* 有 hash 按 hash 走，没有就恢复上次 */
  var hasHash = typeof location !== 'undefined' && location.hash.length > 1;
  if (!hasHash) restoreLast();
  fromHash();
  booting = false;   /* 首屏定位完，之后翻页都能记了 */
  /* 从深链接进来也存一次，否则刷新会退回自己上次的位置。 */
  saveState();


  /* 测试钩子，页面不用 */
  NS.app = {
    chapters: function () {
      return CHAP.map(function (c) { return { id: c.id, name: c.name, demos: c.demos.map(function (d) { return d.id; }) }; });
    },
    select: function (chapter, demo, caseIdx) {
      switchChapter(chapter);
      load(demo, caseIdx == null ? null : caseIdx);
      return frames.length;
    },
    stepTo: function (i) { step = Math.max(0, Math.min(i, frames.length - 1)); showStep(); return step; },
    frames: function () { return frames; },
    state: function () { return { chapter: curChap, demo: curDemo, step: step, frames: frames.length }; },
    /* 速度档位，给测试用 */
    speed: function () {
      return { level: speedLevel(), delay: speedDelay(), steps: SPEED_STEPS.slice(), names: SPEED_NAMES.slice() };
    },
    setSpeed: function (lv) { speedEl.value = String(lv); syncSpeed(); return speedDelay(); },
    /* 播放器，给测试用 */
    play: function () { play(); return !!timer; },
    stop: function () { stop(); return !!timer; },
    playing: function () { return !!timer; },
    playState: function () {
      return { playing: !!timer, label: playBtn.textContent, cls: playBtn.className };
    },
    /* 外壳行为：搜索、地址栏、拖动条 */
    setFilter: function (q) { if (filterEl) filterEl.value = q; setFilter(q); return selEl.children.length; },
    options: function () {
      return Array.prototype.map.call(selEl.children, function (o) { return { value: o.value, text: o.textContent }; });
    },
    hash: function () { syncHashNow(); return location.hash; },
    link: function () { syncHashNow(); return fullLink(); },
    codeWidth: function () { return splitW; },
    setCodeWidth: function (w) { applySplit(w); saveSplit(); return splitW; }
  };
})(window.DSANIM = window.DSANIM || {});
