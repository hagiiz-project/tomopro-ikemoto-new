/* =========================================================
   物語ページ（縦に読む）
   ・content/*.js の場面を上から順に描く
   ・段落全体が **…** の行は「主張」（太いゴシック）、それ以外は「説明」（手書き体）
   ・倍速モード：主張と見出しだけを残して、約2分で読めるようにする
   ・上のバー：場面ごとの読んだ量（ストーリーズ風）と、のこり時間
   ・途中と最後に、支援の入口
   ========================================================= */

(function () {
  "use strict";

  var SITE = window.SITE || {};
  var STORY = window.STORY;
  var HZ = window.HZ;
  if (!STORY || !HZ) return;

  var main = document.getElementById("story");
  var layer = STORY.layer;
  var CPM = 500; // 1分で読める文字数の目安

  var LAYERS = {
    science: { href: "science.html", label: "教育・科学に携わる方へ", title: "いろんなかたちの好奇心が、光る場をつくりたい" },
    doboku:  { href: "doboku.html",  label: "土木・インフラに携わる方へ", title: "守られた日常が、誰かの仕事の結果だと知られてほしい" },
    bosai:   { href: "bosai.html",   label: "防災に携わる方へ", title: "防災に関心がない人にこそ、届いてほしい" }
  };

  /* ---------- 〔未記入〕の扱い ----------
     制作中：黄色で見せる。
     公開時：注記（論文名・進捗・出典）は消し、数字などの穴が残る段落は隠す。 */
  var STRIP = /〔(論文名|進捗|出典)[^〕]*〕/g;
  function clean(text) {
    if (text === undefined || text === null) return text;
    if (HZ.DRAFT || !HZ.hasTodo(text)) return text;
    var t = String(text).replace(STRIP, "");
    return HZ.hasTodo(t) ? null : t;
  }

  function plainLen(text) {
    return String(text || "").replace(/\*\*/g, "").replace(/\s/g, "").length;
  }

  /* ---------- 描画 ---------- */

  function paras(list, stat) {
    return (list || []).map(function (raw) {
      var t = clean(raw);
      if (t === null) return "";
      if (HZ.isClaim(t)) {
        stat.claims += 1;
        stat.fast += plainLen(t);
        stat.all += plainLen(t);
        return '<p class="claim"><span class="hl">' + HZ.fmt(t.trim().slice(2, -2)) + "</span></p>";
      }
      stat.all += plainLen(t);
      return '<p class="note">' + HZ.fmt(t) + "</p>";
    }).join("");
  }

  // layout "cards"：縦長のカードを横に並べる（今回やること）
  // layout "rows" ：横長の箱。左に説明、右に写真（これまでの実績）
  function itemsHTML(items, stat, layout) {
    var cls = layout === "cards" ? "items items--cards" : layout === "rows" ? "items items--rows" : "items";
    return '<ul class="' + cls + '">' + items.map(function (it, i) {
      var text = clean(it.text);
      stat.all += plainLen(it.title) + plainLen(text);
      stat.fast += plainLen(it.title);
      stat.claims += 1;
      var link = "";
      if (it.link && it.link.url) {
        link = '<a class="item-link" href="' + HZ.escapeHTML(it.link.url) + '" target="_blank" rel="noopener">' +
          HZ.escapeHTML(it.link.text) + "</a>";
      }
      var body = '<h3 class="item-title">' + HZ.fmt(it.title) + "</h3>" +
        (text ? '<p class="note item-text">' + HZ.fmt(text) + "</p>" : "") + link;
      if (layout === "rows") {
        var key = it.img || ("works-" + (i + 1));
        return '<li class="item item--row"><div class="item-body">' + body + "</div>" +
          '<figure class="item-fig" data-hide-empty data-work="' + HZ.escapeHTML(key) + '" data-alt="' +
          HZ.escapeHTML(String(it.title).replace(/\*\*/g, "")) + '"></figure></li>';
      }
      return '<li class="item">' + body + "</li>";
    }).join("") + "</ul>";
  }

  function crossHTML() {
    if (!SITE.CROSS_LINKS) return "";
    var others = Object.keys(LAYERS).filter(function (k) { return k !== layer; });
    return '<div class="cross"><h3 class="mini-title">ほかの視点からも読めます</h3><div class="cross-grid">' +
      others.map(function (k) {
        var L = LAYERS[k];
        var open = HZ.isOpen(k);
        return '<a class="cross-card' + (open ? "" : " is-locked") + '" data-layer="' + k + '" href="' + L.href + '">' +
          '<span class="door-pill">' + HZ.escapeHTML(L.label) + "</span>" +
          '<span class="cross-title">' + HZ.escapeHTML(L.title) + "</span>" +
          (open ? "" : '<span class="cross-soon">Coming soon・' + HZ.yen(HZ.unlockAt(k)) + "達成で公開</span>") + "</a>";
      }).join("") + "</div></div>";
  }

  // 「達成したら、こうなる」の背景。images/<分野>/win.jpg があればそれを、無ければ手描きのイラストを使う
  function visionEl() {
    var box = document.createElement("div");
    box.className = "win-bg";
    box.setAttribute("aria-hidden", "true");
    var img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    img.src = "assets/img/vision-" + layer + ".svg";
    box.appendChild(img);
    var photo = new Image();
    photo.onload = function () { img.src = photo.src; box.classList.add("is-photo"); };
    photo.src = "images/" + layer + "/win." + (SITE.IMAGE_EXT || "jpg");
    return box;
  }

  function sceneEl(sc, idx) {
    var kind = sc.kind || "text";
    var stat = { all: 0, fast: 0, claims: 0 };
    var art = document.createElement("article");
    art.className = "scene scene--" + kind;
    art.id = kind === "stages" ? "support" : "s-" + idx;
    art.setAttribute("data-idx", idx);

    var html = "";
    if (sc.heading) {
      stat.all += plainLen(sc.heading);
      stat.fast += plainLen(sc.heading);
      stat.claims += 1;
      html += '<h2 class="scene-title">' + HZ.fmt(sc.heading) + "</h2>";
    }

    if (kind === "win") {
      html = '<span class="win-label">達成したら、こうなる</span>' + paras(sc.body, stat);
      art.appendChild(visionEl());
    } else {
      html += paras(sc.body, stat);
      if (sc.researchmap && SITE.RESEARCHMAP_URL) {
        html += '<p><a class="item-link" href="' + HZ.escapeHTML(SITE.RESEARCHMAP_URL) +
          '" target="_blank" rel="noopener">researchmap（研究業績）</a></p>';
      }
      if (sc.items) html += itemsHTML(sc.items, stat, sc.layout);
      if (kind === "stages") html += supportHTML();
      if (kind === "cta") {
        var name = HZ.hasTodo(SITE.REP_NAME) && !HZ.DRAFT ? "" : (SITE.REP_NAME || "");
        html += '<p class="sign note">東北大学発 HagiiZ 代表　' + HZ.fmt(name) + "</p>";
        html += '<div class="btn-row">' +
          '<a class="btn btn--support btn--lg" data-support="story-message" href="support.html">この挑戦を応援する</a></div>';
      }
    }

    var text = document.createElement("div");
    text.className = "scene-text";
    text.innerHTML = html;

    // 見出しも主張も無い場面は、倍速モードでは最初の説明だけ残す
    var hasClaim = text.querySelector(".claim, .item-title");
    if (!hasClaim && kind !== "stages" && kind !== "cta") {
      art.classList.add("no-claim");
      var first = text.querySelector(".note");
      if (first) {
        first.classList.add("keep");
        stat.fast += plainLen(first.textContent);
      }
    }

    if (kind !== "win" && kind !== "stages" && !sc.noImage && !sc.layout) {
      var fig = document.createElement("figure");
      fig.className = "scene-fig";
      fig.setAttribute("data-hide-empty", "");
      fig.appendChild(HZ.imgSlot(layer + "/" + sc.id, sc.heading ? sc.heading.replace(/\*\*/g, "") : STORY.title));
      art.appendChild(fig);
    } else {
      art.classList.add("no-fig");
    }
    if (sc.layout) art.classList.add("scene--" + sc.layout);
    art.appendChild(text);
    // 実績の写真枠（左に説明、右に写真）
    art.querySelectorAll("[data-work]").forEach(function (f) {
      f.appendChild(HZ.imgSlot(layer + "/" + f.getAttribute("data-work"), f.getAttribute("data-alt")));
    });
    art._stat = stat;
    return art;
  }

  function coverEl(sc, total) {
    var sec = document.createElement("section");
    sec.className = "cover";
    sec.id = "top";
    var tl = (STORY.tldr || []).map(function (t) { return "<li>" + HZ.fmt(t) + "</li>"; }).join("");
    sec.innerHTML =
      '<div class="cover-text">' +
        '<span class="door-pill cover-pill">' + HZ.escapeHTML(STORY.label) + "</span>" +
        '<h1 class="cover-title">' + HZ.fmt(STORY.title) + "</h1>" +
        (tl ? '<div class="tldr"><p class="tldr-h">3行でいうと</p><ol>' + tl + "</ol></div>" : "") +
        '<div class="cover-actions">' +
          '<button class="btn btn--fast" type="button" data-fast-on>⚡ 倍速で読む（約' + total.fast + "分）</button>" +
          '<a class="btn btn--sub" href="#s-1" data-read>全部読む（約' + total.all + "分）</a>" +
        "</div>" +
      "</div>";
    var fig = document.createElement("figure");
    fig.className = "cover-fig";
    fig.setAttribute("data-hide-empty", "");
    var coverSlot = HZ.imgSlot(layer + "/" + sc.id, STORY.title);
    fig.appendChild(coverSlot);
    sec.appendChild(fig);
    return sec;
  }

  /* ---------- まだ公開していない物語 ---------- */

  function comingSoon() {
    var at = HZ.unlockAt(layer);
    document.body.classList.add("is-soon");
    var others = Object.keys(LAYERS).filter(function (k) { return k !== layer && HZ.isOpen(k); });
    main.innerHTML =
      '<section class="soon">' +
        '<div class="soon-inner">' +
          '<span class="door-pill cover-pill">' + HZ.escapeHTML(STORY.label) + "</span>" +
          '<p class="soon-big">Coming soon</p>' +
          '<h1 class="cover-title">' + HZ.fmt(STORY.title) + "</h1>" +
          '<p class="claim soon-claim"><span class="hl">この物語は、支援が' + HZ.yen(at || 0) + "に届いたら公開します。</span></p>" +
          '<div class="progress-meter" data-gauge></div>' +
          '<div class="btn-row"><a class="btn btn--support btn--lg" data-support="soon" href="support.html">応援して、公開を早める</a></div>' +
          (others.length ? '<p class="soon-other note">公開中の物語：' + others.map(function (k) {
            return '<a href="' + LAYERS[k].href + '">' + HZ.escapeHTML(LAYERS[k].title) + "</a>";
          }).join("　") + "</p>" : "") +
        "</div>" +
      "</section>";
    document.title = "Coming soon｜HagiiZ";
    HZ.finish(document);
    HZ.renderGauges(document);
  }

  HZ.ready(function () {
    if (!HZ.isOpen(layer)) { comingSoon(); return; }
    build();
  });

  function build() {
    /* ---------- 組み立て ---------- */

    var body = STORY.scenes.filter(function (s) { return s.kind !== "cover" && s.kind !== "stages"; });

    // 続きの箇条（見出しなし）は、ひとつ前の箇条にまとめる
    var merged = [];
    body.forEach(function (sc) {
      var prev = merged[merged.length - 1];
      if (sc.kind === "list" && !sc.heading && prev && prev.kind === "list" && prev.layout === sc.layout && !(sc.body && sc.body.length)) {
        prev.items = prev.items.concat(sc.items || []);
      } else {
        merged.push(Object.assign({}, sc, { items: sc.items ? sc.items.slice() : undefined }));
      }
    });

    // 「達成したら、こうなる」と「いちばん伝えたいこと」を、表紙のすぐ後に
    var first = merged.filter(function (s) { return s.kind === "win"; })
      .concat(merged.filter(function (s) { return s.kind === "cta"; }));
    var scenesData = first.concat(merged.filter(function (s) { return s.kind !== "win" && s.kind !== "cta"; }));
    var coverData = STORY.scenes.filter(function (s) { return s.kind === "cover"; })[0] || { id: "01" };

    var sceneEls = scenesData.map(function (sc, i) { return sceneEl(sc, i + 1); });
    var sum = sceneEls.reduce(function (a, el) {
      a.all += el._stat.all; a.fast += el._stat.fast; return a;
    }, { all: 0, fast: 0 });
    var FAST_CPM = CPM * 0.8; // 太字の主張は、ゆっくり目に読まれる
    var minutes = {
      all: Math.max(1, Math.round(sum.all / CPM)),
      fast: Math.max(1, Math.round(sum.fast / FAST_CPM))
    };

    var frag = document.createDocumentFragment();
    frag.appendChild(coverEl(coverData, minutes));
    var sentinel = document.createElement("span");
    sentinel.setAttribute("data-dock-after", "");
    frag.appendChild(sentinel);

    var flow = document.createElement("div");
    flow.className = "flow";
    sceneEls.forEach(function (el) { flow.appendChild(el); });
    frag.appendChild(flow);

    // 読み終えた人へ：もう一度だけ、応援の入口
    var closing = document.createElement("section");
    closing.className = "closing";
    closing.innerHTML = '<p class="closing-t">' + HZ.fmt(STORY.title) + "</p>" +
      '<p class="note closing-d">ここまで読んでくださって、ありがとうございました。</p>' +
      '<div class="btn-row"><a class="btn btn--support btn--lg" data-support="story-end" href="support.html">この挑戦を応援する</a></div>' +
      HZ.shareHTML();
    frag.appendChild(closing);

    // 関連リンク
    if (STORY.links && STORY.links.length) {
      var links = document.createElement("section");
      links.className = "story-links";
      links.innerHTML = '<h2 class="mini-title">関連リンク</h2><ul>' + STORY.links.map(function (l) {
        return '<li><a href="' + HZ.escapeHTML(l.url) + '" target="_blank" rel="noopener">' + HZ.escapeHTML(l.text) + "</a></li>";
      }).join("") + '</ul><p><a class="home-link" href="index.html">トップページへ戻る</a></p>';
      frag.appendChild(links);
    }

    main.innerHTML = "";
    main.appendChild(frag);

    document.title = STORY.title.replace(/\*\*/g, "") + "｜HagiiZ";
    HZ.finish(document);
    HZ.loadAllImages(main);
    HZ.stickyBar();

    /* ---------- 上のバー：場面ごとの読んだ量 ---------- */

    var segWrap = document.querySelector(".segs");
    var leftEl = document.querySelector(".bar-left");
    var segs = [];
    if (segWrap) {
      sceneEls.forEach(function () {
        var s = document.createElement("span");
        s.className = "seg";
        s.innerHTML = "<i></i>";
        segWrap.appendChild(s);
        segs.push(s.firstChild);
      });
    }

    var fast = false;
    var ticking = false;

    function update() {
      ticking = false;
      var line = window.innerHeight * 0.55;
      var remainChars = 0;
      sceneEls.forEach(function (el, i) {
        var r = el.getBoundingClientRect();
        var p = r.height > 0 ? Math.min(1, Math.max(0, (line - r.top) / r.height)) : (r.top < line ? 1 : 0);
        if (segs[i]) segs[i].style.transform = "scaleX(" + p.toFixed(3) + ")";
        remainChars += (1 - p) * (fast ? el._stat.fast : el._stat.all);
      });
      if (leftEl) {
        var m = Math.ceil(remainChars / (fast ? FAST_CPM : CPM));
        leftEl.textContent = m <= 0 ? "読了" : "のこり約" + m + "分";
      }
    }

    function onScroll() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }

    /* ---------- 倍速モード ---------- */

    var toggles = document.querySelectorAll(".fast-toggle");

    function currentScene() {
      var line = window.innerHeight * 0.35;
      var best = null;
      sceneEls.forEach(function (el) {
        if (el.getBoundingClientRect().top <= line) best = el;
      });
      return best;
    }

    function setFast(on, jump) {
      var anchor = currentScene();
      fast = !!on;
      document.body.classList.toggle("is-fast", fast);
      toggles.forEach(function (b) {
        b.setAttribute("aria-pressed", fast ? "true" : "false");
      });
      HZ.track("fast_mode", { page: layer, on: fast });
      if (jump) {
        document.getElementById("s-1").scrollIntoView({ behavior: HZ.REDUCE ? "auto" : "smooth" });
      } else if (anchor) {
        anchor.scrollIntoView({ behavior: "auto" });
      }
      onScroll();
    }

    toggles.forEach(function (b) {
      b.addEventListener("click", function () { setFast(!fast, false); });
    });
    document.querySelectorAll("[data-fast-on]").forEach(function (b) {
      b.addEventListener("click", function () { setFast(true, true); });
    });
    document.querySelectorAll("[data-read]").forEach(function (a) {
      a.addEventListener("click", function () { if (fast) setFast(false, false); });
    });

    if (/[?&]fast=1/.test(location.search)) setFast(true, false);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("load", onScroll);
    update();
  }
})();
