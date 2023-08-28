const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const albumId = await this._service.addAlbum(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async postAlbumLikeByIdHandler(request, h) {
    const {id: credentialId} = request.auth.credentials;
    const {id: albumId} = request.params;

    await this._service.verifyIsAlbumLiked(albumId, credentialId);

    await this._service.addAlbumLikes(albumId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil di-like',
    });

    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const {id} = request.params;
    const album = await this._service.getAlbumById(id);
    const songs = await this._service.getSongsByAlbumId(id);
    album.songs = songs;
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async getAlbumLikesByIdHandler(request, h) {
    const {id} = request.params;
    const [likes, isCached] = await this._service.getAlbumLikes(id);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    response.code(200);
    if (isCached) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const {id} = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const {id} = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async deleteAlbumLikeByIdHandler(request) {
    const {id: credentialId} = request.auth.credentials;
    const {id: albumId} = request.params;
    await this._service.deleteAlbumLike(albumId, credentialId);
    return {
      status: 'success',
      message: 'Abum berhasil di-unlike',
    };
  }
};

module.exports = AlbumsHandler;
