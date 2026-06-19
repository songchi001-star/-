const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ENV = typeof process !== "undefined" && process.env ? process.env : {};
const PORT = Number(ENV.PORT || 3000);
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const TOKEN_SECRET = ENV.TOKEN_SECRET || "dev-secret-change-before-production";

const TICK_MS = 33;
const ARENA = { width: 460, height: 460 };

const liveMatches = new Map();
const userMatches = new Map();
let memoryDb = { users: [], battles: [] };

const TEXT = {
  trident: "\u5b59\u609f\u7a7a",
  vampire: "\u767d\u9aa8\u592b\u4eba",
  guardian: "\u725b\u9b54\u738b",
  pyromancer: "\u54ea\u5412",
  assassin: "\u4e8c\u90ce\u795e",
  storm: "\u96f7\u9707\u5b50",
  pierce: "\u91d1\u7b8d\u68d2\u7a81\u8fdb",
  bite: "\u767d\u9aa8\u6444\u9b42",
  chase: "\u767d\u9aa8\u8ffd\u547d",
  shieldBash: "\u6df7\u94c1\u68cd\u9707\u5730",
  flameBurst: "\u4e09\u6627\u771f\u706b",
  shadowDash: "\u5929\u773c\u7834\u9635",
  lightning: "\u4e94\u96f7\u8f70\u9876",
  hit: "\u649e\u51fb",
  pierceHit: "\u91d1\u7b8d\u68d2\u547d\u4e2d",
  shadowHit: "\u5929\u773c\u547d\u4e2d",
  usernameError: "\u7528\u6237\u540d\u9700\u8981 3-20 \u4f4d\u5c0f\u5199\u5b57\u6bcd\u3001\u6570\u5b57\u6216\u4e0b\u5212\u7ebf",
  passwordError: "\u5bc6\u7801\u81f3\u5c11 6 \u4f4d",
  usernameTaken: "\u7528\u6237\u540d\u5df2\u5b58\u5728",
  badLogin: "\u7528\u6237\u540d\u6216\u5bc6\u7801\u4e0d\u6b63\u786e",
  needLogin: "\u8bf7\u5148\u767b\u5f55",
  badClass: "\u804c\u4e1a\u4e0d\u5b58\u5728",
  notFound: "\u63a5\u53e3\u4e0d\u5b58\u5728",
  serverError: "\u670d\u52a1\u5668\u9519\u8bef"
};

const CLASSES = {
  trident: {
    id: "trident",
    name: TEXT.trident,
    color: "#f1bd3f",
    accent: "#fff1ad",
    hp: 100,
    radius: 38,
    speed: 6.15,
    baseDamage: 8,
    mass: 1.05,
    skill: { name: TEXT.pierce, cooldown: 3600, damage: 12, knockback: 7.5, duration: 620 }
  },
  vampire: {
    id: "vampire",
    name: TEXT.vampire,
    color: "#9b2340",
    accent: "#ff7895",
    hp: 100,
    radius: 39,
    speed: 5.85,
    baseDamage: 7,
    mass: 1.15,
    lifesteal: 0.35,
    skill: { name: TEXT.bite, cooldown: 3100, damage: 10, heal: 8, range: 72 }
  },
  guardian: {
    id: "guardian",
    name: TEXT.guardian,
    color: "#4f8fbc",
    accent: "#c8efff",
    hp: 120,
    radius: 41,
    speed: 5.25,
    baseDamage: 6,
    mass: 1.35,
    armor: 2,
    skill: { name: TEXT.shieldBash, cooldown: 3400, damage: 9, knockback: 8.8, range: 78 }
  },
  pyromancer: {
    id: "pyromancer",
    name: TEXT.pyromancer,
    color: "#e24b2f",
    accent: "#ffd08a",
    hp: 92,
    radius: 37,
    speed: 6.2,
    baseDamage: 6,
    mass: 0.95,
    skill: { name: TEXT.flameBurst, cooldown: 3000, damage: 14, knockback: 4.2, range: 130 }
  },
  assassin: {
    id: "assassin",
    name: TEXT.assassin,
    color: "#6f58d9",
    accent: "#d7ccff",
    hp: 88,
    radius: 36,
    speed: 7.15,
    baseDamage: 9,
    mass: 0.88,
    skill: { name: TEXT.shadowDash, cooldown: 2800, damage: 15, duration: 520 }
  },
  storm: {
    id: "storm",
    name: TEXT.storm,
    color: "#31a6a8",
    accent: "#b8ffff",
    hp: 96,
    radius: 37,
    speed: 6.55,
    baseDamage: 7,
    mass: 0.98,
    skill: { name: TEXT.lightning, cooldown: 3200, damage: 11, range: 150 }
  }
};

function ensureDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_FILE)) writeDb(memoryDb);
  } catch (error) {
    console.warn(`Using in-memory database: ${error.message}`);
  }
}

function readDb() {
  ensureDb();
  try {
    memoryDb = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch (error) {
    console.warn(`Read database failed, using memory: ${error.message}`);
  }
  return JSON.parse(JSON.stringify(memoryDb));
}

function writeDb(db) {
  memoryDb = JSON.parse(JSON.stringify(db));
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.warn(`Persist database failed, keeping memory only: ${error.message}`);
  }
}

function json(res, status, data) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function randomId(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const candidate = hashPassword(password, salt).split(":")[1];
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

function signToken(userId) {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 1000 * 60 * 60 * 24 * 14 })).toString("base64url");
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url");
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  return decoded.exp >= Date.now() ? decoded.userId : null;
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    rating: user.rating,
    wins: user.wins,
    losses: user.losses,
    selectedClass: user.selectedClass
  };
}

function requireUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const userId = verifyToken(token);
  if (!userId) return null;
  return readDb().users.find((u) => u.id === userId) || null;
}

function unitVector(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

function makeFighter(player, classId, side, isBot = false) {
  const cls = CLASSES[classId] || CLASSES.trident;
  const angle = side === "left" ? -0.45 : Math.PI + 0.45;
  return {
    id: player.id,
    name: player.nickname,
    username: player.username,
    classId: cls.id,
    className: cls.name,
    color: cls.color,
    accent: cls.accent,
    rating: player.rating,
    isBot,
    isGhost: !!player.isGhost,
    hp: cls.hp,
    maxHp: cls.hp,
    radius: cls.radius,
    mass: cls.mass,
    armor: cls.armor || 0,
    baseDamage: cls.baseDamage,
    x: side === "left" ? 120 : 340,
    y: side === "left" ? 150 : 310,
    vx: Math.cos(angle) * cls.speed,
    vy: Math.sin(angle) * cls.speed,
    nextSkillAt: 1200 + Math.random() * 900,
    skillActiveUntil: 0,
    skill: cls.skill,
    lifesteal: cls.lifesteal || 0
  };
}

function makeBotFor(user) {
  const names = ["AI-01", "AI-Blood", "AI-Trainer", "AI-Mirror"];
  const classIds = Object.keys(CLASSES);
  return {
    id: randomId("bot"),
    username: "ai",
    nickname: names[Math.floor(Math.random() * names.length)],
    rating: clamp(user.rating + Math.floor(Math.random() * 81) - 40, 800, 1800),
    selectedClass: classIds[Math.floor(Math.random() * classIds.length)]
  };
}

function makeAsyncOpponentFor(user) {
  const candidates = readDb().users
    .filter((candidate) => candidate.id !== user.id)
    .sort((a, b) => Math.abs(a.rating - user.rating) - Math.abs(b.rating - user.rating));
  const candidate = candidates[Math.floor(Math.random() * Math.min(candidates.length, 5))];
  if (!candidate) return makeBotFor(user);
  return {
    id: candidate.id,
    username: candidate.username,
    nickname: candidate.nickname,
    rating: candidate.rating,
    selectedClass: CLASSES[candidate.selectedClass] ? candidate.selectedClass : "trident",
    isGhost: true
  };
}

function makeSnapshot(match, events = []) {
  return {
    t: match.elapsed,
    status: match.status,
    winnerId: match.winnerId,
    fighters: match.fighters.map((f) => ({
      id: f.id,
      x: Math.round(f.x),
      y: Math.round(f.y),
      hp: Math.round(f.hp),
      maxHp: f.maxHp,
      radius: f.radius,
      skillActive: f.skillActiveUntil > match.elapsed
    })),
    events
  };
}

function applyHit(match, attacker, defender, events) {
  let damage = attacker.baseDamage;
  let label = TEXT.hit;
  if (attacker.classId === "trident" && attacker.skillActiveUntil > match.elapsed) {
    damage += attacker.skill.damage;
    const dir = unitVector(attacker, defender);
    defender.vx += dir.x * attacker.skill.knockback;
    defender.vy += dir.y * attacker.skill.knockback;
    attacker.skillActiveUntil = 0;
    label = TEXT.pierceHit;
  }
  if (attacker.classId === "assassin" && attacker.skillActiveUntil > match.elapsed) {
    damage += attacker.skill.damage;
    attacker.skillActiveUntil = 0;
    label = TEXT.shadowHit;
  }
  damage = Math.max(1, damage - (defender.armor || 0));
  defender.hp = clamp(defender.hp - damage, 0, defender.maxHp);
  events.push({ type: "damage", fighterId: defender.id, amount: damage, text: label });
  if (attacker.lifesteal) {
    const heal = Math.round(damage * attacker.lifesteal);
    attacker.hp = clamp(attacker.hp + heal, 0, attacker.maxHp);
    events.push({ type: "heal", fighterId: attacker.id, amount: heal });
  }
}

function stepMatch(match) {
  if (match.status !== "live") return;
  match.elapsed += TICK_MS;
  const [a, b] = match.fighters;
  const events = [];

  for (const f of match.fighters) {
    const other = f === a ? b : a;
    if (match.elapsed >= f.nextSkillAt) {
      if (f.classId === "trident") {
        const dir = unitVector(f, other);
        f.vx = dir.x * 10.2;
        f.vy = dir.y * 10.2;
        f.skillActiveUntil = match.elapsed + f.skill.duration;
        f.nextSkillAt = match.elapsed + f.skill.cooldown;
        events.push({ type: "skill", fighterId: f.id, text: TEXT.pierce });
      } else if (f.classId === "vampire") {
        f.nextSkillAt = match.elapsed + f.skill.cooldown;
        const dist = Math.hypot(other.x - f.x, other.y - f.y);
        if (dist <= f.skill.range) {
          other.hp = clamp(other.hp - f.skill.damage, 0, other.maxHp);
          f.hp = clamp(f.hp + f.skill.heal, 0, f.maxHp);
          events.push({ type: "damage", fighterId: other.id, amount: f.skill.damage, text: TEXT.bite });
          events.push({ type: "heal", fighterId: f.id, amount: f.skill.heal });
        } else {
          const dir = unitVector(f, other);
          f.vx += dir.x * 1.15;
          f.vy += dir.y * 1.15;
          events.push({ type: "skill", fighterId: f.id, text: TEXT.chase });
        }
      } else if (f.classId === "guardian") {
        f.nextSkillAt = match.elapsed + f.skill.cooldown;
        const dist = Math.hypot(other.x - f.x, other.y - f.y);
        const dir = unitVector(f, other);
        if (dist <= f.skill.range) {
          const damage = Math.max(1, f.skill.damage - (other.armor || 0));
          other.hp = clamp(other.hp - damage, 0, other.maxHp);
          other.vx += dir.x * f.skill.knockback;
          other.vy += dir.y * f.skill.knockback;
          f.hp = clamp(f.hp + 3, 0, f.maxHp);
          events.push({ type: "damage", fighterId: other.id, amount: damage, text: TEXT.shieldBash });
          events.push({ type: "heal", fighterId: f.id, amount: 3 });
        } else {
          f.vx += dir.x * 1.05;
          f.vy += dir.y * 1.05;
          events.push({ type: "skill", fighterId: f.id, text: TEXT.shieldBash });
        }
      } else if (f.classId === "pyromancer") {
        f.nextSkillAt = match.elapsed + f.skill.cooldown;
        const dist = Math.hypot(other.x - f.x, other.y - f.y);
        const dir = unitVector(f, other);
        if (dist <= f.skill.range) {
          const damage = Math.max(1, f.skill.damage - (other.armor || 0));
          other.hp = clamp(other.hp - damage, 0, other.maxHp);
          other.vx += dir.x * f.skill.knockback;
          other.vy += dir.y * f.skill.knockback;
          events.push({ type: "damage", fighterId: other.id, amount: damage, text: TEXT.flameBurst });
        } else {
          f.vx += dir.x * 0.8;
          f.vy += dir.y * 0.8;
          events.push({ type: "skill", fighterId: f.id, text: TEXT.flameBurst });
        }
      } else if (f.classId === "assassin") {
        const dir = unitVector(f, other);
        f.vx = dir.x * 11.4;
        f.vy = dir.y * 11.4;
        f.skillActiveUntil = match.elapsed + f.skill.duration;
        f.nextSkillAt = match.elapsed + f.skill.cooldown;
        events.push({ type: "skill", fighterId: f.id, text: TEXT.shadowDash });
      } else if (f.classId === "storm") {
        f.nextSkillAt = match.elapsed + f.skill.cooldown;
        const dist = Math.hypot(other.x - f.x, other.y - f.y);
        const dir = unitVector(f, other);
        if (dist <= f.skill.range) {
          const damage = Math.max(1, f.skill.damage - (other.armor || 0));
          other.hp = clamp(other.hp - damage, 0, other.maxHp);
          other.vx += (Math.random() - 0.5) * 4 + dir.x * 2.5;
          other.vy += (Math.random() - 0.5) * 4 + dir.y * 2.5;
          events.push({ type: "damage", fighterId: other.id, amount: damage, text: TEXT.lightning });
        } else {
          f.vx += dir.x * 1.25;
          f.vy += dir.y * 1.25;
          events.push({ type: "skill", fighterId: f.id, text: TEXT.lightning });
        }
      }
    }
  }

  for (const f of match.fighters) {
    f.x += f.vx;
    f.y += f.vy;
    f.vx *= 0.998;
    f.vy *= 0.998;
    const cls = CLASSES[f.classId];
    const speed = Math.hypot(f.vx, f.vy);
    const maxSpeed = f.skillActiveUntil > match.elapsed ? 11.4 : cls.speed + 1.5;
    if (speed > maxSpeed) {
      f.vx = (f.vx / speed) * maxSpeed;
      f.vy = (f.vy / speed) * maxSpeed;
    }
    if (f.x - f.radius < 0 || f.x + f.radius > ARENA.width) {
      f.x = clamp(f.x, f.radius, ARENA.width - f.radius);
      f.vx *= -1;
    }
    if (f.y - f.radius < 0 || f.y + f.radius > ARENA.height) {
      f.y = clamp(f.y, f.radius, ARENA.height - f.radius);
      f.vy *= -1;
    }
  }

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const minDist = a.radius + b.radius;
  if (dist < minDist && match.elapsed - match.lastCollisionAt > 220) {
    match.lastCollisionAt = match.elapsed;
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = minDist - dist;
    a.x -= nx * overlap * 0.5;
    a.y -= ny * overlap * 0.5;
    b.x += nx * overlap * 0.5;
    b.y += ny * overlap * 0.5;
    const avx = a.vx;
    const avy = a.vy;
    a.vx = b.vx * 0.9 - nx * 0.75;
    a.vy = b.vy * 0.9 - ny * 0.75;
    b.vx = avx * 0.9 + nx * 0.75;
    b.vy = avy * 0.9 + ny * 0.75;
    applyHit(match, a, b, events);
    applyHit(match, b, a, events);
  }

  if (a.hp <= 0 || b.hp <= 0 || match.elapsed >= 45000) {
    match.status = "finished";
    match.winnerId = a.hp >= b.hp ? a.id : b.id;
    events.push({ type: "finish", winnerId: match.winnerId });
    finishMatch(match);
  }

  match.snapshots.push(makeSnapshot(match, events));
  match.snapshots = match.snapshots.slice(-240);
}

function publicMatch(match, since = 0) {
  return {
    id: match.id,
    status: match.status,
    arena: ARENA,
    elapsed: match.elapsed,
    winnerId: match.winnerId,
    ratingChanges: match.ratingChanges,
    fighters: match.fighters.map((f) => ({
      id: f.id,
      name: f.name,
      classId: f.classId,
      className: f.className,
      color: f.color,
      accent: f.accent,
      rating: f.rating,
      isBot: f.isBot,
      isGhost: f.isGhost
    })),
    snapshots: match.snapshots.filter((s) => s.t > since).slice(-40),
    latest: match.snapshots[match.snapshots.length - 1]
  };
}

function finishMatch(match) {
  if (match.finishedSaved) return;
  match.finishedSaved = true;
  clearInterval(match.timer);
  const db = readDb();
  const humanIds = match.fighters.filter((f) => !f.isBot && !f.isGhost).map((f) => f.id);
  for (const user of db.users) {
    if (!humanIds.includes(user.id)) continue;
    const won = match.winnerId === user.id;
    const delta = won ? 24 : -14;
    user.rating = clamp(user.rating + delta, 0, 9999);
    user.wins += won ? 1 : 0;
    user.losses += won ? 0 : 1;
    match.ratingChanges[user.id] = delta;
  }
  db.battles.push({
    id: match.id,
    createdAt: new Date().toISOString(),
    winnerId: match.winnerId,
    fighters: match.fighters.map((f) => ({ id: f.id, name: f.name, classId: f.classId, isBot: f.isBot, isGhost: f.isGhost }))
  });
  db.battles = db.battles.slice(-200);
  writeDb(db);
}

function startMatch(players) {
  const match = {
    id: randomId("match"),
    status: "live",
    elapsed: 0,
    winnerId: null,
    ratingChanges: {},
    lastCollisionAt: -1000,
    finishedSaved: false,
    fighters: [
      makeFighter(players[0], players[0].selectedClass, "left", players[0].id.startsWith("bot_")),
      makeFighter(players[1], players[1].selectedClass, "right", players[1].id.startsWith("bot_"))
    ],
    snapshots: []
  };
  match.snapshots.push(makeSnapshot(match, [{ type: "start" }]));
  match.timer = setInterval(() => stepMatch(match), TICK_MS);
  liveMatches.set(match.id, match);
  for (const player of players) {
    if (!player.id.startsWith("bot_") && !player.isGhost) userMatches.set(player.id, match.id);
  }
  return match;
}

function enqueueUser(user) {
  const currentMatchId = userMatches.get(user.id);
  if (currentMatchId && liveMatches.has(currentMatchId)) return currentMatchId;
  return startMatch([user, makeAsyncOpponentFor(user)]).id;
}

async function handleApi(req, res, pathname, searchParams) {
  try {
    if (req.method === "GET" && pathname === "/api/health") {
      return json(res, 200, {
        ok: true,
        root: ROOT,
        publicDir: PUBLIC_DIR,
        publicExists: fs.existsSync(PUBLIC_DIR),
        files: fs.existsSync(PUBLIC_DIR) ? fs.readdirSync(PUBLIC_DIR).slice(0, 20) : []
      });
    }

    if (req.method === "GET" && pathname === "/api/classes") {
      return json(res, 200, { classes: Object.values(CLASSES) });
    }

    if (req.method === "POST" && pathname === "/api/auth/register") {
      const body = await parseBody(req);
      const username = String(body.username || "").trim().toLowerCase();
      const password = String(body.password || "");
      const nickname = String(body.nickname || body.username || "").trim();
      if (!/^[a-z0-9_]{3,20}$/.test(username)) return json(res, 400, { error: TEXT.usernameError });
      if (password.length < 6) return json(res, 400, { error: TEXT.passwordError });
      const db = readDb();
      if (db.users.some((u) => u.username === username)) return json(res, 409, { error: TEXT.usernameTaken });
      const user = {
        id: randomId("user"),
        username,
        nickname: nickname.slice(0, 16) || username,
        passwordHash: hashPassword(password),
        rating: 1000,
        wins: 0,
        losses: 0,
        selectedClass: CLASSES[body.selectedClass] ? body.selectedClass : "trident",
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      writeDb(db);
      return json(res, 201, { token: signToken(user.id), user: publicUser(user) });
    }

    if (req.method === "POST" && pathname === "/api/auth/login") {
      const body = await parseBody(req);
      const username = String(body.username || "").trim().toLowerCase();
      const user = readDb().users.find((u) => u.username === username);
      if (!user || !verifyPassword(String(body.password || ""), user.passwordHash)) return json(res, 401, { error: TEXT.badLogin });
      return json(res, 200, { token: signToken(user.id), user: publicUser(user) });
    }

    const user = requireUser(req);
    if (!user) return json(res, 401, { error: TEXT.needLogin });

    if (req.method === "GET" && pathname === "/api/me") return json(res, 200, { user: publicUser(user) });

    if (req.method === "PATCH" && pathname === "/api/me/class") {
      const body = await parseBody(req);
      if (!CLASSES[body.selectedClass]) return json(res, 400, { error: TEXT.badClass });
      const db = readDb();
      const fresh = db.users.find((u) => u.id === user.id);
      fresh.selectedClass = body.selectedClass;
      writeDb(db);
      return json(res, 200, { user: publicUser(fresh) });
    }

    if (req.method === "POST" && pathname === "/api/match/start") {
      const matchId = enqueueUser(user);
      return json(res, 200, { status: matchId ? "ready" : "matching", matchId });
    }

    if (req.method === "POST" && pathname === "/api/match/cancel") {
      return json(res, 200, { ok: true });
    }

    if (req.method === "POST" && pathname === "/api/match/complete") {
      userMatches.delete(user.id);
      return json(res, 200, { ok: true });
    }

    if (req.method === "GET" && pathname === "/api/match/pending") {
      const matchId = userMatches.get(user.id);
      const match = matchId ? liveMatches.get(matchId) : null;
      return json(res, 200, match ? { status: "ready", match: publicMatch(match) } : { status: "matching" });
    }

    const matchRoute = pathname.match(/^\/api\/match\/([^/]+)$/);
    if (req.method === "GET" && matchRoute) {
      const match = liveMatches.get(matchRoute[1]);
      if (!match) return json(res, 200, { status: "matching" });
      const since = Number(searchParams.get("since") || 0);
      return json(res, 200, { status: "ready", match: publicMatch(match, since) });
    }

    if (req.method === "GET" && pathname === "/api/leaderboard") {
      const users = readDb().users.slice().sort((a, b) => b.rating - a.rating).slice(0, 20).map(publicUser);
      return json(res, 200, { users });
    }

    return json(res, 404, { error: TEXT.notFound });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: TEXT.serverError, detail: ENV.NODE_ENV === "production" ? undefined : error.message });
  }
}

function serveStatic(req, res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(PUBLIC_DIR, `.${safePath}`);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      const fallback = path.join(PUBLIC_DIR, "index.html");
      return fs.readFile(fallback, (fallbackErr, fallbackContent) => {
        if (fallbackErr) {
          res.writeHead(404);
          return res.end("Not found");
        }
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        return res.end(fallbackContent);
      });
    }
    const types = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8"
    };
    res.writeHead(200, { "content-type": types[path.extname(filePath)] || "application/octet-stream" });
    res.end(content);
  });
}

ensureDb();

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) return handleApi(req, res, url.pathname, url.searchParams);
  return serveStatic(req, res, url.pathname);
}).listen(PORT, () => {
  console.log(`Ball Duel V1 running at http://localhost:${PORT}`);
});
