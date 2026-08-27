# Reproductor YouTube - Variados 🎵

App de escritorio para Windows hecha con **React + Tauri** que reproduce
mixes de YouTube por categoría (Reguetón, Romántico, Bachata, Favoritos)
con controles propios (play/pause, anterior, siguiente, barra de progreso,
volumen), sin necesidad de abrir el navegador.

## Cómo funciona el "reproducir directo de YouTube"

Cada botón de categoría dispara una **búsqueda real en YouTube** usando la
YouTube IFrame Player API oficial (`listType: "search"`), que no requiere
API key. El reproductor de YouTube corre oculto (0x0) y toda la interfaz
que ves (botones, barra de progreso, volumen) es una capa propia que lo
controla. Podés cambiar los términos de búsqueda de cada categoría en
`src/App.jsx`, dentro del array `CATEGORIES`.

"Favoritos" guarda localmente (en el dispositivo) los videos que agregues
con el botón ⭐ mientras suenan.

## Requisitos para compilar en tu PC

- [Node.js 20+](https://nodejs.org)
- [Rust](https://www.rust-lang.org/tools/install)
- En Windows: "Desktop development with C++" (Build Tools de Visual Studio),
  que instala el instalador de Rust si no lo tenés.

## Desarrollo local

```bash
npm install
npm run tauri dev
```

## Íconos

El proyecto ya incluye los íconos necesarios dentro de `src-tauri/icons/`,
por lo que GitHub Actions puede compilar directamente sin generar nada antes.
Si querés sustituir el icono, podés regenerarlo con Tauri usando un PNG
cuadrado de 1024x1024.

## Compilar el instalador de Windows en tu PC

```bash
npm run tauri build
```

El instalador (`.msi` y `.exe` de NSIS) queda en:
`src-tauri/target/release/bundle/`

## Compilar automáticamente en GitHub (sin instalar nada)

Este repo ya incluye `.github/workflows/build.yml`. Al subirlo a GitHub:

1. Creá un repositorio nuevo y subí esta carpeta completa.
2. Generá y subí los íconos (paso anterior) **antes** de pushear, o el
   build va a fallar.
3. Andá a la pestaña **Actions** del repo: el workflow corre solo en cada
   push a `main`, o manualmente con el botón "Run workflow".
4. Para publicar una release con el instalador adjunto, creá un tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   El workflow sube el `.msi`/`.exe` como *draft release* en GitHub, listo
   para descargar.

## Estructura del proyecto

```
├── src/                  # Frontend React
│   ├── App.jsx           # UI + lógica del reproductor
│   └── App.css           # Estilos (igual a la imagen de referencia)
├── src-tauri/             # Backend Rust / config nativa de Windows
│   ├── src/main.rs
│   ├── tauri.conf.json    # tamaño de ventana, íconos, targets (nsis/msi)
│   └── capabilities/      # permisos de la ventana
└── .github/workflows/     # compilación automática para Windows
```

## Notas

- La ventana es **sin bordes nativos** (`decorations: false`), con una
  barra de título propia (minimizar / cerrar) igual a la de la imagen.
- El uso de contenido de YouTube dentro de la app debe respetar los
  [Términos de Servicio de YouTube](https://www.youtube.com/t/terms);
  esta app usa la IFrame API oficial, no descarga ni redistribuye video.
