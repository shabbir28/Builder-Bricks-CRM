const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LeadProgressLog = sequelize.define(
  "LeadProgressLog",
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
    status: {
      type: DataTypes.ENUM(
        "new",
        "contacted",
        "visit",
        "negotiation",
        "closed",
        "lost"
      ),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "lead_progress_logs",
    timestamps: false,
  }
);

module.exports = LeadProgressLog;
