(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".nav-links");
  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector("[data-prev]");
    var next = carousel.querySelector("[data-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });

    show(0);
    play();
  }

  var searchInput = document.querySelector("[data-search-input]");
  var searchList = document.querySelector("[data-search-list]");
  var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));

  if (searchInput && searchList) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var initialCategory = params.get("category") || "all";
    searchInput.value = initialQuery;

    function applyFilter() {
      var query = searchInput.value.trim().toLowerCase();
      var activeFilter = "all";
      filters.forEach(function (button) {
        if (button.classList.contains("active")) {
          activeFilter = button.getAttribute("data-filter") || "all";
        }
      });
      Array.prototype.forEach.call(searchList.querySelectorAll(".movie-card"), function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-category"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var category = card.getAttribute("data-category") || "";
        var matchText = !query || text.indexOf(query) !== -1;
        var matchCategory = activeFilter === "all" || category === activeFilter;
        card.classList.toggle("is-hidden", !(matchText && matchCategory));
      });
    }

    filters.forEach(function (button) {
      var value = button.getAttribute("data-filter") || "all";
      if (value === initialCategory) {
        filters.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
      }
      button.addEventListener("click", function () {
        filters.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        applyFilter();
      });
    });

    searchInput.addEventListener("input", applyFilter);
    applyFilter();
  }
})();
