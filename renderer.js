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

let currentStation = 'groovesalad';
let currentAudio = new Audio(stations[currentStation]);
let nextAudio = new Audio();
let isPlaying = false;

const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const stationSelect = document.getElementById('stationSelect');
const nowPlaying = document.getElementById('nowPlaying');

currentAudio.volume = 1.0;
nextAudio.volume = 0.0;

async function fetchNowPlaying() {
  try {
    const apiStation = stationApiMap[currentStation];
    const response = await fetch(`https://somafm.com/songs/${apiStation}.json`);
    const data = await response.json();
    if (data.songs && data.songs.length > 0) {
      const song = data.songs[0];
      nowPlaying.textContent = `${song.artist} - ${song.title}`;
    }
  } catch (error) {
    console.error('Error fetching now playing:', error);
  }
}

setInterval(fetchNowPlaying, 30000);
fetchNowPlaying();

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
    currentAudio.volume = Math.min(1, progress);
    
    if (step >= fadeSteps) {
      clearInterval(fadeInTimer);
      currentAudio.volume = 1.0;
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
    currentAudio.volume = Math.max(0, 1 - progress);
    
    if (step >= fadeSteps) {
      clearInterval(fadeOutTimer);
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.volume = 1.0;
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
      
      currentAudio.volume = Math.max(0, 1 - progress);
      nextAudio.volume = Math.min(1, progress);
      
      if (step >= fadeSteps) {
        clearInterval(fadeTimer);
        currentAudio.pause();
        currentAudio.volume = 1.0;
        
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
