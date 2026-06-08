(function () {
  var libraryUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
  var libraryPromise = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (libraryPromise) {
      return libraryPromise;
    }
    libraryPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = libraryUrl;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error("load failed"));
      };
      document.head.appendChild(script);
    });
    return libraryPromise;
  }

  function setMessage(video, text) {
    var shell = video.closest(".player-shell");
    var message = shell ? shell.querySelector(".player-message") : null;
    if (message) {
      message.textContent = text || "";
    }
  }

  function prepare(video) {
    var stream = video.getAttribute("data-stream");
    if (!stream) {
      setMessage(video, "播放暂时不可用");
      return Promise.reject(new Error("missing stream"));
    }
    if (video.getAttribute("data-ready") === "1") {
      return Promise.resolve();
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.setAttribute("data-ready", "1");
      return Promise.resolve();
    }
    return loadLibrary().then(function (Hls) {
      if (!Hls || !Hls.isSupported()) {
        setMessage(video, "当前播放环境暂不支持该格式");
        throw new Error("unsupported");
      }
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hlsPlayer = hls;
      video.setAttribute("data-ready", "1");
    });
  }

  function start(video, button) {
    setMessage(video, "");
    return prepare(video).then(function () {
      if (button) {
        button.classList.add("is-hidden");
      }
      var playing = video.play();
      if (playing && typeof playing.catch === "function") {
        playing.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
          setMessage(video, "播放暂时不可用，请刷新重试。");
        });
      }
    }).catch(function () {
      if (button) {
        button.classList.remove("is-hidden");
      }
      setMessage(video, "播放暂时不可用，请刷新重试。");
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".movie-video")).forEach(function (video) {
      var shell = video.closest(".player-shell");
      var button = shell ? shell.querySelector(".player-start") : null;

      if (button) {
        button.addEventListener("click", function () {
          start(video, button);
        });
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          start(video, button);
        }
      });

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (video.currentTime === 0 && button) {
          button.classList.remove("is-hidden");
        }
      });
    });
  });
})();
