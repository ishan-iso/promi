(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Contact destinations stay in JavaScript instead of becoming document links. */
  $$('.contact-link').forEach(link => {
    const openContact = () => {
      const url = link.dataset.contactUrl;
      if (url && url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
    };
    link.addEventListener('click', openContact);
    link.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openContact();
      }
    });
  });

  /* Keep refreshes and navigation free of URL hashes. */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const cleanUrl = () => history.replaceState(null, document.title, `${location.pathname}${location.search}`);
  cleanUrl();
  scrollTo(0, 0);

  /* five-second nonlinear intro counter */
  const loader = $('#loader');
  const loaderPercent = $('#loaderPercent');
  document.documentElement.classList.add('is-loading');
  document.body.classList.add('is-loading');
  const loaderStart = performance.now();
  const loaderDuration = 5000;
  let loaderFinished = false;
  const finishLoader = () => {
    if (loaderFinished) return;
    loaderFinished = true;
    loader.classList.add('is-done');
    document.documentElement.classList.remove('is-loading');
    document.body.classList.remove('is-loading');
    startAmbient();
  };
  const animateLoader = now => {
    const progress = Math.min((now - loaderStart) / loaderDuration, 1);
    const eased = Math.pow(progress, 2.35);
    loaderPercent.textContent = `${Math.round(eased * 100)}%`;
    if (progress < 1) requestAnimationFrame(animateLoader);
    else finishLoader();
  };
  setTimeout(finishLoader, loaderDuration);
  requestAnimationFrame(animateLoader);

  /* ---------- department copy ---------- */
  const departments = [
    { title: 'Department of IT Research', body: [
      'The Department of Information Technology Research explores the technologies shaping the future of computation, digital systems, and artificial intelligence. It brings together technical research, emerging technologies, and interdisciplinary inquiry to examine both the capabilities and implications of modern technology.',
      'The Department focuses on developing rigorous technical understanding while making complex technological ideas accessible through research, analysis, and innovation.' ] },
    { title: 'Department of Social Media and Communications', body: [
      'The Department of Social Media and Communications manages the public-facing voice of Prometheus. It translates research, ideas, and institutional initiatives into clear and engaging communication for a wider audience.',
      'Through digital media, strategic communication, and audience-focused content, the Department connects academic work with the public and strengthens the organisation\'s digital presence.' ] },
    { title: 'Department of Humanities Research', body: [
      'The Department of Humanities Research examines human thought, culture, history, literature, philosophy, and the arts. It provides a space for critical inquiry into the ideas and cultural forces that shape individuals and societies.',
      'The Department encourages thoughtful, interdisciplinary research that connects the humanities with contemporary social, scientific, and technological questions.' ] },
    { title: 'Department of Commercial Research', body: [
      'The Department of Commercial Research examines business, economics, markets, entrepreneurship, and emerging industries. It studies how organisations, markets, and economic forces interact with technological and social change.',
      'Through structured research and analysis, the Department develops insights into commercial trends, industry developments, and the evolving relationship between innovation and enterprise.' ] },
    { title: 'Department of Scientific Research', body: [
      'The Department of Scientific Research is dedicated to systematic inquiry across the natural and applied sciences. Its work spans disciplines including physics, chemistry, biology, mathematics, environmental science, and interdisciplinary research.',
      'The Department promotes rigorous methodology, evidence-based investigation, and analytical thinking, providing a foundation for original scientific inquiry and academic exploration.' ] },
    { title: 'Department of External Communication', body: [
      'The Department of External Communication develops and maintains Prometheus\'s relationships with institutions and individuals beyond the organisation.',
      'It coordinates academic outreach, institutional correspondence, partnerships, and external initiatives, connecting Prometheus with universities, research institutions, industry, public organisations, and other relevant communities.' ] },
    { title: 'Department of Internal Logistics', body: [
      'The Department of Internal Logistics is responsible for the coordination and operational continuity of Prometheus. It ensures that departments, projects, research activities, and institutional initiatives function efficiently and cohesively.',
      'The Department manages internal coordination, planning, scheduling, documentation, and operational requirements, providing the infrastructure necessary for the organisation\'s work to move forward.' ] },
    { title: 'Department of Publication', body: [
      'The Department of Publication is responsible for transforming research and ideas into formally structured academic work. It oversees the editorial process, research review, publication standards, and preservation of the organisation\'s intellectual output.',
      'Working across departments, it develops and maintains Prometheus\'s journals, research papers, policy briefs, reports, and other publications while upholding standards of clarity, academic integrity, and editorial quality.' ] }
  ];

  /* Background music starts after the loader or the first user interaction. */
  const soundToggle = $('#soundToggle');
  const backgroundMusic = $('#backgroundMusic');
  backgroundMusic.muted = false;
  backgroundMusic.loop = true;
  backgroundMusic.preload = 'auto';
  backgroundMusic.volume = 0.35;
  const updateSoundToggle = isOn => {
    soundToggle.classList.toggle('is-on', isOn);
    soundToggle.setAttribute('aria-pressed', String(isOn));
    soundToggle.setAttribute('aria-label', `Turn ambient sound ${isOn ? 'off' : 'on'}`);
  };
  const startAmbient = () => {
    backgroundMusic.muted = false;
    const playAttempt = backgroundMusic.play();
    if (!playAttempt) {
      updateSoundToggle(true);
      return;
    }
    playAttempt.then(() => {
      updateSoundToggle(true);
    }).catch(error => {
      updateSoundToggle(true);
      console.warn('Background music is waiting for a user interaction allowed by the browser.', error);
    });
  };
  const stopAmbient = () => {
    backgroundMusic.pause();
    updateSoundToggle(false);
  };
  const toggleAmbient = () => {
    if (backgroundMusic.paused) startAmbient();
    else stopAmbient();
  };
  backgroundMusic.addEventListener('ended', () => updateSoundToggle(false));
  backgroundMusic.addEventListener('error', () => {
    updateSoundToggle(false);
    console.error('Unable to load assets/bg.mp3.');
  });
  soundToggle.addEventListener('click', toggleAmbient);
  const retryAmbientAfterInteraction = event => {
    if (event.target.closest('#soundToggle')) return;
    if (backgroundMusic.paused) startAmbient();
  };
  addEventListener('pointerdown', retryAmbientAfterInteraction);
  addEventListener('keydown', retryAmbientAfterInteraction);
  startAmbient();

  /* infinite scroller: render once, clone once, CSS slides the track by exactly half */
  const track = $('#track');
  const scroller = $('#scroller');
  const card = d => {
    const a = document.createElement('article');
    a.className = 'card';
    a._department = d;
    a.innerHTML = `<div class="card__wash"></div><h3>${d.title.replace('&', '&amp;')}</h3><button class="card__button" type="button" aria-label="Open ${d.title}"><span>ENTER</span><b>↗</b></button>`;
    a.addEventListener('click', e => {
      if (e.target.closest('.card__button')) return;
      openDepartment(d);
    });
    a.querySelector('.card__button').addEventListener('click', () => openDepartment(d));
    return a;
  };
  departments.forEach(d => track.appendChild(card(d)));
  departments.forEach(d => { const c = card(d); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); });
  /* trailing gap so the loop seam is the same width as every other gap */
  track.style.paddingRight = getComputedStyle(track).columnGap;

  /* keep native wheel and drag scrolling inside the duplicated loop */
  const wrapScroll = () => {
    const loopWidth = track.scrollWidth / 2;
    if (!loopWidth) return;
    if (scroller.scrollLeft <= 0) scroller.scrollLeft += loopWidth;
    else if (scroller.scrollLeft >= loopWidth) scroller.scrollLeft -= loopWidth;
  };
  scroller.addEventListener('scroll', wrapScroll, { passive: true });

  /* Keep automatic motion and manual scrolling on the same scroll axis. */
  let railPaused = false;
  const setRailPaused = value => { railPaused = value; };
  scroller.addEventListener('mouseenter', () => setRailPaused(true));
  scroller.addEventListener('mouseleave', () => setRailPaused(false));
  scroller.addEventListener('focusin', () => setRailPaused(true));
  scroller.addEventListener('focusout', () => setRailPaused(false));
  const moveRail = () => {
    if (!reduce && !railPaused && !dragging && !document.body.classList.contains('is-dept-open')) {
      scroller.scrollLeft += 0.35;
      wrapScroll();
    }
    requestAnimationFrame(moveRail);
  };
  requestAnimationFrame(moveRail);

  /* drag the department rail with the pointer without selecting its text */
  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragging = false;
  let pressedCard = null;
  let pressedCardX = 0;
  scroller.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    wrapScroll();
    pressedCard = e.target.closest('.card');
    pressedCardX = e.clientX;
    dragStartX = e.clientX;
    dragStartScroll = scroller.scrollLeft;
    dragging = true;
    scroller.classList.add('is-dragging');
    scroller.setPointerCapture(e.pointerId);
  });
  scroller.addEventListener('pointermove', e => {
    if (!dragging) return;
    scroller.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
    wrapScroll();
  });
  const stopDragging = e => {
    if (!dragging) return;
    const shouldOpenCard = pressedCard && Math.abs(e.clientX - pressedCardX) < 8 && !e.target.closest('.card__button');
    dragging = false;
    scroller.classList.remove('is-dragging');
    if (scroller.hasPointerCapture(e.pointerId)) scroller.releasePointerCapture(e.pointerId);
    if (shouldOpenCard) openDepartment(pressedCard._department);
    pressedCard = null;
  };
  scroller.addEventListener('pointerup', stopDragging);
  scroller.addEventListener('pointercancel', stopDragging);

  /* One detail surface gives every department a page without multiplying markup. */
  const deptPage = $('#deptPage');
  const fitDepartmentTitle = () => {
    const title = $('#deptPageTitle');
    title.style.fontSize = '';
    if (getComputedStyle(title).whiteSpace !== 'nowrap') return;
    const available = title.parentElement.clientWidth;
    const width = title.scrollWidth;
    if (width > available) {
      title.style.fontSize = `${parseFloat(getComputedStyle(title).fontSize) * available / width}px`;
    }
  };
  const openDepartment = d => {
    const index = departments.indexOf(d);
    $('#deptIndex').textContent = `${String(index + 1).padStart(2, '0')} / ${String(departments.length).padStart(2, '0')}`;
    $('#deptPageTitle').textContent = d.title.replace('Department of ', '');
    fitDepartmentTitle();
    $('#deptPageLead').textContent = d.body[0];
    $('#deptPageBody').innerHTML = d.body.slice(1).map(p => `<p>${p}</p>`).join('');
    deptPage.classList.add('is-open');
    deptPage.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-dept-open');
  };
  const closeDepartment = () => {
    deptPage.classList.remove('is-open');
    deptPage.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-dept-open');
    track.classList.add('is-cooling');
    setTimeout(() => track.classList.remove('is-cooling'), 650);
  };
  $('#deptClose').addEventListener('click', closeDepartment);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeDepartment(); });

  /* ---------- fit big type to the artboard width ---------- */
  const fit = (el, targetU, from) => {
    const u = Math.min(innerWidth / 100, innerHeight / 56.25);
    const unit = innerWidth <= 820 ? innerWidth / 100 : u;
    el.style.fontSize = '';
    if (!from) return;
    const target = targetU * unit;
    const w = from.getBoundingClientRect().width;
    const cur = parseFloat(getComputedStyle(el).fontSize);
    if (w) el.style.fontSize = (cur * target / w) + 'px';
  };
  const fitAll = () => {
    const mobile = innerWidth <= 820;
    fit($('#heroTitle'), mobile ? 88 : 68, $('#heroTitle .l1'));
    fit($('#contactTitle'), mobile ? 90 : 94.8, $('#contactTitle'));
    fitNav();
  };

  /* keep every nav label the same width, like a fitted wordmark */
  function fitNav() {
    const nav = $('.nav');
    const links = $$('.nav a, .nav button', nav);
    links.forEach(link => { link.style.fontSize = ''; });
    const target = Math.max(...links.map(link => link.getBoundingClientRect().width));
    links.forEach(link => {
      const width = link.getBoundingClientRect().width;
      if (width) link.style.fontSize = `${parseFloat(getComputedStyle(link).fontSize) * target / width}px`;
    });
  }

  /* ---------- lit grid cells ---------- */
  const grid = $('#grid');
  let cells = [];
  const buildCells = () => {
    grid.innerHTML = ''; cells = [];
    const u = innerWidth <= 820 ? innerWidth / 100 : Math.min(innerWidth / 100, innerHeight / 56.25);
    const size = u * 4.72;
    const cols = Math.floor(innerWidth / size), rows = Math.floor(document.documentElement.scrollHeight / size);
    const n = Math.round(cols * rows * 0.018);
    for (let i = 0; i < n; i++) {
      const i_ = document.createElement('i');
      i_.style.cssText = `width:${size}px;height:${size}px;left:${Math.floor(Math.random() * cols) * size}px;top:${Math.floor(Math.random() * rows) * size}px`;
      grid.appendChild(i_); cells.push(i_);
    }
    cells.forEach(c => c.classList.add('on'));
  };
  let t;
  const drift = () => {
    if (!reduce && cells.length) {
      const c = cells[Math.floor(Math.random() * cells.length)];
      c.classList.toggle('on');
    }
    t = setTimeout(drift, 900);
  };

  /* ---------- nav state ---------- */
  const links = $$('.nav a, .nav button');
  const nav = $('.nav');
  const navToggle = $('#navToggle');
  const closeNav = () => {
    nav.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');
  };
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', `${isOpen ? 'Close' : 'Open'} navigation`);
  });
  links.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const target = document.getElementById(link.dataset.target);
      if (!target) return;
      closeNav();
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      cleanUrl();
    });
  });
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle('is-active', l.dataset.target === e.target.id));
    });
  }, { threshold: 0.5 });
  $$('.sec').forEach(s => io.observe(s));

  /* ---------- hero hand follows the pointer a little ---------- */
  const hand = $('#heroHand');
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', e => {
      const x = (e.clientX / innerWidth - .5) * -14, y = (e.clientY / innerHeight - .5) * -10;
      hand.style.transform = `translate(${x}px,${y}px)`;
    }, { passive: true });
  }

  /* ---------- boot ---------- */
  const boot = () => { fitAll(); buildCells(); };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { boot(); drift(); });
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(boot, 150); });
})();
