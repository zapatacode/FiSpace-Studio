// ---- LOADER DE CARGA ----
(function () {
  const loader    = document.getElementById('page-loader');
  const barFill   = document.getElementById('loaderBarFill');
  const pctEl     = document.getElementById('loaderPct');
  const MIN_TIME  = 1600; // ms mínimo que se muestra el loader
  const startTime = Date.now();

  document.body.classList.add('loading');

  // Actualiza la barra y el porcentaje suavemente
  function setProgress(pct) {
    const clamped = Math.min(100, Math.max(0, pct));
    barFill.style.width = clamped + '%';
    pctEl.textContent   = Math.round(clamped) + '%';
  }

  // Oculta el loader con animación de salida
  function hideLoader() {
    setProgress(100);
    // Pequeño delay para que se vea el 100% antes de salir
    setTimeout(() => {
      loader.classList.add('loader-exit');
      loader.addEventListener('transitionend', () => {
        loader.style.display = 'none';
        document.body.classList.remove('loading');
      }, { once: true });
    }, 280);
  }

  // Recoge todas las imágenes de la página
  function getAllImages() {
    return Array.from(document.images);
  }

  // Rastrea el progreso de carga de imágenes
  function trackImages() {
    const imgs = getAllImages();
    if (imgs.length === 0) return Promise.resolve();

    let loaded = 0;
    return new Promise((resolve) => {
      function onLoad() {
        loaded++;
        setProgress((loaded / imgs.length) * 100);
        if (loaded >= imgs.length) resolve();
      }
      imgs.forEach((img) => {
        if (img.complete && img.naturalWidth > 0) {
          onLoad();
        } else {
          img.addEventListener('load',  onLoad, { once: true });
          img.addEventListener('error', onLoad, { once: true }); // contar errores también
        }
      });
    });
  }

  // Animación de progreso "falso" para dar feedback inmediato
  let fakeProgress = 0;
  const fakeInterval = setInterval(() => {
    // Avanza rápido al inicio y frena al acercarse a 85%
    const step = fakeProgress < 40 ? 4 : fakeProgress < 70 ? 2 : 0.5;
    fakeProgress = Math.min(85, fakeProgress + step);
    setProgress(fakeProgress);
  }, 80);

  // Espera: imágenes cargadas + tiempo mínimo
  Promise.all([
    trackImages(),
    new Promise(r => setTimeout(r, MIN_TIME))
  ]).then(() => {
    clearInterval(fakeInterval);
    hideLoader();
  });
})();

// ---- Header: se oculta al bajar, aparece al subir ----
const header = document.querySelector('header');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  header.classList.toggle('scrolled', currentScrollY > 20);

  if (currentScrollY > lastScrollY && currentScrollY > 80) {
    // Bajando → ocultar
    header.classList.add('hidden');
  } else if (currentScrollY < lastScrollY) {
    // Subiendo → mostrar
    header.classList.remove('hidden');
  }

  lastScrollY = currentScrollY;
}, { passive: true });

// ---- Flechas de navegación de pricing (desktop) ----
const pricingCardsEl  = document.querySelector('.pricing-cards');
const arrowLeft       = document.getElementById('pricingLeft');
const arrowRight      = document.getElementById('pricingRight');

if (pricingCardsEl && arrowLeft && arrowRight) {
  // Estado: false = mostrando cartas 1-3, true = mostrando carta 4
  let showingLast = false;

  function scrollToLast() {
    pricingCardsEl.scrollTo({ left: pricingCardsEl.scrollWidth, behavior: 'smooth' });
    showingLast = true;
    arrowRight.classList.add('hidden');
    arrowLeft.classList.remove('hidden');
  }

  function scrollToFirst() {
    pricingCardsEl.scrollTo({ left: 0, behavior: 'smooth' });
    showingLast = false;
    arrowLeft.classList.add('hidden');
    arrowRight.classList.remove('hidden');
  }

  arrowRight.addEventListener('click', scrollToLast);
  arrowLeft.addEventListener('click', scrollToFirst);
}

// ---- Dots indicadores de pricing scroll ----
const pricingCardsScroll = document.querySelector('.pricing-cards');
const dots = document.querySelectorAll('.scroll-dot');

if (pricingCardsScroll && dots.length) {
    pricingCardsScroll.addEventListener('scroll', () => {
        const totalScrollWidth = pricingCardsScroll.scrollWidth - pricingCardsScroll.clientWidth;
        const progress = pricingCardsScroll.scrollLeft / totalScrollWidth;
        const index = Math.round(progress * (dots.length - 1));
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }, { passive: true });
}

// ---- Player de video ----
const video         = document.getElementById('myVideo');
const overlay       = document.getElementById('videoOverlay');
const controls      = document.getElementById('videoControls');
const progressFill  = document.getElementById('progressFill');
const progressThumb = document.getElementById('progressThumb');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl   = document.getElementById('totalTime');
const iconPause     = document.getElementById('iconPause');
const iconPlay      = document.getElementById('iconPlay');
const iconExpand    = document.getElementById('iconExpand');
const iconCompress  = document.getElementById('iconCompress');
const wrapper       = document.getElementById('videoWrapper');

let state = 'idle';
let hideTimer;

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
}

video.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(video.duration);
});

if (video.readyState >= 1 && video.duration) {
    totalTimeEl.textContent = formatTime(video.duration);
}

video.addEventListener('timeupdate', () => {
    const pct = (video.currentTime / video.duration) * 100;
    progressFill.style.width  = pct + '%';
    progressThumb.style.left  = pct + '%';
    currentTimeEl.textContent = formatTime(video.currentTime);
});

function setPlaying() {
    state = 'playing';
    overlay.classList.add('hidden');
    controls.classList.add('visible');
    iconPause.style.display = '';
    iconPlay.style.display  = 'none';
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
        if (state === 'playing') controls.classList.remove('visible');
    }, 3000);
}

function setPaused() {
    state = 'paused';
    overlay.classList.add('hidden');
    controls.classList.add('visible');
    clearTimeout(hideTimer);
    iconPause.style.display = 'none';
    iconPlay.style.display  = '';
}

function setEnded() {
    state = 'ended';
    overlay.classList.remove('hidden');
    controls.classList.remove('visible');
    clearTimeout(hideTimer);
    video.currentTime = 0;
}

video.addEventListener('play', setPlaying);
video.addEventListener('pause', () => { if (state !== 'ended') setPaused(); });
video.addEventListener('ended', setEnded);

function playVideo() { video.play(); }

function togglePlay() {
    if (video.paused) { video.play(); } else { video.pause(); }
}

const tapCatcher = document.getElementById('tapCatcher');
let isTouchDevice = false;
window.addEventListener('touchstart', () => { isTouchDevice = true; }, { once: true, passive: true });

// Click en cualquier parte del video → mostrar/ocultar controles
wrapper.addEventListener('click', (e) => {
    if (controls.contains(e.target)) return; // ignorar clicks en los controles
    if (overlay.contains(e.target)) return;  // ignorar click en overlay (play inicial)
    if (state === 'idle' || state === 'ended') return;

    if (controls.classList.contains('visible')) {
        controls.classList.remove('visible');
        clearTimeout(hideTimer);
    } else {
        controls.classList.add('visible');
        clearTimeout(hideTimer);
        if (state === 'playing') {
            hideTimer = setTimeout(() => {
                if (state === 'playing') controls.classList.remove('visible');
            }, 3000);
        }
    }
});

wrapper.addEventListener('mousemove', () => {
    if (isTouchDevice) return; // en móvil el mousemove interfiere con el tap
    if (state === 'idle' || state === 'ended') return;
    controls.classList.add('visible');
    clearTimeout(hideTimer);
    if (state === 'playing') {
        hideTimer = setTimeout(() => {
            if (state === 'playing') controls.classList.remove('visible');
        }, 3000);
    }
});

function seekVideo(e) {
    const bar  = document.getElementById('progressBar');
    const rect = bar.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pct * video.duration;
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        wrapper.requestFullscreen ? wrapper.requestFullscreen() : wrapper.webkitRequestFullscreen();
    } else {
        document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen();
    }
}

document.addEventListener('fullscreenchange', () => {
    const isFs = !!document.fullscreenElement;
    iconExpand.style.display   = isFs ? 'none' : '';
    iconCompress.style.display = isFs ? '' : 'none';
});
document.addEventListener('webkitfullscreenchange', () => {
    const isFs = !!document.webkitFullscreenElement;
    iconExpand.style.display   = isFs ? 'none' : '';
    iconCompress.style.display = isFs ? '' : 'none';
});

// ---- Scroll suave ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});
// ---- Scroll Reveal: solo al bajar ----
(function () {
  // Guardamos la última posición de scroll para detectar dirección
  let lastRevealScrollY = window.scrollY;

  const revealEls = Array.from(document.querySelectorAll('.reveal'));

  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      // Dirección actual: bajando = true, subiendo = false
      const scrollingDown = window.scrollY >= lastRevealScrollY;

      entries.forEach((entry) => {
        if (entry.isIntersecting && scrollingDown) {
          // El elemento entró al viewport mientras se baja → animar
          entry.target.classList.add('visible');
          // Una vez revelado, dejar de observarlo
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,      // Se activa cuando el 12% del elemento es visible
      rootMargin: '0px 0px -40px 0px', // Pequeño margen para que no dispare al borde
    }
  );

  // Actualizar lastRevealScrollY en cada scroll
  window.addEventListener('scroll', () => {
    lastRevealScrollY = window.scrollY;
  }, { passive: true });

  revealEls.forEach((el) => observer.observe(el));
})();
