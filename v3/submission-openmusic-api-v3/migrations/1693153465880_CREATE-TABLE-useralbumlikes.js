exports.up = (pgm) => {
  pgm.createTable('useralbumlikes', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    album_id: {
      type: 'VARCHAR',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR',
      notNull: true,
    },
  });

  pgm.addConstraint('useralbumlikes', 'unique_album_id_and_user_id', 'UNIQUE(album_id, user_id)');
  pgm.addConstraint('useralbumlikes', 'fk_useralbumlikes.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
  pgm.addConstraint('useralbumlikes', 'fk_useralbumlikes.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('useralbumlikes');
};
