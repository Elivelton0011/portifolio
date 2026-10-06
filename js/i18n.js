/* Lógica de idioma. Dados em js/translations.js. Carregar DEPOIS de script.js
   (o carrossel é montado lá e também recebe data-i18n). */
(() => {
  const KEY = 'portfolio-language';
  const DEFAULT = 'pt-BR';
  const SHORT = { 'pt-BR': 'PT', es: 'ES', en: 'EN' };

  const root = document.querySelector('[data-lang-switch]');
  if (!root || typeof translations === 'undefined') return;

  const btn = root.querySelector('.lang-switch__btn');
  const options = [...root.querySelectorAll('[data-lang]')];
  const current = root.querySelector('[data-lang-current]');
  const toggle = document.querySelector('.menu-toggle');

  let lang = DEFAULT;
  const get = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  const t = (key, fallback) => {
    const v = get(translations[lang], key);
    return v != null ? v : (get(translations[DEFAULT], key) ?? fallback);
  };
  // usado pelo script.js (aria-label do menu mobile)
  window.i18n = { t, get lang() { return lang; } };

  function apply(next) {
    lang = translations[next] ? next : DEFAULT;
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = t(el.dataset.i18n); if (v != null) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const v = t(el.dataset.i18nHtml); if (v != null) el.innerHTML = v;
    });
    // data-i18n-attr="aria-label:chave;alt:outra" ({name} vem de data-name)
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attr, key] = pair.split(':').map((s) => s.trim());
        let v = t(key);
        if (attr && v != null) el.setAttribute(attr, v.replace('{name}', el.dataset.name || ''));
      });
    });

    if (toggle) {
      toggle.setAttribute('aria-label', t(toggle.getAttribute('aria-expanded') === 'true' ? 'nav.close' : 'nav.open'));
    }
    document.title = t('meta.title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('meta.description'));

    current.textContent = SHORT[lang];
    options.forEach((o) => o.setAttribute('aria-checked', String(o.dataset.lang === lang)));
  }

  const open = () => {
    root.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    (options.find((o) => o.dataset.lang === lang) || options[0]).focus();
  };
  const close = (refocus) => {
    root.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    if (refocus) btn.focus();
  };

  btn.addEventListener('click', () => (root.classList.contains('is-open') ? close() : open()));
  options.forEach((o, i) => {
    o.addEventListener('click', () => {
      apply(o.dataset.lang);
      try { localStorage.setItem(KEY, lang); } catch (e) {}
      close(true);
    });
    o.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); options[(i + 1) % options.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); options[(i - 1 + options.length) % options.length].focus(); }
    });
  });
  document.addEventListener('click', (e) => { if (!root.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('is-open')) close(true);
  });

  let saved = DEFAULT;
  try { saved = localStorage.getItem(KEY) || DEFAULT; } catch (e) {}
  apply(saved);
})();
