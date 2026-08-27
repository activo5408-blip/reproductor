import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

const CATEGORIES = [
  {
    id: "regueton",
    eyebrow: "VARIADO",
    label: "REGUETÓN",
    icon: "music",
    color: "#9b5cff",
    description: "Reparto y reguetón cubano actual",
    items: [
      {
        videoId: "lW4juTEKDEI",
        title: "REPARTO CUBANO 2026 MIX — Ya Ice Dilan, Bebeshito, Rey Tony & más",
        channel: "JairoDj Productions",
        durationLabel: "30+ min",
        published: "2026",
      },
      {
        videoId: "hKcOuEVhsXQ",
        title: "Reparto Cubano 2026 Mix — Lo último: Payaso x Ley, Bebeshito, Ya Ice Dilan",
        channel: "Reparto.cu24",
        durationLabel: "1 h+",
        published: "2026",
      },
    ],
  },
  {
    id: "romantico",
    eyebrow: "VARIADO",
    label: "ROMÁNTICO",
    icon: "heart",
    color: "#ff3f88",
    description: "Románticas actuales, fuera del reparto cubano",
    items: [
      {
        videoId: "_c_AidEGrXk",
        title: "1 HOUR ROMANTIC VOCAL MIX 2026 — Sensual Slow Jams & Chillout",
        channel: "PLATINUM NOIR",
        durationLabel: "1 h",
        published: "2026",
      },
      {
        videoId: "MCD-d2WvK74",
        title: "Uzbek Romantic Love Songs — Best Romantic Compilation for Late Night",
        channel: "UzLove Melodia",
        durationLabel: "1 h 09 min",
        published: "2026",
      },
    ],
  },
  {
    id: "bachata",
    eyebrow: "VARIADO",
    label: "BACHATA",
    icon: "guitar",
    color: "#ff8a00",
    description: "Bachata latina actual y romántica",
    items: [
      {
        videoId: "28ymphJ2C2E",
        title: "Bachata 2026 1 Hour Mix — Romantic Latin Bachata Compilation",
        channel: "Music_for_the_soul",
        durationLabel: "1 h",
        published: "2026",
      },
    ],
  },
  {
    id: "favoritos",
    eyebrow: "TU MÚSICA",
    label: "FAVORITOS",
    icon: "star",
    color: "#f7c948",
    description: "Tus mezclas y videos guardados",
    items: [],
  },
];

const FAVORITES_KEY = "yt-variados-favoritos";

const Icon = ({ name, size = 22 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (name) {
    case "music": return <svg {...common}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
    case "heart": return <svg {...common} fill="currentColor" stroke="none"><path d="M12 21s-6.7-4.3-9.4-8.2C.7 9.9 1.5 6.4 4.4 5c2.3-1.1 4.8-.2 6.1 1.7C11.8 4.8 14.3 3.9 16.6 5c2.9 1.4 3.7 4.9 1.8 7.8C18.7 16.7 12 21 12 21z" /></svg>;
    case "guitar": return <svg {...common}><circle cx="8" cy="16" r="4" /><path d="M11 13l7-7" /><path d="M16 4l4 4" /><path d="M14 6l1.5 1.5" /><path d="M17 3l1.5 1.5" /></svg>;
    case "star": return <svg {...common}><path d="M12 2l3 6.4 7 .7-5.2 4.7 1.5 6.8L12 17.3 5.7 20.6l1.5-6.8L2 9.1l7-.7L12 2z" /></svg>;
    case "search": return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
    case "prev": return <svg {...common} fill="currentColor" stroke="none"><path d="M6 6h2v12H6zM20 6l-10 6 10 6z" /></svg>;
    case "next": return <svg {...common} fill="currentColor" stroke="none"><path d="M16 6h2v12h-2zM4 6l10 6-10 6z" /></svg>;
    case "play": return <svg {...common} fill="currentColor" stroke="none"><path d="M7 5l12 7-12 7z" /></svg>;
    case "pause": return <svg {...common} fill="currentColor" stroke="none"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>;
    case "repeat": return <svg {...common}><path d="M17 2l4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></svg>;
    case "volume": return <svg {...common}><path d="M4 9v6h4l5 5V4L8 9H4z" /><path d="M17 8a5 5 0 0 1 0 8" /></svg>;
    case "gear": return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>;
    case "external": return <svg {...common}><path d="M14 5h5v5" /><path d="M19 5l-8 8" /><path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" /></svg>;
    default: return null;
  }
};

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
};

export default function App() {
  const playerRef = useRef(null);
  const playerElRef = useRef(null);
  const progressTimerRef = useRef(null);
  const requestIdRef = useRef(0);
  const errorTimerRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [activeCategory, setActiveCategory] = useState("regueton");
  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState("Elegí un variado");
  const [channel, setChannel] = useState("YouTube");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [favorites, setFavorites] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [repeat, setRepeat] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const currentItem = queue[currentIndex] || null;

  const stopProgress = useCallback(() => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = null;
  }, []);

  const startProgress = useCallback(() => {
    stopProgress();
    progressTimerRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        setCurrentTime(p.getCurrentTime?.() || 0);
        setDuration(p.getDuration?.() || 0);
        const idx = p.getPlaylistIndex?.();
        if (Number.isInteger(idx) && idx >= 0) setCurrentIndex(idx);
      } catch {}
    }, 300);
  }, [stopProgress]);

  const updateNowPlaying = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      const data = p.getVideoData?.();
      if (data?.title) setTitle(data.title);
      if (data?.author) setChannel(data.author);
      const idx = p.getPlaylistIndex?.();
      if (Number.isInteger(idx) && idx >= 0) setCurrentIndex(idx);
      setDuration(p.getDuration?.() || 0);
    } catch {}
  }, []);

  const syncQueue = useCallback(() => {
    const p = playerRef.current;
    if (!p?.getPlaylist) return;
    try {
      const ids = p.getPlaylist() || [];
      if (!ids.length) return;
      const existing = queueRef.current;
      const mapped = ids.map((id) => existing.find((item) => item.videoId === id) || {
        videoId: id,
        title: `Video de YouTube ${id}`,
        channel: "YouTube",
        durationLabel: "—",
        published: "",
      });
      queueRef.current = mapped;
      setQueue(mapped);
      const idx = p.getPlaylistIndex?.();
      if (Number.isInteger(idx) && idx >= 0) setCurrentIndex(idx);
    } catch {}
  }, []);

  const queueRef = useRef([]);

  const onPlayerStateChange = useCallback((e) => {
    const state = window.YT?.PlayerState;
    if (!state) return;
    if (e.data === state.PLAYING) {
      setPlaying(true);
      setMessage("");
      updateNowPlaying();
      startProgress();
    } else if (e.data === state.PAUSED) {
      setPlaying(false);
      stopProgress();
      updateNowPlaying();
    } else if (e.data === state.ENDED) {
      setPlaying(false);
      stopProgress();
      updateNowPlaying();
    } else if (e.data === state.BUFFERING) {
      setMessage("Cargando el variado…");
    } else if (e.data === state.CUED) {
      updateNowPlaying();
    }
  }, [startProgress, stopProgress, updateNowPlaying]);

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
          try {
            playerRef.current.setVolume(volume);
            playerRef.current.setLoop?.(repeat);
          } catch {}
        },
        onStateChange: onPlayerStateChange,
        onError: () => {
          const failedRequest = requestIdRef.current;
          if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
          setMessage("Este video no está disponible. Probando el siguiente…");
          errorTimerRef.current = setTimeout(() => {
            if (failedRequest !== requestIdRef.current) return;
            const p = playerRef.current;
            const idx = p?.getPlaylistIndex?.() ?? -1;
            if (p && queueRef.current.length > 1 && idx < queueRef.current.length - 1) {
              try { p.nextVideo(); } catch {}
            } else {
              setPlaying(false);
              setMessage("No hay otro video disponible en este variado.");
            }
          }, 600);
        },
      },
    });
  }, [onPlayerStateChange, repeat, volume]);

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
    const previous = window.onYouTubeIframeAPIReady;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      initPlayer();
    };
    return () => {
      if (window.onYouTubeIframeAPIReady) window.onYouTubeIframeAPIReady = previous || null;
      stopProgress();
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [initPlayer, stopProgress]);

  useEffect(() => () => {
    stopProgress();
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    try { playerRef.current?.destroy(); } catch {}
  }, [stopProgress]);

  useEffect(() => {
    if (!ready || !playerRef.current) return;
    try { playerRef.current.setLoop(repeat); } catch {}
  }, [repeat, ready]);

  const category = useMemo(() => CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0], [activeCategory]);

  const playItems = useCallback((items, categoryId, index = 0) => {
    const p = playerRef.current;
    if (!ready || !p || !items.length) return;
    const request = ++requestIdRef.current;
    queueRef.current = items;
    setQueue(items);
    setActiveCategory(categoryId);
    setCurrentIndex(index);
    setCurrentTime(0);
    setDuration(0);
    setMessage("");
    try {
      p.setLoop(repeat);
      p.loadPlaylist({ list: items.map((item) => item.videoId), listType: "playlist", index });
    } catch {
      if (request === requestIdRef.current) setMessage("No se pudo cargar el variado. Intentá nuevamente.");
    }
  }, [ready, repeat]);

  const playCategory = useCallback((cat) => {
    if (cat.id === "favoritos") {
      if (!favorites.length) {
        queueRef.current = [];
        setQueue([]);
        setActiveCategory("favoritos");
        setTitle("Todavía no hay favoritos");
        setChannel("Pulsa ⭐ para guardar un variado");
        setPlaying(false);
        return;
      }
      playItems(favorites, "favoritos", 0);
      return;
    }
    playItems(cat.items, cat.id, 0);
  }, [favorites, playItems]);

  const playAt = useCallback((index) => {
    const p = playerRef.current;
    if (!p || index < 0 || index >= queueRef.current.length) return;
    try {
      p.playVideoAt(index);
      setCurrentIndex(index);
      setMessage("");
    } catch {
      setMessage("No se pudo reproducir ese variado.");
    }
  }, []);

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p || !queueRef.current.length) return;
    try { playing ? p.pauseVideo() : p.playVideo(); } catch {}
  };

  const next = () => {
    const p = playerRef.current;
    if (!p || queueRef.current.length < 2) return;
    try { p.nextVideo(); } catch {}
  };

  const prev = () => {
    const p = playerRef.current;
    if (!p || queueRef.current.length < 2) return;
    try { p.previousVideo(); } catch {}
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

  const toggleRepeat = () => setRepeat((value) => !value);

  const addCurrentToFavorites = () => {
    const p = playerRef.current;
    if (!p) return;
    try {
      const data = p.getVideoData?.();
      const item = queueRef.current[currentIndex];
      const videoId = data?.video_id || item?.videoId;
      if (!videoId) return;
      const favorite = {
        videoId,
        title: data?.title || item?.title || "Video de YouTube",
        channel: data?.author || item?.channel || "YouTube",
        durationLabel: item?.durationLabel || "",
        published: item?.published || "",
      };
      setFavorites((prev) => {
        if (prev.some((f) => f.videoId === videoId)) {
          setMessage("Ya está en favoritos ⭐");
          return prev;
        }
        const updated = [...prev, favorite];
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
        setMessage("Añadido a favoritos ⭐");
        return updated;
      });
    } catch {}
  };

  const removeFavorite = (videoId) => {
    setFavorites((prev) => {
      const updated = prev.filter((item) => item.videoId !== videoId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const filteredQueue = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return queue.map((item, index) => ({ item, index }));
    return queue.map((item, index) => ({ item, index })).filter(({ item }) => `${item.title} ${item.channel}`.toLowerCase().includes(q));
  }, [queue, search]);

  const progressPct = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const isFavorite = currentItem ? favorites.some((item) => item.videoId === currentItem.videoId) : false;

  const minimize = () => getCurrentWindow().minimize();
  const maximize = () => getCurrentWindow().toggleMaximize();
  const close = () => getCurrentWindow().close();

  return (
    <div className="app">
      <div ref={playerElRef} className="youtube-host" aria-hidden="true" />

      <header className="topbar" data-tauri-drag-region>
        <div className="brand" data-tauri-drag-region>
          <div className="brand-icon"><Icon name="music" size={22} /></div>
          <span><b>Mini</b>Tube Player</span>
        </div>
        <div className="search-box">
          <Icon name="search" size={19} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar en el variado actual…" />
          {search && <button className="clear-search" onClick={() => setSearch("")}>×</button>}
        </div>
        <div className="window-actions">
          <button onClick={minimize} title="Minimizar">—</button>
          <button onClick={maximize} title="Maximizar">□</button>
          <button className="close" onClick={close} title="Cerrar">×</button>
        </div>
      </header>

      <main className="main">
        <section className="category-strip">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`category-btn ${activeCategory === cat.id ? "active" : ""}`}
              style={{ "--cat-color": cat.color }}
              onClick={() => playCategory(cat)}
              disabled={!ready}
            >
              <Icon name={cat.icon} size={24} />
              <span className="category-copy"><small>{cat.eyebrow}</small><strong>{cat.label}</strong></span>
            </button>
          ))}
        </section>

        <section className="workspace">
          <section className="queue-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">{category.description}</span>
                <h2>Variados disponibles <span>({filteredQueue.length})</span></h2>
              </div>
              <span className="queue-count">{queue.length ? `${Math.max(currentIndex + 1, 1)} / ${queue.length}` : "—"}</span>
            </div>
            <div className="queue-list">
              {!queue.length ? (
                <div className="empty-state">
                  <Icon name="music" size={36} />
                  <strong>Selecciona un variado</strong>
                  <span>Se cargará un video largo de YouTube y sus alternativas.</span>
                </div>
              ) : !filteredQueue.length ? (
                <div className="empty-state"><strong>No hay coincidencias</strong><span>Prueba otra palabra.</span></div>
              ) : (
                filteredQueue.map(({ item, index }) => (
                  <button key={`${item.videoId}-${index}`} className={`queue-item ${index === currentIndex ? "current" : ""}`} onClick={() => playAt(index)}>
                    <img src={`https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`} alt="" loading="lazy" />
                    <span className="queue-play">{index === currentIndex && playing ? <Icon name="pause" size={15} /> : <Icon name="play" size={15} />}</span>
                    <span className="queue-text">
                      <strong>{item.title}</strong>
                      <small>{item.channel} · {item.published || "YouTube"}</small>
                    </span>
                    <span className="queue-duration">{item.durationLabel}</span>
                    {activeCategory === "favoritos" && <span className="remove-fav" onClick={(e) => { e.stopPropagation(); removeFavorite(item.videoId); }}>×</span>}
                  </button>
                ))
              )}
            </div>
          </section>

          <aside className="now-panel">
            <div className="now-top">
              <span>AHORA REPRODUCIENDO</span>
              <button className={`favorite-btn ${isFavorite ? "saved" : ""}`} onClick={addCurrentToFavorites} disabled={!ready || !queue.length} title="Favorito"><Icon name="star" size={20} /></button>
            </div>
            <div className="artwork-wrap">
              {currentItem ? <img className="artwork" src={`https://i.ytimg.com/vi/${currentItem.videoId}/hqdefault.jpg`} alt="" /> : <div className="artwork placeholder"><Icon name="music" size={70} /></div>}
              <div className="artwork-glow" />
            </div>
            <div className="now-title" title={title}>{title}</div>
            <div className="now-channel">{channel}</div>
            <div className="waveform" aria-hidden="true">{Array.from({ length: 34 }).map((_, i) => <i key={i} style={{ "--h": `${22 + ((i * 17) % 60)}%` }} />)}</div>
            {message && <div className="player-message">{message}</div>}
            <div className="progress-row">
              <span>{fmt(currentTime)}</span>
              <input type="range" min="0" max="100" value={progressPct} onChange={seek} className="progress-slider" style={{ "--progress": `${progressPct}%` }} disabled={!ready || duration <= 0} />
              <span>{fmt(duration)}</span>
            </div>
            <div className="duration-badge">{currentItem?.durationLabel || "30+ MIN"} · {currentItem?.published || "ACTUAL"}</div>
          </aside>
        </section>

        <section className="controls-bar">
          <button className={`control side ${repeat ? "active" : ""}`} onClick={toggleRepeat} title="Repetir variado"><Icon name="repeat" size={23} /><small>REPETIR</small></button>
          <button className="control" onClick={prev} disabled={!ready || queue.length < 2} title="Anterior"><Icon name="prev" size={28} /><small>ANTERIOR</small></button>
          <button className="main-play" onClick={togglePlay} disabled={!ready || !queue.length} title={playing ? "Pausa" : "Reproducir"}><Icon name={playing ? "pause" : "play"} size={30} /></button>
          <button className="control" onClick={next} disabled={!ready || queue.length < 2} title="Siguiente"><Icon name="next" size={28} /><small>SIGUIENTE</small></button>
          <div className="volume-control"><Icon name="volume" size={22} /><input type="range" min="0" max="100" value={volume} onChange={changeVolume} /><span>{volume}%</span></div>
        </section>
      </main>

      <footer className="statusbar">
        <div className="status-left"><span className={`status-dot ${ready ? "connected" : ""}`} />{ready ? "Reproduciendo desde YouTube" : "Conectando con YouTube…"}</div>
        <button className="settings-btn" onClick={() => setSettingsOpen((v) => !v)}><Icon name="gear" size={18} /> Ajustes</button>
      </footer>

      {settingsOpen && (
        <div className="settings-popover">
          <div className="settings-title"><strong>Ajustes rápidos</strong><button onClick={() => setSettingsOpen(false)}>×</button></div>
          <label><span>Repetir automáticamente</span><input type="checkbox" checked={repeat} onChange={toggleRepeat} /></label>
          <div className="settings-note">Los botones Anterior/Siguiente cambian entre los mixes largos cargados en cada categoría.</div>
        </div>
      )}
    </div>
  );
}
