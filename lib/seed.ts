import crypto from "crypto";
import type { DB, Teller, Schedule, Reservation, Call, Review, Transaction, Post } from "./types";
import { hashPassword } from "./password";
import { jstDateStr, addDays, jstToDate } from "./time";

const id = (p: string) => p + crypto.randomBytes(6).toString("hex");

export const DEMO_ACCOUNTS = [
  { role: "ユーザー", email: "user@example.com", password: "user1234" },
  { role: "占い師", email: "teller@example.com", password: "teller1234" },
  { role: "管理者", email: "admin@example.com", password: "admin1234" },
];

const TELLERS: Omit<Teller, "id" | "userId" | "affiliateCode" | "createdAt" | "sortOrder" | "published">[] = [
  {
    name: "月詠 紫苑", kana: "つくよみ しおん", portrait: 0, pricePerMin: 150, status: "waiting",
    catchcopy: "カードが映すのは、あなたの心がまだ言葉にできない本音です",
    methods: ["タロット", "西洋占星術"], specialties: ["恋愛", "復縁", "相手の気持ち"], styles: ["優しい", "じっくり"],
    bio: "対面鑑定歴12年。占い館で延べ1万人以上の鑑定を担当してきました。タロットで「今」の流れを、ホロスコープで「これから」の時期を読み解き、具体的に動けるアドバイスをお伝えします。",
    message: "うまく話せなくても大丈夫です。ゆっくり、あなたのペースでお話しください。",
  },
  {
    name: "白河 千鶴", kana: "しらかわ ちづる", portrait: 1, pricePerMin: 180, status: "waiting",
    catchcopy: "生まれ持った命式から、人生の「季節」を読み解きます",
    methods: ["四柱推命", "九星気学"], specialties: ["仕事", "転職", "人生の転機"], styles: ["論理的", "的確"],
    bio: "四柱推命・九星気学を専門に研究20年。企業経営者の相談役も務めています。運気の波と行動のタイミングを明確にお伝えするのが得意です。",
    message: "迷った時こそ、運の流れを知ることで最善の一歩が選べます。",
  },
  {
    name: "天音", kana: "あまね", portrait: 2, pricePerMin: 200, status: "away",
    catchcopy: "見えない縁の糸を、霊感でたどります",
    methods: ["霊感", "霊視", "オーラ鑑定"], specialties: ["恋愛", "人間関係", "ご先祖・守護"], styles: ["ズバッと", "癒し"],
    bio: "幼少期から人の気持ちが色で見える体質。神社の家系に生まれ、修行を経て鑑定師に。お相手の本心や、ご縁の行方を霊視でお伝えします。",
    message: "あなたを守っている存在からのメッセージをお届けします。",
  },
  {
    name: "星野 澪", kana: "ほしの みお", portrait: 3, pricePerMin: 140, status: "waiting",
    catchcopy: "星の配置と数字のリズムで、あなたらしい選択を",
    methods: ["西洋占星術", "数秘術"], specialties: ["自分らしさ", "結婚", "仕事"], styles: ["優しい", "前向き"],
    bio: "占星術スクール講師。ホロスコープを用いた年運・月運の読み解きと、数秘術による性格分析を組み合わせて、無理のない開運法をご提案します。",
    message: "星はいつでもあなたの味方。一緒に地図を広げましょう。",
  },
  {
    name: "葵 凛", kana: "あおい りん", portrait: 4, pricePerMin: 120, status: "offline",
    catchcopy: "はじめての電話占いでも安心のやさしい鑑定",
    methods: ["ルノルマン", "オラクルカード"], specialties: ["恋愛", "片思い", "夫婦関係"], styles: ["優しい", "癒し"],
    bio: "カウンセラー資格を持つカード鑑定師。お悩みをじっくり伺い、カードの物語を通して気持ちを整理するお手伝いをします。初めての方の鑑定実績多数。",
    message: "話すだけで心が軽くなる時間をお届けします。",
  },
  {
    name: "朔夜", kana: "さくや", portrait: 5, pricePerMin: 170, status: "waiting",
    catchcopy: "東洋の叡智・算命学で宿命と運命を紐解く",
    methods: ["算命学", "紫微斗数"], specialties: ["人生の転機", "家庭", "金運"], styles: ["的確", "じっくり"],
    bio: "算命学を師に学び15年。宿命を知り、運命を活かすための具体的な時期と方角をお伝えします。人生の大きな決断の前にご相談ください。",
    message: "宿命は変えられなくても、運命は選べます。",
  },
  {
    name: "橘 結衣", kana: "たちばな ゆい", portrait: 6, pricePerMin: 130, status: "offline",
    catchcopy: "易の言葉で、迷いに「答え」を",
    methods: ["周易", "断易"], specialties: ["二択の決断", "仕事", "恋愛"], styles: ["ズバッと", "前向き"],
    bio: "易経を学び、卦が示す言葉から明快な答えを導きます。「AとBどちらを選ぶべき？」という具体的なお悩みに強い鑑定師です。",
    message: "曖昧な答えはお伝えしません。一緒に決めましょう。",
  },
  {
    name: "久遠 透", kana: "くおん とおる", portrait: 7, pricePerMin: 160, status: "away",
    catchcopy: "名前と住まいの気を整え、運を呼び込む",
    methods: ["姓名判断", "風水", "九星気学"], specialties: ["金運", "家庭", "引越し"], styles: ["論理的", "優しい"],
    bio: "風水コンサルタントとして住宅・店舗の鑑定を多数担当。姓名判断と組み合わせ、身の回りから運気を整える方法を丁寧にお伝えします。",
    message: "環境が変われば運も変わります。小さなことから始めましょう。",
  },
];

const REVIEW_TEXTS = [
  "初めての電話占いで緊張していましたが、優しく話を聞いてくださり、気持ちが整理できました。アドバイス通りに動いたら連絡が来ました！",
  "とにかく的確。こちらが話す前に状況を言い当てられて驚きました。時期まで具体的に教えてもらえて安心です。",
  "料金が良心的なので、時間を気にせずじっくり相談できました。また報告させてください。",
  "厳しいことも言われましたが、愛のある言葉で前向きになれました。リピート確定です。",
  "アプリのインストール不要で、ブラウザからすぐ繋がったのが良かったです。音声もクリアでした。",
  "仕事の転機について相談。運気の流れを図解するように説明してくださり、とても分かりやすかったです。",
];

export function createSeed(): DB {
  const now = new Date();
  const today = jstDateStr(now);
  const iso = (d: Date) => d.toISOString();
  const ago = (days: number, h = 0) => iso(new Date(now.getTime() - days * 86400000 - h * 3600000));

  const admin = { id: "u_admin", role: "admin" as const, email: "admin@example.com", name: "運営管理者", passwordHash: hashPassword("admin1234"), points: 0, createdAt: ago(200) };

  const tellerUsers = TELLERS.map((t, i) => ({
    id: `u_teller${i + 1}`,
    role: "teller" as const,
    email: i === 0 ? "teller@example.com" : `teller${i + 1}@example.com`,
    name: t.name,
    passwordHash: hashPassword("teller1234"),
    points: 0,
    createdAt: ago(180 - i),
  }));

  const tellers: Teller[] = TELLERS.map((t, i) => ({
    ...t,
    id: `t${i + 1}`,
    userId: `u_teller${i + 1}`,
    affiliateCode: ["shion", "chizuru", "amane", "mio", "rin", "sakuya", "yui", "toru"][i],
    published: true,
    sortOrder: i,
    createdAt: ago(180 - i),
  }));

  const users = [
    { id: "u_user", role: "user" as const, email: "user@example.com", name: "山田 花子", passwordHash: hashPassword("user1234"), points: 8000, createdAt: ago(60) },
    { id: "u_user2", role: "user" as const, email: "sato@example.com", name: "佐藤 美咲", passwordHash: hashPassword("user1234"), points: 3000, createdAt: ago(50), referredBy: "t1" },
    { id: "u_user3", role: "user" as const, email: "suzuki@example.com", name: "鈴木 彩", passwordHash: hashPassword("user1234"), points: 1500, createdAt: ago(40), referredBy: "t1" },
    { id: "u_user4", role: "user" as const, email: "takahashi@example.com", name: "高橋 恵", passwordHash: hashPassword("user1234"), points: 500, createdAt: ago(30) },
  ];

  // スケジュール：今日から14日分
  const patterns: [string, string][][] = [
    [["10:00", "14:00"], ["19:00", "24:00"]],
    [["09:00", "17:00"]],
    [["20:00", "24:00"]],
    [["00:00", "24:00"]],
    [["13:00", "18:00"]],
    [["18:00", "23:00"]],
    [["11:00", "15:00"]],
    [["15:00", "21:00"]],
  ];
  const schedules: Schedule[] = [];
  tellers.forEach((t, ti) => {
    for (let d = 0; d < 14; d++) {
      if ((d + ti) % 7 === 6) continue; // 週1日お休み
      for (const [start, end] of patterns[ti]) {
        schedules.push({ id: id("s_"), tellerId: t.id, date: addDays(today, d), start, end });
      }
    }
  });

  // 鑑定履歴：user は 紫苑(t1)と2回、千鶴(t2)と3回
  const reservations: Reservation[] = [];
  const calls: Call[] = [];
  const transactions: Transaction[] = [];
  const pushHistory = (userId: string, tellerId: string, daysAgo: number, type: "fixed" | "metered", minutes: number) => {
    const t = tellers.find((x) => x.id === tellerId)!;
    const rid = id("r_");
    const start = new Date(now.getTime() - daysAgo * 86400000);
    reservations.push({ id: rid, userId, tellerId, type, durationMin: type === "fixed" ? minutes : undefined, startAt: iso(start), instant: false, message: "", status: "completed", createdAt: iso(new Date(start.getTime() - 86400000)), decidedAt: iso(new Date(start.getTime() - 80000000)) });
    const amount = minutes * t.pricePerMin;
    calls.push({ id: rid, reservationId: rid, epoch: 1, startedAt: iso(start), endedAt: iso(new Date(start.getTime() + minutes * 60000)), billedMinutes: minutes, amount });
    transactions.push({ id: id("x_"), userId, type: "call", amount: -amount, note: `${t.name} 鑑定 ${minutes}分`, createdAt: iso(new Date(start.getTime() + minutes * 60000)) });
  };
  pushHistory("u_user", "t1", 20, "fixed", 20);
  pushHistory("u_user", "t1", 9, "metered", 26);
  pushHistory("u_user", "t2", 25, "fixed", 30);
  pushHistory("u_user", "t2", 15, "fixed", 20);
  pushHistory("u_user", "t2", 5, "metered", 18);
  pushHistory("u_user2", "t1", 12, "fixed", 30);
  pushHistory("u_user3", "t1", 7, "metered", 15);
  pushHistory("u_user2", "t4", 3, "fixed", 20);

  // 承認待ちのリクエスト（占い師画面で承認フローを確認できる）
  const tomorrow = addDays(today, 1);
  reservations.push({ id: id("r_"), userId: "u_user", tellerId: "t1", type: "fixed", durationMin: 30, startAt: iso(jstToDate(tomorrow, "20:00")), instant: false, message: "職場の先輩との関係について相談したいです。", status: "requested", createdAt: ago(0, 2) });
  reservations.push({ id: id("r_"), userId: "u_user4", tellerId: "t1", type: "metered", startAt: iso(jstToDate(addDays(today, 2), "21:00")), instant: false, message: "復縁の可能性について見ていただきたいです。", status: "requested", createdAt: ago(0, 5) });

  transactions.push({ id: id("x_"), userId: "u_user", type: "bonus", amount: 1000, note: "新規登録特典", createdAt: ago(60) });
  transactions.push({ id: id("x_"), userId: "u_user", type: "charge", amount: 10000, note: "ポイント購入（クレジットカード）", createdAt: ago(59) });
  transactions.push({ id: id("x_"), userId: "u_user", type: "charge", amount: 10000, note: "ポイント購入（クレジットカード）", createdAt: ago(10) });

  const reviewers = ["u_user2", "u_user3", "u_user4"];
  const reviews: Review[] = [];
  tellers.forEach((t, ti) => {
    for (let k = 0; k < 3; k++) {
      reviews.push({ id: id("v_"), userId: reviewers[(ti + k) % 3], tellerId: t.id, rating: k === 2 ? 4 : 5, body: REVIEW_TEXTS[(ti + k) % REVIEW_TEXTS.length], status: "published", createdAt: ago(ti * 2 + k * 5 + 1) });
    }
  });
  reviews.push({ id: id("v_"), userId: "u_user4", tellerId: "t3", rating: 1, body: "テスト投稿です。宣伝URL http://spam.example を含む不適切な投稿の例。", status: "pending", createdAt: ago(0, 6) });

  const p = (type: "news" | "event", title: string, slug: string, excerpt: string, body: string, days: number, eventDate?: string): Post => ({
    id: id("p_"), type, title, slug, excerpt, body, eventDate, published: true, createdAt: ago(days), updatedAt: ago(days),
  });
  const posts: Post[] = [
    p("event", "冬至の特別鑑定ウィーク開催", "touji-week", "一年で最も夜が長い冬至。運気の切り替わりに合わせ、全占い師の鑑定料が20%オフになります。",
      "## 冬至の特別鑑定ウィーク\n\n冬至は「一陽来復」——陰が極まり、陽に転じる日。新しい運気を迎える準備にぴったりの時期です。\n\n期間中は**全占い師の鑑定料が20%オフ**。この機会に、来年の運勢をじっくり占ってみませんか。\n\n## 開催期間\n\n12月18日〜12月24日\n\n## 参加方法\n\nエントリー不要。期間中に占い師へ鑑定リクエストを送るだけで自動的に割引が適用されます。", 1, addDays(today, 30)),
    p("news", "新しい占い師「星野 澪」先生が加わりました", "new-teller-mio", "西洋占星術と数秘術を組み合わせた鑑定で人気の星野 澪先生が在籍となりました。",
      "西洋占星術スクール講師の**星野 澪**先生が新たに在籍いたしました。\n\nホロスコープによる年運・月運の読み解きと、数秘術による性格分析が得意です。\n\n[星野 澪先生のプロフィールはこちら](/tellers/t4)", 6),
    p("news", "アプリ不要のブラウザ通話に対応しました", "browser-call", "スマートフォン・PCのブラウザだけで、通話料0円の鑑定が受けられるようになりました。",
      "月あかりでは、**アプリのインストール不要・通話料0円**のブラウザ通話を導入しました。\n\n## ご利用の流れ\n\n1. 占い師に鑑定リクエストを送る\n2. 占い師が承認すると予約確定\n3. 予約時間にマイページの「入室する」ボタンを押すだけ\n\n従来の電話回線と違い、通話料がかからない分、鑑定料をお求めやすく設定しています。", 14),
    p("event", "新月の願い事ワークショップ（オンライン）", "shingetsu-workshop", "新月のエネルギーに合わせて願い事を書く、オンラインワークショップを開催します。",
      "## 新月の願い事ワークショップ\n\n新月は新しいことを始めるのに最適なタイミング。占星術の観点から、叶いやすい願い事の書き方をお伝えします。\n\n講師：星野 澪 先生\n\n参加費：無料（会員限定）", 20, addDays(today, 12)),
  ];

  return {
    users: [admin, ...tellerUsers, ...users],
    tellers,
    schedules,
    reservations,
    calls,
    reviews,
    notifications: [
      { id: id("n_"), userId: "u_user", title: "白河 千鶴 先生への口コミのお願い", body: "いつもご利用ありがとうございます。3回以上ご利用いただいた白河 千鶴 先生の鑑定はいかがでしたか？口コミを投稿いただくと、他のお客様の参考になります。", link: "/mypage/review/t2", read: false, createdAt: ago(5) },
    ],
    transactions,
    affiliateClicks: Array.from({ length: 42 }, (_, i) => ({ id: id("c_"), tellerId: i % 3 === 0 ? "t4" : "t1", at: ago(i % 28, i % 12) })),
    affiliateEarnings: [
      { id: id("e_"), tellerId: "t1", userId: "u_user2", kind: "signup", amount: 1000, note: "紹介登録 佐藤 美咲", createdAt: ago(50), paid: true },
      { id: id("e_"), tellerId: "t1", userId: "u_user3", kind: "signup", amount: 1000, note: "紹介登録 鈴木 彩", createdAt: ago(40), paid: false },
      { id: id("e_"), tellerId: "t1", userId: "u_user2", kind: "call", amount: 450, note: "紹介ユーザー鑑定報酬（月詠 紫苑 30分）", createdAt: ago(12), paid: false },
      { id: id("e_"), tellerId: "t1", userId: "u_user3", kind: "call", amount: 225, note: "紹介ユーザー鑑定報酬（月詠 紫苑 15分）", createdAt: ago(7), paid: false },
    ],
    posts,
    inquiries: [
      { id: id("q_"), name: "田中 由美", email: "tanaka@example.com", category: "占い師として登録したい", body: "タロット歴8年です。占い師として在籍を希望しています。", source: "form", status: "new", createdAt: ago(1) },
    ],
    mails: [],
    sessions: [],
    settings: {
      siteName: "電話占い 月あかり",
      heroTitle: "心に、やさしい月あかりを。",
      heroText: "アプリ不要・通話料0円。ブラウザからすぐに繋がる、本格派の電話占い。対面鑑定で選び抜かれた占い師が、あなたの悩みに寄り添います。",
      announcement: "新規登録で1,000円分のポイントをプレゼント中",
      reviewThreshold: 3,
      reviewAutoPublish: false,
      affiliateRate: 10,
      affiliateSignupBonus: 1000,
      signupPoints: 1000,
      minMeteredMinutes: 5,
      chatbotName: "さくら",
      joinBeforeMin: 10,
    },
  };
}
