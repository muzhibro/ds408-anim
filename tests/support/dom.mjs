/* 一个只够这个页面用的 DOM 替身。
 *
 * 目的：让 tests/ui-smoke.test.mjs 能在 node 里把 38 个模板、69 个用例的每一帧
 * 都真的渲染一遍，而不需要 jsdom（项目坚持零依赖、可离线构建）。
 *
 * 支持的接口正是 src/ui 里实际用到的那些：createElement / createElementNS /
 * createTextNode / getElementById / appendChild（返回子节点）/ setAttribute /
 * classList / dataset / style / textContent / innerHTML / querySelector(All)。
 * 不支持的接口会被 Proxy 兜住并记录，测试结束时报出来，避免"假通过"。
 */

export class TextNode {
  constructor(text) {
    this.nodeType = 3;
    this.nodeValue = String(text);
    this.parentNode = null;
  }
  get textContent() { return this.nodeValue; }
  set textContent(v) { this.nodeValue = String(v); }
  get lastChild() { return null; }
  get dataset() { return undefined; }
}

const VOID_TAGS = new Set(['input', 'br', 'img']);

export class El {
  constructor(tag, doc) {
    this.nodeType = 1;
    this.tagName = tag;
    this.localName = tag;
    this.ownerDocument = doc;
    this.children = [];
    this.parentNode = null;
    this.attrs = new Map();
    this.dataset = {};
    this.style = {};
    this._classes = new Set();
    this._text = '';
    this._html = '';
    this.value = '';
    this.max = '';
    this.min = '';
    this.onclick = null;
    this.oninput = null;
    this.onchange = null;
    /* 布局相关的属性一律给 0：绘制与滚动逻辑读到它们不会崩，也不会真的滚动 */
    this.offsetTop = 0;
    this.offsetLeft = 0;
    this.offsetParent = null;
    this.scrollTop = 0;
    this.clientHeight = 0;
    this.clientWidth = 0;
    this.scrollHeight = 0;
    this._listeners = {};
    const self = this;
    this.classList = {
      add(...names) { names.forEach((n) => self._classes.add(n)); },
      remove(...names) { names.forEach((n) => self._classes.delete(n)); },
      contains(n) { return self._classes.has(n); },
      toggle(n, force) {
        const on = force === undefined ? !self._classes.has(n) : !!force;
        if (on) self._classes.add(n); else self._classes.delete(n);
        return on;
      }
    };
  }

  get className() { return [...this._classes].join(' '); }
  set className(v) {
    this._classes = new Set(String(v).split(/\s+/).filter(Boolean));
  }

  setAttribute(k, v) {
    if (k === 'class') { this.className = v; return; }
    this.attrs.set(k, String(v));
    if (k.startsWith('data-')) this.dataset[k.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = String(v);
  }
  getAttribute(k) {
    if (k === 'class') return this.className;
    if (this.attrs.has(k)) return this.attrs.get(k);
    if (k.startsWith('data-')) {
      const key = k.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase());
      const v = this.dataset[key];
      return v == null ? null : String(v);
    }
    return null;
  }
  removeAttribute(k) { this.attrs.delete(k); }

  appendChild(child) {
    if (child && child.parentNode) {
      const i = child.parentNode.children.indexOf(child);
      if (i >= 0) child.parentNode.children.splice(i, 1);
    }
    this.children.push(child);
    if (child) child.parentNode = this;
    this._html = '';
    return child;
  }
  removeChild(child) {
    const i = this.children.indexOf(child);
    if (i >= 0) { this.children.splice(i, 1); child.parentNode = null; }
    return child;
  }
  insertBefore(child, ref) {
    const i = ref ? this.children.indexOf(ref) : -1;
    if (i < 0) return this.appendChild(child);
    this.children.splice(i, 0, child);
    child.parentNode = this;
    return child;
  }

  get firstChild() { return this.children[0] || null; }
  get lastChild() { return this.children[this.children.length - 1] || null; }

  get textContent() {
    if (this.children.length) return this.children.map((c) => c.textContent).join('');
    return this._text;
  }
  set textContent(v) {
    this.children = [];
    this._text = String(v == null ? '' : v);
  }
  get innerHTML() { return this._html; }
  set innerHTML(v) {
    if (v === '') { this.children = []; this._text = ''; }
    this._html = String(v);
  }

  addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); }
  removeEventListener(type, fn) {
    const a = this._listeners[type] || [];
    const i = a.indexOf(fn);
    if (i >= 0) a.splice(i, 1);
  }
  dispatch(type, ev) { (this._listeners[type] || []).forEach((fn) => fn(ev || {})); }

  /* --- 选择器：只实现本页用到的 .cls / .cls.cls / .cls[data-x="v"] --- */
  _matches(sel) {
    const m = /^([a-zA-Z]+)?((?:\.[\w-]+)*)(?:\[([\w-]+)(?:="([^"]*)")?\])?$/.exec(sel);
    if (!m) return false;
    if (m[1] && m[1] !== this.tagName) return false;
    for (const cls of m[2].split('.').filter(Boolean)) if (!this._classes.has(cls)) return false;
    if (m[3]) {
      const want = this.getAttribute(m[3]);
      const got = m[3].startsWith('data-') && want == null
        ? this.dataset[m[3].slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase())]
        : want;
      if (m[4] === undefined) { if (got == null) return false; }
      else if (String(got) !== m[4]) return false;
    }
    return true;
  }
  _walk(out) {
    for (const c of this.children) {
      if (c.nodeType !== 1) continue;
      out.push(c);
      c._walk(out);
    }
    return out;
  }
  querySelectorAll(sel) { return this._walk([]).filter((n) => n._matches(sel.trim())); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  focus() {}
  scrollIntoView() {}
}

/* 页面启动后要能按 id 拿到同一批元素，所以 getElementById 需要缓存 */
export function createDocument() {
  const doc = {
    _byId: new Map(),
    createElement: (tag) => new El(tag, doc),
    createElementNS: (ns, tag) => new El(tag, doc),
    createTextNode: (t) => new TextNode(t),
    getElementById(id) {
      if (!this._byId.has(id)) {
        const el = new El(VOID_TAGS.has(id) ? 'input' : 'div', doc);
        el.id = id;
        el.attrs.set('id', id);
        /* 真实页面里这些元素都挂在 body 下，代码会顺着 parentNode 找外层容器 */
        this.body.appendChild(el);
        this._byId.set(id, el);
      }
      return this._byId.get(id);
    },
    addEventListener() {},
    querySelector: () => null,
    querySelectorAll: () => []
  };
  doc.body = new El('body', doc);
  return doc;
}
