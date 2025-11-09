# RadioBud

A beautiful desktop radio app for streaming 54+ radio stations (36 SomaFM + 18 NTS Radio) with smooth cross-fading transitions and native macOS glass UI.

![RadioBud Screenshot](Screenshot.jpg)

## Features

- **Multi-Provider Support**: Switch between SomaFM and NTS Radio
- **54 Radio Streams**:
  - 36 SomaFM stations with track-based metadata
  - 2 NTS live channels with show information
  - 16 NTS Infinite Mixtapes (curated continuous streams)
- Smooth audio cross-fading (1000ms transitions)
- Real-time metadata:
  - SomaFM: Track info with iTunes metadata (album, year, genre)
  - NTS Live: Show title, host, location, genres
  - NTS Mixtapes: Station name and theme
- Album artwork with automatic fallback
- Song/show history tracking (last 100 items)
- Favorites system with album art and service links
- Auto-stop playback when audio device changes
- Tabbed interface (Radio, History, Favorites)
- Service links: Last.fm, Bandcamp, YouTube search

## Installation

### Option 1: Download Pre-built App (Recommended)

Download the latest release from the [Releases](https://github.com/Lapin/RadioBud/releases) page.

### Option 2: Build from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/Lapin/RadioBud.git
   cd RadioBud
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the app:
   ```bash
   npm start
   ```

## Building Executables

Create standalone executables for distribution:

```bash
# macOS
npm run build:mac        # Creates .app bundle
npm run build:mac:dmg    # Creates .dmg installer

# Windows
npm run build:win        # Creates .exe installer

# Linux
npm run build:linux      # Creates AppImage and .deb
```

Built apps will be in the `dist/` folder.

## Usage

- **Select Provider**: Choose between SomaFM or NTS Radio
- **Select Station**: Pick from 36 SomaFM stations or 18 NTS streams
- **Play/Stop**: Control playback with buttons
- **Volume**: Adjust with slider (0-100%)
- **Star Button**: Add current song/show to favorites
- **Tabs**: Switch between Radio, History, and Favorites
- **Service Links**: Quick access to Last.fm, Bandcamp, and YouTube for each track
- **Device Changes**: Playback automatically stops when switching audio outputs

## Album Artwork

RadioBud fetches album artwork automatically using a cascading fallback system:

1. **NTS Radio**: Native high-quality artwork from NTS API
2. **SomaFM**: iTunes Search API (no API key required)
3. **Fallback**: Last.fm API (uses public demo key, free & safe)
4. **Final**: "No Artwork" placeholder

> **Note**: The app works completely out of the box with no API key configuration needed. Album artwork is provided for free through NTS, iTunes, and Last.fm public APIs.

## Tech Stack

- Electron
- HTML5 Audio API
- Multi-provider architecture (modular radio provider system)
- **SomaFM**: 36 stations, track-based metadata API
- **NTS Radio**: 18 streams (2 live + 16 mixtapes), show-based metadata API
- iTunes Search API (album artwork - no auth required)
- Last.fm API (album metadata fallback - free public key)

## License

ISC
