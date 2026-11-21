/* Clínica em Casa · animações (GSAP + ScrollTrigger + Lenis) */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- UI que funciona sempre ---------- */
  // header ao rolar + botão flutuante
  const header = $('[data-header]');
  const floatCall = $('[data-float-call]');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 10);
    floatCall.classList.toggle('is-on', y > window.innerHeight * 0.8);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // menu mobile
  const burger = $('[data-burger]');
  const nav = $('[data-nav]');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('.nav__link', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // link ativo do menu conforme a secção
  const links = $$('.nav__link');
  const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));

  // acordeão
  const accItems = $$('.acc');
  const toggleAcc = (item, open) => {
    const btn = $('.acc__btn', item);
    const panel = $('.acc__panel', item);
    btn.setAttribute('aria-expanded', String(open));
    item.classList.toggle('is-open', open);
    if (hasGsap && !reduce) {
      if (open) {
        panel.hidden = false;
        gsap.fromTo(panel, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.55, ease: 'power3.out', onComplete: () => ScrollTrigger.refresh() });
        gsap.fromTo($('p', panel), { y: 12 }, { y: 0, duration: 0.55, ease: 'power3.out' });
      } else {
        gsap.to(panel, { height: 0, opacity: 0, duration: 0.4, ease: 'power3.inOut', onComplete: () => { panel.hidden = true; ScrollTrigger.refresh(); } });
      }
    } else {
      panel.hidden = !open;
    }
  };
  accItems.forEach((item) => {
    $('.acc__btn', item).addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      accItems.forEach((o) => { if (o !== item && o.classList.contains('is-open')) toggleAcc(o, false); });
      toggleAcc(item, willOpen);
    });
  });

  // newsletter (precisa de ligação a um serviço de e-mail)
  const news = $('[data-news]');
  const msg = $('[data-news-msg]');
  news.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('input', news);
    if (!input.checkValidity()) {
      msg.textContent = 'Indique um e-mail válido.';
      input.focus();
      return;
    }
    // TODO: ligar a um serviço de newsletter (Mailchimp, Brevo, FormSubmit…).
    msg.textContent = 'A subscrição online estará disponível em breve.';
  });

  if (!hasGsap || reduce) return;

  /* ---------- Animação ---------- */
  root.classList.add('motion');
  gsap.registerPlugin(ScrollTrigger);

  // rolagem suave
  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80 });
    }));
  }

  // barra de progresso
  gsap.to('.progress span', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  // separa palavras em máscaras
  const splitWords = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const i = document.createElement('span');
            i.textContent = part;
            w.appendChild(i);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    el.setAttribute('aria-label', el.textContent.trim());
    walk(el);
    $$('.w', el).forEach((w) => w.setAttribute('aria-hidden', 'true'));
    return $$('.w > span', el);
  };

  /* --- entrada do hero (uma vez, ao carregar) --- */
  const heroWords = splitWords($('.hero__title'));
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.header__inner > *', { y: -30, autoAlpha: 0, duration: 1, stagger: 0.08 })
    .fromTo('[data-hero]', { clipPath: 'inset(6% 4% 6% 4% round 40px)' }, { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 1.6, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
    .from('[data-hero-img]', { scale: 1.25, duration: 2.4, ease: 'expo.out' }, 0.1)
    .fromTo('[data-hero-in]', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.12 }, 0.7)
    .from(heroWords, { yPercent: 110, duration: 1.1, stagger: 0.035 }, 0.75)
    .fromTo('[data-plan-card]', { x: 60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.3 }, 1.1)
    .fromTo('.hero .reviews__faces img', { scale: 0 }, { scale: 1, duration: 0.6, stagger: 0.07, ease: 'back.out(2)', clearProps: 'transform' }, 1.4)
    .add(() => gsap.to('[data-plan-card]', { y: -10, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }));

  // parallax suave no hero
  gsap.to('[data-hero-img]', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__content', { y: -60, autoAlpha: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true } });

  /* --- títulos de secção: palavras sobem --- */
  $$('[data-split]').forEach((el) => {
    if (el.classList.contains('hero__title')) return;
    const words = splitWords(el);
    gsap.from(words, { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.03, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  // pills
  $$('[data-pop]').forEach((el) => {
    gsap.fromTo(el, { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(2.2)', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  // textos e botões
  $$('[data-reveal]').forEach((el) => {
    gsap.fromTo(el, { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: 'expo.out', clearProps: 'transform', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  // grelhas: cartões entram em cascata com máscara
  $$('[data-stagger]').forEach((grid) => {
    const cards = $$('[data-card]', grid);
    gsap.fromTo(cards,
      { y: 60, autoAlpha: 0, clipPath: 'inset(12% 0% 0% 0% round 15px)' },
      { y: 0, autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0% round 15px)', duration: 1.2, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: grid, start: 'top 82%' },
        clearProps: 'transform,clipPath' });
    $$('.card__bg', grid).forEach((img) => {
      gsap.fromTo(img, { scale: 1.2 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: grid, start: 'top 82%' }, onComplete: () => (img.style.transform = '') });
    });
  });

  // contador +2.000
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count;
    const obj = { v: 0 };
    gsap.to(obj, { v: end, duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' },
      onUpdate: () => (el.textContent = (el.dataset.prefix || '') + String(Math.round(obj.v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')) });
  });

  /* --- banner: frase sobe linha a linha + parallax --- */
  const bTitle = $('[data-lines]');
  if (bTitle) {
    const words = splitWords(bTitle);
    gsap.from(words, { yPercent: 110, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.025, scrollTrigger: { trigger: bTitle, start: 'top 80%' } });
  }
  $$('[data-parallax-box]').forEach((box) => {
    const img = $('[data-parallax-img]', box);
    gsap.fromTo(img, { yPercent: -8, scale: 1.08 }, { yPercent: 8, scale: 1, ease: 'none', scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo(box, { clipPath: 'inset(0% 3% 0% 3% round 15px)' }, { clipPath: 'inset(0% 0% 0% 0% round 15px)', ease: 'none', scrollTrigger: { trigger: box, start: 'top bottom', end: 'top 40%', scrub: true } });
  });

  // logo da faixa
  const bandLogo = $('[data-logo-in]');
  if (bandLogo) {
    gsap.fromTo(bandLogo, { scale: 0.7, autoAlpha: 0, filter: 'blur(10px)' }, { scale: 1, autoAlpha: 1, filter: 'blur(0px)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: bandLogo, start: 'top 85%' } });
  }

  /* --- serviços: cartões empilhados (sticky) --- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 821px)', () => {
    const items = $$('[data-stack] .stack__item');
    items.forEach((item, i) => {
      item.style.setProperty('--i', i);
      const card = $('.service', item);
      gsap.from(card, { y: 80, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: item, start: 'top 90%' } });
      if (i === items.length - 1) return;
      const next = items[i + 1];
      gsap.to(card, {
        scale: 0.92 + i * 0.015, ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top ' + (100 + (i + 1) * 18) + 'px', scrub: true },
      });
    });
  });
  mm.add('(max-width: 820px)', () => {
    $$('[data-stack] .service').forEach((card) => {
      gsap.from(card, { y: 50, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 88%' } });
    });
  });

  /* --- planos: imagem abre como cortina --- */
  $$('[data-wipe]').forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(0% 0% 0% 100% round 15px)' }, { clipPath: 'inset(0% 0% 0% 0% round 15px)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 80%' } });
    gsap.fromTo($('.card__bg', el), { scale: 1.3 }, { scale: 1, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 80%' }, onComplete: function () { this.targets()[0].style.transform = ''; } });
  });

  // acordeão em cascata
  gsap.fromTo('.acc', { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: '[data-accordion]', start: 'top 80%' } });

  /* --- CTA: padrão flutua --- */
  gsap.to('[data-float]', { y: 30, rotation: 4, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.from('.cta__box', { scale: 0.96, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.cta', start: 'top 85%' } });

  /* --- botões magnéticos --- */
  if (matchMedia('(pointer: fine)').matches) {
    $$('[data-magnetic]').forEach((btn) => {
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      btn.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
