# SkMusic

Reproductor compacto de escritorio con estilo neon. Reproduce mixes largos de YouTube y permite buscar canciones individuales.

## Funciones

- Reguetón: búsqueda dinámica de reparto/reguetón cubano actual.
- Romántico: mixes internacionales actuales, filtrando resultados con referencias cubanas.
- Bachata: mixes latinos actuales, filtrando resultados con referencias cubanas.
- Cada clic repetido en una categoría consulta una búsqueda diferente y reemplaza la lista por nuevos mixes.
- Se cargan hasta 14 mixes largos por búsqueda (30 minutos o más).
- Buscador de canciones individuales con resultados de YouTube.
- Anterior / siguiente / repetir / play-pausa / volumen / progreso.
- Favoritos persistentes en localStorage.
- Ventana pequeña vertical tipo móvil.
- Modo lateral derecho: la ventana se pega al borde y deja una pestaña; al pasar el ratón por la pestaña vuelve a aparecer.
- Siempre visible sobre otras ventanas para funcionar como mini reproductor.

## Compilación

```bash
npm install
npm run tauri build
```

El workflow de GitHub Actions genera los instaladores NSIS (`.exe`) y MSI como artifacts.

## Búsqueda

La búsqueda de mixes/canciones usa la API pública de Piped para descubrir resultados y YouTube IFrame Player API para reproducir los videos. Piped documenta el endpoint de búsqueda sin autenticación y YouTube documenta `loadVideoById()` para cargar videos concretos.
