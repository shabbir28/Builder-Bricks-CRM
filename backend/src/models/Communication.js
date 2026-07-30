const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Communication = sequelize.define(
  "Communication",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    leadId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "leads",
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM(
        "call",
        "meeting",
        "message",
        "note",
        "property_shared"
      ),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    agentName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attachedFileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    attachedFileOriginalName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "communications",
  }
);

module.exports = Communication;
