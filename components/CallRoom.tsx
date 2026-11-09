"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TellerImage } from "./Art";

type State = {
  epoch: number; offer: string | null; answer: string | null; peerPresent: boolean;
  startedAt: string | null; endedAt: string | null; endedBy: string | null;
  billedMinutes: number | null; amount: number | null; limitSec: number; serverNow: number;
};
type Props = {
  reservationId: string; role: "user" | "teller"; peerName: string;
  teller: { name: string; portrait: number; imageUrl?: string };
  type: "fixed" | "metered"; durationMin: number | null; price: number; message: string; backHref: string;
  turn: { url: string; username: string; credential: string };
};
type Phase = "ready" | "joining" | "waiting" | "connecting" | "connected" | "reconnecting" | "ended" | "error";

const POLL_MS = 1500;

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function CallRoom(p: Props) {
  const api = `/api/calls/${p.reservationId}`;
  const [phase, setPhase] = useState<Phase>("ready");
  const [error, setError] = useState("");
  const [micWarn, setMicWarn] = useState(false);
  const [muted, setMuted] = useState(false);
  const [state, setState] = useState<State | null>(null);
  const [now, setNow] = useState(Date.now());

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const epochRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const offsetRef = useRef(0);
  const busyRef = useRef(false);
  const connectedSentRef = useRef(0);
  const retriesRef = useRef(0);
  const stopRef = useRef(false);
  const phaseRef = useRef<Phase>("ready");
  phaseRef.current = phase;

  const post = useCallback(async (body: object): Promise<State | null> => {
    const res = await fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { if (body && (body as { action: string }).action === "join") { setError(j.error ?? "入室できませんでした"); setPhase("error"); } return null; }
    return j as State;
  }, [api]);

  const closePc = () => { pcRef.current?.close(); pcRef.current = null; };

  const newPc = useCallback(() => {
    const ice: RTCIceServer[] = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }];
    if (p.turn.url) ice.push({ urls: p.turn.url, username: p.turn.username, credential: p.turn.credential });
    const pc = new RTCPeerConnection({ iceServers: ice });
    streamRef.current?.getTracks().forEach((t) => pc.addTrack(t, streamRef.current!));
    pc.ontrack = (e) => { if (audioRef.current) { audioRef.current.srcObject = e.streams[0]; audioRef.current.play().catch(() => {}); } };
    const ep = epochRef.current;
    pc.onconnectionstatechange = async () => {
      if (pc !== pcRef.current) return;
      if (pc.connectionState === "connected") {
        retriesRef.current = 0;
        setPhase("connected");
        if (connectedSentRef.current !== ep) { connectedSentRef.current = ep; const s = await post({ action: "connected" }); if (s) setState(s); }
      } else if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        setPhase("reconnecting");
        setTimeout(async () => {
          if (pc !== pcRef.current || stopRef.current || pc.connectionState === "connected") return;
          if (retriesRef.current < 3) { retriesRef.current++; await post({ action: "join" }); }
        }, 4000);
      }
    };
    pcRef.current = pc;
    return pc;
  }, [p.turn, post]);

  const waitIce = (pc: RTCPeerConnection) => new Promise<void>((resolve) => {
    if (pc.iceGatheringState === "complete") return resolve();
    const t = setTimeout(resolve, 2500);
    pc.addEventListener("icegatheringstatechange", () => { if (pc.iceGatheringState === "complete") { clearTimeout(t); resolve(); } });
  });

  const handle = useCallback(async (s: State) => {
    setState(s);
    offsetRef.current = s.serverNow - Date.now();
    if (s.endedAt) { stopRef.current = true; closePc(); streamRef.current?.getTracks().forEach((t) => t.stop()); setPhase("ended"); return; }
    if (s.epoch !== epochRef.current) { closePc(); epochRef.current = s.epoch; }
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      if (p.role === "teller") {
        if (s.peerPresent && !s.offer && !pcRef.current) {
          setPhase("connecting");
          const pc = newPc();
          const ep = epochRef.current;
          await pc.setLocalDescription(await pc.createOffer({ offerToReceiveAudio: true }));
          await waitIce(pc);
          const r = await post({ action: "offer", sdp: pc.localDescription!.sdp, epoch: ep });
          if (!r) closePc();
        } else if (s.answer && pcRef.current && pcRef.current.signalingState === "have-local-offer") {
          await pcRef.current.setRemoteDescription({ type: "answer", sdp: s.answer });
        }
      } else if (s.offer && !pcRef.current) {
        setPhase("connecting");
        const pc = newPc();
        const ep = epochRef.current;
        await pc.setRemoteDescription({ type: "offer", sdp: s.offer });
        await pc.setLocalDescription(await pc.createAnswer());
        await waitIce(pc);
        const r = await post({ action: "answer", sdp: pc.localDescription!.sdp, epoch: ep });
        if (!r) closePc();
      }
      if (!s.peerPresent && phaseRef.current !== "connected" && phaseRef.current !== "reconnecting") setPhase("waiting");
    } catch (e) {
      console.error(e);
      closePc();
    } finally {
      busyRef.current = false;
    }
  }, [newPc, p.role, post]);

  // ポーリング
  useEffect(() => {
    if (phase === "ready" || phase === "error" || phase === "ended") return;
    let timer: ReturnType<typeof setTimeout>;
    const loop = async () => {
      if (stopRef.current) return;
      try {
        const res = await fetch(api, { cache: "no-store" });
        if (res.ok) await handle(await res.json());
      } catch { /* 一時的な通信エラーは次回再試行 */ }
      if (!stopRef.current) timer = setTimeout(loop, POLL_MS);
    };
    timer = setTimeout(loop, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === "ready" || phase === "error" || phase === "ended"]);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(t); }, []);
  useEffect(() => () => { stopRef.current = true; closePc(); streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  async function join() {
    setPhase("joining");
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch {
      // マイクが使えない環境でも接続確認ができるよう無音トラックを使用
      setMicWarn(true);
      const ctx = new AudioContext();
      const dest = ctx.createMediaStreamDestination();
      const osc = ctx.createOscillator(); const g = ctx.createGain(); g.gain.value = 0; osc.connect(g).connect(dest); osc.start();
      streamRef.current = dest.stream;
    }
    audioRef.current?.play().catch(() => {});
    const s = await post({ action: "join" });
    if (s) { stopRef.current = false; setPhase("waiting"); await handle(s); }
  }

  async function end() {
    const msg = p.type === "fixed" && p.role === "user" ? "鑑定を終了しますか？（時間指定の鑑定は途中で終了しても予約時間分の料金となります）" : "鑑定を終了しますか？";
    if (!confirm(msg)) return;
    const s = await post({ action: "end" });
    stopRef.current = true;
    closePc();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (s) setState(s);
    setPhase("ended");
  }

  function toggleMute() {
    const next = !muted;
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !next));
    setMuted(next);
  }

  const started = state?.startedAt ? new Date(state.startedAt).getTime() : null;
  const elapsed = started ? (now + offsetRef.current - started) / 1000 : 0;
  const limit = state?.limitSec ?? 0;
  const remain = limit - elapsed;
  const costSoFar = Math.max(1, Math.ceil(elapsed / 60)) * p.price;

  const avatar = p.role === "user"
    ? <TellerImage teller={p.teller} />
    : <div style={{ display: "grid", placeItems: "center", background: "var(--bg-soft)", fontFamily: "var(--serif)", fontSize: 56, color: "var(--ink)" }}>{p.peerName.slice(0, 1)}</div>;

  if (phase === "ended") {
    return (
      <div className="callroom">
        <h1>鑑定が終了しました</h1>
        {state?.billedMinutes != null ? (
          <div className="card">
            <p className="mb-0">通話時間：<b>{state.billedMinutes}分</b></p>
            <p className="mb-0">{p.role === "user" ? "ご利用料金" : "鑑定料"}：<b className="shu">{(state.amount ?? 0).toLocaleString()}円</b></p>
            {state.endedBy === "system" && <p className="small muted mb-0 mt-1">{p.type === "fixed" ? "予約時間に達したか、回線が切断されたため自動終了しました。" : "ポイント残高の上限に達したか、回線が切断されたため自動終了しました。"}</p>}
          </div>
        ) : <div className="card"><p className="mb-0">通話は接続前に終了したため、料金は発生していません。予約は有効なので再度入室できます。</p></div>}
        <div className="flex mt-3" style={{ justifyContent: "center" }}>
          <Link href={p.backHref} className="btn">{p.role === "user" ? "マイページへ" : "占い師ページへ"}</Link>
          {p.role === "user" && <Link href="/mypage/history" className="btn btn-outline">鑑定履歴・口コミ</Link>}
        </div>
      </div>
    );
  }

  return (
    <div className="callroom">
      <audio ref={audioRef} autoPlay playsInline />
      <div className="call-avatar">{avatar}</div>
      <h2 className="mb-0">{p.peerName}</h2>
      <p className="small muted">{p.type === "fixed" ? `時間指定 ${p.durationMin}分` : "従量制"} ／ 1分 {p.price}円</p>

      {phase === "ready" && (
        <>
          <p>準備ができたら「入室する」を押してください。<br /><span className="small muted">ブラウザがマイクの使用許可を求めたら「許可」を選択してください。</span></p>
          <button className="btn btn-shu btn-lg" onClick={join}>入室する</button>
        </>
      )}
      {phase === "error" && <><div className="alert alert-err">{error}</div><Link href={p.backHref} className="btn">戻る</Link></>}
      {micWarn && <div className="alert alert-info">マイクを利用できませんでした。ブラウザ設定でマイクを許可してから再入室してください（接続確認は無音で続行します）。</div>}

      {["joining", "waiting", "connecting", "connected", "reconnecting"].includes(phase) && (
        <>
          <div className="small mb-2">
            {phase === "joining" && "入室しています…"}
            {phase === "waiting" && <><span className="pulse" />{p.peerName}の入室をお待ちしています</>}
            {phase === "connecting" && "接続しています…"}
            {phase === "connected" && <><span className="pulse" />通話中</>}
            {phase === "reconnecting" && <span className="shu">回線が不安定です。再接続しています…</span>}
          </div>
          <div className="timer">{fmt(elapsed)}</div>
          {started && limit > 0 && (
            <>
              <div className="meter"><div style={{ width: `${Math.min(100, (elapsed / limit) * 100)}%` }} /></div>
              <div className="small">
                {p.type === "fixed" ? <>残り時間 <b>{fmt(remain)}</b></> : <>現在の料金 <b className="shu">{costSoFar.toLocaleString()}円</b> ／ 残高で話せる残り <b>{fmt(remain)}</b></>}
              </div>
              {remain > 0 && remain <= 180 && <div className="alert alert-info mt-2">まもなく終了します（残り{Math.ceil(remain / 60)}分）。</div>}
            </>
          )}
          {p.message && <div className="card-flat small mt-3" style={{ textAlign: "left" }}><b>ご相談内容</b><br />{p.message}</div>}
          <div className="flex mt-3" style={{ justifyContent: "center" }}>
            <button className="btn btn-outline" onClick={toggleMute}>{muted ? "ミュート解除" : "ミュート"}</button>
            {phase === "reconnecting" && <button className="btn btn-outline" onClick={() => { retriesRef.current = 0; post({ action: "join" }); }}>再接続</button>}
            <button className="btn btn-shu" onClick={end}>鑑定を終了する</button>
          </div>
          <p className="small muted mt-3">通話はブラウザ間で暗号化（DTLS-SRTP）されます。録音は行いません。<br />この画面を閉じても、45秒以内に再入室すれば通話を再開できます。</p>
        </>
      )}
    </div>
  );
}
