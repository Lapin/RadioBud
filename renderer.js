const stations = {
  groovesalad: 'https://ice1.somafm.com/groovesalad-128-mp3',
  dronezone: 'https://ice1.somafm.com/dronezone-128-mp3',
  deepspaceone: 'https://ice1.somafm.com/deepspaceone-128-mp3',
  indiepop: 'https://ice1.somafm.com/indiepop-128-mp3',
  groovesaladclassic: 'https://ice1.somafm.com/gsclassic-128-mp3',
  spacestation: 'https://ice1.somafm.com/spacestation-128-mp3',
  lush: 'https://ice1.somafm.com/lush-128-mp3',
  u80s: 'https://ice1.somafm.com/u80s-128-mp3',
  secretagent: 'https://ice1.somafm.com/secretagent-128-mp3',
  defcon: 'https://ice1.somafm.com/defcon-128-mp3',
  left: 'https://ice1.somafm.com/left-128-mp3',
  folkfwd: 'https://ice1.somafm.com/folkfwd-128-mp3',
  beatblender: 'https://ice1.somafm.com/beatblender-128-mp3',
  sonicuniverse: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
  thetrip: 'https://ice1.somafm.com/thetrip-128-mp3',
  suburbsofgoa: 'https://ice1.somafm.com/suburbsofgoa-128-mp3',
  bootliquor: 'https://ice1.somafm.com/bootliquor-128-mp3',
  darkzone: 'https://ice1.somafm.com/darkzone-128-mp3',
  bagel: 'https://ice1.somafm.com/bagel-128-mp3',
  thistle: 'https://ice1.somafm.com/thistle-128-mp3',
  reggae: 'https://ice1.somafm.com/reggae-128-mp3',
  vaporwaves: 'https://ice1.somafm.com/vaporwaves-128-mp3',
  '7soul': 'https://ice1.somafm.com/7soul-128-mp3',
  poptron: 'https://ice1.somafm.com/poptron-128-mp3',
  illstreet: 'https://ice1.somafm.com/illstreet-128-mp3',
  fluid: 'https://ice1.somafm.com/fluid-128-mp3',
  missioncontrol: 'https://ice1.somafm.com/missioncontrol-128-mp3',
  cliqhop: 'https://ice1.somafm.com/cliqhop-128-mp3',
  metal: 'https://ice1.somafm.com/metal-128-mp3',
  dubstep: 'https://ice1.somafm.com/dubstep-128-mp3',
  tiki: 'https://ice1.somafm.com/tiki-128-mp3',
  digitalis: 'https://ice1.somafm.com/digitalis-128-mp3',
  covers: 'https://ice1.somafm.com/covers-128-mp3',
  insound: 'https://ice1.somafm.com/insound-128-mp3',
  sf1033: 'https://ice1.somafm.com/sf1033-128-mp3',
  doomed: 'https://ice1.somafm.com/doomed-128-mp3'
};

const stationApiMap = {
  groovesalad: 'groovesalad',
  dronezone: 'dronezone',
  deepspaceone: 'deepspaceone',
  indiepop: 'indiepop',
  groovesaladclassic: 'gsclassic',
  spacestation: 'spacestation',
  lush: 'lush',
  u80s: 'u80s',
  secretagent: 'secretagent',
  defcon: 'defcon',
  left: 'left',
  folkfwd: 'folkfwd',
  beatblender: 'beatblender',
  sonicuniverse: 'sonicuniverse',
  thetrip: 'thetrip',
  suburbsofgoa: 'suburbsofgoa',
  bootliquor: 'bootliquor',
  darkzone: 'darkzone',
  bagel: 'bagel',
  thistle: 'thistle',
  reggae: 'reggae',
  vaporwaves: 'vaporwaves',
  '7soul': '7soul',
  poptron: 'poptron',
  illstreet: 'illstreet',
  fluid: 'fluid',
  missioncontrol: 'missioncontrol',
  cliqhop: 'cliqhop',
  metal: 'metal',
  dubstep: 'dubstep',
  tiki: 'tiki',
  digitalis: 'digitalis',
  covers: 'covers',
  insound: 'insound',
  sf1033: 'sf1033',
  doomed: 'doomed'
};

const LASTFM_API_KEY = 'b25b959554ed76058ac220b7b2e0a026';
const { shell } = require('electron');
let currentStation = 'groovesalad';
let currentAudio = new Audio(stations[currentStation]);
let nextAudio = new Audio();
let isPlaying = false;
let masterVolume = 1.0;
let playHistory = [];
let favorites = [];
let currentSong = null;

const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
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
      station: currentStation,
      timestamp: Date.now()
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
  
  albumArtEl.onclick = () => {
    if (currentSong) {
      openExpandedView(artUrl);
    } else {
      console.warn('No song currently playing');
    }
  };
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
    const apiStation = stationApiMap[currentStation];
    const response = await fetch(`https://somafm.com/songs/${apiStation}.json`);
    const data = await response.json();
    if (data.songs && data.songs.length > 0) {
      const song = data.songs[0];
      nowPlaying.textContent = `${song.artist} - ${song.title}`;
      
      if (isPlaying && currentSong && getSongId(currentSong) !== getSongId(song)) {
        addToHistory(song);
      }
      
      currentSong = song;
      updateStarIcons();
      updateServiceLinks(song.artist, song.title);
      
      const artUrl = await fetchAlbumArt(song.artist, song.title);
      updateAlbumArt(artUrl);
      updateTrackMetadata(song.artist, song.title);
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
const mainTabRadio = document.getElementById('mainTabRadio');
const mainTabHistory = document.getElementById('mainTabHistory');
const mainTabFavorites = document.getElementById('mainTabFavorites');
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
  radioView.classList.add('hidden');
  historyView.classList.add('hidden');
  favoritesView.classList.add('hidden');
  
  if (tab === 'radio') {
    mainTabRadio.classList.add('active');
    radioView.classList.remove('hidden');
  } else if (tab === 'history') {
    mainTabHistory.classList.add('active');
    historyView.classList.remove('hidden');
    renderHistory();
  } else if (tab === 'favorites') {
    mainTabFavorites.classList.add('active');
    favoritesView.classList.remove('hidden');
    renderFavorites();
  }
  
  // Removed auto-resize on tab change to prevent window shrinking
  // setTimeout(() => {
  //   const { ipcRenderer } = require('electron');
  //   ipcRenderer.send('resize-window');
  // }, 100);
}

mainTabRadio.addEventListener('click', () => switchToTab('radio'));
mainTabHistory.addEventListener('click', () => switchToTab('history'));
mainTabFavorites.addEventListener('click', () => switchToTab('favorites'));

function openExpandedView(artUrl) {
  if (!currentSong) {
    console.error('No current song available');
    return;
  }
  
  console.log('Opening expanded view for:', currentSong.artist, '-', currentSong.title);
  
  const overlay = document.createElement('div');
  overlay.className = 'expanded-overlay';
  overlay.id = 'expandedOverlay';
  
  const container = document.createElement('div');
  container.className = 'expanded-container';
  
  let artElement;
  if (artUrl) {
    artElement = document.createElement('img');
    artElement.src = artUrl;
    artElement.className = 'expanded-art';
  } else {
    artElement = document.createElement('div');
    artElement.className = 'expanded-art expanded-no-art';
    artElement.innerHTML = '<span class="no-artwork-expanded">No Artwork</span>';
  }
  
  const infoRow = document.createElement('div');
  infoRow.className = 'expanded-info-row';
  infoRow.innerHTML = `
    <div class="expanded-song">${currentSong.artist} - ${currentSong.title}</div>
    <button class="expanded-star" id="expandedStar">${isFavorited(currentSong) ? '★' : '☆'}</button>
  `;
  
  const controlsRow = document.createElement('div');
  controlsRow.className = 'expanded-controls-row';
  controlsRow.innerHTML = `
    <button class="expanded-btn" id="expandedPlay">▶</button>
    <button class="expanded-btn" id="expandedStop">■</button>
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'expanded-close';
  closeBtn.innerHTML = '×';
  
  container.appendChild(artElement);
  container.appendChild(infoRow);
  container.appendChild(controlsRow);
  
  overlay.appendChild(container);
  overlay.appendChild(closeBtn);
  
  overlay.style.background = 'rgba(0, 0, 0, 0.95)';
  
  if (artUrl && artElement.tagName === 'IMG') {
    artElement.onload = () => {
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      tempCanvas.width = artElement.naturalWidth;
      tempCanvas.height = artElement.naturalHeight;
      
      try {
        ctx.drawImage(artElement, 0, 0);
        const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0;
        const sampleSize = 10;
        let count = 0;
        
        for (let i = 0; i < data.length; i += 4 * sampleSize) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        
        overlay.style.background = `
          linear-gradient(
            135deg,
            rgba(${r}, ${g}, ${b}, 0.95) 0%,
            rgba(${Math.floor(r * 0.5)}, ${Math.floor(g * 0.5)}, ${Math.floor(b * 0.5)}, 0.98) 100%
          )
        `;
      } catch (error) {
        console.error('Error extracting color:', error);
      }
    };
  }
  
  const closeExpanded = () => {
    overlay.classList.add('expanded-closing');
    setTimeout(() => overlay.remove(), 200);
  };
  
  closeBtn.onclick = closeExpanded;
  overlay.onclick = (e) => {
    if (e.target === overlay) closeExpanded();
  };
  
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      closeExpanded();
      document.removeEventListener('keydown', escHandler);
    }
  });
  
  document.body.appendChild(overlay);
  
  overlay.querySelector('#expandedStar').onclick = (e) => {
    e.stopPropagation();
    toggleFavorite(currentSong);
    e.target.textContent = isFavorited(currentSong) ? '★' : '☆';
  };
  
  overlay.querySelector('#expandedPlay').onclick = (e) => {
    e.stopPropagation();
    if (!isPlaying) {
      playBtn.click();
    }
  };
  
  overlay.querySelector('#expandedStop').onclick = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      stopBtn.click();
    }
  };
  
  setTimeout(() => overlay.classList.add('expanded-visible'), 10);
}

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
    currentAudio.src = stations[currentStation];
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

stopBtn.addEventListener('click', () => {
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
});

// Initialize button icon on load
updatePlayButtonIcon();

async function switchStation(newStation) {
  currentStation = newStation;
  
  nextAudio.src = stations[currentStation];
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

stationSelect.addEventListener('change', (e) => {
  switchStation(e.target.value);
});

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

if (somaLink) {
  somaLink.addEventListener('click', (e) => {
    e.preventDefault();
    shell.openExternal('https://somafm.com/support/');
  });
}

if (ntsLink) {
  ntsLink.addEventListener('click', (e) => {
    e.preventDefault();
    shell.openExternal('https://www.nts.live/supporters');
  });
}

// Settings button placeholder
const settingsBtn = document.getElementById('settingsBtn');
if (settingsBtn) {
  settingsBtn.addEventListener('click', () => {
    // Placeholder for future settings functionality
    console.log('Settings clicked - feature coming soon!');
  });
}

// Volume slider visual update
if (volumeSlider) {
  volumeSlider.addEventListener('input', (e) => {
    const percent = e.target.value;
    e.target.style.setProperty('--volume-percent', percent + '%');
  });
  // Initialize
  volumeSlider.style.setProperty('--volume-percent', volumeSlider.value + '%');
}
