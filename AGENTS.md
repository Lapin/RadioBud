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
- `main.js`: Electron main process, 300x400px window (no longer always-on-top)
- `index.html`: Tabbed UI (Radio/History/Favorites) with left-aligned controls
- `renderer.js`: Dual audio system with cross-fade logic, SomaFM API integration, favorites/history tracking
- `styles.css`: Minimalist white theme with subtle borders
- `splash.html` + `splash.css`: Splash screen shown if load takes >500ms
- **Stations**: 36 SomaFM stations via dropdown (groovesalad, dronezone, etc.)
- **API**: Fetches now playing from `https://somafm.com/songs/{station}.json`
- **Storage**: localStorage for history (last 100 songs) and favorites
- **Album Art**: iTunes Search API (primary) + Last.fm API (fallback)

## Audio Fade Timings
- **Play**: 1000ms fade-in from silence (20 steps × 50ms)
- **Stop**: 500ms fade-out to silence (10 steps × 50ms)
- **Station switch**: 1000ms cross-fade between stations (20 steps × 50ms)

## Completed Features
- ✓ **Volume slider**: Master volume control (0-100%)
- ✓ **Song history**: Last 100 played songs with timestamps
- ✓ **Favorites**: Star songs and view favorites list
- ✓ **Album artwork**: iTunes + Last.fm APIs with caching
- ✓ **Expanded view**: Click album art for full-size view with gradient background
- ✓ **Service links**: Last.fm, Bandcamp, YouTube search links
- ✓ **Native window**: macOS traffic light controls (red/yellow/green)
- ✓ **Tabbed UI**: Radio, History, Favorites tabs
- ✓ **Dynamic window**: Auto-adjusts height (100-800px)

## Bug Fixes (Recent - v0.2.0)
- ✓ Fixed special characters breaking favorite removal (ID normalization)
- ✓ Fixed HTML injection vulnerability in history/favorites rendering
- ✓ Fixed expand view when no artwork available
- ✓ Added migration system for favorites with old ID format
- ✓ Removed always-on-top behavior
- ✓ Immediate stop on audio device change (no fade-out delay)

## Control Bar Layout
The fixed bottom control bar (70px height) contains:
- **Album Art**: 50x50px clickable thumbnail
- **Info Section**: Song title, star button, metadata, service links (Last.fm, Bandcamp, YouTube)
- **Play Button**: 36x36px circular play/pause toggle
- **Volume Slider**: 60px wide range input (0-100%)

## General Guidelines
- Keep it minimal and lightweight
- Normal window behavior (no longer always-on-top)
- No external dependencies beyond Electron
- Maintain smooth audio transitions with dual audio elements
- Update CHANGELOG.md for all notable changes
- Follow existing fade timing patterns when adding features
- Use array indices for data binding (avoid JSON.stringify in HTML attributes)
- Normalize song IDs to handle special characters (NFD normalization + sanitization)
- Debug files (debug-output-*.txt, main-debug.js) are gitignored
