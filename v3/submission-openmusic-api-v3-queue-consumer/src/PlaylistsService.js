const {Pool} = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getSongsFromPlaylistById(playlistId) {
    const queryPlaylist = {
      text: `SELECT playlists.id, playlists.name
      FROM playlists
      INNER JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const playlist = await this._pool.query(queryPlaylist);

    const querySongs = {
      text: `SELECT songs.id, songs.title, songs.performer
      FROM songs
      INNER JOIN playlistsongs ON songs.id = playlistsongs.song_id
      WHERE playlistsongs.playlist_id = $1`,
      values: [playlistId],
    };

    const songs = await this._pool.query(querySongs);

    const result = {
      playlist: {
        ...playlist.rows[0],
        songs: [
          ...songs.rows,
        ],
      },
    };

    return result;
  }
}

module.exports = PlaylistsService;
