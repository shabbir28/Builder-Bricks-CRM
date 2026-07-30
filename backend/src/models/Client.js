const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Client = sequelize.define(
  "Client",
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
        notEmpty: { msg: "Client name is required" },
      },
    },
    cnic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: { msg: "Please provide a valid email" },
      },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // --- Booking Form Fields ---
    bookingReferenceNo: { type: DataTypes.STRING, allowNull: true },
    type: { type: DataTypes.STRING, allowNull: true },
    unitNo: { type: DataTypes.STRING, allowNull: true },
    size: { type: DataTypes.STRING, allowNull: true },
    fatherOrHusbandName: { type: DataTypes.STRING, allowNull: true },
    presentAddress: { type: DataTypes.STRING, allowNull: true },
    permanentAddress: { type: DataTypes.STRING, allowNull: true },
    residentialTel: { type: DataTypes.STRING, allowNull: true },
    mobileNo: { type: DataTypes.STRING, allowNull: true },
    nominee1Name: { type: DataTypes.STRING, allowNull: true },
    nominee1Relation: { type: DataTypes.STRING, allowNull: true },
    nominee1Cnic: { type: DataTypes.STRING, allowNull: true },
    nominee1Mobile: { type: DataTypes.STRING, allowNull: true },
    nominee2Name: { type: DataTypes.STRING, allowNull: true },
    nominee2Relation: { type: DataTypes.STRING, allowNull: true },
    nominee2Cnic: { type: DataTypes.STRING, allowNull: true },
    nominee2Mobile: { type: DataTypes.STRING, allowNull: true },
    // --- Payment Plan Fields ---
    totalPrice: { type: DataTypes.STRING, allowNull: true },
    discount: { type: DataTypes.STRING, allowNull: true },
    netPrice: { type: DataTypes.STRING, allowNull: true },
    downPayment: { type: DataTypes.STRING, allowNull: true },
    possessionPayment: { type: DataTypes.STRING, allowNull: true },
    installmentsCount: { type: DataTypes.STRING, allowNull: true },
    perMonthInstallment: { type: DataTypes.STRING, allowNull: true },
    month: { type: DataTypes.STRING, allowNull: true },
    otherCharges: { type: DataTypes.STRING, allowNull: true },
    location: { type: DataTypes.STRING, allowNull: true },
    paymentDate: { type: DataTypes.STRING, allowNull: true },
    witness1Name: { type: DataTypes.STRING, allowNull: true },
    witness1Relation: { type: DataTypes.STRING, allowNull: true },
    witness1Cnic: { type: DataTypes.STRING, allowNull: true },
    witness1Date: { type: DataTypes.STRING, allowNull: true },
    witness2Name: { type: DataTypes.STRING, allowNull: true },
    witness2Relation: { type: DataTypes.STRING, allowNull: true },
    witness2Cnic: { type: DataTypes.STRING, allowNull: true },
    witness2Date: { type: DataTypes.STRING, allowNull: true },
    // --- Auto-generated Installment Schedule ---
    installmentSchedule: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    }
  },
  {
    tableName: "clients",
  }
);

module.exports = Client;
