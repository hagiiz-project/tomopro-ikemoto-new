/* =========================================================
   応援ページ（お金の話は、このページだけ）
   ========================================================= */

(function () {
  "use strict";

  var SITE = window.SITE || {};
  var HZ = window.HZ;

  document.getElementById("units").innerHTML = HZ.unitsHTML();
  document.getElementById("funds").innerHTML = HZ.fundsHTML();
  document.getElementById("stages").innerHTML = HZ.stagesHTML();
  document.getElementById("gifts").innerHTML = HZ.giftsHTML();
  document.getElementById("howto").innerHTML = HZ.howtoHTML();
  document.getElementById("share").innerHTML = HZ.shareHTML();

  /* 動画 */
  var frame = document.getElementById("video");
  var v = SITE.VIDEO || {};
  if (v.type === "youtube" && v.id) {
    var ifr = document.createElement("iframe");
    ifr.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(v.id) + "?rel=0&playsinline=1";
    ifr.title = "HagiiZ 代表からのあいさつ";
    ifr.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen";
    ifr.allowFullscreen = true;
    ifr.loading = "lazy";
    frame.appendChild(ifr);
  } else if (v.type === "file" && v.src) {
    var video = document.createElement("video");
    video.src = v.src;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    frame.appendChild(video);
  } else if (HZ.DRAFT) {
    frame.appendChild(HZ.imgSlot("top/video-poster", "HagiiZ 代表からのあいさつ"));
  } else {
    document.getElementById("greeting").hidden = true;
  }

  HZ.finish(document);
  HZ.loadAllImages(document);
})();
