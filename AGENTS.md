# Agent Guidelines for RadioBud

## Project Overview
Electron-based desktop radio app for streaming 36+ SomaFM stations with smooth cross-fading.

## Build/Run Commands
- **Run app**: `npm start` or `npm run dev`
- **Install deps**: `npm install`
- **No build step**: Runs directly with Electron
- **No tests yet**: Add test framework if needed

## Code Style
- **JavaScript**: Plain ES6+, no TypeScript (simple MVP)
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **DOM**: Use `getElementById` and `addEventListener` patterns
- **Audio**: Dual HTML5 Audio elements for cross-fade transitions
- **Async**: Use async/await for SomaFM API calls
- **Error handling**: Add error listeners on audio elements
- **Formatting**: 2-space indent, semicolons

## Architecture
- `main.js`: Electron main process, 300x180px always-on-top window
- `index.html`: Left-aligned UI with dropdown, now playing, and controls
- `renderer.js`: Dual audio system with cross-fade logic, SomaFM API integration
- `styles.css`: Minimalist white theme with subtle borders
- **Stations**: 36 SomaFM stations via dropdown (groovesalad, dronezone, etc.)
- **API**: Fetches now playing from `https://somafm.com/songs/{station}.json`

## Audio Fade Timings
- **Play**: 1000ms fade-in from silence
- **Stop**: 500ms fade-out to silence
- **Station switch**: 1000ms cross-fade between stations

## General Guidelines
- Keep it minimal and lightweight
- Always-on-top window by default
- No external dependencies beyond Electron
- Maintain smooth audio transitions with dual audio elements
