(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            var active = slideIndex === current;
            slide.classList.toggle('is-active', active);
            slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    if (slides.length) {
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    var filterPage = document.querySelector('[data-filter-page]');

    if (filterPage) {
        var input = filterPage.querySelector('[data-filter-input]');
        var category = filterPage.querySelector('[data-category-filter]');
        var type = filterPage.querySelector('[data-type-filter]');
        var year = filterPage.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(filterPage.querySelectorAll('[data-card]'));
        var emptyState = filterPage.querySelector('[data-empty-state]');

        if (filterPage.hasAttribute('data-read-query') && input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                input.value = q;
            }
        }

        function includesText(value, keyword) {
            return String(value || '').toLowerCase().indexOf(keyword) !== -1;
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var catValue = category ? category.value : '';
            var typeValue = type ? type.value : '';
            var yearValue = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();
                var matchKeyword = !keyword || includesText(text, keyword);
                var matchCategory = !catValue || card.getAttribute('data-category') === catValue;
                var matchType = !typeValue || includesText(card.getAttribute('data-type'), typeValue);
                var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
                var match = matchKeyword && matchCategory && matchType && matchYear;

                card.style.display = match ? '' : 'none';
                if (match) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, category, type, year].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilter);
                element.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
        var video = shell.querySelector('video');
        var cover = shell.querySelector('.play-cover');
        var stream = shell.getAttribute('data-stream');
        var ready = false;
        var hlsPlayer = null;

        function attachStream() {
            if (ready || !video || !stream) {
                return;
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsPlayer = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsPlayer.loadSource(stream);
                hlsPlayer.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function startPlayback() {
            attachStream();

            if (cover) {
                cover.classList.add('is-hidden');
            }

            if (video) {
                video.setAttribute('controls', 'controls');
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            }
        }

        if (cover) {
            cover.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsPlayer) {
                hlsPlayer.destroy();
            }
        });
    });
})();
