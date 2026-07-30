const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Deal = sequelize.define(
  "Deal",
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
        notEmpty: { msg: "Deal title is required" },
      },
    },
    leadId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "leads",
        key: "id",
      },
    },
    propertyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "properties",
        key: "id",
      },
    },
    agentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(
        "initial",
        "negotiation",
        "under-contract",
        "closed",
        "lost"
      ),
      defaultValue: "initial",
    },
    dealValue: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        notNull: { msg: "Deal value is required" },
      },
    },
    commissionRate: {
      type: DataTypes.FLOAT,
      defaultValue: 2.5,
      validate: {
        min: 0,
        max: 100,
      },
    },
    commissionAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    closingDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expectedClosingDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    contractDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    documents: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    pipelineStage: {
      type: DataTypes.ENUM(
        "lead",
        "qualified",
        "proposal",
        "negotiation",
        "closing",
        "won",
        "lost"
      ),
      defaultValue: "lead",
    },
  },
  {
    tableName: "deals",
    hooks: {
      beforeCreate: (deal) => {
        if (deal.dealValue && deal.commissionRate) {
          deal.commissionAmount = (deal.dealValue * deal.commissionRate) / 100;
        }
      },
      beforeUpdate: (deal) => {
        if (deal.changed("dealValue") || deal.changed("commissionRate")) {
          deal.commissionAmount = (deal.dealValue * deal.commissionRate) / 100;
        }
      },
    },
  }
);

module.exports = Deal;
