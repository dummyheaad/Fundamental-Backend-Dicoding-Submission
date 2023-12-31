exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'VARCHAR',
      primaryKey: true,
    },
    username: {
      type: 'VARCHAR',
      unique: true,
      notNull: true,
    },
    password: {
      type: 'TEXT',
      notNull: true,
    },
    fullname: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
