/* =========================================================
   「積み重ねてきたもの」の中身（3つの物語で共通）
   ここを書き換えると、科学・防災・土木のすべてに反映されます。
   各物語の content/*.js からは { ref: "lab" } のように呼び出します。

   links   … 1つめのURLが「箱全体をクリックしたときの飛び先」になります
   preview … 右半分に、写真の代わりにリンク先のプレビューを出します
   ========================================================= */

window.WORKS = {

  lab: {
    title: "防災科学技術研究所との連携（一般公開へ2年連続出展）",
    text: "東北大学と防災科研の『連携及び協力に関する基本協定』に基づく公式出展です。来場者の老若男女に、防災啓発のための出展をしました。東北大学公式のニュースに掲載されています。",
    links: [{ text: "東北大学のニュースを見る", url: "https://www.tohoku.ac.jp/japanese/2026/04/news20260422-syde.html" }],
    preview: {
      site: "東北大学 ニュース",
      title: "防災科学技術研究所一般公開に現役博士学生が出展 〜災害科学・防災を子供たちへ",
      date: "2026年4月22日",
      color: "#6E2A8C",
      // images/preview/tohoku-news.jpg を置くとそちらを優先。無ければ東北大学のサイトの画像を表示
      image: "images/preview/tohoku-news.jpg",
      imageRemote: "https://www.tohoku.ac.jp/japanese/newimg/newsimg/news20260422_syde_ogp.jpg"
    }
  },

  paper: {
    title: "査読あり論文の執筆と、学会発表10件",
    text: "防災科研と共同で来場者を分析し、査読あり論文を発表しました。国内外の学会で10件の発表を行っています。",
    links: [{ text: "論文・発表の一覧を見る", url: "https://www.hagiiz.com/projects/paper/" }]
  },

  model: {
    title: "手作り巨大洪水流域模型",
    text: "出来合いの模型も、数値計算も使いませんでした。実験模型を0から設計・製作しました。製作過程にもたくさんのサイエンスが潜んでいるため、YouTubeにて公開していますっ。",
    links: [{ text: "模型のページを見る", url: "https://www.hagiiz.com/projects/model/" }]
  },

  joshikai: {
    title: "「ぼうさい女子会」の社会インフラ化",
    text: "避難生活における女性の尊厳と防犯の問題は、長く放置されてきました。①匿名で相談できる相談窓口アプリと②守る地図を開発・運用しています。",
    links: [{ text: "ぼうさい女子会 公式HP", url: "https://hagiiz-project.github.io/resilience-for-ladies-HP/" }]
  },

  u35: {
    title: "「U35防災ゼミ」の企画・運営",
    text: "前防災担当大臣とのゼミから結成された全国組織です。応援コメントをくださっている防災科学技術研究所の上田啓瑚さんを筆頭に、学生、企業、研究機関、NPOが所属しています。公式サイト構築とインタビュー企画の運営を主導しています。",
    links: [{ text: "U35防災ゼミ 公式サイト", url: "https://u35-bosai-zemi.github.io/u35-bosai-web/" }]
  },

  prism: {
    title: "教材プラットフォーム「プリズム(Prism)」",
    text: "サイエンスコミュニケーションのプラットフォームの整備を目指しています。また、広く・いろんな人に紹介・利用・製作いただくため、サイエンスコミュニケーションツール・防災ツールをまとめたサイトを構築しています◎",
    links: [{ text: "プリズムを見る", url: "https://hagiiz-project.github.io/prism/" }]
  },

  kaisetsu: {
    title: "「東北大生が解説しますっ」（note・Instagram）",
    text: "「この勉強、何の役に立つの」という問いに答えるためのメディアです。中学・高校の教科が、実際の研究や仕事の現場でどう使われているか。東北大学の大学院生・博士学生が解説しています。",
    links: [
      { text: "note", url: "https://note.com/hagiiz_kaisetsu" },
      { text: "Instagram", url: "https://www.instagram.com/p/DbM-6Q9oG23/" }
    ]
  },

  tiktok: {
    title: "Tohoku TikTokとの高校出前授業",
    text: "東北地方を代表するインフルエンサー（TT会⭐︎東北⭐︎さん）と、白石工業高等学校へ出前授業をしました。",
    links: [{ text: "Instagramの投稿を見る", url: "https://www.instagram.com/p/DSrIJrqkhpx/" }]
  }
};
