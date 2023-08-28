

exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
    genre: {
      type: 'VARCHAR',
      notNull: true,
    },
    performer: {
      type: 'VARCHAR',
      notNull: true,
    },
    duration: {
      type: 'INTEGER',
      notNull: false,
    },
    album_id: {
      type: 'VARCHAR',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
