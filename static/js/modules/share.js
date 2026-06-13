/**
 * share.js
 * Full sharing feature:
 *  - Mobile / supported browsers -> the native OS share sheet (navigator.share).
 *  - Everywhere else -> a popover with copy-link + social share targets.
 *
 * Always shares the current page's deep link (URL includes the active #hash).
 */
const PAGE_TITLES = {
  home: 'Karim Cambridge — Software Architect',
  about: 'About — Karim Cambridge',
  resume: 'Resume — Karim Cambridge',
  portfolio: 'Portfolio — Karim Cambridge',
  contact: 'Contact — Karim Cambridge',
};

export function initShare() {
  const toggle = document.querySelector('.share-toggle');
  if (!toggle) return;

  const popover = document.createElement('div');
  popover.className = 'share-popover';
  popover.setAttribute('aria-hidden', 'true');
  popover.innerHTML =
    '<button class="share-option" type="button" data-share="copy"><i class="fas fa-link" aria-hidden="true"></i><span>Copy link</span></button>' +
    '<a class="share-option" data-share="twitter" target="_blank" rel="noopener"><i class="fab fa-twitter" aria-hidden="true"></i><span>X / Twitter</span></a>' +
    '<a class="share-option" data-share="linkedin" target="_blank" rel="noopener"><i class="fab fa-linkedin" aria-hidden="true"></i><span>LinkedIn</span></a>' +
    '<a class="share-option" data-share="facebook" target="_blank" rel="noopener"><i class="fab fa-facebook" aria-hidden="true"></i><span>Facebook</span></a>' +
    '<a class="share-option" data-share="whatsapp" target="_blank" rel="noopener"><i class="fab fa-whatsapp" aria-hidden="true"></i><span>WhatsApp</span></a>' +
    '<a class="share-option" data-share="email"><i class="fas fa-envelope" aria-hidden="true"></i><span>Email</span></a>';
  document.body.appendChild(popover);

  const copyBtn = popover.querySelector('[data-share="copy"]');

  function currentShare() {
    const id = window.location.hash.slice(1) || 'home';
    const title = PAGE_TITLES[id] || document.title;
    return { title, text: title, url: window.location.href };
  }

  function buildLinks() {
    const { url, title } = currentShare();
    const u = encodeURIComponent(url);
    const t = encodeURIComponent(title);
    popover.querySelector('[data-share="twitter"]').href = `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    popover.querySelector('[data-share="linkedin"]').href = `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    popover.querySelector('[data-share="facebook"]').href = `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    popover.querySelector('[data-share="whatsapp"]').href = `https://api.whatsapp.com/send?text=${t}%20${u}`;
    popover.querySelector('[data-share="email"]').href = `mailto:?subject=${t}&body=${u}`;
  }

  const isOpen = () => popover.classList.contains('is-open');
  function openPopover() {
    buildLinks();
    popover.classList.add('is-open');
    popover.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
  }
  function closePopover() {
    popover.classList.remove('is-open');
    popover.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', async (ev) => {
    ev.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share(currentShare());
      } catch (_) {
        /* user dismissed the share sheet */
      }
      return;
    }
    isOpen() ? closePopover() : openPopover();
  });

  copyBtn.addEventListener('click', async () => {
    const { url } = currentShare();
    try {
      await navigator.clipboard.writeText(url);
    } catch (_) {
      const tmp = document.createElement('input');
      tmp.value = url;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      tmp.remove();
    }
    flash(copyBtn, 'Copied!');
  });

  popover.addEventListener('click', (ev) => {
    const option = ev.target.closest('.share-option');
    if (option && option.tagName === 'A') closePopover();
  });

  document.addEventListener('click', (ev) => {
    if (!isOpen()) return;
    if (popover.contains(ev.target) || toggle.contains(ev.target)) return;
    closePopover();
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') closePopover();
  });
}

function flash(button, message) {
  const span = button.querySelector('span');
  if (!span) return;
  const original = span.textContent;
  span.textContent = message;
  window.setTimeout(() => {
    span.textContent = original;
  }, 1500);
}
