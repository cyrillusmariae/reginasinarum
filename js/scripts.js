(() => {
  'use strict';

  const pageLoader = document.querySelector('#pageLoader');
  const loaderBar = document.querySelector('#loaderBar');
  const loaderPercent = document.querySelector('#loaderPercent');
  const loaderTyped = document.querySelector('#loaderTyped');
  let loaderProgress = 0;

  if (loaderTyped && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    loaderTyped.textContent = loaderTyped.dataset.text || '';
    loaderTyped.classList.add('is-complete');
  }

  if (pageLoader && loaderBar && loaderPercent) {
    const loaderInterval = window.setInterval(() => {
      loaderProgress += 1;
      loaderBar.style.width = `${loaderProgress}%`;
      loaderPercent.textContent = `${loaderProgress}%`;

      if (loaderTyped && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const loaderTitle = loaderTyped.dataset.text || '';
        const visibleCharacters = Math.ceil((loaderProgress / 100) * loaderTitle.length);
        loaderTyped.textContent = loaderTitle.slice(0, visibleCharacters);
        if (loaderProgress >= 100) loaderTyped.classList.add('is-complete');
      }

      if (loaderProgress >= 100) {
        window.clearInterval(loaderInterval);
        pageLoader.classList.add('is-hidden');
        window.setTimeout(() => pageLoader.remove(), 700);
      }
    }, 60);
  }

  const nav = document.querySelector('#siteNav');
  const themeSwitch = document.querySelector('#themeSwitch');

  const getScheduledTheme = () => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    return minutes >= 18 * 60 || minutes < 6 * 60 ? 'dark' : 'light';
  };

  const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    themeSwitch?.setAttribute('aria-pressed', String(isDark));
    themeSwitch?.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    if (themeSwitch) themeSwitch.innerHTML = `<i class="bi ${isDark ? 'bi-sun-fill' : 'bi-moon-stars-fill'}"></i>`;
  };

  applyTheme(getScheduledTheme());
  themeSwitch?.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  let scheduledTheme = getScheduledTheme();
  window.setInterval(() => {
    const currentScheduledTheme = getScheduledTheme();
    if (currentScheduledTheme !== scheduledTheme) {
      scheduledTheme = currentScheduledTheme;
      applyTheme(currentScheduledTheme);
    }
  }, 60000);

  window.addEventListener('scroll', () => nav?.classList.toggle('scrolled', window.scrollY > 24), { passive: true });
  document.querySelectorAll('.nav-link').forEach((link) => link.addEventListener('click', () => {
    document.querySelector('.navbar-collapse.show')?.classList.remove('show');
  }));

  const searchToggles = [...document.querySelectorAll('.site-search-toggle')];
  const siteSearch = document.querySelector('#siteSearch');
  const searchClose = document.querySelector('.site-search-close');
  const searchForm = document.querySelector('.site-search-form');
  const searchInput = document.querySelector('#siteSearchInput');
  const searchMessage = document.querySelector('.site-search-message');
  const searchResults = document.querySelector('.site-search-results');
  let activeSearchToggle = searchToggles[0];

  const closeSearch = () => {
    document.body.classList.remove('search-open');
    siteSearch?.setAttribute('aria-hidden', 'true');
    searchToggles.forEach((toggle) => toggle.setAttribute('aria-expanded', 'false'));
    activeSearchToggle?.focus();
  };

  const renderSearchResults = (query) => {
    if (!searchResults || !searchMessage) return;
    const normalizedQuery = query.trim().toLowerCase();
    searchResults.replaceChildren();
    if (!normalizedQuery) {
      searchMessage.textContent = 'Try “work”, “services”, or “contact”.';
      return;
    }
    const sections = [...document.querySelectorAll('main section[id]')];
    const matches = sections.filter((section) => `${section.id} ${section.textContent}`.toLowerCase().includes(normalizedQuery));
    searchMessage.textContent = matches.length ? `${matches.length} result${matches.length === 1 ? '' : 's'} found.` : 'No matching sections found.';
    matches.forEach((section) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      const heading = document.createElement('strong');
      const excerpt = document.createElement('span');
      const summary = section.textContent.replace(/\s+/g, ' ').trim().slice(0, 145);
      link.href = `#${section.id}`;
      heading.textContent = section.querySelector('h1, h2')?.textContent.trim() || section.id;
      excerpt.textContent = `${summary}${summary.length === 145 ? '…' : ''}`;
      link.append(heading, excerpt);
      link.addEventListener('click', closeSearch);
      item.appendChild(link);
      searchResults.appendChild(item);
    });
  };

  searchToggles.forEach((toggle) => toggle.addEventListener('click', () => {
    activeSearchToggle = toggle;
    if (toggle.classList.contains('site-search-toggle-mobile')) {
      const mobileMenu = document.querySelector('#navMenu');
      if (mobileMenu?.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(mobileMenu).hide();
    }
    document.body.classList.add('search-open');
    siteSearch?.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    window.setTimeout(() => searchInput?.focus(), 150);
  }));
  searchClose?.addEventListener('click', closeSearch);
  searchForm?.addEventListener('submit', (event) => event.preventDefault());
  searchInput?.addEventListener('input', (event) => renderSearchResults(event.target.value));
  siteSearch?.addEventListener('click', (event) => { if (event.target === siteSearch) closeSearch(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && document.body.classList.contains('search-open')) closeSearch(); });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

  const workFilters = document.querySelectorAll('.work-filter');
  const workItems = document.querySelectorAll('.work-grid > [data-category]');
  const workGrid = document.querySelector('.work-grid');
  let filterTransitionTimer;
  workFilters.forEach((filterButton) => filterButton.addEventListener('click', () => {
    const selectedCategory = filterButton.dataset.filter;
    workFilters.forEach((button) => button.classList.toggle('is-active', button === filterButton));

    clearTimeout(filterTransitionTimer);
    workItems.forEach((item) => item.classList.remove('filter-in'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !workGrid) {
      workItems.forEach((item) => item.classList.toggle('is-hidden', selectedCategory !== 'all' && item.dataset.category !== selectedCategory));
      return;
    }

    workGrid.classList.add('is-filtering');
    filterTransitionTimer = window.setTimeout(() => {
      workItems.forEach((item) => item.classList.toggle('is-hidden', selectedCategory !== 'all' && item.dataset.category !== selectedCategory));
      workGrid.classList.remove('is-filtering');
      workItems.forEach((item) => {
        if (!item.classList.contains('is-hidden')) item.classList.add('filter-in');
      });
      filterTransitionTimer = window.setTimeout(() => {
        workItems.forEach((item) => item.classList.remove('filter-in'));
      }, 650);
    }, 260);
  }));

  document.addEventListener('pointerdown', (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const spark = document.createElement('span');
    spark.className = 'click-spark';
    spark.style.left = `${event.clientX}px`;
    spark.style.top = `${event.clientY}px`;
    document.body.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove(), { once: true });
  });
})();
