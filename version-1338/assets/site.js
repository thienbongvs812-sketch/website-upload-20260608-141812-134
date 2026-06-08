(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMenu() {
    var button = select(".menu-toggle");
    var panel = select(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var isHidden = panel.hasAttribute("hidden");
      if (isHidden) {
        panel.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
      } else {
        panel.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  function setupHero() {
    var slides = selectAll("[data-hero-slide]");
    if (!slides.length) {
      return;
    }
    var dots = selectAll("[data-hero-to]");
    var thumbs = selectAll("[data-hero-thumb]");
    var index = 0;
    var timer = null;

    function setActive(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setActive(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setActive(parseInt(dot.getAttribute("data-hero-to"), 10));
        start();
      });
    });

    var previous = select("[data-hero-prev]");
    var next = select("[data-hero-next]");
    if (previous) {
      previous.addEventListener("click", function () {
        setActive(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        setActive(index + 1);
        start();
      });
    }

    var carousel = select(".hero-carousel");
    if (carousel) {
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
    }
    start();
  }

  function setupFilters() {
    selectAll(".filterable-section").forEach(function (section) {
      var input = select(".page-filter", section);
      var cards = selectAll(".movie-card", section);
      if (!input || !cards.length) {
        return;
      }
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          card.classList.toggle("is-filter-hidden", query && text.indexOf(query) === -1);
        });
      });
    });
  }

  function setupPlayers() {
    selectAll(".player-video").forEach(function (video) {
      var source = video.getAttribute("data-src");
      var button = select('[data-play-for="' + video.id + '"]');
      var hlsInstance = null;

      function bindSource() {
        if (!source || video.getAttribute("data-ready") === "true") {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
        video.setAttribute("data-ready", "true");
      }

      function play() {
        bindSource();
        if (button) {
          button.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
          button.classList.remove("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance && hlsInstance.destroy) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function createResultCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return '' +
      '<article class="movie-card" data-search="' + escapeHtml(movie.searchText || "") + '">' +
        '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="poster-shade"></span>' +
          '<span class="play-circle">▶</span>' +
        '</a>' +
        '<div class="card-body">' +
          '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p class="movie-meta">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</p>' +
          '<p class="movie-one-line">' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function setupSearchPage() {
    var results = select("#search-results");
    var status = select("#search-status");
    var input = select("#site-search-input");
    if (!results || !status || !input || !window.MovieSearchData) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    input.value = query;

    function render(value) {
      var keyword = value.trim().toLowerCase();
      if (!keyword) {
        status.textContent = "输入关键词后可搜索片名、地区、年份、类型或标签。";
        results.innerHTML = "";
        return;
      }
      var matched = window.MovieSearchData.filter(function (movie) {
        return String(movie.searchText || "").toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 120);
      status.textContent = matched.length ? "搜索结果" : "没有找到匹配影片";
      results.innerHTML = matched.map(createResultCard).join("");
    }

    render(query);
    input.addEventListener("input", function () {
      render(input.value);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
    setupSearchPage();
  });
})();
