(function () {
  var form = document.querySelector("[data-search-form]");
  var input = document.querySelector("[data-search-input]");
  var results = document.querySelector("[data-search-results]");
  var title = document.querySelector("[data-search-title]");
  if (!form || !input || !results || !window.SEARCH_ITEMS) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initial = params.get("q") || "";
  input.value = initial;

  var render = function (query) {
    var keyword = query.trim().toLowerCase();
    var items = window.SEARCH_ITEMS.slice();
    if (keyword) {
      items = items.filter(function (item) {
        return [item.title, item.region, item.type, item.genre, item.category, item.summary, item.year].join(" ").toLowerCase().indexOf(keyword) !== -1;
      });
      title.textContent = "搜索结果";
    } else {
      items.sort(function (a, b) {
        return b.views - a.views;
      });
      title.textContent = "热门推荐";
    }
    items = items.slice(0, 96);
    if (!items.length) {
      results.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
      return;
    }
    results.innerHTML = items.map(function (item) {
      return '<article class="movie-card">' +
        '<a class="card-cover" href="' + item.url + '">' +
        '<img src="./' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="cover-gradient"></span>' +
        '<span class="quality-badge">高清</span>' +
        '<span class="play-badge">▶</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<div class="tag-row"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
        '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>' +
        '<p>' + escapeHtml(item.summary) + '</p>' +
        '<div class="meta-row"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
        '</div>' +
        '</article>';
    }).join("");
  };

  var escapeHtml = function (value) {
    return String(value || "").replace(/[&<>"']/g, function (match) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[match];
    });
  };

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var query = input.value.trim();
    var url = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
    history.replaceState(null, "", url);
    render(query);
  });

  input.addEventListener("input", function () {
    render(input.value);
  });

  render(initial);
})();
