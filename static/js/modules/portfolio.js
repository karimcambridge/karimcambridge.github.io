/**
 * portfolio.js
 * Vanilla portfolio filtering (replaces Isotope) and a lightweight
 * image/video lightbox (replaces Magnific Popup).
 */
export function initPortfolio() {
  initFilters();
  initLightbox();
}

function initFilters() {
  const groups = [
    { filter: '.filter', content: '.portfolio-content', item: '.portfolio-item' },
    { filter: '.filter2', content: '.portfolio-content2', item: '.portfolio-item2' },
  ];

  groups.forEach(({ filter, content, item }) => {
    const filterList = document.querySelector(filter);
    const container = document.querySelector(content);
    if (!filterList || !container) return;

    const items = Array.from(container.querySelectorAll(item));
    const buttons = Array.from(filterList.querySelectorAll('li[data-filter]'));

    const apply = (value) => {
      items.forEach((node) => {
        const show = value === '*' || node.classList.contains(value.slice(1));
        node.classList.toggle('is-hidden', !show);
      });
    };

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        apply(btn.getAttribute('data-filter'));
      });
    });
  });
}

function initLightbox() {
  const imageLinks = Array.from(document.querySelectorAll('.lightbox-gallery'));
  const videoLinks = Array.from(document.querySelectorAll('.popup-video'));
  if (imageLinks.length === 0 && videoLinks.length === 0) return;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML =
    '<button class="lightbox__close" type="button" aria-label="Close">&times;</button>' +
    '<button class="lightbox__nav lightbox__prev" type="button" aria-label="Previous">&#10094;</button>' +
    '<div class="lightbox__stage"></div>' +
    '<button class="lightbox__nav lightbox__next" type="button" aria-label="Next">&#10095;</button>';
  document.body.appendChild(overlay);

  const stage = overlay.querySelector('.lightbox__stage');
  const prevBtn = overlay.querySelector('.lightbox__prev');
  const nextBtn = overlay.querySelector('.lightbox__next');
  const closeBtn = overlay.querySelector('.lightbox__close');

  let gallery = [];
  let index = 0;
  let mode = 'image';

  const escapeHtml = (value = '') =>
    value.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function render() {
    const current = gallery[index];
    if (mode === 'video') {
      stage.innerHTML =
        `<div class="lightbox__video"><iframe src="${encodeURI(current.src)}" ` +
        `title="${escapeHtml(current.title)}" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`;
    } else {
      stage.innerHTML =
        `<img src="${encodeURI(current.src)}" alt="${escapeHtml(current.title)}">` +
        (current.title ? `<span class="lightbox__caption">${escapeHtml(current.title)}</span>` : '');
    }
    const showNav = mode === 'image' && gallery.length > 1;
    prevBtn.hidden = !showNav;
    nextBtn.hidden = !showNav;
  }

  function open(list, startIndex, kind) {
    gallery = list;
    index = startIndex;
    mode = kind;
    render();
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    stage.innerHTML = ''; // unload the image/iframe
    document.documentElement.style.overflow = '';
  }

  function step(direction) {
    if (mode !== 'image') return;
    index = (index + direction + gallery.length) % gallery.length;
    render();
  }

  const imageGallery = imageLinks.map((a) => ({
    src: a.getAttribute('href'),
    title: a.getAttribute('title') || '',
  }));
  imageLinks.forEach((a, i) => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      open(imageGallery, i, 'image');
    });
  });

  videoLinks.forEach((a) => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      open([{ src: toEmbed(a.getAttribute('href')), title: a.getAttribute('title') || '' }], 0, 'video');
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));
  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) close();
  });
  document.addEventListener('keydown', (ev) => {
    if (!overlay.classList.contains('is-open')) return;
    if (ev.key === 'Escape') close();
    else if (ev.key === 'ArrowLeft') step(-1);
    else if (ev.key === 'ArrowRight') step(1);
  });
}

function toEmbed(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
}
