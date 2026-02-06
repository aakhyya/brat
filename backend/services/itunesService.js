const axios = require('axios');

class iTunesService {
    constructor() {
      this.baseURL = 'https://itunes.apple.com';
      this.client = axios.create({
        baseURL: this.baseURL,
        timeout: 5000 //how long Axios will wait for a response before it gives up and throws an error.
      });
    }

    async searchSongs(query) { //search song names
      try{
          if(!query || query.trim().length<2){
            throw new Error('Query too short');
          }
          const response = await this.client.get('/search', {
              params: {
                term: query.trim(),
                media: 'music',
                entity: 'song',
                limit: 20
              }
          });

          return response.data.results.map(track => ({
            itunesId: track.trackId,
            title: track.trackName,
            artist: track.artistName,
            album: track.collectionName,
            releaseDate: track.releaseDate || null,
            artwork: track.artworkUrl100
              ? track.artworkUrl100.replace('100x100', '600x600')
              : null,
            previewUrl: track.previewUrl || null
          }));
      }
      catch(err){
        console.log('iTunes searchSongs error:', err.message);
        return [];
      }
    }

    async getSongDetails(trackId) { //get song by id
      try{
        if (!trackId) {
          throw new Error('Track ID is required');
        }

        const res = await this.client.get('/lookup', {
          params: { id: trackId }
        });

        const track=res.data.results[0];
        if(!track){
          throw new Error('Track not found');
        }

        return this.normalizeSongData(track);
      }
      catch(err){
        console.log('iTunes getSongDetails error:', err.message);
        throw err;
      }
    }

    normalizeSongData(itunesTrack) {//normalize according to content schema
      return {
        type: 'song',
        title: itunesTrack.trackName,
        description: `${itunesTrack.artistName} - ${itunesTrack.collectionName}`,
        releaseDate: itunesTrack.releaseDate
          ? new Date(itunesTrack.releaseDate)
          : null,

        creators: [
          {
            name: itunesTrack.artistName,
            role: 'artist'
          }
        ],

        metadata: {
          duration: itunesTrack.trackTimeMillis || null,
          album: itunesTrack.collectionName || null,
          genre: itunesTrack.primaryGenreName || null,
          previewUrl: itunesTrack.previewUrl || null
        },

        externalIds: {
          itunes: itunesTrack.trackId.toString()
        },

        images: {
          cover: itunesTrack.artworkUrl100
            ? itunesTrack.artworkUrl100.replace('100x100', '600x600') //If artwork exists → upgrade image quality
            : null
        }
      }; 
    }
}

module.exports = new iTunesService();
