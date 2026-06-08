(function() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        activate(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function() {
        activate(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function() {
        activate(index + 1);
        restart();
      });
    }
    activate(0);
    restart();
  }

  const panel = document.querySelector('[data-filter-panel]');
  if (panel) {
    const input = panel.querySelector('[data-filter-input]');
    const region = panel.querySelector('[data-filter-region]');
    const type = panel.querySelector('[data-filter-type]');
    const year = panel.querySelector('[data-filter-year]');
    const cards = Array.from(document.querySelectorAll('.js-filter-card'));
    const empty = document.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query && input) {
      input.value = query;
    }

    function filterCards() {
      const q = input ? input.value.trim().toLowerCase() : '';
      const selectedRegion = region ? region.value : '';
      const selectedType = type ? type.value : '';
      const selectedYear = year ? year.value : '';
      let visible = 0;
      cards.forEach(function(card) {
        const haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        const regionOk = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
        const typeOk = !selectedType || card.getAttribute('data-type') === selectedType;
        const yearOk = !selectedYear || card.getAttribute('data-year') === selectedYear;
        const queryOk = !q || haystack.indexOf(q) !== -1;
        const show = regionOk && typeOk && yearOk && queryOk;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [input, region, type, year].forEach(function(node) {
      if (node) {
        node.addEventListener('input', filterCards);
        node.addEventListener('change', filterCards);
      }
    });
    filterCards();
  }
}());
