# Changelog

All notable changes to RadioBud will be documented in this file.

## [Unreleased]

## [0.3.0] - 2025-11-06

### Changed
- **Complete front-end rewrite** - Rebuilt HTML and CSS from scratch for improved stability
- Simplified drag region implementation (titlebar only, no body-level conflicts)
- Updated theme toggle class from `dark-theme` to `dark` for consistency
- Refactored tab switching to use `active` class instead of `hidden` class
- Cleaned up JavaScript event listeners and removed debug logging

### Added
- **macOS Glass UI** - Native Big Sur/Ventura glass morphism design with backdrop blur
- **Dark theme support** - Full dark mode with system-native colors and automatic icon switching
- Theme toggle button (sun/moon icon) in titlebar
- Native macOS color palette (tomato red accent #FF6347, system grays)
- Refined typography with SF Pro font and proper letter-spacing
- Smooth transitions (0.15s ease) throughout UI
- 3D button effects with gradients and hover states

### Fixed
- **Fixed all clickability issues** - Buttons, tabs, and controls now respond properly
- Fixed theme toggle not working (drag region was blocking clicks)
- Fixed tab switching conflicts with new class-based system
- Fixed window dragging conflicts with interactive elements
- Resolved webkit-app-region conflicts throughout the application

### Technical
- Removed `-webkit-app-region: drag` from body element
- Applied drag region only to `.titlebar` element
- All interactive elements explicitly set to `-webkit-app-region: no-drag`
- Tab content uses `.active` class instead of `.hidden` for visibility control
- Simplified CSS architecture with clear separation of concerns

## [0.2.1] - 2025-10-28

### Fixed
- Fixed random playback stopping issue with comprehensive error handling
- Added automatic stream recovery when audio errors occur (up to 3 retries)
- Added stalled stream detection with 10-second timeout and auto-recovery
- Added monitoring for unexpected pauses with automatic resume
- Added handling for unexpected stream end events with auto-restart
- Improved audio device change detection (only stops on device removal, not addition)
- Added detailed error logging with error codes, network state, and ready state
- Added event handlers for `stalled`, `waiting`, `playing`, `suspend`, `abort`, `pause`, and `ended` events

### Changed
- Audio elements now use `preload='auto'` for better buffering
- Device change handler now differentiates between device addition and removal
- Error recovery includes exponential backoff with 2-second retry delay
- Added error count tracking with 5-second window for rate limiting

## [0.2.0] - 2025-10-22

### Added
- Album artwork on favorites list (40x40px thumbnails with async loading)
- Service links (Last.fm, Bandcamp, YouTube) in favorites list
- iTunes metadata display (album name, release year, genre) below now playing song
- Favorites list now sorted by newest first (most recently favorited at top)
- Expanded view now works with "No Artwork" placeholder (styled gray box)
- Migration system for favorites with old ID format (automatic on load)
- Auto-stop playback when audio output device changes (e.g., switching from speakers to headphones)
- iTunes metadata caching for offline performance

### Fixed
- Fixed inability to remove favorites with special characters (Aleksander Zacepin bug)
- Fixed HTML injection vulnerability when rendering history/favorites with quotes
- Fixed song ID generation to normalize Unicode (NFD) and handle special characters
- Fixed expanded view crash when no artwork available
- Fixed array index-based data binding (safer than JSON.stringify in HTML attributes)

### Changed
- Removed always-on-top window behavior (now behaves like normal app window)
- Improved favorites rendering with async album art loading
- Enhanced error handling for device change detection

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
- iTunes metadata caching (album, year, genre, track URL)
- Last.fm API for fallback album metadata (free public key)
- Removed YouTube Data API (security/cost concerns for public distribution)
- IPC communication for window resizing
- Electron shell integration for external links
- Smart caching system for album artwork and metadata
- Dual audio element cross-fade preserved
- Canvas API for color extraction from album artwork
- Event listener optimization (changed .on() to .once())
- Smart splash screen timing with load detection
- electron-builder integration for creating distributable executables
- Build support for Mac (.app, .dmg), Windows (.exe), and Linux (AppImage, .deb)
- Removed unused colorthief dependency to simplify build process
- Array index-based data binding (safer than JSON.stringify in attributes)
- Unicode normalization (NFD) for song ID generation
- Favorites migration system with versioning
- Navigator MediaDevices API for audio device change detection

## [0.1.0] - 2025-01-20

### Features
- Stream 36 SomaFM radio stations
- Smooth audio transitions with cross-fading (1000ms)
- Real-time track information display
- Clean, minimal user interface
- Always-on-top window
