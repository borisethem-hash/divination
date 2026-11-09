export type Role = "user" | "teller" | "admin";

export interface User {
  id: string;
  role: Role;
  email: string;
  name: string;
  passwordHash: string;
  points: number;
  referredBy?: string; // tellerId（アフィリエイト経由の登録）
  createdAt: string;
}

export type TellerStatus = "waiting" | "away" | "busy" | "offline";

export interface Teller {
  id: string;
  userId: string;
  name: string;
  kana: string;
  catchcopy: string;
  methods: string[]; // 占術
  specialties: string[]; // 得意な相談
  styles: string[]; // 鑑定スタイル
  bio: string;
  message: string;
  pricePerMin: number; // 円(pt)/分
  imageUrl?: string; // アップロード画像（未設定時はイラスト）
  portrait: number; // イラストのバリエーション番号
  affiliateCode: string;
  status: TellerStatus;
  statusBeforeBusy?: TellerStatus;
  scheduleActive?: boolean; // 前回確認時に待機スケジュール内だったか（自動切替用）
  published: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Schedule {
  id: string;
  tellerId: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM（24:00まで可）
}

export type ReservationType = "fixed" | "metered";
export type ReservationStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "cancelled"
  | "in_progress"
  | "completed"
  | "expired";

export interface Reservation {
  id: string;
  userId: string;
  tellerId: string;
  type: ReservationType;
  durationMin?: number; // fixed のみ
  startAt: string; // 希望開始日時 ISO
  instant: boolean; // 今すぐ鑑定
  message: string;
  status: ReservationStatus;
  tellerNote?: string;
  createdAt: string;
  decidedAt?: string;
}

export interface Call {
  id: string; // = reservationId
  reservationId: string;
  epoch: number;
  offer?: string;
  answer?: string;
  userSeen?: number;
  tellerSeen?: number;
  startedAt?: string;
  endedAt?: string;
  billedMinutes?: number;
  amount?: number;
  endedBy?: string;
}

export interface Review {
  id: string;
  userId: string;
  tellerId: string;
  rating: number;
  body: string;
  status: "pending" | "published" | "hidden";
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "charge" | "call" | "bonus";
  amount: number; // 加算は+、消費は-
  note: string;
  createdAt: string;
}

export interface AffiliateClick {
  id: string;
  tellerId: string;
  at: string;
}

export interface AffiliateEarning {
  id: string;
  tellerId: string;
  userId: string;
  kind: "signup" | "call";
  amount: number;
  note: string;
  createdAt: string;
  paid: boolean;
}

export type PostType = "news" | "event" | "column";

export interface Post {
  id: string;
  type: PostType;
  category?: string; // コラムのカテゴリ（例：タロット・開運）
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage?: string;
  eventDate?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

/** トップページのキャンペーン・特集バナー（管理画面から編集） */
export interface SiteBanner {
  id: string;
  label: string; // 小見出し（例：CAMPAIGN）
  title: string;
  subtitle: string;
  image: string; // /images/... またはアップロード画像
  link: string;
  published: boolean;
  sortOrder: number;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  category: string;
  body: string;
  source: "form" | "chatbot";
  status: "new" | "in_progress" | "done";
  createdAt: string;
}

export interface Mail {
  id: string;
  to: string;
  subject: string;
  body: string;
  createdAt: string;
}

export interface Settings {
  siteName: string;
  heroTitle: string;
  heroText: string;
  announcement: string;
  reviewThreshold: number; // 〇回以上リピートで口コミ依頼
  reviewAutoPublish: boolean;
  affiliateRate: number; // 紹介ユーザーの鑑定料に対する報酬率(%)
  affiliateSignupBonus: number; // 紹介登録1件あたりの報酬(円)
  signupPoints: number; // 新規登録特典pt
  minMeteredMinutes: number; // 従量制開始に必要な最低残高（分）
  chatbotName: string; // チャットボット案内係の名前
  chatbotAvatar?: string; // 案内係の画像（未設定時はイラスト）
  joinBeforeMin: number; // 予約開始の何分前から入室可能か
}

export interface DB {
  users: User[];
  tellers: Teller[];
  schedules: Schedule[];
  reservations: Reservation[];
  calls: Call[];
  reviews: Review[];
  notifications: Notification[];
  transactions: Transaction[];
  affiliateClicks: AffiliateClick[];
  affiliateEarnings: AffiliateEarning[];
  posts: Post[];
  banners: SiteBanner[];
  inquiries: Inquiry[];
  mails: Mail[];
  sessions: { token: string; userId: string; expiresAt: string }[];
  settings: Settings;
}
