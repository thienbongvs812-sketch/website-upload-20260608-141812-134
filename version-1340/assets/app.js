(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function initMenu() {
    var toggle = one("[data-menu-toggle]");
    var nav = one("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = one("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = all("[data-hero-slide]", hero);
    var dots = all("[data-hero-dot]", hero);
    var prev = one("[data-hero-prev]", hero);
    var next = one("[data-hero-next]", hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
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
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = one("[data-filter-panel]");
    var list = one("[data-card-list]");
    if (!panel || !list) {
      return;
    }
    var search = one("[data-search-input]", panel);
    var region = one("[data-filter-region]", panel);
    var type = one("[data-filter-type]", panel);
    var year = one("[data-filter-year]", panel);
    var reset = one("[data-reset-filter]", panel);
    var empty = one("[data-empty-state]");
    var cards = all("[data-search]", list);

    function value(node) {
      return node ? node.value.trim().toLowerCase() : "";
    }

    function apply() {
      var keyword = value(search);
      var regionValue = value(region);
      var typeValue = value(type);
      var yearValue = value(year);
      var shown = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
        var cardType = (card.getAttribute("data-type") || "").toLowerCase();
        var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (regionValue && cardRegion !== regionValue) {
          matched = false;
        }
        if (typeValue && cardType !== typeValue) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", shown === 0);
      }
    }

    [search, region, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
    if (reset) {
      reset.addEventListener("click", function () {
        [search, region, type, year].forEach(function (node) {
          if (node) {
            node.value = "";
          }
        });
        apply();
      });
    }
    apply();
  }

  window.initPlayer = function (source) {
    var video = document.getElementById("movieVideo");
    var trigger = document.getElementById("playTrigger");
    if (!video || !trigger || !source) {
      return;
    }
    var hls = null;
    var prepared = false;

    function playVideo() {
      trigger.classList.add("is-hidden");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!prepared) {
          video.src = source;
          prepared = true;
        }
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!prepared) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          prepared = true;
        } else {
          video.play().catch(function () {});
        }
        return;
      }
      if (!prepared) {
        video.src = source;
        prepared = true;
      }
      video.play().catch(function () {});
    }

    trigger.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (!prepared || video.paused) {
        playVideo();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
