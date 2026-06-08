(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dotsWrap = hero.querySelector('[data-hero-dots]');
    var active = 0;

    function showSlide(index) {
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      active = index;
    }

    if (dotsWrap) {
      slides.forEach(function (_, index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hero-dot' + (index === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', '切换焦点影片');
        dot.addEventListener('click', function () {
          showSlide(index);
        });
        dotsWrap.appendChild(dot);
      });
    }

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((active + 1) % slides.length);
      }, 5600);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function renderSearchResults(input, resultsBox) {
    var query = normalize(input.value);

    if (!query || !window.SiteMovies) {
      resultsBox.innerHTML = '';
      resultsBox.classList.remove('is-visible');
      return;
    }

    var matches = window.SiteMovies.filter(function (movie) {
      return normalize(movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.year + ' ' + movie.genre + ' ' + movie.tags).indexOf(query) !== -1;
    }).slice(0, 16);

    resultsBox.innerHTML = matches.map(function (movie) {
      return '<a class="search-result-item" href="' + movie.url + '">' +
        '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + movie.title + '</strong><em>' + movie.year + ' · ' + movie.region + ' · ' + movie.genre + '</em></span>' +
        '</a>';
    }).join('');

    resultsBox.classList.toggle('is-visible', matches.length > 0);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    var input = form.querySelector('[data-search-input]');
    var scope = form.parentElement || document;
    var resultsBox = scope.querySelector('[data-search-results]') || document.querySelector('[data-search-results]');

    if (input && resultsBox) {
      input.addEventListener('input', function () {
        renderSearchResults(input, resultsBox);
      });

      form.addEventListener('submit', function (event) {
        if (form.getAttribute('action')) {
          return;
        }
        event.preventDefault();
        renderSearchResults(input, resultsBox);
      });
    }
  });

  if (window.location.pathname.endsWith('search.html')) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var searchInput = document.querySelector('[data-search-input]');
    var searchResults = document.querySelector('[data-search-results]');

    if (q && searchInput && searchResults) {
      searchInput.value = q;
      renderSearchResults(searchInput, searchResults);
    }
  }

  var filterInput = document.querySelector('[data-page-filter]');
  var filterList = document.querySelector('[data-filter-list]');
  var filterCount = document.querySelector('[data-filter-count]');

  if (filterInput && filterList) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-movie-card]'));

    function runFilter() {
      var query = normalize(filterInput.value);
      var visible = 0;

      cards.forEach(function (card) {
        var matched = normalize(card.getAttribute('data-search')).indexOf(query) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (filterCount) {
        filterCount.textContent = visible ? visible + ' 部' : '无匹配';
      }
    }

    filterInput.addEventListener('input', runFilter);
    runFilter();
  }
})();
