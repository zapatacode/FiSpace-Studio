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

// ---- Dots indicadores de pricing scroll ----
const pricingCards = document.querySelector('.pricing-cards');
const dots = document.querySelectorAll('.scroll-dot');

if (pricingCards && dots.length) {
    pricingCards.addEventListener('scroll', () => {
        const totalScrollWidth = pricingCards.scrollWidth - pricingCards.clientWidth;
        const progress = pricingCards.scrollLeft / totalScrollWidth;
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
