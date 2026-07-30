const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Receipt = sequelize.define(
  "Receipt",
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
      comment: "ID of the installment row",
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "receipts",
  }
);

module.exports = Receipt;
