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

### Changed
- Restructured UI with tabbed navigation
- Window now auto-adjusts height (100-800px)
- Now playing section redesigned with album art
- Minimalist white theme maintained throughout
- All content left-aligned
- Play/Stop buttons with improved volume handling

### Technical
- Last.fm API integration for album metadata
- YouTube Data API v3 for thumbnail fallback
- IPC communication for window resizing
- Electron shell integration for external links
- Smart caching system for album artwork
- Dual audio element cross-fade preserved

## [0.1.0] - 2025-01-20

### Features
- Stream 36 SomaFM radio stations
- Smooth audio transitions with cross-fading (1000ms)
- Real-time track information display
- Clean, minimal user interface
- Always-on-top window
