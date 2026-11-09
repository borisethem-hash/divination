import crypto from "crypto";
import type { DB, Teller, Schedule, Reservation, Call, Review, Transaction, Post, SiteBanner } from "./types";
import { hashPassword } from "./password";
import { jstDateStr, addDays, jstToDate } from "./time";
import { nextPhase } from "./moon";

const id = (p: string) => p + crypto.randomBytes(6).toString("hex");

export const DEMO_ACCOUNTS = [
  { role: "ユーザー", email: "user@example.com", password: "user1234" },
  { role: "占い師", email: "teller@example.com", password: "teller1234" },
  { role: "管理者", email: "admin@example.com", password: "admin1234" },
];

type TellerSeed = Omit<Teller, "id" | "userId" | "affiliateCode" | "createdAt" | "sortOrder" | "published"> & { code: string; daysAgo: number; hours: [string, string][] };

const TELLERS: TellerSeed[] = [
  {
    name: "月詠 紫苑", kana: "つくよみ しおん", portrait: 0, pricePerMin: 150, status: "waiting", code: "shion", daysAgo: 180, hours: [["10:00", "14:00"], ["19:00", "24:00"]],
    catchcopy: "カードが映すのは、あなたの心がまだ言葉にできない本音です",
    methods: ["タロット", "西洋占星術"], specialties: ["恋愛", "復縁", "相手の気持ち"], styles: ["優しい", "じっくり"],
    bio: "対面鑑定歴12年。占い館で延べ1万人以上の鑑定を担当してきました。タロットで「今」の流れを、ホロスコープで「これから」の時期を読み解き、具体的に動けるアドバイスをお伝えします。",
    message: "うまく話せなくても大丈夫です。ゆっくり、あなたのペースでお話しください。",
  },
  {
    name: "白河 千鶴", kana: "しらかわ ちづる", portrait: 1, pricePerMin: 180, status: "waiting", code: "chizuru", daysAgo: 179, hours: [["09:00", "17:00"]],
    catchcopy: "生まれ持った命式から、人生の「季節」を読み解きます",
    methods: ["四柱推命", "九星気学"], specialties: ["仕事", "転職", "人生の転機"], styles: ["論理的", "的確"],
    bio: "四柱推命・九星気学を専門に研究20年。企業経営者の相談役も務めています。運気の波と行動のタイミングを明確にお伝えするのが得意です。",
    message: "迷った時こそ、運の流れを知ることで最善の一歩が選べます。",
  },
  {
    name: "天音", kana: "あまね", portrait: 2, pricePerMin: 200, status: "away", code: "amane", daysAgo: 178, hours: [["20:00", "24:00"]],
    catchcopy: "見えない縁の糸を、霊感でたどります",
    methods: ["霊感", "霊視", "オーラ鑑定"], specialties: ["恋愛", "人間関係", "ご先祖・守護"], styles: ["ズバッと", "癒し"],
    bio: "幼少期から人の気持ちが色で見える体質。神社の家系に生まれ、修行を経て鑑定師に。お相手の本心や、ご縁の行方を霊視でお伝えします。",
    message: "あなたを守っている存在からのメッセージをお届けします。",
  },
  {
    name: "星野 澪", kana: "ほしの みお", portrait: 3, pricePerMin: 140, status: "waiting", code: "mio", daysAgo: 177, hours: [["00:00", "24:00"]],
    catchcopy: "星の配置と数字のリズムで、あなたらしい選択を",
    methods: ["西洋占星術", "数秘術"], specialties: ["自分らしさ", "結婚", "仕事"], styles: ["優しい", "前向き"],
    bio: "占星術スクール講師。ホロスコープを用いた年運・月運の読み解きと、数秘術による性格分析を組み合わせて、無理のない開運法をご提案します。",
    message: "星はいつでもあなたの味方。一緒に地図を広げましょう。",
  },
  {
    name: "葵 凛", kana: "あおい りん", portrait: 4, pricePerMin: 120, status: "offline", code: "rin", daysAgo: 176, hours: [["13:00", "18:00"]],
    catchcopy: "はじめての電話占いでも安心のやさしい鑑定",
    methods: ["ルノルマン", "オラクルカード"], specialties: ["恋愛", "片思い", "夫婦関係"], styles: ["優しい", "癒し"],
    bio: "カウンセラー資格を持つカード鑑定師。お悩みをじっくり伺い、カードの物語を通して気持ちを整理するお手伝いをします。初めての方の鑑定実績多数。",
    message: "話すだけで心が軽くなる時間をお届けします。",
  },
  {
    name: "朔夜", kana: "さくや", portrait: 5, pricePerMin: 170, status: "waiting", code: "sakuya", daysAgo: 175, hours: [["18:00", "23:00"]],
    catchcopy: "東洋の叡智・算命学で宿命と運命を紐解く",
    methods: ["算命学", "紫微斗数"], specialties: ["人生の転機", "家庭", "金運"], styles: ["的確", "じっくり"],
    bio: "算命学を師に学び15年。宿命を知り、運命を活かすための具体的な時期と方角をお伝えします。人生の大きな決断の前にご相談ください。",
    message: "宿命は変えられなくても、運命は選べます。",
  },
  {
    name: "橘 結衣", kana: "たちばな ゆい", portrait: 6, pricePerMin: 130, status: "offline", code: "yui", daysAgo: 174, hours: [["11:00", "15:00"]],
    catchcopy: "易の言葉で、迷いに「答え」を",
    methods: ["周易", "断易"], specialties: ["二択の決断", "仕事", "恋愛"], styles: ["ズバッと", "前向き"],
    bio: "易経を学び、卦が示す言葉から明快な答えを導きます。「AとBどちらを選ぶべき？」という具体的なお悩みに強い鑑定師です。",
    message: "曖昧な答えはお伝えしません。一緒に決めましょう。",
  },
  {
    name: "久遠 透", kana: "くおん とおる", portrait: 7, pricePerMin: 160, status: "away", code: "toru", daysAgo: 173, hours: [["15:00", "21:00"]],
    catchcopy: "名前と住まいの気を整え、運を呼び込む",
    methods: ["姓名判断", "風水", "九星気学"], specialties: ["金運", "家庭", "引越し"], styles: ["論理的", "優しい"],
    bio: "風水コンサルタントとして住宅・店舗の鑑定を多数担当。姓名判断と組み合わせ、身の回りから運気を整える方法を丁寧にお伝えします。",
    message: "環境が変われば運も変わります。小さなことから始めましょう。",
  },
  {
    name: "水城 琴音", kana: "みずき ことね", portrait: 8, pricePerMin: 160, status: "waiting", code: "kotone", daysAgo: 6, hours: [["12:00", "16:00"], ["20:00", "24:00"]],
    catchcopy: "あなたの恋の続きを、カードと一緒に描きましょう",
    methods: ["タロット", "ルノルマン"], specialties: ["恋愛", "片思い", "復縁"], styles: ["優しい", "前向き"],
    bio: "占い館での対面鑑定を経て、恋愛相談を専門に活動。タロットとルノルマンを使い分け、お相手の気持ちと二人の未来を丁寧に読み解きます。",
    message: "恋の悩みは、一人で抱えるほど重くなります。まずは聞かせてください。",
  },
  {
    name: "宵月", kana: "よいづき", portrait: 9, pricePerMin: 220, status: "away", code: "yoizuki", daysAgo: 95, hours: [["21:00", "24:00"]],
    catchcopy: "言葉にならない想いまで、静かに受け取ります",
    methods: ["霊感", "霊視", "夢解き"], specialties: ["人生の転機", "人間関係", "ご先祖・守護"], styles: ["ズバッと", "じっくり"],
    bio: "幼い頃から夢で人の行く末を見ることがあり、寺社での修行を経て鑑定の道へ。霊視と夢解きで、今あなたに必要なメッセージをお伝えします。",
    message: "答えはいつも、あなたの中にあります。それを一緒に見つけましょう。",
  },
  {
    name: "七瀬 星羅", kana: "ななせ せいら", portrait: 10, pricePerMin: 150, status: "waiting", code: "seira", daysAgo: 14, hours: [["08:00", "12:00"], ["18:00", "22:00"]],
    catchcopy: "生まれた日の「月」が教える、あなたと誰かの相性",
    methods: ["宿曜占星術", "西洋占星術"], specialties: ["相性", "結婚", "自分らしさ"], styles: ["論理的", "優しい"],
    bio: "密教の暦学・宿曜占星術を学び、生まれた日の月の位置から性格や相性を読み解きます。西洋占星術と組み合わせた相性鑑定が好評です。",
    message: "相性は「良い・悪い」ではなく「活かし方」。一緒に紐解きましょう。",
  },
  {
    name: "神楽 舞", kana: "かぐら まい", portrait: 11, pricePerMin: 190, status: "offline", code: "mai", daysAgo: 120, hours: [["10:00", "15:00"]],
    catchcopy: "言霊と気の流れで、停滞した運を動かす",
    methods: ["霊感", "九星気学", "言霊"], specialties: ["金運", "仕事", "人生の転機"], styles: ["前向き", "ズバッと"],
    bio: "神社に奉仕した経験を持ち、言霊と九星気学で開運の時期と方位をお伝えします。「今年こそ変わりたい」という方の背中を力強く押します。",
    message: "言葉が変われば、運が変わります。",
  },
];

const REVIEW_TEXTS = [
  "初めての電話占いで緊張していましたが、優しく話を聞いてくださり、気持ちが整理できました。アドバイス通りに動いたら連絡が来ました！",
  "とにかく的確。こちらが話す前に状況を言い当てられて驚きました。時期まで具体的に教えてもらえて安心です。",
  "料金が良心的なので、時間を気にせずじっくり相談できました。また報告させてください。",
  "厳しいことも言われましたが、愛のある言葉で前向きになれました。リピート確定です。",
  "アプリのインストール不要で、ブラウザからすぐ繋がったのが良かったです。音声もクリアでした。",
  "仕事の転機について相談。運気の流れを図解するように説明してくださり、とても分かりやすかったです。",
  "復縁について相談しました。気休めではなく、相手の状況を踏まえた現実的なアドバイスをもらえて、気持ちが固まりました。",
  "夜遅い時間でもすぐに繋がって助かりました。声がとても落ち着いていて、話しているうちに心が軽くなりました。",
  "時間指定で予約できるので、予算を気にせず相談できるのが嬉しいです。終了前に知らせてくれるのも安心。",
  "二択で迷っていたことに、はっきり答えを出してもらえました。背中を押してもらえた気がします。",
  "鑑定結果だけでなく、毎日できる小さな開運アクションまで教えていただき、実践しています。",
  "こちらのペースに合わせて質問してくださったので、初回でも話しやすかったです。",
];

/** トップページのキャンペーン・特集バナー（初期値） */
export function defaultBanners(): SiteBanner[] {
  return [
    { id: "b_welcome", label: "WELCOME", title: "新規会員登録で1,000ptプレゼント", subtitle: "アプリ不要・通話料0円。メールアドレスだけで登録できます", image: "/images/photos/moon-lake.webp", link: "/register", published: true, sortOrder: 0 },
    { id: "b_touji", label: "EVENT", title: "冬至の特別待機ウィーク", subtitle: "一年で最も長い夜に、深夜の待機を拡大します", image: "/images/photos/lanterns-red.webp", link: "/news/touji-week", published: true, sortOrder: 1 },
    { id: "b_newface", label: "NEW FACE", title: "新人占い師 水城 琴音 デビュー", subtitle: "タロット×ルノルマンで恋の続きを読み解きます", image: "/images/photos/candle-autumn.webp", link: "/tellers/t9", published: true, sortOrder: 2 },
    { id: "b_column", label: "COLUMN", title: "満月と新月の過ごし方", subtitle: "月のリズムで、運気の流れを整える", image: "/images/photos/crescent.webp", link: "/column/moon-phases", published: true, sortOrder: 3 },
  ];
}

/** 次に来る「月/日」の日付（今日を含む） */
function nextMonthDay(today: string, month: number, day: number): string {
  const y = Number(today.slice(0, 4));
  const pad = (n: number) => String(n).padStart(2, "0");
  const thisYear = `${y}-${pad(month)}-${pad(day)}`;
  return thisYear >= today ? thisYear : `${y + 1}-${pad(month)}-${pad(day)}`;
}

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
    createdAt: ago(t.daysAgo),
  }));

  const tellers: Teller[] = TELLERS.map(({ code, daysAgo, hours, ...t }, i) => ({
    ...t,
    id: `t${i + 1}`,
    userId: `u_teller${i + 1}`,
    affiliateCode: code,
    published: true,
    sortOrder: i,
    createdAt: ago(daysAgo),
  }));

  const users = [
    { id: "u_user", role: "user" as const, email: "user@example.com", name: "山田 花子", passwordHash: hashPassword("user1234"), points: 8000, createdAt: ago(60) },
    { id: "u_user2", role: "user" as const, email: "sato@example.com", name: "佐藤 美咲", passwordHash: hashPassword("user1234"), points: 3000, createdAt: ago(50), referredBy: "t1" },
    { id: "u_user3", role: "user" as const, email: "suzuki@example.com", name: "鈴木 彩", passwordHash: hashPassword("user1234"), points: 1500, createdAt: ago(40), referredBy: "t1" },
    { id: "u_user4", role: "user" as const, email: "takahashi@example.com", name: "高橋 恵", passwordHash: hashPassword("user1234"), points: 500, createdAt: ago(30) },
  ];

  // スケジュール：今日から14日分（各占い師 週1日お休み）
  const schedules: Schedule[] = [];
  tellers.forEach((t, ti) => {
    for (let d = 0; d < 14; d++) {
      if ((d + ti) % 7 === 6) continue;
      for (const [start, end] of TELLERS[ti].hours) {
        schedules.push({ id: id("s_"), tellerId: t.id, date: addDays(today, d), start, end });
      }
    }
  });

  // 鑑定履歴：user は 紫苑(t1)と2回、千鶴(t2)と3回（3回目の鑑定で口コミ依頼が届く流れを確認できる）
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
  // ランキング表示用の鑑定実績
  pushHistory("u_user2", "t9", 4, "fixed", 30);
  pushHistory("u_user3", "t9", 2, "metered", 22);
  pushHistory("u_user4", "t9", 1, "fixed", 20);
  pushHistory("u_user2", "t3", 18, "fixed", 30);
  pushHistory("u_user3", "t3", 11, "metered", 25);
  pushHistory("u_user4", "t6", 8, "fixed", 20);
  pushHistory("u_user3", "t11", 6, "fixed", 30);
  pushHistory("u_user4", "t11", 3, "metered", 16);
  pushHistory("u_user3", "t5", 13, "fixed", 20);
  pushHistory("u_user2", "t10", 16, "fixed", 30);

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
    const count = 3 + (ti % 3); // 3〜5件
    for (let k = 0; k < count; k++) {
      reviews.push({ id: id("v_"), userId: reviewers[(ti + k) % 3], tellerId: t.id, rating: k === 2 ? 4 : k === 4 ? 4 : 5, body: REVIEW_TEXTS[(ti * 5 + k * 7) % REVIEW_TEXTS.length], status: "published", createdAt: ago(ti + k * 4 + 1, k * 3) });
    }
  });
  reviews.push({ id: id("v_"), userId: "u_user4", tellerId: "t3", rating: 1, body: "テスト投稿です。宣伝URL http://spam.example を含む不適切な投稿の例。", status: "pending", createdAt: ago(0, 6) });

  const toujiDate = nextMonthDay(today, 12, 21);
  const newMoon = jstDateStr(nextPhase("new", new Date(now.getTime() + 2 * 86400000)));
  const p = (type: Post["type"], title: string, slug: string, excerpt: string, body: string, days: number, cover: string, extra: Partial<Post> = {}): Post => ({
    id: id("p_"), type, title, slug, excerpt, body, coverImage: `/images/photos/${cover}.webp`, published: true, createdAt: ago(days), updatedAt: ago(days), ...extra,
  });
  const posts: Post[] = [
    p("event", "冬至の特別待機ウィーク", "touji-week", "一年で最も夜が長い冬至に合わせ、深夜帯に待機する占い師を増やします。",
      "## 冬至の特別待機ウィーク\n\n冬至は「一陽来復」——陰が極まり、陽に転じる日。新しい運気を迎える準備にぴったりの時期です。\n\n期間中は**深夜0時以降に待機する占い師を増やし**、お仕事帰りや寝る前の時間にも鑑定を受けやすくします。\n\n## 開催期間\n\n冬至を含む1週間\n\n## 参加方法\n\nエントリーは不要です。期間中に待機している占い師へ、いつも通り鑑定リクエストを送ってください。", 1, "lanterns-red", { eventDate: toujiDate }),
    p("news", "新人占い師「水城 琴音」先生がデビューしました", "new-teller-kotone", "タロットとルノルマンで恋愛を読み解く水城 琴音先生が在籍となりました。",
      "恋愛相談を専門とする**水城 琴音**先生が新たに在籍いたしました。\n\n占い館での対面鑑定を経て、タロットとルノルマンを使い分けた丁寧な鑑定が持ち味です。片思い・復縁など、恋の悩みをじっくりお聞かせください。\n\n[水城 琴音先生のプロフィールはこちら](/tellers/t9)", 5, "candle-autumn"),
    p("event", "新月の願い事ワークショップ（オンライン）", "shingetsu-workshop", "新月のタイミングに合わせて願い事を書く、オンラインワークショップを開催します。",
      "## 新月の願い事ワークショップ\n\n新月は新しいことを始めるのに最適なタイミング。占星術の観点から、叶いやすい願い事の書き方をお伝えします。\n\n講師：星野 澪 先生\n\n参加費：無料（会員限定）\n\n## 当日の流れ\n\n1. 月のリズムと運気の関係について（15分）\n2. 願い事の書き方ワーク（20分）\n3. 質問コーナー（10分）", 3, "crescent", { eventDate: newMoon }),
    p("news", "年末年始の営業について", "year-end", "年末年始も通常どおり鑑定をご利用いただけます。お問い合わせ窓口の休業期間をお知らせします。",
      "いつも月あかりをご利用いただき、ありがとうございます。\n\n年末年始も、占い師の待機スケジュールに合わせて**通常どおり鑑定をご利用いただけます**。\n\n## お問い合わせ窓口の休業期間\n\n12月29日〜1月3日\n\n期間中にいただいたお問い合わせは、1月4日以降に順次回答いたします。", 8, "pagoda-night"),
    p("news", "新しい占い師「星野 澪」先生が加わりました", "new-teller-mio", "西洋占星術と数秘術を組み合わせた鑑定で人気の星野 澪先生が在籍となりました。",
      "西洋占星術スクール講師の**星野 澪**先生が新たに在籍いたしました。\n\nホロスコープによる年運・月運の読み解きと、数秘術による性格分析が得意です。\n\n[星野 澪先生のプロフィールはこちら](/tellers/t4)", 12, "stars"),
    p("news", "アプリ不要のブラウザ通話に対応しました", "browser-call", "スマートフォン・PCのブラウザだけで、通話料0円の鑑定が受けられるようになりました。",
      "月あかりでは、**アプリのインストール不要・通話料0円**のブラウザ通話を導入しました。\n\n## ご利用の流れ\n\n1. 占い師に鑑定リクエストを送る\n2. 占い師が承認すると予約確定\n3. 予約時間にマイページの「入室する」ボタンを押すだけ\n\n従来の電話回線と違い、通話料がかからない分、鑑定料をお求めやすく設定しています。", 20, "phone-hands"),

    p("column", "満月と新月、それぞれの過ごし方", "moon-phases", "月のリズムは「始める時期」と「手放す時期」を知る手がかり。新月と満月の過ごし方をご紹介します。",
      "月は約29.5日の周期で満ち欠けを繰り返しています。古くから日本では月の満ち欠けをもとにした暦で暮らしを営み、種まきや収穫、祭りの日取りを決めてきました。占いの世界でも、月のリズムは「始める時期」と「手放す時期」を知る手がかりとして大切にされています。\n\n## 新月は「はじまり」の日\n\n新月は月が見えなくなる日。ここから月が満ちていくことから、新しい目標を立てたり、願い事を書いたりするのに向いた日とされています。\n\n- 叶えたいことを、すでに叶ったように書き出す\n- 「〜しない」ではなく「〜する」という前向きな言葉を選ぶ\n- 欲張らず、心から望むことを2〜3個に絞る\n\n## 満月は「感謝と手放し」の日\n\n満月は月が最も明るく輝く日。ここまで頑張ってきた自分をねぎらい、うまくいったことに感謝するのに向いています。同時に、もう必要のない習慣や考え方を手放すのにも良いタイミングです。\n\n- 新月に立てた目標を振り返る\n- 部屋の不要なものを一つ手放す\n- ゆっくり湯船につかり、早めに休む\n\n## 月のリズムを鑑定に活かす\n\n月あかりの占い師の中には、ホロスコープや月の位置を使って「動くべき時期」を読み解く先生も在籍しています。今日の月齢は[今日の運勢ページ](/horoscope)で確認できます。", 2, "moon-lake", { category: "月と暦" }),
    p("column", "タロット大アルカナ22枚の意味と読み方", "tarot-basics", "タロットの中心となる大アルカナ22枚のキーワードと、鑑定を受けるときのコツをまとめました。",
      "タロットカードは78枚で構成され、そのうち人生の大きなテーマを表す22枚を「大アルカナ」と呼びます。電話占いで「タロットで占います」と言われたとき、どんなカードが出るのか知っておくと、鑑定をより深く楽しめます。\n\n## 大アルカナ22枚のキーワード\n\n- 0 愚者：自由・新しい始まり\n- 1 魔術師：創造・意志の力\n- 2 女教皇：直感・知性\n- 3 女帝：豊かさ・愛情\n- 4 皇帝：安定・責任\n- 5 教皇：信頼・教え\n- 6 恋人：選択・調和\n- 7 戦車：前進・勝利\n- 8 力：勇気・忍耐\n- 9 隠者：内省・探求\n- 10 運命の輪：転機・巡り合わせ\n- 11 正義：公正・バランス\n- 12 吊るされた男：試練・視点の転換\n- 13 死神：終わりと再生\n- 14 節制：調和・節度\n- 15 悪魔：執着・誘惑\n- 16 塔：崩壊・解放\n- 17 星：希望・癒し\n- 18 月：不安・潜在意識\n- 19 太陽：成功・喜び\n- 20 審判：復活・目覚め\n- 21 世界：完成・達成\n\n## 「怖いカード」が出ても大丈夫\n\n死神や塔のカードが出ると不安になる方もいますが、タロットのカードに「絶対に悪い」意味はありません。死神は「古いものが終わり、新しいものが始まる」こと、塔は「固まった状況が動き出す」ことを示す場合も多いのです。カードの意味は、出た位置や周りのカードとの組み合わせで読み解きます。\n\n## 鑑定を受けるときのコツ\n\n「彼は私をどう思っている？」のように質問を具体的にすると、カードからのメッセージも具体的になります。\n\n[タロットが得意な占い師を探す](/tellers?method=タロット)", 4, "candle-purple", { category: "タロット" }),
    p("column", "四柱推命・九星気学・算命学 ― 東洋占術で何がわかる？", "eastern-divination", "生年月日から運気の流れを読み解く東洋占術。代表的な3つの占術の違いと選び方を解説します。",
      "占いには大きく分けて、生年月日などから運命を読み解く「命術」、カードや易で今の状況を占う「卜術」、手相や家相など形から読み解く「相術」があります。東洋占術の多くは「命術」にあたり、人生の流れや運気のタイミングを知るのが得意です。\n\n## 四柱推命\n\n生まれた年・月・日・時間の四つの柱から「命式」を作り、性格や才能、運気の流れを読み解きます。人生の大きな転機や、仕事の適性を知りたいときに頼りになる占術です。\n\n## 九星気学\n\n生まれ年から導かれる九つの星をもとに、その年・月の運気や吉方位を読み解きます。引越しや旅行、新しいことを始める時期を選ぶときによく使われます。\n\n## 算命学\n\n古代中国の思想をもとにした占術で、宿命（生まれ持ったもの）と運命（自分で選べるもの）を読み解きます。家族や人間関係のバランスを見るのも得意です。\n\n## どの占術を選べばいい？\n\n「いつ動くべきか」を知りたいなら九星気学、「自分に向いている生き方」を知りたいなら四柱推命や算命学がおすすめです。迷ったら、相談内容を伝えて占い師に選んでもらうのも一つの方法です。\n\n[四柱推命の占い師を探す](/tellers?method=四柱推命)", 7, "lanterns-white", { category: "東洋占術" }),
    p("column", "はじめての電話占い ― 上手に相談するための5つのコツ", "phone-reading-tips", "限られた時間で納得のいく鑑定を受けるために。はじめての方に知っておいてほしい5つのコツです。",
      "「電話占いって、何を話せばいいの？」「時間内にうまく相談できるか不安」——はじめての方からよくいただくお声です。限られた時間で納得のいく鑑定を受けるためのコツをご紹介します。\n\n## 1. 相談したいことを事前にメモする\n\n聞きたいことを2〜3個に絞ってメモしておくと、緊張していても落ち着いて話せます。鑑定リクエストの「ご相談内容」欄に書いておけば、占い師が事前に目を通してくれます。\n\n## 2. 相手の生年月日・名前を手元に\n\n四柱推命や占星術などの先生は、生年月日を使って鑑定します。分かる範囲で準備しておきましょう。\n\n## 3. 「時間指定」で予算を決める\n\nはじめての方には、20分・30分などの**時間指定（定額）**がおすすめです。時間になると自動で終了するので、料金を気にせず話に集中できます。\n\n## 4. 静かな場所で、イヤホンマイクを使う\n\nブラウザ通話はイヤホンマイクを使うと声がクリアに届きます。Wi-Fiなど電波の安定した場所からご利用ください。\n\n## 5. 気になる先生は口コミをチェック\n\n占い師のプロフィールページでは、実際に鑑定を受けたお客様の口コミを読めます。自分に合いそうな先生を見つける参考にしてください。\n\n[今すぐ鑑定できる占い師を見る](/tellers?status=waiting)", 9, "phone-coffee", { category: "はじめての方へ" }),
    p("column", "願いを託す縁起物 ―「くくり猿」と欲をひとつ手放す開運術", "kukurizaru", "京都・八坂庚申堂のお守り「くくり猿」。欲をひとつ我慢して願いを叶える、という教えをご紹介します。",
      "京都・東山の八坂庚申堂を訪れると、色とりどりの布の玉がぎっしりと吊るされた光景に出会います。これは「くくり猿」と呼ばれるお守りです。\n\n## くくり猿に込められた意味\n\nくくり猿は、手足をくくられて動けなくなった猿の姿を表しています。欲のままに動き回る心を猿にたとえ、それをくくりとめることで、願いが叶いやすくなると言われています。願い事を一つ書いて奉納し、その代わりに**欲をひとつ我慢する**のが習わしです。\n\n## 「手放す」ことで運が巡る\n\n占いの世界でも、新しいものを迎えるには、まず手放すことが大切だと考えられています。\n\n- 夜更かしをひとつ減らす\n- 寝る前のスマートフォンを控える\n- 衝動買いを一度我慢する\n\n小さな我慢が、願いへ向かう集中力を育ててくれます。\n\n## 願い事は具体的に\n\n「幸せになりたい」よりも「来年の春までに転職先を決める」のように、具体的な言葉にするほど行動に移しやすくなります。願いの叶え方に迷ったら、占い師に相談してみてください。\n\n[金運・開運が得意な占い師を探す](/tellers?specialty=金運)", 13, "kukurizaru", { category: "開運" }),
    p("column", "香りで心を整える ― 鑑定前の小さなリラックス習慣", "incense-ritual", "鑑定の前に少しだけ心を整えると、占い師の言葉がすっと心に入ってきます。香りを使った習慣をご紹介。",
      "電話占いは、ご自宅でリラックスして受けられるのが魅力です。鑑定の前に少しだけ心を整えておくと、占い師の言葉がすっと心に入ってきます。\n\n## お香を焚いて、深呼吸\n\n白檀（びゃくだん）や沈香（じんこう）など、和の香りには気持ちを落ち着かせる力があります。火の扱いが心配な方は、香り袋やルームスプレーでも十分です。\n\n## 温かい飲み物を用意する\n\n緊張すると喉が渇きやすくなります。白湯やハーブティーなど、温かい飲み物を手元に置いておきましょう。\n\n## 「聞きたいこと」を一行で書く\n\n心が整ったら、相談したいことを一行で書き出してみてください。言葉にすることで、自分が本当に知りたいことが見えてきます。\n\n香りや音楽で整えた静かな時間は、それだけで小さなお守りになります。", 16, "incense", { category: "癒し" }),
    p("column", "紅葉の季節に見直したい「手放す」開運術", "autumn-letting-go", "木々が葉を落とすように、不要なものを手放すと運気の巡りが良くなると言われています。",
      "木々が色づき、やがて葉を落とす秋。自然が次の季節に備えるように、私たちも不要なものを手放すと、運気の巡りが良くなると言われています。\n\n## 秋は「収穫」と「整理」の季節\n\n実りの秋は、これまでの頑張りを振り返り、結果を受け取る時期。同時に、冬に向けて身の回りを整えるのにも適しています。\n\n## 今日からできる3つの手放し\n\n1. 一年以上使っていない物を一つ手放す\n2. 連絡を取っていない人との関係を、心の中で整理する\n3. 「〜しなければ」という思い込みを一つ書き出して、手放す\n\n## 紅葉狩りで気分転換を\n\n色づいた木々を眺めるだけでも、気持ちが切り替わります。外に出るのが難しい日は、窓を開けて季節の空気を入れるだけでも十分です。", 22, "maple-water", { category: "季節の開運" }),
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
    banners: defaultBanners(),
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
