(function () {
  var site = {};

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = one("[data-menu-toggle]");
    var panel = one("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHeaderSearch() {
    all("[data-site-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = one("input", form);
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "./search.html?q=" + encodeURIComponent(query);
        }
      });
    });
  }

  function setupHero() {
    var slides = all("[data-hero-slide]");
    var dots = all("[data-hero-dot]");
    if (!slides.length) {
      return;
    }

    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function setupFiltering() {
    var grids = all("[data-filter-grid]");
    grids.forEach(function (grid) {
      var scope = grid.closest("[data-filter-scope]") || document;
      var search = one("[data-filter-search]", scope);
      var year = one("[data-filter-year]", scope);
      var type = one("[data-filter-type]", scope);
      var empty = one("[data-empty-state]", scope);
      var cards = all("[data-movie-card]", grid);

      function apply() {
        var q = normalize(search ? search.value : "");
        var selectedYear = normalize(year ? year.value : "");
        var selectedType = normalize(type ? type.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardType = normalize(card.getAttribute("data-type"));
          var matched = true;

          if (q && haystack.indexOf(q) === -1) {
            matched = false;
          }
          if (selectedYear && selectedYear !== cardYear) {
            matched = false;
          }
          if (selectedType && selectedType !== cardType) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && search) {
        search.value = query;
      }
      apply();
    });
  }

  site.player = function (url) {
    var video = one("#movie-player");
    var overlay = one("#player-overlay");
    var playButton = one("#movie-play");
    var hlsInstance = null;
    var attached = false;

    if (!video || !url) {
      return;
    }

    function reveal() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function restore() {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    }

    function play() {
      reveal();
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          restore();
        });
      }
    }

    function attach() {
      if (attached) {
        play();
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        attached = true;
        play();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        attached = true;
        video.addEventListener("canplay", play, { once: true });
        return;
      }

      video.src = url;
      attached = true;
      play();
    }

    if (playButton) {
      playButton.addEventListener("click", attach);
    }
    if (overlay) {
      overlay.addEventListener("click", attach);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        attach();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHeaderSearch();
    setupHero();
    setupFiltering();
  });

  window.MovieSite = site;
})();
