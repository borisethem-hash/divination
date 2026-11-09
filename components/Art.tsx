/* オリジナルの和風イラスト素材（SVG）。実写素材に差し替える場合は管理画面から画像をアップロードしてください。 */
import React from "react";

type Hair = "long" | "bun" | "bob" | "male";
const VARIANTS: { bg: string; hair: string; kimono: string; accent: string; skin: string; style: Hair; eyes: "open" | "smile" }[] = [
  { bg: "#efe9f5", hair: "#2b2233", kimono: "#5b3a7a", accent: "#c9a24a", skin: "#f6e1d3", style: "long", eyes: "open" },
  { bg: "#f3ede4", hair: "#3a2a22", kimono: "#1f3a5f", accent: "#b8433b", skin: "#f3dccb", style: "bun", eyes: "smile" },
  { bg: "#f6ecef", hair: "#1c1c22", kimono: "#f4f1ec", accent: "#b3262e", skin: "#f7e4d8", style: "long", eyes: "smile" },
  { bg: "#e8eef5", hair: "#4a3426", kimono: "#2f5d7c", accent: "#e0b85a", skin: "#f5dfcf", style: "bob", eyes: "open" },
  { bg: "#eef4ec", hair: "#5a3d2b", kimono: "#7a9a6b", accent: "#d98c9a", skin: "#f7e3d5", style: "bun", eyes: "open" },
  { bg: "#ece9f2", hair: "#141418", kimono: "#2a2a3a", accent: "#8f7fc0", skin: "#f2dccd", style: "long", eyes: "open" },
  { bg: "#f7efe6", hair: "#3b2618", kimono: "#c46a5a", accent: "#2f4a3a", skin: "#f6e0d0", style: "bob", eyes: "smile" },
  { bg: "#eceff1", hair: "#22242a", kimono: "#3d4a3e", accent: "#8a6d3b", skin: "#eed6c4", style: "male", eyes: "open" },
  // 8: チャットボット案内係（20代女性・浴衣）
  { bg: "#fbeef0", hair: "#6b4a35", kimono: "#f2b8c6", accent: "#c94f6d", skin: "#f8e6da", style: "bob", eyes: "smile" },
];

export function Portrait({ variant = 0, className, title }: { variant?: number; className?: string; title?: string }) {
  const v = VARIANTS[((variant % VARIANTS.length) + VARIANTS.length) % VARIANTS.length];
  const gid = `pg${variant}`;
  const male = v.style === "male";
  const collar = v.kimono === "#f4f1ec" ? "#b3262e" : "#ffffff";
  return (
    <svg viewBox="0 0 200 240" width="100%" height="100%" className={className} role="img" aria-label={title ?? "占い師のイラスト"} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={gid} cx="70%" cy="25%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor={v.bg} />
        </radialGradient>
        <pattern id={`${gid}k`} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 16 A8 8 0 0 1 16 16 M4 16 A4 4 0 0 1 12 16" fill="none" stroke={v.accent} strokeOpacity="0.35" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="200" height="240" fill={`url(#${gid})`} />
      <circle cx="156" cy="44" r="22" fill="#fff8e1" opacity="0.9" />
      <circle cx="164" cy="38" r="20" fill={v.bg} opacity="0.85" />
      {/* 後ろ髪 */}
      {v.style === "long" && <path d="M54 104 Q46 38 100 42 Q154 38 146 104 L152 206 Q100 216 48 206 Z" fill={v.hair} />}
      {v.style === "bun" && (<><circle cx="100" cy="44" r="22" fill={v.hair} /><path d="M58 112 Q54 50 100 52 Q146 50 142 112 Z" fill={v.hair} /></>)}
      {v.style === "bob" && <path d="M54 142 Q46 48 100 48 Q154 48 146 142 Q128 150 122 132 L78 132 Q72 150 54 142 Z" fill={v.hair} />}
      {male && <path d="M60 98 Q58 48 100 50 Q142 48 140 98 Z" fill={v.hair} />}
      {/* 首・着物 */}
      <rect x="87" y="136" width="26" height="44" fill={v.skin} />
      <path d="M14 240 Q24 182 100 170 Q176 182 186 240 Z" fill={v.kimono} />
      <path d="M14 240 Q24 182 100 170 Q176 182 186 240 Z" fill={`url(#${gid}k)`} />
      <path d="M76 174 L100 226 L124 174 L115 172 L100 206 L85 172 Z" fill={collar} />
      <path d="M85 172 L100 206 L106 194 Z" fill={v.skin} opacity="0.6" />
      {!male && <rect x="40" y="228" width="120" height="12" fill={v.accent} />}
      {male && <path d="M98 206 L102 206 L104 240 L96 240 Z" fill={v.accent} opacity="0.6" />}
      {/* 顔 */}
      <ellipse cx="100" cy="104" rx="37" ry="45" fill={v.skin} />
      <ellipse cx="62" cy="108" rx="5" ry="8" fill={v.skin} />
      <ellipse cx="138" cy="108" rx="5" ry="8" fill={v.skin} />
      {/* 前髪 */}
      {male ? (
        <path d="M62 96 Q60 54 100 54 Q140 54 138 96 Q130 74 112 72 Q98 82 82 74 Q68 80 62 96 Z" fill={v.hair} />
      ) : (
        <path d="M62 104 Q58 54 100 55 Q142 54 138 104 Q128 80 114 76 Q100 94 80 80 Q68 88 62 104 Z" fill={v.hair} />
      )}
      {v.style === "long" && (<><path d="M62 100 Q58 150 66 176 L56 178 Q50 140 54 104 Z" fill={v.hair} /><path d="M138 100 Q142 150 134 176 L144 178 Q150 140 146 104 Z" fill={v.hair} /></>)}
      {/* 目・眉・口 */}
      <path d={male ? "M78 92 L94 90" : "M79 94 Q86 90 93 93"} stroke={v.hair} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d={male ? "M106 90 L122 92" : "M107 93 Q114 90 121 94"} stroke={v.hair} strokeWidth="2" fill="none" strokeLinecap="round" />
      {v.eyes === "open" ? (
        <>
          <ellipse cx="86" cy="107" rx="4.5" ry="5.5" fill="#2a1f22" />
          <ellipse cx="114" cy="107" rx="4.5" ry="5.5" fill="#2a1f22" />
          <circle cx="87.5" cy="105" r="1.4" fill="#fff" />
          <circle cx="115.5" cy="105" r="1.4" fill="#fff" />
        </>
      ) : (
        <>
          <path d="M80 108 Q86 102 92 108" stroke="#2a1f22" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M108 108 Q114 102 120 108" stroke="#2a1f22" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      )}
      {!male && (<><ellipse cx="78" cy="120" rx="7" ry="4" fill="#ef9aa6" opacity="0.35" /><ellipse cx="122" cy="120" rx="7" ry="4" fill="#ef9aa6" opacity="0.35" /></>)}
      <path d="M93 128 Q100 133 107 128" stroke={male ? "#9b6b5e" : "#c45b6a"} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* かんざし */}
      {!male && (
        <g transform="translate(134 70)">
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 5} cy={Math.sin((a * Math.PI) / 180) * 5} r="4.2" fill={v.accent} opacity="0.9" />
          ))}
          <circle r="2.6" fill="#fff4c2" />
          <path d="M2 6 L8 22" stroke={v.accent} strokeWidth="1.5" />
          <circle cx="8" cy="24" r="2" fill={v.accent} />
        </g>
      )}
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

/** トップのメインビジュアル：月夜・鳥居・山並み・桜 */
export function HeroScene({ className }: { className?: string }) {
  const stars = Array.from({ length: 60 }, (_, i) => ({ x: (i * 197) % 1200, y: (i * 89) % 260, r: (i % 3) * 0.5 + 0.6 }));
  const petals = Array.from({ length: 18 }, (_, i) => ({ x: (i * 131) % 1200, y: 60 + ((i * 53) % 340), rot: (i * 47) % 360 }));
  return (
    <svg viewBox="0 0 1200 520" width="100%" height="100%" className={className} preserveAspectRatio="xMidYMid slice" role="img" aria-label="月夜の鳥居">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141a3a" />
          <stop offset="60%" stopColor="#2c2f63" />
          <stop offset="100%" stopColor="#5a4a7c" />
        </linearGradient>
        <radialGradient id="moonglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff6d6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff6d6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="520" fill="url(#sky)" />
      {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.4 + (i % 5) * 0.12} />)}
      <circle cx="860" cy="150" r="170" fill="url(#moonglow)" />
      <circle cx="860" cy="150" r="78" fill="#fdf3cf" />
      <circle cx="838" cy="132" r="10" fill="#f1e2b0" opacity="0.6" />
      <circle cx="880" cy="172" r="14" fill="#f1e2b0" opacity="0.5" />
      <path d="M0 360 Q160 250 320 330 T640 300 T960 320 T1200 290 L1200 520 L0 520 Z" fill="#3b3466" opacity="0.8" />
      <path d="M0 400 Q200 320 420 380 T860 360 T1200 370 L1200 520 L0 520 Z" fill="#231f45" />
      {/* 鳥居 */}
      <g transform="translate(250 230)" fill="#b8323a">
        <path d="M-20 0 Q120 -22 260 0 L262 14 Q120 -6 -22 14 Z" />
        <rect x="0" y="22" width="220" height="12" />
        <rect x="104" y="14" width="12" height="20" />
        <rect x="30" y="14" width="18" height="190" />
        <rect x="172" y="14" width="18" height="190" />
        <rect x="24" y="196" width="30" height="10" fill="#7d1f26" />
        <rect x="166" y="196" width="30" height="10" fill="#7d1f26" />
      </g>
      {/* 水面 */}
      <rect y="440" width="1200" height="80" fill="#1a1736" />
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={760 + ((i * 37) % 200)} y={450 + i * 5} width={40 + ((i * 23) % 80)} height="1.6" fill="#fdf3cf" opacity={0.5 - i * 0.03} />
      ))}
      {petals.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx="6" ry="3.4" fill="#f7c6d4" opacity="0.8" transform={`rotate(${p.rot} ${p.x} ${p.y})`} />
      ))}
      {/* 桜の枝 */}
      <path d="M1200 30 Q1080 60 1010 120 M1090 70 Q1060 40 1030 44" stroke="#3a2a30" strokeWidth="6" fill="none" />
      {[[1010, 120], [1030, 44], [1060, 90], [1110, 60], [1150, 44], [1045, 105]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 8} cy={Math.sin((a * Math.PI) / 180) * 8} r="7" fill="#f9d3de" />)}
          <circle r="3" fill="#e88aa3" />
        </g>
      ))}
    </svg>
  );
}

/** お知らせ・イベント等のカバー画像 */
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
      {k === 1 && (<g transform="translate(200 120)">{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={Math.cos((a * Math.PI) / 180) * 34} cy={Math.sin((a * Math.PI) / 180) * 34} rx="30" ry="24" fill="#e8a0b4" opacity="0.85" transform={`rotate(${a + 90} ${Math.cos((a * Math.PI) / 180) * 34} ${Math.sin((a * Math.PI) / 180) * 34})`} />)}<circle r="12" fill="#c9a24a" /></g>)}
      {k === 2 && (<g transform="translate(200 50)"><rect x="-4" y="-50" width="8" height="30" fill="#7d6b4a" /><ellipse cx="0" cy="40" rx="40" ry="56" fill="#d8443c" /><ellipse cx="0" cy="40" rx="40" ry="56" fill="none" stroke="#3a1a1a" strokeOpacity="0.3" strokeWidth="1" /><rect x="-30" y="-20" width="60" height="8" fill="#2a1a1a" /><rect x="-30" y="92" width="60" height="8" fill="#2a1a1a" /><text x="0" y="50" textAnchor="middle" fontSize="28" fill="#fff" fontFamily="serif">占</text></g>)}
      {k === 3 && (<g fill="none" stroke="#2f5d7c" strokeWidth="2">{[0, 1, 2, 3, 4].map((i) => <circle key={i} cx="200" cy="120" r={20 + i * 18} strokeOpacity={1 - i * 0.18} />)}<path d="M200 20 L200 220 M100 120 L300 120" strokeOpacity="0.3" /></g>)}
    </svg>
  );
}

/** 麻の葉・青海波の帯 */
export function PatternBand({ kind = "seigaiha", color = "#1f2a4d", className }: { kind?: "seigaiha" | "asanoha"; color?: string; className?: string }) {
  const id = `pb-${kind}`;
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
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="13" fill="#c9a24a" />
      <circle cx="21" cy="12" r="11" fill="#ffffff" />
      <circle cx="24" cy="23" r="1.4" fill="#c9a24a" />
    </svg>
  );
}
