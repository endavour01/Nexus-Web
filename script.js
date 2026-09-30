const modes = {
  default: {
    logo: 'assets/nexus-emblem-default.png', title: 'DEFAULT MODE', copy: 'Clean. Familiar. Powerful.',
    description: 'A familiar, calm setup for everyday browsing with your NEXUS tools close by.', status: 'DEFAULT · EVERYDAY'
  },
  balanced: {
    logo: 'assets/nexus-emblem-balanced.png', title: 'BALANCED MODE', copy: 'Focused. Productive. Considered.',
    description: 'A productivity-focused setup for staying organized and moving through your work.', status: 'BALANCED · PRODUCTIVITY'
  },
  performance: {
    logo: 'assets/nexus-emblem-performance.png', title: 'PERFORMANCE MODE', copy: 'Fast. Focused. Responsive.',
    description: 'A streamlined setup designed to keep performance in focus while you browse.', status: 'PERFORMANCE · SPEED'
  }
};
const body = document.body;
const buttons = [...document.querySelectorAll('.mode-btn')];
const modeSwitcher = document.querySelector('.mode-switcher');
const modeIndicator = document.querySelector('.mode-indicator');
const logos = [...document.querySelectorAll('[data-mode-logo]')];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentMode = 'default';

function moveModeIndicator(button) {
  if (!button || !modeIndicator || !modeSwitcher) return;
  const switchRect = modeSwitcher.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  modeIndicator.style.left = `${buttonRect.left - switchRect.left - modeSwitcher.clientLeft}px`;
  modeIndicator.style.top = `${buttonRect.top - switchRect.top - modeSwitcher.clientTop}px`;
  modeIndicator.style.width = `${buttonRect.width}px`;
  modeIndicator.style.height = `${buttonRect.height}px`;
  modeIndicator.classList.add('is-visible');
}

function setMode(mode, persist = true) {
  if (!modes[mode]) return;
  currentMode = mode;
  const item = modes[mode];
  body.dataset.mode = mode;
  logos.forEach(logo => { logo.src = item.logo; });
  buttons.forEach(button => {
    const selected = button.dataset.mode === mode;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
  });
  moveModeIndicator(document.querySelector(`.mode-btn[data-mode="${mode}"]`));
  document.querySelector('#modePanel').setAttribute('aria-labelledby', `tab-${mode}`);
  document.querySelector('#modeTitle').textContent = item.title;
  document.querySelector('#modeCopy').textContent = item.copy;
  document.querySelector('#modeName').textContent = item.title;
  document.querySelector('#modeDescription').textContent = item.description;
  document.querySelector('#modeStatus').textContent = item.status;
  document.querySelector('#systemMode').textContent = mode.toUpperCase();
  document.querySelectorAll('.mode-timeline .dot').forEach((dot, index) => dot.classList.toggle('active', index === ['default', 'balanced', 'performance'].indexOf(mode)));
  if (persist) sessionStorage.setItem('nexus-site-mode', mode);
}

buttons.forEach((button, index) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].focus();
    setMode(buttons[next].dataset.mode);
  });
});
setMode(sessionStorage.getItem('nexus-site-mode') || 'default', false);
window.addEventListener('resize', () => moveModeIndicator(buttons.find(button => button.dataset.mode === body.dataset.mode)));

// A brief, skippable first-visit tour. It only runs once in this tab session.
const tutorial = document.querySelector('#modeTutorial');
const tutorialText = document.querySelector('#tutorialText');
const skipTour = document.querySelector('#skipTour');
let tourTimer;
function finishTour() {
  clearTimeout(tourTimer);
  tutorial.classList.remove('tour-visible');
  sessionStorage.setItem('nexus-mode-tour-seen', '1');
  document.querySelector('#tourCaption').classList.add('visible');
}
skipTour.addEventListener('click', finishTour);
if (!reduceMotion && !sessionStorage.getItem('nexus-mode-tour-seen')) {
  const modeSection = document.querySelector('#modes');
  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    tutorial.classList.add('tour-visible');
    const sequence = ['default', 'balanced', 'performance'];
    let step = 0;
    const advance = () => {
      if (step >= sequence.length) { finishTour(); return; }
      setMode(sequence[step]);
      tutorialText.textContent = sequence[step].toUpperCase();
      step += 1;
      tourTimer = setTimeout(advance, 1050);
    };
    advance();
  }, { threshold: 0.2 });
  observer.observe(modeSection);
} else {
  sessionStorage.setItem('nexus-mode-tour-seen', '1');
  document.querySelector('#tourCaption').classList.add('visible');
}

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primaryNav');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav.classList.toggle('nav-open', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  setTimeout(() => nav.classList.remove('nav-open'), 240);
}));

document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  const href = link.getAttribute('href');
  if (!href || href === '#') return;
  const target = document.querySelector(href);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}));


// Liquid-glass nav indicator follows the section currently in view.
const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
const navSections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
const navIndicator = nav.querySelector('.nav-indicator');
let navFrame = 0;
let requestedNavHash = null;
let navSettleTimer = 0;
function moveNavIndicator(link) {
  if (!link || !navIndicator) return;
  const mobileMenu = matchMedia('(max-width: 850px)').matches;
  if (mobileMenu && !nav.classList.contains('nav-open')) return;
  navLinks.forEach(item => {
    if (item === link) item.setAttribute('aria-current', 'location');
    else item.removeAttribute('aria-current');
  });
  const navRect = nav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  if (mobileMenu) {
    navIndicator.style.width = `${Math.max(0, nav.clientWidth - 20)}px`;
    navIndicator.style.left = '10px';
    navIndicator.style.top = `${linkRect.top - navRect.top - nav.clientTop}px`;
    navIndicator.style.transform = 'translate3d(0, 0, 0)';
  } else {
    navIndicator.style.left = `${linkRect.left - navRect.left - nav.clientLeft}px`;
    navIndicator.style.top = '4px';
    navIndicator.style.width = `${linkRect.width}px`;
    navIndicator.style.transform = 'translate3d(0, 0, 0)';
  }
  navIndicator.classList.add('indicator-visible');
}
function syncNavToScroll() {
  navFrame = 0;
  const activationLine = Math.min(190, window.innerHeight * 0.28);
  if (requestedNavHash) {
    const requestedSection = document.querySelector(requestedNavHash);
    const requestedLink = navLinks.find(link => link.hash === requestedNavHash);
    const targetTop = requestedSection?.getBoundingClientRect().top ?? Infinity;
    if (requestedLink && Math.abs(targetTop - activationLine) > 175) {
      moveNavIndicator(requestedLink);
      return;
    }
    requestedNavHash = null;
  }
  let currentSection = navSections[0];
  for (const section of navSections) {
    if (section.getBoundingClientRect().top <= activationLine) currentSection = section;
    else break;
  }
  moveNavIndicator(navLinks.find(link => link.hash === `#${currentSection.id}`));
}
function requestNavSync() {
  if (!navFrame) navFrame = requestAnimationFrame(syncNavToScroll);
  if (requestedNavHash) {
    clearTimeout(navSettleTimer);
    navSettleTimer = setTimeout(() => {
      const target = document.querySelector(requestedNavHash);
      const top = target?.getBoundingClientRect().top ?? Infinity;
      const line = Math.min(190, window.innerHeight * 0.28);
      if (Math.abs(top - line) > 175) requestedNavHash = null;
      requestNavSync();
    }, 180);
  }
}
navLinks.forEach(link => link.addEventListener('click', () => {
  requestedNavHash = link.hash;
  moveNavIndicator(link);
}));
menuButton.addEventListener('click', () => requestAnimationFrame(requestNavSync));
window.addEventListener('scroll', requestNavSync, { passive: true });
window.addEventListener('resize', requestNavSync);
syncNavToScroll();

// Interactive Markets views: sample visuals are explicitly illustrative.
const marketViews = {
  overview: {
    title: 'Research at a glance', kicker: 'YOUR MARKETS',
    description: 'Explore stocks, IPO updates, mutual funds, financial news and saved research in one place.',
    foot: 'Markets · overview', visual: 'chart'
  },
  stocks: {
    title: 'Follow the companies you care about', kicker: 'STOCKS & IPOs',
    description: 'NEXUS brings stock information, charts, IPO updates and related news into a focused research view. This preview is not connected to live prices.',
    foot: 'Stocks · IPO research · related news', visual: 'chart'
  },
  funds: {
    title: 'Explore mutual funds', kicker: 'FUNDS',
    description: 'Browse mutual-fund information and research in one place. The preview does not show live performance, returns or recommendations.',
    foot: 'Mutual fund discovery · no live performance data', visual: 'chart'
  },
  shopping: {
    title: 'Keep an eye on products', kicker: 'SHOPPING PRICE TRACKING',
    description: 'Save products you are considering and use price tracking to follow changes across supported stores.',
    foot: 'Shopping · saved items · price tracking', visual: 'shopping'
  }
};
const marketTabs = [...document.querySelectorAll('.market-tab')];
const marketIndicator = document.querySelector('.market-indicator');
const marketTabsRail = document.querySelector('.market-tabs');
function setMarketView(view, focus = false) {
  const item = marketViews[view];
  if (!item) return;
  const tab = marketTabs.find(button => button.dataset.market === view);
  marketTabs.forEach(button => {
    const active = button === tab;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
  document.querySelector('#marketPanel').setAttribute('aria-labelledby', tab.id);
  document.querySelector('#marketTitle').textContent = item.title;
  document.querySelector('#marketKicker').textContent = item.kicker;
  document.querySelector('#marketDescription').textContent = item.description;
  document.querySelector('#marketFootLeft').textContent = item.foot;
  document.querySelector('#marketFootRight').textContent = item.visual === 'shopping' ? 'Concept interface · store availability may vary' : 'Illustrative interface · no live data';
  document.querySelector('#marketChart').hidden = item.visual === 'shopping';
  document.querySelector('#shoppingDemo').hidden = item.visual !== 'shopping';
  document.querySelector('#marketPanel').dataset.view = view;
  if (tab && marketIndicator && marketTabsRail) {
    const railRect = marketTabsRail.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    marketIndicator.style.left = `${tabRect.left - railRect.left - marketTabsRail.clientLeft + marketTabsRail.scrollLeft}px`;
    marketIndicator.style.top = `${tabRect.top - railRect.top - marketTabsRail.clientTop + marketTabsRail.scrollTop}px`;
    marketIndicator.style.width = `${tabRect.width}px`;
    marketIndicator.style.height = `${tabRect.height}px`;
    marketIndicator.classList.add('is-visible');
    const targetScroll = tab.offsetLeft + tab.offsetWidth / 2 - marketTabsRail.clientWidth / 2;
    marketTabsRail.scrollTo({ left: Math.max(0, targetScroll), behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  if (focus && tab) tab.focus();
}
marketTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => setMarketView(tab.dataset.market));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? marketTabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + marketTabs.length) % marketTabs.length;
    setMarketView(marketTabs[next].dataset.market, true);
  });
});
window.addEventListener('resize', () => {
  const currentTab = marketTabs.find(tab => tab.getAttribute('aria-selected') === 'true');
  if (currentTab) setMarketView(currentTab.dataset.market);
});
setMarketView('overview');
