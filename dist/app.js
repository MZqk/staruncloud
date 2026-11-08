const filters = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('[data-category]');
const count = document.getElementById('project-count');
const year = document.getElementById('year');

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

year.textContent = String(new Date().getFullYear());

// 3D Layered Carousel Deck Controller
if (typeof window !== 'undefined' && typeof document?.querySelector === 'function') {
  const stage = document.querySelector('.deck__stage');
  const deckCards = Array.from(document.querySelectorAll('.deck__card'));
  const dotsContainer = document.querySelector('.deck__dots');
  const curSpan = document.getElementById('deck-cur');
  const totalSpan = document.getElementById('deck-total');
  const deck = document.getElementById('project-deck');

  let activeIndex = 0;

  function getVisibleCards() {
    return deckCards.filter((card) => !card.hidden);
  }

  function getCircularPos(idx, active, total) {
    if (total <= 1) return 0;
    if (total === 2) {
      return idx === active ? 0 : 1;
    }
    let diff = idx - active;
    if (diff > total / 2) {
      diff -= total;
    } else if (diff < -total / 2) {
      diff += total;
    }
    return diff;
  }

  function update() {
    const visibleCards = getVisibleCards();
    if (visibleCards.length === 0) return;

    if (activeIndex >= visibleCards.length) {
      activeIndex = 0;
    }

    visibleCards.forEach((card, idx) => {
      const pos = getCircularPos(idx, activeIndex, visibleCards.length);
      card.dataset.deckPos = String(pos);
      card.setAttribute('tabindex', pos === 0 ? '0' : '-1');
      card.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
    });

    if (curSpan) curSpan.textContent = String(activeIndex + 1);
    if (totalSpan) totalSpan.textContent = String(visibleCards.length);

    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      visibleCards.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'deck__dot' + (idx === activeIndex ? ' is-active' : '');
        dot.setAttribute('aria-label', `切换至第 ${idx + 1} 个项目`);
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          activeIndex = idx;
          update();
        });
        dotsContainer.appendChild(dot);
      });
    }
  }

  function prev() {
    const visibleCards = getVisibleCards();
    if (visibleCards.length <= 1) return;
    activeIndex = (activeIndex - 1 + visibleCards.length) % visibleCards.length;
    update();
  }

  function next() {
    const visibleCards = getVisibleCards();
    if (visibleCards.length <= 1) return;
    activeIndex = (activeIndex + 1) % visibleCards.length;
    update();
  }

  // Click card to switch: clicking side cards centers them; clicking center card opens destination
  deckCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      const pos = Number(card.dataset.deckPos);
      if (pos !== 0) {
        e.preventDefault();
        e.stopPropagation();
        const visibleCards = getVisibleCards();
        const targetIndex = visibleCards.indexOf(card);
        if (targetIndex !== -1) {
          activeIndex = targetIndex;
          update();
        }
      }
    });
  });

  // Stage flank clicks: clicking to the left or right of center advances or rewinds
  if (deck) {
    deck.addEventListener('click', (e) => {
      if (e.target.closest('.deck__card') || e.target.closest('.deck__controls') || e.target.closest('.chips')) {
        return;
      }
      const rect = deck.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX > rect.width * 0.58) {
        next();
      } else if (clickX < rect.width * 0.42) {
        prev();
      }
    });
  }

  // Keyboard navigation
  if (deck) {
    deck.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      }
    });
  }

  // Touch swipe support
  if (stage) {
    let touchStartX = 0;
    stage.addEventListener('touchstart', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].screenX;
      }
    }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) prev();
          else next();
        }
      }
    }, { passive: true });
  }

  // Filter change resets active index to 0
  for (const filter of filters) {
    filter.addEventListener('click', () => {
      activeIndex = 0;
      update();
    });
  }

  update();
}
