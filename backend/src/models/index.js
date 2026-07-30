const User = require("./User");
const Lead = require("./Lead");
const LeadProgressLog = require("./LeadProgressLog");
const Property = require("./Property");
const Deal = require("./Deal");
const Activity = require("./Activity");
const Task = require("./Task");
const Communication = require("./Communication");
const Visit = require("./Visit");
const Client = require("./Client");
const InstallmentRequest = require("./InstallmentRequest");
const Receipt = require("./Receipt");

// =====================
// USER ASSOCIATIONS
// =====================
User.hasMany(Lead, { foreignKey: "assignedAgent", as: "assignedLeads" });
Lead.belongsTo(User, { foreignKey: "assignedAgent", as: "agent" });

User.hasMany(Property, { foreignKey: "listedBy", as: "listedProperties" });
Property.belongsTo(User, { foreignKey: "listedBy", as: "listedByUser" });

User.hasMany(Deal, { foreignKey: "agentId", as: "deals" });
Deal.belongsTo(User, { foreignKey: "agentId", as: "agent" });

User.hasMany(Activity, { foreignKey: "assignedTo", as: "assignedActivities" });
Activity.belongsTo(User, { foreignKey: "assignedTo", as: "assignedToUser" });

User.hasMany(Activity, { foreignKey: "createdBy", as: "createdActivities" });
Activity.belongsTo(User, { foreignKey: "createdBy", as: "createdByUser" });

User.hasMany(Task, { foreignKey: "agentId", as: "tasks" });
Task.belongsTo(User, { foreignKey: "agentId", as: "agent" });

// =====================
// CLIENT ASSOCIATIONS
// =====================
Client.hasMany(Property, { foreignKey: "clientId", as: "purchasedProperties" });
Property.belongsTo(Client, { foreignKey: "clientId", as: "client" });

// =====================
// LEAD ASSOCIATIONS
// =====================
Lead.hasMany(LeadProgressLog, { foreignKey: "leadId", as: "progressLog" });
LeadProgressLog.belongsTo(Lead, { foreignKey: "leadId" });

LeadProgressLog.belongsTo(User, {
  foreignKey: "updatedBy",
  as: "updatedByUser",
});

Lead.hasMany(Deal, { foreignKey: "leadId", as: "deals" });
Deal.belongsTo(Lead, { foreignKey: "leadId", as: "lead" });

Lead.hasMany(Activity, { foreignKey: "leadId", as: "activities" });
Activity.belongsTo(Lead, { foreignKey: "leadId", as: "lead" });

Lead.hasMany(Task, { foreignKey: "leadId", as: "tasks" });
Task.belongsTo(Lead, { foreignKey: "leadId", as: "lead" });

Lead.hasMany(Communication, { foreignKey: "leadId", as: "communications" });
Communication.belongsTo(Lead, { foreignKey: "leadId", as: "lead" });

Lead.hasMany(Visit, { foreignKey: "leadId", as: "visits" });
Visit.belongsTo(Lead, { foreignKey: "leadId", as: "lead" });

// =====================
// PROPERTY ASSOCIATIONS
// =====================
Property.hasMany(Deal, { foreignKey: "propertyId", as: "deals" });
Deal.belongsTo(Property, { foreignKey: "propertyId", as: "property" });

Property.hasMany(Activity, { foreignKey: "propertyId", as: "activities" });
Activity.belongsTo(Property, { foreignKey: "propertyId", as: "property" });

Property.hasMany(Visit, { foreignKey: "propertyId", as: "visits" });
Visit.belongsTo(Property, { foreignKey: "propertyId", as: "property" });

// =====================
// DEAL ASSOCIATIONS
// =====================
Deal.hasMany(Activity, { foreignKey: "dealId", as: "activities" });
Activity.belongsTo(Deal, { foreignKey: "dealId", as: "deal" });

// =====================
// INSTALLMENT REQUEST ASSOCIATIONS
// =====================
InstallmentRequest.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(InstallmentRequest, { foreignKey: "clientId", as: "installmentRequests" });

InstallmentRequest.belongsTo(User, { foreignKey: "requestedBy", as: "requester" });
InstallmentRequest.belongsTo(User, { foreignKey: "reviewedBy", as: "reviewer" });

// =====================
// RECEIPT ASSOCIATIONS
// =====================
Receipt.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(Receipt, { foreignKey: "clientId", as: "receipts" });

Receipt.belongsTo(User, { foreignKey: "uploadedBy", as: "uploader" });

module.exports = {
  User,
  Lead,
  LeadProgressLog,
  Property,
  Deal,
  Activity,
  Task,
  Communication,
  Visit,
  Client,
  InstallmentRequest,
  Receipt,
};
