
exports.up = (pgm) => {
  pgm.createTable('playlistsongs', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR',
    },
    song_id: {
      type: 'VARCHAR',
    },
  });

  pgm.addConstraint('playlistsongs', 'fk_playlistsongs.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
  pgm.addConstraint('playlistsongs', 'fk_playlistsongs.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlistsongs', 'fk_playlistsongs.playlist_id_playlists.id');
  pgm.dropConstraint('playlistsongs', 'fk_playlistsongs.song_id_songs.id');
  pgm.dropTable('playlistsongs');
};
