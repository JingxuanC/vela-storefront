import { useState, useRef, useEffect, useCallback } from "react";
import { shopId } from "~/api";

interface Props { onText: (text: string) => void; disabled?: boolean; }

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VoiceInput({ onText, disabled }: Props) {
  const [recording, setRecording] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const animFrame = useRef<number>(0);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<number>(0);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
    }
    setRecording(false);
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  async function startRecording() {
    setError("");
    setRequesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setRequesting(false);

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const a = audioCtx.createAnalyser();
      a.fftSize = 256;
      source.connect(a);
      analyser.current = a;

      // Waveform animation
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d")!;
        const draw = () => {
          const buf = new Uint8Array(a.frequencyBinCount);
          a.getByteFrequencyData(buf);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const barW = canvas.width / buf.length;
          for (let i = 0; i < buf.length; i++) {
            const h = (buf[i] / 255) * canvas.height;
            ctx.fillStyle = `hsl(${240 + i * 2}, 80%, ${50 + (buf[i] / 255) * 30}%)`;
            ctx.fillRect(i * barW, canvas.height - h, barW - 1, h);
          }
          animFrame.current = requestAnimationFrame(draw);
        };
        draw();
      }

      // Timer
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000);

      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = e => chunks.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        audioCtx.close();
        if (animFrame.current) cancelAnimationFrame(animFrame.current);
        if (timerRef.current) clearInterval(timerRef.current);

        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("audio", blob, "recording.webm");

        try {
          const res = await fetch(`/api/speech/transcribe?shop_id=${encodeURIComponent(shopId())}`, {
            method: "POST",
            body: form,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (data.text) onText(data.text);
        } catch {
          setError("Voice recognition failed");
        }
      };
      mr.start();
      mediaRecorder.current = mr;
      setRecording(true);
    } catch (err: any) {
      setRequesting(false);
      setError(err.name === "NotAllowedError" ? "Microphone access denied" : "Microphone unavailable");
    }
  }

  useEffect(() => () => stopRecording(), [stopRecording]);

  return (
    <div style={{ position: "relative" }}>
      {requesting ? (
        <button disabled style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid var(--border-strong)", background: "var(--bg-raised)", cursor: "wait", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.6 }}>
          …
        </button>
      ) : recording ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--rose-soft)", borderRadius: 12, padding: "4px 12px" }}>
          <canvas ref={canvasRef} width={120} height={32} style={{ borderRadius: 4 }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--rose)", minWidth: 32 }}>{formatTime(elapsed)}</span>
          <button onClick={stopRecording} style={{ background: "var(--rose)", color: "#fff", border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            Stop
          </button>
        </div>
      ) : (
        <button onClick={startRecording} disabled={disabled} title="Voice input" style={{
          width: 38, height: 38, borderRadius: 10,
          border: `1px solid ${error ? "var(--rose)" : "var(--border-strong)"}`,
          background: "var(--bg-raised)",
          cursor: disabled ? "not-allowed" : "pointer",
          fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
          opacity: disabled ? 0.5 : 1,
        }}>
          🎤
        </button>
      )}
      {error && (
        <div style={{ position: "absolute", bottom: -22, left: 0, fontSize: 10, color: "var(--rose)", whiteSpace: "nowrap", display: "flex", gap: 6, alignItems: "center" }}>
          {error}
          <button onClick={() => { setError(""); startRecording(); }} style={{ background: "var(--rose-soft)", border: "none", color: "var(--rose)", cursor: "pointer", fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4 }}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
