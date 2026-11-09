/**
 * 今日の星座占い（テンプレート）。
 * 日付から決まる擬似乱数で順位・メッセージを生成するため、同じ日は誰が見ても同じ結果になります。
 * 実運用で占い師の監修文に差し替える場合は dailyHoroscope() の戻り値を差し替えてください。
 */
import { jstDateStr } from "./time";

export const SIGNS = [
  { key: "aries", name: "牡羊座", char: "羊", range: "3/21〜4/19" },
  { key: "taurus", name: "牡牛座", char: "牛", range: "4/20〜5/20" },
  { key: "gemini", name: "双子座", char: "双", range: "5/21〜6/21" },
  { key: "cancer", name: "蟹座", char: "蟹", range: "6/22〜7/22" },
  { key: "leo", name: "獅子座", char: "獅", range: "7/23〜8/22" },
  { key: "virgo", name: "乙女座", char: "乙", range: "8/23〜9/22" },
  { key: "libra", name: "天秤座", char: "秤", range: "9/23〜10/23" },
  { key: "scorpio", name: "蠍座", char: "蠍", range: "10/24〜11/22" },
  { key: "sagittarius", name: "射手座", char: "射", range: "11/23〜12/21" },
  { key: "capricorn", name: "山羊座", char: "山", range: "12/22〜1/19" },
  { key: "aquarius", name: "水瓶座", char: "瓶", range: "1/20〜2/18" },
  { key: "pisces", name: "魚座", char: "魚", range: "2/19〜3/20" },
] as const;

const TOP = [
  "思い描いていたことが形になりやすい一日。迷っていた連絡は今日のうちに。",
  "あなたの言葉に周りが耳を傾けるとき。素直な気持ちを伝えると関係が深まります。",
  "直感が冴える日。ふと浮かんだアイデアはメモしておくと後で役立ちます。",
  "思いがけない嬉しい知らせが届きそう。笑顔で受け取ることで運気がさらに上昇。",
];
const MID = [
  "落ち着いて足元を固めると吉。いつもより少し早めの行動を心がけて。",
  "身近な人との会話にヒントが。聞き役に回ると新しい発見があります。",
  "小さな整理整頓が運気の通り道をつくります。机の上から始めてみて。",
  "無理に答えを出さなくても大丈夫。流れに任せることで良い方向へ進みます。",
  "丁寧な言葉づかいが信頼につながる日。メールやメッセージは読み返してから送信を。",
  "好きなものに触れて心を満たすと吉。お気に入りの香りや音楽で整えて。",
];
const LOW = [
  "疲れが出やすい日。予定を詰め込まず、早めに休むことが開運のカギです。",
  "焦りは禁物。今日は準備と見直しに時間を使うと、明日以降に実を結びます。",
  "人の言葉に揺れやすいとき。最終判断は一晩おいてからが安心です。",
];
const COLORS = ["ラベンダー", "藍色", "桜色", "若草色", "金茶", "生成り", "朱色", "水色", "山吹色", "白", "深緑", "銀鼠"];
const ITEMS = ["手帳", "ハンカチ", "温かいお茶", "香り袋", "手鏡", "お守り", "白いマグカップ", "栞", "ハンドクリーム", "和柄の小物", "季節の花", "腕時計"];

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface HoroscopeEntry {
  rank: number;
  sign: (typeof SIGNS)[number];
  message: string;
  color: string;
  item: string;
  love: number;
  work: number;
  money: number;
}

export function dailyHoroscope(date: string = jstDateStr()): HoroscopeEntry[] {
  const r = rng(Number(date.replace(/-/g, "")) * 2654435761);
  const order = SIGNS.map((s) => ({ s, k: r() })).sort((a, b) => a.k - b.k).map((x) => x.s);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(r() * arr.length)];
  // 同じ日に同じ文面が並ばないよう、各ランク帯の文面はシャッフルして順に割り当てる
  const deck = (arr: readonly string[]) => arr.map((m) => ({ m, k: r() })).sort((a, b) => a.k - b.k).map((x) => x.m);
  const decks = { top: deck(TOP), mid: deck(MID), low: deck(LOW) };
  return order.map((sign, i) => {
    const rank = i + 1;
    const base = rank <= 3 ? 4 : rank <= 9 ? 3 : 2;
    const star = () => Math.max(1, Math.min(5, base + Math.floor(r() * 3) - 1));
    return {
      rank,
      sign,
      message: rank <= 3 ? decks.top[i % decks.top.length] : rank <= 9 ? decks.mid[(i - 3) % decks.mid.length] : decks.low[(i - 9) % decks.low.length],
      color: pick(COLORS),
      item: pick(ITEMS),
      love: star(),
      work: star(),
      money: star(),
    };
  });
}
