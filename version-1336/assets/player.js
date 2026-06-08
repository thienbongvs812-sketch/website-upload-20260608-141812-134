(function () {
  function attach(video, src) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      return;
    }

    video.src = src;
  }

  function start(video, cover) {
    if (cover) {
      cover.classList.add('is-hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  function init(id, src) {
    var shell = document.getElementById(id);

    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var cover = shell.querySelector('.play-cover');

    if (!video) {
      return;
    }

    attach(video, src);

    if (cover) {
      cover.addEventListener('click', function () {
        start(video, cover);
      });
    }

    video.addEventListener('click', function () {
      start(video, cover);
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
  }

  window.MoviePlayer = {
    init: init
  };
})();
