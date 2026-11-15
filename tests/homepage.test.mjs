import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const notFound = readFileSync(new URL('../dist/404.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const projectTags = [...html.matchAll(/<a\b[^>]*\bdata-category="([^"]+)"[^>]*>/g)];

test('all seven project cards use the requested production destinations', () => {
  const destinations = projectTags.map(([tag]) => tag.match(/\bhref="([^"]+)"/)[1]);
  assert.deepEqual(destinations.sort(), [
    'https://astra.starun.cloud/',
    'https://starun.cloud/telescope',
    'https://github.com/MZqk/StarunClient',
    'https://github.com/MZqk/deepsky-skill',
    'https://github.com/MZqk/StarunAndroid',
    'https://starun.cloud/map',
    'https://starun.cloud/motion/',
  ].sort());
});

test('the 404 page stays out of search and points back to the site', () => {
  assert.match(notFound, /<meta name="robots" content="noindex">/);
  assert.match(notFound, /id="missing-path"/);
  for (const destination of [
    'href="/"',
    'href="/#projects"',
    'href="https://astra.starun.cloud/"',
    'href="/telescope"',
    'href="/motion/"',
    'href="/map"',
  ]) {
    assert.ok(notFound.includes(destination), `404 page should link to ${destination}`);
  }
});

test('filters show the correct projects and restore all seven cards', () => {
  const filters = [...html.matchAll(/<button\b[^>]*data-filter="([^"]+)"/g)].map(([, filter]) => ({
    dataset: { filter },
    setAttribute(name, value) { this[name] = value; },
    addEventListener(event, listener) { assert.equal(event, 'click'); this.click = listener; },
  }));
  const cards = projectTags.map(([, category]) => ({ dataset: { category }, hidden: false }));
  const count = {};
  const year = {};
  runInNewContext(script, {
    document: {
      querySelectorAll: (selector) => selector === '[data-filter]' ? filters : cards,
      getElementById: (id) => id === 'year' ? year : count,
    },
  });

  for (const [filter, expected] of [['processing', 4], ['planning', 2], ['skills', 1], ['all', 7]]) {
    const active = filters.find((button) => button.dataset.filter === filter);
    active.click();
    assert.equal(cards.filter((card) => !card.hidden).length, expected);
    for (const card of cards) {
      assert.equal(card.hidden, filter !== 'all' && card.dataset.category !== filter);
    }
    assert.equal(count.textContent, `${expected} 个项目，等你探索`);
    assert.equal(filters.filter((button) => button['aria-pressed'] === 'true').length, 1);
    assert.equal(active['aria-pressed'], 'true');
  }
  assert.equal(year.textContent, String(new Date().getFullYear()));
});

test('carousel markup exposes valid region, live status, prev/next buttons, and nav markers', () => {
  assert.match(html, /id="project-deck"[^>]*\brole="region"/);
  assert.match(html, /id="project-deck"[^>]*\baria-roledescription="carousel"/);
  assert.doesNotMatch(html, /id="project-deck"[^>]*\btabindex="0"/);
  assert.match(html, /id="deck-status"[^>]*\brole="status"[^>]*\baria-live="polite"/);
  assert.match(html, /<button\b[^>]*\bdata-deck-prev\b[^>]*\baria-label="上一个项目"/);
  assert.match(html, /<button\b[^>]*\bdata-deck-next\b[^>]*\baria-label="下一个项目"/);
  assert.match(html, /<nav\b[^>]*class="deck__dots"[^>]*\baria-label="选择项目"/);
  assert.doesNotMatch(html, /class="deck__dots"[^>]*\brole="tablist"/);
});

function createDeckHarness() {
  const doc = { activeElement: null };

  function makeElement(tagName, attrs = {}) {
    const listeners = new Map();
    const attrMap = new Map(Object.entries(attrs).map(([k, v]) => [k, String(v)]));
    const dataset = {};
    for (const [k, v] of attrMap) {
      if (k.startsWith('data-')) {
        const camel = k.slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
        dataset[camel] = v;
      }
    }
    const classes = new Set((attrMap.get('class') || '').split(/\s+/).filter(Boolean));
    const el = {
      tagName: tagName.toUpperCase(),
      hidden: false,
      disabled: false,
      type: attrMap.get('type') || '',
      dataset,
      children: [],
      _textContent: '',
      get textContent() {
        return this._textContent;
      },
      set textContent(val) {
        this._textContent = String(val);
      },
      get innerHTML() {
        return '';
      },
      set innerHTML(val) {
        if (val === '') this.children = [];
      },
      get className() {
        return [...classes].join(' ');
      },
      set className(val) {
        classes.clear();
        for (const cls of String(val).split(/\s+/).filter(Boolean)) classes.add(cls);
      },
      classList: {
        contains: (name) => classes.has(name),
        toggle(name, force) {
          if (force === undefined) {
            if (classes.has(name)) { classes.delete(name); return false; }
            classes.add(name); return true;
          }
          if (force) classes.add(name);
          else classes.delete(name);
          return Boolean(force);
        },
      },
      setAttribute(name, value) {
        attrMap.set(name, String(value));
        if (name.startsWith('data-')) {
          const camel = name.slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
          dataset[camel] = String(value);
        }
      },
      getAttribute(name) {
        if (name.startsWith('data-')) {
          const camel = name.slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
          if (Object.prototype.hasOwnProperty.call(dataset, camel)) return dataset[camel];
        }
        return attrMap.has(name) ? attrMap.get(name) : null;
      },
      removeAttribute(name) {
        attrMap.delete(name);
        if (name.startsWith('data-')) {
          const camel = name.slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
          delete dataset[camel];
        }
      },
      appendChild(child) {
        this.children.push(child);
        return child;
      },
      addEventListener(event, listener) {
        if (!listeners.has(event)) listeners.set(event, []);
        listeners.get(event).push(listener);
      },
      dispatch(event, eventObj = {}) {
        const evt = {
          defaultPrevented: false,
          preventDefault() { this.defaultPrevented = true; },
          stopPropagation() {},
          target: el,
          ...eventObj,
        };
        for (const listener of listeners.get(event) || []) listener(evt);
        return evt;
      },
      focus() {
        doc.activeElement = el;
      },
      closest() {
        return null;
      },
      querySelector(sel) {
        if (sel === 'h3, .card__title' || sel === 'h3' || sel === '.card__title') return el._titleEl || null;
        return null;
      },
      getBoundingClientRect() {
        return { left: 0, width: 1000 };
      },
    };
    return el;
  }

  const filterElements = [...html.matchAll(/<button\b[^>]*data-filter="([^"]+)"/g)].map(([, filter]) =>
    makeElement('button', { 'data-filter': filter }),
  );
  const titleMatches = [...html.matchAll(/<a class="card deck__card"[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/g)].map((m) => m[1]);
  assert.equal(titleMatches.length, projectTags.length);
  const cardElements = projectTags.map(([, category], idx) => {
    const card = makeElement('a', { class: 'card deck__card', 'data-category': category });
    const titleEl = makeElement('h3');
    titleEl.textContent = titleMatches[idx];
    card._titleEl = titleEl;
    return card;
  });

  const deck = makeElement('div', { id: 'project-deck', role: 'region', 'aria-roledescription': 'carousel' });
  const stage = makeElement('div', { class: 'deck__stage' });
  const deckControls = makeElement('div', { class: 'deck__controls' });
  const dotsContainer = makeElement('nav', { class: 'deck__dots' });
  const prevBtn = makeElement('button', { class: 'deck__btn', 'data-deck-prev': '' });
  const nextBtn = makeElement('button', { class: 'deck__btn', 'data-deck-next': '' });
  const countEl = makeElement('p', { id: 'project-count' });
  const yearEl = makeElement('span', { id: 'year' });
  const curSpan = makeElement('span', { id: 'deck-cur' });
  const totalSpan = makeElement('span', { id: 'deck-total' });
  const statusEl = makeElement('p', { id: 'deck-status' });

  const byId = {
    'project-count': countEl,
    year: yearEl,
    'deck-cur': curSpan,
    'deck-total': totalSpan,
    'deck-status': statusEl,
    'project-deck': deck,
  };
  const bySelector = {
    '.deck__stage': stage,
    '.deck__controls': deckControls,
    '.deck__dots': dotsContainer,
    '[data-deck-prev]': prevBtn,
    '[data-deck-next]': nextBtn,
  };

  doc.createElement = (tag) => makeElement(tag);
  doc.getElementById = (id) => byId[id] || null;
  doc.querySelector = (sel) => bySelector[sel] || null;
  doc.querySelectorAll = (sel) => {
    if (sel === '[data-filter]') return filterElements;
    if (sel === '[data-category]' || sel === '.deck__card') return cardElements;
    return [];
  };

  runInNewContext(script, { window: {}, document: doc });

  return {
    doc,
    filterElements,
    cardElements,
    deck,
    stage,
    deckControls,
    dotsContainer,
    prevBtn,
    nextBtn,
    curSpan,
    totalSpan,
    statusEl,
  };
}

test('3D carousel controller manages focus, dot identity, hidden card cleanup, and button states', () => {
  const ctx = createDeckHarness();
  const {
    doc,
    filterElements,
    cardElements,
    deck,
    deckControls,
    dotsContainer,
    prevBtn,
    nextBtn,
    curSpan,
    totalSpan,
    statusEl,
  } = ctx;

  // Initial state: 7 cards, only first card is in tab order and exposed to AT
  assert.equal(curSpan.textContent, '1');
  assert.equal(totalSpan.textContent, '7');
  assert.equal(cardElements[0].getAttribute('data-deck-pos'), '0');
  assert.equal(cardElements[0].getAttribute('tabindex'), '0');
  assert.equal(cardElements[0].getAttribute('aria-hidden'), 'false');
  for (let i = 1; i < cardElements.length; i++) {
    assert.equal(cardElements[i].getAttribute('tabindex'), '-1');
    assert.equal(cardElements[i].getAttribute('aria-hidden'), 'true');
  }
  assert.equal(dotsContainer.children.length, 7);
  assert.equal(dotsContainer.children[0].getAttribute('aria-current'), 'true');
  assert.equal(prevBtn.disabled, false);
  assert.equal(nextBtn.disabled, false);

  // Dot click updates active card and preserves dot DOM nodes so focus is not destroyed
  const initialDotRefs = [...dotsContainer.children];
  initialDotRefs[2].focus();
  initialDotRefs[2].dispatch('click');
  assert.equal(dotsContainer.children[2], initialDotRefs[2]);
  assert.equal(doc.activeElement, initialDotRefs[2]);
  assert.equal(curSpan.textContent, '3');
  assert.equal(initialDotRefs[2].getAttribute('aria-current'), 'true');
  assert.equal(initialDotRefs[0].getAttribute('aria-current'), null);
  assert.match(initialDotRefs[2].getAttribute('aria-label'), /切换至第 3 个项目：/);
  assert.equal(statusEl.textContent, `第 3 / 7 项：${cardElements[2]._titleEl.textContent}`);

  // Home / End keys jump directly to first and last card while preserving focus
  deck.dispatch('keydown', { key: 'End' });
  assert.equal(curSpan.textContent, '7');
  assert.equal(doc.activeElement, initialDotRefs[6]);
  deck.dispatch('keydown', { key: 'Home' });
  assert.equal(curSpan.textContent, '1');
  assert.equal(doc.activeElement, initialDotRefs[0]);
  initialDotRefs[2].focus();
  initialDotRefs[2].dispatch('click');

  // ArrowRight when focused on a dot keeps focus advancing across dots
  deck.dispatch('keydown', { key: 'ArrowRight' });
  assert.equal(curSpan.textContent, '4');
  assert.equal(doc.activeElement, initialDotRefs[3]);

  // ArrowRight while focused on the active card transfers focus to the newly centered card
  cardElements[3].focus();
  const arrowRightEvt = deck.dispatch('keydown', { key: 'ArrowRight' });
  assert.equal(arrowRightEvt.defaultPrevented, true);
  assert.equal(cardElements[4].getAttribute('data-deck-pos'), '0');
  assert.equal(cardElements[4].getAttribute('tabindex'), '0');
  assert.equal(cardElements[4].getAttribute('aria-hidden'), 'false');
  assert.equal(cardElements[3].getAttribute('tabindex'), '-1');
  assert.equal(cardElements[3].getAttribute('aria-hidden'), 'true');
  assert.equal(doc.activeElement, cardElements[4]);

  // ArrowLeft returns focus to card 3
  deck.dispatch('keydown', { key: 'ArrowLeft' });
  assert.equal(doc.activeElement, cardElements[3]);

  // Clicking a side card prevents link navigation, centers it, and moves focus to it
  const sideClick = cardElements[5].dispatch('click');
  assert.equal(sideClick.defaultPrevented, true);
  assert.equal(cardElements[5].getAttribute('data-deck-pos'), '0');
  assert.equal(doc.activeElement, cardElements[5]);

  // Clicking the centered card allows normal link navigation
  const centerClick = cardElements[5].dispatch('click');
  assert.equal(centerClick.defaultPrevented, false);

  // Prev/Next buttons keep focus on the button clicked while advancing deck
  nextBtn.focus();
  nextBtn.dispatch('click');
  assert.equal(curSpan.textContent, '7');
  assert.equal(doc.activeElement, nextBtn);

  prevBtn.focus();
  prevBtn.dispatch('click');
  assert.equal(curSpan.textContent, '6');
  assert.equal(doc.activeElement, prevBtn);

  // Filtering strips stale data-deck-pos, tabindex, and aria-hidden from hidden cards
  filterElements.find((b) => b.dataset.filter === 'processing').dispatch('click');
  assert.equal(deck.getAttribute('data-deck-mode'), 'carousel');
  assert.equal(deck.getAttribute('aria-roledescription'), 'carousel');
  assert.equal(deckControls.hidden, false);
  assert.equal(curSpan.textContent, '1');
  assert.equal(totalSpan.textContent, '4');
  assert.equal(dotsContainer.children.length, 4);
  const posZeroCards = cardElements.filter((c) => c.getAttribute('data-deck-pos') === '0');
  assert.equal(posZeroCards.length, 1);
  for (const card of cardElements) {
    if (card.hidden) {
      assert.equal(card.getAttribute('data-deck-pos'), null);
      assert.equal(card.dataset.deckPos, undefined);
      assert.equal(card.getAttribute('tabindex'), '-1');
      assert.equal(card.getAttribute('aria-hidden'), 'true');
    }
  }

  // Pair filter ('planning', 2 items) lays out symmetrically without carousel controls or click hijacking
  filterElements.find((b) => b.dataset.filter === 'planning').dispatch('click');
  assert.equal(deck.getAttribute('data-deck-mode'), 'pair');
  assert.equal(deck.getAttribute('aria-roledescription'), null);
  assert.equal(deckControls.hidden, true);
  assert.equal(totalSpan.textContent, '2');
  const pairVisible = cardElements.filter((c) => !c.hidden);
  assert.equal(pairVisible.length, 2);
  for (const card of pairVisible) {
    assert.equal(card.getAttribute('data-deck-pos'), null);
    assert.equal(card.getAttribute('tabindex'), '0');
    assert.equal(card.getAttribute('aria-hidden'), 'false');
    assert.equal(card.dispatch('click').defaultPrevented, false);
  }

  // Single-item filter switches to showcase mode, hides controls, and disables Prev/Next cleanly
  filterElements.find((b) => b.dataset.filter === 'skills').dispatch('click');
  assert.equal(deck.getAttribute('data-deck-mode'), 'single');
  assert.equal(deck.getAttribute('aria-roledescription'), null);
  assert.equal(deckControls.hidden, true);
  assert.equal(curSpan.textContent, '1');
  assert.equal(totalSpan.textContent, '1');
  assert.equal(prevBtn.disabled, true);
  assert.equal(nextBtn.disabled, true);
  assert.equal(prevBtn.getAttribute('aria-disabled'), 'true');
  assert.equal(nextBtn.getAttribute('aria-disabled'), 'true');
  assert.equal(dotsContainer.children.length, 1);
  const singleVisible = cardElements.filter((c) => !c.hidden);
  assert.equal(singleVisible.length, 1);
  assert.equal(singleVisible[0].getAttribute('data-deck-pos'), null);
  assert.equal(singleVisible[0].getAttribute('tabindex'), '0');
  assert.equal(singleVisible[0].getAttribute('aria-hidden'), 'false');
  assert.equal(singleVisible[0].dispatch('click').defaultPrevented, false);

  // Restoring 'all' restores carousel mode, shows controls, re-enables Prev/Next, and shows all 7 cards cleanly
  filterElements.find((b) => b.dataset.filter === 'all').dispatch('click');
  assert.equal(deck.getAttribute('data-deck-mode'), 'carousel');
  assert.equal(deck.getAttribute('aria-roledescription'), 'carousel');
  assert.equal(deckControls.hidden, false);
  assert.equal(totalSpan.textContent, '7');
  assert.equal(prevBtn.disabled, false);
  assert.equal(nextBtn.disabled, false);
  assert.equal(dotsContainer.children.length, 7);
});

test('distilled navigation and hero omit duplicate workflow band and redundant caption note', () => {
  assert.doesNotMatch(html, /#workflow|id="workflow"|class="paths"/);
  assert.doesNotMatch(notFound, /#workflow|探索路径/);
  assert.doesNotMatch(html, /class="plate__note"/);
  assert.match(html, /<link\b[^>]*rel="preload"[^>]*fetchpriority="high"/);
  const centerCard = html.match(/<a\b[^>]*data-deck-pos="0"[\s\S]*?<\/a>/)?.[0] || '';
  assert.doesNotMatch(centerCard, /loading="lazy"/);
});

test('polished naming, parallel stylesheets, DESIGN.md alignment, and orphan-safe typography', () => {
  const styles = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
  const tokens = readFileSync(new URL('../dist/tokens.css', import.meta.url), 'utf8');
  const base = readFileSync(new URL('../dist/base.css', import.meta.url), 'utf8');

  // Parallel stylesheet links and zero CSS @import waterfall
  for (const docHtml of [html, notFound]) {
    assert.match(docHtml, /href="\/?tokens\.css"[\s\S]*href="\/?base\.css"[\s\S]*href="\/?styles\.css"/);
  }
  assert.doesNotMatch(styles, /@import/);

  // Cross-page unified names and categorized 404 groups
  for (const unifiedName of ['Starun 网页版', 'Starun 桌面端', 'Starun 手机端', 'deepsky-motion 深空视差', '智能望远镜对照表', '找一片更暗的天空', 'DeepSky Skills']) {
    assert.ok(html.includes(unifiedName), `homepage should include unified project name: ${unifiedName}`);
    assert.ok(notFound.includes(unifiedName), `404 page should include unified project name: ${unifiedName}`);
  }
  assert.doesNotMatch(html + notFound, /在线后期|安卓端/);
  assert.match(notFound, /class="lost__groups"/);
  assert.equal([...notFound.matchAll(/class="lost__group-title"/g)].length, 3);

  // Tonal Silence Rule & token consistency
  assert.doesNotMatch(styles, /box-shadow:/);
  assert.doesNotMatch(styles, /--dur-fast/);
  assert.doesNotMatch(tokens, /Liberation Mono/);
  assert.doesNotMatch(base, /\[data-slot\]/);
  assert.match(base, /h2\s*\{[^}]*line-height:\s*1\.14/);

  // About heading prevents lone "法。" orphan wrap and hero abbr tooltips stay crisp
  assert.match(html, /id="about-title"[\s\S]*<span class="keep">想法。<\/span>/);
  assert.match(styles, /\.about h2\s*\{[^}]*max-width:\s*24ch/);
  assert.match(html, /id="hero-title"[\s\S]*<abbr\b[^>]*>FITS<\/abbr>[\s\S]*<abbr\b[^>]*>XISF<\/abbr>/);

  // Hero interactive specimen delivers synchronous paired linear & stretched layers with accessible slider
  assert.match(html, /src="assets\/r\/hero-stretched-1200\.jpg"[\s\S]*?fetchpriority="high"\s+decoding="sync"/);
  assert.match(html, /src="assets\/r\/hero-linear-1200\.jpg"[\s\S]*?decoding="sync"/);
  assert.match(html, /type="range"[^>]*id="plate-split"[^>]*min="0"[^>]*max="100"/);
  assert.doesNotMatch(html, /合成插画|hero-plate-/);
  assert.match(html, /Seestar S30 Pro 实拍玫瑰星云 C 50/);
  assert.doesNotMatch(styles, /\.plate__frame[\s\S]*?mix-blend-mode:\s*lighten/);
  assert.doesNotMatch(styles, /\.plate__frame[\s\S]*?saturate\(0\.45\)/);
  assert.match(styles, /\.plate__frame\s*\{[^}]*border-radius:\s*var\(--radius-card\)/);
  assert.match(styles, /\.plate__layer--linear\s*\{[^}]*clip-path:\s*inset\(/);

  // Critique P1/P2 fixes: web-first order, flank titles visible on pos ±1, MACOS casing fixed, full-width 404 group underline
  const cardOrder = [...html.matchAll(/<a class="card deck__card"[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/g)].map((m) => m[1]);
  assert.deepEqual(cardOrder, [
    'Starun 网页版',
    'deepsky-motion 深空视差',
    '智能望远镜对照表',
    'Starun 桌面端',
    'Starun 手机端',
    'DeepSky Skills',
    '找一片更暗的天空',
  ]);
  assert.match(styles, /\.chip\[aria-pressed="true"\]\s*\{[^}]*border-color:\s*var\(--color-accent\)/);
  assert.match(styles, /\.chip\[aria-pressed="true"\]\s+span\s*\{[^}]*--color-accent/);
  assert.match(styles, /\.deck\[data-deck-mode="carousel"\]\s+\.deck__card:is\(\[data-deck-pos="1"\],\s*\[data-deck-pos="-1"\]\)\s+\.card__body\s*>\s*:not\(\.card__badge\):not\(h3\)/);
  assert.doesNotMatch(styles, /\.card__badge\s*\{[^}]*text-transform:\s*uppercase/);
  assert.match(styles, /\.lost__group-title\s*\{[^}]*max-width:\s*none;\s*width:\s*100%/);
  assert.match(styles, /\.mast::before\s*\{[^}]*var\(--color-paper\)\s+74%/);
  assert.doesNotMatch(styles, /scroll-margin-top:/);
  assert.match(styles, /@media\s*\(max-width:\s*48rem\)[\s\S]*html\s*\{\s*scroll-padding-top:\s*80px;\s*\}/);
  assert.match(styles, /@media\s*\(max-width:\s*48rem\)[\s\S]*\.deck__controls\s*\{[^}]*margin-top:\s*var\(--space-sm\)/);

  // Adapt P2: symmetric mobile header pill centering, header gradient scrim, and viewport-fit=cover
  for (const docHtml of [html, notFound]) {
    assert.match(docHtml, /name="viewport"[^>]*viewport-fit=cover/);
  }
  assert.match(styles, /\.mast::before\s*\{[^}]*pointer-events:\s*none;[^}]*linear-gradient\(/);
  assert.match(styles, /@media\s*\(max-width:\s*48rem\)[\s\S]*\.mast__inner\s*\{\s*justify-content:\s*center;\s*\}/);

  // Final polish: cross-page CTA consistency, harmonized disabled states, and inline 404 code pill
  assert.ok(notFound.includes('看看有哪些工具'));
  assert.doesNotMatch(notFound, /看看有哪些项目/);
  assert.match(styles, /\.deck__btn:disabled\s*\{[^}]*opacity:\s*0\.55;[^}]*transform:\s*none;/);
  assert.match(styles, /\.chip:disabled\s*\{[^}]*opacity:\s*0\.55;[^}]*transform:\s*none;/);
  assert.match(styles, /\.lost__body\s+code\s*\{[^}]*padding:\s*var\(--space-3xs\)\s+var\(--space-xs\)/);
});

test('3D carousel handles circular wrapping, flank clicks, touch swipes, keyboard guards, and filter reset', () => {
  const {
    filterElements,
    cardElements,
    deck,
    stage,
    prevBtn,
    nextBtn,
    curSpan,
    statusEl,
  } = createDeckHarness();

  // Verify initial circular positions around activeIndex = 0 across 7 cards
  assert.deepEqual(
    cardElements.map((c) => c.getAttribute('data-deck-pos')),
    ['0', '1', '2', '3', '-3', '-2', '-1'],
  );

  // Prev wraps backward from 1 -> 7 and Next wraps forward from 7 -> 1
  prevBtn.dispatch('click');
  assert.equal(curSpan.textContent, '7');
  assert.equal(cardElements[6].getAttribute('data-deck-pos'), '0');
  assert.equal(cardElements[0].getAttribute('data-deck-pos'), '1');
  nextBtn.dispatch('click');
  assert.equal(curSpan.textContent, '1');
  assert.equal(cardElements[0].getAttribute('data-deck-pos'), '0');

  // Stage flank click (> 0.58 => next, < 0.42 => prev, middle dead-zone & NaN => no-op)
  deck.dispatch('click', { clientX: 700, target: { closest: () => null } });
  assert.equal(curSpan.textContent, '2');
  deck.dispatch('click', { clientX: 500, target: { closest: () => null } });
  assert.equal(curSpan.textContent, '2');
  deck.dispatch('click', { clientX: Number.NaN, target: { closest: () => null } });
  assert.equal(curSpan.textContent, '2');
  deck.dispatch('click', { clientX: 100, target: { closest: () => null } });
  assert.equal(curSpan.textContent, '1');
  deck.dispatch('click', { clientX: 900, target: { closest: (sel) => sel === '.deck__card' ? cardElements[1] : null } });
  assert.equal(curSpan.textContent, '1');

  // Touch swipe thresholds (> 40px left => next, > 40px right => prev, <= 40px tap => no-op)
  stage.dispatch('touchstart', { changedTouches: [{ screenX: 220 }] });
  stage.dispatch('touchend', { changedTouches: [{ screenX: 150 }] });
  assert.equal(curSpan.textContent, '2');
  stage.dispatch('touchstart', { changedTouches: [{ screenX: 200 }] });
  stage.dispatch('touchend', { changedTouches: [{ screenX: 220 }] });
  assert.equal(curSpan.textContent, '2');
  stage.dispatch('touchstart', { changedTouches: [{ screenX: 100 }] });
  stage.dispatch('touchend', { changedTouches: [{ screenX: 180 }] });
  assert.equal(curSpan.textContent, '1');

  // Non-arrow keydown passes through without preventing default
  assert.equal(deck.dispatch('keydown', { key: 'Enter' }).defaultPrevented, false);
  assert.equal(deck.dispatch('keydown', { key: 'Escape' }).defaultPrevented, false);

  // Filter change resets activeIndex to 0 and disables carousel navigation in < 3 item modes
  nextBtn.dispatch('click');
  nextBtn.dispatch('click');
  assert.equal(curSpan.textContent, '3');
  filterElements.find((b) => b.dataset.filter === 'planning').dispatch('click');
  assert.equal(curSpan.textContent, '1');
  assert.equal(deck.dispatch('keydown', { key: 'ArrowRight' }).defaultPrevented, false);
  deck.dispatch('click', { clientX: 800, target: { closest: () => null } });
  assert.equal(curSpan.textContent, '1');
  stage.dispatch('touchstart', { changedTouches: [{ screenX: 200 }] });
  stage.dispatch('touchend', { changedTouches: [{ screenX: 100 }] });
  assert.equal(curSpan.textContent, '1');

  // Hidden card clicks are safely prevented
  const hiddenCard = cardElements.find((c) => c.hidden);
  assert.ok(hiddenCard);
  assert.equal(hiddenCard.dispatch('click').defaultPrevented, true);
  assert.match(statusEl.textContent, /第 \d+ \/ 7 项/);
});

test('404 inline script displays missing URL path+query and current year safely', () => {
  const inlineScript = notFound.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(inlineScript, '404 page should contain inline script');

  const missingPathEl = { textContent: '' };
  const yearEl = { textContent: '' };
  runInNewContext(inlineScript, {
    location: { pathname: '/old/tool', search: '?from=bookmarks' },
    document: {
      getElementById: (id) => id === 'missing-path' ? missingPathEl : id === 'year' ? yearEl : null,
    },
  });

  assert.equal(missingPathEl.textContent, '/old/tool?from=bookmarks');
  assert.equal(yearEl.textContent, String(new Date().getFullYear()));
});

test('dist audit: zero leftover build debris, zero unused nebula assets, valid asset files, and intentional reduced motion', () => {
  const distDir = new URL('../dist/', import.meta.url);
  const base = readFileSync(new URL('../dist/base.css', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');

  // Deploy root must not hold tooling artifacts or unreferenced nebula imagery
  assert.equal(existsSync(new URL('.hallmark', distDir)), false, 'dist/.hallmark should not exist in deploy root');
  assert.equal(existsSync(new URL('assets/nebula.jpg', distDir)), false, 'unused assets/nebula.jpg should be removed');
  const responsiveAssets = readdirSync(new URL('assets/r', distDir));
  assert.equal(responsiveAssets.some((name) => name.startsWith('nebula-')), false, 'unused assets/r/nebula-* should be removed');

  // Every local asset referenced in index.html & 404.html exists on disk
  for (const attrMatch of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const ref = attrMatch[1];
    if (/^(https?:|#)/.test(ref)) continue;
    assert.equal(existsSync(new URL(ref, distDir)), true, `index.html missing local file: ${ref}`);
  }
  for (const setMatch of html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)) {
    for (const part of setMatch[1].split(',')) {
      const ref = part.trim().split(/\s+/)[0];
      assert.equal(existsSync(new URL(ref, distDir)), true, `index.html missing srcset file: ${ref}`);
    }
  }
  for (const attrMatch of notFound.matchAll(/(?:src|href)="(\/assets\/[^"]+|\/(?:tokens|base|styles)\.css)"/g)) {
    const ref = attrMatch[1].slice(1);
    assert.equal(existsSync(new URL(ref, distDir)), true, `404.html missing static file: ${ref}`);
  }

  // Global 0.01ms blanket transition override is absent; spatial motion reduction preserves state transitions
  assert.doesNotMatch(base, /0\.01ms\s*!important/);
  assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.deck__card[\s\S]*opacity/);
});

test('clarified project cards expose real platform expectations, specific CTAs, and authentic alt descriptions', () => {
  assert.doesNotMatch(html, /提交记录与文件列表/);
  assert.doesNotMatch(html, /class="card__cta">查看仓库/);
  assert.match(html, /id="pc-title"[\s\S]*?macOS 14\+[\s\S]*?源码构建[\s\S]*?GitHub 源码与打包指南/);
  assert.match(html, /id="mobile-title"[\s\S]*?Android 9\+[\s\S]*?无联网权限[\s\S]*?源码构建 APK[\s\S]*?GitHub 源码与模型指引/);
  assert.match(html, /id="skills-title"[\s\S]*?npx skills add MZqk\/deepsky-skill[\s\S]*?Siril 1\.4\+[\s\S]*?GitHub 获取技能与文档/);
  assert.match(html, /id="about-title"[\s\S]*?https:\/\/github\.com\/MZqk/);
  assert.match(notFound, /https:\/\/github\.com\/MZqk/);
});

test('interactive hero specimen slider updates CSS --split, readout ratio, and aria-valuetext', () => {
  const plateFrame = {
    props: new Map(),
    style: {
      setProperty(k, v) { plateFrame.props.set(k, v); },
    },
  };
  const plateRatio = { textContent: '' };
  const attrs = new Map();
  const listeners = new Map();
  const plateSplit = {
    value: '43',
    closest: (sel) => (sel === '.plate__frame' ? plateFrame : null),
    setAttribute: (k, v) => attrs.set(k, v),
    getAttribute: (k) => attrs.get(k),
    addEventListener: (ev, fn) => listeners.set(ev, fn),
  };
  runInNewContext(script, {
    document: {
      querySelectorAll: () => [],
      getElementById: (id) => id === 'plate-split' ? plateSplit : id === 'plate-ratio' ? plateRatio : null,
    },
  });

  assert.equal(plateFrame.props.get('--split'), '43%');
  assert.equal(plateRatio.textContent, '43% / 57%');
  assert.equal(plateSplit.getAttribute('aria-valuetext'), '线性原片占 43%，拉伸成片占 57%');

  plateSplit.value = '78';
  listeners.get('input')();
  assert.equal(plateFrame.props.get('--split'), '78%');
  assert.equal(plateRatio.textContent, '78% / 22%');
  assert.equal(plateSplit.getAttribute('aria-valuetext'), '线性原片占 78%，拉伸成片占 22%');
});
