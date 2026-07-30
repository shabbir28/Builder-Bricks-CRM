const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Task title is required" },
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
    agentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM("followup", "call", "meeting", "task"),
      defaultValue: "task",
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: { msg: "Due date is required" },
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "delayed", "declined"),
      defaultValue: "pending",
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    assignmentStatus: {
      type: DataTypes.ENUM("self", "assigned", "accepted", "rejected"),
      defaultValue: "self",
    },
  },
  {
    tableName: "tasks",
  }
);

module.exports = Task;
