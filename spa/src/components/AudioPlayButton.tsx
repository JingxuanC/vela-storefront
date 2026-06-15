import { useState, useRef } from "react";
import { shopId } from "~/api";

interface Props {
  text: string;
  size?: "sm" | "md";
}

export default function AudioPlayButton({ text, size = "sm" }: Props) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function play() {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/speech/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 500), shop_id: shopId() }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setPlaying(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setPlaying(false);
        setError(true);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      await audio.play();
      setPlaying(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const btnSize = size === "sm" ? { width: 28, height: 28, fontSize: 12, borderRadius: 6 } : { width: 34, height: 34, fontSize: 14, borderRadius: 8 };

  return (
    <button
      onClick={play}
      disabled={loading}
      title={error ? "Playback failed — tap to retry" : playing ? "Stop" : "Read aloud"}
      style={{
        ...btnSize,
        background: playing ? "var(--amber)" : error ? "var(--rose-soft)" : "var(--bg-raised)",
        border: `1px solid ${playing ? "var(--amber)" : "var(--border-strong)"}`,
        color: playing ? "#fff" : error ? "var(--rose)" : "var(--text-tertiary)",
        cursor: loading ? "wait" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        opacity: loading ? 0.6 : 1,
        transition: "all .15s var(--ease)",
      }}
      aria-label={playing ? "Stop audio" : "Read aloud"}
    >
      {loading ? "…" : playing ? "■" : error ? "⚠" : "🔈"}
    </button>
  );
}
