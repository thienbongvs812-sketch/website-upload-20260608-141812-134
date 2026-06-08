/* Static movie site interactions: mobile navigation, hero carousel, filters and HLS playback. */

(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMobileNav() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function initHero() {
    const hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dots button"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (!slides.length) {
      return;
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
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
    const list = document.querySelector("[data-filter-list]");

    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll("[data-movie-card]"));
    const searchInput = document.querySelector("[data-filter-search]");
    const categorySelect = document.querySelector("[data-filter-category]");
    const typeSelect = document.querySelector("[data-filter-type]");
    const sortSelect = document.querySelector("[data-filter-sort]");
    const countNode = document.querySelector("[data-result-count]");
    const emptyNode = document.querySelector("[data-no-results]");
    const params = new URLSearchParams(window.location.search);

    if (searchInput && params.get("q")) {
      searchInput.value = params.get("q");
    }

    if (categorySelect && params.get("category")) {
      categorySelect.value = params.get("category");
    }

    function getYear(card) {
      return Number(card.getAttribute("data-year") || 0);
    }

    function sortCards(visibleCards) {
      const mode = sortSelect ? sortSelect.value : "default";
      const sorted = visibleCards.slice();

      if (mode === "year-desc") {
        sorted.sort(function (a, b) {
          return getYear(b) - getYear(a);
        });
      }

      if (mode === "year-asc") {
        sorted.sort(function (a, b) {
          return getYear(a) - getYear(b);
        });
      }

      if (mode === "title") {
        sorted.sort(function (a, b) {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        });
      }

      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    function apply() {
      const keyword = normalize(searchInput ? searchInput.value : "");
      const category = categorySelect ? categorySelect.value : "";
      const type = typeSelect ? typeSelect.value : "";
      const visibleCards = [];

      cards.forEach(function (card) {
        const text = normalize(card.getAttribute("data-search"));
        const cardCategory = card.getAttribute("data-category") || "";
        const cardType = card.getAttribute("data-type") || "";
        const matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        const matchesCategory = !category || cardCategory === category;
        const matchesType = !type || cardType === type;
        const isVisible = matchesKeyword && matchesCategory && matchesType;

        card.hidden = !isVisible;
        if (isVisible) {
          visibleCards.push(card);
        }
      });

      sortCards(visibleCards);

      if (countNode) {
        countNode.textContent = "找到 " + visibleCards.length + " 部影片，共 " + cards.length + " 部";
      }

      if (emptyNode) {
        emptyNode.classList.toggle("is-visible", visibleCards.length === 0);
      }
    }

    [searchInput, categorySelect, typeSelect, sortSelect].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });

    apply();
  }

  function initPlayers() {
    const players = Array.from(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      const video = player.querySelector("video");
      const overlay = player.querySelector(".play-overlay");
      const status = player.parentElement ? player.parentElement.querySelector("[data-player-status]") : null;

      if (!video || !overlay) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function startPlayback() {
        const source = video.getAttribute("data-src");

        if (!source) {
          setStatus("未找到播放源。");
          return;
        }

        if (video.getAttribute("data-loaded") !== "true") {
          if (window.Hls && window.Hls.isSupported() && source.indexOf(".m3u8") !== -1) {
            const hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {
                setStatus("浏览器阻止了自动播放，请再次点击播放器开始观看。");
              });
            });
            hls.on(window.Hls.Events.ERROR, function (_, data) {
              if (data && data.fatal) {
                setStatus("播放源加载失败，请刷新页面或稍后重试。");
              }
            });
            video._hls = hls;
          } else {
            video.src = source;
            video.play().catch(function () {
              setStatus("浏览器阻止了自动播放，请再次点击播放器开始观看。");
            });
          }

          video.setAttribute("data-loaded", "true");
        } else {
          video.play().catch(function () {
            setStatus("请再次点击播放器开始观看。");
          });
        }

        video.controls = true;
        overlay.classList.add("is-hidden");
        setStatus("正在加载高清播放源...");
      }

      overlay.addEventListener("click", startPlayback);
      video.addEventListener("playing", function () {
        setStatus("播放中，可使用播放器控制栏调整音量、进度和全屏。");
      });
      video.addEventListener("error", function () {
        setStatus("播放出现错误，请检查网络或更换浏览器后重试。");
      });
    });
  }

  ready(function () {
    initMobileNav();
    initHero();
    initFilters();
    initPlayers();
  });
}());
