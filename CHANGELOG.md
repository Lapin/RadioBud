# Changelog

All notable changes to RadioBud will be documented in this file.

## [Unreleased]

### Added
- Initial Electron-based desktop radio application
- Support for 36 SomaFM stations with dropdown selector
- Dual audio element system for smooth cross-fade transitions
- Play/Stop controls with fade effects:
  - 1000ms fade-in when playing
  - 500ms fade-out when stopping
  - 1000ms cross-fade when switching stations
- Now playing display showing current track (Artist - Title)
- Integration with SomaFM JSON API for track metadata
- Auto-refresh of now playing info every 30 seconds
- Minimalist white theme with left-aligned layout
- Always-on-top window (300x180px)
- Station-specific stream URLs for optimal quality

### Technical
- Plain ES6+ JavaScript (no TypeScript)
- HTML5 Audio API for streaming
- Asynchronous API calls for track information
- Dual audio element architecture prevents audio gaps during station changes
- No external dependencies beyond Electron

## [0.1.0] - Initial Release

### Features
- Stream 36 SomaFM radio stations
- Smooth audio transitions with cross-fading
- Real-time track information display
- Clean, minimal user interface
