const filters = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('[data-category]');
const count = document.getElementById('project-count');
const year = document.getElementById('year');

let onFilterChange = null;

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

    if (count) {
      count.textContent = `${visible} 个项目，等你探索`;
    }
    onFilterChange?.();
  });
}

if (year) {
  year.textContent = String(new Date().getFullYear());
}

// Interactive Hero Specimen Split Slider (Seestar S30 Pro C 50 linear vs stretched)
const plateSplit = document.getElementById('plate-split');
if (plateSplit && typeof plateSplit.addEventListener === 'function') {
  const plateFrame = plateSplit.closest?.('.plate__frame') || document.querySelector?.('.plate__frame');
  const plateRatio = document.getElementById('plate-ratio');

  function syncPlateSplit() {
    const val = Math.min(100, Math.max(0, Number(plateSplit.value) || 0));
    const stretchedPct = 100 - val;
    plateFrame?.style?.setProperty('--split', `${val}%`);
    if (plateRatio) {
      plateRatio.textContent = `${val}% / ${stretchedPct}%`;
    }
    plateSplit.setAttribute?.('aria-valuetext', `线性原片占 ${val}%，拉伸成片占 ${stretchedPct}%`);
  }

  syncPlateSplit();
  plateSplit.addEventListener('input', syncPlateSplit);
  plateSplit.addEventListener('change', syncPlateSplit);
}

// 3D Layered Carousel Deck Controller
if (typeof window !== 'undefined' && typeof document?.querySelector === 'function') {
  const stage = document.querySelector('.deck__stage');
  const deckCards = Array.from(cards);
  const deckControls = document.querySelector('.deck__controls');
  const dotsContainer = document.querySelector('.deck__dots');
  const prevBtn = document.querySelector('[data-deck-prev]');
  const nextBtn = document.querySelector('[data-deck-next]');
  const curSpan = document.getElementById('deck-cur');
  const totalSpan = document.getElementById('deck-total');
  const statusEl = document.getElementById('deck-status');
  const deck = document.getElementById('project-deck');

  let activeIndex = 0;
  let dotButtons = [];
  let lastVisibleCards = [];

  function getVisibleCards() {
    return deckCards.filter((card) => !card.hidden);
  }

  function getCircularPos(idx, active, total) {
    if (total <= 1) return 0;
    let diff = idx - active;
    if (diff > total / 2) {
      diff -= total;
    } else if (diff < -total / 2) {
      diff += total;
    }
    return diff;
  }

  function getCardTitle(card) {
    if (!card) return '';
    if (typeof card.querySelector === 'function') {
      const title = card.querySelector('h3, .card__title')?.textContent?.trim();
      if (title) return title;
    }
    return card.getAttribute?.('aria-label') || '';
  }

  function syncDots(visibleCards) {
    if (!dotsContainer) return;
    const changed =
      visibleCards.length !== lastVisibleCards.length ||
      visibleCards.some((card, idx) => card !== lastVisibleCards[idx]);

    if (changed) {
      dotsContainer.innerHTML = '';
      dotButtons = visibleCards.map((card, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'deck__dot';
        const title = getCardTitle(card);
        dot.setAttribute(
          'aria-label',
          title ? `切换至第 ${idx + 1} 个项目：${title}` : `切换至第 ${idx + 1} 个项目`,
        );
        dot.addEventListener('click', (e) => {
          e.stopPropagation?.();
          activeIndex = idx;
          update({ announce: true });
        });
        dotsContainer.appendChild(dot);
        return dot;
      });
      lastVisibleCards = visibleCards;
    }

    dotButtons.forEach((dot, idx) => {
      const isActive = idx === activeIndex;
      if (typeof dot.classList?.toggle === 'function') {
        dot.classList.toggle('is-active', isActive);
      } else {
        dot.className = isActive ? 'deck__dot is-active' : 'deck__dot';
      }
      if (isActive) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute?.('aria-current');
      }
    });
  }

  function update(options = {}) {
    const { announce = false, focusActiveCard = false, focusActiveDot = false } = options;
    const focusedCardBefore = deckCards.includes(document.activeElement)
      ? document.activeElement
      : null;

    for (const card of deckCards) {
      if (card.hidden) {
        card.removeAttribute?.('data-deck-pos');
        if (card.dataset) delete card.dataset.deckPos;
        card.setAttribute('tabindex', '-1');
        card.setAttribute('aria-hidden', 'true');
      }
    }

    const visibleCards = getVisibleCards();
    const total = visibleCards.length;
    const mode = total === 0 ? 'empty' : total === 1 ? 'single' : total === 2 ? 'pair' : 'carousel';

    if (deck) {
      if (deck.dataset) deck.dataset.deckMode = mode;
      deck.setAttribute?.('data-deck-mode', mode);
      if (mode === 'carousel') {
        deck.setAttribute?.('aria-roledescription', 'carousel');
      } else {
        deck.removeAttribute?.('aria-roledescription');
      }
    }
    if (deckControls) {
      deckControls.hidden = mode !== 'carousel';
    }

    const disableControls = total <= 1;
    for (const btn of [prevBtn, nextBtn]) {
      if (!btn) continue;
      btn.disabled = disableControls;
      btn.setAttribute?.('aria-disabled', String(disableControls));
    }

    if (total === 0) {
      activeIndex = 0;
      if (curSpan) curSpan.textContent = '0';
      if (totalSpan) totalSpan.textContent = '0';
      if (dotsContainer) dotsContainer.innerHTML = '';
      dotButtons = [];
      lastVisibleCards = [];
      if (announce && statusEl) statusEl.textContent = '当前筛选暂无匹配项目';
      return;
    }

    if (activeIndex < 0 || activeIndex >= total) {
      activeIndex = 0;
    }

    visibleCards.forEach((card, idx) => {
      if (mode === 'carousel') {
        const pos = getCircularPos(idx, activeIndex, total);
        if (card.dataset) card.dataset.deckPos = String(pos);
        card.setAttribute('data-deck-pos', String(pos));
        card.setAttribute('tabindex', pos === 0 ? '0' : '-1');
        card.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
      } else {
        card.removeAttribute?.('data-deck-pos');
        if (card.dataset) delete card.dataset.deckPos;
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-hidden', 'false');
      }
    });

    if (curSpan) curSpan.textContent = String(activeIndex + 1);
    if (totalSpan) totalSpan.textContent = String(total);

    syncDots(visibleCards);

    const activeCard = visibleCards[activeIndex];
    if (focusActiveDot && mode === 'carousel' && dotButtons[activeIndex]) {
      dotButtons[activeIndex].focus?.({ preventScroll: true });
    } else if (focusActiveCard || (mode === 'carousel' && focusedCardBefore && focusedCardBefore !== activeCard)) {
      activeCard.focus?.({ preventScroll: true });
    }

    if (announce && mode === 'carousel' && statusEl) {
      const title = getCardTitle(activeCard);
      statusEl.textContent = title
        ? `第 ${activeIndex + 1} / ${total} 项：${title}`
        : `第 ${activeIndex + 1} / ${total} 项`;
    }
  }

  function prev(options = {}) {
    const visibleCards = getVisibleCards();
    if (visibleCards.length <= 1) return;
    activeIndex = (activeIndex - 1 + visibleCards.length) % visibleCards.length;
    update({ announce: true, ...options });
  }

  function next(options = {}) {
    const visibleCards = getVisibleCards();
    if (visibleCards.length <= 1) return;
    activeIndex = (activeIndex + 1) % visibleCards.length;
    update({ announce: true, ...options });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation?.();
      prev();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation?.();
      next();
    });
  }

  // Click card to switch: clicking side cards centers them; clicking center card opens destination
  deckCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      if (card.hidden) {
        e.preventDefault?.();
        return;
      }
      const visibleCards = getVisibleCards();
      if (visibleCards.length < 3) return;
      const pos = Number(card.dataset?.deckPos ?? card.getAttribute?.('data-deck-pos'));
      if (pos !== 0) {
        e.preventDefault?.();
        e.stopPropagation?.();
        const targetIndex = visibleCards.indexOf(card);
        if (targetIndex !== -1) {
          activeIndex = targetIndex;
          update({ announce: true, focusActiveCard: true });
        }
      }
    });
  });

  // Stage flank clicks: clicking to the left or right of center advances or rewinds
  if (deck) {
    deck.addEventListener('click', (e) => {
      if (getVisibleCards().length < 3 || typeof e.clientX !== 'number' || Number.isNaN(e.clientX)) {
        return;
      }
      const closest = e.target?.closest;
      if (
        typeof closest === 'function' &&
        (e.target.closest('.deck__card') || e.target.closest('.deck__controls'))
      ) {
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

  // Keyboard navigation inside carousel
  if (deck) {
    deck.addEventListener('keydown', (e) => {
      const visibleCards = getVisibleCards();
      if (visibleCards.length < 3) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault?.();
      const fromCard = deckCards.includes(document.activeElement);
      const fromDot = dotButtons.includes(document.activeElement);
      const opts = {
        focusActiveCard: fromCard,
        focusActiveDot: fromDot,
      };
      if (e.key === 'ArrowLeft') prev(opts);
      else if (e.key === 'ArrowRight') next(opts);
      else if (e.key === 'Home') {
        activeIndex = 0;
        update({ announce: true, ...opts });
      } else if (e.key === 'End') {
        activeIndex = visibleCards.length - 1;
        update({ announce: true, ...opts });
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
      if (getVisibleCards().length < 3) return;
      if (e.changedTouches && e.changedTouches[0]) {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) prev();
          else next();
        }
      }
    }, { passive: true });
  }

  onFilterChange = () => {
    activeIndex = 0;
    update({ announce: true });
  };

  update();
}
