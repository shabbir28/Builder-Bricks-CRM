const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Activity = sequelize.define(
  "Activity",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM(
        "call",
        "email",
        "meeting",
        "site-visit",
        "note",
        "task",
        "reminder"
      ),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Activity title is required" },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    leadId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "leads",
        key: "id",
      },
    },
    dealId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "deals",
        key: "id",
      },
    },
    propertyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "properties",
        key: "id",
      },
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "cancelled"),
      defaultValue: "pending",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "medium",
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true,
    },
    outcome: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
  },
  {
    tableName: "activities",
  }
);

module.exports = Activity;
