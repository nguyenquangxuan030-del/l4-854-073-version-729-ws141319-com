(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('is-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var input = document.querySelector('[data-search-input]');
        if (input) {
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
            input.addEventListener('input', function () {
                var value = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                    card.style.display = text.indexOf(value) === -1 ? 'none' : '';
                });
            });
        }
    });
})();
