/**
 * navigation.js
 * Page-stack navigation with 3‑D animation and hash-based routing.
 *
 * HYBRID APPROACH:
 *  • During menu-open and page-transition: all pages are in the DOM
 *    with 3‑D transforms for the fan-out / slide animation.
 *  • In the STATIC state (menu closed, idle): inactive pages get
 *    `display: none` so nothing can ever bleed through — not even
 *    the "stack" pages that sit at translateY(100 %) with partial
 *    opacity.
 *  • `showAllPages()` / `hideInactivePages()` toggle between the two.
 *
 * Keyboard shortcuts (1–4) switch pages when the overlay is open
 * and no text field is focused.
 */
export function initNavigation() {
  const stack = document.querySelector('.pages-stack');
  if (!stack) return;

  const pages = Array.from(stack.children);
  const pagesTotal = pages.length;
  const menuCtrl = document.querySelector('button.menu-button');
  const nav = document.querySelector('.pages-nav');
  const navItems = nav ? Array.from(nav.querySelectorAll('.link--page')) : [];

  let current = 0;
  let isMenuOpen = false;

  /*--------------------------------------------------------------------
   *  Helpers
   *------------------------------------------------------------------*/
  const indexOfId = (id) => pages.findIndex((page) => page.id === id);

  /** Bring every page back into layout so they can animate. */
  function showAllPages() {
    for (let i = 0; i < pagesTotal; i++) {
      pages[i].style.display = 'block';
      if (i !== current) {
        // Position off-screen + invisible so they never flash at origin.
        pages[i].style.transform = 'translate3d(0,110%,0)';
        pages[i].style.opacity = '0';
      }
    }
  }

  /** Remove inactive pages from layout — absolute bleed-proofing. */
  function hideInactivePages() {
    for (let i = 0; i < pagesTotal; i++) {
      if (pages[i].classList.contains('page--inactive')) {
        pages[i].style.display = 'none';
      }
    }
  }

  /*--------------------------------------------------------------------
   *  Stack calculation
   *------------------------------------------------------------------*/
  function getStackPagesIdxs(excludeIdx) {
    const next = current + 1 < pagesTotal ? current + 1 : 0;
    const next2 = current + 2 < pagesTotal ? current + 2 : 1;
    const idxs = [];
    if (excludeIdx !== current) idxs.push(current);
    if (excludeIdx !== next) idxs.push(next);
    if (excludeIdx !== next2) idxs.push(next2);
    return idxs;
  }

  /*--------------------------------------------------------------------
   *  Layout (static state — no transitions active)
   *------------------------------------------------------------------*/
  function buildStack() {
    const visible = getStackPagesIdxs();
    for (let i = 0; i < pagesTotal; i++) {
      const page = pages[i];
      const posIdx = visible.indexOf(i);

      if (current !== i) {
        page.classList.add('page--inactive');
        page.style.transform = posIdx !== -1
          ? 'translate3d(0,110%,0)'
          : 'translate3d(0,75%,-300px)';
      } else {
        page.classList.remove('page--inactive');
        page.style.transform = 'translate3d(0,0,0)';
      }

      page.style.zIndex = i < current ? current - i : pagesTotal + current - i;
      page.style.opacity = posIdx !== -1 ? String(1 - 0.1 * posIdx) : '0';
    }
    hideInactivePages(); // ← absolute guard: nothing bleeds in static state
  }

  /*--------------------------------------------------------------------
   *  Menu open / close
   *------------------------------------------------------------------*/
  function openMenu() {
    showAllPages(); // bring pages back so they can fan out

    menuCtrl.classList.add('menu-button--open');
    stack.classList.add('pages-stack--open');
    nav.classList.add('pages-nav--open');

    // Fan the visible stack pages out in 3‑D.
    const visible = getStackPagesIdxs();
    for (let i = 0; i < visible.length; i++) {
      pages[visible[i]].style.transform =
        `translate3d(0, 75%, ${-200 - 50 * i}px)`;
    }
  }

  /**
   * Animated page reveal.
   *
   * Non-target pages get opacity 0 instantly (no CSS transition on
   * opacity — see components.css).  Their transform still animates
   * so they slide away.  The target gets the highest z-index.
   */
  function openPage(id) {
    const futurePage = id ? document.getElementById(id) : pages[current];
    const futureCurrent = pages.indexOf(futurePage);

    // Reset scroll on the incoming page so it always starts at the top.
    const scroller = futurePage.querySelector('.page-scroll');
    if (scroller) scroller.scrollTop = 0;

    for (let i = 0; i < pagesTotal; i++) {
      if (i === futureCurrent) continue;
      pages[i].style.transform = 'translate3d(0,110%,0)';
      pages[i].style.opacity = '0';
    }

    futurePage.style.zIndex = pagesTotal + 1;
    futurePage.style.transform = 'translate3d(0,0,0)';
    futurePage.style.opacity = '1';

    if (id) current = futureCurrent;

    // Keep the nav overlay visible during the slide; close it after.
    requestAnimationFrame(() => {
      setTimeout(() => {
        menuCtrl.classList.remove('menu-button--open');
        nav.classList.remove('pages-nav--open');
        stack.classList.remove('pages-stack--open');
        buildStack();
        isMenuOpen = false;
        updateBadges();
      }, 500);
    });
  }

  /*--------------------------------------------------------------------
   *  Routing (hash is the single source of truth)
   *------------------------------------------------------------------*/
  function navigateTo(id) {
    if (indexOfId(id) === -1) return;
    if (`#${id}` === window.location.hash) {
      openPage(id);
    } else {
      window.location.hash = id;
    }
  }

  function syncFromHash() {
    const id = window.location.hash.slice(1);
    const idx = indexOfId(id);
    if (idx === -1) return;
    if (idx === current) {
      if (isMenuOpen) openPage(id);
      return;
    }
    openPage(id);
  }

  /*--------------------------------------------------------------------
   *  Keyboard shortcuts (1-4)
   *------------------------------------------------------------------*/
  const KEY_ORDER = navItems.map((a) => a.getAttribute('href').slice(1));

  function canStealKeys() {
    if (!isMenuOpen) return false;
    if (!document.hasFocus()) return false;
    const el = document.activeElement;
    if (!el || el === document.body || el === document.documentElement) return true;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return false;
    if (el.isContentEditable) return false;
    return true;
  }

  function updateBadges() {
    navItems.forEach((item, i) => {
      const existing = item.querySelector('.nav-kbd');
      if (isMenuOpen) {
        if (!existing) {
          const badge = document.createElement('span');
          badge.className = 'nav-kbd';
          badge.textContent = String(i + 1);
          badge.setAttribute('aria-hidden', 'true');
          item.appendChild(badge);
        }
      } else if (existing) {
        existing.remove();
      }
    });
  }

  /*--------------------------------------------------------------------
   *  Event binding
   *------------------------------------------------------------------*/
  function bindEvents() {
    if (menuCtrl) {
      menuCtrl.addEventListener('click', () => {
        if (isMenuOpen) {
          openPage(); // close menu, keep current page
        } else {
          openMenu();
          isMenuOpen = true;
          updateBadges();
        }
      });
    }

    navItems.forEach((item) => {
      const id = item.getAttribute('href').slice(1);
      item.addEventListener('click', (ev) => {
        ev.preventDefault();
        navigateTo(id);
      });
    });

    pages.forEach((page) => {
      page.addEventListener('click', (ev) => {
        if (!isMenuOpen) return;
        ev.preventDefault();
        navigateTo(page.id);
      });
    });

    document.addEventListener('keydown', (ev) => {
      if (isMenuOpen && ev.key === 'Escape') {
        openPage();
        return;
      }
      if (!canStealKeys()) return;
      const digit = parseInt(ev.key, 10);
      if (digit >= 1 && digit <= Math.min(KEY_ORDER.length, 9)) {
        ev.preventDefault();
        navigateTo(KEY_ORDER[digit - 1]);
      }
    });

    window.addEventListener('hashchange', syncFromHash);
  }

  /*--------------------------------------------------------------------
   *  Boot
   *------------------------------------------------------------------*/
  const hashId = window.location.hash.slice(1);
  const startIdx = indexOfId(hashId);
  current = startIdx === -1 ? 0 : startIdx;

  buildStack();
  bindEvents();
  syncFromHash();
}


