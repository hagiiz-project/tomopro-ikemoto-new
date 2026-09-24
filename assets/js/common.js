/* =========================================================
   共通処理（全ページ）
   ・文章の整形（**太字** → マーカー、〔未記入〕の扱い）
   ・画像の遅延読み込み
   ・寄付ボタン／カウントダウン／支援額ゲージ／返礼品
   ・マーカーが引かれる演出、数字のカウントアップ
   ・シェア、計測
   ========================================================= */

(function () {
  "use strict";

  var SITE = window.SITE || {};
  // 制作中の目印（画像の置き場所・未記入）は ?draft=1 のときだけ。公開ページには絶対に出さない
  var DRAFT = !!SITE.DRAFT || /[?&]draft=1/.test(location.search);
  var REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TODO_RE = /〔[^〕]*〕/;

  document.documentElement.classList.toggle("is-draft", DRAFT);
  document.documentElement.classList.add("js"); // 文字をふわっと出すのは、JSが動くときだけ

  /* ---------- 文字 ---------- */

  function escapeHTML(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // {{NAME}} 置換 → エスケープ → **太字**（マーカー） → 〔未記入〕 → 改行
  function fmt(text) {
    var s = String(text).replace(/\{\{NAME\}\}/g, SITE.REP_NAME || "");
    s = escapeHTML(s);
    s = s.replace(/\*\*([\s\S]+?)\*\*/g, '<strong class="mk">$1</strong>');
    s = s.replace(/〔([^〕]*)〕/g, '<mark class="todo">〔$1〕</mark>');
    s = s.replace(/\n/g, "<br>");
    return s;
  }

  function hasTodo(text) { return TODO_RE.test(String(text || "")); }

  // 段落全体が **…** なら「主張」、それ以外は「説明」
  function isClaim(text) { return /^\*\*[\s\S]+\*\*$/.test(String(text).trim()) && String(text).trim().split("**").length === 3; }

  function yen(n) {
    // 5万円・50万円のように割り切れる額は「万円」、44,000円のような半端な額はそのまま
    if (n >= 10000 && (n % 10000 === 0 || n >= 1000000)) {
      var man = n / 10000;
      return (Math.round(man * 10) / 10).toLocaleString("ja-JP") + "万円";
    }
    return n.toLocaleString("ja-JP") + "円";
  }

  /* ---------- 画像 ---------- */

  var EXTS = ["jpg", "png", "webp", "jpeg"];
  if (SITE.IMAGE_EXT) {
    EXTS = [SITE.IMAGE_EXT].concat(EXTS.filter(function (e) { return e !== SITE.IMAGE_EXT; }));
  }

  function imgSlot(key, alt) {
    var el = document.createElement("div");
    el.className = "img-slot";
    el.setAttribute("data-img", key);
    if (alt) el.setAttribute("data-alt", alt);
    if (DRAFT) {
      var label = document.createElement("span");
      label.className = "img-label";
      label.innerHTML = "<code>images/" + escapeHTML(key) + ".jpg</code> を置くと表示されます";
      el.appendChild(label);
    }
    return el;
  }

  function loadImage(slot) {
    if (slot.getAttribute("data-loading")) return;
    slot.setAttribute("data-loading", "1");
    var base = "images/" + slot.getAttribute("data-img");
    var i = 0;
    var img = new Image();
    img.alt = slot.getAttribute("data-alt") || "";
    img.decoding = "async";
    img.onload = function () {
      slot.classList.add("has-img");
      slot.appendChild(img);
    };
    img.onerror = function () {
      i += 1;
      if (i < EXTS.length) {
        img.src = base + "." + EXTS[i];
      } else if (slot.getAttribute("data-fallback") && !slot.getAttribute("data-fb-tried")) {
        // 写真がまだ無い枠は、用意したイラストで埋める
        slot.setAttribute("data-fb-tried", "1");
        img.src = slot.getAttribute("data-fallback");
      } else {
        slot.classList.add("is-empty");
        // 公開時は、画像の無い枠ごと畳む
        if (!DRAFT) {
          var box = slot.closest("[data-hide-empty]");
          if (box) box.classList.add("is-gone");
        }
      }
    };
    img.src = base + "." + EXTS[0];
  }

  function loadAllImages(root) {
    var slots = Array.prototype.slice.call((root || document).querySelectorAll(".img-slot[data-img]"));
    if (!("IntersectionObserver" in window)) { slots.forEach(loadImage); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { loadImage(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: "600px 0px" });
    slots.forEach(function (s) { io.observe(s); });
  }

  /* ---------- 計測 ---------- */

  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
  }

  function initAnalytics() {
    if (!SITE.GA_ID) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(SITE.GA_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", SITE.GA_ID);
  }

  /* ---------- 寄付ボタンなど ---------- */

  function page() {
    return document.body.getAttribute("data-layer") || "top";
  }

  // 外部の寄付ページへ行くボタン（support.html にだけ置く）
  function donateLabel(phase) {
    if (phase === "before") return "寄付ページを見る（受付は10/1から）";
    if (phase === "after") return "寄付ページで結果を見る";
    return "東北大学基金で寄付する";
  }

  function applyLinks(root) {
    var phase = cfState().phase;
    document.documentElement.setAttribute("data-phase", phase);
    (root || document).querySelectorAll("[data-donate]").forEach(function (a) {
      a.href = SITE.DONATE_URL || "#";
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = donateLabel(phase);
      if (a.getAttribute("data-bound")) return;
      a.setAttribute("data-bound", "1");
      a.addEventListener("click", function () {
        track("donate_click", { page: page(), position: a.getAttribute("data-donate") || "unknown" });
      });
    });
    // サイト内の「応援する」：想いのページから、お金の話のページへ
    (root || document).querySelectorAll("[data-support]").forEach(function (a) {
      a.href = "support.html";
      if (a.getAttribute("data-bound")) return;
      a.setAttribute("data-bound", "1");
      a.addEventListener("click", function () {
        track("support_click", { page: page(), position: a.getAttribute("data-support") || "unknown" });
      });
    });
    (root || document).querySelectorAll("[data-about]").forEach(function (a) {
      if (SITE.ABOUT_URL) a.href = SITE.ABOUT_URL;
    });
    (root || document).querySelectorAll("[data-tomopro]").forEach(function (a) {
      a.href = SITE.TOMOPRO_URL || "#";
      a.target = "_blank";
      a.rel = "noopener";
    });
    (root || document).querySelectorAll("[data-name]").forEach(function (el) {
      el.textContent = SITE.REP_NAME || "";
    });
    (root || document).querySelectorAll("[data-donate-label]").forEach(function (el) {
      el.textContent = (SITE.DONATE_PAGE_NO || "") + "「" + (SITE.DONATE_PAGE_TITLE || "") + "」";
    });
    (root || document).querySelectorAll("[data-donate-owner]").forEach(function (el) {
      el.textContent = SITE.DONATE_PAGE_OWNER || "";
    });
    (root || document).querySelectorAll("[data-goal]").forEach(function (el) {
      el.textContent = yen(SITE.GOAL || 0);
    });
    (root || document).querySelectorAll("[data-min]").forEach(function (el) {
      el.textContent = SITE.MIN_AMOUNT_TEXT || "";
    });
  }

  /* ---------- 公開の条件（例：土木の物語は50万円達成で公開） ---------- */
  function unlockAt(layer) {
    var u = SITE.UNLOCKS || {};
    return typeof u[layer] === "number" ? u[layer] : null;
  }
  function isOpen(layer) {
    var at = unlockAt(layer);
    if (at === null || SITE.FORCE_OPEN) return true;
    return typeof SITE.CURRENT === "number" && SITE.CURRENT >= at;
  }

  /* ---------- カウントダウン ---------- */

  function cfState() {
    var now = Date.now();
    var start = SITE.CF_START ? Date.parse(SITE.CF_START) : NaN;
    var end = SITE.CF_END ? Date.parse(SITE.CF_END) : NaN;
    var DAY = 86400000;
    if (!isNaN(start) && now < start) {
      return { phase: "before", days: Math.ceil((start - now) / DAY) };
    }
    if (!isNaN(end) && now <= end) {
      var d = Math.ceil((end - now) / DAY);
      return { phase: "live", days: d };
    }
    if (!isNaN(end)) return { phase: "after", days: 0 };
    return { phase: "none", days: 0 };
  }

  function countdownText(st) {
    if (st.phase === "before") return "10/1受付開始 あと" + st.days + "日";
    if (st.phase === "live") return st.days <= 1 ? "本日が最終日" : "終了まで あと" + st.days + "日";
    if (st.phase === "after") return "受付は終了しました";
    return "";
  }

  function applyCountdown(root) {
    var st = cfState();
    (root || document).querySelectorAll("[data-countdown]").forEach(function (el) {
      var txt = countdownText(st);
      if (!txt) { el.hidden = true; return; }
      el.textContent = txt;
      el.setAttribute("data-phase", st.phase);
      if (st.phase === "live" && st.days <= 7) el.classList.add("is-hurry");
    });
  }

  /* ---------- 支援額ゲージ ---------- */

  function gaugeHTML() {
    var goal = SITE.GOAL || 1;
    // 0円の大きな数字は逆効果なので、集まり始めるまでは目標額を見せる
    var cur = typeof SITE.CURRENT === "number" && SITE.CURRENT > 0 ? SITE.CURRENT : null;
    var pct = cur === null ? 0 : (cur / goal) * 100;
    var marks = (SITE.STAGES || []).map(function (s) {
      var p = Math.min(100, (s.amount / goal) * 100);
      return '<span class="meter-mark" style="left:' + p + '%"><span>' + yen(s.amount) + "</span></span>";
    }).join("");
    var head = cur === null
      ? '<p class="meter-now"><span class="meter-big">' + yen(goal) + '</span><span class="meter-sub">が目標です</span></p>'
      : '<p class="meter-now"><span class="meter-big" data-count="' + cur + '">' + yen(cur) + '</span>' +
        '<span class="meter-sub">／目標 ' + yen(goal) + "（" + Math.floor(pct) + "%）</span></p>";
    var sup = typeof SITE.SUPPORTERS === "number" && SITE.SUPPORTERS > 0
      ? '<span class="meter-chip">支援者 ' + SITE.SUPPORTERS + "人</span>" : "";
    return head +
      (cur === null ? "" : '<div class="meter' + (pct >= 100 ? " is-over" : "") + '" role="img" aria-label="目標' + yen(goal) + (cur === null ? "" : "のうち" + yen(cur)) + '">' +
      '<span class="meter-fill" style="--pct:' + Math.min(100, pct) + '%"></span>' + marks + "</div>") +
      '<div class="meter-chips"><span class="meter-chip meter-chip--time" data-countdown></span>' +
      '<span class="meter-chip">' + escapeHTML(SITE.MIN_AMOUNT_TEXT || "") + "応援できます</span>" + sup + "</div>";
  }

  function renderGauges(root) {
    (root || document).querySelectorAll("[data-gauge]").forEach(function (el) {
      el.innerHTML = gaugeHTML();
    });
    applyCountdown(root);
    observeMotion(root, ".meter, .meter [data-count], .meter-now [data-count]");
  }

  // data/progress.json（毎朝の自動更新）があれば、その数字を使う
  var progressDone = false;
  var waiters = [];
  function ready(cb) { if (progressDone) cb(); else waiters.push(cb); }

  function loadProgress() {
    var end = function () {
      if (progressDone) return;
      progressDone = true;
      waiters.splice(0).forEach(function (cb) { cb(); });
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", afterProgress);
      } else {
        afterProgress();
      }
    };
    if (!SITE.PROGRESS_JSON || location.protocol === "file:" || !window.fetch) { end(); return; }
    setTimeout(end, 2500);
    fetch(SITE.PROGRESS_JSON + "?t=" + Math.floor(Date.now() / 600000), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j && typeof j.current === "number" && j.updated) {
          SITE.CURRENT = j.current;
          if (typeof j.supporters === "number") SITE.SUPPORTERS = j.supporters;
          SITE.PROGRESS_UPDATED = j.updated;
        }
        end();
      })
      .catch(end);
  }

  function afterProgress() {
    renderGauges(document);
    document.dispatchEvent(new CustomEvent("hz:progress"));
  }

  function stagesHTML() {
    if (!SITE.STAGES || !SITE.STAGES.length) return "";
    return '<ol class="stages">' + SITE.STAGES.map(function (s) {
      return '<li class="stage' + (s.goal ? " stage--goal" : "") + '">' +
        '<span class="stage-amount">' + yen(s.amount) + (s.goal ? '<span class="stage-goal">目標</span>' : "") + "</span>" +
        '<span class="stage-title">' + fmt(s.title) + "</span>" +
        '<span class="stage-text">' + fmt(s.text) + "</span></li>";
    }).join("") + "</ol>";
  }

  // 使い道の内訳：横に積んだ棒で見せる
  function fundsHTML() {
    var list = SITE.FUNDS || [];
    var total = list.reduce(function (a, f) { return a + (f.amount || 0); }, 0) || 1;
    var bar = list.map(function (f, i) {
      return '<span class="fund-seg fund-seg--' + i + '" style="flex-grow:' + f.amount + '"></span>';
    }).join("");
    var rows = list.map(function (f, i) {
      return '<li><span class="fund-dot fund-seg--' + i + '"></span><span class="fund-label">' + escapeHTML(f.label) +
        '</span><span class="fund-amt">' + yen(f.amount) + "</span></li>";
    }).join("");
    return '<div class="funds"><div class="fund-bar" aria-hidden="true">' + bar + '</div><ul class="fund-list">' + rows + "</ul>" +
      (total !== SITE.GOAL ? "" : "") + "</div>";
  }

  // 金額の目安：「この金額で、これができる」
  function unitsHTML() {
    return '<ul class="units">' + (SITE.UNITS || []).map(function (u) {
      return '<li class="unit"><span class="unit-amt">' + yen(u.amount) + '</span><span class="unit-text">' +
        escapeHTML(u.text) + "</span></li>";
    }).join("") + "</ul>";
  }

  function giftsHTML() {
    var team = "";
    var T = SITE.TEAM_GIFT;
    if (T && T.item) {
      team = '<li class="gift gift--team"><span class="gift-amount">' + escapeHTML(T.amount) + "</span>" +
        '<span class="gift-item">' + escapeHTML(T.item) + '<span class="gift-from">HagiiZから</span></span>' +
        '<span class="gift-note">' + escapeHTML(T.note || "") +
        (SITE.NAME_FORM_URL ? ' <a href="' + escapeHTML(SITE.NAME_FORM_URL) + '" target="_blank" rel="noopener">名前を登録する</a>' : "") +
        "</span></li>";
    }
    return '<ul class="gifts">' + team + (SITE.GIFTS || []).map(function (g) {
      return '<li class="gift"><span class="gift-amount">' + escapeHTML(g.amount) + "</span>" +
        '<span class="gift-item">' + escapeHTML(g.item) + "</span>" +
        '<span class="gift-note">' + escapeHTML(g.note || "") + "</span></li>";
    }).join("") + "</ul>";
  }

  function howtoHTML() {
    return '<ol class="howto">' +
      '<li><span class="howto-t">「東北大学基金で寄付する」を押す</span><span class="howto-d">東北大学基金のページが開きます。受付は10月1日から11月30日までです。</span></li>' +
      '<li><span class="howto-t"><span data-donate-label></span>を確認</span><span class="howto-d">HagiiZのプロジェクトのひとつとして、<span data-donate-owner></span>の名義で挑戦しています。ここが私たちの窓口です。</span></li>' +
      '<li><span class="howto-t">金額と支払い方法を選ぶ</span><span class="howto-d">クレジットカード・PayPay・Amazon Pay・コンビニなど。Amazon Payなら' +
      escapeHTML(SITE.MIN_AMOUNT_TEXT || "") + "。</span></li></ol>";
  }

  /* ---------- 動き ---------- */

  // 画面に入ったら、マーカーを引く／数字を数え上げる
  function observeMotion(root, sel) {
    var marks = (root || document).querySelectorAll(sel || ".mk, .claim, [data-count], .meter, .rv");
    if (REDUCE || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(marks, function (el) { el.classList.add("is-on"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        // 画面に入った、または速いスクロールで既に通り過ぎた
        if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
        var el = e.target;
        el.classList.add("is-on");
        if (el.hasAttribute("data-count")) countUp(el);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -18% 0px" });
    Array.prototype.forEach.call(marks, function (el) { io.observe(el); });
  }

  function countUp(el) {
    var to = Number(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix");
    if (!isFinite(to) || to === 0) return;
    var t0 = null;
    var dur = 900;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      var v = to * (1 - Math.pow(1 - k, 3));
      el.textContent = suffix !== null ? Math.round(v).toLocaleString("ja-JP") : yen(Math.round(v));
      if (k < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  /* ---------- 下の寄付バー：最初の画面を過ぎたら出す ---------- */

  function stickyBar() {
    var bar = document.querySelector(".dock");
    if (!bar) return;
    var sentinel = document.querySelector("[data-dock-after]");
    if (!sentinel || !("IntersectionObserver" in window)) { bar.classList.add("is-shown"); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var past = !e.isIntersecting && e.boundingClientRect.top < 0;
        bar.classList.toggle("is-shown", past);
      });
    }).observe(sentinel);
  }

  /* ---------- シェア ---------- */

  function bindShare(root) {
    (root || document).querySelectorAll("[data-share]").forEach(function (btn) {
      if (btn.getAttribute("data-bound")) return;
      btn.setAttribute("data-bound", "1");
      btn.addEventListener("click", function () {
        var kind = btn.getAttribute("data-share");
        var url = location.href.split("#")[0];
        var text = document.title;
        track("share", { page: page(), method: kind });
        if (kind === "native" && navigator.share) {
          navigator.share({ title: text, url: url }).catch(function () {});
        } else if (kind === "x") {
          window.open("https://x.com/intent/post?text=" + encodeURIComponent(text) + "&url=" + encodeURIComponent(url), "_blank", "noopener");
        } else if (kind === "line") {
          window.open("https://social-plugins.line.me/lineit/share?url=" + encodeURIComponent(url), "_blank", "noopener");
        } else {
          var done = function () {
            var old = btn.textContent;
            btn.textContent = "コピーしました";
            setTimeout(function () { btn.textContent = old; }, 1600);
          };
          if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done);
        }
      });
    });
    if (!navigator.share) {
      (root || document).querySelectorAll('[data-share="native"]').forEach(function (b) { b.hidden = true; });
    }
  }

  function shareHTML() {
    return '<div class="share"><span class="share-label">このページを送る</span>' +
      '<button type="button" class="chip-btn" data-share="native">共有</button>' +
      '<button type="button" class="chip-btn" data-share="line">LINE</button>' +
      '<button type="button" class="chip-btn" data-share="x">X</button>' +
      '<button type="button" class="chip-btn" data-share="copy">リンクをコピー</button></div>';
  }

  function finish(root) {
    applyLinks(root);
    applyCountdown(root);
    bindShare(root);
    observeMotion(root);
    if (progressDone) renderGauges(root);
  }

  initAnalytics();
  loadProgress();

  window.HZ = {
    BUILD: "2026-09-25b",
    DRAFT: DRAFT,
    REDUCE: REDUCE,
    fmt: fmt,
    hasTodo: hasTodo,
    isClaim: isClaim,
    yen: yen,
    escapeHTML: escapeHTML,
    imgSlot: imgSlot,
    loadAllImages: loadAllImages,
    gaugeHTML: gaugeHTML,
    stagesHTML: stagesHTML,
    fundsHTML: fundsHTML,
    unitsHTML: unitsHTML,
    renderGauges: renderGauges,
    ready: ready,
    isOpen: isOpen,
    unlockAt: unlockAt,
    giftsHTML: giftsHTML,
    howtoHTML: howtoHTML,
    shareHTML: shareHTML,
    cfState: cfState,
    stickyBar: stickyBar,
    track: track,
    finish: finish
  };
})();
