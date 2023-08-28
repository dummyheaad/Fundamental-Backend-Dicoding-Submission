const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const {name} = request.payload;
    const {id: credentialId} = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({name, owner: credentialId});

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistHandler(request) {
    const {id: credentialId} = request.auth.credentials;

    const playlists = await this._service.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const {id} = request.params;
    const {id: credentialId} = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const {id: playlistId} = request.params;
    const {songId} = request.payload;

    const {id: credentialId} = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.addSongToPlaylistById(playlistId, songId);

    const time = new Date().toISOString();
    const action = 'add';
    await this._service.addPlaylistActivity(playlistId, songId, credentialId, action, time);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke dalam playlist',
    });

    response.code(201);
    return response;
  }

  async getSongsFromPlaylistsHandler(request) {
    const {id: playlistId} = request.params;
    const {id: credentialId} = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._service.getSongsFromPlaylistById(playlistId);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistHandler(request) {
    this._validator.validateSongPayload(request.payload);

    const {id: playlistId} = request.params;
    const {songId} = request.payload;
    const {id: credentialId} = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deleteSongFromPlaylistById(playlistId, songId);

    const time = new Date().toISOString();
    const action = 'delete';
    await this._service.addPlaylistActivity(playlistId, songId, credentialId, action, time);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  async getPlaylistActivitiesHandler(request) {
    this._validator.validatePlaylistPayload(request.payload);

    const {id: playlistId} = request.params;
    const {id: credentialId} = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const activities = await this._service.getPlaylistActivities(playlistId);

    return {
      status: 'success',
      data: activities,
    };
  }
}

module.exports = PlaylistsHandler;
