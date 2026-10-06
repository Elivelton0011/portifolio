(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('menu');
  if (!toggle || !nav) return;

  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    document.documentElement.classList.toggle('menu-open', open);
  };

  toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Fecha o menu ao escolher um link
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  // Fecha com Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  // Menu aberto: bloqueia rolagem, arrasto e teclas de navegação da página
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const lock = (e) => { if (isOpen()) e.preventDefault(); };
  document.addEventListener('wheel', lock, { passive: false });
  document.addEventListener('touchmove', lock, { passive: false });
  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
  });

  // Garante estado limpo ao voltar para telas maiores
  window.matchMedia('(min-width: 721px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  // Destaca o link de navegação conforme a seção visível
  const links = [...document.querySelectorAll('.nav__link')];
  const sections = links
    .map((l) => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) =>
          l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`)
        );
      });
    }, { threshold: 0.5 });
    sections.forEach((s) => io.observe(s));
  }
})();

/* ----------------------------------------------------------
   Revelação fluida seguindo o cursor
   - lerp na posição (inércia) e no raio (nasce/some suave)
   - segunda "gota" mais lenta cria a aparência líquida
   - respeita prefers-reduced-motion e ignora toque
   ---------------------------------------------------------- */
(() => {
  const hero = document.querySelector('.hero');
  const reveal = document.querySelector('.hero__reveal');
  if (!hero || !reveal) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const BASE_RADIUS = 260;
  const FOLLOW = 0.14;      // inércia da gota principal
  const TRAIL_FOLLOW = 0.07; // gota secundária, mais lenta
  const GROW = 0.1;

  const target = { x: 0, y: 0 };
  const main = { x: 0, y: 0 };
  const trail = { x: 0, y: 0 };
  let scale = 0;       // 0 = invisível, 1 = raio completo
  let goal = 0;
  let running = false;
  let started = false;

  const radius = () => {
    // reduz levemente em telas menores
    const w = hero.clientWidth;
    return Math.max(150, Math.min(BASE_RADIUS, w * 0.3));
  };

  const blob = (x, y, r) =>
    `radial-gradient(circle ${r.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px,
      rgba(0,0,0,1) 0%,
      rgba(0,0,0,0.97) 28%,
      rgba(0,0,0,0.84) 44%,
      rgba(0,0,0,0.58) 60%,
      rgba(0,0,0,0.30) 75%,
      rgba(0,0,0,0.10) 88%,
      rgba(0,0,0,0) 100%)`;

  const paint = (t) => {
    const r = radius() * scale;
    // ondulação leve e orgânica no raio
    const wobble = reduced.matches ? 0 : Math.sin(t / 700) * 0.035 + Math.sin(t / 1130) * 0.02;
    const r1 = r * (1 + wobble);
    const r2 = r * 0.72 * (1 - wobble);

    const mask = `${blob(main.x, main.y, Math.max(r1, 1))}, ${blob(trail.x, trail.y, Math.max(r2, 1))}`;
    reveal.style.webkitMaskImage = mask;
    reveal.style.maskImage = mask;
    reveal.style.opacity = scale < 0.005 ? '0' : '1';
  };

  const tick = (t) => {
    const k = reduced.matches ? 1 : FOLLOW;
    const kt = reduced.matches ? 1 : TRAIL_FOLLOW;
    main.x += (target.x - main.x) * k;
    main.y += (target.y - main.y) * k;
    trail.x += (target.x - trail.x) * kt;
    trail.y += (target.y - trail.y) * kt;
    scale += (goal - scale) * (reduced.matches ? 1 : GROW);

    paint(t);

    const settled =
      Math.abs(target.x - main.x) < 0.3 && Math.abs(target.y - main.y) < 0.3 &&
      Math.abs(target.x - trail.x) < 0.3 && Math.abs(target.y - trail.y) < 0.3 &&
      Math.abs(goal - scale) < 0.003;

    // com o cursor parado, a ondulação continua enquanto visível
    if (goal === 0 && scale < 0.005) {
      running = false;
      scale = 0;
      paint(t);
      return;
    }
    running = true;
    requestAnimationFrame(tick);
    if (settled && reduced.matches) running = false;
  };

  const start = () => {
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  };

  const toLocal = (e) => {
    const rect = hero.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  hero.addEventListener('pointermove', (e) => {
    if (!finePointer.matches || e.pointerType === 'touch') return;
    const p = toLocal(e);
    target.x = p.x;
    target.y = p.y;
    if (!started || goal === 0) {
      // nasce exatamente sob o cursor, sem "voar" da última posição
      main.x = trail.x = p.x;
      main.y = trail.y = p.y;
      started = true;
    }
    goal = 1;
    start();
  });

  hero.addEventListener('pointerleave', () => {
    goal = 0;
    start();
  });

  // Pré-carrega a imagem para a primeira revelação não piscar
  if (reveal.decode) reveal.decode().catch(() => {});
})();

/* ----------------------------------------------------------
   Seção Sobre: animações de entrada via IntersectionObserver
   O conteúdo só é "armado" (escondido) se o JS rodar; sem JS
   ou com redução de movimento, tudo fica visível.
   ---------------------------------------------------------- */
(() => {
  const about = document.getElementById('sobre');
  if (!about) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    about.classList.add('is-visible');
    return;
  }

  about.classList.add('is-armed');

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      about.classList.add('is-visible');
      obs.disconnect(); // dispara uma única vez
    });
  }, { threshold: 0.25 });

  io.observe(about);
})();
/* ----------------------------------------------------------
   Projects: carrossel infinito (dados em js/projects.js)
   A posição lógica (pos, contínua) define o offset de cada card
   pelo caminho mais curto no círculo, então o loop não tem salto.
   ---------------------------------------------------------- */
(() => {
  const section = document.getElementById('projetos');
  const view = document.getElementById('pviewport');
  if (!section || !view || typeof projects === 'undefined' || !projects.length) return;

  const n = projects.length;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = (v) => String(v).padStart(2, '0');
  const mk = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  };

  const cards = projects.map((p, i) => {
    const root = mk(p.url ? 'a' : 'div', 'pcard');
    if (p.url) { root.href = p.url; root.target = '_blank'; root.rel = 'noopener noreferrer'; root.draggable = false; }
    const img = mk('img', 'pcard__img');
    img.src = p.image; img.width = 2536; img.height = 1456; img.draggable = false;
    img.alt = `Prévia do projeto ${p.title}`;
    img.loading = i === 0 ? 'eager' : 'lazy'; img.decoding = 'async';
    const info = mk('div', 'pcard__info');
    info.append(mk('h3', 'pcard__title', p.title), mk('p', 'pcard__desc', p.description));
    const ul = mk('ul', 'pcard__tech');
    p.technologies.forEach((t) => ul.append(mk('li', '', t)));
    info.append(ul);
    if (p.url) info.append(mk('span', 'pcard__cta', 'View project ↗'));
    root.append(img, info);
    view.append(root);
    return { root };
  });

  const cur = document.getElementById('pcur');
  const fill = document.getElementById('pfill');
  document.getElementById('ptot').textContent = pad(n);

  let pos = 0, goal = 0, raf = 0, step = 0, idx = -1, suppress = false, drag = null;
  const measure = () => { step = cards[0].root.offsetWidth * 0.8; };

  const render = () => {
    cards.forEach((c, i) => {
      let d = (((i - pos) % n) + n) % n;
      if (d > n / 2) d -= n;
      const a = Math.abs(d), m = Math.min(a, 2);
      const o = a <= 1 ? 1 - 0.45 * a : Math.max(0, 0.55 * (2 - a));
      const s = c.root.style;
      s.transform = `translate3d(${d * step}px,0,${-m * 80}px) scale(${1 - 0.15 * m})`;
      s.opacity = o.toFixed(3);
      s.filter = `blur(${(m * 1.5).toFixed(2)}px)`;
      s.zIndex = Math.round(10 - a * 3);
      s.pointerEvents = o < 0.05 ? 'none' : 'auto';
      s.setProperty('--c', Math.max(0, 1 - a).toFixed(3));
    });
    const k = ((Math.round(pos) % n) + n) % n;
    if (k !== idx) {
      idx = k;
      cur.textContent = pad(k + 1);
      fill.style.transform = `scaleX(${(k + 1) / n})`;
      cards.forEach((c, i) => {
        const on = i === k;
        c.root.classList.toggle('is-current', on);
        c.root.setAttribute('aria-hidden', String(!on));
        if (c.root.tagName === 'A') c.root.tabIndex = on ? 0 : -1;
      });
    }
  };

  const loop = () => {
    const diff = goal - pos;
    if (Math.abs(diff) < 0.0008) { pos = goal; raf = 0; render(); return; }
    pos += diff * (reduced ? 1 : 0.11);
    render();
    raf = requestAnimationFrame(loop);
  };
  const go = (g) => { goal = g; if (!raf) raf = requestAnimationFrame(loop); };
  const next = () => go(Math.round(goal) + 1);
  const prev = () => go(Math.round(goal) - 1);

  document.getElementById('pnext').addEventListener('click', next);
  document.getElementById('pprev').addEventListener('click', prev);
  section.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  });

  // Drag / swipe (Pointer Events; touch-action: pan-y preserva o scroll vertical)
  view.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, last: e.clientX, t: performance.now(), v: 0, pos, moved: false };
  });
  view.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(dx) < 6) return;
      drag.moved = true;
      view.setPointerCapture(drag.id);
      view.classList.add('is-dragging');
      cancelAnimationFrame(raf); raf = 0;
    }
    const now = performance.now(), dt = now - drag.t;
    if (dt > 0) drag.v = 0.8 * drag.v + 0.2 * ((e.clientX - drag.last) / dt);
    drag.last = e.clientX; drag.t = now;
    pos = goal = drag.pos - dx / step;
    render();
  });
  const end = () => {
    if (!drag) return;
    const { moved, v } = drag;
    drag = null;
    view.classList.remove('is-dragging');
    if (!moved) return;
    suppress = true;
    setTimeout(() => { suppress = false; }, 60);
    const r = Math.round(pos);
    go(Math.max(r - 2, Math.min(r + 2, Math.round(pos - (v * 220) / step))));
  };
  view.addEventListener('pointerup', end);
  view.addEventListener('pointercancel', end);

  // Clique: bloqueia após arrasto; card lateral vira o central
  view.addEventListener('click', (e) => {
    if (suppress) { e.preventDefault(); e.stopPropagation(); return; }
    const hit = e.target.closest('.pcard');
    const i = cards.findIndex((c) => c.root === hit);
    if (i < 0 || i === idx) return;
    e.preventDefault();
    let delta = (((i - idx) % n) + n) % n;
    if (delta > n / 2) delta -= n;
    go(Math.round(pos) + delta);
  }, true);

  window.addEventListener('resize', () => { measure(); render(); });
  measure(); render();

  // Entrada
  if (reduced || !('IntersectionObserver' in window)) {
    section.classList.add('is-visible');
  } else {
    section.classList.add('is-armed');
    const io = new IntersectionObserver((entries, obs) => {
      if (entries.some((en) => en.isIntersecting)) { section.classList.add('is-visible'); obs.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(section);
  }
})();
/* ----------------------------------------------------------
   Contact + Footer: entrada via IntersectionObserver e Back to top
   Mesmo padrão das outras seções: o conteúdo só é "armado"
   (escondido) se o JS rodar e não houver redução de movimento.
   ---------------------------------------------------------- */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const reveal = (el, threshold) => {
    if (!el) return;
    if (reduced || !('IntersectionObserver' in window)) {
      el.classList.add('is-visible');
      return;
    }
    el.classList.add('is-armed');
    const io = new IntersectionObserver((entries, obs) => {
      if (entries.some((en) => en.isIntersecting)) {
        el.classList.add('is-visible');
        obs.disconnect(); // dispara uma única vez
      }
    }, { threshold });
    io.observe(el);
  };

  reveal(document.getElementById('contato'), 0.2);
  reveal(document.querySelector('.sfoot'), 0.2);

  const toTop = document.getElementById('to-top');
  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }
})();
