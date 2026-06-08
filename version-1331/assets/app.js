(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      restart();
    }

    var filterArea = document.querySelector("[data-filter-area]");
    if (filterArea) {
      var input = filterArea.querySelector("[data-search-input]");
      var year = filterArea.querySelector("[data-year-select]");
      var region = filterArea.querySelector("[data-region-select]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      var empty = document.querySelector("[data-empty]");
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");

      if (initial && input) {
        input.value = initial;
      }

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilter() {
        var query = normalize(input && input.value);
        var selectedYear = year ? year.value : "";
        var selectedRegion = region ? region.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchedQuery = !query || haystack.indexOf(query) !== -1;
          var matchedYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
          var matchedRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
          var show = matchedQuery && matchedYear && matchedRegion;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, year, region].forEach(function (element) {
        if (element) {
          element.addEventListener("input", applyFilter);
          element.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    }
  });
})();
