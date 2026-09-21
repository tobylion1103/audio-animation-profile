(() => {
  const P = window.PROFILE;
  const $ = (id) => document.getElementById(id);

  const gate = $("gate");
  const app = $("app");
  const video = $("bgVideo");
  const audio = $("audio");
  const card = $("card");
  const toast = $("toast");
  const fx = $("fx");
  const trail = $("trail");
  const cursor = $("cursor");

  let trackIndex = 0;
  let presenceTimer = 0;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const VIEWS_KEY = "guns_clone_views";

  document.documentElement.style.setProperty("--accent", P.accent);
  document.documentElement.style.setProperty("--fx", P.effectsColor);

  /* ---------- hydrate static UI ---------- */
  document.title = `@${P.username} | demo`;
  $("enterText").textContent = P.enterText;
  $("nameText").textContent = P.username;
  $("bio").textContent = P.bio;
  $("alias").textContent = P.alias ? `aka ${P.alias}` : "";
  $("avatar").src = P.avatar;
  $("presenceAvatar").src = P.avatar;
  $("presenceName").textContent = P.username;
  $("uidPill").textContent = `UID ${P.uid}`;
  cursor.style.backgroundImage = `url("${P.cursor}")`;
  video.src = P.background;

  const badges = $("badges");
  P.badges.forEach((b) => {
    const el = document.createElement("span");
    el.className = "badge";
    el.title = b.label;
    el.textContent = b.icon;
    badges.appendChild(el);
  });

  const socials = $("socials");
  P.socials.forEach((s) => {
    const el = s.copy ? document.createElement("button") : document.createElement("a");
    el.className = "social";
    el.textContent = s.name.slice(0, 2).toUpperCase();
    el.title = s.copy ? `Copy ${s.name}` : s.name;
    if (s.copy) {
      el.type = "button";
      el.addEventListener("click", () => copyText(s.copy));
    } else {
      el.href = s.href;
      el.target = "_blank";
      el.rel = "noopener";
    }
    socials.appendChild(el);
  });

  $("uidPill").addEventListener("click", () => copyText(String(P.uid)));

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("on");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("on"), 1400);
  }

  async function copyText(v) {
    try {
      await navigator.clipboard.writeText(v);
      showToast("Copied");
    } catch {
      showToast("Copy failed");
    }
  }

  function bumpViews() {
    const n = Number(localStorage.getItem(VIEWS_KEY) || "1284") + 1;
    localStorage.setItem(VIEWS_KEY, String(n));
    $("viewsPill").textContent = `Views ${n.toLocaleString()}`;
  }
  $("viewsPill").textContent = `Views ${Number(localStorage.getItem(VIEWS_KEY) || "1284").toLocaleString()}`;

  /* ---------- audio multi-track + covers ---------- */
  function loadTrack(i, autoplay) {
    trackIndex = (i + P.tracks.length) % P.tracks.length;
    const t = P.tracks[trackIndex];
    const cover = $("trackCover");
    cover.classList.add("swap");
    setTimeout(() => {
      cover.src = t.cover;
      cover.classList.remove("swap");
      // keep mock presence art in sync with current track when no live Discord
      if (!P.discordId) {
        $("presenceArt").src = t.cover;
        $("presenceActivity").textContent = `Listening to ${t.title}`;
      }
    }, 160);
    $("trackTitle").textContent = t.title;
    const wasPlaying = !audio.paused;
    audio.src = t.src;
    audio.load();
    if (autoplay || wasPlaying) {
      audio.play().then(() => setPlayUi(true)).catch(() => setPlayUi(false));
    }
  }

  function setPlayUi(playing) {
    $("playBtn").textContent = playing ? "❚❚" : "▶";
    $("playBtn").setAttribute("aria-label", playing ? "Pause" : "Play");
  }

  $("playBtn").addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
        setPlayUi(true);
      } catch {
        setPlayUi(false);
      }
    } else {
      audio.pause();
      setPlayUi(false);
    }
  });
  $("prevBtn").addEventListener("click", () => loadTrack(trackIndex - 1, true));
  $("nextBtn").addEventListener("click", () => loadTrack(trackIndex + 1, true));
  audio.addEventListener("ended", () => loadTrack(trackIndex + 1, true));
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    $("progress").style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  });
  $("seek").addEventListener("click", (e) => {
    if (!audio.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });
  $("volume").addEventListener("input", () => {
    audio.volume = Number($("volume").value);
  });
  audio.volume = Number($("volume").value);
  loadTrack(0, false);

  /* ---------- Discord presence (Lanyard) ---------- */
  const STATUS_MAP = { online: "online", idle: "idle", dnd: "dnd", offline: "offline" };

  function setPresenceMock() {
    $("statusDot").className = "dot online";
    $("presenceActivity").textContent = "Listening to Midnight Demo";
    $("presenceMeta").textContent = "Discord · Online · demo mock";
    $("presenceArt").hidden = false;
    $("presenceArt").src = P.tracks[trackIndex].cover;
    $("guildTag").hidden = false;
    $("guildTag").textContent = (P.alias || "DEMO").toUpperCase();
  }

  async function fetchPresence() {
    if (!P.discordId) {
      setPresenceMock();
      return;
    }
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${P.discordId}`);
      const json = await res.json();
      if (!json.success) throw new Error("lanyard");
      const d = json.data;
      const st = STATUS_MAP[d.discord_status] || "offline";
      $("statusDot").className = `dot ${st}`;
      const user = d.discord_user;
      const avatarHash = user.avatar;
      const avatarUrl = avatarHash
        ? `https://cdn.discordapp.com/avatars/${user.id}/${avatarHash}.${avatarHash.startsWith("a_") ? "gif" : "png"}?size=128`
        : P.avatar;
      $("avatar").src = avatarUrl;
      $("presenceAvatar").src = avatarUrl;
      $("presenceName").textContent = user.global_name || user.username;
      $("guildTag").hidden = true;

      const spotify = d.spotify;
      const activity = (d.activities || []).find((a) => a.type !== 4) || null;
      if (spotify) {
        $("presenceActivity").textContent = `Listening to ${spotify.song}`;
        $("presenceMeta").textContent = `by ${spotify.artist}`;
        $("presenceArt").hidden = false;
        $("presenceArt").src = spotify.album_art_url;
      } else if (activity) {
        const detail = [activity.name, activity.details, activity.state].filter(Boolean).join(" · ");
        $("presenceActivity").textContent = detail;
        $("presenceMeta").textContent = `Discord · ${st}`;
        const img = activity.assets?.large_image;
        if (img && img.startsWith("mp:external/")) {
          $("presenceArt").hidden = false;
          $("presenceArt").src = `https://media.discordapp.net/external/${img.replace("mp:external/", "")}`;
        } else if (img && !img.startsWith("mp:")) {
          $("presenceArt").hidden = false;
          $("presenceArt").src = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${img}.png`;
        } else {
          $("presenceArt").hidden = true;
        }
      } else {
        $("presenceActivity").textContent = st === "online" ? "Online" : st.toUpperCase();
        $("presenceMeta").textContent = "Discord";
        $("presenceArt").hidden = true;
      }
    } catch {
      setPresenceMock();
    }
  }

  /* ---------- snowflakes ---------- */
  const ctx = fx.getContext("2d");
  const flakes = [];
  function resize(c) {
    c.width = innerWidth;
    c.height = innerHeight;
  }
  function spawn(initial) {
    return {
      x: Math.random() * fx.width,
      y: initial ? Math.random() * fx.height : -8,
      r: Math.random() * 2.2 + 0.5,
      vy: Math.random() * 0.95 + 0.3,
      vx: Math.random() * 0.6 - 0.3,
      a: Math.random() * 0.55 + 0.25,
    };
  }
  function initSnow() {
    resize(fx);
    flakes.length = 0;
    const count = window.matchMedia("(max-width: 640px)").matches ? 36 : 70;
    for (let i = 0; i < count; i++) flakes.push(spawn(true));
  }
  function tickSnow() {
    ctx.clearRect(0, 0, fx.width, fx.height);
    const color = getComputedStyle(document.documentElement).getPropertyValue("--fx").trim() || "#7a3cff";
    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      f.x += f.vx;
      f.y += f.vy;
      if (f.y > fx.height + 10 || f.x < -10 || f.x > fx.width + 10) flakes[i] = spawn(false);
      ctx.globalAlpha = f.a;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tickSnow);
  }

  /* ---------- ghost cursor + parallax ---------- */
  const tctx = trail.getContext("2d");
  const ghosts = [];
  let mx = innerWidth / 2;
  let my = innerHeight / 2;

  function initCursor() {
    if (!fine) return;
    document.body.classList.add("custom-cursor");
    resize(trail);
    addEventListener("pointermove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.transform = `translate(${mx}px, ${my}px)`;
      cursor.classList.add("on");
      ghosts.push({ x: mx, y: my, life: 1 });
      if (ghosts.length > 30) ghosts.shift();

      if (!app.hidden) {
        const dx = (e.clientX / innerWidth - 0.5) * 12;
        const dy = (e.clientY / innerHeight - 0.5) * 10;
        card.style.transform = `perspective(900px) rotateY(${dx}deg) rotateX(${-dy}deg)`;
      }
    });
    addEventListener("pointerleave", () => cursor.classList.remove("on"));
    const loop = () => {
      tctx.clearRect(0, 0, trail.width, trail.height);
      for (let i = ghosts.length - 1; i >= 0; i--) {
        const g = ghosts[i];
        g.life -= 0.045;
        if (g.life <= 0) {
          ghosts.splice(i, 1);
          continue;
        }
        tctx.beginPath();
        tctx.fillStyle = `rgba(199, 140, 255, ${0.2 * g.life})`;
        tctx.arc(g.x, g.y, 4 + g.life * 8, 0, Math.PI * 2);
        tctx.fill();
      }
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- enter ---------- */
  async function enter() {
    gate.classList.add("out");
    app.hidden = false;
    bumpViews();
    video.muted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    try {
      await video.play();
    } catch (_) {}
    try {
      await audio.play();
      setPlayUi(true);
    } catch (_) {
      setPlayUi(false);
    }
    fetchPresence();
    clearInterval(presenceTimer);
    presenceTimer = setInterval(fetchPresence, 15000);
    setTimeout(() => gate.remove(), 550);
  }

  $("enterBtn").addEventListener("click", enter);

  initSnow();
  tickSnow();
  initCursor();
  addEventListener("resize", () => {
    resize(fx);
    if (fine) resize(trail);
  });
  video.load();
})();
