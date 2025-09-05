/* script.js
   Implementa:
   - spawn contínuo de corações/estrelas subindo no fundo
   - clique na tela => texto "Eu te amo" + explosão de pequenos corações
   - clique no nome "Nayd" => mensagem no topo com efeito cursivo
*/

(() => {
  const palette = ['#FFFFFF', '#FFB3C6', '#E0BBE4', '#957DAD', '#D291BC', '#FEC8D8'];
  const backgroundLayer = document.getElementById('background-layer');
  const clickLayer = document.getElementById('click-layer');
  const naydButton = document.getElementById('nayd');
  const topMessage = document.getElementById('top-message');

  /* UTIL: random helpers */
  const rand = (a,b) => Math.random()*(b-a)+a;
  const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];

  /* ---------- BACKGROUND: spawn hearts/stars that float up ---------- */
  function spawnBackgroundItem() {
    const isHeart = Math.random() < 0.68; // more hearts than stars
    const el = document.createElement('div');
    el.classList.add(isHeart ? 'bg-heart' : 'bg-star');

    // size classes for variety
    const sizeClass = Math.random() < 0.5 ? 'small' : (Math.random()<0.5 ? 'medium' : 'large');
    if (isHeart) el.classList.add(sizeClass);

    // random horizontal start near bottom
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const left = rand(4, 96); // percentage
    el.style.left = left + 'vw';

    // choose a color from palette
    const color = pick(palette);
    el.style.backgroundColor = color;

    // animation length & slight horizontal drift, delay for organic effect
    const duration = rand(8, 18); // seconds
    const delay = rand(0, 3); // sec

    // set initial position from bottom
    const startY = rand(88, 110); // percent of viewport height
    el.style.bottom = startY + 'vh';
    el.style.opacity = 0;

    // set animation via CSS
    el.style.animation = `floatUp ${duration}s linear ${delay}s forwards`;
    el.style.filter = `drop-shadow(0 0 ${Math.max(6, Math.min(18, duration))}px ${color})`;

    // small transform origin to vary scale
    el.style.transform = `translateY(0) scale(${rand(0.7,1.05)})`;

    // append and auto-remove when animation ends
    backgroundLayer.appendChild(el);
    // cleanup after animation completes (duration + delay)
    setTimeout(()=> {
      if (el && el.parentElement) backgroundLayer.removeChild(el);
    }, (duration + delay) * 1000 + 800);
  }

  // spawn at intervals (staggered)
  const bgInterval = setInterval(spawnBackgroundItem, 700);
  // spawn a few immediately to fill scene
  for (let i=0;i<6;i++) setTimeout(spawnBackgroundItem, i*200);

  /* ---------- CLICK: "Eu te amo" + hearts burst ---------- */
  function createClickText(x, y) {
    const txt = document.createElement('div');
    txt.className = 'click-text';
    txt.textContent = 'Eu te amo';
    txt.style.left = x + 'px';
    txt.style.top = y + 'px';
    clickLayer.appendChild(txt);

    // trigger animation
    // small timeout to ensure it's in DOM
    requestAnimationFrame(()=> {
      txt.classList.add('show');
    });

    // create burst hearts
    createBurst(x, y);

    // remove after animation (match CSS: 1.1s)
    setTimeout(()=> {
      if (txt && txt.parentElement) txt.parentElement.removeChild(txt);
    }, 1100 + 120);
  }

  function createBurst(cx, cy) {
    const count = 8;
    for (let i=0; i<count; i++) {
      const h = document.createElement('div');
      h.className = 'burst-heart';
      // color pick
      const color = pick(palette);
      h.style.backgroundColor = color;

      // size random
      const size = rand(8, 20);
      h.style.width = `${size}px`;
      h.style.height = `${size}px`;

      // position centered at click
      h.style.left = `${cx - size/2}px`;
      h.style.top  = `${cy - size/2}px`;

      // random angle and distance
      const angle = rand(0, Math.PI*2);
      const dist = rand(24, 72);
      const dx = Math.cos(angle)*dist;
      const dy = Math.sin(angle)*dist * -1; // negative to go up slightly

      // store as css var for animation
      h.style.setProperty('--dx', `${dx}px`);
      h.style.setProperty('--dy', `${dy}px`);
      h.style.transform = 'translate(0,0) scale(0.9)';
      h.style.opacity = 1;
      h.style.borderRadius = '3px';
      h.style.backgroundClip = 'padding-box';
      h.style.mask = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\'><path d=\'M16 29s-13-7.4-13-16a7 7 0 0 1 13-4 7 7 0 0 1 13 4c0 8.6-13 16-13 16z\'/></svg>") center/contain no-repeat';
      h.style.webkitMask = h.style.mask;

      // apply animation
      h.style.animation = `burst ${rand(700,1100)}ms cubic-bezier(.2,.8,.2,1) forwards`;

      clickLayer.appendChild(h);
      // cleanup
      setTimeout(()=> { if (h && h.parentElement) h.parentElement.removeChild(h); }, 1300);
    }
  }

  /* Global click handler (excluding clicks on the Nayd button) */
  document.addEventListener('click', (ev) => {
    const target = ev.target;
    // If clicked the 'nayd' button itself, do not spawn the click-text here (that handler separate)
    if (target && (target.id === 'nayd' || target.closest && target.closest('#nayd'))) return;
    // compute coordinates
    const x = ev.clientX;
    const y = ev.clientY;
    createClickText(x, y);
  });

  /* ---------- CLICK ON "Nayd": show top message ---------- */
  naydButton.addEventListener('click', (ev) => {
    ev.stopPropagation(); // prevent global click handler from creating a click-text
    showTopMessage('Ainda não consigo expressar o quanto eu te amo.');
  });

  function showTopMessage(text) {
    topMessage.textContent = text;
    topMessage.classList.remove('show');
    // force reflow to restart animation
    void topMessage.offsetWidth;
    topMessage.classList.add('show');
    // top-show animation hides itself after 2s (CSS)
    // ensure removal of class after animation ends to allow repetition
    setTimeout(() => topMessage.classList.remove('show'), 2000 + 100);
  }

  /* Accessibility: allow keyboard Enter on name */
  naydButton.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      naydButton.click();
    }
  });

  /* Ensure layers are full-screen positioned */
  backgroundLayer.style.position = 'fixed';
  backgroundLayer.style.left = 0;
  backgroundLayer.style.right = 0;
  backgroundLayer.style.bottom = 0;
  backgroundLayer.style.top = 0;
  backgroundLayer.style.pointerEvents = 'none';
  backgroundLayer.style.zIndex = 1;

  clickLayer.style.position = 'fixed';
  clickLayer.style.left = 0;
  clickLayer.style.right = 0;
  clickLayer.style.bottom = 0;
  clickLayer.style.top = 0;
  clickLayer.style.zIndex = 40;
  clickLayer.style.pointerEvents = 'none';

  // Clean-up on page unload just in case
  window.addEventListener('beforeunload', () => clearInterval(bgInterval));
})();
