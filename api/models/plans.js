"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Plans extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Plans.hasMany(models.Suggestions, { foreignKey: "plan_id" });
      models.Suggestions.belongsTo(Plans, { foreignKey: "plan_id" });
    }
  }
  Plans.init(
    {
      plan_date: DataTypes.DATE,
      plan_note: DataTypes.STRING,
      eventId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Plans",
    }
  );
  return Plans;
};
