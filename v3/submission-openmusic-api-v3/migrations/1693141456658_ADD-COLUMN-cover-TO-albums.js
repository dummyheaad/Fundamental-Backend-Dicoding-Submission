exports.up = (pgm) => {
  pgm.addColumns('albums', {
    cover: {
      type: 'VARCHAR',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('albums', 'cover');
};
