const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');
const {mapDBAlbumToModel} = require('../../../utils');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({name, year}) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, name, year, null],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async addAlbumLikes(albumId, userId) {
    const checkAlbum = await this._pool.query('SELECT * FROM albums WHERE id = $1', [albumId]);

    if (!checkAlbum.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO useralbumlikes VALUES($1, $2, $3) RETURNING id',
      values: [id, albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    await this._cacheService.delete(`albumlikes:${albumId}`);
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return result.rows.map(mapDBAlbumToModel)[0];
  }

  async getSongsByAlbumId(id) {
    const query = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs WHERE songs.album_id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getAlbumLikes(albumId) {
    try {
      const count = await this._cacheService.get(`albumlikes:${albumId}`);
      return [JSON.parse(count), true];
    } catch (error) {
      console.error(error);
      const query = {
        text: 'SELECT COUNT(*) FROM useralbumlikes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      const {count} = result.rows[0];

      await this._cacheService.set(`albumlikes:${albumId}`, JSON.stringify(parseInt(count)));

      return [parseInt(count), false];
    }
  }

  async editAlbumById(id, {name, year}) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async editAlbumCoverById(id, fileUrl) {
    const query = {
      text: 'UPDATE albums SET cover = $2 WHERE id = $1 RETURNING id',
      values: [id, fileUrl],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui cover album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async deleteAlbumLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM useralbumlikes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheService.delete(`albumlikes:${albumId}`);
  }

  async verifyIsAlbumLiked(albumId, userId) {
    const query = {
      text: 'SELECT * FROM useralbumlikes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError('Album sudah disukai. Tidak bisa menyukai album yang sama dua kali');
    }
  }
}

module.exports = AlbumsService;
