

exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('albums');
};
