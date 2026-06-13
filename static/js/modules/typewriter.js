/**
 * typewriter.js
 * Tiny typing/deleting loop — a dependency-free replacement for TypeIt.
 * Honours `prefers-reduced-motion`.
 */
export function initTypewriter(el, strings, options = {}) {
  if (!el || !Array.isArray(strings) || strings.length === 0) return;

  const typeSpeed = options.typeSpeed ?? 90;
  const deleteSpeed = options.deleteSpeed ?? 45;
  const holdTime = options.holdTime ?? 1600;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = strings[0];
    return;
  }

  let stringIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function tick() {
    const full = strings[stringIdx];

    if (!deleting) {
      charIdx += 1;
      el.textContent = full.slice(0, charIdx);
      if (charIdx === full.length) {
        deleting = true;
        return window.setTimeout(tick, holdTime);
      }
      return window.setTimeout(tick, typeSpeed);
    }

    charIdx -= 1;
    el.textContent = full.slice(0, charIdx);
    if (charIdx === 0) {
      deleting = false;
      stringIdx = (stringIdx + 1) % strings.length;
      return window.setTimeout(tick, typeSpeed);
    }
    return window.setTimeout(tick, deleteSpeed);
  }

  tick();
}
