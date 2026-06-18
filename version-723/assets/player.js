(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var video = document.querySelector('[data-player]');
        var button = document.querySelector('[data-play]');
        if (!video) {
            return;
        }

        var stream = video.getAttribute('data-stream');
        var hls = null;
        var loaded = false;

        function loadAndPlay() {
            if (!stream) {
                return;
            }

            if (!loaded) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    loaded = true;
                    video.play().catch(function () {});
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    loaded = true;
                }
            } else {
                video.play().catch(function () {});
            }

            if (button) {
                button.classList.add('is-hidden');
            }
        }

        if (button) {
            button.addEventListener('click', loadAndPlay);
        }

        video.addEventListener('click', function () {
            if (!loaded || video.paused) {
                loadAndPlay();
            }
        });
    });
})();
