const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const InstallmentRequest = sequelize.define(
  "InstallmentRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    installmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "The ID field inside the installmentSchedule JSON array",
    },
    requestedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "User ID of the executive who submitted the request",
    },
    changes: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: "JSON object with the proposed changes: { surcharges, adjustment, transactionRef, paidDate, payment }",
    },
    originalValues: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Snapshot of original installment values before the request",
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "User ID of admin/super_admin who reviewed the request",
    },
    reviewNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "installment_requests",
  }
);

module.exports = InstallmentRequest;
