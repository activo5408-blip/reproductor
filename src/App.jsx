import React, { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

const CATEGORIES = [
  // YouTube dejó de admitir búsquedas directas en loadPlaylist/listType=search.
  // Usamos playlists públicas reales y cargamos sus IDs directamente en el IFrame API.
  { id: "regueton", label: "Variado Reguetón", playlistIds: ["PLXF8dLaigyeuJkreG2RDuXh-aWhhUFwSC", "PLV-i54YP7kvwdprhvJoujjJ_H8QM03J7s"], icon: "music", color: "#8b5cf6" },
  { id: "romantico", label: "Variado Romántico", playlistIds: ["PLyiSF7Lsy0UCiW6-T_nsrjFXuN-EfbAnE", "PLvKOrz6G66rETLNoQwNuQGGDsS6cFNcCB"], icon: "heart", color: "#ef4444" },
  { id: "bachata", label: "Variado Bachata", playlistIds: ["PLkEfHXj_yQ6tvPSLMNZXW9QZLonsb-3-p", "PLTVc0C8x6KEHZ2aBVO1a37H0Ncxt-9A0Q"], icon: "guitar", color: "#22c55e" },
  { id: "favoritos", label: "Favoritos", playlistIds: [], icon: "star", color: "#64748b" },
];

const FAVORITES_KEY = "yt-variados-favoritos";

const Icon = ({ name, size = 22 }) => {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
  };
  switch (name) {
    case "music": return <svg {...common}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
    case "heart": return <svg {...common} fill="currentColor" stroke="none"><path d="M12 21s-6.7-4.3-9.4-8.2C.7 9.9 1.5 6.4 4.4 5c2.3-1.1 4.8-.2 6.1 1.7C11.8 4.8 14.3 3.9 16.6 5c2.9 1.4 3.7 4.9 1.8 7.8C18.7 16.7 12 21 12 21z" /></svg>;
    case "guitar": return <svg {...common}><circle cx="8" cy="16" r="4" /><path d="M11 13l7-7" /><path d="M16 4l4 4" /><path d="M14 6l1.5 1.5" /><path d="M17 3l1.5 1.5" /></svg>;
    case "star": return <svg {...common} fill="currentColor" stroke="none"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9L5.7 21l1.7-7L2 9.2l7.1-.6L12 2z" /></svg>;
    case "prev": return <svg {...common} fill="currentColor" stroke="none"><path d="M6 6h2v12H6zM20 6L10 12l10 6z" /></svg>;
    case "next": return <svg {...common} fill="currentColor" stroke="none"><path d="M16 6h2v12h-2zM4 6l10 6-10 6z" /></svg>;
    case "play": return <svg {...common} fill="currentColor" stroke="none"><path d="M7 5l12 7-12 7z" /></svg>;
    case "pause": return <svg {...common} fill="currentColor" stroke="none"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>;
    case "volume": return <svg {...common}><path d="M4 9v6h4l5 5V4l-5 5H4z" /><path d="M16.5 8.5a5 5 0 010 7" /></svg>;
    case "gear": return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></svg>;
    default: return null;
  }
};

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

export default function App() {
  const playerRef = useRef(null);
  const playerElRef = useRef(null);
  const progressTimerRef = useRef(null);
  const playlistPollRef = useRef(null);
  const requestIdRef = useRef(0);
  const playlistAttemptRef = useRef(0);

  const [ready, setReady] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState("Elegí una categoría");
  const [channel, setChannel] = useState("para empezar a escuchar");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [favorites, setFavorites] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [message, setMessage] = useState("");

  const stopProgress = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const syncPlaylist = useCallback(() => {
    const p = playerRef.current;
    if (!p?.getPlaylist) return;
    try {
      const ids = p.getPlaylist() || [];
      const idx = typeof p.getPlaylistIndex === "function" ? p.getPlaylistIndex() : -1;
      if (ids.length) {
        setQueue(ids);
        setCurrentIndex(idx);
      }
    } catch {
      // El reproductor puede estar cambiando de lista; se sincroniza en el siguiente intento.
    }
  }, []);

  const startProgress = useCallback(() => {
    stopProgress();
    progressTimerRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      try {
        setCurrentTime(p.getCurrentTime() || 0);
        setDuration(p.getDuration() || 0);
        setCurrentIndex(typeof p.getPlaylistIndex === "function" ? p.getPlaylistIndex() : -1);
      } catch {}
    }, 300);
  }, [stopProgress]);

  const onPlayerStateChange = useCallback((e) => {
    if (!window.YT?.PlayerState || !playerRef.current) return;
    const state = window.YT.PlayerState;

    if (e.data === state.PLAYING) {
      setPlaying(true);
      setMessage("");
      try {
        const data = playerRef.current.getVideoData();
        setTitle(data?.title || "Reproduciendo...");
        setChannel(data?.author || "");
        setDuration(playerRef.current.getDuration() || 0);
        setCurrentIndex(playerRef.current.getPlaylistIndex?.() ?? -1);
      } catch {}
      syncPlaylist();
      startProgress();
    } else if (e.data === state.PAUSED) {
      setPlaying(false);
      stopProgress();
    } else if (e.data === state.ENDED) {
      setPlaying(false);
      stopProgress();
      syncPlaylist();
    } else if (e.data === state.BUFFERING) {
      setMessage("Cargando...");
    } else if (e.data === state.CUED) {
      syncPlaylist();
    }
  }, [startProgress, stopProgress, syncPlaylist]);

  const initPlayer = useCallback(() => {
    if (!window.YT?.Player || !playerElRef.current || playerRef.current) return;

    playerRef.current = new window.YT.Player(playerElRef.current, {
      height: "2",
      width: "2",
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
      },
      events: {
        onReady: () => {
          setReady(true);
          try { playerRef.current.setVolume(volume); } catch {}
        },
        onStateChange: onPlayerStateChange,
        onError: () => {
          // No rompemos la lista si un vídeo no está disponible.
          setMessage("Este vídeo no está disponible. Probando el siguiente...");
          setTimeout(() => {
            try { playerRef.current?.nextVideo(); } catch {}
          }, 350);
        },
      },
    });
  }, [onPlayerStateChange, volume]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (window.YT?.Player) {
      initPlayer();
      return;
    }
    const oldCallback = window.onYouTubeIframeAPIReady;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      oldCallback?.();
      initPlayer();
    };

    return () => {
      if (window.onYouTubeIframeAPIReady === initPlayer) window.onYouTubeIframeAPIReady = null;
      stopProgress();
      if (playlistPollRef.current) clearInterval(playlistPollRef.current);
    };
  }, [initPlayer, stopProgress]);

  useEffect(() => {
    return () => {
      stopProgress();
      if (playlistPollRef.current) clearInterval(playlistPollRef.current);
      try { playerRef.current?.destroy(); } catch {}
    };
  }, [stopProgress]);

  const refreshQueueAfterLoad = useCallback((requestId, cat = null) => {
    if (playlistPollRef.current) clearInterval(playlistPollRef.current);
    let attempts = 0;
    playlistPollRef.current = setInterval(() => {
      attempts += 1;
      if (requestId !== requestIdRef.current) {
        clearInterval(playlistPollRef.current);
        return;
      }
      const p = playerRef.current;
      try {
        const ids = p?.getPlaylist?.() || [];
        if (ids.length) {
          setQueue(ids);
          setCurrentIndex(p.getPlaylistIndex?.() ?? 0);
          clearInterval(playlistPollRef.current);
          playlistPollRef.current = null;
        }
      } catch {}
      if (attempts >= 30) {
        clearInterval(playlistPollRef.current);
        playlistPollRef.current = null;

        const ids = cat?.playlistIds || [];
        const nextAttempt = playlistAttemptRef.current + 1;
        if (requestId === requestIdRef.current && nextAttempt < ids.length) {
          playlistAttemptRef.current = nextAttempt;
          setMessage("Cambiando a una lista alternativa...");
          try {
            p.loadPlaylist({ listType: "playlist", list: ids[nextAttempt], index: 0 });
            refreshQueueAfterLoad(requestId, cat);
          } catch {}
        } else if (requestId === requestIdRef.current) {
          setMessage("No se pudo cargar esta categoría. Intentá nuevamente.");
        }
      }
    }, 250);
  }, []);

  const playCategory = useCallback((cat) => {
    const p = playerRef.current;
    if (!ready || !p) return;

    const requestId = ++requestIdRef.current;
    setActiveCategory(cat.id);
    setMessage("");
    setCurrentTime(0);
    setDuration(0);
    setCurrentIndex(-1);

    try {
      if (cat.id === "favoritos") {
        if (!favorites.length) {
          setQueue([]);
          setTitle("No tenés favoritos todavía");
          setChannel("Agregá canciones con ⭐");
          setPlaying(false);
          return;
        }
        const ids = favorites.map((f) => f.videoId).filter(Boolean);
        setQueue(ids);
        setCurrentIndex(0);
        p.loadPlaylist({ playlist: ids, index: 0 });
        refreshQueueAfterLoad(requestId);
        return;
      }

      setQueue([]);
      const playlistIds = cat.playlistIds || [];
      if (!playlistIds.length) return;

      playlistAttemptRef.current = 0;
      p.loadPlaylist({
        listType: "playlist",
        list: playlistIds[0],
        index: 0,
      });
      refreshQueueAfterLoad(requestId, cat);
    } catch {
      setMessage("No se pudo cargar la lista. Intentá de nuevo.");
    }
  }, [favorites, ready, refreshQueueAfterLoad]);

  const playAt = useCallback((index) => {
    const p = playerRef.current;
    if (!p || index < 0 || index >= queue.length) return;
    try {
      p.playVideoAt(index);
      setCurrentIndex(index);
      setMessage("");
    } catch {
      setMessage("No se pudo reproducir ese vídeo.");
    }
  }, [queue.length]);

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    try {
      if (playing) p.pauseVideo();
      else p.playVideo();
    } catch {}
  };

  const next = () => {
    try { playerRef.current?.nextVideo(); } catch {}
  };

  const prev = () => {
    try { playerRef.current?.previousVideo(); } catch {}
  };

  const seek = (e) => {
    const pct = Number(e.target.value);
    const t = duration > 0 ? (pct / 100) * duration : 0;
    try { playerRef.current?.seekTo(t, true); } catch {}
    setCurrentTime(t);
  };

  const changeVolume = (e) => {
    const v = Number(e.target.value);
    setVolume(v);
    try { playerRef.current?.setVolume(v); } catch {}
  };

  const addCurrentToFavorites = () => {
    const p = playerRef.current;
    if (!p) return;
    try {
      const data = p.getVideoData();
      if (!data?.video_id) return;
      setFavorites((prev) => {
        if (prev.some((f) => f.videoId === data.video_id)) return prev;
        const updated = [...prev, { videoId: data.video_id, title: data.title || "Sin título", channel: data.author || "" }];
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
        return updated;
      });
      setMessage("Añadido a favoritos ⭐");
    } catch {}
  };

  const progressPct = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="app">
      {/* El iframe NO usa display:none: WebView2/YouTube puede detener un reproductor completamente oculto. */}
      <div ref={playerElRef} className="youtube-host" aria-hidden="true" />

      <header className="titlebar" data-tauri-drag-region>
        <span className="titlebar-title" data-tauri-drag-region>Reproductor YouTube - Variados</span>
        <div className="titlebar-actions">
          <button className="tb-btn" onClick={() => getCurrentWindow().minimize()} title="Minimizar">&#8211;</button>
          <button className="tb-btn tb-btn-close" onClick={() => getCurrentWindow().close()} title="Cerrar">&#10005;</button>
        </div>
      </header>

      <main className="content">
        <div className="categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`category-btn ${activeCategory === cat.id ? "active" : ""}`}
              style={{ "--cat-color": cat.color }}
              onClick={() => playCategory(cat)}
              disabled={!ready}
            >
              <Icon name={cat.icon} size={26} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="track-card">
          <div className="track-info">
            <div className="track-thumb"><Icon name="music" size={20} /></div>
            <div className="track-text">
              <div className="track-title" title={title}>{title}</div>
              <div className="track-channel" title={channel}>{channel}</div>
            </div>
            <button className="fav-add" title="Agregar a favoritos" onClick={addCurrentToFavorites} disabled={!ready}>
              <Icon name="star" size={18} />
            </button>
          </div>

          {message && <div className="player-message">{message}</div>}

          <div className="progress-row">
            <span className="time">{fmt(currentTime)}</span>
            <input
              type="range" min="0" max="100" value={progressPct}
              onChange={seek} className="progress-slider"
              style={{ "--progress": `${progressPct}%` }}
              disabled={!ready || duration <= 0}
            />
            <span className="time">{fmt(duration)}</span>
          </div>

          <div className="controls-row">
            <button className="ctrl-btn" onClick={prev} disabled={!ready || queue.length < 2}><Icon name="prev" size={18} /></button>
            <button className="ctrl-btn ctrl-btn-main" onClick={togglePlay} disabled={!ready || !queue.length}>
              <Icon name={playing ? "pause" : "play"} size={22} />
            </button>
            <button className="ctrl-btn" onClick={next} disabled={!ready || queue.length < 2}><Icon name="next" size={18} /></button>
            <div className="volume-box">
              <Icon name="volume" size={16} />
              <input type="range" min="0" max="100" value={volume} onChange={changeVolume} className="volume-slider" />
            </div>
          </div>
        </div>

        <section className="queue-card">
          <div className="queue-header">
            <span>Lista actual</span>
            <span>{queue.length ? `${Math.max(currentIndex + 1, 1)} / ${queue.length}` : "—"}</span>
          </div>
          {queue.length === 0 ? (
            <div className="queue-empty">Elegí un variado para cargar canciones.</div>
          ) : (
            <div className="queue-list">
              {queue.map((videoId, index) => (
                <button
                  key={`${videoId}-${index}`}
                  className={`queue-item ${index === currentIndex ? "current" : ""}`}
                  onClick={() => playAt(index)}
                >
                  <img
                    src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                  />
                  <span className="queue-number">{index + 1}</span>
                  <span className="queue-id">{index === currentIndex ? "▶ Reproduciendo" : `Vídeo ${index + 1}`}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="statusbar">
        <span className={`status-dot ${ready ? "connected" : ""}`} />
        <span>{ready ? "Conectado" : "Conectando..."}</span>
        <span className="status-sep">·</span>
        <span>Calidad: <b>128 kbps</b></span>
        <span className="status-gear"><Icon name="gear" size={16} /></span>
      </footer>
    </div>
  );
}
