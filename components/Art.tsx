/* オリジナルの和風イラスト素材（SVG）。実写素材に差し替える場合は管理画面から画像をアップロードしてください。 */
import React, { useId } from "react";

const svgId = (raw: string) => raw.replace(/[^a-zA-Z0-9_-]/g, "");
const petal5 = (r: number) => [0, 72, 144, 216, 288].map((a) => [Math.cos((a * Math.PI) / 180) * r, Math.sin((a * Math.PI) / 180) * r, a] as const);

/* ================= 占い師ポートレート（月あかりのシルエット） ================= */

type HairStyle = "long" | "updo" | "bob" | "lowbun" | "male";
type Deco = "fuji" | "crane" | "cloud" | "stars" | "sakura" | "momiji";
interface Variant { label: string; sky: [string, string]; moon: string; kimono: string; collar: string; eri: string; accent: string; hair: HairStyle; deco: Deco }

export const PORTRAITS: Variant[] = [
  { label: "藤・紫", sky: ["#1b1638", "#46306a"], moon: "#f7efd8", kimono: "#5b3a7a", collar: "#f3ead6", eri: "#c9a24a", accent: "#d9b867", hair: "long", deco: "fuji" },
  { label: "鶴・藍", sky: ["#0f2038", "#2b4f78"], moon: "#fbf3dc", kimono: "#1f3a5f", collar: "#f5efe2", eri: "#c23b3b", accent: "#d64545", hair: "updo", deco: "crane" },
  { label: "雲・白", sky: ["#2a0f1c", "#6a2440"], moon: "#fff4e6", kimono: "#e9e1d3", collar: "#ffffff", eri: "#b3262e", accent: "#c8303a", hair: "long", deco: "cloud" },
  { label: "星座・青", sky: ["#0b2033", "#1f5068"], moon: "#e9f3f7", kimono: "#2f5d7c", collar: "#eef4f7", eri: "#e0b85a", accent: "#e8c46a", hair: "bob", deco: "stars" },
  { label: "桜・若草", sky: ["#162a22", "#355e4a"], moon: "#f6f2dc", kimono: "#6f8f60", collar: "#f6f1e7", eri: "#e7a3b5", accent: "#efb3c3", hair: "lowbun", deco: "sakura" },
  { label: "雲・墨", sky: ["#0a0a16", "#25243f"], moon: "#f2eee0", kimono: "#2c2b40", collar: "#e9e6f2", eri: "#9d8fd0", accent: "#b3a6e6", hair: "long", deco: "cloud" },
  { label: "紅葉・柿", sky: ["#2a160e", "#7a4026"], moon: "#ffe6bd", kimono: "#b25a48", collar: "#fbf2e6", eri: "#2f4a3a", accent: "#e0703a", hair: "lowbun", deco: "momiji" },
  { label: "男性・松葉", sky: ["#101820", "#2e4153"], moon: "#eef0f0", kimono: "#33403a", collar: "#e8e6df", eri: "#8a6d3b", accent: "#b89a5a", hair: "male", deco: "cloud" },
  { label: "桜・梅紫", sky: ["#1f1430", "#563058"], moon: "#fdf0e6", kimono: "#8e3b5a", collar: "#fbf3ea", eri: "#f0c27b", accent: "#f2c983", hair: "updo", deco: "sakura" },
  { label: "雲・紺", sky: ["#0c1222", "#2a3358"], moon: "#fff7e0", kimono: "#232a46", collar: "#f1eee6", eri: "#c9a24a", accent: "#e2c06b", hair: "long", deco: "cloud" },
  { label: "星座・浅葱", sky: ["#0e1b29", "#244a5e"], moon: "#e8f0ff", kimono: "#34506b", collar: "#eef2f6", eri: "#d6c08f", accent: "#e3cf96", hair: "bob", deco: "stars" },
  { label: "紅葉・巫女", sky: ["#1e0c10", "#5a1a22"], moon: "#fff1df", kimono: "#f1ebe1", collar: "#ffffff", eri: "#c0283a", accent: "#d43a3a", hair: "lowbun", deco: "momiji" },
];

const FACE_F = "M90 64 C86 70 84 78 84 86 C84 90 82 92 82.5 94 C83 97 83 99 81 102 C78 107 75 111 74 113 C73.5 114.5 75 116 77 116.5 C78.5 117 79.5 117.5 79.5 118.5 C79 120 77.5 121 78 122.5 C78.5 123.5 80 124 80 124.5 C79 125.5 78.5 127 79.5 128.5 C80.5 130 82.5 130.5 83 131.5 C82 134 82 137 84 139.5 C86 142 90 143 94 143 C98 143 100 145 101 148 C102 156 103 166 104 182 L144 182 L141 138 C150 128 156 112 154 92 C152 70 138 56 118 54 C104 54 94 58 90 64 Z";
const FACE_M = "M88 62 C84 70 82 78 82 86 C82 90 80 92 80.5 95 C81 98 81 100 79 103 C76 108 72 113 71 115 C70.5 117 72 118.5 75 119 C77 119.5 78 120 78 121 C77.5 123 76.5 124 77 125.5 C77.5 126.5 79 127 79 127.5 C78 128.5 77.5 130 78.5 131.5 C79.5 133 81 133.5 81.5 134.5 C80.5 137 80.5 141 83 144 C86 147 92 148 97 147.5 C100 148 101 150 101.5 153 C102 160 103 168 104 182 L152 182 L150 136 C155 128 158 112 156 92 C154 68 138 54 116 53 C102 53 92 56 88 62 Z";
const HAIR: Record<HairStyle, string> = {
  long: "M86 72 C82 52 104 40 124 42 C150 44 166 64 164 96 C163 130 170 170 186 214 L196 240 L150 240 C150 214 146 180 140 150 C134 128 136 108 132 94 C122 84 104 74 96 78 C92 76 88 75 86 72 Z",
  updo: "M86 74 C80 54 100 38 122 39 C140 40 154 50 160 64 C172 56 188 64 186 80 C184 96 168 100 158 94 C160 112 154 128 146 140 C140 130 138 112 132 98 C122 86 104 76 96 80 C92 78 88 77 86 74 Z",
  bob: "M85 74 C80 52 102 40 124 42 C150 44 166 66 164 98 C163 118 166 134 170 146 C160 150 146 148 136 142 C134 126 136 110 132 96 C122 86 104 77 96 80 C91 79 87 77 85 74 Z",
  lowbun: "M86 73 C81 53 102 40 124 42 C148 44 162 62 160 92 C159 110 154 126 150 136 C162 132 176 140 176 154 C176 168 160 174 150 166 C146 160 146 150 146 142 C140 128 138 110 132 96 C122 86 104 76 96 80 C92 78 88 76 86 73 Z",
  male: "M86 70 C85 56 98 46 118 45 C140 44 156 54 159 74 C161 88 159 100 156 110 C153 104 150 98 146 96 C140 92 132 86 124 84 C114 80 106 76 98 76 C93 75 89 73 86 70 Z",
};
const BODY_F = "M104 170 C100 190 84 204 60 214 C46 220 38 230 34 240 L200 240 L200 226 C186 210 168 198 156 190 C148 184 146 170 146 156 Z";
const BODY_M = "M104 172 C98 190 80 204 52 214 C40 220 32 230 28 240 L200 240 L200 222 C188 206 170 194 158 186 C150 180 148 168 148 156 Z";
const INK = "#15131f";

function Flower({ x, y, r, fill, center = "#fff3c4" }: { x: number; y: number; r: number; fill: string; center?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {petal5(r).map(([cx, cy, a]) => <circle key={a} cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={(r * 0.84).toFixed(1)} fill={fill} />)}
      <circle r={(r * 0.5).toFixed(1)} fill={center} />
    </g>
  );
}

function PortraitDeco({ v }: { v: Variant }) {
  switch (v.deco) {
    case "fuji":
      return (
        <g>
          <path d="M0 6 C20 10 40 6 66 2" stroke="#3b2c4a" strokeWidth="1.4" fill="none" />
          {[[10, 46], [26, 64], [42, 40], [58, 54]].map(([x, len], i) => (
            <g key={i}>
              {Array.from({ length: 11 }, (_, j) => {
                const t = j / 10, w = 7 * (1 - t) + 1.5, top = 8 - i * 1.2;
                return <ellipse key={j} cx={(x + (j % 2 ? w * 0.45 : -w * 0.45)).toFixed(1)} cy={(top + 4 + t * len).toFixed(1)} rx={(2.4 - t).toFixed(2)} ry={(1.7 - t * 0.5).toFixed(2)} fill={j % 3 === 0 ? "#d7c3ef" : "#a98bd4"} opacity={(0.95 - t * 0.35).toFixed(2)} />;
              })}
              <path d={`M${x - 6} ${8 - i * 1.2 + 2} q6 -6 12 0 q-6 5 -12 0 Z`} fill="#4c6b3f" opacity=".8" />
            </g>
          ))}
        </g>
      );
    case "crane":
      return (
        <g transform="translate(18 34) scale(1.05)" opacity=".92" fill={v.moon}>
          <path d="M10 30 L30 22 L22 34 Z" /><path d="M30 22 L44 2 L36 28 Z" opacity=".85" /><path d="M30 22 L52 16 L38 30 Z" opacity=".7" />
          <path d="M22 34 L36 28 L46 36 L28 38 Z" opacity=".95" /><path d="M10 30 L0 16 L4 15 L12 28 Z" /><path d="M0 16 L-3 19 L3 17 Z" fill={v.accent} /><path d="M46 36 L56 26 L50 37 Z" opacity=".9" />
        </g>
      );
    case "cloud":
      return <path d="M8 168 h70 a7 7 0 0 0 0 -14 h-30 a6 6 0 0 1 0 -12 h44 a6 6 0 0 0 0 -12 h-60 a7 7 0 0 0 0 14 h18 a6 6 0 0 1 0 12 h-42 a6 6 0 0 0 0 12 Z" fill={v.moon} opacity=".16" />;
    case "stars": {
      const pts = [[20, 36], [42, 26], [58, 44], [40, 62], [24, 78]];
      return (
        <g>
          <path d={`M${pts.map((p) => p.join(" ")).join(" L")}`} fill="none" stroke={v.accent} strokeOpacity=".55" strokeWidth=".8" />
          {pts.map(([x, y]) => <circle key={x + "-" + y} cx={x} cy={y} r="1.9" fill={v.accent} />)}
        </g>
      );
    }
    case "sakura":
    case "momiji": {
      const pts = [[22, 40, 20], [48, 70, 80], [16, 104, 140], [40, 140, 200], [60, 30, 300], [28, 176, 30]];
      return (
        <g>
          {pts.map(([x, y, r]) => v.deco === "sakura" ? (
            <g key={x + "-" + y} transform={`translate(${x} ${y}) rotate(${r})`}>
              {petal5(3.4).map(([cx, cy, a]) => <ellipse key={a} cx={cx.toFixed(1)} cy={cy.toFixed(1)} rx="3" ry="2.2" fill="#f5c6d3" transform={`rotate(${a} ${cx.toFixed(1)} ${cy.toFixed(1)})`} />)}
              <circle r="1" fill="#e7849c" />
            </g>
          ) : (
            <path key={x + "-" + y} transform={`translate(${x} ${y}) rotate(${r}) scale(.7)`} fill="#e2673a" d="M0 -9 L2 -3 L8 -6 L4 0 L9 3 L2 3 L0 9 L-2 3 L-9 3 L-4 0 L-8 -6 L-2 -3 Z" />
          ))}
        </g>
      );
    }
  }
}

/** 占い師のイラスト。月を背にしたシルエットで、顔写真を使わずに雰囲気を伝えます。 */
export function Portrait({ variant = 0, className, title }: { variant?: number; className?: string; title?: string }) {
  const id = "pt" + svgId(useId());
  const v = PORTRAITS[((variant % PORTRAITS.length) + PORTRAITS.length) % PORTRAITS.length];
  const male = v.hair === "male";
  const face = male ? FACE_M : FACE_F;
  const body = male ? BODY_M : BODY_F;
  const stars = Array.from({ length: 18 }, (_, i) => [((i * 53 + variant * 17) % 190) + 5, ((i * 37 + variant * 11) % 120) + 6, (i % 3) * 0.35 + 0.5]);
  const [mx, my, mr] = [122, 96, 64];
  return (
    <svg viewBox="0 0 200 240" width="100%" height="100%" className={className} role="img" aria-label={title ?? "占い師のイラスト"} preserveAspectRatio="xMidYMid slice"
      style={{ background: `linear-gradient(180deg, ${v.sky[0]}, ${v.sky[1]})` }}>
      <defs>
        <pattern id={`${id}k`} width="14" height="7" patternUnits="userSpaceOnUse">
          {[6, 4, 2].map((r) => <path key={r} d={`M${7 - r} 7 A${r} ${r} 0 0 1 ${7 + r} 7`} fill="none" stroke="#fff" strokeOpacity=".13" strokeWidth=".7" />)}
          {[6, 4, 2].map((r) => <path key={"b" + r} d={`M${-r} 3.5 A${r} ${r} 0 0 1 ${r} 3.5 M${14 - r} 3.5 A${r} ${r} 0 0 1 ${14 + r} 3.5`} fill="none" stroke="#fff" strokeOpacity=".1" strokeWidth=".7" />)}
        </pattern>
        <clipPath id={`${id}m`}><circle cx={mx} cy={my} r={mr} /></clipPath>
        <radialGradient id={`${id}g`}><stop offset=".6" stopColor={v.moon} stopOpacity=".38" /><stop offset="1" stopColor={v.moon} stopOpacity="0" /></radialGradient>
      </defs>
      {stars.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity=".7" />)}
      <circle cx={mx} cy={my} r={mr + 40} fill={`url(#${id}g)`} />
      <circle cx={mx} cy={my} r={mr} fill={v.moon} />
      <circle cx={mx - 20} cy={my + 22} r="9" fill="#000" opacity=".04" />
      <circle cx={mx + 22} cy={my - 18} r="13" fill="#000" opacity=".035" />
      <PortraitDeco v={v} />
      <path d={face} fill="none" stroke={v.moon} strokeOpacity=".6" strokeWidth="3" clipPath={`url(#${id}m)`} />
      <path d={HAIR[v.hair]} fill="none" stroke={v.moon} strokeOpacity=".45" strokeWidth="3" clipPath={`url(#${id}m)`} />
      <path d={face} fill={INK} />
      <path d={body} fill={v.kimono} />
      <path d={body} fill={`url(#${id}k)`} />
      <path d={`M${male ? 150 : 142} 160 C${male ? 140 : 134} 178 118 194 92 208`} stroke={v.collar} strokeWidth="7" fill="none" />
      <path d={`M${male ? 155 : 147} 164 C${male ? 145 : 139} 184 123 200 98 213`} stroke={v.eri} strokeWidth="6" fill="none" />
      <path d={HAIR[v.hair]} fill={INK} />
      {male && (<><path d="M120 206 L124 228 M128 204 L131 226" stroke={v.accent} strokeWidth="1.6" /><circle cx="126" cy="214" r="3.4" fill={v.accent} /></>)}
      {v.hair === "updo" && (
        <g>
          <path d="M168 66 L196 52" stroke={v.accent} strokeWidth="2" />
          <Flower x={166} y={70} r={4.5} fill={v.accent} />
          <path d="M170 76 L171 92 M174 75 L176 89" stroke={v.accent} strokeWidth=".8" />
          <circle cx="171" cy="93" r="1.6" fill={v.accent} /><circle cx="176" cy="90" r="1.6" fill={v.accent} />
        </g>
      )}
      {(v.hair === "long" || v.hair === "bob") && <Flower x={140} y={60} r={3.6} fill={v.accent} />}
      {v.hair === "lowbun" && <path d="M142 150 C150 146 156 150 154 156 C150 160 144 158 142 150 Z M154 156 L164 170 M152 157 L158 172" fill={v.accent} stroke={v.accent} strokeWidth="1.6" />}
      <rect x="6" y="6" width="188" height="228" fill="none" stroke="#e8d5a3" strokeOpacity=".55" strokeWidth=".8" />
    </svg>
  );
}

/** チャットボット案内係（20代女性・浴衣）のイラスト */
export function GuideAvatar({ className, title = "案内係" }: { className?: string; title?: string }) {
  const id = "ga" + svgId(useId());
  const skin = "#fbe6da", hair = "#4b3024", hair2 = "#6d4636";
  return (
    <svg viewBox="0 0 200 240" width="100%" height="100%" className={className} role="img" aria-label={title} preserveAspectRatio="xMidYMid slice"
      style={{ background: "linear-gradient(180deg, #fff5f7, #f6d9e1)" }}>
      <defs>
        <radialGradient id={`${id}i`} cx="50%" cy="35%" r="65%"><stop offset="0" stopColor="#9a6a4a" /><stop offset=".6" stopColor="#5a3423" /><stop offset="1" stopColor="#2e1a12" /></radialGradient>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={hair2} /><stop offset="1" stopColor={hair} /></linearGradient>
        <pattern id={`${id}y`} width="28" height="28" patternUnits="userSpaceOnUse">
          <g transform="translate(8 8)">{petal5(3.6).map(([cx, cy, a]) => <ellipse key={a} cx={cx.toFixed(1)} cy={cy.toFixed(1)} rx="3.2" ry="2.3" fill="#fff" opacity=".85" transform={`rotate(${a} ${cx.toFixed(1)} ${cy.toFixed(1)})`} />)}<circle r="1.3" fill="#e46c8c" /></g>
          <g transform="translate(22 22) scale(.6)">{petal5(3.6).map(([cx, cy, a]) => <ellipse key={a} cx={cx.toFixed(1)} cy={cy.toFixed(1)} rx="3.2" ry="2.3" fill="#c94f6d" opacity=".55" transform={`rotate(${a} ${cx.toFixed(1)} ${cy.toFixed(1)})`} />)}</g>
        </pattern>
      </defs>
      <circle cx="150" cy="56" r="40" fill="#fff" opacity=".7" />
      {[[24, 30, 20], [172, 44, 120], [30, 150, 250], [176, 170, 60], [150, 18, 300]].map(([x, y, r]) => <ellipse key={x} cx={x} cy={y} rx="5" ry="3" fill="#f2a9bd" opacity=".75" transform={`rotate(${r} ${x} ${y})`} />)}
      <path d="M52 92 C46 52 70 30 100 30 C130 30 154 52 148 92 L154 196 C140 206 120 208 100 208 C80 208 60 206 46 196 Z" fill={`url(#${id}h)`} />
      <path d="M89 136 L111 136 L113 172 L87 172 Z" fill={skin} />
      <path d="M89 142 C94 150 106 150 111 142 L111 152 C104 158 96 158 89 152 Z" fill="#e9c2b2" opacity=".7" />
      <path d="M18 240 C22 198 54 178 100 174 C146 178 178 198 182 240 Z" fill="#f2b2c4" />
      <path d="M18 240 C22 198 54 178 100 174 C146 178 178 198 182 240 Z" fill={`url(#${id}y)`} />
      <path d="M78 176 L100 226 L122 176 L114 174 L100 206 L86 174 Z" fill="#fff8f4" />
      <path d="M86 174 L100 206 L104 198 L92 173 Z" fill={skin} />
      <path d="M72 178 L100 236 L104 236 L80 176 Z" fill="#c94f6d" opacity=".9" />
      <path d="M128 178 L100 236 L96 236 L120 176 Z" fill="#c94f6d" opacity=".9" />
      <rect x="44" y="230" width="112" height="10" fill="#e8b84a" />
      <path d="M66 100 C66 72 82 60 100 60 C118 60 134 72 134 100 C134 124 122 142 100 146 C78 142 66 124 66 100 Z" fill={skin} />
      <ellipse cx="64" cy="106" rx="5" ry="8" fill={skin} /><ellipse cx="136" cy="106" rx="5" ry="8" fill={skin} />
      <path d="M62 100 C58 64 76 44 100 44 C124 44 142 64 138 100 C134 86 128 80 122 76 C118 86 108 90 100 84 C94 90 82 92 78 82 C72 86 66 92 62 100 Z" fill={`url(#${id}h)`} />
      <path d="M64 96 C60 120 62 140 70 156 L76 154 C70 136 70 116 72 98 Z" fill={`url(#${id}h)`} />
      <path d="M136 96 C140 120 138 140 130 156 L124 154 C130 136 130 116 128 98 Z" fill={`url(#${id}h)`} />
      <path d="M76 56 C90 48 112 48 126 56" stroke="#fff" strokeOpacity=".35" strokeWidth="3" fill="none" />
      <path d="M78 98 Q85 94 92 97" stroke={hair} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M108 97 Q115 94 122 98" stroke={hair} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <ellipse cx="86" cy="110" rx="6.4" ry="7.6" fill={`url(#${id}i)`} />
      <ellipse cx="114" cy="110" rx="6.4" ry="7.6" fill={`url(#${id}i)`} />
      <circle cx="88.2" cy="107" r="2.1" fill="#fff" /><circle cx="116.2" cy="107" r="2.1" fill="#fff" />
      <circle cx="84" cy="113" r="1" fill="#fff" opacity=".8" /><circle cx="112" cy="113" r="1" fill="#fff" opacity=".8" />
      <path d="M78 105 C81 100 90 99 94 103" stroke="#2a1812" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M106 103 C110 99 119 100 122 105" stroke="#2a1812" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M80 118 Q86 120 92 118" stroke="#c99b8a" strokeWidth=".8" fill="none" /><path d="M108 118 Q114 120 120 118" stroke="#c99b8a" strokeWidth=".8" fill="none" />
      <path d="M99 120 Q100 123 101.5 122" stroke="#d6a594" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M93 130 Q100 136 107 130 Q100 133 93 130 Z" fill="#d9707f" stroke="#c45b6a" strokeWidth="1" />
      <ellipse cx="78" cy="123" rx="7" ry="3.6" fill="#f3a3b0" opacity=".28" /><ellipse cx="122" cy="123" rx="7" ry="3.6" fill="#f3a3b0" opacity=".28" />
      <g transform="translate(128 66)">
        {petal5(5).map(([cx, cy, a]) => <ellipse key={a} cx={cx.toFixed(1)} cy={cy.toFixed(1)} rx="4.6" ry="3.4" fill="#f7c1cf" stroke="#e48aa2" strokeWidth=".6" transform={`rotate(${a} ${cx.toFixed(1)} ${cy.toFixed(1)})`} />)}
        <circle r="2" fill="#e8b84a" />
      </g>
    </svg>
  );
}

export function TellerImage({ teller, className }: { teller: { imageUrl?: string; portrait: number; name: string }; className?: string }) {
  if (teller.imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={teller.imageUrl} alt={teller.name} className={className} style={{ objectFit: "cover" }} />;
  }
  return <Portrait variant={teller.portrait} className={className} title={teller.name} />;
}

/* ================= アイコン類 ================= */

const iconProps = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** 相談内容のアイコン（線画） */
export function TopicIcon({ name, size = 40 }: { name: string; size?: number }) {
  const p: Record<string, React.ReactNode> = {
    恋愛: <path d="M24 38 C10 29 6 22 6 16 C6 11 10 7 15 7 C19 7 22 9.5 24 13 C26 9.5 29 7 33 7 C38 7 42 11 42 16 C42 22 38 29 24 38 Z" />,
    片思い: <><path d="M20 36 C9 28 6 22 6 17 C6 12.5 9.5 9 14 9 C17 9 19 11 20.5 13.5 C22 11 24 9 27 9 C31.5 9 35 12.5 35 17 C35 22 32 28 20 36 Z" /><path d="M30 26 L43 13 M43 13 L37 13 M43 13 L43 19" /></>,
    復縁: <><path d="M17 33 C8 27 5 22 5 17 C5 13 8 10 12 10 C15 10 17 12 18 14 C19 12 21 10 24 10 C27 10 30 12.5 30 16" /><path d="M31 38 C22 32 19 27 19 22 C19 18 22 15 26 15 C29 15 31 17 32 19 C33 17 35 15 38 15 C42 15 45 18 45 22 C45 27 42 32 31 38 Z" /></>,
    結婚: <><circle cx="18" cy="27" r="10" /><circle cx="30" cy="27" r="10" /><path d="M14 11 L18 15 L22 11 M18 15 L18 17" /></>,
    仕事: <><rect x="6" y="15" width="36" height="24" /><path d="M17 15 L17 10 L31 10 L31 15 M6 25 L42 25 M22 25 L22 29 L26 29 L26 25" /></>,
    人間関係: <><circle cx="16" cy="15" r="6" /><circle cx="32" cy="15" r="6" /><path d="M5 40 C5 30 10 25 16 25 C22 25 27 30 27 40 M21 40 C21 30 26 25 32 25 C38 25 43 30 43 40" /></>,
    金運: <><circle cx="24" cy="24" r="17" /><circle cx="24" cy="24" r="5.5" /><path d="M24 7 L24 11 M24 37 L24 41 M7 24 L11 24 M37 24 L41 24" /></>,
    人生の転機: <><path d="M24 42 L24 20 M24 20 L10 8 M24 20 L38 8" /><path d="M10 8 L10 15 M10 8 L17 8 M38 8 L31 8 M38 8 L38 15" /></>,
    家庭: <><path d="M6 22 L24 7 L42 22 M11 18 L11 40 L37 40 L37 18" /><path d="M20 40 L20 29 L28 29 L28 40" /></>,
    相性: <><circle cx="17" cy="24" r="11" /><circle cx="31" cy="24" r="11" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" {...iconProps}>{p[name] ?? <circle cx="24" cy="24" r="16" />}</svg>;
}

/** 占術のエンブレム（家紋風） */
export function MethodIcon({ name, size = 56 }: { name: string; size?: number }) {
  const s: Record<string, React.ReactNode> = {
    タロット: <><rect x="17" y="14" width="22" height="32" transform="rotate(-12 28 30)" /><rect x="25" y="14" width="22" height="32" transform="rotate(10 36 30)" /><path d="M36 22 L37.8 27 L43 27.3 L39 30.6 L40.4 35.6 L36 32.7 L31.6 35.6 L33 30.6 L29 27.3 L34.2 27 Z" /></>,
    西洋占星術: <><circle cx="32" cy="32" r="20" /><circle cx="32" cy="32" r="12" />{Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return <path key={i} d={`M${(32 + Math.cos(a) * 12).toFixed(1)} ${(32 + Math.sin(a) * 12).toFixed(1)} L${(32 + Math.cos(a) * 20).toFixed(1)} ${(32 + Math.sin(a) * 20).toFixed(1)}`} />; })}<circle cx="32" cy="32" r="2.4" fill="currentColor" /></>,
    四柱推命: <><path d="M14 18 L50 18 M16 50 L48 50" />{[20, 28, 36, 44].map((x) => <rect key={x} x={x - 2.5} y="22" width="5" height="24" />)}<path d="M12 14 L52 14" /></>,
    霊視: <><path d="M10 32 C18 20 46 20 54 32 C46 44 18 44 10 32 Z" /><circle cx="32" cy="32" r="7" /><circle cx="32" cy="32" r="2.5" fill="currentColor" /><path d="M32 8 L32 14 M14 14 L18 19 M50 14 L46 19" /></>,
    九星気学: <><rect x="14" y="14" width="36" height="36" />{[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={20 + c * 12} cy={20 + r * 12} r={r === 1 && c === 1 ? 3.6 : 2.4} fill={r === 1 && c === 1 ? "currentColor" : "none"} />))}</>,
    数秘術: <><circle cx="32" cy="32" r="20" /><text x="32" y="40" textAnchor="middle" fontSize="22" fontFamily="'Cormorant Garamond', serif" fill="currentColor" stroke="none">7</text><path d="M32 8 L32 12 M32 52 L32 56" /></>,
    周易: <>{[0, 1, 2, 3, 4, 5].map((i) => i % 3 === 1 ? <path key={i} d={`M16 ${16 + i * 6.4} L28 ${16 + i * 6.4} M36 ${16 + i * 6.4} L48 ${16 + i * 6.4}`} strokeWidth="3" /> : <path key={i} d={`M16 ${16 + i * 6.4} L48 ${16 + i * 6.4}`} strokeWidth="3" />)}</>,
    風水: <><path d="M32 10 L47.6 16.4 L54 32 L47.6 47.6 L32 54 L16.4 47.6 L10 32 L16.4 16.4 Z" /><circle cx="32" cy="32" r="9" /><path d="M32 23 A4.5 4.5 0 0 1 32 32 A4.5 4.5 0 0 0 32 41" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" {...iconProps}>{s[name] ?? <circle cx="32" cy="32" r="20" />}</svg>;
}

/** ランキングの冠 */
export function Crown({ rank, size = 34 }: { rank: number; size?: number }) {
  const fill = rank === 1 ? "#c9a24a" : rank === 2 ? "#a7adb8" : rank === 3 ? "#b0764a" : "#c9c5bb";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-label={`${rank}位`}>
      <path d="M5 30 L3 12 L13 20 L20 7 L27 20 L37 12 L35 30 Z" fill={fill} />
      <rect x="5" y="31" width="30" height="4" fill={fill} />
      <text x="20" y="28" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="'Cormorant Garamond', serif">{rank}</text>
    </svg>
  );
}

/** 星座のエンブレム（漢字一文字の家紋風） */
export function SignEmblem({ char, size = 48, color = "#1f2a4d" }: { char: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="none" stroke={color} strokeWidth="1.2" />
      <circle cx="24" cy="24" r="18.5" fill="none" stroke={color} strokeWidth=".6" strokeDasharray="1.5 2.2" />
      <text x="24" y="30.5" textAnchor="middle" fontSize="18" fill={color} fontFamily="'Noto Serif JP', serif">{char}</text>
    </svg>
  );
}

/** 月相アイコン（月齢から明るい部分を描画） */
export function MoonPhaseIcon({ age, size = 64 }: { age: number; size?: number }) {
  const r = 28, c = 32;
  const theta = (age / 29.530588) * 2 * Math.PI;
  const rx = Math.abs(Math.cos(theta)) * r;
  const waxing = age < 29.530588 / 2;
  const gibbous = Math.cos(theta) < 0;
  const outer = waxing ? 1 : 0; // 右半分（満ちていく）／左半分（欠けていく）
  const term = waxing ? (gibbous ? 1 : 0) : (gibbous ? 0 : 1);
  const d = `M${c} ${c - r} A${r} ${r} 0 0 ${outer} ${c} ${c + r} A${rx.toFixed(2)} ${r} 0 0 ${term} ${c} ${c - r} Z`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx={c} cy={c} r={r} fill="#2a3158" />
      <path d={d} fill="#fdf1c7" />
      <circle cx={c} cy={c} r={r} fill="none" stroke="#c9a24a" strokeOpacity=".5" />
    </svg>
  );
}

/** お知らせ・イベント等のカバー画像（画像未設定時の代替） */
export function Banner({ seed = 0, className }: { seed?: number; className?: string }) {
  const k = Math.abs(seed) % 4;
  const bgs = ["#1f2a4d", "#f4ece1", "#2d1f3d", "#e9f0f2"];
  return (
    <svg viewBox="0 0 400 240" width="100%" height="100%" className={className} preserveAspectRatio="xMidYMid slice" role="img" aria-label="和柄バナー">
      <defs>
        <pattern id={`sg${seed}`} width="40" height="20" patternUnits="userSpaceOnUse">
          {[18, 13, 8].map((r) => <path key={r} d={`M${20 - r} 20 A${r} ${r} 0 0 1 ${20 + r} 20`} fill="none" stroke={k % 2 ? "#c9a24a" : "#ffffff"} strokeOpacity="0.25" strokeWidth="1.2" />)}
          {[18, 13, 8].map((r) => <path key={"b" + r} d={`M${-r} 10 A${r} ${r} 0 0 1 ${r} 10 M${40 - r} 10 A${r} ${r} 0 0 1 ${40 + r} 10`} fill="none" stroke={k % 2 ? "#c9a24a" : "#ffffff"} strokeOpacity="0.18" strokeWidth="1.2" />)}
        </pattern>
      </defs>
      <rect width="400" height="240" fill={bgs[k]} />
      <rect width="400" height="240" fill={`url(#sg${seed})`} />
      {k === 0 && (<><circle cx="290" cy="90" r="48" fill="#fdf3cf" /><circle cx="310" cy="78" r="44" fill="#1f2a4d" /></>)}
      {k === 1 && (<g transform="translate(200 120)">{petal5(34).map(([x, y, a]) => <ellipse key={a} cx={x} cy={y} rx="30" ry="24" fill="#e8a0b4" opacity="0.85" transform={`rotate(${a + 90} ${x} ${y})`} />)}<circle r="12" fill="#c9a24a" /></g>)}
      {k === 2 && (<g transform="translate(200 50)"><rect x="-4" y="-50" width="8" height="30" fill="#7d6b4a" /><ellipse cx="0" cy="40" rx="40" ry="56" fill="#d8443c" /><rect x="-30" y="-20" width="60" height="8" fill="#2a1a1a" /><rect x="-30" y="92" width="60" height="8" fill="#2a1a1a" /><text x="0" y="50" textAnchor="middle" fontSize="28" fill="#fff" fontFamily="serif">占</text></g>)}
      {k === 3 && (<g fill="none" stroke="#2f5d7c" strokeWidth="2">{[0, 1, 2, 3, 4].map((i) => <circle key={i} cx="200" cy="120" r={20 + i * 18} strokeOpacity={1 - i * 0.18} />)}<path d="M200 20 L200 220 M100 120 L300 120" strokeOpacity="0.3" /></g>)}
    </svg>
  );
}

/** 麻の葉・青海波の帯 */
export function PatternBand({ kind = "seigaiha", color = "#1f2a4d", className }: { kind?: "seigaiha" | "asanoha"; color?: string; className?: string }) {
  const id = `pb-${kind}-${svgId(useId())}`;
  return (
    <svg className={className} width="100%" height="100%" aria-hidden="true">
      <defs>
        {kind === "seigaiha" ? (
          <pattern id={id} width="40" height="20" patternUnits="userSpaceOnUse">
            {[18, 13, 8, 3].map((r) => <path key={r} d={`M${20 - r} 20 A${r} ${r} 0 0 1 ${20 + r} 20`} fill="none" stroke={color} strokeOpacity="0.14" />)}
            {[18, 13, 8, 3].map((r) => <path key={"b" + r} d={`M${-r} 10 A${r} ${r} 0 0 1 ${r} 10 M${40 - r} 10 A${r} ${r} 0 0 1 ${40 + r} 10`} fill="none" stroke={color} strokeOpacity="0.1" />)}
          </pattern>
        ) : (
          <pattern id={id} width="30" height="52" patternUnits="userSpaceOnUse">
            <path d="M15 0 L15 52 M0 8.66 L30 43.3 M30 8.66 L0 43.3 M15 0 L0 26 L15 52 L30 26 Z" fill="none" stroke={color} strokeOpacity="0.12" />
          </pattern>
        )}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

export function MoonMark({ size = 28 }: { size?: number }) {
  const id = "mm" + svgId(useId());
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <mask id={id}><rect width="32" height="32" fill="#fff" /><circle cx="21" cy="12" r="11" fill="#000" /></mask>
      <circle cx="16" cy="16" r="13" fill="#c9a24a" mask={`url(#${id})`} />
      <circle cx="24" cy="23" r="1.4" fill="#c9a24a" />
    </svg>
  );
}
