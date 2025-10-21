# RadioBud

A minimal desktop radio app for streaming 36+ SomaFM stations with smooth cross-fading transitions.

## Features

- Stream 36 SomaFM radio stations
- Smooth audio cross-fading (1000ms transitions)
- Real-time track information display
- Album artwork with expanded view
- Song history and favorites tracking
- Clean, minimal user interface
- Always-on-top window
- Native macOS window controls

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

3. **Configure API Keys** (required for album artwork):
   
   Open `renderer.js` and add your API keys on lines 79-80:
   
   ```javascript
   const LASTFM_API_KEY = 'your_lastfm_api_key_here';
   const YOUTUBE_API_KEY = 'your_youtube_api_key_here';
   ```

   **Where to get API keys:**
   - **Last.fm API Key**: https://www.last.fm/api/account/create
   - **YouTube API Key**: https://console.cloud.google.com/apis/credentials
     - Create a project → Enable YouTube Data API v3 → Create credentials (API key)

   > **Note**: The app will work without API keys, but album artwork features will be disabled.

4. Run the app:
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

- **Select Station**: Choose from dropdown menu
- **Play/Stop**: Control playback with buttons
- **Volume**: Adjust with slider
- **Album Art**: Click to view expanded view
- **Star Button**: Add current song to favorites
- **Tabs**: Switch between Radio, History, and Favorites

## Tech Stack

- Electron
- HTML5 Audio API
- SomaFM Streaming API
- Last.fm API (album metadata)
- YouTube Data API v3 (thumbnail fallback)

## License

ISC
