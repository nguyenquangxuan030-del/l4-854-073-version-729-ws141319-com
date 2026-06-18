(function() {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function() {
      mobilePanel.classList.toggle("is-open");
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-site-search]"), function(form) {
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      if (query) {
        window.location.href = "./search.html?q=" + encodeURIComponent(query);
      }
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function() {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        showSlide(index + 1);
        play();
      });
    }
    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });
    showSlide(0);
    play();
  }

  var list = document.querySelector("[data-card-list]");
  var input = document.querySelector("[data-filter-input]");
  if (list && input) {
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-search-card]"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var urlQuery = new URLSearchParams(window.location.search).get("q") || "";
    var activeValue = "";

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function matches(card, query, pill) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" "));
      var queryOk = !query || haystack.indexOf(normalize(query)) !== -1;
      var pillOk = !pill || haystack.indexOf(normalize(pill)) !== -1;
      return queryOk && pillOk;
    }

    function applyFilter() {
      var query = input.value.trim();
      cards.forEach(function(card) {
        card.classList.toggle("is-filtered-out", !matches(card, query, activeValue));
      });
    }

    if (urlQuery) {
      input.value = urlQuery;
    }
    input.addEventListener("input", applyFilter);
    buttons.forEach(function(button) {
      button.addEventListener("click", function() {
        activeValue = button.getAttribute("data-filter-value") || "";
        buttons.forEach(function(item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter();
      });
    });
    applyFilter();
  }
}());
