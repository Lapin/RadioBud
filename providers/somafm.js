const RadioProvider = require('./base.js');

class SomaFMProvider extends RadioProvider {
  constructor() {
    super();
    
    this.stations = {
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

    this.stationApiMap = {
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

    this.stationNames = {
      groovesalad: 'Groovesalad',
      dronezone: 'Drone Zone',
      deepspaceone: 'Deep Space One',
      indiepop: 'Indie Pop Rocks!',
      groovesaladclassic: 'Groove Salad Classic',
      spacestation: 'Space Station Soma',
      lush: 'Lush',
      u80s: 'Underground 80s',
      secretagent: 'Secret Agent',
      defcon: 'DEF CON Radio',
      left: 'Left Coast 70s',
      folkfwd: 'Folk Forward',
      beatblender: 'Beat Blender',
      sonicuniverse: 'Sonic Universe',
      thetrip: 'The Trip',
      suburbsofgoa: 'Suburbs of Goa',
      bootliquor: 'Boot Liquor',
      darkzone: 'The Dark Zone',
      bagel: 'Bossa Beyond',
      thistle: 'ThistleRadio',
      reggae: 'Heavyweight Reggae',
      vaporwaves: 'Vaporwaves',
      '7soul': 'Seven Inch Soul',
      poptron: 'PopTron',
      illstreet: 'Illinois Street Lounge',
      fluid: 'Fluid',
      missioncontrol: 'Mission Control',
      cliqhop: 'cliqhop idm',
      metal: 'Metal Detector',
      dubstep: 'Dub Step Beyond',
      tiki: 'Tiki Time',
      digitalis: 'Digitalis',
      covers: 'Covers',
      insound: 'The In-Sound',
      sf1033: 'SF 10-33',
      doomed: 'Doomed'
    };
  }

  getName() {
    return 'SomaFM';
  }

  getStations() {
    return this.stations;
  }

  getStationNames() {
    return this.stationNames;
  }

  getMetadataType() {
    return 'track';
  }

  async fetchNowPlaying(stationId) {
    try {
      const apiStation = this.stationApiMap[stationId];
      if (!apiStation) {
        console.error(`No API mapping for station: ${stationId}`);
        return null;
      }

      const response = await fetch(`https://somafm.com/songs/${apiStation}.json`);
      const data = await response.json();
      
      if (data.songs && data.songs.length > 0) {
        const song = data.songs[0];
        return {
          artist: song.artist || 'Unknown Artist',
          title: song.title || 'Unknown Title',
          album: song.album || null,
          artwork: null, // Will use default iTunes/Last.fm fetcher
          metadata: null
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching SomaFM now playing:', error);
      return null;
    }
  }
}

module.exports = SomaFMProvider;
