const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');
const AuthorizationError = require('../../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({name, owner}) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      LEFT JOIN users ON playlists.owner = users.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1
      GROUP BY (playlists.id, users.username)`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async addSongToPlaylistById(playlistId, songId) {
    const id = `playlistsong-${nanoid(16)}`;

    const checkSong = await this._pool.query('SELECT * FROM songs WHERE id = $1', [songId]);

    if (!checkSong.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke dalam playlist');
    }
  }

  async getSongsFromPlaylistById(playlistId) {
    const queryPlaylist = {
      text: `SELECT playlists.id, playlists.name, users.username
      FROM playlists
      INNER JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1
      `,
      values: [playlistId],
    };

    const playlist = await this._pool.query(queryPlaylist);

    const querySongs = {
      text: `SELECT songs.id, songs.title, songs.performer
      FROM songs
      INNER JOIN playlistsongs ON songs.id = playlistsongs.song_id
      WHERE playlistsongs.playlist_id = $1
      `,
      values: [playlistId],
    };

    const songs = await this._pool.query(querySongs);

    return {
      ...playlist.rows[0],
      songs: [
        ...songs.rows,
      ],
    };
  }

  async deleteSongFromPlaylistById(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 and song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus dari playlist. Id lagu tidak ditemukan');
    }
  }

  async addPlaylistActivity(playlistId, songId, userId, action, time) {
    const id = `playlistsongactivity-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlistsongactivities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Aktivitas gagal dicatat');
    }
  }

  async getPlaylistActivities(id) {
    const query = {
      text: `SELECT users.username, songs.title, 
      playlistsongactivities.action, playlistsongactivities.time
      FROM playlistsongactivities
      INNER JOIN songs ON songs.id = playlistsongactivities.song_id
      INNER JOIN users ON users.id = playlistsongactivities.user_id
      WHERE playlistsongactivities.playlist_id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    return {
      playlistId: id,
      activities: [
        ...result.rows,
      ],
    };
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
