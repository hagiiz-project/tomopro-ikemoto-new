/* =========================================================
   トップページの洪水流域模型（canvas）
   ・ボタンを押しているあいだ雨が降り、川の水位がなめらかに上がる
   ・水位計が危険水位を越えると、堤防を越えて町へ水が流れ込む
   ・雨が強いほど空が暗く、水が濁る
   ・短く押すと、一瞬だけ強い雨
   座標はすべて 640×400 の中で考えて、画面の大きさに合わせて拡大します。
   ========================================================= */

(function () {
  "use strict";

  var canvas = document.getElementById("model-canvas");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var wrap = document.getElementById("model");
  var caption = document.getElementById("model-caption");
  var btn = document.getElementById("model-btn");
  var reset = document.getElementById("model-reset");
  var cta = document.getElementById("model-cta");
  var REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var W = 640, H = 400;

  /* ---- 地形（左の山、川底、堤防、町） ---- */
  var BED_Y = 346;           // 川底
  var CREST_Y = 222;         // 堤防の天端
  var LEVEE = { inL: 318, inR: 356, outL: 388, outR: 430 }; // 川側の法尻・天端の川側・天端の町側・町側の法尻
  var TOWN_Y = 304;          // 町の地面
  var RIVER_L = 0;           // 川の水を描く範囲（左の山と堤防が上から隠す）
  var RIVER_R = LEVEE.inR + 2;

  var BASE = 0.14;     // ふだんの水位
  var STEPS = [
    { at: 0,    text: "ボタンを押すと、雨が降ります。" },
    { at: 0.3,  text: "川の水位が、一気に上がりました。" },
    { at: 0.62, text: "水位計の赤い線を、越えそうです。" }
  ];
  var OVER_TEXT = "越えました。";
  var LAST_TEXT = "越えました。<br>自分で降らせた雨は、他人事になりません。";

  /* ---- 状態 ---- */
  var level = BASE;    // 川の水位 0〜1（1で天端）
  var town = 0;        // 町の浸水 0〜1
  var rain = 0;        // 雨の強さ 0〜1
  var holding = false;
  var burst = 0;       // 短押しの強い雨（秒）
  var pressAt = 0;
  var flooded = false;
  var overflowed = false;
  var drops = [];
  var ripples = [];
  var t = 0;
  var last = 0;
  var running = false;
  var visible = true;
  var scale = 1;
  var lastCaption = "";

  function lerp(a, b, k) { return a + (b - a) * k; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function mix(c1, c2, k) {
    return "rgb(" + Math.round(lerp(c1[0], c2[0], k)) + "," + Math.round(lerp(c1[1], c2[1], k)) + "," + Math.round(lerp(c1[2], c2[2], k)) + ")";
  }
  function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }

  function waterY() { return lerp(BED_Y - 4, CREST_Y - 3, clamp(level, 0, 1)); }
  function townY() { return lerp(TOWN_Y + 1, TOWN_Y - 40, town); } // 家の1階が浸かる深さ

  function wave(x, amp) {
    if (REDUCE) return 0;
    return amp * (Math.sin(x * 0.045 + t * 2.1) * 0.6 + Math.sin(x * 0.11 - t * 1.4) * 0.4);
  }

  /* ---- 大きさ ---- */
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth || 640;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(w * (H / W) * dpr);
    scale = canvas.width / W;
    draw();
  }

  /* ---- 描画 ---- */
  function sky() {
    var g = ctx.createLinearGradient(0, 0, 0, 300);
    g.addColorStop(0, mix([176, 216, 236], [92, 104, 124], rain * 0.85 + town * 0.15));
    g.addColorStop(1, mix([236, 245, 248], [150, 160, 172], rain * 0.8));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function cloud(x, y, s, col) {
    ctx.fillStyle = col;
    // 楕円ごとに moveTo しないと、楕円どうしが線でつながって角が出る
    ctx.beginPath();
    [[0, 0, 46, 18], [-30, 4, 28, 14], [30, 5, 30, 13], [-6, -12, 26, 16], [16, -8, 22, 13]].forEach(function (e) {
      var cx = x + e[0] * s, cy = y + e[1] * s, rx = e[2] * s, ry = e[3] * s;
      ctx.moveTo(cx + rx, cy);
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    });
    ctx.fill();
  }

  function clouds() {
    var col = rgba([255, 255, 255], 0.9);
    var dark = mix([250, 252, 253], [104, 112, 128], rain);
    var drift = REDUCE ? 0 : (t * 6) % 760;
    ctx.globalAlpha = 0.55 + rain * 0.45;
    [[80, 52, 1.1], [300, 40, 1.4], [520, 60, 1.2], [690, 46, 1]].forEach(function (c) {
      var x = ((c[0] + drift) % 760) - 60;
      cloud(x, c[1] + rain * 8, c[2] * (1 + rain * 0.35), rain > 0.05 ? dark : col);
    });
    ctx.globalAlpha = 1;
  }

  function mountains() {
    ctx.fillStyle = mix([180, 206, 196], [128, 146, 146], rain * 0.7);
    ctx.beginPath();
    ctx.moveTo(0, 214);
    ctx.bezierCurveTo(70, 150, 120, 146, 180, 188);
    ctx.bezierCurveTo(230, 160, 280, 150, 340, 196);
    ctx.bezierCurveTo(400, 150, 470, 132, 540, 182);
    ctx.bezierCurveTo(580, 166, 616, 164, 640, 174);
    ctx.lineTo(640, 400);
    ctx.lineTo(0, 400);
    ctx.closePath();
    ctx.fill();
  }

  function riverWater() {
    var y0 = waterY();
    var amp = 1 + rain * 2.2;
    var clean = [74, 164, 218], muddy = [92, 132, 150];
    var k = clamp(rain * 0.5 + (level - BASE) * 0.5 + town * 0.5, 0, 1);
    var g = ctx.createLinearGradient(0, y0, 0, BED_Y + 10);
    g.addColorStop(0, rgba(hexMix(clean, muddy, k), 0.95));
    g.addColorStop(1, rgba(hexMix([30, 92, 146], [44, 78, 100], k), 0.98));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(RIVER_L, H);
    for (var x = RIVER_L; x <= RIVER_R; x += 6) ctx.lineTo(x, y0 + wave(x, amp));
    ctx.lineTo(RIVER_R, H);
    ctx.closePath();
    ctx.fill();
    // 水面のハイライト
    ctx.strokeStyle = "rgba(255,255,255," + (0.7 - k * 0.25) + ")";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var x2 = 150; x2 <= RIVER_R - 4; x2 += 6) {
      var yy = y0 + wave(x2, amp) + 1;
      if (x2 === 150) ctx.moveTo(x2, yy); else ctx.lineTo(x2, yy);
    }
    ctx.stroke();
  }

  function hexMix(a, b, k) {
    return [Math.round(lerp(a[0], b[0], k)), Math.round(lerp(a[1], b[1], k)), Math.round(lerp(a[2], b[2], k))];
  }

  function hill() {
    var g = ctx.createLinearGradient(0, 110, 0, 360);
    g.addColorStop(0, mix([124, 172, 132], [92, 124, 100], rain * 0.6));
    g.addColorStop(1, mix([96, 146, 108], [74, 104, 84], rain * 0.6));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 112);
    ctx.bezierCurveTo(46, 96, 82, 128, 112, 196);
    ctx.bezierCurveTo(134, 250, 150, 318, 178, 342);
    ctx.lineTo(178, 400);
    ctx.lineTo(0, 400);
    ctx.closePath();
    ctx.fill();
    // 木
    [[26, 104], [52, 108], [80, 140], [98, 172]].forEach(function (p, i) {
      ctx.fillStyle = mix([74, 128, 88], [60, 96, 72], rain * 0.6);
      ctx.beginPath();
      ctx.ellipse(p[0], p[1] - 10, 9 + (i % 2) * 2, 13, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function ground() {
    // 川底から町までの地面（断面）
    var g = ctx.createLinearGradient(0, 300, 0, 400);
    g.addColorStop(0, "#a88f6c");
    g.addColorStop(1, "#7d6a52");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(170, 400);
    ctx.lineTo(170, 344);
    ctx.quadraticCurveTo(250, 352, LEVEE.inL, BED_Y);
    ctx.lineTo(LEVEE.outR, TOWN_Y);
    ctx.lineTo(W, TOWN_Y);
    ctx.lineTo(W, 400);
    ctx.closePath();
    ctx.fill();
    // 地層の線
    ctx.strokeStyle = "rgba(60,44,28,.18)";
    ctx.lineWidth = 1;
    for (var i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(176, 362 + i * 12);
      ctx.bezierCurveTo(300, 358 + i * 12, 420, 330 + i * 16, W, 326 + i * 16);
      ctx.stroke();
    }
    // 町の芝
    ctx.fillStyle = mix([150, 196, 120], [112, 146, 96], rain * 0.6);
    ctx.fillRect(LEVEE.outR - 6, TOWN_Y - 3, W, 6);
  }

  function levee() {
    var L = LEVEE;
    var g = ctx.createLinearGradient(0, CREST_Y, 0, BED_Y);
    g.addColorStop(0, "#b99d74");
    g.addColorStop(1, "#8f7657");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(L.inL, BED_Y);
    ctx.lineTo(L.inR, CREST_Y);
    ctx.lineTo(L.outL, CREST_Y);
    ctx.lineTo(L.outR, TOWN_Y);
    ctx.lineTo(L.outR, 400);
    ctx.lineTo(L.inL, 400);
    ctx.closePath();
    ctx.fill();
    // 締め固めた層
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = "rgba(70,50,30,.16)";
    for (var y = CREST_Y + 14; y < 400; y += 14) {
      ctx.beginPath(); ctx.moveTo(L.inL - 10, y); ctx.lineTo(L.outR + 10, y); ctx.stroke();
    }
    ctx.restore();
    // 法面の芝
    ctx.strokeStyle = mix([120, 176, 96], [96, 136, 84], rain * 0.6);
    ctx.lineWidth = 5;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(L.inL + 2, BED_Y - 2);
    ctx.lineTo(L.inR, CREST_Y + 1);
    ctx.lineTo(L.outL, CREST_Y + 1);
    ctx.lineTo(L.outR, TOWN_Y - 1);
    ctx.stroke();
  }

  // 水位計（川側の法面に立つ）
  function gauge() {
    var x = 300, top = CREST_Y - 6, bottom = BED_Y;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - 5, top, 10, bottom - top);
    ctx.strokeStyle = "#2a1422";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x - 5, top, 10, bottom - top);
    for (var y = top + 6; y < bottom; y += 12) {
      ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 1, y); ctx.stroke();
    }
    // 危険水位
    var danger = lerp(BED_Y, CREST_Y, 0.82);
    ctx.fillStyle = "#e0284f";
    ctx.fillRect(x - 7, danger - 1.5, 14, 3);
    ctx.font = "700 11px 'Noto Sans JP', sans-serif";
    ctx.fillStyle = "rgba(42,20,34,.8)";
    ctx.textAlign = "right";
    ctx.fillText("危険水位", x - 10, danger + 4);
  }

  function house(x, w, h, body, roof) {
    var y = TOWN_Y - 2;
    ctx.fillStyle = body;
    ctx.fillRect(x, y - h, w, h);
    ctx.fillStyle = roof;
    ctx.beginPath();
    ctx.moveTo(x - 5, y - h + 1);
    ctx.lineTo(x + w / 2, y - h - w * 0.42);
    ctx.lineTo(x + w + 5, y - h + 1);
    ctx.closePath();
    ctx.fill();
    // 窓：暗くなると灯りがつく
    ctx.fillStyle = rain > 0.3 ? "rgba(255,214,110," + (0.5 + rain * 0.5) + ")" : "rgba(120,160,190,.55)";
    ctx.fillRect(x + w * 0.2, y - h * 0.7, w * 0.22, h * 0.26);
    ctx.fillRect(x + w * 0.58, y - h * 0.7, w * 0.22, h * 0.26);
    ctx.fillStyle = "rgba(60,40,40,.55)";
    ctx.fillRect(x + w * 0.42, y - h * 0.34, w * 0.18, h * 0.34);
  }

  function townscape() {
    // 電柱
    ctx.strokeStyle = "#6b5a4c";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(452, TOWN_Y); ctx.lineTo(452, TOWN_Y - 62); ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(444, TOWN_Y - 56); ctx.lineTo(460, TOWN_Y - 56); ctx.stroke();
    ctx.strokeStyle = "rgba(60,50,40,.5)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(452, TOWN_Y - 55); ctx.quadraticCurveTo(560, TOWN_Y - 40, 640, TOWN_Y - 52); ctx.stroke();
    house(468, 46, 38, "#fdfbf7", "#e0668f");
    house(528, 40, 50, "#fff4dc", "#f2b035");
    house(584, 44, 36, "#f5fbff", "#5d8fb8");
    // 木
    ctx.fillStyle = mix([96, 150, 100], [72, 110, 82], rain * 0.6);
    ctx.beginPath(); ctx.ellipse(632, TOWN_Y - 30, 12, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#6b5a4c"; ctx.fillRect(630, TOWN_Y - 12, 4, 12);
  }

  // 越水：天端から町側の法面を流れ落ちる
  function spill(amount) {
    if (amount <= 0) return;
    var L = LEVEE;
    var th = 3 + amount * 6;
    ctx.fillStyle = "rgba(86,138,168,.92)";
    ctx.beginPath();
    ctx.moveTo(L.inR - 2, CREST_Y - th * 0.6);
    ctx.lineTo(L.outL + 2, CREST_Y - th * 0.5);
    ctx.quadraticCurveTo(L.outL + 12, CREST_Y + 6, L.outR + 4, TOWN_Y - th * 0.6);
    ctx.lineTo(L.outR + 10, TOWN_Y + 1);
    ctx.lineTo(L.outR - 2, TOWN_Y + 1);
    ctx.lineTo(L.outL, CREST_Y + 2);
    ctx.lineTo(L.inR, CREST_Y + 2);
    ctx.closePath();
    ctx.fill();
    // 流れの筋
    if (!REDUCE) {
      ctx.strokeStyle = "rgba(255,255,255,.55)";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([8, 10]);
      ctx.lineDashOffset = -t * 60;
      ctx.beginPath();
      ctx.moveTo(L.inR, CREST_Y - th * 0.3);
      ctx.lineTo(L.outL, CREST_Y - th * 0.25);
      ctx.quadraticCurveTo(L.outL + 12, CREST_Y + 8, L.outR + 2, TOWN_Y - 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function townWater() {
    if (town <= 0.001) return;
    var y0 = townY();
    var amp = 0.8 + rain * 1.4;
    // 町側の法面との交点
    var slopeX = LEVEE.outL + (y0 - CREST_Y) * ((LEVEE.outR - LEVEE.outL) / (TOWN_Y - CREST_Y));
    var g = ctx.createLinearGradient(0, y0, 0, TOWN_Y);
    g.addColorStop(0, "rgba(96,150,180,.82)");
    g.addColorStop(1, "rgba(48,90,122,.92)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(slopeX, TOWN_Y + 1);
    for (var x = slopeX; x <= W; x += 6) ctx.lineTo(x, y0 + wave(x + 200, amp));
    ctx.lineTo(W, TOWN_Y + 1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var x2 = slopeX + 4; x2 <= W; x2 += 6) {
      var yy = y0 + wave(x2 + 200, amp) + 1;
      if (x2 === slopeX + 4) ctx.moveTo(x2, yy); else ctx.lineTo(x2, yy);
    }
    ctx.stroke();
  }

  function rainDrops(dt) {
    // 雨粒を増やす
    var want = Math.round(rain * 260);
    while (drops.length < want) {
      drops.push({ x: Math.random() * (W + 80) - 40, y: -20 - Math.random() * 200, v: 520 + Math.random() * 260, l: 10 + Math.random() * 12 });
    }
    ctx.strokeStyle = "rgba(240,248,255," + (0.5 + rain * 0.4) + ")";
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    var wy = waterY();
    for (var i = drops.length - 1; i >= 0; i--) {
      var d = drops[i];
      d.y += d.v * dt;
      d.x -= d.v * dt * 0.18;
      var surface = d.x < RIVER_R && d.x > 150 ? wy : (d.x > LEVEE.outR && town > 0.02 ? townY() : 999);
      if (d.y > surface || d.y > 400) {
        if (surface < 999 && ripples.length < 40 && Math.random() < 0.5) ripples.push({ x: d.x, y: surface, r: 1, a: 0.6 });
        if (drops.length > want) { drops.splice(i, 1); continue; }
        d.x = Math.random() * (W + 80) - 40; d.y = -20 - Math.random() * 60;
        continue;
      }
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + d.l * 0.18, d.y - d.l);
    }
    ctx.stroke();
    // 波紋
    for (var j = ripples.length - 1; j >= 0; j--) {
      var r = ripples[j];
      r.r += dt * 22; r.a -= dt * 1.6;
      if (r.a <= 0) { ripples.splice(j, 1); continue; }
      ctx.strokeStyle = "rgba(255,255,255," + r.a + ")";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r, r.r * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }

  var dtNow = 0;
  function draw() {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    sky();
    clouds();
    mountains();
    riverWater();
    hill();
    ground();
    gauge();
    levee();
    townscape();
    townWater();
    spill(overflowed ? Math.max(rain, town < 1 ? 0.35 : 0.15) : 0);
    rainDrops(dtNow);
  }

  /* ---- 動き ---- */
  function step(now) {
    if (!last) last = now;
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    dtNow = dt;

    if (burst > 0) burst -= dt;
    // 押した直後は土砂降り、そのあとは小雨が残る
    var target = burst > 0 ? 1 : (stepN > 0 && !flooded ? 0.18 : 0);
    rain += (target - rain) * Math.min(1, dt * (target > rain ? 6 : 1.4));

    if (!flooded && !overflowed) {
      level += (targetLevel - level) * Math.min(1, dt * 1.8);
      if (targetLevel >= 1 && level > 0.985) level = 1;
    }
    if (level >= 1) {
      level = 1;
      if (!overflowed) {
        overflowed = true;
        if (!REDUCE) { wrap.classList.remove("is-shake"); void wrap.offsetWidth; wrap.classList.add("is-shake"); }
        if (window.HZ) window.HZ.track("model_overflow", {});
      }
      town = Math.min(1, town + dt * (0.12 + rain * 0.3));
      if (town > 0.55 && !flooded) {
        flooded = true;
        if (cta) cta.hidden = false;
        btn.hidden = true;
      }
    }

    updateCaption();
    draw();

    var idle = rain < 0.01 && drops.length === 0 && ripples.length === 0 && (level <= BASE || flooded) && (!overflowed || town >= 1);
    if (visible && (!idle || !REDUCE)) {
      window.requestAnimationFrame(step);
    } else {
      running = false;
      last = 0;
    }
  }

  function start() {
    if (running) return;
    running = true;
    last = 0;
    window.requestAnimationFrame(step);
  }

  function updateCaption() {
    var html;
    if (flooded) html = LAST_TEXT;
    else if (overflowed) html = OVER_TEXT;
    else {
      html = STEPS[0].text;
      STEPS.forEach(function (s) { if (level >= s.at) html = s.text; });
    }
    if (html !== lastCaption) { caption.innerHTML = html; lastCaption = html; }
    reset.hidden = level <= BASE + 0.01 && !overflowed;
  }

  /* ---- 操作：押すたびに、はっきり雨が降る（3回で決壊） ---- */
  var TARGETS = [BASE, 0.5, 0.8, 1];
  var stepN = 0;
  var targetLevel = BASE;

  function label() {
    if (stepN === 0) return "雨を降らせる";
    if (stepN >= 3) return "越える…";
    return "もっと降らせる（あと" + (3 - stepN) + "回）";
  }

  function pour(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (flooded || overflowed) return;
    stepN = Math.min(3, stepN + 1);
    targetLevel = TARGETS[stepN];
    burst = 1.6;
    rain = Math.max(rain, 0.7);
    if (navigator.vibrate) navigator.vibrate(stepN === 3 ? [40, 60, 120] : 25);
    btn.textContent = label();
    btn.classList.remove("is-pop"); void btn.offsetWidth; btn.classList.add("is-pop");
    if (window.HZ) window.HZ.track("model_pour", { step: stepN });
    start();
  }

  btn.addEventListener("click", pour);
  canvas.addEventListener("click", pour);
  canvas.style.cursor = "pointer";

  reset.addEventListener("click", function () {
    level = BASE; town = 0; rain = 0; burst = 0; stepN = 0; targetLevel = BASE;
    btn.textContent = label();
    overflowed = false; flooded = false;
    drops = []; ripples = [];
    if (cta) cta.hidden = true;
    btn.hidden = false;
    wrap.classList.remove("is-shake");
    updateCaption();
    start();
    btn.focus();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start();
    }).observe(canvas);
  }
  window.addEventListener("resize", resize);
  resize();
  btn.textContent = label();
  updateCaption();
  start();
})();
