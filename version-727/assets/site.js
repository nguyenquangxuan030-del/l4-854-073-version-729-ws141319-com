import { H as Hls } from './hls.js';

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNavigation();
  setupHeroSlider();
  setupCardFilters();
  setupSearchPage();
  setupPlayers();
  setupScrollToPlayer();
});

function setupMobileNavigation() {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');
  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener('click', () => {
    panel.classList.toggle('is-open');
  });
}

function setupHeroSlider() {
  const slider = document.querySelector('[data-hero-slider]');
  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
  if (slides.length <= 1) {
    return;
  }

  let current = 0;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => show(index));
  });

  window.setInterval(() => {
    show(current + 1);
  }, 5200);
}

function setupCardFilters() {
  const scopes = document.querySelectorAll('[data-filter-scope]');
  scopes.forEach((scope) => {
    const input = scope.querySelector('[data-card-filter]');
    const sort = scope.querySelector('[data-card-sort]');
    const counter = scope.querySelector('[data-filter-count]');
    const list = document.querySelector('[data-card-list]');
    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll('[data-card]'));
    const originalOrder = new Map(cards.map((card, index) => [card, index]));

    const update = () => {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      let visibleCount = 0;

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
        ].join(' ').toLowerCase();
        const visible = !keyword || haystack.includes(keyword);
        card.style.display = visible ? '' : 'none';
        if (visible) {
          visibleCount += 1;
        }
      });

      const sortedCards = [...cards];
      const sortValue = sort ? sort.value : 'default';
      sortedCards.sort((a, b) => {
        if (sortValue === 'views-desc') {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        }
        if (sortValue === 'year-desc') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        if (sortValue === 'title-asc') {
          return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
        }
        return originalOrder.get(a) - originalOrder.get(b);
      });
      sortedCards.forEach((card) => list.appendChild(card));

      if (counter) {
        counter.textContent = `${visibleCount} 部影片`;
      }
    };

    if (input) {
      input.addEventListener('input', update);
    }
    if (sort) {
      sort.addEventListener('change', update);
    }
    update();
  });
}

function setupSearchPage() {
  const page = document.querySelector('[data-search-page]');
  if (!page || !window.MOVIE_SEARCH_INDEX) {
    return;
  }

  const input = page.querySelector('[data-search-input]');
  const category = page.querySelector('[data-search-category]');
  const button = page.querySelector('[data-search-button]');
  const results = page.querySelector('[data-search-results]');
  const count = page.querySelector('[data-search-count]');
  const params = new URLSearchParams(window.location.search);

  input.value = params.get('q') || '';
  category.value = params.get('category') || '';

  const render = () => {
    const keyword = input.value.trim().toLowerCase();
    const categoryValue = category.value;
    const matched = window.MOVIE_SEARCH_INDEX.filter((movie) => {
      const inCategory = !categoryValue || movie.category === categoryValue;
      const haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine,
      ].join(' ').toLowerCase();
      return inCategory && (!keyword || haystack.includes(keyword));
    }).slice(0, 120);

    results.innerHTML = matched.map(renderSearchCard).join('');
    count.textContent = matched.length
      ? `找到 ${matched.length} 部影片，最多展示前 120 条结果。`
      : '没有找到匹配影片，请更换关键词。';

    const nextParams = new URLSearchParams();
    if (input.value.trim()) {
      nextParams.set('q', input.value.trim());
    }
    if (category.value) {
      nextParams.set('category', category.value);
    }
    const queryString = nextParams.toString();
    const nextUrl = queryString ? `search.html?${queryString}` : 'search.html';
    window.history.replaceState(null, '', nextUrl);
  };

  input.addEventListener('input', render);
  category.addEventListener('change', render);
  button.addEventListener('click', render);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      render();
    }
  });
  render();
}

function renderSearchCard(movie) {
  return `
    <article class="movie-card" data-card>
      <a href="${movie.url}" class="movie-card__image" aria-label="观看 ${escapeHtml(movie.title)}">
        <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="movie-card__shade"></span>
        <span class="play-float">▶</span>
        <span class="score-badge">${movie.score}</span>
      </a>
      <div class="movie-card__body">
        <a href="${movie.url}" class="movie-card__title">${escapeHtml(movie.title)}</a>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="movie-meta-line">
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.type)}</span>
        </div>
        <div class="tag-row">
          ${movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setupPlayers() {
  document.querySelectorAll('[data-player]').forEach((player) => {
    const video = player.querySelector('video');
    const playButton = player.querySelector('[data-player-play]');
    const message = player.querySelector('[data-player-message]');
    if (!video || !playButton) {
      return;
    }

    let initialized = false;
    let hls = null;

    const setMessage = (text) => {
      if (message) {
        message.textContent = text || '';
      }
    };

    const initialize = () => {
      if (initialized) {
        return;
      }
      initialized = true;
      const source = video.dataset.src;
      if (!source) {
        setMessage('当前影片暂未配置播放源。');
        return;
      }

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setMessage('播放源已就绪。');
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data && data.fatal) {
            setMessage('视频加载失败，请刷新页面或稍后重试。');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        setMessage('当前浏览器不支持 HLS 播放。');
      }
    };

    const play = async () => {
      initialize();
      try {
        await video.play();
        player.classList.add('is-playing');
        setMessage('');
      } catch (error) {
        setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
      }
    };

    playButton.addEventListener('click', play);
    video.addEventListener('play', () => player.classList.add('is-playing'));
    video.addEventListener('pause', () => player.classList.remove('is-playing'));
    video.addEventListener('ended', () => player.classList.remove('is-playing'));
    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

function setupScrollToPlayer() {
  document.querySelectorAll('[data-scroll-player]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const player = document.querySelector('[data-player]');
      if (!player) {
        return;
      }
      event.preventDefault();
      player.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const button = player.querySelector('[data-player-play]');
      if (button) {
        button.focus();
      }
    });
  });
}
