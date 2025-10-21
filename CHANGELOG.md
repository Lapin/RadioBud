# Changelog

All notable changes to RadioBud will be documented in this file.

## [Unreleased]

### Added
- Three main tabs: Radio, History, Favorites
- Volume slider with master volume control
- Album artwork display (80x80px) with cascading fallback:
  - Primary: Last.fm API for album artwork
  - Fallback: YouTube API for video thumbnails
  - Final: "No Artwork" placeholder
- Clickable album art with expanded view (280x280px):
  - Click album artwork to open expanded view overlay
  - Color-extracted gradient background from album art
  - Song info, star button, and play/stop controls
  - Smooth fade-in/fade-out transitions
  - Close with X button, clicking outside, or ESC key
- Song history tracking (last 100 songs played)
- Favorites system with star icons
- Service links with icons (Last.fm, Bandcamp, YouTube)
- Smart time formatting:
  - "X minutes ago" for < 1 hour
  - "X hours ago" for < 24 hours
  - "yesterday, HH:MM" for 1 day ago
  - "DDMM" format for 2+ days ago
- Dynamic window resizing based on content
- localStorage persistence for history and favorites
- Radio source dropdown (prepared for future radio services)
- Splash screen with pulsating "RadioBud" text
  - Only shows if initial load takes >500ms
  - Smooth fade-out transition to main app
- Native macOS traffic light window controls (red/yellow/green)
  - Appear when cursor is inside window
  - Frameless window with hiddenInset titleBarStyle
  - "RadioBud" title text centered at top

### Changed
- Restructured UI with tabbed navigation
- Window now auto-adjusts height (100-800px)
- Now playing section redesigned with album art
- Minimalist white theme maintained throughout
- All content left-aligned
- Play/Stop buttons with improved volume handling
- Removed OS default gray title bar for cleaner look
- Container padding adjusted for title bar space (25px top)

### Technical
- iTunes Search API for primary album artwork (no API key required)
- Last.fm API for fallback album metadata (free public key)
- Removed YouTube Data API (security/cost concerns for public distribution)
- IPC communication for window resizing
- Electron shell integration for external links
- Smart caching system for album artwork
- Dual audio element cross-fade preserved
- Canvas API for color extraction from album artwork
- Event listener optimization (changed .on() to .once())
- Smart splash screen timing with load detection
- electron-builder integration for creating distributable executables
- Build support for Mac (.app, .dmg), Windows (.exe), and Linux (AppImage, .deb)
- Removed unused colorthief dependency to simplify build process

## [0.1.0] - 2025-01-20

### Features
- Stream 36 SomaFM radio stations
- Smooth audio transitions with cross-fading (1000ms)
- Real-time track information display
- Clean, minimal user interface
- Always-on-top window
