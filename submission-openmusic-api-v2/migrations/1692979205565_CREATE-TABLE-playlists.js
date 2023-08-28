exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR',
    },
  });

  pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlists', 'fk_playlists.owner_users.id');
  pgm.dropTable('playlists');
};
