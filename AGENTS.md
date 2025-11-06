# Agent Guidelines for RadioBud

## Project Overview
Electron-based desktop radio app for streaming multiple radio providers (SomaFM, NTS Radio) with smooth cross-fading.
- **SomaFM**: 36 continuous music channels
- **NTS Radio**: 2 live channels + 16 themed Infinite Mixtapes (in progress)

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
- `renderer.js`: Dual audio system with cross-fade logic, multi-provider support, favorites/history tracking
- `styles.css`: Minimalist white theme with subtle borders
- `splash.html` + `splash.css`: Splash screen shown if load takes >500ms
- `providers/`: Radio provider modules (SomaFM, NTS Radio - in progress)
- **Stations**: 36 SomaFM stations + 18 NTS streams via dropdown
- **APIs**: 
  - SomaFM: `https://somafm.com/songs/{station}.json` (track-based)
  - NTS: `https://www.nts.live/api/v2/live` (show-based, in progress)
- **Storage**: localStorage for history (last 100 items) and favorites
- **Album Art**: iTunes Search API (primary) + Last.fm API (fallback) + Native NTS artwork

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
- **Multi-provider architecture**: Use provider pattern for radio sources (see notes/NTS_IMPLEMENTATION.md)
- **Metadata normalization**: Track-based (SomaFM) vs show-based (NTS) content requires normalization

## Project Organization & File Structure
- **Keep root directory clean**: Only essential files (package.json, main.js, index.html, etc.)
- **Internal notes go in `notes/` folder**: Implementation plans, research, TODO lists, status reports
  - `notes/` is gitignored and won't be published
  - Examples: implementation guides, research documents, meeting notes
- **Code organization**:
  - `providers/` - Radio provider modules (SomaFM, NTS, etc.)
  - `styles.css` - All styles in one file (no CSS folder for MVP)
  - `renderer.js` - Main renderer process logic
  - `main.js` - Electron main process
- **NEVER create non-essential files in root**:
  - ❌ Don't create: status.md, TODO.md, notes.txt, research.md in root
  - ✅ Instead: Put all notes in `notes/` folder
- **Documentation that belongs in root**:
  - README.md (user-facing)
  - CHANGELOG.md (user-facing release notes)
  - AGENTS.md (development guidelines - this file)
  - LICENSE (if applicable)
- **Always maintain tidy structure**: Before creating any file, ask "Is this user-facing or internal?"
  - User-facing → Root or appropriate folder
  - Internal/planning → `notes/` folder

## Session Notes Management (IMPORTANT)
- **When user says "wrap up for this day/session"**: 
  1. Create a dated folder in `notes/` with format: `YYYY-MM-DD-brief-description/`
     - Example: `2025-11-06-nts-radio-integration/`
  2. Move ALL session-related notes into this folder
  3. Keep notes organized chronologically by session date
  4. This prevents `notes/` from becoming cluttered over time
- **Folder naming convention**:
  - Format: `YYYY-MM-DD-descriptive-name/`
  - Use kebab-case for description
  - Be concise but clear about what was accomplished
  - Examples:
    - `2025-11-06-nts-radio-integration/`
    - `2025-11-10-bug-fixes-and-testing/`
    - `2025-11-15-shazam-feature-implementation/`
- **What to archive**: ALL notes created during that session
  - Implementation plans
  - Status reports
  - Error logs
  - Assessment documents
  - Research findings
  - Any other .md files created during the session
- **What NOT to archive**: Files needed for ongoing reference
  - None currently - archive everything from each session
