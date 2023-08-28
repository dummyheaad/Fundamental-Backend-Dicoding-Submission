
exports.up = (pgm) => {
  pgm.createTable('playlistsongactivities', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR',
    },
    song_id: {
      type: 'VARCHAR',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR',
    },
    action: {
      type: 'VARCHAR',
    },
    time: {
      type: 'VARCHAR',
    },
  });

  pgm.addConstraint('playlistsongactivities', 'fk_playlistsongactivities.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlistsongactivities', 'fk_playlistsongactivities.playlist_id_playlists.id');
  pgm.dropTable('playlistsongactivities');
};
