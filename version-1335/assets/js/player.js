(function () {
  var video = document.querySelector("[data-player]");
  var button = document.querySelector("[data-play-button]");
  if (!video || !button) {
    return;
  }

  var url = video.getAttribute("data-play-url");
  var hlsInstance = null;
  var loaded = false;

  function attach() {
    if (loaded || !url) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
    } else {
      video.src = url;
    }
  }

  function begin() {
    attach();
    button.classList.add("is-hidden");
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  button.addEventListener("click", begin);
  video.addEventListener("click", function () {
    if (!loaded || video.paused) {
      begin();
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
