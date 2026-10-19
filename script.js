// ===== Scroll progress =====
const progress = document.getElementById('scrollProgress');
const header = document.getElementById('siteHeader');

function onScroll() {
  const h = document.documentElement;
  const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
  progress.style.width = (scrolled * 100) + '%';
  if (h.scrollTop > 30) header.classList.add('shrink');
  else header.classList.remove('shrink');
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Reveal on scroll =====
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const delay = e.target.dataset.delay || 0;
      setTimeout(() => e.target.classList.add('in'), delay);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
revealEls.forEach((el, i) => {
  el.dataset.delay = (i % 4) * 80;
  io.observe(el);
});

// ===== Counter animation =====
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1600;
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const p = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(eased * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}

const statNums = document.querySelectorAll('.stat-num[data-target]');
const statIo = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      statIo.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
statNums.forEach(el => statIo.observe(el));

// ===== Mobile nav =====
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
navToggle.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// ===== Card expand/collapse =====
document.querySelectorAll('.card-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const expand = document.getElementById(targetId);
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      expand.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.querySelector('.toggle-text').textContent = 'Подробнее';
    } else {
      expand.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      btn.querySelector('.toggle-text').textContent = 'Свернуть';
    }
  });
});

// ===== Donation amount presets =====
const amountInput = document.getElementById('amount');
const presets = document.getElementById('presets');
const donateForm = document.getElementById('donateForm');
const receiptPriceInput = donateForm.querySelector('input[name="price"]');
const receiptPriceOutput = donateForm.querySelector('.ym-product-price');

function syncDonationAmount() {
  const amount = Number.parseFloat(amountInput.value);
  if (!Number.isFinite(amount) || amount <= 0) return;

  const formattedAmount = amount.toFixed(2);
  receiptPriceInput.value = formattedAmount;
  receiptPriceInput.setAttribute('value', formattedAmount);
  receiptPriceOutput.dataset.price = formattedAmount;
  receiptPriceOutput.textContent = `${formattedAmount.replace('.', ',')} ₽`;
}

presets.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    amountInput.value = btn.dataset.amount;
    syncDonationAmount();
    presets.querySelectorAll('button').forEach(item => item.classList.remove('active'));
    btn.classList.add('active');
  });
});

amountInput.addEventListener('input', () => {
  syncDonationAmount();
  presets.querySelectorAll('button').forEach(item => {
    item.classList.toggle('active', item.dataset.amount === amountInput.value);
  });
});

donateForm.addEventListener('submit', (event) => {
  const amount = Number.parseFloat(amountInput.value);
  if (!Number.isFinite(amount) || amount < 50) {
    event.preventDefault();
    event.stopImmediatePropagation();
    alert('Введите сумму от 50 ₽');
    amountInput.focus();
    return;
  }
  syncDonationAmount();
}, true);

syncDonationAmount();

// ===== Modal with focus trap =====
const helpModal = document.getElementById('helpModal');
const needHelpBtn = document.getElementById('needHelpBtn');
const helpClose = document.getElementById('helpClose');
const helpBackdrop = document.getElementById('helpBackdrop');

function openHelp() {
  helpModal.classList.add('open');
  helpModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  helpClose.focus();
  trapFocus(helpModal);
}
function closeHelp() {
  helpModal.classList.remove('open');
  helpModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  needHelpBtn.focus();
}

function trapFocus(element) {
  const focusableEls = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableEls[0];
  const lastFocusable = focusableEls[focusableEls.length - 1];

  element.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  });
}

needHelpBtn.addEventListener('click', openHelp);
helpClose.addEventListener('click', closeHelp);
helpBackdrop.addEventListener('click', closeHelp);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && helpModal.classList.contains('open')) {
    closeHelp();
  }
});

// ===== Parallax blobs =====
let ticking = false;
function onHeroScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      const y = window.scrollY;
      document.querySelectorAll('.blob').forEach((b, i) => {
        b.style.transform = `translateY(${y * (i + 1) * 0.025}px)`;
      });
      ticking = false;
    });
    ticking = true;
  }
}
window.addEventListener('scroll', onHeroScroll, { passive: true });
