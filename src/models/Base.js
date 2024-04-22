module.exports = (sequelize, DataTypes) =>
  sequelize.define('base', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.GEOGRAPHY('POINT'),
      allowNull: false
    }
  });
