import React from "react";
import Link from "next/link";

/** 安全な簡易Markdown（## 見出し / **太字** / [リンク](url) / ![画像](url) / 1. 番号 / - 箇条書き） */
function inline(text: string, key: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*)/g;
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  // http(s) と同一サイト内パスのみ許可（"//evil" や "/\evil" のようなプロトコル相対URLは拒否）
  const safe = (u: string) => (/^(https?:\/\/|\/(?![\/\\]))/.test(u) ? u : "#");
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[3]) {
      // eslint-disable-next-line @next/next/no-img-element
      out.push(<img key={key + i++} src={safe(m[3])} alt={m[2] ?? ""} />);
    } else if (m[4] && m[5]) {
      const href = safe(m[5]);
      out.push(href.startsWith("/") ? <Link key={key + i++} href={href}>{m[4]}</Link> : <a key={key + i++} href={href} target="_blank" rel="noopener noreferrer">{m[4]}</a>);
    } else if (m[6]) out.push(<strong key={key + i++}>{m[6]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return (
    <div className="prose">
      {blocks.map((b, bi) => {
        const t = b.trim();
        if (!t) return null;
        if (t.startsWith("## ")) return <h2 key={bi}>{inline(t.slice(3), `h${bi}`)}</h2>;
        const lines = t.split("\n");
        if (lines.every((l) => /^\d+\.\s/.test(l))) return <ol key={bi}>{lines.map((l, li) => <li key={li}>{inline(l.replace(/^\d+\.\s/, ""), `o${bi}-${li}`)}</li>)}</ol>;
        if (lines.every((l) => /^[-・]\s?/.test(l))) return <ul key={bi}>{lines.map((l, li) => <li key={li}>{inline(l.replace(/^[-・]\s?/, ""), `u${bi}-${li}`)}</li>)}</ul>;
        return <p key={bi}>{lines.map((l, li) => <React.Fragment key={li}>{li > 0 && <br />}{inline(l, `p${bi}-${li}`)}</React.Fragment>)}</p>;
      })}
    </div>
  );
}
