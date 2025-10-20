# Agent Guidelines for RadioBud

## Project Overview
Electron-based desktop radio app for streaming 36+ SomaFM stations with smooth cross-fading.

## Build/Run Commands
- **Run app**: `npm start` or `npm run dev`
- **Install deps**: `npm install`
- **No build step**: Runs directly with Electron
- **No tests yet**: Add test framework if needed
- **Git**: Repository initialized with CHANGELOG.md tracking all changes

## Code Style
- **JavaScript**: Plain ES6+, no TypeScript (simple MVP)
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **DOM**: Use `getElementById` and `addEventListener` patterns
- **Audio**: Dual HTML5 Audio elements for cross-fade transitions
- **Async**: Use async/await for SomaFM API calls
- **Error handling**: Add error listeners on audio elements
- **Formatting**: 2-space indent, semicolons
- **Comments**: Avoid unnecessary comments unless documenting complex logic

## Architecture
- `main.js`: Electron main process, 300x180px always-on-top window
- `index.html`: Left-aligned UI with dropdown, now playing, and controls
- `renderer.js`: Dual audio system with cross-fade logic, SomaFM API integration
- `styles.css`: Minimalist white theme with subtle borders
- **Stations**: 36 SomaFM stations via dropdown (groovesalad, dronezone, etc.)
- **API**: Fetches now playing from `https://somafm.com/songs/{station}.json`
- **Song History**: API returns array of 10-18 songs (index 0 = most recent)

## Audio Fade Timings
- **Play**: 1000ms fade-in from silence (20 steps × 50ms)
- **Stop**: 500ms fade-out to silence (10 steps × 50ms)
- **Station switch**: 1000ms cross-fade between stations (20 steps × 50ms)

## Planned Features (Assessed)
- ✓ **Volume slider**: Feasible, control audio.volume (0.0-1.0)
- ✓ **SomaFM logo**: Feasible, use station logos or main logo
- ✓ **Song history**: Feasible, display songs[1-5] from API response
- ⚠ **Album artwork**: Limited - SomaFM API doesn't provide, needs external API (Last.fm/MusicBrainz)

## General Guidelines
- Keep it minimal and lightweight
- Always-on-top window by default
- No external dependencies beyond Electron
- Maintain smooth audio transitions with dual audio elements
- Update CHANGELOG.md for all notable changes
- Follow existing fade timing patterns when adding features
