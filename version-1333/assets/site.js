(function () {
  function closest(element, selector) {
    while (element && element.nodeType === 1) {
      if (element.matches(selector)) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag-pill">' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="group block bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1">' +
      '<a href="' + movie.url + '" class="block">' +
      '<div class="relative aspect-video overflow-hidden bg-neutral-200">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">' +
      '<div class="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">' + escapeHtml(movie.duration) + '</div>' +
      '<div class="absolute top-2 left-2 bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded-md">' + escapeHtml(movie.score) + '</div>' +
      '</div>' +
      '<div class="p-4">' +
      '<h3 class="font-semibold text-neutral-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">' + escapeHtml(movie.title) + '</h3>' +
      '<p class="text-sm text-neutral-600 line-clamp-2 mb-3">' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="flex flex-wrap gap-2 mb-3">' + tags + '</div>' +
      '<div class="flex items-center justify-between text-xs text-neutral-500"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
      '</div>' +
      '</a>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function setSlide(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5000);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function (event) {
        event.preventDefault();
        setSlide(i);
        if (timer) {
          window.clearInterval(timer);
        }
        start();
      });
    });
    start();
  }

  function initPageFilter() {
    var input = document.querySelector('[data-page-filter]');
    var list = document.querySelector('[data-filter-list]');
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.children);
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-type]'));
    var activeType = 'all';
    function apply() {
      var term = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        var typeOk = activeType === 'all' || text.indexOf(activeType.toLowerCase()) !== -1;
        var textOk = !term || text.indexOf(term) !== -1;
        card.classList.toggle('is-filter-hidden', !(typeOk && textOk));
      });
    }
    input.addEventListener('input', apply);
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (item) {
          item.classList.remove('is-active');
        });
        tab.classList.add('is-active');
        activeType = tab.getAttribute('data-filter-type') || 'all';
        apply();
      });
    });
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-input]');
    var title = document.querySelector('[data-search-title]');
    if (!results || !input || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;
    function render(value) {
      var term = value.trim().toLowerCase();
      var data = window.SEARCH_MOVIES;
      var matched = term ? data.filter(function (movie) {
        return movie.searchText.indexOf(term) !== -1;
      }) : data.slice(0, 30);
      matched = matched.slice(0, 120);
      title.textContent = term ? '搜索结果：' + value : '热门内容';
      if (!matched.length) {
        results.innerHTML = '<div class="empty-state">没有找到相关影片</div>';
        return;
      }
      results.innerHTML = matched.map(movieCard).join('');
    }
    render(query);
  }

  window.setupVideoPlayer = function (id, streamUrl) {
    var video = document.getElementById(id);
    if (!video) {
      return;
    }
    var shell = closest(video, '.player-shell');
    var buttons = shell ? Array.prototype.slice.call(shell.querySelectorAll('[data-player-button]')) : [];
    var attached = false;
    var hlsInstance = null;
    function hideButtons() {
      buttons.forEach(function (button) {
        button.classList.add('is-hidden');
      });
    }
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }
    function play() {
      attach();
      hideButtons();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', hideButtons);
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initPageFilter();
    initSearchPage();
  });
})();
