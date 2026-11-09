/**
 * 月相の計算。新月・満月の時刻は J. Meeus『Astronomical Algorithms』第49章の式
 * （主要な補正項のみ）で求めるため、誤差は数分程度です。
 */
export const SYNODIC = 29.530588861;

const rad = (deg: number) => (deg * Math.PI) / 180;
const jdToDate = (jd: number) => new Date((jd - 2440587.5) * 86400000);
const dateToJd = (d: Date) => d.getTime() / 86400000 + 2440587.5;

/** k 番目の新月（full=true なら満月）の時刻。k=0 は 2000年1月6日の新月 */
function phaseTime(k: number, full: boolean): Date {
  const kk = full ? k + 0.5 : k;
  const T = kk / 1236.85;
  let jde = 2451550.09766 + SYNODIC * kk + 0.00015437 * T * T - 0.00000015 * T ** 3 + 0.00000000073 * T ** 4;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const M = rad(2.5534 + 29.1053567 * kk - 0.0000014 * T * T - 0.00000011 * T ** 3);
  const Mp = rad(201.5643 + 385.81693528 * kk + 0.0107582 * T * T + 0.00001238 * T ** 3 - 0.000000058 * T ** 4);
  const F = rad(160.7108 + 390.67050284 * kk - 0.0016118 * T * T - 0.00000227 * T ** 3 + 0.000000011 * T ** 4);
  const O = rad(124.7746 - 1.56375588 * kk + 0.0020672 * T * T + 0.00000215 * T ** 3);
  const c = full
    ? [-0.40614, 0.17302, 0.01614, 0.01043, 0.00734, -0.00515, 0.00209]
    : [-0.4072, 0.17241, 0.01608, 0.01039, 0.00739, -0.00514, 0.00208];
  jde +=
    c[0] * Math.sin(Mp) + c[1] * E * Math.sin(M) + c[2] * Math.sin(2 * Mp) + c[3] * Math.sin(2 * F) +
    c[4] * E * Math.sin(Mp - M) + c[5] * E * Math.sin(Mp + M) + c[6] * E * E * Math.sin(2 * M) -
    0.00111 * Math.sin(Mp - 2 * F) - 0.00057 * Math.sin(Mp + 2 * F) + 0.00056 * E * Math.sin(2 * Mp + M) -
    0.00042 * Math.sin(3 * Mp) + 0.00042 * E * Math.sin(M + 2 * F) + 0.00038 * E * Math.sin(M - 2 * F) -
    0.00024 * E * Math.sin(2 * Mp - M) - 0.00017 * Math.sin(O);
  return jdToDate(jde - 69 / 86400); // 力学時 → 世界時（ΔT ≈ 69秒）
}

const kNear = (d: Date) => Math.floor((dateToJd(d) - 2451550.09766) / SYNODIC);

/** d 以前で最も近い新月 */
function lastNewMoon(d: Date): { at: Date; k: number } {
  let k = kNear(d) + 1;
  while (phaseTime(k, false) > d) k--;
  return { at: phaseTime(k, false), k };
}

/** 月齢（直前の新月からの経過日数） */
export function moonAge(d: Date = new Date()): number {
  return (d.getTime() - lastNewMoon(d).at.getTime()) / 86400000;
}

const NAMES = ["新月", "三日月", "上弦の月", "十三夜月", "満月", "十六夜月", "下弦の月", "有明月"];
const NOTES = [
  "新しいことを始める・願いを決めるのに向いた日",
  "小さな一歩を踏み出し、育てていく時期",
  "行動と見直しのバランスをとる節目",
  "満ちていく流れに乗って仕上げに向かう時期",
  "感謝を伝え、手放すものを見極める日",
  "得たものを味わい、分かち合う時期",
  "整理整頓・不要なものを手放す節目",
  "静かに振り返り、次の新月に備える時期",
];

export function moonPhase(d: Date = new Date()) {
  const { at, k } = lastNewMoon(d);
  const lunation = (phaseTime(k + 1, false).getTime() - at.getTime()) / 86400000;
  const age = (d.getTime() - at.getTime()) / 86400000;
  const idx = Math.round((age / lunation) * 8) % 8;
  return { age, name: NAMES[idx], note: NOTES[idx] };
}

/** from より後に来る次の新月／満月の時刻 */
export function nextPhase(kind: "new" | "full", from: Date = new Date()): Date {
  let k = kNear(from) - 1;
  while (phaseTime(k, kind === "full") <= from) k++;
  return phaseTime(k, kind === "full");
}
