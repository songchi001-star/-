const app = document.querySelector("#app");

const t = {
  title: "\u4ed9\u64c2\u5c0f\u7403",
  subtitle: "\u897f\u6e38\u795e\u5c06 \u00b7 \u5f02\u6b65\u4ed9\u64c2\u6392\u4f4d V1",
  login: "\u767b\u5f55",
  register: "\u6ce8\u518c",
  username: "\u7528\u6237\u540d",
  nickname: "\u6635\u79f0",
  password: "\u5bc6\u7801",
  class: "\u51fa\u6218\u5316\u8eab",
  enterRank: "\u8fdb\u5165\u6392\u4f4d",
  createAccount: "\u521b\u5efa\u8d26\u53f7",
  startRank: "\u5f00\u59cb\u6392\u4f4d",
  logout: "\u9000\u51fa",
  ranking: "\u6392\u884c\u699c",
  score: "\u6392\u4f4d\u5206",
  wins: "\u80dc\u573a",
  losses: "\u8d1f\u573a",
  tridentDesc: "\u5b59\u609f\u7a7a\uff1a\u91d1\u7b8d\u68d2\u7a81\u8fdb\u3001\u51fb\u9000\u7206\u53d1\uff0c\u4e00\u68d2\u547d\u4e2d\u5c31\u80fd\u6253\u4e71\u5bf9\u624b\u8282\u594f\u3002",
  vampireDesc: "\u767d\u9aa8\u592b\u4eba\uff1a\u6444\u9b42\u5438\u8840\u3001\u8d34\u8eab\u7eed\u822a\uff0c\u78b0\u649e\u8d8a\u591a\u8d8a\u96be\u88ab\u8017\u6b7b\u3002",
  guardianDesc: "\u725b\u9b54\u738b\uff1a\u9ad8\u8840\u91cf\u62a4\u4f53\u3001\u6df7\u94c1\u68cd\u9707\u5730\uff0c\u9760\u786c\u5ea6\u548c\u51fb\u9000\u538b\u573a\u3002",
  pyromancerDesc: "\u54ea\u5412\uff1a\u4e09\u6627\u771f\u706b\u3001\u4e2d\u8ddd\u79bb\u7206\u53d1\uff0c\u5728\u78b0\u649e\u524d\u5148\u628a\u8840\u91cf\u70e7\u4e0b\u6765\u3002",
  assassinDesc: "\u4e8c\u90ce\u795e\uff1a\u5929\u773c\u7834\u9635\u3001\u9ad8\u901f\u7a81\u88ad\uff0c\u8eab\u677f\u8106\u4f46\u7206\u53d1\u4e0a\u9650\u5f88\u9ad8\u3002",
  stormDesc: "\u96f7\u9707\u5b50\uff1a\u4e94\u96f7\u5e72\u6270\u3001\u8f68\u8ff9\u6253\u4e71\uff0c\u8ba9\u5bf9\u624b\u66f4\u96be\u7a33\u5b9a\u78b0\u649e\u3002",
  matching: "\u6b63\u5728\u751f\u6210\u5bf9\u624b",
  matchingHint: "\u4f1a\u76f4\u63a5\u4ece\u73a9\u5bb6\u6570\u636e\u4e2d\u9009\u62e9\u8bc4\u5206\u63a5\u8fd1\u7684\u5bf9\u624b\uff1b\u6ca1\u6709\u6570\u636e\u65f6\u7531 AI \u8865\u4f4d\u3002",
  cancel: "\u53d6\u6d88\u5339\u914d",
  live: "\u5f02\u6b65\u6392\u4f4d",
  bot: "AI \u8865\u4f4d",
  human: "\u771f\u4eba\u6392\u4f4d",
  ghost: "\u73a9\u5bb6\u6570\u636e",
  win: "\u80dc\u5229",
  lose: "\u5931\u8d25",
  again: "\u7ee7\u7eed\u6392\u4f4d",
  noPlayers: "\u8fd8\u6ca1\u6709\u73a9\u5bb6\u3002",
  bootFailed: "\u542f\u52a8\u5931\u8d25"
};

const classCopy = {
  trident: t.tridentDesc,
  vampire: t.vampireDesc,
  guardian: t.guardianDesc,
  pyromancer: t.pyromancerDesc,
  assassin: t.assassinDesc,
  storm: t.stormDesc
};

const fallbackClasses = [
  {
    id: "trident",
    name: "\u5b59\u609f\u7a7a",
    color: "#f1bd3f",
    accent: "#fff1ad"
  },
  {
    id: "vampire",
    name: "\u767d\u9aa8\u592b\u4eba",
    color: "#9b2340",
    accent: "#ff7895"
  },
  {
    id: "guardian",
    name: "\u725b\u9b54\u738b",
    color: "#4f8fbc",
    accent: "#c8efff"
  },
  {
    id: "pyromancer",
    name: "\u54ea\u5412",
    color: "#e24b2f",
    accent: "#ffd08a"
  },
  {
    id: "assassin",
    name: "\u4e8c\u90ce\u795e",
    color: "#6f58d9",
    accent: "#d7ccff"
  },
  {
    id: "storm",
    name: "\u96f7\u9707\u5b50",
    color: "#31a6a8",
    accent: "#b8ffff"
  }
];

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return "";
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private browsing or restricted webviews can block storage.
  }
}

function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage cleanup failures.
  }
}

const state = {
  token: storageGet("ball-duel-token") || "",
  user: null,
  classes: [],
  leaderboard: [],
  authMode: "login",
  matchPoll: null,
  battlePoll: null,
  animation: null,
  match: null,
  latestT: 0,
  floating: [],
  seenEvents: new Set(),
  displayFighters: new Map()
};

function cls(id) {
  return state.classes.find((item) => item.id === id);
}

async function api(path, options = {}) {
  const headers = { "content-type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.authorization = `Bearer ${state.token}`;
  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "\u8bf7\u6c42\u5931\u8d25");
  return data;
}

async function boot() {
  try {
    const classData = await api("/api/classes");
    state.classes = classData.classes || fallbackClasses;
  } catch {
    state.classes = fallbackClasses;
  }
  if (state.token) {
    try {
      const data = await api("/api/me");
      state.user = data.user;
      await loadLeaderboard();
      renderRanked();
      return;
    } catch {
      storageRemove("ball-duel-token");
      state.token = "";
    }
  }
  renderAuth();
}

function cleanupTimers() {
  clearInterval(state.matchPoll);
  clearInterval(state.battlePoll);
  cancelAnimationFrame(state.animation);
  state.matchPoll = null;
  state.battlePoll = null;
  state.animation = null;
}

function renderShell(content) {
  app.innerHTML = `
    <section class="shell">
      <header class="topbar">
        <div class="brand">
          <h1>${t.title}</h1>
          <span>${t.subtitle}</span>
        </div>
        ${state.user ? `<button class="secondary" data-action="logout">${t.logout}</button>` : ""}
      </header>
      ${content}
    </section>
  `;
  const logout = document.querySelector('[data-action="logout"]');
  if (logout) logout.addEventListener("click", logoutUser);
}

function setError(message = "") {
  const el = document.querySelector("[data-error]");
  if (el) el.textContent = message;
}

function renderAuth() {
  cleanupTimers();
  const isRegister = state.authMode === "register";
  renderShell(`
    <section class="auth-grid">
      <div class="poster" aria-hidden="true">
        <div class="poster-title">仙擂开战</div>
        <div class="preview-ball trident">悟空</div>
        <div class="preview-ball vampire">二郎</div>
        <div class="poster-foot">
          <span>${t.live}</span>
          <span>1V1 AUTO IMMORTAL DUEL</span>
        </div>
      </div>
      <form class="auth-panel panel" data-auth-form>
        <div class="tabs">
          <button type="button" class="${!isRegister ? "active" : ""}" data-mode="login">${t.login}</button>
          <button type="button" class="${isRegister ? "active" : ""}" data-mode="register">${t.register}</button>
        </div>
        <label class="field">${t.username}<input name="username" autocomplete="username" placeholder="player_001" required /></label>
        ${isRegister ? `<label class="field">${t.nickname}<input name="nickname" maxlength="16" placeholder="\u7ade\u6280\u573a\u65b0\u4eba" /></label>` : ""}
        <label class="field">${t.password}<input name="password" type="password" autocomplete="${isRegister ? "new-password" : "current-password"}" placeholder="\u81f3\u5c11 6 \u4f4d" required /></label>
        ${isRegister ? `
          <label class="field">${t.class}
            <select name="selectedClass">
              ${state.classes.map((item) => `<option value="${item.id}">${item.name}</option>`).join("")}
            </select>
          </label>` : ""}
        <button class="primary">${isRegister ? t.createAccount : t.enterRank}</button>
        <div class="error" data-error></div>
      </form>
    </section>
  `);
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.authMode = button.dataset.mode;
      renderAuth();
    });
  });
  document.querySelector("[data-auth-form]").addEventListener("submit", onAuthSubmit);
}

async function onAuthSubmit(event) {
  event.preventDefault();
  setError();
  const body = Object.fromEntries(new FormData(event.currentTarget).entries());
  try {
    const endpoint = state.authMode === "register" ? "/api/auth/register" : "/api/auth/login";
    const data = await api(endpoint, { method: "POST", body: JSON.stringify(body) });
    state.token = data.token;
    state.user = data.user;
    storageSet("ball-duel-token", state.token);
    await loadLeaderboard();
    renderRanked();
  } catch (error) {
    setError(error.message);
  }
}

async function loadLeaderboard() {
  const data = await api("/api/leaderboard");
  state.leaderboard = data.users;
}

function renderRanked() {
  cleanupTimers();
  renderShell(`
    <section class="ranked-grid">
      <div class="rank-card panel">
        <div class="profile-head">
          <div>
            <h2>${state.user.nickname}</h2>
            <span>@${state.user.username}</span>
          </div>
          <strong>${state.user.rating}</strong>
        </div>
        <div class="statline">
          <div class="stat"><span>${t.score}</span><strong>${state.user.rating}</strong></div>
          <div class="stat"><span>${t.wins}</span><strong>${state.user.wins}</strong></div>
          <div class="stat"><span>${t.losses}</span><strong>${state.user.losses}</strong></div>
        </div>
        <div class="classes">
          ${state.classes.map((item) => `
            <button class="class-option ${item.id === state.user.selectedClass ? "active" : ""}" data-class="${item.id}">
              <span class="class-dot" style="background: radial-gradient(circle at 35% 30%, ${item.accent}, ${item.color} 56%, #050505);"></span>
              <span>
                <strong>${item.name}</strong>
                <small>${classCopy[item.id] || ""}</small>
              </span>
            </button>
          `).join("")}
        </div>
        <button class="primary big" data-action="match">${t.startRank}</button>
      </div>
      <div class="leaderboard panel">
        <h2>${t.ranking}</h2>
        <div class="board">
          ${state.leaderboard.map((user, index) => `
            <div class="board-row">
              <span>#${index + 1}</span>
              <strong>${user.nickname}</strong>
              <span>${cls(user.selectedClass)?.name || ""}</span>
              <b>${user.rating}</b>
            </div>
          `).join("") || `<p>${t.noPlayers}</p>`}
        </div>
      </div>
    </section>
  `);
  document.querySelectorAll("[data-class]").forEach((button) => button.addEventListener("click", () => selectClass(button.dataset.class)));
  document.querySelector('[data-action="match"]').addEventListener("click", startMatch);
}

async function selectClass(selectedClass) {
  const data = await api("/api/me/class", { method: "PATCH", body: JSON.stringify({ selectedClass }) });
  state.user = data.user;
  renderRanked();
}

async function startMatch() {
  cleanupTimers();
  const data = await api("/api/match/start", { method: "POST", body: "{}" });
  if (data.matchId) return fetchMatch(data.matchId);
  renderMatching();
  state.matchPoll = setInterval(async () => {
    const result = await api("/api/match/pending");
    if (result.status === "ready" && result.match) {
      clearInterval(state.matchPoll);
      renderBattle(result.match);
    }
  }, 500);
}

function renderMatching() {
  renderShell(`
    <section class="matching panel">
      <div class="loader"></div>
      <h2>${t.matching}</h2>
      <p>${t.matchingHint}</p>
      <button class="secondary danger" data-action="cancel">${t.cancel}</button>
    </section>
  `);
  document.querySelector('[data-action="cancel"]').addEventListener("click", cancelMatch);
}

async function fetchMatch(matchId) {
  const data = await api(`/api/match/${matchId}`);
  if (data.status === "ready") renderBattle(data.match);
}

async function cancelMatch() {
  cleanupTimers();
  await api("/api/match/cancel", { method: "POST", body: "{}" });
  renderRanked();
}

function renderBattle(match) {
  cleanupTimers();
  state.match = match;
  state.latestT = match.latest?.t || 0;
  state.floating = [];
  state.seenEvents = new Set();
  state.displayFighters = new Map();
  const self = match.fighters.find((f) => f.id === state.user.id);
  const opponent = match.fighters.find((f) => f.id !== state.user.id);
  renderShell(`
    <section class="battle-screen">
      <div class="battle-header">
        <div>
          <h2>${self.className} VS ${opponent.className}</h2>
          <span>${opponent.isBot ? t.bot : opponent.isGhost ? t.ghost : t.human} \u00b7 ${t.live}</span>
        </div>
        <div class="live-badge" data-status>${match.status === "finished" ? "FINISHED" : "LIVE"}</div>
      </div>
      <div class="arena-shell">
        <canvas id="arena" width="${match.arena.width}" height="${match.arena.height + 96}"></canvas>
      </div>
      <div class="result panel" data-result hidden>
        <div>
          <strong data-result-title></strong>
          <span data-result-meta></span>
        </div>
        <button class="primary" data-action="again">${t.again}</button>
      </div>
    </section>
  `);
  document.querySelector('[data-action="again"]').addEventListener("click", async () => {
    await api("/api/match/complete", { method: "POST", body: "{}" });
    const data = await api("/api/me");
    state.user = data.user;
    await loadLeaderboard();
    renderRanked();
  });
  state.battlePoll = setInterval(pollBattle, 100);
  drawLoop();
}

async function pollBattle() {
  if (!state.match) return;
  const data = await api(`/api/match/${state.match.id}?since=${state.latestT}`);
  if (data.status !== "ready") return;
  const incoming = data.match;
  state.match = { ...state.match, ...incoming };
  for (const snap of incoming.snapshots || []) {
    state.latestT = Math.max(state.latestT, snap.t);
    for (const event of snap.events || []) {
      const key = `${snap.t}:${event.type}:${event.fighterId || event.winnerId || ""}:${event.amount || ""}`;
      if (state.seenEvents.has(key)) continue;
      state.seenEvents.add(key);
      if (event.type === "damage" || event.type === "heal") {
        const pos = snap.fighters.find((f) => f.id === event.fighterId);
        state.floating.push({ ...event, x: pos?.x || 230, y: pos?.y || 230, born: performance.now() });
      }
    }
  }
  if (incoming.status === "finished") {
    clearInterval(state.battlePoll);
    showResult(incoming);
  }
}

function drawLoop() {
  const canvas = document.querySelector("#arena");
  if (!canvas || !state.match) return;
  const ctx = canvas.getContext("2d");
  drawArena(ctx, state.match);
  state.animation = requestAnimationFrame(drawLoop);
}

function drawArena(ctx, match) {
  const frame = match.latest || match.snapshots?.[match.snapshots.length - 1];
  if (!frame) return;
  const arenaH = match.arena.height;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, match.arena.width, arenaH);
  ctx.strokeStyle = "rgba(255,255,255,.9)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, match.arena.width - 2, arenaH - 2);
  ctx.fillStyle = "#fff";
  ctx.font = "900 38px Courier New";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("WHO WILL WIN?", match.arena.width / 2, 56);

  const fighterMap = new Map(match.fighters.map((f) => [f.id, f]));
  for (const item of frame.fighters) {
    const fighter = fighterMap.get(item.id);
    let display = state.displayFighters.get(item.id);
    if (!display) {
      display = { x: item.x, y: item.y };
      state.displayFighters.set(item.id, display);
    } else {
      display.x += (item.x - display.x) * 0.42;
      display.y += (item.y - display.y) * 0.42;
    }
    const pulse = item.skillActive ? Math.sin(performance.now() / 80) * 4 + 6 : 0;
    const radius = item.radius || 31;
    const x = display.x;
    const y = display.y;
    const gradient = ctx.createRadialGradient(x - 9, y - 10, 4, x, y, radius + pulse);
    gradient.addColorStop(0, fighter.accent);
    gradient.addColorStop(0.55, fighter.color);
    gradient.addColorStop(1, "#060606");
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(x, y, radius + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = item.skillActive ? "#fff0a8" : "rgba(255,255,255,.42)";
    ctx.lineWidth = item.skillActive ? 4 : 2;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "900 23px Georgia";
    ctx.fillText(Math.max(0, item.hp), x, y + 1);
  }

  drawFloating(ctx);
  drawHud(ctx, match, frame, arenaH);
}

function drawFloating(ctx) {
  const now = performance.now();
  for (let i = state.floating.length - 1; i >= 0; i -= 1) {
    const item = state.floating[i];
    const age = now - item.born;
    if (age > 900) {
      state.floating.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = 1 - age / 900;
    ctx.fillStyle = item.type === "heal" ? "#64f49a" : "#ff6b8d";
    ctx.font = "900 20px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(`${item.type === "heal" ? "+" : "-"}${item.amount}`, item.x, item.y - 36 - age * 0.04);
    ctx.globalAlpha = 1;
  }
}

function drawHud(ctx, match, frame, arenaH) {
  ctx.fillStyle = "#090909";
  ctx.fillRect(0, arenaH, match.arena.width, 96);
  const fighterMap = new Map(match.fighters.map((f) => [f.id, f]));
  frame.fighters.forEach((item, index) => {
    const fighter = fighterMap.get(item.id);
    const x = index === 0 ? 18 : match.arena.width - 218;
    ctx.fillStyle = "#f4f0e8";
    ctx.font = "800 13px Microsoft YaHei";
    ctx.textAlign = "left";
    ctx.fillText(`${fighter.className} · ${fighter.name}`, x, arenaH + 24);
    ctx.fillStyle = "rgba(255,255,255,.18)";
    ctx.fillRect(x, arenaH + 36, 200, 12);
    ctx.fillStyle = fighter.color;
    ctx.fillRect(x, arenaH + 36, 200 * Math.max(0, item.hp) / Math.max(1, item.maxHp || 100), 12);
    ctx.strokeStyle = "rgba(255,255,255,.45)";
    ctx.strokeRect(x, arenaH + 36, 200, 12);
    ctx.fillStyle = "#aaa398";
    ctx.font = "11px Microsoft YaHei";
    ctx.fillText(classCopy[fighter.classId] || fighter.className, x, arenaH + 70);
  });
}

function showResult(match) {
  const panel = document.querySelector("[data-result]");
  if (!panel || !panel.hidden) return;
  const won = match.winnerId === state.user.id;
  const delta = match.ratingChanges?.[state.user.id] || 0;
  panel.hidden = false;
  document.querySelector("[data-status]").textContent = "FINISHED";
  document.querySelector("[data-result-title]").textContent = won ? t.win : t.lose;
  document.querySelector("[data-result-meta]").textContent = `${t.score} ${delta >= 0 ? "+" : ""}${delta}`;
}

function logoutUser() {
  cleanupTimers();
  state.token = "";
  state.user = null;
  state.match = null;
  storageRemove("ball-duel-token");
  renderAuth();
}

boot().catch((error) => {
  app.innerHTML = `<div class="panel auth-panel"><h2>${t.bootFailed}</h2><p>${error.message}</p></div>`;
});
