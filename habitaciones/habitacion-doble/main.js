/**
 * main.js — Landing Habitación Doble v2 · Hostal HDQ
 *
 * GOOGLE ADS — reemplaza y descomenta cuando tengas los IDs:
 *   AW-XXXXXXXXXX       → ID de cuenta Google Ads
 *   AW-XXXXXXXXXX/YYYY  → etiqueta de conversión WhatsApp
 *   AW-XXXXXXXXXX/ZZZZ  → etiqueta de conversión llamada (puede ser la misma)
 */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── gtag seguro ────────────────────────────────────────────── */
  function safeGtag() {
    if (typeof gtag === 'function') gtag.apply(null, arguments);
  }

  /* ── Topbar: agrega clase al hacer scroll ───────────────────── */
  var topbar = document.getElementById('topbar');
  if (topbar) {
    window.addEventListener('scroll', function () {
      topbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ── Sticky CTA: aparece al salir del hero ──────────────────── */
  var stickyCta = document.getElementById('stickyCta');
  var hero = document.querySelector('.hero');

  if (stickyCta && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      stickyCta.classList.toggle('show', !entries[0].isIntersecting);
    }, { threshold: 0.1 }).observe(hero);
  }

  /* ── Animaciones de entrada (reveal) ───────────────────────── */
  if (!reduced && 'IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObs.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ── Ken Burns en el hero ───────────────────────────────────── */
  var heroPhoto = document.getElementById('heroPhoto');
  if (heroPhoto && !reduced) {
    if (heroPhoto.complete) {
      heroPhoto.classList.add('loaded');
    } else {
      heroPhoto.addEventListener('load', function () {
        heroPhoto.classList.add('loaded');
      });
    }
  }

  /* ── Contadores animados ─────────────────────────────────────
     Los números en .stat__number suben desde 0 hasta data-count
  ─────────────────────────────────────────────────────────────── */
  if (!reduced && 'IntersectionObserver' in window) {
    var counters = document.querySelectorAll('[data-count]');
    var counterObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        counterObs.unobserve(e.target);
        var el       = e.target;
        var end      = parseFloat(el.dataset.count);
        var decimals = parseInt(el.dataset.decimals || '0', 10);
        var duration = 1200;
        var start    = performance.now();

        function tick(now) {
          var progress = Math.min((now - start) / duration, 1);
          /* ease out quart */
          var eased = 1 - Math.pow(1 - progress, 4);
          var value = eased * end;
          el.textContent = value.toFixed(decimals);
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = end.toFixed(decimals);
        }

        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (c) { counterObs.observe(c); });
  }

  /* ── Galería: dots + drag-to-scroll + lightbox ──────────────── */
  var track  = document.getElementById('galleryTrack');
  var dots   = document.querySelectorAll('.gallery-dot');
  var lbx    = document.getElementById('lbx');
  var lbxImg = document.getElementById('lbxImg');
  var lbxClose = document.getElementById('lbxClose');

  /* dots sincronizan con el scroll */
  if (track && dots.length) {
    track.addEventListener('scroll', function () {
      var slides    = track.querySelectorAll('.gallery-slide');
      var center    = track.scrollLeft + track.clientWidth / 2;
      var closest   = 0;
      var minDist   = Infinity;
      slides.forEach(function (s, i) {
        var dist = Math.abs(s.offsetLeft + s.offsetWidth / 2 - center);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      dots.forEach(function (d, i) { d.classList.toggle('active', i === closest); });
    }, { passive: true });
  }

  /* drag-to-scroll en escritorio */
  if (track) {
    var isDragging = false, startX, scrollLeft;

    track.addEventListener('mousedown', function (e) {
      isDragging = true;
      startX     = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.classList.add('is-dragging');
    });

    document.addEventListener('mouseup', function () {
      isDragging = false;
      track.classList.remove('is-dragging');
    });

    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      e.preventDefault();
      var x    = e.pageX - track.offsetLeft;
      var walk = (x - startX) * 1.4;
      track.scrollLeft = scrollLeft - walk;
    });
  }

  /* lightbox */
  function openLbx(src, alt) {
    if (!lbx || !lbxImg) return;
    lbxImg.src = src;
    lbxImg.alt = alt || '';
    lbx.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (lbxClose) lbxClose.focus();
  }

  function closeLbx() {
    if (!lbx) return;
    lbx.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.gallery-slide').forEach(function (slide) {
    function open() {
      var src = slide.dataset.src || slide.querySelector('img').src;
      var alt = slide.querySelector('img').alt;
      openLbx(src, alt);
    }
    slide.addEventListener('click', open);
    slide.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  if (lbxClose) lbxClose.addEventListener('click', closeLbx);
  if (lbx) lbx.addEventListener('click', function (e) { if (e.target === lbx) closeLbx(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLbx(); });

  /* ── FAQ accordion ──────────────────────────────────────────── */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item    = btn.closest('.faq-item');
      var isOpen  = item.classList.contains('open');

      /* cierra todos */
      document.querySelectorAll('.faq-item.open').forEach(function (i) {
        i.classList.remove('open');
        i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── Tracking de conversiones ───────────────────────────────── */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-cta]');
    if (!el) return;

    var cta = el.dataset.cta || '';

    if (cta.indexOf('whatsapp') !== -1) {
      safeGtag('event', 'whatsapp_click', { event_category: 'conversion', event_label: cta });
      /*
       * Google Ads — descomenta y reemplaza:
       * safeGtag('event', 'conversion', { 'send_to': 'AW-XXXXXXXXXX/YYYYYYYY' });
       */
    } else if (cta.indexOf('call') !== -1) {
      safeGtag('event', 'call_click', { event_category: 'conversion', event_label: cta });
      /*
       * Google Ads — descomenta y reemplaza:
       * safeGtag('event', 'conversion', { 'send_to': 'AW-XXXXXXXXXX/ZZZZZZZZ' });
       */
    }
  });

})();
