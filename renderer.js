const SomaFMProvider = require('./providers/somafm.js');
const NTSProvider = require('./providers/nts.js');

const LASTFM_API_KEY = 'b25b959554ed76058ac220b7b2e0a026';
const { shell } = require('electron');

const providers = {
  somafm: new SomaFMProvider(),
  nts: new NTSProvider()
};

let currentProvider = 'somafm';
let currentStation = 'groovesalad';
let currentAudio = new Audio(providers[currentProvider].getStreamUrl(currentStation));
let nextAudio = new Audio();
let isPlaying = false;
let masterVolume = 1.0;
let playHistory = [];
let favorites = [];
let currentSong = null;
let audioContext = null;
let mediaElementSource = null;

const playBtn = document.getElementById('playBtn');
const stationSelect = document.getElementById('stationSelect');
const nowPlaying = document.getElementById('nowPlaying');
const volumeSlider = document.getElementById('volumeSlider');

// Configure audio elements for better streaming
currentAudio.preload = 'auto';
currentAudio.volume = masterVolume;
nextAudio.preload = 'auto';
nextAudio.volume = 0.0;

function loadFromStorage() {
  const savedHistory = localStorage.getItem('radiobudHistory');
  const savedFavorites = localStorage.getItem('radiobudFavorites');
  
  if (savedHistory) {
    try {
      playHistory = JSON.parse(savedHistory);
    } catch (e) {
      console.error('Error loading history:', e);
    }
  }
  
  if (savedFavorites) {
    try {
      favorites = JSON.parse(savedFavorites);
      migrateFavoritesIfNeeded();
    } catch (e) {
      console.error('Error loading favorites:', e);
    }
  }
}

function migrateFavoritesIfNeeded() {
  const migrated = localStorage.getItem('radiobudFavoritesMigrated');
  if (migrated !== 'v2') {
    console.log('Migrating favorites to new ID format...');
    const uniqueFavorites = [];
    const seenIds = new Set();
    
    favorites.forEach(fav => {
      const newId = getSongId(fav);
      if (!seenIds.has(newId)) {
        seenIds.add(newId);
        uniqueFavorites.push(fav);
      }
    });
    
    favorites = uniqueFavorites;
    saveToStorage();
    localStorage.setItem('radiobudFavoritesMigrated', 'v2');
    console.log('Migration complete. Favorites count:', favorites.length);
  }
}

function saveToStorage() {
  localStorage.setItem('radiobudHistory', JSON.stringify(playHistory));
  localStorage.setItem('radiobudFavorites', JSON.stringify(favorites));
}

function getSongId(song) {
  return `${song.artist}-${song.title}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
}

function addToHistory(song) {
  const songId = getSongId(song);
  const existingIndex = playHistory.findIndex(s => getSongId(s) === songId);
  
  if (existingIndex === -1 || playHistory[0].timestamp < Date.now() - 60000) {
    const historyEntry = {
      ...song,
      provider: currentProvider,
      station: currentStation,
      timestamp: Date.now(),
      type: providers[currentProvider].getMetadataType()
    };
    
    playHistory.unshift(historyEntry);
    playHistory = playHistory.slice(0, 100);
    saveToStorage();
  }
}

async function fetchItunesData(artist, title) {
  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const url = `https://itunes.apple.com/search?term=${query}&media=music&entity=song&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const track = data.results[0];
      return {
        artUrl: track.artworkUrl100 ? track.artworkUrl100.replace('100x100', '600x600') : null,
        albumName: track.collectionName || null,
        releaseYear: track.releaseDate ? new Date(track.releaseDate).getFullYear() : null,
        genre: track.primaryGenreName || null,
        trackUrl: track.trackViewUrl || null
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching iTunes data:', error);
    return null;
  }
}


async function fetchLastfmArt(artist, title) {
  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    
    const artUrl = data.track?.album?.image?.find(img => img.size === 'large')?.[`#text`] || null;
    return artUrl && artUrl !== '' ? artUrl : null;
  } catch (error) {
    console.error('Error fetching Last.fm art:', error);
    return null;
  }
}

async function fetchAlbumArt(artist, title) {
  const cacheKey = `art_${artist}_${title}`.toLowerCase().replace(/\s+/g, '_');
  const metaCacheKey = `meta_${artist}_${title}`.toLowerCase().replace(/\s+/g, '_');
  const cached = localStorage.getItem(cacheKey);
  
  if (cached && cached !== 'null') {
    return cached;
  }
  
  const itunesData = await fetchItunesData(artist, title);
  let artUrl = itunesData?.artUrl;
  
  if (itunesData) {
    localStorage.setItem(metaCacheKey, JSON.stringify({
      albumName: itunesData.albumName,
      releaseYear: itunesData.releaseYear,
      genre: itunesData.genre,
      trackUrl: itunesData.trackUrl
    }));
  }
  
  if (!artUrl) {
    artUrl = await fetchLastfmArt(artist, title);
  }
  
  if (artUrl) {
    localStorage.setItem(cacheKey, artUrl);
  } else {
    localStorage.setItem(cacheKey, 'null');
  }
  
  return artUrl;
}

function getTrackMetadata(artist, title) {
  const metaCacheKey = `meta_${artist}_${title}`.toLowerCase().replace(/\s+/g, '_');
  const cached = localStorage.getItem(metaCacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function updateAlbumArt(artUrl) {
  const albumArtEl = document.getElementById('albumArt');
  
  if (artUrl) {
    albumArtEl.innerHTML = `
      <img src="${artUrl}" alt="Album Art" class="album-art-img">
      <div class="expand-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
        </svg>
      </div>
    `;
  } else {
    albumArtEl.innerHTML = '<span class="no-artwork">No Artwork</span>';
  }
  
  // Add click handler to open visualizer
  albumArtEl.onclick = () => {
    if (isPlaying) {
      openVisualizer();
    }
  };
  albumArtEl.style.cursor = isPlaying ? 'pointer' : 'default';
}

function generateServiceLinks(artist, title) {
  const lastfmUrl = `https://www.last.fm/music/${encodeURIComponent(artist.replace(/\s+/g, '+'))}/_/${encodeURIComponent(title.replace(/\s+/g, '+'))}`;
  const bandcampUrl = `https://bandcamp.com/search?q=${encodeURIComponent(`${artist} ${title}`)}`;
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title}`)}`;
  
  return { lastfmUrl, bandcampUrl, youtubeUrl };
}

function updateServiceLinks(artist, title) {
  const { lastfmUrl, bandcampUrl, youtubeUrl } = generateServiceLinks(artist, title);
  
  const lastfmLink = document.getElementById('lastfmLink');
  const bandcampLink = document.getElementById('bandcampLink');
  const youtubeLink = document.getElementById('youtubeLink');
  
  lastfmLink.onclick = (e) => {
    e.preventDefault();
    shell.openExternal(lastfmUrl);
  };
  
  bandcampLink.onclick = (e) => {
    e.preventDefault();
    shell.openExternal(bandcampUrl);
  };
  
  youtubeLink.onclick = (e) => {
    e.preventDefault();
    shell.openExternal(youtubeUrl);
  };
}

async function fetchNowPlaying() {
  try {
    const provider = providers[currentProvider];
    const result = await provider.fetchNowPlaying(currentStation);
    
    if (result) {
      const { artist, title, artwork, showChanged } = result;
      nowPlaying.textContent = `${artist} - ${title}`;
      
      const newSong = {
        artist: artist,
        title: title,
        album: result.album || null
      };
      
      const metadataType = provider.getMetadataType();
      const shouldAddToHistory = metadataType === 'track' 
        ? (isPlaying && currentSong && getSongId(currentSong) !== getSongId(newSong))
        : (isPlaying && showChanged);
      
      if (shouldAddToHistory) {
        addToHistory(newSong);
      }
      
      currentSong = newSong;
      updateStarIcons();
      updateServiceLinks(artist, title);
      
      let artUrl = artwork || null;
      if (!artUrl && metadataType === 'track') {
        artUrl = await fetchAlbumArt(artist, title);
      }
      updateAlbumArt(artUrl);
      updateTrackMetadata(artist, title);
    }
  } catch (error) {
    console.error('Error fetching now playing:', error);
  }
}

function updateTrackMetadata(artist, title) {
  const trackMetaEl = document.getElementById('trackMeta');
  const metadata = getTrackMetadata(artist, title);
  
  if (metadata && (metadata.albumName || metadata.releaseYear || metadata.genre)) {
    const parts = [];
    if (metadata.albumName) parts.push(metadata.albumName);
    if (metadata.releaseYear) parts.push(metadata.releaseYear);
    if (metadata.genre) parts.push(metadata.genre);
    
    trackMetaEl.textContent = parts.join(' • ');
    trackMetaEl.style.display = 'block';
  } else {
    trackMetaEl.textContent = '';
    trackMetaEl.style.display = 'none';
  }
}

function isFavorited(song) {
  const songId = getSongId(song);
  return favorites.some(fav => getSongId(fav) === songId);
}

function toggleFavorite(song) {
  const songId = getSongId(song);
  console.log('Toggling favorite:', song.artist, '-', song.title, '| ID:', songId);
  console.log('Current favorites IDs:', favorites.map(f => getSongId(f)));
  
  const index = favorites.findIndex(fav => getSongId(fav) === songId);
  console.log('Found at index:', index);
  
  if (index === -1) {
    favorites.push({
      ...song,
      station: currentStation || song.station,
      favoritedAt: Date.now()
    });
    console.log('Added to favorites');
  } else {
    favorites.splice(index, 1);
    console.log('Removed from favorites');
  }
  
  saveToStorage();
  updateStarIcons();
  
  if (document.getElementById('favoritesView').classList.contains('hidden') === false) {
    renderFavorites();
  }
}

function updateStarIcons() {
  const starBtn = document.getElementById('starBtn');
  if (starBtn && currentSong) {
    starBtn.textContent = isFavorited(currentSong) ? '★' : '☆';
  }
}

loadFromStorage();
setInterval(fetchNowPlaying, 30000);
fetchNowPlaying();

const starBtn = document.getElementById('starBtn');
const historyContent = document.getElementById('historyContent');
const favoritesContent = document.getElementById('favoritesContent');
const mainTabRadio = document.getElementById('tabRadio');
const mainTabHistory = document.getElementById('tabHistory');
const mainTabFavorites = document.getElementById('tabFavorites');
const radioView = document.getElementById('radioView');
const historyView = document.getElementById('historyView');
const favoritesView = document.getElementById('favoritesView');

starBtn.addEventListener('click', () => {
  if (currentSong) {
    toggleFavorite(currentSong);
  }
});

function switchToTab(tab) {
  mainTabRadio.classList.remove('active');
  mainTabHistory.classList.remove('active');
  mainTabFavorites.classList.remove('active');
  radioView.classList.remove('active');
  historyView.classList.remove('active');
  favoritesView.classList.remove('active');
  
  if (tab === 'radio') {
    mainTabRadio.classList.add('active');
    radioView.classList.add('active');
  } else if (tab === 'history') {
    mainTabHistory.classList.add('active');
    historyView.classList.add('active');
    renderHistory();
  } else if (tab === 'favorites') {
    mainTabFavorites.classList.add('active');
    favoritesView.classList.add('active');
    renderFavorites();
  }
}

mainTabRadio.addEventListener('click', () => switchToTab('radio'));
mainTabHistory.addEventListener('click', () => switchToTab('history'));
mainTabFavorites.addEventListener('click', () => switchToTab('favorites'));


// Expanded view feature removed


function formatTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  }
  
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }
  
  if (diffDays === 1) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `yesterday, ${hours}:${minutes}`;
  }
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}${month}`;
}

function renderHistory() {
  if (playHistory.length === 0) {
    historyContent.innerHTML = '<div class="history-empty">No songs played yet</div>';
    return;
  }
  
  historyContent.innerHTML = playHistory.map((song, index) => {
    const isFav = isFavorited(song);
    const timeStr = formatTime(song.timestamp);
    return `
      <div class="history-item">
        <button class="history-item-star" data-index="${index}">${isFav ? '★' : '☆'}</button>
        <div class="history-item-info">
          <div class="history-item-song">${song.artist} - ${song.title}</div>
          <div class="history-item-meta">${song.station} • ${timeStr}</div>
        </div>
      </div>
    `;
  }).join('');
  
  historyContent.querySelectorAll('.history-item-star').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      const song = playHistory[index];
      toggleFavorite(song);
      renderHistory();
    });
  });
}

function renderFavorites() {
  if (favorites.length === 0) {
    favoritesContent.innerHTML = '<div class="history-empty">No favorites yet</div>';
    return;
  }
  
  const sortedFavorites = [...favorites].sort((a, b) => b.favoritedAt - a.favoritedAt);
  
  favoritesContent.innerHTML = sortedFavorites.map((song, index) => {
    const timeStr = formatTime(song.favoritedAt);
    const { lastfmUrl, bandcampUrl, youtubeUrl } = generateServiceLinks(song.artist, song.title);
    return `
      <div class="history-item history-item-with-art">
        <div class="history-item-album-art" data-index="${index}">
          <span class="no-artwork-small">...</span>
        </div>
        <button class="history-item-star" data-index="${index}">★</button>
        <div class="history-item-info">
          <div class="history-item-song">${song.artist} - ${song.title}</div>
          <div class="history-item-meta">
            ${song.station} • ${timeStr}
            <span class="history-item-links">
              <a class="history-service-icon" data-url="${lastfmUrl}" title="Last.fm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.584 17.21l-.88-2.392s-1.43 1.594-3.573 1.594c-1.897 0-3.244-1.649-3.244-4.288 0-3.382 1.704-4.591 3.381-4.591 2.419 0 3.188 1.567 3.849 3.574l.88 2.75c.88 2.667 2.524 4.8 7.287 4.8 3.408 0 5.716-1.045 5.716-3.79 0-2.227-1.265-3.381-3.624-3.932l-1.759-.385c-1.21-.275-1.567-.77-1.567-1.595 0-.934.742-1.485 1.952-1.485 1.32 0 2.034.495 2.145 1.677l2.749-.33c-.22-2.474-1.924-3.492-4.729-3.492-2.474 0-4.893.935-4.893 3.932 0 1.87.907 3.052 3.188 3.546l1.869.44c1.402.33 1.869.907 1.869 1.704 0 1.017-.99 1.43-2.86 1.43-2.776 0-3.932-1.457-4.591-3.464l-.907-2.75c-1.155-3.573-2.997-4.893-6.653-4.893C2.144 5.333 0 7.89 0 12.233c0 4.18 2.144 6.434 5.993 6.434 3.106 0 4.591-1.457 4.591-1.457z"/>
                </svg>
              </a>
              <a class="history-service-icon" data-url="${bandcampUrl}" title="Bandcamp">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 18.75l7.437-13.5h16.563l-7.438 13.5z"/>
                </svg>
              </a>
              <a class="history-service-icon" data-url="${youtubeUrl}" title="YouTube">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  favoritesContent.querySelectorAll('.history-item-star').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      const song = sortedFavorites[index];
      toggleFavorite(song);
      renderFavorites();
    });
  });
  
  favoritesContent.querySelectorAll('.history-service-icon').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const url = e.currentTarget.dataset.url;
      shell.openExternal(url);
    });
  });
  
  sortedFavorites.forEach(async (song, index) => {
    const artUrl = await fetchAlbumArt(song.artist, song.title);
    const artEl = favoritesContent.querySelector(`.history-item-album-art[data-index="${index}"]`);
    if (artEl) {
      if (artUrl) {
        artEl.innerHTML = `<img src="${artUrl}" alt="Album Art" class="history-item-art-img">`;
      } else {
        artEl.innerHTML = '<span class="no-artwork-small">—</span>';
      }
    }
  });
}

volumeSlider.addEventListener('input', (e) => {
  masterVolume = e.target.value / 100;
  if (isPlaying) {
    currentAudio.volume = masterVolume;
  }
});

function updatePlayButtonIcon() {
  const playIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  const pauseIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>`;
  playBtn.innerHTML = isPlaying ? pauseIcon : playIcon;
}

playBtn.addEventListener('click', () => {
  if (isPlaying) {
    // Stop playback
    const fadeSteps = 10;
    const fadeInterval = 50;
    let step = 0;
    
    const fadeOutTimer = setInterval(() => {
      step++;
      const progress = step / fadeSteps;
      currentAudio.volume = Math.max(0, masterVolume * (1 - progress));
      
      if (step >= fadeSteps) {
        clearInterval(fadeOutTimer);
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio.volume = masterVolume;
        isPlaying = false;
        updatePlayButtonIcon();
      }
    }, fadeInterval);
  } else {
    // Start playback - reload stream to get live feed
    const streamUrl = providers[currentProvider].getStreamUrl(currentStation);
    currentAudio.src = streamUrl;
    currentAudio.load();
    currentAudio.volume = 0;
    currentAudio.play();
    isPlaying = true;
    updatePlayButtonIcon();
    
    const fadeSteps = 20;
    const fadeInterval = 50;
    let step = 0;
    
    const fadeInTimer = setInterval(() => {
      step++;
      const progress = step / fadeSteps;
      currentAudio.volume = Math.min(masterVolume, progress * masterVolume);
      
      if (step >= fadeSteps) {
        clearInterval(fadeInTimer);
        currentAudio.volume = masterVolume;
      }
    }, fadeInterval);
  }
});

// Initialize button icon on load
updatePlayButtonIcon();

async function switchStation(newStation, newProvider = null) {
  if (newProvider && newProvider !== currentProvider) {
    currentProvider = newProvider;
    populateStationDropdown();
  }
  
  currentStation = newStation;
  
  const streamUrl = providers[currentProvider].getStreamUrl(currentStation);
  nextAudio.src = streamUrl;
  nextAudio.load();
  fetchNowPlaying();
  
  if (!isPlaying) {
    return;
  }
  
  try {
    await nextAudio.play();
    
    const fadeSteps = 20;
    const fadeInterval = 50;
    let step = 0;
    
    const fadeTimer = setInterval(() => {
      step++;
      const progress = step / fadeSteps;
      
      currentAudio.volume = Math.max(0, masterVolume * (1 - progress));
      nextAudio.volume = Math.min(masterVolume, masterVolume * progress);
      
      if (step >= fadeSteps) {
        clearInterval(fadeTimer);
        currentAudio.pause();
        currentAudio.volume = masterVolume;
        
        const temp = currentAudio;
        currentAudio = nextAudio;
        nextAudio = temp;
      }
    }, fadeInterval);
  } catch (error) {
    console.error('Error switching station:', error);
  }
}

function populateStationDropdown() {
  const provider = providers[currentProvider];
  const stationNames = provider.getStationNames();
  const stationIds = Object.keys(stationNames);
  
  stationSelect.innerHTML = '';
  stationIds.forEach(stationId => {
    const option = document.createElement('option');
    option.value = stationId;
    option.textContent = stationNames[stationId];
    stationSelect.appendChild(option);
  });
  
  currentStation = stationIds[0];
  stationSelect.value = currentStation;
}

const radioSelect = document.getElementById('radioSelect');
if (radioSelect) {
  radioSelect.addEventListener('change', (e) => {
    const newProvider = e.target.value;
    if (newProvider !== currentProvider) {
      if (isPlaying) {
        // Fade out current audio before switching provider
        const fadeSteps = 10;
        const fadeInterval = 50;
        let step = 0;
        
        const fadeOutTimer = setInterval(() => {
          step++;
          const progress = step / fadeSteps;
          currentAudio.volume = Math.max(0, masterVolume * (1 - progress));
          
          if (step >= fadeSteps) {
            clearInterval(fadeOutTimer);
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio.volume = masterVolume;
            isPlaying = false;
            updatePlayButtonIcon();
            
            // Now switch provider
            currentProvider = newProvider;
            populateStationDropdown();
            fetchNowPlaying();
          }
        }, fadeInterval);
      } else {
        currentProvider = newProvider;
        populateStationDropdown();
        fetchNowPlaying();
      }
    }
  });
}

stationSelect.addEventListener('change', (e) => {
  switchStation(e.target.value);
});

populateStationDropdown();

// Enhanced error handling with recovery
let audioErrorCount = 0;
let lastErrorTime = 0;
const MAX_ERROR_RETRIES = 3;
const ERROR_RETRY_DELAY = 2000;

function handleAudioError(audio, e, isCurrentAudio = true) {
  console.error(`Audio error on ${isCurrentAudio ? 'current' : 'next'} audio:`, e);
  console.error('Error details:', {
    code: audio.error?.code,
    message: audio.error?.message,
    networkState: audio.networkState,
    readyState: audio.readyState
  });
  
  if (!isCurrentAudio) {
    console.log('Error on next audio during preload, ignoring');
    return;
  }
  
  const now = Date.now();
  if (now - lastErrorTime < 5000) {
    audioErrorCount++;
  } else {
    audioErrorCount = 1;
  }
  lastErrorTime = now;
  
  if (audioErrorCount > MAX_ERROR_RETRIES) {
    console.error('Too many audio errors, stopping playback');
    isPlaying = false;
    updatePlayButtonIcon();
    nowPlaying.textContent = 'Playback failed - too many errors';
    audioErrorCount = 0;
    return;
  }
  
  if (isPlaying) {
    console.log(`Attempting to recover from audio error (attempt ${audioErrorCount}/${MAX_ERROR_RETRIES})`);
    setTimeout(() => {
      console.log('Reloading stream...');
      audio.load();
      audio.play().then(() => {
        console.log('Stream recovery successful');
        audioErrorCount = 0;
      }).catch(err => {
        console.error('Stream recovery failed:', err);
      });
    }, ERROR_RETRY_DELAY);
  } else {
    isPlaying = false;
    updatePlayButtonIcon();
  }
}

currentAudio.addEventListener('error', (e) => handleAudioError(currentAudio, e, true));
nextAudio.addEventListener('error', (e) => handleAudioError(nextAudio, e, false));

// Handle stream stalling
let stallTimeout = null;

function handleStalled(audio, audioName) {
  console.warn(`${audioName} audio stalled - buffering issues detected`);
  
  if (stallTimeout) {
    clearTimeout(stallTimeout);
  }
  
  stallTimeout = setTimeout(() => {
    if (isPlaying && audio === currentAudio) {
      console.error('Stream stalled for too long, attempting recovery');
      audio.load();
      audio.play().catch(err => {
        console.error('Failed to recover from stall:', err);
        handleAudioError(audio, err, true);
      });
    }
  }, 10000); // Wait 10 seconds before recovery
}

function handleWaiting(audioName) {
  console.log(`${audioName} audio waiting for data`);
}

function handlePlaying(audioName) {
  console.log(`${audioName} audio playing`);
  if (stallTimeout) {
    clearTimeout(stallTimeout);
    stallTimeout = null;
  }
  audioErrorCount = 0;
}

currentAudio.addEventListener('stalled', () => handleStalled(currentAudio, 'current'));
nextAudio.addEventListener('stalled', () => handleStalled(nextAudio, 'next'));

currentAudio.addEventListener('waiting', () => handleWaiting('current'));
nextAudio.addEventListener('waiting', () => handleWaiting('next'));

currentAudio.addEventListener('playing', () => handlePlaying('current'));
nextAudio.addEventListener('playing', () => handlePlaying('next'));

currentAudio.addEventListener('suspend', () => {
  console.log('Current audio suspended (intentional or network issue)');
});

currentAudio.addEventListener('abort', () => {
  console.log('Current audio aborted');
});

// Monitor for unexpected pauses
currentAudio.addEventListener('pause', () => {
  if (isPlaying && !currentAudio.ended) {
    console.warn('Unexpected pause detected, attempting to resume');
    setTimeout(() => {
      if (isPlaying) {
        currentAudio.play().catch(err => {
          console.error('Failed to resume after unexpected pause:', err);
        });
      }
    }, 1000);
  }
});

// Log ended events (should not happen with streams)
currentAudio.addEventListener('ended', () => {
  console.warn('Current audio ended unexpectedly (stream should not end)');
  if (isPlaying) {
    console.log('Restarting stream...');
    currentAudio.load();
    currentAudio.play().catch(err => {
      console.error('Failed to restart stream:', err);
    });
  }
});

let lastDeviceSnapshot = [];

async function getAudioDeviceSnapshot() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
    return audioOutputs.map(d => ({ id: d.deviceId, label: d.label }));
  } catch (error) {
    console.error('Error getting audio devices:', error);
  }
  return [];
}

function devicesChanged(oldDevices, newDevices) {
  if (oldDevices.length !== newDevices.length) {
    return true;
  }
  
  const oldIds = new Set(oldDevices.map(d => d.id));
  const newIds = new Set(newDevices.map(d => d.id));
  
  for (const id of oldIds) {
    if (!newIds.has(id)) {
      return true;
    }
  }
  
  for (const id of newIds) {
    if (!oldIds.has(id)) {
      return true;
    }
  }
  
  return false;
}

async function handleAudioDeviceChange() {
  console.log('Device change event detected');
  const newSnapshot = await getAudioDeviceSnapshot();
  
  console.log('Previous devices:', lastDeviceSnapshot.length);
  console.log('Current devices:', newSnapshot.length);
  
  const configChanged = lastDeviceSnapshot.length > 0 && devicesChanged(lastDeviceSnapshot, newSnapshot);
  
  if (configChanged) {
    console.log('Audio device configuration changed');
    console.log('Old:', lastDeviceSnapshot.map(d => d.label || d.id));
    console.log('New:', newSnapshot.map(d => d.label || d.id));
    
    // Only stop if we're playing and devices were actually removed (not just added)
    if (isPlaying && lastDeviceSnapshot.length > 0) {
      const oldIds = new Set(lastDeviceSnapshot.map(d => d.id));
      const newIds = new Set(newSnapshot.map(d => d.id));
      const devicesRemoved = [...oldIds].some(id => !newIds.has(id));
      
      if (devicesRemoved) {
        console.log('Audio output device was removed, stopping playback immediately');
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio.volume = masterVolume;
        isPlaying = false;
        updatePlayButtonIcon();
      } else {
        console.log('New audio device added, continuing playback');
      }
    }
  }
  
  lastDeviceSnapshot = newSnapshot;
}

if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
  navigator.mediaDevices.addEventListener('devicechange', handleAudioDeviceChange);
  getAudioDeviceSnapshot().then(snapshot => {
    lastDeviceSnapshot = snapshot;
    console.log('Initial audio devices:', snapshot.map(d => d.label || d.id));
  });
} else {
  console.warn('MediaDevices API not available');
}

// Donation link handlers
const somaLink = document.getElementById('somaLink');
const ntsLink = document.getElementById('ntsLink');
const dismissDonationBtn = document.getElementById('dismissDonationBtn');
const donationCard = document.getElementById('donationCard');

if (somaLink) {
  somaLink.addEventListener('click', (e) => {
    e.preventDefault();
    shell.openExternal('https://somafm.com/support/donate.html');
  });
}

if (ntsLink) {
  ntsLink.addEventListener('click', (e) => {
    e.preventDefault();
    shell.openExternal('https://www.nts.live/supporters');
  });
}

// Dismiss donation card for this session only
if (dismissDonationBtn && donationCard) {
  dismissDonationBtn.addEventListener('click', () => {
    donationCard.classList.add('hidden');
  });
}

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
let currentTheme = localStorage.getItem('theme') || 'light';

function setTheme(theme) {
  currentTheme = theme;
  if (theme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
}

// Initialize theme on load
setTheme(currentTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });
}

// Butterchurn Visualizer Integration
const butterchurn = require('butterchurn');
const butterchurnPresets = require('butterchurn-presets');

let visualizer = null;
let visualizerActive = false;
let currentPresetIndex = 0;
let presets = [];
let animationFrameId = null;

// Initialize presets
function initializePresets() {
  const allPresets = butterchurnPresets.getPresets();
  presets = Object.keys(allPresets).map(name => ({
    name: name,
    preset: allPresets[name]
  }));
  console.log('Loaded', presets.length, 'butterchurn presets');
}

function openVisualizer() {
  if (!isPlaying) {
    console.warn('Cannot open visualizer: no audio playing');
    return;
  }
  
  const overlay = document.getElementById('visualizerOverlay');
  const canvas = document.getElementById('visualizerCanvas');
  const songInfo = document.getElementById('visualizerSongInfo');
  
  // Show overlay
  overlay.style.display = 'flex';
  visualizerActive = true;
  
  // Set canvas size to window size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Create butterchurn instance
  visualizer = butterchurn.createVisualizer(audioContext, canvas, {
    width: canvas.width,
    height: canvas.height,
    pixelRatio: window.devicePixelRatio || 1,
    textureRatio: 1
  });
  
  // Connect audio if not already connected
  if (!mediaElementSource) {
    mediaElementSource = audioContext.createMediaElementSource(currentAudio);
    mediaElementSource.connect(audioContext.destination);
  }
  
  visualizer.connectAudio(mediaElementSource);
  
  // Load random preset
  if (presets.length === 0) {
    initializePresets();
  }
  currentPresetIndex = Math.floor(Math.random() * presets.length);
  loadPreset(currentPresetIndex);
  
  // Update song info
  if (currentSong) {
    songInfo.textContent = `${currentSong.artist} - ${currentSong.title}`;
  } else {
    songInfo.textContent = 'RadioBud Visualizer';
  }
  
  // Start render loop
  renderVisualizer();
}

function loadPreset(index) {
  if (index < 0 || index >= presets.length || !visualizer) return;
  
  currentPresetIndex = index;
  const preset = presets[index];
  visualizer.loadPreset(preset.preset, 0.0); // 0.0 = no transition
  
  document.getElementById('presetName').textContent = preset.name;
  console.log('Loaded preset:', preset.name);
}

function renderVisualizer() {
  if (!visualizerActive || !visualizer) return;
  
  visualizer.render();
  animationFrameId = requestAnimationFrame(renderVisualizer);
}

function closeVisualizer() {
  visualizerActive = false;
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  if (visualizer) {
    visualizer.disconnectAudio(mediaElementSource);
    visualizer = null;
  }
  
  const overlay = document.getElementById('visualizerOverlay');
  overlay.style.display = 'none';
}

// Event listeners for visualizer
document.getElementById('closeVisualizer').addEventListener('click', closeVisualizer);

document.getElementById('prevPreset').addEventListener('click', () => {
  const newIndex = (currentPresetIndex - 1 + presets.length) % presets.length;
  loadPreset(newIndex);
});

document.getElementById('nextPreset').addEventListener('click', () => {
  const newIndex = (currentPresetIndex + 1) % presets.length;
  loadPreset(newIndex);
});

// ESC key to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && visualizerActive) {
    closeVisualizer();
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  if (visualizerActive && visualizer) {
    const canvas = document.getElementById('visualizerCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    visualizer.setRendererSize(canvas.width, canvas.height);
  }
});

console.log('Butterchurn visualizer initialized');
