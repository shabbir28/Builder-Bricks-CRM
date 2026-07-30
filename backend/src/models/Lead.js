const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Lead = sequelize.define(
  "Lead",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Lead name is required" },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: { msg: "Please provide a valid email" },
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM(
        "website",
        "facebook",
        "instagram",
        "referral",
        "social",
        "email",
        "phone",
        "walk-in",
        "other"
      ),
      defaultValue: "website",
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
      defaultValue: "new",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "medium",
    },
    budget: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preferredPropertyType: {
      type: DataTypes.ENUM(
        "apartment",
        "house",
        "villa",
        "commercial",
        "land",
        "other"
      ),
      defaultValue: "apartment",
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    preferredLocation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assignedAgent: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    assignmentStatus: {
      type: DataTypes.ENUM("unassigned", "pending", "accepted", "rejected"),
      defaultValue: "unassigned",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    lastContactDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextFollowUp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "leads",
  }
);

module.exports = Lead;
