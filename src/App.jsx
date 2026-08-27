import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { currentMonitor, getCurrentWindow, LogicalPosition } from "@tauri-apps/api/window";

const API_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.adminforge.de",
  "https://pipedapi.reallyaweso.me",
];

const CATEGORY_CONFIG = {
  regueton: {
    label: "Reguetón", eyebrow: "CUBANO · ACTUAL", icon: "music", color: "#9b5cff",
    description: "Reparto y reguetón cubano actual",
    queries: [
      "reparto cubano 2026 mix",
      "reggaeton cubano 2026 mix",
      "reparto cubano 2026 session",
      "reparto cubano actual 2026 mix",
      "reggaeton cubano 2026 playlist mix",
      "reparto cubano nuevo 2026",
    ],
    fallback: [
      { videoId: "lW4juTEKDEI", title: "REPARTO CUBANO 2026 MIX", channel: "JairoDj Productions", durationLabel: "30+ min" },
      { videoId: "hKcOuEVhsXQ", title: "REPARTO CUBANO 2026 MIX — Lo último", channel: "Reparto.cu24", durationLabel: "1 h+" },
    ],
  },
  romantico: {
    label: "Romántico", eyebrow: "MIX · ACTUAL", icon: "heart", color: "#ff3f88",
    description: "Románticas actuales · internacionales",
    excludeCuban: true,
    queries: [
      "romantic songs 2026 mix",
      "romantic latin songs 2026 mix",
      "love songs 2026 mix 1 hour",
      "pop romantico 2026 mix",
      "romantic hits 2026 mix",
      "latin romantic mix 2026",
    ],
    fallback: [
      { videoId: "R21N0zOg2LA", title: "RNB Romantic Mix 2026", channel: "Seduction Groove", durationLabel: "5 h" },
      { videoId: "MCD-d2WvK74", title: "Romantic Love Songs 2026", channel: "UzLove Melodia", durationLabel: "1 h+" },
    ],
  },
  bachata: {
    label: "Bachata", eyebrow: "LATINA · ACTUAL", icon: "guitar", color: "#ff8a00",
    description: "Bachata latina actual · no cubana",
    excludeCuban: true,
    queries: [
      "bachata 2026 mix 1 hour",
      "bachata romantica 2026 mix",
      "bachata latina 2026 mix",
      "bachata hits 2026 mix",
      "bachata nueva 2026 mix",
      "romantic bachata 2026 mix",
    ],
    fallback: [
      { videoId: "28ymphJ2C2E", title: "Bachata 2026 1 Hour Mix", channel: "Music_for_the_soul", durationLabel: "1 h" },
    ],
  },
};

const FAVORITES_KEY = "skmusic-favoritos-v2";
const SEARCH_MIN_CHARS = 2;

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
    case "pin": return <svg {...common}><path d="M12 17v5"/><path d="m8 3 8 0-1 6 3 3H6l3-3z"/></svg>;
  }
  return null;
};

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
};

const parseVideoId = (url = "") => {
  const m = url.match(/[?&]v=([\w-]{11})/) || url.match(/\/watch\/([\w-]{11})/) || url.match(/([\w-]{11})$/);
  return m?.[1] || null;
};

const toItem = (x) => {
  const videoId = parseVideoId(x.url || "");
  if (!videoId || x.type !== "stream") return null;
  return {
    videoId,
    title: x.title || "Sin título",
    channel: x.uploaderName || "YouTube",
    duration: Number(x.duration || 0),
    durationLabel: x.duration ? fmt(x.duration) : "—",
    thumbnail: x.thumbnail || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    published: x.uploaded ? new Date(x.uploaded).getFullYear().toString() : "",
  };
};

async function pipedSearch(query, { longOnly = false, excludeCuban = false } = {}) {
  let lastError = null;
  for (const base of API_INSTANCES) {
    try {
      const url = `${base}/search?q=${encodeURIComponent(query)}&filter=videos`;
      const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let items = (data.items || []).map(toItem).filter(Boolean);
      if (longOnly) items = items.filter((x) => x.duration >= 1800);
      if (excludeCuban) {
        const cuban = /cuba|cubano|cubana|reparto|havana|habana|maykel|bebeshito|yaicdilan|yaisdilan|elkimiko|chucho|chulo|reparto/i;
        items = items.filter((x) => !cuban.test(`${x.title} ${x.channel}`));
      }
      return items;
    } catch (e) { lastError = e; }
  }
  throw lastError || new Error("No hay servidores de búsqueda disponibles");
}

export default function App() {
  const playerRef = useRef(null);
  const playerElRef = useRef(null);
  const timerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const requestRef = useRef(0);
  const queueRef = useRef([]);
  const indexRef = useRef(-1);
  const volumeRef = useRef(80);
  const repeatRef = useRef(true);
  const categoryRoundRef = useRef({ regueton: 0, romantico: 0, bachata: 0 });

  const [ready, setReady] = useState(false);
  const [activeCategory, setActiveCategory] = useState("regueton");
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState("Elige un variado");
  const [channel, setChannel] = useState("YouTube");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [repeat, setRepeat] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [message, setMessage] = useState("Conectando con YouTube…");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [docked, setDocked] = useState(false);
  const [autoHide, setAutoHide] = useState(true);

  const category = activeCategory === "search" ? { label: "Búsqueda", description: "Canciones encontradas en YouTube", color: "#ff2b83" } : activeCategory === "favoritos" ? { label: "Favoritos", description: "Tu música guardada", color: "#f7c948" } : CATEGORY_CONFIG[activeCategory];
  const currentItem = queue[currentIndex] || null;

  const stopTimer = useCallback(() => { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; }, []);
  const syncPlayer = useCallback(() => {
    const p = playerRef.current; if (!p) return;
    try {
      setCurrentTime(p.getCurrentTime?.() || 0);
      setDuration(p.getDuration?.() || 0);
      const data = p.getVideoData?.();
      if (data?.title) setTitle(data.title);
      if (data?.author) setChannel(data.author);
    } catch {}
  }, []);
  const startTimer = useCallback(() => { stopTimer(); timerRef.current = setInterval(syncPlayer, 300); }, [stopTimer, syncPlayer]);

  const setCurrent = useCallback((items, index) => {
    queueRef.current = items; indexRef.current = index;
    setQueue(items); setCurrentIndex(index);
    setTitle(items[index]?.title || "Elige un variado"); setChannel(items[index]?.channel || "YouTube");
    setCurrentTime(0); setDuration(0);
  }, []);

  const loadIndex = useCallback((index) => {
    const p = playerRef.current, items = queueRef.current;
    if (!p || !items.length || index < 0 || index >= items.length) return;
    const item = items[index], request = ++requestRef.current;
    indexRef.current = index; setCurrentIndex(index); setCurrentTime(0); setDuration(0);
    setTitle(item.title); setChannel(item.channel); setMessage("Cargando…");
    try {
      p.loadVideoById({ videoId: item.videoId, startSeconds: 0 });
      setTimeout(() => { if (request === requestRef.current) { try { p.setVolume(volumeRef.current); } catch {} } }, 250);
    } catch { if (request === requestRef.current) setMessage("No se pudo cargar este video."); }
  }, []);

  const next = useCallback(() => {
    const items = queueRef.current; if (!items.length) return;
    const n = indexRef.current + 1;
    if (n < items.length) loadIndex(n);
    else if (repeatRef.current) loadIndex(0);
    else { setPlaying(false); setMessage("Lista terminada."); }
  }, [loadIndex]);
  const prev = useCallback(() => { const items = queueRef.current; if (items.length) loadIndex(Math.max(0, indexRef.current - 1)); }, [loadIndex]);

  const onStateChange = useCallback((e) => {
    const S = window.YT?.PlayerState; if (!S) return;
    if (e.data === S.PLAYING) { setPlaying(true); setMessage(""); syncPlayer(); startTimer(); }
    else if (e.data === S.PAUSED) { setPlaying(false); syncPlayer(); stopTimer(); }
    else if (e.data === S.BUFFERING) setMessage("Cargando…");
    else if (e.data === S.ENDED) { setPlaying(false); stopTimer(); next(); }
    else if (e.data === S.CUED) syncPlayer();
  }, [next, startTimer, stopTimer, syncPlayer]);

  const initPlayer = useCallback(() => {
    if (!window.YT?.Player || !playerElRef.current || playerRef.current) return;
    playerRef.current = new window.YT.Player(playerElRef.current, {
      width: "200", height: "200",
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, modestbranding: 1, rel: 0, playsinline: 1, enablejsapi: 1, origin: window.location.origin },
      events: {
        onReady: () => { setReady(true); setMessage("YouTube listo"); try { playerRef.current.setVolume(volumeRef.current); } catch {} },
        onStateChange,
        onError: () => { const r = requestRef.current; setPlaying(false); stopTimer(); setMessage("Video no disponible · probando siguiente…"); setTimeout(() => { if (r === requestRef.current) next(); }, 650); },
        onAutoplayBlocked: () => setMessage("Pulsa play para iniciar YouTube."),
      },
    });
  }, [next, onStateChange, stopTimer]);

  useEffect(() => {
    try { const raw = localStorage.getItem(FAVORITES_KEY); if (raw) setFavorites(JSON.parse(raw)); } catch {}
  }, []);

  useEffect(() => {
    if (window.YT?.Player) { initPlayer(); return; }
    const previous = window.onYouTubeIframeAPIReady;
    const script = document.createElement("script"); script.src = "https://www.youtube.com/iframe_api"; script.async = true; document.body.appendChild(script);
    window.onYouTubeIframeAPIReady = () => { previous?.(); initPlayer(); };
    return () => { window.onYouTubeIframeAPIReady = previous || null; stopTimer(); };
  }, [initPlayer, stopTimer]);
  useEffect(() => () => { stopTimer(); try { playerRef.current?.destroy(); } catch {} }, [stopTimer]);

  const playItems = useCallback((items, categoryId, index = 0) => {
    if (!ready || !items.length) return;
    requestRef.current += 1; setActiveCategory(categoryId); setSearchMode(false); setCurrent(items, index); loadIndex(index);
  }, [loadIndex, ready, setCurrent]);

  const loadCategory = useCallback(async (id, forceNext = false) => {
    if (id === "favoritos") {
      setActiveCategory("favoritos"); setSearchMode(false);
      if (!favorites.length) { setCurrent([], -1); setPlaying(false); setMessage("Todavía no tienes favoritos ⭐"); }
      else playItems(favorites, "favoritos", 0);
      return;
    }
    if (!ready) return;
    const config = CATEGORY_CONFIG[id];
    let round = categoryRoundRef.current[id] || 0;
    if (forceNext || activeCategory === id) round = (round + 1) % config.queries.length;
    categoryRoundRef.current[id] = round;
    setActiveCategory(id); setSearchMode(false); setLoadingSearch(true); setMessage("Buscando nuevos variados…");
    try {
      let items = await pipedSearch(config.queries[round], { longOnly: true, excludeCuban: config.excludeCuban });
      const unique = new Map(items.map((x) => [x.videoId, x]));
      items = [...unique.values()].slice(0, 14);
      if (!items.length) throw new Error("Sin mixes largos");
      playItems(items, id, 0);
      setMessage(`${items.length} variados cargados`);
    } catch {
      const fallback = config.fallback;
      playItems(fallback, id, 0);
      setMessage("Búsqueda en línea no disponible · usando lista de respaldo");
    } finally { setLoadingSearch(false); }
  }, [activeCategory, favorites, playItems, ready, setCurrent]);

  const searchYouTube = useCallback(async () => {
    const q = search.trim();
    if (q.length < SEARCH_MIN_CHARS) return;
    setLoadingSearch(true); setSearchMode(true); setActiveCategory("search"); setMessage(`Buscando “${q}”…`);
    try {
      let items = await pipedSearch(q);
      const unique = new Map(items.map((x) => [x.videoId, x]));
      items = [...unique.values()].slice(0, 18);
      if (!items.length) { setCurrent([], -1); setMessage("No encontré canciones con ese nombre."); return; }
      setCurrent(items, 0); loadIndex(0); setMessage(`${items.length} resultados`);
    } catch {
      setCurrent([], -1); setMessage("No se pudo consultar la búsqueda. Intenta otra vez.");
    } finally { setLoadingSearch(false); }
  }, [loadIndex, search, setCurrent]);

  const togglePlay = () => {
    const p = playerRef.current; if (!p || !queueRef.current.length) return;
    try { playing ? p.pauseVideo() : p.playVideo(); } catch { setMessage("Pulsa play otra vez."); }
  };
  const seek = (e) => { const t = Number(e.target.value); try { playerRef.current?.seekTo(t, true); } catch {} setCurrentTime(t); };
  const changeVolume = (e) => { const v = Number(e.target.value); volumeRef.current = v; setVolume(v); try { playerRef.current?.setVolume(v); } catch {} };
  const toggleRepeat = () => { const v = !repeat; repeatRef.current = v; setRepeat(v); };
  const addFavorite = () => {
    if (!currentItem) return;
    setFavorites((prev) => {
      if (prev.some((x) => x.videoId === currentItem.videoId)) { setMessage("Ya está en favoritos ⭐"); return prev; }
      const updated = [...prev, { ...currentItem, title: title || currentItem.title, channel: channel || currentItem.channel }];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated)); setMessage("Añadido a favoritos ⭐"); return updated;
    });
  };
  const removeFavorite = (id) => setFavorites((prev) => { const updated = prev.filter((x) => x.videoId !== id); localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated)); return updated; });

  const dockWindow = useCallback(async (hidden = false) => {
    try {
      const win = getCurrentWindow();
      const monitor = await currentMonitor();
      if (!monitor) return;
      const scale = monitor.scaleFactor || 1;
      const work = monitor.workArea;
      const left = work.position.x / scale;
      const top = work.position.y / scale;
      const width = work.size.width / scale;
      const height = work.size.height / scale;
      const winWidth = 360;
      const margin = 8;
      const x = hidden ? left + width - 18 : left + width - winWidth - margin;
      const y = Math.max(top + 8, top + height - 660 - 8);
      await win.setPosition(new LogicalPosition(x, y));
      setDocked(hidden);
    } catch {}
  }, []);

  const showDock = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (docked) dockWindow(false);
  }, [docked, dockWindow]);
  const scheduleHide = useCallback(() => {
    if (!autoHide || settingsOpen) return;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => dockWindow(true), 900);
  }, [autoHide, dockWindow, settingsOpen]);

  useEffect(() => { dockWindow(false); getCurrentWindow().setAlwaysOnTop(true).catch(() => {}); }, [dockWindow]);

  const progress = duration ? Math.min(100, Math.max(0, currentTime / duration * 100)) : 0;
  const isFavorite = currentItem && favorites.some((x) => x.videoId === currentItem.videoId);

  const minimize = () => dockWindow(true);
  const close = () => getCurrentWindow().close();

  return (
    <div className="app" onMouseEnter={showDock} onMouseLeave={scheduleHide}>
      <div ref={playerElRef} className="youtube-host" aria-hidden="true" />
      <button className="peek-tab" onMouseEnter={showDock} title="Mostrar SkMusic"><Icon name="music" size={16}/></button>

      <header className="topbar" data-tauri-drag-region>
        <div className="brand"><div className="brand-icon"><Icon name="music" size={17}/></div><span><b>Sk</b>Music</span></div>
        <div className="window-actions"><button onClick={minimize} title="Ocultar"><span>‹</span></button><button className="close" onClick={close} title="Cerrar">×</button></div>
      </header>

      <main className="main">
        <form className="search-box" onSubmit={(e) => { e.preventDefault(); searchYouTube(); }}>
          <Icon name="search" size={16}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar canción…"/><button type="submit" disabled={loadingSearch || search.trim().length < SEARCH_MIN_CHARS}><Icon name="search" size={15}/></button>
        </form>

        <section className="category-strip">
          {Object.entries(CATEGORY_CONFIG).map(([id, cat]) => <button key={id} className={`category-btn ${activeCategory === id ? "active" : ""}`} style={{"--cat-color":cat.color}} onClick={() => loadCategory(id, activeCategory === id)} disabled={!ready || loadingSearch}><Icon name={cat.icon} size={18}/><span><small>{cat.eyebrow}</small><strong>{cat.label}</strong></span></button>)}
          <button className={`category-btn favorites ${activeCategory === "favoritos" ? "active" : ""}`} style={{"--cat-color":"#f7c948"}} onClick={() => loadCategory("favoritos")} disabled={!ready || loadingSearch}><Icon name="star" size={18}/><span><small>{favorites.length}</small><strong>Favoritos</strong></span></button>
        </section>

        <section className="now-card">
          <div className="artwork-wrap">
            {currentItem ? <img className="artwork" src={currentItem.thumbnail || `https://i.ytimg.com/vi/${currentItem.videoId}/hqdefault.jpg`} alt=""/> : <div className="artwork placeholder"><Icon name="music" size={42}/></div>}
            <button className={`favorite-btn ${isFavorite ? "saved" : ""}`} onClick={addFavorite} disabled={!currentItem}><Icon name="star" size={17}/></button>
          </div>
          <div className="now-title">{title}</div><div className="now-channel">{channel}</div>
          <div className="waveform">{Array.from({length:24}).map((_,i)=><i key={i} style={{"--h":`${20+((i*31)%70)}%`}}/>)}</div>
          <div className="progress-row"><span>{fmt(currentTime)}</span><input type="range" min="0" max={Math.max(duration,1)} value={Math.min(currentTime,duration||1)} onChange={seek} style={{"--progress":`${progress}%`}} disabled={!duration}/><span>{fmt(duration)}</span></div>
          <div className="message">{loadingSearch ? "Buscando…" : message}</div>
        </section>

        <section className="queue-panel">
          <div className="panel-header"><div><span className="panel-kicker">{category.description}</span><strong>{searchMode ? `Resultados · ${search.trim()}` : `${category.label} · variados`}</strong></div><span>{queue.length}</span></div>
          <div className="queue-list">
            {!queue.length ? <div className="empty-state"><Icon name="search" size={28}/><strong>{searchMode ? "Sin resultados" : "Elige un variado"}</strong><span>Busca una canción o toca una categoría.</span></div> : queue.map((item,index) => <button key={`${item.videoId}-${index}`} className={`queue-item ${index===currentIndex?"current":""}`} onClick={() => loadIndex(index)}>
              <img src={item.thumbnail || `https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`} alt=""/><span className="queue-play">{index===currentIndex&&playing?<Icon name="pause" size={12}/>:<Icon name="play" size={12}/>}</span><span className="queue-text"><strong>{item.title}</strong><small>{item.channel}{item.published?` · ${item.published}`:""}</small></span><span className="queue-duration">{item.durationLabel}</span>{activeCategory==="favoritos"&&<span className="remove-fav" onClick={(e)=>{e.stopPropagation();removeFavorite(item.videoId)}}>×</span>}
            </button>)}
          </div>
        </section>

        <section className="controls-bar">
          <button className={`control ${repeat?"active":""}`} onClick={toggleRepeat} title="Repetir"><Icon name="repeat" size={17}/></button>
          <button className="control" onClick={prev} disabled={!queue.length}><Icon name="prev" size={21}/></button>
          <button className="main-play" onClick={togglePlay} disabled={!queue.length||!ready}><Icon name={playing?"pause":"play"} size={23}/></button>
          <button className="control" onClick={next} disabled={!queue.length}><Icon name="next" size={21}/></button>
          <div className="volume"><Icon name="volume" size={16}/><input type="range" min="0" max="100" value={volume} onChange={changeVolume}/></div>
        </section>
      </main>

      <footer className="statusbar"><span><i className={ready?"online":""}/>{ready?"YouTube listo":message}</span><div className="footer-actions"><button className={autoHide?"on":""} onClick={() => setAutoHide(v=>!v)} title="Auto ocultar"><Icon name="pin" size={14}/></button><button onClick={()=>setSettingsOpen(v=>!v)}><Icon name="gear" size={15}/></button></div></footer>
      {settingsOpen && <div className="settings-popover"><strong>SkMusic</strong><button onClick={()=>setSettingsOpen(false)}>×</button><p>Ocultar al lateral: {autoHide?"activado":"desactivado"}</p><small>Cuando está activado, SkMusic se pega al borde derecho y deja una pequeña pestaña. Pasa el ratón por la pestaña para mostrarlo.</small></div>}
    </div>
  );
}
