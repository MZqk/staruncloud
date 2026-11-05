import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const projectTags = [...html.matchAll(/<a\b[^>]*\bdata-category="([^"]+)"[^>]*>/g)];

test('all six project cards use the requested production destinations', () => {
  const destinations = projectTags.map(([tag]) => tag.match(/\bhref="([^"]+)"/)[1]);
  assert.deepEqual(destinations.sort(), [
    'https://astra.starun.cloud/',
    'https://starun.cloud/telescope',
    'https://github.com/MZqk/StarunClient',
    'https://github.com/MZqk/deepsky-skill',
    'https://github.com/MZqk/StarunAndroid',
    'https://starun.cloud/map',
  ].sort());
});

test('filters show the correct projects and restore all six cards', () => {
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

  for (const [filter, expected] of [['processing', 3], ['planning', 2], ['skills', 1], ['all', 6]]) {
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
