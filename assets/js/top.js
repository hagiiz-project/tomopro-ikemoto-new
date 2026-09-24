/* =========================================================
   トップページ
   ・扉と「4つの場」の画像
   ・まだ公開していない物語の扉を Coming soon にする
   ・シェア、下のバー
   ========================================================= */

(function () {
  "use strict";

  var SITE = window.SITE || {};
  var HZ = window.HZ;

  document.querySelectorAll("[data-slot]").forEach(function (el) {
    var slot = HZ.imgSlot(el.getAttribute("data-slot"), el.getAttribute("data-alt"));
    // 写真がまだ無いあいだは、用意したイラストで埋める（空の枠は出さない）
    var key = el.getAttribute("data-slot");
    var layer = el.closest(".door") && el.closest(".door").getAttribute("data-layer");
    if (layer) slot.setAttribute("data-fallback", "assets/img/vision-" + layer + ".svg");
    if (/^top\/thing-/.test(key)) slot.setAttribute("data-fallback", "assets/img/" + key.replace("top/", "") + ".svg");
    el.appendChild(slot);
    el.setAttribute("data-hide-empty", "");
  });

  document.getElementById("share").innerHTML = HZ.shareHTML();

  function locks() {
    document.querySelectorAll("[data-lock]").forEach(function (door) {
      var layer = door.getAttribute("data-lock");
      var open = HZ.isOpen(layer);
      door.classList.toggle("is-locked", !open);
      var d = door.querySelector(".door-lock-d");
      var at = HZ.unlockAt(layer);
      if (d && at) d.textContent = HZ.yen(at) + "達成で公開";
      door.setAttribute("aria-label", open ? "" : "準備中：" + HZ.yen(at || 0) + "達成で公開");
      if (open) door.removeAttribute("aria-label");
    });
  }
  locks();
  HZ.ready(locks);

  HZ.finish(document);
  HZ.loadAllImages(document);
  HZ.stickyBar();
})();
