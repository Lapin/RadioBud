const RadioProvider = require('./base.js');

class NTSProvider extends RadioProvider {
  constructor() {
    super();
    
    this.stations = {
      nts1: 'https://stream-relay-geo.ntslive.net/stream',
      nts2: 'https://stream-relay-geo.ntslive.net/stream2',
      'nts-poolside': 'https://stream-mixtape-geo.ntslive.net/mixtape4',
      'nts-slowfocus': 'https://stream-mixtape-geo.ntslive.net/mixtape',
      'nts-lowkey': 'https://stream-mixtape-geo.ntslive.net/mixtape2',
      'nts-memorylane': 'https://stream-mixtape-geo.ntslive.net/mixtape6',
      'nts-4tothefloor': 'https://stream-mixtape-geo.ntslive.net/mixtape5',
      'nts-islandtime': 'https://stream-mixtape-geo.ntslive.net/mixtape21',
      'nts-thetube': 'https://stream-mixtape-geo.ntslive.net/mixtape26',
      'nts-sheetmusic': 'https://stream-mixtape-geo.ntslive.net/mixtape35',
      'nts-feelings': 'https://stream-mixtape-geo.ntslive.net/mixtape27',
      'nts-expansions': 'https://stream-mixtape-geo.ntslive.net/mixtape3',
      'nts-raphouse': 'https://stream-mixtape-geo.ntslive.net/mixtape22',
      'nts-labyrinth': 'https://stream-mixtape-geo.ntslive.net/mixtape31',
      'nts-sweat': 'https://stream-mixtape-geo.ntslive.net/mixtape24',
      'nts-otaku': 'https://stream-mixtape-geo.ntslive.net/mixtape36',
      'nts-thepit': 'https://stream-mixtape-geo.ntslive.net/mixtape34',
      'nts-fieldrecordings': 'https://stream-mixtape-geo.ntslive.net/mixtape23'
    };

    this.stationNames = {
      nts1: 'NTS 1',
      nts2: 'NTS 2',
      'nts-poolside': 'Poolside (Balearic, boogie)',
      'nts-slowfocus': 'Slow Focus (Ambient, drone)',
      'nts-lowkey': 'Low Key (Lo-fi hip-hop)',
      'nts-memorylane': 'Memory Lane (Psychedelic)',
      'nts-4tothefloor': '4 To The Floor (House/techno)',
      'nts-islandtime': 'Island Time (Reggae, dub)',
      'nts-thetube': 'The Tube (Post-punk)',
      'nts-sheetmusic': 'Sheet Music (Classical)',
      'nts-feelings': 'Feelings (Soul, gospel)',
      'nts-expansions': 'Expansions (Jazz)',
      'nts-raphouse': 'Rap House (808s)',
      'nts-labyrinth': 'Labyrinth (Experimental)',
      'nts-sweat': 'Sweat (Party music)',
      'nts-otaku': 'Otaku (Anime/game OSTs)',
      'nts-thepit': 'The Pit (Metal)',
      'nts-fieldrecordings': 'Field Recordings (Ambience)'
    };

    this.channelMap = {
      nts1: '1',
      nts2: '2'
    };

    this.lastFetchedShow = {};
  }

  getName() {
    return 'NTS Radio';
  }

  getStations() {
    return this.stations;
  }

  getStationNames() {
    return this.stationNames;
  }

  getMetadataType() {
    return 'show';
  }

  async fetchNowPlaying(stationId) {
    const channelId = this.channelMap[stationId];
    
    if (!channelId) {
      return {
        artist: 'NTS Radio',
        title: this.stationNames[stationId] || stationId,
        album: null,
        artwork: null,
        metadata: null
      };
    }

    try {
      const response = await fetch('https://www.nts.live/api/v2/live');
      const data = await response.json();
      
      const channel = data.results?.find(r => r.channel_name === channelId);
      
      if (channel && channel.now) {
        const now = channel.now;
        const details = now.embeds?.details;
        
        const showTitle = now.broadcast_title || 'Live Show';
        const hostName = details?.name || '';
        const location = details?.location_long || '';
        const artwork = details?.media?.picture_medium || details?.media?.picture_large || null;
        const genres = details?.genres?.map(g => g.value).join(', ') || null;
        
        const lastShow = this.lastFetchedShow[stationId];
        const showChanged = !lastShow || lastShow.title !== showTitle || lastShow.host !== hostName;
        
        this.lastFetchedShow[stationId] = {
          title: showTitle,
          host: hostName,
          timestamp: Date.now()
        };
        
        return {
          artist: hostName || 'NTS Radio',
          title: showTitle,
          album: location || null,
          artwork: artwork,
          metadata: {
            genres: genres,
            startTime: now.start_timestamp,
            endTime: now.end_timestamp
          },
          showChanged: showChanged
        };
      }
      
      return {
        artist: 'NTS Radio',
        title: `Channel ${channelId} Live`,
        album: null,
        artwork: null,
        metadata: null
      };
    } catch (error) {
      console.error('Error fetching NTS now playing:', error);
      return {
        artist: 'NTS Radio',
        title: this.stationNames[stationId] || stationId,
        album: null,
        artwork: null,
        metadata: null
      };
    }
  }

  async fetchAlbumArt(artist, title) {
    return null;
  }
}

module.exports = NTSProvider;
