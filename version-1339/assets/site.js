(function () {
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

    function initMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
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

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
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
        if (slides.length > 1) {
            restart();
        }
    }

    function initListControls() {
        selectAll("[data-list-page]").forEach(function (page) {
            var search = page.querySelector("[data-filter-search]");
            var sort = page.querySelector("[data-sort-select]");
            var list = page.querySelector("[data-movie-list]");
            var viewButtons = selectAll("[data-view]", page);
            if (!list) {
                return;
            }
            var items = selectAll("[data-movie-card]", list);

            function apply() {
                var term = search ? search.value.trim().toLowerCase() : "";
                var mode = sort ? sort.value : "latest";
                var sorted = items.slice().sort(function (a, b) {
                    if (mode === "name") {
                        return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-CN");
                    }
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                });
                sorted.forEach(function (item) {
                    var haystack = String(item.dataset.search || "").toLowerCase();
                    item.classList.toggle("is-hidden", term !== "" && haystack.indexOf(term) === -1);
                    list.appendChild(item);
                });
            }

            if (search) {
                search.addEventListener("input", apply);
            }
            if (sort) {
                sort.addEventListener("change", apply);
            }
            viewButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    viewButtons.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                    list.classList.toggle("is-list", button.dataset.view === "list");
                });
            });
            apply();
        });
    }

    function movieCard(movie) {
        return [
            '<a href="' + escapeHtml(movie.link) + '" class="movie-card">',
            '    <span class="movie-cover">',
            '        <img src="./' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="cover-mask"></span>',
            '        <span class="play-mark">▶</span>',
            '        <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
            '    </span>',
            '    <span class="movie-card-body">',
            '        <strong>' + escapeHtml(movie.title) + '</strong>',
            '        <span class="line-clamp-two">' + escapeHtml(movie.oneLine) + '</span>',
            '        <span class="movie-meta-line">',
            '            <em>' + escapeHtml(movie.region + movie.type) + '</em>',
            '            <small>' + escapeHtml(movie.categoryName) + '</small>',
            '        </span>',
            '    </span>',
            '</a>'
        ].join("");
    }

    function initSearchPage() {
        var page = document.querySelector("[data-search-page]");
        if (!page || !window.movieSearchIndex) {
            return;
        }
        var input = page.querySelector("[data-search-input]");
        var category = page.querySelector("[data-search-category]");
        var type = page.querySelector("[data-search-type]");
        var results = page.querySelector("[data-search-results]");
        var state = page.querySelector("[data-search-state]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        if (input) {
            input.value = initialQuery;
        }

        function render() {
            var term = input ? input.value.trim().toLowerCase() : "";
            var categoryValue = category ? category.value : "";
            var typeValue = type ? type.value : "";
            if (!term && !categoryValue && !typeValue) {
                if (results) {
                    results.innerHTML = "";
                }
                if (state) {
                    state.textContent = "请输入搜索关键词";
                }
                return;
            }
            var matched = window.movieSearchIndex.filter(function (movie) {
                var inTerm = !term || String(movie.search || "").toLowerCase().indexOf(term) !== -1;
                var inCategory = !categoryValue || movie.categorySlug === categoryValue;
                var inType = !typeValue || movie.type === typeValue;
                return inTerm && inCategory && inType;
            }).slice(0, 120);
            if (results) {
                results.innerHTML = matched.map(movieCard).join("\n");
            }
            if (state) {
                state.textContent = matched.length ? "已筛出相关影片" : "未找到相关影片";
            }
        }

        if (input) {
            input.addEventListener("input", render);
        }
        if (category) {
            category.addEventListener("change", render);
        }
        if (type) {
            type.addEventListener("change", render);
        }
        render();
    }

    function initPlayers() {
        selectAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            if (!video) {
                return;
            }
            var source = video.dataset.src;
            if (source) {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            video.src = source;
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else {
                    video.src = source;
                }
            }
            var toggles = selectAll("[data-player-toggle]", player);
            function updateState() {
                player.classList.toggle("is-playing", !video.paused);
            }
            function togglePlay(event) {
                event.preventDefault();
                if (video.paused) {
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {});
                    }
                } else {
                    video.pause();
                }
            }
            toggles.forEach(function (button) {
                button.addEventListener("click", togglePlay);
            });
            video.addEventListener("play", updateState);
            video.addEventListener("pause", updateState);
            video.addEventListener("ended", updateState);
        });
    }

    function initButtons() {
        selectAll("[data-like-button]").forEach(function (button) {
            button.addEventListener("click", function () {
                button.textContent = button.textContent === "已点赞" ? "点赞" : "已点赞";
            });
        });
        selectAll("[data-share-button]").forEach(function (button) {
            button.addEventListener("click", function () {
                if (navigator.share) {
                    navigator.share({
                        title: document.title,
                        url: window.location.href
                    }).catch(function () {});
                } else if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href).then(function () {
                        button.textContent = "链接已复制";
                        window.setTimeout(function () {
                            button.textContent = "分享";
                        }, 1600);
                    });
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileNav();
        initHero();
        initListControls();
        initSearchPage();
        initPlayers();
        initButtons();
    });
})();
