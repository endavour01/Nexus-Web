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
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentMode = 'default';

function getNextTabIndex(index, key, length) {
  if (key === 'Home') return 0;
  if (key === 'End') return length - 1;
  const direction = key === 'ArrowRight' ? 1 : -1;
  return (index + direction + length) % length;
}

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
  if (persist) sessionStorage.setItem('nexus-site-mode', mode);
}

buttons.forEach((button, index) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = getNextTabIndex(index, event.key, buttons.length);
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
    const next = getNextTabIndex(index, event.key, marketTabs.length);
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
function selectDemoTab(name) {
  const tab = demoTabs.find(item => item.dataset.demoTab === name);
  demoTabs.forEach(item => {
    const active = item.dataset.demoTab === name;
    item.classList.toggle('active', active);
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });

  document.querySelectorAll('.demo-rail button').forEach(railBtn => {
    const active = railBtn.dataset.demoPanel === name;
    railBtn.classList.toggle('active', active);
  });

  demoPage.setAttribute('aria-labelledby', `demo-tab-${name}`);
  demoPage.dataset.tab = name;
  if (demoAddress) {
    demoAddress.value = name === 'home' ? '' : `nexus://${name}`;
  }

  if (name === 'home') renderDemoHome();
  else if (name === 'notes') renderDemoNotes();
  else if (name === 'hub') renderDemoHub();
  else if (name === 'shield') renderDemoShield();
  else if (name === 'explore') renderDemoExplore();
  else renderDemoMessage('Research workspace', 'This is a simulated research tab. Use Explore for a concept preview of contextual tools.');
}

demoTabs.forEach((tab, index) => {
  tab.tabIndex = index === 0 ? 0 : -1;
  tab.id = `demo-tab-${tab.dataset.demoTab}`;
  tab.addEventListener('click', () => selectDemoTab(tab.dataset.demoTab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = getNextTabIndex(index, event.key, demoTabs.length);
    demoTabs[next].focus();
    selectDemoTab(demoTabs[next].dataset.demoTab);
  });
});

function renderDemoHome() {
  if (demoPanel) demoPanel.hidden = true;
  demo.classList.remove('panel-open');
  demoPage.innerHTML = `
    <div class="demo-page-content">
      <img data-mode-logo src="${modes[currentMode].logo}" alt="">
      <div class="demo-home-badge-row">
        <span class="demo-watermark-chip">THIS IS A DEMO · NOT THE ACTUAL BROWSER</span>
      </div>
      <p class="eyebrow">NEXUS · SIMULATED BROWSER</p>
      <h3>A clearer space for the web.</h3>
      <p>Click any tool below or on the left rail to try it in this interactive demo.</p>
      <div class="demo-shortcuts">
        <button type="button" data-demo-panel="notes">▤ Open Notes</button>
        <button type="button" data-demo-panel="hub">⊞ Open Hub</button>
        <button type="button" data-demo-panel="shield">◈ Open Shield</button>
        <button type="button" data-demo-panel="explore">⌕ Explore</button>
      </div>
    </div>
  `;
  demoPage.setAttribute('aria-labelledby', 'demo-tab-home');
}

function renderDemoNotes() {
  if (demoPanel) demoPanel.hidden = true;
  demo.classList.remove('panel-open');
  demoPage.innerHTML = `
    <div class="demo-tool-view">
      <div class="demo-tool-banner">
        <div class="demo-tool-title-row">
          <span class="tool-tag">NEXUS NOTES · WORKSPACE</span>
          <span class="demo-watermark-chip">THIS IS A DEMO · NOT THE ACTUAL BROWSER</span>
        </div>
        <h4>Scratchpad & Research Capture</h4>
      </div>
      <div class="demo-notes-workspace">
        <div class="demo-notes-toolbar">
          <input type="text" class="demo-note-title" value="Project Blueprint & Thoughts" aria-label="Note Title">
          <div class="demo-format-buttons">
            <button type="button" data-note-fmt="bold" title="Bold"><b>B</b></button>
            <button type="button" data-note-fmt="italic" title="Italic"><i>I</i></button>
            <button type="button" data-note-fmt="check" title="Checkbox">☑ Task</button>
            <button type="button" class="demo-export-btn" data-note-export title="Copy to clipboard">Export</button>
          </div>
        </div>
        <textarea class="demo-note-editor" aria-label="Demo Notes Editor" placeholder="Type quick notes, ideas, or references here...">• Researching decentralized consensus models
• Reviewing UI latency budgets for NEXUS Core
• Check web aesthetics across high-contrast display profiles</textarea>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:9px; color:#8c97b0;">
          <span id="demoNoteStatus">Local simulated scratchpad · Interactive</span>
          <span class="demo-watermark-chip" style="font-size:7.5px;">DEMO PREVIEW</span>
        </div>
      </div>
    </div>
  `;
  demoPage.setAttribute('aria-labelledby', 'demo-tab-notes');
}

function renderDemoShield() {
  if (demoPanel) demoPanel.hidden = true;
  demo.classList.remove('panel-open');
  demoPage.innerHTML = `
    <div class="demo-tool-view">
      <div class="demo-tool-banner">
        <div class="demo-tool-title-row">
          <span class="tool-tag">NEXUS SHIELD · PRIVACY ENGINE</span>
          <span class="demo-watermark-chip">THIS IS A DEMO · NOT THE ACTUAL BROWSER</span>
        </div>
        <h4>Real-time Telemetry & Protection Controls</h4>
      </div>
      <div class="demo-shield-dashboard">
        <div class="shield-stat-row">
          <div class="shield-stat-box">
            <span class="stat-number" id="demoShieldTrackers">142</span>
            <span class="stat-label">Trackers Blocked</span>
          </div>
          <div class="shield-stat-box">
            <span class="stat-number" id="demoShieldAds">38</span>
            <span class="stat-label">Scripts Contained</span>
          </div>
          <div class="shield-stat-box">
            <span class="stat-status" id="demoShieldStatus">ACTIVE</span>
            <span class="stat-label">Engine Status</span>
          </div>
        </div>
        <div class="shield-toggle-list">
          <label class="shield-toggle-row">
            <div>
              <strong>Fingerprint Randomization</strong>
              <small>Mask canvas, WebGL and audio entropy</small>
            </div>
            <input type="checkbox" class="shield-switch" checked data-shield-toggle="fingerprint">
          </label>
          <label class="shield-toggle-row">
            <div>
              <strong>Strict Tracker Prevention</strong>
              <small>Block cross-site telemetry and pixel beacons</small>
            </div>
            <input type="checkbox" class="shield-switch" checked data-shield-toggle="tracker">
          </label>
          <label class="shield-toggle-row">
            <div>
              <strong>HTTPS Upgrade Enforcement</strong>
              <small>Automatically redirect all insecure connections</small>
            </div>
            <input type="checkbox" class="shield-switch" checked data-shield-toggle="https">
          </label>
        </div>
      </div>
    </div>
  `;
  demoPage.setAttribute('aria-labelledby', 'demo-tab-shield');
}

function renderDemoHub() {
  if (demoPanel) demoPanel.hidden = true;
  demo.classList.remove('panel-open');
  demoPage.innerHTML = `
    <div class="demo-tool-view">
      <div class="demo-tool-banner">
        <div class="demo-tool-title-row">
          <span class="tool-tag">NEXUS HUB · UNIFIED DASHBOARD</span>
          <span class="demo-watermark-chip">THIS IS A DEMO · NOT THE ACTUAL BROWSER</span>
        </div>
        <h4>Central Switchboard for Workspaces & Tools</h4>
      </div>
      <div class="demo-hub-dashboard">
        <div class="demo-hub-grid">
          <div class="demo-hub-card" data-demo-panel="notes">
            <span class="card-icon">▤</span>
            <h5>NEXUS Notes</h5>
            <p>Instant scratchpad, inline clipping & quick thoughts</p>
            <button type="button" class="hub-action-btn">Launch Notes →</button>
          </div>
          <div class="demo-hub-card" data-demo-panel="shield">
            <span class="card-icon">◈</span>
            <h5>NEXUS Shield</h5>
            <p>Zero-telemetry privacy shield & tracker containment</p>
            <button type="button" class="hub-action-btn">Open Shield →</button>
          </div>
          <div class="demo-hub-card" data-demo-panel="explore">
            <span class="card-icon">⌕</span>
            <h5>NEXUS Explore</h5>
            <p>Real-time page intelligence, definitions & conversions</p>
            <button type="button" class="hub-action-btn">Inspect Explore →</button>
          </div>
          <div class="demo-hub-card" data-demo-action="connect">
            <span class="card-icon">⊞</span>
            <h5>NEXUS Connect</h5>
            <p>Unified launcher for communication & web apps</p>
            <button type="button" class="hub-action-btn">View Connect →</button>
          </div>
        </div>
      </div>
    </div>
  `;
  demoPage.setAttribute('aria-labelledby', 'demo-tab-hub');
}

function renderDemoExplore() {
  if (demoPanel) demoPanel.hidden = true;
  demo.classList.remove('panel-open');
  demoPage.innerHTML = `
    <div class="demo-tool-view">
      <div class="demo-tool-banner">
        <div class="demo-tool-title-row">
          <span class="tool-tag">NEXUS EXPLORE · CONTEXT ENGINE</span>
          <span class="demo-watermark-chip">THIS IS A DEMO · NOT THE ACTUAL BROWSER</span>
        </div>
        <h4>Intelligent Context & On-Page Analysis</h4>
      </div>
      <div class="demo-explore-dashboard">
        <div class="explore-card-item">
          <div class="explore-head">
            <span>TERM DEFINITION</span>
            <span>AI CONTEXT</span>
          </div>
          <div class="explore-body">
            <h5>Asynchronous Rust Pipelines</h5>
            <p>Non-blocking concurrency abstractions designed for high-throughput network packet multiplexing with minimal memory overhead.</p>
          </div>
        </div>
        <div class="explore-card-item">
          <div class="explore-head">
            <span>LIVE CONVERSION</span>
            <span>ACTIVE UNIT</span>
          </div>
          <div class="explore-calc">
            <strong>144 Hz @ 4K</strong>
            <span class="calc-arrow">➔</span>
            <span>11.94 Gbps Bandwidth Required</span>
          </div>
        </div>
        <div class="explore-card-item">
          <div class="explore-head">
            <span>SECURITY RATING</span>
            <span style="color:#22c55e;">A+ GRADE</span>
          </div>
          <div class="explore-body">
            <h5>TLS 1.3 / Post-Quantum Cipher Ready</h5>
            <p>X25519Kyber768 hybrid key encapsulation detected. Perfect forward secrecy guaranteed.</p>
          </div>
        </div>
      </div>
    </div>
  `;
  demoPage.setAttribute('aria-labelledby', 'demo-tab-explore');
}

function renderDemoMessage(title, message) {
  if (demoPanel) demoPanel.hidden = true;
  demo.classList.remove('panel-open');
  demoPage.replaceChildren();
  const messageBox = document.createElement('div');
  messageBox.className = 'demo-message';

  const badgeRow = document.createElement('div');
  badgeRow.className = 'demo-home-badge-row';
  const chip = document.createElement('span');
  chip.className = 'demo-watermark-chip';
  chip.textContent = 'THIS IS A DEMO · NOT THE ACTUAL BROWSER';
  badgeRow.appendChild(chip);

  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'SIMULATED · NO LIVE WEB ACCESS';

  const heading = document.createElement('h3');
  heading.textContent = title;

  const copy = document.createElement('p');
  copy.textContent = message;

  const homeButton = document.createElement('button');
  homeButton.type = 'button';
  homeButton.dataset.demoAction = 'home';
  homeButton.textContent = 'Return to demo home';

  messageBox.append(badgeRow, eyebrow, heading, copy, homeButton);
  demoPage.append(messageBox);
}

function openDemoTool(name) {
  if (!name) return;
  selectDemoTab(name);
}

function closeDemoTool() {
  if (demoPanel) demoPanel.hidden = true;
  demo.classList.remove('panel-open');
  selectDemoTab('home');
}

demo.addEventListener('click', event => {
  const toolButton = event.target.closest('[data-demo-panel]');
  if (toolButton) {
    selectDemoTab(toolButton.dataset.demoPanel);
    return;
  }
  if (event.target.closest('[data-close-demo-panel]')) {
    closeDemoTool();
    return;
  }
  if (event.target.closest('[data-demo-action="home"]')) {
    selectDemoTab('home');
    return;
  }
  const connectAction = event.target.closest('[data-demo-action="connect"]');
  if (connectAction) {
    document.querySelector('#connect')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    return;
  }

  // Notes formatting button handler
  const fmtBtn = event.target.closest('[data-note-fmt]');
  if (fmtBtn) {
    const editor = demo.querySelector('.demo-note-editor');
    const status = demo.querySelector('#demoNoteStatus');
    if (editor) {
      const fmt = fmtBtn.dataset.noteFmt;
      if (fmt === 'bold') editor.value += '\n**Bold idea:** ';
      else if (fmt === 'italic') editor.value += '\n*Annotated:* ';
      else if (fmt === 'check') editor.value += '\n[ ] Pending verification';
      editor.focus();
      if (status) status.textContent = 'Note updated · Local concept scratchpad';
    }
    return;
  }

  // Notes export handler
  if (event.target.closest('[data-note-export]')) {
    const editor = demo.querySelector('.demo-note-editor');
    const status = demo.querySelector('#demoNoteStatus');
    if (editor && navigator.clipboard) {
      navigator.clipboard.writeText(editor.value).then(() => {
        if (status) status.textContent = 'Copied to clipboard! (Simulated)';
      }).catch(() => {
        if (status) status.textContent = 'Exported to buffer (Demo)';
      });
    } else if (status) {
      status.textContent = 'Exported to buffer (Demo)';
    }
    return;
  }
});

// Shield switch toggles change handler
demo.addEventListener('change', event => {
  const shieldSwitch = event.target.closest('[data-shield-toggle]');
  if (shieldSwitch) {
    const allSwitches = [...demo.querySelectorAll('[data-shield-toggle]')];
    const anyChecked = allSwitches.some(s => s.checked);
    const allChecked = allSwitches.every(s => s.checked);
    const statusEl = demo.querySelector('#demoShieldStatus');
    if (statusEl) {
      if (allChecked) {
        statusEl.textContent = 'ACTIVE';
        statusEl.style.color = '#22c55e';
      } else if (anyChecked) {
        statusEl.textContent = 'PARTIAL';
        statusEl.style.color = '#eab308';
      } else {
        statusEl.textContent = 'PAUSED';
        statusEl.style.color = '#ef4444';
      }
    }
  }
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
  const clean = query.toLowerCase().replace(/^nexus:\/\//, '').trim();
  if (clean === 'about') { openAboutPanel(); return; }
  if (['home', 'notes', 'hub', 'shield', 'explore'].includes(clean)) {
    selectDemoTab(clean);
    return;
  }
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
document.querySelector('#easterEgg').addEventListener('click', event => {
  if (event.target.id === 'easterEgg') closeAboutPanel();
});

// Executable slash command runner for opening tools, workspaces, and actions.
const commandBackdrop = document.querySelector('#commandBackdrop');
const commandInput = document.querySelector('#commandInput');
const commandList = document.querySelector('#commandList');
const commandRunStatus = document.querySelector('#commandRunStatus');

const commandItems = [
  {
    cmd: '/connect',
    label: 'Open NEXUS Connect',
    detail: 'Open and launch the unified Connect workspace with app preview',
    run: () => {
      const connectSec = document.querySelector('#connect');
      if (connectSec) {
        connectSec.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        const firstCard = document.querySelector('.connect-card:not(.connect-add-card)');
        if (firstCard && typeof openConnectAppDrawer === 'function') {
          setTimeout(() => openConnectAppDrawer(firstCard), 350);
        }
      }
    }
  },
  {
    cmd: '/connect study',
    label: 'Open Study Workspace',
    detail: 'Switch Connect preset to Study workspace',
    run: () => {
      if (typeof selectWorkspace === 'function') selectWorkspace('study');
      document.querySelector('#connect')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  },
  {
    cmd: '/connect work',
    label: 'Open Work Workspace',
    detail: 'Switch Connect preset to Work workspace',
    run: () => {
      if (typeof selectWorkspace === 'function') selectWorkspace('work');
      document.querySelector('#connect')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  },
  {
    cmd: '/connect chill',
    label: 'Open Chill Workspace',
    detail: 'Switch Connect preset to Chill workspace',
    run: () => {
      if (typeof selectWorkspace === 'function') selectWorkspace('chill');
      document.querySelector('#connect')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  },
  {
    cmd: '/todo',
    label: 'Open NEXUS Todo',
    detail: 'Jump to Todo task manager and focus new task input',
    run: () => {
      const todoSec = document.querySelector('#todo') || document.querySelector('#hub');
      todoSec?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      const input = document.querySelector('#todoInput');
      if (input) {
        setTimeout(() => input.focus(), 350);
      }
    }
  },
  {
    cmd: '/hub',
    label: 'Open NEXUS Hub',
    detail: 'Open central Hub workspace architecture core',
    run: () => {
      document.querySelector('#hub')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  },
  {
    cmd: '/notes',
    label: 'Open Notes Tool',
    detail: 'Launch interactive NEXUS Notes notebook',
    run: () => {
      revealDemo();
      openDemoTool('notes');
    }
  },
  {
    cmd: '/shield',
    label: 'Open Shield Security',
    detail: 'Launch NEXUS Shield privacy controls panel',
    run: () => {
      revealDemo();
      openDemoTool('shield');
    }
  },
  {
    cmd: '/explore',
    label: 'Open Explore Intelligence',
    detail: 'Launch NEXUS Explore research context tool',
    run: () => {
      revealDemo();
      openDemoTool('explore');
    }
  },
  {
    cmd: '/markets',
    label: 'Open Markets Board',
    detail: 'Open the Markets research board and chart preview',
    run: () => {
      const marketsSec = document.querySelector('#markets');
      marketsSec?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      document.querySelector('#market-tab-overview')?.click();
    }
  },
  {
    cmd: '/mode default',
    label: 'Set Mode: Default',
    detail: 'Switch browser interface to Default (Cyan theme)',
    run: () => setMode('default')
  },
  {
    cmd: '/mode balanced',
    label: 'Set Mode: Balanced',
    detail: 'Switch browser interface to Balanced (Gold theme)',
    run: () => setMode('balanced')
  },
  {
    cmd: '/mode performance',
    label: 'Set Mode: Performance',
    detail: 'Switch browser interface to Performance (Crimson theme)',
    run: () => setMode('performance')
  },
  {
    cmd: '/vpn',
    label: 'Open VPN Tool',
    detail: 'Open the Windscribe VPN connection simulator',
    run: () => {
      document.querySelector('#vpn')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      document.querySelector('#vpnCountry')?.focus();
    }
  },
  {
    cmd: '/system',
    label: 'Open NEXUS System Info',
    detail: 'Launch secret NEXUS://ABOUT diagnostic window',
    run: () => {
      openAboutPanel();
    }
  },
  {
    cmd: '/reset',
    label: 'Reset Demo State',
    detail: 'Clear simulator inputs and restore initial demo state',
    run: () => {
      demoSearch?.reset();
      setMode('default');
      selectDemoTab('home');
    }
  }
];

let filteredCommands = commandItems;
let selectedCommand = 0;
let previousCommandFocus = null;

function revealDemo() {
  document.querySelector('#try-nexus').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  selectDemoTab('home');
}

function renderCommands() {
  const rawQuery = commandInput.value.trim().toLowerCase();
  const query = rawQuery.startsWith('/') ? rawQuery.slice(1) : rawQuery;

  filteredCommands = commandItems.filter(item => {
    const itemCmd = item.cmd.toLowerCase();
    const itemLabel = item.label.toLowerCase();
    const itemDetail = item.detail.toLowerCase();
    return itemCmd.includes(rawQuery) || itemCmd.slice(1).includes(query) || itemLabel.includes(rawQuery) || itemDetail.includes(rawQuery);
  });

  selectedCommand = Math.min(selectedCommand, Math.max(0, filteredCommands.length - 1));
  commandList.replaceChildren();

  filteredCommands.forEach((item, index) => {
    const row = document.createElement('li');
    row.id = `command-option-${index}`;
    row.setAttribute('role', 'option');
    row.setAttribute('aria-selected', String(index === selectedCommand));
    row.tabIndex = -1;

    const content = document.createElement('div');
    content.className = 'cmd-row-content';

    const badge = document.createElement('span');
    badge.className = 'cmd-action-badge';
    badge.textContent = item.cmd;

    const title = document.createElement('strong');
    title.textContent = item.label;

    const detail = document.createElement('small');
    detail.textContent = item.detail;

    content.append(badge, title, detail);

    const shortcut = document.createElement('kbd');
    shortcut.textContent = 'RUN ↵';

    row.append(content, shortcut);
    row.addEventListener('mouseenter', () => { selectedCommand = index; updateCommandSelection(); });
    row.addEventListener('click', () => runCommand(index));
    commandList.append(row);
  });

  if (!filteredCommands.length) {
    const empty = document.createElement('li');
    empty.className = 'command-empty';
    empty.textContent = `Unknown command "${commandInput.value}". Try /connect, /todo, /notes, /shield, /mode`;
    commandList.append(empty);
  }

  updateCommandSelection();
}

function updateCommandSelection() {
  [...commandList.querySelectorAll('[role="option"]')].forEach((row, index) => row.setAttribute('aria-selected', String(index === selectedCommand)));
  commandInput.setAttribute('aria-activedescendant', filteredCommands.length ? `command-option-${selectedCommand}` : '');
}

function openCommandPalette(initialValue = '') {
  if (!commandBackdrop.hidden) return;
  previousCommandFocus = document.activeElement;
  commandBackdrop.hidden = false;
  commandInput.setAttribute('aria-expanded', 'true');
  commandInput.value = initialValue;
  renderCommands();
  commandInput.focus();
  if (initialValue) {
    commandInput.setSelectionRange(initialValue.length, initialValue.length);
  }
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
  if (commandRunStatus) {
    commandRunStatus.textContent = `Executed: ${command.cmd} (${command.label})`;
  }
  command.run();
}

document.querySelectorAll('[data-open-commands]').forEach(button => button.addEventListener('click', () => openCommandPalette()));

document.querySelectorAll('.cmd-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const cmd = chip.dataset.quickCmd;
    if (!cmd) return;
    commandInput.value = cmd;
    renderCommands();
    const foundIndex = filteredCommands.findIndex(i => i.cmd.toLowerCase() === cmd.toLowerCase());
    if (foundIndex >= 0) {
      runCommand(foundIndex);
    }
  });
});

commandInput.addEventListener('input', () => { selectedCommand = 0; renderCommands(); });

commandInput.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' && filteredCommands.length) {
    event.preventDefault();
    selectedCommand = (selectedCommand + 1) % filteredCommands.length;
    updateCommandSelection();
  } else if (event.key === 'ArrowUp' && filteredCommands.length) {
    event.preventDefault();
    selectedCommand = (selectedCommand - 1 + filteredCommands.length) % filteredCommands.length;
    updateCommandSelection();
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const typed = commandInput.value.trim().toLowerCase();
    const exactMatch = filteredCommands.findIndex(i => i.cmd.toLowerCase() === typed || i.cmd.toLowerCase().slice(1) === typed);
    if (exactMatch >= 0) {
      runCommand(exactMatch);
    } else if (filteredCommands.length) {
      runCommand(selectedCommand);
    }
  }
});

commandBackdrop.addEventListener('click', event => {
  if (event.target === commandBackdrop) closeCommandPalette();
});

document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openCommandPalette();
  }
  if (event.key === '/' && document.activeElement !== commandInput && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
    event.preventDefault();
    openCommandPalette('/');
  }
  if (event.key === 'Escape') {
    if (menuButton.getAttribute('aria-expanded') === 'true') { menuButton.click(); }
    if (!commandBackdrop.hidden) closeCommandPalette();
    else if (!document.querySelector('#easterEgg').hidden) closeAboutPanel();
    else if (!demoPanel.hidden) closeDemoTool();
    else if (connectDrawer && !connectDrawer.hidden) closeConnectAppDrawer();
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

// ==========================================
// NEXUS CONNECT INTERACTIVE WORKSPACE DEMO
// ==========================================
const connectWorkspace = document.querySelector('#connectWorkspace');
const workspacePills = [...document.querySelectorAll('.workspace-pill')];
const connectCatBtns = [...document.querySelectorAll('.connect-cat-btn')];
const workspaceDesc = document.querySelector('#workspaceDesc');
const connectCards = [...document.querySelectorAll('.connect-card:not(.connect-add-card)')];
const connectAddCard = document.querySelector('#connectAddCard');
const connectDrawer = document.querySelector('#connectDrawer');
const connectStage = document.querySelector('.connect-stage');
const drawerTitle = document.querySelector('#drawerTitle');
const drawerCategory = document.querySelector('#drawerCategory');
const drawerCatDisplay = document.querySelector('#drawerCatDisplay');
const drawerWsDisplay = document.querySelector('#drawerWsDisplay');
const drawerDescription = document.querySelector('#drawerDescription');
const drawerStatusMessage = document.querySelector('#drawerStatusMessage');
const drawerFavBtn = document.querySelector('#drawerFavBtn');
const closeDrawerActionBtn = document.querySelector('#closeDrawerActionBtn');
const closeDrawerBtn = document.querySelector('#closeDrawerBtn');

const workspaceDetails = {
  study: '<span>Workspace:</span> <strong>STUDY</strong> — Research, class calls, and collaborative notes.',
  work: '<span>Workspace:</span> <strong>WORK</strong> — Engineering, video meetings, and team channels.',
  chill: '<span>Workspace:</span> <strong>CHILL</strong> — Community chat, discussion boards, and social channels.'
};

let currentWorkspace = 'study';
let currentCategory = 'all';
let currentSelectedCard = null;

function filterConnectApps() {
  connectCards.forEach(card => {
    const cardWorkspaces = card.dataset.workspaces || '';
    const cardCat = card.dataset.category || '';
    const inWorkspace = cardWorkspaces.includes(currentWorkspace);
    const matchCategory = currentCategory === 'all' || cardCat === currentCategory;

    if (!matchCategory) {
      card.style.display = 'none';
    } else {
      card.style.display = '';
      card.classList.toggle('in-workspace', inWorkspace);
      card.classList.remove('dimmed');
      card.removeAttribute('aria-hidden');
    }
  });
}

function selectWorkspace(ws) {
  if (!workspaceDetails[ws]) return;
  currentWorkspace = ws;
  workspacePills.forEach(pill => {
    const active = pill.dataset.workspace === ws;
    pill.classList.toggle('active', active);
    pill.setAttribute('aria-selected', String(active));
  });
  if (workspaceDesc) workspaceDesc.innerHTML = workspaceDetails[ws];
  filterConnectApps();
}

workspacePills.forEach(pill => {
  pill.addEventListener('click', () => selectWorkspace(pill.dataset.workspace));
});

function selectCategory(cat) {
  currentCategory = cat;
  connectCatBtns.forEach(btn => {
    const active = btn.dataset.cat === cat;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  filterConnectApps();
}

connectCatBtns.forEach(btn => {
  btn.addEventListener('click', () => selectCategory(btn.dataset.cat));
});

function openConnectAppDrawer(card) {
  currentSelectedCard = card;
  connectCards.forEach(c => c.classList.remove('active-app'));
  card.classList.add('active-app');

  const appName = card.querySelector('h4')?.textContent || 'Web App';
  const appDesc = card.querySelector('p')?.textContent || '';
  const appCat = (card.dataset.category || '').toUpperCase();
  const appWs = (card.dataset.workspaces || '').split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' & ');
  const isFav = card.classList.contains('is-favorite');

  if (drawerTitle) drawerTitle.textContent = appName;
  if (drawerCategory) drawerCategory.textContent = `${appCat} WORKSPACE SHORTCUT`;
  if (drawerCatDisplay) drawerCatDisplay.textContent = appCat;
  if (drawerWsDisplay) drawerWsDisplay.textContent = appWs;
  if (drawerDescription) drawerDescription.textContent = appDesc;
  if (drawerStatusMessage) drawerStatusMessage.textContent = 'Supported web application shortcut · Preview mode';
  if (drawerFavBtn) drawerFavBtn.textContent = isFav ? '★ Favorited' : '☆ Favorite';

  if (connectDrawer) connectDrawer.hidden = false;
  if (connectStage) connectStage.classList.add('drawer-open');
}

function closeConnectAppDrawer() {
  if (!connectDrawer) return;
  connectDrawer.hidden = true;
  if (connectStage) connectStage.classList.remove('drawer-open');
  if (currentSelectedCard) {
    currentSelectedCard.classList.remove('active-app');
    currentSelectedCard = null;
  }
}

connectCards.forEach(card => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('.fav-btn')) {
      e.stopPropagation();
      toggleCardFavorite(card);
      return;
    }
    openConnectAppDrawer(card);
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openConnectAppDrawer(card);
    }
  });
});

if (connectAddCard) {
  connectAddCard.addEventListener('click', () => {
    currentSelectedCard = null;
    connectCards.forEach(c => c.classList.remove('active-app'));
    if (drawerTitle) drawerTitle.textContent = 'Add Custom Web App';
    if (drawerCategory) drawerCategory.textContent = 'CUSTOM SHORTCUT';
    if (drawerCatDisplay) drawerCatDisplay.textContent = 'Custom';
    if (drawerWsDisplay) drawerWsDisplay.textContent = currentWorkspace.toUpperCase();
    if (drawerDescription) drawerDescription.textContent = 'Enter a verified web application destination to launch inside a dedicated, isolated NEXUS workspace tab.';
    if (drawerStatusMessage) drawerStatusMessage.textContent = 'Feature in development · Custom web launcher is planned for NEXUS browser release.';
    if (drawerFavBtn) drawerFavBtn.textContent = '☆ Favorite';
    if (connectDrawer) connectDrawer.hidden = false;
    if (connectStage) connectStage.classList.add('drawer-open');
  });
  connectAddCard.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      connectAddCard.click();
    }
  });
}

function toggleCardFavorite(card) {
  const isFav = card.classList.toggle('is-favorite');
  if (currentSelectedCard === card && drawerFavBtn) {
    drawerFavBtn.textContent = isFav ? '★ Favorited' : '☆ Favorite';
  }
}

if (closeDrawerBtn) {
  closeDrawerBtn.addEventListener('click', closeConnectAppDrawer);
}

if (drawerFavBtn) {
  drawerFavBtn.addEventListener('click', () => {
    if (!currentSelectedCard) return;
    toggleCardFavorite(currentSelectedCard);
  });
}

if (closeDrawerActionBtn) {
  closeDrawerActionBtn.addEventListener('click', closeConnectAppDrawer);
}

// Initial filter for Connect
filterConnectApps();

// ==========================================
// NEXUS TODO INTERACTIVE WORKSPACE DEMO
// ==========================================
const todoForm = document.querySelector('#todoForm');
const todoInput = document.querySelector('#todoInput');
const todoCategorySelect = document.querySelector('#todoCategorySelect');
const todoPrioritySelect = document.querySelector('#todoPrioritySelect');
const todoList = document.querySelector('#todoList');
const todoSummaryCount = document.querySelector('#todoSummaryCount');

function updateTodoSummary() {
  if (!todoList || !todoSummaryCount) return;
  const activeCount = todoList.querySelectorAll('.todo-item:not(.completed)').length;
  todoSummaryCount.textContent = `${activeCount} active task${activeCount === 1 ? '' : 's'}`;
}

function bindTodoItem(item) {
  const checkbox = item.querySelector('.todo-checkbox');
  if (!checkbox) return;
  checkbox.addEventListener('change', () => {
    item.classList.toggle('completed', checkbox.checked);
    updateTodoSummary();
  });
}

document.querySelectorAll('.todo-item').forEach(bindTodoItem);
updateTodoSummary();

if (todoForm && todoInput && todoList) {
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;
    const cat = todoCategorySelect?.value || 'Work';
    const prio = todoPrioritySelect?.value || 'Normal';
    const prioClass = prio.toLowerCase() === 'high' ? 'high' : (prio.toLowerCase() === 'medium' || prio.toLowerCase() === 'med' ? 'med' : 'low');

    const li = document.createElement('li');
    li.className = 'todo-item';
    li.innerHTML = `
      <label class="todo-check-wrap">
        <input type="checkbox" class="todo-checkbox">
        <span class="todo-label">${text}</span>
      </label>
      <div class="todo-tags">
        <span class="priority-tag ${prioClass}">${prio.toUpperCase()}</span>
        <span class="cat-tag">${cat}</span>
        <span class="date-tag">Just now</span>
      </div>
    `;
    bindTodoItem(li);
    todoList.prepend(li);
    todoInput.value = '';
    updateTodoSummary();
  });
}

