// Base Provider Interface
// All radio providers must implement these methods

class RadioProvider {
  constructor() {
    if (this.constructor === RadioProvider) {
      throw new Error('RadioProvider is an abstract class and cannot be instantiated directly');
    }
  }

  // Returns the provider name (e.g., "SomaFM", "NTS Radio")
  getName() {
    throw new Error('Method getName() must be implemented');
  }

  // Returns an object with station IDs and their stream URLs
  getStations() {
    throw new Error('Method getStations() must be implemented');
  }

  // Returns an object with station IDs and their display names
  getStationNames() {
    throw new Error('Method getStationNames() must be implemented');
  }

  // Fetches now playing information for a given station
  // Returns: { artist, title, album?, artwork?, metadata? }
  async fetchNowPlaying(stationId) {
    throw new Error('Method fetchNowPlaying() must be implemented');
  }

  // Returns the stream URL for a given station ID
  getStreamUrl(stationId) {
    const stations = this.getStations();
    return stations[stationId] || null;
  }

  // Returns metadata type ('track' or 'show')
  getMetadataType() {
    return 'track'; // Default to track-based
  }

  // Optional: Get album art URL (can use default iTunes/Last.fm fetcher)
  async fetchAlbumArt(artist, title) {
    return null; // null means use default fetcher
  }
}

module.exports = RadioProvider;
