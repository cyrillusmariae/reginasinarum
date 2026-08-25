(() => {
  'use strict';

  const pageLoader = document.querySelector('#pageLoader');
  const loaderBar = document.querySelector('#loaderBar');
  const loaderPercent = document.querySelector('#loaderPercent');
  let loaderProgress = 0;

  if (pageLoader && loaderBar && loaderPercent) {
    const loaderInterval = window.setInterval(() => {
      loaderProgress += 1;
      loaderBar.style.width = `${loaderProgress}%`;
      loaderPercent.textContent = `${loaderProgress}%`;

      if (loaderProgress >= 100) {
        window.clearInterval(loaderInterval);
        pageLoader.classList.add('is-hidden');
        window.setTimeout(() => pageLoader.remove(), 700);
      }
    }, 60);
  }

  const nav = document.querySelector('#siteNav');
  const themeSwitch = document.querySelector('#themeSwitch');
  const storedTheme = localStorage.getItem('regina-theme');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

  const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    themeSwitch?.setAttribute('aria-pressed', String(isDark));
    themeSwitch?.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    if (themeSwitch) themeSwitch.innerHTML = `<i class="bi ${isDark ? 'bi-sun-fill' : 'bi-moon-stars-fill'}"></i>`;
  };

  applyTheme(storedTheme || (systemTheme.matches ? 'dark' : 'light'));
  themeSwitch?.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    localStorage.setItem('regina-theme', nextTheme);
    applyTheme(nextTheme);
  });

  window.addEventListener('scroll', () => nav?.classList.toggle('scrolled', window.scrollY > 24), { passive: true });
  document.querySelectorAll('.nav-link').forEach((link) => link.addEventListener('click', () => {
    document.querySelector('.navbar-collapse.show')?.classList.remove('show');
  }));

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
