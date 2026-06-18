(function () {
  var videos = Array.prototype.slice.call(document.querySelectorAll("video.movie-video"));

  videos.forEach(function (video) {
    var stream = video.getAttribute("data-stream");
    var shell = video.closest(".player-shell");
    var overlay = shell ? shell.querySelector(".play-overlay") : null;
    var hls = null;

    var attach = function () {
      if (!stream || video.getAttribute("data-ready") === "1") {
        return;
      }
      video.setAttribute("data-ready", "1");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    };

    var start = function () {
      attach();
      if (overlay) {
        overlay.hidden = true;
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (overlay) {
            overlay.hidden = false;
          }
        });
      }
    };

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.hidden = true;
      }
    });

    video.addEventListener("error", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
