/*
  写真の置き場所の案内（images/各フォルダの README.md）を作り直します。
  物語の場面を増やしたり減らしたりしたら、実行してください：
    node tools/photo_guide.js
*/
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
global.window = {};
require(path.join(ROOT, "assets/js/config.js"));
require(path.join(ROOT, "content/works.js"));
const SITE = window.SITE;
const GH = "https://github.com/" + SITE.GITHUB_REPO;
const BR = SITE.GITHUB_BRANCH || "main";
const up = (folder) => `${GH}/upload/${BR}/images/${folder}`;
const strip = (t) => String(t || "").replace(/\*\*/g, "").replace(/\n/g, " ");

const HOWTO = (folder, page) => `
## 入れ方（3ステップ）

1. 写真のファイル名を、上の表の **「ファイル名」の通りに変える**（例：\`IMG_1234.jpg\` → \`02.jpg\`）
2. **[ここを押して、このフォルダに写真をアップロード](${up(folder)})** → 写真を点線の枠にドラッグ → 「Commit changes」
3. 1〜2分後にサイトを開くと、その場所に写真が入っています${page ? `（[${page} を確認](${SITE.SITE_URL}${page})）` : ""}

- 使える形式：\`.jpg\` \`.png\` \`.webp\`（\`.JPG\` のような大文字もOK）
- **iPhoneの \`.HEIC\` は表示されません。** JPEGに変換してから入れてください（iPhoneの「設定 → カメラ → フォーマット → 互換性優先」にすると、以後の写真は最初からJPEGになります）
- 大きさの目安：横 1600px 前後、1枚 1MB 以下（GitHubの上限は1枚25MB）
- 同じファイル名で入れ直すと、写真が差し替わります
- どの枠がどのファイル名かは、サイトのURLの末尾に \`?draft=1\` を付けると、画面上の枠にも表示されます
`;

function table(rows) {
  return "| ファイル名 | ページのどこに入るか |\n|---|---|\n" +
    rows.map(r => `| \`${r[0]}\` | ${r[1]} |`).join("\n") + "\n";
}

const NAMES = { science: "科学（教育・科学に携わる方へ）", bosai: "防災（防災に携わる方へ）", doboku: "土木（土木・インフラに携わる方へ）" };
const summary = [];

for (const f of ["science", "bosai", "doboku"]) {
  require(path.join(ROOT, "content", f + ".js"));
  const S = window.STORY;
  const rows = [];
  let w = 0, pl = 0;
  for (const sc of S.scenes) {
    if (sc.kind === "win" || sc.kind === "stages") continue;
    if (sc.layout === "rows") {
      for (const raw of sc.items || []) {
        const it = Object.assign({}, raw.ref ? window.WORKS[raw.ref] : {}, raw);
        if (!it.preview) w++;
        if (!it.preview) rows.push([`${it.img || "works-" + w}.jpg`, `「積み重ねてきたもの」の箱の右半分：${strip(it.title)}`]);
      }
      continue;
    }
    if (sc.layout === "cards") {
      for (const it of sc.items || []) { pl++; rows.push([`plan-${pl}.jpg`, `「今回の挑戦」のカードの下：${strip(it.title)}`]); }
      continue;
    }
    if (sc.noImage) continue;
    let where;
    if (sc.kind === "cover") where = "いちばん上（表紙）の右側";
    else if (sc.kind === "cta") where = "「いちばん伝えたいこと」の上";
    else {
      const first = strip((sc.body || [])[0]).slice(0, 28);
      where = sc.heading ? `見出し「${strip(sc.heading)}」の横` : `文章「${first}…」の横`;
    }
    if (sc.illust) where += "（今はイラストが入っています。写真や完成版のイラストを置くと差し替わります）";
    rows.push([`${sc.id}.jpg`, where]);
  }
  // ページに出てくる順（表紙 → いちばん伝えたいこと → 本文）に並べる
  const ci = rows.findIndex(r => r[1].indexOf("いちばん伝えたいこと") >= 0);
  if (ci > 1) rows.splice(1, 0, rows.splice(ci, 1)[0]);
  rows.splice(1, 0, ["win.jpg", "「達成したら、こうなる」の背景（任意。入れなければイラストのまま）"]);
  const md = `# ${NAMES[f]} ページの写真\n\nこのフォルダ（\`images/${f}\`）に入れた写真が、[${f}.html](${SITE.SITE_URL}${f}.html) に表示されます。\n\n` +
    table(rows) + HOWTO(f, `${f}.html`);
  fs.writeFileSync(path.join(ROOT, "images", f, "README.md"), md);
  summary.push([f, NAMES[f], rows.length]);
}

// トップページ・応援ページ
const topRows = [
  ["door-science.jpg", "トップ「3つの視点」科学のカード（入れなければイラスト）"],
  ["door-bosai.jpg", "トップ「3つの視点」防災のカード（入れなければイラスト）"],
  ["door-doboku.jpg", "トップ「3つの視点」土木のカード（入れなければイラスト）"],
  ["thing-boardgame.jpg", "トップ「4つの場」ボードゲーム（入れなければイラスト）"],
  ["thing-class.jpg", "トップ「4つの場」出前授業（入れなければイラスト）"],
  ["thing-escape.jpg", "トップ「4つの場」脱出ゲーム（入れなければイラスト）"],
  ["thing-cafe.jpg", "トップ「4つの場」サイエンスカフェ（入れなければイラスト）"],
  ["video-poster.jpg", "応援ページの動画の表紙（動画を入れたとき）"]
];
fs.writeFileSync(path.join(ROOT, "images", "top", "README.md"),
  `# トップページ・応援ページの写真\n\n` + table(topRows) + HOWTO("top", "index.html"));

fs.mkdirSync(path.join(ROOT, "images", "preview"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "images", "preview", "README.md"),
  `# リンク先のプレビュー画像\n\n` + table([["tohoku-news.jpg", "「積み重ねてきたもの」防災科研の箱の右半分（東北大学ニュースの画像）。入れなければ東北大学のサイトの画像を表示"]]) + HOWTO("preview", ""));

fs.writeFileSync(path.join(ROOT, "images", "ogp", "README.md"),
  `# SNSで共有したときに出る画像（横1200×縦630px）\n\n` + table([
    ["top.jpg", "トップページ・応援ページを共有したとき"],
    ["science.jpg", "科学のページを共有したとき"],
    ["bosai.jpg", "防災のページを共有したとき"],
    ["doboku.jpg", "土木のページを共有したとき"]
  ]) + HOWTO("ogp", ""));

// images/README.md（入口）
fs.writeFileSync(path.join(ROOT, "images", "README.md"),
  `# 写真の置き場所\n\nどのページの写真かで、入れるフォルダが決まっています。フォルダを開くと、ファイル名と入る場所の一覧が出ます。\n\n` +
  "| ページ | フォルダ | 枠の数 |\n|---|---|---|\n" +
  summary.map(s => `| ${s[1]} | [images/${s[0]}](${s[0]}) | ${s[2]} |`).join("\n") + "\n" +
  `| トップページ・応援ページ | [images/top](top) | ${topRows.length} |\n| SNS共有用 | [images/ogp](ogp) | 4 |\n| リンク先のプレビュー | [images/preview](preview) | 1 |\n`);
console.log("写真の案内を作りました:", summary.map(s => s[0] + "=" + s[2]).join(", "));
