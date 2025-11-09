# Changelog

All notable changes to RadioBud will be documented in this file.

## [Unreleased]

## [0.4.1] - 2025-11-09

### Fixed
- **Service Links Alignment** - Fixed Last.fm, Bandcamp, and YouTube icons wrapping to next line in favorites list
  - Added proper CSS for inline alignment of service icons
  - Service links now display inline with metadata
- **Provider Switching** - Added 500ms fade-out when switching between SomaFM and NTS Radio
  - Smooth audio transition instead of abrupt stop

### Removed
- **Expanded Album Art View** - Removed non-functional expanded view feature
  - Disabled click handler on album art thumbnail
  - Removed 133 lines of unused overlay code

## [0.4.0] - 2025-11-06

### Added
- **NTS Radio Integration** - Added 18 new radio streams from NTS Radio (www.nts.live)
  - 2 live channels: NTS 1 and NTS 2 with live show information
  - 16 themed Infinite Mixtapes (continuous music streams):
    - Poolside (Balearic, boogie), Slow Focus (Ambient, drone)
    - Low Key (Lo-fi hip-hop), Memory Lane (Psychedelic)
    - 4 To The Floor (House/techno), Island Time (Reggae, dub)
    - The Tube (Post-punk), Sheet Music (Classical)
    - Feelings (Soul, gospel), Expansions (Jazz)
    - Rap House (808s), Labyrinth (Experimental)
    - Sweat (Party music), Otaku (Anime/game OSTs)
    - The Pit (Metal), Field Recordings (Ambience)
- **Multi-Provider Architecture** - Refactored codebase to support multiple radio providers
  - Provider pattern with base interface (`providers/base.js`)
  - SomaFM provider (`providers/somafm.js`) - 36 stations, track-based metadata
  - NTS provider (`providers/nts.js`) - 18 streams, show-based metadata
- **Dynamic Station Dropdown** - Station list updates based on selected radio provider
- **Radio Selector** - New dropdown to switch between SomaFM and NTS Radio
- **Show-Based Metadata Support** - Handles both track-based (SomaFM) and show-based (NTS) content
  - NTS shows display host name, show title, location, and genres
  - Native high-quality artwork from NTS API (256kbps MP3 streams)
- **Enhanced History Tracking** - History entries now include provider and content type (track/show)

### Changed
- Refactored `renderer.js` to use provider-based architecture
- Station dropdown now populated dynamically from selected provider
- History tracking adapted to handle both songs (SomaFM) and shows (NTS)
  - SomaFM: Logs on track change (every ~3 minutes)
  - NTS: Logs on show change (every ~2 hours) to prevent spam
- Cross-fade logic now supports provider switching with graceful stop/start

### Fixed
- **NTS Infinite Mixtape URLs** - Corrected non-sequential mixtape numbers
  - Fixed 404 errors on 11 mixtapes (Island Time, The Tube, Sheet Music, etc.)
  - Updated to actual NTS API mixtape numbering (mixtape21, mixtape26, etc.)

### Technical
- Created `providers/` directory with modular provider system
- NTS API integration: `https://www.nts.live/api/v2/live`
- NTS streams: 256kbps MP3 (higher quality than SomaFM's 128kbps)
- Provider metadata types: 'track' (SomaFM) vs 'show' (NTS)
- Show change detection to prevent history spam with long broadcasts
- Cross-provider audio switching with dual audio element system preserved
- Total stations available: 54 (36 SomaFM + 18 NTS)

## [0.3.0] - 2025-11-06

### Changed
- **Complete front-end rewrite** - Rebuilt HTML and CSS from scratch for improved stability
- Simplified drag region implementation (titlebar only, no body-level conflicts)
- Updated theme toggle class from `dark-theme` to `dark` for consistency
- Refactored tab switching to use `active` class instead of `hidden` class
- Cleaned up JavaScript event listeners and removed debug logging
- Updated donation links to correct URLs (SomaFM and NTS Radio)

### Added
- **macOS Glass UI** - Native Big Sur/Ventura glass morphism design with backdrop blur
- **Dark theme support** - Full dark mode with system-native colors and automatic icon switching
- Theme toggle button (sun/moon icon) in titlebar
- Dismiss button for donation card (session-only, reappears on app restart)
- Native macOS color palette (tomato red accent #FF6347, system grays)
- Refined typography with SF Pro font and proper letter-spacing
- Smooth transitions (0.15s ease) throughout UI
- 3D button effects with gradients and hover states

### Fixed
- **Fixed all clickability issues** - Buttons, tabs, and controls now respond properly
- Fixed theme toggle not working (drag region was blocking clicks)
- Fixed donation links not opening in browser (added `-webkit-app-region: no-drag`)
- Fixed dismiss button not working (added `-webkit-app-region: no-drag`)
- Fixed station dropdown not changing stations (added `-webkit-app-region: no-drag`)
- Fixed "No Artwork" text wrapping in album art display
- Fixed console error with missing `stopBtn` element (removed obsolete stop button code)
- Fixed tab switching conflicts with new class-based system
- Fixed window dragging conflicts with interactive elements
- Resolved webkit-app-region conflicts throughout the application

### Technical
- Removed `-webkit-app-region: drag` from body element
- Applied drag region only to `.titlebar` element
- All interactive elements explicitly set to `-webkit-app-region: no-drag`
- Tab content uses `.active` class instead of `.hidden` for visibility control
- Simplified CSS architecture with clear separation of concerns
- Removed obsolete stop button event listener code
- Fixed donation URLs: `https://somafm.com/support/donate.html` and `https://www.nts.live/supporters`

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
