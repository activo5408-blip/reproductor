import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

const CATEGORIES = [
  {
    id: "regueton", label: "Reguetón", eyebrow: "CUBANO · ACTUAL", icon: "music", color: "#9b5cff",
    description: "Reparto y reguetón cubano actual",
    items: [
      { videoId: "lW4juTEKDEI", title: "REPARTO CUBANO 2026 MIX — Ya Ice Dilan, Bebeshito, Rey Tony & más", channel: "JairoDj Productions", durationLabel: "30+ min", published: "2026" },
      { videoId: "hKcOuEVhsXQ", title: "Reparto Cubano 2026 Mix — Lo último: Payaso x Ley, Bebeshito, Ya Ice Dilan", channel: "Reparto.cu24", durationLabel: "1 h+", published: "2026" },
    ],
  },
  {
    id: "romantico", label: "Romántico", eyebrow: "MIX · ACTUAL", icon: "heart", color: "#ff3f88",
    description: "Románticas actuales, no cubanas",
    items: [
      { videoId: "R21N0zOg2LA", title: "RNB Romantic Mix 2026 — Love & Smooth Soul", channel: "Seduction Groove", durationLabel: "5 h", published: "2026" },
      { videoId: "MCD-d2WvK74", title: "Uzbek Romantic Love Songs 2026 — Emotional Deep Mix", channel: "UzLove Melodia", durationLabel: "1 h+", published: "2026" },
    ],
  },
  {
    id: "bachata", label: "Bachata", eyebrow: "LATINA · ACTUAL", icon: "guitar", color: "#ff8a00",
    description: "Bachata latina actual y romántica",
    items: [
      { videoId: "28ymphJ2C2E", title: "Bachata 2026 1 Hour Mix — Romantic Latin Bachata", channel: "Music_for_the_soul", durationLabel: "1 h", published: "2026" },
    ],
  },
  { id: "favoritos", label: "Favoritos", eyebrow: "TU MÚSICA", icon: "star", color: "#f7c948", description: "Tus videos guardados", items: [] },
];

const FAVORITES_KEY = "yt-variados-favoritos";

const Icon = ({ name, size = 22 }) => {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "music": return <svg {...common}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
    case "heart": return <svg {...common} fill="currentColor" stroke="none"><path d="M12 21s-6.7-4.3-9.4-8.2C.7 9.9 1.5 6.4 4.4 5c2.3-1.1 4.8-.2 6.1 1.7C11.8 4.8 14.3 3.9 16.6 5c2.9 1.4 3.7 4.9 1.8 7.8C18.7 16.7 12 21 12 21z"/></svg>;
    case "guitar": return <svg {...common}><circle cx="8" cy="16" r="4"/><path d="M11 13l7-7"/><path d="M16 4l4 4"/><path d="M14 6l1.5 1.5"/><path d="M17 3l1.5 1.5"/></svg>;
    case "star": return <svg {...common}><path d="M12 2l3 6.4 7 .7-5.2 4.7 1.5 6.8L12 17.3 5.7 20.6l1.5-6.8L2 9.1l7-.7L12 2z"/></svg>;
    case "search": return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
    case "prev": return <svg {...common} fill="currentColor" stroke="none"><path d="M6 6h2v12H6zM20 6l-10 6 10 6z"/></svg>;
    case "next": return <svg {...common} fill="currentColor" stroke="none"><path d="M16 6h2v12h-2zM4 6l10 6-10 6z"/></svg>;
    case "play": return <svg {...common} fill="currentColor" stroke="none"><path d="M7 5l12 7-12 7z"/></svg>;
    case "pause": return <svg {...common} fill="currentColor" stroke="none"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>;
    case "repeat": return <svg {...common}><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>;
    case "volume": return <svg {...common}><path d="M4 9v6h4l5 5V4L8 9H4z"/><path d="M17 8a5 5 0 0 1 0 8"/></svg>;
    case "gear": return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
  }
  return null;
};

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
};

export default function App() {
  const playerRef = useRef(null);
  const playerElRef = useRef(null);
  const timerRef = useRef(null);
  const requestRef = useRef(0);
  const queueRef = useRef([]);
  const indexRef = useRef(-1);
  const volumeRef = useRef(80);
  const repeatRef = useRef(true);
  const [ready, setReady] = useState(false);
  const [activeCategory, setActiveCategory] = useState("regueton");
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState("Selecciona un variado");
  const [channel, setChannel] = useState("YouTube");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [repeat, setRepeat] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("Esperando YouTube…");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const currentItem = queue[currentIndex] || null;
  const category = useMemo(() => CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0], [activeCategory]);

  const stopTimer = useCallback(() => { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; }, []);
  const syncPlayer = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      setCurrentTime(p.getCurrentTime?.() || 0);
      setDuration(p.getDuration?.() || 0);
      const data = p.getVideoData?.();
      if (data?.title) setTitle(data.title);
      if (data?.author) setChannel(data.author);
    } catch {}
  }, []);
  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(syncPlayer, 300);
  }, [stopTimer, syncPlayer]);

  const setCurrent = useCallback((items, index) => {
    queueRef.current = items;
    indexRef.current = index;
    setQueue(items);
    setCurrentIndex(index);
    const item = items[index];
    setTitle(item?.title || "Selecciona un variado");
    setChannel(item?.channel || "YouTube");
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const loadIndex = useCallback((index) => {
    const p = playerRef.current;
    const items = queueRef.current;
    if (!p || !items.length || index < 0 || index >= items.length) return;
    const item = items[index];
    const request = ++requestRef.current;
    indexRef.current = index;
    setCurrentIndex(index);
    setCurrentTime(0);
    setDuration(0);
    setTitle(item.title);
    setChannel(item.channel);
    setMessage("Cargando…");
    try {
      p.loadVideoById({ videoId: item.videoId, startSeconds: 0 });
      window.setTimeout(() => {
        if (request !== requestRef.current) return;
        try { p.setVolume(volumeRef.current); } catch {}
      }, 250);
    } catch {
      if (request === requestRef.current) setMessage("No se pudo cargar este video.");
    }
  }, []);

  const next = useCallback(() => {
    const items = queueRef.current;
    if (!items.length) return;
    const nextIndex = indexRef.current + 1;
    if (nextIndex < items.length) loadIndex(nextIndex);
    else if (repeatRef.current) loadIndex(0);
    else { setPlaying(false); setMessage("Variado terminado."); }
  }, [loadIndex]);

  const prev = useCallback(() => {
    const items = queueRef.current;
    if (!items.length) return;
    const prevIndex = Math.max(0, indexRef.current - 1);
    loadIndex(prevIndex);
  }, [loadIndex]);

  const onStateChange = useCallback((e) => {
    const S = window.YT?.PlayerState;
    if (!S) return;
    if (e.data === S.PLAYING) { setPlaying(true); setMessage(""); syncPlayer(); startTimer(); }
    else if (e.data === S.PAUSED) { setPlaying(false); syncPlayer(); stopTimer(); }
    else if (e.data === S.BUFFERING) { setMessage("Cargando…"); }
    else if (e.data === S.ENDED) { setPlaying(false); stopTimer(); next(); }
    else if (e.data === S.CUED) { syncPlayer(); }
  }, [next, startTimer, stopTimer, syncPlayer]);

  const initPlayer = useCallback(() => {
    if (!window.YT?.Player || !playerElRef.current || playerRef.current) return;
    const origin = window.location.origin;
    playerRef.current = new window.YT.Player(playerElRef.current, {
      width: "1", height: "1",
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, modestbranding: 1, rel: 0, playsinline: 1, enablejsapi: 1, origin },
      events: {
        onReady: () => {
          setReady(true); setMessage("Listo para reproducir");
          try { playerRef.current.setVolume(volumeRef.current); } catch {}
        },
        onStateChange,
        onError: () => {
          const request = requestRef.current;
          setPlaying(false); stopTimer(); setMessage("Este video no está disponible. Probando otro…");
          window.setTimeout(() => { if (request === requestRef.current) next(); }, 700);
        },
        onAutoplayBlocked: () => setMessage("Pulsa reproducir para iniciar YouTube."),
      },
    });
  }, [next, onStateChange, stopTimer]);

  useEffect(() => {
    try { const raw = localStorage.getItem(FAVORITES_KEY); if (raw) setFavorites(JSON.parse(raw)); } catch {}
  }, []);

  useEffect(() => {
    if (window.YT?.Player) { initPlayer(); return; }
    const old = window.onYouTubeIframeAPIReady;
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);
    window.onYouTubeIframeAPIReady = () => { old?.(); initPlayer(); };
    return () => { window.onYouTubeIframeAPIReady = old || null; stopTimer(); };
  }, [initPlayer, stopTimer]);

  useEffect(() => () => { stopTimer(); try { playerRef.current?.destroy(); } catch {} }, [stopTimer]);

  const playItems = useCallback((items, categoryId, index = 0) => {
    if (!ready || !items.length) return;
    requestRef.current += 1;
    setActiveCategory(categoryId);
    setCurrent(items, index);
    loadIndex(index);
  }, [loadIndex, ready, setCurrent]);

  const playCategory = useCallback((cat) => {
    if (cat.id === "favoritos") {
      if (!favorites.length) { setActiveCategory("favoritos"); setCurrent([], -1); setMessage("Todavía no tienes favoritos ⭐"); setPlaying(false); return; }
      playItems(favorites, "favoritos", 0);
    } else playItems(cat.items, cat.id, 0);
  }, [favorites, playItems, setCurrent]);

  const playAt = (index) => loadIndex(index);
  const togglePlay = () => {
    const p = playerRef.current;
    if (!p || !queueRef.current.length) return;
    try { playing ? p.pauseVideo() : p.playVideo(); } catch { setMessage("Pulsa de nuevo para reproducir."); }
  };
  const seek = (e) => { const t = duration ? Number(e.target.value) : 0; try { playerRef.current?.seekTo(t, true); } catch {} setCurrentTime(t); };
  const changeVolume = (e) => { const v = Number(e.target.value); volumeRef.current = v; setVolume(v); try { playerRef.current?.setVolume(v); } catch {} };
  const toggleRepeat = () => { const v = !repeat; repeatRef.current = v; setRepeat(v); };

  const addFavorite = () => {
    if (!currentItem) return;
    setFavorites((prev) => {
      if (prev.some((x) => x.videoId === currentItem.videoId)) { setMessage("Ya está en favoritos ⭐"); return prev; }
      const updated = [...prev, { ...currentItem, title: title || currentItem.title, channel: channel || currentItem.channel }];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      setMessage("Añadido a favoritos ⭐");
      return updated;
    });
  };
  const removeFavorite = (id) => setFavorites((prev) => { const updated = prev.filter((x) => x.videoId !== id); localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated)); return updated; });

  const filteredQueue = useMemo(() => {
    const q = search.trim().toLowerCase();
    return queue.map((item, index) => ({ item, index })).filter(({ item }) => !q || `${item.title} ${item.channel}`.toLowerCase().includes(q));
  }, [queue, search]);
  const progress = duration ? Math.min(100, Math.max(0, currentTime / duration * 100)) : 0;
  const isFavorite = currentItem && favorites.some((x) => x.videoId === currentItem.videoId);

  const minimize = () => getCurrentWindow().minimize();
  const close = () => getCurrentWindow().close();

  return (
    <div className="app">
      <div ref={playerElRef} className="youtube-host" aria-hidden="true" />
      <header className="topbar" data-tauri-drag-region>
        <div className="brand"><div className="brand-icon"><Icon name="music" size={20}/></div><span><b>Mini</b>Tube</span></div>
        <div className="window-actions"><button onClick={minimize}>—</button><button className="close" onClick={close}>×</button></div>
      </header>

      <main className="main">
        <div className="search-box"><Icon name="search" size={18}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar en este variado…"/><span>{filteredQueue.length}</span></div>

        <section className="category-strip">
          {CATEGORIES.map((cat) => <button key={cat.id} className={`category-btn ${activeCategory === cat.id ? "active" : ""}`} style={{"--cat-color":cat.color}} onClick={() => playCategory(cat)} disabled={!ready}><Icon name={cat.icon} size={22}/><span><small>{cat.eyebrow}</small><strong>{cat.label}</strong></span></button>)}
        </section>

        <section className="now-card">
          <div className="artwork-wrap">
            {currentItem ? <img className="artwork" src={`https://i.ytimg.com/vi/${currentItem.videoId}/hqdefault.jpg`} alt=""/> : <div className="artwork placeholder"><Icon name="music" size={58}/></div>}
            <div className="artwork-glow"/>
          </div>
          <div className="now-meta"><div className="now-label">AHORA SUENA</div><button className={`favorite-btn ${isFavorite ? "saved" : ""}`} onClick={addFavorite} disabled={!currentItem}><Icon name="star" size={19}/></button></div>
          <div className="now-title">{title}</div><div className="now-channel">{channel}</div>
          <div className="waveform">{Array.from({length:28}).map((_,i)=><i key={i} style={{"--h":`${20+((i*23)%70)}%`}}/>)}</div>
          <div className="progress-row"><span>{fmt(currentTime)}</span><input type="range" min="0" max={Math.max(duration,1)} value={Math.min(currentTime,duration||1)} onChange={seek} style={{"--progress":`${progress}%`}} disabled={!duration}/><span>{fmt(duration)}</span></div>
          <div className="message">{message}</div>
        </section>

        <section className="queue-panel">
          <div className="panel-header"><div><span className="panel-kicker">{category.description}</span><strong>Variados disponibles</strong></div><span>{queue.length ? `${Math.max(currentIndex+1,1)}/${queue.length}` : "—"}</span></div>
          <div className="queue-list">
            {!filteredQueue.length ? <div className="empty-state"><Icon name="music" size={34}/><strong>{activeCategory === "favoritos" ? "Sin favoritos" : "Selecciona un variado"}</strong><span>Los mixes largos de YouTube aparecerán aquí.</span></div> : filteredQueue.map(({item,index}) => <button key={`${item.videoId}-${index}`} className={`queue-item ${index===currentIndex?"current":""}`} onClick={() => playAt(index)}>
              <img src={`https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`} alt=""/><span className="queue-play">{index===currentIndex && playing?<Icon name="pause" size={14}/>:<Icon name="play" size={14}/>}</span><span className="queue-text"><strong>{item.title}</strong><small>{item.channel} · {item.published}</small></span><span className="queue-duration">{item.durationLabel}</span>{activeCategory==="favoritos"&&<span className="remove-fav" onClick={(e)=>{e.stopPropagation();removeFavorite(item.videoId)}}>×</span>}
            </button>)}
          </div>
        </section>

        <section className="controls-bar">
          <button className={`control ${repeat?"active":""}`} onClick={toggleRepeat} title="Repetir"><Icon name="repeat" size={20}/></button>
          <button className="control" onClick={prev} disabled={!queue.length}><Icon name="prev" size={25}/></button>
          <button className="main-play" onClick={togglePlay} disabled={!queue.length || !ready}><Icon name={playing?"pause":"play"} size={27}/></button>
          <button className="control" onClick={next} disabled={!queue.length}><Icon name="next" size={25}/></button>
          <div className="volume"><Icon name="volume" size={19}/><input type="range" min="0" max="100" value={volume} onChange={changeVolume}/></div>
        </section>
      </main>

      <footer className="statusbar"><span><i className={ready?"online":""}/>{ready?"YouTube listo":message}</span><button onClick={()=>setSettingsOpen(v=>!v)}><Icon name="gear" size={17}/></button></footer>
      {settingsOpen && <div className="settings-popover"><strong>Ajustes</strong><button onClick={()=>setSettingsOpen(false)}>×</button><p>Repetir: {repeat?"activado":"desactivado"}</p><small>Los botones anterior/siguiente cambian entre mixes completos. Cada mix se reproduce como un video independiente para evitar problemas con las playlists de la API.</small></div>}
    </div>
  );
}
