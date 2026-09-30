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
  const demoModeControl = document.querySelector('#demoMode');
  if (demoModeControl) demoModeControl.value = mode;
  document.querySelectorAll('[data-mode-logo]').forEach(logo => { logo.src = item.logo; });
  buttons.forEach(button => {
    const selected = button.dataset.mode === mode;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
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
    foot: 'Markets · overview', visual: 'chart', chartLabel: 'Illustrative concept chart · no live data'
  },
  stocks: {
    title: 'Follow the companies you care about', kicker: 'STOCKS & IPOs',
    description: 'NEXUS brings stock information, charts, IPO updates and related news into a focused research view. This preview is not connected to live prices.',
    foot: 'Stocks · IPO research · related news', visual: 'chart', chartLabel: 'Illustrative stock chart · no live prices', chartPath: 'M0 80 C18 78 22 48 42 56 S65 88 82 63 S103 18 122 38 S148 73 166 49 S187 21 205 45 S228 84 246 53 S270 9 287 28 S307 67 325 41 S349 12 365 30 S386 49 400 8'
  },
  funds: {
    title: 'Explore mutual funds', kicker: 'FUNDS',
    description: 'Browse mutual-fund information and research in one place. The preview does not show live performance, returns or recommendations.',
    foot: 'Mutual fund discovery · no live performance data', visual: 'chart', chartLabel: 'Illustrative fund chart · no live performance data', chartPath: 'M0 82 C28 79 48 75 70 72 S111 67 137 61 S179 54 205 49 S249 42 274 35 S315 29 342 23 S379 15 400 9'
  },
  shopping: {
    title: 'Keep an eye on products', kicker: 'SHOPPING PRICE TRACKING',
    description: 'A planned concept for saving products and tracking price changes across supported stores.',
    foot: 'Shopping concept · planned saved items and price tracking', visual: 'shopping'
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
  document.querySelector('#marketFootRight').textContent = item.visual === 'shopping' ? 'Illustrative UI · planned concept' : 'Illustrative interface · no live data';
  const marketChart = document.querySelector('#marketChart');
  marketChart.hidden = item.visual === 'shopping';
  marketChart.setAttribute('aria-label', item.chartLabel || 'Illustrative concept chart · no live data');
  const marketTrend = document.querySelector('#marketTrend');
  if (item.chartPath && marketTrend) marketTrend.setAttribute('d', item.chartPath);
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


// Lightweight local-only NEXUS concept demo.
const demo = document.querySelector('#nexusDemo');
const demoPage = document.querySelector('#demoPage');
const demoTabs = [...document.querySelectorAll('[data-demo-tab]')];
const demoPanel = document.querySelector('#demoToolPanel');
const demoToolTitle = document.querySelector('#demoToolTitle');
const demoToolContent = document.querySelector('#demoToolContent');
const demoModeSelect = document.querySelector('#demoMode');
const demoSearch = document.querySelector('#demoSearch');
const demoAddress = document.querySelector('#demoAddressInput');
const demoTools = {
  notes: ['Notes', '<p>A quiet place for ideas as you browse.</p><label class="demo-check"><input type="checkbox"> Save a thought for later</label><textarea aria-label="Concept note" placeholder="Write a note in this local demo…"></textarea><small>Notes are not saved.</small>'],
  shield: ['Shield', '<p>Your privacy controls, brought together.</p><ul><li>Ad and tracker controls <b>CONCEPT</b></li><li>Pop-up controls <b>PLANNED</b></li><li>Scam protection <b>IN DEVELOPMENT</b></li></ul>'],
  explore: ['Explore', '<p>Useful context for the page you’re reading.</p><div class="demo-result-card"><b>CONTEXT</b><span>Definitions, conversions and sourced information are planned for NEXUS Explore.</span></div>'],
  hub: ['Hub', '<p>A starting point for your NEXUS tools.</p><div class="demo-hub-links"><button type="button" data-demo-panel="notes">Notes</button><button type="button" data-demo-panel="explore">Explore</button><button type="button" data-demo-panel="shield">Shield</button></div><small>Illustrative shortcuts · concept only</small>']
};
function selectDemoTab(name) {
  const tab = demoTabs.find(item => item.dataset.demoTab === name);
  if (!tab) return;
  demoTabs.forEach(item => {
    const active = item === tab;
    item.classList.toggle('active', active);
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  demoPage.setAttribute('aria-labelledby', `demo-tab-${name}`);
  demoPage.dataset.tab = name;
  if (name === 'notes') openDemoTool('notes');
  else if (name === 'home') renderDemoHome();
  else renderDemoMessage('Research workspace', 'This is a simulated research tab. Use Explore for a concept preview of contextual tools.');
}
demoTabs.forEach((tab, index) => {
  tab.tabIndex = index === 0 ? 0 : -1;
  tab.id = `demo-tab-${tab.dataset.demoTab}`;
  tab.addEventListener('click', () => selectDemoTab(tab.dataset.demoTab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? demoTabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + demoTabs.length) % demoTabs.length;
    demoTabs[next].focus();
    selectDemoTab(demoTabs[next].dataset.demoTab);
  });
});
function renderDemoHome() {
  demoPanel.hidden = true;
  demo.classList.remove('panel-open');
  demoPage.innerHTML = `<div class="demo-page-content"><img data-mode-logo src="${modes[currentMode].logo}" alt=""><p class="eyebrow">NEXUS · SIMULATED HOME</p><h3>A clearer space for the web.</h3><p>Try a search or open one of the tools. Everything here is illustrative and stays in this page.</p><div class="demo-shortcuts"><button type="button" data-demo-panel="notes">Open Notes</button><button type="button" data-demo-panel="shield">Open Shield</button><button type="button" data-demo-panel="explore">Explore</button></div></div>`;
  demoPage.setAttribute('aria-labelledby', 'demo-tab-home');
}
function renderDemoMessage(title, message) {
  demoPanel.hidden = true;
  demo.classList.remove('panel-open');
  demoPage.replaceChildren();
  const messageBox = document.createElement('div');
  messageBox.className = 'demo-message';
  const eyebrow = document.createElement('p'); eyebrow.className = 'eyebrow'; eyebrow.textContent = 'SIMULATED · NO LIVE WEB ACCESS';
  const heading = document.createElement('h3'); heading.textContent = title;
  const copy = document.createElement('p'); copy.textContent = message;
  const homeButton = document.createElement('button'); homeButton.type = 'button'; homeButton.dataset.demoAction = 'home'; homeButton.textContent = 'Return to demo home';
  messageBox.append(eyebrow, heading, copy, homeButton); demoPage.append(messageBox);
}
function openDemoTool(name) {
  const item = demoTools[name];
  if (!item) return;
  demoPanel.hidden = false;
  demo.classList.add('panel-open');
  demoToolTitle.textContent = item[0];
  demoToolContent.innerHTML = item[1];
  // Keep demoPage labelled by the selected demo tab while the tool panel is open.
}
function closeDemoTool() {
  demoPanel.hidden = true;
  demo.classList.remove('panel-open');
  selectDemoTab('home');
}
demo.addEventListener('click', event => {
  const toolButton = event.target.closest('[data-demo-panel]');
  if (toolButton) openDemoTool(toolButton.dataset.demoPanel);
  if (event.target.closest('[data-close-demo-panel]')) closeDemoTool();
  if (event.target.closest('[data-demo-action="home"]')) selectDemoTab('home');
});
demoModeSelect.addEventListener('change', () => setMode(demoModeSelect.value));
let previousAboutFocus = null;
function openAboutPanel() {
  closeCommandPalette();
  previousAboutFocus = document.activeElement;
  document.querySelector('#easterEgg').hidden = false;
  document.querySelector('[data-close-easter]').focus();
}
function closeAboutPanel() {
  document.querySelector('#easterEgg').hidden = true;
  previousAboutFocus?.focus?.();
}
demoSearch.addEventListener('submit', event => {
  event.preventDefault();
  const query = demoAddress.value.trim();
  if (!query) { demoAddress.focus(); return; }
  if (query.toLowerCase() === 'nexus://about') { openAboutPanel(); return; }
  renderDemoMessage('A simulated result', `“${query}” is only shown as text in this concept demo. NEXUS does not perform a web search here.`);
});
demo.addEventListener('click', event => {
  if (event.target.closest('.demo-reset')) {
    demoSearch.reset();
    demoModeSelect.value = 'default';
    setMode('default');
    selectDemoTab('home');
    demoAddress.value = '';
  }
});
document.querySelectorAll('[data-close-easter]').forEach(button => button.addEventListener('click', closeAboutPanel));
document.querySelector('#easterEgg').addEventListener('click', event => { if (event.target.id === 'easterEgg') closeAboutPanel(); });

// Searchable keyboard command palette. Commands point to real sections or local demo tools.
const commandBackdrop = document.querySelector('#commandBackdrop');
const commandInput = document.querySelector('#commandInput');
const commandList = document.querySelector('#commandList');
const commandItems = [
  { label: 'Open Notes', detail: 'Show the Notes concept panel', run: () => { revealDemo(); openDemoTool('notes'); } },
  { label: 'Open Shield', detail: 'Show the Shield concept panel', run: () => { revealDemo(); openDemoTool('shield'); } },
  { label: 'Open Explore', detail: 'Show the Explore concept panel', run: () => { revealDemo(); openDemoTool('explore'); } },
  { label: 'Open Markets', detail: 'Go to the Markets concept preview', run: () => document.querySelector('#markets').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }) },
  { label: 'Set mode: Default', detail: 'Change the NEXUS page mode', run: () => setMode('default') },
  { label: 'Set mode: Balanced', detail: 'Change the NEXUS page mode', run: () => setMode('balanced') },
  { label: 'Set mode: Performance', detail: 'Change the NEXUS page mode', run: () => setMode('performance') },
  { label: 'Open Hub', detail: 'Show the Hub concept panel', run: () => { revealDemo(); openDemoTool('hub'); } },
  { label: 'Open Developer Toolkit', detail: 'View planned developer tools', run: () => document.querySelector('#features').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }) },
  { label: 'Why NEXUS?', detail: 'Read the product principles', run: () => document.querySelector('#why-nexus').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }) }
];
let filteredCommands = commandItems;
let selectedCommand = 0;
let previousCommandFocus = null;
function revealDemo() {
  document.querySelector('#try-nexus').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  selectDemoTab('home');
}
function renderCommands() {
  const query = commandInput.value.trim().toLowerCase();
  filteredCommands = commandItems.filter(item => `${item.label} ${item.detail}`.toLowerCase().includes(query));
  selectedCommand = Math.min(selectedCommand, Math.max(0, filteredCommands.length - 1));
  commandList.replaceChildren();
  filteredCommands.forEach((item, index) => {
    const row = document.createElement('li');
    row.id = `command-option-${index}`;
    row.setAttribute('role', 'option');
    row.setAttribute('aria-selected', String(index === selectedCommand));
    row.tabIndex = -1;
    row.innerHTML = `<span>${item.label}<small>${item.detail}</small></span><kbd>↵</kbd>`;
    row.addEventListener('mouseenter', () => { selectedCommand = index; updateCommandSelection(); });
    row.addEventListener('click', () => runCommand(index));
    commandList.append(row);
  });
  if (!filteredCommands.length) {
    const empty = document.createElement('li');
    empty.className = 'command-empty';
    empty.textContent = 'No matching NEXUS commands';
    commandList.append(empty);
  }
  updateCommandSelection();
}
function updateCommandSelection() {
  [...commandList.querySelectorAll('[role="option"]')].forEach((row, index) => row.setAttribute('aria-selected', String(index === selectedCommand)));
  commandInput.setAttribute('aria-activedescendant', filteredCommands.length ? `command-option-${selectedCommand}` : '');
}
function openCommandPalette() {
  if (!commandBackdrop.hidden) return;
  previousCommandFocus = document.activeElement;
  commandBackdrop.hidden = false;
  commandInput.setAttribute('aria-expanded', 'true');
  commandInput.value = '';
  renderCommands();
  commandInput.focus();
}
function closeCommandPalette() {
  if (commandBackdrop.hidden) return;
  commandBackdrop.hidden = true;
  commandInput.setAttribute('aria-expanded', 'false');
  previousCommandFocus?.focus?.();
}
function runCommand(index) {
  const command = filteredCommands[index];
  if (!command) return;
  closeCommandPalette();
  command.run();
}
document.querySelectorAll('[data-open-commands]').forEach(button => button.addEventListener('click', openCommandPalette));
commandInput.addEventListener('input', () => { selectedCommand = 0; renderCommands(); });
commandInput.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' && filteredCommands.length) { event.preventDefault(); selectedCommand = (selectedCommand + 1) % filteredCommands.length; updateCommandSelection(); }
  else if (event.key === 'ArrowUp' && filteredCommands.length) { event.preventDefault(); selectedCommand = (selectedCommand - 1 + filteredCommands.length) % filteredCommands.length; updateCommandSelection(); }
  else if (event.key === 'Enter') { event.preventDefault(); runCommand(selectedCommand); }
});
commandBackdrop.addEventListener('click', event => { if (event.target === commandBackdrop) closeCommandPalette(); });
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openCommandPalette(); }
  if (event.key === 'Escape') {
    if (menuButton.getAttribute('aria-expanded') === 'true') { menuButton.click(); }
    if (!commandBackdrop.hidden) closeCommandPalette();
    else if (!document.querySelector('#easterEgg').hidden) closeAboutPanel();
    else if (!demoPanel.hidden) closeDemoTool();
  }
  if (!commandBackdrop.hidden && (event.key === 'ArrowDown' || event.key === 'ArrowUp') && document.activeElement !== commandInput) {
    event.preventDefault();
    selectedCommand = (selectedCommand + (event.key === 'ArrowDown' ? 1 : -1) + filteredCommands.length) % filteredCommands.length;
    updateCommandSelection();
    commandInput.focus();
  }
});


// Local-only VPN setup concept. Selecting a destination never starts a VPN.
const vpnCountries = {
  asia: ['India', 'Japan', 'Singapore'],
  europe: ['France', 'Germany', 'Netherlands'],
  americas: ['Brazil', 'Canada', 'United States']
};
const vpnRegion = document.querySelector('#vpnRegion');
const vpnCountry = document.querySelector('#vpnCountry');
const vpnDemoStatus = document.querySelector('#vpnDemoStatus');
vpnRegion.addEventListener('change', () => {
  const countries = vpnCountries[vpnRegion.value] || [];
  vpnCountry.replaceChildren(...countries.map(country => { const option = document.createElement('option'); option.value = country; option.textContent = country; return option; }));
  vpnDemoStatus.textContent = 'SIMULATED · NO VPN CONNECTION';
});
document.querySelector('#vpnSetButton').addEventListener('click', () => {
  vpnDemoStatus.textContent = `SIMULATED · ${vpnCountry.value} selected. No VPN connection is made.`;
});
