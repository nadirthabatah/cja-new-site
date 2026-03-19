/* =========================================================
   Chandler Judo Academy — App JavaScript
   ========================================================= */

(function () {
  'use strict';

  /* --- Hero Video via YouTube IFrame API --- */
  (function initHeroVideo() {
    var heroPlayer = null;
    var hasStartedPlaying = false;

    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(tag, firstScript);

    window.onYouTubeIframeAPIReady = function () {
      heroPlayer = new YT.Player('hero-yt-player', {
        videoId: 'Ts9tnJt2p7w',
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          loop: 1,
          playlist: 'Ts9tnJt2p7w',
          origin: window.location.origin
        },
        events: {
          onReady: function (e) {
            e.target.mute();
            e.target.playVideo();

            // iOS Safari sometimes ignores the first playVideo call.
            // Retry a few times with increasing delays.
            setTimeout(function () {
              if (!hasStartedPlaying) { e.target.mute(); e.target.playVideo(); }
            }, 500);
            setTimeout(function () {
              if (!hasStartedPlaying) { e.target.mute(); e.target.playVideo(); }
            }, 1500);
            setTimeout(function () {
              if (!hasStartedPlaying) { e.target.mute(); e.target.playVideo(); }
            }, 3000);
          },
          onStateChange: function (e) {
            // YT.PlayerState.PLAYING === 1
            if (e.data === 1) {
              hasStartedPlaying = true;
            }
            // YT.PlayerState.ENDED === 0 — restart for seamless loop
            if (e.data === 0) {
              e.target.seekTo(0);
              e.target.playVideo();
            }
          },
          onError: function () {
            // If video fails to load, the CSS gradient background
            // on .hero__video-wrap acts as the graceful fallback
          }
        }
      });

      // Apply CSS class to the iframe created by the API
      var check = setInterval(function () {
        var iframe = document.querySelector('#hero-yt-player');
        if (iframe && iframe.tagName === 'IFRAME') {
          iframe.classList.add('hero__video');
          iframe.setAttribute('tabindex', '-1');
          iframe.setAttribute('aria-hidden', 'true');
          clearInterval(check);
        }
      }, 100);
    };

    // On iOS in-app browsers, autoplay may require a user gesture.
    // Listen for the first touch/click anywhere on the page and
    // try to start the video if it hasn't started yet.
    function tryPlayOnInteraction() {
      if (heroPlayer && heroPlayer.playVideo && !hasStartedPlaying) {
        try {
          heroPlayer.mute();
          heroPlayer.playVideo();
        } catch (err) { /* ignore */ }
      }
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', tryPlayOnInteraction);
      document.removeEventListener('click', tryPlayOnInteraction);
    }
    document.addEventListener('touchstart', tryPlayOnInteraction, { passive: true });
    document.addEventListener('click', tryPlayOnInteraction);
  })();

  /* --- Mobile Navigation Toggle --- */
  const navToggle = document.querySelector('.nav__toggle');
  const navMenu = document.querySelector('.nav__menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
      navMenu.classList.toggle('is-open');
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
        navMenu.classList.remove('is-open');
      });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
        navMenu.classList.remove('is-open');
        navToggle.focus();
      }
    });
  }


  /* --- Sticky Nav Shadow on Scroll --- */
  const siteNav = document.getElementById('site-nav');
  if (siteNav) {
    var lastScrollY = 0;
    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY || window.pageYOffset;
      if (scrollY > 20) {
        siteNav.classList.add('nav--scrolled');
      } else {
        siteNav.classList.remove('nav--scrolled');
      }
      lastScrollY = scrollY;
    }, { passive: true });
  }


  /* --- Scroll Reveal --- */
  var revealElements = [
    '.testimonial-card',
    '.program-card',
    '.step',
    '.about__photo',
    '.about__bio',
    '.after-school__content',
    '.final-cta__inner',
    '.community__content'
  ];

  // Add reveal class to elements
  revealElements.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.classList.add('reveal');
    });
  });

  // Also add stagger class to grids
  document.querySelectorAll('.testimonials__grid, .programs__grid, .steps__grid').forEach(function (el) {
    el.classList.add('reveal-stagger');
  });

  // Intersection Observer for reveals
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show everything
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }


  /* --- Trial Form Handling (Formspree) --- */
  var trialForm = document.getElementById('trial-form');
  if (trialForm) {
    trialForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameField = document.getElementById('trial-name');
      var phoneField = document.getElementById('trial-phone');
      var emailField = document.getElementById('trial-email');
      var interestField = document.getElementById('trial-interest');
      var isValid = true;

      [nameField, phoneField, emailField, interestField].forEach(function (field) {
        field.style.borderColor = '';
        if (!field.value.trim() || (field.type === 'email' && !field.value.includes('@'))) {
          field.style.borderColor = '#c81e1e';
          isValid = false;
        }
      });

      if (!isValid) return;

      var submitBtn = trialForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      var formData = {
        name: nameField.value,
        phone: phoneField.value,
        email: emailField.value,
        interest: interestField.value
      };

      fetch('https://formspree.io/f/mgondlpe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formData)
      })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.ok) {
          trialForm.innerHTML =
            '<div class="trial-form--success">' +
              '<div class="trial-form__success-icon">' +
                '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
              '</div>' +
              '<h3 class="trial-form__success-title">You\'re All Set!</h3>' +
              '<p class="trial-form__success-text">Thank you! We\'ll text or email you shortly to schedule your free class.</p>' +
              '<p class="trial-form__success-text" style="margin-top:12px;">Questions? Call or text <a href="tel:5189563773" style="color:#c81e1e;text-decoration:none;font-weight:600;">(518) 956-3773</a></p>' +
            '</div>';
        } else {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Start Free Trial';
          }
          alert('Something went wrong. Please try again or call us at (518) 956-3773.');
        }
      })
      .catch(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Start Free Trial';
        }
        alert('Something went wrong. Please try again or call us at (518) 956-3773.');
      });
    });
  }


  /* --- Smooth Scroll for Anchor Links --- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
