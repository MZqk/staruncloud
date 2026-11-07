const filters = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('[data-category]');
const count = document.getElementById('project-count');
const year = document.getElementById('year');
const grid = typeof document.querySelector === 'function'
  ? document.querySelector('.project-grid')
  : null;

for (const filter of filters) {
  filter.addEventListener('click', () => {
    for (const button of filters) {
      button.setAttribute('aria-pressed', String(button === filter));
    }

    let visible = 0;
    for (const card of cards) {
      card.hidden = filter.dataset.filter !== 'all' && card.dataset.category !== filter.dataset.filter;
      if (!card.hidden) visible += 1;
    }

    count.textContent = `${visible} 个项目，等你探索`;

    // Replay the arrival stagger on every filter change, then drop the class
    // so the resting grid carries no animation state.
    if (grid && typeof grid.classList?.add === 'function') {
      grid.classList.remove('is-filtering');
      void grid.offsetWidth;
      grid.classList.add('is-filtering');
      if (typeof grid.addEventListener === 'function') {
        grid.addEventListener('animationend', () => grid.classList.remove('is-filtering'), { once: true });
      }
    }
  });
}

year.textContent = String(new Date().getFullYear());
