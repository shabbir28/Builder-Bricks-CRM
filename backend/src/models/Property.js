const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Property = sequelize.define(
  "Property",
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
        notEmpty: { msg: "Property title is required" },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Property description is required" },
      },
    },
    type: {
      type: DataTypes.ENUM("apartment", "house", "villa", "commercial", "land"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("available", "sold", "rented", "under-contract"),
      defaultValue: "available",
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    // Address fields (flat)
    street: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "City is required" },
      },
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: "Pakistan",
    },
    // Features fields (flat)
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    area: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        notNull: { msg: "Property area is required" },
      },
    },
    parking: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    yearBuilt: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    amenities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    images: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    listedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Elite One Import Fields
    propertyCode: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    projectName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unitNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apartmentNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    floor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ratePerSqFt: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    downPaymentPercentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    downPaymentAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    remainingAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    installmentMonths: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    monthlyInstallment: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    possessionPercentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    possessionAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Client Association (Sales)
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "clients",
        key: "id",
      },
    },
    clientPaidAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: "properties",
  }
);

module.exports = Property;
