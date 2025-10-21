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
const YOUTUBE_API_KEY = 'AIzaSyDGVos9wmevE8PhmxukbAoCCvoTWfMBtjQ';
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

currentAudio.volume = masterVolume;
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
    } catch (e) {
      console.error('Error loading favorites:', e);
    }
  }
}

function saveToStorage() {
  localStorage.setItem('radiobudHistory', JSON.stringify(playHistory));
  localStorage.setItem('radiobudFavorites', JSON.stringify(favorites));
}

function getSongId(song) {
  return `${song.artist}-${song.title}`.toLowerCase().replace(/\s+/g, '-');
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

async function fetchYouTubeThumbnail(artist, title) {
  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items[0].snippet.thumbnails.high.url;
    }
    return null;
  } catch (error) {
    console.error('Error fetching YouTube thumbnail:', error);
    return null;
  }
}

async function fetchAlbumArt(artist, title) {
  const cacheKey = `art_${artist}_${title}`.toLowerCase().replace(/\s+/g, '_');
  const cached = localStorage.getItem(cacheKey);
  
  if (cached && cached !== 'null') {
    return cached;
  }
  
  let artUrl = await fetchLastfmArt(artist, title);
  
  if (!artUrl) {
    artUrl = await fetchYouTubeThumbnail(artist, title);
  }
  
  if (artUrl) {
    localStorage.setItem(cacheKey, artUrl);
  } else {
    localStorage.setItem(cacheKey, 'null');
  }
  
  return artUrl;
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
    
    albumArtEl.onclick = () => {
      if (currentSong) {
        openExpandedView(artUrl);
      } else {
        console.warn('No song currently playing');
      }
    };
  } else {
    albumArtEl.innerHTML = '<span class="no-artwork">No Artwork</span>';
    albumArtEl.onclick = null;
  }
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
    }
  } catch (error) {
    console.error('Error fetching now playing:', error);
  }
}

function isFavorited(song) {
  const songId = getSongId(song);
  return favorites.some(fav => getSongId(fav) === songId);
}

function toggleFavorite(song) {
  const songId = getSongId(song);
  const index = favorites.findIndex(fav => getSongId(fav) === songId);
  
  if (index === -1) {
    favorites.push({
      ...song,
      station: currentStation,
      favoritedAt: Date.now()
    });
  } else {
    favorites.splice(index, 1);
  }
  
  saveToStorage();
  updateStarIcons();
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
  
  setTimeout(() => {
    const { ipcRenderer } = require('electron');
const { remote } = require('electron');
const win = remote.getCurrentWindow();
    ipcRenderer.send('resize-window');
  }, 100);
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
  
  const img = document.createElement('img');
  img.src = artUrl;
  img.className = 'expanded-art';
  
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
  
  container.appendChild(img);
  container.appendChild(infoRow);
  container.appendChild(controlsRow);
  
  overlay.appendChild(container);
  overlay.appendChild(closeBtn);
  
  overlay.style.background = 'rgba(0, 0, 0, 0.95)';
  
  img.onload = () => {
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    tempCanvas.width = img.naturalWidth;
    tempCanvas.height = img.naturalHeight;
    
    try {
      ctx.drawImage(img, 0, 0);
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
  
  historyContent.innerHTML = playHistory.map(song => {
    const isFav = isFavorited(song);
    const timeStr = formatTime(song.timestamp);
    return `
      <div class="history-item">
        <button class="history-item-star" data-song='${JSON.stringify(song)}'>${isFav ? '★' : '☆'}</button>
        <div class="history-item-info">
          <div class="history-item-song">${song.artist} - ${song.title}</div>
          <div class="history-item-meta">${song.station} • ${timeStr}</div>
        </div>
      </div>
    `;
  }).join('');
  
  historyContent.querySelectorAll('.history-item-star').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const song = JSON.parse(e.target.dataset.song);
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
  
  favoritesContent.innerHTML = favorites.map(song => {
    const timeStr = formatTime(song.favoritedAt);
    return `
      <div class="history-item">
        <button class="history-item-star" data-song='${JSON.stringify(song)}'>★</button>
        <div class="history-item-info">
          <div class="history-item-song">${song.artist} - ${song.title}</div>
          <div class="history-item-meta">${song.station} • ${timeStr}</div>
        </div>
      </div>
    `;
  }).join('');
  
  favoritesContent.querySelectorAll('.history-item-star').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const song = JSON.parse(e.target.dataset.song);
      toggleFavorite(song);
      renderFavorites();
    });
  });
}

volumeSlider.addEventListener('input', (e) => {
  masterVolume = e.target.value / 100;
  if (isPlaying) {
    currentAudio.volume = masterVolume;
  }
});

playBtn.addEventListener('click', () => {
  currentAudio.volume = 0;
  currentAudio.play();
  isPlaying = true;
  playBtn.disabled = true;
  stopBtn.disabled = false;
  
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
      playBtn.disabled = false;
      stopBtn.disabled = true;
    }
  }, fadeInterval);
});

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

currentAudio.addEventListener('error', (e) => {
  console.error('Audio error:', e);
  isPlaying = false;
  playBtn.disabled = false;
  stopBtn.disabled = true;
});

nextAudio.addEventListener('error', (e) => {
  console.error('Next audio error:', e);
});
