(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        inputs.forEach(function (input) {
            var scopeSelector = input.getAttribute("data-filter-input");
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            if (!scope) {
                scope = document;
            }
            var items = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-item]"));
            var noResult = scope.querySelector("[data-no-result]");
            function apply() {
                var query = normalize(input.value);
                var visible = 0;
                items.forEach(function (item) {
                    var haystack = normalize((item.getAttribute("data-title") || "") + " " + (item.getAttribute("data-meta") || "") + " " + item.textContent);
                    var matched = !query || haystack.indexOf(query) !== -1;
                    item.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (noResult) {
                    noResult.classList.toggle("is-visible", visible === 0);
                }
            }
            input.addEventListener("input", apply);
            apply();
        });
    }

    function attachNative(video, source) {
        video.src = source;
        video.load();
    }

    function attachWithHls(video, source, onReady, onError) {
        if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
            if (video.__hls) {
                video.__hls.destroy();
            }
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            video.__hls = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
                hls.on(window.Hls.Events.MANIFEST_PARSED, onReady);
            }
            if (window.Hls.Events && window.Hls.Events.ERROR) {
                hls.on(window.Hls.Events.ERROR, function () {
                    if (onError) {
                        onError();
                    }
                });
            }
            return true;
        }
        return false;
    }

    function initPlayers() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        boxes.forEach(function (box) {
            var video = box.querySelector("video");
            var button = box.querySelector("[data-play]");
            var status = box.parentElement ? box.parentElement.querySelector("[data-player-status]") : null;
            if (!video || !button) {
                return;
            }
            var source = video.getAttribute("data-video") || "";
            var isLoaded = false;
            function setStatus(text) {
                if (status) {
                    status.textContent = text;
                }
            }
            function playVideo() {
                var playPromise = video.play();
                if (playPromise && playPromise.then) {
                    playPromise.then(function () {
                        box.classList.add("is-playing");
                        setStatus("正在播放");
                    }).catch(function () {
                        box.classList.add("is-ready");
                        setStatus("视频已就绪");
                    });
                }
            }
            function loadAndPlay() {
                if (!source) {
                    setStatus("视频加载遇到问题，请刷新后重试");
                    return;
                }
                if (!isLoaded) {
                    isLoaded = true;
                    setStatus("正在加载");
                    var nativeSupport = video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
                    if (nativeSupport) {
                        attachNative(video, source);
                        video.addEventListener("loadedmetadata", playVideo, { once: true });
                    } else if (!attachWithHls(video, source, playVideo, function () {
                        setStatus("视频加载遇到问题，请刷新后重试");
                    })) {
                        attachNative(video, source);
                        video.addEventListener("loadedmetadata", playVideo, { once: true });
                    }
                } else {
                    playVideo();
                }
            }
            button.addEventListener("click", loadAndPlay);
            box.addEventListener("click", function (event) {
                if (event.target === video || event.target === box) {
                    loadAndPlay();
                }
            });
            video.addEventListener("play", function () {
                box.classList.add("is-playing");
                setStatus("正在播放");
            });
            video.addEventListener("pause", function () {
                box.classList.remove("is-playing");
                if (isLoaded) {
                    box.classList.add("is-ready");
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
