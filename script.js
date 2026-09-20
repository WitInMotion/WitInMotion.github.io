/* ============================================================
   CONFIG — edit these values for your own portfolio
   ============================================================ */
const CONFIG = {
  // Your GitHub username (no @, just the username)
  GITHUB_USERNAME: "your-github-username",

  // Repos to hide from the grid — use this for anything under NDA
  // or otherwise not meant to be public-facing (e.g. client work).
  EXCLUDE_REPOS: [
    // "infraguard-agent-attack",
  ],

  // Optional: force specific repos to the top regardless of recent
  // activity. Leave empty to just sort by most recently pushed.
  FEATURED_REPOS: [
    // "the-council",
  ],

  // Max number of repo cards to show.
  MAX_REPOS: 9,

  // Manually curated social/marketing work — this isn't pulled from
  // anywhere automatically. Swap in real numbers wherever you have
  // them (engagement %, reach, campaign counts) — the placeholders
  // below stick to what's verifiable from your LinkedIn until then.
  SOCIAL_WORK: [
    {
      title: "Strategic comms across 6 platforms",
      role: "Social Media Analyst — Argon Analytics",
      description: "Lead content strategy and editorial planning across LinkedIn, X, Instagram, Threads, Facebook, and BlueSky, translating policy insight into accessible narratives. Also handle real-time crisis and reputation management during high-attention events.",
      metric: "Oct 2025 — present",
    },
    {
      title: "Full-funnel content & campaign delivery",
      role: "Digital Marketing Manager — Raven & Macaw",
      description: "Owned monthly content calendars, email marketing campaigns, e-commerce customer experience, and YouTube channel analytics, alongside managing cross-functional project delivery as PM.",
      metric: "Sep 2022 — Jul 2025",
    },
    {
      title: "SEO-optimized content for search visibility",
      role: "Digital Marketing Specialist — Outsource Global",
      description: "Managed social platforms and executed targeted campaigns to drive engagement and conversions.",
      metric: "Feb 2023 — Jan 2024",
    },
    {
      title: "Keyword research & AI-assisted SEO",
      role: "SEO Trainee — Extern",
      description: "Used SEO tools to identify and categorize keywords by search intent, then produced optimized blog content to improve organic visibility.",
      metric: "Sep — Oct 2024",
    },
  ],
};

/* ============================================================
   Utilities
   ============================================================ */
function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  return `${Math.floor(months / 12)} yr ago`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

/* ============================================================
   GitHub: repo grid + activity log
   ============================================================ */
async function loadGitHub() {
  const grid = document.getElementById("repo-grid");
  const errorEl = document.getElementById("repo-error");
  const logEl = document.getElementById("activity-log");
  const profileLink = document.getElementById("gh-profile-link");

  profileLink.href = `https://github.com/${CONFIG.GITHUB_USERNAME}`;

  try {
    const res = await fetch(
      `https://api.github.com/users/${CONFIG.GITHUB_USERNAME}/repos?per_page=100&sort=pushed`
    );
    if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
    let repos = await res.json();

    repos = repos.filter(r => !r.fork && !CONFIG.EXCLUDE_REPOS.includes(r.name));

    repos.sort((a, b) => {
      const aFeatured = CONFIG.FEATURED_REPOS.includes(a.name);
      const bFeatured = CONFIG.FEATURED_REPOS.includes(b.name);
      if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;
      return new Date(b.pushed_at) - new Date(a.pushed_at);
    });

    const shown = repos.slice(0, CONFIG.MAX_REPOS);
    renderRepoGrid(shown, grid);
    renderActivityLog(shown.slice(0, 6), logEl);
  } catch (err) {
    grid.innerHTML = "";
    errorEl.classList.remove("hidden");
    logEl.innerHTML = `<li class="log-line">connection failed — check GITHUB_USERNAME in script.js</li>`;
    console.error(err);
  }
}

function renderRepoGrid(repos, grid) {
  if (!repos.length) {
    grid.innerHTML = `<p class="repo-error">No public repos to show yet.</p>`;
    return;
  }
  grid.innerHTML = repos.map((r, i) => `
    <a class="repo-card reveal" style="transition-delay:${Math.min(i, 6) * 70}ms" href="${r.html_url}" target="_blank" rel="noopener">
      <span class="repo-name">${escapeHtml(r.name)}</span>
      <p class="repo-desc">${escapeHtml(r.description || "No description yet.")}</p>
      <div class="repo-meta">
        ${r.language ? `<span><span class="repo-lang-dot"></span>${escapeHtml(r.language)}</span>` : ""}
        <span>★ ${r.stargazers_count}</span>
        <span>updated ${timeAgo(r.pushed_at)}</span>
      </div>
    </a>
  `).join("");
  observeReveal(grid.querySelectorAll(".reveal"));
}

function renderActivityLog(repos, logEl) {
  if (!repos.length) {
    logEl.innerHTML = `<li class="log-line">no recent activity</li>`;
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Build the <li> shells first (time badge shown immediately, message
  // typed in), so the layout doesn't jump around as lines fill in.
  logEl.innerHTML = repos.map(() => `
    <li class="log-line">
      <span class="log-time"></span><span class="log-text"></span><span class="log-cursor"></span>
    </li>
  `).join("");

  const items = Array.from(logEl.children).map((li, i) => ({
    timeEl: li.querySelector(".log-time"),
    textEl: li.querySelector(".log-text"),
    cursorEl: li.querySelector(".log-cursor"),
    timeStr: `${timeAgo(repos[i].pushed_at)}`,
    text: `pushed to ${repos[i].name}`,
  }));

  if (prefersReducedMotion) {
    items.forEach(item => {
      item.timeEl.textContent = item.timeStr;
      item.textEl.textContent = item.text;
      item.cursorEl.remove();
    });
    return;
  }

  typeLinesSequentially(items, 0);
}

function typeLinesSequentially(items, index) {
  if (index >= items.length) return;
  const { timeEl, textEl, cursorEl, timeStr, text } = items[index];
  timeEl.textContent = timeStr;

  let charIndex = 0;
  const typeChar = () => {
    if (charIndex <= text.length) {
      textEl.textContent = text.slice(0, charIndex);
      charIndex++;
      setTimeout(typeChar, 18 + Math.random() * 22);
    } else {
      cursorEl.remove();
      setTimeout(() => typeLinesSequentially(items, index + 1), 220);
    }
  };
  typeChar();
}

/* ============================================================
   Scroll reveal — fades/slides elements in as they enter view
   ============================================================ */
let revealObserver;
function getRevealObserver() {
  if (revealObserver) return revealObserver;
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  return revealObserver;
}

function observeReveal(elements) {
  const obs = getRevealObserver();
  elements.forEach(el => obs.observe(el));
}

/* ============================================================
   Social work grid (manual, from CONFIG.SOCIAL_WORK)
   ============================================================ */
function renderSocialWork() {
  const grid = document.getElementById("social-grid");
  grid.innerHTML = CONFIG.SOCIAL_WORK.map((item, i) => `
    <article class="social-card reveal" style="transition-delay:${Math.min(i, 6) * 70}ms">
      <span class="social-role">${escapeHtml(item.role)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <span class="social-metric">${escapeHtml(item.metric)}</span>
    </article>
  `).join("");
  observeReveal(grid.querySelectorAll(".reveal"));
}

/* ============================================================
   Mobile nav toggle
   ============================================================ */
function initNavToggle() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 640) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

/* ============================================================
   Init
   ============================================================ */
loadGitHub();
renderSocialWork();
observeReveal(document.querySelectorAll(".section-head.reveal, .track-col.reveal, .about-row.reveal"));
initNavToggle();
