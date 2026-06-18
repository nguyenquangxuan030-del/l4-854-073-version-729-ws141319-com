(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    var play = function () {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        play();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        play();
      });
    });

    showSlide(0);
    play();
  }

  var filterPanels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  filterPanels.forEach(function (panel) {
    var root = panel.parentElement;
    var searchInput = panel.querySelector('[data-search-input]');
    var regionFilter = panel.querySelector('[data-region-filter]');
    var typeFilter = panel.querySelector('[data-type-filter]');
    var yearFilter = panel.querySelector('[data-year-filter]');
    var resetButton = panel.querySelector('[data-reset-filter]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
    var emptyState = root.querySelector('[data-empty-state]');

    var apply = function () {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var region = regionFilter ? regionFilter.value : '';
      var type = typeFilter ? typeFilter.value : '';
      var year = yearFilter ? yearFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
        var cardRegion = card.getAttribute('data-region') || '';
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var match = true;

        if (keyword && text.indexOf(keyword) === -1) {
          match = false;
        }

        if (region && cardRegion !== region) {
          match = false;
        }

        if (type && cardType !== type) {
          match = false;
        }

        if (year && cardYear !== year) {
          match = false;
        }

        card.style.display = match ? '' : 'none';

        if (match) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    };

    if (searchInput) {
      searchInput.addEventListener('input', apply);
    }

    [regionFilter, typeFilter, yearFilter].forEach(function (select) {
      if (select) {
        select.addEventListener('change', apply);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }

        [regionFilter, typeFilter, yearFilter].forEach(function (select) {
          if (select) {
            select.value = '';
          }
        });

        apply();
      });
    }
  });

  var chipButtons = Array.prototype.slice.call(document.querySelectorAll('[data-chip]'));

  chipButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var panel = document.querySelector('[data-filter-panel]');
      var input = panel ? panel.querySelector('[data-search-input]') : null;

      if (input) {
        input.value = button.getAttribute('data-chip') || '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  var video = document.getElementById('movieVideo');
  var playButton = document.getElementById('playButton');

  if (video && playButton) {
    var hlsInstance = null;

    var startVideo = function () {
      var url = video.getAttribute('data-play');

      if (!url) {
        return;
      }

      playButton.classList.add('is-hidden');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.src !== url) {
          video.src = url;
        }

        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.play().catch(function () {});
        }
        return;
      }

      if (video.src !== url) {
        video.src = url;
      }

      video.play().catch(function () {});
    };

    playButton.addEventListener('click', startVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });
    video.addEventListener('play', function () {
      playButton.classList.add('is-hidden');
    });
  }
})();
