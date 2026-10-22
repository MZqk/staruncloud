const filters = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('[data-category]');
const count = document.getElementById('project-count');

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
  });
}

document.getElementById('year').textContent = String(new Date().getFullYear());
