(function () {
  var toggle = document.querySelector(".mobile-toggle");
  var panel = document.querySelector(".mobile-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
  if (slides.length > 1) {
    var current = 0;
    var activate = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
      });
    });
    window.setInterval(function () {
      activate((current + 1) % slides.length);
    }, 5200);
  }

  var filterBars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
  filterBars.forEach(function (scope) {
    var search = scope.querySelector("[data-filter-search]");
    var region = scope.querySelector("[data-filter-region]");
    var type = scope.querySelector("[data-filter-type]");
    var year = scope.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
    var apply = function () {
      var keyword = search ? search.value.trim().toLowerCase() : "";
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        var visible = true;
        if (keyword && text.indexOf(keyword) === -1) {
          visible = false;
        }
        if (regionValue && card.getAttribute("data-region") !== regionValue) {
          visible = false;
        }
        if (typeValue && card.getAttribute("data-type") !== typeValue) {
          visible = false;
        }
        if (yearValue && card.getAttribute("data-year") !== yearValue) {
          visible = false;
        }
        card.style.display = visible ? "" : "none";
      });
    };
    [search, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  });
})();
