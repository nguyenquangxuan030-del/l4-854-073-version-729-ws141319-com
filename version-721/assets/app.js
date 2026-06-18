(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
    var current = 0;

    function setSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search-input'));
  var searchData = window.SiteSearchData || [];

  searchInputs.forEach(function (input) {
    var box = input.parentElement ? input.parentElement.querySelector('.search-results') : null;

    if (!box) {
      return;
    }

    function renderResults(query) {
      var keyword = query.trim().toLowerCase();

      if (!keyword) {
        box.hidden = true;
        box.innerHTML = '';
        return;
      }

      var results = searchData.filter(function (item) {
        return item.search.toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 9);

      if (!results.length) {
        box.innerHTML = '<div class="search-result-item"><div></div><span>没有找到匹配影片</span></div>';
        box.hidden = false;
        return;
      }

      box.innerHTML = results.map(function (item) {
        return '<a class="search-result-item" href="./' + item.file + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
          '<span><strong>' + escapeHtml(item.title) + '</strong>' +
          escapeHtml(item.region + ' · ' + item.year + ' · ' + item.genre) + '</span>' +
          '</a>';
      }).join('');
      box.hidden = false;
    }

    input.addEventListener('input', function () {
      renderResults(input.value);
    });

    document.addEventListener('click', function (event) {
      if (!input.parentElement.contains(event.target)) {
        box.hidden = true;
      }
    });
  });

  var pageSearch = document.querySelector('[data-page-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var activeFilter = 'all';

  function applyPageFilter() {
    var keyword = pageSearch ? pageSearch.value.trim().toLowerCase() : '';

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
      var filterOk = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
      var searchOk = !keyword || text.indexOf(keyword) !== -1;
      card.hidden = !(filterOk && searchOk);
    });
  }

  if (pageSearch) {
    pageSearch.addEventListener('input', applyPageFilter);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (item) {
        item.classList.remove('is-active');
      });
      chip.classList.add('is-active');
      activeFilter = chip.getAttribute('data-filter-value') || 'all';
      applyPageFilter();
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.play-overlay');
    var source = player.getAttribute('data-video');
    var attached = false;

    function attachSource() {
      if (attached || !video || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      attached = true;
    }

    function startVideo() {
      attachSource();
      player.classList.add('is-playing');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay && video) {
      overlay.addEventListener('click', startVideo);
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
    }
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }
})();
